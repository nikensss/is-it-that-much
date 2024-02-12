import { eachDayOfInterval, getDate } from 'date-fns';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import ChartClient from '~/app/dashboard/my-expenses/charts/chart-client';
import type { PersonalExpensePeriod } from '~/server/api/routers/personal-expenses';

export type DailyExpensesChartProps = {
  expenses: PersonalExpensePeriod[];
  start: Date;
  end: Date;
};

export default async function ExpensesByDayChart({ expenses, start, end }: DailyExpensesChartProps) {
  const dateToLabel = (date: Date) => `${getDate(date)}`;
  const labels = eachDayOfInterval({ start, end }).map((date) => `${dateToLabel(date)}`);

  const expensesByDay = new Map<string, number>();
  for (const expense of expenses) {
    const day = `${dateToLabel(expense.date)}`;
    expensesByDay.set(day, expensesByDay.get(day) ?? 0 + expense.amount / 100);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  return (
    <ChartClient
      labels={labels}
      datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]}
    />
  );
}
