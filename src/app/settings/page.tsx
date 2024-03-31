import SettingsForm from '~/app/settings/settings-form';
import { api } from '~/trpc/server';

export default async function SettingsPage() {
  const user = await api.users.get.query();

  return (
    <main className="bg-primary-100 flex grow flex-col p-2">
      <div className="flex grow flex-col rounded-md bg-white p-2 shadow-md">
        <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 shrink-0 items-center justify-center rounded-md">
          <h2 className="text-primary-200 text-lg font-bold">Settings</h2>
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
