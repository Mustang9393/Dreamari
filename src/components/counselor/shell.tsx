"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid, Users, Target, ClipboardCheck, FileText, MessageSquare, Briefcase, Layers, Activity, Award, Settings as SettingsIcon,
  Search, Bell, Menu, X, UserCog, Gauge, FileBarChart, School, Trophy, Info, Check, ChevronsUpDown, CalendarDays, Landmark, GraduationCap, Send, CornerDownLeft, Clock, TrendingUp, Compass, HeartHandshake } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import "./v4/v4.css";
import { LEADER_AREAS, Workspace } from "./v4/Workspace";
import { InsightsFilters } from "./v4/InsightsFilters";
import { DataDefinitionsButton, LeaderControls, LeaderIdentity, isLeaderRole, useLeaderOrg, useLeaderOrg as useLeaderOrgV4 } from "./v4/leader/LeaderChrome";
import { Listbox } from "./v4/Listbox";
import { useGlobalTheme } from "@/components/app/theme";
import { IconTip } from "@/components/app/IconTip";
import { QuickLinksMenu, Wordmark as AppWordmark } from "@/components/app/chrome";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, writeCounselorAccount, COUNSELOR_ROLES } from "@/lib/counselorAccount";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { CounselorVersionChip, useCounselorVersion, V3_ENABLED } from "./version";
import { menuForRole, roleOrDefault, OVERVIEW_SUBTITLES, REFERENCE_VIEWS, VIEW_GROUP, VIEW_HOME, type CounselorView } from "./roles";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { useV3Extras } from "./v3Extras";
import { Avatar } from "./chips";
import { DISTRICT_NAME, DISTRICT_SHORT } from "@/lib/counselorOrg";
import { CHANGE_NOTES, LEADER_OVERVIEW_NOTES, SHARED_DECISIONS } from "./v4/changeNotes";
import { LEADER_ROLE_DESCRIPTIONS } from "@/lib/leaderData";
import { setCounselorBaseV4 } from "@/lib/counselorBase";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { ExploreSheetHost } from "./v5/ExploreSheets";
import { LogSheetHost } from "./v5/LogSheet";
import { CounselorProfileSheet } from "./v4/CounselorProfileSheet";

// One line per role in the "Viewing as" menu, so a demo audience knows what
// each view is for. School and District Leader are the Replit's own
// descriptions (NOTES.md 1.1); the counselor line is the Replit's
// "Counselor" description; Lead Counselor is ours (the Replit has none).
const ROLE_DESCRIPTIONS: Record<string, string> = {
  "School Counselor": "Student-level view for counselors, advisors, coaches, and other professionals directly supporting students.",
  "Lead Counselor": "The counselor view plus the team: every counselor's caseload, reviews and school-wide reports.",
  "School Leader": LEADER_ROLE_DESCRIPTIONS.school,
  "District Leader": LEADER_ROLE_DESCRIPTIONS.district,
};

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
  explore: Compass,
  checkins: HeartHandshake,
  productivity: Layers,
  engagement: Activity,
  impact: Award,
  settings: SettingsIcon,
  counselors: UserCog,
  readiness: Gauge,
  reports: FileBarChart,
  schools: School,
  "school-impact": Trophy,
  "leader-progress": TrendingUp,
  postsecondary: GraduationCap,
  team: UserCog,
  "leader-reports": FileBarChart,
  "school-performance": School,
  outcomes: TrendingUp,
  capacity: Users,
  "district-reports": FileBarChart,
  meetings: CalendarDays,
  "financial-aid": Landmark,
  academics: GraduationCap,
  applications: Send,
  time: Clock,
};


