import { addDays, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChart from '~/app/dashboard/charts/bar-chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type ExpensesByDayChartProps = {
  timezone: string;
  expenses: RouterOutputs['transactions']['personal']['period'];
  from: Date;
  to: Date;
};

export default async function ExpensesByDayChart({ timezone, expenses, from, to }: ExpensesByDayChartProps) {
  const labels: number[] = [];
  for (let i = from; !isAfter(i, to); i = addDays(i, 1)) {
    labels.push(parseInt(formatInTimeZone(i, timezone, 'dd')));
  }

  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = parseInt(formatInTimeZone(expense.date, timezone, 'dd'));
    const current = expensesByDay.get(day) ?? 0;
    expensesByDay.set(day, current + expense.amount / 100);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.primary[900];

  return (
    <BarChart
      labels={labels}
      datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]}
    />
  );
}
