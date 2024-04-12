import { toZonedTime } from 'date-fns-tz';
import { BarChart } from '~/app/dashboard/charts/chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type ExpensesByDayChartProps = {
  timezone: string;
  expenses: RouterOutputs['transactions']['personal']['period'];
  labels: number[];
};

export default async function ExpensesByDayChart({ timezone, expenses, labels }: ExpensesByDayChartProps) {
  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = toZonedTime(expense.date.getTime(), timezone).getDate();
    const current = expensesByDay.get(day) ?? 0;
    expensesByDay.set(day, current + expense.amount / 100);
  }

  return (
    <BarChart labels={labels} datasets={[{ label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]} />
  );
}
