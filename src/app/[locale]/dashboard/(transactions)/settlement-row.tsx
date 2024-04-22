import { formatInTimeZone } from 'date-fns-tz';
import RegisterSettlement from '~/app/[locale]/groups/[groupId]/register-settlement.client';
import { TableCell, TableRow } from '~/components/ui/table';
import type { RouterOutputs } from '~/trpc/shared';

export function SettlementRow({
  settlement,
  user,
  group,
}: {
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  settlement: RouterOutputs['groups']['all']['settlements']['period']['list'][number];
}) {
  const name = getName(settlement, user);
  const description = `Settlement ${settlement.from.id === user.id ? 'sent to' : 'received from'} ${name} (${settlement.group.name})`;

  return (
    <RegisterSettlement {...{ settlement, user, group }}>
      <TableRow>
        <TableCell className="text-nowrap">
          {formatInTimeZone(settlement.date, user.timezone ?? 'Europe/Amsterdam', 'LLLL d, yyyy')}
        </TableCell>
        <TableCell>{description}</TableCell>
        <TableCell>{settlement.amount / 100}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </RegisterSettlement>
  );
}

function getName(
  settlement: RouterOutputs['groups']['all']['settlements']['period']['list'][number],
  user: RouterOutputs['users']['get'],
) {
  const other = settlement.from.id === user.id ? settlement.to : settlement.from;
  const parts = [];
  parts.push(other.firstName);
  if (other.lastName) parts.push(other.lastName);
  if (other.username) parts.push(`(@${other.username})`);

  return parts.join(' ').trim();
}
