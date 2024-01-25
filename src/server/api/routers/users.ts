import { auth, currentUser } from '@clerk/nextjs';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.user.findUnique({ where: { externalId: userId } });
  }),

  create: publicProcedure.mutation(async ({ ctx }) => {
    const user = await currentUser();
    if (!user) throw new Error('No user');

    return ctx.db.user.create({
      data: {
        username: user.username,
        externalId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailId: user.primaryEmailAddressId,
      },
    });
  }),

  exists: publicProcedure.query(async ({ ctx }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    const count = await ctx.db.user.count({ where: { externalId: userId } });
    return count > 0;
  }),
});
