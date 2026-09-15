import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  applicationStatusLabels,
  applicationStatusStyles,
  employmentTypeLabels,
  workplaceTypeLabels,
} from "@/features/applications/application-display";

import type { Application } from "@/types/application";

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <article className="group rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">
            {application.position}
          </h2>

          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />

            <span className="truncate">{application.company}</span>
          </div>
        </div>

        <Badge
          variant="outline"
          className={applicationStatusStyles[application.status]}
        >
          {applicationStatusLabels[application.status]}
        </Badge>
      </div>

      {(application.location ||
        application.workplaceType ||
        application.employmentType) && (
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {application.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />

              {application.location}
            </span>
          )}

          {application.workplaceType && (
            <span>{workplaceTypeLabels[application.workplaceType]}</span>
          )}

          {application.employmentType && (
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />

              {employmentTypeLabels[application.employmentType]}
            </span>
          )}
        </div>
      )}

      {application.technologies.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {application.technologies.slice(0, 5).map((technology) => (
            <Badge key={technology} variant="outline" className="font-normal">
              {technology}
            </Badge>
          ))}

          {application.technologies.length > 5 && (
            <Badge
              variant="outline"
              className="font-normal text-muted-foreground"
            >
              +{application.technologies.length - 5}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <Button render={<Link to={`/applications/${application._id}`} />}>
          View details
        </Button>

        {application.jobUrl && (
          <Button
            variant="ghost"
            render={
              <a href={application.jobUrl} target="_blank" rel="noreferrer" />
            }
          >
            Job posting
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </article>
  );
}
