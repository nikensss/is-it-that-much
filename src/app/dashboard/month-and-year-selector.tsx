'use client';

import { format, parse } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';

export default function MonthAndYearSelector({ month, year }: { month: string; year: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="ml-2 w-36 bg-slate-900" variant="outline">
          {format(parse(`${month}, ${year}`, 'LLLL, yyyy', new Date()), 'MMMM, yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex select-none flex-col gap-1 p-1 shadow-lg">
        <YearSelector {...{ month, year, router, pathname }} />
        <MonthSelector onClick={() => setIsOpen(false)} {...{ month, year, router, pathname }} />
      </PopoverContent>
    </Popover>
  );
}

function YearSelector({
  month,
  year,
  router,
  pathname,
}: {
  month: string;
  year: string;
  router: AppRouterInstance;
  pathname: string;
}) {
  return (
    <div className="flex items-center rounded-lg border border-slate-200 shadow-lg">
      <div
        className="group flex grow items-center justify-center p-2 pr-0 hover:cursor-pointer"
        onClick={() => {
          const params = new URLSearchParams();
          params.set('year', `${parseInt(year) - 1}`);
          params.set('month', month);
          router.push(pathname + '?' + params.toString());
        }}
      >
        <ChevronLeft size={24} className="transition md:group-hover:-translate-x-1" />
      </div>
      <div>{year}</div>
      <div
        className="group flex grow items-center justify-center p-2 pl-0 hover:cursor-pointer"
        onClick={() => {
          const params = new URLSearchParams();
          params.set('year', `${parseInt(year) + 1}`);
          params.set('month', month);
          router.push(pathname + '?' + params.toString());
        }}
      >
        <ChevronRight size={24} className="transition md:group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function MonthSelector({
  month,
  year,
  router,
  pathname,
  onClick,
}: {
  month: string;
  year: string;
  router: AppRouterInstance;
  pathname: string;
  onClick: () => void;
}) {
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
            onClick();
            const params = new URLSearchParams();
            params.set('month', m);
            params.set('year', year);
            router.push(pathname + '?' + params.toString());
          }}
          variant="outline"
          className={cn(
            'shadow-md transition hover:bg-slate-900 hover:text-slate-100 hover:shadow-lg',
            month === m ? 'bg-slate-100' : '',
          )}
        >
          {m}
        </Button>
      ))}
    </div>
  );
}
