import { endOfMonth, startOfMonth } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { z } from 'zod';
import { assertUserInGroup } from '~/server/api/routers/groups/groups';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { groupSettlementFormSchema } from '~/trpc/shared';

export const groupSettlementsRouter = createTRPCRouter({
  upsert: privateProcedure.input(groupSettlementFormSchema).mutation(async ({ ctx: { db }, input }) => {
    await assertUserInGroup({ groupId: input.groupId, userId: input.fromId });
    await assertUserInGroup({ groupId: input.groupId, userId: input.toId });

    return db.settlement.upsert({
      where: {
        id: input.id ?? '',
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

  delete: privateProcedure
    .input(z.object({ groupId: z.string().cuid(), settlementId: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { groupId, settlementId } }) => {
      await assertUserInGroup({ groupId: groupId, userId: user.id });

      return db.settlement.delete({
        where: {
          id: settlementId,
          groupId,
        },
      });
    }),

  period: privateProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        from: z.date().nullish(),
        to: z.date().nullish(),
      }),
    )
    .query(async ({ ctx: { db, user }, input }) => {
      await assertUserInGroup({ groupId: input.groupId, userId: user.id });

      const t = utcToZonedTime(Date.now(), user.timezone ?? 'Europe/Amsterdam');
      const from = zonedTimeToUtc(startOfMonth(t), user.timezone ?? 'Europe/Amsterdam');
      const to = zonedTimeToUtc(endOfMonth(t), user.timezone ?? 'Europe/Amsterdam');

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
    .input(z.object({ groupId: z.string().cuid(), take: z.number().default(5) }))
    .query(async ({ ctx: { db, user }, input: { groupId, take } }) => {
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
        take,
      });
    }),
});
