import { eachDayOfInterval, getDate } from 'date-fns';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChartClient from '~/app/dashboard/my-expenses/charts/bar-chart-client';
import type { PersonalExpenseInPeriod } from '~/server/api/routers/personal-expenses';

export type ExpensesByDayChartProps = {
  expenses: PersonalExpenseInPeriod[];
  start: Date;
  end: Date;
};

export default async function ExpensesByDayChart({ expenses, start, end }: ExpensesByDayChartProps) {
  const labels = eachDayOfInterval({ start, end }).map((date) => getDate(date));

  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = getDate(expense.date);
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
