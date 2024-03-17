import { auth } from '@clerk/nextjs';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const groupsRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.group.findUnique({
        where: {
          id: input.id,
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

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        members: z
          .array(z.string().cuid())
          .min(1, { message: 'You need to select at least 1 member to create a group' }),
      }),
    )
    .mutation(async ({ ctx, input: { name, description, members } }) => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) throw new Error('User not found');

      const group = await ctx.db.group.create({ data: { name, description, createdById: user.id } });

      await ctx.db.usersGroups.createMany({
        data: [user.id, ...members].map((userId) => ({ userId, groupId: group.id })),
      });
    }),
});
