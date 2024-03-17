import { FriendRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const friendRequestsRouters = createTRPCRouter({
  send: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      await db.$transaction(async (db) => {
        const req = await db.friendRequest.findUnique({
          where: {
            uniqueId: [user.id, id].sort().join('_'),
          },
        });

        if (req?.status !== FriendRequestStatus.ACCEPTED && req?.toUserId === user.id) {
          await db.friendRequest.update({
            where: { id: req.id },
            data: { status: FriendRequestStatus.ACCEPTED },
          });

          return;
        }

        if (req) return;

        await db.friendRequest.create({
          data: {
            uniqueId: [user.id, id].sort().join('_'),
            fromUserId: user.id,
            toUserId: id,
            status: FriendRequestStatus.PENDING,
          },
        });
      });
    }),

  accept: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx: { db, user }, input: { id } }) => {
      return db.friendRequest.update({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
          status: FriendRequestStatus.PENDING,
        },
        data: {
          status: FriendRequestStatus.ACCEPTED,
        },
      });
    }),

  reject: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx: { db, user }, input: { id } }) => {
      return db.friendRequest.delete({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
          toUserId: user.id,
        },
      });
    }),

  cancel: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      await db.friendRequest.delete({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
          fromUserId: user.id,
          status: {
            not: FriendRequestStatus.ACCEPTED,
          },
        },
      });
    }),

  pending: privateProcedure.query(({ ctx: { db, user } }) => {
    return db.friendRequest.findMany({
      where: {
        toUserId: user.id,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        fromUser: true,
      },
    });
  }),

  isSent: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx: { db, user }, input: { id } }) => {
      const request = await db.friendRequest.findUnique({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
          fromUserId: user.id,
          toUserId: id,
          status: FriendRequestStatus.PENDING,
        },
      });

      return request !== null;
    }),

  isPending: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx: { db, user }, input: { id } }) => {
      const request = await db.friendRequest.findUnique({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
          fromUserId: id,
          toUserId: user.id,
          status: FriendRequestStatus.PENDING,
        },
      });

      return request !== null;
    }),

  isFriend: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx: { db, user }, input: { id } }) => {
      const request = await db.friendRequest.findMany({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
          status: FriendRequestStatus.ACCEPTED,
        },
      });

      return request.length > 0;
    }),
});
