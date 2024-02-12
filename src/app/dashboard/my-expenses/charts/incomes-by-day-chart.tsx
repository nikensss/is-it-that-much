import { eachDayOfInterval, getDate } from 'date-fns';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChartClient from '~/app/dashboard/my-expenses/charts/bar-chart-client';
import type { PersonalIncomeInPeriod } from '~/server/api/routers/personal-incomes';

export type IncomesByDayChartProps = {
  incomes: PersonalIncomeInPeriod[];
  start: Date;
  end: Date;
};

export default async function IncomesByDay({ incomes, start, end }: IncomesByDayChartProps) {
  const dateToLabel = (date: Date) => `${getDate(date)}`;
  const labels = eachDayOfInterval({ start, end }).map((date) => `${dateToLabel(date)}`);

  const incomesByDay = new Map<string, number>();
  for (const income of incomes) {
    const day = `${dateToLabel(income.date)}`;
    const current = incomesByDay.get(day) ?? 0;
    incomesByDay.set(day, current + income.amount / 100);
  }

  const fullConfig = resolveConfig(tailwindConfig);
  const backgroundColor = fullConfig.theme.colors.slate[900];

  return (
    <BarChartClient
      labels={labels}
      datasets={[{ backgroundColor, label: 'Incomes', data: labels.map((d) => incomesByDay.get(d) ?? 0) }]}
    />
  );
}
