import { formatInTimeZone } from 'date-fns-tz';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function IncomesOverview() {
  const incomes = await api.personalIncomes.period.query();
  const user = await api.users.get.query();

  return (
    <section className="grow p-2">
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold text-slate-200">Incomes</h2>
      </header>
      <main>
        <Table>
          <TableCaption>Incomes in the current month</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-slate-900">Date</TableHead>
              <TableHead className="font-bold text-slate-900">Description</TableHead>
              <TableHead className="font-bold text-slate-900">{`Amount (${user?.currency ?? 'EUR'})`}</TableHead>
              <TableHead className="font-bold text-slate-900">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((i) => {
              return (
                <TableRow key={i.id}>
                  <TableCell>
                    {formatInTimeZone(i.date, user?.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
                  </TableCell>
                  <TableCell>{i.description}</TableCell>
                  <TableCell>{i.amount / 100}</TableCell>
                  <TableCell>{i.IncomesTags.map((t) => t.tag.name).join(', ')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </main>
    </section>
  );
}
