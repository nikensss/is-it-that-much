'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';

export default function MonthSelector({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="ml-2 bg-slate-900" variant="outline">
          {month}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-3 grid-rows-4 gap-1 p-1 shadow-lg">
        {[...months].map((m, idx) => (
          <Button
            key={idx}
            onClick={() => {
              setIsOpen(false);
              const params = new URLSearchParams();
              params.set('month', m);
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
      </PopoverContent>
    </Popover>
  );
}
