import { FriendRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { friendRequestsRouters } from '~/server/api/routers/friends/requests';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const friendsRouters = createTRPCRouter({
  requests: friendRequestsRouters,

  all: privateProcedure.query(async ({ ctx: { user, db } }) => {
    const accepted = await db.friendRequest.findMany({
      where: {
        uniqueId: { contains: user.id },
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

    return accepted.map((e) => (e.fromUser.id === user.id ? e.toUser : e.fromUser));
  }),

  delete: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      await db.friendRequest.deleteMany({
        where: {
          uniqueId: [user.id, id].sort().join('_'),
        },
      });
    }),

  find: privateProcedure
    .input(
      z.object({
        search: z.string().min(3),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { search } }) => {
      const accepted = await db.friendRequest.findMany({
        where: {
          uniqueId: { contains: user.id },
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
                      { id: { not: user.id } },
                    ],
                  },
                  {
                    AND: [
                      {
                        firstName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.id } },
                    ],
                  },
                  {
                    AND: [
                      {
                        lastName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.id } },
                    ],
                  },
                  {
                    AND: [
                      {
                        emailLocalPart: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.id } },
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
                      { id: { not: user.id } },
                    ],
                  },
                  {
                    AND: [
                      {
                        firstName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.id } },
                    ],
                  },
                  {
                    AND: [
                      {
                        lastName: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.id } },
                    ],
                  },
                  {
                    AND: [
                      {
                        emailLocalPart: { contains: search, mode: 'insensitive' },
                      },
                      { id: { not: user.id } },
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

      return accepted.map((e) => (e.fromUser.id === user.id ? e.toUser : e.fromUser));
    }),
});
