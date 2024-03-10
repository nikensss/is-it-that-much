import CreateNewGroup from '~/app/groups/create-new-group';
import MyGroups from '~/app/groups/my-groups';
import RecentGroupActivity from '~/app/groups/recent-group-activity';

export default async function GroupsPage() {
  return (
    <>
      <div className="mb-2 grid">
        <CreateNewGroup />
      </div>
      <div className="mt-2 grid grow gap-2 md:grid-cols-2">
        <MyGroups />
        <RecentGroupActivity />
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
