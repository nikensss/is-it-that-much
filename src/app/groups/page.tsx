import Link from 'next/link';
import MyGroups from '~/app/groups/my-groups';
import RecentGroupActivity from '~/app/groups/recent-group-activity';
import { Button } from '~/components/ui/button';

export default async function GroupsPage() {
  return (
    <>
      <div className="mb-2 grid">
        <Button variant="outline">
          <Link className="my-4" href="/groups/create">
            Create new group
          </Link>
        </Button>
      </div>
      <div className="mt-2 grid grow gap-2 md:grid-cols-2">
        <MyGroups />
        <RecentGroupActivity />
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
