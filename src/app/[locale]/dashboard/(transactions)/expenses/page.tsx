import { TransactionType } from '@prisma/client';
import { TransactionList } from '~/app/[locale]/dashboard/(transactions)/transactions-list';

export default async function ExpensesOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <TransactionList type={TransactionType.EXPENSE} searchParams={searchParams} />;
}

export const dynamic = 'force-dynamic';
