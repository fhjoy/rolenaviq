import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  applicationFormSchema,
  type ApplicationFormData,
} from "@/features/applications/application.schemas";
import { updateApplication } from "@/features/applications/application.api";
import { useApplication } from "@/features/applications/useApplication";
import type { Application } from "@/types/application";
import { PageError } from "@/components/common/PageError";
import { Skeleton } from "@/components/ui/skeleton";

interface EditFormProps {
  application: Application;
}

function toDateTimeLocal(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  const offset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function EditForm({ application }: EditFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),

    defaultValues: {
      company: application.company,

      position: application.position,

      jobUrl: application.jobUrl ?? "",

      location: application.location ?? "",

      workplaceType: application.workplaceType ?? "",

      employmentType: application.employmentType ?? "",

      status: application.status,

      technologies: application.technologies.join(", "),

      appliedAt: application.appliedAt
        ? application.appliedAt.slice(0, 10)
        : "",

      interviewDate: toDateTimeLocal(application.interviewDate),

      notes: application.notes ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ApplicationFormData) => {
      const technologies =
        data.technologies
          ?.split(",")
          .map((technology: string) => technology.trim())
          .filter(Boolean) ?? [];

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
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      toast.success("Application updated");

      navigate(`/applications/${application._id}`);
    },

    onError: () => {
      toast.error("Unable to update application");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="mt-8 space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>

        <Input id="company" {...register("company")} />

        {errors.company && (
          <p role="alert" className="text-sm text-destructive">
            {errors.company.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>

        <Input id="position" {...register("position")} />

        {errors.position && (
          <p role="alert" className="text-sm text-destructive">
            {errors.position.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job URL</Label>

        <Input id="jobUrl" type="url" {...register("jobUrl")} />

        {errors.jobUrl && (
          <p role="alert" className="text-sm text-destructive">
            {errors.jobUrl.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>

        <Input id="location" {...register("location")} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workplaceType">Workplace</Label>

          <select
            id="workplaceType"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            {...register("workplaceType")}
          >
            <option value="">Select</option>

            <option value="remote">Remote</option>

            <option value="hybrid">Hybrid</option>

            <option value="onsite">On-site</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment</Label>

          <select
            id="employmentType"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            {...register("employmentType")}
          >
            <option value="">Select</option>

            <option value="full_time">Full-time</option>

            <option value="part_time">Part-time</option>

            <option value="contract">Contract</option>

            <option value="freelance">Freelance</option>

            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>

        <select
          id="status"
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          {...register("status")}
        >
          <option value="saved">Saved</option>

          <option value="applied">Applied</option>

          <option value="screening">Screening</option>

          <option value="interview">Interview</option>

          <option value="technical_interview">Technical Interview</option>

          <option value="offer">Offer</option>

          <option value="rejected">Rejected</option>

          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies</Label>

        <Input id="technologies" {...register("technologies")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="appliedAt">Application date</Label>

        <Input id="appliedAt" type="date" {...register("appliedAt")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interviewDate">Interview date & time</Label>

        <Input
          id="interviewDate"
          type="datetime-local"
          {...register("interviewDate")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>

        <Textarea id="notes" rows={5} {...register("notes")} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>

        <Button
          type="button"
          variant="outline"
          render={<Link to={`/applications/${application._id}`} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function EditApplicationPage() {
  const { id = "" } = useParams();

  const { data, isLoading, isError } = useApplication(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-3 h-4 w-80" />

        <div className="mt-8 space-y-6">
          {Array.from({
            length: 7,
          }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}

          <div className="flex gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.application) {
    return (
      <PageError
        title="Application not found"
        message="The application could not be loaded for editing."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Edit application</h1>

      <p className="mt-2 text-muted-foreground">
        Update the application details.
      </p>

      <EditForm application={data.application} />
    </div>
  );
}
