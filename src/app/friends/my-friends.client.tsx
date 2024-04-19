'use client';

import { useState } from 'react';
import UserBannerClient from '~/app/friends/user-banner.client';
import UserBannerLoading from '~/app/friends/user-banner.loading';
import { api } from '~/trpc/react.client';
import type { RouterOutputs } from '~/trpc/shared';

export default function MyFriends() {
  const [friends, setFriends] = useState<RouterOutputs['friends']['all']>([]);

  const query = api.friends.all.useQuery(undefined, {
    enabled: true,
    onError: () => setFriends(() => []),
    onSuccess: (d) => setFriends(d),
  });

  return (
    <main className="flex grow flex-col items-stretch gap-2">
      {query.isFetching
        ? Array.from({ length: Math.ceil(Math.random() * 5) }, (_, i) => <UserBannerLoading key={i} />)
        : friends?.map((f) => <UserBannerClient key={f.id} user={f} />)}
    </main>
  );
}
