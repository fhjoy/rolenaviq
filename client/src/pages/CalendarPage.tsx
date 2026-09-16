import { addMonths, format, subMonths } from "date-fns";
import {
  CalendarDays,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { EmptyState } from "@/components/common/EmptyState";
import { PageError } from "@/components/common/PageError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplications } from "@/features/applications/useApplications";
import { InterviewCard } from "@/features/calendar/InterviewCard";
import { MonthlyCalendar } from "@/features/calendar/MonthlyCalendar";

export function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data, isLoading, isError } = useApplications({
    page: 1,
    limit: 100,
    sort: "-createdAt",
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <Skeleton className="mt-8 h-125 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <PageError
        title="Unable to load calendar"
        message="Your interview schedule could not be loaded."
      />
    );
  }

  const applications = data?.applications ?? [];
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

  return (
    <div className="w-full">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Keep interview dates visible and stay prepared for the next
              conversation in your job search.
            </p>
          </div>
        </div>

        <Button render={<Link to="/applications/new" />}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add application
        </Button>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Interview schedule
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
              onClick={() => setSelectedMonth(new Date())}
            >
              Today
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() =>
                setSelectedMonth((current) => addMonths(current, 1))
              }
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <MonthlyCalendar month={selectedMonth} applications={applications} />
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
