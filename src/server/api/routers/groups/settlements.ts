import { endOfMonth, startOfMonth } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { assertUserInGroup } from '~/server/api/routers/groups/groups';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { groupSettlementFormSchema } from '~/trpc/shared';

export const groupSettlementsRouter = createTRPCRouter({
  create: privateProcedure.input(groupSettlementFormSchema).mutation(async ({ ctx: { db }, input }) => {
    await assertUserInGroup({ groupId: input.groupId, userId: input.fromId });
    await assertUserInGroup({ groupId: input.groupId, userId: input.toId });

    return db.settlement.create({
      data: {
        amount: parseInt(`${input.amount * 100}`),
        date: input.date,
        groupId: input.groupId,
        fromId: input.fromId,
        toId: input.toId,
      },
    });
  }),

  period: privateProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        from: z.date().nullable(),
        to: z.date().nullable(),
      }),
    )
    .query(async ({ ctx: { db, user }, input }) => {
      await assertUserInGroup({ groupId: input.groupId, userId: user.id });

      const timezone = user.timezone ?? 'Europe/Amsterdam';
      const now = utcToZonedTime(Date.now(), timezone);
      const preferredTimezoneOffset = getTimezoneOffset(timezone);
      const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
      const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

      return db.settlement.findMany({
        where: {
          groupId: input.groupId,
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

  recent: privateProcedure
    .input(z.object({ groupId: z.string().cuid() }))
    .query(async ({ ctx: { db, user }, input: { groupId } }) => {
      await assertUserInGroup({ groupId, userId: user.id });

      return db.settlement.findMany({
        where: {
          groupId,
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
        take: 5,
      });
    }),
});
