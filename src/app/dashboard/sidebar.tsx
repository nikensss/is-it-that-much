import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-600">
      <div className="sticky top-16 flex flex-col gap-4 px-6 py-4">
        <Link className="animated-underline-span text-lg font-medium" href="/dashboard/overview">
          <span>Overview</span>
        </Link>
        <Link className="animated-underline-span text-lg font-medium" href="#">
          <span>Groups</span>
        </Link>
        <Link className="animated-underline-span text-lg font-medium underline-offset-4" href="#">
          <span>Friends</span>
        </Link>
        <Link className="animated-underline-span text-lg font-medium underline-offset-4" href="#">
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
