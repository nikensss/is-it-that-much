import { auth, clerkClient as clerk, currentUser } from '@clerk/nextjs';
import type { DB } from '~/server/db';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { log } from 'next-axiom';

async function exists(db: DB): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  const count = await db.user.count({ where: { externalId: userId } });
  return count > 0;
}

async function create(db: DB): Promise<ReturnType<DB['user']['create']> | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    log.debug(`creating user ${clerkUser.id} in db`);

    const userInDb = await db.user.create({
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
}

async function get(db: DB): Promise<ReturnType<DB['user']['findUnique']>> {
  const { userId } = auth();
  if (!userId) return null;

  return db.user.findUnique({ where: { externalId: userId } });
}

async function sync(db: DB): Promise<void> {
  try {
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
    const userInDb = await db.user.upsert({
      create: userData,
      update: userData,
      where: { externalId: clerkUser.id },
    });

    await clerk.users.updateUser(clerkUser.id, { externalId: userInDb.id });
    log.debug('updated user in clerk');
  } catch (e) {
    log.error('error creating user', { e });
  }
}

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => get(ctx.db)),
  exists: publicProcedure.query(({ ctx }) => exists(ctx.db)),
  create: publicProcedure.mutation(({ ctx }) => create(ctx.db)),
  sync: publicProcedure.mutation(({ ctx }) => sync(ctx.db)),
});
