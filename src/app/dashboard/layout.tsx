import DashboardSidebar from '~/app/dashboard/dashboard-sidebar';
import { api } from '~/trpc/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await api.users.sync.mutate();

  return (
    <div className="flex flex-1">
      <DashboardSidebar />
      {children}
    </div>
  );
}
