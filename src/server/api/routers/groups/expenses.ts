import { TransactionType } from '@prisma/client';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { groupExpenseFormSchema } from '~/shared/groups-expenses-form-schema';

export const groupExpensesRouter = createTRPCRouter({
  create: privateProcedure.input(groupExpenseFormSchema).mutation(async ({ ctx: { db }, input }) => {
    const transaction = await db.transaction.create({
      data: {
        amount: input.amount,
        description: input.description,
        date: input.date,
        type: TransactionType.EXPENSE,
      },
    });

    const sharedTransaction = await db.sharedTransaction.create({
      data: {
        groupId: input.groupId,
        createdById: input.createdById,
        transactionId: transaction.id,
      },
    });

    await db.transactionSplit.createMany({
      data: input.splits.map((s) => ({
        sharedTransactionId: sharedTransaction.id,
        ...s,
      })),
    });
  }),
});
