import Link from 'next/link';
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
  return <div className="flex grow flex-col gap-0.5">{children}</div>;
}

export function GroupListItem({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Separator className="last:hidden" />
    </>
  );
}

export function GroupListItemLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="flex items-center gap-2 rounded-md p-2 lg:hover:bg-slate-900/20" href={href}>
      {children}
    </Link>
  );
}
