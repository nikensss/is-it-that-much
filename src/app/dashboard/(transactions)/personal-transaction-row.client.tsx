'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { format } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input, InputWithCurrency } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { TableCell, TableRow } from '~/components/ui/table';
import { type Tag, TagInput } from '~/components/ui/tag-input/tag-input';
import { cn } from '~/lib/utils.client';
import { api } from '~/trpc/react.client';
import type { RouterOutputs } from '~/trpc/shared';

export type UpdateTransactionProps = {
  currency: string | null;
  timezone: string;
  weekStartsOn: number;
  transaction: RouterOutputs['transactions']['personal']['period']['list'][number];
  tags: RouterOutputs['tags']['all'];
  groups: RouterOutputs['groups']['all']['get'];
};

export function PersonalTransactionRow({
  currency,
  timezone,
  weekStartsOn,
  transaction,
  tags,
  groups,
}: UpdateTransactionProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isConvertToGroupExpenseOpen, setIsConvertToGroupExpenseOpen] = useState(false);
  const [isConvertingToGroupExpense, setIsConvertingToGroupExpense] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const calendarTrigger = useRef<HTMLButtonElement>(null);

  const resetForm = () => {
    setIsOpen(true);
    setIsLoading(false);
    form.reset();

    form.setValue('description', transaction.description);
    form.setValue('amount', transaction.amount / 100);
    form.setValue('date', new Date(transaction.date));
    form.setValue(
      'tags',
      transaction.TransactionsTags.map((t) => ({ id: t.tag.id, text: t.tag.name })),
    );
  };

  const update = api.transactions.personal.update.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  });

  const transfer = api.transactions.personal.transfer.useMutation({
    onMutate: () => setIsConvertingToGroupExpense(true),
    onSettled: () => {
      setIsConvertingToGroupExpense(false);
      setIsOpen(false);
    },
    onSuccess: ({ groupId, sharedTransactionId }) => {
      router.push(`/groups/${groupId}/expenses/${sharedTransactionId}`);
    },
  });

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
      data.date = new Date(fromZonedTime(format(data.date, 'yyyy-MM-dd'), timezone));
    }

    return update.mutate({
      ...data,
      tags: data.tags.map((tag) => tag.text),
      id: transaction.id,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild type={undefined} onClick={resetForm}>
        <TableRow key={transaction.id} className="cursor-pointer">
          <TableCell>{formatInTimeZone(transaction.date, timezone, 'LLLL d, yyyy')}</TableCell>
          <TableCell>{transaction.description}</TableCell>
          <TableCell>{transaction.amount / 100}</TableCell>
          <TableCell>{transaction.TransactionsTags.map((t) => t.tag.name).join(', ')}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Update {transaction.type.toLowerCase()}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input onFocus={(e) => e.target.select()} className="col-span-7" {...field} />
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
                      <InputWithCurrency
                        currency={currencySymbolMap[currency ?? 'EUR'] ?? '€'}
                        onFocus={(e) => e.target.select()}
                        step={0.01}
                        min={0.01}
                        className={cn(
                          'col-span-7 text-left font-normal [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
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
                              'ml-0.5 min-w-[240px] pl-3 text-left font-normal dark:bg-primary-600',
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
                          return form.getValues('tags').some((tag) => tag.text === t.name);
                        })
                      }
                      autocompleteFilter={(tag) => {
                        // only shows tags that are not already selected
                        return !form.getValues('tags').some(({ text }) => text === tag);
                      }}
                      autocompleteOptions={tags.map((t) => ({ id: t.id, text: t.name }))}
                      maxTags={10}
                      shape={'rounded'}
                      textCase={'lowercase'}
                      animation={'fadeIn'}
                      {...field}
                      placeholder="Enter a tag"
                      tags={form.getValues('tags')}
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
            <DialogFooter className="flex lg:flex-col">
              {groups.length > 0 ? (
                <Dialog open={isConvertToGroupExpenseOpen} onOpenChange={setIsConvertToGroupExpenseOpen}>
                  <DialogTrigger asChild type={undefined}>
                    <Button type="button" variant="secondary">
                      Convert to group expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
                    <DialogHeader>
                      <DialogTitle>Send &ldquo;{transaction.description}&rdquo; to a group</DialogTitle>
                    </DialogHeader>
                    <Select onValueChange={setGroupId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem value={group.id} key={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (!groupId) throw new Error('Group ID is missing');
                          transfer.mutate({ transactionId: transaction.id, groupId });
                        }}
                      >
                        {isConvertingToGroupExpense ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Send'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
              <div className="flex flex-col gap-2 lg:flex-row">
                <DeleteTransaction transaction={transaction} onDelete={() => setIsOpen(false)} />
                <Button className="grow" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <Loader2 className="m-4 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type DeleteTransactionProps = {
  transaction: UpdateTransactionProps['transaction'];
  onDelete: () => void;
};

function DeleteTransaction({ transaction, onDelete }: DeleteTransactionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const deleteTransaction = api.transactions.personal.delete.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => {
      onDelete();
      router.refresh();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="min-w-[70px] grow md:mt-0" variant="destructive">
          <Trash2 className="mr-2" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Delete {transaction.type.toLowerCase()}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this {transaction.type.toLowerCase()}? This action cannot be undone.
        </DialogDescription>
        <DialogFooter className="flex flex-col gap-4">
          <Button type="button" variant="destructive" onClick={() => deleteTransaction.mutate({ id: transaction.id })}>
            {isLoading ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Delete'}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
