import type { ReactElement } from 'react';
import { I18nProviderClient } from '~/locales/client';

export default function Layout({
  params: { locale },
  children,
}: {
  params: { locale: string };
  children: ReactElement;
}) {
  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}
