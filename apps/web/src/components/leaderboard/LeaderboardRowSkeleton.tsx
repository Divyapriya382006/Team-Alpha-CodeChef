import { Skeleton } from "../ui/Skeleton";

export function LeaderboardRowSkeleton() {
  return (
    <div className="surface flex items-center gap-4 p-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-8 w-24 shrink-0" />
    </div>
  );
}
