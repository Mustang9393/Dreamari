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
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ChevronRight, GraduationCap, Briefcase, Pencil, Plus, Star, Compass } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { useRouter, useSearchParams } from "next/navigation";
import { FacePhoto } from "@/components/app/FacePhoto";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { Listbox } from "@/components/app/Listbox";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { openCareerPeek, openSchoolPeek } from "@/components/app/peek";
import { WORLD_COLORS } from "@/components/app/worlds";
import { COLLEGES, collegeImage, type College } from "@/components/colleges/data";
import { useResolvedColleges } from "@/components/colleges/dataset";
import { CollegePlaceholder } from "@/components/colleges/CollegePlaceholder";
import { CollegePicture, useGoalBuckets, useSaved as useSavedColleges, useTopSchool, type GoalBucket } from "@/components/colleges/shared";
import { fitFor, parseGpa } from "@/components/colleges/pathway";
import { useBackStep } from "@/lib/backStep";
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
  // balanced 3 / 3 / 4 (Chandu: "can we arrange the different data better?"):
  // what you're into, how you'll work, where school takes you
  { title: "What you like", short: "Likes", lines: [{ id: "interests", label: "Career fields" }, { id: "subjects", label: "Subjects" }, { id: "skills", label: "Skills to build" }] },
  { title: "How you work", short: "Work", lines: [{ id: "workVibe", label: "Work style" }, { id: "software", label: "Software to learn" }, { id: "jobs", label: "Internships & jobs" }] },
  { title: "Your path", short: "Path", lines: [{ id: "education", label: "Education" }, { id: "location", label: "Location" }, { id: "school", label: "School" }, { id: "cost", label: "Tuition" }] },
];

type View = "home" | "career" | "college";

