import Link from 'next/link';
import { Children } from 'react';
import { Separator } from '~/components/ui/separator';

export function Block({ children }: { children: React.ReactNode }) {
  return <div className="flex grow flex-col rounded-md border border-primary-200 bg-white p-2">{children}</div>;
}

export function BlockContainer({ children }: { children: React.ReactNode }) {
  return <section className="flex grow flex-col bg-primary-100 p-2">{children}</section>;
}

export function BlockTitle({ children, href }: { href?: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-primary-900">
        <h2 className="flex items-center justify-center text-lg font-bold text-primary-200">{children}</h2>
      </header>
    );
  }

  return (
    <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-primary-900">
      <Link href={href}>
        <h2 className="flex items-center justify-center text-lg font-bold text-primary-200">{children}</h2>
      </Link>
    </header>
  );
}

export function BlockBody({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function BlockList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      {Children.map(children, (c) => (
        <>
          {c}
          <Separator className="last:hidden" />
        </>
      ))}
    </div>
  );
}

export function BlockListItem({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md p-2 lg:hover:bg-primary-900/20">{children}</div>;
}

export function BlockListItemTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 font-bold">{children}</h3>;
}

export function BlockListItemBody({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
