import { z } from 'zod';
import { createTRPCRouter, periodProcedure, privateProcedure } from '~/server/api/trpc';

export const allGroupsSettlementsRouter = createTRPCRouter({
  period: createTRPCRouter({
    list: periodProcedure
      .input(z.object({ type: z.enum(['sentByCurrentUser', 'receivedByCurrentUser', 'all']) }))
      .query(async ({ ctx: { db, user, from, to }, input: { type } }) => {
        return db.settlement.findMany({
          where: {
            date: {
              gte: from,
              lte: to,
            },
            ...(type === 'sentByCurrentUser' ? { fromId: user.id } : {}),
            ...(type === 'receivedByCurrentUser' ? { toId: user.id } : {}),
          },
          orderBy: {
            date: 'desc',
          },
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }),
  }),

  recent: privateProcedure.query(async ({ ctx: { db, user } }) => {
    return db.settlement.findMany({
      where: {
        group: {
          UserGroup: {
            some: {
              user,
            },
          },
        },
      },
      include: {
        from: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        to: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }),
});
