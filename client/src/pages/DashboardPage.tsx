import {
  BriefcaseBusiness,
  CalendarCheck,
  MessageSquareReply,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";

import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { useApplications } from "@/features/applications/useApplications";
import { MonthlyActivityChart } from "@/features/dashboard/MonthlyActivityChart";
import { RecentApplications } from "@/features/dashboard/RecentApplications";
import { StatsCard } from "@/features/dashboard/StatsCard";
import { StatusChart } from "@/features/dashboard/StatusChart";
import { useDashboardStats } from "@/features/dashboard/useDashboardStats";
import { PageError } from "@/components/common/PageError";
import { DashboardSkeleton } from "@/features/dashboard/DashboardSkeleton";

export function DashboardPage() {
  const { data: userData } = useCurrentUser();

  const { data, isLoading, isError } = useDashboardStats();

  const { data: recentApplicationsData } = useApplications({
    page: 1,
    limit: 10,
    sort: "-createdAt",
  });

  const stats = data?.stats;

  return (
    <div>
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {userData?.user.firstName}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Here's an overview of your job search.
        </p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="mt-8">
          <PageError
            title="Unable to load dashboard"
            message="Dashboard statistics could not be loaded."
          />
        </div>
      )}

      {stats && data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatsCard
              title="Total applications"
              value={stats.total}
              description="All tracked opportunities"
              icon={BriefcaseBusiness}
            />

            <StatsCard
              title="Applied"
              value={stats.applied}
              description="Waiting for the next step"
              icon={Send}
            />

            <StatsCard
              title="Interviews"
              value={stats.interviews}
              description="Interview stages"
              icon={CalendarCheck}
            />

            <StatsCard
              title="Offers"
              value={stats.offers}
              description="Offers received"
              icon={Trophy}
            />

            <StatsCard
              title="Rejected"
              value={stats.rejected}
              description="Applications declined"
              icon={XCircle}
            />

            <StatsCard
              title="Response rate"
              value={`${stats.responseRate}%`}
              description="Submitted applications with a response"
              icon={MessageSquareReply}
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <StatusChart data={data.statusDistribution} />

            <MonthlyActivityChart data={data.monthlyActivity} />
          </div>

          <div className="mt-8">
            <RecentApplications
              applications={recentApplicationsData?.applications ?? []}
            />
          </div>
        </>
      )}
    </div>
  );
}
