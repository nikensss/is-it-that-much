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

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(`/groups/${shared.groupId}/expenses/${shared.id}`)}>
      <TableCell>
        {formatInTimeZone(shared.transaction.date, user.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
      </TableCell>
      <TableCell>{`${shared.transaction.description} (${shared.group.name})`}</TableCell>
      <TableCell>{shared.transaction.amount / 100}</TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
