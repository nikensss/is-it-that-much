import SettingsForm from '~/app/dashboard/settings/settings-form';
import { api } from '~/trpc/server';

export default async function SettingsPage() {
  const user = await api.users.get.query();

  return (
    <main className="flex flex-1 overflow-auto overflow-y-hidden bg-gray-100 p-4">
      <section className="flex flex-grow flex-col rounded-md bg-white p-4 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">Settings</h2>
        </header>
        <SettingsForm timezone={user?.timezone} currency={user?.currency} />
      </section>
    </main>
  );
}

export const dynamic = 'force-dynamic';
