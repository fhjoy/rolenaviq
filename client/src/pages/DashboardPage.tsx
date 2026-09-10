import { LogoutButton } from "@/features/auth/LogoutButton";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

export function DashboardPage() {
  const { data } = useCurrentUser();

  return (
    <main className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>

          <h1 className="text-3xl font-bold">{data?.user.firstName}</h1>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}
