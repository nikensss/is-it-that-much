import { api } from '~/trpc/server';

export default async function DashboardTotals() {
  const totalPersonalExpenses = await api.personalExpenses.inMonth.query();
  const expenses = totalPersonalExpenses._sum?.amount ?? 0;

  const totalPersonalIncomes = await api.personalIncomes.inMonth.query();
  const incomes = totalPersonalIncomes._sum?.amount ?? 0;

  return (
    <section className="rounded-md bg-white p-4 shadow-md">
      <h2 className="mb-2 text-lg font-bold">Totals this month</h2>
      <div className="grid items-start gap-4 md:gap-10">
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Total Expenses</h2>
          <p className="text-2xl font-semibold">${expenses / 100}</p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Total Incomes</h2>
          <p className="text-2xl font-semibold">${incomes / 100}</p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Income left</h2>
          <p className="text-2xl font-semibold">${(incomes - expenses) / 100}</p>
        </div>
      </div>
    </section>
  );
}
