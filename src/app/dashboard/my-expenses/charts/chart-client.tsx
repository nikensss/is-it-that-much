'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ChartClientProps = Parameters<typeof Bar<number[], string>>[0]['data'];

export default function ChartClient({ labels, datasets }: ChartClientProps) {
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
