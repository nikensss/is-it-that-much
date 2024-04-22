import { clerkClient as clerk } from '@clerk/nextjs/server';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { subMinutes } from 'date-fns';

export const usersRouter = createTRPCRouter({
  get: privateProcedure.query(({ ctx: { user } }) => user),

  update: privateProcedure
    .input(
      z.object({
        username: z.string().min(1).max(120).optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
        weekStartsOn: z.number().min(0).max(6).optional(),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input }) => {
      const timezone =
        input.timezone
          ?.match(/^(?<timezone>[^\(]+)\(.*$/)
          ?.groups?.timezone?.trim()
          .replace(/ /g, '_') ?? undefined;

      const currency = input.currency?.match(/^(?<name>\w+) \((?<symbol>.)\)$/)?.groups?.name?.trim() ?? undefined;

      if (input.username !== user.username) {
        await Promise.all([
          clerk.users.updateUser(user.externalId, { username: input.username }),
          db.usernameLocks.deleteMany({
            where: { OR: [{ userId: user.id }, user.username ? { username: user.username } : {}] },
          }),
        ]);
      }

      return db.user.update({
        where: { id: user.id },
        data: {
          username: input.username,
          timezone,
          currency,
          weekStartsOn: input.weekStartsOn,
        },
      });
    }),

  find: privateProcedure
    .input(
      z.object({
        search: z.string().min(3),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { search } }) => {
      return db.user.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              emailLocalPart: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              username: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
          id: {
            not: user.id,
          },
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      });
    }),

  usernames: createTRPCRouter({
    lock: privateProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ ctx: { db, user }, input: { username } }) => {
        if (username.length < 3 || username.length > 120) return false;

        if (username === user.username) return true;

        const isAlreadyInUse = (await db.user.count({ where: { username } })) > 0;
        if (isAlreadyInUse) return false;

        await db.usernameLocks.deleteMany({
          where: {
            updatedAt: {
              lt: subMinutes(new Date(), 2),
            },
          },
        });

        const locks = await db.usernameLocks.count({
          where: {
            username,
            userId: {
              not: user.id,
            },
          },
        });
        if (locks > 0) return false;

        try {
          await db.usernameLocks.upsert({
            where: {
              username,
            },
            create: {
              username,
              userId: user.id,
            },
            update: {
              username,
            },
          });

          return true;
        } catch (e) {
          console.log('error locking username', e, user);
          return false;
        }
      }),
  }),
});
