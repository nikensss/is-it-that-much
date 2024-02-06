export default function DashboardOverview() {
  return (
    <main className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6 lg:py-2 ">
      <section className="mt-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
          <section className="rounded-md bg-white p-4 shadow-md">
            <h2 className="mb-2 text-lg font-bold">Expense Categories</h2>
            <div className="grid items-start gap-4 md:gap-10">
              <div className="rounded-md bg-white p-4 shadow-md ">
                <h2 className="mb-2 text-lg font-bold">Total Expenses</h2>
                <p className="text-2xl font-semibold">$1234.56</p>
              </div>
              <div className="rounded-md bg-white p-4 shadow-md ">
                <h2 className="mb-2 text-lg font-bold">Total Income</h2>
                <p className="text-2xl font-semibold">$5678.90</p>
              </div>
            </div>
          </section>
          <section className="rounded-md bg-white p-4 shadow-md">
            <PieChart className="aspect-[4/3] w-full" />
          </section>
        </div>
      </section>
      <section className="mt-4">
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Register Expense</h2>
          <form className="space-y-4">
            <input className="w-full" placeholder="Cost" type="number" />
            <button className="w-full" type="submit">
              Register Expense
            </button>
          </form>
        </div>
      </section>
      <section className="mt-4">
        <div className="rounded-md bg-white p-4 shadow-md ">
          <h2 className="mb-2 text-lg font-bold">Recent Transactions</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            <div className="py-2">
              <p className="text-sm">Bought groceries</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">-$45.67</p>
            </div>
            <div className="py-2">
              <p className="text-sm">Received salary</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">+$2000.00</p>
            </div>
            <div className="py-2">
              <p className="text-sm">Paid rent</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">-$800.00</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PieChart(props: React.ComponentProps<'div'>) {
  return <div {...props}>This is a pie chart!</div>;
}
