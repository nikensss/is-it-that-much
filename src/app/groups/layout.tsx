import { Block, BlockBody, BlockContainer } from '~/app/_components/block';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlockContainer>
      <Block>
        <BlockBody className="flex grow flex-col">{children}</BlockBody>
      </Block>
    </BlockContainer>
  );
}
