import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { PageError } from "@/components/common/PageError";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationForm } from "@/features/applications/ApplicationForm";
import { updateApplication } from "@/features/applications/application.api";
import type { ApplicationFormData } from "@/features/applications/application.schemas";
import {
  getEditableApplicationStatuses,
  isReopenTransition,
} from "@/features/applications/application-workflow";
import { useApplication } from "@/features/applications/useApplication";
import type { Application } from "@/types/application";

function toDateTimeLocal(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getDefaultValues(application: Application): ApplicationFormData {
  return {
    company: application.company,
    position: application.position,
    jobUrl: application.jobUrl ?? "",
    location: application.location ?? "",
    workplaceType: application.workplaceType ?? "",
    employmentType: application.employmentType ?? "",
    status: application.status,
    technologies: application.technologies.join(", "),
    appliedAt: application.appliedAt ? application.appliedAt.slice(0, 10) : "",
    interviewDate: toDateTimeLocal(application.interviewDate),
    notes: application.notes ?? "",
  };
}

function EditForm({ application }: { application: Application }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const statusOptions = getEditableApplicationStatuses(application.status);

  const mutation = useMutation({
    mutationFn: (data: ApplicationFormData) => {
      const technologies =
        data.technologies
          ?.split(",")
          .map((technology) => technology.trim())
          .filter(Boolean) ?? [];
      const reopen = isReopenTransition(application.status, data.status);

      return updateApplication(application._id, {
        company: data.company,
        position: data.position,
        status: data.status,
        technologies,
        jobUrl: data.jobUrl || null,
        location: data.location || null,
        workplaceType: data.workplaceType || null,
        employmentType: data.employmentType || null,
        appliedAt: data.appliedAt || null,
        interviewDate: data.interviewDate
          ? new Date(data.interviewDate).toISOString()
          : null,
        notes: data.notes || null,
        ...(reopen ? { reopen: true } : {}),
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);

      toast.success("Application updated");
      navigate(`/applications/${application._id}`);
    },

    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to update application";
      toast.error(message);
    },
  });

  return (
    <ApplicationForm
      defaultValues={getDefaultValues(application)}
      onSubmit={(data) => mutation.mutate(data)}
      isSubmitting={mutation.isPending}
      submitLabel="Save changes"
      cancelTo={`/applications/${application._id}`}
      statusOptions={statusOptions}
    />
  );
}

export function EditApplicationPage() {
  const { id = "" } = useParams();
  const { data, isLoading, isError, refetch } = useApplication(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.application) {
    return (
      <PageError
        title="Application not found"
        message="The application could not be loaded for editing."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
          <Pencil className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit application</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Update {data.application.position} at {data.application.company} without losing track of the workflow.
          </p>
        </div>
      </section>

      <EditForm application={data.application} />
    </div>
  );
}
