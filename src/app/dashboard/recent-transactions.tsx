import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import Link from 'next/link';
import DateDisplay, { type DateDisplayProps } from '~/app/_components/date-display';
import { Badge } from '~/components/ui/badge';
import { api } from '~/trpc/server';
import type { RouterOutputs } from '~/trpc/shared';

export default async function DashboardRecentTrasnsactions() {
  const [expenses, incomes, user] = await Promise.all([
    api.transactions.personal.recent.query({ type: TransactionType.EXPENSE }),
    api.transactions.personal.recent.query({ type: TransactionType.INCOME }),
    api.users.get.query(),
  ]);

  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-2">
      <header className="mb-0 mt-0.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold text-slate-200">Recent Transactions</h2>
      </header>
      <div className="flex flex-col md:my-4 md:flex-row">
        <DashboardRecentTransactionsCard
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
          href="/dashboard/expenses"
          title={'Expenses'}
          transactions={expenses}
        />
        <div className="self-stretch border-b border-r border-gray-400"></div>
        <DashboardRecentTransactionsCard
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
          href="/dashboard/incomes"
          title={'Incomes'}
          transactions={incomes}
        />
      </div>
    </div>
  );
}

type DashboardRecentTransactionCardParams = {
  currencySymbol: string;
  title: string;
  href: string;
  timezone: DateDisplayProps['timezone'];
  transactions: RouterOutputs['transactions']['personal']['recent'];
};

function DashboardRecentTransactionsCard({
  currencySymbol,
  href,
  title,
  timezone,
  transactions,
}: DashboardRecentTransactionCardParams) {
  const transactionElements = transactions.map((e) => Transaction({ ...e, timezone, currencySymbol }));
  while (transactionElements.length < 3) {
    transactionElements.push(PlaceholderTransaction(transactionElements.length + 1));
  }

  return (
    <div className="m-2 flex-1 bg-white">
      <h2 className="relative mb-2 text-center text-lg font-bold">
        <Link
          href={href}
          className="relative md:after:absolute md:after:right-[-1.5rem] md:after:top-0 md:after:ml-0.5 md:after:block md:after:opacity-0 md:after:transition-all md:after:content-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LXJpZ2h0Ij48cGF0aCBkPSJNNSAxMmgxNCIvPjxwYXRoIGQ9Im0xMiA1IDcgNy03IDciLz48L3N2Zz4=')] md:hover:underline md:after:hover:translate-x-2 md:after:hover:opacity-100"
        >
          {title}
        </Link>
      </h2>
      <div className="divide-y divide-gray-200">{transactionElements}</div>
    </div>
  );
}

function PlaceholderTransaction(id: number) {
  return (
    <div key={id} className="py-2">
      <span className="pointer-events-none invisible">
        <p className="text-sm">Lorem ipsum dolor</p>
        <div className="cursor-pointer select-all text-xs text-gray-500">
          <DateDisplay timezone={null} date={new Date()} />
        </div>
      </span>
    </div>
  );
}

function Transaction({
  transaction,
  currencySymbol,
  timezone,
}: RouterOutputs['transactions']['personal']['recent'][number] & {
  currencySymbol: string;
  timezone: DateDisplayProps['timezone'];
}) {
  return (
    <div key={transaction.id} className="flex h-12 items-center py-2">
      <div className="flex-shrink-0">
        <p className="text-sm">
          {transaction.description}:
          <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
            {currencySymbol}
            {transaction.amount / 100}
          </span>
        </p>
        <div className="cursor-pointer select-all text-xs text-gray-500 dark:text-gray-400">
          <DateDisplay timezone={timezone} date={transaction.date} />
        </div>
      </div>
      <div className="ml-6 h-full overflow-hidden">
        {transaction.TransactionsTags.map(({ tag }) => {
          return (
            <Badge key={tag.id} className="pointer-events-none mx-0.5 mt-1.5 inline-block" variant="secondary">
              {tag.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
