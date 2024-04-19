import { TransactionType } from '@prisma/client';
import { BlockBody, BlockTitle } from '~/app/_components/block';
import { UpdateTag } from '~/app/dashboard/tags/update-tag.client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function TagsOverview() {
  return (
    <>
      <BlockTitle>Tags</BlockTitle>
      <BlockBody className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <TransactionTags type={TransactionType.EXPENSE} />
        <TransactionTags type={TransactionType.INCOME} />
      </BlockBody>
    </>
  );
}

async function TransactionTags({ type }: { type: TransactionType }) {
  const tags = await api.tags.all.query({ type });

  return (
    <section className="grow">
      <BlockTitle>{type.toLowerCase() + 's'}</BlockTitle>
      <BlockBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-primary-900">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <UpdateTag key={tag.id} tag={tag} />
            ))}
          </TableBody>
        </Table>
      </BlockBody>
    </section>
  );
}

export const dynamic = 'force-dynamic';
