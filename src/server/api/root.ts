import { categoriesRouter } from '~/server/api/routers/categories';
import { personalExpensesRouter } from '~/server/api/routers/personal-expenses';
import { usersRouter } from '~/server/api/routers/users';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  users: usersRouter,
  personalExpenses: personalExpensesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
