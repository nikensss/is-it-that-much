import { TransactionType } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { assertUserInGroup } from '~/server/api/routers/groups/groups';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { groupExpenseFormSchema } from '~/trpc/shared';

export const groupExpensesRouter = createTRPCRouter({
  get: privateProcedure
    .input(z.object({ groupId: z.string().cuid(), expenseId: z.string().cuid() }))
    .query(async ({ ctx: { db, user }, input }) => {
      await assertUserInGroup({ groupId: input.groupId, userId: user.id });

      return db.sharedTransaction.findUnique({
        where: {
          id: input.expenseId,
          groupId: input.groupId,
        },
        include: {
          transaction: true,
          TransactionSplit: {
            include: {
              user: {
                select: {
                  firstName: true,
                  id: true,
                  imageUrl: true,
                  lastName: true,
                  username: true,
                },
              },
            },
          },
        },
      });
    }),

  delete: privateProcedure
    .input(z.object({ groupId: z.string().cuid(), sharedTransactionId: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { groupId, sharedTransactionId } }) => {
      await assertUserInGroup({ groupId, userId: user.id });
      await db.sharedTransaction.delete({ where: { id: sharedTransactionId, groupId } });
    }),

  upsert: privateProcedure.input(groupExpenseFormSchema).mutation(async ({ ctx: { db }, input }) => {
    await assertUserInGroup({ groupId: input.groupId, userId: input.createdById });

    const expense = input.expenseId ? await db.sharedTransaction.findUnique({ where: { id: input.expenseId } }) : null;

    const transaction = await db.transaction.upsert({
      where: { id: expense?.transactionId ?? '' },
      create: {
        amount: parseInt(`${input.amount * 100}`),
        date: input.date,
        description: input.description,
        type: TransactionType.EXPENSE,
      },
      update: {
        amount: parseInt(`${input.amount * 100}`),
        date: input.date,
        description: input.description,
        type: TransactionType.EXPENSE,
      },
    });

    const sharedTransaction = await db.sharedTransaction.upsert({
      where: { id: expense?.id ?? '' },
      create: {
        createdById: input.createdById,
        groupId: input.groupId,
        transactionId: transaction.id,
      },
      update: {
        createdById: input.createdById,
      },
    });

    for (const split of input.splits) {
      await db.transactionSplit.upsert({
        where: {
          sharedTransactionId_userId: { sharedTransactionId: sharedTransaction.id ?? '', userId: split.userId ?? '' },
        },
        create: {
          owed: parseInt(`${split.owed * 100}`),
          paid: parseInt(`${split.paid * 100}`),
          sharedTransactionId: sharedTransaction.id,
          userId: split.userId,
        },
        update: {
          owed: parseInt(`${split.owed * 100}`),
          paid: parseInt(`${split.paid * 100}`),
        },
      });
    }
  }),

  period: privateProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        from: z.date().nullable(),
        to: z.date().nullable(),
      }),
    )
    .query(async ({ ctx: { db, user }, input }) => {
      await assertUserInGroup({ groupId: input.groupId, userId: user.id });

      const timezone = user.timezone ?? 'Europe/Amsterdam';
      const now = utcToZonedTime(Date.now(), timezone);
      const preferredTimezoneOffset = getTimezoneOffset(timezone);
      const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
      const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

      return db.sharedTransaction.findMany({
        where: {
          groupId: input.groupId,
          transaction: {
            date: {
              gte: input.from ?? from,
              lte: input.to ?? to,
            },
          },
        },
        include: {
          transaction: true,
          TransactionSplit: {
            include: {
              user: {
                select: {
                  firstName: true,
                  id: true,
                  imageUrl: true,
                  lastName: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          transaction: {
            date: 'desc',
          },
        },
      });
    }),

  recent: privateProcedure
    .input(z.object({ groupId: z.string().cuid() }))
    .query(async ({ ctx: { db, user }, input: { groupId } }) => {
      await assertUserInGroup({ groupId, userId: user.id });

      return db.sharedTransaction.findMany({
        where: {
          groupId,
        },
        include: {
          transaction: true,
          TransactionSplit: {
            include: {
              user: {
                select: {
                  firstName: true,
                  id: true,
                  imageUrl: true,
                  lastName: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          transaction: {
            date: 'desc',
          },
        },
        take: 5,
      });
    }),
});
