import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Building2, GripVertical, MapPin } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";

import type { Application } from "@/types/application";

interface BoardCardProps {
  application: Application;
}

export function BoardCard({ application }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application._id,
      data: {
        application,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-xl border bg-background p-4 shadow-sm transition-all",
        isDragging
          ? "scale-[1.02] border-primary shadow-lg shadow-primary/10"
          : "border-border/70 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/applications/${application._id}`}
            className="line-clamp-2 font-semibold leading-snug hover:text-primary"
          >
            {application.position}
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{application.company}</span>
          </div>
        </div>

        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          aria-label={`Move ${application.position} at ${application.company}`}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {application.location && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{application.location}</span>
        </div>
      )}

      {application.technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {application.technologies.slice(0, 3).map((technology) => (
            <Badge
              key={technology}
              variant="outline"
              className="max-w-full truncate text-xs font-normal"
            >
              {technology}
            </Badge>
          ))}

          {application.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{application.technologies.length - 3}
            </Badge>
          )}
        </div>
      )}
    </article>
  );
}
