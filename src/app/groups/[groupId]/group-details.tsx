import Link from 'next/link';
import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockTitle } from '~/app/_components/block/block-title';
import UserBannerClient from '~/app/friends/user-banner.client';
import LeaveGroupButton from '~/app/groups/[groupId]/leave-group-button';
import { Button } from '~/components/ui/button';
import type { RouterOutputs } from '~/trpc/shared';

export default async function GroupDetails({
  group,
  user,
}: {
  user: RouterOutputs['users']['get'];
  group: Exclude<RouterOutputs['groups']['get'], null>;
}) {
  const users = group.UserGroup.map((e) => e.user);

  return (
    <Block>
      <BlockTitle>Details</BlockTitle>
      <BlockBody>
        <main className="flex grow flex-col">
          <p className="text-center text-lg font-bold first-letter:uppercase">{group.description}</p>
          <p className="text-center text-lg">Members</p>
          <div className="mb-2 flex flex-col gap-2">
            {users.map((u) => {
              return <UserBannerClient key={u.id} user={u} isSelf={u.id === user?.id} />;
            })}
          </div>
          <div className="mt-auto flex items-center justify-center gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href={`/groups/${group.id}/edit`}>Edit</Link>
            </Button>
            <LeaveGroupButton groupId={group.id} />
          </div>
        </main>
      </BlockBody>
    </Block>
  );
}
