import Link from 'next/link';
import { Button } from '~/components/ui/button';

export default function DashboardSidebar() {
  return (
    <aside className="flex w-full flex-col bg-white max-md:sticky max-md:top-16 max-md:border-b md:w-64 md:border-r">
      <div className="flex gap-2 px-2 py-2 max-md:justify-around md:sticky md:top-16 md:flex-col">
        {getButton('My expenses', '/dashboard/my-expenses')}
        {getButton('Groups', '#')}
        {getButton('Friends', '#')}
        {getButton('Settings', '#')}
      </div>
    </aside>
  );
}

function getButton(text: string, href: string) {
  return (
    <Button asChild variant="ghost" className="select-none justify-start hover:bg-zinc-300 md:text-lg">
      <Link className="font-medium" href={href}>
        {text}
      </Link>
    </Button>
  );
}
