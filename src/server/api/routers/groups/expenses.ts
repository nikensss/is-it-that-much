import { TransactionType } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { toCents } from '~/lib/utils.client';
import { createTRPCRouter, groupProcedure } from '~/server/api/trpc';
import { groupExpenseFormSchema } from '~/trpc/shared';

export const groupExpensesRouter = createTRPCRouter({
  get: groupProcedure
    .input(z.object({ expenseId: z.string().cuid() }))
    .query(async ({ ctx: { db, group }, input: { expenseId } }) => {
      return db.sharedTransaction.findUnique({
        where: {
          id: expenseId,
          groupId: group.id,
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

  delete: groupProcedure
    .input(z.object({ sharedTransactionId: z.string().cuid() }))
    .mutation(async ({ ctx: { db, group }, input: { sharedTransactionId } }) => {
      await db.sharedTransaction.delete({ where: { id: sharedTransactionId, groupId: group.id } });
    }),

  upsert: groupProcedure.input(groupExpenseFormSchema).mutation(async ({ ctx: { db }, input }) => {
    const expense = input.expenseId ? await db.sharedTransaction.findUnique({ where: { id: input.expenseId } }) : null;

    const transaction = await db.transaction.upsert({
      where: { id: expense?.transactionId ?? '' },
      create: {
        amount: toCents(input.amount),
        date: input.date,
        description: input.description,
        type: TransactionType.EXPENSE,
      },
      update: {
        amount: toCents(input.amount),
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
          owed: toCents(split.owed),
          paid: toCents(split.paid),
          sharedTransactionId: sharedTransaction.id,
          userId: split.userId,
        },
        update: {
          owed: toCents(split.owed),
          paid: toCents(split.paid),
        },
      });
    }
  }),

  period: groupProcedure
    .input(
      z.object({
        from: z.date().nullish(),
        to: z.date().nullish(),
      }),
    )
    .query(async ({ ctx: { db, user, group }, input }) => {
      const t = toZonedTime(Date.now(), user.timezone ?? 'Europe/Amsterdam');
      const from = fromZonedTime(startOfMonth(t), user.timezone ?? 'Europe/Amsterdam');
      const to = fromZonedTime(endOfMonth(t), user.timezone ?? 'Europe/Amsterdam');

      return db.sharedTransaction.findMany({
        where: {
          groupId: group.id,
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

  recent: groupProcedure
    .input(z.object({ take: z.number().default(5) }))
    .query(async ({ ctx: { db, group }, input: { take } }) => {
      return db.sharedTransaction.findMany({
        where: {
          groupId: group.id,
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
        take,
      });
    }),
});
