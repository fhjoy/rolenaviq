import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  applicationStatusLabels,
  applicationStatusStyles,
} from "@/features/applications/application-display";

import type { Application } from "@/types/application";

interface RecentApplicationsProps {
  applications: Application[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">Recent applications</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest tracked opportunities.
          </p>
        </div>

        <Button variant="outline" render={<Link to="/applications" />}>
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
          </div>

          <p className="mt-4 font-medium">No applications yet</p>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first application and it will appear here.
          </p>

          <Button className="mt-5" render={<Link to="/applications/new" />}>
            Add application
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {applications.map((application) => (
            <Link
              key={application._id}
              to={`/applications/${application._id}`}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium">{application.position}</p>

                  <p className="truncate text-sm text-muted-foreground">
                    {application.company}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={[
                  "shrink-0",
                  applicationStatusStyles[application.status],
                ].join(" ")}
              >
                {applicationStatusLabels[application.status]}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
