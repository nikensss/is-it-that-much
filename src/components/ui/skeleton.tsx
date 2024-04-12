import { cn } from '~/lib/utils.client';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-pulse rounded-md bg-primary-900/10 dark:bg-primary-50/10', className)} {...props} />
  );
}

export { Skeleton };
