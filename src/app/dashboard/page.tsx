import Sidebar from '~/app/dashboard/sidebar';
import Summary from '~/app/dashboard/summary';
import { api } from '~/trpc/server';

export default async function Page() {
  await api.users.sync.mutate();

  return (
    <div className="flex flex-1">
      <Sidebar />
      <Summary />
    </div>
  );
}
