'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { format } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { CalendarIcon, ChevronRight, Loader2, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import ButtonWithDialog from '~/app/_components/button-with-dialog.client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input, InputWithCurrency } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { TagInput, type Tag } from '~/components/ui/tag-input/tag-input';
import { cn, toCents } from '~/lib/utils.client';
import { api } from '~/trpc/react.client';
import { groupExpenseFormSchema, type RouterOutputs } from '~/trpc/shared';

export type GroupExpenseFormProps = {
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  expense?: RouterOutputs['groups']['expenses']['get'];
  tags: RouterOutputs['groups']['tags'];
};

const buttonClasses =
  'justify-self-end bg-primary-300 hover:bg-primary-800 hover:text-primary-200 dark:bg-primary-800 dark:text-primary-200 dark:hover:bg-primary-300 hover:dark:text-primary-800';
export default function GroupExpenseForm({ group, user, expense, tags }: GroupExpenseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPaidOpen, setIsPaidOpen] = useState(false);
  const [isOwedOpen, setIsOwedOpen] = useState(false);

  const form = useForm<z.infer<typeof groupExpenseFormSchema>>({
    resolver: zodResolver(groupExpenseFormSchema),
    defaultValues: {
      expenseId: expense?.id ?? null,
      description: expense?.transaction.description ?? '',
      amount: (expense?.transaction.amount ?? 0) / 100,
      groupId: group.id,
      createdById: expense?.createdById ?? user.id,
      date: expense?.transaction.date ?? new Date(),
      tags: expense?.transaction.TransactionsTags.map(({ tag }) => ({ id: tag.id, text: tag.name })) ?? [],
      splits: group.UserGroup.map(({ user }) => ({
        userId: user.id,
        paid: (expense?.TransactionSplit.find((s) => s.user.id === user.id)?.paid ?? 0) / 100,
        owed: (expense?.TransactionSplit.find((s) => s.user.id === user.id)?.owed ?? 0) / 100,
      })),
    },
  });

  const del = api.groups.expenses.delete.useMutation({
    onError: console.error,
    onSuccess: () => router.push(`/groups/${group.id}`),
  });

  const upsert = api.groups.expenses.upsert.useMutation({
    onMutate: () => setIsLoading(true),
    onError: (err) => {
      console.error(err);
      setIsLoading(false);
    },
    onSuccess: () => router.push(`/groups/${group.id}`),
  });

  function onSubmit(data: z.infer<typeof groupExpenseFormSchema>) {
    if (user.timezone) {
      // little hack to make sure the date used is timezoned to the user's preference
      // the calendar component cannot be timezoned
      data.date = fromZonedTime(format(data.date, 'yyyy-MM-dd'), user.timezone ?? 'Europe/Amsterdam');
    }

    upsert.mutate(data);
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
        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:items-end">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <InputWithCurrency
                    currency={currencySymbolMap[user.currency ?? 'EUR'] ?? '€'}
                    {...field}
                    step={0.01}
                    min={0.01}
                    onChange={(e) => form.setValue('amount', parseFloat(e.target.value) || 0)}
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
              <FormItem className="">
                <FormLabel>Date</FormLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full text-left font-normal dark:bg-primary-600">
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
        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2">
          <SplitInput
            form={form}
            errors={(form.formState.errors.splits as { paid: { message: string; type: string } })?.paid}
            open={isPaidOpen}
            onOpenChange={setIsPaidOpen}
            group={group}
            user={user}
            value={form.watch('splits').map((e) => ({ userId: e.userId, value: e.paid }))}
            title="How much did each member pay?"
            onPaidForEverything={(user) => {
              const splits = form.getValues('splits');
              for (const split of splits) {
                split.paid = user.id === split.userId ? form.getValues('amount') : 0;
              }
              form.setValue('splits', splits);
            }}
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
            errors={(form.formState.errors.splits as { owed: { message: string; type: string } })?.owed}
            open={isOwedOpen}
            onOpenChange={setIsOwedOpen}
            group={group}
            value={form.watch('splits').map((e) => ({ userId: e.userId, value: e.owed }))}
            user={user}
            title="How much should have each member paid?"
            onPaidRemainingAmount={(user) => {
              const total = toCents(form.getValues('amount'));
              const splits = form.getValues('splits');
              const paid = toCents(
                splits.reduce((acc, { owed, userId }) => {
                  if (userId === user.id) return acc;
                  if (typeof owed !== 'number' || isNaN(owed) || !isFinite(owed)) return acc;

                  return acc + owed;
                }, 0),
              );

              const split = splits.find(({ userId }) => userId === user.id);
              if (!split) throw new Error('Split not found');
              split.owed = Math.floor(total - paid) / 100;

              form.setValue('splits', splits);
            }}
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
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const splits = form.getValues('splits');
                const total = toCents(form.getValues('amount'));
                const splitAmount = Math.floor(total / group.UserGroup.length) / 100;

                for (const split of splits) {
                  split.owed = splitAmount;
                }

                if (toCents(splitAmount) * group.UserGroup.length < total) {
                  let remaining = total - toCents(splitAmount) * group.UserGroup.length;
                  let index = 0;
                  while (remaining > 0) {
                    const split = splits[index];
                    if (!split) throw new Error('Split not found');

                    split.owed = Math.floor(toCents(split.owed) + 1) / 100;
                    remaining -= 1;
                    index = (index + 1) % splits.length;
                  }
                }

                form.setValue('splits', splits);
              }}
              className={buttonClasses}
            >
              Split equally
            </Button>
          </SplitInput>
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
                      return form.getValues('tags').some((tag) => tag.text === t.name);
                    })
                  }
                  autocompleteFilter={(tag) => {
                    // only shows tags that are not already selected
                    return !form.getValues('tags').some(({ text }) => text === tag);
                  }}
                  autocompleteOptions={tags.map((t) => ({ id: t.id, text: t.name }))}
                  maxTags={3}
                  shape={'rounded'}
                  textCase={'lowercase'}
                  animation={'fadeIn'}
                  {...field}
                  placeholder="Enter a tag"
                  tags={form.getValues('tags').map((t) => ({ id: `${t.id}`, text: t.text }))}
                  className="max-w-[100%]"
                  setTags={(tags) => {
                    form.setValue('tags', tags as Tag[]);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={cn('mt-auto grid grid-rows-1 gap-2', expense ? 'grid-cols-2' : 'grid-cols-1')}>
          {expense ? (
            <ButtonWithDialog
              onConfirm={async () => {
                if (!expense) return;
                await del.mutateAsync({ groupId: group.id, sharedTransactionId: expense.id });
              }}
              title="Delete expense"
              description="Are you sure you want to delete this expense? This action cannot be undone."
              destructive
            >
              <Button disabled={isLoading} className="mt-auto" type="button" variant="destructive">
                <Trash2 className="mr-2" />
                Delete
              </Button>
            </ButtonWithDialog>
          ) : null}
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
        </div>
      </form>
    </Form>
  );
}

