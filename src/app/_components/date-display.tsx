import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

export type DateProps = {
  date: Date;
};

export default function DateDisplay({ date }: DateProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <time dateTime={format(date, 'LLLL d, yyyy')}>{formatDistanceToNow(date, { addSuffix: true })}</time>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span>{format(date, 'LLLL d, yyyy')}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
