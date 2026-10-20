"use client";

// DEMO-ONLY: Component Lab, feature modules part -- Profile, Career and
// Colleges. See docs/handoff/COMPONENT_INVENTORY.md lines 279-301 (these
// three features) and 345-356 (the unsafe-to-render list). Cards already
// shown in Surfaces (CollegeCard, SchoolCard, CollegePicture, MarkBadge,
// CollegePlaceholder, PosterCard) are not repeated here -- see that section.

import { useState, type ReactNode } from "react";
import { Briefcase, GraduationCap, Info } from "lucide-react";
import { FacePhoto } from "@/components/app/FacePhoto";
import { AboutMeTab, CollegeGoalView, EmptyGoalCard, GoalCard, GoalSchoolPicture, HallArt, NextStepRow, type CollegeGoal, type Top3Goal } from "@/components/profile/AboutMeTab";
import { CollegeGoalPicker } from "@/components/profile/CollegeGoalPicker";
import { BuildModal } from "@/components/profile/PreferencesTab";
import { BookCounselorSheet } from "@/components/profile/BookCounselorSheet";
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

import { COLLEGES, collegeImage, type College, type Level, type Control, type Setting, type Admission, type Size } from "@/components/colleges/data";
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

// About Me fixtures: schools with real photos, spread over the three lists
const PHOTO_SCHOOLS: College[] = COLLEGES.filter((c) => collegeImage(c)).slice(0, 5);
const NO_PHOTO_SCHOOL: College | undefined = COLLEGES.find((c) => !collegeImage(c));
const goalOf = (schools: College[], top: College | null): CollegeGoal => ({
  schools: schools.map((c, i) => ({ c, bucket: (["reach", "target", "likely"] as const)[i % 3] })),
  top, setTop: noop, move: noop,
});

/** The goal card the moment a goal is set, replayable: the picture comes into focus. */
function FocusInDemo() {
  const [n, setN] = useState(0);
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <GoalCard key={n} kind="Career Goal" Icon={Briefcase} title={IB.title} picture={<FacePhoto src={IB.photo} sizes="360px" className="object-cover" fallback={IB.photoFocus ?? "50% 30%"} />} onOpen={noop} openLabel="Open Career Goal" focusIn />
      <button type="button" onClick={() => setN((x) => x + 1)} className="dm-quiet w-fit cursor-pointer rounded-[var(--radius-md)] px-[10px] py-[6px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>Replay</button>
    </div>
  );
}

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

/** Top 3 with real ordering, remove and Undo, the way Profile wires it. */
function Top3Live({ start, removedAt, goal }: { start: string[]; removedAt?: number; goal?: Top3Goal }) {
  const [state, setState] = useState(() => {
    if (removedAt === undefined) return { ids: start, undo: null as null | { ids: string[]; id: string } };
    return { ids: start.filter((_, i) => i !== removedAt), undo: { ids: start, id: start[removedAt] } };
  });
  const removed = state.undo ? { id: state.undo.id, title: ALL_PROFILE_CAREERS.find((c) => c.id === state.undo!.id)?.title ?? "Career", index: state.undo.ids.indexOf(state.undo.id) } : null;
  return (
    <Top3Tab
      goal={goal}
      top3={state.ids} focusId={state.ids[0] ?? null} primaryChosen setFocusId={noop} chosenRoute={(c) => c.routes[0]}
      onAdd={noop}
      onRemove={(id) => setState((s) => ({ ids: s.ids.filter((x) => x !== id), undo: { ids: s.ids, id } }))}
      onReorder={(ids) => setState({ ids, undo: null })}
      removed={removed}
      onUndo={() => setState((s) => (s.undo ? { ids: s.undo.ids, undo: null } : s))}
      onDismissUndo={noop}
     
      onOpenCompare={noop} onGoReport={noop} showTour={false} onTourDone={noop}
    />
  );
}

