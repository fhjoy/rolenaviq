import { useQuery } from "@tanstack/react-query";

import { getApplicationById } from "./application.api";

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["applications", "detail", id],

    queryFn: () => getApplicationById(id),

    enabled: Boolean(id),
  });
}
