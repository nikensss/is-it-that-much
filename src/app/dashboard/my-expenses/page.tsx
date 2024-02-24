import Link from 'next/link';
import Charts from '~/app/dashboard/my-expenses/charts/charts';
import DashboardRecentTrasnsactions from '~/app/dashboard/my-expenses/recent-transactions';
import DashboardRegisterPersonalExpense from '~/app/dashboard/my-expenses/register-transaction/register-personal-expense';
import DashboardRegisterPersonalIncome from '~/app/dashboard/my-expenses/register-transaction/register-personal-income';
import DashboardTotals from '~/app/dashboard/my-expenses/totals';
import { Button } from '~/components/ui/button';

export default function MyExpenses() {
  return (
    <main className="flex-1 bg-gray-100 p-2">
      <section className="mb-2 flex justify-around rounded-md bg-white p-4 shadow-md">
        <DashboardRegisterPersonalExpense />
        <DashboardRegisterPersonalIncome />
      </section>
      <section className="my-2">
        <div className="grid gap-2 md:grid-cols-2">
          <DashboardTotals />
          <Charts />
        </div>
      </section>
      <section className="my-2 grid grid-cols-2 grid-rows-2 rounded-md bg-white p-4 shadow-md md:grid-cols-4 md:grid-rows-1">
        <Button asChild variant="outline" className="m-1">
          <Link href="/dashboard/my-expenses/expenses">Expenses</Link>
        </Button>
        <Button asChild variant="outline" className="m-1">
          <Link href="/dashboard/my-expenses/incomes">Incomes</Link>
        </Button>
        <Button asChild variant="outline" className="m-1">
          <Link href="/dashboard/my-expenses/tags">Tags</Link>
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
