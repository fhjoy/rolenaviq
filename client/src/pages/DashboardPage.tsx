import { useCurrentUser } from "@/features/auth/useCurrentUser";

export function DashboardPage() {
  const { data } = useCurrentUser();

  return (
    <div>
      <p className="text-sm text-muted-foreground">Welcome back</p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight">
        {data?.user.firstName}
      </h1>

      <p className="mt-2 text-muted-foreground">
        Here's an overview of your job search.
      </p>
    </div>
  );
}
