import { addMonths, format, subMonths } from "date-fns";
import { CalendarX, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useApplications } from "@/features/applications/useApplications";
import { InterviewCard } from "@/features/calendar/InterviewCard";
import { MonthlyCalendar } from "@/features/calendar/MonthlyCalendar";
import { EmptyState } from "@/components/common/EmptyState";
import { PageError } from "@/components/common/PageError";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-96" />

        <Skeleton className="mt-8 h-125 w-full rounded-xl" />
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
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>

        <p className="mt-2 text-muted-foreground">
          Keep track of interviews and important appointments.
        </p>
      </div>

      {/* Monthly calendar */}
      <section className="mt-8 rounded-xl border bg-background">
        <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">
            {format(selectedMonth, "MMMM yyyy")}
          </h2>

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

      {/* Upcoming */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming interviews</h2>

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

      {/* Past */}
      {pastInterviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Past interviews</h2>

          <div className="mt-4 grid gap-4 opacity-75 xl:grid-cols-2">
            {pastInterviews.map((application) => (
              <InterviewCard key={application._id} application={application} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
