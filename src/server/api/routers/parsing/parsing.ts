import { triggersRouter } from '~/server/api/routers/parsing/triggers';
import { createTRPCRouter } from '~/server/api/trpc';

export const parsingRouter = createTRPCRouter({
  triggers: triggersRouter,
});
