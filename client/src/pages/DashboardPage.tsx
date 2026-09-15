import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  MessageSquareReply,
  Plus,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";

import { Link } from "react-router";

import { Button } from "@/components/ui/button";

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
    <div className="w-full">
      <section className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/8 via-background to-cyan-500/6 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 2xl:flex-row 2xl:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Welcome back</p>

            <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl 2xl:text-4xl">
              {userData?.user.firstName
                ? `${userData.user.firstName}, here's your job search at a glance.`
                : "Your job search at a glance."}
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Keep track of your progress and focus on the opportunities that
              need your attention next.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row 2xl:shrink-0">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              render={<Link to="/applications" />}
            >
              View applications
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              className="w-full sm:w-auto"
              render={<Link to="/applications/new" />}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add application
            </Button>
          </div>
        </div>
      </section>

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
          <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatsCard
              title="Total applications"
              value={stats.total}
              description="All opportunities you're tracking"
              icon={BriefcaseBusiness}
              tone="primary"
            />

            <StatsCard
              title="Applied"
              value={stats.applied}
              description="Applications currently at the applied stage"
              icon={Send}
              tone="blue"
            />

            <StatsCard
              title="Interviews"
              value={stats.interviews}
              description="Opportunities in interview stages"
              icon={CalendarCheck}
              tone="amber"
            />

            <StatsCard
              title="Offers"
              value={stats.offers}
              description="Offers received so far"
              icon={Trophy}
              tone="emerald"
            />

            <StatsCard
              title="Rejected"
              value={stats.rejected}
              description="Applications that did not move forward"
              icon={XCircle}
              tone="rose"
            />

            <StatsCard
              title="Response rate"
              value={`${stats.responseRate}%`}
              description="Submitted applications with a response"
              icon={MessageSquareReply}
              tone="violet"
            />
          </div>

          <div className="mt-6 grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
            <StatusChart data={data.statusDistribution} />

            <MonthlyActivityChart data={data.monthlyActivity} />
          </div>

          <div className="mt-6 w-full">
            <RecentApplications
              applications={recentApplicationsData?.applications ?? []}
            />
          </div>
        </>
      )}
    </div>
  );
}
