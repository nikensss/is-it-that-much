import { Block, BlockBody, BlockContainer } from '~/app/_components/block';
import { I18nProviderClient } from '~/locales/client';

export default function GroupsLayout({
  params: { locale },
  children,
}: {
  params: { locale: string };
  children: React.ReactNode;
}) {
  return (
    <I18nProviderClient locale={locale}>
      <BlockContainer>
        <Block>
          <BlockBody className="flex grow flex-col">{children}</BlockBody>
        </Block>
      </BlockContainer>
    </I18nProviderClient>
  );
}
