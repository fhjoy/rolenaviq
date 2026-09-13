import { apiRequest } from "@/services/api";

import type { DashboardStatsResponse } from "@/types/dashboard";

export function getDashboardStats(): Promise<DashboardStatsResponse> {
  return apiRequest<DashboardStatsResponse>("/dashboard/stats");
}
