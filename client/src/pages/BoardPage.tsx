import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness, Columns3, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { PageError } from "@/components/common/PageError";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationStatusLabels } from "@/features/applications/application-display";
import { updateApplication } from "@/features/applications/application.api";
import { useApplications } from "@/features/applications/useApplications";
import { BoardColumn } from "@/features/board/BoardColumn";
import {
  boardColumns,
  canMoveApplication,
} from "@/features/board/board.constants";
import type { Application, ApplicationStatus } from "@/types/application";

interface StatusUpdateVariables {
  id: string;
  status: ApplicationStatus;
  interviewDate?: string;
  successMessage?: string;
}

interface PendingInterviewMove {
  application: Application;
  status: "interview" | "technical_interview";
}

function BoardDragPreview({ application }: { application: Application }) {
  return (
    <div className="w-80 max-w-[82vw] rotate-1 rounded-xl border border-brand/30 bg-card p-4 shadow-2xl shadow-foreground/20">
      <div className="min-w-0">
        <p className="line-clamp-2 font-semibold leading-snug">
          {application.position}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{application.company}</span>
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
          </div>
        )}
      </div>
    </div>
  );
}

export function BoardPage() {
  const queryClient = useQueryClient();
  const [activeApplication, setActiveApplication] = useState<Application | null>(
    null,
  );
  const [pendingInterviewMove, setPendingInterviewMove] =
    useState<PendingInterviewMove | null>(null);
  const [interviewDate, setInterviewDate] = useState("");

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
    mutationFn: ({
      id,
      status,
      interviewDate: nextInterviewDate,
    }: StatusUpdateVariables) =>
      updateApplication(id, {
        status,
        ...(nextInterviewDate
          ? { interviewDate: new Date(nextInterviewDate).toISOString() }
          : {}),
      }),

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);

      toast.success(
        variables.successMessage ??
          `Moved to ${applicationStatusLabels[variables.status]}`,
      );
    },

    onError: () => {
      toast.error("Unable to update application status");
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const application = event.active.data.current?.application as
      | Application
      | undefined;

    setActiveApplication(application ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const application = active.data.current?.application as
      | Application
      | undefined;

    setActiveApplication(null);

    if (!over || !application) {
      return;
    }

    const newStatus = over.id as ApplicationStatus;

    if (application.status === newStatus) {
      return;
    }

    if (!canMoveApplication(application.status, newStatus)) {
      toast.error(
        `${applicationStatusLabels[application.status]} cannot move to ${applicationStatusLabels[newStatus]}`,
      );

      return;
    }

    if (newStatus === "interview" || newStatus === "technical_interview") {
      setPendingInterviewMove({
        application,
        status: newStatus,
      });
      setInterviewDate("");
      return;
    }

    updateStatusMutation.mutate({
      id: application._id,
      status: newStatus,
    });
  };

  const handleReopen = (application: Application) => {
    updateStatusMutation.mutate({
      id: application._id,
      status: "applied",
      successMessage: "Application reopened and moved to Applied",
    });
  };

  const handleInterviewMoveConfirm = () => {
    if (!pendingInterviewMove || !interviewDate) {
      return;
    }

    const { application, status } = pendingInterviewMove;

    updateStatusMutation.mutate({
      id: application._id,
      status,
      interviewDate,
      successMessage: `Moved to ${applicationStatusLabels[status]} and scheduled for ${new Date(
        interviewDate,
      ).toLocaleString()}`,
    });

    setPendingInterviewMove(null);
    setInterviewDate("");
  };

  const closeInterviewDialog = () => {
    setPendingInterviewMove(null);
    setInterviewDate("");
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
              className="w-80 shrink-0 rounded-2xl border bg-card p-4"
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
      <section className="flex flex-col justify-between gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
            <Columns3 className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Board</h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Move applications forward through your job-search pipeline. Closed
              applications can be reopened explicitly when needed.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" render={<Link to="/applications" />}>
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
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>

        {updateStatusMutation.isPending && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Updating status...
          </p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveApplication(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-4 overflow-x-auto pb-6 [scrollbar-width:thin]">
          <div className="flex min-w-max snap-x snap-mandatory gap-4">
            {boardColumns.map((column) => {
              const columnApplications = applications.filter(
                (application) => application.status === column.status,
              );
              const isDropAllowed = activeApplication
                ? canMoveApplication(activeApplication.status, column.status)
                : true;

              return (
                <BoardColumn
                  key={column.status}
                  status={column.status}
                  title={column.title}
                  applications={columnApplications}
                  onReopen={handleReopen}
                  updatingApplicationId={
                    updateStatusMutation.isPending
                      ? updateStatusMutation.variables?.id
                      : undefined
                  }
                  isDragActive={Boolean(activeApplication)}
                  isDropAllowed={isDropAllowed}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeApplication ? (
            <BoardDragPreview application={activeApplication} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog
        open={Boolean(pendingInterviewMove)}
        onOpenChange={(open) => {
          if (!open) {
            closeInterviewDialog();
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Schedule {pendingInterviewMove?.status === "technical_interview"
                ? "technical interview"
                : "interview"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Add the interview date and time before moving{" "}
              {pendingInterviewMove?.application.position ?? "this application"}
              {pendingInterviewMove?.application.company
                ? ` at ${pendingInterviewMove.application.company}`
                : ""}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="board-interview-date">Interview date & time</Label>
            <Input
              id="board-interview-date"
              type="datetime-local"
              value={interviewDate}
              onChange={(event) => setInterviewDate(event.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This date will also appear in the RoleNaviq calendar.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeInterviewDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={!interviewDate || updateStatusMutation.isPending}
              onClick={handleInterviewMoveConfirm}
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save & move"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
