import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  applicationStatusLabels,
  applicationStatusStyles,
} from "@/features/applications/application-display";

import type { Application } from "@/types/application";

interface InterviewCardProps {
  application: Application;
}

export function InterviewCard({ application }: InterviewCardProps) {
  if (!application.interviewDate) {
    return null;
  }

  const interviewDate = new Date(application.interviewDate);

  return (
    <article className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold leading-snug">{application.position}</h2>

            <Badge
              variant="outline"
              className={applicationStatusStyles[application.status]}
            >
              {applicationStatusLabels[application.status]}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {application.company}
          </p>

          <div className="mt-4 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <CalendarDays
                className="h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              />

              <span>
                {interviewDate.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <Clock
                className="h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              />

              <span>
                {interviewDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>

            {application.location && (
              <p className="flex items-center gap-2 sm:col-span-2">
                <MapPin
                  className="h-4 w-4 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <span className="truncate">{application.location}</span>
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          render={<Link to={`/applications/${application._id}`} />}
        >
          View details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
