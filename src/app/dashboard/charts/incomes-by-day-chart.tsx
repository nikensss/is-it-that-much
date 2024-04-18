import { toZonedTime } from 'date-fns-tz';
import { BarChart } from '~/app/dashboard/charts/chart.client';
import type { RouterOutputs } from '~/trpc/shared';

export type IncomesByDayChartProps = {
  timezone: string;
  incomes: RouterOutputs['transactions']['personal']['period']['list'];
  settlements: RouterOutputs['groups']['all']['settlements']['period']['list'];
  labels: number[];
};

export default async function IncomesByDay({ timezone, incomes, settlements, labels }: IncomesByDayChartProps) {
  const incomesByDay = new Map<number, number>();
  for (const income of [...incomes, ...settlements]) {
    const day = toZonedTime(income.date.getTime(), timezone).getDate();
    const current = incomesByDay.get(day) ?? 0;
    incomesByDay.set(day, current + income.amount / 100);
  }

  return (
    <BarChart labels={labels} datasets={[{ label: 'Incomes', data: labels.map((d) => incomesByDay.get(d) ?? 0) }]} />
  );
}
