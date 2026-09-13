import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Application } from "@/types/application";

interface RecentApplicationsProps {
  applications: Application[];
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <section className="rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-semibold">Recent applications</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest tracked opportunities.
          </p>
        </div>

        <Button variant="outline" render={<Link to="/applications" />}>
          View all
        </Button>
      </div>

      {applications.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        <div className="divide-y">
          {applications.map((application) => (
            <Link
              key={application._id}
              to={`/applications/${application._id}`}
              className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{application.position}</p>

                <p className="truncate text-sm text-muted-foreground">
                  {application.company}
                </p>
              </div>

              <Badge variant="secondary">
                {formatStatus(application.status)}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
