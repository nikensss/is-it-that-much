import currencySymbolMap from 'currency-symbol-map/map';
import { formatInTimeZone } from 'date-fns-tz';
import UpdateExpense from '~/app/dashboard/my-expenses/(transactions)/expenses/update-expense';
import TransactionsOverview from '~/app/dashboard/my-expenses/(transactions)/transactions';
import { TableCell, TableRow } from '~/components/ui/table';
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
    <TransactionsOverview
      timezone={timezone}
      title="Expenses"
      currencySymbol={currencySymbol ?? '€'}
      transactions={expenses.map((e) => {
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
                <TableCell>{e.TransactionsTags.map((t) => t.tag.name).join(', ')}</TableCell>
              </TableRow>
            }
          />
        );
      })}
    />
  );
}

export const dynamic = 'force-dynamic';
