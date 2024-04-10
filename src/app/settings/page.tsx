import { Block, BlockBody, BlockContainer, BlockTitle } from '~/app/_components/block';
import SettingsForm from '~/app/settings/settings-form';
import { api } from '~/trpc/server';

export default async function SettingsPage() {
  const user = await api.users.get.query();

  return (
    <BlockContainer>
      <Block>
        <BlockBody className="flex grow flex-col">
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
