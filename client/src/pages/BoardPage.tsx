import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Columns3, Plus } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { PageError } from "@/components/common/PageError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationStatusLabels } from "@/features/applications/application-display";
import { updateApplication } from "@/features/applications/application.api";
import { useApplications } from "@/features/applications/useApplications";
import { BoardColumn } from "@/features/board/BoardColumn";
import { boardColumns } from "@/features/board/board.constants";
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

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      toast.success(`Moved to ${applicationStatusLabels[variables.status]}`);
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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />

        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-80 shrink-0 rounded-2xl border bg-background p-4"
            >
              <Skeleton className="h-5 w-24" />

              <div className="mt-5 space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
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
    <div className="w-full">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border bg-background p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Columns3 className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Board</h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Move applications through each stage of your job search and keep
              the whole pipeline visible at a glance.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            render={<Link to="/applications" />}
          >
            View applications
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button render={<Link to="/applications/new" />}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add application
          </Button>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {applications.length} {applications.length === 1 ? "application" : "applications"}
        </p>

        {updateStatusMutation.isPending && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Updating status...
          </p>
        )}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mt-4 overflow-x-auto pb-6 [scrollbar-width:thin]">
          <div className="flex min-w-max snap-x snap-mandatory items-start gap-4">
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
