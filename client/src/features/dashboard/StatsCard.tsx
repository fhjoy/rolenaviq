import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  tone?: "primary" | "blue" | "amber" | "emerald" | "rose" | "violet";
}

const tones = {
  primary: "bg-brand/12 text-brand",
  blue: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
  violet:
    "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary",
}: StatsCardProps) {
  return (
    <Card className="group h-full w-full overflow-hidden border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          </div>

          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              tones[tone],
            ].join(" ")}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {description && (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
