import currencySymbolMap from 'currency-symbol-map/map';
import { notFound } from 'next/navigation';
import DateRangePicker from '~/app/dashboard/(transactions)/date-range-picker';
import GroupSettlementTableRow from '~/app/groups/[groupId]/settlements/group-settlement-table-row.client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function GroupSettlementsList({
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
  const settlements = await api.groups.settlements.period.query({
    groupId,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });

  return (
    <div>
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
        <h2 className="text-lg font-bold capitalize text-slate-200">Settlements</h2>
      </header>
      <section className="items-center justify-center gap-2 md:flex">
        <DateRangePicker timezone={timezone} />
      </section>
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-slate-900">Date</TableHead>
              <TableHead className="font-bold text-slate-900">{`Amount (${currencySymbol})`}</TableHead>
              <TableHead className="font-bold text-slate-900">From</TableHead>
              <TableHead className="font-bold text-slate-900">To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.map((settlement) => {
              return <GroupSettlementTableRow key={settlement.id} {...{ settlement, user }} />;
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
