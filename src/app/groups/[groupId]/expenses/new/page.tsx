import { notFound } from 'next/navigation';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import GroupExpenseForm from '~/app/groups/[groupId]/expenses/new/group-expense.client';
import { api } from '~/trpc/server';

export default async function GroupExpense({ params }: { params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId });
  if (!group) return notFound();

  const user = await api.users.get.query();

  return (
    <BlockBody className="flex grow flex-col">
      <BlockTitle>New expense</BlockTitle>
      <BlockBody>
        <GroupExpenseForm {...{ group, user }} />
      </BlockBody>
    </BlockBody>
  );
}
