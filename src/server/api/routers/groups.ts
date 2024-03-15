import { auth } from '@clerk/nextjs';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const groupsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        members: z.array(z.string().cuid()),
      }),
    )
    .mutation(async ({ ctx, input: { name, description, members } }) => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) throw new Error('User not found');

      const group = await ctx.db.group.create({ data: { name, description, createdById: user.id } });

      return Promise.all(members.map((id) => ctx.db.usersGroups.create({ data: { userId: id, groupId: group.id } })));
    }),
});
