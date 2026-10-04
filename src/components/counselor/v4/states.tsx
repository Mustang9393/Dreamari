"use client";

// Screen states for every v2 screen: loading, error, and the whole-screen
// empty case, in one place, so the backend integration (Usman) has one
// contract per screen and the demo can show each state on demand.
//
// DEMO-ONLY preview: append `?state=loading`, `?state=slow`, `?state=empty`,
// `?state=error` or `?state=offline` to any v2 URL and that screen renders
// the matching state (the prototype has no async data, so nothing reaches
// these states on its own -- except offline, which also fires for real when
// the browser actually goes offline, same as the rest of the app). The
// catalogue of every state and its copy, including the in-screen empties
// each screen already handles, is docs/COUNSELOR_V2_STATES.md.
//
// Treatments follow docs/COMPONENT_STATES_PLAYBOOK.md: loading is a
// skeleton in the card's own shape (never a spinner over the page), a
// whole-screen empty is playbook tier 1 (bordered card, bold line, muted
// line, one CTA), an error is one line plus Retry, in-screen empties (a
// filter that matched nothing) are one plain line. Slow and offline (27
// Sept 2026, closing the gap against the app-wide state contract) reuse the
// app's own shared SlowView/OfflineView instead of a bespoke v2 version --
// no reason for a counselor's slow connection to look like a different
// product from a student's.

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { OfflineView, SlowView } from "@/components/app/states";
import { useOnline } from "@/components/app/SurfaceState";
import type { CounselorView } from "../roles";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";

export type ScreenState = "ready" | "loading" | "slow" | "empty" | "error" | "offline";
const ScreenStateContext = createContext<ScreenState>("ready");
export const ScreenStateProvider = ScreenStateContext.Provider;
export function useScreenState(): ScreenState {
  return useContext(ScreenStateContext);
}

export function readStateParam(): ScreenState {
  if (typeof window === "undefined") return "ready";
  const v = new URLSearchParams(window.location.search).get("state");
  return v === "loading" || v === "slow" || v === "empty" || v === "error" || v === "offline" ? v : "ready";
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
  // School Leader and District Leader (2 Oct 2026): playbook tier 1 copy.
  "leader-progress": { title: "No student activity yet", body: "Milestones, activity and the student sample appear once students start their plans." },
  postsecondary: { title: "No interests or plans yet", body: "Career interests and postsecondary plans appear as students explore and save options." },
  team: { title: "No counselors assigned", body: "Each counselor's reach, planning completion and follow-up coverage appears once caseloads are assigned." },
  "leader-reports": { title: "No reports yet", body: "Reports fill once the school has a term of activity to report on." },
  "school-performance": { title: "No schools to compare", body: "Each school's measures appear once its students join Dreamari." },
  outcomes: { title: "No outcomes yet", body: "Outcomes by school and grade appear as students explore careers and complete milestones." },
  capacity: { title: "No counseling data yet", body: "Caseloads and follow-up coverage appear once counselors are assigned at each school." },
  "district-reports": { title: "No reports yet", body: "District reports fill once schools have a term of activity to report on." },
  meetings: { title: "No meetings yet", body: "Bookings appear here once students book your office hours in Dreamari.", cta: { label: "Students", view: "students" } },
  "financial-aid": { title: "No seniors yet", body: "Each senior's FAFSA status appears here once Grade 12 students are enrolled.", cta: { label: "Students", view: "students" } },
  academics: { title: "No school records yet", body: "Grades, attendance and transcripts appear once the school's SIS is connected in Settings.", cta: { label: "Settings", view: "settings" } },
  time: { title: "Nothing logged yet", body: "Your reviews, letters, reminders and meetings log themselves here. Add anything else from Log time at the top.", cta: { label: "Overview", view: "overview" } },
  applications: { title: "No applications yet", body: "Seniors' colleges and school documents appear here once they add colleges to their list.", cta: { label: "Students", view: "students" } },
};

export function LoadingState() {
  const row = (w: string, k: number) => <span key={k} className="block h-[12px] rounded-full" style={{ width: w, background: "var(--inset-bg)" }} />;
  const rows = (ws: string[]) => <div className="flex flex-col gap-[14px]">{ws.map(row)}</div>;
  return (
    <div className="flex flex-col gap-[var(--space-4)]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="v4-surface animate-pulse rounded-[var(--radius-lg)] border p-[var(--space-5)] xl:col-span-7" style={GLASS_CARD}>{rows(["38%", "62%", "48%", "70%", "54%"])}</div>
        <div className="v4-surface animate-pulse rounded-[var(--radius-lg)] border p-[var(--space-5)] xl:col-span-5" style={GLASS_CARD}>{rows(["44%", "30%", "66%", "52%"])}</div>
      </div>
      <div className="v4-surface animate-pulse rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>{rows(["34%", "80%", "72%", "64%"])}</div>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="v4-surface flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={GLASS_CARD} role="alert">
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
    // mx-auto + a ch-based max-w (27 Sept 2026 fix): the card itself had no
    // width of its own, so it stretched to whatever the screen's content
    // column measured -- at tablet width that column sits well under the
    // 1400px desktop cap but well over a comfortable line length, and with
    // only the body text capped (not the card), the title+card border
    // read as a big empty rectangle around a short crushed-looking column
    // of text. An explicit, centred measure makes the whole card read as
    // one intentionally-sized block at every width, not a stretch target.
    <div className="v4-surface mx-auto flex w-full max-w-[52ch] flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={GLASS_CARD}>
      <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{e.title}</span>
      <span className="max-w-[46ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{e.body}</span>
      {e.cta && (
        <button type="button" onClick={() => router.push(`/counselor?view=${e.cta!.view}`)} className="dm-quiet mt-[4px] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{e.cta.label}</button>
      )}
    </div>
  );
}

/** Wraps a v2 screen: renders the screen when ready, otherwise the
 *  matching state. Wired once in CounselorApp, not per screen. A real
 *  offline browser (not just `?state=offline`) overrides loading/slow/error
 *  the same way the app-wide SurfaceState contract does, so a counselor who
 *  loses their connection mid-load sees the offline card, not a stuck
 *  skeleton or a generic error. */
export function StateGate({ view, children }: { view: CounselorView; children: React.ReactNode }) {
  const state = useScreenState();
  const online = useOnline();
  const router = useRouter();
  const retry = () => router.replace(`/counselor?view=${view}`);
  const effective = (state === "loading" || state === "slow" || state === "error") && !online ? "offline" : state;
  if (effective === "loading") return <LoadingState />;
  if (effective === "slow") return <SlowView label="Loading" shape="document" onRetry={retry} />;
  if (effective === "error") return <ErrorState onRetry={retry} />;
  if (effective === "empty") return <EmptyState view={view} />;
  if (effective === "offline") return <OfflineView onRetry={retry} />;
  return <>{children}</>;
}
