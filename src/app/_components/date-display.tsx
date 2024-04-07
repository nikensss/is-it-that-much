import { formatDistanceToNowStrict, isBefore, isToday, isTomorrow, isYesterday, startOfDay } from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';

export type DateDisplayProps = {
  timezone: string | null | undefined;
  date: Date;
  distance?: 'newline' | 'inline';
};

export default function DateDisplay({ date, timezone, distance = 'inline' }: DateDisplayProps) {
  const formattedDate = formatInTimeZone(date, timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy');

  return (
    <span className="text-primary-600 dark:text-primary-300">
      {formattedDate} {distance === 'newline' ? <br /> : null}(
      <time dateTime={formattedDate}>{getDistanceTo(date, timezone ?? 'Europe/Amsterdam').toLowerCase()}</time>)
    </span>
  );
}

function getDistanceTo(date: Date, timezone: string) {
  const timezoned = utcToZonedTime(date.getTime(), timezone);
  if (isToday(timezoned)) {
    return 'today';
  }

  if (isYesterday(timezoned)) {
    return 'yesterday';
  }

  if (isTomorrow(timezoned)) {
    return 'tomorrow';
  }

  return formatDistanceToNowStrict(startOfDay(timezoned), {
    addSuffix: true,
    unit: 'day',
    roundingMethod: isBefore(date, Date.now()) ? 'floor' : 'ceil',
  });
}
