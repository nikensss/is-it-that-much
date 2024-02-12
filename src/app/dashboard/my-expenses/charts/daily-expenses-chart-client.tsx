'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type DailyExpensesChartClientProps = Parameters<typeof Bar<number[], string>>[0]['data'];

export default function DailyExpensesChartClient({ labels, datasets }: DailyExpensesChartClientProps) {
  return (
    <Bar
      options={{
        scales: {
          y: {
            beginAtZero: true,
            grace: 10,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      height={window?.innerWidth > 1024 ? 200 : 300}
      data={{ labels, datasets }}
    />
  );
}
