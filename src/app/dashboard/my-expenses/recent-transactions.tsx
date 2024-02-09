import DateDisplay from '~/app/_components/date-display';
import { Badge } from '~/components/ui/badge';
import { api } from '~/trpc/server';

export default async function DashboardRecentTrasnsactions() {
  const personalExpenses = await api.personalExpenses.recent.query();
  const personalIncomes = await api.personalIncomes.recent.query();

  const expenses = personalExpenses.map(({ expense: { id, amount, createdAt, description, ExpensesTags } }) => {
    const tags = ExpensesTags.map((t) => ({ id: t.tag.id, name: t.tag.name }));
    return { id, amount, createdAt, description, tags };
  });

  const incomes = personalIncomes.map(({ income: { id, amount, createdAt, description, IncomesTags } }) => {
    const tags = IncomesTags.map((t) => ({ id: t.tag.id, name: t.tag.name }));
    return { id, amount, createdAt, description, tags };
  });

  return (
    <div className="rounded-md bg-white p-4 shadow-md">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-zinc-800">
        <h2 className="text-lg font-bold text-zinc-200">Recent Transactions</h2>
      </header>
      <div className="flex flex-col md:flex-row">
        <DashboardRecentTransactionsCard title={'Expenses'} transactions={expenses} />
        <div className="self-stretch border-b border-r border-gray-400"></div>
        <DashboardRecentTransactionsCard title={'Incomes'} transactions={incomes} />
      </div>
    </div>
  );
}

type Transaction = {
  amount: number;
  createdAt: Date;
  description: string;
  id: string;
  tags: { id: string; name: string }[];
};

type DashboardRecentTransactionCardParams = {
  title: string;
  transactions: Transaction[];
};

function DashboardRecentTransactionsCard({ title, transactions }: DashboardRecentTransactionCardParams) {
  function Transaction(transaction: Transaction) {
    return (
      <div key={transaction.id} className="flex h-12 items-center py-2">
        <div className="flex-shrink-0">
          <p className="text-sm">
            {transaction.description}:
            <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">${transaction.amount / 100}</span>
          </p>
          <div className="cursor-pointer select-all text-xs text-gray-500 dark:text-gray-400">
            <DateDisplay date={transaction.createdAt} />
          </div>
        </div>
        <div className="ml-6 h-full overflow-hidden">
          {transaction.tags.map((tag) => {
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
        <p className="text-sm">Lorem ipsum</p>
        <div className="cursor-pointer select-all text-xs text-gray-500">
          <DateDisplay date={new Date()} />
        </div>
      </span>
    </div>
  );
}
