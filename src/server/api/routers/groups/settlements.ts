import { TRPCError } from '@trpc/server';
import { endOfMonth, startOfMonth } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { log } from 'next-axiom';
import { z } from 'zod';
import { createTRPCRouter, groupProcedure } from '~/server/api/trpc';
import { groupSettlementFormSchema } from '~/trpc/shared';

export const groupSettlementsRouter = createTRPCRouter({
  upsert: groupProcedure.input(groupSettlementFormSchema).mutation(async ({ ctx: { db, group }, input }) => {
    const usersInGroup = await db.usersGroups.count({
      where: { groupId: group.id, userId: { in: [input.toId, input.fromId] } },
    });

    if (usersInGroup !== 2) {
      log.warn('User is not in group', { groupId: group.id, fromId: input.fromId, toId: input.toId });
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return db.settlement.upsert({
      where: {
        id: input.settlementId ?? '',
      },
      create: {
        amount: parseInt(`${input.amount * 100}`),
        date: input.date,
        groupId: input.groupId,
        fromId: input.fromId,
        toId: input.toId,
      },
      update: {
        amount: parseInt(`${input.amount * 100}`),
        date: input.date,
        groupId: input.groupId,
        fromId: input.fromId,
        toId: input.toId,
      },
    });
  }),

  delete: groupProcedure
    .input(z.object({ settlementId: z.string().cuid() }))
    .mutation(async ({ ctx: { db, group }, input: { settlementId } }) => {
      return db.settlement.delete({ where: { id: settlementId, groupId: group.id } });
    }),

  period: groupProcedure
    .input(z.object({ from: z.date().nullish(), to: z.date().nullish() }))
    .query(async ({ ctx: { db, user, group }, input }) => {
      const t = toZonedTime(Date.now(), user.timezone ?? 'Europe/Amsterdam');
      const from = fromZonedTime(startOfMonth(t), user.timezone ?? 'Europe/Amsterdam');
      const to = fromZonedTime(endOfMonth(t), user.timezone ?? 'Europe/Amsterdam');

      return db.settlement.findMany({
        where: {
          groupId: group.id,
          date: {
            gte: input.from ?? from,
            lte: input.to ?? to,
          },
        },
        include: {
          from: {
            select: {
              firstName: true,
              id: true,
              imageUrl: true,
              lastName: true,
              username: true,
            },
          },
          to: {
            select: {
              firstName: true,
              id: true,
              imageUrl: true,
              lastName: true,
              username: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    }),

  recent: groupProcedure
    .input(z.object({ take: z.number().default(5) }))
    .query(async ({ ctx: { db, group }, input: { take } }) => {
      return db.settlement.findMany({
        where: {
          groupId: group.id,
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
        },
        orderBy: {
          date: 'desc',
        },
        take,
      });
    }),
});
