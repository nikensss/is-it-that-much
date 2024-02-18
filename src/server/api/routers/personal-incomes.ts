import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Income } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { log } from 'next-axiom';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export type PersonalIncomeExtended = {
  income: Pick<Income, 'id' | 'amount' | 'description' | 'date'> & {
    IncomesTags: { id: string; tag: { id: string; name: string } }[];
  };
};

export type PersonalIncomeInPeriod = {
  IncomesTags: {
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

export const personalIncomesRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }): Promise<PersonalIncomeExtended[]> => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.personalIncome.findMany({
      where: {
        user: {
          externalId: userId,
        },
      },
      orderBy: {
        income: {
          date: 'desc',
        },
      },
      select: {
        income: {
          select: {
            id: true,
            amount: true,
            description: true,
            date: true,
            IncomesTags: {
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
          start: z.date().optional(),
          end: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }): Promise<PersonalIncomeInPeriod[]> => {
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

      const now = utcToZonedTime(Date.now(), user?.timezone ?? 'Europe/Amsterdam');
      const preferredTimezoneOffset = getTimezoneOffset(user?.timezone ?? 'Europe/Amsterdam');
      const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      const start = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
      const end = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

      return ctx.db.income.findMany({
        where: {
          date: {
            gte: input?.start ?? start,
            lte: input?.end ?? end,
          },
          PersonalIncome: {
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
          IncomesTags: {
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

      return ctx.db.income.aggregate({
        where: {
          date: {
            gte: start,
            lte: end,
          },
          PersonalIncome: {
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

        log.debug(`registering income for ${user.id}`, { amount, description, userId: user.externalId });

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

        return ctx.db.personalIncome.create({
          data: {
            user: { connect: { externalId: user.id } },
            income: {
              create: {
                amount: parseInt(amount.toFixed(2)) * 100,
                description,
                date,
                IncomesTags: {
                  createMany: {
                    data: dbTags.map((tag) => ({ tagId: tag.id })),
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        log.error('could not create personal income', {
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

        log.debug(`updating income for ${user.id}`, { id, amount, date, description, tags, userId: user.externalId });

        // delete all the tags the income has
        await ctx.db.incomesTags.deleteMany({ where: { incomeId: id } });

        // ensure all the tags for this income exist
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

        await ctx.db.incomesTags.createMany({
          data: dbTags.map((tag) => ({ tagId: tag.id, incomeId: id })),
        });

        return ctx.db.personalIncome.update({
          where: { incomeId: id },
          data: {
            income: {
              update: {
                amount: parseInt(amount.toFixed(2)) * 100,
                date,
                description,
              },
            },
          },
        });
      } catch (error) {
        log.error('could not update personal income', {
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

  recent: publicProcedure.query(async ({ ctx }): Promise<PersonalIncomeExtended[]> => {
    const user = auth();

    if (!user?.userId) return [];

    return ctx.db.personalIncome.findMany({
      where: {
        user: {
          externalId: user.userId,
        },
      },
      take: 3,
      orderBy: {
        income: {
          date: 'desc',
        },
      },
      select: {
        income: {
          select: {
            id: true,
            amount: true,
            description: true,
            date: true,
            IncomesTags: {
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
