"use client";

// My Profile > About Me, the Profile's landing tab (Joshua Pierce, Slack, 19
// Oct 2026, blueprint at dceeai.replit.app/my-profile#overview, inspired by
// SchooLinks' student About Me). Its job is to make the student's two goals
// visible at a glance, Career Goal and College Goal, and to show My Build
// so the answers from Build can be checked or changed in one place.
//
// Explore feeds it; nothing here is typed in by hand:
//   Explore Careers -> Saved career -> Career Goal -> Top 3 (#1 = primary)
//   Explore Schools -> Saved school -> College Goal -> Reach / Target / Likely
// Saved careers and saved schools are the same stores Explore, Career Detail,
// College pages and the Saved tab already write (lib/savedCareers,
// colleges/shared useSaved), so a save anywhere lands here with no extra step.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, GraduationCap, Briefcase, Pencil, Plus, Star, Compass, Check } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { useRouter, useSearchParams } from "next/navigation";
import { FacePhoto } from "@/components/app/FacePhoto";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { Listbox } from "@/components/app/Listbox";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { openCareerPeek, openSchoolPeek } from "@/components/app/peek";
import { WORLD_COLORS, worldInk } from "@/components/app/worlds";
import { collegeImage, type College } from "@/components/colleges/data";
import { useResolvedColleges } from "@/components/colleges/dataset";
import { CollegePlaceholder } from "@/components/colleges/CollegePlaceholder";
import { CollegePicture, useGoalBuckets, useSaved as useSavedColleges, useTopSchool, type GoalBucket } from "@/components/colleges/shared";
import { fitFor, parseGpa } from "@/components/colleges/pathway";
import { useBackStep } from "@/lib/backStep";
import { SpotBadge, SpotTip, useSpotSequence } from "./SpotTip";
import { Constellation, StarBurst, StarGlyph } from "@/components/app/Constellation";
import { skyMoment } from "@/lib/sky";
import { CollegeGoalPicker } from "./CollegeGoalPicker";
import { flyXp } from "@/components/app/xpFlight";
import { DEMO_ALWAYS_SHOW_SPLASH, demoSeenThisSession, markDemoSeenThisSession } from "@/components/app/WelcomeSplash";
import { useBuildAnswers } from "@/lib/buildAnswers";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { prefSummary, summaryOf, type BuildSection } from "./PreferencesTab";
import { preferencesSnapshot, serverPreferencesSnapshot, subscribePreferences, writePreferences } from "@/lib/preferences";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { STAGE_ACCENTS, STAGE_ACCENTS_V2 } from "@/components/build/types";
import { useLookV2 } from "@/components/app/look";
import { ACADEMIC_RECORD } from "./report-data";
import type { ProfileCareer } from "./data";

const INSET = { background: "var(--inset-surface)", borderColor: "var(--inset-border)" } as const;

const BUCKETS: { id: GoalBucket; label: string; color: string; note: string }[] = [
  { id: "reach", label: "Reach", color: "var(--pc-chip-reach, #ffb35c)", note: "Harder to get into" },
  { id: "target", label: "Target", color: "var(--pc-chip-path, #7db2ff)", note: "A good match" },
  { id: "likely", label: "Likely", color: "var(--pc-chip-safety, #5fd6a8)", note: "Very likely to get in" },
];

/** Where a saved school sits until the student moves it: the same indicative
 *  band Explore Schools shows (fitFor), with Safety and open admission read as
 *  Likely and "no data" as Target, the middle, so nothing is left unfiled. */
function defaultBucket(c: College, gpa: number | null): GoalBucket {
  const fit = fitFor(c, gpa);
  if (fit === "Reach") return "reach";
  if (fit === "Safety" || fit === "Open admission") return "likely";
  return "target";
}

// My Build as one light, three-column summary (19 Oct 2026, Chandu: "redesign
// the my build in the about me tab to look more like the actual build flow...
// the black+blue treatment", then "lets not do dreamy for everything", "I like
// the approach of the colors and 3 columns but its currently very heavy" and
// "it doesnt leave room to add software skills etc like the preferences section
// in the replit does", "we do not need to keep world colors"). The answers
// grouped by the question they answer, in small, quiet type so a
// column holds up to five answers. Everything is edited in Edit My Build, which
// now carries the old Preferences tab's fields too, so there is one place.
// Data: the Replit's My Build (dceeai.replit.app/my-profile#overview) plus
// Build's tuition and the Preferences fields. Profile basics live in the
// header and saved careers in Career Goal, so neither repeats here.
type BuildLine = { id: BuildSection; label: string };
const BUILD_GROUPS: { title: string; short: string; lines: BuildLine[] }[] = [
  // balanced 4 / 3 / 4 (Chandu: "can we arrange the different data better?"):
  // what you're into, how you'll work, where school takes you
  // Subjects, Skills, Career fields: Build's order since 23 Oct 2026, with
  // Build's new Skills question (the picks live in the Build answers) ahead
  // of the Preferences "Skills to build" line
  { title: "What you like", short: "Likes", lines: [{ id: "subjects", label: "Subjects" }, { id: "enjoy", label: "Skills" }, { id: "interests", label: "Career fields" }, { id: "skills", label: "Skills to build" }] },
  { title: "How you work", short: "Work", lines: [{ id: "workVibe", label: "Work style" }, { id: "software", label: "Software to learn" }, { id: "jobs", label: "Internships & jobs" }] },
  { title: "Your path", short: "Path", lines: [{ id: "education", label: "Education" }, { id: "location", label: "Location" }, { id: "school", label: "School" }, { id: "cost", label: "Tuition" }] },
];

export type AboutView = "home" | "career" | "college";
/** Career Goal inside the ranking (v2): whether it is set, and the card
 *  action that makes a career the goal (it moves to #1 and the XP pays). */
export type Top3Goal = { set: boolean; onChoose: (id: string, from: Element | null) => void };
type View = AboutView;

// v2 (19 Oct 2026, Chandu: "lets make about me the way to guide students
// first. They land with empty cards: career goal should be first ask to be
// fixed ... Then #1 becomes the career goal, xp is gained, then next step is
// to fix a college/school goal ... we can get rid of the top 3 tab by
// folding it into here"). The goals are a sequence: Career Goal, then
// College Goal, then My Plan. The Career Goal counts as set only once the
// student chooses it on the ranking cards here ("Make my goal"), so the card
// starts empty even though Match already ordered the Top 3. The College Goal
// is simply the starred #1 school, wherever it was starred.
const CAREER_GOAL_XP = 25;
const COLLEGE_GOAL_XP = 25;
const CAREER_SET_KEY = "dreamari:goal:career-set";
const GOAL_EVENT = "dreamari:goal-set";

function readGoalFlag(key: string): boolean {
  // DEMO-ONLY: with DEMO_ALWAYS_SHOW_SPLASH on, the guided goals start empty
  // again on every fresh visit (a reload), like the other first-use cues.
  if (DEMO_ALWAYS_SHOW_SPLASH) return demoSeenThisSession(key);
  try { return window.localStorage.getItem(key) === "1"; } catch { return false; }
}
function writeGoalFlag(key: string) {
  if (DEMO_ALWAYS_SHOW_SPLASH) markDemoSeenThisSession(key);
  else { try { window.localStorage.setItem(key, "1"); } catch { /* nothing to persist to */ } }
  window.dispatchEvent(new Event(GOAL_EVENT));
}
// DEMO-ONLY: XP is paid once per milestone id, but the demo's goals start
// empty again on every visit, so each page load gets its own id and the
// "+25 XP" moment plays every run. Production: the plain ids.
const DEMO_RUN = DEMO_ALWAYS_SHOW_SPLASH ? `:${Date.now().toString(36)}` : "";

