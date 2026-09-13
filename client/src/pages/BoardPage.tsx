import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { BoardColumn } from "@/features/board/BoardColumn";
import { boardColumns } from "@/features/board/board.constants";

import { updateApplication } from "@/features/applications/application.api";

import { useApplications } from "@/features/applications/useApplications";

import type { ApplicationStatus } from "@/types/application";

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

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
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
    return <p>Loading board...</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive">
        Unable to load board.
      </p>
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

      {updateStatusMutation.isError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          Unable to update application status.
        </p>
      )}

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
