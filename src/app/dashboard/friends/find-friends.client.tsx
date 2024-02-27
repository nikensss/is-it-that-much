'use client';

import { Dot } from 'lucide-react';
import { useState } from 'react';
import UserBannerClient from '~/app/dashboard/friends/user-banner.client';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react';
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
    <>
      <div className="relative w-full">
        <Input
          id="search"
          className="text-[16px]"
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email, username..."
        />
        {query.isFetching ? (
          <Dot size={43} className="absolute right-[0rem] top-[-0.22rem] animate-ping text-slate-500" />
        ) : null}
      </div>
      {users?.map((user) => <UserBannerClient key={user.id} user={user} />)}
    </>
  );
}
