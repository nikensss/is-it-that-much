'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Ban, Loader2, RotateCcw, UserRoundCheck, UserRoundMinus, UserRoundPlus, UserRoundX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ButtonWithDialog from '~/app/_components/button-with-dialog.client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils.client';
import { api } from '~/trpc/react.client';
import type { RouterOutputs } from '~/trpc/shared';

export default function UserBannerClient({
  user,
  className = '',
  isSelf = false,
}: {
  className?: string;
  user: Exclude<RouterOutputs['users']['find'], null>[number];
  isSelf?: boolean;
}) {
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

  const refetch = () => {
    queryIsSent.refetch().catch(console.error);
    queryIsPending.refetch().catch(console.error);
    queryIsFriend.refetch().catch(console.error);
  };

  const sendFriendRequest = api.friends.requests.send.useMutation({
    onSuccess: () => {
      refetch();
      router.refresh();
    },
  });

  const cancelFriendRequest = api.friends.requests.cancel.useMutation({
    onSuccess: () => {
      refetch();
      router.refresh();
    },
  });

  const acceptFriendRequest = api.friends.requests.accept.useMutation({
    onSuccess: () => {
      refetch();
      router.refresh();
    },
  });

  const rejectFriendRequest = api.friends.requests.reject.useMutation({
    onSuccess: () => {
      refetch();
      router.refresh();
    },
  });

  const removeFriend = api.friends.delete.useMutation({
    onSuccess: () => {
      refetch();
      router.refresh();
    },
  });

  const isFetching = useMemo(
    () => queryIsSent.isFetching || queryIsPending.isFetching || queryIsFriend.isFetching,
    [queryIsSent.isFetching, queryIsPending.isFetching, queryIsFriend.isFetching],
  );

  return (
    <div
      className={cn(
        'ry-2 flex select-none items-center rounded-md border border-primary-200 p-4 dark:border-primary-500 lg:hover:shadow-md lg:hover:shadow-primary-600',
        isSelf ? 'pointer-events-none bg-primary-900/20 dark:border-transparent dark:bg-primary-200/20' : '',
        className,
      )}
    >
      <div className="flex items-center justify-center">
        <Avatar className="mr-2">
          <AvatarImage src={user.imageUrl ?? ''} alt={`@${user.username}`} />
          <AvatarFallback>
            <AvatarIcon />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <p>
            {user.firstName} {user.lastName}
          </p>
          <p className={cn(user.username ? '' : 'invisible')}>{`@${user.username}`}</p>
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        {!isSelf && isFetching ? (
          <Button disabled>
            <Loader2 className="animate-spin" />
          </Button>
        ) : null}

        {!isSelf && !isFetching && !isPending && !isFriend ? (
          isSent ? (
            <ButtonWithDialog
              onConfirm={async () => {
                await cancelFriendRequest.mutateAsync({ id: user.id });
              }}
              title="Cancel friend request"
              description={`Are you sure you want to cancel your friend request sent to ${user.firstName} ${user.lastName}${user.username ? ` (@${user.username})` : ''}?`}
            >
              <Button className="bg-primary-100 text-primary-900 hover:bg-primary-900 hover:text-primary-100">
                <RotateCcw />
              </Button>
            </ButtonWithDialog>
          ) : (
            <ButtonWithDialog
              onConfirm={async () => {
                await sendFriendRequest.mutateAsync({ id: user.id });
              }}
              title="Send friend request"
              description={`Are you sure you want to send a friend request to ${user.firstName} ${user.lastName}${user.username ? ` (@${user.username})` : ''}?`}
            >
              <Button className="bg-primary-100 text-primary-900 hover:bg-primary-900 hover:text-primary-100">
                <UserRoundPlus />
              </Button>
            </ButtonWithDialog>
          )
        ) : null}

        {!isSelf && !isFetching && isPending && !isFriend ? (
          <>
            <ButtonWithDialog
              onConfirm={async () => {
                await acceptFriendRequest.mutateAsync({ id: user.id });
              }}
              title="Accept friend request"
              description={`Are you sure you want to accept the friend request from ${user.firstName} ${user.lastName}${user.username ? ` (@${user.username})` : ''}?`}
            >
              <Button className="bg-primary-100 text-primary-900 hover:bg-primary-900 hover:text-primary-100">
                <UserRoundCheck />
              </Button>
            </ButtonWithDialog>

            <ButtonWithDialog
              onConfirm={async () => {
                await rejectFriendRequest.mutateAsync({ id: user.id });
              }}
              title="Reject friend request"
              description={`Are you sure you want to reject the friend request from ${user.firstName} ${user.lastName}${user.username ? ` (@${user.username})` : ''}?`}
            >
              <Button className="bg-red-100 text-primary-900 hover:bg-red-600 hover:text-primary-100">
                <UserRoundX />
              </Button>
            </ButtonWithDialog>
          </>
        ) : null}

        {!isSelf && !isFetching && isFriend ? (
          <ButtonWithDialog
            onConfirm={async () => {
              await removeFriend.mutateAsync({ id: user.id });
            }}
            title="Remove friend"
            description={`Are you sure you want to remove ${user.firstName} ${user.lastName}${user.username ? ` (@${user.username})` : ''} from your friends list?`}
          >
            <Button className="bg-red-100 text-primary-900 hover:bg-red-600 hover:text-primary-100">
              <UserRoundMinus />
            </Button>
          </ButtonWithDialog>
        ) : null}

        {isSelf ? null : (
          <ButtonWithDialog
            title="Block user"
            description={`Are you sure you want to block ${user.firstName} ${user.lastName}${user.username ? ` (@${user.username})` : ''}?`}
          >
            <Button disabled className="bg-red-100 text-primary-900 hover:bg-red-600 hover:text-primary-100">
              <Ban />
            </Button>
          </ButtonWithDialog>
        )}
      </div>
    </div>
  );
}
