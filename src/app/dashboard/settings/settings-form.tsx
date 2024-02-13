'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '~/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn, displayCurrency, displayTimezone } from '~/lib/utils';
import { api } from '~/trpc/react';

export type SettingsFormProps = {
  timezone: string | null | undefined;
  currency: string | null | undefined;
};

export default function SettingsForm({ timezone, currency }: SettingsFormProps) {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);

  const timezoneTrigger = useRef<HTMLButtonElement>(null);
  const currencyTrigger = useRef<HTMLButtonElement>(null);

  const timezones = Intl.supportedValuesOf('timeZone');
  const currencies = Object.keys(currencySymbolMap);

  const formSchema = z.object({
    timezone: z.string(),
    currency: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timezone: displayTimezone(timezone ?? 'Europe/Amsterdam'),
      currency: displayCurrency(currency ?? 'EUR'),
    },
  });

  const updateUser = api.users.update.useMutation({
    onMutate: () => setIsMutating(true),
    onSettled: () => {
      setIsMutating(false);
      router.refresh();
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateUser.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid flex-grow grid-cols-1  grid-rows-3 py-4 md:grid-cols-2 md:grid-rows-2 md:gap-4"
      >
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Timezone</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
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
                <PopoverContent className="max-h-[30vh] w-full overflow-y-auto p-0">
                  <Command>
                    <CommandInput placeholder="Search timezone..." className="h-9" />
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup>
                      {timezones.map((timezone) => (
                        <CommandItem
                          value={displayTimezone(timezone)}
                          key={timezone}
                          onSelect={() => {
                            form.setValue('timezone', displayTimezone(timezone));
                            timezoneTrigger.current?.click();
                          }}
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
                    </CommandGroup>
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
            <FormItem className="flex flex-col">
              <FormLabel>Currency</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
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
                <PopoverContent className="max-h-[30vh] w-full overflow-y-auto p-0">
                  <Command>
                    <CommandInput placeholder="Search currency..." className="h-9" />
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup>
                      {currencies.map((currency, idx) => (
                        <CommandItem
                          value={displayCurrency(currency)}
                          key={idx}
                          onSelect={() => {
                            form.setValue('currency', displayCurrency(currency));
                            currencyTrigger.current?.click();
                          }}
                        >
                          {displayCurrency(currency)}
                          <CheckIcon
                            className={cn('ml-auto h-4 w-4', currency === field.value ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isMutating} type="submit" className="col-span-full mt-auto">
          {isMutating ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
