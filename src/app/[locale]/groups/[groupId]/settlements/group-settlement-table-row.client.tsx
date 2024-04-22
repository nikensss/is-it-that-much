import { AvatarIcon } from '@radix-ui/react-icons';
import DateDisplay from '~/app/_components/date-display';
import RegisterSettlement from '~/app/[locale]/groups/[groupId]/register-settlement.client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { TableCell, TableRow } from '~/components/ui/table';
import { cn } from '~/lib/utils.client';
import type { RouterOutputs } from '~/trpc/shared';

export default function GroupSettlementTableRow({
  settlement,
  user,
  group,
}: {
  group: Exclude<RouterOutputs['groups']['get'], null>;
  user: RouterOutputs['users']['get'];
  settlement: RouterOutputs['groups']['settlements']['period']['list'][number];
}) {
  return (
    <RegisterSettlement {...{ settlement, user, group }}>
      <TableRow>
        <TableCell className="text-nowrap">
          <DateDisplay distance="newline" timezone={user.timezone} date={settlement.date} />
        </TableCell>
        <TableCell>{settlement.amount / 100}</TableCell>
        <TableCell>
          <UserSettlementBanner isSelf={user.id === settlement.from.id} user={settlement.from} />
        </TableCell>
        <TableCell>
          <UserSettlementBanner isSelf={user.id === settlement.to.id} user={settlement.to} />
        </TableCell>
      </TableRow>
    </RegisterSettlement>
  );
}

function UserSettlementBanner({
  user,
  isSelf,
}: {
  user: RouterOutputs['groups']['settlements']['period']['list'][number]['from' | 'to'];
  isSelf?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user.imageUrl ?? ''} alt={`@${user.username}`} />
        <AvatarFallback>
          <AvatarIcon />
        </AvatarFallback>
      </Avatar>
      <div className={cn('flex flex-col', isSelf ? 'font-bold' : '')}>
        <p className="whitespace-nowrap text-nowrap text-sm">
          {`${user.firstName}`} {`${user.lastName}`}
        </p>
        <p className="whitespace-nowrap text-nowrap text-sm">{user.username ? `@${user.username}` : ''}</p>
      </div>
    </div>
  );
}
