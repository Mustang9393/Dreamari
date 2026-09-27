"use client";

// DEMO-ONLY: Component Lab, feature modules part -- Profile, Career and
// Colleges. See docs/handoff/COMPONENT_INVENTORY.md lines 279-301 (these
// three features) and 345-356 (the unsafe-to-render list). Cards already
// shown in Surfaces (CollegeCard, SchoolCard, CollegePicture, MarkBadge,
// CollegePlaceholder, PosterCard) are not repeated here -- see that section.

import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { SubHead, Specimen, StateGrid, StateCell, ProposedLoading, ProposedError, ProposedEmpty, EDGE, MONO, noop, Inert, LiveRoute } from "../../kit";

import { ALL_PROFILE_CAREERS, STUDENT } from "@/components/profile/data";
import {
  Top3Tab,
  OverviewTabV2,
  RoutesTab,
  RouteRow,
  CompareTable,
  SchoolsShelf,
  VideosShelf,
  LockerTab,
  ProfilePhoto,
} from "@/components/profile/ProfileExperience";
import { CareerReportDocument } from "@/components/profile/CareerReport";
import { Chip } from "@/components/profile/PreferencesTab";
import { SeasonScene } from "@/components/profile/SeasonScene";
import { EventStubs } from "@/components/profile/EventStubs";

import {
  Figure,
  Section as CareerDetailSection,
  DotList,
  TabComingSoon,
  Rung,
  PayRows,
  FactPopover,
  DegreeSheet,
} from "@/components/career/CareerDetailExperience";

import { COLLEGES, type Level, type Control, type Setting, type Admission, type Size } from "@/components/colleges/data";
import { BrowseShelves } from "@/components/colleges/BrowseShelves";
import { Menu, MenuItem, WhySheet } from "@/components/colleges/ForYouSchools";
import { FilterTray, CompareSheet } from "@/components/colleges/CollegesExperience";
import type { Route } from "@/components/colleges/pathway";

// ---------------------------------------------------------------------------
// Mock data. Real careers/colleges from each feature's own data file, never
// invented -- only ids/fields overridden for a specific edge case.

const IB = ALL_PROFILE_CAREERS.find((c) => c.id === "investment-banking")!;
const NURSE = ALL_PROFILE_CAREERS.find((c) => c.id === "registered-nurse")!;
const PILOT = ALL_PROFILE_CAREERS.find((c) => c.id === "airline-pilot")!;

const RUNG_WITH_DETAIL = {
  number: "1",
  jobTitle: "Junior Financial Analyst",
  pay: "$72K",
  description: "Builds financial models and preps materials for the senior bankers running live deals.",
  whatYouDo: ["Build financial models", "Prepare pitch decks", "Support live deals"],
  toGetHere: ["Bachelor's in finance or a related field", "A summer internship helps"],
};
const RUNG_NO_DETAIL = { number: "3", jobTitle: "Managing Director", pay: "$420K", description: "", whatYouDo: [], toGetHere: [] };

const PAY_ROWS = [
  { state: "California", pay: "$118K" },
  { state: "Texas", pay: "$96K" },
  { state: "New Jersey", pay: "$104K" },
];

const DEGREE_DETAIL = {
  doorAsksFor: "A bachelor's degree in finance, economics or a related field",
  experienceFirst: "An internship helps but isn't required to get an interview",
  trainingAfterHiring: "6 to 8 weeks of formal analyst training before live deals",
  note: "Most banks train new analysts the same way regardless of undergraduate major.",
  noBachelorPct: "4%",
  distribution: [
    { label: "Bachelor's degree", pct: 78 },
    { label: "Master's degree", pct: 18 },
    { label: "No degree", pct: 4 },
  ],
};

const SAMPLE_ROUTE: Route = { id: "lab-route", institution: "4-year", label: "Bachelor's degree", time: "4 yrs", program: "Nursing", common: true };

// ---------------------------------------------------------------------------
// Small local helpers: an "open, with a real close path" wrapper for the
// portalled sheets/popovers below (mirrors kit's Reveal, but hands the
// portalled child its own onClose instead of only toggling a label).

function Overlay({ label, closeLabel = "Close", children }: { label: string; closeLabel?: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-[var(--space-3)]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[6px] text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
        {open ? closeLabel : label}
      </button>
      {open && children(() => setOpen(false))}
    </div>
  );
}

