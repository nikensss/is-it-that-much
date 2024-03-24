import Link from 'next/link';
import { notFound } from 'next/navigation';
import GroupBalance from '~/app/groups/[groupId]/group-balance';
import GroupDetails from '~/app/groups/[groupId]/group-details';
import RecentGroupActivity from '~/app/groups/[groupId]/group-activity';
import RegisterSettlement from '~/app/groups/[groupId]/register-settlement.client';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';

export default async function GroupPage({ params: { groupId } }: { params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  const balance = await api.groups.balance.query({ groupId });
  const expenses = await api.groups.expenses.recent.query({ groupId });
  const settlements = await api.groups.settlements.recent.query({ groupId });

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-1 gap-2">
        <Button variant="outline" asChild>
          <Link href={`${groupId}/expenses/new`}>Register expense</Link>
        </Button>
        <RegisterSettlement {...{ group, user }} />
      </div>
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <GroupDetails {...{ group, user }} />
      </div>
      <div className="grid grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
        <Button variant="outline" asChild>
          <Link href={`${groupId}/expenses`}>Expenses</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`${groupId}/settlements`}>Settlements</Link>
        </Button>
      </div>
      <div className="flex grow flex-col gap-2 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <RecentGroupActivity {...{ expenses, settlements, user, groupId }} />
        <GroupBalance {...{ balance, user }} />
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
