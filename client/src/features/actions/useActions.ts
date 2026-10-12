import { useInfiniteQuery } from "@tanstack/react-query";
import { getActions } from "./actions.api";

export function useActions(applicationId?: string, status: "open" | "completed" | "all" = "open") {
  return useInfiniteQuery({
    queryKey: ["actions", applicationId ?? "all", status],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => getActions({ applicationId, status, page: pageParam, limit: 100 }, signal),
    getNextPageParam: last => last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
  });
}
