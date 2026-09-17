import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { ApplicationForm } from "@/features/applications/ApplicationForm";
import { createApplication } from "@/features/applications/application.api";
import type { ApplicationFormData } from "@/features/applications/application.schemas";

const defaultValues: ApplicationFormData = {
  company: "",
  position: "",
  jobUrl: "",
  location: "",
  workplaceType: "",
  employmentType: "",
  status: "saved",
  technologies: "",
  appliedAt: "",
  interviewDate: "",
  notes: "",
};

export function NewApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createApplication,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);

      toast.success("Application created");
      navigate("/applications");
    },

    onError: () => {
      toast.error("Unable to create application");
    },
  });

  const handleSubmit = (data: ApplicationFormData) => {
    const technologies =
      data.technologies
        ?.split(",")
        .map((technology) => technology.trim())
        .filter(Boolean) ?? [];

    mutation.mutate({
      ...data,
      jobUrl: data.jobUrl || undefined,
      location: data.location || undefined,
      workplaceType: data.workplaceType || undefined,
      employmentType: data.employmentType || undefined,
      appliedAt: data.appliedAt || undefined,
      interviewDate: data.interviewDate
        ? new Date(data.interviewDate).toISOString()
        : undefined,
      notes: data.notes || undefined,
      technologies,
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add application</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Save a new opportunity and keep its progress, dates and preparation notes in one place.
          </p>
        </div>
      </section>

      <ApplicationForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        submitLabel="Save application"
        cancelTo="/applications"
      />
    </div>
  );
}
