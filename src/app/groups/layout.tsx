import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockContainer } from '~/app/_components/block/block-container';
import { BlockTitle } from '~/app/_components/block/block-title';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlockContainer>
      <Block>
        <BlockTitle href="/groups">Groups</BlockTitle>
        <BlockBody>{children}</BlockBody>
      </Block>
    </BlockContainer>
  );
}
