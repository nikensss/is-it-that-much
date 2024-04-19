import { notFound } from 'next/navigation';
import GroupUpsertForm from '~/app/groups/group-upsert-form.client';
import { api } from '~/trpc/server';

export default async function GroupUpdate({ params }: { params: { groupId: string } }) {
  const user = await api.users.get.query();
  if (!user) return notFound();

  const group = await api.groups.get.query({ groupId: params.groupId });

  return <GroupUpsertForm {...{ user, group }} />;
}

export const dynamic = 'force-dynamic';
