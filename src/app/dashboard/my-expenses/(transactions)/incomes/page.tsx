import currencySymbolMap from 'currency-symbol-map/map';
import { formatInTimeZone } from 'date-fns-tz';
import UpdateIncome from '~/app/dashboard/my-expenses/(transactions)/incomes/update-income';
import TransactionsOverview from '~/app/dashboard/my-expenses/(transactions)/transactions';
import { TableCell, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function ExpenseOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { from, to } = searchParams;

  const incomes = await api.personalIncomes.period.query({
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });
  const tags = await api.tags.incomes.query();
  const user = await api.users.get.query();
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'];

  return (
    <TransactionsOverview
      timezone={timezone}
      title="Incomes"
      currencySymbol={currencySymbol ?? '€'}
      transactions={incomes.map((i) => {
        return (
          <UpdateIncome
            key={i.id}
            income={i}
            weekStartsOn={weekStartsOn}
            timezone={timezone}
            tags={tags.map((t) => ({ ...t, text: t.name }))}
            trigger={
              <TableRow key={i.id} className="cursor-pointer">
                <TableCell>{formatInTimeZone(i.date, timezone, 'LLLL d, yyyy')}</TableCell>
                <TableCell>{i.description}</TableCell>
                <TableCell>{i.amount / 100}</TableCell>
                <TableCell>{i.TransactionsTags.map((t) => t.tag.name).join(', ')}</TableCell>
              </TableRow>
            }
          />
        );
      })}
    />
  );
}

export const dynamic = 'force-dynamic';
