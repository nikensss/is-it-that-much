import currencySymbolMap from 'currency-symbol-map/map';
import { formatInTimeZone } from 'date-fns-tz';
import DateRangePicker from '~/app/dashboard/my-expenses/expenses/date-range-picker';
import UpdateExpense from '~/app/dashboard/my-expenses/expenses/update-expense';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function ExpenseOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { from, to } = searchParams;

  const expenses = await api.personalExpenses.period.query({
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  const tags = await api.tags.expenses.query();
  const user = await api.users.get.query();
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  return (
    <main className="grow bg-gray-100 p-2">
      <div className="rounded-md bg-white p-4 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">Expenses</h2>
        </header>
        <section className="flex items-center justify-center gap-2">
          <DateRangePicker timezone={timezone} />
        </section>
        <section>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-slate-900">Date</TableHead>
                <TableHead className="font-bold text-slate-900">Description</TableHead>
                <TableHead className="font-bold text-slate-900">{`Amount (${currencySymbol})`}</TableHead>
                <TableHead className="font-bold text-slate-900">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => {
                return (
                  <UpdateExpense
                    key={e.id}
                    expense={e}
                    weekStartsOn={weekStartsOn}
                    timezone={timezone}
                    tags={tags.map((t) => ({ ...t, text: t.name }))}
                    trigger={
                      <TableRow key={e.id} className="cursor-pointer">
                        <TableCell>{formatInTimeZone(e.date, timezone, 'LLLL d, yyyy')}</TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell>{e.amount / 100}</TableCell>
                        <TableCell>{e.ExpensesTags.map((t) => t.tag.name).join(', ')}</TableCell>
                      </TableRow>
                    }
                  />
                );
              })}
            </TableBody>
          </Table>
        </section>
      </div>
    </main>
  );
}
