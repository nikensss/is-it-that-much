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
        fromUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        toUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
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

  find: publicProcedure
    .input(
      z.object({
        search: z.string().min(3),
      }),
    )
    .query(async ({ ctx, input: { search } }) => {
      const user = await currentUser();
      if (!user?.externalId) return [];

      const accepted = await ctx.db.friendRequest.findMany({
        where: {
          uniqueId: {
            contains: user.externalId,
          },
          status: FriendRequestStatus.ACCEPTED,
          OR: [
            {
              fromUser: {
                OR: [
                  {
                    AND: [
                      {
                        username: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                  {
                    AND: [
                      {
                        firstName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                  {
                    AND: [
                      {
                        lastName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                  {
                    AND: [
                      {
                        emailLocalPart: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                ],
              },
            },
            {
              toUser: {
                OR: [
                  {
                    AND: [
                      {
                        username: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                  {
                    AND: [
                      {
                        firstName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                  {
                    AND: [
                      {
                        lastName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                  {
                    AND: [
                      {
                        emailLocalPart: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.externalId } },
                    ],
                  },
                ],
              },
            },
          ],
        },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          toUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });

      return accepted.map((e) => (e.fromUser.id === user.externalId ? e.toUser : e.fromUser));
    }),
});
