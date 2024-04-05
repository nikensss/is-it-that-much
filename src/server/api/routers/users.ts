import { clerkClient as clerk, currentUser } from '@clerk/nextjs';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import { log } from 'next-axiom';
import { z } from 'zod';
import { subMinutes } from 'date-fns';

export const usersRouter = createTRPCRouter({
  create: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      log.debug(`creating user ${clerkUser.id} in db`);

      const emailParts = clerkUser.emailAddresses[0]?.emailAddress?.split('@') ?? [];
      emailParts.pop();
      const emailLocalPart = emailParts.join('@').toLowerCase();

      const userInDb = await ctx.db.user.create({
        data: {
          username: clerkUser.username,
          externalId: clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          email: clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase(),
          emailLocalPart,
        },
      });

      await clerk.users.updateUser(clerkUser.id, { externalId: userInDb.id });
      log.debug('updated user in clerk');

      return userInDb;
    } catch (e) {
      log.error('error creating user', { e });
      return null;
    }
  }),

  get: privateProcedure.query(({ ctx: { user } }) => user),

  sync: publicProcedure.mutation(async ({ ctx }) => {
    const clerkUser = await currentUser();
    if (!clerkUser) return;

    log.debug(`upserting user ${clerkUser.id} into db`);
    const userData = {
      username: clerkUser.username,
      externalId: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    };

    const userInDb = await ctx.db.user.upsert({
      create: userData,
      update: userData,
      where: { email: clerkUser.emailAddresses[0]?.emailAddress },
    });

    if (userInDb.id !== clerkUser.externalId) {
      await clerk.users.updateUser(clerkUser.id, { externalId: userInDb.id });
      log.debug('updated user in clerk');
    }
  }),

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
