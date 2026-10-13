import { useQuery } from "@tanstack/react-query";

import { buttonVariants } from "@/components/ui/button";
import { getAuthProviders } from "./auth.api";

export function GoogleSignInLink({ returnTo }: { returnTo?: string }) {
  const { data } = useQuery({
    queryKey: ["auth", "providers"],
    queryFn: getAuthProviders,
    retry: false,
  });

  if (!data?.google) return null;

  const url = new URL(`${import.meta.env.VITE_API_URL}/auth/google`, window.location.origin);
  if (returnTo?.startsWith("/prep/") && !returnTo.includes("\\")) {
    url.searchParams.set("returnTo", returnTo);
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <a href={url.href} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
        Continue with Google
      </a>
    </div>
  );
}
