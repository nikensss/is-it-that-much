import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { MoveRight } from 'lucide-react';
import {
  GroupList,
  GroupListBody,
  GroupListItem,
  GroupListItemLink,
  GroupListTitle,
} from '~/app/groups/[groupId]/group-list';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { RouterOutputs } from '~/trpc/shared';

export type GroupBalanceProps = {
  balance: RouterOutputs['groups']['balance'];
  user: RouterOutputs['users']['get'];
};

export default async function GroupBalance({ balance, user }: GroupBalanceProps) {
  return (
    <GroupList>
      <GroupListTitle>Balance</GroupListTitle>
      <GroupListBody>
        {balance.map((settlement) => (
          <GroupListItem key={`${settlement.from.id}-${settlement.to.id}`}>
            <Settlement key={`${settlement.from.id}-${settlement.to.id}`} {...{ settlement, user }} />
          </GroupListItem>
        ))}
      </GroupListBody>
    </GroupList>
  );
}

type SettlementProps = {
  settlement: RouterOutputs['groups']['balance'][number];
  user: RouterOutputs['users']['get'];
};

function Settlement({ settlement, user }: SettlementProps) {
  const parts: string[] = [];
  if (settlement.from.id === user.id) {
    parts.push(`You owe ${settlement.to.firstName} ${settlement.to.lastName}`);
  } else {
    parts.push(`${settlement.from.firstName} ${settlement.from.lastName} owes`);
  }

  if (settlement.to.id === user.id) {
    parts.push('you');
  } else {
    parts.push(`${settlement.to.firstName} ${settlement.to.lastName}`);
  }

  parts.push(`${settlement.amount / 100} ${currencySymbolMap[user.currency ?? 'EUR']}`);
  return (
    <GroupListItemLink href="#">
      <div className="flex gap-2">
        <Avatar>
          <AvatarImage src={settlement.from.imageUrl ?? ''} alt={`@${settlement.from.username}`} />
          <AvatarFallback>
            <AvatarIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <p className="text-sm">
            {settlement.amount / 100} {currencySymbolMap[user.currency ?? 'EUR']}
          </p>
          <MoveRight className="-mt-2 text-slate-900" />
        </div>
        <Avatar>
          <AvatarImage src={settlement.to.imageUrl ?? ''} alt={`@${settlement.to.username}`} />
          <AvatarFallback>
            <AvatarIcon />
          </AvatarFallback>
        </Avatar>
      </div>

      <p>{parts.join(' ')}</p>
    </GroupListItemLink>
  );
}
