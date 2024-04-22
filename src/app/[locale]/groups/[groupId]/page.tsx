import Link from 'next/link';
import { notFound } from 'next/navigation';
import GroupBalance from '~/app/[locale]/groups/[groupId]/group-balance';
import GroupDetails from '~/app/[locale]/groups/[groupId]/group-details';
import RecentGroupActivity from '~/app/[locale]/groups/[groupId]/group-activity';
import RegisterSettlement from '~/app/[locale]/groups/[groupId]/register-settlement.client';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';
import GroupCharts from '~/app/[locale]/groups/[groupId]/group-charts';
import { format } from 'date-fns';

export default async function GroupPage({
  params: { groupId },
  searchParams,
}: {
  params: { groupId: string };
  searchParams: Record<string, string | undefined>;
}) {
  const group = await api.groups.get.query({ groupId: groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  const balance = await api.groups.balance.query({ groupId: groupId });
  const expenses = await api.groups.expenses.recent.query({ groupId: groupId, take: Math.max(5, balance.length) });
  const settlements = await api.groups.settlements.recent.query({ groupId, take: Math.max(5, balance.length) });

  const month = searchParams?.month ?? format(new Date(), 'LLLL');
  const year = searchParams?.year ?? format(new Date(), 'yyyy');

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 lg:grid-cols-4 lg:grid-rows-1">
        <Button variant="outline" asChild>
          <Link href={`${groupId}/expenses/new`}>Register expense</Link>
        </Button>
        <RegisterSettlement {...{ group, user }}>
          <Button variant="outline" className="grow">
            Register settlement
          </Button>
        </RegisterSettlement>
        <Button variant="outline" asChild>
          <Link href={`${groupId}/expenses`}>Expenses</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`${groupId}/settlements`}>Settlements</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <GroupDetails {...{ group, user }} />
        <GroupCharts {...{ group, user, month, year }} />
      </div>
      <div className="flex grow flex-col gap-2 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <RecentGroupActivity {...{ expenses, settlements, user, group, amountToShow: Math.max(5, balance.length) }} />
        <GroupBalance {...{ group, balance, user }} />
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
