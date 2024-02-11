import { format } from 'date-fns';
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
          <time dateTime={localised}>{format(localised, 'LLLL d, yyyy')}</time>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span>{date.toString()}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
