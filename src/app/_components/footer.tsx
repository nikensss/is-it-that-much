import Link from 'next/link';
import { getI18n } from '~/locales/server';

export async function Footer() {
  const t = await getI18n();

  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-t-primary-400 bg-white px-4 py-6 text-primary-900 dark:bg-primary-900 dark:text-primary-50 sm:flex-row md:px-6">
      <div className="flex gap-4">
        <Link className="text-xs hover:underline" href="#">
          Facebook
        </Link>
        <Link className="text-xs hover:underline" href="#">
          Twitter
        </Link>
        <Link className="text-xs hover:underline" href="#">
          Instagram
        </Link>
      </div>
      <p className="text-xs sm:ml-auto">© 2024 Is it that much? &mdash; {t('footer')}</p>
    </footer>
  );
}
