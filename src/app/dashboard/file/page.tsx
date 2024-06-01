import { Block, BlockBody, BlockTitle } from '~/app/_components/block';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';
import Triggers from '~/app/dashboard/file/triggers';

export default async function FilePage() {
  const triggers = await api.parsing.triggers.all.query();

  return (
    <>
      <BlockBody className="flex grow flex-col gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/file/parse">Parse file</Link>
        </Button>
        <Block>
          <BlockTitle>Triggers</BlockTitle>
          <Triggers triggers={triggers ?? []} />
        </Block>
      </BlockBody>
    </>
  );
}

export const dynamic = 'force-dynamic';
