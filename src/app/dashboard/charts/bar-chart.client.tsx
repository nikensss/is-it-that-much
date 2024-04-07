'use client';

import { Chart as ChartJS, BarElement, Tooltip, LinearScale, CategoryScale } from 'chart.js';
import { useTheme } from 'next-themes';
import { Bar } from 'react-chartjs-2';
import tailwindConfig from 'tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

type BarChartProps = Parameters<typeof Bar<number[], string | number>>[0]['data'];

export default function BarChart({ labels, datasets }: BarChartProps) {
  const { theme } = useTheme();

  const fullConfig = resolveConfig(tailwindConfig);
  const color = fullConfig.theme.colors.primary[theme === 'light' ? 900 : 50];
  const gridColor = fullConfig.theme.colors.primary[theme === 'light' ? 200 : 400];

  return (
    <Bar
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
      data={{ labels, datasets: datasets.map((d) => ({ backgroundColor: color, ...d })) }}
    />
  );
}
