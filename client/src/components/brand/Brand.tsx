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
      className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src="/rolenaviq-icon.svg"
        alt=""
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      />

      <span>
        <span
          className={[
            "block text-lg font-bold tracking-tight",
            inverse ? "text-white" : "text-foreground",
          ].join(" ")}
        >
          RoleNaviq
        </span>

        {showTagline && (
          <span
            className={[
              "block text-xs",
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
