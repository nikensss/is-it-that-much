import { z } from 'zod';
import { createTRPCRouter, periodProcedure, privateProcedure } from '~/server/api/trpc';

export const allGroupsExpensesRouter = createTRPCRouter({
  period: createTRPCRouter({
    list: periodProcedure
      .input(z.object({ onlyWhereUserPaid: z.boolean() }))
      .query(async ({ ctx: { db, user, from, to }, input }) => {
        return db.sharedTransaction.findMany({
          where: {
            transaction: {
              date: {
                gte: from,
                lte: to,
              },
            },
            ...(input.onlyWhereUserPaid
              ? {
                  TransactionSplit: {
                    some: {
                      userId: user.id,
                      paid: {
                        gt: 0,
                      },
                    },
                  },
                }
              : {
                  group: {
                    UserGroup: {
                      some: {
                        user,
                      },
                    },
                  },
                }),
          },
          orderBy: {
            transaction: {
              date: 'desc',
            },
          },
          include: {
            transaction: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            TransactionSplit: {
              ...(input.onlyWhereUserPaid
                ? {
                    where: {
                      userId: user.id,
                      paid: {
                        gt: 0,
                      },
                    },
                  }
                : {}),
              select: {
                paid: true,
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
  }),

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
