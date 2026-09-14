import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { BoardColumn } from "@/features/board/BoardColumn";
import { boardColumns } from "@/features/board/board.constants";
import { updateApplication } from "@/features/applications/application.api";
import { useApplications } from "@/features/applications/useApplications";
import type { ApplicationStatus } from "@/types/application";
import { PageError } from "@/components/common/PageError";
import { Skeleton } from "@/components/ui/skeleton";

export function BoardPage() {
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    useSensor(KeyboardSensor),
  );

  const { data, isLoading, isError } = useApplications({
    page: 1,
    limit: 100,
    sort: "-createdAt",
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplication(id, {
        status,
      }),

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      const statusLabel = variables.status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

      toast.success(`Moved to ${statusLabel}`);
    },

    onError: () => {
      toast.error("Unable to update application status");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const application = active.data.current?.application;

    if (!application) {
      return;
    }

    const newStatus = over.id as ApplicationStatus;

    if (application.status === newStatus) {
      return;
    }

    updateStatusMutation.mutate({
      id: application._id,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-80" />

        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div key={index} className="w-72 shrink-0 rounded-xl border p-4">
              <Skeleton className="h-5 w-24" />

              <div className="mt-5 space-y-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <PageError
        title="Unable to load board"
        message="Your application board could not be loaded."
      />
    );
  }

  const applications = data?.applications ?? [];

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Board</h1>

        <p className="mt-2 text-muted-foreground">
          Move applications through each stage of your job search.
        </p>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mt-8 overflow-x-auto pb-6">
          <div className="flex min-w-max items-start gap-4">
            {boardColumns.map((column) => {
              const columnApplications = applications.filter(
                (application) => application.status === column.status,
              );

              return (
                <BoardColumn
                  key={column.status}
                  status={column.status}
                  title={column.title}
                  applications={columnApplications}
                />
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
