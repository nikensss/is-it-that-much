import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '~/components/ui/sheet';
import Link from 'next/link';
import { ArrowRightFromLine, Cog, Menu } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { AvatarIcon } from '@radix-ui/react-icons';

export default function MobileNavbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu size={28} />
      </SheetTrigger>
      <SheetContent className="flex w-9/12 flex-col items-end pt-6 text-xl">
        <SignedOut>
          <SheetLinkClose text={'Features'} href={'#'} />
          <SheetLinkClose text={'Pricing'} href={'#'} />
          <SheetLinkClose text={'About'} href={'#'} />
          <SheetLinkClose text={'Contact'} href={'#'} />
        </SignedOut>
        <SignedIn>
          <SheetLinkClose text={'Dashboard'} href={'/dashboard'} />
          <SheetLinkClose text={'Groups'} href={'/groups'} />
          <SheetLinkClose text={'Friends'} href={'/friends'} />
          <SheetLinkClose text={'Settings'} href={'/settings'} />
          <AccordionUserButton />
        </SignedIn>
      </SheetContent>
    </Sheet>
  );
}

type SheetLinkCloseProps = {
  href: string;
  text: string;
};

function SheetLinkClose({ href, text }: SheetLinkCloseProps) {
  return (
    <SheetClose asChild>
      <Link className="block p-2 pr-0 font-medium hover:underline" href={href}>
        {text}
      </Link>
    </SheetClose>
  );
}

async function AccordionUserButton() {
  const user = await api.users.get.query();

  return (
    <div className="mt-auto w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="user-button" className="border-b-0">
          <AccordionContent className="py-0">
            <div className="flex flex-col gap-2">
              <Button className="justify-start">
                <SheetClose asChild>
                  <Link className="flex grow items-center justify-between" href="/sign-out">
                    Sign out
                    <ArrowRightFromLine className="mr-2" />
                  </Link>
                </SheetClose>
              </Button>
              <Button className="justify-start">
                <SheetClose asChild>
                  <Link className="flex grow items-center justify-between" href="/user">
                    Manage account
                    <Cog className="mr-2" />
                  </Link>
                </SheetClose>
              </Button>
            </div>
          </AccordionContent>
          <AccordionTrigger dir="up" className="outline-none hover:no-underline">
            <div className="pointer-events-none flex flex-row-reverse">
              <Avatar className="ml-4">
                <AvatarImage src={user?.imageUrl ?? ''} alt={`@${user?.username}`} />
                <AvatarFallback>
                  <AvatarIcon />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="capitalize">
                  {user?.firstName} {user?.lastName}
                </p>
                {user?.username ? <p>@{user?.username}</p> : null}
              </div>
            </div>
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
