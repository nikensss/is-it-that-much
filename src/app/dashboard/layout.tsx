import { Block, BlockBody, BlockContainer, BlockTitle } from '~/app/_components/block';
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