function useGoalFlag(key: string): [boolean, () => void] {
  const subscribe = (cb: () => void) => { window.addEventListener(GOAL_EVENT, cb); return () => window.removeEventListener(GOAL_EVENT, cb); };
  const set = useSyncExternalStore(subscribe, () => readGoalFlag(key), () => false);
  return [set, () => writeGoalFlag(key)];
}

export function AboutMeTab({ top3, primary, saved, onAddToTop3, onGoTab, onOpenBuild, v2 }: {
  /** Top 3 in rank order */
  top3: ProfileCareer[];
  /** the #1 career the student picked; null until they pick one (a Top 3 alone doesn't set it) */
  primary: ProfileCareer | null;
  /** saved careers not in the Top 3, newest first */
  saved: ProfileCareer[];
  onAddToTop3: (id: string) => void;
  onGoTab: (tab: "top3" | "report" | "plan") => void;
  onOpenBuild: (section?: BuildSection) => void;
  /** v2: the guided goals, with the Top 3 cards inside Career Goal */
  v2?: {
    /** the Top 3 cards and their nudges (Top3Tab), shown inside Career Goal,
     *  where each card's own button sets the goal */
    renderTop3: (goal: Top3Goal) => React.ReactNode;
    /** make this career the primary (#1), so Report and Plan follow it */
    onConfirmPrimary: (id: string) => void;
    initialView?: AboutView;
  };
}) {
  // ?goal=career|college opens straight on that goal: Explore Schools' "See
  // saved" and a career's "View saved" land where the save was filed.
  const goalParam = useSearchParams()?.get("goal");
  const [view, setView] = useState<View>(goalParam === "career" || goalParam === "college" ? goalParam : v2?.initialView ?? "home");
  // Once landed, the URL forgets it, so Back to About Me and a reload agree.
  useEffect(() => {
    if (!goalParam) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("goal");
      window.history.replaceState(window.history.state, "", url.toString());
    } catch { /* nothing to tidy */ }
  }, [goalParam]);
  // A drill-in is one Back step (8 Oct 2026 rule, "ALWAYS EVERYTHING SHOULD
  // GO ONLY ONE STEP BACK"): the browser's Back returns to About Me.
  useBackStep(view !== "home", () => setView("home"));
  const go = (next: View) => {
    setView(next);
    window.requestAnimationFrame(() => document.getElementById("profile-panel-about")?.scrollIntoView({ block: "nearest" }));
  };

  const router = useRouter();
  const college = useCollegeGoal();
  const [careerFlag, markCareer] = useGoalFlag(CAREER_SET_KEY);
  const careerSet = careerFlag && top3.length > 0;
  // A starred #1 school IS the College Goal: choosing it is the act, with no
  // second confirm (Chandu, 19 Oct 2026: "if i have a college selected why
  // is the college goal card showing a blank blue thing?").
  const collegeSet = college.top !== null;
  // the XP and the focus-in, the first time a #1 school is chosen here
  const chooseSchool = (slug: string | null, from: Element | null) => {
    const first = !college.top && !!slug;
    college.setTop(slug);
    if (!first) return;
    focusIn("college");
    flyXp({ from, amount: COLLEGE_GOAL_XP, milestone: `profile:college-goal${DEMO_RUN}` });
  };
  // After a goal is set, the XP flies, then About Me comes back so the
  // student sees the card fill and the next goal start to nudge.
  const settle = () => window.setTimeout(() => go("home"), 1100);
  // the goal that was just set: its picture comes into focus on About Me
  const [justSet, setJustSet] = useState<"career" | "college" | null>(null);
  const focusIn = (g: "career" | "college") => { setJustSet(g); window.setTimeout(() => setJustSet(null), 3200); };
  // v2: the College Goal picker sheet over About Me
  const [picking, setPicking] = useState(false);

  if (v2 && view === "career") {
    return (
      <CareerGoalV2
        top3={top3} saved={saved}
        slot={v2.renderTop3({
          set: careerSet,
          onChoose: (id, from) => {
            v2.onConfirmPrimary(id);
            markCareer();
            focusIn("career");
            flyXp({ from, amount: CAREER_GOAL_XP, milestone: `profile:career-goal${DEMO_RUN}` });
            settle();
          },
        })}
        onBack={() => setView("home")} onAddToTop3={onAddToTop3}
        goalSet={careerSet}
      />
    );
  }
  if (v2 && view === "college") {
    return (
      <CollegeGoalView
        // the star in My schools sets the goal (and pays, the first time)
        goal={{ ...college, setTop: (slug) => { const first = !college.top && !!slug; chooseSchool(slug, null); if (first) settle(); } }}
        onBack={() => setView("home")}
        // after both goals, out to Explore (20 Oct 2026), not My Plan
        goalNext={() => router.push("/explore")}
      />
    );
  }
  if (view === "career") return <CareerGoalView top3={top3} saved={saved} onBack={() => setView("home")} onAddToTop3={onAddToTop3} onGoTab={onGoTab} />;
  if (view === "college") return <CollegeGoalView goal={college} onBack={() => setView("home")} />;

  if (v2) {
    // Before a goal is set, the Career Goal card shows the likeliest choice
    // out of focus: the #1 of the Top 3, else the newest save.
    // the Career Goal, once confirmed, is whatever is #1 in the Top 3
    const goalCareer = top3[0] ?? null;
    const lead = top3[0] ?? saved[0] ?? null;
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <section aria-labelledby="about-goals" className="flex flex-col gap-[var(--space-3)]">
          <SectionHead id="about-goals" title="My Goals" />
          <div className="grid gap-[var(--space-3)] md:grid-cols-2">
            {careerSet && goalCareer ? (
              <GoalCard
                kind="Career Goal" Icon={Briefcase} title={goalCareer.title} accent={WORLD_COLORS[goalCareer.world]}
                picture={<FacePhoto src={goalCareer.photo} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" fallback={goalCareer.photoFocus ?? "50% 30%"} />}
                onOpen={() => go("career")} openLabel="Open Career Goal"
                focusIn={justSet === "career"}
              />
            ) : (
              <EmptyGoalCard
                kind="Career Goal" Icon={Briefcase}
                title={lead ? "Choose your career goal" : "Save careers to choose from"}
                backdrop={lead ? <FacePhoto src={lead.photo} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" fallback={lead.photoFocus ?? "50% 30%"} /> : null}
                xp={lead ? CAREER_GOAL_XP : undefined}
                nudge
                badge="Start here"
                href={lead ? undefined : "/explore"}
                onOpen={() => go("career")} openLabel="Open Career Goal"
              />
            )}
            {collegeSet && college.top ? (
              <GoalCard
                kind="College Goal" Icon={GraduationCap} title={college.top.name}
                picture={<GoalSchoolPicture c={college.top} sizes="(min-width: 768px) 50vw, 100vw" />}
                onOpen={() => go("college")} openLabel="Open College Goal"
                focusIn={justSet === "college"}
              />
            ) : (
              <EmptyGoalCard
                kind="College Goal" Icon={GraduationCap}
                // the picker always has the schools that fit, so the card
                // never sends the student off to Explore to find some first
                title="Choose your college goal"
                // the school-card fallback art, crisp: an empty College Goal is a
                // campus waiting to be named (Chandu, 19 Oct 2026: "use the
                // fallback graphic we made for empty college goal stuff")
                art={<HallArt />}
                backdrop={null}
                xp={COLLEGE_GOAL_XP}
                // one ask at a time: the school goal waits for the career goal
                nudge={careerSet}
                badge={careerSet ? "Next step" : undefined}
                quiet={!careerSet}
                // the For you schools in a large sheet (CollegeGoalPicker),
                // not the College Goal view or Explore Schools
                onOpen={() => setPicking(true)} openLabel="Open College Goal"
              />
            )}
          </div>
          {picking && (
            <CollegeGoalPicker
              careerIds={top3.map((c) => c.id)}
              saved={college.schools.map((s) => s.c)}
              onClose={() => setPicking(false)}
              // the Career Goal's beat: the XP flies from the button now, the
              // card says My goal, then the sheet closes and the College Goal
              // card comes into focus where the student can see it
              onPick={(c, from) => {
                const first = !college.top;
                if (first) flyXp({ from, amount: COLLEGE_GOAL_XP, milestone: `profile:college-goal${DEMO_RUN}` });
                window.setTimeout(() => {
                  college.setTop(c.slug);
                  setPicking(false);
                  if (first) { focusIn("college"); skyMoment({ big: true, from: null }); }
                }, 1100);
              }}
            />
          )}
          {/* Career Goal, then College Goal, then out to Explore (20 Oct
             2026, Chandu: "After career goal > go to set the college goal
             and then explore careers/schools in general"). Not My Plan:
             "We wont do the my plan ctas". */}
          {careerSet && collegeSet && (
            <NextStepRow
              title="Keep exploring"
              sub="Find more careers and schools"
              nudge
              links={[{ label: "Careers", href: "/explore" }, { label: "Schools", href: "/colleges" }]}
            />
          )}
        </section>

        <BuildBlock onOpenBuild={onOpenBuild} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <section aria-labelledby="about-goals" className="flex flex-col gap-[var(--space-3)]">
        <SectionHead id="about-goals" title="My Goals" />
        <div className="grid gap-[var(--space-3)] md:grid-cols-2">
          <GoalCard
            kind="Career Goal"
            Icon={Briefcase}
            title={primary ? primary.title : top3.length ? "Pick your #1 career" : "Pick a career you’re working toward"}
            accent={(primary ?? top3[0]) ? WORLD_COLORS[(primary ?? top3[0]).world] : undefined}
            // No #1 picked yet (Chandu, 19 Oct 2026: "they will already have 3
            // but will not have fixed a primary"): the top-ranked career's photo
            // stands in ("careers will have images for sure"), and the card
            // opens Top 3, where the #1 is set.
            picture={(primary ?? top3[0]) ? <FacePhoto src={(primary ?? top3[0]).photo} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" fallback={(primary ?? top3[0]).photoFocus ?? "50% 30%"} /> : null}
            onOpen={() => (primary || !top3.length ? go("career") : onGoTab("top3"))}
            openLabel="Open Career Goal"
          />
          <GoalCard
            kind="College Goal"
            Icon={GraduationCap}
            title={college.top ? college.top.name : college.schools.length ? "Pick your #1 school" : "Pick a school you’re working toward"}
            // No #1 school yet: the school fallback art, in the demo too
            // (Chandu, 19 Oct 2026: "Use the fallback for school for an empty
            // college goals card", after the demo had swapped in a real campus
            // photo here). Kept whole by HallArt, the same as v2's card.
            picture={college.top ? <GoalSchoolPicture c={college.top} sizes="(min-width: 768px) 50vw, 100vw" /> : <HallArt />}
            onOpen={() => go("college")}
            openLabel="Open College Goal"
          />
        </div>
      </section>

      <BuildBlock onOpenBuild={onOpenBuild} />
    </div>
  );
}

function BuildBlock({ onOpenBuild }: { onOpenBuild: (section?: BuildSection) => void }) {
  // Folded to one small row until the student asks for it (20 Oct 2026,
  // Chandu: "maybe the my build can be collapsed in some way and only open
  // when its clicked on ... Right now its very noisy"). Open, it is the same
  // answers, each opening its own section of the editor.
  // Build's blue-black sky is back behind the fold and the panel (20 Oct
  // 2026: "when collapsed on open should still have that gradient blue black
  // look we used to have"); the flat blue tint read as a plain box. The
  // noise that the fold fixed was the always-open answers, not the sky.
  // The mark is a small constellation, not the AI sparkle ("lose the AI
  // icon ... some starry hover stuff we did for the v7 cards"), and the
  // fold's hover draws the v7 constellation, nothing at rest.
  const lookV2 = useLookV2();
  const [open, setOpen] = useState(false);
  return (
    <section aria-label="My Build" className="relative isolate flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "color-mix(in srgb, var(--primary) 30%, var(--glass-border))" }}>
      <ThemeProvider>
        <div aria-hidden className="myb-sky">
          <BackgroundSpace />
          <AuroraBackground accent={(lookV2 ? STAGE_ACCENTS_V2 : STAGE_ACCENTS).interests} visitedAccents={[]} lightning={false} />
        </div>
      </ThemeProvider>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="about-build-panel"
        onClick={() => setOpen((o) => !o)}
        // its own hover: the house grey fill (dm-quiet) hid the sky
        className="group relative flex min-h-[60px] w-full cursor-pointer items-center gap-[var(--space-3)] overflow-hidden px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
      >
        <span aria-hidden className="flex size-[36px] flex-none items-center justify-center rounded-[var(--radius-md)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, rgba(0,0,0,0.25))", border: "1px solid color-mix(in srgb, var(--primary) 35%, transparent)" }}>
          <StarGlyph className="h-[26px] w-[26px]" />
        </span>
        <span className="relative z-[1] flex min-w-0 flex-1 flex-col">
          <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>My Build</span>
          <span className="truncate text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>What Dreamari uses to pick your matches</span>
        </span>
        {/* closed only: open, the panel below is the thing to look at */}
        {!open && <Constellation figure="build" className="top-[-10px] right-[44px] w-[160px]" />}
        <ChevronDown aria-hidden className="relative z-[1] h-5 w-5 flex-none transition-transform duration-200" style={{ color: "var(--accent-subtle)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div id="about-build-panel" className="border-t" style={{ borderColor: "color-mix(in srgb, var(--primary) 22%, var(--glass-border))" }}>
          <BuildSummary onOpen={onOpenBuild} />
        </div>
      )}
    </section>
  );
}

