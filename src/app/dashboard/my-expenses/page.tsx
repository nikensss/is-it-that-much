import DashboardRecentTrasnsactions from '~/app/dashboard/my-expenses/recent-transactions';
import DashboardRegisterPersonalExpense from '~/app/dashboard/my-expenses/register-transaction/register-personal-expense';
import DashboardRegisterPersonalIncome from '~/app/dashboard/my-expenses/register-transaction/register-personal-income';
import DashboardTotals from '~/app/dashboard/my-expenses/totals';

export default function MyExpenses() {
  return (
    <main className="flex-1 overflow-auto bg-gray-100 p-4">
      <section className="flex justify-around rounded-md bg-white p-4 shadow-md">
        <DashboardRegisterPersonalExpense />
        <DashboardRegisterPersonalIncome />
      </section>
      <section className="mt-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
          <DashboardTotals />
          <section className="rounded-md bg-white p-4 shadow-md">
            <PieChart className="aspect-[4/3] w-full" />
          </section>
        </div>
      </section>
      <section className="mt-4">
        <DashboardRecentTrasnsactions />
      </section>
    </main>
  );
}

function PieChart(props: React.ComponentProps<'div'>) {
  return <div {...props}>This is a pie chart!</div>;
}

export const dynamic = 'force-dynamic';
