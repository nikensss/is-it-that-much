'use client';

import { useState } from 'react';
import UserBannerClient from '~/app/friends/user-banner.client';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';

export default function PendingFriendRequests() {
  const [requests, setRequests] = useState<RouterOutputs['friends']['requests']['pending']>([]);

  api.friends.requests.pending.useQuery(undefined, {
    enabled: true,
    onError: () => setRequests(() => []),
    onSuccess: (d) => setRequests(d),
  });

  return (
    <main className="flex grow flex-col items-stretch">
      {requests?.map((r) => <UserBannerClient key={r.id} user={r.fromUser} />)}
    </main>
  );
}
