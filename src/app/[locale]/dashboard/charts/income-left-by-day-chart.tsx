import type { User } from '@prisma/client';
import { isAfter, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { LineChart } from '~/app/[locale]/dashboard/charts/chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type IncomeLeftByDayProps = {
  timezone: string;
  expenses: RouterOutputs['transactions']['personal']['period']['list'];
  shared: RouterOutputs['groups']['all']['expenses']['period']['list'];
  sentSettlements: RouterOutputs['groups']['all']['settlements']['period']['list'];
  incomes: RouterOutputs['transactions']['personal']['period']['list'];
  receivedSettlements: RouterOutputs['groups']['all']['settlements']['period']['list'];
  user: User;
  labels: number[];
};

export default async function IncomeLeftByDay({
  timezone,
  expenses,
  shared,
  sentSettlements,
  incomes,
  receivedSettlements,
  user,
  labels,
}: IncomeLeftByDayProps) {
  const dates = new Set<number>();
  const expensesByDay = new Map<number, number>();
  for (const expense of [...expenses, ...sentSettlements]) {
    const day = toZonedTime(expense.date.getTime(), timezone).getDate();
    dates.add(expense.date.getTime());
    expensesByDay.set(day, (expensesByDay.get(day) ?? 0) + expense.amount);
  }

  for (const expense of shared) {
    const day = toZonedTime(expense.transaction.date.getTime(), timezone).getDate();
    dates.add(expense.transaction.date.getTime());
    const split = expense.TransactionSplit.filter((s) => s.user.id === user.id).reduce((acc, s) => acc + s.paid, 0);
    expensesByDay.set(day, (expensesByDay.get(day) ?? 0) + split);
  }

  const incomesByDay = new Map<number, number>();
  for (const income of [...incomes, ...receivedSettlements]) {
    const day = toZonedTime(income.date, timezone).getDate();
    dates.add(income.date.getTime());
    incomesByDay.set(day, (incomesByDay.get(day) ?? 0) + income.amount);
  }

  const incomeLeftByDay = new Map<number, number>();
  let incomeLeft = 0;
  for (const label of labels) {
    incomeLeft += (incomesByDay.get(label) ?? 0) - (expensesByDay.get(label) ?? 0);
    incomeLeftByDay.set(label, incomeLeft);
  }

  const now = startOfDay(toZonedTime(Date.now(), timezone));
  const mostRecentTransaction = Math.max(...dates);
  const nowIsMostRecent = mostRecentTransaction ? isAfter(now, toZonedTime(mostRecentTransaction, timezone)) : false;
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
