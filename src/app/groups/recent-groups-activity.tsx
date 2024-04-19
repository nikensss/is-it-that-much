import { Block, BlockBody, BlockList, BlockTitle } from '~/app/_components/block';
import { RegisteredSettlementView, SharedTransactionView } from '~/app/groups/[groupId]/group-activity';
import type { RouterOutputs } from '~/trpc/shared';

export type RecentGroupsActivityProps = {
  groups: RouterOutputs['groups']['all']['get'];
  user: RouterOutputs['users']['get'];
  expenses: RouterOutputs['groups']['all']['expenses']['recent'];
  settlements: RouterOutputs['groups']['all']['settlements']['recent'];
};

export default function RecentGroupsActivity({ user, groups, expenses, settlements }: RecentGroupsActivityProps) {
  const settlementsListItems = settlements.map((s) => ({
    date: s.date,
    id: `settlement-${s.id}`,
    component: (
      <RegisteredSettlementView
        key={s.id}
        title={groups.find((g) => g.id === s.groupId)?.name}
        {...{ settlement: s, user, group: groups.find((g) => g.id === s.group.id)! }}
      />
    ),
  }));
  const sharedTransactionsListItems = expenses.map((e) => ({
    date: e.transaction.date,
    id: `expense-${e.id}`,
    component: (
      <SharedTransactionView
        title={groups.find((g) => g.id === e.group.id)?.name}
        key={e.id}
        {...{ sharedTransaction: e, user }}
      />
    ),
  }));

  const allItems = [...settlementsListItems, ...sharedTransactionsListItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  return (
    <Block>
      <BlockTitle>Recent activity</BlockTitle>
      <BlockBody>
        <BlockList className="flex grow flex-col gap-0.5">
          {allItems.slice(0, 8).map((item) => item.component)}
        </BlockList>
      </BlockBody>
    </Block>
  );
}
