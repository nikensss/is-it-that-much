'use client';

import { formatInTimeZone } from 'date-fns-tz';
import { useRouter } from 'next/navigation';
import AvatarStack from '~/app/groups/[groupId]/expenses/avatar-stack.client';
import { TableCell, TableRow } from '~/components/ui/table';
import type { RouterOutputs } from '~/trpc/shared';

export default function GroupExpenseTableRow({
  expense,
  user,
}: {
  user: RouterOutputs['users']['get'];
  expense: RouterOutputs['groups']['expenses']['period'][number];
}) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/groups/${expense.groupId}/expenses/${expense.id}`)}
    >
      <TableCell>
        {formatInTimeZone(expense.transaction.date, user.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
      </TableCell>
      <TableCell>{expense.transaction.description}</TableCell>
      <TableCell>{expense.transaction.amount / 100}</TableCell>
      <TableCell>
        <AvatarStack users={expense.TransactionSplit.filter((e) => e.paid > 0).map((e) => e.user)} />
      </TableCell>
      <TableCell>
        <AvatarStack users={expense.TransactionSplit.filter((e) => e.owed > 0).map((e) => e.user)} />
      </TableCell>
    </TableRow>
  );
}
