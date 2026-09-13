export interface DashboardStats {
  total: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface MonthlyActivityItem {
  month: string;
  count: number;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;

  statusDistribution: StatusDistributionItem[];

  monthlyActivity: MonthlyActivityItem[];
}
