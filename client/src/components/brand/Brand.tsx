import { Compass } from "lucide-react";
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
      <span
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl",
          inverse
            ? "border border-white/20 bg-white/10 text-white"
            : "bg-linear-to-br from-primary to-cyan-500 text-white shadow-sm shadow-primary/20",
        ].join(" ")}
      >
        <Compass className="h-5 w-5" aria-hidden="true" />
      </span>

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
