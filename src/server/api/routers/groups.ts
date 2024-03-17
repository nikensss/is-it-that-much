import { z } from 'zod';

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const groupsRouter = createTRPCRouter({
  get: privateProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { id } }) => {
      return db.group.findUnique({
        where: {
          id,
          UserGroup: {
            some: {
              user,
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

  leave: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      return db.usersGroups.deleteMany({
        where: {
          user,
          groupId: id,
        },
      });
    }),

  all: privateProcedure.query(async ({ ctx: { db, user } }) => {
    return db.group.findMany({
      where: {
        UserGroup: {
          some: {
            user,
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

  upsert: privateProcedure
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
    .mutation(async ({ ctx: { db, user }, input: { id, name, description, members } }) => {
      const group = await db.group.upsert({
        where: { id: id ?? '' },
        create: { name, description, createdById: user.id },
        update: { name, description },
      });

      await db.usersGroups.createMany({
        data: [user.id, ...members].map((userId) => ({ userId, groupId: group.id })),
        skipDuplicates: true,
      });

      await db.usersGroups.deleteMany({
        where: {
          userId: {
            notIn: [user.id, ...members],
          },
        },
      });

      return group.id;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx: { db }, input: { id } }) => db.group.delete({ where: { id } })),
});
