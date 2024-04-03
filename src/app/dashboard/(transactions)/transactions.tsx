import type { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import DateRangePicker from '~/app/dashboard/(transactions)/date-range-picker';
import UpdateTransaction from '~/app/dashboard/(transactions)/update-transaction';
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

  const { from, to } = searchParams;
  const transactions = await api.transactions.personal.period.query({
    type,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  const tags = await api.tags.all.query({ type });

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
          <TableBody>
            {transactions.map((transaction) => {
              return (
                <UpdateTransaction
                  currency={user.currency}
                  key={transaction.id}
                  transaction={transaction}
                  weekStartsOn={weekStartsOn}
                  timezone={timezone}
                  tags={tags}
                />
              );
            })}
          </TableBody>
        </Table>
      </BlockBody>
    </BlockBody>
  );
}
