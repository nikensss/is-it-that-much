import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

export type DateProps = {
  date: Date;
};

export default function DateDisplay({ date }: DateProps) {
  const localised = date.toLocaleDateString();
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <time dateTime={localised}>{formatDistanceToNow(localised, { addSuffix: true })}</time>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span>{format(localised, 'LLLL d, yyyy')}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
