import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import DailyExpensesChartClient from '~/app/dashboard/my-expenses/charts/daily-expenses-chart-client';
import type { PersonalExpensePeriod } from '~/server/api/routers/personal-expenses';

export type DailyExpensesChartProps = {
  expenses: PersonalExpensePeriod[];
};

export default async function ExpensesByTagsChart({ expenses }: DailyExpensesChartProps) {
  const expensesPerTag = new Map<string, number>();
  for (const expense of expenses) {
    for (const { tag } of expense.ExpensesTags) {
      expensesPerTag.set(tag.name, expensesPerTag.get(tag.name) ?? 0 + expense.amount / 100);
    }
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  const entries = [...expensesPerTag.entries()].sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([tag]) => tag);

  return (
    <DailyExpensesChartClient
      labels={labels}
      datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesPerTag.get(d) ?? 0) }]}
    />
  );
}
