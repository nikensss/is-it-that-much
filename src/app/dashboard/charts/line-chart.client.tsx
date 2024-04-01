'use client';

import { Chart as ChartJS, PointElement, LineElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import tailwindConfig from 'tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';

ChartJS.register(LineElement, PointElement, Tooltip);

type LineChartProps = Parameters<typeof Line<number[], string | number>>[0]['data'];

export default function LineChart({ labels, datasets }: LineChartProps) {
  const fullConfig = resolveConfig(tailwindConfig);
  const primary900 = fullConfig.theme.colors.primary[900];

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
      data={{ labels, datasets: datasets.map((d) => ({ borderColor: primary900, backgroundColor: primary900, ...d })) }}
    />
  );
}
