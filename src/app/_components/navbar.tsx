import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function NavBar() {
  return (
    <header className="flex h-16 items-center px-4 lg:px-6">
      <Link className="flex items-center justify-center" href="/">
        <WalletIcon className="h-6 w-6" />
        <span className="sr-only">Expense Tracker</span>
      </Link>
      <nav className="ml-auto flex items-center justify-center gap-4 sm:gap-6">
        <Link className="animate-underline text-sm font-medium" href="#">
          Features
        </Link>
        <Link className="animate-underline text-sm font-medium" href="#">
          Pricing
        </Link>
        <Link className="animate-underline text-sm font-medium" href="#">
          About
        </Link>
        <Link className="animate-underline text-sm font-medium" href="#">
          Contact
        </Link>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
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
