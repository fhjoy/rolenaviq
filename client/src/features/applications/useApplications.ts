import { useQuery } from "@tanstack/react-query";

import { getApplications } from "./application.api";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });
}
