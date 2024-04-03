import { TransactionType } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { Block, BlockBody, BlockTitle } from '~/app/_components/block';
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
    <Block>
      <BlockTitle>Recent Transactions</BlockTitle>
      <BlockBody className="flex flex-col gap-2 md:flex-row">
        <DashboardRecentTransactionsList
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
          href="/dashboard/expenses"
          title={'Expenses'}
          transactions={expenses}
        />
        <div className="hidden self-stretch border-b border-r border-gray-400 md:block"></div>
        <DashboardRecentTransactionsList
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
          href="/dashboard/incomes"
          title={'Incomes'}
          transactions={incomes}
        />
      </BlockBody>
    </Block>
  );
}

type DashboardRecentTransactionCardParams = {
  currencySymbol: string;
  title: string;
  href: string;
  timezone: DateDisplayProps['timezone'];
  transactions: RouterOutputs['transactions']['personal']['recent'];
};

function DashboardRecentTransactionsList({
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
    <BlockBody className="flex-1">
      <BlockTitle href={href}>{title}</BlockTitle>
      <BlockBody>
        <div className="divide-y divide-gray-200">{transactionElements}</div>
      </BlockBody>
    </BlockBody>
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
        <div className="text-xs text-gray-500 dark:text-gray-400">
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
