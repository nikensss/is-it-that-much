import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { MoveRight } from 'lucide-react';
import {
  Block,
  BlockBody,
  BlockList,
  BlockListItem,
  BlockListItemBody,
  BlockTitle,
} from '~/app/_components/block/block';
import RegisterSettlement from '~/app/groups/[groupId]/register-settlement.client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { RouterOutputs } from '~/trpc/shared';

export type GroupBalanceProps = {
  balance: RouterOutputs['groups']['balance'];
  user: RouterOutputs['users']['get'];
  group: Exclude<RouterOutputs['groups']['get'], null>;
};

export default async function GroupBalance({ group, balance, user }: GroupBalanceProps) {
  return (
    <Block>
      <BlockTitle>Balance</BlockTitle>
      <BlockBody>
        <BlockList className="flex grow flex-col gap-0.5">
          {balance.map((settlement) => (
            <SuggestedSettlement key={`${settlement.from.id}-${settlement.to.id}`} {...{ group, settlement, user }} />
          ))}
        </BlockList>
      </BlockBody>
    </Block>
  );
}

type SuggestedSettlementProps = {
  settlement: RouterOutputs['groups']['balance'][number];
  user: RouterOutputs['users']['get'];
  group: Exclude<RouterOutputs['groups']['get'], null>;
};

function SuggestedSettlement({ settlement, user, group }: SuggestedSettlementProps) {
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
    <RegisterSettlement {...{ settlement, user, group }}>
      <BlockListItem>
        <BlockListItemBody>
          <div className="flex gap-2">
            <Avatar>
              <AvatarImage src={settlement.from.imageUrl ?? ''} alt={`@${settlement.from.username}`} />
              <AvatarFallback>
                <AvatarIcon />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <p className="whitespace-nowrap text-nowrap text-sm">
                {settlement.amount / 100} {currencySymbolMap[user.currency ?? 'EUR']}
              </p>
              <MoveRight className="-mt-2 animate-bounce-sideways text-primary-900" />
            </div>
            <Avatar>
              <AvatarImage src={settlement.to.imageUrl ?? ''} alt={`@${settlement.to.username}`} />
              <AvatarFallback>
                <AvatarIcon />
              </AvatarFallback>
            </Avatar>
          </div>

          <p>{parts.join(' ')}</p>
        </BlockListItemBody>
      </BlockListItem>
    </RegisterSettlement>
  );
}
