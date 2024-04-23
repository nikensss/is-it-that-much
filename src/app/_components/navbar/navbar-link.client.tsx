import Link from 'next/link';

export type NavBarLinkProps = {
  children: React.ReactNode;
  href: string;
};

export default function NavBarLink({ children, href }: NavBarLinkProps) {
  return (
    <Link
      className="self-stretch rounded-md border border-transparent p-2 text-right font-medium transition-all md:inline-block md:px-2 lg:hover:bg-primary-400/30 dark:lg:hover:bg-primary-500/20"
      href={href}
    >
      <div>{children}</div>
    </Link>
  );
}
