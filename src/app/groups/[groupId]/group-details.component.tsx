import Link from 'next/link';
import UserBannerClient from '~/app/friends/user-banner.client';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';
import type { RouterOutputs } from '~/trpc/shared';

export default async function GroupDetails({ group }: { group: Exclude<RouterOutputs['groups']['get'], null> }) {
  const users = group.UserGroup.map((e) => e.user);
  const currentUser = await api.users.get.query();

  return (
    <div className="flex flex-col rounded-md border border-slate-200 p-2">
      <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">Details</h2>
      </header>
      <main>
        <p className="text-center text-lg font-bold">{group.description}</p>
        <p className="text-center text-lg">Members</p>
        <div className="mb-2 flex flex-col gap-2">
          {users.map((user) => (
            <UserBannerClient key={user.id} user={user} isSelf={user.id === currentUser?.id} />
          ))}
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/groups/${group.id}/edit`}>Edit</Link>
        </Button>
      </main>
    </div>
  );
}
