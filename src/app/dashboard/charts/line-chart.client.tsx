'use client';

import { Chart as ChartJS, PointElement, LineElement, Tooltip } from 'chart.js';
import { useTheme } from 'next-themes';
import { Line } from 'react-chartjs-2';
import tailwindConfig from 'tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';

ChartJS.register(LineElement, PointElement, Tooltip);

type LineChartProps = Parameters<typeof Line<number[], string | number>>[0]['data'];

export default function LineChart({ labels, datasets }: LineChartProps) {
  const { theme } = useTheme();

  const fullConfig = resolveConfig(tailwindConfig);
  const color = fullConfig.theme.colors.primary[theme === 'light' ? 900 : 50];
  const gridColor = fullConfig.theme.colors.primary[theme === 'light' ? 200 : 400];

  return (
    <Line
      options={{
        scales: {
          y: {
            beginAtZero: true,
            grace: 10,
            ticks: {
              color,
            },
            grid: {
              color: gridColor,
            },
          },
          x: {
            ticks: {
              color: color,
            },
            grid: {
              color: gridColor,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{ labels, datasets: datasets.map((d) => ({ borderColor: color, backgroundColor: color, ...d })) }}
    />
  );
}
