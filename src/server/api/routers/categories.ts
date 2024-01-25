import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.category.findMany({ where: { createdBy: { externalId: userId } } });
  }),

  create: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const user = await currentUser();
    if (!user) throw new Error('Not authenticated');
    // if the user record in clerk does not have the id we use internally, we throw
    if (!user.externalId) throw new Error('User has no externalId');

    // this user record is from clerk, so the 'externalId' is our 'id'
    return ctx.db.category.create({ data: { name: input.name, createdById: user.externalId } });
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
