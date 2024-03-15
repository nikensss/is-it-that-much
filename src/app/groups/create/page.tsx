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
  name: z.string().min(3),
  description: z.string().optional(),
  members: z.array(z.string().cuid()).min(2),
});

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<RouterOutputs['friends']['find']>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      members: [],
    },
  });

  const create = api.groups.create.useMutation({
    onMutate: () => setIsLoading(true),
    onSuccess: () => {
      router.push('/groups');
      setIsLoading(false);
    },
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
      <form className="flex grow flex-col" onSubmit={form.handleSubmit((d) => create.mutate(d))}>
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
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>What will this group be used for?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-rows-2 gap-2 md:grid-cols-2 md:grid-rows-1">
          <div className="flex flex-col">
            <Input
              id="search"
              className="text-[16px]"
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, username..."
            />
            <section
              className={cn('flex h-full flex-col items-stretch', query.isFetching ? 'overscroll-y-scroll' : '')}
            >
              {query.isFetching ? (
                <UserBannerLoading />
              ) : (
                candidates?.map((candidate) => <UserBannerClient key={candidate.id} user={candidate} />)
              )}
            </section>
          </div>
        </div>
        <Button className="mt-auto" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Create'}
        </Button>
      </form>
    </Form>
  );
}
