import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Expense, PersonalExpense } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { log } from 'next-axiom';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export type RecentExpense = PersonalExpense & {
  expense: Pick<Expense, 'amount' | 'description' | 'createdAt'>;
};

export const personalExpensesRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.personalExpense.findMany({
      where: {
        user: {
          externalId: userId,
        },
      },
      include: {
        expense: true,
      },
    });
  }),

  inMonth: publicProcedure.input(z.object({ date: z.date() }).optional()).query(({ ctx, input }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    const date = input?.date ?? new Date();

    const start = startOfMonth(date);
    const end = endOfMonth(date);

    return ctx.db.expense.aggregate({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        PersonalExpense: {
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

        log.debug(`registering expense for ${user.id}`, { amount, description, userId: user.externalId });

        return ctx.db.personalExpense.create({
          data: {
            user: { connect: { externalId: user.id } },
            expense: {
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

  recent: publicProcedure.query(async ({ ctx }): Promise<RecentExpense[]> => {
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
          createdAt: 'desc',
        },
      },
      include: {
        expense: {
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
