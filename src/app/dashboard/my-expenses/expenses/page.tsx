import { formatInTimeZone } from 'date-fns-tz';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function ExpenseOverview() {
  const expenses = await api.personalExpenses.period.query();
  const user = await api.users.get.query();

  return (
    <section className="grow p-2">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold text-slate-200">Expenses</h2>
      </header>
      <main>
        <Table>
          <TableCaption>Expenses in the current month</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-slate-900">Date</TableHead>
              <TableHead className="font-bold text-slate-900">Description</TableHead>
              <TableHead className="font-bold text-slate-900">{`Amount (${user?.currency ?? 'EUR'})`}</TableHead>
              <TableHead className="font-bold text-slate-900">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((e) => {
              return (
                <TableRow key={e.id}>
                  <TableCell>
                    {formatInTimeZone(e.date, user?.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
                  </TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell>{e.amount / 100}</TableCell>
                  <TableCell>{e.ExpensesTags.map((t) => t.tag.name).join(', ')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </main>
    </section>
  );
}
