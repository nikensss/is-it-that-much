import { UsersRound } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/server';

export default async function MyGroups() {
  const groups = await api.groups.all.query();

  return (
    <section className="border-primary-200 rounded-md border bg-white p-2">
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold">My groups</h2>
      </header>
      <main className="flex flex-col gap-2">
        {groups.map((group) => (
          <Link
            href={`/groups/${group.id}`}
            key={group.id}
            className="ry-2 border-primary-100 md:hover:border-primary-900 flex select-none items-center rounded-md border p-4 md:hover:cursor-pointer md:hover:shadow-md"
          >
            <div className="flex items-center justify-center">
              <Avatar className="mr-2">
                <AvatarImage src="" alt="group image" />
                <AvatarFallback>
                  <UsersRound />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-xl font-bold">{group.name}</p>
                <p className={cn(group.description ? '' : 'invisible', 'text-gray-600')}>{group.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </section>
  );
}
