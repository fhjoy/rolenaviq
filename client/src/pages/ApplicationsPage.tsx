import { Link } from "react-router";

import { Button } from "@/components/ui/button";

import { ApplicationCard } from "@/features/applications/ApplicationCard";
import { useApplications } from "@/features/applications/useApplications";

export function ApplicationsPage() {
  const { data, isLoading, isError } = useApplications();

  if (isLoading) {
    return <p>Loading applications...</p>;
  }

  if (isError) {
    return <p role="alert">Unable to load applications.</p>;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>

          <p className="mt-2 text-muted-foreground">
            Manage and track your job applications.
          </p>
        </div>

        <Button render={<Link to="/applications/new" />}>
          Add application
        </Button>
      </div>

      {data?.applications.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed p-10 text-center">
          <h2 className="font-semibold">No applications yet</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add your first job application to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {data?.applications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}
