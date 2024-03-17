'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '~/components/ui/dialog';

export default function ButtonWithDialog({
  children,
  title,
  description,
  destructive = false,
  onConfirm,
}: {
  children: React.ReactNode;
  title: string;
  destructive?: boolean;
  description: string;
  onConfirm?: () => Promise<unknown>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsSending(false)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-md max-sm:w-11/12">
        <DialogHeader>{title}</DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => {
              if (!onConfirm) {
                setIsOpen(false);
                return;
              }

              setIsSending(true);
              onConfirm()
                .catch(console.error)
                .finally(() => setIsOpen(false));
            }}
            disabled={isSending}
          >
            {isSending ? <Loader2 className="animate-spin" /> : 'Confirm'}
          </Button>
          <DialogClose asChild>
            <Button type="submit" variant={destructive ? 'default' : 'destructive'} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
