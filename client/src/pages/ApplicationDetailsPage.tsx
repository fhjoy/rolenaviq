import { ArrowLeft, CalendarDays, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { PageError } from "@/components/common/PageError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteApplicationDialog } from "@/features/applications/DeleteApplicationDialog";
import {
  applicationStatusLabels,
  applicationStatusStyles,
  employmentTypeLabels,
  workplaceTypeLabels,
} from "@/features/applications/application-display";
import { deleteApplication } from "@/features/applications/application.api";
import { useApplication } from "@/features/applications/useApplication";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ApplicationDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useApplication(id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success("Application deleted");
      navigate("/applications");
    },
    onError: () => toast.error("Unable to delete application"),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data?.application) {
    return (
      <PageError
        title="Application not found"
        message="This application may have been deleted or you may not have access to it."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  const application = data.application;

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" render={<Link to="/applications" />}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to applications
      </Button>

      <section className="mt-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {application.position}
              </h1>
              <Badge
                variant="outline"
                className={applicationStatusStyles[application.status]}
              >
                {applicationStatusLabels[application.status]}
              </Badge>
            </div>
            <p className="mt-2 text-lg text-muted-foreground">{application.company}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {application.jobUrl && (
              <Button
                variant="outline"
                render={<a href={application.jobUrl} target="_blank" rel="noreferrer" />}
              >
                Job posting
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <Button
              render={<Link to={`/applications/${application._id}/edit`} />}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Application details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <Detail label="Location" value={application.location || "—"} />
            <Detail
              label="Workplace"
              value={application.workplaceType ? workplaceTypeLabels[application.workplaceType] : "—"}
            />
            <Detail
              label="Employment type"
              value={application.employmentType ? employmentTypeLabels[application.employmentType] : "—"}
            />
            <Detail label="Application date" value={formatDate(application.appliedAt)} />
          </CardContent>
        </Card>

        <Card className="border-brand/20 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </div>
              <CardTitle>Interview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Scheduled date & time</p>
            <p className="mt-2 font-semibold">{formatDateTime(application.interviewDate)}</p>
          </CardContent>
        </Card>
      </div>

      {(application.technologies.length > 0 || application.notes) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {application.technologies.length > 0 && (
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {application.technologies.map((technology) => (
                  <Badge key={technology} variant="outline">
                    {technology}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {application.notes && (
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
                  {application.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {deleteMutation.isError && (
        <p className="mt-6 text-destructive" role="alert">
          Unable to delete application.
        </p>
      )}

      <DeleteApplicationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        company={application.company}
        position={application.position}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
