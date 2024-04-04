'use client';

import { LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ButtonWithDialog from '~/app/_components/button-with-dialog.client';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

export default function LeaveGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const mutation = api.groups.leave.useMutation();

  return (
    <ButtonWithDialog
      title="Leave group"
      description="Are you sure you want to leave this group? This action cannot be undone."
      onConfirm={async () => {
        try {
          await mutation.mutateAsync({ groupId: groupId });
        } catch (ex) {
          console.error(ex);
        } finally {
          router.push('/groups');
        }
      }}
    >
      <Button variant="destructive" className="w-full">
        <LogOutIcon className="mr-2" />
        Leave
      </Button>
    </ButtonWithDialog>
  );
}
