import { addDays, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '~/../tailwind.config';
import BarChartClient from '~/app/dashboard/my-expenses/charts/bar-chart-client';
import type { RouterOutputs } from '~/trpc/shared';

export type IncomesByDayChartProps = {
  timezone: string;
  incomes: RouterOutputs['personalTransactions']['period'];
  from: Date;
  to: Date;
};

export default async function IncomesByDay({ timezone, incomes, from, to }: IncomesByDayChartProps) {
  const labels: number[] = [];
  for (let i = from; !isAfter(i, to); i = addDays(i, 1)) {
    labels.push(parseInt(formatInTimeZone(i, timezone, 'dd')));
  }

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
