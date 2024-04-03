import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { BlockBody, BlockTitle } from '~/app/_components/block/block';
import { api } from '~/trpc/server';

export default async function GroupLayout({ params, children }: { children: ReactNode; params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  return (
    <div className="flex grow flex-col gap-2">
      <BlockTitle href={`/groups/${group.id}`}>{group.name}</BlockTitle>
      <BlockBody>{children}</BlockBody>
    </div>
  );
}
