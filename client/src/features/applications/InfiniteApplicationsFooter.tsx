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
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError ||
      !footerRef.current ||
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

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, onLoadMore]);

  return (
    <div ref={footerRef} className="mt-6 border-t px-4 py-5 text-center">
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
