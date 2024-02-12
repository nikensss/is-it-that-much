import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChartClient from '~/app/dashboard/my-expenses/charts/bar-chart-client';
import type { PersonalExpenseInPeriod } from '~/server/api/routers/personal-expenses';

export type ExpensesByTagChartProps = {
  expenses: PersonalExpenseInPeriod[];
};

export default async function ExpensesByTagChart({ expenses }: ExpensesByTagChartProps) {
  const expensesPerTag = new Map<string, number>();
  for (const expense of expenses) {
    for (const { tag } of expense.ExpensesTags) {
      const current = expensesPerTag.get(tag.name) ?? 0;
      expensesPerTag.set(tag.name, current + expense.amount / 100);
    }
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  const entries = [...expensesPerTag.entries()].sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([tag]) => tag);

  return (
    <BarChartClient
      labels={labels}
      datasets={[{ backgroundColor, label: 'Expenses', data: labels.map((d) => expensesPerTag.get(d) ?? 0) }]}
    />
  );
}
