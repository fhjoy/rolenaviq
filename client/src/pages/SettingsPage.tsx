import { useCurrentUser } from "@/features/auth/useCurrentUser";

export function SettingsPage() {
  const { data } = useCurrentUser();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <p className="mt-2 text-muted-foreground">
        Manage your RoleNaviq account.
      </p>

      <div className="mt-8">
        <p className="text-sm text-muted-foreground">Email</p>

        <p className="font-medium">{data?.user.email}</p>
      </div>
    </div>
  );
}
