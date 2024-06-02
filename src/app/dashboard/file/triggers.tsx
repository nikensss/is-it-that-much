'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react.client';
import { triggersFormSchema, type RouterOutputs } from '~/trpc/shared';

export type TriggersProps = {
  triggers: RouterOutputs['parsing']['triggers']['all'];
};

export default function Triggers({ triggers = [] }: TriggersProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof triggersFormSchema>>({
    resolver: zodResolver(triggersFormSchema),
    defaultValues: {
      triggers:
        triggers.length > 0
          ? triggers.map((trigger) => ({
              triggerId: trigger.id,
              target: trigger.target,
              description: trigger.description,
              tags: trigger.TriggersTags.map((t) => t.tag.name).join(', '),
            }))
          : [{ triggerId: null, target: '', description: '', tags: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'triggers',
  });

  const query = api.parsing.triggers.all.useQuery(undefined, { enabled: false });
  const update = api.parsing.triggers.update.useMutation({});
  const create = api.parsing.triggers.create.useMutation({});
  const del = api.parsing.triggers.delete.useMutation({});

  function onSubmit(values: z.infer<typeof triggersFormSchema>) {
    setIsLoading(true);
    const updates = { triggers: values.triggers.filter((t) => t.triggerId !== null) };
    const creates = { triggers: values.triggers.filter((t) => t.triggerId === null) };

    const promises: Promise<unknown>[] = [];
    if (updates.triggers.length > 0) promises.push(update.mutateAsync(updates).catch(console.error));
    if (creates.triggers.length > 0) promises.push(create.mutateAsync(creates).catch(console.error));

    Promise.allSettled(promises)
      .then(() => query.refetch())
      .then((result) => {
        if (!result.data) return;
        for (const { id, target } of result.data) {
          const i = form.getValues().triggers.findIndex((t) => t.target === target);
          if (i === -1) continue;
          form.setValue(`triggers.${i}.triggerId`, id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  return (
    <Form {...form}>
      <form className="relative flex flex-grow flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="sticky top-16 flex w-full items-center gap-2 bg-white py-1 *:grow *:text-center dark:bg-primary-700">
          <Button
            type="button"
            className="absolute left-0 max-w-12"
            onClick={() => append({ triggerId: null, target: '', description: '', tags: '' })}
          >
            <PlusIcon size={24} />
          </Button>
          <div>When the description contains</div>
          <div>Update it to</div>
          <div>And add the following tags</div>
          <Button disabled className="pointer-events-none invisible max-w-12">
            <PlusIcon size={24} />
          </Button>
        </div>
        {fields.map((field, i) => {
          return (
            <div key={field.id} className="flex w-full gap-2 *:grow">
              <FormField
                control={form.control}
                name={`triggers.${i}.target`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input disabled={isLoading} {...field} placeholder="target" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <FormField
                control={form.control}
                name={`triggers.${i}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input disabled={isLoading} {...field} placeholder="description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <FormField
                control={form.control}
                name={`triggers.${i}.tags`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input disabled={isLoading} {...field} placeholder="tags" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <Button
                disabled={isLoading}
                onClick={() => {
                  const triggerId = form.getValues().triggers[i]?.triggerId;
                  if (triggerId) del.mutateAsync({ triggerId }).catch(console.error);

                  if (fields.length > 1) return remove(i);

                  append({ triggerId: null, target: '', description: '', tags: '' });
                  form.reset();
                }}
                className="max-w-12"
                variant={'destructive'}
              >
                <XIcon size={24} />
              </Button>
            </div>
          );
        })}
        <Button disabled={isLoading} className="mt-auto w-full" type="submit">
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Save'}
        </Button>
      </form>
    </Form>
  );
}

export const dynamic = 'force-dynamic';