/** The house text sweep with its spark (Cover, Explore's For You), on a
 *  label that is waiting for the student. A dimmed base so the glint shows. */
function NudgeText({ on, base = "var(--scrim-ink-soft, rgba(255,255,255,0.7))", children }: { on: boolean; base?: string; children: React.ReactNode }) {
  return (
    // no text shadow while sweeping: the letters are see-through and a
    // card's shadow showed through them as a dark smudge
    <span className={`relative ${on ? "dm-text-nudge" : ""}`} style={on ? { color: base, textShadow: "none" } : undefined}>
      {children}
      {on && (
        <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark pointer-events-none absolute -top-[7px] -right-[9px] h-[9px] w-[9px]">
          <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="#FFFFFF" />
        </svg>
      )}
    </span>
  );
}

function XpChip({ amount }: { amount: number }) {
  return (
    <span className="flex flex-none items-center gap-[4px] rounded-full px-[10px] py-[4px] text-[12.5px] leading-[16px] font-extrabold tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 30%, rgba(255,255,255,0.08))", border: "1px solid color-mix(in srgb, var(--primary) 55%, rgba(255,255,255,0.2))", color: "var(--scrim-ink, #fff)", textShadow: "none" }}>
      <span aria-hidden>✦</span>+{amount} XP
    </span>
  );
}

/** A goal before the student has set it (v2): out of focus until chosen.
 *  The fanned posters were too busy (Chandu, 19 Oct 2026: "the new fanned
 *  out card thing ... is bad. We need to be more creative and make it not so
 *  busy"). One picture now, the likeliest choice, blurred and dimmed like
 *  frosted glass, so the card already hints at the answer without a crowd;
 *  setting the goal brings it into focus (GoalCard's focusIn). Same layout
 *  as the filled card, so only the focus changes. With nothing to choose
 *  from, Build's sky stands in and the card opens Explore. */
