import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-white px-4 text-slate-50 md:justify-center">
      <div className="absolute bottom-1 left-1 right-1 top-1 z-0 rounded-md bg-zinc-900"></div>
      <Button asChild className="px-2 hover:bg-zinc-300" variant="ghost">
        <Link className="z-10 flex items-center justify-center" href="/">
          <WalletIcon className="h-6 w-6" />
          <span className="sr-only">Expense Tracker</span>
        </Link>
      </Button>
      <nav className="z-10 flex items-center justify-center md:ml-auto md:mr-2 md:gap-2">
        {getButton('Features', '#')}
        {getButton('Pricing', '#')}
        {getButton('About', '#')}
        {getButton('Contact', '#')}
      </nav>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
}

function WalletIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function getButton(text: string, href: string) {
  return (
    <Button asChild className="px-2 hover:bg-zinc-300" variant="ghost">
      <Link className="text-sm font-medium" href={href}>
        {text}
      </Link>
    </Button>
  );
}
