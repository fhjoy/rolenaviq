import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

interface InfiniteApplicationsFooterProps {
  loadedCount: number;
  total: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
}

export function InfiniteApplicationsFooter({
  loadedCount,
  total,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: InfiniteApplicationsFooterProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError ||
      !sentinelRef.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "0px 0px 240px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, onLoadMore]);

  return (
    <div className="mt-6 border-t px-4 py-5 text-center">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {loadedCount} of {total} applications
      </p>
      {isFetchNextPageError && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          Could not load more applications. Please try again.
        </p>
      )}
      {hasNextPage && (
        <>
          <div ref={sentinelRef} aria-hidden="true" />
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage
              ? "Loading more..."
              : isFetchNextPageError
                ? "Try again"
                : "Load more"}
          </Button>
        </>
      )}
    </div>
  );
}
