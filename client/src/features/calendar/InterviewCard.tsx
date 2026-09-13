import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <article className="rounded-xl border bg-background p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{application.position}</h2>

            <Badge variant="secondary">
              {application.status.replaceAll("_", " ")}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {application.company}
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />

              {interviewDate.toLocaleDateString(undefined, {
                dateStyle: "full",
              })}
            </p>

            <p className="flex items-center gap-2">
              <Clock
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />

              {interviewDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {application.location && (
              <p className="flex items-center gap-2">
                <MapPin
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />

                {application.location}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          render={<Link to={`/applications/${application._id}`} />}
        >
          View details
        </Button>
      </div>
    </article>
  );
}
