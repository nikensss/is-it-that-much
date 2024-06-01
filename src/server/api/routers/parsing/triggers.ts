import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { triggersFormSchema } from '~/trpc/shared';

export const triggersRouter = createTRPCRouter({
  all: privateProcedure.query(({ ctx: { db, user } }) => {
    return db.trigger.findMany({
      where: {
        createdById: user.id,
      },
      include: {
        TriggersTags: {
          select: {
            tag: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }),

  update: privateProcedure.input(triggersFormSchema).mutation(async ({ ctx: { db, user }, input: { triggers } }) => {
    for (const { triggerId, target, description, tags } of triggers) {
      if (!triggerId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Trigger ID is required' });

      await db.trigger.update({
        where: { id: triggerId, createdById: user.id },
        data: { target, description },
      });

      await db.triggersTags.deleteMany({ where: { triggerId, trigger: { createdById: user.id } } });
      await db.tag.createMany({
        data: tags
          .split(',')
          .map((t) => t.trim())
          .map((t) => ({ name: t, createdById: user.id })),
        skipDuplicates: true,
      });

      const triggerTags = await db.tag.findMany({
        where: { name: { in: tags.split(',').map((t) => t.trim()) }, createdById: user.id },
        select: { id: true },
      });
      await db.triggersTags.createMany({ data: triggerTags.map((t) => ({ tagId: t.id, triggerId })) });
    }
  }),

  create: privateProcedure.input(triggersFormSchema).mutation(async ({ ctx: { db, user }, input: { triggers } }) => {
    for (const { triggerId, target, description, tags } of triggers) {
      if (triggerId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Trigger ID is required' });

      const trigger = await db.trigger.create({ data: { target, description, createdById: user.id } });
      await db.tag.createMany({
        data: tags
          .split(',')
          .map((t) => t.trim())
          .map((t) => ({ name: t, createdById: user.id })),
        skipDuplicates: true,
      });

      const triggerTags = await db.tag.findMany({
        where: { name: { in: tags.split(',').map((t) => t.trim()) }, createdById: user.id },
        select: { id: true },
      });
      await db.triggersTags.createMany({ data: triggerTags.map((t) => ({ tagId: t.id, triggerId: trigger.id })) });
    }
  }),

  delete: privateProcedure
    .input(z.object({ triggerId: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { triggerId } }) => {
      await db.triggersTags.deleteMany({ where: { triggerId, trigger: { createdById: user.id } } });
      await db.trigger.delete({ where: { id: triggerId, createdById: user.id } });
    }),
});
