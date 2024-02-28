import Link from 'next/link';
import Charts from '~/app/dashboard/charts/charts';
import DashboardRecentTrasnsactions from '~/app/dashboard/recent-transactions';
import DashboardRegisterPersonalExpense from '~/app/dashboard/register-transaction/register-personal-expense';
import DashboardRegisterPersonalIncome from '~/app/dashboard/register-transaction/register-personal-income';
import DashboardTotals from '~/app/dashboard/totals';
import { Button } from '~/components/ui/button';

export default function MyExpenses() {
  return (
    <main className="flex-1 bg-slate-100 p-2">
      <section className="mb-2 flex justify-around rounded-md bg-white p-2 shadow-md">
        <DashboardRegisterPersonalExpense />
        <DashboardRegisterPersonalIncome />
      </section>
      <section className="my-2">
        <div className="grid gap-2 md:grid-cols-2">
          <DashboardTotals />
          <Charts />
        </div>
      </section>
      <section className="my-2 grid grid-cols-2 grid-rows-2 rounded-md bg-white p-2 shadow-md md:grid-cols-4 md:grid-rows-1">
        <Button asChild variant="outline" className="m-1">
          <Link href="/dashboard/expenses">Expenses</Link>
        </Button>
        <Button asChild variant="outline" className="m-1">
          <Link href="/dashboard/incomes">Incomes</Link>
        </Button>
        <Button asChild variant="outline" className="m-1">
          <Link href="/dashboard/tags">Tags</Link>
        </Button>
        <Button asChild variant="outline" className="m-1">
          <Link href="#">Categories</Link>
        </Button>
      </section>
      <section className="mt-2">
        <DashboardRecentTrasnsactions />
      </section>
    </main>
  );
}

export const dynamic = 'force-dynamic';
