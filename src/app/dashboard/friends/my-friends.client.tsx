'use client';

import { useState } from 'react';
import UserBannerClient from '~/app/dashboard/friends/user-banner.client';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';

export default function MyFriends() {
  const [friends, setFriends] = useState<RouterOutputs['friends']['all']>([]);

  api.friends.all.useQuery(undefined, {
    enabled: true,
    onError: () => setFriends(() => []),
    onSuccess: (d) => setFriends(d),
  });

  return (
    <main className="flex grow flex-col items-stretch">
      {friends?.map((f) => <UserBannerClient key={f.id} user={f} />)}
    </main>
  );
}