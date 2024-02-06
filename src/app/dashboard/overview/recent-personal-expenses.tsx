import { api } from '~/trpc/server';

export default async function DashboardRecentPersonalExpenses() {
  const personalExpenses = await api.personalExpenses.recent.query();

  function Expense(personalExpense: (typeof personalExpenses)[number]) {
    return (
      <div className="py-2">
        <p className="text-sm">
          {personalExpense.expense.description}:
          <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">${personalExpense.expense.amount / 100}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{personalExpense.expense.createdAt?.toString()}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-white p-4 shadow-md ">
      <h2 className="mb-2 text-lg font-bold">Recent Transactions</h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-600">{personalExpenses.map((e) => Expense(e))}</div>
    </div>
  );
}
