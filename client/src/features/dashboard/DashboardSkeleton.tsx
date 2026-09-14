import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div key={index} className="rounded-xl border p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-6 h-72 w-full" />
        </div>

        <div className="rounded-xl border p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-40" />

        <div className="mt-6 space-y-5">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-44" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>

              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
