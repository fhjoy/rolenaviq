import { useInfiniteQuery } from "@tanstack/react-query";

import type { ApplicationQueryParams } from "@/types/application";

import { getApplications } from "./application.api";

export function useInfiniteApplications(params: Omit<ApplicationQueryParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["applications", "infinite", params],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getApplications({ ...params, page: pageParam }, signal),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });
}
