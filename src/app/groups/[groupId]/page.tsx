import { notFound } from 'next/navigation';
import GroupDetails from '~/app/groups/[groupId]/group-details';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId }).catch(() => null);
  if (!group) return notFound();

  return (
    <div className="flex flex-col">
      <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">{group.name}</h2>
      </header>
      <div className="mb-2 grid grid-cols-2 grid-rows-1 gap-2">
        <Button variant="outline">Register expense</Button>
        <Button variant="outline">Register settlement</Button>
      </div>
      <div className="grid grid-rows-2 gap-2 md:grid-cols-2 md:grid-rows-1">
        <GroupDetails group={group} />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
