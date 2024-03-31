import { cn } from '~/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-primary-900/10 dark:bg-primary-50/10 animate-pulse rounded-md', className)} {...props} />
  );
}

export { Skeleton };
