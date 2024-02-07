import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Income, PersonalIncome } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { log } from 'next-axiom';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export type RecentIncome = PersonalIncome & {
  income: Pick<Income, 'amount' | 'description' | 'createdAt'>;
};

export const personalIncomesRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.personalIncome.findMany({
      where: {
        user: {
          externalId: userId,
        },
      },
      include: {
        income: true,
      },
    });
  }),

  inMonth: publicProcedure.input(z.object({ date: z.date() }).optional()).query(({ ctx, input }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    const date = input?.date ?? new Date();

    const start = startOfMonth(date);
    const end = endOfMonth(date);

    return ctx.db.income.aggregate({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        PersonalIncome: {
          some: {
            user: {
              externalId: userId,
            },
          },
        },
      },
      _sum: {
        amount: true,
      },
    });
  }),

  register: publicProcedure
    .input(z.object({ amount: z.number().positive(), description: z.string().min(1) }))
    .mutation(async ({ ctx, input: { amount, description } }) => {
      try {
        const user = await currentUser();
        if (!user) throw new Error('Not authenticated');
        if (!user.externalId) throw new Error('User has no externalId');

        log.debug(`registering income for ${user.id}`, { amount, description, userId: user.externalId });

        return ctx.db.personalIncome.create({
          data: {
            user: { connect: { externalId: user.id } },
            income: {
              create: {
                amount: parseInt(amount.toFixed(2).replace('.', '')),
                description,
              },
            },
          },
        });
      } catch (error) {
        log.error('could not create personal expense', { amount, description, error, externalUserId: auth().userId });
        return null;
      }
    }),

  recent: publicProcedure.query(async ({ ctx }): Promise<RecentIncome[]> => {
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
          createdAt: 'desc',
        },
      },
      include: {
        income: {
          select: {
            amount: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });
  }),
});
