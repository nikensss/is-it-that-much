import DailyExpensesChart from '~/app/dashboard/my-expenses/charts/daily-expenses-chart';

export default function Charts() {
  return (
    <section className="flex items-center justify-center rounded-md bg-white p-4 shadow-md">
      <div className="h-full w-full">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-800">
          <h2 className="text-lg font-bold text-slate-200">Charts</h2>
        </header>
        <DailyExpensesChart />
      </div>
    </section>
  );
}
