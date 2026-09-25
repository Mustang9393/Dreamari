"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  LayoutGrid, Users, Target, ClipboardCheck, FileText, MessageSquare, Briefcase, Layers, Activity, Award, Settings as SettingsIcon,
  Search, Bell, Menu, X, UserCog, Gauge, FileBarChart, School, Trophy, Info, Check, ChevronsUpDown,
} from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { QuickLinksMenu, Wordmark as AppWordmark } from "@/components/app/chrome";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, writeCounselorAccount, COUNSELOR_ROLES } from "@/lib/counselorAccount";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { useCounselorVersion } from "./version";
import { menuForRole, roleOrDefault, OVERVIEW_SUBTITLES, REFERENCE_VIEWS, type CounselorView } from "./roles";
import { DISTRICT_NAME, DISTRICT_SHORT } from "@/lib/counselorOrg";
import { CHANGE_NOTES } from "./v2/changeNotes";

// The isolated shell for the Counselor Dashboard -- a genuinely separate
// product from the student app's own chrome (direct product decision: not a
// Profile tab, doesn't import DesktopNavigation/MobileNav from
// src/components/app/chrome.tsx). Its own sidebar, its own topbar, its own
// visual language on the same design tokens.

// The view union itself lives in ./roles.ts next to the per-role menus that
// are built from it; re-exported here so every screen keeps importing it
// from the shell.
export type { CounselorView } from "./roles";

const VIEW_ICONS: Record<CounselorView, typeof LayoutGrid> = {
  overview: LayoutGrid,
  students: Users,
  milestones: Target,
  "review-queue": ClipboardCheck,
  progress: FileText,
  connect: MessageSquare,
  insights: Briefcase,
  productivity: Layers,
  engagement: Activity,
  impact: Award,
  settings: SettingsIcon,
  counselors: UserCog,
  readiness: Gauge,
  reports: FileBarChart,
  schools: School,
  "school-impact": Trophy,
};


export const VIEW_TITLES: Record<CounselorView, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Welcome back. Here's your caseload at a glance." },
  students: { title: "Students", subtitle: "View and manage your student caseload" },
  milestones: { title: "Milestone Tracker", subtitle: "Track completion of required milestones by grade level" },
  "review-queue": { title: "Review Queue", subtitle: "Review and approve student submissions" },
  progress: { title: "Student Progress", subtitle: `Generate and export student readiness reports for ${DEMO_SCHOOL}` },
  connect: { title: "Counselor Connect", subtitle: "Communicate with students and manage announcements" },
  insights: { title: "Career + College Insights", subtitle: "Discover what your students are exploring, saving, and aspiring toward — then turn those insights into action." },
  productivity: { title: "Productivity Suite", subtitle: "Generate high-quality first drafts for routine counseling tasks — then review, edit, and approve before use." },
  engagement: { title: "Platform Engagement", subtitle: `Login & activity tracking · ${DEMO_SCHOOL}` },
  impact: { title: "My Impact", subtitle: "Your advocacy, in numbers you can share" },
  settings: { title: "Settings", subtitle: "Manage your profile and preferences" },
  // Role-shell views (v2 only; see ./roles.ts). Subtitles state the
  // question each screen exists to answer, so a placeholder still tells a
  // reviewer what will live here.
  counselors: { title: "Counselors", subtitle: `Every counselor's caseload at ${DEMO_SCHOOL}, and who needs support` },
  readiness: { title: "Readiness", subtitle: "Senior plan compliance, FAFSA and milestone readiness against targets" },
  reports: { title: "Reports", subtitle: "Board, district and state reports built from live readiness data" },
  schools: { title: "Schools", subtitle: "Every school in the district, and which ones need support" },
  "school-impact": { title: "School Impact", subtitle: `${DEMO_SCHOOL}'s advocacy, in numbers you can share` },
};

