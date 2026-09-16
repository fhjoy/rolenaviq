import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router";

import type { Application } from "@/types/application";

interface MonthlyCalendarProps {
  month: Date;
  applications: Application[];
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthlyCalendar({ month, applications }: MonthlyCalendarProps) {
  const monthStart = startOfMonth(month);

  const calendarStart = startOfWeek(monthStart, {
    weekStartsOn: 1,
  });

  const calendarEnd = endOfWeek(endOfMonth(month), {
    weekStartsOn: 1,
  });

  const days: Date[] = [];
  let currentDay = calendarStart;

  while (currentDay <= calendarEnd) {
    days.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div className="min-w-175">
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayApplications = applications.filter(
              (application) =>
                application.interviewDate &&
                isSameDay(new Date(application.interviewDate), day),
            );

            const belongsToMonth = isSameMonth(day, month);

            return (
              <div
                key={day.toISOString()}
                className={[
                  "min-h-32 border-b border-r p-2 transition-colors last:border-r-0",
                  belongsToMonth
                    ? "bg-card hover:bg-muted/20"
                    : "bg-muted/25 text-muted-foreground",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                      isToday(day)
                        ? "bg-brand text-brand-foreground shadow-sm"
                        : "",
                    ].join(" ")}
                  >
                    {format(day, "d")}
                  </div>

                  {dayApplications.length > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {dayApplications.length}
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1.5">
                  {dayApplications.map((application) => (
                    <Link
                      key={application._id}
                      to={`/applications/${application._id}`}
                      className="group block rounded-lg border border-brand/20 bg-brand/8 px-2 py-1.5 text-xs transition-colors hover:border-brand/35 hover:bg-brand/12"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-brand">
                        <CalendarDays
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                        {format(new Date(application.interviewDate!), "HH:mm")}
                      </span>

                      <span className="mt-1 block truncate font-medium">
                        {application.company}
                      </span>

                      <span className="block truncate text-muted-foreground group-hover:text-foreground/70">
                        {application.position}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
