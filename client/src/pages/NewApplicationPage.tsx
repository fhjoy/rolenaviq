import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  applicationFormSchema,
  type ApplicationFormData,
} from "@/features/applications/application.schemas";

import { createApplication } from "@/features/applications/application.api";

export function NewApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),

    defaultValues: {
      status: "saved",
    },
  });

  const mutation = useMutation({
    mutationFn: createApplication,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      navigate("/applications");
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
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

      notes: data.notes || undefined,

      technologies,
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add application</h1>

        <p className="mt-2 text-muted-foreground">
          Add a job opportunity to RoleNaviq.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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

          <Input
            id="jobUrl"
            type="url"
            placeholder="https://..."
            {...register("jobUrl")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>

          <Input
            id="location"
            placeholder="Berlin, Germany"
            {...register("location")}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="workplaceType">Workplace</Label>

            <select
              id="workplaceType"
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
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
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
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
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
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

          <Input
            id="technologies"
            placeholder="React, TypeScript, Node.js"
            {...register("technologies")}
          />

          <p className="text-xs text-muted-foreground">
            Separate technologies with commas.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appliedAt">Application date</Label>

          <Input id="appliedAt" type="date" {...register("appliedAt")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>

          <Textarea id="notes" rows={5} {...register("notes")} />
        </div>

        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            Unable to create application.
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save application"}
          </Button>

          <Button
            type="button"
            variant="outline"
            render={<Link to="/applications" />}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
