import type { ChartDataset } from 'chart.js';
import { addDays, endOfMonth, isAfter, startOfMonth } from 'date-fns';
import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz';
import { BarChart3 } from 'lucide-react';
import tailwindConfig from 'tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
import BarChart from '~/app/dashboard/charts/bar-chart.client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/trpc/server';
import type { RouterOutputs } from '~/trpc/shared';

export default async function GroupCharts({
  group,
  user,
}: {
  user: RouterOutputs['users']['get'];
  group: Exclude<RouterOutputs['groups']['get'], null>;
}) {
  const timezone = user.timezone ?? 'Europe/Amsterdam';
  const users = group.UserGroup.map((e) => e.user);

  const now = new Date();
  const preferredTimezoneOffset = getTimezoneOffset(timezone);
  const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
  const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

  const [expenses, settlements] = await Promise.all([
    api.groups.expenses.period.query({ groupId: group.id, from, to }),
    api.groups.settlements.period.query({ groupId: group.id, from, to }),
  ]);

  const {
    labels,
    datasets: { paidByDay, owedByDay, sentByDay, receivedByDay },
  } = getDatasets({ users, timezone, expenses, settlements, from, to });

  return (
    <div className="border-primary-200 flex flex-col rounded-md border p-2">
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold first-letter:uppercase">Charts</h2>
      </header>
      <Tabs defaultValue="paid-by-day" className="mt-4 h-full w-full">
        <TabsList className="flex w-full justify-between md:grid md:grid-cols-4">
          {['paid-by-day', 'owed-by-day', 'sent-by-day', 'received-by-day'].map(getTabsTrigger)}
        </TabsList>

        <TabsContent value="paid-by-day">
          <BarChart labels={labels} datasets={paidByDay} />
        </TabsContent>

        <TabsContent value="owed-by-day">
          <BarChart labels={labels} datasets={owedByDay} />
        </TabsContent>

        <TabsContent value="sent-by-day">
          <BarChart labels={labels} datasets={sentByDay} />
        </TabsContent>

        <TabsContent value="received-by-day">
          <BarChart labels={labels} datasets={receivedByDay} />
        </TabsContent>
      </Tabs>
    </div>
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

type GetDatasetsProps = {
  users: Exclude<RouterOutputs['groups']['get'], null>['UserGroup'][number]['user'][];
  timezone: string;
  expenses: RouterOutputs['groups']['expenses']['period'];
  settlements: RouterOutputs['groups']['settlements']['period'];
  from: Date;
  to: Date;
};

type GetDatasetsOutput = {
  labels: number[];
  datasets: Record<'paidByDay' | 'owedByDay' | 'sentByDay' | 'receivedByDay', ChartDataset<'bar', number[]>[]>;
};

function getDatasets({ users, timezone, expenses, settlements, from, to }: GetDatasetsProps): GetDatasetsOutput {
  const labels: number[] = [];
  for (let i = from; !isAfter(i, to); i = addDays(i, 1)) {
    labels.push(parseInt(formatInTimeZone(i, timezone, 'dd')));
  }

  const paymentsByUser = new Map<string, Map<number, number>>();
  const debtsByUser = new Map<string, Map<number, number>>();
  for (const expense of expenses) {
    const day = parseInt(formatInTimeZone(expense.transaction.date, timezone, 'dd'));
    for (const split of expense.TransactionSplit) {
      const userPayments = paymentsByUser.get(split.userId) ?? new Map<number, number>();
      const currentPayment = userPayments.get(day) ?? 0;
      userPayments.set(day, currentPayment + split.paid / 100);
      paymentsByUser.set(split.userId, userPayments);

      const userDebts = debtsByUser.get(split.userId) ?? new Map<number, number>();
      const currentDebt = userDebts.get(day) ?? 0;
      userDebts.set(day, currentDebt + split.owed / 100);
      debtsByUser.set(split.userId, userDebts);
    }
  }

  const sentSettlementsByUser = new Map<string, Map<number, number>>();
  const receivedSettlementsByUser = new Map<string, Map<number, number>>();
  for (const settlement of settlements) {
    const day = parseInt(formatInTimeZone(settlement.date, timezone, 'dd'));
    const userSentSettlements = sentSettlementsByUser.get(settlement.fromId) ?? new Map<number, number>();
    const currentSentSettlements = userSentSettlements.get(day) ?? 0;
    userSentSettlements.set(day, currentSentSettlements + settlement.amount / 100);
    sentSettlementsByUser.set(settlement.fromId, userSentSettlements);

    const userReceivedSettlements = receivedSettlementsByUser.get(settlement.toId) ?? new Map<number, number>();
    const currentReceivedSettlements = userReceivedSettlements.get(day) ?? 0;
    userReceivedSettlements.set(day, currentReceivedSettlements + settlement.amount / 100);
    receivedSettlementsByUser.set(settlement.toId, userReceivedSettlements);
  }

  const colors = resolveConfig(tailwindConfig).theme.colors;
  const unwantedColors = ['white', 'black', 'transparent', 'current', 'inherit', 'primary'];
  const availableColors = Object.keys(colors).filter((c) => !unwantedColors.includes(c));
  const userColors = new Map<string, string>();
  for (const user of users) {
    const index = Math.floor(Math.random() * Object.keys(availableColors).length);
    const key = (availableColors.splice(index, 1) ?? 'primary') as unknown as keyof typeof colors;
    userColors.set(user.id, colors[key]?.[500]);
  }
  const datasets: Record<'paidByDay' | 'owedByDay' | 'sentByDay' | 'receivedByDay', ChartDataset<'bar', number[]>[]> = {
    paidByDay: [],
    owedByDay: [],
    sentByDay: [],
    receivedByDay: [],
  };

  for (const [userId, userPayments] of paymentsByUser.entries()) {
    const user = users.find((u) => u.id === userId);

    datasets.paidByDay.push({
      backgroundColor: userColors.get(userId) ?? colors.primary[500],
      label: `${user?.firstName} ${user?.lastName}`,
      data: labels.map((d) => userPayments.get(d) ?? 0),
    });
  }

  for (const [userId, userDebts] of debtsByUser.entries()) {
    const user = users.find((u) => u.id === userId);

    datasets.owedByDay.push({
      backgroundColor: userColors.get(userId) ?? colors.primary[500],
      label: `${user?.firstName} ${user?.lastName}`,
      data: labels.map((d) => userDebts.get(d) ?? 0),
    });
  }

  for (const [userId, userSentSettlements] of sentSettlementsByUser.entries()) {
    const user = users.find((u) => u.id === userId);

    datasets.sentByDay.push({
      backgroundColor: userColors.get(userId) ?? colors.primary[500],
      label: `${user?.firstName} ${user?.lastName}`,
      data: labels.map((d) => userSentSettlements.get(d) ?? 0),
    });
  }

  for (const [userId, userReceivedSettlements] of receivedSettlementsByUser.entries()) {
    const user = users.find((u) => u.id === userId);

    datasets.receivedByDay.push({
      backgroundColor: userColors.get(userId) ?? colors.primary[500],
      label: `${user?.firstName} ${user?.lastName}`,
      data: labels.map((d) => userReceivedSettlements.get(d) ?? 0),
    });
  }

  return { labels, datasets };
}
