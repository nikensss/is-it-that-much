import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <aside className="flex flex-col bg-white max-md:sticky max-md:top-16 max-md:border-b md:w-48 md:border-r">
      <div className="flex gap-2 px-2 py-2 max-md:justify-around md:sticky md:top-16 md:flex-col">
        {getButton('My expenses', '/dashboard/my-expenses')}
        {getButton('Groups', '#')}
        {getButton('Friends', '/dashboard/friends')}
        {getButton('Settings', '/dashboard/settings')}
      </div>
    </aside>
  );
}

function getButton(text: string, href: string) {
  return (
    <Link
      className="relative justify-start pl-2 md:text-lg md:after:absolute md:after:right-0 md:after:top-0.5 md:after:ml-0.5 md:after:block md:after:h-[20px] md:after:w-[20px] md:after:translate-x-[-1.5rem] md:after:opacity-0 md:after:transition-all md:after:content-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LXJpZ2h0Ij48cGF0aCBkPSJNNSAxMmgxNCIvPjxwYXRoIGQ9Im0xMiA1IDcgNy03IDciLz48L3N2Zz4=')] md:hover:underline md:after:hover:translate-x-[-0.3rem] md:after:hover:opacity-100"
      href={href}
    >
      <span className="text-sm font-medium md:text-xl">{text}</span>
    </Link>
  );
}

// data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LXJpZ2h0Ij48cGF0aCBkPSJNNSAxMmgxNCIvPjxwYXRoIGQ9Im0xMiA1IDcgNy03IDciLz48L3N2Zz4=
