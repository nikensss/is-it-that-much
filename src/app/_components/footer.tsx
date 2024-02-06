import Link from 'next/link';

export function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
      <div className="flex gap-4">
        <Link className="animated-underline text-xs" href="#">
          Facebook
        </Link>
        <Link className="animated-underline text-xs" href="#">
          Twitter
        </Link>
        <Link className="animated-underline text-xs" href="#">
          Instagram
        </Link>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 sm:ml-auto">
        © {new Date().getFullYear()} Expense Tracker. All rights reserved.
      </p>
    </footer>
  );
}
