import { Link } from "react-router";

interface BrandProps {
  to?: string;
  showTagline?: boolean;
  inverse?: boolean;
}

export function Brand({
  to = "/",
  showTagline = false,
  inverse = false,
}: BrandProps) {
  return (
    <Link
      to={to}
      aria-label="RoleNaviq home"
      className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex flex-col">
        {inverse ? (
          <img
            src="/rolenaviq-logo-dark.png"
            alt="RoleNaviq"
            className="h-14 w-auto object-contain"
          />
        ) : (
          <>
            <img
              src="/rolenaviq-logo-light.png"
              alt="RoleNaviq"
              className="h-14 w-auto object-contain dark:hidden"
            />

            <img
              src="/rolenaviq-logo-dark.png"
              alt="RoleNaviq"
              className="hidden h-14 w-auto object-contain dark:block"
            />
          </>
        )}

        {showTagline && (
          <span
            className={[
              "mt-1 text-xs",
              inverse ? "text-white/65" : "text-muted-foreground",
            ].join(" ")}
          >
            Navigate your job search
          </span>
        )}
      </span>
    </Link>
  );
}
