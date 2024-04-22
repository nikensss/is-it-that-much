import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import { I18nProviderClient } from '~/locales/client';
import { api } from '~/trpc/server';

export default async function GroupLayout({
  params: { groupId, locale },
  children,
}: {
  children: ReactNode;
  params: { groupId: string; locale: string };
}) {
  const group = await api.groups.get.query({ groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();

  return (
    <I18nProviderClient locale={locale}>
      <BlockTitle href={`/groups/${group.id}`}>{group.name}</BlockTitle>
      <BlockBody className="flex grow flex-col gap-2">{children}</BlockBody>
    </I18nProviderClient>
  );
}
