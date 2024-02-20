import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Expense } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { log } from 'next-axiom';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export type PersonalExpenseExtended = {
  expense: Pick<Expense, 'id' | 'amount' | 'description' | 'date'> & {
    ExpensesTags: { id: string; tag: { id: string; name: string } }[];
  };
};

export type PersonalExpenseInPeriod = {
  ExpensesTags: {
    id: string;
    tag: {
      id: string;
      name: string;
    };
  }[];
} & {
  id: string;
  description: string;
  amount: number;
  date: Date;
};

export const personalExpensesRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }): Promise<PersonalExpenseExtended[]> => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.personalExpense.findMany({
      where: {
        user: {
          externalId: userId,
        },
      },
      orderBy: {
        expense: {
          date: 'desc',
        },
      },
      select: {
        expense: {
          select: {
            id: true,
            amount: true,
            description: true,
            date: true,
            ExpensesTags: {
              select: {
                id: true,
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }),

  period: publicProcedure
    .input(
      z
        .object({
          from: z.date().nullish(),
          to: z.date().nullish(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }): Promise<PersonalExpenseInPeriod[]> => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({
        where: {
          externalId: userId,
        },
        select: {
          timezone: true,
        },
      });

      const timezone = user?.timezone ?? 'Europe/Amsterdam';
      const now = utcToZonedTime(Date.now(), timezone);
      const preferredTimezoneOffset = getTimezoneOffset(timezone);
      const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
      const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

      return ctx.db.expense.findMany({
        where: {
          date: {
            gte: input?.from ?? from,
            lte: input?.to ?? to,
          },
          PersonalExpense: {
            user: {
              externalId: userId,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        select: {
          id: true,
          date: true,
          description: true,
          amount: true,
          ExpensesTags: {
            select: {
              id: true,
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }),

  totalAmountInMonth: publicProcedure
    .input(
      z
        .object({
          date: z.date(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({
        where: {
          externalId: userId,
        },
        select: {
          timezone: true,
        },
      });

      const date = input?.date ?? utcToZonedTime(Date.now(), user?.timezone ?? 'Europe/Amsterdam');
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      return ctx.db.expense.aggregate({
        where: {
          date: {
            gte: start,
            lte: end,
          },
          PersonalExpense: {
            user: {
              externalId: userId,
            },
          },
        },
        _sum: {
          amount: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        date: z.date().default(() => new Date()),
        description: z.string().min(1),
        tags: z.array(z.string().min(3).max(50)),
      }),
    )
    .mutation(async ({ ctx, input: { amount, date, description, tags } }) => {
      try {
        const user = await currentUser();
        if (!user) throw new Error('Not authenticated');

        const createdById = user.externalId;
        if (!createdById) throw new Error('User has no externalId');

        log.debug(`registering expense for ${user.id}`, { amount, date, description, tags, userId: user.externalId });

        await ctx.db.tag.createMany({
          data: tags.map((name) => ({ name, createdById })),
          skipDuplicates: true,
        });

        const dbTags = await ctx.db.tag.findMany({
          where: {
            createdById,
            name: { in: tags },
          },
        });

        return ctx.db.personalExpense.create({
          data: {
            user: { connect: { externalId: user.id } },
            expense: {
              create: {
                amount: parseInt(amount.toFixed(2)) * 100,
                date,
                description,
                ExpensesTags: {
                  createMany: {
                    data: dbTags.map((tag) => ({ tagId: tag.id })),
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        log.error('could not create personal expense', {
          amount,
          description,
          error,
          externalUserId: auth().userId,
          tags,
        });
        return null;
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
        date: z.date().default(() => new Date()),
        description: z.string().min(1),
        tags: z.array(z.string().min(3).max(50)),
      }),
    )
    .mutation(async ({ ctx, input: { id, amount, date, description, tags } }) => {
      try {
        const user = await currentUser();
        if (!user) throw new Error('Not authenticated');

        const createdById = user.externalId;
        if (!createdById) throw new Error('User has no externalId');

        log.debug(`updating expense for ${user.id}`, { id, amount, date, description, tags, userId: user.externalId });

        // delete all the tags the expense has
        await ctx.db.expensesTags.deleteMany({ where: { expenseId: id } });

        // ensure all the tags for this expense exist
        await ctx.db.tag.createMany({
          data: tags.map((name) => ({ name, createdById })),
          skipDuplicates: true,
        });

        const dbTags = await ctx.db.tag.findMany({
          where: {
            createdById,
            name: { in: tags },
          },
        });

        await ctx.db.expensesTags.createMany({
          data: dbTags.map((tag) => ({ tagId: tag.id, expenseId: id })),
        });

        return ctx.db.personalExpense.update({
          where: { expenseId: id },
          data: {
            expense: {
              update: {
                amount: parseInt(amount.toFixed(2)) * 100,
                date,
                description,
              },
            },
          },
        });
      } catch (error) {
        log.error('could not update personal expense', {
          id,
          amount,
          description,
          error,
          externalUserId: auth().userId,
          tags,
        });
        return null;
      }
    }),

  recent: publicProcedure.query(async ({ ctx }): Promise<PersonalExpenseExtended[]> => {
    const user = auth();

    if (!user?.userId) return [];

    return ctx.db.personalExpense.findMany({
      where: {
        user: {
          externalId: user.userId,
        },
      },
      take: 3,
      orderBy: {
        expense: {
          date: 'desc',
        },
      },
      select: {
        expense: {
          select: {
            id: true,
            amount: true,
            description: true,
            date: true,
            ExpensesTags: {
              select: {
                id: true,
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }),
});
