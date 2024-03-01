import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTrigger } from '~/components/ui/sheet';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function MobileNavbar() {
  function getSheetCloseButton(text: string, href: string) {
    return (
      <SheetClose asChild>
        <Link className="block p-2 font-medium hover:underline" href={href}>
          {text}
        </Link>
      </SheetClose>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu size={28} />
      </SheetTrigger>
      <SheetContent className="flex w-9/12 flex-col items-end pt-12 text-xl">
        <SignedOut>
          {getSheetCloseButton('Features', '#')}
          {getSheetCloseButton('Pricing', '#')}
          {getSheetCloseButton('About', '#')}
          {getSheetCloseButton('Contact', '#')}
        </SignedOut>
        <SignedIn>
          {getSheetCloseButton('Dashboard', '/dashboard')}
          {getSheetCloseButton('Groups', '#')}
          {getSheetCloseButton('Friends', '/friends')}
          {getSheetCloseButton('Settings', '/settings')}
        </SignedIn>
        <SheetFooter className="mt-auto">
          <UserButton showName={true} userProfileMode="navigation" afterSignOutUrl="/" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
