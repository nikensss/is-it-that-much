import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { endOfMonth, parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { Block, BlockBody, BlockTitle } from '~/app/_components/block';
import MonthAndYearSelector from '~/app/_components/month-and-year-selector';
import { api } from '~/trpc/server';

export default async function DashboardTotals({ month, year }: { month: string; year: string }) {
  const user = await api.users.get.query();

  const timezone = user.timezone ?? 'Europe/Amsterdam';
  const time = parse(`${month}, ${year}`, 'LLLL, yyyy', Date.now());
  const from = fromZonedTime(time, timezone);
  const to = fromZonedTime(endOfMonth(time), timezone);

  const [expenses, incomes, sharedExpenses] = await Promise.all([
    api.transactions.personal.period.sum.query({ type: TransactionType.EXPENSE, from, to }),
    api.transactions.personal.period.sum.query({ type: TransactionType.INCOME, from, to }),
    api.groups.all.expenses.period.list.query({ from, to, onlyWhereUserPaid: true }),
  ]);

  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  const [totalExpenses, totalIncomes] = [expenses._sum?.amount ?? 0, incomes._sum?.amount ?? 0];

  return (
    <Block>
      <BlockTitle>
        Totals in <MonthAndYearSelector {...{ month, year }} />
      </BlockTitle>
      <BlockBody>
        <div className="grid items-start gap-4 md:gap-10">
          <div className="rounded-md border border-transparent bg-white p-4 shadow-md dark:border-primary-400 dark:bg-primary-600">
            <h2 className="mb-2 text-lg font-bold">Total Expenses</h2>
            <p className="text-2xl font-semibold">
              {currencySymbol}
              {totalExpenses / 100}
            </p>
          </div>
          <div className="rounded-md border border-transparent bg-white p-4 shadow-md dark:border-primary-400 dark:bg-primary-600">
            <h2 className="mb-2 text-lg font-bold">Total Incomes</h2>
            <p className="text-2xl font-semibold">
              {currencySymbol}
              {totalIncomes / 100}
            </p>
          </div>
          <div className="rounded-md border border-transparent bg-white p-4 shadow-md dark:border-primary-400 dark:bg-primary-600">
            <h2 className="mb-2 text-lg font-bold">Income left</h2>
            <p className="text-2xl font-semibold">
              {currencySymbol}
              {(totalIncomes - totalExpenses) / 100}
            </p>
          </div>
        </div>
      </BlockBody>
    </Block>
  );
}
