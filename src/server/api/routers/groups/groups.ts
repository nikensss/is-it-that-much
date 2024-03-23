import { TRPCError } from '@trpc/server';
import { log } from 'next-axiom';
import { z } from 'zod';
import { groupExpensesRouter } from '~/server/api/routers/groups/expenses';
import { groupSettlementsRouter } from '~/server/api/routers/groups/settlements';

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

export const groupsRouter = createTRPCRouter({
  get: privateProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { id } }) => {
      return db.group.findUnique({
        where: {
          id,
          UserGroup: {
            some: {
              user,
            },
          },
        },
        include: {
          UserGroup: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
    }),

  leave: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      return db.usersGroups.deleteMany({
        where: {
          user,
          groupId: id,
        },
      });
    }),

  all: privateProcedure.query(async ({ ctx: { db, user } }) => {
    return db.group.findMany({
      where: {
        UserGroup: {
          some: {
            user,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }),

  upsert: privateProcedure
    .input(
      z.object({
        id: z.string().cuid().optional(),
        name: z.string().min(3),
        description: z.string().optional(),
        members: z
          .array(z.string().cuid())
          .min(1, { message: 'You need to select at least 1 member to create a group' }),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input: { id, name, description, members } }) => {
      if (id) await assertUserInGroup({ groupId: id, userId: user.id });

      const group = await db.group.upsert({
        where: { id: id ?? '' },
        create: { name, description, createdById: user.id },
        update: { name, description },
      });

      await db.usersGroups.createMany({
        data: [user.id, ...members].map((userId) => ({ userId, groupId: group.id })),
        skipDuplicates: true,
      });

      await db.usersGroups.deleteMany({
        where: {
          userId: {
            notIn: [user.id, ...members],
          },
        },
      });

      return group.id;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      await assertUserInGroup({ groupId: id, userId: user.id });

      return db.group.delete({ where: { id } });
    }),

  balance: privateProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { groupId } }) => {
      await assertUserInGroup({ groupId, userId: user.id });

      const expenses = await db.sharedTransaction.findMany({
        where: { groupId },
        include: {
          transaction: true,
          TransactionSplit: {
            include: {
              user: {
                select: { id: true, username: true, firstName: true, lastName: true, imageUrl: true },
              },
            },
          },
        },
      });

      const users = expenses.reduce((acc, expense) => {
        for (const split of expense.TransactionSplit) {
          acc.set(split.user.id, split.user);
        }
        return acc;
      }, new Map<string, (typeof expenses)[number]['TransactionSplit'][number]['user']>());

      const { payments, debts } = expenses.reduce(
        (acc, expense) => {
          for (const split of expense.TransactionSplit) {
            acc.payments.set(split.user.id, (acc.payments.get(split.user.id) ?? 0) + split.paid);
            acc.debts.set(split.user.id, (acc.debts.get(split.user.id) ?? 0) + split.owed);
          }

          return acc;
        },
        { payments: new Map<string, number>(), debts: new Map<string, number>() },
      );

      const settlements = await db.settlement.findMany({ where: { groupId }, include: { from: true, to: true } });

      for (const { amount, from, to } of settlements) {
        const paymentsByTo = payments.get(to.id);
        if (!paymentsByTo) {
          log.error('"to" user not found in payments', { userId: to.id });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
        payments.set(to.id, paymentsByTo - amount);

        const paymentsByFrom = payments.get(from.id);
        if (!paymentsByFrom) {
          log.error('"from" user not found in payments', { userId: from.id });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
        payments.set(from.id, paymentsByFrom + amount);
      }

      const settlementsNeeded = [...payments.entries()].reduce((acc, [userId, amount]) => {
        acc.set(userId, amount - (debts.get(userId) ?? 0));
        return acc;
      }, new Map<string, number>());

      const { payers, owers } = [...settlementsNeeded].reduce(
        (acc, [userId, amount]) => {
          amount > 0 ? acc.payers.set(userId, amount) : acc.owers.set(userId, amount);
          return acc;
        },
        { payers: new Map<string, number>(), owers: new Map<string, number>() },
      );

      const suggestedSettlements: { from: string; to: string; amount: number }[] = [];
      for (const payer of payers.entries()) {
        const settleTo = payer[0];
        let paid = payer[1];

        while (paid > 0) {
          for (const [settleBy, owed] of owers.entries()) {
            if (paid <= 0) break;
            if (owed >= 0) continue;

            const amount = Math.min(paid, Math.abs(owed));

            const suggestedSettlement = suggestedSettlements.find((e) => e.from === settleBy && e.to === settleTo);
            if (suggestedSettlement) {
              suggestedSettlement.amount += amount;
            } else {
              suggestedSettlements.push({ from: settleBy, to: settleTo, amount: amount });
            }

            paid -= amount;
            owers.set(settleTo, owed + amount);
          }
        }
      }

      return suggestedSettlements.map((s) => {
        const from = users.get(s.from);
        if (!from) {
          log.error('user not found', { userId: s.from });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const to = users.get(s.to);
        if (!to) {
          log.error('user not found', { userId: s.to });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        return { from, to, amount: s.amount };
      });
    }),

  expenses: groupExpensesRouter,
  settlements: groupSettlementsRouter,
});

export async function assertUserInGroup({ groupId, userId }: { groupId: string; userId: string }) {
  const isUserInGroup = await db.usersGroups.findFirst({ where: { groupId, userId } });
  if (!isUserInGroup) {
    log.warn('User is not in group', { groupId, userId });
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
}
