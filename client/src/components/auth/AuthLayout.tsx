import type { ReactNode } from "react";

import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Columns3,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router";

import { Brand } from "@/components/brand/Brand";

interface AuthLayoutProps {
  children: ReactNode;
}

const highlights = [
  {
    icon: Columns3,
    text: "Follow every application from saved to offer",
  },
  {
    icon: CalendarCheck,
    text: "Keep interview dates and next steps visible",
  },
  {
    icon: LayoutDashboard,
    text: "See your progress without digging through notes",
  },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-primary px-10 py-10 text-primary-foreground lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <Brand inverse showTagline />
        </div>

        <div className="relative my-auto max-w-lg py-16">
          <p className="text-sm font-medium text-white/65">
            Your job search, organized
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Keep every opportunity moving in the right direction.
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-white/70">
            RoleNaviq gives you one place to manage applications, interviews and
            the progress behind your job search.
          </p>

          <div className="mt-10 space-y-5">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <div key={highlight.text} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <p className="text-sm text-white/85">{highlight.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/60">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Built to keep the job search simple and focused.
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand showTagline />
          </div>

          {children}

          <div className="mt-7 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to RoleNaviq
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
