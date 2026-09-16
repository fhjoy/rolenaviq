import { useDroppable } from "@dnd-kit/core";

import { Badge } from "@/components/ui/badge";

import { BoardCard } from "./BoardCard";

import type { Application, ApplicationStatus } from "@/types/application";

interface BoardColumnProps {
  status: ApplicationStatus;
  title: string;
  applications: Application[];
  onReopen?: (application: Application) => void;
  updatingApplicationId?: string;
  isDragActive?: boolean;
  isDropAllowed?: boolean;
}

const columnAccentStyles: Record<ApplicationStatus, string> = {
  saved: "bg-slate-400",
  applied: "bg-sky-500",
  screening: "bg-cyan-500",
  interview: "bg-amber-500",
  technical_interview: "bg-orange-500",
  offer: "bg-emerald-500",
  rejected: "bg-rose-500",
  withdrawn: "bg-zinc-400",
};

export function BoardColumn({
  status,
  title,
  applications,
  onReopen,
  updatingApplicationId,
  isDragActive = false,
  isDropAllowed = true,
}: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  const isInvalidTarget = isDragActive && !isDropAllowed;

  return (
    <section
      ref={setNodeRef}
      className={[
        "flex min-h-[28rem] w-[82vw] max-w-80 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all sm:w-80",
        isOver && isDropAllowed
          ? "border-brand bg-brand/5 shadow-md shadow-brand/10 ring-2 ring-brand/15"
          : isOver && !isDropAllowed
            ? "border-destructive/50 bg-destructive/5 ring-2 ring-destructive/10"
            : isInvalidTarget
              ? "border-border/50 opacity-55"
              : "border-border/70",
      ].join(" ")}
    >
      <div className={`h-1 w-full ${columnAccentStyles[status]}`} />

      <header className="flex items-center justify-between border-b px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${columnAccentStyles[status]}`}
            aria-hidden="true"
          />

          <h2 className="font-semibold">{title}</h2>
        </div>

        <Badge variant="secondary" className="min-w-7 justify-center">
          {applications.length}
        </Badge>
      </header>

      <div
        className={[
          "min-h-80 flex-1 space-y-3 p-3 transition-colors",
          isDragActive && isDropAllowed ? "bg-brand/2" : "",
        ].join(" ")}
      >
        {applications.length === 0 ? (
          <div
            className={[
              "flex min-h-40 items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground transition-colors",
              isOver && isDropAllowed
                ? "border-brand/50 bg-brand/5 text-brand"
                : isOver && !isDropAllowed
                  ? "border-destructive/40 bg-destructive/5 text-destructive"
                  : "",
            ].join(" ")}
          >
            {isDragActive && !isDropAllowed
              ? "This move is not allowed"
              : "Drop application here"}
          </div>
        ) : (
          <>
            {applications.map((application) => (
              <BoardCard
                key={application._id}
                application={application}
                onReopen={onReopen}
                isUpdating={updatingApplicationId === application._id}
              />
            ))}

            {isDragActive && isDropAllowed && (
              <div
                className={[
                  "flex min-h-24 items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm transition-colors",
                  isOver
                    ? "border-brand/50 bg-brand/5 font-medium text-brand"
                    : "border-border/70 text-muted-foreground",
                ].join(" ")}
              >
                Drop anywhere in this column
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