function RungDemo({ rung, startOpen }: { rung: typeof RUNG_WITH_DETAIL; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <ul className="m-0 list-none p-0">
      <Rung rung={rung} accent="var(--primary)" open={open} onToggle={() => setOpen((o) => !o)} />
    </ul>
  );
}

function FactPopoverDemo() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-center">
      <button
        ref={setAnchor}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
      >
        <Info className="h-3.5 w-3.5" aria-hidden /> Pay band (i)
      </button>
      {open && (
        <FactPopover anchor={anchor} onClose={() => setOpen(false)}>
          <p className="text-[15px] leading-[21px] font-semibold">Typical: $85K to $140K. Top decile clears $220K within five years.</p>
        </FactPopover>
      )}
    </div>
  );
}

function DegreeSheetDemo() {
  return (
    <Overlay label="Open sheet">
      {(close) => <DegreeSheet career="Investment Banking" detail={DEGREE_DETAIL} onClose={close} />}
    </Overlay>
  );
}

function MenuDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Menu label="Nursing" sub="Bachelor's degree" open={open} onToggle={() => setOpen((o) => !o)} big>
      <MenuItem label="Bachelor's degree" sub="4 yrs" on onClick={noop} />
      <MenuItem label="Start at a 2-year college" sub="2 + 2 yrs" on={false} onClick={noop} />
    </Menu>
  );
}

function WhySheetDemo() {
  return (
    <Overlay label="Open Why these schools?">
      {(close) => <WhySheet onClose={close} onEdit={noop} career="Registered Nurse" route={SAMPLE_ROUTE} program="Nursing" gpaLabel="3.7" place="New Jersey" />}
    </Overlay>
  );
}

function FilterTrayDemo() {
  const initial = {
    states: new Set<string>(),
    levels: new Set<Level>(),
    controls: new Set<Control>(),
    sizes: new Set<Size>(),
    settings: new Set<Setting>(),
    admissions: new Set<Admission>(),
    costCap: null as number | null,
    also: new Set<"tribal" | "religious" | "forProfit">(),
    savedOnly: false,
  };
  const [filters, setFilters] = useState(initial);
  return (
    <Overlay label="Open filters">
      {(close) => (
        <FilterTray
          filters={filters}
          set={(p) => setFilters((f) => ({ ...f, ...p }))}
          count={COLLEGES.length}
          onClose={close}
          onClear={() => setFilters(initial)}
        />
      )}
    </Overlay>
  );
}

function CompareSheetDemo() {
  return <Overlay label="Open compare">{(close) => <CompareSheet colleges={COLLEGES.slice(0, 2)} onClose={close} />}</Overlay>;
}

