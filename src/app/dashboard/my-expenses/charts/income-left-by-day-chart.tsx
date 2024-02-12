import { eachDayOfInterval, getDate } from 'date-fns';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import LineChartClient from '~/app/dashboard/my-expenses/charts/line-chart-client';
import type { PersonalExpenseInPeriod } from '~/server/api/routers/personal-expenses';
import type { PersonalIncomeInPeriod } from '~/server/api/routers/personal-incomes';

export type IncomeLeftByDayProps = {
  incomes: PersonalIncomeInPeriod[];
  expenses: PersonalExpenseInPeriod[];
  start: Date;
  end: Date;
};

export default async function IncomeLeftByDay({ incomes, expenses, start, end }: IncomeLeftByDayProps) {
  const labels = eachDayOfInterval({ start, end })
    .map((date) => getDate(date))
    .sort((a, b) => a - b);

  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = getDate(expense.date);
    const current = expensesByDay.get(day) ?? 0;
    expensesByDay.set(day, current + expense.amount);
  }

  const incomesByDay = new Map<number, number>();
  for (const income of incomes) {
    const day = getDate(income.date);
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

  const lastDayWithExpenses = Math.max(...expensesByDay.keys());

  return (
    <LineChartClient
      labels={labels}
      datasets={[
        {
          borderColor: slate900,
          backgroundColor: slate900,
          label: 'Incomes',
          data: labels.slice(0, lastDayWithExpenses).map((d) => (incomeLeftByDay.get(d) ?? 0) / 100),
        },
      ]}
    />
  );
}
