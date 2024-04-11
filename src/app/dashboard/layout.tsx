import { Block, BlockBody, BlockContainer } from '~/app/_components/block';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlockContainer>
      <Block>
        <BlockBody>{children}</BlockBody>
      </Block>
    </BlockContainer>
  );
}
