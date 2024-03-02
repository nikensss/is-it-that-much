import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { parse } from 'date-fns';
import MonthSelector from '~/app/dashboard/month-selector';
import { api } from '~/trpc/server';

export default async function DashboardTotals({ month }: { month: string }) {
  const [expenses, incomes, user] = await Promise.all([
    api.transactions.personal.totalAmountInMonth.query({
      type: TransactionType.EXPENSE,
      date: parse(month, 'LLLL', new Date()),
    }),
    api.transactions.personal.totalAmountInMonth.query({
      type: TransactionType.INCOME,
      date: parse(month, 'LLLL', new Date()),
    }),
    api.users.get.query(),
  ]);
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  const [totalExpenses, totalIncomes] = [expenses._sum?.amount ?? 0, incomes._sum?.amount ?? 0];

  return (
    <section className="rounded-md bg-white p-4 shadow-md">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="flex items-center justify-center text-lg font-bold text-slate-200">
          <p>Totals in</p> {<MonthSelector month={month} />}
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
