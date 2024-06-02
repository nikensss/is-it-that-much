import { api } from '~/trpc/server';
import { FileProcessing } from '~/app/dashboard/file/parse/file-processing';

export default async function FilePage() {
  const [user, triggers] = await Promise.all([api.users.get.query(), api.parsing.triggers.all.query()]);

  return <FileProcessing user={user} triggers={triggers} />;
}

export const dynamic = 'force-dynamic';
