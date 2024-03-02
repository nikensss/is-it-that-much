'use client';

import { useState } from 'react';
import UserBannerClient from '~/app/friends/user-banner.client';
import UserBannerLoading from '~/app/friends/user-banner.loading';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';

export default function PendingFriendRequests() {
  const [requests, setRequests] = useState<RouterOutputs['friends']['requests']['pending']>([]);

  const query = api.friends.requests.pending.useQuery(undefined, {
    enabled: true,
    onError: () => setRequests(() => []),
    onSuccess: (d) => setRequests(d),
  });

  return (
    <main className="flex grow flex-col items-stretch">
      {query.isFetching
        ? Array.from({ length: Math.ceil(Math.random() * 5) }, (_, i) => <UserBannerLoading key={i} />)
        : requests?.map((r) => <UserBannerClient key={r.id} user={r.fromUser} />)}
    </main>
  );
}
