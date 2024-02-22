import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import DateDisplay, { type DateDisplayProps } from '~/app/_components/date-display';
import { Badge } from '~/components/ui/badge';
import type { PersonalTransactionExtended } from '~/server/api/routers/personal-transactions';
import { api } from '~/trpc/server';

export default async function DashboardRecentTrasnsactions() {
  const [expenses, incomes, user] = await Promise.all([
    api.personalTransactions.recent.query({ type: TransactionType.EXPENSE }),
    api.personalTransactions.recent.query({ type: TransactionType.INCOME }),
    api.users.get.query(),
  ]);

  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  return (
    <div className="rounded-md bg-white p-4 shadow-md">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold text-slate-200">Recent Transactions</h2>
      </header>
      <div className="flex flex-col md:flex-row">
        <DashboardRecentTransactionsCard
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
          title={'Expenses'}
          transactions={expenses}
        />
        <div className="self-stretch border-b border-r border-gray-400"></div>
        <DashboardRecentTransactionsCard
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
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
  timezone: DateDisplayProps['timezone'];
  transactions: PersonalTransactionExtended[];
};

function DashboardRecentTransactionsCard({
  currencySymbol,
  title,
  timezone,
  transactions,
}: DashboardRecentTransactionCardParams) {
  function Transaction({ transaction }: PersonalTransactionExtended) {
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

  const transactionElements = transactions.map((e) => Transaction(e));
  while (transactionElements.length < 3) {
    transactionElements.push(PlaceholderTransaction(transactionElements.length + 1));
  }

  return (
    <div className="m-2 flex-1 bg-white p-4">
      <h2 className="mb-2 text-center text-lg font-bold">{title}</h2>
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
