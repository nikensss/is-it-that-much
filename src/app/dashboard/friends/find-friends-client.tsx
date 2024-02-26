'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Dot } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';

export default function FindFriendsClient() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<RouterOutputs['users']['find']>([]);

  const query = api.users.find.useQuery(
    { search },
    {
      initialData: [],
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
          <Dot size={43} className="absolute right-[-0rem] top-[-0.22rem] animate-ping text-slate-500" />
        ) : null}
      </div>
      {users?.map((user) => <User key={user.id} user={user} />)}
    </>
  );
}

function User({ user }: { user: Exclude<RouterOutputs['users']['find'], null>[number] }) {
  return (
    <div className="my-2 flex scale-[99.5%] items-center rounded-md border border-slate-100 p-4 transition hover:scale-100 hover:cursor-pointer hover:border-slate-900 hover:shadow-md">
      <Avatar className="mr-4">
        <AvatarImage src={user.imageUrl ?? ''} alt={`@${user.username}`} />
        <AvatarFallback>
          <AvatarIcon />
        </AvatarFallback>
      </Avatar>
      <div>
        {user.firstName} {user.lastName} {user.username ? `(@${user.username})` : ''}
      </div>
    </div>
  );
}
