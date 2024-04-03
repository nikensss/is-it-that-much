import React from 'react';

export function GroupListItem({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md p-2 lg:hover:bg-primary-900/20">{children}</div>;
}

export function GroupListItemTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 font-bold">{children}</h3>;
}

export function GroupListItemBody({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
