import { formatDistanceToNowStrict, isBefore, isToday, isTomorrow, isYesterday, startOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export type DateDisplayProps = {
  timezone: string | null | undefined;
  date: Date;
};

export default function DateDisplay({ date, timezone }: DateDisplayProps) {
  const formattedDate = formatInTimeZone(date, timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy');

  return (
    <>
      {formattedDate} (<time dateTime={formattedDate}>{getDistanceTo(date).toLowerCase()}</time>)
    </>
  );
}

function getDistanceTo(date: Date) {
  if (isToday(date)) {
    return 'today';
  }

  if (isYesterday(date)) {
    return 'yesterday';
  }

  if (isTomorrow(date)) {
    return 'tomorrow';
  }

  return formatDistanceToNowStrict(startOfDay(date), {
    addSuffix: true,
    unit: 'day',
    roundingMethod: isBefore(date, Date.now()) ? 'floor' : 'ceil',
  });
}
