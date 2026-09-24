"use client";

// Screen states for every v2 screen: loading, error, and the whole-screen
// empty case, in one place, so the backend integration (Usman) has one
// contract per screen and the demo can show each state on demand.
//
// DEMO-ONLY preview: append `?state=loading`, `?state=empty` or
// `?state=error` to any v2 URL and that screen renders the matching state
// (the prototype has no async data, so nothing reaches these states on its
// own). The catalogue of every state and its copy, including the in-screen
// empties each screen already handles, is docs/COUNSELOR_V2_STATES.md.
//
// Treatments follow docs/COMPONENT_STATES_PLAYBOOK.md: loading is a
// skeleton in the card's own shape (never a spinner over the page), a
// whole-screen empty is playbook tier 1 (bordered card, bold line, muted
// line, one CTA), an error is one line plus Retry, in-screen empties (a
// filter that matched nothing) are one plain line.

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import type { CounselorView } from "../roles";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";

export type ScreenState = "ready" | "loading" | "empty" | "error";
const ScreenStateContext = createContext<ScreenState>("ready");
export const ScreenStateProvider = ScreenStateContext.Provider;
export function useScreenState(): ScreenState {
  return useContext(ScreenStateContext);
}

export function readStateParam(): ScreenState {
  if (typeof window === "undefined") return "ready";
  const v = new URLSearchParams(window.location.search).get("state");
  return v === "loading" || v === "empty" || v === "error" ? v : "ready";
}

/** Whole-screen empty copy per view: what the screen shows when the
 *  backend returns nothing at all (a brand-new school, a role with no
 *  data yet). Filter-returned-nothing cases live inside each screen. */
export const SCREEN_EMPTY: Record<CounselorView, { title: string; body: string; cta?: { label: string; view: CounselorView } }> = {
  overview: { title: "No students yet", body: "Once students are enrolled and start their plans, the school's status, pathways and attention list appear here.", cta: { label: "Students", view: "students" } },
  students: { title: "No students enrolled", body: "The roster fills as students join Dreamari at your school." },
  milestones: { title: "No milestones to track", body: "Milestones appear once a grade has students and a curriculum assigned." },
  "review-queue": { title: "Nothing to review", body: "Submissions land here when students share work for approval.", cta: { label: "Students", view: "students" } },
  progress: { title: "No progress data yet", body: "Reports build from student milestones once the first ones are recorded." },
  connect: { title: "No conversations yet", body: "Questions, announcements and groups appear once students are active.", cta: { label: "Students", view: "students" } },
  insights: { title: "No insights yet", body: "Saved careers, simulations, majors and colleges show once students start exploring." },
  productivity: { title: "No students to draft for", body: "Drafts are built from a student's plan; add students first.", cta: { label: "Students", view: "students" } },
  engagement: { title: "No activity recorded", body: "Logins and activity show once students use Dreamari." },
  impact: { title: "Nothing to report yet", body: "Your impact report builds from milestones, reviews and replies over the period." },
  settings: { title: "No account", body: "Sign in to manage your profile and preferences." },
  counselors: { title: "No counselors assigned", body: "Caseloads appear once counselors are assigned to students." },
  readiness: { title: "No readiness data", body: "Targets are measured once students have plans and milestones." },
  reports: { title: "Nothing to report", body: "Reports build from live readiness data once students are enrolled." },
  schools: { title: "No schools in the district", body: "Schools appear once they are set up on Dreamari." },
  "school-impact": { title: "Nothing to report yet", body: "The school's impact report builds from milestones, reviews and replies over the period." },
};

export function LoadingState() {
  const row = (w: string, k: number) => <span key={k} className="block h-[12px] rounded-full" style={{ width: w, background: "var(--inset-bg)" }} />;
  const rows = (ws: string[]) => <div className="flex flex-col gap-[14px]">{ws.map(row)}</div>;
  return (
    <div className="flex flex-col gap-[var(--space-4)]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="animate-pulse rounded-[var(--radius-lg)] border p-[var(--space-5)] xl:col-span-7" style={GLASS_CARD}>{rows(["38%", "62%", "48%", "70%", "54%"])}</div>
        <div className="animate-pulse rounded-[var(--radius-lg)] border p-[var(--space-5)] xl:col-span-5" style={GLASS_CARD}>{rows(["44%", "30%", "66%", "52%"])}</div>
      </div>
      <div className="animate-pulse rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>{rows(["34%", "80%", "72%", "64%"])}</div>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={GLASS_CARD} role="alert">
      <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>This screen could not load</span>
      <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Check your connection and try again.</span>
      <button type="button" onClick={onRetry} className="dm-quiet mt-[4px] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>
        <RefreshCw className="h-[14px] w-[14px]" aria-hidden /> Retry
      </button>
    </div>
  );
}

export function EmptyState({ view }: { view: CounselorView }) {
  const router = useRouter();
  const e = SCREEN_EMPTY[view];
  return (
    <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={GLASS_CARD}>
      <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{e.title}</span>
      <span className="max-w-[46ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{e.body}</span>
      {e.cta && (
        <button type="button" onClick={() => router.push(`/counselor?view=${e.cta!.view}`)} className="dm-quiet mt-[4px] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{e.cta.label}</button>
      )}
    </div>
  );
}

/** Wraps a v2 screen: renders the screen when ready, otherwise the
 *  matching state. Wired once in CounselorApp, not per screen. */
export function StateGate({ view, children }: { view: CounselorView; children: React.ReactNode }) {
  const state = useScreenState();
  const router = useRouter();
  if (state === "loading") return <LoadingState />;
  if (state === "error") return <ErrorState onRetry={() => router.replace(`/counselor?view=${view}`)} />;
  if (state === "empty") return <EmptyState view={view} />;
  return <>{children}</>;
}