export const VIEW_TITLES: Record<CounselorView, { title: string; subtitle: string }> = {
  overview: { title: "Home", subtitle: "Welcome back. Here's your caseload at a glance." },
  students: { title: "Students", subtitle: "View and manage your student caseload" },
  milestones: { title: "Milestone Tracker", subtitle: "Track completion of required milestones by grade level" },
  "review-queue": { title: "Review Queue", subtitle: "Review and approve student submissions" },
  progress: { title: "Student Progress", subtitle: `Generate and export student readiness reports for ${DEMO_SCHOOL}` },
  connect: { title: "Counselor Connect", subtitle: "Communicate with students and manage announcements" },
  insights: { title: "Career + College Insights", subtitle: "Discover what your students are exploring, saving, and aspiring toward — then turn those insights into action." },
  checkins: { title: "Check-ins", subtitle: "How my students say their week is going, who needs a response, and sending the next check-in." },
  explore: { title: "Explore", subtitle: "What's in demand, what's growing and what my students save, so I can answer them on the spot." },
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
  // School Leader and District Leader: titles and subtitles are the
  // Replit's own (NOTES.md 2.2 to 2.5, 3.2 to 3.5).
  "leader-progress": { title: "Student Progress", subtitle: "Review current planning milestones, activity, and a representative student sample." },
  postsecondary: { title: "Career + Postsecondary", subtitle: "Explore interests alongside students' next-step planning." },
  team: { title: "Counseling Team", subtitle: "Review student reach, planning completion, and follow-up coverage." },
  "leader-reports": { title: "Reports", subtitle: "Open a populated report or download a copy of the current data." },
  "school-performance": { title: "School Performance", subtitle: "Every school's measures against the launch baseline, side by side." },
  outcomes: { title: "Student Outcomes", subtitle: "Compare outcomes by school or by grade across the district." },
  capacity: { title: "Counseling Capacity", subtitle: "Students per counselor, follow-up load and coverage at every school." },
  "district-reports": { title: "Reports", subtitle: "Open a report for details or export the school comparison." },
  // v3 only (roles.ts).
  meetings: { title: "Meetings", subtitle: "Office hours, bookings and meeting notes" },
  "financial-aid": { title: "Financial Aid", subtitle: "Every senior's FAFSA status and the next fix" },
  academics: { title: "Academics", subtitle: "Grades, attendance, behavior, graduation and readiness from the school's records" },
  applications: { title: "Applications", subtitle: "Every senior's colleges, deadlines and school documents" },
  time: { title: "Time log", subtitle: "Your week against ASCA's 80/20" },
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
  // v3: the research screens join the menu only while their toggle is on.
  const extras = useV3Extras();
  if (version === "v1") return NAV_ITEMS;
  return menuForRole(account.role, version, extras).map((item) => ({ view: item.view, label: item.label ?? VIEW_TITLES[item.view].title, icon: VIEW_ICONS[item.view] }));
}

