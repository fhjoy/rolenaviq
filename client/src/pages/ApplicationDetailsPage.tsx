import { ArrowLeft, ExternalLink } from "lucide-react";

import { Link, useNavigate, useParams } from "react-router";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { deleteApplication } from "@/features/applications/application.api";

import { useApplication } from "@/features/applications/useApplication";

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

export function ApplicationDetailsPage() {
  const { id = "" } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useApplication(id);

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });

      navigate("/applications");
    },
  });

  if (isLoading) {
    return <p>Loading application...</p>;
  }

  if (isError || !data?.application) {
    return <p role="alert">Application not found.</p>;
  }

  const application = data.application;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete your application for ${application.position} at ${application.company}?`,
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

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
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
    </div>
  );
}
