import { auth, clerkClient as clerk, currentUser } from '@clerk/nextjs';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { log } from 'next-axiom';
import { z } from 'zod';
import { subMinutes } from 'date-fns';

export const usersRouter = createTRPCRouter({
  exists: publicProcedure.query(async ({ ctx }) => {
    const { userId } = auth();
    if (!userId) return false;

    const count = await ctx.db.user.count({ where: { externalId: userId } });
    return count > 0;
  }),

  create: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      log.debug(`creating user ${clerkUser.id} in db`);

      const emailParts = clerkUser.emailAddresses[0]?.emailAddress?.split('@') ?? [];
      emailParts.pop();
      const emailLocalPart = emailParts.join('@');

      const userInDb = await ctx.db.user.create({
        data: {
          username: clerkUser.username,
          externalId: clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          email: clerkUser.emailAddresses[0]?.emailAddress,
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

  get: publicProcedure.query(({ ctx }) => {
    const { userId } = auth();
    if (!userId) return null;

    return ctx.db.user.findUnique({ where: { externalId: userId } });
  }),

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
      where: { externalId: clerkUser.id },
    });

    if (userInDb.id !== clerkUser.externalId) {
      await clerk.users.updateUser(clerkUser.id, { externalId: userInDb.id });
      log.debug('updated user in clerk');
    }
  }),

  update: publicProcedure
    .input(
      z.object({
        username: z.string().min(1).max(120).optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
        weekStartsOn: z.number().min(0).max(6).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = auth();
      if (!userId) return null;

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) return null;

      const timezone =
        input.timezone
          ?.match(/^(?<timezone>[^\(]+)\(.*$/)
          ?.groups?.timezone?.trim()
          .replace(/ /g, '_') ?? undefined;

      const currency = input.currency?.match(/^(?<name>\w+) \((?<symbol>.)\)$/)?.groups?.name?.trim() ?? undefined;

      if (input.username !== user.username) {
        await Promise.all([
          clerk.users.updateUser(user.externalId, { username: input.username }),
          ctx.db.usernameLocks.deleteMany({
            where: { OR: [{ userId: user.id }, user.username ? { username: user.username } : {}] },
          }),
        ]);
      }

      return ctx.db.user.update({
        where: { id: user.id },
        data: {
          username: input.username,
          timezone,
          currency,
          weekStartsOn: input.weekStartsOn,
        },
      });
    }),

  find: publicProcedure
    .input(
      z.object({
        search: z.string().min(3),
      }),
    )
    .query(async ({ ctx, input: { search } }) => {
      const { userId } = auth();
      if (!userId) return null;

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) return null;

      return ctx.db.user.findMany({
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
    lock: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
      if (username.length < 3 || username.length > 120) return false;

      const { userId } = auth();
      if (!userId) return false;

      const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
      if (!user) return false;

      if (username === user.username) return true;

      const isAlreadyInUse = (await ctx.db.user.count({ where: { username } })) > 0;
      if (isAlreadyInUse) return false;

      await ctx.db.usernameLocks.deleteMany({
        where: {
          updatedAt: {
            lt: subMinutes(new Date(), 2),
          },
        },
      });

      const isLockedBySomebodyElse =
        (await ctx.db.usernameLocks.count({
          where: {
            username,
            userId: {
              not: user.id,
            },
          },
        })) > 0;
      if (isLockedBySomebodyElse) return false;

      try {
        await ctx.db.usernameLocks.upsert({
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