export function AboutMeTab({ top3, primary, saved, onAddToTop3, onGoTab, onOpenBuild }: {
  /** Top 3 in rank order */
  top3: ProfileCareer[];
  /** the #1 career the student picked; null until they pick one (a Top 3 alone doesn't set it) */
  primary: ProfileCareer | null;
  /** saved careers not in the Top 3, newest first */
  saved: ProfileCareer[];
  onAddToTop3: (id: string) => void;
  onGoTab: (tab: "top3" | "report") => void;
  onOpenBuild: (section?: BuildSection) => void;
}) {
  // ?goal=career|college opens straight on that goal: Explore Schools' "See
  // saved" and a career's "View saved" land where the save was filed.
  const goalParam = useSearchParams()?.get("goal");
  const [view, setView] = useState<View>(goalParam === "career" || goalParam === "college" ? goalParam : "home");
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

  const college = useCollegeGoal();

  if (view === "career") return <CareerGoalView top3={top3} saved={saved} onBack={() => setView("home")} onAddToTop3={onAddToTop3} onGoTab={onGoTab} />;
  if (view === "college") return <CollegeGoalView goal={college} onBack={() => setView("home")} />;

  const demoCollegePicture = college.top ?? college.schools.find((s) => collegeImage(s.c))?.c ?? COLLEGES.find((c) => collegeImage(c)) ?? null;
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
            // No #1 school yet. Production: the school cards' hall (Chandu, 19
            // Oct 2026: "this should be used for schools/college goal").
            // DEMO-ONLY: the demo shows a real campus photo instead, the first
            // saved school with one, else the first hand-built school with one
            // (Chandu: "The vercel should not show any using the fallbacks
            // though. Since its the demo we want pictures everywhere").
            picture={demoCollegePicture ? <CollegePicture c={demoCollegePicture} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full" /> : <CollegePlaceholder dark wide className="absolute inset-0" />}
            onOpen={() => go("college")}
            openLabel="Open College Goal"
          />
        </div>
      </section>

      <section aria-labelledby="about-build" className="flex flex-col gap-[var(--space-3)]">
        {/* No Edit My Build button (Chandu, 19 Oct 2026: "Remove the edit my
           build CTA. It can all be done in the thing right?"): every answer
           below opens its own section of the editor. */}
        <SectionHead id="about-build" title="My Build" sub="What Dreamari uses to pick your matches." />
        <BuildSummary onOpen={onOpenBuild} />
      </section>
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
function GoalCard({ kind, Icon, title, picture, accent, onOpen, openLabel }: {
  kind: string; Icon: typeof Briefcase; title: string; picture: React.ReactNode; accent?: string; onOpen: () => void; openLabel: string;
}) {
  return (
    <HoverBeam className="h-full">
      <button type="button" onClick={onOpen} aria-label={`${openLabel}: ${title}`} className="dm-tap group relative flex h-full min-h-[220px] w-full cursor-pointer md:min-h-[300px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left" style={{ borderColor: "var(--glass-border)", background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 26%, #0e0c20) 0%, #0e0c20 62%)", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
        {picture && (
          <span aria-hidden className="absolute inset-0">
            {picture}
            <CardProgressiveBlur size="62%" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.92) 0%, rgba(12,16,35,0.55) 40%, rgba(12,16,35,0.05) 75%)" }} />
          </span>
        )}
        <span className="relative flex flex-col gap-[6px] p-[var(--space-5)]">
          <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: accent ?? "var(--accent-subtle)" }}>
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
  const lookV2 = useLookV2();
  // phones: one group at a time behind a switch instead of ten stacked rows
  // (Chandu: "The layout needs to be better on mobile and tablet. Long
  // scrolling isnt the best way."); from sm (640px, tablets) all three columns
  const [shown, setShown] = useState(0);
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
  return (
    <div className="relative isolate grid overflow-hidden rounded-[var(--radius-lg)] border sm:grid-cols-3" style={{ borderColor: "var(--glass-border)" }}>
      {/* Build's own sky, the same one the Edit My Build sheet wears (Chandu,
         19 Oct 2026: "please use the same color background thing we did for
         the my build when you click on edit"), clipped to the panel */}
      <ThemeProvider>
        <div aria-hidden className="myb-sky">
          <BackgroundSpace />
          <AuroraBackground accent={(lookV2 ? STAGE_ACCENTS_V2 : STAGE_ACCENTS).interests} visitedAccents={[]} lightning={false} />
        </div>
      </ThemeProvider>
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
          {g.lines.map((line) => {
            const value = valueOf(line.id);
            const empty = !value.trim();
            return (
              <button
                key={line.id}
                type="button"
                onClick={() => onOpen(line.id)}
                aria-label={`${line.label}: edit`}
                className="dm-quiet group -mx-[10px] flex cursor-pointer items-start gap-[var(--space-2)] rounded-[var(--radius-md)] px-[10px] py-[8px] text-left"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{line.label}</span>
                  <span className="text-[14px] leading-[20px] font-normal" style={{ color: empty ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{empty ? "Add" : value}</span>
                </span>
                {/* always there, brighter on hover: says the row edits
                   ("its not clear that the different sections are clickable") */}
                <Pencil className="mt-[3px] h-[14px] w-[14px] flex-none opacity-45 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" style={{ color: "var(--accent-subtle)" }} aria-hidden />
              </button>
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

const QUIET_LINK = "dm-quiet flex flex-none cursor-pointer items-center gap-[2px] rounded-[var(--radius-md)] px-[8px] py-[4px] text-[14px] font-bold";

// ---------------------------------------------------------------- Career Goal

function CareerGoalView({ top3, saved, onBack, onAddToTop3, onGoTab }: {
  top3: ProfileCareer[]; saved: ProfileCareer[]; onBack: () => void; onAddToTop3: (id: string) => void; onGoTab: (tab: "top3" | "report") => void;
}) {
  const router = useRouter();
  const primary = top3[0] ?? null;
  const open = (c: ProfileCareer, row: ProfileCareer[]) => { if (!openCareerPeek(c.id, row.map((x) => x.id))) router.push(`/career/${c.id}`); };
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <BackLink onBack={onBack} />
      <h3 className="text-[24px] leading-[29px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Career Goal</h3>

      {primary ? (
        <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: `color-mix(in srgb, ${WORLD_COLORS[primary.world] ?? "var(--primary)"} 40%, rgba(255,255,255,0.16))`, background: "#0e0c20", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
          <span aria-hidden className="absolute inset-0">
            <FacePhoto src={primary.photo} sizes="(min-width: 1024px) 1100px, 100vw" className="object-cover" fallback={primary.photoFocus ?? "50% 30%"} />
            <CardProgressiveBlur size="66%" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.92) 0%, rgba(12,16,35,0.5) 45%, transparent 80%)" }} />
          </span>
          <div className="relative flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
            <span className="text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: WORLD_COLORS[primary.world] ?? "var(--accent-subtle)" }}>Primary career</span>
            <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{primary.title}</span>
            <span className="flex flex-wrap gap-[var(--space-2)]" style={{ textShadow: "none" }}>
              <Link href={`/career/${primary.id}`} className="dm-tap flex min-h-[40px] items-center gap-[3px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                Learn more <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <button type="button" onClick={() => onGoTab("report")} className="dm-tap flex min-h-[40px] cursor-pointer items-center gap-[3px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold" style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)", color: "#fff", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
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
        <span className="truncate text-[12.5px] leading-[17px] font-semibold" style={{ color: WORLD_COLORS[career.world] ?? "var(--muted-foreground)" }}>{career.world}</span>
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

export function CollegeGoalView({ goal, onBack, backLabel, embedded = false }: { goal: CollegeGoal; onBack?: () => void; /** where Back returns, when it isn't About Me */ backLabel?: string; /** v2: inside Saved > Schools, so no Back and no page title */ embedded?: boolean }) {
  const router = useRouter();
  const allColleges = goal.schools.map((s) => s.c);
  const open = (c: College) => { if (!openSchoolPeek(c, allColleges)) router.push(`/colleges/${c.slug}`); };
  const top = goal.top;
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {!embedded && onBack && <BackLink onBack={onBack} label={backLabel} />}
      {!embedded && <h3 className="text-[24px] leading-[29px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>College Goal</h3>}

      {goal.schools.length === 0 ? (
        <EmptyGroup text="No schools yet. Save a school in Explore Schools and it shows up here, ready to sort." cta="Explore schools" href="/colleges" />
      ) : (
        <>
          {top ? (
            <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "color-mix(in srgb, var(--primary) 40%, rgba(255,255,255,0.16))", background: "#0e0c20", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
              <span aria-hidden className="absolute inset-0">
                <CollegePicture c={top} sizes="(min-width: 1024px) 1100px, 100vw" className="absolute inset-0 h-full w-full" />
                <CardProgressiveBlur size="66%" />
                <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.92) 0%, rgba(12,16,35,0.5) 45%, transparent 80%)" }} />
              </span>
              <div className="relative flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
                <span className="text-[12px] leading-[16px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>My #1 school</span>
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{top.name}</span>
                  <span className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.82)" }}>{top.city}, {top.state}</span>
                </span>
                <span className="flex flex-wrap gap-[var(--space-2)]" style={{ textShadow: "none" }}>
                  <button type="button" onClick={() => open(top)} className="dm-tap flex min-h-[40px] cursor-pointer items-center gap-[3px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    View school <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-[8px] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] leading-[20px] font-semibold" style={INSET}>
              <Star className="h-4 w-4 flex-none" style={{ color: "var(--accent-subtle)" }} aria-hidden />
              Tap the star on a school to make it your #1.
            </p>
          )}

          <section className="flex flex-col gap-[var(--space-3)]">
            <GroupHead
              title="My schools"
              count={`${goal.schools.length}`}
              action={<Link href="/colleges" className={QUIET_LINK} style={{ color: "var(--accent-subtle)" }}>Explore schools <ChevronRight className="h-4 w-4" aria-hidden /></Link>}
            />
            {/* Three lists side by side, one height (cards in a row share a
               height); stacked on phones. */}
            <div className="grid items-stretch gap-[var(--space-3)] lg:grid-cols-3">
              {BUCKETS.map((b) => {
                const list = goal.schools.filter((s) => s.bucket === b.id);
                return (
                  <div key={b.id} className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={INSET}>
                    <div className="flex items-center gap-[8px] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-2)]">
                      <span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                      <span className="text-[15px] font-extrabold">{b.label}</span>
                      <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{list.length}</span>
                      <span className="ml-auto text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{b.note}</span>
                    </div>
                    {list.length ? list.map(({ c }) => (
                      <SchoolRow key={c.slug} c={c} bucket={b.id} isTop={goal.top?.slug === c.slug} onOpen={() => open(c)} onStar={() => goal.setTop(goal.top?.slug === c.slug ? null : c.slug)} onMove={(next) => goal.move(c.slug, next)} />
                    )) : (
                      <p className="flex flex-1 items-center px-[var(--space-4)] pb-[var(--space-4)] text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>None here yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SchoolRow({ c, bucket, isTop, onOpen, onStar, onMove }: { c: College; bucket: GoalBucket; isTop: boolean; onOpen: () => void; onStar: () => void; onMove: (b: GoalBucket) => void }) {
  return (
    <div className="dm-quiet group relative flex min-h-[64px] items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-2)]" style={{ borderTop: "1px solid var(--inset-border)" }}>
      <button type="button" onClick={onOpen} aria-label={`Open ${c.name}`} className="absolute inset-0 z-[5] cursor-pointer" />
      {/* no thumbnail on phones: the name needs the width more */}
      <span className="hidden flex-none sm:block"><CollegePicture c={c} sizes="44px" className="h-[44px] w-[44px] rounded-[var(--radius-sm)]" /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        {/* two lines before it clips: in three columns one line cut most names */}
        <span className="line-clamp-2 text-[15px] leading-[19px] font-bold">{c.name}</span>
        <span className="truncate text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.city}, {c.state}</span>
      </span>
      <span className="relative z-[6] flex flex-none items-center gap-[2px]">
        {/* "Move", not the current bucket: the column already says that */}
        <Listbox
          value=""
          placeholder="Move"
          onChange={(v) => onMove(v as GoalBucket)}
          options={BUCKETS.filter((b) => b.id !== bucket).map((b) => ({ value: b.id, label: `Move to ${b.label}` }))}
          ariaLabel={`Move ${c.name} to Reach, Target or Likely`}
          className="dm-quiet flex h-[32px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] px-[8px] text-[13px] font-bold"
          style={{ color: "var(--muted-foreground)" }}
        />
        <IconTip label={isTop ? "Your #1 school" : "Make my #1"}>
          <button type="button" onClick={onStar} aria-pressed={isTop} aria-label={isTop ? `${c.name} is your #1 school. Tap to clear` : `Make ${c.name} your #1 school`} className="dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-md)]" style={{ color: isTop ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
            <Star className="h-[18px] w-[18px]" fill={isTop ? "currentColor" : "none"} aria-hidden />
          </button>
        </IconTip>
      </span>
    </div>
  );
}
