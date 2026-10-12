import { BookOpenCheck, ArrowUpRight } from "lucide-react";
import type { DashboardStatsResponse } from "@/types/dashboard";

export function InterviewPrepSummary({ interviews }: { interviews: DashboardStatsResponse["interviewPrep"] }) {
  return <section aria-labelledby="prep-summary-heading" className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><BookOpenCheck className="size-5" aria-hidden="true" /></span>
      <div><h2 id="prep-summary-heading" className="text-xl font-semibold">Interview Prep at a glance</h2><p className="mt-1 text-sm text-muted-foreground">Your next interviews and saved practice progress.</p></div>
    </div>
    {interviews.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Add an upcoming interview date to see your preparation here.</p> :
      <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{interviews.map(interview =>
        <li key={interview.applicationId}>
          <a href={`/prep/interviews/${interview.applicationId}`} className="block min-h-28 rounded-xl border p-4 transition-colors hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            <span className="flex items-start justify-between gap-2 font-semibold">{interview.position}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></span>
            <span className="mt-1 block text-sm text-muted-foreground">{interview.company} · {new Date(interview.interviewDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
            <span className="mt-3 block text-sm">{interview.completedTasks} tasks · {interview.practicedQuestions} questions · {interview.sessions} sessions</span>
          </a>
        </li>)}</ul>}
  </section>;
}
