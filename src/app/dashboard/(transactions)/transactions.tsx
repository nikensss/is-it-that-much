import type { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
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
    <div>
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold capitalize">{type.toLowerCase() + 's'}</h2>
      </header>
      <section className="items-center justify-center gap-2 md:flex">
        <DateRangePicker timezone={timezone} />
      </section>
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary-900 font-bold">Date</TableHead>
              <TableHead className="text-primary-900 font-bold">Description</TableHead>
              <TableHead className="text-primary-900 font-bold">{`Amount (${currencySymbol})`}</TableHead>
              <TableHead className="text-primary-900 font-bold">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              return (
                <UpdateTransaction
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
      </section>
    </div>
  );
}
