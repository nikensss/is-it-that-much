'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Dot, Loader2, UserRoundCheck, UserRoundPlus, UserRoundX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
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
import { Input } from '~/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/shared';

export default function FindFriendsClient() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<RouterOutputs['users']['find']>([]);

  const query = api.users.find.useQuery(
    { search },
    {
      enabled: search.length >= 3,
      onError: () => setUsers(() => []),
      onSuccess: (d) => {
        if (d === null) return setUsers(() => []);
        setUsers(() => d);
      },
    },
  );

  return (
    <>
      <div className="relative w-full">
        <Input
          id="search"
          className="text-[16px]"
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email, username..."
        />
        {query.isFetching ? (
          <Dot size={43} className="absolute right-[0rem] top-[-0.22rem] animate-ping text-slate-500" />
        ) : null}
      </div>
      {users?.map((user) => <User key={user.id} user={user} />)}
    </>
  );
}

function User({ user }: { user: Exclude<RouterOutputs['users']['find'], null>[number] }) {
  const router = useRouter();
  const [isSent, setIsSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const queryIsSent = api.friends.requests.isSent.useQuery({ id: user.id }, { onSuccess: (d) => setIsSent(d) });
  const queryIsPending = api.friends.requests.isPending.useQuery(
    { id: user.id },
    { onSuccess: (d) => setIsPending(d) },
  );
  const queryIsFriend = api.friends.requests.isFriend.useQuery({ id: user.id }, { onSuccess: (d) => setIsFriend(d) });

  const sendFriendRequest = api.friends.requests.send.useMutation({
    onSuccess: () => {
      queryIsSent.refetch().catch(console.error);
      router.refresh();
    },
  });

  const acceptFriendRequest = api.friends.requests.accept.useMutation({
    onSuccess: () => {
      queryIsFriend.refetch().catch(console.error);
      router.refresh();
    },
  });

  const isFetching = useMemo(
    () => queryIsSent.isFetching || queryIsPending.isFetching || queryIsFriend.isFetching,
    [queryIsSent.isFetching, queryIsPending.isFetching, queryIsFriend.isFetching],
  );

  return (
    <div className="my-2 flex items-center rounded-md border border-slate-100 p-4 hover:border-slate-900 hover:shadow-md">
      <div className="flex items-center justify-center">
        <Avatar className="mr-4">
          <AvatarImage src={user.imageUrl ?? ''} alt={`@${user.username}`} />
          <AvatarFallback>
            <AvatarIcon />
          </AvatarFallback>
        </Avatar>
        <div>
          {user.firstName} {user.lastName} {user.username ? `(@${user.username})` : ''}
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        {isFetching ? (
          <Button disabled>
            <Loader2 className="animate-spin" />
          </Button>
        ) : null}

        {!isFetching && !isPending && !isFriend ? (
          <ButtonWithDialog
            onConfirm={async () => {
              await sendFriendRequest.mutateAsync({ id: user.id });
            }}
            title="Send friend request"
            description={`Are you sure you want to send a friend request to ${user.firstName} ${user.lastName}${user.username ? `(@${user.username})` : ''}?`}
          >
            <Button disabled={isSent} className="bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-slate-100">
              <UserRoundPlus />
            </Button>
          </ButtonWithDialog>
        ) : null}

        {!isFetching && isPending && !isFriend ? (
          <ButtonWithDialog
            onConfirm={async () => {
              await acceptFriendRequest.mutateAsync({ id: user.id });
            }}
            title="Accept friend request"
            description={`Are you sure you want to accept the friend request from ${user.firstName} ${user.lastName}${user.username ? `(@${user.username})` : ''}?`}
          >
            <Button className="bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-slate-100">
              <UserRoundCheck />
            </Button>
          </ButtonWithDialog>
        ) : null}

        {!isFetching && isFriend ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-description="already a friend"
                  className="cursor-not-allowed bg-slate-100 text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                >
                  <UserRoundCheck />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-slate-100">Already a friend</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}

        <ButtonWithDialog
          onConfirm={async () => {
            console.log('blocking ', user.id);
            await new Promise<void>((res) => setTimeout(res, 1000));
            console.log('blocked ', user.id);
          }}
          title="Block user"
          description={`Are you sure you want to block ${user.firstName} ${user.lastName}${user.username ? `(@${user.username})` : ''}?`}
        >
          <Button disabled className="bg-red-100 text-slate-900 hover:bg-red-600 hover:text-slate-100">
            <UserRoundX />
          </Button>
        </ButtonWithDialog>
      </div>
    </div>
  );
}

function ButtonWithDialog({
  children,
  title,
  description,
  onConfirm,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
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
        <DialogFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            onClick={() => {
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
            <Button type="submit" variant="destructive" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
