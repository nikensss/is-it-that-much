import type { User } from '@prisma/client';
import { BarChart } from '~/app/[locale]/dashboard/charts/chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type ExpensesByTagChartProps = {
  expenses: RouterOutputs['transactions']['personal']['period']['list'];
  shared: RouterOutputs['groups']['all']['expenses']['period']['list'];
  settlements: RouterOutputs['groups']['all']['settlements']['period']['list'];
  user: User;
};

export default async function ExpensesByTagChart({ expenses, shared, settlements, user }: ExpensesByTagChartProps) {
  const expensesPerTag = new Map<string, number>();

  for (const expense of expenses) {
    for (const { tag } of expense.TransactionsTags) {
      const current = expensesPerTag.get(tag.name) ?? 0;
      expensesPerTag.set(tag.name, current + expense.amount / 100);
    }
  }

  for (const expense of shared) {
    const sharedTag = `${expense.group.name} (expenses)`;
    const current = expensesPerTag.get(sharedTag) ?? 0;
    const split = expense.TransactionSplit.filter((s) => s.user.id === user.id).reduce((acc, s) => acc + s.paid, 0);
    expensesPerTag.set(sharedTag, current + split / 100);
  }

  for (const settlement of settlements) {
    const settlementsTag = `${settlement.group.name} (settlements)`;
    const current = expensesPerTag.get(settlementsTag) ?? 0;
    expensesPerTag.set(settlementsTag, current + settlement.amount / 100);
  }

  const entries = [...expensesPerTag.entries()].sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([tag]) => tag);

  return (
    <BarChart labels={labels} datasets={[{ label: 'Expenses', data: labels.map((d) => expensesPerTag.get(d) ?? 0) }]} />
  );
}
