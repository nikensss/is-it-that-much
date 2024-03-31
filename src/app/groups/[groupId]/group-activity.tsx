import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import DateDisplay from '~/app/_components/date-display';
import { GroupList, GroupListBody, GroupListItem, GroupListTitle } from '~/app/groups/[groupId]/group-list';
import RegisterSettlement from '~/app/groups/[groupId]/register-settlement.client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { RouterOutputs } from '~/trpc/shared';

export default function RecentGroupActivity({
  expenses,
  settlements,
  user,
  group,
}: {
  user: RouterOutputs['users']['get'];
  expenses: RouterOutputs['groups']['expenses']['recent'];
  settlements: RouterOutputs['groups']['settlements']['recent'];
  group: Exclude<RouterOutputs['groups']['get'], null>;
}) {
  const settlementListItems = settlements.map((s) => ({
    date: s.date,
    id: s.id,
    component: <RegisteredSettlementView key={s.id} {...{ settlement: s, user, group }} />,
  }));
  const expenseListItems = expenses.map((e) => ({
    date: e.transaction.date,
    id: e.id,
    component: <SharedTransactionView key={e.id} {...{ sharedTransaction: e, user }} />,
  }));

  const allItems = [...settlementListItems, ...expenseListItems].sort((a, b) => b.date.getTime() - a.date.getTime());
  return (
    <GroupList>
      <GroupListTitle>Recent activity</GroupListTitle>
      <GroupListBody>{allItems.slice(0, 5).map((item) => item.component)}</GroupListBody>
    </GroupList>
  );
}

function SharedTransactionView({
  sharedTransaction,
  user,
}: {
  user: RouterOutputs['users']['get'];
  sharedTransaction: RouterOutputs['groups']['expenses']['recent'][number];
}) {
  const userPaid = sharedTransaction.TransactionSplit.some((s) => s.user.id === user.id && s.paid > 0);
  const payers = sharedTransaction.TransactionSplit.filter((s) => s.paid > 0)
    .map((s) => s.user)
    .filter((u) => u.id !== user.id);

  if (userPaid) payers.push(user);
  const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  const payersNames = payers.filter((p) => p.id !== user.id).map((p) => `${p.firstName} ${p.lastName}`);
  if (userPaid) payersNames.push('you');

  return (
    <Link href={`/groups/${sharedTransaction.groupId}/expenses/${sharedTransaction.id}`}>
      <GroupListItem>
        <div className="flex flex-col-reverse items-center lg:flex-row-reverse">
          {payers.reverse().map((p) => (
            <Avatar key={p.id} className="-mb-6 first:mb-0 hover:z-10 lg:-mr-6 lg:mb-0 lg:first:mr-0">
              <AvatarImage src={p.imageUrl ?? ''} alt={`@${p.username}`} />
              <AvatarFallback>
                <AvatarIcon />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex flex-col">
          <p>
            <span className="inline-block first-letter:uppercase">{formatter.format(payersNames)}</span> paid{' '}
            {sharedTransaction.transaction.amount / 100}
            {currencySymbolMap[user.currency ?? 'EUR']} for{' '}
            <span className="inline-block first-letter:lowercase">{sharedTransaction.transaction.description}</span>
          </p>
          <div className="text-xs text-gray-500">
            <DateDisplay timezone={user.timezone} date={sharedTransaction.transaction.date} />
          </div>
        </div>
      </GroupListItem>
    </Link>
  );
}

function RegisteredSettlementView({
  settlement,
  user,
  group,
}: {
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  settlement: RouterOutputs['groups']['settlements']['recent'][number];
}) {
  const parts: string[] = [];
  if (settlement.from.id === user.id) {
    parts.push(`You paid ${settlement.to.firstName} ${settlement.to.lastName}`);
  } else {
    parts.push(`${settlement.from.firstName} ${settlement.from.lastName} paid`);
  }

  if (settlement.to.id === user.id) {
    parts.push('you');
  } else {
    parts.push(`${settlement.to.firstName} ${settlement.to.lastName}`);
  }

  parts.push(`${settlement.amount / 100} ${currencySymbolMap[user.currency ?? 'EUR']}`);

  return (
    <RegisterSettlement {...{ group, user, settlement }}>
      <GroupListItem>
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
            <MoveRight className="text-primary-900 -mt-2" />
          </div>
          <Avatar>
            <AvatarImage src={settlement.to.imageUrl ?? ''} alt={`@${settlement.to.username}`} />
            <AvatarFallback>
              <AvatarIcon />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col">
          <p>{parts.join(' ')}</p>
          <div className="text-xs text-gray-500">
            <DateDisplay timezone={user.timezone} date={settlement.date} />
          </div>
        </div>
      </GroupListItem>
    </RegisterSettlement>
  );
}

export const dynamic = 'force-dynamic';
