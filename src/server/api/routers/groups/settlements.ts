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
