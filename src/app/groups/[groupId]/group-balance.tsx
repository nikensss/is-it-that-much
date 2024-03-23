import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Separator } from '~/components/ui/separator';
import type { RouterOutputs } from '~/trpc/shared';

export type GroupBalanceProps = {
  balance: RouterOutputs['groups']['balance'];
  user: RouterOutputs['users']['get'];
};

export default async function GroupBalance({ balance, user }: GroupBalanceProps) {
  return (
    <div className="flex grow flex-col rounded-md border border-slate-200 p-2">
      <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">Balance</h2>
      </header>
      <div className="flex grow flex-col gap-2">
        {balance.map((settlement) => (
          <>
            <Settlement key={`${settlement.from.id}-${settlement.to.id}`} {...{ settlement, user }} />
            <Separator className="last:hidden" />
          </>
        ))}
      </div>
    </div>
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
    <Link href="#" className="mx-2 flex items-center gap-2 rounded-md p-1 lg:hover:bg-slate-900/20">
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
    </Link>
  );
}
