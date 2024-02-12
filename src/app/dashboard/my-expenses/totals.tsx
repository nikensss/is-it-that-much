import { api } from '~/trpc/server';

export default async function DashboardTotals() {
  const totalPersonalExpenses = await api.personalExpenses.totalAmountInMonth.query();
  const expenses = totalPersonalExpenses._sum?.amount ?? 0;

  const totalPersonalIncomes = await api.personalIncomes.totalAmountInMonth.query();
  const incomes = totalPersonalIncomes._sum?.amount ?? 0;

  return (
    <section className="rounded-md bg-white p-4 shadow-md">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-800">
        <h2 className="text-lg font-bold text-slate-200">Totals This Month</h2>
      </header>
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
