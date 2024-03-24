'use client';

import { Loader2, Save, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { TableCell, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';
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

type UpdateTagProps = {
  tag: RouterOutputs['tags']['all'][number];
};

export default function UpdateTag({ tag }: UpdateTagProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setIsOpen(true);
    setIsLoading(false);
    form.reset();

    form.setValue('name', tag.name);
  };

  const update = api.tags.update.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  });

  const formSchema = z.object({
    name: z.string().min(3).max(50),
    id: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag.name,
      id: tag.id,
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    return update.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild type={undefined} onClick={resetForm}>
        <TableRow className="hover:cursor-pointer">
          <TableCell>{tag.name}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Update tag: {tag.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input onFocus={(e) => e.target.select()} className="col-span-7" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col gap-4">
              <DeleteTag tag={tag} onDelete={() => setIsOpen(false)} />
              <Button className="grow" disabled={isLoading} type="submit">
                {isLoading ? (
                  <Loader2 className="m-4 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2" /> Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type DeleteTagProps = {
  tag: UpdateTagProps['tag'];
  onDelete: () => void;
};

function DeleteTag({ tag, onDelete }: DeleteTagProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const deleteTag = api.tags.delete.useMutation({
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
        <Button className="mt-2 min-w-[70px] grow md:mt-0" variant="destructive">
          <Trash2 className="mr-2" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Delete tag &ldquo;{tag.name}&rdquo;</DialogTitle>
        </DialogHeader>
        <DialogDescription>Are you sure you want to delete this tag? This action cannot be undone.</DialogDescription>
        <DialogFooter className="flex flex-col gap-4">
          <Button type="button" variant="destructive" onClick={() => deleteTag.mutate({ id: tag.id })}>
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
