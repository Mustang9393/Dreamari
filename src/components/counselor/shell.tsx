"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid, Users, Target, ClipboardCheck, FileText, MessageSquare, Briefcase, Layers, Activity, Award, Settings as SettingsIcon,
  Search, Bell, LogOut, Menu, X,
} from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, signOutCounselor } from "@/lib/counselorAccount";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";

// The isolated shell for the Counselor Dashboard -- a genuinely separate
// product from the student app's own chrome (direct product decision: not a
// Profile tab, doesn't import DesktopNavigation/MobileNav from
// src/components/app/chrome.tsx). Its own sidebar, its own topbar, its own
// visual language on the same design tokens.

export type CounselorView =
  | "overview" | "students" | "milestones" | "review-queue" | "progress"
  | "connect" | "insights" | "productivity" | "engagement" | "impact" | "settings";

export const NAV_ITEMS: { view: CounselorView; label: string; icon: typeof LayoutGrid }[] = [
  { view: "overview", label: "Overview", icon: LayoutGrid },
  { view: "students", label: "Students", icon: Users },
  { view: "milestones", label: "Milestone Tracker", icon: Target },
  { view: "review-queue", label: "Review Queue", icon: ClipboardCheck },
  { view: "progress", label: "Student Progress", icon: FileText },
  { view: "connect", label: "Counselor Connect", icon: MessageSquare },
  { view: "insights", label: "Career + College Insights", icon: Briefcase },
  { view: "productivity", label: "Productivity Suite", icon: Layers },
  { view: "engagement", label: "Platform Engagement", icon: Activity },
  { view: "impact", label: "My Impact", icon: Award },
  { view: "settings", label: "Settings", icon: SettingsIcon },
];

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
};

export type GradeFilter = "All Grades" | 9 | 10 | 11 | 12;
const GRADE_OPTIONS: GradeFilter[] = ["All Grades", 9, 10, 11, 12];

type FiltersState = { gradeFilter: GradeFilter; setGradeFilter: (g: GradeFilter) => void; search: string; setSearch: (s: string) => void };
const CounselorFiltersContext = createContext<FiltersState>({ gradeFilter: "All Grades", setGradeFilter: () => {}, search: "", setSearch: () => {} });
export function useCounselorFilters(): FiltersState {
  return useContext(CounselorFiltersContext);
}

function SidebarNav({ active, onNavigate }: { active: CounselorView; onNavigate?: () => void }) {
  return (
    <nav aria-label="Counselor Dashboard" className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-[var(--space-3)] py-[var(--space-4)]">
      {NAV_ITEMS.map((item) => {
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

function SidebarAccount({ account, onSignOut }: { account: { name: string; school: string }; onSignOut: () => void }) {
  return (
    <div className="flex items-center gap-[10px] border-t px-[var(--space-4)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
      <span className="flex size-[34px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>
        {account.name ? account.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{account.name || "Counselor"}</span>
        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{account.school || DEMO_SCHOOL}</span>
      </span>
      <IconTip label="Sign out">
        <button type="button" aria-label="Sign out" onClick={onSignOut} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </IconTip>
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/counselor?view=overview" className="dm-link flex items-center gap-[10px]">
      <span className="flex size-[34px] flex-none items-center justify-center rounded-[var(--radius-md)] text-[15px] font-extrabold" style={{ background: "var(--primary)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}>D</span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Dreamari</span>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Command Center</span>
      </span>
    </Link>
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

export function CounselorShell({ active, children }: { active: CounselorView; children: React.ReactNode }) {
  const router = useRouter();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("All Grades");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { title, subtitle: subtitleRaw } = VIEW_TITLES[active];
  // Matches the reference's own copy exactly ("Welcome back, Sarah...") --
  // the counselor's first name, not a generic greeting. Falls back to the
  // unpersonalized line before an account name is set.
  const firstName = account.name.trim().split(/\s+/)[0];
  const subtitle = active === "overview" && firstName ? `Welcome back, ${firstName}. Here's your caseload at a glance.` : subtitleRaw;

  const doSignOut = () => {
    signOutCounselor();
    router.push("/counselor/login");
  };

  return (
    <CounselorFiltersContext.Provider value={{ gradeFilter, setGradeFilter, search, setSearch }}>
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
          <SidebarAccount account={account} onSignOut={doSignOut} />
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
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{DEMO_SCHOOL} · 2024–2025</span>
                <GradeFilterSelect gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} />
              </div>
              <SidebarNav active={active} onNavigate={() => setDrawerOpen(false)} />
              <SidebarAccount account={account} onSignOut={doSignOut} />
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
            <IconTip label="Notifications">
              <button type="button" aria-label="Notifications" className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
                <Bell className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </IconTip>
          </header>

          {/* Desktop topbar -- full filters row, lg and up only. */}
          <header className="sticky top-0 z-10 hidden flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-3)] backdrop-blur-[10px] lg:flex" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--glass-border)" }}>
            <div className="flex flex-wrap items-center gap-[10px]">
              <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{DEMO_SCHOOL}</span>
              <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>2024–2025</span>
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
            </div>
          </header>

          <main className="flex flex-1 justify-center px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-6)] sm:px-[var(--space-5)] md:px-[var(--space-8)]">
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
            <div className="flex w-full max-w-[1400px] flex-col gap-[var(--space-4)]">
              <div className="flex flex-col gap-[2px]">
                <h1 className="text-[22px] leading-[1.15] font-extrabold sm:text-[26px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>
                <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </CounselorFiltersContext.Provider>
  );
}

export { HoverBeam };