export function ProfileCareerCollegesModules() {
  return (
    <>
      <SubHead>Profile</SubHead>
      <p className="max-w-[72ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        Cards already shown in Surfaces (<code style={MONO}>PosterCard</code>, <code style={MONO}>CollegeCard</code>, <code style={MONO}>SchoolCard</code>, <code style={MONO}>CollegePicture</code>, <code style={MONO}>MarkBadge</code>, <code style={MONO}>CollegePlaceholder</code>) are not repeated below.
      </p>

      <Specimen name="Top3Tab" file="src/components/profile/ProfileExperience.tsx" purpose="My Top 3's card grid: position is rank, with a rank pill (arrows move a card one place), a visible remove, an inline Undo slot, and first-visit control nudges that play in turn: Move to #1, Remove from Top 3, Add more from Explore. Report is always a worded button, and Compare all 3 a quiet outlined one." when="Profile's Top 3 tab (v1); inside About Me's Career Goal (v2).">
        <StateGrid min={320}>
          <StateCell label="Empty" minH={220}>
            <Top3Tab top3={[]} focusId={null} primaryChosen={false} setFocusId={noop} chosenRoute={(c) => c.routes[0]} onAdd={noop} onRemove={noop} onReorder={noop} removed={null} onUndo={noop} onDismissUndo={noop} onOpenCompare={noop} onGoReport={noop} showTour={false} onTourDone={noop} />
          </StateCell>
          <StateCell label="Ranked 3 (live: arrows reorder, X removes)" minH={560} pad={false} note="Position is rank; #1 wears the star and leads Report and Plan. Compare and report links are no-op here.">
            <Top3Live start={[IB.id, NURSE.id, PILOT.id]} />
          </StateCell>
          <StateCell label="Just removed (Undo in its slot)" minH={560} pad={false} note="No confirm dialog: the freed slot offers Undo where the card was.">
            <Top3Live start={[IB.id, NURSE.id, PILOT.id]} removedAt={1} />
          </StateCell>
          <StateCell label="Career Goal mode (v2)" minH={560} pad={false} note="Shows with the v2 Profile on. The goal is chosen in the ranking itself: every card says Make my goal, which moves it to #1 and sets the goal (Chandu: 'keep the making a career the primary within the ranking activity itself').">
            <Top3Live start={[IB.id, NURSE.id, PILOT.id]} goal={{ set: false, onChoose: noop }} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="AboutMeTab" file="src/components/profile/AboutMeTab.tsx" purpose="My Profile's landing tab: My Goals (Career Goal, College Goal), My Build, and in v2 the guided path: Career Goal, then College Goal, then My Plan, each goal paying +25 XP (Chandu, 19 Oct 2026: 'lets make about me the way to guide students first')." when="Every Profile visit; v2 also replaces the Top 3 tab (its cards live inside Career Goal) and takes Match's arrival.">
        <StateGrid min={360}>
          <StateCell label="v1" minH={520} note="Goal cards with the picked #1 and the starred school, then My Build on Build's sky.">
            <AboutMeTab top3={[IB, NURSE, PILOT]} primary={IB} saved={[]} onAddToTop3={noop} onGoTab={noop} onOpenBuild={noop} />
          </StateCell>
          <StateCell label="v2, live" minH={520} note="Reads this visit's real state: a Career Goal counts once chosen on the ranking cards, a College Goal is the starred #1 school. A reload starts the demo empty again.">
            <AboutMeTab top3={[IB, NURSE, PILOT]} primary={null} saved={[]} onAddToTop3={noop} onGoTab={noop} onOpenBuild={noop} v2={{ renderTop3: (goal) => <Top3Live start={[IB.id, NURSE.id, PILOT.id]} goal={goal} />, onConfirmPrimary: noop }} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="GoalCard, EmptyGoalCard, NextStepRow" file="src/components/profile/AboutMeTab.tsx" purpose="About Me's goal cards. Empty, a goal is out of focus until chosen: the likeliest career's photo blurred, or for schools the fallback hall art kept whole (HallArt). The step to take now glows and carries a 'Start here' or 'Next step' badge. Set, the picture comes into focus. After the Career Goal, a row leads to My Plan." when="About Me's My Goals, v1 and v2 (the badges, XP and focus-in are v2).">
        <StateGrid min={300}>
          <StateCell label="Career, before a goal" minH={300} pad={false} note="Match's arrival lands here: the card glows with 'Start here' until the goal is chosen.">
            <EmptyGoalCard kind="Career Goal" Icon={Briefcase} title="Choose your career goal" backdrop={<FacePhoto src={IB.photo} sizes="360px" className="object-cover" fallback={IB.photoFocus ?? "50% 30%"} />} xp={25} nudge badge="Start here" onOpen={noop} openLabel="Open Career Goal" />
          </StateCell>
          <StateCell label="College, waiting its turn" minH={300} pad={false} note="One ask at a time: dimmed, no badge, until the Career Goal is set.">
            <EmptyGoalCard kind="College Goal" Icon={GraduationCap} title="Choose your college goal" backdrop={null} art={<HallArt />} xp={25} nudge={false} quiet onOpen={noop} openLabel="Open College Goal" />
          </StateCell>
          <StateCell label="College, next step" minH={300} pad={false} note="Opens the College Goal picker (CollegeGoalPicker), not Explore.">
            <EmptyGoalCard kind="College Goal" Icon={GraduationCap} title="Choose your college goal" backdrop={null} art={<HallArt />} xp={25} nudge badge="Next step" onOpen={noop} openLabel="Open College Goal" />
          </StateCell>
          <StateCell label="Career Goal set" minH={300} pad={false}>
            <GoalCard kind="Career Goal" Icon={Briefcase} title={IB.title} picture={<FacePhoto src={IB.photo} sizes="360px" className="object-cover" fallback={IB.photoFocus ?? "50% 30%"} />} onOpen={noop} openLabel="Open Career Goal" />
          </StateCell>
          {PHOTO_SCHOOLS[0] && (
            <StateCell label="College Goal set" minH={300} pad={false}>
              <GoalCard kind="College Goal" Icon={GraduationCap} title={PHOTO_SCHOOLS[0].name} picture={<GoalSchoolPicture c={PHOTO_SCHOOLS[0]} sizes="360px" />} onOpen={noop} openLabel="Open College Goal" />
            </StateCell>
          )}
          {NO_PHOTO_SCHOOL && (
            <StateCell label="College Goal set, no photo" minH={300} pad={false} note="The hall art, square at full height with feathered sides, so a wide card never crops the dome.">
              <GoalCard kind="College Goal" Icon={GraduationCap} title={NO_PHOTO_SCHOOL.name} picture={<GoalSchoolPicture c={NO_PHOTO_SCHOOL} sizes="360px" />} onOpen={noop} openLabel="Open College Goal" />
            </StateCell>
          )}
          <StateCell label="Just set (focus-in)" minH={340} pad={false} note=".dm-goal-focus-in: the picture sharpens once, 1.1s.">
            <FocusInDemo />
          </StateCell>
          <StateCell label="Next step row" minH={160}>
            <div className="flex w-full flex-col gap-[var(--space-3)]">
              <NextStepRow title="Keep exploring" sub="Find more careers and schools" nudge={false} links={[{ label: "Careers", href: "/explore" }, { label: "Schools", href: "/colleges" }]} />
              <NextStepRow title="Keep exploring" sub="Find more careers and schools" nudge links={[{ label: "Careers", href: "/explore" }, { label: "Schools", href: "/colleges" }]} />
            </div>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CollegeGoalView, My schools" file="src/components/profile/AboutMeTab.tsx" purpose="College Goal: the #1 school as a hero (or the hall art while there is none), then My schools in My Build's finish: one panel on Build's sky, Reach / Target / Likely as hairline-split columns at desktop and a switch below it. The star makes a school the #1 and, in v2, the College Goal. Control nudges teach the star and Move once." when="About Me's College Goal, and v2's Saved > Schools (embedded).">
        <StateGrid min={360}>
          <StateCell label="No schools yet" minH={280}>
            <CollegeGoalView goal={goalOf([], null)} onBack={noop} />
          </StateCell>
          <StateCell label="No #1 yet" minH={560} note="The star goes first in the nudge, and the first star keeps a soft glow after it.">
            <CollegeGoalView goal={goalOf(PHOTO_SCHOOLS, null)} onBack={noop} />
          </StateCell>
          {PHOTO_SCHOOLS[1] && (
            <StateCell label="Goal set (v2)" minH={560} note="'My College Goal' with the next step, My Plan.">
              <CollegeGoalView goal={goalOf(PHOTO_SCHOOLS, PHOTO_SCHOOLS[1])} onBack={noop} goalNext={noop} />
            </StateCell>
          )}
        </StateGrid>
      </Specimen>

      <Specimen name="CollegeGoalPicker" file="src/components/profile/CollegeGoalPicker.tsx" purpose="Choosing a College Goal from the schools that fit, in Edit My Build's sheet: the Career Goal's For you lists (saved first, then Target, Reach, Likely) as Explore's own school cards. A card opens the school's whole page in the same sheet with Back and 'Choose this school' (Chandu, 19 Oct 2026: 'open a large modal like the build one and show the recommended (for you) colleges')." when="v2 About Me: tapping the empty College Goal card.">
        <StateGrid min={240}>
          <StateCell label="Open (live)" minH={100} note="Lists, a card's page, Back, and Choose all work; Choose here just closes.">
            <Overlay label="Open the picker">{(close) => <CollegeGoalPicker careerIds={[IB.id]} saved={PHOTO_SCHOOLS.slice(0, 2)} onPick={() => close()} onClose={close} />}</Overlay>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BuildModal (Edit My Build)" file="src/components/profile/PreferencesTab.tsx" purpose="Edit My Build: every Build answer plus the old Preferences fields (skills, software, school, internships and jobs, team size, environment), sections down the side, one Save. About Me's My Build rows open it on their own section." when="About Me's My Build, and the gear menu.">
        <StateGrid min={240}>
          <StateCell label="Open (live)" minH={100}>
            <Overlay label="Open Edit My Build">{(close) => <BuildModal onClose={close} />}</Overlay>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BookCounselorSheet" file="src/components/profile/BookCounselorSheet.tsx" purpose="Book a meeting with your counselor, from a My Plan step." when="v2 My Plan's counselor step, once the Career Report is shared.">
        <StateGrid min={240}>
          <StateCell label="Open (live)" minH={100}>
            <Overlay label="Open booking">{(close) => <BookCounselorSheet onClose={close} />}</Overlay>
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

      <Specimen name="OutlookTab (Pay & Outlook) and PaySheet" file="src/components/career/OutlookTab.tsx" purpose="Career Detail's Pay tab as 'Pay & Outlook' (live since 20 Oct 2026). The approved pay by state map, then outlook by state for the chosen state (growth and openings, each against the US) and the top states. One tab, not a sixth 'Job Outlook' tab: pay and growth by state answer the same question, and six tabs no longer fit a phone tab row. Typical pay's (i) opens PaySheet (src/components/career/PaySheet.tsx): pay only, the range as the lit line, a source line, and a row into this tab." when="Every /career/[slug] whose profile carries BLS outlook figures; careers without them keep a plain Pay tab.">
        <StateGrid min={360}>
          <StateCell label="Software Engineer (live page)" minH={460} pad={false}>
            <LiveRoute href="/career/software-engineer" height={440} />
          </StateCell>
        </StateGrid>
      </Specimen>

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
