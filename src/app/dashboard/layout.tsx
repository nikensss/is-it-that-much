import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockContainer } from '~/app/_components/block/block-container';
import { BlockTitle } from '~/app/_components/block/block-title';
import { api } from '~/trpc/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await api.users.sync.mutate();

  return (
    <BlockContainer>
      <Block>
        <BlockTitle href="/dashboard">Dashboard</BlockTitle>
        <BlockBody>{children}</BlockBody>
      </Block>
    </BlockContainer>
  );
}
