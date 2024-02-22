import { TransactionType } from '@prisma/client';
import TransactionsOverview from '~/app/dashboard/my-expenses/(transactions)/transactions';

export default async function ExpenseOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <TransactionsOverview type={TransactionType.INCOME} searchParams={searchParams} />;
}

export const dynamic = 'force-dynamic';
