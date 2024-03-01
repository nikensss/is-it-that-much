import Link from 'next/link';

export type NavBarLinkProps = {
  text: string;
  href: string;
};

export default function NavBarLink({ text, href }: NavBarLinkProps) {
  return (
    <Link className="block p-2 font-medium hover:underline md:inline-block md:px-2" href={href}>
      {text}
    </Link>
  );
}
