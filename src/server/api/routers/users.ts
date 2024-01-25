import { auth, clerkClient, currentUser } from '@clerk/nextjs';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export type DB = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

const exists = async (db: DB): Promise<boolean> => {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  const count = await db.user.count({ where: { externalId: userId } });
  return count > 0;
};

const create = async (db: DB): Promise<ReturnType<DB['user']['create']>> => {
  const user = await currentUser();
  if (!user) throw new Error('No user authenticated, cannot create');

  const userInDb = await db.user.create({
    data: {
      username: user.username,
      externalId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      emailId: user.primaryEmailAddressId,
    },
  });

  await clerkClient.users.updateUser(user.id, { externalId: userInDb.id });
  return userInDb;
};

const get = async (db: DB): Promise<ReturnType<DB['user']['findUnique']>> => {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  if (!(await exists(db))) return create(db);
  return db.user.findUnique({ where: { externalId: userId } });
};

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => get(ctx.db)),
  exists: publicProcedure.query(({ ctx }) => exists(ctx.db)),
  create: publicProcedure.mutation(({ ctx }) => create(ctx.db)),
});
