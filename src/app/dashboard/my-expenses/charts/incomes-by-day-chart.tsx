import { eachDayOfInterval } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChartClient from '~/app/dashboard/my-expenses/charts/bar-chart-client';
import type { PersonalIncomeInPeriod } from '~/server/api/routers/personal-incomes';

export type IncomesByDayChartProps = {
  timezone: string;
  incomes: PersonalIncomeInPeriod[];
  start: Date;
  end: Date;
};

export default async function IncomesByDay({ timezone, incomes, start, end }: IncomesByDayChartProps) {
  const labels = eachDayOfInterval({ start, end })
    .map((date) => parseInt(formatInTimeZone(date, timezone, 'dd')))
    .sort((a, b) => a - b);

  const incomesByDay = new Map<number, number>();
  for (const income of incomes) {
    const day = parseInt(formatInTimeZone(income.date, timezone, 'dd'));
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
