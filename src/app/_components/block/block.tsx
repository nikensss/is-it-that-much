export function Block({ children }: { children: React.ReactNode }) {
  return <div className="flex grow flex-col rounded-md border border-primary-200 bg-white p-2">{children}</div>;
}
