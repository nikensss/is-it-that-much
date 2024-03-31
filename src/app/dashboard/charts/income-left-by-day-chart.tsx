import { addDays, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import LineChart from '~/app/dashboard/charts/line-chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type IncomeLeftByDayProps = {
  timezone: string;
  incomes: RouterOutputs['transactions']['personal']['period'];
  expenses: RouterOutputs['transactions']['personal']['period'];
  from: Date;
  to: Date;
};

export default async function IncomeLeftByDay({ timezone, incomes, expenses, from, to }: IncomeLeftByDayProps) {
  const labels: number[] = [];
  for (let i = from; !isAfter(i, to); i = addDays(i, 1)) {
    labels.push(parseInt(formatInTimeZone(i, timezone, 'dd')));
  }

  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = parseInt(formatInTimeZone(expense.date, timezone, 'dd'));
    const current = expensesByDay.get(day) ?? 0;
    expensesByDay.set(day, current + expense.amount);
  }

  const incomesByDay = new Map<number, number>();
  for (const income of incomes) {
    const day = parseInt(formatInTimeZone(income.date, timezone, 'dd'));
    const current = incomesByDay.get(day) ?? 0;
    incomesByDay.set(day, current + income.amount);
  }

  const incomeLeftByDay = new Map<number, number>();
  let incomeLeft = 0;
  for (const label of labels) {
    incomeLeft += (incomesByDay.get(label) ?? 0) - (expensesByDay.get(label) ?? 0);
    incomeLeftByDay.set(label, incomeLeft);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const slate900 = fullConfig.theme.colors.slate[900];

  const lastDayWithTransactions = Math.max(...expensesByDay.keys(), ...incomesByDay.keys());

  return (
    <LineChart
      labels={labels}
      datasets={[
        {
          borderColor: slate900,
          backgroundColor: slate900,
          label: 'Incomes',
          data: labels.slice(0, lastDayWithTransactions).map((d) => (incomeLeftByDay.get(d) ?? 0) / 100),
        },
      ]}
    />
  );
}
