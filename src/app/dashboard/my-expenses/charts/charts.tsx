import { endOfMonth, startOfMonth } from 'date-fns';
import { api } from '~/trpc/server';
import ExpensesByDayChart from '~/app/dashboard/my-expenses/charts/expenses-by-day-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import ExpensesByTagChart from '~/app/dashboard/my-expenses/charts/expenses-by-tag-chart';
import IncomesByDay from '~/app/dashboard/my-expenses/charts/incomes-by-day-chart';
import IncomeLeftByDay from '~/app/dashboard/my-expenses/charts/income-left-by-day-chart';
import { getTimezoneOffset } from 'date-fns-tz';
import { BarChart3 } from 'lucide-react';

export default async function Charts() {
  const user = await api.users.get.query();
  const timezone = user?.timezone ?? 'Europe/Amsterdam';

  const now = Date.now();
  const preferredTimezoneOffset = getTimezoneOffset(timezone);
  const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
  const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

  const expenses = await api.personalExpenses.period.query({ from, to });
  const incomes = await api.personalIncomes.period.query({ from, to });

  return (
    <section className="flex items-center justify-center rounded-md bg-white p-4 shadow-md">
      <div className="h-full w-full">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">Charts</h2>
        </header>
        <Tabs defaultValue="expenses-by-day" className="mt-4 h-full w-full">
          <TabsList className="flex w-full justify-between md:grid md:grid-cols-4">
            {['expenses-by-day', 'expenses-by-tag', 'incomes-by-day', 'income-left'].map(getTabsTrigger)}
          </TabsList>

          <TabsContent value="expenses-by-day">
            <ExpensesByDayChart timezone={timezone} expenses={expenses} from={from} to={to} />
          </TabsContent>

          <TabsContent value="expenses-by-tag">
            <ExpensesByTagChart expenses={expenses} />
          </TabsContent>

          <TabsContent value="incomes-by-day">
            <IncomesByDay timezone={timezone} incomes={incomes} from={from} to={to} />
          </TabsContent>

          <TabsContent value="income-left">
            <IncomeLeftByDay timezone={timezone} incomes={incomes} expenses={expenses} from={from} to={to} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function getTabsTrigger(value: string) {
  return (
    <TabsTrigger value={value} className="responsive-tab-trigger">
      <span className="compact animate-pulse">
        <BarChart3 />
      </span>
      <span className="full capitalize">{value.replace(/-/g, ' ')}</span>
    </TabsTrigger>
  );
}
