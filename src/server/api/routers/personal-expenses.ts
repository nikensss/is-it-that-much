import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { log } from 'next-axiom';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

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
});
