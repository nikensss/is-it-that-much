import currencySymbolMap from 'currency-symbol-map/map';
import { notFound } from 'next/navigation';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import DateRangePicker from '~/app/[locale]/dashboard/(transactions)/date-range-picker.client';
import GroupSettlementTableRow from '~/app/[locale]/groups/[groupId]/settlements/group-settlement-table-row.client';
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area';
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

  const group = await api.groups.get.query({ groupId: groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query();
  const timezone = user?.timezone ?? 'Europe/Amsterdam';
  const currencySymbol = currencySymbolMap[user?.currency ?? 'EUR'] ?? '€';

  const { from, to } = searchParams;
  const settlements = await api.groups.settlements.period.list.query({
    groupId,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
  });

  return (
    <BlockBody className="flex grow flex-col gap-2">
      <BlockTitle>Settlements</BlockTitle>
      <BlockBody className="flex grow flex-col">
        <div className="items-center justify-center gap-2 md:flex">
          <DateRangePicker
            weekStartsOn={user.weekStartsOn}
            timezone={timezone}
            from={from ? new Date(from) : null}
            to={to ? new Date(to) : null}
          />
        </div>
        <ScrollArea className="max-w-[92vw] grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-primary-900">Date</TableHead>
                <TableHead className="text-nowrap font-bold text-primary-900">{`Amount (${currencySymbol})`}</TableHead>
                <TableHead className="font-bold text-primary-900">From</TableHead>
                <TableHead className="font-bold text-primary-900">To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((settlement) => {
                return <GroupSettlementTableRow key={settlement.id} {...{ settlement, group, user }} />;
              })}
            </TableBody>
          </Table>
          <ScrollBar className="mt-auto" orientation="horizontal" />
        </ScrollArea>
      </BlockBody>
    </BlockBody>
  );
}
