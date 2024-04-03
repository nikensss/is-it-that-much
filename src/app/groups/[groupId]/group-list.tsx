import React from 'react';
import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockTitle } from '~/app/_components/block/block-title';
import { Separator } from '~/components/ui/separator';

export function GroupList({ children }: { children: React.ReactNode }) {
  return <Block>{children}</Block>;
}

export function GroupListTitle({ href, children }: { href?: string; children: React.ReactNode }) {
  return <BlockTitle href={href}>{children}</BlockTitle>;
}

export function GroupListBody({ children }: { children: React.ReactNode }) {
  return (
    <BlockBody>
      <div className="flex grow flex-col gap-0.5">
        {React.Children.map(children, (c) => (
          <>
            {c}
            <Separator className="last:hidden" />
          </>
        ))}
      </div>
    </BlockBody>
  );
}

export function GroupListItem({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md p-2 lg:hover:bg-primary-900/20">{children}</div>;
}

export function GroupListItemTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 font-bold">{children}</h3>;
}

export function GroupListItemBody({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
