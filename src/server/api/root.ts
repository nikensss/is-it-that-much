import { friendsRouters } from '~/server/api/routers/friends/friends';
import { groupsRouter } from '~/server/api/routers/groups/groups';
import { tagsRouter } from '~/server/api/routers/tags';
import { transactionsRouter } from '~/server/api/routers/transactions/transactions';
import { usersRouter } from '~/server/api/routers/users';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  friends: friendsRouters,
  groups: groupsRouter,
  tags: tagsRouter,
  transactions: transactionsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
