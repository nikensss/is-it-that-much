import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ModeToggle } from '~/app/_components/mode-toggle';
import NavBarLink from '~/app/_components/navbar/navbar.link';

export default function DesktopNavbar() {
  return (
    <>
      <SignedOut>
        <NavBarLink href={'#'}>Features</NavBarLink>
        <NavBarLink href={'#'}>Pricing</NavBarLink>
        <NavBarLink href={'#'}>About</NavBarLink>
        <NavBarLink href={'#'}>Contact</NavBarLink>
      </SignedOut>
      <SignedIn>
        <NavBarLink href={'/dashboard'}>Dashboard</NavBarLink>
        <NavBarLink href={'/groups'}>Groups</NavBarLink>
        <NavBarLink href={'/friends'}>Friends</NavBarLink>
        <NavBarLink href={'/settings'}>Settings</NavBarLink>
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
