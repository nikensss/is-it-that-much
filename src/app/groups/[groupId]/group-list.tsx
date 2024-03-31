import Link from 'next/link';
import React from 'react';
import { Separator } from '~/components/ui/separator';

export function GroupList({ children }: { children: React.ReactNode }) {
  return <div className="border-primary-200 flex grow flex-col rounded-md border p-2">{children}</div>;
}

export function GroupListTitle({ href, children }: { href?: string; children: React.ReactNode }) {
  const title = (
    <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md">
      <h2 className="text-primary-200 text-lg font-bold capitalize">{children}</h2>
    </header>
  );

  if (!href) return title;

  return <Link href={href}>{title}</Link>;
}

export function GroupListBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex grow flex-col gap-0.5">
      {React.Children.map(children, (c) => (
        <>
          {c}
          <Separator className="last:hidden" />
        </>
      ))}
    </div>
  );
}

export function GroupListItem({ children }: { children: React.ReactNode }) {
  return <div className="lg:hover:bg-primary-900/20 flex items-center gap-2 rounded-md p-2">{children}</div>;
}
