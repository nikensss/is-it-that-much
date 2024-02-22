import type { Tag, TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { formatInTimeZone } from 'date-fns-tz';
import DateRangePicker from '~/app/dashboard/my-expenses/(transactions)/date-range-picker';
import UpdateTransaction from '~/app/dashboard/my-expenses/(transactions)/update-transaction';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import type { PersonalTransactionInPeriod } from '~/server/api/routers/personal-transactions';
import { api } from '~/trpc/server';

export type TransactionOverviewProps = {
  type: TransactionType;
  searchParams: Record<string, string | undefined>;
};

export default async function TransactionsOverview({ type, searchParams }: TransactionOverviewProps) {
  console.log({ from: searchParams.from });
  const user = await api.users.get.query();
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'] ?? '€';

  const { from, to } = searchParams;
  const { transactions, tags } = await getTransactions({ type, from, to });

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((e) => {
                return (
                  <UpdateTransaction
                    key={e.id}
                    transaction={e}
                    weekStartsOn={weekStartsOn}
                    timezone={timezone}
                    tags={tags.map((t) => ({ ...t, text: t.name }))}
                    trigger={
                      <TableRow key={e.id} className="cursor-pointer">
                        <TableCell>{formatInTimeZone(e.date, timezone, 'LLLL d, yyyy')}</TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell>{e.amount / 100}</TableCell>
                        <TableCell>{e.TransactionsTags.map((t) => t.tag.name).join(', ')}</TableCell>
                      </TableRow>
                    }
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

type GetTransactionInput = {
  type: TransactionType;
  from: string | undefined;
  to: string | undefined;
};

function getTransactions({
  type,
  from,
  to,
}: GetTransactionInput): Promise<{ transactions: PersonalTransactionInPeriod[]; tags: Tag[] }> {
  switch (type) {
    case 'INCOME':
      return getIncomes({ from, to });
    case 'EXPENSE':
      return getExpenses({ from, to });
  }
}

async function getIncomes({ from, to }: Omit<GetTransactionInput, 'type'>) {
  const transactions = await api.personalIncomes.period.query({
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  const tags = await api.tags.incomes.query();

  return { transactions, tags };
}

async function getExpenses({ from, to }: Omit<GetTransactionInput, 'type'>) {
  const transactions = await api.personalExpenses.period.query({
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  const tags = await api.tags.incomes.query();

  return { transactions, tags };
}
