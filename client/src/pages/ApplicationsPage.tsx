import { useState } from "react";

import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ApplicationCard } from "@/features/applications/ApplicationCard";
import { useApplications } from "@/features/applications/useApplications";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import type {
  ApplicationSort,
  ApplicationStatus,
  EmploymentType,
  WorkplaceType,
} from "@/types/application";

export function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | "">("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [sort, setSort] = useState<ApplicationSort>("-createdAt");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isError, isFetching } = useApplications({
    search: debouncedSearch || undefined,
    status: status || undefined,
    workplaceType: workplaceType || undefined,
    employmentType: employmentType || undefined,
    sort,
    page,
    limit: 10,
  });

  const applications = data?.applications ?? [];
  const pagination = data?.pagination;
  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setWorkplaceType("");
    setEmploymentType("");
    setSort("-createdAt");
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
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

      {/* Search */}
      <div className="mt-8">
        <Input
          type="search"
          placeholder="Search company, position, location or technology..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-xl"
          aria-label="Search applications"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ApplicationStatus | "");
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="interview">Interview</option>
          <option value="technical_interview">Technical Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <select
          value={workplaceType}
          onChange={(event) => {
            setWorkplaceType(event.target.value as WorkplaceType | "");
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
          aria-label="Filter by workplace type"
        >
          <option value="">All workplaces</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>

        <select
          value={employmentType}
          onChange={(event) => {
            setEmploymentType(event.target.value as EmploymentType | "");
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
          aria-label="Filter by employment type"
        >
          <option value="">All employment types</option>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
          <option value="internship">Internship</option>
        </select>

        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as ApplicationSort);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
          aria-label="Sort applications"
        >
          <option value="-createdAt">Newest added</option>
          <option value="createdAt">Oldest added</option>
          <option value="-appliedAt">Latest application date</option>
          <option value="appliedAt">Oldest application date</option>
          <option value="company">Company A–Z</option>
          <option value="-company">Company Z–A</option>
          <option value="position">Position A–Z</option>
          <option value="-position">Position Z–A</option>
        </select>

        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>

      {/* Fetch indicator */}
      {isFetching && !isLoading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Updating results...
        </p>
      )}

      {/* Loading */}
      {isLoading && <p className="mt-8">Loading applications...</p>}

      {/* Error */}
      {isError && (
        <p className="mt-8 text-destructive" role="alert">
          Unable to load applications.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && applications.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed p-10 text-center">
          <h2 className="font-semibold">No applications found</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      )}

      {/* Results */}
      {applications.length > 0 && (
        <>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                {" · "}
                {pagination.total} total applications
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
