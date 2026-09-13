import { useDroppable } from "@dnd-kit/core";

import { Badge } from "@/components/ui/badge";

import { BoardCard } from "./BoardCard";

import type { Application, ApplicationStatus } from "@/types/application";

interface BoardColumnProps {
  status: ApplicationStatus;
  title: string;
  applications: Application[];
}

export function BoardColumn({ status, title, applications }: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,

    data: {
      status,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={[
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
        isOver ? "border-primary bg-primary/5" : "",
      ].join(" ")}
    >
      <header className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">{title}</h2>

        <Badge variant="secondary">{applications.length}</Badge>
      </header>

      <div className="min-h-40 space-y-3 p-3">
        {applications.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Drop application here
          </div>
        ) : (
          applications.map((application) => (
            <BoardCard key={application._id} application={application} />
          ))
        )}
      </div>
    </section>
  );
}
