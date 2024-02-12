'use client';

import { Chart as ChartJS, BarElement, Tooltip, LinearScale, CategoryScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

type BarChartClientProps = Parameters<typeof Bar<number[], string>>[0]['data'];

export default function BarChartClient({ labels, datasets }: BarChartClientProps) {
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
      data={{ labels, datasets }}
    />
  );
}
