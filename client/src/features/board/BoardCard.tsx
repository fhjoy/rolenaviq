import { useDraggable } from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";

import { GripVertical } from "lucide-react";
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

    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-background p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/applications/${application._id}`}
            className="font-medium hover:underline"
          >
            {application.position}
          </Link>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {application.company}
          </p>
        </div>

        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Move ${application.position} at ${application.company}`}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {application.location && (
        <p className="mt-3 text-xs text-muted-foreground">
          {application.location}
        </p>
      )}

      {application.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {application.technologies.slice(0, 3).map((technology) => (
            <Badge key={technology} variant="outline" className="text-xs">
              {technology}
            </Badge>
          ))}

          {application.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{application.technologies.length - 3}
            </Badge>
          )}
        </div>
      )}
    </article>
  );
}
