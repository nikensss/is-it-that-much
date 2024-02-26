import { friendRequestsRouters } from '~/server/api/routers/friends/requests';
import { createTRPCRouter } from '~/server/api/trpc';

export const friendsRouters = createTRPCRouter({
  requests: friendRequestsRouters,
});
