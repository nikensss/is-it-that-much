import { categoriesRouter } from '~/server/api/routers/categories';
import { personalExpensesRouter } from '~/server/api/routers/personal-expenses';
import { personalIncomesRouter } from '~/server/api/routers/personal-incomes';
import { tagsRouter } from '~/server/api/routers/tags';
import { usersRouter } from '~/server/api/routers/users';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  personalExpenses: personalExpensesRouter,
  personalIncomes: personalIncomesRouter,
  tags: tagsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
