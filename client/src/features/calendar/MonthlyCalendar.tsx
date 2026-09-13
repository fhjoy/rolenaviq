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
    <div className="overflow-x-auto">
      <div className="min-w-175">
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground"
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

            return (
              <div
                key={day.toISOString()}
                className={[
                  "min-h-32 border-b border-r p-2",
                  !isSameMonth(day, month)
                    ? "bg-muted/30 text-muted-foreground"
                    : "bg-background",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                    isToday(day) ? "bg-primary text-primary-foreground" : "",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </div>

                <div className="mt-2 space-y-1">
                  {dayApplications.map((application) => (
                    <Link
                      key={application._id}
                      to={`/applications/${application._id}`}
                      className="block rounded-md bg-primary/10 px-2 py-1 text-xs hover:bg-primary/20"
                    >
                      <span className="block font-medium">
                        {format(new Date(application.interviewDate!), "HH:mm")}
                      </span>

                      <span className="block truncate">
                        {application.company}
                      </span>

                      <span className="block truncate text-muted-foreground">
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
