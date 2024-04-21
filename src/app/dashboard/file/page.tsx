import { api } from '~/trpc/server';
import { FileProcessing } from '~/app/dashboard/file/file-processing';

export default async function FilePage() {
  const user = await api.users.get.query();
  return <FileProcessing user={user} />;
}
