import { BriefcaseBusiness, Plus, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";

import { EmptyState } from "@/components/common/EmptyState";
import { PageError } from "@/components/common/PageError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/features/applications/ApplicationCard";
import { ApplicationListSkeleton } from "@/features/applications/ApplicationListSkeleton";
import { useApplications } from "@/features/applications/useApplications";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type {
  ApplicationSort,
  ApplicationStatus,
  EmploymentType,
  WorkplaceType,
} from "@/types/application";

const selectClassName =
  "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | "">("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [sort, setSort] = useState<ApplicationSort>("-createdAt");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isError, isFetching, refetch } = useApplications({
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

  const activeFilterCount = [search, status, workplaceType, employmentType].filter(
    Boolean,
  ).length;
  const hasActiveFilters = activeFilterCount > 0 || sort !== "-createdAt";

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div>
      <section className="flex flex-col justify-between gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
            <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Search, filter and manage every opportunity from one place.
            </p>
          </div>
        </div>

        <Button render={<Link to="/applications/new" />}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add application
        </Button>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-brand" aria-hidden="true" />
            <h2 className="font-semibold">Find applications</h2>
            {hasActiveFilters && (
              <Badge variant="secondary">
                {activeFilterCount > 0 ? `${activeFilterCount} active` : "Custom sort"}
              </Badge>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </Button>
        </div>

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search company, position, location or technology..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="h-10 pl-9"
            aria-label="Search applications"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ApplicationStatus | "");
              setPage(1);
            }}
            className={selectClassName}
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
            className={selectClassName}
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
            className={selectClassName}
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
            className={selectClassName}
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
        </div>
      </section>

      <div ref={resultsRef} className="scroll-mt-24">
        {isLoading && <ApplicationListSkeleton />}

        {isError && (
          <div className="mt-8">
            <PageError
              title="Unable to load applications"
              message="We could not retrieve your applications. Please try again."
              actionLabel="Try again"
              onAction={() => void refetch()}
            />
          </div>
        )}

        {!isLoading && !isError && applications.length === 0 && (
          <div className="mt-8">
            <EmptyState
              icon={SearchX}
              title={hasActiveFilters ? "No matching applications" : "No applications yet"}
              description={
                hasActiveFilters
                  ? "Try changing your search or filters to see more results."
                  : "Add your first job application to start building your RoleNaviq pipeline."
              }
              action={
                hasActiveFilters ? (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button render={<Link to="/applications/new" />}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add application
                  </Button>
                )
              }
            />
          </div>
        )}

        {applications.length > 0 && (
          <>
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {pagination?.total ?? 0}{" "}
                {(pagination?.total ?? 0) === 1 ? "application" : "applications"}
              </p>
              {isFetching && !isLoading && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Updating...
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                  {" · "}
                  {pagination.total} total applications
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => changePage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!pagination.hasNextPage}
                    onClick={() => changePage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
