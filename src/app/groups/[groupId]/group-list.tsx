import Link from 'next/link';
import React from 'react';
import { Separator } from '~/components/ui/separator';

export function GroupList({ children }: { children: React.ReactNode }) {
  return <div className="flex grow flex-col rounded-md border border-slate-200 p-2">{children}</div>;
}

export function GroupListTitle({ href, children }: { href?: string; children: React.ReactNode }) {
  const title = (
    <header className="my-0.5 mb-1.5 flex h-12 flex-col items-center justify-center rounded-md bg-slate-900">
      <h2 className="text-lg font-bold capitalize text-slate-200">{children}</h2>
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
  return <div className="flex items-center gap-2 rounded-md p-2 lg:hover:bg-slate-900/20">{children}</div>;
}
