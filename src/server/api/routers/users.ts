import { auth, clerkClient as clerk, currentUser } from '@clerk/nextjs';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { log } from 'next-axiom';
import { z } from 'zod';

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

      const userInDb = await ctx.db.user.create({
        data: {
          username: clerkUser.username,
          externalId: clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          email: clerkUser.emailAddresses[0]?.emailAddress,
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

      return ctx.db.user.update({
        where: { id: user.id },
        data: {
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
              email: {
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
});
