'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { RouterOutputs } from '~/trpc/shared';

export default function AvatarStack({
  users,
}: {
  users: RouterOutputs['groups']['expenses']['period'][number]['TransactionSplit'][number]['user'][];
}) {
  return (
    <div className="flex flex-col-reverse items-center justify-end lg:flex-row-reverse">
      {users.reverse().map((user) => (
        <Avatar key={user.id} className="-mb-6 first:mb-0 lg:-mr-6 lg:mb-0 lg:first:mr-0 lg:hover:z-10">
          <AvatarImage src={user.imageUrl ?? ''} alt={`@${user.username}`} />
          <AvatarFallback>
            <AvatarIcon />
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
