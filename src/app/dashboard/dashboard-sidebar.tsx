import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <aside className="flex w-full flex-col bg-white max-md:sticky max-md:top-16 max-md:border-b md:w-64 md:border-r">
      <div className="flex gap-4 px-6 py-4 max-md:justify-around md:sticky md:top-16 md:flex-col">
        <Link className="animated-underline-span font-medium md:text-lg" href="/dashboard/overview">
          <span>Overview</span>
        </Link>
        <Link className="animated-underline-span font-medium md:text-lg" href="#">
          <span>Groups</span>
        </Link>
        <Link className="animated-underline-span font-medium md:text-lg" href="#">
          <span>Friends</span>
        </Link>
        <Link className="animated-underline-span font-medium md:text-lg" href="#">
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
