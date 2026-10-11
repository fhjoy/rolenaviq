import { differenceInCalendarDays, format } from "date-fns";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Link } from "react-router";

import { localFollowUpDate } from "@/features/applications/follow-up-date";
import type { DashboardStatsResponse } from "@/types/dashboard";

export function NextActions({ actions }: { actions: DashboardStatsResponse["nextActions"] }) {
  return (
    <section aria-labelledby="next-actions-heading" className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="next-actions-heading" className="text-xl font-semibold">Next actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Follow-ups to keep your search moving.</p>
        </div>
      </div>

      {actions.length === 0 ? (
        <p className="mt-5 rounded-xl bg-muted/35 p-4 text-sm text-muted-foreground">
          No follow-ups planned yet. Add a next action and date to an application.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {actions.map((action) => {
            const day = localFollowUpDate(action.followUpDate);
            const daysAway = differenceInCalendarDays(day, new Date());
            const when = daysAway < 0 ? "Overdue" : daysAway === 0 ? "Today" : format(day, "d MMM");

            return (
              <li key={action._id}>
                <Link
                  to={`/applications/${action._id}`}
                  className="group flex min-h-20 items-center justify-between gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{action.nextAction}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{action.company} · {action.position}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-brand">
                    {when}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
