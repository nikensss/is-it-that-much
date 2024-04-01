import BarChart from '~/app/dashboard/charts/bar-chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type ExpensesByTagChartProps = {
  expenses: RouterOutputs['transactions']['personal']['period'];
};

export default async function ExpensesByTagChart({ expenses }: ExpensesByTagChartProps) {
  const expensesPerTag = new Map<string, number>();
  for (const expense of expenses) {
    for (const { tag } of expense.TransactionsTags) {
      const current = expensesPerTag.get(tag.name) ?? 0;
      expensesPerTag.set(tag.name, current + expense.amount / 100);
    }
  }

  const entries = [...expensesPerTag.entries()].sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([tag]) => tag);

  return (
    <BarChart labels={labels} datasets={[{ label: 'Expenses', data: labels.map((d) => expensesPerTag.get(d) ?? 0) }]} />
  );
}
