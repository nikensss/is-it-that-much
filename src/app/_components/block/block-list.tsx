import { Children } from 'react';
import { Separator } from '~/components/ui/separator';

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
