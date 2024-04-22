import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ModeToggle } from '~/app/_components/mode-toggle.client';
import NavBarLink from '~/app/_components/navbar/navbar-link.client';
import { getScopedI18n } from '~/locales/server';

export default async function DesktopNavbar() {
  const t = await getScopedI18n('navbar');
  return (
    <>
      <SignedOut>
        <NavBarLink href={'#'}>{t('features')}</NavBarLink>
        <NavBarLink href={'#'}>{t('pricing')}</NavBarLink>
        <NavBarLink href={'#'}>{t('about')}</NavBarLink>
        <NavBarLink href={'#'}>{t('contact')}</NavBarLink>
      </SignedOut>
      <SignedIn>
        <NavBarLink href={'/dashboard'}>{t('dashboard')}</NavBarLink>
        <NavBarLink href={'/groups'}>{t('groups')}</NavBarLink>
        <NavBarLink href={'/friends'}>{t('friends')}</NavBarLink>
        <NavBarLink href={'/settings'}>{t('settings')}</NavBarLink>
      </SignedIn>
      <SignedIn>
        <div className="px-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
      <ModeToggle />
    </>
  );
}
