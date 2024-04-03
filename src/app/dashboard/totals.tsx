import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockTitle } from '~/app/_components/block/block-title';
import MonthAndYearSelector from '~/app/dashboard/month-and-year-selector';
import { api } from '~/trpc/server';

export default async function DashboardTotals({ month, year }: { month: string; year: string }) {
  const user = await api.users.get.query();

  const timezone = user.timezone ?? 'Europe/Amsterdam';
  const time = parse(`${month}, ${year}`, 'LLLL, yyyy', Date.now());
  const date = zonedTimeToUtc(time, timezone);

  const [expenses, incomes] = await Promise.all([
    api.transactions.personal.totalAmountInMonth.query({ type: TransactionType.EXPENSE, date }),
    api.transactions.personal.totalAmountInMonth.query({ type: TransactionType.INCOME, date }),
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
      </BlockBody>
    </Block>
  );
}
