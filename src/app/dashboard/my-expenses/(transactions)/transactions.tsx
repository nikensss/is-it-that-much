import DateRangePicker from '~/app/dashboard/my-expenses/(transactions)/date-range-picker';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';

export type TransactionOverviewProps = {
  timezone: string;
  title: string;
  currencySymbol: string;
  transactions: React.JSX.Element[];
};

export default async function TransactionsOverview({
  timezone,
  title,
  currencySymbol,
  transactions,
}: TransactionOverviewProps) {
  return (
    <main className="flex grow flex-col bg-gray-100 p-2">
      <div className="grow rounded-md bg-white p-4 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">{title}</h2>
        </header>
        <section className="items-center justify-center gap-2 md:flex">
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
            <TableBody>{transactions}</TableBody>
          </Table>
        </section>
      </div>
    </main>
  );
}
