import { Block, BlockBody, BlockContainer } from '~/app/_components/block';
import { I18nProviderClient } from '~/locales/client';

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
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
