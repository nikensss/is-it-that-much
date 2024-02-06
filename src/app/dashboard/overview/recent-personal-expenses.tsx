import Date from '~/app/_components/date';
import { api } from '~/trpc/server';

export default async function DashboardRecentPersonalExpenses() {
  const personalExpenses = await api.personalExpenses.recent.query();

  function Expense(personalExpense: (typeof personalExpenses)[number]) {
    return (
      <div key={personalExpense.id} className="py-2">
        <p className="text-sm">
          {personalExpense.expense.description}:
          <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">${personalExpense.expense.amount / 100}</span>
        </p>
        <div className="cursor-pointer select-all text-xs text-gray-500 dark:text-gray-400">
          <Date date={personalExpense.expense.createdAt} />
        </div>
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
