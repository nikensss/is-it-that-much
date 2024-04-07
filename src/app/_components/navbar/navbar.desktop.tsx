import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ModeToggle } from '~/app/_components/mode-toggle';
import NavBarLink from '~/app/_components/navbar/navbar.link';

export default function DesktopNavbar() {
  return (
    <>
      <SignedOut>
        <NavBarLink text={'Features'} href={'#'} />
        <NavBarLink text={'Pricing'} href={'#'} />
        <NavBarLink text={'About'} href={'#'} />
        <NavBarLink text={'Contact'} href={'#'} />
      </SignedOut>
      <SignedIn>
        <NavBarLink text={'Dashboard'} href={'/dashboard'} />
        <NavBarLink text={'Groups'} href={'/groups'} />
        <NavBarLink text={'Friends'} href={'/friends'} />
        <NavBarLink text={'Settings'} href={'/settings'} />
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
