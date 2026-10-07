import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarCheck,
  MessageSquareReply,
  Plus,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";

import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { InfiniteApplicationsFooter } from "@/features/applications/InfiniteApplicationsFooter";
import { useInfiniteApplications } from "@/features/applications/useInfiniteApplications";
import { MonthlyActivityChart } from "@/features/dashboard/MonthlyActivityChart";
import { RecentApplications } from "@/features/dashboard/RecentApplications";
import { StatsCard } from "@/features/dashboard/StatsCard";
import { StatusChart } from "@/features/dashboard/StatusChart";
import { useDashboardStats } from "@/features/dashboard/useDashboardStats";
import { PageError } from "@/components/common/PageError";
import { DashboardSkeleton } from "@/features/dashboard/DashboardSkeleton";
import { DemoTourCard } from "@/components/common/DemoTourCard";
import { getApplications } from "@/features/applications/application.api";

function hasSeenDemoTour(userId: string) {
  try {
    return window.localStorage.getItem(`rolenaviq:guided-tour:${userId}`) === "seen";
  } catch {
    return false;
  }
}

export function DashboardPage() {
  const { data: userData } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const [dismissedForUser, setDismissedForUser] = useState<string | null>(null);
  const demoUserId = userData?.user.isDemo ? userData.user.id : undefined;
  const tourParam = searchParams.get("tour");
  const showTour = demoUserId !== undefined && (
    tourParam === "1" ||
    (tourParam === null && dismissedForUser !== demoUserId && !hasSeenDemoTour(demoUserId))
  );

  const markTourSeen = () => {
    if (!demoUserId) return;
    try {
      window.localStorage.setItem(`rolenaviq:guided-tour:${demoUserId}`, "seen");
    } catch {
      // The card can still be dismissed for this visit when storage is unavailable.
    }
    setDismissedForUser(demoUserId);
  };
  const featured = useQuery({
    queryKey: ["demo-tour", userData?.user.id, "northstar"],
    queryFn: () => getApplications({ search: "Northstar Labs", limit: 10 }),
    enabled: showTour,
  });
  const example = featured.data?.applications.find(
    (application) => application.company === "Northstar Labs" && application.status === "interview",
  );

  const { data, isLoading, isError } = useDashboardStats();

  const recentApplications = useInfiniteApplications({
    limit: 10,
    sort: "-createdAt",
  });
  const loadedApplications =
    recentApplications.data?.pages.flatMap((page) => page.applications) ?? [];

  const stats = data?.stats;

  return (
    <div className="w-full">
      <section className="workspace-dashboard-hero">
        <div className="workspace-hero-content">
          <p className="workspace-eyebrow"><span aria-hidden="true" />Your search, in focus</p>
          <h1>
            {userData?.user.firstName
              ? `Welcome back, ${userData.user.firstName}.`
              : "Welcome back."}
          </h1>
          <p className="workspace-hero-description">
            Every opportunity has a next step. Keep your progress in view and make the next move count.
          </p>
          <div className="workspace-hero-actions">
            <Button className="workspace-hero-primary" render={<Link to="/applications/new" />}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add application
            </Button>
            <Button className="workspace-hero-secondary" variant="outline" render={<Link to="/applications" />}>
              View applications <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            {userData?.user.isDemo === true && !showTour && (
              <Button className="workspace-hero-secondary" variant="outline" render={<Link to="/dashboard?tour=1" />}>
                Take guided tour <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
        <div className="workspace-route-card" aria-label="Your job search in numbers">
          <div className="workspace-route-heading"><span>YOUR ROUTE</span><span aria-hidden="true">↗</span></div>
          <div className="workspace-route-step"><span className="workspace-route-node" aria-hidden="true" /><span>Opportunities tracked</span><strong>{stats?.total ?? "—"}</strong></div>
          <div className="workspace-route-step"><span className="workspace-route-node" aria-hidden="true" /><span>Interview stage</span><strong>{stats?.interviews ?? "—"}</strong></div>
          <div className="workspace-route-step"><span className="workspace-route-node" aria-hidden="true" /><span>Offers received</span><strong>{stats?.offers ?? "—"}</strong></div>
          <p>One clear view of what comes next.</p>
        </div>
      </section>

      {showTour && (
        <DemoTourCard
          step={1}
          title="Start with an interview in your dashboard"
          description="Your demo has 30 applications. Open the Northstar Labs example to see its status, interview date and job description."
          destination={example ? `/applications/${example._id}?tour=1` : undefined}
          action="View example application"
          loading={featured.isPending}
          onContinue={markTourSeen}
          onSkip={markTourSeen}
        />
      )}

      {searchParams.get("tour") === "done" && userData?.user.isDemo === true && (
        <section aria-labelledby="demo-tour-done" className="mt-6 rounded-2xl border border-[#b5d9bf] bg-[#f8fcf8] p-5 dark:border-[#7aac88] dark:bg-[#315247] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#24523e] dark:text-[#c0e9ce]">Guided tour complete</p>
          <h2 id="demo-tour-done" className="mt-2 text-xl font-semibold">You have a plan for the conversation.</h2>
          <p className="mt-2 text-sm">Your saved preparation stays in this demo workspace. Explore the board or calendar next.</p>
          <div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold underline underline-offset-4">
            <Link to="/board">Explore the board</Link>
            <Link to="/calendar">Open the calendar</Link>
            <Link to="/dashboard">Dismiss</Link>
          </div>
        </section>
      )}

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
          <div className="workspace-section-heading mt-8">
            <div><span className="workspace-section-kicker">The big picture</span><h2>Your progress</h2></div>
            <p>See where your search stands today.</p>
          </div>
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

          <div className="workspace-next-step mt-6">
            <div className="workspace-next-icon"><BookOpenCheck className="h-6 w-6" aria-hidden="true" /></div>
            <div className="workspace-next-copy">
              <span className="workspace-section-kicker">Make the next conversation count</span>
              <h2>Turn interview time into preparation time.</h2>
              <p>Your interview plans, question bank and practice sessions are ready in Interview Prep.</p>
            </div>
            <a className="workspace-next-link" href="/prep/">Go to Interview Prep <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>

          <div className="workspace-section-heading mt-9">
            <div><span className="workspace-section-kicker">Signals &amp; momentum</span><h2>Look at the whole journey</h2></div>
          </div>
          <div className="mt-6 grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
            <StatusChart data={data.statusDistribution} />

            <MonthlyActivityChart data={data.monthlyActivity} />
          </div>

          <div className="mt-6 w-full">
            <RecentApplications
              applications={loadedApplications}
              isPending={recentApplications.isPending}
              isError={recentApplications.isError && !recentApplications.data}
              onRetry={() => void recentApplications.refetch()}
              footer={loadedApplications.length > 0 && (
                <InfiniteApplicationsFooter
                  loadedCount={loadedApplications.length}
                  total={recentApplications.data?.pages[0]?.pagination.total ?? 0}
                  hasNextPage={recentApplications.hasNextPage}
                  isFetchingNextPage={recentApplications.isFetchingNextPage}
                  isFetchNextPageError={recentApplications.isFetchNextPageError}
                  onLoadMore={() => void recentApplications.fetchNextPage()}
                />
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
