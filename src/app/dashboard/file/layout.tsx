import { BlockTitle } from '~/app/_components/block';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlockTitle>From CSV file</BlockTitle>
      {children}
    </>
  );
}
