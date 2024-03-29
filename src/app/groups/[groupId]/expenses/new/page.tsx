import { notFound } from 'next/navigation';
import GroupExpenseForm from '~/app/groups/[groupId]/expenses/new/group-expense.client';
import { api } from '~/trpc/server';

export default async function GroupExpense({ params }: { params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId });
  if (!group) return notFound();

  const user = await api.users.get.query();

  return (
    <div className="flex grow flex-col">
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold capitalize">New expense</h2>
      </header>
      <GroupExpenseForm {...{ group, user }} />
    </div>
  );
}
