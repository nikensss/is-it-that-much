import { AvatarIcon } from '@radix-ui/react-icons';
import currencySymbolMap from 'currency-symbol-map/map';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { RouterOutputs } from '~/trpc/shared';

export default async function GroupPage({
  transactions,
  user,
}: {
  user: RouterOutputs['users']['get'];
  transactions: RouterOutputs['groups']['expenses']['recent'];
}) {
  return (
    <div className="flex grow flex-col rounded-md border border-slate-200 p-2">
      <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">Recent expenses</h2>
      </header>
      <div className="flex grow flex-col gap-2">
        {transactions.map((t) => (
          <SharedTransactionView key={t.id} {...{ sharedTransaction: t, user }} />
        ))}
      </div>
    </div>
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
    <div className="flex items-center gap-2 border-b border-slate-200 p-2 last:border-none">
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
      <div>
        <span className="inline-block first-letter:uppercase">{formatter.format(payersNames)}</span> paid{' '}
        {sharedTransaction.transaction.amount / 100}
        {currencySymbolMap[user.currency ?? 'EUR']} on {format(sharedTransaction.transaction.date, 'MMMM do, yyyy')} for{' '}
        <span className="inline-block first-letter:lowercase">{sharedTransaction.transaction.description}</span>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
