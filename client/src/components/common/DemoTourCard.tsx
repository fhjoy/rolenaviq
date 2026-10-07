import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

interface DemoTourCardProps {
  step: 1 | 2;
  title: string;
  description: string;
  destination?: string;
  action: string;
  external?: boolean;
  loading?: boolean;
}

export function DemoTourCard({
  step, title, description, destination, action, external = false, loading = false,
}: DemoTourCardProps) {
  return (
    <section aria-labelledby={`demo-tour-step-${step}`} className="mt-6 rounded-2xl border border-[#b5d9bf] bg-[#f8fcf8] p-5 text-foreground shadow-sm dark:border-[#7aac88] dark:bg-[#315247] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#24523e] dark:text-[#c0e9ce]">Guided tour · Step {step} of 3</p>
      <h2 id={`demo-tour-step-${step}`} className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6">{description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {destination ? (
          <Button render={external ? <a href={destination} /> : <Link to={destination} />}>
            {action} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        ) : <span role="status" className="text-sm">{loading ? "Finding the example application…" : "The example is unavailable. You can still explore the workspace."}</span>}
        <Link className="text-sm font-medium underline underline-offset-4" to="/dashboard">Skip tour</Link>
      </div>
    </section>
  );
}
