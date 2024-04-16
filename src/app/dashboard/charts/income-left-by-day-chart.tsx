import { isAfter, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { LineChart } from '~/app/dashboard/charts/chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type IncomeLeftByDayProps = {
  timezone: string;
  incomes: RouterOutputs['transactions']['personal']['period']['list'];
  expenses: RouterOutputs['transactions']['personal']['period']['list'];
  labels: number[];
};

export default async function IncomeLeftByDay({ timezone, incomes, expenses, labels }: IncomeLeftByDayProps) {
  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = toZonedTime(expense.date.getTime(), timezone).getDate();
    expensesByDay.set(day, (expensesByDay.get(day) ?? 0) + expense.amount);
  }

  const incomesByDay = new Map<number, number>();
  for (const income of incomes) {
    const day = toZonedTime(income.date, timezone).getDate();
    incomesByDay.set(day, (incomesByDay.get(day) ?? 0) + income.amount);
  }

  const incomeLeftByDay = new Map<number, number>();
  let incomeLeft = 0;
  for (const label of labels) {
    incomeLeft += (incomesByDay.get(label) ?? 0) - (expensesByDay.get(label) ?? 0);
    incomeLeftByDay.set(label, incomeLeft);
  }

  const now = startOfDay(toZonedTime(Date.now(), timezone));
  const mostRecentTransaction = [...expenses, ...incomes].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  const nowIsMostRecent = mostRecentTransaction
    ? isAfter(now, toZonedTime(mostRecentTransaction.date, timezone))
    : false;
  const lastDayWithTransactions = nowIsMostRecent
    ? Math.max(...labels)
    : Math.max(...expensesByDay.keys(), ...incomesByDay.keys());

  return (
    <LineChart
      labels={labels}
      datasets={[
        {
          label: 'Incomes',
          data: labels.slice(0, lastDayWithTransactions).map((d) => (incomeLeftByDay.get(d) ?? 0) / 100),
        },
      ]}
    />
  );
}
