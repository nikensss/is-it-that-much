import Link from 'next/link';
import MyGroups from '~/app/[locale]/groups/my-groups';
import RecentGroupsActivity from '~/app/[locale]/groups/recent-groups-activity';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';

export default async function GroupsPage() {
  const [user, groups, expenses, settlements] = await Promise.all([
    api.users.get.query(),
    api.groups.all.get.query(),
    api.groups.all.expenses.recent.query({ onlyWhereUserPaid: false }),
    api.groups.all.settlements.recent.query({ type: 'all' }),
  ]);

  return (
    <>
      <div className="mb-2 grid">
        <Button variant="outline" asChild>
          <Link href="/groups/create">Create new group</Link>
        </Button>
      </div>
      <div className="mt-2 grid grow gap-2 md:grid-cols-2">
        <MyGroups groups={groups} />
        <RecentGroupsActivity {...{ user, groups, expenses, settlements }} />
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
