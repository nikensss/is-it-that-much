import { notFound } from 'next/navigation';
import GroupExpenseForm from '~/app/groups/[groupId]/expenses/new/group-expense.client';
import { api } from '~/trpc/server';

export default async function GroupExpenseOverview({ params }: { params: { groupId: string; expenseId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  const expense = await api.groups.expenses.get.query({ groupId: group.id, expenseId: params.expenseId });
  if (!expense) return notFound();

  return (
    <div className="flex grow flex-col">
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold capitalize">Edit expense</h2>
      </header>
      <GroupExpenseForm {...{ group, user, expense }} />
    </div>
  );
}
