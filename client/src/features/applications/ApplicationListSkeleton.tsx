import { ApplicationCardSkeleton } from "./ApplicationCardSkeleton";

interface ApplicationListSkeletonProps {
  count?: number;
}

export function ApplicationListSkeleton({
  count = 6,
}: ApplicationListSkeletonProps) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      {Array.from({
        length: count,
      }).map((_, index) => (
        <ApplicationCardSkeleton key={index} />
      ))}
    </div>
  );
}
