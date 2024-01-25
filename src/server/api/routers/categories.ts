import { auth } from '@clerk/nextjs';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) return [];

    return ctx.db.category.findMany({ where: { createdById: userId } });
  }),

  create: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(({ ctx, input }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.category.create({ data: { name: input.name, createdById: userId } });
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) return null;

    return ctx.db.category.findFirst({
      where: { createdBy: { externalId: userId } },
      orderBy: { createdAt: 'desc' },
    });
  }),
});
