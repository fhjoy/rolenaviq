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
  const requestedAtCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError ||
      !footerRef.current
    ) {
      return;
    }

    const footer = footerRef.current;
    const loadIfVisible = () => {
      const bounds = footer.getBoundingClientRect();
      if (
        bounds.top > window.innerHeight + 240 ||
        bounds.bottom < 0 ||
        requestedAtCountRef.current === loadedCount
      ) {
        return;
      }

      requestedAtCountRef.current = loadedCount;
      onLoadMore();
    };

    const observer = typeof IntersectionObserver === "undefined"
      ? undefined
      : new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) loadIfVisible();
          },
          { rootMargin: "0px 0px 240px 0px" },
        );

    observer?.observe(footer);
    window.addEventListener("scroll", loadIfVisible, { passive: true });
    window.addEventListener("resize", loadIfVisible);
    const frame = observer ? window.requestAnimationFrame?.(loadIfVisible) : undefined;

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", loadIfVisible);
      window.removeEventListener("resize", loadIfVisible);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [loadedCount, hasNextPage, isFetchingNextPage, isFetchNextPageError, onLoadMore]);

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
