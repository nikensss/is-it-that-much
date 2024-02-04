import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <aside className="flex w-full flex-col border-gray-200 bg-white max-md:border-b md:w-64 md:border-r dark:border-gray-600 ">
      <div className="sticky top-16 flex gap-4 px-6 py-4 max-md:justify-around md:flex-col">
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
