import { currentUser } from '@clerk/nextjs';
import { FriendRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { friendRequestsRouters } from '~/server/api/routers/friends/requests';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const friendsRouters = createTRPCRouter({
  requests: friendRequestsRouters,

  all: publicProcedure.query(async ({ ctx }) => {
    const user = await currentUser();
    if (!user?.externalId) return [];

    const accepted = await ctx.db.friendRequest.findMany({
      where: {
        uniqueId: {
          contains: user.externalId,
        },
        status: FriendRequestStatus.ACCEPTED,
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    return accepted.map((e) => (e.fromUser.id === user.externalId ? e.toUser : e.fromUser));
  }),

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
