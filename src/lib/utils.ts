import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('array is empty');
  }

  const el = arr[Math.floor(Math.random() * arr.length)];
  if (!el) {
    throw new Error('found undefined');
  }

  return el;
}
