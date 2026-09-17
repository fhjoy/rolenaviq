import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CalendarDays, FileText, MapPin, Save, Workflow } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatusLabels } from "@/features/applications/application-display";
import {
  applicationFormSchema,
  type ApplicationFormData,
} from "@/features/applications/application.schemas";
import { applicationStatuses } from "@/features/applications/application-workflow";
import type { ApplicationStatus } from "@/types/application";

interface ApplicationFormProps {
  defaultValues: ApplicationFormData;
  onSubmit: (data: ApplicationFormData) => void;
  isSubmitting: boolean;
  submitLabel: string;
  cancelTo: string;
  statusOptions?: ApplicationStatus[];
}

function todayForDateInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function nowForDateTimeInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ApplicationForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelTo,
  statusOptions = applicationStatuses,
}: ApplicationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues,
  });

  const status = useWatch({ control, name: "status" });
  const interviewStage =
    status === "interview" || status === "technical_interview";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Role & company</CardTitle>
              <CardDescription>
                Add the core details for this opportunity.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
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

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input
              id="jobUrl"
              type="url"
              placeholder="https://..."
              {...register("jobUrl")}
            />
            {errors.jobUrl && (
              <p role="alert" className="text-sm text-destructive">
                {errors.jobUrl.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Work setup</CardTitle>
              <CardDescription>
                Keep location and employment details easy to scan later.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Berlin, Germany"
              {...register("location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workplaceType">Workplace</Label>
            <select
              id="workplaceType"
              className={selectClassName}
              {...register("workplaceType")}
            >
              <option value="">Select workplace</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment</Label>
            <select
              id="employmentType"
              className={selectClassName}
              {...register("employmentType")}
            >
              <option value="">Select employment</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Workflow className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Application progress</CardTitle>
              <CardDescription>
                Track the current stage and the dates that drive your workflow.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" className={selectClassName} {...register("status")}>
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {applicationStatusLabels[statusOption]}
                </option>
              ))}
            </select>
            {statusOptions.length < applicationStatuses.length && (
              <p className="text-xs text-muted-foreground">
                Only valid next workflow stages are shown here.
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appliedAt">Application date</Label>
              <Input id="appliedAt" type="date" {...register("appliedAt")} />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue("appliedAt", todayForDateInput(), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setValue("appliedAt", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </div>

            <div
              className={[
                "space-y-2 rounded-xl border p-4 transition-colors",
                interviewStage
                  ? "border-brand/30 bg-brand/5"
                  : "border-transparent bg-muted/25",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="interviewDate">Interview date & time</Label>
                {interviewStage && (
                  <span className="text-xs font-medium text-brand">Required</span>
                )}
              </div>
              <Input
                id="interviewDate"
                type="datetime-local"
                aria-required={interviewStage}
                {...register("interviewDate")}
              />
              {errors.interviewDate && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.interviewDate.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue("interviewDate", nowForDateTimeInput(), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setValue("interviewDate", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Clear
                </Button>
              </div>
              {interviewStage && !errors.interviewDate && (
                <p className="text-xs text-muted-foreground">
                  Interview stages need a date so they stay visible in your calendar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Additional details</CardTitle>
              <CardDescription>
                Save technologies and notes that will help you prepare later.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={6}
              placeholder="Add useful details, next steps or preparation notes..."
              {...register("notes")}
            />
            {errors.notes && (
              <p role="alert" className="text-sm text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border bg-background/92 p-3 shadow-lg shadow-foreground/5 backdrop-blur sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="sm:min-w-28"
          render={<Link to={cancelTo} />}
        >
          Cancel
        </Button>
        <Button type="submit" className="sm:min-w-36" disabled={isSubmitting}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
