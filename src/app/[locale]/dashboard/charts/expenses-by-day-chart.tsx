import type { User } from '@prisma/client';
import { toZonedTime } from 'date-fns-tz';
import { BarChart } from '~/app/[locale]/dashboard/charts/chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type ExpensesByDayChartProps = {
  timezone: string;
  expenses: RouterOutputs['transactions']['personal']['period']['list'];
  shared: RouterOutputs['groups']['all']['expenses']['period']['list'];
  settlements: RouterOutputs['groups']['all']['settlements']['period']['list'];
  user: User;
  labels: number[];
};

export default async function ExpensesByDayChart({
  timezone,
  expenses,
  shared,
  settlements,
  labels,
  user,
}: ExpensesByDayChartProps) {
  const expensesByDay = new Map<number, number>();
  for (const expense of [...expenses, ...settlements]) {
    const day = toZonedTime(expense.date.getTime(), timezone).getDate();
    const current = expensesByDay.get(day) ?? 0;
    expensesByDay.set(day, current + expense.amount / 100);
  }

  for (const expense of shared) {
    const day = toZonedTime(expense.transaction.date.getTime(), timezone).getDate();
    const current = expensesByDay.get(day) ?? 0;
    const split = expense.TransactionSplit.filter((s) => s.user.id === user.id).reduce((acc, s) => acc + s.paid, 0);
    expensesByDay.set(day, current + split / 100);
  }

  return (
    <BarChart labels={labels} datasets={[{ label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]} />
  );
}
