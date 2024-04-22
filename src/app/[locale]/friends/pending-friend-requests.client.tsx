'use client';

import { useState } from 'react';
import UserBannerClient from '~/app/[locale]/friends/user-banner.client';
import UserBannerLoading from '~/app/[locale]/friends/user-banner.loading';
import { api } from '~/trpc/react.client';
import type { RouterOutputs } from '~/trpc/shared';

export default function PendingFriendRequests() {
  const [requests, setRequests] = useState<RouterOutputs['friends']['requests']['pending']>([]);

  const query = api.friends.requests.pending.useQuery(undefined, {
    enabled: true,
    onError: () => setRequests(() => []),
    onSuccess: (d) => setRequests(d),
  });

  return (
    <main className="flex grow flex-col items-stretch gap-2">
      {query.isFetching
        ? Array.from({ length: Math.ceil(Math.random() * 5) }, (_, i) => <UserBannerLoading key={i} />)
        : requests?.map((r) => <UserBannerClient key={r.id} user={r.fromUser} />)}
    </main>
  );
}
