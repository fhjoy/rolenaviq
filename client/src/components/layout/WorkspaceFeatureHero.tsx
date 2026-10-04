import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface WorkspaceFeatureHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  metricValue: number | string;
  metricLabel: string;
  metricDescription: string;
  actions: ReactNode;
}

export function WorkspaceFeatureHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  metricValue,
  metricLabel,
  metricDescription,
  actions,
}: WorkspaceFeatureHeroProps) {
  return (
    <section className="workspace-dashboard-hero workspace-feature-hero" aria-labelledby="page-heading">
      <div className="workspace-hero-content">
        <p className="workspace-eyebrow"><span aria-hidden="true" />{eyebrow}</p>
        <div className="workspace-feature-heading">
          <div className="workspace-feature-icon" aria-hidden="true"><Icon className="h-6 w-6" /></div>
          <h1 id="page-heading">{title}</h1>
        </div>
        <p className="workspace-hero-description">{description}</p>
        <div className="workspace-hero-actions">{actions}</div>
      </div>

      <aside className="workspace-route-card workspace-feature-spotlight" aria-label={`${title} at a glance`}>
        <div className="workspace-route-heading"><span>AT A GLANCE</span><span aria-hidden="true">↗</span></div>
        <div className="workspace-feature-metric"><strong>{metricValue}</strong><span>{metricLabel}</span></div>
        <p>{metricDescription}</p>
      </aside>
    </section>
  );
}
