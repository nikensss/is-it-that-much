import { BlockBody } from '~/app/_components/block';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export default async function FilePage() {
  return (
    <>
      <BlockBody className="flex grow flex-col">
        <Button asChild variant="outline">
          <Link href="/dashboard/file/parse">Parse file</Link>
        </Button>
      </BlockBody>
    </>
  );
}

export const dynamic = 'force-dynamic';