function SidebarNav({ active, onNavigate }: { active: CounselorView; onNavigate?: () => void }) {
  const items = useNavItems();
  const { version } = useCounselorVersion();
  const grouped = version === "v3" || version === "v4";
  const futuristic = version === "v4";
  // v1 still lists Insights itself; v2 shows it inside Reports.
  const home = items.some((i) => i.view === active) ? active : (VIEW_HOME[active] ?? active);
  return (
    <nav aria-label="Counselor Dashboard" className={`flex flex-1 flex-col overflow-y-auto px-[var(--space-3)] py-[var(--space-4)] ${futuristic ? "gap-[3px]" : "gap-[2px]"}`}>
      {items.map((item, i) => {
        const on = item.view === home;
        const Icon = item.icon;
        // v3: a plain list in VIEW_GROUP order (direct instruction, 2 Oct
        // 2026: "lose the labeled organisation sections in the sidebar
        // too"). The group labels are gone; only the unlabeled hairline
        // that sets Account (Settings) apart at the bottom stays.
        const group = VIEW_GROUP[item.view];
        const starts = grouped && (i === 0 || VIEW_GROUP[items[i - 1].view] !== group);
        return (
          <div key={item.view} className="contents">
          {starts && futuristic && group !== "" && <span className="mb-[3px] mt-[14px] px-[var(--space-3)] text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>{group}</span>}
          {starts && !futuristic && group === "Account" && <span aria-hidden className="mx-[var(--space-3)] my-[8px] h-px" style={{ background: "var(--glass-border)" }} />}
          <Link
            key={item.view}
            href={`/counselor?view=${item.view}`}
            onClick={onNavigate}
            aria-current={on ? "page" : undefined}
            className={`dm-quiet relative flex items-center gap-[10px] px-[var(--space-3)] ${futuristic ? "min-h-10 rounded-[13px] text-[12.5px]" : `rounded-[var(--radius-md)] ${grouped ? "py-[8px] text-[13px]" : "py-[10px] text-[13.5px]"}`} font-semibold`}
            style={{ background: on ? futuristic ? "linear-gradient(90deg, color-mix(in srgb, var(--primary) 22%, transparent), color-mix(in srgb, var(--primary) 6%, transparent))" : "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", border: futuristic && on ? "1px solid color-mix(in srgb, var(--primary) 25%, var(--glass-border))" : futuristic ? "1px solid transparent" : undefined }}
          >
            {futuristic && on && <span aria-hidden className="absolute bottom-[8px] left-0 top-[8px] w-[2px] rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 10px var(--primary)" }} />}
            <Icon className={`${grouped ? "h-[16px] w-[16px]" : "h-[17px] w-[17px]"} flex-none`} aria-hidden style={{ color: on ? "var(--primary)" : "var(--muted-foreground)" }} />
            {item.label}
          </Link>
          </div>
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
  const [profileOpen, setProfileOpen] = useState(false);
  const canSwitch = version !== "v1";

  // A leader's footer names the school or district and the role, as the
  // Replit's does ("Northbridge Academy / School Leader"): a leader view
  // belongs to the org, not to one counselor.
  const leaderOrg = useLeaderOrg(role === "District Leader" ? "District Leader" : "School Leader");
  const leader = canSwitch && isLeaderRole(role);
  const initials = leader ? leaderOrg.initials : account.name ? account.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const content = (
    <>
      <span className="flex size-[34px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>
        {initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{leader ? leaderOrg.name : account.name || "Counselor"}</span>
        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{leader ? role : account.school || DEMO_SCHOOL}</span>
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

  // v4 (9 Oct 2026, Maisha: "Add the clickable counselor profile to v4"):
  // a counselor's chip opens their profile (v5's, in a sheet); the role
  // switcher moves into that sheet's header. A leader has no counselor
  // profile, so a leader's chip keeps opening the role menu below.
  if (version === "v4" && !leader) {
    return (
      <div className="relative border-t" style={{ borderColor: "var(--glass-border)" }}>
        <IconTip label="Your profile">
          <button type="button" onClick={() => setProfileOpen(true)} aria-haspopup="dialog" aria-expanded={profileOpen} aria-label={`${account.name || "Counselor"}, your profile`} className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] px-[var(--space-4)] py-[var(--space-4)] text-left">
            {content}
          </button>
        </IconTip>
        <CounselorProfileSheet
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          name={account.name || "Counselor"}
          role={role}
          header={
            <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span className="max-sm:hidden">Viewing as</span>
              <Listbox ariaLabel="Viewing as" value={role} onChange={(r) => { setProfileOpen(false); writeCounselorAccount({ role: r as typeof role }); }} options={COUNSELOR_ROLES.filter((r) => r !== "Lead Counselor" || r === role).map((r) => ({ value: r, label: r }))} className="flex h-9 min-w-[180px] cursor-pointer items-center justify-between gap-[8px] rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }} />
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative border-t" style={{ borderColor: "var(--glass-border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-label={`Account and role: ${account.name || "Counselor"}`}
        aria-expanded={open}
        className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] px-[var(--space-4)] py-[var(--space-4)] text-left"
      >
        {content}
        <ChevronsUpDown className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-[110] cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" aria-label="Signed-in role" className="absolute bottom-[calc(100%+6px)] left-[var(--space-3)] z-[120] w-[min(300px,calc(calc(100vw/var(--vz,1))-24px))] rounded-[var(--radius-md)] border p-[6px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 16px 40px -12px rgba(0,0,0,0.6)" }}>
            <span className="block px-[8px] pt-[2px] pb-[6px] text-[10.5px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Viewing as</span>
            {/* Lead Counselor is hidden from the switcher (direct instruction,
               2 Oct 2026: "hide the lead counselor role from the role
               switcher"). The role and its screens still exist; an account
               already set to it keeps working. */}
            {COUNSELOR_ROLES.filter((r) => r !== "Lead Counselor").map((r) => {
              const on = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  onClick={() => { writeCounselorAccount({ role: r }); setOpen(false); }}
                  className="dm-quiet flex w-full cursor-pointer items-start justify-between gap-[8px] rounded-[var(--radius-sm)] px-[8px] py-[8px] text-left"
                  style={{ background: on ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "transparent" }}
                >
                  <span className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{r}</span>
                    <span className="text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>{ROLE_DESCRIPTIONS[r]}</span>
                  </span>
                  {on && <Check className="mt-[2px] h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />}
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

// v3 (2 Oct 2026 redundancy pass): the grade select shows only on the
// screens whose data actually filters by it (grep of gradeFilter readers
// under v3/). Academics, Applications, Financial Aid, Meetings and Time
// log ignore it, and the Milestone Tracker has its own grade tabs, so a
// select there was a control that did nothing (or a second grade picker).
// Insights keeps one set of filters across its four pages (9 Oct 2026, Maisha).
const V4_INSIGHTS_VIEWS: ReadonlySet<CounselorView> = new Set<CounselorView>(["readiness", "insights", "engagement", "impact", "school-impact"]);
const V3_GRADE_FILTER_VIEWS: ReadonlySet<CounselorView> = new Set<CounselorView>(["overview", "students", "review-queue", "progress", "counselors", "schools"]);

/** v4's grade picker. Each option carries its student count ("All grades ·
 *  121"), which replaces Home's "121 Students in View" figure (9 Oct 2026,
 *  Chandu: "do we need to show 121 students in view? Doesn't the counselor
 *  know their caseload"). The number is the picker's scope, so it lives on
 *  the picker and changes with it, instead of standing as a headline. */
function V4GradePicker({ gradeFilter, setGradeFilter }: { gradeFilter: GradeFilter; setGradeFilter: (g: GradeFilter) => void }) {
  const roster = useReviewedRoster();
  const count = (g: GradeFilter) => (g === "All Grades" ? roster.length : roster.filter((s) => s.grade === g).length);
  return <Listbox ariaLabel="Filter by grade" value={String(gradeFilter)} onChange={v=>setGradeFilter(v === "All Grades" ? "All Grades" : Number(v) as GradeFilter)} options={GRADE_OPTIONS.map(g=>({value:String(g),label:`${g === "All Grades" ? "All grades" : `Grade ${g}`} · ${count(g)}`}))} className="v4-grade-picker" panelStyle={{background:"var(--card)",color:"var(--foreground)"}} />;
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
// Content in ./v4/changeNotes.ts; the icon carries its label as a tooltip
// (icon-only rule), the click opens a fixed overlay panel over the page,
// closed by its X, the backdrop or Escape, so the layout beneath never
// moves.
// One set of notes since v2 and v3 were deleted (7 Oct 2026).
function useChangeNotes() {
  return CHANGE_NOTES;
}

// DEMO-ONLY: design-review chrome. The (i) "Why it looks this way" note
// explains design decisions to the team; it is not a counselor feature.
// Remove it (and ChangeNotePanel) before production.
function ChangeNoteButton({ view, open, onToggle }: { view: CounselorView; open: boolean; onToggle: () => void }) {
  const CHANGE_NOTES = useChangeNotes();
  if (!CHANGE_NOTES[view]) return null;
  return (
    <IconTip label="Why it looks this way">
      <button type="button" aria-label="Why it looks this way" aria-expanded={open} onClick={onToggle} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: open ? "var(--primary)" : "var(--foreground)" }}>
        <Info className="h-[18px] w-[18px]" aria-hidden />
      </button>
    </IconTip>
  );
}

function ChangeNotePanel({ view, onClose }: { view: CounselorView; onClose: () => void }) {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const notes = useChangeNotes();
  // The leaders' Overviews are their own screens with their own notes.
  const note = view === "overview" && isLeaderRole(account.role) ? LEADER_OVERVIEW_NOTES[account.role] : notes[view];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const heading = VIEW_TITLES[view].title;
  const label = "text-[11px] font-bold tracking-[0.06em] uppercase";
  // Laid out as the decisions themselves (26 Sept 2026, direct instruction:
  // "show the final justification of the final designs. Explain what
  // changed from the replit and why and justify the decisions"): each
  // change sits with its reason, then what was kept from the reference, so
  // the reader can check nothing was cut.
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-[var(--space-4)] sm:p-[var(--space-5)]">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(0,0,0,0.45)" }} />
      <div role="dialog" aria-modal="true" aria-label={`Why ${heading} looks this way`} className="relative mt-[56px] flex max-h-[calc(calc(100dvh/var(--vz,1))-80px)] w-full max-w-[580px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)" }}>
        <div className="flex items-start justify-between gap-[8px]">
          <span className="flex flex-col gap-[4px]">
            <span className={label} style={{ color: "var(--primary)" }}>Design rationale</span>
            <span className="text-[18px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>{heading}</span>
            <span className="text-[13px] leading-[18px] font-medium" style={{ color: "var(--muted-foreground)" }}>{note.summary}</span>
          </span>
          <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[15px] w-[15px]" aria-hidden /></button>
        </div>

        <section className="flex flex-col gap-[10px]">
          <span className={label} style={{ color: "var(--muted-foreground)" }}>{note.changedHeading ?? "What changed from the Replit, and why"}</span>
          <ol className="flex flex-col gap-[12px]">
            {note.decisions.map((d, i) => (
              <li key={d.change} className="flex gap-[10px]">
                <span className="flex size-[20px] flex-none items-center justify-center rounded-full text-[11px] font-bold tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>{i + 1}</span>
                <span className="flex min-w-0 flex-col gap-[3px]">
                  <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{d.change}</span>
                  <span className="text-[12.5px] leading-[18px] font-medium" style={{ color: "var(--muted-foreground)" }}>{d.why}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[12px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 3%, transparent)" }}>
          <span className={`${label} flex items-center gap-[6px]`} style={{ color: "var(--muted-foreground)" }}><Check className="h-[12px] w-[12px]" aria-hidden style={{ color: "var(--primary)" }} />{note.keptHeading ?? "Kept from the Replit"}</span>
          <span className="text-[12.5px] leading-[18px] font-medium" style={{ color: "var(--foreground)" }}>{note.kept}</span>
        </section>

        {note.order && (
          <section className="flex flex-col gap-[4px]">
            <span className={label} style={{ color: "var(--muted-foreground)" }}>What comes first, and why</span>
            <span className="text-[12.5px] leading-[18px] font-medium" style={{ color: "var(--foreground)" }}>{note.order}</span>
          </section>
        )}

        <section className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className={label} style={{ color: "var(--muted-foreground)" }}>On every screen</span>
          <ul className="flex flex-col gap-[8px]">
            {SHARED_DECISIONS.map((d) => (
              <li key={d.change} className="flex flex-col gap-[2px]">
                <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{d.change}</span>
                <span className="text-[12px] leading-[17px] font-medium" style={{ color: "var(--muted-foreground)" }}>{d.why}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// v3: one search for students AND screens (29 Sept 2026, "ease of
// navigation"). Typing still filters the Students list as before; the
// popover jumps straight to a profile or a screen. "/" focuses it from
// anywhere, arrows move, Enter opens, Escape closes. The same pattern as
// Linear's and SchooLinks' top search.
function GlobalSearch({ search, setSearch, className = "w-[280px]", autoFocus }: { search: string; setSearch: (s: string) => void; className?: string; autoFocus?: boolean }) {
  const roster = useReviewedRoster();
  const items = useNavItems();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const q = search.trim().toLowerCase();
  const students = q ? roster.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6) : [];
  const screens = q ? items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 4) : [];
  const results: { key: string; href: string; node: React.ReactNode }[] = [
    ...students.map((s) => ({ key: s.id, href: `/counselor?view=students&studentId=${s.id}`, node: <><Avatar name={s.name} size={26} index={s.avatarIndex} /><span className="flex min-w-0 flex-col leading-tight"><span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span><span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.status}</span></span></> })),
    ...screens.map((i) => { const Icon = i.icon; return { key: i.view, href: `/counselor?view=${i.view}`, node: <><span className="flex size-[26px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}><Icon className="h-[13px] w-[13px]" aria-hidden /></span><span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{i.label}</span></> }; }),
  ];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "/" && !(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))) {
        e.preventDefault();
        document.getElementById("cd-global-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const router = useRouter();
  const go = (href: string) => { setOpen(false); setSearch(""); router.push(href); };
  return (
    <div className={`relative ${className}`}>
      <label className="relative flex h-9 items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        <span className="sr-only">Search students and screens</span>
        <input
          id={autoFocus ? "cd-global-search-mobile" : "cd-global-search"}
          autoFocus={autoFocus}
          aria-activedescendant={open && results[cursor] ? `cd-search-opt-${results[cursor].key}` : undefined}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="cd-global-search-results"
          autoComplete="off"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); setCursor(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
            else if (e.key === "Enter" && results[cursor]) { e.preventDefault(); go(results[cursor].href); }
            else if (e.key === "Escape") { setOpen(false); (e.target as HTMLInputElement).blur(); }
          }}
          placeholder="Search students or screens"
          className="h-9 w-full rounded-[var(--radius-sm)] border pr-9 pl-9 text-[13px] outline-none"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        />
        {!search && <kbd aria-hidden className="pointer-events-none absolute right-2 rounded-[5px] border px-[6px] text-[11px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>/</kbd>}
      </label>
      {open && q && (
        <div id="cd-global-search-results" role="listbox" className="absolute top-[42px] right-0 z-30 flex w-[min(320px,calc(calc(100vw/var(--vz,1))-24px))] flex-col gap-[2px] rounded-[var(--radius-md)] border p-[6px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 18px 40px -16px rgba(0,0,0,0.45)" }}>
          {results.length === 0 && <span className="px-[10px] py-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No students or screens match.</span>}
          {students.length > 0 && <span className="px-[10px] pt-[4px] pb-[2px] text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Students</span>}
          {results.map((r, i) => (
            <div key={r.key} className="contents">
              {i === students.length && screens.length > 0 && <span className="px-[10px] pt-[6px] pb-[2px] text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Screens</span>}
              <button type="button" id={`cd-search-opt-${r.key}`} role="option" aria-selected={i === cursor} onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setCursor(i)} onClick={() => go(r.href)} className="flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[10px] py-[6px] text-left" style={{ background: i === cursor ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "transparent" }}>
                {r.node}
                {i === cursor && <CornerDownLeft className="ml-auto h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />}
              </button>
            </div>
          ))}
        </div>
      )}
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
  const [mobileSearch, setMobileSearch] = useState(false);
  const { title, subtitle: subtitleRaw } = VIEW_TITLES[active];
  // Matches the reference's own copy exactly ("Welcome back, Sarah...") --
  // the counselor's first name, not a generic greeting. Falls back to the
  // unpersonalized line before an account name is set.
  const firstName = account.name.trim().split(/\s+/)[0];
  const { version } = useCounselorVersion();
  const { theme, toggle: toggleTheme } = useGlobalTheme();
  // v2: each role's Overview answers its own question and the subtitle
  // says which (roles.ts). v1 keeps the reference's line.
  const subtitle = active === "overview"
    ? version !== "v1" ? OVERVIEW_SUBTITLES[roleOrDefault(account.role)](firstName) : firstName ? `Welcome back, ${firstName}. Here's your caseload at a glance.` : subtitleRaw
    : subtitleRaw;
  // A district administrator's frame of reference is the district, not one
  // school: the topbar's org chip and the account line say so (v2 only).
  const orgLabel = version !== "v1" && account.role === "District Leader" ? DISTRICT_NAME : DEMO_SCHOOL;
  // School and District Leader get their own top bar (v4/leader/LeaderChrome.tsx).
  const leaderRole = version !== "v1" && isLeaderRole(account.role) ? account.role : null;
  // v4 names the leader's own school or district in the top bar and the page
  // overline, where the counselor's school sits (6 Oct 2026).
  const v4LeaderOrg = useLeaderOrgV4(leaderRole ?? "School Leader");
  const showGradeFilter = version !== "v3" || V3_GRADE_FILTER_VIEWS.has(active);
  const yearLabel = version === "v3" ? "2026-27" : "2023-2024";

  // V4 is a task-oriented workspace with horizontal area navigation.
  // Its own shell frees the width needed for student tables and review documents.
  // shared v5 sheets link inside v4 (8 Oct 2026 audit)
  if (version === "v4") setCounselorBaseV4();
  if (version === "v4") return <CounselorFiltersContext.Provider value={{ gradeFilter, setGradeFilter, search, setSearch, statusFilter, setStatusFilter, planFilter, setPlanFilter, counselorFilter, setCounselorFilter, stepFilter, setStepFilter }}>
    <div className="marketing-v2 themeable relative" data-counselor-version="v4">
      {/* v5's ground, the same component (8 Oct 2026: "make it 1:1 v5's
         background"); the workspace sits above it */}
      <AppBackdrop />
      {/* v5's log sheet (walk-ins, booking, family, time), used by v4's Overview */}
      <LogSheetHost />
      <ExploreSheetHost />
      <div className="relative z-[1]">
      <Workspace active={active} items={menuForRole(account.role, version).map(i => ({view:i.view,label:i.label??VIEW_TITLES[i.view].title}))} org={leaderRole ? v4LeaderOrg.name : ""} areaSet={leaderRole ? LEADER_AREAS[leaderRole] : undefined} theme={theme} onTheme={toggleTheme} showTitle={showTitle}
        search={<GlobalSearch search={search} setSearch={setSearch} />}
        filters={leaderRole ? <LeaderControls role={leaderRole} /> : V4_INSIGHTS_VIEWS.has(active) ? <InsightsFilters /> : V3_GRADE_FILTER_VIEWS.has(active) && active !== "progress" ? <V4GradePicker gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} /> : null}
        account={<SidebarAccount account={{ name: account.name, school: orgLabel }} />}>
        {children}
      </Workspace>
      </div>
    </div>
  </CounselorFiltersContext.Provider>;

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
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full" data-counselor-version={version} style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {/* Desktop sidebar -- lg and up only. Below that, the same nav lives
           in the slide-out drawer, matching how the student app itself
           splits a persistent desktop rail from a mobile-triggered menu
           (see src/components/app/chrome.tsx's own lg: split). The
           reference this was built from had NO mobile handling at all (a
           permanently pinned sidebar crushing the page at phone width) --
           this is the deliberate fix, not something carried over. */}
        <aside className={`sticky top-0 hidden h-dvh flex-none flex-col border-r lg:flex w-[248px]`} style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
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
            <div className="relative flex h-dvh w-[280px] max-w-[calc(80vw/var(--vz,1))] flex-col border-r" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <div className="flex items-center justify-between border-b px-[var(--space-5)] py-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
                <Wordmark />
                <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-[10px] border-b px-[var(--space-4)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                {leaderRole ? <LeaderIdentity role={leaderRole} /> : (
                  <>
                    <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{orgLabel} · {yearLabel}</span>
                    {showGradeFilter && <GradeFilterSelect gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} />}
                  </>
                )}
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
              {leaderRole ? (
                <IconTip label="Data definitions"><DataDefinitionsButton role={leaderRole} iconOnly /></IconTip>
              ) : (<>
              {version === "v3" && (
                <IconTip label="Search">
                  <button type="button" aria-label="Search" aria-expanded={mobileSearch} onClick={() => setMobileSearch((o) => !o)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: mobileSearch ? "var(--primary)" : "var(--foreground)" }}>
                    <Search className="h-[18px] w-[18px]" aria-hidden />
                  </button>
                </IconTip>
              )}
              <IconTip label="Notifications">
                <button type="button" aria-label="Notifications" className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                  <Bell className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </IconTip>
              </>)}
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
          {version === "v3" && mobileSearch && (
            <div className="sticky top-[61px] z-10 border-b px-[var(--space-4)] py-[var(--space-3)] lg:hidden" style={{ background: "var(--background)", borderColor: "var(--glass-border)" }}>
              <GlobalSearch search={search} setSearch={setSearch} className="w-full" autoFocus />
            </div>
          )}

          {/* Desktop topbar -- full filters row, lg and up only. */}
          <header className="sticky top-0 z-10 hidden flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-3)] backdrop-blur-[10px] lg:flex" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--glass-border)" }}>
            {leaderRole ? <LeaderIdentity role={leaderRole} /> : (
            <div className="flex flex-wrap items-center gap-[10px]">
              {/* v3 (2 Oct 2026 redundancy pass): school and year are context,
                 not controls, so one muted text line instead of two bordered
                 pills that looked clickable and did nothing. */}
              {version === "v3" ? (
                <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{orgLabel} · {yearLabel}</span>
              ) : (<>
              <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{orgLabel}</span>
              <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{yearLabel}</span>
              </>)}
              {showGradeFilter && <GradeFilterSelect gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} />}
            </div>
            )}
            <div className="flex items-center gap-[10px]">
              {leaderRole && <DataDefinitionsButton role={leaderRole} />}
              {!leaderRole && (<>
              {version === "v3" ? <GlobalSearch search={search} setSearch={setSearch} /> : (
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
              )}
              <IconTip label="Notifications">
                <button type="button" aria-label="Notifications" className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                  <Bell className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </IconTip>
              </>)}
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
          <main className={`flex flex-1 justify-center px-[var(--space-4)] pb-[calc(var(--space-6)+68px)] sm:px-[var(--space-5)] sm:pb-[calc(var(--space-6)+36px)] md:px-[var(--space-8)] pt-[var(--space-4)]`}>
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
            <div className={`flex w-full flex-col gap-[var(--space-4)] [&>*]:shrink-0 max-w-[1400px]`}>
              {showTitle && (
                <div className="flex flex-col gap-[2px]">
                  <h1 className="text-[22px] leading-[1.15] font-extrabold sm:text-[26px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{(version !== "v1" && menuForRole(account.role, version).find((item) => item.view === (VIEW_HOME[active] ?? active))?.label) || title}</h1>
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
        {/* DEMO-ONLY: the v2 / v3 switch, back now that v3 is the research
           build (29 Sept 2026) and there is something to switch to. */}
        {V3_ENABLED && <CounselorVersionChip />}
      </div>
    </CounselorFiltersContext.Provider>
  );
}

export { HoverBeam };
