import SettingsForm from '~/app/settings/settings-form';
import { api } from '~/trpc/server';

export default async function SettingsPage() {
  const user = await api.users.get.query();

  return (
    <main className="flex grow flex-col bg-slate-100 p-2">
      <div className="flex grow flex-col rounded-md bg-white p-2 shadow-md">
        <header className="my-0.5 mb-1.5 flex h-12 shrink-0 items-center justify-center rounded-md bg-slate-900">
          <h2 className="text-lg font-bold text-slate-200">Settings</h2>
        </header>
        <SettingsForm
          username={user?.username}
          timezone={user?.timezone}
          currency={user?.currency}
          weekStartsOn={user?.weekStartsOn}
        />
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
