import { TransactionType } from '@prisma/client';
import { endOfMonth, parse } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { BarChart3 } from 'lucide-react';
import { Block, BlockBody, BlockTitle } from '~/app/_components/block';
import ExpensesByDayChart from '~/app/dashboard/charts/expenses-by-day-chart';
import ExpensesByTagChart from '~/app/dashboard/charts/expenses-by-tag-chart';
import IncomeLeftByDay from '~/app/dashboard/charts/income-left-by-day-chart';
import IncomesByDay from '~/app/dashboard/charts/incomes-by-day-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/trpc/server';

export default async function Charts({ month, year }: { month: string; year: string }) {
  const user = await api.users.get.query();

  const timezone = user.timezone ?? 'Europe/Amsterdam';
  const time = parse(`${month}, ${year}`, 'LLLL, yyyy', Date.now());
  const from = fromZonedTime(time, timezone);
  const to = fromZonedTime(endOfMonth(time), timezone);

  const labels = Array.from({ length: toZonedTime(to, timezone).getDate() }, (_, i) => i + 1);

  const [expenses, shared, sentSettlements, incomes, receivedSettlements] = await Promise.all([
    api.transactions.personal.period.list.query({ type: TransactionType.EXPENSE, from, to }),
    api.groups.all.expenses.period.list.query({ from, to, onlyWhereUserPaid: true }),
    api.groups.all.settlements.period.list.query({ from, to, type: 'sentByCurrentUser' }),
    api.transactions.personal.period.list.query({ type: TransactionType.INCOME, from, to }),
    api.groups.all.settlements.period.list.query({ from, to, type: 'receivedByCurrentUser' }),
  ]);

  return (
    <Block>
      <BlockTitle>Charts</BlockTitle>
      <BlockBody>
        <Tabs defaultValue="expenses-by-day" className="mt-4 h-full w-full">
          <TabsList className="flex w-full justify-between md:grid md:grid-cols-4">
            {['expenses-by-day', 'expenses-by-tag', 'incomes-by-day', 'income-left'].map(getTabsTrigger)}
          </TabsList>

          <TabsContent value="expenses-by-day">
            <ExpensesByDayChart {...{ timezone, expenses, shared, settlements: sentSettlements, user, labels }} />
          </TabsContent>

          <TabsContent value="expenses-by-tag">
            <ExpensesByTagChart {...{ expenses, shared, settlements: sentSettlements, user }} />
          </TabsContent>

          <TabsContent value="incomes-by-day">
            <IncomesByDay {...{ timezone, incomes, settlements: receivedSettlements, labels }} />
          </TabsContent>

          <TabsContent value="income-left">
            <IncomeLeftByDay
              {...{ timezone, expenses, shared, sentSettlements, incomes, receivedSettlements, labels, user }}
            />
          </TabsContent>
        </Tabs>
      </BlockBody>
    </Block>
  );
}

function getTabsTrigger(value: string) {
  return (
    <TabsTrigger key={value} value={value} className="responsive-tab-trigger">
      <span className="compact animate-pulse">
        <BarChart3 />
      </span>
      <span className="full first-letter:uppercase">{value.replace(/-/g, ' ')}</span>
    </TabsTrigger>
  );
}
