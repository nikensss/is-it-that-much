import { notFound } from 'next/navigation';
import GroupUpsertForm from '~/app/[locale]/groups/group-upsert-form.client';
import { api } from '~/trpc/server';

export default async function Page() {
  const user = await api.users.get.query();
  if (!user) return notFound();

  return <GroupUpsertForm user={user} />;
}

export const dynamic = 'force-dynamic';
