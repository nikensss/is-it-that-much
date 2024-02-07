import { api } from '~/trpc/server';

export default async function DashboardTotals() {
  const totalPersonalExpenses = await api.personalExpenses.inMonth.query();
  const amount = totalPersonalExpenses._sum?.amount ?? 0;

  return (
    <section className="rounded-md bg-white p-4 shadow-md">
      <h2 className="mb-2 text-lg font-bold">Totals this month</h2>
      <div className="grid items-start gap-4 md:gap-10">
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Total Expenses</h2>
          <p className="text-2xl font-semibold">${amount / 100}</p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Total Income</h2>
          <p className="text-2xl font-semibold">$0</p>
        </div>
      </div>
    </section>
  );
}
