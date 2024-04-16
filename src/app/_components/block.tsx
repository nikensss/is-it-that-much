import Link from 'next/link';
import { Children } from 'react';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils.client';

export function Block({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex grow flex-col rounded-md border border-primary-200 bg-white p-2 dark:border-primary-400 dark:bg-primary-700">
      {children}
    </div>
  );
}

export function BlockContainer({ children }: { children: React.ReactNode }) {
  return <section className="flex grow flex-col bg-primary-100 p-2 dark:bg-primary-600">{children}</section>;
}

export function BlockTitle({ children, href }: { href?: string; children: React.ReactNode }) {
  const title = (
    <header
      className={cn(
        href ? 'border bg-primary-900 dark:border-primary-500' : 'bg-primary-300/50 dark:bg-primary-500/60',
        'my-0.5 mb-1.5 flex min-h-12 items-center justify-center rounded-md',
      )}
    >
      <h2
        className={cn(
          href ? 'text-primary-200 ' : 'text-primary-700 dark:text-primary-200',
          'flex items-center justify-center text-lg font-bold capitalize ',
        )}
      >
        {children}
      </h2>
    </header>
  );

  if (!href) return title;

  return <Link href={href}>{title}</Link>;
}

export function BlockBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function BlockList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      {Children.map(children, (c) => (
        <>
          {c}
          <Separator className="last:hidden dark:bg-primary-400" />
        </>
      ))}
    </div>
  );
}

export function BlockListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md p-2 transition-all lg:hover:bg-primary-900/20 dark:lg:hover:bg-primary-200/20">
      {children}
    </div>
  );
}

export function BlockListItemTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 font-bold">{children}</h3>;
}

export function BlockListItemBody({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
