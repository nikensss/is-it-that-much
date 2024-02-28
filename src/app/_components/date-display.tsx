import { formatDistanceToNow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

export type DateDisplayProps = {
  timezone: string | null | undefined;
  date: Date;
};

export default function DateDisplay({ date, timezone }: DateDisplayProps) {
  const formattedDate = formatInTimeZone(date, timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy');

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <time dateTime={formattedDate}>{formatDistanceToNow(date, { addSuffix: true })}</time>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span>{formattedDate}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
