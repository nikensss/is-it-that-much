'use client';

import { formatInTimeZone } from 'date-fns-tz';
import { useRouter } from 'next/navigation';
import { TableCell, TableRow } from '~/components/ui/table';
import type { RouterOutputs } from '~/trpc/shared';

export function SharedExpenseRow({
  shared,
  user,
}: {
  user: RouterOutputs['users']['get'];
  shared: RouterOutputs['groups']['all']['expenses']['period']['list'][number];
}) {
  const router = useRouter();
  const amount = shared.TransactionSplit.reduce((acc, { userId, paid }) => acc + (userId === user.id ? paid : 0), 0);

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(`/groups/${shared.groupId}/expenses/${shared.id}`)}>
      <TableCell>
        {formatInTimeZone(shared.transaction.date, user.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
      </TableCell>
      <TableCell>{`${shared.transaction.description} (${shared.group.name})`}</TableCell>
      <TableCell>{amount / 100}</TableCell>
      <TableCell>{shared.transaction.TransactionsTags.map((e) => e.tag.name).join(', ')}</TableCell>
    </TableRow>
  );
}
