import { api } from '~/trpc/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await api.users.sync.mutate();

  return (
    <div className="flex grow flex-col bg-slate-100 p-2">
      <div className="flex grow flex-col rounded-md bg-white p-2 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">Dashboard</h2>
        </header>
        <main className="flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
