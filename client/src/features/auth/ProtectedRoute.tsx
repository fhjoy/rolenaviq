import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";

import { PageError } from "@/components/common/PageError";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/services/api";

import { useCurrentUser } from "./useCurrentUser";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data, isLoading, isError, error, refetch } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-lg space-y-4" role="status" aria-label="Checking authentication">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-72 max-w-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <span className="sr-only">Checking your session</span>
        </div>
      </main>
    );
  }

  if (isError && error instanceof ApiError && error.status === 401) {
    return <Navigate to="/login?expired=1" replace />;
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-lg">
          <PageError
            title="Unable to verify your session"
            message="RoleNaviq could not confirm your authentication. Please try again."
            actionLabel="Try again"
            onAction={() => void refetch()}
          />
        </div>
      </main>
    );
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
}
