import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router";

import type { Application } from "@/types/application";

interface ApplicationCardProps {
  application: Application;
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <article className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{application.position}</h2>
          <p className="text-sm text-muted-foreground">{application.company}</p>
        </div>
        <Badge variant="secondary">{formatStatus(application.status)}</Badge>
      </div>

      {application.location && (
        <p className="mt-4 text-sm">{application.location}</p>
      )}

      {application.technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {application.technologies.map((technology) => (
            <Badge key={technology} variant="outline">
              {technology}
            </Badge>
          ))}
        </div>
      )}

      {application.jobUrl && (
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline"
        >
          View job posting
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant="outline"
          render={<Link to={`/applications/${application._id}`} />}
        >
          View details
        </Button>

        {application.jobUrl && (
          <Button
            variant="ghost"
            render={
              <a href={application.jobUrl} target="_blank" rel="noreferrer" />
            }
          >
            View job posting
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </article>
  );
}
