'use client';

import { useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { addDays, subMilliseconds, endOfMonth, format, startOfMonth } from 'date-fns';
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
      const to = subMilliseconds(zonedTimeToUtc(format(addDays(period.to, 1), 'yyyy-MM-dd'), timezone), 1);
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
            className={cn(
              'w-full justify-center gap-2 text-left font-normal shadow-slate-400',
              !period && 'text-muted-foreground',
            )}
          >
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
            <CalendarIcon className="h-4 w-4" />
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
            numberOfMonths={1}
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
