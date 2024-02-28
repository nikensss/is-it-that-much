import { api } from '~/trpc/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await api.users.sync.mutate();

  return <div className="flex flex-1 max-md:flex-col">{children}</div>;
}
