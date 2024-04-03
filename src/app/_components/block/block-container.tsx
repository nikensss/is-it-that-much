export function BlockContainer({ children }: { children: React.ReactNode }) {
  return <section className="flex grow flex-col bg-primary-100 p-2">{children}</section>;
}
