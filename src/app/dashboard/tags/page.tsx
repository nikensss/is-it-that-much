import { TransactionType } from '@prisma/client';
import UpdateTag from '~/app/dashboard/tags/update-tag';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { api } from '~/trpc/server';

export default async function TagsOverview() {
  return (
    <div>
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold capitalize">Tags</h2>
      </header>
      <section className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <TransactionTags type={TransactionType.EXPENSE} />
        <TransactionTags type={TransactionType.INCOME} />
      </section>
    </div>
  );
}

async function TransactionTags({ type }: { type: TransactionType }) {
  const tags = await api.tags.all.query({ type });

  return (
    <section className="grow">
      <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md">
        <h2 className="text-primary-200 text-lg font-bold capitalize">{type.toLowerCase() + 's'}</h2>
      </header>
      <main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary-900 font-bold">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => {
              return <UpdateTag key={tag.id} tag={tag} />;
            })}
          </TableBody>
        </Table>
      </main>
    </section>
  );
}

export const dynamic = 'force-dynamic';
