import { api } from '~/trpc/server';
import { FileProcessing } from '~/app/[locale]/dashboard/file/file-processing';

export default async function FilePage() {
  const user = await api.users.get.query();
  return <FileProcessing user={user} />;
}

export const dynamic = 'force-dynamic';
