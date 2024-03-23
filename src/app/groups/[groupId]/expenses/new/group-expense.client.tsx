'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { format } from 'date-fns';
import { CalendarIcon, ChevronRight, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';
import { groupExpenseFormSchema, type RouterOutputs } from '~/trpc/shared';

export type GroupExpenseFormProps = {
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
};

export default function GroupExpenseForm({ group, user }: GroupExpenseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPaidOpen, setIsPaidOpen] = useState(true);
  const [isOwedOpen, setIsOwedOpen] = useState(true);

  const form = useForm<z.infer<typeof groupExpenseFormSchema>>({
    resolver: zodResolver(groupExpenseFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      groupId: group.id,
      createdById: user.id,
      date: new Date(),
      splits: group.UserGroup.map(({ user }) => ({
        userId: user.id,
        paid: 0,
        owed: 0,
      })),
    },
  });

  const create = api.groups.expenses.create.useMutation({
    onMutate: () => setIsLoading(true),
    onError: (err) => {
      console.error(err);
      setIsLoading(false);
    },
    onSuccess: () => router.push(`/groups/${group.id}`),
  });

  function onSubmit(data: z.infer<typeof groupExpenseFormSchema>) {
    const { totalPaid, totalOwed } = data.splits.reduce(
      (acc, { paid, owed }) => {
        acc.totalPaid += paid;
        acc.totalOwed += owed;

        return acc;
      },
      { totalPaid: 0, totalOwed: 0 },
    );

    if (totalPaid !== data.amount) {
      form.setError('amount', {
        type: 'validate',
        message: 'The paid amount does not match the total amount',
      });

      return form.setError('splits', {
        type: 'validate',
        message: 'The paid amount does not match the total amount',
      });
    }

    if (totalOwed !== data.amount) {
      form.setError('amount', {
        type: 'validate',
        message: 'The owed amount does not match the total amount',
      });

      return form.setError('splits', {
        type: 'validate',
        message: 'The owed amount does not match the total amount',
      });
    }

    create.mutate(data);
  }

  return (
    <Form {...form}>
      <form className="flex grow flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>What did this expense cover?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-end">
                    <Input
                      className="peer rounded-r-none pr-1 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      {...field}
                      min={0.01}
                      onChange={(e) => form.setValue('amount', parseFloat(e.target.value) || 0)}
                    />
                    <div className="flex items-center justify-center self-stretch rounded-r-md border border-slate-200 bg-slate-200 px-2 peer-focus-visible:ring-1 peer-focus-visible:ring-slate-950 ">
                      <p>{currencySymbolMap[user.currency ?? 'EUR']}</p>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>How much was it?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Date</FormLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full text-left font-normal">
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      weekStartsOn={(Math.abs(user.weekStartsOn) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6}
                      mode="single"
                      modifiersStyles={{
                        today: {
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                        },
                      }}
                      onDayClick={() => setIsCalendarOpen(false)}
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
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
          <SplitInput
            form={form}
            open={isPaidOpen}
            onOpenChange={setIsPaidOpen}
            group={group}
            user={user}
            title="How much did each member pay?"
            onInputChange={(amount, user) => {
              const splits = form.getValues('splits');
              const split = splits.find(({ userId }) => userId === user.id);
              if (!split) {
                console.error(`Split for user ${user.id} not found`);
                return;
              }

              split.paid = amount;
              form.setValue('splits', splits);
            }}
          />
          <SplitInput
            form={form}
            open={isOwedOpen}
            onOpenChange={setIsOwedOpen}
            group={group}
            user={user}
            title="How much should have each member paid?"
            onInputChange={(amount, user) => {
              const splits = form.getValues('splits');
              const split = splits.find(({ userId }) => userId === user.id);
              if (!split) {
                console.error(`Split for user ${user.id} not found`);
                return;
              }

              split.owed = amount;
              form.setValue('splits', splits);
            }}
          />
        </div>
        <Button className="mt-auto" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2" />
              Save
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

type SplitInputProps = {
  form: ReturnType<typeof useForm<z.infer<typeof groupExpenseFormSchema>>>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  onInputChange: (
    value: number,
    user: Exclude<RouterOutputs['groups']['get'], null>['UserGroup'][number]['user'],
  ) => void;
};

function SplitInput({ form, open, onOpenChange, title, group, user, onInputChange }: SplitInputProps) {
  return (
    <FormField
      control={form.control}
      name="splits"
      render={() => (
        <Collapsible open={open} onOpenChange={onOpenChange}>
          <CollapsibleTrigger
            asChild
            className="my-2 select-none rounded-md py-0.5 transition-all md:hover:cursor-pointer md:hover:bg-slate-100"
          >
            <div className="flex items-center justify-start">
              <Button className="max-md:pl-0" variant="ghost" disabled>
                <ChevronRight className={cn(open ? 'rotate-90' : 'rotate-0', 'transition-all')} />
                <span className="sr-only">Toggle</span>
              </Button>
              <FormLabel>{title}</FormLabel>
            </div>
          </CollapsibleTrigger>
          <FormMessage />
          <CollapsibleContent className="">
            {group.UserGroup.sort((a, b) => a.user.id.localeCompare(b.user.id)).map(({ user: u }) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-2 border-b border-b-slate-200 p-2 py-4 last:border-0"
              >
                <div className="flex items-center justify-center text-sm md:text-lg">
                  <Avatar className="mr-4">
                    <AvatarImage src={u.imageUrl ?? ''} alt={`@${u.username}`} />
                    <AvatarFallback>
                      <AvatarIcon />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <p className="overflow-hidden overflow-ellipsis whitespace-nowrap max-md:max-w-[20ch]">
                      {u.firstName} {u.lastName}
                    </p>
                    <p
                      className={cn(
                        u.username ? '' : 'invisible',
                        'overflow-hidden overflow-ellipsis whitespace-nowrap max-md:max-w-[20ch]',
                      )}
                    >{`@${u.username}`}</p>
                  </div>
                </div>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center justify-end">
                      <Input
                        className="peer rounded-r-none pr-1 text-right [appearance:textfield] max-md:max-w-24 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        defaultValue={0}
                        step={0.01}
                        min={0}
                        onChange={(e) => onInputChange(parseFloat(e.target.value), u)}
                      />
                      <div className="flex items-center justify-center self-stretch rounded-r-md border border-slate-200 bg-slate-200 px-2 peer-focus-visible:ring-1 peer-focus-visible:ring-slate-950 ">
                        <p>{currencySymbolMap[user.currency ?? 'EUR']}</p>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    />
  );
}