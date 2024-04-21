import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import DateRangePicker from '~/app/dashboard/(transactions)/date-range-picker.client';
import { SharedExpenseRow } from '~/app/dashboard/(transactions)/shared-expense-row.client';
import { SettlementRow } from '~/app/dashboard/(transactions)/settlement-row';
import { PersonalTransactionRow } from '~/app/dashboard/(transactions)/personal-transaction-row.client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export type TransactionOverviewProps = {
  type: TransactionType;
  searchParams: Record<string, string | undefined>;
};

export async function TransactionList({ type, searchParams }: TransactionOverviewProps) {
  const user = await api.users.get.query();
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'] ?? '€';
  const currency = user.currency;

  const tags = await api.tags.all.query({ type });
  const { from, to } = searchParams;
  const transactions: { date: Date; element: JSX.Element }[] = [];

  const personal = await api.transactions.personal.period.list.query({
    type,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  transactions.push(
    ...personal.map((t) => ({
      date: t.date,
      element: (
        <PersonalTransactionRow
          {...{ currency, key: `personal-${t.id}`, transaction: t, weekStartsOn, timezone, tags }}
        />
      ),
    })),
  );

  const isExpense = type === TransactionType.EXPENSE;
  const shared = isExpense
    ? await api.groups.all.expenses.period.list.query({
        onlyWhereUserPaid: true,
        from: from ? new Date(from) : null,
        to: to ? new Date(to) : null,
      })
    : [];
  transactions.push(
    ...shared.map((s) => ({
      date: s.transaction.date,
      element: <SharedExpenseRow {...{ shared: s, user, id: `shared-${s.id}` }} />,
    })),
  );

  const settlements = await api.groups.all.settlements.period.list.query({
    type: isExpense ? 'sentByCurrentUser' : 'receivedByCurrentUser',
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  transactions.push(
    ...settlements.map((s) => ({
      date: s.date,
      element: <SettlementRow key={`settlements-${s.id}`} group={s.group} settlement={s} user={user} />,
    })),
  );

  return (
    <BlockBody>
      <BlockTitle>{type.toLowerCase() + 's'}</BlockTitle>
      <BlockBody>
        <div className="items-center justify-center gap-2 md:flex">
          <DateRangePicker
            weekStartsOn={user.weekStartsOn}
            timezone={timezone}
            from={from ? new Date(from) : null}
            to={to ? new Date(to) : null}
          />
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
          <TableBody>
            {transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).map(({ element }) => element)}
          </TableBody>
        </Table>
      </BlockBody>
    </BlockBody>
  );
}
