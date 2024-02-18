import currencySymbolMap from 'currency-symbol-map/map';
import { formatInTimeZone } from 'date-fns-tz';
import UpdateIncome from '~/app/dashboard/my-expenses/incomes/update-income';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function IncomesOverview() {
  const incomes = await api.personalIncomes.period.query();
  const tags = await api.tags.incomes.query();
  const user = await api.users.get.query();
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  return (
    <main className="grow bg-gray-100 p-2">
      <div className="rounded-md bg-white p-4 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">Incomes</h2>
        </header>
        <section>
          <Table>
            <TableCaption>Incomes in the current month</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-slate-900">Date</TableHead>
                <TableHead className="font-bold text-slate-900">Description</TableHead>
                <TableHead className="font-bold text-slate-900">{`Amount (${currencySymbol})`}</TableHead>
                <TableHead className="font-bold text-slate-900">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((i) => {
                return (
                  <UpdateIncome
                    key={i.id}
                    income={i}
                    weekStartsOn={weekStartsOn}
                    timezone={timezone}
                    tags={tags.map((t) => ({ ...t, text: t.name }))}
                    trigger={
                      <TableRow key={i.id} className="cursor-pointer">
                        <TableCell>
                          {formatInTimeZone(i.date, user?.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
                        </TableCell>
                        <TableCell>{i.description}</TableCell>
                        <TableCell>{i.amount / 100}</TableCell>
                        <TableCell>{i.IncomesTags.map((t) => t.tag.name).join(', ')}</TableCell>
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
