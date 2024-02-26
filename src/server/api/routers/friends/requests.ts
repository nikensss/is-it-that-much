import { currentUser } from '@clerk/nextjs/server';
import { FriendRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const friendRequestsRouters = createTRPCRouter({
  send: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId: user.externalId,
          toUserId: id,
        },
        status: {
          not: {
            in: [FriendRequestStatus.ACCEPTED, FriendRequestStatus.REJECTED],
          },
        },
      },
      create: {
        fromUserId: user.externalId,
        toUserId: id,
      },
      update: {
        status: FriendRequestStatus.PENDING,
      },
    });
  }),

  accept: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.update({
      where: {
        fromUserId_toUserId: {
          fromUserId: id,
          toUserId: user.externalId,
        },
        status: FriendRequestStatus.PENDING,
      },
      data: {
        status: FriendRequestStatus.ACCEPTED,
      },
    });
  }),

  reject: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.update({
      where: {
        id,
        toUserId: user.externalId,
      },
      data: {
        status: FriendRequestStatus.REJECTED,
      },
    });
  }),

  cancel: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.delete({
      where: {
        id,
        fromUserId: user.externalId,
        status: {
          not: FriendRequestStatus.ACCEPTED,
        },
      },
    });
  }),

  delete: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.deleteMany({
      where: {
        OR: [
          { fromUserId: user.externalId, toUserId: id },
          { fromUserId: id, toUserId: user.externalId },
        ],
      },
    });
  }),

  isPending: publicProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return false;

    const request = await ctx.db.friendRequest.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: id,
          toUserId: user.externalId,
        },
        status: FriendRequestStatus.PENDING,
      },
    });

    return request !== null;
  }),

  isFriend: publicProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return false;

    const request = await ctx.db.friendRequest.findMany({
      where: {
        OR: [
          {
            fromUserId: id,
            toUserId: user.externalId,
          },
          {
            fromUserId: user.externalId,
            toUserId: id,
          },
        ],
        status: FriendRequestStatus.ACCEPTED,
      },
    });

    return request.length > 0;
  }),
});