// exported for the component lab
export function EmptyGoalCard({ kind, Icon, title, backdrop, art, xp, nudge, badge, quiet = false, href, onOpen, openLabel }: {
  kind: string; Icon: typeof Briefcase; title: string; backdrop: React.ReactNode | null; /** shown sharp instead (College: the school fallback art) */ art?: React.ReactNode; xp?: number; nudge: boolean; /** this is the step to take now: the card glows and says so */ badge?: string; /** waiting its turn: dimmer */ quiet?: boolean; /** nothing to choose from: go here instead */ href?: string; onOpen: () => void; openLabel: string;
}) {
  const lookV2 = useLookV2();
  const body = (
    <>
      <span aria-hidden className="absolute inset-0">
        {art ? (
          <span className="absolute inset-0" style={{ opacity: quiet ? 0.55 : 1, transition: "opacity 600ms ease" }}>{art}</span>
        ) : backdrop ? (
          // a still blur (never animated at rest: Glossary Lab perf rule)
          <span className="absolute inset-0" style={{ filter: `blur(18px) saturate(0.7) brightness(${quiet ? 0.42 : 0.6})`, transform: "scale(1.15)" }}>{backdrop}</span>
        ) : (
          <ThemeProvider>
            <span className="myb-sky" style={{ opacity: quiet ? 0.6 : 1 }}>
              <BackgroundSpace />
              <AuroraBackground accent={(lookV2 ? STAGE_ACCENTS_V2 : STAGE_ACCENTS).interests} visitedAccents={[]} lightning={false} />
            </span>
          </ThemeProvider>
        )}
        <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(var(--scrim-rgb, 12 16 35) / calc(0.9 * var(--scrim-gain, 1))) 0%, rgb(var(--scrim-rgb, 12 16 35) / calc(0.35 * var(--scrim-gain, 1))) 50%, rgb(var(--scrim-rgb, 12 16 35) / calc(0.1 * var(--scrim-gain, 1))) 100%)" }} />
      </span>
      {badge && <SpotBadge>{badge}</SpotBadge>}
      <span className="relative mt-auto flex flex-col gap-[6px] p-[var(--space-5)]">
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "color-mix(in srgb, var(--accent-subtle) 30%, var(--scrim-ink, #fff))" }}>
          <Icon className="h-[14px] w-[14px]" aria-hidden /> {kind}
        </span>
        <span className="flex items-end justify-between gap-[var(--space-3)]">
          <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em] text-balance" style={{ fontFamily: "var(--font-display)", color: quiet ? "var(--scrim-ink-soft, rgba(255,255,255,0.72))" : "var(--scrim-ink, #fff)" }}>
            <NudgeText on={nudge} base="var(--scrim-ink-soft, rgba(255,255,255,0.6))">{title}</NudgeText>
          </span>
          {xp ? <XpChip amount={xp} /> : <ChevronRight className="mb-[3px] h-5 w-5 flex-none" aria-hidden />}
        </span>
      </span>
    </>
  );
  const className = `dm-tap group relative isolate flex h-full min-h-[220px] w-full cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border text-left md:min-h-[300px] ${badge ? "dm-spot-ring" : ""}`;
  const style = { borderColor: nudge ? "color-mix(in srgb, var(--primary) 55%, var(--glass-border))" : "var(--glass-border)", background: "var(--scrim-deep, #0e0c20)", color: "var(--scrim-ink, #fff)", textShadow: CARD_TEXT_SHADOW } as const;
  return (
    <HoverBeam className="h-full">
      {href ? (
        <Link href={href} aria-label={`${openLabel}: ${title}`} className={className} style={style}>{body}</Link>
      ) : (
        <button type="button" onClick={onOpen} aria-label={`${openLabel}: ${title}`} className={className} style={style}>{body}</button>
      )}
    </HoverBeam>
  );
}

/** The step after both goals: out to Explore, careers or schools. Two
 *  plain choices on the right, so neither is a guess. */
// exported for the component lab
export function NextStepRow({ title, sub, nudge, links }: { title: string; sub?: string; nudge: boolean; links: { label: string; href: string }[] }) {
  return (
    <div className="flex min-h-[64px] w-full flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)]" style={{ ...INSET, borderColor: nudge ? "color-mix(in srgb, var(--primary) 55%, var(--inset-border))" : "var(--inset-border)" }}>
      <span className="flex min-w-[200px] flex-1 items-center gap-[var(--space-3)]">
        <span aria-hidden className="flex size-[40px] flex-none items-center justify-center rounded-[var(--radius-md)]" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--accent-subtle)" }}>
          <Compass className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[16px] leading-[21px] font-extrabold"><NudgeText on={nudge} base="color-mix(in srgb, var(--foreground) 60%, transparent)">{title}</NudgeText></span>
          {sub && <span className="truncate text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sub}</span>}
        </span>
      </span>
      <span className="flex flex-none gap-[var(--space-2)]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="dm-tap group flex min-h-[40px] items-center gap-[2px] rounded-full border px-[var(--space-4)] text-[14px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 45%, transparent)", color: "var(--foreground)" }}>
            {l.label}
            <ChevronRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[2px]" />
          </Link>
        ))}
      </span>
    </div>
  );
}


// The app's fixed header, the same 84px the Settings cards reserve as
// scroll margin (ProfileExperience SETTINGS_CARD).
const FIXED_HEADER = 84;
/** Opening the Career Goal view scrolls the page so the view's own heading
 *  sits just under the fixed header and the ranking cards fill the screen
 *  (Chandu, 23 Oct 2026: "make sure the page scrolls to the cards when they
 *  reach the career goal screen"); before, the view opened wherever About
 *  Me was scrolled, with the cards' Make my goal button at or past the
 *  fold. Instant steps on rAF, not a smooth scroll: on this page a smooth
 *  scroll is cancelled before it moves (ProfileExperience, 2 Oct 2026).
 *  Runs once per open, a beat after go()'s own nearest-scroll of the panel. */
function useScrollToGoal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    let raf = 0;
    const timer = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const from = window.scrollY;
      const to = Math.max(0, el.getBoundingClientRect().top + from - FIXED_HEADER - 12);
      if (Math.abs(to - from) < 24) return;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 420);
        const e = 1 - Math.pow(1 - p, 3);
        window.scrollTo({ top: from + (to - from) * e, behavior: "instant" as ScrollBehavior });
        if (p < 1) raf = window.requestAnimationFrame(step);
      };
      raf = window.requestAnimationFrame(step);
    }, 40);
    return () => { window.clearTimeout(timer); window.cancelAnimationFrame(raf); };
  }, [ref]);
}

/** v2 Career Goal: the Top 3 cards themselves (with their move, remove and
 *  add nudges), then the #1 confirmed as the goal, then the saved careers
 *  that can still join. Replaces the Top 3 tab. */
