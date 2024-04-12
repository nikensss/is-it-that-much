'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AvatarIcon, CalendarIcon, CheckIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { format } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { Loader2, MoveDown, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import ButtonWithDialog from '~/app/_components/button-with-dialog.client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '~/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { InputWithCurrency } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils.client';
import { api } from '~/trpc/react';
import { groupSettlementFormSchema, type RouterOutputs } from '~/trpc/shared';

export type RegisterSettlementProps = {
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  children: ReactNode;
  settlement?: Partial<RouterOutputs['groups']['settlements']['recent'][number]>;
};

export default function RegisterSettlement({ group, user, children, settlement }: RegisterSettlementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFromUserOpen, setIsFromUserOpen] = useState(false);
  const [isToUserOpen, setIsToUserOpen] = useState(false);
  const calendarTrigger = useRef<HTMLButtonElement>(null);

  const resetForm = () => {
    setIsOpen(true);
    setIsLoading(false);
    form.reset();

    form.setValue('fromId', settlement?.from?.id ?? user.id);
    form.setValue('toId', settlement?.to?.id ?? group.UserGroup.find(({ userId }) => userId !== user.id)?.userId ?? '');
    form.setValue('amount', (settlement?.amount ?? 0) / 100);
    form.setValue(
      'date',
      settlement?.date ? fromZonedTime(settlement.date, user.timezone ?? 'Europe/Amsterdam') : new Date(),
    );
  };

  const upsert = api.groups.settlements.upsert.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  });

  const del = api.groups.settlements.delete.useMutation({
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  });

  const form = useForm<z.infer<typeof groupSettlementFormSchema>>({
    resolver: zodResolver(groupSettlementFormSchema),
    defaultValues: {
      settlementId: settlement?.id ?? null,
      amount: (settlement?.amount ?? 0) / 100,
      date: settlement?.date ? fromZonedTime(settlement.date, user.timezone ?? 'Europe/Amsterdam') : new Date(),
      groupId: group.id,
      fromId: settlement?.from?.id ?? user.id,
      toId: settlement?.to?.id ?? group.UserGroup.find(({ userId }) => userId !== user.id)?.userId ?? '',
    },
  });

  function onSubmit(data: z.infer<typeof groupSettlementFormSchema>) {
    if (user.timezone) {
      // little hack to make sure the date used is timezoned to the user's preference
      // the calendar component cannot be timezoned
      data.date = fromZonedTime(format(data.date, 'yyyy-MM-dd'), user.timezone);
    }

    return upsert.mutateAsync(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger type={undefined} onClick={resetForm} className="cursor-pointer" asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Register settlement</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-stretch gap-2">
            <FormField
              control={form.control}
              name="fromId"
              render={() => (
                <FormItem>
                  <FormControl>
                    <UserSelect
                      isPopoverOpen={isFromUserOpen}
                      setPopoverOpen={setIsFromUserOpen}
                      users={group.UserGroup.map((e) => e.user)}
                      value={form.watch('fromId')}
                      setValue={(value) => {
                        const to = form.getValues('toId');
                        if (to === value) {
                          form.setValue('toId', form.getValues('fromId'));
                        }
                        form.setValue('fromId', value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MoveDown className="mt-1 animate-bounce self-center" />

            <FormField
              control={form.control}
              name="toId"
              render={() => (
                <FormItem>
                  <FormControl>
                    <UserSelect
                      isPopoverOpen={isToUserOpen}
                      setPopoverOpen={setIsToUserOpen}
                      users={group.UserGroup.map((e) => e.user)}
                      value={form.watch('toId')}
                      setValue={(value) => {
                        const from = form.getValues('fromId');
                        if (from === value) {
                          form.setValue('fromId', form.getValues('toId'));
                        }
                        form.setValue('toId', value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <InputWithCurrency
                      currency={currencySymbolMap[user.currency ?? 'EUR'] ?? '€'}
                      onFocus={(e) => e.target.select()}
                      step={0.01}
                      min={0.01}
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                <FormItem className="">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" ref={calendarTrigger} className="w-full text-left font-normal">
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

            <DialogFooter className={cn(settlement?.id ? 'grid-cols-2' : 'grid-cols-1', 'grid grid-rows-1 gap-2')}>
              {settlement?.id ? (
                <ButtonWithDialog
                  title="Delete settlement"
                  description="Are you sure you want to delete this settlement? This action cannot be undone."
                  destructive
                  onConfirm={async () => {
                    if (!settlement?.id) return;
                    await del.mutateAsync({ groupId: group.id, settlementId: settlement.id });
                  }}
                >
                  <Button variant="destructive">
                    <Trash2 className="mr-2" />
                    Delete
                  </Button>
                </ButtonWithDialog>
              ) : null}
              <Button disabled={isLoading} className="grow" type="submit">
                {isLoading ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function UserSelect({
  users,
  isPopoverOpen,
  setPopoverOpen,
  value,
  setValue,
}: {
  users: RegisterSettlementProps['group']['UserGroup'][number]['user'][];
  isPopoverOpen: boolean;
  setPopoverOpen: Dispatch<SetStateAction<boolean>>;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className="h-full w-full rounded-md border border-primary-200 dark:border-primary-800 dark:bg-transparent">
        <User user={users.find(({ id }) => id === value)} />
      </PopoverTrigger>
      <PopoverContent className="p-2" align="center">
        <Command>
          <CommandInput placeholder="Search for a group member..." />
          <CommandEmpty>No member selected</CommandEmpty>
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={`${user.firstName} ${user.lastName} ${user.username ? user.username : ''}`.trim()}
                onSelect={() => {
                  if (value !== user.id) setValue(user.id);
                  setPopoverOpen(false);
                }}
                className="first:rounded-t-md last:rounded-b-md hover:cursor-pointer"
              >
                <User user={user} />
                <CheckIcon className={cn('ml-auto h-4 w-4', value === user.id ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function User({ user }: { user?: RegisterSettlementProps['group']['UserGroup'][number]['user'] }) {
  return (
    <div className="flex items-center justify-center gap-2 p-2">
      <Avatar>
        <AvatarImage src={user?.imageUrl ?? ''} alt={`@${user?.username}`} />
        <AvatarFallback>
          <AvatarIcon />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <p>
          {user?.firstName} {user?.lastName}
        </p>
        <p className={cn(user?.username ? '' : 'invisible')}>{`@${user?.username}`}</p>
      </div>
    </div>
  );
}
