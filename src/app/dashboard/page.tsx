import { format } from 'date-fns';
import Link from 'next/link';
import Charts from '~/app/dashboard/charts/charts';
import DashboardRecentTrasnsactions from '~/app/dashboard/recent-transactions';
import DashboardRegisterPersonalExpense from '~/app/dashboard/register-transaction/register-personal-expense';
import DashboardRegisterPersonalIncome from '~/app/dashboard/register-transaction/register-personal-income';
import DashboardTotals from '~/app/dashboard/totals';
import { Button } from '~/components/ui/button';

export default async function Dashboard({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const month = searchParams?.month ?? format(new Date(), 'LLLL');
  const year = searchParams?.year ?? format(new Date(), 'yyyy');

  return (
    <main className="flex flex-1 flex-col gap-2 bg-white">
      <section className="grid grid-cols-2 gap-2">
        <DashboardRegisterPersonalExpense />
        <DashboardRegisterPersonalIncome />
      </section>
      <div className="grid gap-2 md:grid-cols-2">
        <DashboardTotals {...{ month, year }} />
        <Charts {...{ month, year }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/tags">Tags</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="#">Categories</Link>
        </Button>
      </div>
      <DashboardRecentTrasnsactions />
    </main>
  );
}

export const dynamic = 'force-dynamic';
