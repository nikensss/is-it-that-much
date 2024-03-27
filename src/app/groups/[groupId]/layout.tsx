import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { api } from '~/trpc/server';

export default async function GroupLayout({ params, children }: { children: ReactNode; params: { groupId: string } }) {
  const group = await api.groups.get.query({ id: params.groupId }).catch(() => null);
  if (!group) return notFound();

  const user = await api.users.get.query().catch(() => null);
  if (!user) return notFound();
  return (
    <div className="flex grow flex-col gap-2">
      <Link href={`/groups/${group.id}`}>
        <header className="bg-primary-900 flex h-12 flex-col items-center justify-center rounded-md">
          <h2 className="text-primary-200 text-lg font-bold capitalize">{group.name}</h2>
        </header>
      </Link>
      {children}
    </div>
  );
}
