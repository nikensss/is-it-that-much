import { getTimezoneOffset } from 'date-fns-tz';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import currencySymbolMap from 'currency-symbol-map/map';

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

export function displayTimezone(timezone: ReturnType<(typeof Intl)['supportedValuesOf']>[number]) {
  function timeZoneOffset(timezone: string): string {
    return timeOffsetToString(getTimezoneOffset(timezone));
  }

  function timeOffsetToString(offset_ms: number): string {
    const offset_s = offset_ms / 1_000;
    const hours = Math.abs(Math.floor(offset_s / (60 * 60)));
    const minutes = Math.abs(offset_s % 60);
    const sign = offset_ms >= 0 ? '+' : '-';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return `${timezone.replace(/_/g, ' ')} (${timeZoneOffset(timezone)})`;
}

export function displayCurrency(currency: string) {
  return `${currency} (${currencySymbolMap[currency]})`;
}
