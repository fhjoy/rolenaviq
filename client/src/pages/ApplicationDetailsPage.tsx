import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteApplication } from "@/features/applications/application.api";
import { useApplication } from "@/features/applications/useApplication";
import { DeleteApplicationDialog } from "@/features/applications/DeleteApplicationDialog";
import { PageError } from "@/components/common/PageError";
import { Skeleton } from "@/components/ui/skeleton";

function formatValue(value?: string) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString();
}

function formatDateTime(value?: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ApplicationDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useApplication(id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      toast.success("Application deleted");

      navigate("/applications");
    },

    onError: () => {
      toast.error("Unable to delete application");
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-9 w-40" />

        <div className="mt-8">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="mt-3 h-5 w-1/3" />
        </div>

        <div className="mt-8 grid gap-6 rounded-xl border p-6 sm:grid-cols-2">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.application) {
    return (
      <PageError
        title="Application not found"
        message="This application may have been deleted or you may not have access to it."
      />
    );
  }

  const application = data.application;

  // const handleDelete = () => {
  //   const confirmed = window.confirm(
  //     `Delete your application for ${application.position} at ${application.company}?`,
  //   );

  //   if (confirmed) {
  //     deleteMutation.mutate();
  //   }
  // };

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" render={<Link to="/applications" />}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to applications
      </Button>

      <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {application.position}
            </h1>

            <Badge variant="secondary">{formatValue(application.status)}</Badge>
          </div>

          <p className="mt-2 text-lg text-muted-foreground">
            {application.company}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link to={`/applications/${application._id}/edit`} />}
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 rounded-xl border bg-background p-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Location</p>

          <p className="mt-1 font-medium">{application.location || "—"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Workplace</p>

          <p className="mt-1 font-medium">
            {formatValue(application.workplaceType)}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Employment type</p>

          <p className="mt-1 font-medium">
            {formatValue(application.employmentType)}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Application date</p>

          <p className="mt-1 font-medium">
            {formatDate(application.appliedAt)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Interview</p>

        <p className="mt-1 font-medium">
          {formatDateTime(application.interviewDate)}
        </p>
      </div>

      {application.technologies.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Technologies</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {application.technologies.map((technology) => (
              <Badge key={technology} variant="outline">
                {technology}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {application.notes && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Notes</h2>

          <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
            {application.notes}
          </p>
        </section>
      )}

      {application.jobUrl && (
        <div className="mt-8">
          <Button
            variant="outline"
            render={
              <a href={application.jobUrl} target="_blank" rel="noreferrer" />
            }
          >
            View original job
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
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
