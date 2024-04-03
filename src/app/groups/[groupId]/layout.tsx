import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import { api } from '~/trpc/server';

export default async function GroupLayout({ params, children }: { children: ReactNode; params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  return (
    <>
      <BlockTitle href={`/groups/${group.id}`}>{group.name}</BlockTitle>
      <BlockBody className="flex flex-col gap-2">{children}</BlockBody>
    </>
  );
}
