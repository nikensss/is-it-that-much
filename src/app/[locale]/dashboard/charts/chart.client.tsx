'use client';

import { useTheme } from 'next-themes';
import { Bar, Line } from 'react-chartjs-2';
import tailwindConfig from 'tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
import { BarElement, CategoryScale, Chart as ChartJS, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';

ChartJS.register(LineElement, PointElement, Tooltip);
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export type BarChartProps = Parameters<typeof Bar<number[], string | number>>[0]['data'];
export type LineChartProps = Parameters<typeof Line<number[], string | number>>[0]['data'];

export type ChartProps = (BarChartProps & { type: 'bar' }) | (LineChartProps & { type: 'line' });

export default function Chart({ labels, datasets, type }: ChartProps) {
  const { theme } = useTheme();

  const fullConfig = resolveConfig(tailwindConfig);
  const color = fullConfig.theme.colors.primary[theme === 'dark' ? 200 : 500];

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        grace: 10,
        ticks: { color },
        grid: { color },
        border: { color },
      },
      x: {
        ticks: { color },
        grid: { color },
        border: { color },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  if (type === 'bar') {
    const data = { labels, datasets: datasets.map((d) => ({ borderColor: color, backgroundColor: color, ...d })) };
    return <Bar options={options} data={data} />;
  }

  if (type === 'line') {
    const data = { labels, datasets: datasets.map((d) => ({ borderColor: color, backgroundColor: color, ...d })) };
    return <Line options={options} data={data} />;
  }
}

export function BarChart({ labels, datasets }: BarChartProps) {
  return <Chart {...{ labels, datasets, type: 'bar' }} />;
}

export function LineChart({ labels, datasets }: LineChartProps) {
  return <Chart {...{ labels, datasets, type: 'line' }} />;
}
