import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationCardSkeleton() {
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />

        <Skeleton className="h-4 w-1/3" />

        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <Skeleton className="h-4 w-1/2" />

        <div className="flex gap-2 pt-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
