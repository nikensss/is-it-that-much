import { TransactionType } from '@prisma/client';
import TransactionList from '~/app/dashboard/(transactions)/transactions-list';

export default async function IncomesOverview({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <TransactionList type={TransactionType.INCOME} searchParams={searchParams} />;
}

export const dynamic = 'force-dynamic';
