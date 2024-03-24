import { Skeleton } from '~/components/ui/skeleton';

export default function UserBannerLoading() {
  return (
    <div className="my-2 flex items-center rounded-md border border-slate-100 p-4">
      <Skeleton className="mr-2 h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
