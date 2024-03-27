import Link from 'next/link';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-primary-100 flex grow flex-col p-2">
      <div className="flex grow flex-col gap-2 rounded-md bg-white p-2 shadow-md">
        <header className="bg-primary-900 mt-0.5 flex h-12 items-center justify-center rounded-md">
          <Link href="/groups">
            <h2 className="text-primary-200 text-lg font-bold">Groups</h2>
          </Link>
        </header>
        <section className="flex grow flex-col">{children}</section>
      </div>
    </main>
  );
}
