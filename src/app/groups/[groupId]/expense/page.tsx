import { notFound } from 'next/navigation';
import GroupExpenseForm from '~/app/groups/[groupId]/expense/group-expense.client';
import { api } from '~/trpc/server';

export default async function GroupExpense({ params }: { params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId });
  if (!group) return notFound();

  const user = await api.users.get.query();

  return (
    <div className="flex grow flex-col">
      <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">{group.name} - New expense</h2>
      </header>

      <GroupExpenseForm {...{ group, user }} />
    </div>
  );
}
