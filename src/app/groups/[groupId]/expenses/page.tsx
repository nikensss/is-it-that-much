import currencySymbolMap from 'currency-symbol-map/map';
import { notFound } from 'next/navigation';
import DateRangePicker from '~/app/dashboard/(transactions)/date-range-picker';
import GroupExpenseTableRow from '~/app/groups/[groupId]/expenses/group-expense-table-row.client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function GroupExpensesList({
  searchParams,
  params,
}: {
  params: Record<string, string | undefined>;
  searchParams: Record<string, string | undefined>;
}) {
  const { groupId } = params;
  if (!groupId) return notFound();

  const user = await api.users.get.query();
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'] ?? '€';

  const { from, to } = searchParams;
  const expenses = await api.groups.expenses.period.query({
    groupId,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });

  return (
    <div className="flex flex-col gap-2">
      <header className="bg-primary-900 flex h-12 items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold capitalize">Expenses</h2>
      </header>
      <section className="items-center justify-center gap-2 md:flex">
        <DateRangePicker timezone={timezone} />
      </section>
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary-900 font-bold">Date</TableHead>
              <TableHead className="text-primary-900 font-bold">Description</TableHead>
              <TableHead className="text-primary-900 font-bold">{`Amount (${currencySymbol})`}</TableHead>
              <TableHead className="text-primary-900 font-bold">Paid by</TableHead>
              <TableHead className="text-primary-900 font-bold">Paid for</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              return <GroupExpenseTableRow key={expense.id} {...{ expense, user }} />;
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
