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

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <main className="flex-1 bg-white">
      <section className="mb-2 grid grid-cols-2 gap-2">
        <DashboardRegisterPersonalExpense />
        <DashboardRegisterPersonalIncome />
      </section>
      <section className="mb-2">
        <div className="grid gap-2 md:grid-cols-2">
          <DashboardTotals {...{ month, year }} />
          <Charts {...{ month, year }} />
        </div>
      </section>
      <section className="mb-2 grid grid-cols-2 grid-rows-2 gap-2 md:grid-cols-4 md:grid-rows-1">
        <Button asChild variant="outline">
          <Link href="/dashboard/expenses">Expenses</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/incomes">Incomes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/tags">Tags</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="#">Categories</Link>
        </Button>
      </section>
      <section>
        <DashboardRecentTrasnsactions />
      </section>
    </main>
  );
}

export const dynamic = 'force-dynamic';
