import { Block, BlockBody, BlockContainer, BlockTitle } from '~/app/_components/block';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlockContainer>
      <Block>
        <BlockTitle href="/groups">Groups</BlockTitle>
        <BlockBody className="flex grow flex-col">{children}</BlockBody>
      </Block>
    </BlockContainer>
  );
}
