import { endOfMonth, startOfMonth } from 'date-fns';
import { api } from '~/trpc/server';
import DailyExpensesChart from '~/app/dashboard/my-expenses/charts/daily-expenses-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import ExpensesByTagsChart from '~/app/dashboard/my-expenses/charts/expenses-by-tags-chart';

export default async function Charts() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const expenses = await api.personalExpenses.period.query({ start, end });

  return (
    <section className="flex items-center justify-center rounded-md bg-white p-4 shadow-md">
      <div className="h-full w-full">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-800">
          <h2 className="text-lg font-bold text-slate-200">Charts</h2>
        </header>
        <Tabs defaultValue="expenses-by-day" className="h-full w-full p-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expenses-by-day">Expenses by day</TabsTrigger>
            <TabsTrigger value="expenses-by-tag">Expenses by tag</TabsTrigger>
            <TabsTrigger value="incomes-by-day">Incomes by day</TabsTrigger>
            <TabsTrigger value="income-left-per-day">Income left per day</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses-by-day">
            <DailyExpensesChart expenses={expenses} start={start} end={end} />
          </TabsContent>

          <TabsContent value="expenses-by-tag">
            <ExpensesByTagsChart expenses={expenses} />
          </TabsContent>

          <TabsContent value="incomes-by-day">
            <DailyExpensesChart expenses={expenses} start={start} end={end} />
          </TabsContent>

          <TabsContent value="income-left-per-day">
            <DailyExpensesChart expenses={expenses} start={start} end={end} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
