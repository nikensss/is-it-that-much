import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import DateRangePicker from '~/app/dashboard/(transactions)/date-range-picker.client';
import SharedExpense from '~/app/dashboard/(transactions)/shared-expense.client';
import UpdateSettlement from '~/app/dashboard/(transactions)/update-settlement';
import UpdateTransaction from '~/app/dashboard/(transactions)/update-transaction.client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export type TransactionOverviewProps = {
  type: TransactionType;
  searchParams: Record<string, string | undefined>;
};

export default async function TransactionsOverview({ type, searchParams }: TransactionOverviewProps) {
  const user = await api.users.get.query();
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'] ?? '€';

  const tags = await api.tags.all.query({ type });
  const { from, to } = searchParams;
  const personal = (
    await api.transactions.personal.period.list.query({
      type,
      from: from ? new Date(from) : null,
      to: to ? new Date(to) : null,
    })
  ).map((t) => ({
    date: t.date,
    element: (
      <UpdateTransaction
        currency={user.currency}
        key={t.id}
        transaction={t}
        weekStartsOn={weekStartsOn}
        timezone={timezone}
        tags={tags}
      />
    ),
  }));

  const shared = (
    type === TransactionType.EXPENSE ? await api.groups.all.expenses.period.list.query({ onlyWhereUserPaid: true }) : []
  ).map((s) => ({ date: s.transaction.date, element: <SharedExpense {...{ shared: s, user }} /> }));

  const settlements = (
    await api.groups.all.settlements.period.list.query({
      type: type === TransactionType.EXPENSE ? 'sentByCurrentUser' : 'receivedByCurrentUser',
    })
  ).map((s) => ({ date: s.date, element: <UpdateSettlement key={s.id} group={s.group} settlement={s} user={user} /> }));

  const transactions = [...personal, ...shared, ...settlements]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ element }) => element);

  return (
    <BlockBody>
      <BlockTitle>{type.toLowerCase() + 's'}</BlockTitle>
      <BlockBody>
        <div className="items-center justify-center gap-2 md:flex">
          <DateRangePicker timezone={timezone} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-primary-900">Date</TableHead>
              <TableHead className="font-bold text-primary-900">Description</TableHead>
              <TableHead className="font-bold text-primary-900">{`Amount (${currencySymbol})`}</TableHead>
              <TableHead className="font-bold text-primary-900">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{transactions}</TableBody>
        </Table>
      </BlockBody>
    </BlockBody>
  );
}
