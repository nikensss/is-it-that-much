import { UsersRound } from 'lucide-react';
import Link from 'next/link';
import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockTitle } from '~/app/_components/block/block-title';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import type { RouterOutputs } from '~/trpc/shared';

export type MyGroupsProps = {
  groups: RouterOutputs['groups']['all']['get'];
};

export default async function MyGroups({ groups }: MyGroupsProps) {
  return (
    <Block>
      <BlockTitle>My groups</BlockTitle>
      <BlockBody>
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <Link
              href={`/groups/${group.id}`}
              key={group.id}
              className="ry-2 flex select-none items-center rounded-md border border-primary-100 p-4 md:hover:cursor-pointer md:hover:border-primary-900 md:hover:shadow-md"
            >
              <div className="flex items-center justify-center">
                <Avatar className="mr-2">
                  <AvatarImage src="" alt="group image" />
                  <AvatarFallback>
                    <UsersRound />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-xl font-bold">{group.name}</p>
                  <p className={cn(group.description ? '' : 'invisible', 'text-gray-600')}>{group.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </BlockBody>
    </Block>
  );
}
