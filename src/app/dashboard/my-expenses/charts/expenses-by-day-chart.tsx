import { addDays, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChartClient from '~/app/dashboard/my-expenses/charts/bar-chart-client';
import type { PersonalExpenseInPeriod } from '~/server/api/routers/personal-expenses';

export type ExpensesByDayChartProps = {
  timezone: string;
  expenses: PersonalExpenseInPeriod[];
  start: Date;
  end: Date;
};

export default async function ExpensesByDayChart({ timezone, expenses, start, end }: ExpensesByDayChartProps) {
  const labels: number[] = [];
  for (let i = start; !isAfter(i, end); i = addDays(i, 1)) {
    labels.push(parseInt(formatInTimeZone(i, timezone, 'dd')));
  }

  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = parseInt(formatInTimeZone(expense.date, timezone, 'dd'));
    const current = expensesByDay.get(day) ?? 0;
    expensesByDay.set(day, current + expense.amount / 100);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  return (
    <BarChartClient
      labels={labels}
      datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]}
    />
  );
}
