import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const allGroupsExpensesRouter = createTRPCRouter({
  recent: privateProcedure.query(async ({ ctx: { db, user } }) => {
    return db.sharedTransaction.findMany({
      where: {
        group: {
          UserGroup: {
            some: {
              user,
            },
          },
        },
      },
      select: {
        id: true,
        groupId: true,
        createdById: true,
        transactionId: true,
        transaction: true,
        TransactionSplit: {
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
      orderBy: {
        transaction: {
          date: 'desc',
        },
      },
    });
  }),
});
