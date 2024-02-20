'use client';

import { useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { cn } from '~/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { zonedTimeToUtc } from 'date-fns-tz';

export type DateRangePickerProps = {
  timezone: string;
};

export default function DateRangePicker({ timezone }: DateRangePickerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const calendarTrigger = useRef<HTMLButtonElement>(null);

  const [period, setPeriod] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  function onClick() {
    const params = new URLSearchParams();
    if (period?.from) {
      const from = zonedTimeToUtc(format(period.from, 'yyyy-MM-dd'), timezone);
      params.set('from', from.toISOString());
    }

    if (period?.to) {
      const to = zonedTimeToUtc(format(addDays(period.to, 1), 'yyyy-MM-dd'), timezone);
      params.set('to', to.toISOString());
    }

    router.push(pathname + '?' + params.toString());
    calendarTrigger.current?.click();
  }

  return (
    <div className={'grid gap-2'}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={calendarTrigger}
            id="date"
            variant={'outline'}
            className={cn('w-[300px] justify-start text-left font-normal', !period && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {period?.from ? (
              period.to ? (
                <>
                  {format(period.from, 'LLL dd, y')} - {format(period.to, 'LLL dd, y')}
                </>
              ) : (
                format(period.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={period?.from}
            selected={period}
            onSelect={(p) => {
              setPeriod(p);
            }}
            numberOfMonths={2}
          />
          <div className="w-full p-2">
            <Button type="submit" className="w-full" onClick={onClick}>
              Update
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
