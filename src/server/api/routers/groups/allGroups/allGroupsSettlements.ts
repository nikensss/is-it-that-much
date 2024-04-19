import { z } from 'zod';
import { createTRPCRouter, periodProcedure, privateProcedure } from '~/server/api/trpc';

export const allGroupsSettlementsRouter = createTRPCRouter({
  period: createTRPCRouter({
    sum: periodProcedure
      .input(z.object({ type: z.enum(['sentByCurrentUser', 'receivedByCurrentUser', 'all']) }))
      .query(async ({ ctx: { db, user, from, to }, input: { type } }) => {
        return db.settlement.aggregate({
          where: {
            date: {
              gte: from,
              lte: to,
            },
            ...(type === 'sentByCurrentUser' ? { fromId: user.id } : {}),
            ...(type === 'receivedByCurrentUser' ? { toId: user.id } : {}),
            ...(type === 'all' ? { group: { UserGroup: { some: { user } } } } : {}),
          },
          _sum: {
            amount: true,
          },
        });
      }),

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
            ...(type === 'all' ? { group: { UserGroup: { some: { user } } } } : {}),
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
  }),

  recent: privateProcedure
    .input(
      z.object({
        take: z.number().min(1).default(10),
        type: z.enum(['sentByCurrentUser', 'receivedByCurrentUser', 'all']),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { take, type } }) => {
      return db.settlement.findMany({
        where: {
          ...(type === 'sentByCurrentUser' ? { fromId: user.id } : {}),
          ...(type === 'receivedByCurrentUser' ? { toId: user.id } : {}),
          ...(type === 'all' ? { group: { UserGroup: { some: { user } } } } : {}),
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
        take,
      });
    }),
});
