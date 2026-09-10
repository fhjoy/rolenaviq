import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useCurrentUser } from "./useCurrentUser";
import { ApiError } from "@/services/api";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (isError && error instanceof ApiError && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Unable to verify authentication.</p>
      </main>
    );
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
