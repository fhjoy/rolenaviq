import { Button } from "@/components/ui/button";

export function ApplicationsPage() {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>

          <p className="mt-2 text-muted-foreground">
            Manage and track your job applications.
          </p>
        </div>

        <Button>Add application</Button>
      </div>
    </div>
  );
}
