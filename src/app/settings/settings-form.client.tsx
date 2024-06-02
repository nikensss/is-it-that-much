'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { CommandList } from 'cmdk';
import currencySymbolMap from 'currency-symbol-map/map';
import { Check, Dot, Loader2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { nextTick } from 'process';
import { useLayoutEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem } from '~/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn, displayCurrency, displayTimezone } from '~/lib/utils.client';
import { api } from '~/trpc/react.client';

export type SettingsFormProps = {
  username: string | null | undefined;
  timezone: string | null | undefined;
  currency: string | null | undefined;
  weekStartsOn: number | null | undefined;
};

export default function SettingsForm({ username, timezone, currency, weekStartsOn }: SettingsFormProps) {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);

  const timezoneTrigger = useRef<HTMLButtonElement>(null);
  const [timezoneWidth, setTimezoneWidth] = useState<number>(0);

  const currencyTrigger = useRef<HTMLButtonElement>(null);
  const [currencyWidth, setCurrencyWidth] = useState<number>(0);

  const weekStartsOnTrigger = useRef<HTMLButtonElement>(null);
  const [weekStartsOnWidth, setWeekStartsOnWidth] = useState<number>(0);

  useLayoutEffect(() => {
    if (timezoneTrigger.current) setTimezoneWidth(timezoneTrigger.current.offsetWidth);

    if (currencyTrigger.current) setCurrencyWidth(currencyTrigger.current.offsetWidth);

    if (weekStartsOnTrigger.current) setWeekStartsOnWidth(weekStartsOnTrigger.current.offsetWidth);
  }, [timezoneTrigger, currencyTrigger, weekStartsOnTrigger]);

  const timezones = Intl.supportedValuesOf('timeZone');
  const currencies = Object.keys(currencySymbolMap);

  const [isLockOwned, setIsLockOwned] = useState(username ? true : false);

  const formSchema = z.object({
    username: z
      .string()
      .min(3, { message: 'Username must at least be 3 characters' })
      .max(120, { message: 'Username cannot be longer than 120 characters' })
      .refine(() => isLockOwned, { message: 'Username is already taken' }),
    timezone: z.string(),
    currency: z.string(),
    weekStartsOn: z.number().min(0).max(6),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username ?? '',
      timezone: timezone ? displayTimezone(timezone) : 'No timezone set',
      currency: currency ? displayCurrency(currency) : 'No currency set',
      weekStartsOn: weekStartsOn ?? 1,
    },
  });

  const update = api.users.update.useMutation({
    onMutate: () => setIsMutating(true),
    onSettled: () => {
      setIsMutating(false);
      router.refresh();
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    update.mutate(data);
  }

  const requestedUsername = form.watch('username');
  const usernameLockQuery = api.users.usernames.lock.useQuery(
    { username: requestedUsername },
    {
      onSuccess: (d) => setIsLockOwned(d ?? false),
      onSettled: () => {
        nextTick(() => {
          form.trigger('username').catch(console.error);
        });
      },
    },
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex grow flex-col items-start justify-start pt-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full pb-4 md:w-[360px]">
              <FormLabel className="block text-center md:text-left">Username</FormLabel>
              <FormControl>
                <div
                  className={cn(
                    'flex items-stretch justify-start rounded-md ring-1',
                    (() => {
                      if (usernameLockQuery.isFetching) return 'ring-gray-500';

                      if (!isLockOwned || requestedUsername.length < 3 || requestedUsername.length > 120) {
                        return 'ring-red-500';
                      }

                      if (isLockOwned) return 'ring-green-700';
                    })(),
                  )}
                >
                  <div className="flex w-9 items-center justify-center rounded-l-md bg-primary-100 px-1 dark:bg-primary-400">
                    <Dot
                      className={cn(
                        'animate-ping',
                        (() => {
                          if (usernameLockQuery.isFetching) return 'block';
                          if (requestedUsername.length < 3 || requestedUsername.length > 120) return 'hidden';

                          return 'hidden';
                        })(),
                      )}
                    />
                    <Check
                      className={cn(
                        'text-green-500 dark:text-green-400',
                        (() => {
                          if (usernameLockQuery.isFetching) return 'hidden';
                          if (isLockOwned) return 'block';

                          return 'hidden';
                        })(),
                      )}
                    />
                    <X
                      className={cn(
                        'text-red-500 dark:text-red-700',
                        (() => {
                          if (usernameLockQuery.isFetching) return 'hidden';
                          if (!isLockOwned || requestedUsername.length < 3 || requestedUsername.length > 120) {
                            return 'block';
                          }

                          return 'hidden';
                        })(),
                      )}
                    />
                  </div>
                  <Input
                    className="rounded-none rounded-r-md border-l border-none focus-visible:ring-0"
                    autoCapitalize="none"
                    {...field}
                    onChange={(e) => {
                      form.setValue('username', e.target.value);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem className="w-full pb-4">
              <FormLabel className="block text-center md:text-left">Timezone</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl className="w-full md:w-[360px]">
                    <Button
                      ref={timezoneTrigger}
                      variant="outline"
                      role="combobox"
                      className={cn('justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? field.value : 'Select a timezone'}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="max-h-[30vh] overflow-y-auto p-0" style={{ width: timezoneWidth }}>
                  <Command>
                    <CommandInput placeholder="Search timezone..." className="h-9" />
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandList>
                      {timezones.map((timezone) => (
                        <CommandItem
                          value={displayTimezone(timezone)}
                          key={timezone}
                          onSelect={() => {
                            form.setValue('timezone', displayTimezone(timezone));
                            timezoneTrigger.current?.click();
                          }}
                          className="hover:cursor-pointer"
                        >
                          {displayTimezone(timezone)}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              displayTimezone(timezone) === field.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className="w-full pb-4">
              <FormLabel className="block text-center md:text-left">Currency</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl className="w-full md:w-[360px]">
                    <Button
                      ref={currencyTrigger}
                      variant="outline"
                      role="combobox"
                      className={cn('justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? field.value : 'Select a currency'}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="max-h-[30vh] overflow-y-auto p-0" style={{ width: currencyWidth }}>
                  <Command>
                    <CommandInput placeholder="Search currency..." className="h-9" />
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandList>
                      {currencies.map((currency, idx) => (
                        <CommandItem
                          value={displayCurrency(currency)}
                          key={idx}
                          onSelect={() => {
                            form.setValue('currency', displayCurrency(currency));
                            currencyTrigger.current?.click();
                          }}
                          className="hover:cursor-pointer"
                        >
                          {displayCurrency(currency)}
                          <CheckIcon
                            className={cn('ml-auto h-4 w-4', currency === field.value ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weekStartsOn"
          render={({ field }) => (
            <FormItem className="w-full pb-4">
              <FormLabel className="block text-center md:text-left">Week starts on</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl className="w-full md:w-[360px]">
                    <Button
                      ref={weekStartsOnTrigger}
                      variant="outline"
                      role="combobox"
                      className={cn('justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {weekDays[field.value ?? 1]}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="max-h-[30vh] overflow-y-auto p-0" style={{ width: weekStartsOnWidth }}>
                  <Command>
                    <CommandList>
                      {weekDays.map((day, idx) => (
                        <CommandItem
                          value={day}
                          key={idx}
                          onSelect={() => {
                            form.setValue('weekStartsOn', idx % 7);
                            weekStartsOnTrigger.current?.click();
                          }}
                          className="hover:cursor-pointer"
                        >
                          {day}
                          <CheckIcon
                            className={cn('ml-auto h-4 w-4', idx === field.value ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isMutating || !isLockOwned || usernameLockQuery.isFetching}
          type="submit"
          className="mt-auto self-stretch"
        >
          {isMutating ? (
            <Loader2 className="m-4 h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-2" /> Save
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

export const dynamic = 'force-dynamic';
