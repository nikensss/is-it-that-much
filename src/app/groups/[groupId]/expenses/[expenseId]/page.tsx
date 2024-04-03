import { notFound } from 'next/navigation';
import { BlockBody, BlockTitle } from '~/app/_components/block';
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
    <BlockBody className="flex grow flex-col">
      <BlockTitle>Edit expense</BlockTitle>
      <BlockBody>
        <GroupExpenseForm {...{ group, user, expense }} />
      </BlockBody>
    </BlockBody>
  );
}
