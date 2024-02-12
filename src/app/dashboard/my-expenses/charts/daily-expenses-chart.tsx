import { eachDayOfInterval, endOfMonth, format, getDate, startOfMonth } from 'date-fns';
import { api } from '~/trpc/server';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import DailyExpensesChartClient from '~/app/dashboard/my-expenses/charts/daily-expenses-chart-client';

export default async function DailyExpensesChart() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const dateToLabel = (date: Date) => `${getDate(date)}`;
  const labels = eachDayOfInterval({ start, end }).map((date) => `${dateToLabel(date)}`);

  const expenses = await api.personalExpenses.period.query({ start, end });
  const expensesByDay = new Map<string, number>();
  for (const expense of expenses) {
    const day = `${dateToLabel(expense.date)}`;
    expensesByDay.set(day, expensesByDay.get(day) ?? 0 + expense.amount / 100);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  return (
    <>
      <h2 className="mb-2 text-center text-lg font-bold">{`Expenses by day in ${format(now, 'MMMM')}`}</h2>
      <DailyExpensesChartClient
        labels={labels}
        datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]}
      />
    </>
  );
}
