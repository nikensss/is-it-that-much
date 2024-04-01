import { TransactionType } from '@prisma/client';
import TransactionsOverview from '~/app/dashboard/(transactions)/transactions';

export default async function ExpensesOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <TransactionsOverview type={TransactionType.EXPENSE} searchParams={searchParams} />;
}

export const dynamic = 'force-dynamic';
