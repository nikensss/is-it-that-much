import { UsersRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/server';

export default async function MyGroups() {
  const groups = await api.groups.all.query();

  return (
    <section className="rounded-md border border-slate-200 bg-white p-2">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold text-slate-200">My groups</h2>
      </header>
      <main className="flex flex-col gap-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="ry-2 flex select-none items-center rounded-md border border-slate-100 p-4 md:hover:cursor-pointer md:hover:border-slate-900 md:hover:shadow-md"
          >
            <div className="flex items-center justify-center">
              <Avatar className="mr-4">
                <AvatarImage src="" alt="group image" />
                <AvatarFallback>
                  <UsersRound />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p>{group.name}</p>
                <p className={cn(group.description ? '' : 'invisible')}>{group.description}</p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </section>
  );
}
