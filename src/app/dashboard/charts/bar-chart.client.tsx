'use client';

import { Chart as ChartJS, BarElement, Tooltip, LinearScale, CategoryScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

type BarChartProps = Parameters<typeof Bar<number[], string | number>>[0]['data'];

export default function BarChart({ labels, datasets }: BarChartProps) {
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
