import Link from 'next/link';

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
