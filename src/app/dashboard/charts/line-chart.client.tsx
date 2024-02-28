'use client';

import { Chart as ChartJS, PointElement, LineElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, Tooltip);

type LineChartProps = Parameters<typeof Line<number[], string | number>>[0]['data'];

export default function LineChart({ labels, datasets }: LineChartProps) {
  return (
    <Line
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