/** The reference's fixed 11-item menu: what v1 shows for every role. */
export const NAV_ITEMS: { view: CounselorView; label: string; icon: typeof LayoutGrid }[] = REFERENCE_VIEWS.map((view) => ({ view, label: VIEW_TITLES[view].title, icon: VIEW_ICONS[view] }));

export type GradeFilter = "All Grades" | 9 | 10 | 11 | 12;
const GRADE_OPTIONS: GradeFilter[] = ["All Grades", 9, 10, 11, 12];

// Set by clicking a donut segment on Overview, read by the Students roster
// -- lets a click-through land on a pre-filtered caseload instead of just
// the view itself (direct instruction: donut segments should navigate to a
// filtered Roster). Lives in this same shared context, not the URL, since
// the whole dashboard is one client-side view switch, not a real route
// change, and every other cross-view filter here already works this way.
export type StatusRosterFilter = "All" | "On Track" | "Needs Attention" | "At Risk";
export type PlanRosterFilter = "All" | "With Plan" | "Undecided";

type FiltersState = {
  gradeFilter: GradeFilter; setGradeFilter: (g: GradeFilter) => void;
  search: string; setSearch: (s: string) => void;
  statusFilter: StatusRosterFilter; setStatusFilter: (s: StatusRosterFilter) => void;
  planFilter: PlanRosterFilter; setPlanFilter: (p: PlanRosterFilter) => void;
  /** A seeded counselor id (counselorOrg.ts) or "All"; read by Students,
   *  Review Queue and Milestone Tracker for the roles that see counselors,
   *  and set by the Counselors screen's click-through. */
  counselorFilter: string; setCounselorFilter: (c: string) => void;
  /** A curriculum checkpoint id (counselorCurriculum.ts) plus its title:
   *  Students then shows only the students who have not done it. Set by
   *  the Milestone Tracker's rows; cleared by the chip on Students. */
  stepFilter: { id: string; title: string; grade: 9 | 10 | 11 | 12 } | null; setStepFilter: (f: { id: string; title: string; grade: 9 | 10 | 11 | 12 } | null) => void;
};
const CounselorFiltersContext = createContext<FiltersState>({
  gradeFilter: "All Grades", setGradeFilter: () => {},
  search: "", setSearch: () => {},
  statusFilter: "All", setStatusFilter: () => {},
  planFilter: "All", setPlanFilter: () => {},
  counselorFilter: "All", setCounselorFilter: () => {},
  stepFilter: null, setStepFilter: () => {},
});
export function useCounselorFilters(): FiltersState {
  return useContext(CounselorFiltersContext);
}

/** The menu for this build and role. v1: the reference's fixed 11 items,
 *  whatever the role. v2: the role's own menu from ./roles.ts (a screen the
 *  role does not have is simply absent). The version gate is DEMO-ONLY
 *  plumbing; the role menus themselves are the product. */
function useNavItems(): { view: CounselorView; label: string; icon: typeof LayoutGrid }[] {
  const { version } = useCounselorVersion();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  if (version === "v1") return NAV_ITEMS;
  return menuForRole(account.role).map((item) => ({ view: item.view, label: item.label ?? VIEW_TITLES[item.view].title, icon: VIEW_ICONS[item.view] }));
}

