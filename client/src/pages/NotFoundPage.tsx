import { ArrowLeft, LayoutDashboard } from "lucide-react";

import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-primary">404</p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-4 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button render={<Link to="/dashboard" />}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Button>

          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
