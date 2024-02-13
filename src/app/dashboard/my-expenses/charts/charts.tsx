import { endOfMonth, startOfMonth } from 'date-fns';
import { api } from '~/trpc/server';
import ExpensesByDayChart from '~/app/dashboard/my-expenses/charts/expenses-by-day-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import ExpensesByTagChart from '~/app/dashboard/my-expenses/charts/expenses-by-tag-chart';
import IncomesByDay from '~/app/dashboard/my-expenses/charts/incomes-by-day-chart';
import IncomeLeftByDay from '~/app/dashboard/my-expenses/charts/income-left-by-day-chart';
import { getTimezoneOffset } from 'date-fns-tz';

export default async function Charts() {
  const user = await api.users.get.query();
  const timezone = user?.timezone ?? 'Europe/Amsterdam';

  const now = Date.now();
  const preferredTimezoneOffset = getTimezoneOffset(timezone);
  const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const start = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
  const end = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

  const expenses = await api.personalExpenses.period.query({ start, end });
  const incomes = await api.personalIncomes.period.query({ start, end });

  return (
    <section className="flex items-center justify-center rounded-md bg-white p-4 shadow-md">
      <div className="h-full w-full">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-800">
          <h2 className="text-lg font-bold text-slate-200">Charts</h2>
        </header>
        <Tabs defaultValue="expenses-by-day" className="mt-4 h-full w-full">
          <TabsList className="flex w-full justify-between md:grid md:grid-cols-4">
            <TabsTrigger value="expenses-by-day" className="responsive-tab-trigger">
              <span className="compact">&#8857;</span>
              <span className="full">Expenses by day</span>
            </TabsTrigger>
            <TabsTrigger value="expenses-by-tag" className="responsive-tab-trigger">
              <span className="compact">&#8857;</span>
              <span className="full">Expenses by tag</span>
            </TabsTrigger>
            <TabsTrigger value="incomes-by-day" className="responsive-tab-trigger">
              <span className="compact">&#8857;</span>
              <span className="full">Incomes by day</span>
            </TabsTrigger>
            <TabsTrigger value="income-left" className="responsive-tab-trigger">
              <span className="compact">&#8857;</span>
              <span className="full">Income left</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses-by-day">
            <ExpensesByDayChart timezone={timezone} expenses={expenses} start={start} end={end} />
          </TabsContent>

          <TabsContent value="expenses-by-tag">
            <ExpensesByTagChart expenses={expenses} />
          </TabsContent>

          <TabsContent value="incomes-by-day">
            <IncomesByDay timezone={timezone} incomes={incomes} start={start} end={end} />
          </TabsContent>

          <TabsContent value="income-left">
            <IncomeLeftByDay timezone={timezone} incomes={incomes} expenses={expenses} start={start} end={end} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
