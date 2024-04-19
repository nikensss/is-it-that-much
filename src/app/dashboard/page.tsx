import { format } from 'date-fns';
import Link from 'next/link';
import { BlockBody } from '~/app/_components/block';
import Charts from '~/app/dashboard/charts/charts';
import DashboardRecentTrasnsactions from '~/app/dashboard/recent-transactions';
import DashboardRegisterPersonalExpense from '~/app/dashboard/register-transaction/register-personal-expense';
import DashboardRegisterPersonalIncome from '~/app/dashboard/register-transaction/register-personal-income';
import DashboardTotals from '~/app/dashboard/totals';
import { Button } from '~/components/ui/button';

export default function Dashboard({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const month = searchParams?.month ?? format(new Date(), 'LLLL');
  const year = searchParams?.year ?? format(new Date(), 'yyyy');

  return (
    <BlockBody className="flex grow flex-col gap-2">
      <section className="grid grid-cols-2 grid-rows-2 gap-2 lg:grid-cols-4 lg:grid-rows-1">
        <DashboardRegisterPersonalExpense />
        <DashboardRegisterPersonalIncome />
        <Button asChild variant="outline">
          <Link href="/dashboard/tags">Tags</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/file">From CSV file</Link>
        </Button>
      </section>
      <div className="grid gap-2 md:grid-cols-2">
        <DashboardTotals {...{ month, year }} />
        <Charts {...{ month, year }} />
      </div>
      <DashboardRecentTrasnsactions />
    </BlockBody>
  );
}

export const dynamic = 'force-dynamic';