export function ProfileCareerCollegesModules() {
  return (
    <>
      <SubHead>Profile</SubHead>
      <p className="max-w-[72ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        Cards already shown in Surfaces (<code style={MONO}>PosterCard</code>, <code style={MONO}>CollegeCard</code>, <code style={MONO}>SchoolCard</code>, <code style={MONO}>CollegePicture</code>, <code style={MONO}>MarkBadge</code>, <code style={MONO}>CollegePlaceholder</code>) are not repeated below.
      </p>

      <Specimen name="Top3Tab" file="src/components/profile/ProfileExperience.tsx" purpose="My Top 3's card grid: one career per card, per-card facts and actions, and the primary pick's own star and world accent." when="Profile's Top 3 tab.">
        <StateGrid min={320}>
          <StateCell label="Empty" minH={220}>
            <Top3Tab top3={[]} focusId={null} primaryChosen={false} setFocusId={noop} chosenRoute={(c) => c.routes[0]} onAdd={noop} onRemove={noop} onOpenCompare={noop} onGoReport={noop} showTour={false} onTourDone={noop} />
          </StateCell>
          <StateCell label="Primary + 2 more" minH={560} pad={false} note="The kebab menu, and the compare/report links, are all no-op here.">
            <Top3Tab top3={[IB.id, NURSE.id, PILOT.id]} focusId={IB.id} primaryChosen setFocusId={noop} chosenRoute={(c) => c.routes[0]} onAdd={noop} onRemove={noop} onOpenCompare={noop} onGoReport={noop} showTour={false} onTourDone={noop} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="OverviewTabV2" file="src/components/profile/ProfileExperience.tsx" purpose="Overview's dashboard: Top Three and Plan as ratio bars, Report and Resume as a quiet two-up strip below." when="Profile's default landing tab.">
        <StateGrid min={320}>
          <StateCell label="Nothing saved yet (NothingSavedYet)" minH={220}>
            <OverviewTabV2 focus={null} top3Careers={[]} onGoTop3={noop} onGoPlan={noop} onGoReport={noop} onGoResume={noop} onGoLocker={noop} seasonOverride={null} tourStep={null} onTourNext={noop} />
          </StateCell>
          <StateCell label="With a primary career" minH={340} pad={false}>
            <OverviewTabV2 focus={IB} top3Careers={[IB, NURSE]} onGoTop3={noop} onGoPlan={noop} onGoReport={noop} onGoResume={noop} onGoLocker={noop} seasonOverride="fall" tourStep={null} onTourNext={noop} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RoutesTab, PathTab" file="src/components/profile/ProfileExperience.tsx" purpose="Paths into a career: a card per route (school, duration, cost, pay, debt payoff), a Compare view, and the majors that fit." when="Profile's Routes tab, once a career is focused.">
        <StateGrid min={300}>
          <StateCell label="With a focus career" minH={420} pad={false}>
            <RoutesTab focus={IB} chosenRoute={(c) => c.routes[0]} setRouteChoice={() => {}} savedMajors={new Set()} onToggleMajor={noop} onGoPlan={noop} />
          </StateCell>
          <StateCell label="No focus" note="Built 27 Sept 2026: RoutesTab used to return null with no focus (a blank tab body); now a real empty tier 2 with a CTA back to Top 3.">
            <RoutesTab focus={null} chosenRoute={(c) => c.routes[0]} setRouteChoice={() => {}} savedMajors={new Set()} onToggleMajor={noop} onGoPlan={noop} onGoTop3={noop} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RouteRow, CompareTable" file="src/components/profile/ProfileExperience.tsx" purpose="One route card inside Routes' card view, and the pinned-first-column table for its Compare view." when="Inside RoutesTab / PathTab.">
        <StateGrid min={260}>
          <StateCell label="RouteRow, unselected"><RouteRow route={IB.routes[1]} selected={false} onOpen={noop} onSelect={noop} /></StateCell>
          <StateCell label="RouteRow, selected + recommended"><RouteRow route={IB.routes[1]} selected onOpen={noop} onSelect={noop} /></StateCell>
          <StateCell label="RouteRow, hover / focus" note="Hover or Tab to it to see the state."><RouteRow route={IB.routes[1]} selected={false} onOpen={noop} onSelect={noop} /></StateCell>
          <StateCell label="CompareTable" pad={false} minH={220}><CompareTable routes={IB.routes} selectedId={IB.routes[0].id} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LockerTab" file="src/components/profile/ProfileExperience.tsx" purpose="Saved: four tabbed shelves (careers, schools, videos, event stubs)." when="Profile's Saved (Locker) overlay.">
        <StateGrid min={320}>
          <StateCell
            label="Careers shelf, nothing saved (dashed empty)"
            minH={220}
            pad={false}
            note="Reads the real saved-careers/colleges/videos stores (safe, read-only in this empty state). If this browser already has saved schools, careers or videos, switching shelves would show their real save/unsave buttons, which do write on click."
          >
            <Inert><LockerTab locker={[]} top3Count={0} addToTop3={noop} onClose={noop} /></Inert>
          </StateCell>
          <StateCell
            label="Careers shelf, populated (many)"
            minH={220}
            pad={false}
            note="Inert: the real unsave/add-to-Top-3 controls on each card write on click."
          >
            <Inert><LockerTab locker={[IB, NURSE, PILOT]} top3Count={1} addToTop3={noop} onClose={noop} /></Inert>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SchoolsShelf, VideosShelf" file="src/components/profile/ProfileExperience.tsx" purpose="Locker's Schools and Videos shelves, each with the same dashed-border empty treatment." when="Inside LockerTab.">
        <StateGrid min={260}>
          <StateCell label="SchoolsShelf, nothing saved" note="Reads the real saved-colleges store; safe as long as nothing is saved yet.">
            <Inert><SchoolsShelf /></Inert>
          </StateCell>
          <StateCell label="VideosShelf, nothing saved" note="Reads the real saved-videos store; safe as long as nothing is saved yet.">
            <Inert><VideosShelf /></Inert>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ProfilePhoto" file="src/components/profile/ProfileExperience.tsx" purpose="A career poster photo with its own onError fallback: a world-tinted gradient with a muted icon." when="Every career photo on Profile: Top 3, Locker.">
        <StateGrid min={200}>
          <StateCell label="Default" pad={false} minH={160}><div className="relative h-[160px] w-full"><ProfilePhoto career={IB} sizes="220px" className="object-cover" /></div></StateCell>
          <StateCell label="Image failure" pad={false} minH={160} note="Built-in onError fallback, tinted to the career's world."><div className="relative h-[160px] w-full"><ProfilePhoto career={{ ...IB, photo: EDGE.brokenImage }} sizes="220px" className="object-cover" /></div></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CareerReportDocument" file="src/components/profile/CareerReport.tsx" purpose="The Career Report, standalone: no rail, no toolbar, no export preview. The same document ProfileExperience shows and the printer prints." when="The Report Chooser (three side by side) and Profile's own Report tab.">
        <StateGrid min={360}>
          <StateCell label="Default" pad={false} minH={420}>
            <div className="dm-scroll max-h-[480px] overflow-y-auto"><CareerReportDocument student={STUDENT} career={IB} idPrefix="lab-report" /></div>
          </StateCell>
          <StateCell label="No report for this career" note="Built 27 Sept 2026: used to return null when reportV2(career.id) had nothing (a silent gap in the Report Chooser's row); now a real empty tier 4.">
            <CareerReportDocument student={STUDENT} career={{ ...IB, id: "unlisted-career" }} idPrefix="lab-report-empty" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Chip" file="src/components/profile/PreferencesTab.tsx" purpose="A single pick inside a Preferences section (interests, subjects...): on, off, or dimmed once its group is at cap." when="PreferencesTab's multi-select groups.">
        <StateGrid min={140}>
          <StateCell label="Off"><Chip on={false} onClick={noop}>Business</Chip></StateCell>
          <StateCell label="On"><Chip on onClick={noop}>Business</Chip></StateCell>
          <StateCell label="Dim, group at cap"><Chip on={false} dim onClick={noop}>Business</Chip></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PreferencesTab" file="src/components/profile/PreferencesTab.tsx" purpose="Interests, subjects and school info a student sets once and reuses across Build, Match and Schools." when="Profile's Preferences tab.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/profile?tab=preferences" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SeasonScene" file="src/components/profile/SeasonScene.tsx" purpose="The seasonal wash behind My Plan's current-term tile: leaves, snow or blossom, tinted to the season." when="Overview's My Plan tile.">
        <StateGrid min={160}>
          <StateCell label="Fall" pad={false} minH={120}><SeasonScene seasonId="fall" /></StateCell>
          <StateCell label="Winter" pad={false} minH={120}><SeasonScene seasonId="winter" /></StateCell>
          <StateCell label="Spring" pad={false} minH={120}><SeasonScene seasonId="spring" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="EventStubs" file="src/components/profile/EventStubs.tsx" purpose="Torn-ticket stubs for events a student attended, opening that event's board." when="Locker's Event Stubs shelf.">
        <StateGrid min={220}>
          <StateCell
            label="Default"
            pad={false}
            minH={300}
            note={'This data set has exactly one Active follow-up event, so this is the only state reachable without props. The built empty branch (dashed border, "No stubs yet", See events) only shows with zero attended events.'}
          >
            <EventStubs />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CareerExplorationBody" file="src/components/profile/CareerExploration.tsx" purpose="A career's logged experiences: job shadows, projects, conversations." when="Profile's per-career exploration log.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/profile" device="desktop" height={380} />
          </StateCell>
          <StateCell label="Empty (described)" note="Already built (real copy, standing in here since the live component writes on interaction): 'Nothing added yet -- log a job shadow, project, or conversation.'">
            <ProposedEmpty tier={3} line="Nothing added yet, log a job shadow, project, or conversation." />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ReflectionCard" file="src/components/profile/CareerReport.tsx" purpose="A short student reflection attached to the report, saved locally." when="Career Report's own tab.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/career-report" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CareerReportView" file="src/components/profile/CareerReport.tsx" purpose="The full Report surface: tabs for Report, Share, Counselor Review, Download and History, wrapping CareerReportDocument." when="Profile's Report tab.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/career-report" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MyPlanTab, GradePlanCard" file="src/components/profile/ProfileExperience.tsx" purpose="The grade-by-grade Fall/Winter/Spring plan for a student's #1 career." when="Profile's Plan tab.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/profile" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SettingsView" file="src/components/profile/ProfileExperience.tsx" purpose="Account, privacy and danger-zone settings, prototype stubs." when="Profile's Settings section.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/profile" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <SubHead>Career</SubHead>

      <Specimen name="CareerDetailExperience" file="src/components/career/CareerDetailExperience.tsx" purpose="A full career's page: hero, quick facts, pay by state, the career ladder, and folded sections below it." when="Every /career/[slug] page.">
        <StateGrid min={260}>
          <StateCell label="Live page" note="A full page: its own header chrome, router-bound CTAs, and real Top3/save writes on interaction, so it loads here rather than mounting inline. Its pieces (Figure, Section, DotList, Rung, PayRows, TabComingSoon, FactPopover, DegreeSheet) render individually below.">
            <LiveRoute href="/career/software-engineer" />
          </StateCell>
          <StateCell
            label="Thin career"
            kind="built"
            note={'A catalog-only career with no full profile falls back to the literal PLACEHOLDER = "Coming soon" string per fact, not a page-wide empty state (already catalogued as States gallery row 9, emptyTier 6). TabComingSoon, below, is the componentised version of the same idea for a whole folded section.'}
          >
            <ProposedEmpty tier={6} />
          </StateCell>
          <StateCell label="Not found (404)" note="Built 27 Sept 2026: a removed career or an out-of-date link now renders the real NotFoundView, live at this URL.">
            <LiveRoute href="/career/this-career-does-not-exist" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Figure, Section, DotList" file="src/components/career/CareerDetailExperience.tsx" purpose="Shared career-page pieces: Figure (an accent-gradient number/stat), Section (a titled block), DotList (an accented one-line-per-item list)." when="Every fact, stat and short list on Career Detail and College Detail.">
        <StateGrid min={220}>
          <StateCell label="Figure"><Figure accent="var(--primary)">$118K</Figure></StateCell>
          <StateCell label="Section" pad={false}>
            <CareerDetailSection title="What you do">
              <p className="p-[var(--space-4)] text-[15px] leading-[22px]">Builds financial models and preps materials for senior bankers running live deals.</p>
            </CareerDetailSection>
          </StateCell>
          <StateCell label="DotList"><DotList items={["Analytical thinking", "Attention to detail", "Communication"]} accent="var(--primary)" /></StateCell>
          <StateCell label="DotList, empty" note="Falls back to 'Not written up yet.' once every item is blank."><DotList items={["", "  "]} accent="var(--primary)" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Rung" file="src/components/career/CareerDetailExperience.tsx" purpose="One row of the career ladder: number, title, pay, and an expandable what-you-do / what-you-need pair." when="Career Detail's career ladder.">
        <StateGrid min={280}>
          <StateCell label="Collapsed" pad={false}><RungDemo rung={RUNG_WITH_DETAIL} startOpen={false} /></StateCell>
          <StateCell label="Expanded" pad={false}><RungDemo rung={RUNG_WITH_DETAIL} startOpen /></StateCell>
          <StateCell label="No detail" pad={false} note="No description or lists: renders with no chevron and isn't tappable."><RungDemo rung={RUNG_NO_DETAIL} startOpen={false} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PayRows" file="src/components/career/CareerDetailExperience.tsx" purpose="Pay by state, as plain rows (state, then a figure), no chart." when="Career Detail's Pay by state section.">
        <StateGrid min={220}>
          <StateCell label="Default"><PayRows rows={PAY_ROWS} accent="var(--primary)" /></StateCell>
          <StateCell label="Empty" note="Falls back to 'Pay data coming soon.'"><PayRows rows={[]} accent="var(--primary)" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TabComingSoon" file="src/components/career/CareerDetailExperience.tsx" purpose="A folded section with nothing written up yet for this career." when="Any Career Detail section a career's profile hasn't authored.">
        <StateGrid min={260}>
          <StateCell label="Default"><TabComingSoon title="Day in the life" career="this career" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FactPopover" file="src/components/career/CareerDetailExperience.tsx" purpose="A small portalled popover explaining a quick fact (pay bands, what 'openings' counts), anchored to its (i) icon." when="Career Detail's quick facts row.">
        <StateGrid min={220}>
          <StateCell label="Open it" note="Portalled to document.body, positioned from the anchor's own rect; closes on Escape or an outside tap.">
            <FactPopoverDemo />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DegreeSheet" file="src/components/career/CareerDetailExperience.tsx" purpose="What the degree fact's (i) opens: the three door questions, a note, and how people in the job actually got there, as a distribution." when="Career Detail's Degree quick fact.">
        <StateGrid min={260}>
          <StateCell label="Open it" note="Portalled to document.body; closes on Escape or the X.">
            <DegreeSheetDemo />
          </StateCell>
        </StateGrid>
      </Specimen>

      <p className="max-w-[72ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        PayMap is shown in the Charts section. Top3SwapModal is shown in Overlays.
      </p>

      <SubHead>Colleges</SubHead>

      <Specimen name="BrowseShelves" file="src/components/colleges/BrowseShelves.tsx" purpose="Browse all, at rest: schools grouped into shelves by the question a student is actually asking (near you, lower cost, your programme...)." when="Explore Schools > Browse all, with no search or filters.">
        <StateGrid min={320}>
          <StateCell label="Default" pad={false} minH={280} note="Reads the picks and student-profile stores (read-only here); onSave/onCompare are no-ops.">
            <BrowseShelves saved={new Set()} onSave={noop} compare={[]} onCompare={noop} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ForYouSchools" file="src/components/colleges/ForYouSchools.tsx" purpose="For you: schools matched to the student's #1 career, route and GPA, with Target/Safety/Reach bands." when="Explore Schools' default view.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/colleges" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Menu, WhySheet" file="src/components/colleges/ForYouSchools.tsx" purpose="The breadcrumb's text dropdowns (career / route / GPA), and the sheet explaining how the For You list was built." when="ForYouSchools' own breadcrumb and its 'Why these schools?' link.">
        <StateGrid min={220}>
          <StateCell label="Menu, open"><MenuDemo /></StateCell>
          <StateCell label="WhySheet" note="Portalled to document.body; closes on Escape, the X, or an outside tap.">
            <WhySheetDemo />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FilterTray, CompareSheet" file="src/components/colleges/CollegesExperience.tsx" purpose="Browse's filter drawer and the side-by-side compare sheet for schools flagged to compare." when="Explore Schools' filter chip and Compare action.">
        <StateGrid min={260}>
          <StateCell label="FilterTray" note="Portalled to document.body; local filter state here, no real store touched.">
            <FilterTrayDemo />
          </StateCell>
          <StateCell label="CompareSheet, 2 schools">
            <CompareSheetDemo />
          </StateCell>
          <StateCell label="CompareSheet, empty" note="Built 27 Sept 2026: the compare bar's own button needs 2 picks to open this, but the sheet now defends itself with a real empty tier 3 instead of a blank table.">
            <Overlay label="Open compare">{(close) => <CompareSheet colleges={[]} onClose={close} />}</Overlay>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="College grid, detail" file="src/components/colleges/CollegesExperience.tsx, CollegeDetailExperience.tsx" purpose="Search/filter with no matches, and College Detail pointed at a school that doesn't exist." when="Explore Schools' grid, and every /colleges/[slug] page.">
        <StateGrid min={240}>
          <StateCell label="Grid, no matches" note="Built 27 Sept 2026: names every active quick pick, tray filter and search term, with a real Clear filters action.">
            <ProposedEmpty tier={5} query="in-state, under $15K a year, 4-year schools" line="Try a shorter name, a city, or clear a filter." cta="Clear filters" />
          </StateCell>
          <StateCell label="Detail, loading" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL."><ProposedLoading label="Loading this school" shape="cards" /></StateCell>
          <StateCell label="Detail, error" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL."><ProposedError verb="load this school" fallback="try Browse all" /></StateCell>
          <StateCell label="Detail, not found (404)" note="Built 27 Sept 2026: an unknown school id now renders the real NotFoundView, live at this URL."><LiveRoute href="/colleges/this-school-does-not-exist" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
