import { z } from 'zod';
import { createTRPCRouter, periodProcedure, privateProcedure } from '~/server/api/trpc';

export const allGroupsExpensesRouter = createTRPCRouter({
  period: createTRPCRouter({
    sum: periodProcedure
      .input(z.object({ onlyWhereUserPaid: z.boolean() }))
      .query(async ({ ctx: { db, user, from, to }, input }) => {
        return db.transactionSplit.aggregate({
          where: {
            SharedTransaction: {
              transaction: {
                date: {
                  gte: from,
                  lte: to,
                },
              },
            },
            ...(input.onlyWhereUserPaid
              ? {
                  user,
                  paid: {
                    gt: 0,
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
          _sum: {
            paid: true,
          },
        });
      }),

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
            transaction: {
              include: {
                TransactionsTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
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

  recent: privateProcedure
    .input(z.object({ onlyWhereUserPaid: z.boolean() }))
    .query(async ({ ctx: { db, user }, input }) => {
      return db.sharedTransaction.findMany({
        where: {
          ...(input.onlyWhereUserPaid
            ? {
                TransactionSplit: {
                  some: {
                    user,
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
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          transaction: {
            include: {
              TransactionsTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
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
