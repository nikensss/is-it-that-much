import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { parse } from 'date-fns';
import MonthAndYearSelector from '~/app/dashboard/month-and-year-selector';
import { api } from '~/trpc/server';

export default async function DashboardTotals({ month, year }: { month: string; year: string }) {
  const date = parse(`${month}, ${year}`, 'LLLL, yyyy', new Date());

  const [expenses, incomes, user] = await Promise.all([
    api.transactions.personal.totalAmountInMonth.query({ type: TransactionType.EXPENSE, date }),
    api.transactions.personal.totalAmountInMonth.query({ type: TransactionType.INCOME, date }),
    api.users.get.query(),
  ]);
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  const [totalExpenses, totalIncomes] = [expenses._sum?.amount ?? 0, incomes._sum?.amount ?? 0];

  return (
    <section className="rounded-md bg-white p-4 shadow-md">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="flex items-center justify-center text-lg font-bold text-slate-200">
          Totals in <MonthAndYearSelector {...{ month, year }} />
        </h2>
      </header>
      <div className="grid items-start gap-4 md:gap-10">
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Total Expenses</h2>
          <p className="text-2xl font-semibold">
            {currencySymbol}
            {totalExpenses / 100}
          </p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Total Incomes</h2>
          <p className="text-2xl font-semibold">
            {currencySymbol}
            {totalIncomes / 100}
          </p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Income left</h2>
          <p className="text-2xl font-semibold">
            {currencySymbol}
            {(totalIncomes - totalExpenses) / 100}
          </p>
        </div>
      </div>
    </section>
  );
}
