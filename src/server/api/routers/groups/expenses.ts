import { TransactionType } from '@prisma/client';
import { z } from 'zod';
import { assertUserInGroup } from '~/server/api/routers/groups/groups';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { groupExpenseFormSchema } from '~/trpc/shared';

export const groupExpensesRouter = createTRPCRouter({
  create: privateProcedure.input(groupExpenseFormSchema).mutation(async ({ ctx: { db }, input }) => {
    await assertUserInGroup({ groupId: input.groupId, userId: input.createdById });

    const transaction = await db.transaction.create({
      data: {
        amount: parseInt(`${input.amount * 100}`),
        date: input.date,
        description: input.description,
        type: TransactionType.EXPENSE,
      },
    });

    const sharedTransaction = await db.sharedTransaction.create({
      data: {
        createdById: input.createdById,
        groupId: input.groupId,
        transactionId: transaction.id,
      },
    });

    await db.transactionSplit.createMany({
      data: input.splits.map((s) => ({
        owed: parseInt(`${s.owed * 100}`),
        paid: parseInt(`${s.paid * 100}`),
        sharedTransactionId: sharedTransaction.id,
        userId: s.userId,
      })),
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