function SidebarNav({ active, onNavigate }: { active: CounselorView; onNavigate?: () => void }) {
  const items = useNavItems();
  return (
    <nav aria-label="Counselor Dashboard" className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-[var(--space-3)] py-[var(--space-4)]">
      {items.map((item) => {
        const on = item.view === active;
        const Icon = item.icon;
        return (
          <Link
            key={item.view}
            href={`/counselor?view=${item.view}`}
            onClick={onNavigate}
            aria-current={on ? "page" : undefined}
            className="dm-quiet flex items-center gap-[10px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-[13.5px] font-semibold"
            style={{ background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}
          >
            <Icon className="h-[17px] w-[17px] flex-none" aria-hidden style={{ color: on ? "var(--primary)" : "var(--muted-foreground)" }} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// The role switcher used to be a second pill row in the bottom-center demo
// dock; moved here, 26 Sept 2026, direct instruction: "Make the user role
// switcher accessible from the profile name thing in the footer of the
// side menu as a menu that pops up when you click there." The profile
// block itself is now the trigger; v1 has no role concept, so it stays
// plain there (same gate the dock's own pill used).
function SidebarAccount({ account }: { account: { name: string; school: string } }) {
  const { version } = useCounselorVersion();
  const live = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const role = roleOrDefault(live.role);
  const [open, setOpen] = useState(false);
  const canSwitch = version !== "v1";

  const initials = account.name ? account.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const content = (
    <>
      <span className="flex size-[34px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>
        {initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{account.name || "Counselor"}</span>
        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{account.school || DEMO_SCHOOL}</span>
      </span>
    </>
  );

  if (!canSwitch) {
    return (
      <div className="flex items-center gap-[10px] border-t px-[var(--space-4)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
        {content}
      </div>
    );
  }

  return (
    <div className="relative border-t" style={{ borderColor: "var(--glass-border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] px-[var(--space-4)] py-[var(--space-4)] text-left"
      >
        {content}
        <ChevronsUpDown className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-[110] cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" aria-label="Signed-in role" className="absolute bottom-[calc(100%+6px)] left-[var(--space-3)] z-[120] w-[212px] rounded-[var(--radius-md)] border p-[6px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 16px 40px -12px rgba(0,0,0,0.6)" }}>
            <span className="block px-[8px] pt-[2px] pb-[6px] text-[10.5px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Viewing as</span>
            {COUNSELOR_ROLES.map((r) => {
              const on = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  onClick={() => { writeCounselorAccount({ role: r }); setOpen(false); }}
                  className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] px-[8px] py-[8px] text-left text-[13px] font-semibold"
                  style={{ background: on ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {r}
                  {on && <Check className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// The real app wordmark (same logo-mark.svg + "DREAMARI" set every student
// page uses), not a hand-drawn "D" square -- this dashboard is a Dreamari
// product, not a differently-branded tool (direct feedback: "use the
// dreamari brandmark and logo from the other app here"). "Command Center"
// stays as a caption under it so the two products are still visually
// distinct at a glance.
function Wordmark() {
  return (
    <span className="flex flex-col gap-[2px]">
      <AppWordmark href="/counselor?view=overview" />
      <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Command Center</span>
    </span>
  );
}

function GradeFilterSelect({ gradeFilter, setGradeFilter, className = "" }: { gradeFilter: GradeFilter; setGradeFilter: (g: GradeFilter) => void; className?: string }) {
  return (
    <label className={`flex h-9 items-center rounded-[var(--radius-sm)] border px-[8px] text-[13px] font-semibold ${className}`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <span className="sr-only">Filter by grade</span>
      <select
        value={String(gradeFilter)}
        onChange={(e) => setGradeFilter(e.target.value === "All Grades" ? "All Grades" : (Number(e.target.value) as GradeFilter))}
        className="cursor-pointer bg-transparent pr-1 outline-none"
        style={{ color: "var(--foreground)" }}
      >
        {GRADE_OPTIONS.map((g) => (
          <option key={String(g)} value={String(g)} style={{ color: "#000" }}>{g === "All Grades" ? "All Grades" : `Grade ${g}`}</option>
        ))}
      </select>
    </label>
  );
}

// The (i) at the top right of every v2 screen: what this screen changed
// from the Replit reference, why, and what makes it better (direct
// instruction, 25 Sept 2026; moved out of the title block the same day:
// "put it in the top right corner, and when clicking let it display as an
// overlay thing that can be closed so it doesn't confuse the layout").
// Content in ./v2/changeNotes.ts; the icon carries its label as a tooltip
// (icon-only rule), the click opens a fixed overlay panel over the page,
// closed by its X, the backdrop or Escape, so the layout beneath never
// moves.
function ChangeNoteButton({ view, open, onToggle }: { view: CounselorView; open: boolean; onToggle: () => void }) {
  if (!CHANGE_NOTES[view]) return null;
  return (
    <IconTip label="What changed and why">
      <button type="button" aria-label="What changed and why" aria-expanded={open} onClick={onToggle} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: open ? "var(--primary)" : "var(--foreground)" }}>
        <Info className="h-[18px] w-[18px]" aria-hidden />
      </button>
    </IconTip>
  );
}

function ChangeNotePanel({ view, onClose }: { view: CounselorView; onClose: () => void }) {
  const note = CHANGE_NOTES[view];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-[var(--space-4)] sm:p-[var(--space-5)]">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(0,0,0,0.45)" }} />
      <div role="dialog" aria-modal="true" aria-label={`What changed on ${VIEW_TITLES[view].title}`} className="relative mt-[56px] flex max-h-[calc(100dvh-80px)] w-full max-w-[520px] flex-col gap-[var(--space-3)] overflow-y-auto rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)" }}>
        <div className="flex items-start justify-between gap-[8px]">
          <span className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>What changed from the reference</span>
            <span className="text-[16px] font-bold" style={{ color: "var(--foreground)" }}>{VIEW_TITLES[view].title}</span>
          </span>
          <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[15px] w-[15px]" aria-hidden /></button>
        </div>
        <ul className="flex flex-col gap-[6px]">
          {note.changed.map((c) => (
            <li key={c} className="flex items-start gap-[8px] text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}>
              <span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: "var(--primary)" }} />{c}
            </li>
          ))}
        </ul>
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}><span className="font-bold">Why.</span> {note.why}</p>
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}><span className="font-bold">Better because.</span> {note.better}</p>
        {note.order && <p className="text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}><span className="font-bold">What comes first, and why.</span> {note.order}</p>}
        <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Full reasoning and the alternatives each choice beat: docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md</span>
      </div>
    </div>
  );
}

// `showTitle={false}` drops the page title/subtitle block for a view that
// renders its own header row (the reference's Student Profile shows
// "← Student Profile" plus its actions inline instead of the Students title).
export function CounselorShell({ active, children, showTitle = true }: { active: CounselorView; children: React.ReactNode; showTitle?: boolean }) {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("All Grades");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusRosterFilter>("All");
  const [planFilter, setPlanFilter] = useState<PlanRosterFilter>("All");
  const [counselorFilter, setCounselorFilter] = useState("All");
  const [stepFilter, setStepFilter] = useState<{ id: string; title: string; grade: 9 | 10 | 11 | 12 } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const { title, subtitle: subtitleRaw } = VIEW_TITLES[active];
  // Matches the reference's own copy exactly ("Welcome back, Sarah...") --
  // the counselor's first name, not a generic greeting. Falls back to the
  // unpersonalized line before an account name is set.
  const firstName = account.name.trim().split(/\s+/)[0];
  const { version } = useCounselorVersion();
  // v2: each role's Overview answers its own question and the subtitle
  // says which (roles.ts). v1 keeps the reference's line.
  const subtitle = active === "overview"
    ? version !== "v1" ? OVERVIEW_SUBTITLES[roleOrDefault(account.role)](firstName) : firstName ? `Welcome back, ${firstName}. Here's your caseload at a glance.` : subtitleRaw
    : subtitleRaw;
  // A district administrator's frame of reference is the district, not one
  // school: the topbar's org chip and the account line say so (v2 only).
  const orgLabel = version !== "v1" && account.role === "District Administrator" ? DISTRICT_NAME : DEMO_SCHOOL;

  return (
    <CounselorFiltersContext.Provider value={{ gradeFilter, setGradeFilter, search, setSearch, statusFilter, setStatusFilter, planFilter, setPlanFilter, counselorFilter, setCounselorFilter, stepFilter, setStepFilter }}>
      {/* marketing-v2 defines --primary, --card, --foreground, and every
         other token used across this dashboard (see marketing/tokens.css,
         scoped to .marketing-v2, not root). This wrapper only had
         .themeable before, so those tokens were silently undefined
         everywhere -- the root cause of the whole dashboard reading as
         unstyled. Every other page pairs .themeable with .marketing-v2
         (HomeExperience, ProfileExperience, etc). */}
      {/* No AppBackdrop here -- direct instruction: this product isn't
         trying to look like the student app, it's a working tool a
         counselor scans under real conditions (a shared office monitor, a
         projector). A flat, high-contrast ground reads faster than a
         colorful gradient wash competing with data. */}
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {/* Desktop sidebar -- lg and up only. Below that, the same nav lives
           in the slide-out drawer, matching how the student app itself
           splits a persistent desktop rail from a mobile-triggered menu
           (see src/components/app/chrome.tsx's own lg: split). The
           reference this was built from had NO mobile handling at all (a
           permanently pinned sidebar crushing the page at phone width) --
           this is the deliberate fix, not something carried over. */}
        <aside className="sticky top-0 hidden h-dvh w-[248px] flex-none flex-col border-r lg:flex" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          <div className="border-b px-[var(--space-5)] py-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
            <Wordmark />
          </div>
          <SidebarNav active={active} />
          <SidebarAccount account={{ name: account.name, school: orgLabel === DEMO_SCHOOL ? account.school : DISTRICT_SHORT }} />
        </aside>

        {/* Mobile drawer -- backdrop + slide-in panel, lg:hidden context only (never mounted interactive at lg+). */}
        {drawerOpen && (
          <div className="fixed inset-0 z-30 flex lg:hidden">
            <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(0,0,0,0.6)" }} />
            <div className="relative flex h-dvh w-[280px] max-w-[80vw] flex-col border-r" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <div className="flex items-center justify-between border-b px-[var(--space-5)] py-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
                <Wordmark />
                <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-[10px] border-b px-[var(--space-4)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{orgLabel} · 2023-2024</span>
                <GradeFilterSelect gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} />
              </div>
              <SidebarNav active={active} onNavigate={() => setDrawerOpen(false)} />
              <SidebarAccount account={{ name: account.name, school: orgLabel === DEMO_SCHOOL ? account.school : DISTRICT_SHORT }} />
            </div>
          </div>
        )}

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          {/* Mobile top bar -- hamburger + wordmark + bell only, lg:hidden. */}
          <header className="sticky top-0 z-10 flex items-center justify-between gap-[10px] border-b px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-[10px] lg:hidden" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-center gap-[10px]">
              <button type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                <Menu className="h-5 w-5" aria-hidden />
              </button>
              <Wordmark />
            </div>
            <div className="flex items-center gap-[4px]">
              <IconTip label="Notifications">
                <button type="button" aria-label="Notifications" className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                  <Bell className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </IconTip>
              {version !== "v1" && <ChangeNoteButton view={active} open={noteOpen} onToggle={() => setNoteOpen((o) => !o)} />}
              {/* DEMO-ONLY: the site-wide "quick links" hamburger, same one
                 the student app uses to reach this dashboard in the first
                 place -- without it, this shell's own isolation (no shared
                 chrome, by design) left no way back to Build/Match/Explore/
                 Play/Connect for a live demo (direct feedback, 22 Sept
                 2026). Remove/replace once real counselor accounts and org
                 onboarding exist, same as the entry point itself
                 (chrome.tsx's COUNSELOR_LINK). */}
              <QuickLinksMenu align="right" />
            </div>
          </header>

          {/* Desktop topbar -- full filters row, lg and up only. */}
          <header className="sticky top-0 z-10 hidden flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-3)] backdrop-blur-[10px] lg:flex" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--glass-border)" }}>
            <div className="flex flex-wrap items-center gap-[10px]">
              <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{orgLabel}</span>
              <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>2023-2024</span>
              <GradeFilterSelect gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} />
            </div>
            <div className="flex items-center gap-[10px]">
              <label className="relative flex h-9 w-[220px] items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                <span className="sr-only">Search students</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="h-9 w-full rounded-[var(--radius-sm)] border pr-3 pl-9 text-[13px] outline-none"
                  style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                />
              </label>
              <IconTip label="Notifications">
                <button type="button" aria-label="Notifications" className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                  <Bell className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </IconTip>
              {version !== "v1" && <ChangeNoteButton view={active} open={noteOpen} onToggle={() => setNoteOpen((o) => !o)} />}
              {/* DEMO-ONLY: see the matching comment on the mobile header
                 above -- the way back to the rest of the demo. */}
              <QuickLinksMenu align="right" />
            </div>
          </header>

          {/* Bottom padding also clears the DEMO-ONLY version/role dock at
             bottom-center (./version.tsx), so a page's last row (roster
             pagination, a card's footer) is never sitting under it. On
             phones the two pills wrap to two rows, hence the taller clear. */}
          <main className="flex flex-1 justify-center px-[var(--space-4)] pt-[var(--space-4)] pb-[calc(var(--space-6)+68px)] sm:px-[var(--space-5)] sm:pb-[calc(var(--space-6)+36px)] md:px-[var(--space-8)]">
            {/* Capped, not full-bleed -- a huge monitor stretching every
               card/table edge-to-edge is what reads as "undesigned
               wireframe" (direct feedback): thin progress bars, cavernous
               empty cells, no sense of a composed layout. 1400px keeps the
               3-up card grids and the two-pane Review Queue feeling dense
               and intentional at any width beyond it, same principle the
               rest of the app already applies (Career Detail's own
               max-w-[1040px]/[1440px] content caps). Top padding is
               deliberately tighter than the bottom -- the sticky topbar
               above already reads as the page's own header, so a full
               space-6 gap under it before the title even starts read as
               dead space (direct feedback). */}
            {/* `[&>*]:shrink-0`: a flex column sizes itself from its items, and
               any item carrying overflow-hidden gets a min-height of 0, so it
               silently absorbs the whole shortfall when the column's content
               is taller than its stretched height -- the Career + College
               Insights banner rendered 128px tall over 345px of content
               (direct report, 24 Sept 2026: "cropping its own content in a
               tiny short card surface"). Items never shrink here; the page
               scrolls instead. */}
            <div className="flex w-full max-w-[1400px] flex-col gap-[var(--space-4)] [&>*]:shrink-0">
              {showTitle && (
                <div className="flex flex-col gap-[2px]">
                  <h1 className="text-[22px] leading-[1.15] font-extrabold sm:text-[26px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>
                  {/* v2 drops the caption line under every page title (direct
                     feedback, 25 Sept 2026: "Remove all the captions to the
                     main page titles ... there is so much copy on every
                     screen"). Every v2 screen already states its purpose in
                     its hero card or its (i) note, so the caption only ever
                     repeated the title in longer words. v1 keeps the
                     reference's subtitle line untouched -- it stays a 1:1
                     port of the Replit, copy included. (26 Sept 2026: this
                     Milestone Tracker subtitle had been overwritten during
                     the since-reverted "My Plan" bridge pass and never
                     restored when the content itself was reverted -- caught
                     by a direct visual side-by-side check, not a code
                     read. Restored to the reference's original wording.) */}
                  {version === "v1" && <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
        {version !== "v1" && noteOpen && <ChangeNotePanel view={active} onClose={() => setNoteOpen(false)} />}
      </div>
    </CounselorFiltersContext.Provider>
  );
}

export { HoverBeam };
