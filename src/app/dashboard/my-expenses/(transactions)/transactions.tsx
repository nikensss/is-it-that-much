import type { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import DateRangePicker from '~/app/dashboard/my-expenses/(transactions)/date-range-picker';
import UpdateTransaction from '~/app/dashboard/my-expenses/(transactions)/update-transaction';
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
  const transactions = await api.personalTransactions.period.query({
    type,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  const tags = await api.tags.all.query({ type });

  return (
    <main className="flex grow flex-col bg-gray-100 p-2">
      <div className="grow rounded-md bg-white p-4 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold capitalize text-slate-200">{type.toLowerCase() + 's'}</h2>
        </header>
        <section className="items-center justify-center gap-2 md:flex">
          <DateRangePicker timezone={timezone} />
        </section>
        <section>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-slate-900">Date</TableHead>
                <TableHead className="font-bold text-slate-900">Description</TableHead>
                <TableHead className="font-bold text-slate-900">{`Amount (${currencySymbol})`}</TableHead>
                <TableHead className="font-bold text-slate-900">Tags</TableHead>
                <TableHead className="font-bold text-slate-900">{/* Fake column for delete button */}</TableHead>
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
    </main>
  );
}
