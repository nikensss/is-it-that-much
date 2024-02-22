import TransactionsOverview from '~/app/dashboard/my-expenses/(transactions)/transactions';

export default async function ExpenseOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <TransactionsOverview type="EXPENSE" searchParams={searchParams} />;
}

export const dynamic = 'force-dynamic';
