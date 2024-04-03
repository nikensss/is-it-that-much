import { Block } from '~/app/_components/block/block';
import { BlockBody } from '~/app/_components/block/block-body';
import { BlockContainer } from '~/app/_components/block/block-container';
import { BlockTitle } from '~/app/_components/block/block-title';
import SettingsForm from '~/app/settings/settings-form';
import { api } from '~/trpc/server';

export default async function SettingsPage() {
  const user = await api.users.get.query();

  return (
    <BlockContainer>
      <Block>
        <BlockTitle>Settings</BlockTitle>
        <BlockBody>
          <SettingsForm
            username={user?.username}
            timezone={user?.timezone}
            currency={user?.currency}
            weekStartsOn={user?.weekStartsOn}
          />
        </BlockBody>
      </Block>
    </BlockContainer>
  );
}

export const dynamic = 'force-dynamic';
