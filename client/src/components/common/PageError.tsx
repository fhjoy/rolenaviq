import { AlertCircle } from "lucide-react";

interface PageErrorProps {
  title?: string;
  message?: string;
}

export function PageError({
  title = "Something went wrong",
  message = "Please try again.",
}: PageErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
    >
      <div className="flex gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
          aria-hidden="true"
        />

        <div>
          <h2 className="font-semibold">{title}</h2>

          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
