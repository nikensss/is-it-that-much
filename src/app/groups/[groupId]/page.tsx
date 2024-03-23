import Link from 'next/link';
import { notFound } from 'next/navigation';
import GroupBalance from '~/app/groups/[groupId]/group-balance';
import GroupDetails from '~/app/groups/[groupId]/group-details';
import GroupExpenses from '~/app/groups/[groupId]/group-expenses';
import RegisterSettlement from '~/app/groups/[groupId]/register-settlement.client';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  const balance = await api.groups.balance.query({ groupId: params.groupId });
  const transactions = await api.groups.expenses.recent.query({ groupId: group.id });

  return (
    <div className="flex grow flex-col gap-2">
      <header className="flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">{group.name}</h2>
      </header>
      <div className="grid grid-cols-2 grid-rows-1 gap-2">
        <Button variant="outline" asChild>
          <Link href={`${params.groupId}/expenses/new`}>Register expense</Link>
        </Button>
        <RegisterSettlement {...{ group, user }} />
      </div>
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <GroupDetails {...{ group, user }} />
      </div>
      <div className="flex grow flex-col gap-2 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <GroupExpenses {...{ transactions, user, groupId: params.groupId }} />
        <GroupBalance {...{ balance, user }} />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
