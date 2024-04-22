import Link from 'next/link';
import DesktopNavbar from '~/app/_components/navbar/navbar-desktop';
import MobileNavbar from '~/app/_components/navbar/navbar-mobile';
import { getScopedI18n } from '~/locales/server';

export async function NavBar() {
  const t = await getScopedI18n('navbar');

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-b-primary-400 bg-white px-4 text-primary-900 dark:bg-primary-900 dark:text-primary-200 md:justify-center">
      <Link className="z-10 flex items-center justify-center px-2" href="/">
        <WalletIcon className="h-6 w-6" />
        <span className="sr-only">{t('title')}</span>
      </Link>
      <nav className="z-10 hidden items-center justify-center md:ml-auto md:mr-2 md:flex md:gap-2">
        <DesktopNavbar />
      </nav>
      <h1 className="z-10 text-primary-900 dark:text-primary-200 md:hidden">
        <Link href="/">{t('title')}</Link>
      </h1>
      <nav className="z-10 flex px-2 md:hidden">
        <MobileNavbar />
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
