import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Columns3,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

import { Brand } from "@/components/brand/Brand";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/config/demo";

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Keep applications together",
    description:
      "Track companies, roles, technologies, dates and notes without jumping between spreadsheets and documents.",
  },
  {
    icon: Columns3,
    title: "See where everything stands",
    description:
      "Move applications through your job-search workflow with a visual Kanban board.",
  },
  {
    icon: CalendarDays,
    title: "Stay ready for interviews",
    description:
      "Keep interview dates visible in one calendar so the next important conversation does not get lost.",
  },
  {
    icon: BarChart3,
    title: "Understand your progress",
    description:
      "Use dashboard statistics and activity trends to get a clearer picture of how your search is moving.",
  },
];

function ProductPreview() {
  return (
    <div className="relative" aria-label="RoleNaviq dashboard preview">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand/12 blur-3xl" />

      <div className="overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-foreground/8">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        <div className="bg-muted/25 p-5 sm:p-6">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back</p>
            <p className="mt-1 text-xl font-bold">Your job search</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PreviewStat label="Applications" value="24" />
            <PreviewStat label="Interviews" value="5" />
            <PreviewStat label="Offers" value="2" />
            <PreviewStat label="Response" value="38%" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1.35fr_1fr]">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Monthly activity</p>
                  <p className="text-xs text-muted-foreground">
                    Applications added
                  </p>
                </div>

                <BarChart3 className="h-4 w-4 text-brand" aria-hidden="true" />
              </div>

              <div className="mt-6 flex h-28 items-end gap-2">
                <div className="h-[35%] flex-1 rounded-t-md bg-brand/18" />
                <div className="h-[52%] flex-1 rounded-t-md bg-brand/28" />
                <div className="h-[42%] flex-1 rounded-t-md bg-brand/22" />
                <div className="h-[70%] flex-1 rounded-t-md bg-brand/45" />
                <div className="h-[58%] flex-1 rounded-t-md bg-brand/35" />
                <div className="h-[88%] flex-1 rounded-t-md bg-brand" />
                <div className="h-[74%] flex-1 rounded-t-md bg-brand/65" />
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold">Pipeline</p>
              <p className="text-xs text-muted-foreground">Current status</p>

              <div className="mt-5 space-y-4">
                <PipelineItem
                  label="Applied"
                  value="9"
                  className="bg-sky-500"
                />
                <PipelineItem
                  label="Interview"
                  value="5"
                  className="bg-amber-500"
                />
                <PipelineItem
                  label="Offer"
                  value="2"
                  className="bg-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Frontend Developer interview
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Wednesday · 10:30 · Example Company
              </p>
            </div>

            <span className="ml-auto hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline">
              Upcoming
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border bg-card p-4 shadow-xl lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Latest update</p>
            <p className="text-sm font-semibold">Moved to Interview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PreviewStatProps {
  label: string;
  value: string;
}

function PreviewStat({ label, value }: PreviewStatProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface PipelineItemProps {
  label: string;
  value: string;
  className: string;
}

function PipelineItem({ label, value, className }: PipelineItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full w-2/3 rounded-full ${className}`} />
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Landing page navigation"
          >
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>

            <a
              href="#built"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it helps
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link to="/login" />}>
              Sign in
            </Button>

            <Button
              className="hidden sm:inline-flex"
              render={<Link to="/register" />}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-32">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-sm font-medium shadow-sm">
                <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
                One place for your job search
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Navigate your job search{" "}
                <span className="text-brand">without losing track.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Job searching is already enough work. RoleNaviq keeps your
                applications, interviews and progress organized in one calm
                workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" render={<Link to="/register" />}>
                  Start tracking
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  render={<Link to="/login?demo=1" />}
                >
                  Explore demo
                </Button>

                <Button size="lg" variant="ghost" render={<Link to="/login" />}>
                  Sign in
                </Button>
              </div>

              <div className="mt-6 max-w-xl rounded-2xl border border-brand/20 bg-card/85 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Demo access</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Explore the real dashboard, Kanban board, calendar and
                      application workflow without creating an account.
                    </p>

                    <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-3">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="break-all font-medium">{DEMO_EMAIL}</dd>
                      <dt className="text-muted-foreground">Password</dt>
                      <dd className="break-all font-medium">{DEMO_PASSWORD}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>Applications</span>
                <span aria-hidden="true">·</span>
                <span>Kanban board</span>
                <span aria-hidden="true">·</span>
                <span>Interviews</span>
                <span aria-hidden="true">·</span>
                <span>Analytics</span>
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Less time organizing. More time preparing for the next
              opportunity.
            </h2>

            <p className="mt-4 text-muted-foreground">
              RoleNaviq turns the scattered parts of a job search into a clear
              workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="built" className="border-y bg-muted/35">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                A clearer way to manage your job search.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
                RoleNaviq brings your applications, interviews and progress into
                one structured workspace, so you always know what needs your
                attention next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Keep opportunities organized",
                "Follow every application stage",
                "Stay on top of interviews",
                "See your progress at a glance",
                "Find important details quickly",
                "Keep your job search focused",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-xl shadow-foreground/10 sm:px-10 lg:px-14">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand/20 blur-2xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Give your job search a clearer direction.
                </h2>

                <p className="mt-3 max-w-2xl text-primary-foreground/75">
                  Keep applications, interview dates and progress together
                  instead of trying to remember everything.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  render={<Link to="/register" />}
                >
                  Create an account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  render={<Link to="/login?demo=1" />}
                >
                  Explore demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Brand />

          <p className="text-sm text-muted-foreground">
            Built by Faisal Hossain
          </p>
        </div>
      </footer>
    </div>
  );
}
