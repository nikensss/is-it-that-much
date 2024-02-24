import { auth } from '@clerk/nextjs';
import { TransactionType } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const tagsRouter = createTRPCRouter({
  all: publicProcedure.input(z.object({ type: z.nativeEnum(TransactionType) })).query(({ ctx, input: { type } }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.tag.findMany({
      where: {
        createdBy: {
          externalId: userId,
        },
        TransactionsTags: {
          some: {
            transaction: {
              type,
            },
          },
        },
      },
    });
  }),

  update: publicProcedure.input(z.object({ id: z.string(), name: z.string() })).mutation(({ ctx, input }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.tag.update({
      where: {
        createdBy: { externalId: userId },
        id: input.id,
      },
      data: {
        name: input.name,
      },
    });
  }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.tag.delete({
      where: {
        createdBy: { externalId: userId },
        id: input.id,
      },
      include: {
        TransactionsTags: true,
      },
    });
  }),
});
