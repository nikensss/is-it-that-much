import Link from 'next/link';
import { api } from '~/trpc/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await api.users.sync.mutate();

  return (
    <div className="bg-primary-100 flex grow flex-col p-2">
      <div className="flex grow flex-col rounded-md bg-white p-2 shadow-md">
        <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md">
          <Link href="/dashboard">
            <h2 className="text-primary-200 text-lg font-bold">Dashboard</h2>
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
