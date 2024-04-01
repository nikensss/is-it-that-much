import { utcToZonedTime } from 'date-fns-tz';
import BarChart from '~/app/dashboard/charts/bar-chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type IncomesByDayChartProps = {
  timezone: string;
  incomes: RouterOutputs['transactions']['personal']['period'];
  labels: number[];
};

export default async function IncomesByDay({ timezone, incomes, labels }: IncomesByDayChartProps) {
  const incomesByDay = new Map<number, number>();
  for (const income of incomes) {
    const day = utcToZonedTime(income.date.getTime(), timezone).getDate();
    const current = incomesByDay.get(day) ?? 0;
    incomesByDay.set(day, current + income.amount / 100);
  }

  return (
    <BarChart labels={labels} datasets={[{ label: 'Incomes', data: labels.map((d) => incomesByDay.get(d) ?? 0) }]} />
  );
}
