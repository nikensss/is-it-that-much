import { currentUser } from '@clerk/nextjs';
import { z } from 'zod';
import { friendRequestsRouters } from '~/server/api/routers/friends/requests';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const friendsRouters = createTRPCRouter({
  requests: friendRequestsRouters,
  delete: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.deleteMany({
      where: {
        uniqueId: [user.externalId, id].sort().join('_'),
      },
    });
  }),
});
