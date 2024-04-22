import { TransactionType, type Tag, type Transaction } from '@prisma/client';
import currencySymbolMap from 'currency-symbol-map/map';
import { Block, BlockBody, BlockTitle } from '~/app/_components/block';
import DateDisplay, { type DateDisplayProps } from '~/app/_components/date-display';
import { Badge } from '~/components/ui/badge';
import { api } from '~/trpc/server';
import type { RouterOutputs } from '~/trpc/shared';

export default async function DashboardRecentTrasnsactions() {
  const [expenses, shared, sentSettlements, incomes, receivedSettlements, user] = await Promise.all([
    api.transactions.personal.recent.query({ type: TransactionType.EXPENSE }),
    api.groups.all.expenses.recent.query({ onlyWhereUserPaid: true }),
    api.groups.all.settlements.recent.query({ take: 3, type: 'sentByCurrentUser' }),
    api.transactions.personal.recent.query({ type: TransactionType.INCOME }),
    api.groups.all.settlements.recent.query({ take: 3, type: 'receivedByCurrentUser' }),
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
          shared={shared}
          settlements={sentSettlements}
        />
        <div className="hidden self-stretch border-b border-r border-gray-400 md:block"></div>
        <DashboardRecentTransactionsList
          currencySymbol={currencySymbol ?? '€'}
          timezone={user?.timezone}
          href="/dashboard/incomes"
          title={'Incomes'}
          transactions={incomes}
          settlements={receivedSettlements}
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
  shared?: RouterOutputs['groups']['all']['expenses']['recent'];
  settlements: RouterOutputs['groups']['all']['settlements']['recent'];
};

function DashboardRecentTransactionsList({
  currencySymbol,
  href,
  title,
  timezone,
  transactions,
  shared = [],
  settlements,
}: DashboardRecentTransactionCardParams) {
  const elements = transactions.map((e) => ({
    date: e.transaction.date.getTime(),
    element: PersonalTransaction({ personal: e, timezone, currencySymbol }),
  }));

  for (const e of shared) {
    elements.push({
      date: e.transaction.date.getTime(),
      element: SharedTransaction({ shared: e, timezone, currencySymbol }),
    });
  }

  for (const s of settlements) {
    elements.push({
      date: s.date.getTime(),
      element: Settlement({ settlement: s, timezone, currencySymbol }),
    });
  }

  while (elements.length < 3) {
    elements.push({ date: 0, element: PlaceholderTransaction(elements.length + 1) });
  }

  return (
    <BlockBody className="flex-1">
      <BlockTitle href={href}>{title}</BlockTitle>
      <BlockBody>
        <div className="divide-y divide-gray-200">
          {elements
            .sort((a, b) => b.date - a.date)
            .slice(0, 5)
            .map((e) => e.element)}
        </div>
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

function SharedTransaction({
  shared,
  currencySymbol,
  timezone,
}: {
  shared: RouterOutputs['groups']['all']['expenses']['recent'][number];
  currencySymbol: string;
  timezone: DateDisplayProps['timezone'];
}) {
  return Transaction({
    transaction: {
      id: `shared-${shared.transaction.id}`,
      description: `${shared.transaction.description} (${shared.group.name})`,
      amount: shared.TransactionSplit.reduce((acc, { paid }) => acc + paid, 0),
      date: shared.transaction.date,
    },
    tags: shared.transaction.TransactionsTags.map(({ tag }) => tag),
    currencySymbol,
    timezone,
  });
}

function Settlement({
  settlement,
  currencySymbol,
  timezone,
}: {
  settlement: RouterOutputs['groups']['all']['settlements']['recent'][number];
  currencySymbol: string;
  timezone: DateDisplayProps['timezone'];
}) {
  return Transaction({
    transaction: {
      id: `settlements-${settlement.id}`,
      description: `Settlements in ${settlement.group.name}`,
      amount: settlement.amount,
      date: settlement.date,
    },
    currencySymbol,
    timezone,
  });
}

function PersonalTransaction({
  personal,
  currencySymbol,
  timezone,
}: {
  personal: RouterOutputs['transactions']['personal']['recent'][number];
  currencySymbol: string;
  timezone: DateDisplayProps['timezone'];
}) {
  return Transaction({
    transaction: {
      id: `personal-${personal.transaction.id}`,
      description: personal.transaction.description,
      amount: personal.transaction.amount,
      date: personal.transaction.date,
    },
    tags: personal.transaction.TransactionsTags.map(({ tag }) => tag),
    currencySymbol,
    timezone,
  });
}

function Transaction({
  transaction,
  currencySymbol,
  timezone,
  tags = [],
}: {
  transaction: Pick<Transaction, 'id' | 'description' | 'amount' | 'date'>;
  tags?: Tag[];
  currencySymbol: string;
  timezone: DateDisplayProps['timezone'];
}) {
  return (
    <div key={transaction.id} className="flex h-12 items-center py-2">
      <div className="flex-shrink-0">
        <p className="text-lg first-letter:uppercase">
          <span className="font-bold">{transaction.description}</span>:
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
        {tags.map((tag) => {
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
