import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Code2,
  Columns3,
  Database,
  KeyRound,
  Mail,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";

import { Brand } from "@/components/brand/Brand";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/config/demo";
import { warmUpApi } from "@/services/api";

const workflowStages = [
  { label: "Saved", detail: "Capture the opportunity" },
  { label: "Applied", detail: "Know what went out" },
  { label: "Screening", detail: "Track first contact" },
  { label: "Interview", detail: "Prepare for the conversation" },
  { label: "Technical", detail: "Keep the next step visible" },
  { label: "Offer", detail: "See the destination" },
];

const engineeringHighlights = [
  "React 19 + TypeScript",
  "Vite + Tailwind CSS",
  "shadcn + Base UI",
  "TanStack Query",
  "React Hook Form + Zod",
  "Node + Express REST API",
  "MongoDB + Mongoose",
  "HttpOnly JWT authentication",
  "Per-user authorization",
  "Vercel + Render + Atlas",
  "Responsive + accessible UI",
];

const engineeringRoadmap = [
  "Cypress end-to-end testing",
  "AI job analysis",
  "LLM-powered matching",
  "GitHub Actions CI/CD",
];

function RouteBadge({
  label,
  tone = "brand",
}: {
  label: string;
  tone?: "brand" | "sky" | "amber" | "emerald";
}) {
  const toneClasses = {
    brand: "border-brand/20 bg-brand/10 text-brand",
    sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        toneClasses[tone],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function FlowConnector({ reverse = false }: { reverse?: boolean }) {
  return (
    <div
      className={[
        "landing-flow-connector",
        reverse ? "landing-flow-connector-reverse" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="landing-flow-dot" />
      <ArrowRight className="landing-flow-arrow h-4 w-4" />
    </div>
  );
}

function FeatureSignal({
  variant,
}: {
  variant: "board" | "calendar" | "analytics";
}) {
  return (
    <span
      className={["feature-signal", `feature-signal-${variant}`].join(" ")}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}

function CareerRouteMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-7 w-7"
      role="img"
      aria-label="RoleNaviq"
    >
      <path
        className="fill-brand"
        d="M33 5 43 20 35.8 16.6 31 24.5 31.2 12.4Z"
      />
      <path
        className="fill-foreground"
        fillRule="evenodd"
        d="M9 15h18.5c7.7 0 12.5 4.3 12.5 10.5 0 4.4-2.4 7.8-6.6 9.4L41 49H31.6l-6.9-12.5H18V49H9V15Zm9 7.2v7.2h8.4c3.1 0 4.8-1.2 4.8-3.6 0-2.4-1.7-3.6-4.8-3.6H18Z"
      />
      <path
        className="fill-brand"
        d="M34 21h8l9 13.2V21h8v28h-8L42 35.8V49h-8V21Z"
      />
      <path
        className="fill-foreground"
        d="M27 50.5 33 59l6-8.5-6 2.6Z"
      />
    </svg>
  );
}

function HeroNavigationPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-brand/10 blur-3xl" />

      <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] border bg-card/90 p-5 shadow-2xl shadow-foreground/8 backdrop-blur sm:min-h-[440px] sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Career route
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              One workspace. Every next step.
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-background/90 shadow-sm">
            <CareerRouteMark />
          </div>
        </div>

        <svg
          className="pointer-events-none absolute inset-x-5 bottom-7 h-[280px] w-[calc(100%-2.5rem)] text-brand sm:inset-x-8 sm:bottom-8 sm:w-[calc(100%-4rem)]"
          viewBox="0 0 620 300"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M28 246 C118 248 125 170 213 172 C302 173 300 96 392 103 C481 110 502 53 590 48"
            className="landing-route-line"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="28" cy="246" r="6" fill="currentColor" />
          <circle cx="213" cy="172" r="6" fill="currentColor" />
          <circle cx="392" cy="103" r="6" fill="currentColor" />
          <circle cx="590" cy="48" r="9" fill="currentColor" />
          <circle
            cx="590"
            cy="48"
            r="18"
            stroke="currentColor"
            strokeOpacity=".2"
            strokeWidth="8"
          />
        </svg>

        <div className="absolute bottom-8 left-[5%] w-[148px] rounded-2xl border bg-background/95 p-3 shadow-lg sm:bottom-9 sm:left-[6%] sm:w-[172px]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                Frontend Engineer
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Northstar Labs
              </p>
            </div>
          </div>
          <div className="mt-3">
            <RouteBadge label="Saved" />
          </div>
        </div>

        <div className="absolute left-[34%] top-[44%] w-[154px] rounded-2xl border bg-background/95 p-3 shadow-xl sm:left-[35%] sm:top-[43%] sm:w-[180px]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold">React Developer</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Orbit Systems
              </p>
            </div>
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-sky-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3">
            <RouteBadge label="Applied" tone="sky" />
          </div>
        </div>

        <div className="absolute right-[4%] top-[24%] w-[158px] rounded-2xl border border-brand/25 bg-background/95 p-3 shadow-xl shadow-brand/10 sm:right-[5%] sm:top-[22%] sm:w-[190px]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold">Product Engineer</p>
              <p className="text-[11px] text-muted-foreground">
                Friday · 10:30
              </p>
            </div>
          </div>
          <div className="mt-3">
            <RouteBadge label="Interview" tone="amber" />
          </div>
        </div>

        <div className="absolute right-4 top-[49%] hidden rounded-xl border bg-background/90 px-3 py-2 shadow-md sm:block">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Destination
          </p>
          <p className="mt-0.5 text-xs font-bold text-brand">Offer</p>
        </div>
      </div>

      <div className="absolute -bottom-5 left-6 hidden items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-xl lg:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] text-muted-foreground">Latest update</p>
          <p className="text-sm font-semibold">Moved to Interview</p>
        </div>
      </div>
    </div>
  );
}

