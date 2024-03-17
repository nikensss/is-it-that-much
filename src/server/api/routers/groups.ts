import { auth } from '@clerk/nextjs';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const groupsRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input: { id } }) => {
      const { userId } = auth();
      if (!userId) return null;

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) return null;

      return ctx.db.group.findUnique({
        where: {
          id,
          UserGroup: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          UserGroup: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
    }),

  leave: publicProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input: { id } }) => {
    const { userId } = auth();
    if (!userId) throw new TRPCError({ code: 'FORBIDDEN' });

    const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
    if (!user) throw new TRPCError({ code: 'FORBIDDEN' });

    return ctx.db.usersGroups.deleteMany({
      where: {
        userId: user.id,
        groupId: id,
      },
    });
  }),

  all: publicProcedure.query(async ({ ctx }) => {
    const { userId } = auth();
    if (!userId) return [];

    const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
    if (!user) return [];

    return ctx.db.group.findMany({
      where: {
        UserGroup: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }),

  upsert: publicProcedure
    .input(
      z.object({
        id: z.string().cuid().optional(),
        name: z.string().min(3),
        description: z.string().optional(),
        members: z
          .array(z.string().cuid())
          .min(1, { message: 'You need to select at least 1 member to create a group' }),
      }),
    )
    .mutation(async ({ ctx, input: { id, name, description, members } }) => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) throw new Error('User not found');

      const group = await ctx.db.group.upsert({
        where: { id: id ?? '' },
        create: { name, description, createdById: user.id },
        update: { name, description },
      });

      await ctx.db.usersGroups.createMany({
        data: [user.id, ...members].map((userId) => ({ userId, groupId: group.id })),
        skipDuplicates: true,
      });

      await ctx.db.usersGroups.deleteMany({
        where: {
          userId: {
            notIn: [user.id, ...members],
          },
        },
      });
    }),
});
