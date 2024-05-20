import { TRPCError } from '@trpc/server';
import { log } from 'next-axiom';
import { z } from 'zod';
import { allGroupsRouter } from '~/server/api/routers/groups/allGroups/allGroups';
import { groupExpensesRouter } from '~/server/api/routers/groups/expenses';
import { groupSettlementsRouter } from '~/server/api/routers/groups/settlements';
import { createTRPCRouter, groupProcedure, privateProcedure } from '~/server/api/trpc';

export const groupsRouter = createTRPCRouter({
  get: groupProcedure.query(async ({ ctx: { group } }) => group),

  tags: groupProcedure.query(async ({ ctx: { db, user, group } }) => {
    const tags = await db.tag.findMany({
      where: {
        TransactionsTags: {
          some: {
            transaction: {
              SharedTransaction: {
                groupId: group.id,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdById: true,
      },
      orderBy: { name: 'asc' },
    });

    const tagsByName = new Map<string, typeof tags>();
    for (const tag of tags) {
      const current = tagsByName.get(tag.name) ?? [];
      current.push(tag);
      tagsByName.set(tag.name, current);
    }

    return tags.filter((tag) => {
      const tagsWithCurrentName = tagsByName.get(tag.name) ?? [];
      if (tagsWithCurrentName.length === 1) return true;
      return tag.createdById === user.id;
    });
  }),

  leave: groupProcedure.mutation(async ({ ctx: { db, user, group } }) => {
    return db.usersGroups.deleteMany({ where: { user, groupId: group.id } });
  }),

  update: groupProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        members: z
          .array(z.string().cuid())
          .min(1, { message: 'You need to select at least 1 member to create a group' }),
      }),
    )
    .mutation(async ({ ctx: { db, user, group }, input: { name, description, members } }) => {
      await db.group.update({ where: { id: group.id }, data: { name, description } });

      await db.usersGroups.createMany({
        data: [user.id, ...members].map((userId) => ({ userId, groupId: group.id })),
        skipDuplicates: true,
      });

      await db.usersGroups.deleteMany({ where: { groupId: group.id, userId: { notIn: [user.id, ...members] } } });

      return group.id;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        members: z
          .array(z.string().cuid())
          .min(1, { message: 'You need to select at least 1 member to create a group' }),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input: { name, description, members } }) => {
      const group = await db.group.create({ data: { name, description, createdById: user.id } });

      await db.usersGroups.createMany({
        data: [user.id, ...members].map((userId) => ({ userId, groupId: group.id })),
        skipDuplicates: true,
      });

      await db.usersGroups.deleteMany({ where: { groupId: group.id, userId: { notIn: [user.id, ...members] } } });

      return group.id;
    }),

  delete: groupProcedure.mutation(async ({ ctx: { db, group } }) => db.group.delete({ where: { id: group.id } })),

  balance: groupProcedure.query(async ({ ctx: { db, group } }) => {
    const users = group.UserGroup.reduce((acc, { user }) => {
      acc.set(user.id, user);
      return acc;
    }, new Map<string, (typeof group)['UserGroup'][number]['user']>());

    const expenses = await db.sharedTransaction.findMany({
      where: { groupId: group.id },
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

    const settlements = await db.settlement.findMany({
      where: { groupId: group.id },
      include: { from: true, to: true },
    });

    for (const { amount, from, to } of settlements) {
      const paymentsByTo = payments.get(to.id);
      if (typeof paymentsByTo !== 'number') {
        log.error('"to" user not found in payments', { userId: to.id });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      payments.set(to.id, paymentsByTo - amount);

      const paymentsByFrom = payments.get(from.id);
      if (typeof paymentsByFrom !== 'number') {
        log.error('"from" user not found in payments', { userId: from.id });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      payments.set(from.id, paymentsByFrom + amount);
    }

    const balances = [...payments.entries()].reduce((acc, [userId, amount]) => {
      acc.set(userId, amount - (debts.get(userId) ?? 0));
      return acc;
    }, new Map<string, number>());

    const { payers, owers } = [...balances].reduce(
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
        owers.set(settleBy, owed + amount);
      }

      if (paid > 0) log.warn('Could not settle all debts', { groupId: group.id });
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
  all: allGroupsRouter,
});
