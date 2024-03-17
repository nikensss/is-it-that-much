'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import UserBannerClient from '~/app/friends/user-banner.client';
import UserBannerLoading from '~/app/friends/user-banner.loading';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';

const formSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(3),
  description: z.string().optional(),
  members: z
    .array(
      z.object({
        id: z.string().cuid(),
        username: z.string().nullable(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        imageUrl: z.string().url().nullable(),
      }),
    )
    .min(1, { message: 'You need to select at least 1 member to create a group' }),
});

export default function GroupUpsertForm({
  user,
  group,
}: {
  user: Exclude<RouterOutputs['users']['get'], null>;
  group?: RouterOutputs['groups']['get'];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<RouterOutputs['friends']['find']>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
      members: group?.UserGroup.map((e) => e.user).filter((u) => u.id !== user.id) ?? [],
    },
  });

  const mutate = api.groups.upsert.useMutation({
    onMutate: () => setIsLoading(true),
    onSuccess: (r) => router.push(`/groups/${r}`),
    onError: () => setIsLoading(false),
  });

  const query = api.friends.find.useQuery(
    { search },
    {
      enabled: search.length >= 3,
      onError: () => setCandidates(() => []),
      onSuccess: (d) => setCandidates(() => d ?? []),
    },
  );

  return (
    <Form {...form}>
      <form
        className="flex grow flex-col"
        onSubmit={form.handleSubmit((d) => {
          return mutate.mutateAsync({
            ...d,
            ...(group?.id ? { id: group.id } : {}),
            members: d.members.map((m) => m.id),
          });
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>What will this group be used for?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="members"
          render={({ field }) => (
            <FormItem className="mb-2">
              <h2 className="text-center text-2xl">Members</h2>
              <FormMessage className="text-center" />
              <FormControl>
                <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:grid-rows-1">
                  <div className="flex flex-col">
                    <FormLabel className="text-center text-lg">Find friends</FormLabel>
                    <Input
                      id="search"
                      type="text"
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Name, email, username..."
                    />
                    <section className="mt-2 flex flex-col items-stretch gap-2">
                      {query.isFetching ? (
                        <UserBannerLoading />
                      ) : (
                        candidates?.map((candidate) => (
                          <UserCheckbox
                            isSelected={field.value.some((u) => u.id === candidate.id)}
                            onClick={(user) => {
                              console.log('clicked', { selected: field.value });
                              form.setValue(
                                'members',
                                field.value.some((u) => u.id === user.id)
                                  ? field.value.filter((u) => u.id !== user.id)
                                  : [...field.value, user],
                              );
                            }}
                            key={candidate.id}
                            user={candidate}
                          />
                        ))
                      )}
                    </section>
                  </div>
                  <div className="flex flex-col">
                    <FormLabel className="text-center text-lg">Selected members</FormLabel>
                    <Input className="invisible hidden md:block" disabled />
                    <section className="mt-2 flex flex-col items-stretch gap-2">
                      <UserBannerClient user={user} isSelf={true} />
                      {field.value.map((user) => (
                        <div key={user.id + '_selected'} className="flex items-center">
                          <input
                            onClick={() => {
                              form.setValue(
                                'members',
                                field.value.filter((u) => u.id !== user.id),
                              );
                            }}
                            type="checkbox"
                            className="hidden"
                            id={user.id}
                          />
                          <label className="grow cursor-pointer" htmlFor={user.id}>
                            <UserBannerClient user={user} className="md:hover:border-red-500 md:hover:bg-red-100" />
                          </label>
                        </div>
                      ))}
                    </section>
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="mt-auto" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : group?.id ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  );
}

function UserCheckbox({
  user,
  isSelected,
  onClick,
}: {
  onClick: (user: RouterOutputs['friends']['find'][number]) => void;
  isSelected: boolean;
  user: RouterOutputs['friends']['find'][number];
}) {
  const [checked, setChecked] = useState(isSelected);

  function onUserClick() {
    setChecked(!checked);
    onClick(user);
  }

  return (
    <div className="flex items-center">
      <input checked={checked} onChange={onUserClick} type="checkbox" className="hidden" id={user.id} />
      <label className="grow cursor-pointer" htmlFor={user.id}>
        <UserBannerClient
          user={user}
          className={cn(
            checked ? 'border-green-500 bg-green-100' : '',
            'md:hover:border-green-500 md:hover:bg-green-100',
          )}
        />
      </label>
    </div>
  );
}