function CareerGoalV2({ top3, saved, slot, onBack, onAddToTop3, goalSet }: {
  top3: ProfileCareer[]; saved: ProfileCareer[]; slot: React.ReactNode; onBack: () => void; onAddToTop3: (id: string) => void; goalSet: boolean;
}) {
  const router = useRouter();
  const open = (c: ProfileCareer, row: ProfileCareer[]) => { if (!openCareerPeek(c.id, row.map((x) => x.id))) router.push(`/career/${c.id}`); };
  const heading = useRef<HTMLDivElement | null>(null);
  useScrollToGoal(heading);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <BackLink onBack={onBack} />
      <div ref={heading} className="flex flex-col gap-[2px]">
        <h3 className="text-[24px] leading-[29px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Career Goal</h3>
        <p className="text-[14px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{goalSet ? "Your #1 is your goal. Move a career to #1 to change it." : "Tap Make my goal on the career you want most."}</p>
      </div>
      {/* choosing happens on the cards themselves (Chandu, 19 Oct 2026:
         "keep the making a career the primary within the ranking activity
         itself instead of a separate glowing cta ... Simplify it") */}
      {top3.length ? slot : (
        <EmptyGroup text="Your Top 3 is empty. Save careers in Explore, then add them here." cta="Explore careers" href="/explore" />
      )}
      {saved.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <GroupHead
            title="Saved careers"
            count={`${saved.length}`}
            action={<Link href="/explore" className={QUIET_LINK} style={{ color: "var(--accent-subtle)" }}>Explore careers <ChevronRight className="h-4 w-4" aria-hidden /></Link>}
          />
          <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={INSET}>
            {saved.map((c, i) => (
              <CareerRow
                key={c.id} career={c} first={i === 0} onOpen={() => open(c, saved)}
                trailing={top3.length < 3 ? (
                  <button type="button" onClick={() => onAddToTop3(c.id)} className="dm-tap relative z-[6] flex min-h-[36px] flex-none cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] border px-[12px] text-[13px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--foreground) 24%, transparent)", color: "var(--foreground)" }}>
                    <Plus className="h-[14px] w-[14px]" aria-hidden /> Add to Top 3
                  </button>
                ) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHead({ id, title, sub }: { id: string; title: string; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[2px]">
      <h3 id={id} className="text-[24px] leading-[29px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      {sub && <p className="text-[14px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

/** One goal as a picture card: the #1 career's poster or the #1 school's
 *  campus behind it, the goal's name on the picture, one line under it. The
 *  whole card opens the goal (every card opens something). */
// Label and name only (19 Oct 2026, Chandu: "less text: bigger picture,
// just the label and the goal name"). The counts and how-to lines live one
// tap in, inside each goal.
// exported for the component lab
export function GoalCard({ kind, Icon, title, picture, accent, onOpen, openLabel, focusIn = false }: {
  kind: string; Icon: typeof Briefcase; title: string; picture: React.ReactNode; accent?: string; onOpen: () => void; openLabel: string; /** v2: just set, so the picture comes into focus once */ focusIn?: boolean;
}) {
  return (
    <HoverBeam className="h-full">
      <button type="button" onClick={onOpen} aria-label={`${openLabel}: ${title}`} className="dm-tap group relative flex h-full min-h-[220px] w-full cursor-pointer md:min-h-[300px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left" style={{ borderColor: "var(--glass-border)", background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 26%, var(--scrim-deep, #0e0c20)) 0%, var(--scrim-deep, #0e0c20) 62%)", color: "var(--scrim-ink, #fff)", textShadow: CARD_TEXT_SHADOW }}>
        {picture && (
          <span aria-hidden className="absolute inset-0">
            <span className={`absolute inset-0 ${focusIn ? "dm-goal-focus-in" : ""}`}>{picture}</span>
            <CardProgressiveBlur size="62%" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(var(--scrim-rgb, 12 16 35) / calc(0.92 * var(--scrim-gain, 1))) 0%, rgb(var(--scrim-rgb, 12 16 35) / calc(0.55 * var(--scrim-gain, 1))) 40%, rgb(var(--scrim-rgb, 12 16 35) / calc(0.05 * var(--scrim-gain, 1))) 75%)" }} />
          </span>
        )}
        <span className="relative flex flex-col gap-[6px] p-[var(--space-5)]">
          <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: `color-mix(in srgb, ${accent ?? "var(--accent-subtle)"} 40%, #fff)` }}>
            <Icon className="h-[14px] w-[14px]" aria-hidden /> {kind}
          </span>
          <span className="flex items-end justify-between gap-[var(--space-3)]">
            <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em] text-balance" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
            <ChevronRight className="mb-[3px] h-5 w-5 flex-none transition-transform duration-200 group-hover:translate-x-[2px]" aria-hidden />
          </span>
        </span>
      </button>
    </HoverBeam>
  );
}

/** My Build as one light panel in three columns (see BUILD_GROUPS); stacked
 *  on phones. Each answer opens its own section of the editor. */
function BuildSummary({ onOpen }: { onOpen: (section: BuildSection) => void }) {
  const answers = useBuildAnswers();
  const prefs = useSyncExternalStore(subscribePreferences, preferencesSnapshot, serverPreferencesSnapshot);
  // phones: one group at a time behind a switch instead of ten stacked rows
  // (Chandu: "The layout needs to be better on mobile and tablet. Long
  // scrolling isnt the best way."); from sm (640px, tablets) all three columns
  const [shown, setShown] = useState(0);
  // Teach that every line opens its editor, once, on the first line.
  const panel = useRef<HTMLDivElement>(null);
  const [spot, stopSpot] = useSpotSequence("dreamari:nudge:my-build-lines", ["edit"] as const, panel, true, 3200);
  // DEMO-ONLY: the demo student (Jordan Rivera) starts with the Replit's
  // My Build answers for the fields Build itself doesn't ask, written to the
  // real store once, so the summary and the editor agree. Only while the
  // student has never saved Preferences. Production: the student's own.
  useEffect(() => {
    if (prefs.updatedAt) return;
    const seed: Partial<typeof prefs> = {};
    if (!prefs.skillsToBuild.length) seed.skillsToBuild = ["Financial analysis", "Data analysis", "Public speaking"];
    if (!prefs.softwareLearn.length) seed.softwareLearn = ["Excel", "Bloomberg Terminal"];
    if (!prefs.schoolTypes.length && !prefs.campus.length) { seed.schoolTypes = ["4-Year College"]; seed.campus = ["City"]; }
    if (!prefs.jobs.types.length) seed.jobs = { ...prefs.jobs, types: ["Internship", "Summer Job"], modes: ["Hybrid"] };
    if (Object.keys(seed).length) writePreferences(seed);
  }, [prefs]);
  const valueOf = (id: BuildSection): string => {
    return summaryOf(answers, id, 0) || prefSummary(prefs, id);
  };
  // Success moments (20 Oct 2026, Chandu: "the success moments could look
  // really nice with the stars pulse and shooting star stuff ... without it
  // being always playing"). Only on a real change, never at rest: an answer
  // saved in the editor flares a few stars on its own line and sends a small
  // wave through the night sky; the last empty line filled sends a shooting
  // star across the panel and a big sky moment. The first moment after
  // mounting is skipped, so the demo's seeded answers don't set it off.
  const values = BUILD_GROUPS.flatMap((g) => g.lines.map((l) => [l.id, valueOf(l.id)] as const));
  const sig = values.map(([, v]) => v).join("\u0001");
  const prev = useRef<{ sig: string; at: number; vals: Map<BuildSection, string> } | null>(null);
  const [flash, setFlash] = useState<{ id: BuildSection; n: number } | null>(null);
  const [shoot, setShoot] = useState(0);
  useEffect(() => {
    const now = Date.now();
    const p = prev.current;
    prev.current = { sig, at: p?.at ?? now, vals: new Map(values) };
    if (!p || p.sig === sig || now - p.at < 1000) return;
    const changed = values.find(([id, v]) => v.trim() && v !== p.vals.get(id));
    if (!changed) return;
    const wasMissing = [...p.vals.values()].some((v) => !v.trim());
    const complete = values.every(([, v]) => v.trim());
    // answers are saved inside the editor sheet, which covers this panel:
    // hold the moment until the sheet closes, so the student sees it land
    const play = () => {
      const row = panel.current?.querySelector(`[data-build-line="${changed[0]}"]`) ?? null;
      if (wasMissing && complete) {
        setShoot((n) => n + 1);
        skyMoment({ from: row, big: true });
      } else {
        skyMoment({ from: row });
      }
      setFlash((f) => ({ id: changed[0], n: (f?.n ?? 0) + 1 }));
    };
    const wait = window.setInterval(() => {
      if (document.querySelector('[aria-modal="true"]')) return;
      window.clearInterval(wait);
      window.setTimeout(play, 250);
    }, 200);
    return () => window.clearInterval(wait);
    // values is derived from sig
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return (
    // on BuildBlock's blue-black sky
    <div ref={panel} className="relative isolate grid overflow-hidden sm:grid-cols-3">
      {shoot > 0 && <span key={shoot} aria-hidden className="dm-shoot" />}
      <div className="px-[var(--space-5)] pt-[var(--space-5)] sm:hidden">
        <Segmented ariaLabel="My Build group" value={String(shown)} onChange={(v) => setShown(Number(v))} options={BUILD_GROUPS.map((g, i) => ({ key: String(i), label: g.short }))} grow />
      </div>
      {BUILD_GROUPS.map((g, gi) => (
        <div key={g.title} className={`${gi === shown ? "flex" : "hidden"} flex-col gap-[var(--space-3)] px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-6)] sm:flex sm:px-[var(--space-5)] sm:py-[var(--space-6)] lg:px-[var(--space-6)] ${gi ? "sm:border-l" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
          {/* heading > subheading > body, strictly by size ("Heading >
             subheading > body only"): group 18, field 15, answer 14 */}
          {/* the gradient ink the Profile's stat figures wear; on phones the
             switch above names the group, so the heading shows from sm */}
          <h4 className="hidden w-fit pb-[2px] text-[18px] leading-[23px] font-extrabold sm:block" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{g.title}</h4>
          {g.lines.map((line, li) => {
            const value = valueOf(line.id);
            const empty = !value.trim();
            const lit = spot === "edit" && gi === shown && li === 0;
            return (
              <span key={line.id} data-build-line={line.id} className="relative flex flex-col">
              {flash?.id === line.id && <StarBurst key={flash.n} className="inset-x-[-6px] top-[2px] h-[52px]" />}
              {/* below the line: above it, the tip covered the phone's group switch */}
              {lit && <SpotTip side="left" top={84}>Tap any line to change it</SpotTip>}
              <button
                type="button"
                onClick={() => { stopSpot(); onOpen(line.id); }}
                aria-label={`${line.label}: edit`}
                className={`group -mx-[10px] flex cursor-pointer items-start gap-[var(--space-2)] rounded-[var(--radius-md)] px-[10px] py-[8px] text-left transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] ${lit ? "dm-spot-soft" : ""}`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{line.label}</span>
                  <span className="text-[14px] leading-[20px] font-normal" style={{ color: empty ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{empty ? "Add" : value}</span>
                </span>
                {/* always there, brighter on hover: says the row edits
                   ("its not clear that the different sections are clickable") */}
                <Pencil className={`mt-[3px] h-[14px] w-[14px] flex-none opacity-45 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${lit ? "dm-pencil-write" : ""}`} style={{ color: "var(--accent-subtle)" }} aria-hidden />
              </button>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BackLink({ onBack, label = "About Me" }: { onBack: () => void; label?: string }) {
  return (
    <button type="button" onClick={onBack} className="dm-quiet -ml-[8px] flex w-fit cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[8px] py-[6px] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>
      <ArrowLeft className="h-4 w-4" aria-hidden /> {label}
    </button>
  );
}

function GroupHead({ title, count, action }: { title: string; count?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-[var(--space-3)]">
      <h4 className="flex items-baseline gap-[8px] text-[16px] leading-[21px] font-extrabold">
        {title}
        {count && <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{count}</span>}
      </h4>
      {action}
    </div>
  );
}

const QUIET_LINK = "dm-quiet flex flex-none cursor-pointer items-center gap-[2px] rounded-[var(--radius-md)] px-[8px] py-[4px] text-[14px] font-bold inline-flex min-h-[24px] items-center";

// ---------------------------------------------------------------- Career Goal

function CareerGoalView({ top3, saved, onBack, onAddToTop3, onGoTab }: {
  top3: ProfileCareer[]; saved: ProfileCareer[]; onBack: () => void; onAddToTop3: (id: string) => void; onGoTab: (tab: "top3" | "report") => void;
}) {
  const router = useRouter();
  const primary = top3[0] ?? null;
  const open = (c: ProfileCareer, row: ProfileCareer[]) => { if (!openCareerPeek(c.id, row.map((x) => x.id))) router.push(`/career/${c.id}`); };
  const heading = useRef<HTMLHeadingElement | null>(null);
  useScrollToGoal(heading);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <BackLink onBack={onBack} />
      <h3 ref={heading} className="text-[24px] leading-[29px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Career Goal</h3>

      {primary ? (
        <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: `color-mix(in srgb, ${WORLD_COLORS[primary.world] ?? "var(--primary)"} 40%, rgba(255,255,255,0.16))`, background: "var(--scrim-deep, #0e0c20)", color: "var(--scrim-ink, #fff)", textShadow: CARD_TEXT_SHADOW }}>
          <span aria-hidden className="absolute inset-0">
            <FacePhoto src={primary.photo} sizes="(min-width: 1024px) 1100px, 100vw" className="object-cover" fallback={primary.photoFocus ?? "50% 30%"} />
            <CardProgressiveBlur size="66%" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(var(--scrim-rgb, 12 16 35) / calc(0.92 * var(--scrim-gain, 1))) 0%, rgb(var(--scrim-rgb, 12 16 35) / calc(0.5 * var(--scrim-gain, 1))) 45%, transparent 80%)" }} />
          </span>
          <div className="relative flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
            <span className="text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: WORLD_COLORS[primary.world] ? worldInk(WORLD_COLORS[primary.world]) : "var(--accent-subtle)" }}>Primary career</span>
            <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{primary.title}</span>
            <span className="flex flex-wrap gap-[var(--space-2)]" style={{ textShadow: "none" }}>
              <Link href={`/career/${primary.id}`} className="dm-tap flex min-h-[40px] items-center gap-[3px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                Learn more <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <button type="button" onClick={() => onGoTab("report")} className="dm-tap flex min-h-[40px] cursor-pointer items-center gap-[3px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--scrim-tile-bg, rgba(255,255,255,0.14))", borderColor: "var(--scrim-chip-edge, rgba(255,255,255,0.22))", color: "var(--scrim-ink, #fff)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                Career Report <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </span>
          </div>
        </div>
      ) : null}

      <section className="flex flex-col gap-[var(--space-3)]">
        <GroupHead
          title="My Top 3"
          count={`${top3.length} of 3`}
          action={<button type="button" onClick={() => onGoTab("top3")} className={QUIET_LINK} style={{ color: "var(--accent-subtle)" }}>Reorder <ChevronRight className="h-4 w-4" aria-hidden /></button>}
        />
        <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={INSET}>
          {top3.map((c, i) => (
            <CareerRow key={c.id} career={c} first={i === 0} rank={i + 1} onOpen={() => open(c, top3)} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-3)]">
        <GroupHead
          title="Saved careers"
          count={saved.length ? `${saved.length}` : undefined}
          // empty, the empty state carries the one Explore button
          action={saved.length === 0 ? undefined : <Link href="/explore" className={QUIET_LINK} style={{ color: "var(--accent-subtle)" }}>Explore careers <ChevronRight className="h-4 w-4" aria-hidden /></Link>}
        />
        {saved.length ? (
          <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={INSET}>
            {saved.map((c, i) => (
              <CareerRow
                key={c.id}
                career={c}
                first={i === 0}
                onOpen={() => open(c, saved)}
                trailing={
                  <button type="button" onClick={() => onAddToTop3(c.id)} className="dm-tap relative z-[6] flex min-h-[36px] flex-none cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] border px-[12px] text-[13px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--foreground) 24%, transparent)", color: "var(--foreground)" }}>
                    <Plus className="h-[14px] w-[14px]" aria-hidden /> Add to Top 3
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyGroup text="Nothing saved yet. Tap Save on a career in Explore and it shows up here." cta="Explore careers" href="/explore" />
        )}
      </section>
    </div>
  );
}

function CareerRow({ career, rank, first, onOpen, trailing }: { career: ProfileCareer; rank?: number; first: boolean; onOpen: () => void; trailing?: React.ReactNode }) {
  return (
    <div className="dm-quiet group relative flex min-h-[64px] items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-2)]" style={{ borderTop: first ? undefined : "1px solid var(--inset-border)" }}>
      {/* the row opens the career; the trailing control sits above it */}
      <button type="button" onClick={onOpen} aria-label={`Open ${career.title}`} className="absolute inset-0 z-[5] cursor-pointer" />
      {rank !== undefined && <span className="w-[16px] flex-none text-center text-[15px] font-extrabold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{rank}</span>}
      <span aria-hidden className="relative block h-[44px] w-[44px] flex-none overflow-hidden rounded-[var(--radius-sm)]">
        <FacePhoto src={career.photo} sizes="44px" className="object-cover" fallback={career.photoFocus ?? "50% 25%"} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] leading-[20px] font-bold">{career.title}</span>
        <span className="truncate text-[12.5px] leading-[17px] font-semibold" style={{ color: WORLD_COLORS[career.world] ? worldInk(WORLD_COLORS[career.world]) : "var(--muted-foreground)" }}>{career.world}</span>
      </span>
      {trailing}
    </div>
  );
}

function EmptyGroup({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-6)] text-center" style={{ borderColor: "var(--glass-border)" }}>
      <p className="max-w-[360px] text-[15px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{text}</p>
      <Link href={href} className="dm-tap flex min-h-[40px] items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
        <Compass className="h-4 w-4" aria-hidden /> {cta}
      </Link>
    </div>
  );
}

// --------------------------------------------------------------- College Goal

export type CollegeGoal = {
  schools: { c: College; bucket: GoalBucket }[];
  top: College | null;
  setTop: (slug: string | null) => void;
  move: (slug: string, bucket: GoalBucket) => void;
};

export function useCollegeGoal(): CollegeGoal {
  const [savedSlugs] = useSavedColleges();
  const [topSlug, setTop] = useTopSchool();
  const [buckets, move] = useGoalBuckets();
  const profile = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  const gpa = parseGpa(profile.gpa || ACADEMIC_RECORD.gpa);
  // newest save first, the way the Saved tab lists them
  const slugs = useMemo(() => [...savedSlugs].reverse(), [savedSlugs]);
  const colleges = useResolvedColleges(slugs);
  return useMemo(() => {
    const schools = colleges.map((c) => ({ c, bucket: buckets[c.slug] ?? defaultBucket(c, gpa) }));
    const top = schools.find((s) => s.c.slug === topSlug)?.c ?? null;
    return { schools, top, setTop, move };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setTop/move are fresh closures over their own stores
  }, [colleges, topSlug, buckets, gpa]);
}

export function CollegeGoalView({ goal, onBack, backLabel, embedded = false, goalNext }: { goal: CollegeGoal; onBack?: () => void; /** where Back returns, when it isn't About Me */ backLabel?: string; /** v2: inside Saved > Schools, so no Back and no page title */ embedded?: boolean; /** v2 About Me: the #1 school is the College Goal; this is the step after it (Explore) */ goalNext?: () => void }) {
  const router = useRouter();
  const allColleges = goal.schools.map((s) => s.c);
  const open = (c: College) => { if (!openSchoolPeek(c, allColleges)) router.push(`/colleges/${c.slug}`); };
  const top = goal.top;
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {!embedded && onBack && <BackLink onBack={onBack} label={backLabel} />}
      {!embedded && <h3 className="text-[24px] leading-[29px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>College Goal</h3>}

      {goal.schools.length === 0 ? (
        <ArtCard eyebrow="My schools" title="No schools yet" line="Save schools in Explore. They show up here, ready to sort.">
          <Link href="/colleges" className="dm-tap flex min-h-[44px] w-fit items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)", textShadow: "none" }}>
            <Compass className="h-4 w-4" aria-hidden /> Explore schools
          </Link>
        </ArtCard>
      ) : (
        <>
          {top ? (
            <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "color-mix(in srgb, var(--primary) 40%, rgba(255,255,255,0.16))", background: "var(--scrim-deep, #0e0c20)", color: "var(--scrim-ink, #fff)", textShadow: CARD_TEXT_SHADOW }}>
              <span aria-hidden className="absolute inset-0">
                <GoalSchoolPicture c={top} sizes="(min-width: 1024px) 1100px, 100vw" align="right" />
                <CardProgressiveBlur size="66%" />
                <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(var(--scrim-rgb, 12 16 35) / calc(0.92 * var(--scrim-gain, 1))) 0%, rgb(var(--scrim-rgb, 12 16 35) / calc(0.5 * var(--scrim-gain, 1))) 45%, transparent 80%)" }} />
              </span>
              <div className="relative flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
                <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>
                  {goalNext && <Check className="h-[14px] w-[14px]" aria-hidden />}
                  {goalNext ? "My College Goal" : "My #1 school"}
                </span>
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{top.name}</span>
                  <span className="text-[14px] font-semibold" style={{ color: "var(--scrim-ink-soft, rgba(255,255,255,0.82))" }}>{top.city}, {top.state}</span>
                </span>
                <span className="flex flex-wrap gap-[var(--space-2)]" style={{ textShadow: "none" }}>
                  {/* v2: setting the goal is the card's main action; once set,
                     the next step is. View school steps back to glass. */}
                  {goalNext && (
                    <button type="button" onClick={goalNext} className="dm-tap flex min-h-[44px] cursor-pointer items-center gap-[3px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      Next: Explore <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  <button type="button" onClick={() => open(top)} className="dm-tap flex min-h-[44px] cursor-pointer items-center gap-[3px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={goalNext ? { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", color: "var(--primary-foreground)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } : { background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    View school <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              </div>
            </div>
          ) : (
            // the #1 slot, waiting: the school fallback art where the campus
            // photo will be, and the one thing to do (the star below glows)
            <ArtCard eyebrow="My #1 school" title="Pick your #1 school" line={<>Tap the <Star className="mx-[2px] inline h-[15px] w-[15px] -translate-y-[1px]" aria-label="star" /> next to a school below.</>} />
          )}

          <section className="flex flex-col gap-[var(--space-3)]">
            <GroupHead
              title="My schools"
              count={`${goal.schools.length}`}
              action={<Link href="/colleges" className={QUIET_LINK} style={{ color: "var(--accent-subtle)" }}>Explore schools <ChevronRight className="h-4 w-4" aria-hidden /></Link>}
            />
            <SchoolsPanel goal={goal} onOpen={open} />
          </section>
        </>
      )}
    </div>
  );
}

/** The school-card fallback art (CollegePlaceholder) in a box of any shape.
 *  It is drawn square and fills by cropping, so on a short, wide card the
 *  hall lost its dome and steps (Chandu, 19 Oct 2026: "the college goal
 *  graphic is getting cropped"). Here it stays square at the card's full
 *  height, its sides feathered into the art's own ground colour, which the
 *  box is painted with (light mode included, through the same --cp-*). */
// exported for the component lab
export function HallArt({ align = "center" }: { align?: "center" | "right" }) {
  return (
    <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(var(--cp-ground, #000105), var(--cp-ground-2, #03070f))" }}>
      <span
        className="absolute inset-y-0 block aspect-square h-full max-w-none"
        style={{
          ...(align === "right" ? { right: "4%" } : { left: "50%", transform: "translateX(-50%)" }),
          maskImage: "linear-gradient(to right, transparent, #000 22%, #000 78%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 22%, #000 78%, transparent)",
        }}
      >
        <CollegePlaceholder className="absolute inset-0 h-full w-full" />
      </span>
    </span>
  );
}

/** A goal-sized school picture: the campus photo, or, with none, the
 *  fallback art kept whole (HallArt) instead of cropped to the card. */
// exported for the component lab
export function GoalSchoolPicture({ c, sizes, align = "center" }: { c: College; sizes: string; align?: "center" | "right" }) {
  return collegeImage(c) ? <CollegePicture c={c} sizes={sizes} className="absolute inset-0 h-full w-full" /> : <HallArt align={align} />;
}

/** A College Goal space with no photo yet: the school-card fallback art
 *  (CollegePlaceholder, the lit hall) at hero size, with what goes here. */
function ArtCard({ eyebrow, title, line, children }: { eyebrow: string; title: string; line: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "var(--scrim-deep, #0e0c20)", color: "var(--scrim-ink, #fff)", textShadow: CARD_TEXT_SHADOW }}>
      <span aria-hidden className="absolute inset-0">
        <HallArt align="right" />
        <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,1,5,0.9) 0%, rgba(0,1,5,0.4) 45%, transparent 80%)" }} />
      </span>
      <div className="relative flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
        <span className="text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>{eyebrow}</span>
        <span className="flex flex-col gap-[4px]">
          <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <span className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--scrim-ink-soft, rgba(255,255,255,0.82))" }}>{line}</span>
        </span>
        {children}
      </div>
    </div>
  );
}

/** My schools in My Build's finish (Chandu, 19 Oct 2026: "give the my
 *  schools tab also the premium finish we gave for my build"): one panel on
 *  Build's sky, Reach / Target / Likely as three columns split by hairlines,
 *  the gradient heading ink, and heading > school > city by size. Below
 *  desktop the three lists sit behind a switch, one at a time, instead of a
 *  long stack (the rows carry Move and the star, so they need the width). */
function SchoolsPanel({ goal, onOpen }: { goal: CollegeGoal; onOpen: (c: College) => void }) {
  const lookV2 = useLookV2();
  const lists = BUCKETS.map((b) => goal.schools.filter((s) => s.bucket === b.id));
  const [picked, setPicked] = useState<number | null>(null);
  // until the student picks, the switch opens on the first list with schools
  const shown = picked ?? Math.max(0, lists.findIndex((l) => l.length > 0));
  // Teach the two controls on the first school, once: Move, then the star.
  const panel = useRef<HTMLDivElement>(null);
  // With no #1 yet the star is the step that matters, so it goes first.
  const [spot, stopSpot] = useSpotSequence("dreamari:nudge:my-schools", (goal.top ? ["move", "star"] : ["star", "move"]) as ("move" | "star")[], panel, goal.schools.length > 0);
  return (
    <div ref={panel} className="relative isolate grid overflow-hidden rounded-[var(--radius-lg)] border lg:grid-cols-3" style={{ borderColor: "var(--glass-border)" }}>
      <ThemeProvider>
        <div aria-hidden className="myb-sky">
          <BackgroundSpace />
          <AuroraBackground accent={(lookV2 ? STAGE_ACCENTS_V2 : STAGE_ACCENTS).education} visitedAccents={[]} lightning={false} />
        </div>
      </ThemeProvider>
      <div className="px-[var(--space-5)] pt-[var(--space-5)] lg:hidden">
        <Segmented ariaLabel="School list" value={String(shown)} onChange={(v) => setPicked(Number(v))} options={BUCKETS.map((b, i) => ({ key: String(i), label: `${b.label} ${lists[i].length}` }))} grow />
      </div>
      {BUCKETS.map((b, bi) => {
        const list = lists[bi];
        return (
          <div key={b.id} className={`${bi === shown ? "flex" : "hidden"} min-w-0 flex-col gap-[var(--space-2)] px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-5)] lg:flex lg:px-[var(--space-6)] lg:py-[var(--space-6)] ${bi ? "lg:border-l" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex flex-col gap-[2px] pb-[var(--space-1)]">
              <span className="flex items-center gap-[8px]">
                <span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: b.color, boxShadow: `0 0 10px ${b.color}` }} />
                {/* on phones and tablets the switch names the list */}
                <h4 className="hidden w-fit pb-[2px] text-[18px] leading-[23px] font-extrabold lg:block" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{b.label}</h4>
                <span className="hidden text-[14px] font-semibold tabular-nums lg:inline" style={{ color: "var(--muted-foreground)" }}>{list.length}</span>
                <span className="text-[14px] leading-[19px] lg:hidden" style={{ color: "var(--muted-foreground)" }}>{b.note}</span>
              </span>
              <span className="hidden text-[14px] leading-[19px] lg:block" style={{ color: "var(--muted-foreground)" }}>{b.note}</span>
            </div>
            {list.length ? list.map(({ c }, i) => (
              <SchoolRow
                key={c.slug} c={c} bucket={b.id} isTop={goal.top?.slug === c.slug} onOpen={() => onOpen(c)}
                spot={bi === shown && i === 0 ? spot : null}
                // no #1 yet: after the tooltip, the first star keeps glowing
                starGlow={!goal.top && bi === shown && i === 0}
                onStar={() => { stopSpot(); goal.setTop(goal.top?.slug === c.slug ? null : c.slug); }}
                onMove={(next) => { stopSpot(); goal.move(c.slug, next); }}
              />
            )) : (
              <p className="py-[8px] text-[14px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>None here yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SchoolRow({ c, bucket, isTop, onOpen, onStar, onMove, spot = null, starGlow = false }: { c: College; bucket: GoalBucket; isTop: boolean; onOpen: () => void; onStar: () => void; onMove: (b: GoalBucket) => void; /** the first-visit nudge lighting one of this row's controls */ spot?: "move" | "star" | null; /** the star is the step to take now */ starGlow?: boolean }) {
  const others = BUCKETS.filter((b) => b.id !== bucket).map((b) => b.label);
  return (
    <div className="dm-quiet group relative -mx-[10px] flex min-h-[60px] items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[10px] py-[8px]">
      <button type="button" onClick={onOpen} aria-label={`Open ${c.name}`} className="absolute inset-0 z-[5] cursor-pointer rounded-[var(--radius-md)]" />
      {/* no thumbnail on phones: the name needs the width more */}
      <span className="hidden flex-none sm:block"><CollegePicture c={c} sizes="44px" className="h-[44px] w-[44px] overflow-hidden rounded-[var(--radius-sm)]" /></span>
      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
        {/* two lines before it clips: in three columns one line cut most names */}
        <span className="line-clamp-2 text-[15px] leading-[20px] font-semibold">{c.name}</span>
        <span className="truncate text-[14px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{c.city}, {c.state}</span>
      </span>
      <span className="relative z-[6] flex flex-none items-center gap-[2px]">
        {/* "Move", not the current bucket: the column already says that */}
        <span className="relative">
          <Listbox
            value=""
            placeholder="Move"
            onChange={(v) => onMove(v as GoalBucket)}
            options={BUCKETS.filter((b) => b.id !== bucket).map((b) => ({ value: b.id, label: `Move to ${b.label}` }))}
            ariaLabel={`Move ${c.name} to Reach, Target or Likely`}
            className={`dm-quiet flex h-[32px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] px-[8px] text-[13px] font-bold ${spot === "move" ? "dm-spot" : ""}`}
            style={{ color: spot === "move" ? "#fff" : "var(--muted-foreground)" }}
          />
          {spot === "move" && <SpotTip side="right" top={-46}>Move to {others.join(" or ")}</SpotTip>}
        </span>
        <span className="relative">
          <IconTip label={isTop ? "Your #1 school" : "Make my #1"}>
            <button type="button" onClick={onStar} aria-pressed={isTop} aria-label={isTop ? `${c.name} is your #1 school. Tap to clear` : `Make ${c.name} your #1 school`} className={`dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-md)] ${spot === "star" ? "dm-spot" : starGlow && spot !== "move" ? "dm-spot-ring" : ""}`} style={{ color: spot === "star" ? "#fff" : isTop ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
              <Star className="h-[18px] w-[18px]" fill={isTop ? "currentColor" : "none"} aria-hidden />
            </button>
          </IconTip>
          {spot === "star" && <SpotTip side="right" top={-48}>{isTop ? "Your #1 school. Tap to change" : "Make it your #1"}</SpotTip>}
        </span>
      </span>
    </div>
  );
}