function ChaosToClarity() {
  return (
    <section className="border-y bg-muted/25">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-brand">
            From chaos to clarity
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your job search should not live across six different places.
          </h2>
          <p className="mt-4 text-muted-foreground">
            RoleNaviq turns scattered emails, notes, spreadsheets and interview
            reminders into one calm operating view.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="relative overflow-hidden rounded-3xl border bg-card p-6">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-300/10 blur-2xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Before
            </p>
            <h3 className="mt-2 text-xl font-semibold">
              Everything everywhere.
            </h3>

            <div className="mt-7 space-y-3">
              <div className="rotate-[-1.5deg] rounded-2xl border bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sky-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">
                      Interview invitation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      buried in your inbox
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-5 rotate-[1deg] rounded-2xl border bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <BarChart3
                    className="h-5 w-5 text-emerald-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      applications-final-v4.xlsx
                    </p>
                    <p className="text-xs text-muted-foreground">
                      maybe the latest version
                    </p>
                  </div>
                </div>
              </div>

              <div className="mr-7 rotate-[-0.5deg] rounded-2xl border bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays
                    className="h-5 w-5 text-amber-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold">Friday 10:30?</p>
                    <p className="text-xs text-muted-foreground">
                      reminder without context
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-1 lg:py-0">
            <FlowConnector />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-card p-6 shadow-lg shadow-brand/5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              With RoleNaviq
            </p>
            <h3 className="mt-2 text-xl font-semibold">
              One route. Clear next steps.
            </h3>

            <div className="mt-7 grid grid-cols-3 gap-2">
              {["Applied", "Interview", "Offer"].map((stage, index) => (
                <div
                  key={stage}
                  className="rounded-2xl border bg-background p-3"
                >
                  <p className="text-[11px] text-muted-foreground">{stage}</p>
                  <p className="mt-2 text-2xl font-bold">{[9, 5, 2][index]}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5 rounded-2xl border bg-background p-4">
              {[
                ["Frontend Engineer", "Interview · Friday"],
                ["React Developer", "Applied · 2 days ago"],
                ["Full Stack Engineer", "Screening · Today"],
              ].map(([role, meta]) => (
                <div
                  key={role}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/45 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{role}</p>
                    <p className="text-xs text-muted-foreground">{meta}</p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowJourney() {
  return (
    <section
      id="workflow"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-brand">
          Your job-search route
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Every opportunity has a next step. RoleNaviq keeps the route visible.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Move forward without wondering which company replied, which interview
          comes next, or where an application currently stands.
        </p>
      </div>

      <div className="relative mt-12">
        <div className="absolute left-5 top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border md:block" />
        <div className="landing-progress-track absolute left-5 top-5 hidden w-[calc(100%-2.5rem)] md:block">
          <span className="landing-progress-dot" />
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {workflowStages.map((stage, index) => (
            <article
              key={stage.label}
              className="group relative rounded-2xl border bg-card p-4 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-brand/25 bg-background text-sm font-bold text-brand shadow-sm">
                {index + 1}
              </div>
              <p className="mt-4 font-semibold">{stage.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {stage.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoardPreview() {
  const columns = [
    {
      title: "Applied",
      cards: ["Frontend Engineer", "React Developer"],
      accent: "bg-sky-500",
    },
    {
      title: "Interview",
      cards: ["Product Engineer"],
      accent: "bg-amber-500",
    },
    {
      title: "Offer",
      cards: ["Full Stack Engineer"],
      accent: "bg-emerald-500",
    },
  ];

  return (
    <div className="rounded-3xl border bg-muted/30 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Application board</p>
          <p className="text-xs text-muted-foreground">
            Drag. Drop. Keep moving.
          </p>
        </div>
        <Columns3 className="h-5 w-5 text-brand" aria-hidden="true" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="rounded-2xl border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={["h-2 w-2 rounded-full", column.accent].join(" ")}
                />
                <span className="text-xs font-semibold">{column.title}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {column.cards.length}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {column.cards.map((card) => (
                <div
                  key={card}
                  className="rounded-xl border bg-background p-3 shadow-sm"
                >
                  <p className="text-xs font-semibold">{card}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Remote · Full-time
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPreview() {
  const firstInterview = new Date();
  firstInterview.setDate(firstInterview.getDate() + 2);
  firstInterview.setHours(10, 30, 0, 0);

  const secondInterview = new Date();
  secondInterview.setDate(secondInterview.getDate() + 5);
  secondInterview.setHours(14, 0, 0, 0);

  const previewMonth = firstInterview;
  const daysInPreviewMonth = new Date(
    previewMonth.getFullYear(),
    previewMonth.getMonth() + 1,
    0,
  ).getDate();

  const highlightedDays = new Set(
    [firstInterview, secondInterview]
      .filter(
        (date) =>
          date.getFullYear() === previewMonth.getFullYear() &&
          date.getMonth() === previewMonth.getMonth(),
      )
      .map((date) => date.getDate()),
  );

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(previewMonth);

  const interviewLabel =
    new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
    }).format(firstInterview) + " · 10:30";

  return (
    <div className="rounded-3xl border bg-muted/30 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Interview calendar</p>
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </div>
        <CalendarDays className="h-5 w-5 text-brand" aria-hidden="true" />
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={day + index} className="py-1 text-muted-foreground">
            {day}
          </span>
        ))}

        {Array.from({ length: daysInPreviewMonth }).map((_, index) => {
          const day = index + 1;
          const highlighted = highlightedDays.has(day);

          return (
            <div
              key={day}
              className={[
                "flex aspect-square items-center justify-center rounded-lg border text-xs",
                highlighted
                  ? "border-brand bg-brand text-brand-foreground"
                  : "bg-card",
              ].join(" ")}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border bg-card p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold">Frontend Developer interview</p>
          <p className="text-[11px] text-muted-foreground">
            {interviewLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="rounded-3xl border bg-muted/30 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Progress overview</p>
          <p className="text-xs text-muted-foreground">
            Your search at a glance
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-brand" aria-hidden="true" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          ["24", "Applications"],
          ["5", "Interviews"],
          ["38%", "Response"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border bg-card p-3">
            <p className="text-xl font-bold">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border bg-card p-4">
        <div className="flex h-28 items-end gap-2">
          {[32, 46, 39, 68, 55, 86, 73].map((height, index) => (
            <div key={index} className="flex h-full flex-1 items-end">
              <div
                className={[
                  "w-full rounded-t-md",
                  index === 5 ? "bg-brand" : "bg-brand/25",
                ].join(" ")}
                style={{ height: String(height) + "%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductShowcase() {
  const showcases = [
    {
      eyebrow: "Board",
      title: "See momentum, not another spreadsheet.",
      description:
        "The visual board turns application status into something you can understand in seconds. Move opportunities forward while keeping the whole pipeline in view.",
      preview: <BoardPreview />,
    },
    {
      eyebrow: "Calendar",
      title: "Know what needs your attention next.",
      description:
        "Interview dates live beside the applications they belong to, so preparation starts with context instead of searching through old messages.",
      preview: <CalendarPreview />,
    },
    {
      eyebrow: "Analytics",
      title: "Turn activity into a useful signal.",
      description:
        "A focused dashboard gives you enough data to understand pace and response without turning your job search into a reporting exercise.",
      preview: <AnalyticsPreview />,
    },
  ];

  return (
    <section id="features" className="border-y bg-card/35">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-brand">
            The product, not just the pitch
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A workspace designed around the real rhythm of a job search.
          </h2>
          <p className="mt-4 text-muted-foreground">
            RoleNaviq connects the board, calendar and progress view so each
            screen answers a different question at the right moment.
          </p>
        </div>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {showcases.map((item, index) => (
            <article
              key={item.title}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="inline-flex items-center gap-3">
                  <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {item.eyebrow}
                  </span>
                  <FeatureSignal
                    variant={
                      item.eyebrow === "Board"
                        ? "board"
                        : item.eyebrow === "Calendar"
                          ? "calendar"
                          : "analytics"
                    }
                  />
                </div>

                <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                {item.preview}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureNode({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="relative rounded-2xl border bg-background p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </span>
      <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function ExploreCtaSection() {
  return (
    <section
      id="demo"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground shadow-xl shadow-foreground/10 sm:px-10 lg:px-14 lg:py-14">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand/25 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-brand">
              Ready to explore the route?
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              See the complete RoleNaviq workflow yourself.
            </h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/70">
              Open the live demo and move through the dashboard, application
              board, calendar and real job-search workflow.
            </p>

            {/* <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span>Product tour</span>
              <FlowConnector />
              <span>Dashboard</span>
            </div> */}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              render={<Link to="/login?demo=1" />}
            >
              Explore live demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              render={<Link to="/register" />}
            >
              Create account
            </Button>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <KeyRound
              className="h-4 w-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            <span className="text-primary-foreground/70">
              Demo credentials are ready for you.
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>{DEMO_EMAIL}</span>
            <span className="text-primary-foreground/60">{DEMO_PASSWORD}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function EngineeringSection() {
  return (
    <section
      id="engineering"
      className="border-t border-brand/20 bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              Engineering · Portfolio case study
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
              This is how RoleNaviq is built — separate from what the product
              does.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-primary-foreground/65">
            A technical view for developers and recruiters who want to look
            beyond the UI and understand the architecture, security and stack.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-brand">
              Production-oriented full-stack engineering
            </p>
            <p className="mt-4 max-w-xl leading-7 text-primary-foreground/70">
              RoleNaviq uses authenticated user data, server-side authorization,
              API-driven state and separate production deployments for the
              frontend, backend and database.
            </p>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/50">
              Implemented
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {engineeringHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-primary-foreground/85"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Engineering roadmap
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {engineeringRoadmap.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-dashed border-brand/40 bg-brand/8 px-3 py-1.5 text-xs font-medium text-brand"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-4 text-xs leading-5 text-primary-foreground/50">
              Cypress, AI features and CI/CD are shown as roadmap items so the
              portfolio stays clear about what is implemented today and what is
              planned next.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-background p-5 text-foreground shadow-2xl shadow-black/15 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Production architecture</p>
                <p className="text-xs text-muted-foreground">
                  Simple enough to understand. Real enough to deploy.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ArchitectureNode
                icon={<Code2 className="h-5 w-5" aria-hidden="true" />}
                label="Frontend"
                value="React · Vite"
                detail="Vercel"
              />
              <ArchitectureNode
                icon={<Server className="h-5 w-5" aria-hidden="true" />}
                label="API"
                value="Node · Express"
                detail="Render"
              />
              <ArchitectureNode
                icon={<Database className="h-5 w-5" aria-hidden="true" />}
                label="Database"
                value="MongoDB"
                detail="Atlas"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>React client</span>
              <ArrowRight
                className="landing-arrow-pulse h-3.5 w-3.5 text-brand"
                aria-hidden="true"
              />
              <span>/api proxy</span>
              <ArrowRight
                className="landing-arrow-pulse h-3.5 w-3.5 text-brand"
                aria-hidden="true"
              />
              <span>Express API</span>
              <ArrowRight
                className="landing-arrow-pulse h-3.5 w-3.5 text-brand"
                aria-hidden="true"
              />
              <span>MongoDB Atlas</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <KeyRound className="h-5 w-5 text-brand" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold">Secure sessions</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  JWT authentication is stored in HttpOnly cookies rather than
                  exposed to client-side JavaScript.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/25 p-4">
                <ShieldCheck
                  className="h-5 w-5 text-brand"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold">Ownership enforced</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Application access is scoped to the signed-in user on the
                  server, not only hidden in the interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  useEffect(() => {
    void warmUpApi();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Landing page navigation"
          >
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Product
            </a>
            <a
              href="#workflow"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Workflow
            </a>
            <a
              href="#engineering"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Engineering
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link to="/login" />}>
              Sign in
            </Button>

            <Button
              className="hidden sm:inline-flex"
              render={<Link to="/login?demo=1" />}
            >
              Explore demo
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-amber-300/8 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-32">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-sm font-medium shadow-sm">
                <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
                Your career navigation control center
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Your job search has a lot of moving parts.{" "}
                <span className="text-brand">
                  Navigate them without losing track.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                RoleNaviq connects applications, interviews and progress into
                one clear route, so you always know where you are and what comes
                next.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" render={<Link to="/login?demo=1" />}>
                  Explore live demo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  render={<Link to="/register" />}
                >
                  Create account
                </Button>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>Applications</span>
                <span aria-hidden="true">·</span>
                <span>Kanban workflow</span>
                <span aria-hidden="true">·</span>
                <span>Interview calendar</span>
                <span aria-hidden="true">·</span>
                <span>Analytics</span>
              </div>
            </div>

            <HeroNavigationPreview />
          </div>
        </section>

        <ChaosToClarity />
        <WorkflowJourney />
        <ProductShowcase />
        <ExploreCtaSection />
        <EngineeringSection />
      </main>

      <footer className="border-t bg-card/55">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
            <div>
              <Brand />
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                A full-stack portfolio project for navigating applications,
                interviews and job-search progress without losing track.
              </p>
              <div
                className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                title="The live demo is running from the deployed production application."
              >
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Live production deployment
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Explore
              </p>
              <nav className="mt-4 flex flex-col items-start gap-3 text-sm">
                <a
                  href="#features"
                  className="transition-colors hover:text-brand"
                >
                  Product
                </a>
                <a
                  href="#workflow"
                  className="transition-colors hover:text-brand"
                >
                  Workflow
                </a>
                <Link
                  to="/login?demo=1"
                  className="transition-colors hover:text-brand"
                >
                  Live demo
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Engineering
              </p>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm">
                <a
                  href="#engineering"
                  className="transition-colors hover:text-brand"
                >
                  Architecture
                </a>
                <a
                  href="https://github.com/fhjoy/rolenaviq"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-brand"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C16.9 4 17.9 4.3 17.9 4.3c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.3 11.3 0 0 0 12 .7Z" />
                  </svg>
                  GitHub repository
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Built by Faisal Hossain · Full-stack portfolio project</p>
            <p>RoleNaviq · Navigate your job search</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
