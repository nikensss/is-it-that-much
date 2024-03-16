import Link from 'next/link';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex grow flex-col bg-slate-100 p-2">
      <div className="flex grow flex-col rounded-md bg-white p-2 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <Link href="/groups">
            <h2 className="text-lg font-bold text-slate-200">Groups</h2>
          </Link>
        </header>
        <section className="flex grow flex-col">{children}</section>
      </div>
    </main>
  );
}
