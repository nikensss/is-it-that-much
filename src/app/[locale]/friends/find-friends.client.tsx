'use client';

import { useState } from 'react';
import UserBannerClient from '~/app/[locale]/friends/user-banner.client';
import UserBannerLoading from '~/app/[locale]/friends/user-banner.loading';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react.client';
import type { RouterOutputs } from '~/trpc/shared';

export default function FindFriends() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<RouterOutputs['users']['find']>([]);

  const query = api.users.find.useQuery(
    { search },
    {
      enabled: search.length >= 3,
      onError: () => setUsers(() => []),
      onSuccess: (d) => {
        if (d === null) return setUsers(() => []);
        setUsers(() => d);
      },
    },
  );

  return (
    <div>
      <Input
        id="search"
        type="text"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name, email, username..."
      />
      <section className="mt-2 flex h-full flex-col items-stretch gap-2">
        {query.isFetching ? (
          <UserBannerLoading />
        ) : (
          users?.map((user) => <UserBannerClient key={user.id} user={user} />)
        )}
      </section>
    </div>
  );
}
