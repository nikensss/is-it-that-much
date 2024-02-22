'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { TransactionType } from '@prisma/client';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactElement, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { type Tag, TagInput } from '~/components/ui/tag-input/tag-input';
import { cn } from '~/lib/utils';
import type { PersonalTransactionInPeriod } from '~/server/api/routers/personal-transactions';
import { api } from '~/trpc/react';

export type UpdateTransactionProps = {
  timezone: string;
  weekStartsOn: number;
  transaction: PersonalTransactionInPeriod;
  tags: {
    id: string;
    text: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
  }[];
  trigger: ReactElement;
};

export default function UpdateTransaction({
  timezone,
  weekStartsOn,
  transaction,
  tags,
  trigger,
}: UpdateTransactionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const calendarTrigger = useRef<HTMLButtonElement>(null);

  const resetForm = () => {
    setIsOpen(true);
    setIsLoading(false);
    form.reset();
  };

  const mutationConfig = {
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  };

  const updateTransaction = ((type: TransactionType) => {
    switch (type) {
      case 'EXPENSE':
        return api.personalExpenses.update.useMutation(mutationConfig);
      case 'INCOME':
        return api.personalIncomes.update.useMutation(mutationConfig);
    }
  })(transaction.type);

  const formSchema = z.object({
    description: z.string().min(3).max(50),
    amount: z.number().min(0.01),
    date: z.date(),
    tags: z.array(
      z.object({
        id: z.string(),
        text: z.string().min(3).max(50),
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction.description,
      amount: transaction.amount / 100,
      date: new Date(transaction.date),
      tags: transaction.TransactionsTags.map((t) => ({ id: t.tag.id, text: t.tag.name })),
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (timezone) {
      // little hack to make sure the date used is timezoned to the user's preference
      // the calendar component cannot be timezoned
      data.date = new Date(zonedTimeToUtc(format(data.date, 'yyyy-MM-dd'), timezone));
    }

    return updateTransaction.mutate({
      ...data,
      tags: data.tags.map((tag) => tag.text),
      id: transaction.id,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild type={undefined} onClick={resetForm}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Update expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input onFocus={(e) => e.target.select()} className="col-span-7 text-[16px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full flex-col justify-between md:flex-row">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        step={0.01}
                        min={0.01}
                        className={cn(
                          'col-span-7 text-left text-[16px] font-normal [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                          !field.value && 'text-muted-foreground',
                        )}
                        {...field}
                        onChange={(e) => form.setValue('amount', parseFloat(e.target.value))}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            ref={calendarTrigger}
                            className={cn(
                              'ml-0.5 min-w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                              'w-full py-0',
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          weekStartsOn={(Math.abs(weekStartsOn) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6}
                          mode="single"
                          modifiersStyles={{
                            today: {
                              fontWeight: 'bold',
                              textDecoration: 'underline',
                            },
                          }}
                          onDayClick={() => calendarTrigger.current?.click()}
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(d) => d < new Date('1900-01-01')}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      // enable autocomplete if there are unselected suggestions
                      enableAutocomplete={
                        !tags.every((t) => {
                          return form.getValues('tags').some((tag) => tag.text === t.text);
                        })
                      }
                      autocompleteFilter={(tag) => {
                        // only shows tags that are not already selected
                        return !form.getValues('tags').some(({ text }) => text === tag);
                      }}
                      autocompleteOptions={tags}
                      maxTags={10}
                      shape={'rounded'}
                      textCase={'lowercase'}
                      animation={'fadeIn'}
                      {...field}
                      placeholder="Enter a tag"
                      tags={form.getValues('tags') as Tag[]}
                      className="max-w-[100%] text-[16px]"
                      setTags={(tags) => {
                        form.setValue('tags', tags as Tag[]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isLoading} type="submit">
                {isLoading ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
