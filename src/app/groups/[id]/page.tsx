import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';

export default async function GroupPage({ params }: { params: { id: string } }) {
  const group = await api.groups.get.query({ id: params.id });

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div className="flex flex-col">
      <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">{group.name}</h2>
      </header>
      <div className="grid grid-cols-2 grid-rows-1 gap-2">
        <Button variant="outline">Register expense</Button>
        <Button variant="outline">Register settlement</Button>
      </div>
    </div>
  );
}