type SplitInputProps = {
  form: ReturnType<typeof useForm<z.infer<typeof groupExpenseFormSchema>>>;
  errors: { message: string; type: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  value: { userId: string; value: number }[];
  onPaidForEverything?: (user: Exclude<RouterOutputs['groups']['get'], null>['UserGroup'][number]['user']) => void;
  onPaidRemainingAmount?: (user: Exclude<RouterOutputs['groups']['get'], null>['UserGroup'][number]['user']) => void;
  onInputChange: (
    value: number,
    user: Exclude<RouterOutputs['groups']['get'], null>['UserGroup'][number]['user'],
  ) => void;
  children?: React.ReactNode;
};

function SplitInput({
  value,
  form,
  errors,
  open,
  onOpenChange,
  title,
  group,
  user,
  onPaidForEverything,
  onPaidRemainingAmount,
  onInputChange,
  children,
}: SplitInputProps) {
  const currency = currencySymbolMap[user.currency ?? 'EUR'] ?? '€';

  return (
    <FormField
      control={form.control}
      name="splits"
      render={() => (
        <Collapsible open={open} onOpenChange={onOpenChange}>
          <CollapsibleTrigger
            asChild
            className="my-2 cursor-pointer select-none rounded-md py-0.5 transition-all lg:hover:bg-primary-100 dark:lg:hover:bg-primary-600"
          >
            <div className="flex items-center justify-start">
              <Button className="max-md:pl-0" variant="ghost" disabled>
                <ChevronRight className={cn(open ? 'rotate-90' : 'rotate-0', 'transition-all')} />
                <span className="sr-only">Toggle</span>
              </Button>
              <FormLabel className="cursor-pointer text-primary-900 dark:text-primary-100">{title}</FormLabel>
            </div>
          </CollapsibleTrigger>
          {errors?.message ? (
            <p className="text-center text-sm text-red-500 dark:text-red-500">
              {errors.message}
              {currency}
            </p>
          ) : null}
          <CollapsibleContent className="flex flex-col gap-2">
            {group.UserGroup.sort((a, b) => a.user.id.localeCompare(b.user.id)).map(({ user: u }) => (
              <div
                key={u.id}
                className="grid grid-rows-2 items-center gap-2 border-b border-b-primary-200 p-2 py-4 last:border-0 lg:grid-cols-3 lg:grid-rows-1"
              >
                <div className="flex items-center justify-start self-start text-sm">
                  <Avatar className="mr-2">
                    <AvatarImage src={u.imageUrl ?? ''} alt={`@${u.username}`} />
                    <AvatarFallback>
                      <AvatarIcon />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2 text-sm">
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
                {onPaidForEverything ? (
                  <Button
                    type="button"
                    className={buttonClasses}
                    variant="secondary"
                    onClick={() => onPaidForEverything(u)}
                  >
                    Paid full amount
                  </Button>
                ) : null}
                {onPaidRemainingAmount ? (
                  <Button
                    type="button"
                    className={buttonClasses}
                    variant="secondary"
                    onClick={() => onPaidRemainingAmount(u)}
                  >
                    Paid the rest
                  </Button>
                ) : null}
                <FormItem className="col-span-2 lg:col-span-1 lg:col-start-3">
                  <FormControl>
                    <InputWithCurrency
                      className="w-full"
                      currency={currencySymbolMap[user.currency ?? 'EUR'] ?? '€'}
                      value={value.find((s) => s.userId === u.id)?.value ?? 0}
                      step={0.01}
                      min={0}
                      onChange={(e) => onInputChange(parseFloat(e.target.value), u)}
                    />
                  </FormControl>
                </FormItem>
              </div>
            ))}

            <div className="flex items-center justify-end">{children}</div>
          </CollapsibleContent>
        </Collapsible>
      )}
    />
  );
}
