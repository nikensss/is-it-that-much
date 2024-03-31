'use client';

import { format, parse } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';

export default function MonthAndYearSelector(input: { month: string; year: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const [month, setMonth] = useState(input.month);
  const [year, setYear] = useState(input.year);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="bg-primary-900 ml-2 w-36" variant="outline">
          {format(parse(`${month}, ${year}`, 'LLLL, yyyy', new Date()), 'MMMM, yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex select-none flex-col gap-1 p-1 shadow-lg">
        <YearSelector {...{ year, setYear }} />
        <MonthSelector {...{ month, setMonth }} />
        <Button
          onClick={() => {
            setIsOpen(false);
            const searchParams = new URLSearchParams();
            searchParams.set('month', month);
            searchParams.set('year', year);
            router.push(`${pathname}?${searchParams.toString()}`);
          }}
        >
          Update
        </Button>
      </PopoverContent>
    </Popover>
  );
}

type YearSelectorProps = {
  year: string;
  setYear: (year: string) => void;
};

function YearSelector({ year, setYear }: YearSelectorProps) {
  return (
    <div className="border-primary-200 flex items-center rounded-lg border shadow-lg">
      <div
        className="group flex grow items-center justify-center p-2 pr-0 hover:cursor-pointer"
        onClick={() => setYear(`${parseInt(year) - 1}`)}
      >
        <ChevronLeft size={24} className="transition md:group-hover:-translate-x-1" />
      </div>
      <div>{year}</div>
      <div
        className="group flex grow items-center justify-center p-2 pl-0 hover:cursor-pointer"
        onClick={() => setYear(`${parseInt(year) + 1}`)}
      >
        <ChevronRight size={24} className="transition md:group-hover:translate-x-1" />
      </div>
    </div>
  );
}

type MonthSelectorProps = {
  month: string;
  setMonth: (month: string) => void;
};
function MonthSelector({ month, setMonth }: MonthSelectorProps) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-1">
      {[...months].map((m, idx) => (
        <Button
          key={idx}
          onClick={() => {
            const selectedMonth = months[idx];
            if (selectedMonth) setMonth(selectedMonth);
          }}
          variant="outline"
          className={cn(
            'hover:bg-primary-900 hover:text-primary-100 shadow-md transition hover:shadow-lg',
            month === m ? 'bg-primary-100' : '',
          )}
        >
          {m}
        </Button>
      ))}
    </div>
  );
}
