import { useQuery } from "@tanstack/react-query";

import type { ApplicationQueryParams } from "@/types/application";

import { getApplications } from "./application.api";

export function useApplications(params: ApplicationQueryParams) {
  return useQuery({
    queryKey: ["applications", params],

    queryFn: () => getApplications(params),
  });
}
