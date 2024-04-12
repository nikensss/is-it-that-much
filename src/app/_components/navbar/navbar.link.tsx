'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/utils.client';

export type NavBarLinkProps = {
  children: React.ReactNode;
  href: string;
};

export default function NavBarLink({ children, href }: NavBarLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      className={cn(
        pathname.startsWith(href)
          ? 'border-primary-400 bg-primary-400/30 dark:border-primary-300 dark:bg-primary-500/20'
          : 'border-transparent',
        'self-stretch rounded-md border p-2 text-right font-medium transition-all md:inline-block md:px-2 lg:hover:bg-primary-400/30 dark:lg:hover:bg-primary-500/20',
      )}
      href={href}
    >
      <div>{children}</div>
    </Link>
  );
}
