import { addMonths, format, isBefore, startOfDay, subMonths } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { EmptyState } from "@/components/common/EmptyState";
import { PageError } from "@/components/common/PageError";
import { WorkspaceFeatureHero } from "@/components/layout/WorkspaceFeatureHero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteApplications } from "@/features/applications/useInfiniteApplications";
import { localFollowUpDate } from "@/features/applications/follow-up-date";
import { InterviewCard } from "@/features/calendar/InterviewCard";
import { MonthlyCalendar } from "@/features/calendar/MonthlyCalendar";

export function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteApplications({
    limit: 100,
    sort: "-createdAt",
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <Skeleton className="mt-8 h-125 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError && !data) {
    return (
      <PageError
        title="Unable to load calendar"
        message="Your interview schedule could not be loaded."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  const applications = data?.pages.flatMap((page) => page.applications) ?? [];
  const now = new Date();

  const interviews = applications
    .filter((application) => application.interviewDate)
    .sort(
      (a, b) =>
        new Date(a.interviewDate!).getTime() -
        new Date(b.interviewDate!).getTime(),
    );

  const upcomingInterviews = interviews.filter(
    (application) => new Date(application.interviewDate!) >= now,
  );

  const pastInterviews = interviews
    .filter((application) => new Date(application.interviewDate!) < now)
    .reverse();
  const followUps = applications
    .filter((application) => application.nextAction && application.followUpDate)
    .sort((a, b) => a.followUpDate!.localeCompare(b.followUpDate!));

  return (
    <div className="w-full">
      <WorkspaceFeatureHero
        eyebrow="Know what is next"
        title="Calendar"
        description="Keep interview dates and follow-up actions close to the applications they belong to."
        icon={CalendarDays}
        metricValue={upcomingInterviews.length}
        metricLabel={upcomingInterviews.length === 1 ? "upcoming interview" : "upcoming interviews"}
        metricDescription="Open Interview Prep to turn each date into a plan."
        actions={<>
          <Button className="workspace-hero-primary" render={<Link to="/applications/new" />}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add application
          </Button>
          <Button className="workspace-hero-secondary" variant="outline" render={<a href="/prep/" />}>
            Interview prep <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </>}
      />

      {isFetchingNextPage && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">Loading the rest of your calendar...</p>
      )}
      {isFetchNextPageError && (
        <div className="mt-4" role="alert">
          <p>Some calendar items could not be loaded.</p>
          <Button variant="outline" className="mt-2 min-h-11" onClick={() => void fetchNextPage()}>Try again</Button>
        </div>
      )}

      <section className="workspace-feature-panel mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Interview and follow-up schedule
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {format(selectedMonth, "MMMM yyyy")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Previous month"
              onClick={() =>
                setSelectedMonth((current) => subMonths(current, 1))
              }
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setSelectedMonth(new Date())}
            >
              Today
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Next month"
              onClick={() =>
                setSelectedMonth((current) => addMonths(current, 1))
              }
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <p className="px-4 pt-3 text-xs text-muted-foreground sm:hidden">Scroll the calendar sideways to see the whole week.</p>
        <MonthlyCalendar month={selectedMonth} applications={applications} />
      </section>

      <section className="mt-8" aria-labelledby="follow-ups-heading">
        <h2 id="follow-ups-heading" className="text-xl font-semibold">Follow-ups</h2>
        {followUps.length === 0 ? (
          <p className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            No follow-ups planned. Add a next action and date to an application.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 xl:grid-cols-2">
            {followUps.map((application) => {
              const day = localFollowUpDate(application.followUpDate!);
              const overdue = isBefore(day, startOfDay(now));
              return (
                <li key={application._id}>
                  <Link to={`/applications/${application._id}`} className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                    <ListTodo className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                    <span className="min-w-0 flex-1"><span className="block font-medium">{application.nextAction}</span><span className="text-sm text-muted-foreground">{application.company} · {application.position}</span></span>
                    <span className="shrink-0 text-sm font-medium">{overdue ? "Overdue · " : ""}{format(day, "d MMM")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand">Next up</p>
            <h2 className="mt-1 text-xl font-semibold">Upcoming interviews</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            {upcomingInterviews.length} scheduled
          </p>
        </div>

        {upcomingInterviews.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CalendarX}
              title="No upcoming interviews"
              description="Add an interview date to an application and it will appear here."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {upcomingInterviews.map((application) => (
              <InterviewCard key={application._id} application={application} />
            ))}
          </div>
        )}
      </section>

      {pastInterviews.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Past interviews</h2>
            <p className="text-sm text-muted-foreground">
              {pastInterviews.length} completed
            </p>
          </div>

          <div className="mt-4 grid gap-4 opacity-80 xl:grid-cols-2">
            {pastInterviews.map((application) => (
              <InterviewCard key={application._id} application={application} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
