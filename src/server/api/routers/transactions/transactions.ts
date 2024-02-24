import { personalTransactionsRouter } from '~/server/api/routers/transactions/personal';
import { createTRPCRouter } from '~/server/api/trpc';

export const transactionsRouter = createTRPCRouter({
  personal: personalTransactionsRouter,
});
