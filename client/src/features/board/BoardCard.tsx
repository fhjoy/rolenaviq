import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Building2, GripVertical, MapPin, RotateCcw } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applicationStatusLabels } from "@/features/applications/application-display";
import { boardColumns, canMoveApplication, isTerminalStatus } from "@/features/board/board.constants";

import type { Application, ApplicationStatus } from "@/types/application";

interface BoardCardProps {
  application: Application;
  onReopen?: (application: Application) => void;
  onMove?: (application: Application, status: ApplicationStatus) => void;
  isUpdating?: boolean;
}

export function BoardCard({
  application,
  onReopen,
  onMove,
  isUpdating = false,
}: BoardCardProps) {
  const canReopen =
    application.status === "rejected" || application.status === "withdrawn";
  const isDragDisabled = isTerminalStatus(application.status);
  const nextStatuses = boardColumns.filter(
    (column) => column.status !== application.status &&
      canMoveApplication(application.status, column.status),
  );

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useDraggable({
      id: application._id,
      disabled: isDragDisabled,
      data: {
        application,
      },
    });

  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    opacity: isDragging ? 0.25 : 1,
  };

  // Dragging starts on card content, while links and controls keep their normal actions.
  const startsOnControl = (target: EventTarget) =>
    target instanceof Element &&
    Boolean(target.closest("a, input, select, textarea, button:not([data-drag-handle])"));

  return (
    <article
      ref={setNodeRef}
      onMouseDown={(event) => {
        if (!startsOnControl(event.target)) listeners?.onMouseDown?.(event);
      }}
      onTouchStart={(event) => {
        if (!startsOnControl(event.target)) listeners?.onTouchStart?.(event);
      }}
      style={style}
      className={[
        "rounded-xl border bg-background p-4 shadow-sm transition-all",
        isDragging
          ? "border-brand/40 shadow-none"
          : isDragDisabled
            ? "border-border/70 hover:-translate-y-0.5 hover:shadow-md"
            : "cursor-grab border-border/70 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing",
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
          ref={setActivatorNodeRef}
          type="button"
          data-drag-handle
          onKeyDown={(event) => listeners?.onKeyDown?.(event)}
          {...(!isDragDisabled ? attributes : {})}
          disabled={isDragDisabled}
          className={[
            "flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [touch-action:none]",
            isDragDisabled
              ? "cursor-not-allowed opacity-35"
              : "cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing",
          ].join(" ")}
          aria-label={
            isDragDisabled
              ? `${application.position} cannot be moved from ${application.status}`
              : `Move ${application.position} at ${application.company}`
          }
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

      {!isDragDisabled && onMove && (
        <div className="mt-4">
          <label className="sr-only" htmlFor={`move-${application._id}`}>
            Move {application.position} at {application.company} to a stage
          </label>
          <select
            id={`move-${application._id}`}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            defaultValue=""
            disabled={isUpdating}
            onChange={(event) => {
              const status = event.target.value as ApplicationStatus;
              event.target.value = "";
              if (status) onMove(application, status);
            }}
          >
            <option value="">Move to stage…</option>
            {nextStatuses.map(({ status }) => (
              <option key={status} value={status}>{applicationStatusLabels[status]}</option>
            ))}
          </select>
        </div>
      )}

      {canReopen && onReopen && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 min-h-11 w-full"
          disabled={isUpdating}
          onClick={() => onReopen(application)}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {isUpdating ? "Reopening..." : "Reopen application"}
        </Button>
      )}
    </article>
  );
}
