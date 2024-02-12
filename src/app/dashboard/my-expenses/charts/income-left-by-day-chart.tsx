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
  const dateToLabel = (date: Date) => getDate(date);
  const labels = eachDayOfInterval({ start, end })
    .map((date) => dateToLabel(date))
    .sort((a, b) => a - b);

  const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);

  const expensesByDay = new Map<number, number>();
  for (const expense of expenses) {
    const day = dateToLabel(expense.date);
    expensesByDay.set(day, expensesByDay.get(day) ?? 0 + expense.amount);
  }

  const incomeLeftByDay = new Map<number, number>();
  let incomeLeft = totalIncome;
  for (const label of labels) {
    incomeLeft -= expensesByDay.get(label) ?? 0;
    incomeLeftByDay.set(label, incomeLeft);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  const lastDayWithExpenses = Math.max(...expensesByDay.keys());

  return (
    <LineChartClient
      labels={labels}
      datasets={[
        {
          borderColor: backgroundColor,
          backgroundColor,
          label: 'Incomes',
          data: labels.slice(0, lastDayWithExpenses).map((d) => (incomeLeftByDay.get(d) ?? 0) / 100),
        },
      ]}
    />
  );
}
