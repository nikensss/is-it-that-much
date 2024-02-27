import { currentUser } from '@clerk/nextjs/server';
import { FriendRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const friendRequestsRouters = createTRPCRouter({
  send: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();

    await ctx.db.$transaction(async (db) => {
      if (!user?.externalId) return;

      const req = await db.friendRequest.findUnique({
        where: {
          uniqueId: [user.externalId, id].sort().join('_'),
        },
      });

      if (req?.status !== FriendRequestStatus.ACCEPTED && req?.toUserId === user.externalId) {
        await db.friendRequest.update({
          where: { id: req.id },
          data: { status: FriendRequestStatus.ACCEPTED },
        });

        return;
      }

      if (req) return;

      await db.friendRequest.create({
        data: {
          uniqueId: [user.externalId, id].sort().join('_'),
          fromUserId: user.externalId,
          toUserId: id,
          status: FriendRequestStatus.PENDING,
        },
      });
    });
  }),

  accept: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.update({
      where: {
        uniqueId: [user.externalId, id].sort().join('_'),
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

    await ctx.db.friendRequest.delete({
      where: {
        uniqueId: [user.externalId, id].sort().join('_'),
        toUserId: user.externalId,
      },
    });
  }),

  cancel: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return;

    await ctx.db.friendRequest.delete({
      where: {
        uniqueId: [user.externalId, id].sort().join('_'),
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
        uniqueId: [user.externalId, id].sort().join('_'),
      },
    });
  }),

  isSent: publicProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return false;

    const request = await ctx.db.friendRequest.findUnique({
      where: {
        uniqueId: [user.externalId, id].sort().join('_'),
        fromUserId: user.externalId,
        toUserId: id,
        status: FriendRequestStatus.PENDING,
      },
    });

    return request !== null;
  }),

  isPending: publicProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    if (!user?.externalId) return false;

    const request = await ctx.db.friendRequest.findUnique({
      where: {
        uniqueId: [user.externalId, id].sort().join('_'),
        fromUserId: id,
        toUserId: user.externalId,
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
        uniqueId: [user.externalId, id].sort().join('_'),
        status: FriendRequestStatus.ACCEPTED,
      },
    });

    return request.length > 0;
  }),
});
