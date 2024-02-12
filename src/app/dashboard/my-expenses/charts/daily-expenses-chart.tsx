import { eachDayOfInterval, endOfMonth, format, getDate, startOfMonth } from 'date-fns';
import { api } from '~/trpc/server';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import DailyExpensesChartClient from '~/app/dashboard/my-expenses/charts/daily-expenses-chart-client';

export default async function DailyExpensesChart() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const dateToLabel = (date: Date) => `${format(date, 'MMM do')}`;
  const labels = eachDayOfInterval({ start, end }).map((date) => `${dateToLabel(date)}`);

  const expenses = await api.personalExpenses.period.query({ start, end });
  const expensesByDay: Map<string, number> = expenses.reduce<Map<string, number>>((acc, expense) => {
    const day = `${dateToLabel(expense.date)}`;
    return acc.set(day, acc.get(day) ?? 0 + expense.amount / 100);
  }, new Map());

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];
  console.log(fullConfig.theme.width);

  return (
    <>
      <h2 className="mb-2 text-center text-lg font-bold">Expenses by day</h2>
      <DailyExpensesChartClient
        labels={labels}
        datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesByDay.get(d) ?? 0) }]}
      />
    </>
  );
}
