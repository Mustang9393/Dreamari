"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { AVATAR_POOL, useStudentAvatarSrc, writeAvatarOverride } from "@/lib/avatar";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { UndoToast } from "@/components/app/UndoToast";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SparkBar } from "@/components/flow/SparkBar";
import { NextStepBanner } from "@/components/app/NextStepBanner";
import { HoverBeam } from "@/components/app/HoverBeam";
import { BorderBeam } from "border-beam";
import { AnimatePresence, motion } from "framer-motion";
import { useStage, writeStage } from "@/lib/stage";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { simulationFor } from "@/components/play/games";
import { ArrowLeftRight, ChevronRight, ArrowUpRight, Bookmark, BadgeCheck, BookOpen, Check, ChevronDown, Compass, Flame, Gamepad2, GraduationCap, MoreVertical, Pencil, Plane, Play, Plus, Printer, Settings, Shield, Sparkles, Star, Users, Wrench, X, ImagePlus, AlertTriangle, RefreshCw, UserRound, Lock, type LucideIcon } from "lucide-react";
import { DesktopNavigation, MobileHeaderShell, MobileNav, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { InkText } from "@/components/build/ui";
import { Listbox } from "@/components/app/Listbox";
import { DEMO_ALWAYS_SHOW_SPLASH, demoSeenThisSession, markDemoSeenThisSession, WelcomeSplash } from "@/components/app/WelcomeSplash";
import { deleteArchivedProfile, profileArchiveSnapshot, restoreArchivedProfile, serverProfileArchiveSnapshot, serverStudentProfileSnapshot, studentProfileSnapshot, subscribeProfileArchive, subscribeStudentProfile, writeStudentProfile, type StudentProfile } from "@/lib/studentProfile";
import { GPA_OPTIONS, TRAVEL_DISTANCE_OPTIONS } from "@/components/build/types";
import { playMilestoneChime } from "@/components/build/sound";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS, careerReport, DEMO_TOP3, interestTier, routeDetail, STUDENT, type PlanTask, type ProfileCareer, strongestCareerId } from "./data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks, writePicks } from "@/lib/picks";
import { CareerReportView, ComparisonTable, Portal, REPORT_SECTIONS } from "./CareerReport";
import { collegePlan, gradePlan, type CollegeYear, type GradeStep, type PlanStage } from "./gradePlanData";
import { SeasonScene, SEASON_STYLE } from "./SeasonScene";
import { EventStubs } from "./EventStubs";
import { ResumeExperience } from "@/components/resume/ResumeExperience";
import { EVENTS } from "@/components/connect/data";
import { collegeBySlug, collegeImage } from "@/components/colleges/data";
import { SaveButton, tags as collegeTags, useSaved as useSavedColleges } from "@/components/colleges/shared";
import { COMPANY_VIDEOS } from "@/components/app/companyVideos";
import { useSavedVideos } from "@/lib/savedVideos";
import { useSavedCareers } from "@/lib/savedCareers";
import { resumeSnapshot, serverResumeSnapshot, subscribeResume } from "@/lib/resume";
import {
  ACADEMIC_RECORD,
  EVIDENCE,
  EVIDENCE_KIND_LABEL,
  reportV2,
  type EvidenceItem,
} from "./report-data";

// My Profile, round 2: scannable and visual. No paragraphs, no em dashes.
// Evidence renders as receipt tiles, routes disclose progressively with a
// Compare view (labeled single-hue bars), the plan opens only the current
// horizon, and the Career Locker is its own tab plus a strip at the end of
// Overview. College Lookup CTAs point at /colleges (feature in the works).

type TabId = "overview" | "top3" | "routes" | "plan" | "report" | "locker" | "resume" | "settings";

function careerById(id: string | null): ProfileCareer | null {
  return ALL_PROFILE_CAREERS.find((career) => career.id === id) ?? null;
}


// SOLID section surface (direct feedback): key containers stopped being
// translucent -- page gradient -> solid card -> lighter nested rows is the
// hierarchy, with glass kept for atmosphere rather than reading surfaces.
// Semi-transparent (not the opaque var(--card)) so the page's colorful
// backdrop gradient bleeds through, same as every other bright page's cards
// (Home/Explore/Connect/Signup/Report all use glass-surface-3 for this, never
// flat --card) -- an opaque fill here was blocking that gradient under every
// stacked card, which is why the page read as flat/dark despite sharing the
// exact same background gradient string as Home.
// The career page's frosted panel: one recipe for every section here too.
/** A group inside the tab card: a border on the shared surface, no second
 *  layer of glass (direct feedback, 4 Sept: glass on glass read as disjointed). */
// The fill is the career report's paper (#1e2431) at a little transparency so
// it stays in the glass family: a darker, sunken step inside the tab card.
const INSET = { background: "var(--inset-surface)", borderColor: "var(--inset-border)" } as const;
/** Brighter frosted glass for the Top 3 cards' Learn more / Get Career Report
 *  (direct feedback, 11 Sept 2026): white at 14% over the blur, nothing dark
 *  underneath (a glass-surface-3 layer read as black), a lighter edge and a
 *  hairline highlight on top. */
const FROST = { background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)", color: "var(--foreground)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" } as const;
const GLASS = { background: "var(--glass-surface-2)", backdropFilter: "blur(24px) saturate(1.65)", WebkitBackdropFilter: "blur(24px) saturate(1.65)", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" } as const;

// Covers a student can pick for their header: one procedurally-rendered
// material left (scripts/qa/render-profile-covers.js -- the rest of that
// batch, plus streaks/frosted/horizon, were rejected on sight, direct
// feedback 20 Sept) plus real curated photography from Unsplash -- abstract
// (light, glass, ink, paint) kept dominant per direct instruction, landscape/
// nature as a smaller supplement, nothing with a person in frame. No uploads.
// First in the list is the literal default (what SSR/first paint shows,
// picked to be the strongest single option -- direct instruction, 20 Sept:
// "the default one needs to be the coolest, for the demo"); a genuinely new
// profile then randomizes into a different one from the full list moments
// after mount (see the effect below), so a real new student doesn't just
// always see this same one either.
const COVERS = [
  "glass-refract",
  "ink-marble",
  "smoke",
  // abstract photography
  "gradient-glow", "bokeh-warm", "bokeh-blue", "prism-light", "fluid-paint", "ink-swirl",
  "crystal-glass", "crystal-macro", "neon-streak", "neon-tunnel", "smoke-color", "smoke-purple",
  // nature/landscape/space, no people
  "aurora-sky", "ocean-aerial", "desert-dunes", "starry-sky", "galaxy-space", "nebula-color",
].map((n) => `/images/profile/covers/${n}.webp`);
const COVER_KEY = "dreamari-cover";
/** the sentinel that means "use my #1 career's poster as the cover" */
const COVER_CAREER = "career";

// Where the Top 3 comes from, in order: the ?picks= handoff the report chooser
// navigates with (so the right career server-renders, no flash of someone
// else's), then stored picks on a later visit, and finally the demo default so
// /profile still stands up on its own with nothing saved.

const TAB_IDS: TabId[] = ["overview", "top3", "routes", "plan", "report", "locker", "resume", "settings"];
export function ProfileExperience({ initialPicks = [], initialFocus = null, initialTab, initialWelcome = false }: { initialPicks?: string[]; initialFocus?: string | null; initialTab?: string; initialWelcome?: boolean } = {}) {
  // Arriving from Match (?welcome=1): the page is assembled in front of the
  // student — title, then the identity card, then the tab card — with one
  // welcome line, instead of everything simply being there. Only for that
  // arrival; a normal visit renders at rest.
  // The welcome popup opens once the page has visibly begun assembling (so the
  // student sees the profile arrive first, then gets introduced to it), and
  // Continue simply dismisses it — the Top Three tab is already open under it.
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  // Demo: every visit shows the welcome, like the other tabs' splashes
  // (direct feedback, 10 Sept 2026: "the pop up isn't happening on my
  // profile"); once DEMO_ALWAYS_SHOW_SPLASH is off it's arrival-only again.
  useEffect(() => {
    if (!initialWelcome && !(DEMO_ALWAYS_SHOW_SPLASH && !demoSeenThisSession("dreamari:welcome:profile"))) return;
    const open = setTimeout(() => {
      setWelcomeOpen(true);
      playMilestoneChime();
    }, 900);
    return () => clearTimeout(open);
  }, [initialWelcome]);
  const dismissWelcome = () => {
    setWelcomeOpen(false);
    markDemoSeenThisSession("dreamari:welcome:profile");
    // so a refresh doesn't replay the introduction
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // nothing to tidy
    }
    // Then bring the Top Three itself into view (direct feedback, 5 Sept
    // 2026): the popup sat over the header, so on Continue the tabs and the
    // three cards scroll up to sit just under the fixed nav. Only on a real
    // arrival from Match; a plain visit stays where it is.
    if (!initialWelcome) return;
    window.requestAnimationFrame(() => {
      const tabs = tablistRef.current;
      if (!tabs) return;
      const top = tabs.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  };
  const buildIn = (order: number) =>
    initialWelcome
      ? { className: "motion-safe:animate-[card-cascade_0.7s_cubic-bezier(0.16,1,0.3,1)_both]", style: { animationDelay: `${180 + order * 220}ms` } as React.CSSProperties }
      : { className: "", style: {} as React.CSSProperties };
  // ?tab= from Home's Your Next Moves opens straight onto that tab
  const [tab, setTab] = useState<TabId>(initialTab && (TAB_IDS as string[]).includes(initialTab) ? (initialTab as TabId) : "overview");
  // DEMO-ONLY, session-only -- same pattern as the AT&T board's own
  // VersionChip (direct instruction, 20 Sept 2026). See
  // docs/HANDOFF_INDEX.md's Demo vs Production section.
  const [overviewVersion, setOverviewVersion] = useState<"v1" | "v2">("v1");
  // QA-only: overrides currentPlanWindowId()'s real-date result so the
  // season art can be checked without waiting for the calendar (direct
  // instruction, 20 Sept 2026: "a toggle... where i can cycle through
  // season so i can QA each seasons graphics"). null = use the real date.
  const [seasonOverride, setSeasonOverride] = useState<"fall" | "winter" | "spring" | null>(null);
  // Roadmap tasks link to /profile?tab=... from inside the profile itself;
  // follow the new tab when the URL changes under us (state adjusted during
  // render, the React-recommended shape, so no effect is needed).
  const [seenInitialTab, setSeenInitialTab] = useState(initialTab);
  // Which Settings section the gear menu asked for; Settings scrolls to it.
  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(null);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  // Screen position for the portaled settings menu (see settingsBtnRef
  // below) -- computed fresh each open, since the button can move (window
  // resize, scroll) between opens.
  const [settingsMenuPos, setSettingsMenuPos] = useState({ top: 0, right: 0 });
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  if (initialTab !== seenInitialTab) {
    setSeenInitialTab(initialTab);
    if (initialTab && (TAB_IDS as string[]).includes(initialTab)) setTab(initialTab as TabId);
  }
  // Screen-reader announcement when the focused career changes (a11y brief).
  const [announce, setAnnounce] = useState("");
  // Storage is an external store, so it is READ, never copied into state by an
  // effect: the handoff wins if there is one, then whatever they last chose,
  // then the demo default. Their own edits below layer on top of that.
  const fromHandoff = initialPicks.length > 0;
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const [edits, setEdits] = useState<{ ids: string[]; focus: string | null } | null>(null);
  const base = useMemo(() => {
    // focus null means "no primary chosen yet": the strongest match stands
    // in (Joshua, Slack, 11 Sept 2026), so every student has a Career Report
    // and a Plan from the first visit without being asked to pick.
    if (fromHandoff) return { ids: initialPicks, focus: initialFocus ?? null };
    const valid = stored.ids.filter((id) => ALL_PROFILE_CAREERS.some((career) => career.id === id));
    if (valid.length) return { ids: valid, focus: stored.focus && valid.includes(stored.focus) ? stored.focus : null };
    return { ids: DEMO_TOP3, focus: null as string | null };
  }, [fromHandoff, initialPicks, initialFocus, stored]);
  const top3 = edits?.ids ?? base.ids;
  /** the student's own choice, or null while the strongest match is the default */
  const chosenPrimaryId = edits ? edits.focus : base.focus;
  const primaryChosen = chosenPrimaryId !== null && top3.includes(chosenPrimaryId);
  // Algorithmic default: the highest Career Interest Score among the three.
  const strongestId = useMemo(() => strongestCareerId(top3), [top3]);
  const focusId = primaryChosen ? chosenPrimaryId : strongestId;
  const setTop3 = (next: string[] | ((previous: string[]) => string[])) =>
    setEdits((current) => {
      const previous = current ?? base;
      return { ids: typeof next === "function" ? next(previous.ids) : next, focus: previous.focus };
    });
  const setFocusId = (id: string | null) => setEdits((current) => ({ ids: (current ?? base).ids, focus: id }));
  const [routeChoice, setRouteChoice] = useState<Record<string, string>>({});
  // Build is already behind the student when the plan first opens, so the
  // steps marked doneByDefault start checked and no plan opens at 0%.
  const [done, setDone] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(ALL_PROFILE_CAREERS.map((c) => [c.id, c.plan.flatMap((h) => h.tasks.filter((task) => task.doneByDefault).map((task) => task.id))])),
  );
  const [swapCandidate, setSwapCandidate] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  // "Updated" pulses on every tab whose content just changed (focus swap
  // touches report + routes + plan; a route choice touches report + plan).
  // The tab currently in view is skipped: the change is visible live there.
  const [pings, setPings] = useState<Partial<Record<TabId, boolean>>>({});
  const pingTimer = useRef<number | null>(null);
  // Fade the tablist's right edge only while there's actually more to scroll
  // to -- a static fade would misrepresent state once the last tab (Resume)
  // is fully in view, reading as a cut-off pill rather than a genuine cue.
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  useEffect(() => {
    const el = tablistRef.current;
    if (!el) return;
    const update = () => setTabsOverflow(el.scrollWidth - el.scrollLeft - el.clientWidth > 2);
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  const tabRef = useRef<TabId>("overview");
  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);
  const pingMounted = useRef(false);
  const pingTabs = (targets: TabId[]) => {
    setPings(Object.fromEntries(targets.filter((target) => target !== tabRef.current).map((target) => [target, true])));
    if (pingTimer.current) window.clearTimeout(pingTimer.current);
    pingTimer.current = window.setTimeout(() => setPings({}), 2600);
  };
  useEffect(() => {
    if (!pingMounted.current) return;
    pingTabs(["overview", "routes", "plan", "report"]);
    const career = ALL_PROFILE_CAREERS.find((item) => item.id === focusId);
    if (career) {
      const timer = window.setTimeout(() => setAnnounce(`Showing ${career.title}. Overview, pathway and report updated.`), 0);
      return () => window.clearTimeout(timer);
    }
  }, [focusId]);
  useEffect(() => {
    if (!pingMounted.current) {
      pingMounted.current = true;
      return;
    }
    pingTabs(["overview", "routes", "plan", "report"]);
  }, [routeChoice]);
  const [reportOpen, setReportOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  // Student-owned report state. Local only: there is no persistence layer yet,
  // so this resets on reload (documented in the handoff).
  const [savedMajors, setSavedMajors] = useState<Set<string>>(new Set(["Finance"]));
  const [confirmedEvidence, setConfirmedEvidence] = useState<Set<string>>(() => new Set(EVIDENCE.filter((item) => item.confirmed).map((item) => item.id)));
  const [hiddenEvidence, setHiddenEvidence] = useState<Set<string>>(new Set());
  // Covers are curated backgrounds only (CEO, 4 Sept): no career-poster
  // switch, no uploads (inappropriate-content risk). The real app should
  // carry about 40 strong options; the prototype ships six.
  const [coverUrl, setCoverUrl] = useState<string>(COVERS[0]);
  // the last background picked, kept so both cover layers stay mounted and
  // the A/B switch is a crossfade, never a half-decoded swap
  const [bgUrl, setBgUrl] = useState<string>(COVERS[0]);
  // Self-heals a broken cover image instead of leaving the browser's own
  // broken-image glyph on screen forever (reported live on Vercel, 21 Sept
  // 2026: a stale localStorage value -- a blob: URL from the removed upload
  // feature, or any other now-invalid path -- survives the mount-time guard
  // below in some cases and the <img> simply fails to decode with no
  // fallback). Once either layer 404s, fall back to the known-good default
  // and stop persisting the bad value so it can't recur on the next visit.
  const [careerPhotoFailed, setCareerPhotoFailed] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  // Plays every time the student lands on their profile, not just once
  // (direct instruction, 20 Sept -- unlike Explore's "For you", which
  // permanently stops after first use): the cover is a low-stakes, repeat-
  // use customization, not a primary nav path someone only needs telling
  // about once.
  const coverNudge = !coverOpen;
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const avatarSeed = STUDENT.name.split(" ")[0] || STUDENT.name;
  const avatarSrc = useStudentAvatarSrc(avatarSeed);
  const pickAvatar = (src: string) => {
    writeAvatarOverride(src);
    setAvatarPickerOpen(false);
  };
  useEffect(() => {
    // the browser is the store for the prototype; read after mount so the
    // server render and the first paint match
    try {
      const saved = window.localStorage.getItem(COVER_KEY);
      // Allowlist, not a blocklist: only a value that is EXACTLY one of our
      // own known-good cover paths (or the career sentinel) is trusted.
      // The old check only rejected a "blob:" prefix, so any other stale or
      // unrecognized value -- a renamed/removed file, a leftover from a
      // dropped feature -- still made it through with nothing to fall back
      // on, which is exactly the bug reported live (broken cover, no self-
      // heal). Anything that fails this allowlist is treated the same as
      // "nothing saved yet".
      const trusted = saved === COVER_CAREER || COVERS.includes(saved ?? "");
      if (saved && trusted) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCoverUrl(saved); if (saved !== COVER_CAREER) setBgUrl(saved);
      } else {
        if (saved && !trusted) window.localStorage.removeItem(COVER_KEY);
        // A brand-new profile (no cover chosen yet) gets a random one from
        // the full set instead of everyone always landing on the same
        // first option -- picked once and persisted, so it's varied
        // student to student but stable for this one from here on.
        const random = COVERS[Math.floor(Math.random() * COVERS.length)];
        setCoverUrl(random); setBgUrl(random);
        window.localStorage.setItem(COVER_KEY, random);
      }
    } catch {}
  }, []);
  const pickCover = (url: string) => {
    setCoverUrl(url);
    if (url !== COVER_CAREER) setBgUrl(url);
    setCoverOpen(false);
    try { window.localStorage.setItem(COVER_KEY, url); } catch {}
  };
  const customTasks: Record<string, PlanTask[]> = {}; // key: careerId:horizonId

  // Swapping a career or changing the focus here is a real choice too, so it
  // persists the way the chooser's did. Only actual edits are written -- a
  // first-time visitor looking at the demo default has not chosen anything.
  useEffect(() => {
    if (!edits) return;
    writePicks(edits);
  }, [edits]);

  const focus = careerById(focusId);
  // Two ways to wear a cover: your #1 career's poster (default, changes as
  // your Top 3 changes) or one of the abstract light fields / an upload.
  const coverIsCareer = coverUrl === COVER_CAREER;
  const heroAccent = (focus && WORLD_COLORS[focus.world]) || "var(--accent-subtle)";
  const careerSrc = careerPhotoFailed ? COVERS[0] : (focus?.photo ?? COVERS[0]);
  const careerPosition = careerPhotoFailed ? "50% 40%" : (focus?.photoFocus ?? "50% 30%");
  const locker = useMemo(() => ALL_PROFILE_CAREERS.filter((career) => !top3.includes(career.id)).sort((a, b) => b.match - a.match), [top3]);

  const chosenRoute = (career: ProfileCareer) => career.routes.find((route) => route.id === routeChoice[career.id]) ?? career.routes.find((route) => route.recommended) ?? career.routes[0];
  const doneSet = (careerId: string) => new Set(done[careerId] ?? []);
  // Suggested tasks plus the student's own steps for a horizon.
  const tasksFor = (career: ProfileCareer, horizonId: string) => {
    const horizon = career.plan.find((item) => item.id === horizonId)!;
    return [...horizon.tasks, ...(customTasks[`${career.id}:${horizonId}`] ?? [])];
  };

  const horizonProgress = (career: ProfileCareer, index: number) => {
    const tasks = tasksFor(career, career.plan[index].id);
    const complete = tasks.filter((task) => doneSet(career.id).has(task.id)).length;
    return { complete, total: tasks.length, pct: tasks.length ? complete / tasks.length : 0 };
  };
  const horizonUnlocked = (career: ProfileCareer, index: number) => index === 0 || horizonProgress(career, index - 1).pct >= 0.4;
  const planProgress = (career: ProfileCareer) => {
    let total = 0;
    let complete = 0;
    career.plan.forEach((horizon) => {
      const tasks = tasksFor(career, horizon.id);
      total += tasks.length;
      complete += tasks.filter((task) => doneSet(career.id).has(task.id)).length;
    });
    return { complete, total, pct: total ? Math.round((complete / total) * 100) : 0 };
  };
  const nextTask = (career: ProfileCareer): PlanTask | null => {
    for (let index = 0; index < career.plan.length; index++) {
      if (!horizonUnlocked(career, index)) break;
      const open = tasksFor(career, career.plan[index].id).find((task) => !doneSet(career.id).has(task.id));
      if (open) return open;
    }
    return null;
  };

  const toggleMajor = (name: string) => setSavedMajors((current) => { const next = new Set(current); if (next.has(name)) next.delete(name); else next.add(name); return next; });
  const toggleEvidenceConfirmed = (id: string) => setConfirmedEvidence((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const hideEvidence = (id: string) => setHiddenEvidence((current) => new Set(current).add(id));

  function addToTop3(id: string) {
    if (top3.includes(id)) return;
    if (top3.length < 3) {
      setTop3((current) => [...current, id]);
      return;
    }
    setSwapCandidate(id);
  }

  function confirmSwap(outgoingId: string) {
    if (!swapCandidate) return;
    setTop3((current) => current.map((id) => (id === outgoingId ? swapCandidate : id)));
    if (focusId === outgoingId) setFocusId(swapCandidate);
    setSwapCandidate(null);
  }

  const [undoRemove, setUndoRemove] = useState<{ ids: string[]; focus: string | null; title: string } | null>(null);
  function removeFromTop3(id: string) {
    const before = { ids: top3, focus: chosenPrimaryId, title: careerById(id)?.title ?? "that career" };
    const next = top3.filter((item) => item !== id);
    setTop3(next);
    if (chosenPrimaryId === id) setFocusId(null); // back to the strongest match
    setUndoRemove(before);
  }



  return (
    // overflowX clip (not the class's hidden) keeps sideways-drag protection without
    // creating a scroll container, so the report's sticky section rail can pin.
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)", overflowX: "clip" }}>
      <AppBackdrop />

      <DesktopNavigation active="Profile" extraClassName="no-print" />

      <MobileHeaderShell extraClassName="no-print">
        <Wordmark />
        {/* no streak or XP up here: the hero card below carries both */}
        <span className="flex items-center gap-[var(--space-4)] text-[15px] font-bold">
          <HeaderActions><QuickLinksMenu /></HeaderActions>
        </span>
      </MobileHeaderShell>

      {/* max-w-[1440px], not [1200px]: every other top-level tab (Home, Play,
         Connect, Colleges, Explore) shares this same max-width + px-5/
         sm:px-[var(--space-14)] baseline -- Connect's own header comment
         documents it as the app-wide convention. Profile was the one outlier,
         narrower than its siblings for no stated reason (16 Sept 2026 direct
         feedback: "margins aren't consistent... my profile especially"). */}
      <main className="no-print relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] sm:px-[var(--space-14)] md:pt-[var(--space-10)]">
        <div className={buildIn(0).className} style={buildIn(0).style}>
          <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Profile</h1>
        </div>
        {/* ---- Identity: an editorial masthead. Name and school read as a
             byline; the numeric facts sit in their own strip so they line up
             at every width instead of forming a ragged grid on phones. Its
             own card, separate from the tabs/dashboard surface below. ---- */}
        {/* ---- Header in the career page's language: the cover photo runs
             behind the card and dissolves upward through the progressive blur;
             the name sits on the photo; the student picks a cover from the set. ---- */}
        <section className={`relative overflow-hidden rounded-[var(--radius-lg)] border ${buildIn(1).className}`} style={{ ...buildIn(1).style, borderColor: `color-mix(in srgb, ${heroAccent} 40%, rgba(255,255,255,0.16))`, background: "#0e0c20", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
          <div className="absolute inset-0" aria-hidden>
            {/* both layers stay mounted; A/B crossfades between them */}
            <img
              src={careerSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              style={{ objectPosition: careerPosition, opacity: coverIsCareer ? 1 : 0 }}
              onError={() => setCareerPhotoFailed(true)}
            />
            <img
              src={bgUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              style={{ objectPosition: "50% 40%", opacity: coverIsCareer ? 0 : 1 }}
              onError={() => {
                if (bgUrl === COVERS[0]) return; // the default itself can't be the problem -- avoid a retry loop
                setBgUrl(COVERS[0]);
                if (coverUrl === bgUrl) setCoverUrl(COVERS[0]);
                try { window.localStorage.setItem(COVER_KEY, COVERS[0]); } catch {}
              }}
            />
            <CardProgressiveBlur size="66%" />
            <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.62) 34%, rgba(12,16,35,0.12) 64%, transparent 100%), linear-gradient(90deg, color-mix(in srgb, ${heroAccent} 14%, transparent), transparent 60%)` }} />
          </div>
          {/* Was a flat 280/312px floor with no upper bound -- roughly 2x
             taller than a real LinkedIn cover renders at the same viewport
             (measured live, 20 Sept 2026: ~148px at 1440x900, vs this
             hero's ~330px), eating most of the first screen before any
             profile content showed. Trimmed to what the overlaid avatar +
             name/school + stat-tile rows actually need, not a number
             carried over from an earlier, content-only version of this
             card. */}
          <div className="relative flex min-h-[192px] flex-col justify-end gap-[var(--space-4)] p-[var(--space-4)] pt-[56px] sm:min-h-[208px] sm:gap-[var(--space-5)] sm:p-[var(--space-5)] sm:pt-[60px]">
            <div className="absolute top-[var(--space-4)] right-[var(--space-4)] flex max-w-[calc(100%-32px)] flex-wrap items-center justify-end gap-[6px] rounded-[var(--radius-md)] p-[2px]" style={{ background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", textShadow: "none" }}>
              <span className="relative">
                <button
                  type="button"
                  aria-label="Change cover photo"
                  aria-expanded={coverOpen}
                  onClick={() => setCoverOpen((open) => !open)}
                  className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-auto sm:gap-[5px] sm:px-[10px] sm:text-[14px] sm:font-semibold"
                  style={{ color: coverOpen ? "var(--accent-subtle)" : "rgba(255,255,255,0.86)" }}
                >
                  <ImagePlus className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" />{" "}
                  {/* The sweep fills the text with currentColor + a white
                     glint (dm-text-nudge, background-clip: text), so it
                     needs a muted base to show against -- this label's
                     normal resting color is already near-white, the same
                     tone as the sweep itself, which is why it read as
                     invisible (direct feedback, 20 Sept). */}
                  <span className={`relative hidden sm:inline ${coverNudge ? "dm-text-nudge" : ""}`} style={coverNudge ? { color: "rgba(255,255,255,0.55)" } : undefined}>
                    Cover
                    {coverNudge && (
                      <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark pointer-events-none absolute -top-[7px] -right-[9px] h-[9px] w-[9px]">
                        <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="#FFFFFF" />
                      </svg>
                    )}
                  </span>
                </button>
                {coverOpen && (
                  /* a sheet through the portal: the header clips and the blurred
                     cluster would otherwise contain a fixed child */
                  <Portal>
                  <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Choose a cover photo" style={{ textShadow: "none", fontFamily: "var(--font-body)" }}>
                    {/* the page stays visible behind a frosted overlay, never a black screen */}
                    <button type="button" aria-label="Close" onClick={() => setCoverOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }} />
                    <div className="relative z-[1] flex w-full max-w-[480px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
                      <div className="flex items-center justify-between gap-[var(--space-3)]">
                        <h3 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Cover photo</h3>
                        <button type="button" onClick={() => setCoverOpen(false)} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      {/* Same max-h + overflow-y-auto pattern as the avatar
                         picker's own grid just below -- with 21 covers now
                         (was 6 when this had no scroll constraint at all),
                         the grid ran taller than the viewport on shorter
                         screens and just got cropped (direct feedback, 20
                         Sept). The header above stays put; only the grid
                         scrolls. */}
                      <div className="dm-scroll grid max-h-[60vh] grid-cols-3 gap-[8px] overflow-y-auto pr-[2px]">
                        {COVERS.map((url) => (
                          <button key={url} type="button" aria-label="Use this cover" aria-pressed={coverUrl === url} onClick={() => pickCover(url)} className="dm-tap relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[var(--radius-sm)]" style={{ boxShadow: coverUrl === url ? "0 0 0 2px var(--primary)" : "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
                            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  </Portal>
                )}
              </span>
              {/* Resume moved into the main tablist below -- it deserves the
                 same first-class standing as Overview/Report, not a small
                 icon tucked in the header. */}
              <button
                type="button"
                aria-label="Saved"
                onClick={() => setTab("locker")}
                className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-auto sm:gap-[5px] sm:px-[10px] sm:text-[14px] sm:font-semibold"
                style={{ background: tab === "locker" ? "var(--glass-surface-3)" : "transparent", color: tab === "locker" ? "var(--accent-subtle)" : "var(--muted-foreground)" }}
              >
                <Bookmark className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Saved</span>
              </button>
              {/* The gear menu, split into the things a student actually
                 comes here for (direct feedback, 10 Sept 2026): each item
                 opens Settings scrolled to that section. */}
              <span className="relative">
                <button
                  ref={settingsBtnRef}
                  type="button"
                  aria-label="Settings menu"
                  aria-expanded={settingsMenuOpen}
                  onClick={() => {
                    // Was `absolute top-[44px] right-0` inside this header,
                    // which clips overflow (the same reason Cover's own
                    // modal above already goes through Portal) -- the menu
                    // could render partly or fully hidden (direct feedback,
                    // 21 Sept 2026: "the dropdown for settings is not
                    // visible properly"). Portalling it needs real screen
                    // coordinates instead of a parent-relative offset,
                    // computed fresh on each open since the button can move.
                    const rect = settingsBtnRef.current?.getBoundingClientRect();
                    if (rect) setSettingsMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                    setSettingsMenuOpen((open) => !open);
                  }}
                  className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-auto sm:gap-[5px] sm:px-[10px] sm:text-[14px] sm:font-semibold"
                  style={{ background: tab === "settings" || settingsMenuOpen ? "var(--glass-surface-3)" : "transparent", color: tab === "settings" || settingsMenuOpen ? "var(--accent-subtle)" : "var(--muted-foreground)" }}
                >
                  <Settings className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Settings</span>
                </button>
                {settingsMenuOpen && (
                  <Portal>
                    <button type="button" aria-label="Close menu" className="fixed inset-0 z-[55] cursor-default" onClick={() => setSettingsMenuOpen(false)} />
                    <div role="menu" className="fixed z-[56] w-[236px] rounded-[var(--radius-lg)] border p-[var(--space-1)]" style={{ top: settingsMenuPos.top, right: settingsMenuPos.right, background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "var(--shadow-lg, 0 20px 50px -20px rgba(0,0,0,0.6))" }}>
                      {SETTINGS_SECTIONS.map((item) => (
                        <Fragment key={item.id}>
                          {item.divider && <span aria-hidden className="my-[4px] block h-px" style={{ background: "var(--glass-border)" }} />}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setSettingsMenuOpen(false); setSettingsSection(item.id); setTab("settings"); }}
                            className="dm-quiet flex w-full cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-left text-[14.5px] font-bold"
                            style={{ color: item.id === "danger" ? "var(--color-feedback-error, #ff6b6b)" : "var(--foreground)" }}
                          >
                            <item.Icon className="h-4 w-4 flex-none" aria-hidden /> {item.label}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </Portal>
                )}
              </span>
            </div>
            <div className="flex items-end gap-[var(--space-4)]">
              {/* Generated, not photographed (direct feedback, 8 Sept 2026:
                 no student photo is ever stored, and the avatar system
                 should reach every place a student's own picture shows up,
                 not just Connect) -- same seed, same face as everywhere
                 else the student appears. An Instagram-style edit button
                 (direct feedback, 14 Sept 2026) lets the student swap it for
                 any of the illustrated portraits -- still no real photo,
                 still the same fixed set, just a student-chosen face
                 instead of the seeded default. */}
              <span className="relative flex-none">
                <Image
                  src={avatarSrc}
                  alt=""
                  width={144}
                  height={144}
                  className="size-[72px] flex-none rounded-full border-2 object-cover"
                  style={{ borderColor: "rgba(255,255,255,0.9)" }}
                />
                <button
                  type="button"
                  aria-label="Change your picture"
                  aria-expanded={avatarPickerOpen}
                  onClick={() => setAvatarPickerOpen(true)}
                  className="dm-tap absolute right-[-2px] bottom-[-2px] flex size-[26px] cursor-pointer items-center justify-center rounded-full border-2"
                  style={{ background: "var(--primary)", borderColor: "rgba(255,255,255,0.9)", color: "#fff" }}
                >
                  <Pencil className="h-3 w-3" strokeWidth={2.75} aria-hidden />
                </button>
                {avatarPickerOpen && (
                  <Portal>
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Choose your picture" style={{ textShadow: "none", fontFamily: "var(--font-body)" }}>
                      <button type="button" aria-label="Close" onClick={() => setAvatarPickerOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }} />
                      <div className="relative z-[1] flex w-full max-w-[480px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
                        <div className="flex items-center justify-between gap-[var(--space-3)]">
                          <h3 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Choose your picture</h3>
                          <button type="button" onClick={() => setAvatarPickerOpen(false)} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                        {/* dm-scroll: same thin, quiet scrollbar treatment
                           as the Cover photo picker just above (direct
                           feedback, 21 Sept 2026: "have that be a
                           scrollable modal... use the same scrollbar rules
                           as mac") -- this grid already scrolled via
                           max-h-[60vh] + overflow-y-auto, it was just
                           missing the shared styling that makes the
                           scrollbar itself read as intentional instead of
                           the OS-default chrome. */}
                        <div className="dm-scroll grid max-h-[60vh] grid-cols-5 gap-[10px] overflow-y-auto pr-[2px] sm:grid-cols-6">
                          {AVATAR_POOL.map((src) => (
                            <button key={src} type="button" aria-label="Use this picture" aria-pressed={avatarSrc === src} onClick={() => pickAvatar(src)} className="dm-tap relative aspect-square cursor-pointer overflow-hidden rounded-full" style={{ boxShadow: avatarSrc === src ? "0 0 0 2px var(--primary)" : "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
                              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Portal>
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[2px] pb-[4px]">
                <h2 className="text-[28px] leading-[32px] font-extrabold tracking-[-0.02em] text-balance sm:text-[36px] sm:leading-[40px]" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.name}</h2>
                <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "rgba(255,255,255,0.82)" }}>{STUDENT.school}</span>
              </span>
            </div>
            {/* the three facts as the community cards' tiles: icon in the
               #1 career's accent, the figure, then the label */}
            {/* the three facts as compact tiles that hug their content and sit
               left, on one row at every width: icon, label, value. On phones
               the type steps down and the streak's extras drop so all three
               still fit side by side (direct feedback, 5 Sept 2026). */}
            {/* Three tiles, as before the Dream Score tile (Joshua Pierce,
               Slack, 6 Sept 2026: "have the profile header look like it did
               before"); the score lives in the app header instead. */}
            <dl className="flex flex-wrap gap-[6px] sm:gap-[8px]" style={{ textShadow: "none" }}>
              {[
                { Icon: GraduationCap, value: STUDENT.grade.replace("Grade ", ""), label: "Grade", short: null as string | null, verified: false, sub: null as string | null, valueFirst: false },
                { Icon: BadgeCheck, value: ACADEMIC_RECORD.gpa, label: "GPA", short: null as string | null, verified: ACADEMIC_RECORD.verified, sub: null as string | null, valueFirst: false },
                // "12 day streak · Active 142 of 190 days" (direct feedback, 5 Sept 2026)
                { Icon: Flame, value: `${STUDENT.streakDays}`, label: "day streak", short: null as string | null, verified: false, sub: "Active 142 of 190 days" as string | null, valueFirst: true },
              ].map((fact) => (
                <div key={fact.label} className={`flex min-w-0 items-center gap-[5px] rounded-[var(--radius-sm)] px-[8px] py-[7px] sm:flex-none sm:gap-[8px] sm:px-[14px] sm:py-[9px] ${fact.valueFirst ? "flex-[1.5]" : "flex-1"}`} style={{ background: "rgba(12,16,35,0.58)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${heroAccent} 28%, rgba(255,255,255,0.1))` }}>
                  <fact.Icon className="h-[13px] w-[13px] flex-none sm:h-[15px] sm:w-[15px]" aria-hidden style={{ color: heroAccent }} />
                  <dt className={`flex min-w-0 items-center gap-[4px] truncate text-[10.5px] leading-[14px] font-semibold sm:text-[12.5px] sm:leading-[16px] ${fact.valueFirst ? "order-3" : ""}`} style={{ color: "rgba(255,255,255,0.7)" }}>
                    {fact.short ? <><span className="sm:hidden">{fact.short}</span><span className="hidden sm:inline">{fact.label}</span></> : fact.label}
                    {fact.sub && <span className="hidden lg:inline"> · {fact.sub}</span>}
                    {fact.verified && <span className="sr-only">verified by {ACADEMIC_RECORD.source}, {ACADEMIC_RECORD.updated}</span>}
                  </dt>
                  {/* the streak reads "12 day streak": its number comes before its words */}
                  <dd className={`flex flex-none items-baseline text-[14px] leading-[18px] font-extrabold tabular-nums sm:text-[18px] sm:leading-[22px] ${fact.valueFirst ? "order-2 -mr-[1px]" : "ml-auto"}`} style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>


        {/* SR announcement for focus changes */}
        <span aria-live="polite" className="sr-only">{announce}</span>

        {/* Utility views (Saved, Settings) take over everything under
            the header; the tabs belong to the career-facing views. Top 3 is
            one of those tabs now, not a permanent strip above them — tap a
            card there to make it the career every other tab shows. */}
        {(tab === "locker" || tab === "settings") ? null : (
          <>
          {/* One surface for every tab: the tab bar and the active panel share
             this card. Inside it nothing is a card again (direct feedback,
             4 Sept): groups are drawn with borders on the shared surface,
             the way the career report keeps one sheet of paper. */}
          <div className={`flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:p-[var(--space-5)] ${buildIn(2).className}`} style={{ ...GLASS, ...buildIn(2).style }}>
        {/* ---- Tabs: real tablist semantics, 44px targets ----
           "Paths" is gone from here -- phenomenal on its own, per direct
           feedback, but redundant with the new side-by-side Top 3 (which
           now covers the same trade-school/community-college/university
           comparison per career), so it's parked for a v2 rather than
           deleted (RoutesTab/PathTab below are untouched, just
           unreachable). Resume, previously a small icon in the header,
           takes its old slot in the main tablist instead -- promoted to
           the same standing as Overview/Report rather than tucked away. */}
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Career sections"
          onKeyDown={(event) => {
            const order: TabId[] = ["overview", "top3", "plan", "report", "resume"];
            const index = order.indexOf(tab);
            if (index === -1) return;
            let next: TabId | null = null;
            if (event.key === "ChevronRight") next = order[(index + 1) % order.length];
            if (event.key === "ChevronLeft") next = order[(index + order.length - 1) % order.length];
            if (next) {
              event.preventDefault();
              setTab(next);
              document.getElementById(`profile-tab-${next}`)?.focus();
            }
          }}
          className="dm-glass-2 flex w-full items-center gap-[var(--space-1)] overflow-x-auto rounded-[var(--radius-lg)] p-[var(--space-1)] backdrop-blur-[24px] backdrop-saturate-[1.65] [scrollbar-width:none]"
          style={{
            background: "var(--glass-surface-2)",
            ...(tabsOverflow ? { maskImage: "linear-gradient(to right, black calc(100% - 28px), transparent)", WebkitMaskImage: "linear-gradient(to right, black calc(100% - 28px), transparent)" } : {}),
          }}
        >
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "top3", label: "Top Three" },
              { id: "plan", label: "My Plan" },
              { id: "report", label: "Report" },
              { id: "resume", label: "Resume" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              id={`profile-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`profile-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              className="dm-quiet relative flex-none cursor-pointer rounded-[var(--radius-md)] px-[9px] py-[10px] text-center text-[12.5px] leading-[15px] font-bold whitespace-nowrap sm:flex-1 sm:px-[var(--space-2)] sm:py-[13px] sm:text-[15px] sm:leading-[18px]"
              style={{ color: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)", ["--ink" as string]: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)" }}
            >
              {tab === item.id && (
                <motion.span
                  layoutId="profile-tab-pill"
                  className="absolute inset-0 rounded-[var(--radius-md)]"
                  style={{ background: "var(--primary)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              {/* "content changed" cue: the light passes through the letters
                 only, never the pill's padding (direct feedback, 4 Sept 2026) */}
              <span className={`relative ${pings[item.id] ? "profile-tab-ping-text" : ""}`}>{item.label}</span>
            </button>
          ))}
        </div>

            {tab === "overview" && (
            <div role="tabpanel" id="profile-panel-overview" aria-labelledby="profile-tab-overview">
              {overviewVersion === "v2" ? (
                <OverviewTabV2
                  focus={focus}
                  top3Careers={top3.map(careerById).filter((c): c is ProfileCareer => c !== null)}
                  onGoTop3={() => setTab("top3")} onGoPlan={() => setTab("plan")} onGoReport={() => setTab("report")}
                  onGoResume={() => setTab("resume")}
                  seasonOverride={seasonOverride}
                />
              ) : (
                <OverviewTab
                  focus={focus} planProgress={planProgress} top3Count={top3.length}
                  onGoTop3={() => setTab("top3")} onGoPlan={() => setTab("plan")} onGoReport={() => setTab("report")}
                  onGoLocker={() => setTab("locker")}
                />
              )}
            </div>
            )}
        {tab === "top3" && (
          <div role="tabpanel" id="profile-panel-top3" aria-labelledby="profile-tab-top3">
            <Top3Tab
              top3={top3} focusId={focusId} primaryChosen={primaryChosen} setFocusId={setFocusId} chosenRoute={chosenRoute}
              onAdd={() => setAddOpen(true)} onRemove={(id) => setConfirmRemove(id)}
              onOpenCompare={() => setCompareOpen(true)} onGoReport={() => setTab("report")}
            />
          </div>
        )}
        {tab === "routes" && (
          <div role="tabpanel" id="profile-panel-routes" aria-labelledby="profile-tab-plan">
            <RoutesTab
              focus={focus} chosenRoute={chosenRoute} setRouteChoice={setRouteChoice}
              savedMajors={savedMajors} onToggleMajor={toggleMajor} onGoPlan={() => setTab("plan")}
            />
          </div>
        )}
        {tab === "plan" && (
          <div role="tabpanel" id="profile-panel-plan" aria-labelledby="profile-tab-plan">
            <MyPlanTab focus={focus} onGoRoutes={() => setTab("routes")} variant={overviewVersion} />
          </div>
        )}
        {tab === "report" && focus && (
          <div role="tabpanel" id="profile-panel-report" aria-labelledby="profile-tab-report">
            <CareerReportView
              student={{ name: STUDENT.name, grade: STUDENT.grade, school: STUDENT.school }}
              career={focus}
              savedMajors={savedMajors} onToggleMajor={toggleMajor}
              onOpenEvidence={() => setEvidenceOpen(true)} updatedLabel="today"
              top3={top3.map(careerById).filter((c): c is ProfileCareer => c !== null)}
              onSwitchCareer={setFocusId}
              history={{
                snapshot: () => ({ careerId: focus.id, careerTitle: focus.title, top3, focusId: focus.id, routeChoice, done, savedMajors: [...savedMajors] }),
                // Putting a version back is the same as the student having
                // made those choices: Top 3 + focus (persisted through the
                // picks effect), route choices, plan progress, saved majors.
                restore: (snapshot) => {
                  setEdits({ ids: snapshot.top3, focus: snapshot.focusId ?? snapshot.top3[0] ?? null });
                  setRouteChoice(snapshot.routeChoice);
                  setDone(snapshot.done);
                  setSavedMajors(new Set(snapshot.savedMajors));
                },
              }}
            />
          </div>
        )}
        {tab === "resume" && (
          <div role="tabpanel" id="profile-panel-resume" aria-labelledby="profile-tab-resume" className="flex flex-col gap-[var(--space-4)]">
            <ResumeExperience hideTitle />
            {/* Same bridge-between-features banner as Top Three -> Play
               (direct feedback, 8 Sept 2026): a resume is a dead end on its
               own, so the obvious next step points at Connect. */}
            <NextStepBanner
              eyebrow="Your next step"
              text="Ask a question or follow a Dream Volunteer on CONNECT to grow your knowledge and network."
              ctaLabel="Connect"
              href="/connect?tab=people"
              Icon={Users}
              storageKey="dreamari:resume-connect-next-step-dismissed"
            />
          </div>
        )}
          </div>
          {/* Demo-only v1/v2 toggle -- below the whole card, bottom
             center, so it never adds space between the header and the
             card itself. Toggles the whole Profile section, not just
             Overview, so it stays put across every tab rather than
             vanishing the moment a student leaves Overview (direct
             feedback, 20 Sept 2026: "should be toggling the entire my
             profile section not just overview"). */}
          <div className="flex justify-center gap-[6px]">
            <OverviewVersionChip version={overviewVersion} onChange={setOverviewVersion} />
            {/* QA-only: cycles the season art without waiting on the real
               calendar (direct instruction, 20 Sept 2026: "a toggle...
               where i can cycle through season so i can QA each seasons
               graphics"). Only meaningful once v2 is on. */}
            {overviewVersion === "v2" && <SeasonQAToggle value={seasonOverride} onChange={setSeasonOverride} />}
          </div>
          </>
        )}
        {/* Reachable only via PlanTab's "Change route" link now, not a main
           tab -- hidden from the tablist per direct feedback (see the
           comment above), but the underlying route-choice flow still needs
           a real destination rather than a dead link. */}
        {tab === "locker" && <LockerTab locker={locker} top3Count={top3.length} addToTop3={addToTop3} onClose={() => setTab("overview")} />}
        {tab === "settings" && <SettingsView section={settingsSection} onClose={() => { setSettingsSection(null); setTab("overview"); }} />}
      </main>

      {/* ---- Welcome to Your Profile (arrival from Match only): the shared
         WelcomeSplash, same treatment as the Match/Explore/Play/Connect
         welcomes (direct feedback, 10 Sept 2026). Opens once the page has
         visibly begun assembling; Continue dismisses it and scrolls the
         Top Three into view. ---- */}
      <WelcomeSplash surface="profile" open={welcomeOpen} onDone={dismissWelcome} />

      {compareOpen && (
        <CompareSheet careers={top3.map(careerById).filter(Boolean) as ProfileCareer[]} focusId={focus?.id ?? ""} onClose={() => setCompareOpen(false)} />
      )}

      {evidenceOpen && (
        <EvidenceSheet
          focus={focus} confirmed={confirmedEvidence} hidden={hiddenEvidence}
          onToggleConfirmed={toggleEvidenceConfirmed} onHide={hideEvidence} onClose={() => setEvidenceOpen(false)}
        />
      )}

      <div className="no-print">
        <MobileNav active="Profile" />
      </div>

      {undoRemove && <UndoToast key={undoRemove.title} message={`Removed ${undoRemove.title} from your Top 3`} onUndo={() => setEdits({ ids: undoRemove.ids, focus: undoRemove.focus })} onClose={() => setUndoRemove(null)} />}

      {/* ---- Swap sheet ---- */}
      {swapCandidate && (
        <div className="no-print fixed inset-0 z-[60] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setSwapCandidate(null); }}>
          <div className="dm-scroll filters-reveal max-h-[calc(100dvh-96px)] w-full max-w-[440px] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Top 3 is full</p>
            <p className="mt-1 text-[15px]" style={{ color: "var(--muted-foreground)" }}>Swap one out for <strong style={{ color: "var(--foreground)" }}>{careerById(swapCandidate)?.title}</strong>. It returns to Saved.</p>
            <div className="mt-4 flex flex-col gap-[var(--space-2)]">
              {top3.map((id) => {
                const career = careerById(id)!;
                return (
                  <button key={id} type="button" onClick={() => confirmSwap(id)} className="dm-quiet flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-left" style={GLASS}>
                    <span className="text-[14px] font-bold">{career.title}</span>
                    <span className="text-[14px] font-bold" style={{ color: "var(--accent-subtle)" }}>Replace</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setSwapCandidate(null)} className="dm-quiet mt-4 w-full cursor-pointer rounded-[var(--radius-md)] border py-[var(--space-3)] text-[15px] font-bold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Never mind
            </button>
          </div>
        </div>
      )}

      {/* ---- Remove confirm: destructive actions always confirm ---- */}
      {confirmRemove && (
        <div className="no-print fixed inset-0 z-[66] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setConfirmRemove(null); }}>
          <div className="dm-scroll filters-reveal max-h-[calc(100dvh-96px)] w-full max-w-[400px] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Remove {careerById(confirmRemove)?.title}?</p>
            <p className="mt-1 text-[15px]" style={{ color: "var(--muted-foreground)" }}>It goes back to Saved. Nothing is lost.</p>
            <div className="mt-[var(--space-4)] flex justify-end gap-[var(--space-2)]">
              <button type="button" onClick={() => setConfirmRemove(null)} className="dm-quiet cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ borderColor: "var(--border)" }}>Cancel</button>
              <button type="button" onClick={() => { removeFromTop3(confirmRemove); setConfirmRemove(null); }} className="dm-solid cursor-pointer rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-semibold" style={{ background: "var(--destructive)", color: "#fff" }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Add-from-Locker sheet: pick right here, no tab switch ---- */}
      {addOpen && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <div className="filters-reveal flex max-h-[calc(100dvh-96px)] w-full max-w-[420px] flex-col rounded-[var(--radius-xl)] border p-[var(--space-5)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <div>
                <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Add to your Top 3</p>
                <p className="mt-[2px] text-[14px]" style={{ color: "var(--muted-foreground)" }}>{3 - top3.length} open {top3.length === 2 ? "slot" : "slots"} · from Saved</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="dm-scroll mt-[var(--space-4)] flex max-h-[50vh] flex-col gap-[var(--space-2)] overflow-y-auto">
              {locker.length === 0 && (
                <Link href="/match-grid" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-center text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Nothing saved yet · browse careers</Link>
              )}
              {locker.map((career) => (
                <div key={career.id} className="dm-glass flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-2)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="relative h-[52px] w-[38px] flex-none overflow-hidden rounded-[8px]">
                    <Image src={career.photo} alt="" fill sizes="38px" className="object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-bold">{career.title}</span>
                    <span className="truncate text-[12px] font-bold" style={{ color: WORLD_COLORS[career.world] }}>{career.world} · {interestTier(career.match)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { addToTop3(career.id); if (top3.length >= 2) setAddOpen(false); }}
                    className="dm-solid flex-none cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-[14px] font-semibold"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {reportOpen && focus && <ReportOverlay career={focus} route={chosenRoute(focus)} progress={planProgress(focus)} next={nextTask(focus)} tasksFor={tasksFor} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

// ------------------------------------------------------------- pieces ----

// ---- My Top Three: a real destination, not a switcher strip ----
// Ranked #1/#2/#3 cards with the facts a student compares careers on
// (pay, education, years in school, employers, schools) — the same facts
// the report goes deeper on, so this reads as a preview of it, not a
// duplicate. Tapping a card's "Make this my #1" is the only way focus
// changes now; there is no separate always-visible switcher.
const BAND_ORDER: Record<string, number> = { Target: 0, Reach: 1, Safety: 2 };

/** The Top 3 card's collapsed-by-default drawer for the not-as-critical
 *  facts (employers, schools) -- keeps the three cards' visible sections
 *  aligned 1:1 while the detail stays one tap away (direct feedback). */
function MoreFactsAccordion({ facts }: { facts: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      {/* text-left: a button centres its text by default, which showed the
         moment the label wrapped (direct feedback, 11 Sept 2026). */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="dm-quiet flex min-h-[32px] w-full cursor-pointer items-center justify-between gap-[8px] px-[4px] text-left text-[12px] font-bold tracking-[0.6px] uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span>Employers &amp; schools</span>
        <ChevronDown className={`h-4 w-4 flex-none transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <dl className="flex flex-col gap-[var(--space-2)] pt-[var(--space-2)] motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]">
          {facts.map((fact) => (
            <div key={fact.label} className="flex min-w-0 flex-col gap-[1px]">
              <dt className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{fact.label}</dt>
              <dd className="text-[14px] leading-[18px] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Top3Tab({
  top3, focusId, primaryChosen, setFocusId, chosenRoute, onAdd, onRemove, onOpenCompare, onGoReport,
}: {
  top3: string[];
  focusId: string | null;
  /** false while the strongest match is only the default */
  primaryChosen: boolean;
  setFocusId: (id: string) => void;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onOpenCompare: () => void;
  onGoReport: () => void;
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null);

  if (top3.length === 0) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={INSET}>
        <p className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Nothing saved yet</p>
        <p className="max-w-[42ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Add up to 3 careers, then pick one to start with.</p>
        <button type="button" onClick={onAdd} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Add a career</button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Same treatment as "Do this next" / the next-step banners (direct
         feedback, 11 Sept 2026): beam ring, one line, one CTA into Explore,
         dismissable and remembered. */}
      <NextStepBanner
        text="More career matches are waiting."
        ctaLabel="Explore"
        href="/explore"
        Icon={Compass}
        emphasis="priority"
        calm
        // slower ring (direct feedback, 11 Sept 2026: "reduce speed and shimmer")
        beamDuration={5}
        // demo: comes back every visit; remembered once the demo flag is off
        storageKey={DEMO_ALWAYS_SHOW_SPLASH ? undefined : "dreamari:top3-keep-exploring-dismissed"}
      />
      <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-[var(--space-3)]">
        {top3.length > 1 && (
          <button type="button" onClick={onOpenCompare} className="dm-link flex min-h-[44px] flex-none cursor-pointer items-center gap-[5px] text-[14px] font-bold" style={{ color: "var(--accent-subtle)" }}>
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> Compare all {top3.length}
          </button>
        )}
      </div>

      {/* Side by side from md: up (stacked on phones only, where three columns
         would be unreadable), info running vertically inside each column --
         side-by-side comparison per direct feedback ("much easier and
         faster to skim, analyze and process"). Each card carries its own
         career-world accent (border tint + ambient glow + labels) so the
         three read as three different Career Worlds -- accent as glow and
         tint per the design language, never a solid color block. Copy is
         unchanged from the stacked version. */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-4)] md:grid-cols-3">
      {/* The primary career takes the first card (Joshua, 11 Sept 2026). */}
      {[...top3].sort((a, b) => Number(b === focusId) - Number(a === focusId)).map((id) => {
        const career = careerById(id)!;
        const report = reportV2(id);
        const route = chosenRoute(career);
        const isFocus = focusId === id;
        const sim = simulationFor(id);
        const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
        const schools = report ? [...report.colleges].sort((a, b) => (BAND_ORDER[a.status] ?? 9) - (BAND_ORDER[b.status] ?? 9)).slice(0, 2).map((c) => c.name) : [];
        // Split by criticality (direct feedback): the three decision facts
        // stay on the card (clamped, not height-reserved: a one-line
        // Education left a hole above Years in school, direct feedback 11
        // Sept 2026); employers + schools fold into a collapsed-by-default
        // accordion below them.
        const facts = [
          { label: "Estimated pay", value: report?.salary.median ?? "Coming soon", lines: "line-clamp-1" },
          { label: "Education", value: report?.education.find((r) => r.common)?.name ?? "Coming soon", lines: "line-clamp-2" },
          { label: "Years in school", value: route.duration, lines: "line-clamp-1" },
        ];
        const moreFacts = [
          { label: "Typical employers", value: report ? report.glance.employers.slice(0, 3).join(" · ") : "Coming soon" },
          { label: "Suggested schools", value: schools.length ? schools.join(" · ") : "Coming soon" },
        ];
        return (
          <div
            key={id}
            className="relative flex h-full flex-col rounded-[var(--radius-lg)] border"
            style={{
              // The focus ring is the career's OWN world accent (full
              // strength), so #1 reads in that world's color; unfocused
              // cards keep the quieter 35% border tint.
              borderColor: isFocus ? accent : `color-mix(in srgb, ${accent} 35%, var(--glass-border))`,
              // A darker step than glass-surface-1, still translucent and blurred
              // (direct feedback, 11 Sept 2026: "a little too transparent").
              background: isFocus ? `color-mix(in srgb, ${accent} 10%, var(--inset-surface))` : "var(--inset-surface)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            {/* The photo carries the card: a wide cover clipped by the card's
               own radius, not a floating thumbnail square. The rank rides
               quietly on the photo corner instead of its own chip row. */}
            <div className="relative aspect-[16/10] w-full flex-none overflow-hidden rounded-t-[inherit]">
              {/* Per-photo focal point (data.ts photoFocus): each poster's
                 subject sits at a different height, so one shared crop puts
                 faces at different heights across the row. */}
              <Image src={career.photo} alt="" fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" style={{ objectPosition: career.photoFocus ?? "50% 25%" }} />
              {isFocus && (
                // The one marker of the primary career: a star disc on the
                // photo (Joshua, 11 Sept 2026: the text chips go), so the
                // Report and Plan tabs still visibly follow this card.
                <span role="img" aria-label={primaryChosen ? "My primary career" : "Your strongest match"} className="absolute bottom-[10px] left-[10px] z-[2] flex size-[30px] items-center justify-center rounded-full border backdrop-blur-[8px]" style={{ background: "rgba(5,8,20,0.6)", borderColor: `color-mix(in srgb, ${accent} 60%, rgba(255,255,255,0.4))`, color: accent }}>
                  <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
                </span>
              )}
              <div className="absolute top-[6px] right-[6px] z-[3]">
                <button
                  type="button"
                  aria-label={`More options for ${career.title}`}
                  aria-expanded={menuFor === id}
                  onClick={() => setMenuFor(menuFor === id ? null : id)}
                  className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full"
                  style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)", backdropFilter: "blur(6px)", color: "var(--foreground)" }}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuFor === id && (
                  <>
                    <button type="button" aria-label="Close menu" className="fixed inset-0 z-[55] cursor-default" onClick={() => setMenuFor(null)} />
                    <div className="absolute top-[44px] right-0 z-[56] w-[200px] rounded-[var(--radius-lg)] border p-[var(--space-1)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "var(--shadow-md)" }}>
                      <button
                        type="button"
                        onClick={() => { setMenuFor(null); onRemove(id); }}
                        className="dm-quiet w-full cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-left text-[15px] font-bold"
                        style={{ color: "var(--destructive)" }}
                      >
                      Remove from Top 3
                      </button>
                      {/* Two options (Joshua, 11 Sept 2026). Make My Primary
                         moves the career into the first card; it is the only
                         place for it (direct feedback: no hover cue). */}
                      {!isFocus && (
                        <button
                          type="button"
                          onClick={() => { setMenuFor(null); setFocusId(id); }}
                          className="dm-quiet flex w-full cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-left text-[15px] font-bold"
                        >
                          <Star className="h-3.5 w-3.5" aria-hidden /> Make My Primary
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* The accent glow lives in its own clipped layer: the card itself
               stays overflow-visible (the kebab menu must escape it), so the
               blob is clipped here to the card's radius instead of bleeding
               past the border. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <span className="absolute right-[-40px] bottom-[-40px] h-[140px] w-[140px] rounded-full blur-[38px]" style={{ background: `color-mix(in srgb, ${accent} 38%, transparent)` }} />
            </span>

            <div className="relative flex flex-1 flex-col gap-[var(--space-2)] p-[var(--space-4)]">
              {/* Tight rhythm throughout (direct feedback, 11 Sept 2026: the
                 cards were getting long, and a reserved title height left a
                 hole under one-line titles). Everything clamps rather than
                 reserves height. */}
              <span className="flex min-w-0 flex-col gap-[1px]">
                {/* World name carries the accent, never the career title. */}
                <span className="text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: accent }}>{career.world}</span>
                <span className="text-balance text-[18px] leading-[22px] font-extrabold sm:text-[22px] sm:leading-[26px] md:line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>{career.title}</span>
              </span>
              <p className="mt-[2px] text-[14px] leading-[19px] font-medium md:line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{report?.glance.simple ?? "Report details coming soon for this one."}</p>
              {/* The card answers one question (Joshua, 11 Sept 2026): test
                 this career, or learn more about it? Play and Learn more side
                 by side, above the fold. Play is in the Play cards' own badge
                 language (disc + glyph); a career without its own game goes
                 to the Play tab, focused on it, and says Play like the rest
                 (Joshua: never "coming soon" in a demo). Learn more opens this
                 career's page, the diagonal arrow for leaving the profile. */}
              <div className="mt-[var(--space-1)] grid grid-cols-2 gap-[var(--space-2)]">
                <Link
                  href={sim ? `/play/${sim.id}` : `/play?focus=${id}`}
                  aria-label={`Play ${career.title}`}
                  className="dm-tap flex min-h-[40px] min-w-0 cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border py-[4px] pr-[12px] pl-[5px] text-[14px] font-bold"
                  style={{ background: `color-mix(in srgb, ${accent} 20%, var(--glass-surface-3))`, borderColor: `color-mix(in srgb, ${accent} 55%, var(--glass-border))`, color: "var(--foreground)" }}
                >
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-full border" style={{ background: accent, borderColor: "rgba(255,255,255,0.35)" }}>
                    <Play className="ml-[2px] h-[14px] w-[14px]" fill="currentColor" style={{ color: "#fff" }} aria-hidden />
                  </span>
                  <span className="min-w-0 truncate">Play</span>
                </Link>
                <Link
                  href={`/career/${id}`}
                  aria-label={`Learn more about ${career.title}`}
                  className="dm-tap flex min-h-[40px] min-w-0 cursor-pointer items-center justify-center gap-[3px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-bold"
                  style={FROST}
                >
                  <span className="min-w-0 truncate">Learn more</span> <ArrowUpRight className="h-3.5 w-3.5 flex-none" aria-hidden />
                </Link>
              </div>


              <dl className="flex flex-col gap-[var(--space-2)] pt-[var(--space-1)]">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex min-w-0 flex-col gap-[1px]">
                    <dt className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{fact.label}</dt>
                    <dd className={`text-[14px] leading-[18px] font-semibold ${fact.lines}`}>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <MoreFactsAccordion facts={moreFacts} />

              {/* Get Career Report apart at the foot; no rules anywhere in
                 the card (direct feedback, 11 Sept 2026). */}
              <div className="mt-auto pt-[var(--space-1)]">
                <button type="button" onClick={() => { setFocusId(id); onGoReport(); }} className="dm-tap flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-[3px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-bold" style={FROST}>
                  Get Career Report <ChevronRight className="h-3.5 w-3.5 flex-none" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {top3.length < 3 && (
        <button
          type="button"
          onClick={onAdd}
          className="dm-tap dm-glass flex min-h-[120px] w-full cursor-pointer items-center justify-center gap-[var(--space-2)] self-stretch rounded-[var(--radius-lg)] border-2 border-dashed backdrop-blur-[20px] backdrop-saturate-[1.5]"
          style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
        >
          <span className="flex size-8 items-center justify-center rounded-full" style={{ background: "var(--glass-surface-3)" }}>
            <Plus className="h-4 w-4" style={{ color: "var(--accent-subtle)" }} />
          </span>
          <span className="text-[15px] font-bold">Add a career</span>
        </button>
      )}
      </div>

    </div>
  );
}

// ---- Compare my Top 3 ----
// Lives beside My Top 3, not inside the report: a report is one career's
// document, and stacking three of them in it made it read as a bundle.

function CompareSheet({ careers, focusId, onClose }: { careers: ProfileCareer[]; focusId: string; onClose: () => void }) {
  const entries = careers
    .map((career) => ({ career, report: reportV2(career.id) }))
    .filter((entry): entry is { career: ProfileCareer; report: NonNullable<ReturnType<typeof reportV2>> } => Boolean(entry.report));
  return (
    <div className="no-print fixed inset-0 z-[120] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="compare-sheet-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(8px)" }} />
      <div className="relative mx-auto flex max-h-[92dvh] w-full max-w-[1000px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:my-auto sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)] border-b px-5 py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Side by side</span>
            <h3 id="compare-sheet-title" className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>My top {entries.length}</h3>
          </span>
          <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label="Close comparison">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="dm-report dm-scroll min-h-0 flex-1 overflow-y-auto px-5 py-[var(--space-5)]">
          {entries.length > 1 ? (
            <ComparisonTable entries={entries} focusId={focusId} />
          ) : (
            <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>Save at least two careers to your Top 3 and they will line up here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Overview: who I am, where I am, what is next ----
// Deliberately thin. Its job is orientation in about five seconds, then it
// hands off. Streaks and totals live at the bottom, not in the identity.

export function OverviewTab({
  focus, planProgress, top3Count,
  onGoTop3, onGoPlan, onGoReport, onGoLocker,
}: {
  focus: ProfileCareer | null;
  planProgress: (career: ProfileCareer) => { complete: number; total: number; pct: number };
  top3Count: number;
  onGoTop3: () => void;
  onGoPlan: () => void;
  onGoReport: () => void;
  onGoLocker: () => void;
}) {
  if (!focus) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={INSET}>
        <p className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Nothing saved yet</p>
        <p className="max-w-[42ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Browse some careers and save the ones you want to look at properly. Your profile builds itself from there.</p>
        <div className="flex flex-wrap justify-center gap-[var(--space-3)]">
          <Link href="/match-grid" className="dm-solid flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Browse careers</Link>
          <button type="button" onClick={onGoLocker} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ borderColor: "var(--border)" }}>Open Saved</button>
        </div>
      </section>
    );
  }

  const progress = planProgress(focus);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Bento: three equal doorways, same shape each time (caption, one
          number, one line) — matches how the reference architecture weighs
          Top Three / Plan / Report the same, instead of one dominant tile. */}
      <section aria-labelledby="bento-title" className="grid grid-cols-3 gap-[var(--space-2)] sm:gap-[var(--space-3)]">
        <h3 id="bento-title" className="sr-only">Your top three, plan and report at a glance</h3>

        {/* Bento cards get the same hover beam as everything else (direct
           feedback, 9 Sept 2026: "hover states of cards everywhere," same
           3.5s duration as "Do This Next"), tuned to a moderate strength --
           these are everyday navigation, not a singled-out next action. */}
        <HoverBeam strength={0.8} className="min-w-0">
          <button type="button" onClick={onGoTop3} className="dm-tap flex h-full min-w-0 w-full cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left sm:gap-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
            <span className="flex items-start justify-between gap-[var(--space-2)]">
              <span className="text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><span className="sm:hidden">Top Three</span><span className="hidden sm:inline">My Top Three</span></span>
              <ArrowUpRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
            </span>
            <span className="text-[13px] leading-[17px] font-medium sm:text-[15px] sm:leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{top3Count} of 3 chosen</span>
          </button>
        </HoverBeam>

        <HoverBeam strength={0.8} className="min-w-0">
          <button type="button" onClick={onGoPlan} className="dm-tap flex h-full min-w-0 w-full cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left sm:gap-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
            <span className="flex items-start justify-between gap-[var(--space-2)]">
              <span className="text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><span className="sm:hidden">Plan</span><span className="hidden sm:inline">My Plan</span></span>
              <ArrowUpRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
            </span>
            <span className="flex flex-col gap-[6px]">
              <span className="text-[13px] leading-[17px] font-medium sm:text-[15px] sm:leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{progress.complete} of {progress.total} steps</span>
              <SparkBar percent={progress.pct} min={2} height={6} track="var(--glass-surface-2)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" idle />
            </span>
          </button>
        </HoverBeam>

        <HoverBeam strength={0.8} className="min-w-0">
          <button type="button" onClick={onGoReport} className="dm-tap flex h-full min-w-0 w-full cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left sm:gap-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
            <span className="flex items-start justify-between gap-[var(--space-2)]">
              <span className="text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><span className="sm:hidden">Report</span><span className="hidden sm:inline">Career Report</span></span>
              <ArrowUpRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
            </span>
            <span className="text-[13px] leading-[17px] font-medium sm:text-[15px] sm:leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{REPORT_SECTIONS.length} sections</span>
          </button>
        </HoverBeam>
      </section>

      <DoThisNextCard />
    </div>
  );
}

// Shared by both Overview versions (v1's original bento, v2's dashboard
// below) so the one actual next-step CTA never has two copies to drift out
// of sync. Do this next (official copy, 5 Sept 2026): Explore leads (it is
// where a new student starts); Play is the alternative for someone with a
// #1 already. One shared card (not two standalone ones -- splitting it
// read as disintegrated, direct feedback, 9 Sept 2026), holding two
// full-width list rows instead of a pill button sitting mid-sentence: each
// row is the whole tap target, with an icon, the verb plain in the
// sentence, and a solid CTA at the end matching NextStepBanner. Hover
// fills only the row's own rect (dm-quiet, no radius of its own) -- the
// section's overflow-hidden clips it to the card's rounded corners, so the
// boundary still reads as one piece. The border itself is BorderBeam
// (border-beam npm package), the same one used on NextStepBanner -- no
// literal `border` class here, the beam supplies the whole outline.
function DoThisNextCard() {
  return (
    <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
      <section aria-labelledby="next-title" className="flex flex-col overflow-hidden rounded-[var(--radius-lg)]" style={{ background: INSET.background }}>
        <h3 id="next-title" className="px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-2)] text-[12px] font-bold tracking-[1.4px] uppercase sm:px-[var(--space-5)] sm:pt-[var(--space-5)]" style={{ color: "var(--accent-subtle)" }}>Do this next</h3>
        {[
          { href: "/explore?tab=browse", verb: "Explore", Icon: Compass, rest: "10 Finance Careers" },
          { href: "/play/investment-banking", verb: "Play", Icon: Gamepad2, rest: "Day in the Life of an Investment Banker Simulation" },
        ].map((line, index, list) => (
          <Fragment key={line.verb}>
            {index > 0 && (
              <div className="flex items-center gap-[10px] px-[var(--space-4)] sm:px-[var(--space-5)]" aria-hidden="true">
                <span className="h-px flex-1" style={{ background: "var(--glass-border)" }} />
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>or</span>
                <span className="h-px flex-1" style={{ background: "var(--glass-border)" }} />
              </div>
            )}
            <Link
              href={line.href}
              className={`dm-quiet group flex items-center justify-between gap-[var(--space-3)] rounded-none px-[var(--space-4)] py-[var(--space-3)] sm:px-[var(--space-5)] ${index === list.length - 1 ? "pb-[var(--space-4)] sm:pb-[var(--space-5)]" : ""}`}
            >
              {/* Plain sentence, verb uncoloured, and the action is a real
                 button at the end -- the same solid CTA NextStepBanner's
                 "Your next step" cards use -- instead of a gradient verb
                 plus a "Let's go" that only appeared on hover (direct
                 feedback, 10 Sept 2026: "uncolor the first word in both
                 sentences and add a cta button to the end where 'let's go'
                 appears ... consistent with the other your next step
                 cards"). The whole row stays the link; the CTA is a styled
                 span inside it, since a button can't nest in an anchor. */}
              <span className="min-w-0 text-[14px] leading-[19px] font-semibold sm:text-[15px]" style={{ color: "var(--foreground)" }}>
                {line.verb} {line.rest}
              </span>
              <span className="dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)]" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
                <line.Icon className="h-4 w-4" aria-hidden /> Let&rsquo;s go <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />
              </span>
            </Link>
          </Fragment>
        ))}
      </section>
    </BorderBeam>
  );
}

// ---- Overview v2: a real dashboard, not three doorways ----
// v1's bento is navigation dressed as data (a caption + one number, each
// tile just a link to a tab that's already in the tab strip right below
// it, direct feedback 20 Sept). This is the alternative: the same three
// destinations, given a real graphic treatment instead of a bare caption
// each -- gradient-filled marks throughout (RingStat, GradientPips), the
// same technique, not a chart per tile. No career-match bar chart here on
// purpose (direct feedback, 20 Sept: cut) -- "3 of 3 chosen" is the real
// metric for Top Three, the same one v1 uses, just drawn as a mark instead
// of printed as a sentence. Never changes v1 -- purely additive, reached
// through OverviewVersionChip.

// Rings kept getting rebuilt back to life here across several rounds of
// feedback before landing on bars (SparkBar, this app's own established
// meter) instead -- removed for good rather than left as dead code
// (direct feedback, 20 Sept: "why are we still doing rings?").

// Both DotTrio (Report) and WindowTrio (Plan) -- three small pill marks in
// a row -- got removed here. Sitting next to a number that already said
// the same count, they read as carousel/pagination dots, not data (direct
// feedback, 20 Sept: "the three bar graphs in my plan read like
// pagination. redesign all cards"). Every tile in this dashboard now
// carries exactly one visual for its one real number: a SparkBar for a
// ratio (Top Three, Plan), a plain icon-in-circle for a count with no
// fixed ceiling (Report, Resume) -- one family, not five treatments.

// The ring (Top Three, then Report) got rebuilt with real gradient +
// transparency per direct feedback, then dropped for good: its number sat
// inside the graphic with nothing tying it to the caption beside it, so
// the two never read as one fact (direct feedback, 20 Sept: "2 is inside
// the ring so it feels disconnected"). Both tiles now use the same
// icon-circle + inline "N + label" line Resume already had, where the
// number IS the sentence rather than a separate graphic next to one.

/** The one hover cue every clickable tile on this dashboard shares: a
 *  chevron that fades in and nudges right on hover/focus, nothing visible
 *  at rest -- the same interaction the mentorship dashboard's cards use
 *  (MentorshipTab.tsx's own HoverChevron), reused here rather than a
 *  second implementation of the identical idea (direct instruction, 20
 *  Sept: match it, app-wide). Needs `group` on the clickable ancestor. */
function DashHoverChevron({ light = false }: { light?: boolean }) {
  return <ChevronRight aria-hidden className="pointer-events-none absolute top-[var(--space-4)] right-[var(--space-4)] z-20 h-[16px] w-[16px] opacity-0 transition-all duration-150 group-hover:translate-x-[2px] group-hover:opacity-100 sm:top-[var(--space-5)] sm:right-[var(--space-5)]" style={{ color: light ? "rgba(255,255,255,0.85)" : "var(--muted-foreground)" }} />;
}

// Aug-Dec reads as Fall, Jan-Mar as Winter, Apr-Jul as Spring -- the same
// three windows gradePlanData.ts's own plans are organized into. A plain
// month check, not tied to any account data, since nothing else in this
// prototype tracks an actual school calendar.
// Matches GRADE_WINDOW_MONTHS below exactly (Sept-Nov/Dec-Feb/Mar-May) --
// June-August has no window of its own, bucketed into "fall" as the
// upcoming term rather than inventing a fourth season nothing else here has.
function currentPlanWindowId(): "fall" | "winter" | "spring" {
  const m = new Date().getMonth();
  if (m === 11 || m <= 1) return "winter";
  if (m >= 2 && m <= 4) return "spring";
  return "fall";
}

function OverviewTabV2({
  focus, top3Careers, onGoTop3, onGoPlan, onGoReport, onGoResume, seasonOverride,
}: {
  focus: ProfileCareer | null;
  top3Careers: ProfileCareer[];
  onGoTop3: () => void;
  onGoPlan: () => void;
  onGoReport: () => void;
  onGoResume: () => void;
  seasonOverride: "fall" | "winter" | "spring" | null;
}) {
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const stage = useStage();
  if (!focus) return null;
  // The actual "My Plan" tab (MyPlanTab -> GradePlanCard) is the grade-by-
  // grade Fall/Winter/Spring plan, NOT career.plan -- a completely separate
  // model that was never what this tile was reading before (verified by
  // reading MyPlanTab's own render, 20 Sept 2026: "is it really 13 steps?
  // check the logic" -- it wasn't; that number came from career.plan,
  // which nothing in My Plan actually shows). This reads the same
  // gradePlan()/collegePlan() the real tab does, so the window and step
  // named here are the ones a click-through actually lands on.
  const defaultGrade = (Number(STUDENT.grade.replace("Grade ", "")) || 9) as 9 | 10 | 11 | 12;
  const plan = stage === "hs" ? gradePlan(defaultGrade) : collegePlan(1, { id: focus.id, title: focus.title });
  const windowId = seasonOverride ?? currentPlanWindowId();
  const currentWindow = plan.windows.find((w) => w.id === windowId) ?? plan.windows[0];
  // A single "best" score assumes one resume; Choose & Tailor produces as
  // many named versions as a student wants, so the only metric that's
  // still true at any count is how many exist (direct feedback, 20 Sept:
  // "what happens when there are multiple. bad metrics to show here").
  const resumeCount = resume.versions.length;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Two real ratios (chosen/3, steps done/total) lead, side by side.
         Bars, not rings (direct feedback, 20 Sept) -- SparkBar is this
         app's own established meter (Plan's v1 tile already used it), so
         this reuses it rather than a bespoke ring nobody asked for twice.
         Stacks to one column below sm (direct feedback, 20 Sept: four
         tiles across didn't hold up on tablet/mobile, and this is the
         first screen a student sees with the whole app unlocked -- worth
         real composition). */}
      <section aria-labelledby="dash-title" className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <h3 id="dash-title" className="sr-only">Your Top Three, plan, report and resume at a glance</h3>

        {/* Top Three: chosen/3 is a real ratio -- v1's own metric, now a
           bar. Leads with WHO is primary and HOW strong that match is
           (the match score was sitting unused; pairing identity with
           strength is a real insight "2 of 3" alone never gave). */}
        <HoverBeam strength={0.6} className="min-w-0">
          {/* A real div, not a button, now that "Choose N more" is its own
             link -- a <button> can't legally contain another interactive
             element (direct feedback, 20 Sept: make it clickable straight
             to Explore). role="button" + the same keyboard handling keeps
             the rest of the card exactly as clickable as it always was. */}
          <div
            role="button" tabIndex={0} onClick={onGoTop3}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onGoTop3(); } }}
            className="dm-tap group relative flex h-full w-full cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left sm:p-[var(--space-5)]" style={INSET}
          >
            <DashHoverChevron />
            {/* Caption sits exactly where Plan's own caption
               ("PROFESSIONAL READINESS") sits, directly on top of the
               bar, same all-caps styling -- only the number itself is
               brighter than the rest of the line. The #1 badge + name
               moved underneath the bar instead, in the stat-line spot
               Plan uses for "Term 1 of 3..." (direct feedback, 20 Sept). */}
            <span className="text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>My Top Three</span>
            {/* The #1 pick's own name dropped (direct feedback, 21 Sept
               2026: "a quick status snapshot, not a detailed page" -- the
               ratio below is the one fact this tile exists to show, so it's
               now the headline text instead of a small caption over a
               separate name row). */}
            <span className="flex flex-col gap-[8px]">
              <span className="flex items-baseline gap-[6px]">
                <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{top3Careers.length}</span>
                <span className="text-[13.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>of 3 chosen</span>
              </span>
              <SparkBar percent={(top3Careers.length / 3) * 100} min={8} height={6} track="color-mix(in srgb, var(--foreground) 10%, transparent)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" idle />
            </span>
            <span className="flex flex-col gap-[8px]">
              {top3Careers.length < 3 ? (
                <Link
                  href="/explore"
                  onClick={(e) => e.stopPropagation()}
                  className="dm-link dm-chip-hover flex w-fit items-center gap-[6px]"
                >
                  <Plus className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                  <span className="min-w-0 truncate text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--foreground)" }}>
                    Choose {3 - top3Careers.length} more
                  </span>
                </Link>
              ) : (
                <span className="flex items-center gap-[6px]">
                  <Plus className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                  <span className="min-w-0 truncate text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--foreground)" }}>All three chosen</span>
                </span>
              )}
            </span>
          </div>
        </HoverBeam>

        {/* Plan: reads the same gradePlan()/collegePlan() windows the real
           My Plan tab shows (see the note above -- this used to read
           career.plan, a different model the tab doesn't even render).
           Same dark card + subtle season wash as the real accordions
           (SeasonScene) -- v2-only, so it never leaks into v1. Term
           position is a real ratio (SparkBar), same family as Top Three's
           ring above it. */}
        <HoverBeam strength={0.6} className="min-w-0">
          {/* A real div, not a button, now that "Next: ..." is its own
             link straight to that step (direct feedback, 20 Sept) -- a
             <button> can't legally contain another interactive element. */}
          <div
            role="button" tabIndex={0} onClick={onGoPlan}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onGoPlan(); } }}
            className="dm-season-host dm-tap group relative flex h-full w-full cursor-pointer flex-col justify-between gap-[var(--space-3)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left sm:p-[var(--space-5)]" style={INSET}
          >
            <SeasonScene seasonId={currentWindow.id} />
            <DashHoverChevron />
            <span className="relative z-[1] text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>My Plan</span>
            {/* Plan name, term ratio, and the "Next" step all dropped
               (direct feedback, 21 Sept 2026: "a quick status snapshot, not
               a detailed page" -- three separate facts read as too much
               here). What's left: which semester (the one thing the season
               art alone doesn't say in words) as the headline, and how many
               actions are in it. No fake "N complete" count -- nothing in
               this app tracks per-step completion yet, so a done/total
               ratio here would be invented, not real. */}
            <span className="relative z-[1] flex items-baseline gap-[6px]">
              <span className="text-[22px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{currentWindow.title} Semester</span>
            </span>
            <span className="relative z-[1] text-[13.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
              {currentWindow.steps.length} action{currentWindow.steps.length === 1 ? "" : "s"} this term
            </span>
          </div>
        </HoverBeam>
      </section>

      {/* Report + Resume: neither is a ratio (both are complete-or-not,
         no fixed target to measure against), and neither changes as often
         as the two above -- one quieter strip for both instead of two more
         equal-weight boxes repeating the same ring shape those two facts
         don't actually have. Splits into its own two halves so each still
         opens its own tab. */}
      <div className="flex flex-col divide-y overflow-hidden rounded-[var(--radius-lg)] border sm:flex-row sm:divide-x sm:divide-y-0" style={{ borderColor: "var(--glass-border)", background: INSET.background }}>
        {/* Report: same icon-circle + inline "N + label" line as Resume
           beside it, not a ring -- a ring's number sat inside the graphic
           with nothing connecting it to the caption beside it (direct
           feedback, 20 Sept: "2 is inside the ring so it feels
           disconnected"). Still the identical real ratio (reports ready /
           3 picks), just written as one sentence instead. */}
        <button type="button" onClick={onGoReport} className="dm-tap group relative flex flex-1 min-w-0 cursor-pointer items-center justify-between gap-[var(--space-3)] p-[var(--space-4)] text-left sm:p-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex min-w-0 items-center gap-[var(--space-3)]">
            <span className="flex size-[36px] flex-none items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-[1.08]" style={{ background: "color-mix(in srgb, var(--accent-subtle) 16%, transparent)" }}>
              <BadgeCheck className="h-4 w-4" aria-hidden style={{ color: "var(--accent-subtle)" }} />
            </span>
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Career Report</span>
              <span className="flex items-baseline gap-[6px]">
                <span className="text-[22px] leading-[26px] font-extrabold tabular-nums transition-colors duration-150 group-hover:text-[var(--accent-subtle)]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{top3Careers.length}</span>
                <span className="text-[13.5px] font-bold" style={{ color: top3Careers.length < 3 ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>of 3 reports ready</span>
              </span>
            </span>
          </span>
          <DashHoverChevron />
        </button>

        {/* Resume: dropped the version count entirely (direct feedback, 21
           Sept 2026: "simplify to Not started or Start your resume") --
           complete-or-not is the only fact this tile needs to give in a
           snapshot; how many versions exist is real detail for the Resume
           tab itself, not the Overview. */}
        <button type="button" onClick={onGoResume} className="dm-tap group relative flex flex-1 min-w-0 cursor-pointer items-center justify-between gap-[var(--space-3)] p-[var(--space-4)] text-left sm:p-[var(--space-5)]">
          <span className="flex min-w-0 items-center gap-[var(--space-3)]">
            <span className="flex size-[36px] flex-none items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-[1.08]" style={{ background: resumeCount > 0 ? "color-mix(in srgb, var(--accent-subtle) 16%, transparent)" : "color-mix(in srgb, var(--accent-subtle) 8%, transparent)" }}>
              <BookOpen className="h-4 w-4" aria-hidden style={{ color: "var(--accent-subtle)" }} />
            </span>
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Resume</span>
              <span className="text-[19px] leading-[24px] font-extrabold transition-colors duration-150 group-hover:text-[var(--accent-subtle)]" style={{ fontFamily: "var(--font-display)", color: resumeCount > 0 ? "var(--foreground)" : "var(--accent-subtle)" }}>
                {resumeCount > 0 ? "Resume ready" : "Start your resume"}
              </span>
            </span>
          </span>
          <DashHoverChevron />
        </button>
      </div>
    </div>
  );
}

// Same demo-only pattern as the AT&T board's own VersionChip (a small,
// muted toggle beside the main content, never mistaken for product UI):
// v1 is the shipped bento, v2 is this dashboard -- both real, neither
// hidden, switching is session-only (direct instruction, 20 Sept: "subtle,
// out of the way... outside that whole card surface thing").
function OverviewVersionChip({ version, onChange }: { version: "v1" | "v2"; onChange: (v: "v1" | "v2") => void }) {
  return (
    <div role="tablist" aria-label="Overview version" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)" }}>
      {(["v1", "v2"] as const).map((key) => {
        const on = key === version;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(key)}
            className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[1px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
            style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

/** QA-only: cycles Auto (real date) -> Fall -> Winter -> Spring -> Auto,
 *  one click at a time -- lets the season art on the Plan tile be checked
 *  without waiting for the calendar to actually reach each window. */
function SeasonQAToggle({ value, onChange }: { value: "fall" | "winter" | "spring" | null; onChange: (v: "fall" | "winter" | "spring" | null) => void }) {
  const order: Array<"fall" | "winter" | "spring" | null> = [null, "fall", "winter", "spring"];
  const label = value ? value[0].toUpperCase() + value.slice(1) : "Auto";
  return (
    <button
      type="button"
      onClick={() => onChange(order[(order.indexOf(value) + 1) % order.length])}
      title="QA: cycle the Plan tile's season art"
      className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[3px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
      style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
    >
      Season: {label}
    </button>
  );
}

// ---- Evidence: the inputs, in the open and correctable ----
// Everything the report is built from, in the student's terms. Nothing
// inferred appears here, because anything a student cannot check is not
// something we should be showing back to them as fact.

function EvidenceSheet({
  focus, confirmed, hidden, onToggleConfirmed, onHide, onClose,
}: {
  focus: ProfileCareer | null;
  confirmed: Set<string>;
  hidden: Set<string>;
  onToggleConfirmed: (id: string) => void;
  onHide: (id: string) => void;
  onClose: () => void;
}) {
  const [scope, setScope] = useState<"all" | "career">("all");
  const items = EVIDENCE.filter((item) => !hidden.has(item.id)).filter((item) => (scope === "all" ? true : item.careerId === focus?.id));
  const grouped = items.reduce<Record<string, EvidenceItem[]>>((acc, item) => {
    (acc[item.kind] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="no-print fixed inset-0 z-[120] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="evidence-intro">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 76%, transparent)", backdropFilter: "blur(8px)" }} />
      <div className="dm-scroll relative flex w-full max-w-[560px] flex-col gap-[var(--space-4)] overflow-y-auto border-l p-5 pb-[calc(env(safe-area-inset-bottom)+var(--space-6))] pt-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <span className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Evidence</span>
          <h3 id="evidence-intro" className="text-[18px] leading-[22px] font-extrabold sm:text-[21px] sm:leading-[26px]" style={{ fontFamily: "var(--font-display)" }}>What your report is built from</h3>
          <span className="max-w-[54ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
            Only things you chose, did or wrote. If something here is wrong, fix it and the report changes with it.
          </span>
        </span>
        <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label="Close evidence">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div role="group" aria-label="Filter evidence" className="flex w-fit gap-[3px] rounded-[var(--radius-md)] border p-[3px]" style={{ borderColor: "var(--glass-border)" }}>
        {([["all", "Everything"], ["career", focus ? `Just ${focus.title}` : "This career"]] as const).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)} className="dm-quiet min-h-[38px] cursor-pointer rounded-[var(--radius-md)] px-[14px] text-[14px] font-semibold" style={{ background: scope === value ? "var(--glass-surface-3)" : "transparent", color: scope === value ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {label}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([kind, list]) => (
        <section key={kind} aria-labelledby={`ev-${kind}`} className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={GLASS}>
          <h3 id={`ev-${kind}`} className="text-[16px] font-extrabold sm:text-[18px]" style={{ fontFamily: "var(--font-display)", color: "var(--accent-subtle)" }}>
            {EVIDENCE_KIND_LABEL[kind as EvidenceItem["kind"]]}
          </h3>
          <ul className="flex list-none flex-col p-0">
            {list.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-[var(--space-3)] border-t py-[11px] first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
                <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <span className="text-[15px] leading-[18px] font-bold">{item.label}</span>
                  <span className="text-[14px] leading-[16px] font-bold" style={{ color: "var(--muted-foreground)" }}>{item.detail} · {item.when}</span>
                </span>
                <span className="flex flex-none items-center gap-[var(--space-2)]">
                  <button type="button" role="checkbox" aria-checked={confirmed.has(item.id)} onClick={() => onToggleConfirmed(item.id)} className="dm-quiet flex min-h-[44px] cursor-pointer items-center gap-[6px] text-[14px] font-bold" style={{ color: confirmed.has(item.id) ? "var(--color-feedback-success, #33c78c)" : "var(--muted-foreground)" }}>
                    <span className="flex size-[18px] items-center justify-center rounded-[5px] border" style={{ borderColor: confirmed.has(item.id) ? "var(--color-feedback-success, #33c78c)" : "var(--glass-border)" }}>
                      {confirmed.has(item.id) && <Check className="h-3 w-3" aria-hidden />}
                    </span>
                    {confirmed.has(item.id) ? "Right" : "Confirm"}
                  </button>
                  <button type="button" onClick={() => onHide(item.id)} className="dm-quiet min-h-[44px] cursor-pointer px-[6px] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                    Not me
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {items.length === 0 && (
        <section className="rounded-[var(--radius-lg)] border p-[var(--space-8)] text-center" style={GLASS}>
          <p className="text-[15px] font-bold">Nothing logged for this career yet</p>
          <p className="mx-auto mt-[6px] max-w-[40ch] text-[15px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>Play a simulation or finish a glossary level and it shows up here.</p>
        </section>
      )}

      <section className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={GLASS}>
        <span className="text-[16px] font-extrabold sm:text-[18px]" style={{ fontFamily: "var(--font-display)", color: "var(--accent-subtle)" }}>What does not count</span>
        <p className="text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
          Scrolling, tapping around and watching without finishing. Dreamari keeps some internal signals to order your feed, and none of them appear in your report or get shared with anyone.
        </p>
      </section>
      </div>
    </div>
  );
}

// ---- Compare charts: one measure per chart, single hue, labeled bars ----

function CompareChart({ title, better, unit, rows, selectedId }: { title: string; better: "lower" | "higher"; unit: (value: number) => string; rows: { id: string; name: string; value: number }[]; selectedId: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="dm-glass flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] p-[var(--space-4)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-bold">{title}</span>
        <span className="text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{better} is better</span>
      </div>
      <div className="flex flex-col gap-[6px]">
        {rows.map((row) => (
          <div key={row.id} title={`${row.name}: ${unit(row.value)}`} className="flex items-center gap-[8px]">
            <span className="w-[88px] flex-none truncate text-[12px] leading-[14px] font-bold" style={{ color: row.id === selectedId ? "var(--foreground)" : "var(--muted-foreground)" }}>{row.name}</span>
            <span className="relative h-[10px] min-w-0 flex-1">
              <span className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: `${Math.max((row.value / max) * 100, 2)}%`, background: row.id === selectedId ? "var(--accent-subtle)" : "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }} />
            </span>
            <span className="w-[52px] flex-none text-right text-[12px] font-bold">{unit(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Routes: how people actually get into this career ----
// Split back out from the merged pathway screen: stacking routes above the
// plan meant scrolling past a full comparison carousel to reach today's
// tasks. Two tabs, named so they cannot be confused with each other
// ("Routes" vs "My Plan" rather than the old "Path" vs "Plan").

function RoutesTab({
  focus, chosenRoute, setRouteChoice, savedMajors, onToggleMajor, onGoPlan,
}: {
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  setRouteChoice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savedMajors: Set<string>;
  onToggleMajor: (name: string) => void;
  onGoPlan: () => void;
}) {
  if (!focus) return null;
  const report = reportV2(focus.id);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <PathTab focus={focus} chosenRoute={chosenRoute} setRouteChoice={setRouteChoice} onGoPlan={onGoPlan} />

      {report && (
        <section aria-labelledby="majors-title" className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={GLASS}>
          <h3 id="majors-title" className="text-[16px] font-extrabold sm:text-[18px]" style={{ fontFamily: "var(--font-display)", color: "var(--accent-subtle)" }}>Majors that fit these routes</h3>
          <ul className="flex list-none flex-col p-0">
            {report.majors.map((major) => (
              <li key={major.name} className="flex items-center justify-between gap-[var(--space-3)] border-t py-[10px] first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
                <span className="flex min-w-0 flex-col gap-[1px]">
                  <span className="truncate text-[15px] font-bold">{major.name}</span>
                  <span className="truncate text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{major.teaches}</span>
                </span>
                <button type="button" aria-pressed={savedMajors.has(major.name)} onClick={() => onToggleMajor(major.name)} className="dm-quiet flex min-h-[44px] flex-none cursor-pointer items-center gap-[5px] text-[14px] font-bold" style={{ color: savedMajors.has(major.name) ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
                  {savedMajors.has(major.name) ? <><Check className="h-3.5 w-3.5" aria-hidden /> Saved</> : <><Plus className="h-3.5 w-3.5" aria-hidden /> Save</>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---- My Plan: what to do about it, plus what is coming up ----

function MyPlanTab({ focus, onGoRoutes, variant = "v1" }: { focus: ProfileCareer | null; onGoRoutes: () => void; variant?: "v1" | "v2" }) {
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <GradePlanCard focus={focus} onGoRoutes={onGoRoutes} variant={variant} />
    </div>
  );
}

// Routes list. One column, one row per route, stats laid out horizontally so
// three routes can be read against each other without scrolling sideways.
// The pitch, fit, student life and payoff detail moves into a modal, because
// on a list the only job is "which of these do I want to look at".

function RouteRow({ route, selected, onOpen, onSelect }: {
  route: ProfileCareer["routes"][number];
  selected: boolean;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const detail = routeDetail(route.id);
  const stats = [
    { label: "Time", value: route.duration },
    { label: "Cost", value: route.cost.split(",")[0] },
    { label: "Pay", value: route.salary.split(",")[0].replace(/\s*first year/i, "") },
    { label: "Debt clear", value: (detail?.payoff.time ?? route.loanPayoff).replace("~", "") },
  ];
  const RouteIcon = ROUTE_TYPE_ICONS[routeTypeKey(route.type)];
  return (
    // The whole card opens the detail. A full-bleed button sits behind the
    // content rather than wrapping it, so "Make this my path" stays a real
    // sibling button instead of an invalid nested one.
    <div
      className="dm-tap group relative flex w-[74vw] max-w-[280px] flex-none snap-start flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:w-auto sm:max-w-none"
      style={{ background: selected ? "color-mix(in srgb, var(--primary) 9%, var(--glass-surface-1))" : "var(--glass-surface-1)", borderColor: selected ? "var(--primary)" : "var(--glass-border)" }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open details for ${route.short}`}
        className="absolute inset-0 z-0 cursor-pointer rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-subtle)]"
      />

      <div className="pointer-events-none relative z-[1] flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-col items-start gap-[var(--space-3)]">
          <span className="flex w-full items-start justify-between gap-[var(--space-2)]">
            <span className="flex size-9 flex-none items-center justify-center rounded-full" style={{ background: "var(--glass-surface-2)", color: "var(--accent-subtle)" }}>
              <RouteIcon className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex flex-none items-center gap-[5px]">
              {route.recommended && (
                <span className="flex items-center gap-[3px] rounded-full px-[8px] py-[2px] text-[12px] font-bold tracking-[0.6px] whitespace-nowrap uppercase" style={{ background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" }}>
                  <Sparkles className="h-2.5 w-2.5" aria-hidden /> Pick
                </span>
              )}
              {selected && <span className="rounded-[var(--radius-sm)] px-[8px] py-[2px] text-[12px] font-bold tracking-[0.6px] whitespace-nowrap uppercase" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Yours</span>}
            </span>
          </span>
          <span className="flex w-full items-center gap-[var(--space-2)]">
            <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="text-[19px] leading-[24px] font-extrabold tracking-[-0.02em]" style={{ fontFamily: "var(--font-display)" }}>{route.short}</span>
              <span className="text-[14px] leading-[15px] font-bold" style={{ color: "var(--muted-foreground)" }}>{route.credential}</span>
            </span>
            <span
              aria-hidden
              className="flex size-7 flex-none items-center justify-center rounded-full border transition-colors group-hover:border-[var(--accent-subtle)] group-hover:text-[var(--accent-subtle)]"
              style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          </span>
        </div>

        <dl className="flex flex-col border-t pt-[var(--space-2)]" style={{ borderColor: "var(--glass-border)" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between gap-[var(--space-2)] py-[6px]">
              <dt className="flex-none text-[12px] font-bold tracking-[1px] whitespace-nowrap uppercase" style={{ color: "var(--muted-foreground)" }}>{stat.label}</dt>
              <dd className="min-w-0 truncate text-[16px] leading-[20px] font-extrabold tracking-[-0.015em]" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }} title={stat.value}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {!selected && (
        <button
          type="button"
          onClick={onSelect}
          className="dm-quiet relative z-[2] mt-auto min-h-[40px] w-full cursor-pointer rounded-[var(--radius-md)] border text-[15px] font-bold"
          style={{ borderColor: "var(--border)", background: "transparent" }}
        >
          Make this my path
        </button>
      )}
    </div>
  );
}

function RouteDetailModal({ route, majors, selected, onSelect, onGoPlan, onClose }: {
  route: ProfileCareer["routes"][number];
  majors?: string[];
  selected: boolean;
  onSelect: () => void;
  onGoPlan: () => void;
  onClose: () => void;
}) {
  return (
    <Portal>
    <div className="no-print fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label={`${route.short} details`}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(8px)" }} />
      <div className="relative flex max-h-[92dvh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <button type="button" onClick={onClose} className="dm-quiet absolute top-[10px] right-[10px] z-10 flex size-[44px] cursor-pointer items-center justify-center rounded-full" aria-label="Close details">
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div className="dm-scroll min-h-0 flex-1 overflow-y-auto p-[var(--space-4)] pb-[calc(env(safe-area-inset-bottom)+var(--space-5))] sm:p-[var(--space-5)]">
          <RouteColumn route={route} majors={majors} selected={selected} onSelect={onSelect} onGoPlan={onGoPlan} inModal />
        </div>
      </div>
    </div>
    </Portal>
  );
}

function PathTab({ focus, chosenRoute, setRouteChoice, onGoPlan }: {
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  setRouteChoice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onGoPlan: () => void;
}) {
  const [routeView, setRouteView] = useState<"cards" | "compare">("cards");
  const [openRoute, setOpenRoute] = useState<string | null>(null);

  if (!focus) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-8)] text-center" style={GLASS}>
        <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Pick a career above to see its routes</p>
        <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Your Top 3 lives at the top of this page. Tap a card or add one.</p>
      </section>
    );
  }

  const active = focus.routes.find((route) => route.id === openRoute) ?? null;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 key={focus.id} className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}><InkText text={`Paths into ${focus.title}`} /></h2>
        <button
          type="button"
          onClick={() => setRouteView(routeView === "cards" ? "compare" : "cards")}
          className="dm-quiet flex min-h-[40px] flex-none cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-bold"
          style={{ borderColor: routeView === "compare" ? "var(--accent-subtle)" : "var(--border)", background: "transparent", color: routeView === "compare" ? "var(--accent-subtle)" : "var(--foreground)" }}
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden />
          {routeView === "compare" ? "Back to paths" : `Compare all ${focus.routes.length}`}
        </button>
      </div>

      {routeView === "cards" ? (
        <div className="-mx-5 flex snap-x snap-mandatory items-stretch gap-[var(--space-3)] overflow-x-auto scroll-px-5 px-5 pt-1 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:[grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]" style={{ touchAction: "pan-x pan-y" }}>
          {focus.routes.map((routeOption) => (
            <RouteRow
              key={routeOption.id}
              route={routeOption}
              selected={chosenRoute(focus).id === routeOption.id}
              onOpen={() => setOpenRoute(routeOption.id)}
              onSelect={() => setRouteChoice((current) => ({ ...current, [focus.id]: routeOption.id }))}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--space-4)]">
          <CompareTable routes={focus.routes} selectedId={chosenRoute(focus).id} />
          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
            <CompareChart title="Total cost" better="lower" unit={(value) => (value === 0 ? "$0" : `$${value}K`)} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.costMidK }))} selectedId={chosenRoute(focus).id} />
            <CompareChart title="Years to job" better="lower" unit={(value) => `${value} yr`} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.years }))} selectedId={chosenRoute(focus).id} />
            <CompareChart title="First-year pay" better="higher" unit={(value) => `$${value}K`} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.payMidK }))} selectedId={chosenRoute(focus).id} />
            <CompareChart title="Loan payoff" better="lower" unit={(value) => (value === 0 ? "None" : `${value} yr`)} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.payoffYears }))} selectedId={chosenRoute(focus).id} />
          </div>
        </div>
      )}

      {active && (
        <RouteDetailModal
          route={active}
          majors={careerReport(focus.id)?.majors}
          selected={chosenRoute(focus).id === active.id}
          onSelect={() => setRouteChoice((current) => ({ ...current, [focus.id]: active.id }))}
          onGoPlan={() => { setOpenRoute(null); onGoPlan(); }}
          onClose={() => setOpenRoute(null)}
        />
      )}
    </div>
  );
}

const GRADE_WINDOW_MONTHS: Record<string, string> = { fall: "Sept – Nov", winter: "Dec – Feb", spring: "Mar – May" };

/** One calendar frame: a thin colored strip on its own (the "header," not
 *  shared with either month) sits above both months stacked underneath it
 *  in identical styling, so neither reads more important than the other
 *  (direct feedback, 20 Sept: "dont put one in colored header and not the
 *  other... have both months below stacked so one doesnt read too
 *  important than the other"). Sized to sit inline with the window title
 *  rather than stacked above it. v2 accordions only; v1 keeps its plain
 *  uppercase label untouched. */
function CalendarMonthChip({ label, tint }: { label: string; tint: string }) {
  const [start, end] = label.split("–").map((s) => s.trim());
  return (
    <span className="flex h-[34px] w-[30px] flex-none flex-col overflow-hidden rounded-[6px] border" style={{ borderColor: "rgba(255,255,255,0.22)" }} role="img" aria-label={label}>
      <span className="h-[5px] w-full flex-none" style={{ background: tint }} />
      <span className="flex flex-1 flex-col items-center justify-center gap-[1px]" style={{ background: "rgba(255,255,255,0.08)" }}>
        <span className="text-[7.5px] leading-none font-extrabold tracking-[0.02em]" style={{ color: "var(--foreground)" }}>{start}</span>
        <span className="text-[7.5px] leading-none font-extrabold tracking-[0.02em]" style={{ color: "var(--foreground)" }}>{end}</span>
      </span>
    </span>
  );
}

const GRADE_WINDOW_DUE: Record<string, string> = { fall: "Due by Nov", winter: "Due by Feb", spring: "Due by May" };

// The grade-by-grade academic plan (course planning, applications, financial
// aid -- what a counselor tracks regardless of which career a student is
// leaning toward), built as its own row/accordion in exactly PlanTab's own
// shape below it -- direct instruction, 16 Sept 2026, after a long same-day
// detour through calendar-tile grids, accordions-with-icons and seasonal
// header art that never landed: "refer the version before we started doing
// the whole my plan changes today"..."the accordion card style that was
// there before that"..."the one that was live today before we worked on the
// plan tab"..."yes this, with the new information from the doc." That
// "before" turned out to be PlanTab itself (Level 1/2/3 horizons, action
// label + title rows grouped In app/Out of app, an in-app row as its own
// link) -- so this reuses that exact pattern with terms (Fall/Winter/
// Spring) standing in for horizons and each step's own category (BUILD,
// EXPLORE, PLAY...) standing in for task.action, instead of inventing a new
// visual language for the same idea. "New information" layered on top:
// counselor-verified steps (course plans, academic reviews -- things only a
// counselor's own dashboard can confirm) get no working checkbox and open a
// short modal instead of faking a checkmark this app can't verify; an
// optional step (the avatar/cover add-on) doesn't count toward the total;
// "Build your Profile" starts checked off for this demo student; a
// deadline-bound step names the term's closing month.
function GradePlanCard({ focus, onGoRoutes, variant = "v1" }: { focus: ProfileCareer | null; onGoRoutes: () => void; variant?: "v1" | "v2" }) {
  const defaultGrade = (Number(STUDENT.grade.replace("Grade ", "")) || 9) as 9 | 10 | 11 | 12;
  // High School | College (Joshua Pierce, Slack, 18 Sept 2026: "expand it
  // so students can continue using it through college"). Same Fall /
  // Winter / Spring windows and In app / Out of app split either way; the
  // college copy fills in the student's #1 career where it names one.
  // the Demo toggle here sets the app-wide stage too (notifications, chat)
  const storedStage = useStage();
  const [stage, setStageLocal] = useState<PlanStage>(storedStage);
  const setStage = (next: PlanStage) => { setStageLocal(next); writeStage(next); };
  // The stage and level controls are demo tools: a real student's grade is
  // known. They live in a small Demo row above the card, the same chip
  // Connect uses, so the card itself never carries toggles (direct
  // feedback, 18 and 19 Sept 2026: "we never have the big toggle stuff").
  const [demoOpen, setDemoOpen] = useState(false);
  const [grade, setGrade] = useState<9 | 10 | 11 | 12>(defaultGrade);
  const [year, setYear] = useState<CollegeYear>(1);
  const [done, setDone] = useState<Set<string>>(new Set(["g9-fall-build"]));
  const [openWindow, setOpenWindow] = useState<string | null>(null);
  const [noteStep, setNoteStep] = useState<GradeStep | null>(null);
  const plan = stage === "hs" ? gradePlan(grade) : collegePlan(year, focus ? { id: focus.id, title: focus.title } : null);
  const levelLabel = stage === "hs" ? `Grade ${grade}` : `Year ${year}`;
  const allSteps = plan.windows.flatMap((w) => w.steps).filter((s) => !s.optional);
  const doneCount = allSteps.filter((s) => done.has(s.id)).length;
  const RULE = "var(--inset-border)";

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chip = (on: boolean, onClick: () => void, label: string, key: string, group: string) => (
    <button key={key} type="button" role="tab" aria-selected={on} onClick={onClick} className="dm-quiet relative flex h-[24px] min-w-[24px] cursor-pointer items-center justify-center rounded-[6px] px-[8px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
      {on && <motion.span layoutId={`grade-plan-demo-${group}`} aria-hidden className="absolute inset-0 rounded-[6px]" style={{ background: "var(--glass-surface-2)", boxShadow: "inset 0 0 0 1px var(--glass-border)" }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
      <span className="relative">{label}</span>
    </button>
  );
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {/* Demo row: sits above the card, right-aligned and quiet, so the plan
         itself reads as the product. One press shows two small chip groups,
         stage then level, and a second press hides them again. */}
      <div className="-mb-[2px] flex min-h-[24px] flex-wrap items-center justify-end gap-[8px]">
        {demoOpen && (
          <>
            <div id="grade-plan-demo" role="tablist" aria-label="High school or college" className="flex items-center gap-[2px] rounded-[8px] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              {([["hs", "High school"], ["college", "College"]] as const).map(([key, label]) => chip(key === stage, () => setStage(key), label, key, "stage"))}
            </div>
            <div role="tablist" aria-label={stage === "hs" ? "Grade" : "Year"} className="flex items-center gap-[2px] rounded-[8px] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              {stage === "hs"
                ? ([9, 10, 11, 12] as const).map((g) => chip(g === grade, () => setGrade(g), String(g), `g${g}`, "level"))
                : ([1, 2, 3, 4] as const).map((y) => chip(y === year, () => setYear(y), `Yr ${y}`, `y${y}`, "level"))}
            </div>
          </>
        )}
        <button
          type="button"
          aria-expanded={demoOpen}
          aria-controls="grade-plan-demo"
          onClick={() => setDemoOpen((v) => !v)}
          className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
          style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
        >
          Demo
        </button>
      </div>
      {/* Reads as the page's own header/title now, not a card competing
         with the season cards below it -- no border, no surface fill
         (direct feedback, 20 Sept: "that card... should read more like a
         header or title to the rest of the cards rather than be its own
         card"). */}
      <div className="flex flex-col gap-[var(--space-3)] px-[2px]">
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
          <div className="flex min-w-0 flex-col gap-[2px]">
            <span className="flex flex-wrap items-baseline gap-[10px]">
              <h2 className="text-[22px] leading-[26px] font-bold tracking-[-0.01em] sm:text-[26px] sm:leading-[30px]" style={{ fontFamily: "var(--font-display)" }}>
                <InkText text={focus ? `Plan for ${focus.title}` : "My Plan"} />
              </h2>
              {focus && <button type="button" onClick={onGoRoutes} className="dm-link flex-none cursor-pointer text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>Change route</button>}
            </span>
            <span key={`${stage}-${grade}-${year}`} className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>{levelLabel} · {plan.title}</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--space-4)]">
          <span className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>Steps done</span>
          <span className="text-[15px] leading-[22px] font-bold tabular-nums">{doneCount} of {allSteps.length}</span>
        </div>
        <SparkBar className="w-full" percent={Math.round((doneCount / Math.max(allSteps.length, 1)) * 100)} min={2} height={6} track="color-mix(in srgb, var(--accent-subtle) 22%, transparent)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" idle />
      </div>

      {plan.windows.map((w) => {
        const countedSteps = w.steps.filter((s) => !s.optional);
        const wDone = countedSteps.filter((s) => done.has(s.id)).length;
        const isOpen = openWindow === w.id;
        const v2 = variant === "v2";
        return (
          <section key={w.id} className="dm-season-host group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={INSET}>
            {/* v1 stays exactly the plain dark card it always was; v2 gets
               the season scene, a subtle wash + hover-only falling marks
               over the SAME dark base, not a special lighter card (direct
               feedback, 20 Sept: v1/v2 "will not have shared tabs... 2
               different versions of the entire my profile screen", and
               separately "cards... should be the same color as the cards
               in overview... but the season cards/accordions should get
               the graphical season treatment"). */}
            {v2 && <SeasonScene seasonId={w.id} fadeToHeader />}
            <button type="button" aria-expanded={isOpen} onClick={() => setOpenWindow(isOpen ? null : w.id)} className="dm-quiet relative z-[1] flex w-full cursor-pointer items-start justify-between gap-[var(--space-4)] rounded-[inherit] p-[var(--space-5)] text-left sm:p-[var(--space-6)]">
              {v2 ? (
                <span className="flex min-w-0 items-center gap-[10px]">
                  <CalendarMonthChip label={GRADE_WINDOW_MONTHS[w.id]} tint={SEASON_STYLE[w.id].tint} />
                  <span className="text-[22px] leading-[26px] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{w.title}</span>
                </span>
              ) : (
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[12px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{GRADE_WINDOW_MONTHS[w.id]}</span>
                  <span className="text-[22px] leading-[26px] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{w.title}</span>
                </span>
              )}
              <span className="flex flex-none flex-col items-end gap-[6px] pt-[4px]">
                <span className="text-[15px] leading-[22px] tabular-nums" style={{ color: wDone > 0 ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{wDone} of {countedSteps.length}</span>
                <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: isOpen ? "rotate(180deg)" : "none" }} aria-hidden />
              </span>
            </button>
            {isOpen && (
              <div className="filters-reveal relative z-[1] flex flex-col px-[var(--space-5)] pb-[var(--space-5)] sm:px-[var(--space-6)] sm:pb-[var(--space-6)]">
                {(["app", "out"] as const).map((group) => {
                  const rows = w.steps.filter((s) => (group === "out") === !s.inApp);
                  if (rows.length === 0) return null;
                  return (
                    <Fragment key={group}>
                      <span className="pt-[var(--space-3)] pb-[6px] text-[12px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{group === "app" ? "In app" : "Out of app"}</span>
                      {rows.map((s) => {
                        const complete = !s.counselorVerified && done.has(s.id);
                        const body = (
                          <span className="flex min-w-0 flex-1 flex-col gap-[2px] sm:flex-row sm:items-center sm:gap-[10px]">
                            <span className="flex-none text-[11px] leading-[16px] font-bold tracking-[0.08em] uppercase sm:w-[104px] sm:leading-[22px]" style={{ color: complete ? "var(--muted-foreground)" : "var(--accent-subtle)" }}>{s.label}</span>
                            <span className={`min-w-0 flex-1 text-[15px] leading-[22px] ${complete ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>
                              {s.optional && "(Optional) "}{s.title}
                            </span>
                          </span>
                        );
                        return (
                          <div key={s.id} className="flex items-center gap-[12px] border-t py-[11px]" style={{ borderColor: RULE, opacity: complete ? 0.55 : 1 }}>
                            {s.counselorVerified ? (
                              <button type="button" aria-label={`${s.title}: what to do`} onClick={() => setNoteStep(s)} className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-[6px] border border-dashed md:size-[22px]" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
                                <Lock className="h-3 w-3" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                              </button>
                            ) : (
                              <button type="button" aria-label={complete ? `Mark "${s.title}" not done` : `Mark "${s.title}" done`} onClick={() => toggle(s.id)} className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-[6px] border md:size-[22px]" style={{ background: complete ? "var(--color-feedback-success, #33c78c)" : "transparent", borderColor: complete ? "transparent" : "rgba(255,255,255,0.35)" }}>
                                {complete && <Check className="h-3.5 w-3.5" style={{ color: "#05070f" }} />}
                              </button>
                            )}
                            {s.href && !complete ? (
                              <Link href={s.href} aria-label={`${s.label}: ${s.title}`} className="dm-quiet -mx-[8px] -my-[6px] flex min-w-0 flex-1 items-center gap-[10px] rounded-[var(--radius-sm)] px-[8px] py-[6px]">
                                {body}
                                <ChevronRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                              </Link>
                            ) : (
                              body
                            )}
                            {(s.counselorVerified || s.deadlineBound) && (
                              <span className="flex flex-none flex-col items-end gap-[2px]">
                                {s.counselorVerified && <span className="text-[10px] leading-[13px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Counselor confirms</span>}
                                {s.deadlineBound && <span className="text-[10px] leading-[13px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>{GRADE_WINDOW_DUE[w.id]}</span>}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      {noteStep && (
        <Portal>
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label={noteStep.title}>
            <button type="button" aria-label="Close" onClick={() => setNoteStep(null)} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }} />
            <div className="relative z-[1] flex w-full max-w-[380px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
              <div className="flex items-start justify-between gap-[var(--space-3)]">
                <div className="flex items-center gap-[10px]">
                  <span className="flex size-[32px] flex-none items-center justify-center rounded-full" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
                    <Lock className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="text-[16px] leading-[20px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{noteStep.title}</h3>
                </div>
                <button type="button" onClick={() => setNoteStep(null)} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="text-[14px] leading-[19px]" style={{ color: "var(--foreground)" }}>{noteStep.counselorNote}</p>
              <p className="text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>Your counselor confirms this one on their own dashboard, so it can&apos;t be checked off here.</p>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

const ROUTE_TYPE_ICONS = { military: Shield, flight: Plane, community: BookOpen, trade: Wrench, school: GraduationCap } as const;
const routeTypeKey = (type: string): keyof typeof ROUTE_TYPE_ICONS => {
  if (/military/i.test(type)) return "military";
  if (/flight|aviation/i.test(type)) return "flight";
  if (/community/i.test(type)) return "community";
  if (/trade|bootcamp/i.test(type)) return "trade";
  return "school";
};

// One alternate route, editorial: the path name is the headline, the data
// pane on the right is the feature. Payoff (the tallest pane) is the default
// and sets the height; the other panes are designed to fill the same space.
function RouteColumn({ route, majors, selected, onSelect, onGoPlan, inModal = false }: { route: ProfileCareer["routes"][number]; majors?: string[]; selected: boolean; onSelect: () => void; onGoPlan: () => void; inModal?: boolean }) {
  const detail = routeDetail(route.id);
  const Icon = ROUTE_TYPE_ICONS[routeTypeKey(route.type)];
  const [pane, setPane] = useState<"stats" | "fit" | "life" | "payoff">("stats");
  // Tab-discovery nudge: runs once, only when the tabs are actually in view,
  // and moves THE underline (the static one hides while it travels).
  const [hint, setHint] = useState<"idle" | "run" | "done">("idle");
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!selected || !detail || hint !== "idle" || !tabBarRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setHint("run");
        window.setTimeout(() => setHint("done"), 1900);
        observer.disconnect();
      }
    }, { threshold: 0.9 });
    observer.observe(tabBarRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, hint]);
  const PANE_MIN = "min-h-[280px] md:min-h-[330px]";
  return (
    <article
      className={`flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] p-[var(--space-5)] md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:grid-rows-[auto_auto_1fr] md:gap-x-[var(--space-8)] md:p-[var(--space-6)] md:[grid-template-areas:'chips_tabs'_'head_pane'_'decide_pane'] ${inModal ? "w-full border-0" : "w-[86vw] max-w-[340px] flex-none snap-center border-2 md:w-[86%] md:max-w-[880px]"}`}
      style={{ background: inModal ? "transparent" : selected ? "color-mix(in srgb, var(--primary) 10%, var(--glass-surface-1))" : "var(--glass-surface-1)", borderColor: selected ? "var(--primary)" : "var(--glass-border)" }}
    >
      {/* Status chips */}
      <div className="flex items-center gap-[6px] md:[grid-area:chips]">
        {route.recommended && (
          <span className="flex items-center gap-[4px] rounded-full px-[10px] py-[3px] text-[12px] font-bold tracking-[0.6px] whitespace-nowrap uppercase" style={{ background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" }}>
            <Sparkles className="h-3 w-3" /> Recommended
          </span>
        )}
        {selected && <span className="rounded-[var(--radius-sm)] px-[10px] py-[3px] text-[12px] font-bold tracking-[0.6px] whitespace-nowrap uppercase" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Your path</span>}
      </div>

      {/* Editorial masthead: kicker, headline, deck, meta */}
      <div className="seq-reveal flex flex-col gap-[var(--space-2)] md:self-start md:[grid-area:head]">
        <span className="flex items-center gap-[6px] text-[12px] font-bold tracking-[1.2px] uppercase" style={{ color: selected ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
          <Icon className="h-3.5 w-3.5" /> {route.type}
        </span>
        <h3 className="text-[30px] leading-[32px] font-extrabold md:text-[38px] md:leading-[40px]" style={{ fontFamily: "var(--font-display)" }}><InkText text={route.short} /></h3>
        {detail && <p className="text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{detail.pitch}</p>}
        <div className="mt-[2px] flex flex-col gap-[2px] border-t pt-[var(--space-2)] text-[15px] leading-[15px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          <span>{route.program}</span>
          <span>{route.credential} · {route.location}</span>
        </div>
      </div>

      {/* Hairline text tabs */}
      {detail && (
        <div ref={tabBarRef} className="relative flex gap-[var(--space-5)] self-start border-b md:w-full md:[grid-area:tabs]" style={{ borderColor: "var(--glass-border)" }}>
          {hint === "run" && <span aria-hidden className="tab-hint" />}
          {(
            [
              { id: "stats", label: "Stats" },
              { id: "fit", label: "Fit" },
              { id: "life", label: "Life" },
              { id: "payoff", label: "Payoff" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={pane === item.id}
              onClick={() => setPane(item.id)}
              className="dm-quiet -mb-[1px] cursor-pointer rounded-t-[var(--radius-sm)] border-b-2 px-[var(--space-2)] pb-[8px] text-[12px] font-bold tracking-[1px] uppercase"
              style={{ borderColor: pane === item.id && !(hint === "run" && pane === "stats") ? "var(--primary)" : "transparent", color: pane === item.id ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Stats: three pull-numbers, spread to fill the payoff-sized window */}
      {(!detail || pane === "stats") && (
        <div className={`seq-reveal flex flex-col justify-between gap-[var(--space-3)] self-start md:w-full md:[grid-area:pane] ${PANE_MIN}`}>
          {[
            { label: "Time", value: route.duration },
            { label: "Total cost", value: route.cost.split(",")[0] },
            { label: "Pay", value: route.salary.split(",")[0].replace(/ first year/i, "") },
          ].map((stat, index) => (
            <div key={stat.label} className={`flex flex-1 flex-col justify-center gap-[4px] ${index < 2 ? "border-b pb-[var(--space-3)]" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>{stat.label}</span>
              <span className="text-[30px] leading-[32px] font-extrabold md:text-[34px] md:leading-[36px]" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {detail && pane === "fit" && (
        <div className={`seq-reveal flex flex-col gap-[var(--space-4)] self-start md:[grid-area:pane] ${PANE_MIN}`}>
          {/* Lead: the thesis, set like Life's pull quote */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>The fit</span>
            <p className="text-[17px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.fit.tagline}</p>
          </div>

          <div className="flex flex-col gap-[4px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Acceptance</span>
            {detail.fit.acceptancePct !== undefined ? (
              <>
                <span className="text-[26px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.fit.acceptancePct}%</span>
                <div className="relative h-[7px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }}>
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(detail.fit.acceptancePct, 3)}%`, background: "var(--accent-subtle)" }} />
                </div>
                <span className="text-[12px] leading-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{detail.fit.acceptance}</span>
              </>
            ) : (
              <span className="text-[15px] leading-[17px] font-bold">{detail.fit.acceptance}</span>
            )}
          </div>

          {/* Placement as a stat, not a chip */}
          <div className="flex flex-col gap-[2px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Job placement</span>
            <span className="text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: detail.fit.placement === "High" ? "var(--color-feedback-success, #33c78c)" : "var(--foreground)" }}>{detail.fit.placement}</span>
          </div>

          <div className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <FactRow label="Financial aid" value={detail.fit.aid} />
            <FactRow label="Where you'd work" value={detail.fit.targets} />
            {majors && /university|college|transfer/i.test(route.type) && <FactRow label="Majors to explore" value={majors.join(" · ")} />}
          </div>

        </div>
      )}

      {detail && pane === "life" && (
        <div className={`seq-reveal flex flex-col gap-[var(--space-4)] self-start md:[grid-area:pane] ${PANE_MIN}`}>
          {/* Lead: the vibe, set like a pull quote */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>The vibe</span>
            <p className="text-[18px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.life.feel}</p>
          </div>

          <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Student life</span>
            <div className="flex flex-col">
              {detail.life.clubs.map((club, index) => (
                <span key={club} className={`py-[7px] text-[14px] leading-[16px] font-bold ${index < detail.life.clubs.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                  {club}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-[2px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Study abroad</span>
            <span className="text-[15px] leading-[17px] font-bold">{detail.life.abroad}</span>
          </div>
        </div>
      )}

      {detail && pane === "payoff" && (
        <div className={`seq-reveal flex flex-col gap-[var(--space-4)] self-start md:[grid-area:pane] ${PANE_MIN}`}>
          {/* One stat leads; the loan rides shotgun as a stat, not a sentence.
             (Starting salary is already the chart's Year 1 base segment.) */}
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="flex min-w-0 flex-col gap-[4px]">
              <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>{detail.payoff.time === "None" ? "Debt-free" : "Debt-free in"}</span>
              <span className="text-[26px] leading-[28px] font-extrabold whitespace-nowrap" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.payoff.time === "None" ? "From day 1" : detail.payoff.time}</span>
            </div>
            <div className="flex flex-none flex-col items-end gap-[4px]">
              <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--muted-foreground)" }}>Typical loan</span>
              <span className="text-[22px] leading-[24px] font-extrabold whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{detail.payoff.avgLoan === "$0" ? "$0" : `~${detail.payoff.avgLoan}`}</span>
            </div>
          </div>

          {/* Pay curve: bonus lives IN the bar (stacked), not in a caption */}
          <div className="flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>What you make</span>
            <div className="grid grid-cols-3 items-end gap-[var(--space-2)]">
              {(() => {
                const parsed = detail.payoff.years.map((year) => {
                  const total = parseInt(year.amount.replace(/[^0-9]/g, ""), 10) || 0;
                  const bonusMatch = year.note?.match(/\+\s*\$?(\d+)K/i);
                  const bonus = bonusMatch ? parseInt(bonusMatch[1], 10) : 0;
                  return { label: year.label, amount: year.amount, total, bonus, base: Math.max(total - bonus, 0) };
                });
                const max = Math.max(...parsed.map((year) => year.total), 1);
                return parsed.map((year) => (
                  <span key={year.label} className="flex flex-col items-center gap-[3px]">
                    <span className="text-[15px] leading-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{year.amount}</span>
                    <span className="flex w-full flex-col overflow-hidden rounded-t-[5px]">
                      {year.bonus > 0 && <span className="w-full" style={{ height: `${Math.max(Math.round((year.bonus / max) * 56), 4)}px`, background: "var(--accent-subtle)" }} />}
                      <span className="w-full" style={{ height: `${Math.max(Math.round((year.base / max) * 56), 8)}px`, background: "color-mix(in srgb, var(--accent-subtle) 40%, transparent)" }} />
                    </span>
                    <span className="text-[12px] font-bold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>{year.label}</span>
                  </span>
                ));
              })()}
            </div>
            {detail.payoff.years.some((year) => /\+\s*\$?\d+K/i.test(year.note ?? "")) && (
              <div className="flex items-center gap-[var(--space-3)] text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-[5px]"><span className="size-2 rounded-[2px]" style={{ background: "color-mix(in srgb, var(--accent-subtle) 40%, transparent)" }} /> Base</span>
                <span className="flex items-center gap-[5px]"><span className="size-2 rounded-[2px]" style={{ background: "var(--accent-subtle)" }} /> Bonus</span>
              </div>
            )}
          </div>

          {/* Budget: base lives in the caption, one-line legend */}
          <div className="flex flex-col gap-[5px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Monthly budget · on {detail.payoff.budget.income}</span>
            <div className="flex h-[10px] w-full overflow-hidden rounded-full">
              <span style={{ width: `${Math.max(detail.payoff.budget.pct, 3)}%`, background: "var(--accent-subtle)" }} />
              <span className="flex-1" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }} />
            </div>
            <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[2px] text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-[5px]"><span className="size-2 rounded-full" style={{ background: "var(--accent-subtle)" }} /> Loan</span>
              <span className="flex items-center gap-[5px]"><span className="size-2 rounded-full" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }} /> In hand</span>
            </div>
          </div>

          <span className="border-t pt-[var(--space-3)] text-[14px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--accent-subtle)" }}>{detail.payoff.takeaway}</span>
        </div>
      )}

      {/* Decide */}
      <div className="mt-auto flex flex-col gap-[var(--space-2)] md:self-end md:[grid-area:decide]">
        <button
          type="button"
          onClick={selected ? onGoPlan : onSelect}
          aria-pressed={selected}
          className="dm-solid w-full cursor-pointer rounded-[var(--radius-md)] py-[var(--space-3)] text-[15px] font-semibold"
          style={selected ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          {selected ? "Open your plan for this path" : `Continue with ${route.short}`}
        </button>
        <div className="flex items-center justify-between gap-[var(--space-2)] text-[15px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <span className="min-w-0 truncate">Next: {route.nextStep}</span>
          {/program|college|school|transfer/i.test(route.nextStep) && (
            <Link href="/colleges" className="flex flex-none items-center gap-[3px] font-bold" style={{ color: "var(--accent-subtle)" }}>
              School lookup <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[1px]">
      <span className="text-[12px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[14px] leading-[16px] font-bold">{value}</span>
    </div>
  );
}

// The Replit "Compare All Paths" table: every category side by side, each
// cell a value plus its benefit tag.
function CompareTable({ routes, selectedId }: { routes: ProfileCareer["routes"]; selectedId: string }) {
  const rows: { label: string; value: (route: ProfileCareer["routes"][number]) => string; tag: (route: ProfileCareer["routes"][number]) => string | undefined }[] = [
    { label: "Time to graduate", value: (route) => route.duration, tag: (route) => routeDetail(route.id)?.tags.time },
    { label: "Total cost", value: (route) => route.cost.split(",")[0], tag: (route) => routeDetail(route.id)?.tags.cost },
    { label: "Starting salary", value: (route) => route.salary.split(",")[0].replace(/ first year/i, ""), tag: (route) => routeDetail(route.id)?.tags.salary },
    { label: "Loan payoff", value: (route) => route.loanPayoff.split(" at ")[0], tag: (route) => routeDetail(route.id)?.tags.payoff },
    { label: "Access and aid", value: (route) => routeDetail(route.id)?.fit.acceptance ?? "TBD", tag: (route) => routeDetail(route.id)?.tags.access },
    { label: "Study abroad", value: (route) => routeDetail(route.id)?.life.abroad ?? "TBD", tag: (route) => routeDetail(route.id)?.tags.abroad },
    { label: "Community", value: (route) => routeDetail(route.id)?.life.feel ?? "TBD", tag: (route) => routeDetail(route.id)?.tags.community },
  ];
  return (
    <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0" style={{ touchAction: "pan-x pan-y" }}>
      <div className="min-w-[640px] overflow-hidden rounded-[var(--radius-lg)] border" style={{ ...GLASS }}>
        <div className="grid" style={{ gridTemplateColumns: `130px repeat(${routes.length}, minmax(150px, 1fr))` }}>
          <span className="border-b p-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }} />
          {routes.map((route) => (
            <span key={route.id} className="border-b p-[var(--space-3)] text-[15px] font-extrabold" style={{ borderColor: "var(--glass-border)", fontFamily: "var(--font-display)", color: route.id === selectedId ? "var(--accent-subtle)" : "var(--foreground)" }}>
              {route.short}
              {route.recommended && <span className="ml-[6px] rounded-[var(--radius-sm)] px-[7px] py-[1px] text-[8.5px] font-bold tracking-[0.4px] uppercase" style={{ background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" }}>Recommended</span>}
              {route.id === selectedId && <span className="ml-[6px] rounded-[var(--radius-sm)] px-[7px] py-[1px] text-[8.5px] font-bold tracking-[0.4px] uppercase" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Yours</span>}
            </span>
          ))}
          {rows.map((row, rowIndex) => (
            <Fragment key={row.label}>
              <span className={`p-[var(--space-3)] text-[12px] font-bold tracking-[0.4px] uppercase ${rowIndex < rows.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{row.label}</span>
              {routes.map((route) => (
                <span key={route.id} className={`flex flex-col items-start gap-[3px] p-[var(--space-3)] ${rowIndex < rows.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)", background: route.id === selectedId ? "color-mix(in srgb, var(--primary) 7%, transparent)" : "transparent" }}>
                  <span className="text-[15px] leading-[16px] font-bold">{row.value(route)}</span>
                  {row.tag(route) && <span className="rounded-[var(--radius-sm)] px-[8px] py-[2px] text-[12px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}>{row.tag(route)}</span>}
                </span>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Locker tab: rich poster grid ----

function SchoolsShelf() {
  const [saved, toggleSaved] = useSavedColleges();
  const colleges = [...saved].map((slug) => collegeBySlug(slug)).filter((c): c is NonNullable<typeof c> => !!c);
  if (colleges.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">No schools saved yet</p>
        <Link href="/colleges" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Browse schools</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-4">
      {colleges.map((c) => (
        <Link key={c.slug} href={`/colleges/${c.slug}`} className="dm-tap relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)" }}>
          <span className="relative block aspect-[4/3] w-full" style={{ background: "var(--glass-surface-1)" }}>
            {collegeImage(c) && <Image src={collegeImage(c)!} alt="" fill sizes="220px" className="object-cover" />}
          </span>
          {/* Unsaving from here was only possible by reopening the school's
             own detail page and un-tapping its bookmark there (direct
             feedback, 21 Sept 2026: "do we have an option to unsave...
             saved colleges"). SaveButton already stops its own click from
             bubbling into this card's Link. */}
          <span className="absolute top-[8px] right-[8px] z-10"><SaveButton on={saved.has(c.slug)} onToggle={() => toggleSaved(c.slug)} size={32} /></span>
          <span className="dm-glass flex flex-col gap-[2px] p-[10px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="truncate text-[14px] leading-[16px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
            <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{collegeTags(c).join(" · ")}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function VideosShelf() {
  const [saved, toggleSaved] = useSavedVideos();
  const videos = COMPANY_VIDEOS.filter((v) => saved.has(v.video));
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">No videos saved yet</p>
        <Link href="/explore" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Browse videos</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((v) => (
        <div key={v.video} className="relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)" }}>
          <span className="relative block aspect-[3/4] w-full">
            <Image src={v.poster} alt="" fill sizes="220px" className="object-cover" />
          </span>
          {/* Same unsave gap as SchoolsShelf (direct feedback, 21 Sept 2026). */}
          <button
            type="button"
            aria-label="Remove from saved"
            onClick={() => toggleSaved(v.video)}
            className="dm-quiet absolute top-[8px] right-[8px] z-10 flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.22)", background: "rgba(12,16,35,0.55)", color: "#fff", backdropFilter: "blur(8px)" }}
          >
            <X className="h-[16px] w-[16px]" aria-hidden />
          </button>
          <span className="dm-glass flex flex-col gap-[2px] p-[10px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="truncate text-[14px] leading-[16px] font-bold" style={{ color: "var(--foreground)" }}>{v.title}</span>
            <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{v.company}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function LockerTab({ locker, top3Count, addToTop3, onClose }: { locker: ProfileCareer[]; top3Count: number; addToTop3: (id: string) => void; onClose: () => void }) {
  // The locker holds everything a student saves across Dreamari, grouped
  // into the four categories students actually save (direct feedback, 16
  // Sept 2026, Slack): careers, schools, videos (Explore's "Videos Inside
  // Leading Companies," not tied to one specific career), and event stubs.
  const [shelf, setShelf] = useState<"careers" | "schools" | "videos" | "events">("careers");
  const [savedSchools] = useSavedColleges();
  const [savedVideos] = useSavedVideos();
  const [savedCareers, toggleSavedCareer] = useSavedCareers();
  const stubCount = EVENTS.filter((e) => e.lifecycle === "Active follow-up").length;
  const SHELF_LABEL: Record<typeof shelf, string> = { careers: "Careers", schools: "Schools", videos: "Videos", events: "Event Stubs" };
  const SHELF_COUNT: Record<typeof shelf, number> = { careers: locker.length, schools: savedSchools.size, videos: savedVideos.size, events: stubCount };
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Saved</h2>
        <span className="flex items-center gap-[var(--space-3)]">
          <span className="text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{SHELF_COUNT[shelf]} {shelf === "events" ? "kept" : "saved"}</span>
          <button type="button" aria-label="Close Saved" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>
      <div role="tablist" aria-label="Locker shelves" className="dm-glass flex w-fit items-center gap-[2px] rounded-[var(--radius-md)] border p-[3px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        {(["careers", "schools", "videos", "events"] as const).map((id) => (
          <button key={id} type="button" role="tab" aria-selected={shelf === id} onClick={() => setShelf(id)} className="dm-quiet min-h-[32px] cursor-pointer rounded-[calc(var(--radius-md)-3px)] px-[14px] text-[13px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: shelf === id ? "var(--foreground)" : "transparent", color: shelf === id ? "var(--background)" : "var(--foreground)" }}>
            {SHELF_LABEL[id]}
          </button>
        ))}
      </div>
      {shelf === "events" ? (
        <EventStubs />
      ) : shelf === "schools" ? (
        <SchoolsShelf />
      ) : shelf === "videos" ? (
        <VideosShelf />
      ) : locker.length === 0 ? (
        <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[15px] font-bold">Everything saved is in your Top 3</p>
          <Link href="/explore" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Explore careers</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-4">
          {locker.map((career) => (
            <div key={career.id} className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)" }}>
              <span className="relative block aspect-[2/3] w-full">
                <Image src={career.photo} alt="" fill sizes="220px" className="object-cover" />
                {/* Careers had no save/unsave concept at all -- the bookmark
                   on Career Detail was a local-only toggle that never
                   persisted anywhere (direct feedback, 21 Sept 2026:
                   "careers should also have unsave concept"). Same control
                   as SchoolsShelf's own SaveButton, now backed by the same
                   kind of real, shared, persisted state. */}
                <span className="absolute top-[8px] right-[8px] z-10"><SaveButton on={savedCareers.has(career.id)} onToggle={() => toggleSavedCareer(career.id)} size={32} /></span>
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1 pb-[10px] text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)", paddingTop: "30px" }}>
                  <span className="w-full text-[14px] leading-[16px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
                  <span className="w-full text-[8px] leading-[11px] font-bold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}>{career.world}</span>
                </span>
              </span>
              <span className="dm-glass flex items-center justify-between gap-[var(--space-2)] p-[10px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
                <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                  <span className="truncate text-[14px] leading-[15px] font-bold" style={{ color: "var(--accent-subtle)" }}>{interestTier(career.match)}</span>
                  <span className="text-[8.5px] leading-[11px] font-bold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>From your activity</span>
                </span>
                {/* Labelled, not an icon alone: the swap arrows were not
                   understood (direct feedback, 11 Sept 2026). */}
                <button
                  type="button"
                  onClick={() => addToTop3(career.id)}
                  aria-label={top3Count >= 3 ? `Swap ${career.title} into your Top 3` : `Add ${career.title} to your Top 3`}
                  className="dm-quiet flex h-8 flex-none cursor-pointer items-center gap-[5px] rounded-[var(--radius-md)] border px-[10px] text-[12px] font-bold whitespace-nowrap"
                  style={{ borderColor: "var(--accent-subtle)", color: "var(--accent-subtle)" }}
                >
                  {top3Count >= 3 ? <><ArrowLeftRight className="h-[13px] w-[13px]" aria-hidden /> Swap in</> : <><Plus className="h-[13px] w-[13px]" aria-hidden /> Add to Top 3</>}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Settings: a full view under the header, prototype stubs ----

type SettingsSection = "answers" | "account" | "privacy" | "danger";
const SETTINGS_SECTIONS: { id: SettingsSection; label: string; Icon: LucideIcon; divider?: boolean }[] = [
  { id: "answers", label: "Your answers", Icon: Sparkles },
  { id: "account", label: "Account", Icon: UserRound },
  { id: "privacy", label: "Privacy and sharing", Icon: Lock },
  { id: "danger", label: "Danger zone", Icon: AlertTriangle, divider: true },
];

const SETTINGS_CARD = "flex max-w-[640px] scroll-mt-[84px] flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]";
const SETTINGS_FIELD = "min-h-[44px] w-full rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px] font-semibold outline-none focus:border-[var(--primary)]";
const SETTINGS_FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as React.CSSProperties;
const SETTINGS_LABEL = "text-[12px] font-bold tracking-[0.06em] uppercase";
const DANGER = "var(--color-feedback-error, #ff6b6b)";

function answersSummary(p: StudentProfile): { label: string; value: string }[] {
  return [
    { label: "Interests", value: p.interests.join(", ") || "Not set" },
    { label: "Subjects", value: p.subjects.join(", ") || "Not set" },
    { label: "States", value: p.states.join(", ") || "Not set" },
  ];
}

function SettingsView({ section, onClose }: { section: SettingsSection | null; onClose: () => void }) {
  // One section at a time: the menu item IS the choice, so the view shows
  // only that section (direct feedback, 10 Sept 2026: seeing every section
  // under "Your answers" made the menu look redundant).
  const show = section ?? "answers";
  const title = SETTINGS_SECTIONS.find((item) => item.id === show)?.label ?? "Settings";

  // Your answers: read-only summary of what Build recorded; changing them is
  // a deliberate act -- run Build again -- and every earlier run is kept in
  // the archive and can be put back (direct feedback, 10 Sept 2026: fewer
  // things on screen, "launch the build again and have an archived version
  // of previous builds").
  const stored = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  const archive = useSyncExternalStore(subscribeProfileArchive, profileArchiveSnapshot, serverProfileArchiveSnapshot);
  const [confirming, setConfirming] = useState<"rebuild" | "deactivate" | "delete" | `restore:${string}` | null>(null);
  const [deactivated, setDeactivated] = useState(false);

  // Account basics stay directly editable: small, and no reason to redo Build for a typo.
  const [draft, setDraft] = useState({ email: stored.email, gpa: stored.gpa, gpaType: stored.gpaType, zipCode: stored.zipCode, travelDistance: stored.travelDistance });
  const [saved, setSaved] = useState(false);
  const dirty = draft.email !== stored.email || draft.gpa !== stored.gpa || draft.gpaType !== stored.gpaType || draft.zipCode !== stored.zipCode || draft.travelDistance !== stored.travelDistance;
  const patch = (next: Partial<typeof draft>) => {
    setSaved(false);
    setDraft((current) => ({ ...current, ...next }));
  };
  const zipOk = draft.zipCode === "" || /^\d{5}$/.test(draft.zipCode);
  const emailOk = draft.email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email);
  const save = () => {
    writeStudentProfile(draft);
    setSaved(true);
    dispatchAuroraPulse("cta", undefined, { soft: true });
  };

  const wipe = () => {
    try {
      Object.keys(window.localStorage).filter((k) => k.startsWith("dreamari")).forEach((k) => window.localStorage.removeItem(k));
      window.sessionStorage.clear();
    } catch {}
    window.location.assign("/");
  };
  const ghost = "dm-quiet flex w-fit min-h-[36px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[12px] text-[13.5px] font-semibold";
  const ghostStyle = { borderColor: "var(--glass-border)" } as const;
  const dangerGhostStyle = { borderColor: `color-mix(in srgb, ${DANGER} 45%, var(--glass-border))`, color: DANGER } as const;
  const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
        <button type="button" aria-label="Close settings" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {show === "answers" && (
      <section id="settings-answers" className={SETTINGS_CARD} style={INSET}>
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>From Build. Rebuild to change them.</p>
          </div>
          {confirming === "rebuild" ? (
            <span className="flex flex-wrap items-center gap-[var(--space-2)]">
              <button type="button" onClick={() => window.location.assign("/flow")} className="dm-solid flex min-h-[36px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[12px] text-[13.5px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
                <RefreshCw className="h-4 w-4" aria-hidden /> Yes, start Build again
              </button>
              <button type="button" onClick={() => setConfirming(null)} className={ghost} style={ghostStyle}>Never mind</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming("rebuild")} className={ghost} style={ghostStyle}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Rebuild
            </button>
          )}
        </div>
        <dl className="dm-glass grid grid-cols-[auto_1fr] gap-x-[var(--space-4)] gap-y-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
          {answersSummary(stored).map((row) => (
            <Fragment key={row.label}>
              <dt className="font-bold" style={{ color: "var(--muted-foreground)" }}>{row.label}</dt>
              <dd className="m-0 font-semibold">{row.value}</dd>
            </Fragment>
          ))}
        </dl>
        {archive.length > 0 && (
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className={SETTINGS_LABEL} style={{ color: "var(--muted-foreground)" }}>Previous builds</span>
            <ol className="flex list-none flex-col gap-[6px] p-0">
              {archive.map((entry) => (
                <li key={entry.id} className="dm-glass flex flex-wrap items-center justify-between gap-[var(--space-2)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[14px] font-bold">{when(entry.savedAt)}</span>
                    <span className="truncate text-[13px]" style={{ color: "var(--muted-foreground)" }}>{[...entry.profile.interests, ...entry.profile.subjects, ...entry.profile.states].join(" · ") || "No answers"}</span>
                  </span>
                  {confirming === `restore:${entry.id}` ? (
                    <span className="flex items-center gap-[var(--space-2)]">
                      <button type="button" onClick={() => { restoreArchivedProfile(entry.id); setConfirming(null); }} className="dm-solid min-h-[36px] cursor-pointer rounded-[var(--radius-md)] px-[12px] text-[13.5px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>Yes, use this build</button>
                      <button type="button" onClick={() => setConfirming(null)} className={ghost} style={ghostStyle}>Never mind</button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-[var(--space-1)]">
                      <button type="button" onClick={() => setConfirming(`restore:${entry.id}`)} className={ghost} style={ghostStyle}>Restore</button>
                      <button type="button" onClick={() => deleteArchivedProfile(entry.id)} aria-label="Delete this build" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
      )}

      {show === "account" && (
      <section id="settings-account" className={SETTINGS_CARD} style={INSET}>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
          <div className="flex flex-col gap-[6px] sm:col-span-2">
            <label className={SETTINGS_LABEL} htmlFor="settings-email" style={{ color: "var(--muted-foreground)" }}>Email</label>
            <input id="settings-email" type="email" inputMode="email" autoComplete="email" value={draft.email} onChange={(e) => patch({ email: e.target.value })} placeholder="you@school.org" className={SETTINGS_FIELD} style={{ ...SETTINGS_FIELD_STYLE, borderColor: emailOk ? SETTINGS_FIELD_STYLE.borderColor : DANGER }} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={SETTINGS_LABEL} htmlFor="settings-gpa" style={{ color: "var(--muted-foreground)" }}>GPA</label>
            <Listbox
              id="settings-gpa"
              value={draft.gpa}
              onChange={(v) => patch({ gpa: v })}
              placeholder="Select"
              options={GPA_OPTIONS.map((option) => ({ value: option, label: option }))}
              className={SETTINGS_FIELD}
              style={SETTINGS_FIELD_STYLE}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={SETTINGS_LABEL} htmlFor="settings-gpa-type" style={{ color: "var(--muted-foreground)" }}>GPA type</label>
            <Listbox
              id="settings-gpa-type"
              value={draft.gpaType}
              onChange={(v) => patch({ gpaType: v })}
              placeholder="Not sure"
              options={[
                { value: "", label: "Not sure" },
                { value: "weighted", label: "Weighted" },
                { value: "unweighted", label: "Unweighted" },
              ]}
              className={SETTINGS_FIELD}
              style={SETTINGS_FIELD_STYLE}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={SETTINGS_LABEL} htmlFor="settings-zip" style={{ color: "var(--muted-foreground)" }}>Zip code</label>
            <input id="settings-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={draft.zipCode} onChange={(e) => patch({ zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) })} placeholder="12345" className={SETTINGS_FIELD} style={{ ...SETTINGS_FIELD_STYLE, borderColor: zipOk ? SETTINGS_FIELD_STYLE.borderColor : DANGER }} />
          </div>
          <div className="flex flex-col gap-[6px] sm:col-span-2">
            <label className={SETTINGS_LABEL} htmlFor="settings-distance" style={{ color: "var(--muted-foreground)" }}>How far would you go for school?</label>
            <Listbox
              id="settings-distance"
              value={draft.travelDistance}
              onChange={(v) => patch({ travelDistance: v })}
              placeholder="Select"
              options={TRAVEL_DISTANCE_OPTIONS.map((option) => ({ value: option, label: option }))}
              className={SETTINGS_FIELD}
              style={SETTINGS_FIELD_STYLE}
            />
          </div>
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <button type="button" onClick={save} disabled={!dirty || !zipOk || !emailOk} className="dm-solid flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            {saved && !dirty ? <><Check className="h-4 w-4" aria-hidden /> Saved</> : <>Save <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden /></>}
          </button>
          {dirty && <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Unsaved changes</span>}
        </div>
      </section>
      )}

      {show === "privacy" && (
      <section id="settings-privacy" className={SETTINGS_CARD} style={INSET}>
        <div className="flex flex-col gap-[6px]">
          <div className="dm-glass flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="text-[14px] font-bold">Profile avatar</span>
            <span className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>Generated, never a photo</span>
          </div>
          {["Notifications", "Who can see your profile", "Talent Pipeline opt-in", "Linked school account"].map((item) => (
            <div key={item} className="dm-glass flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
              <span className="text-[14px] font-bold">{item}</span>
              <span className="rounded-[var(--radius-sm)] px-[8px] py-[2px] text-[11.5px] font-bold tracking-[0.5px] uppercase" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>Soon</span>
            </div>
          ))}
        </div>
        <button type="button" className={ghost} style={ghostStyle}>Sign out</button>
      </section>
      )}

      {show === "danger" && (
      <section id="settings-danger" className={SETTINGS_CARD} style={{ background: `color-mix(in srgb, ${DANGER} 6%, var(--inset-surface))`, borderColor: `color-mix(in srgb, ${DANGER} 35%, var(--inset-border))` }}>
        <div className="flex flex-col gap-[2px]">
          <p className="flex items-center gap-[6px] text-[13.5px] font-bold" style={{ color: DANGER }}><AlertTriangle className="h-4 w-4" aria-hidden /> These can&rsquo;t be undone from here.</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <div className="dm-glass flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="flex min-w-0 flex-col">
              <span className="text-[14px] font-bold">Deactivate profile</span>
              <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>{deactivated ? "Deactivated. Sign in to come back." : "Hides you from Connect. Nothing is deleted."}</span>
            </span>
            {!deactivated && (confirming === "deactivate" ? (
              <span className="flex items-center gap-[var(--space-2)]">
                <button type="button" onClick={() => { setDeactivated(true); setConfirming(null); }} className="dm-solid min-h-[36px] cursor-pointer rounded-[var(--radius-md)] px-[12px] text-[13.5px] font-semibold" style={{ background: DANGER, color: "#FFFFFF" }}>Yes, deactivate</button>
                <button type="button" onClick={() => setConfirming(null)} className={ghost} style={ghostStyle}>Never mind</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming("deactivate")} className={ghost} style={dangerGhostStyle}>Deactivate</button>
            ))}
          </div>
          <div className="dm-glass flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="flex min-w-0 flex-col">
              <span className="text-[14px] font-bold">Delete profile and data</span>
              <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Removes everything for good.</span>
            </span>
            {confirming === "delete" ? (
              <span className="flex items-center gap-[var(--space-2)]">
                <button type="button" onClick={wipe} className="dm-solid min-h-[36px] cursor-pointer rounded-[var(--radius-md)] px-[12px] text-[13.5px] font-semibold" style={{ background: DANGER, color: "#FFFFFF" }}>Yes, delete everything</button>
                <button type="button" onClick={() => setConfirming(null)} className={ghost} style={ghostStyle}>Never mind</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming("delete")} className={ghost} style={dangerGhostStyle}>Delete</button>
            )}
          </div>
        </div>
      </section>
      )}
    </div>
  );
}


// Sharing moved into the Career Report itself: the Aug 29 doc makes Share a
// tab on top of the report (see CareerReport.tsx), so the old ShareSheet
// modal is retired rather than kept as a second, drifting copy.

// ---- Export overlay ----

function ReportOverlay({ career, route, progress, next, tasksFor, onClose }: { career: ProfileCareer; route: ProfileCareer["routes"][number]; progress: { complete: number; total: number; pct: number }; next: PlanTask | null; tasksFor: (career: ProfileCareer, horizonId: string) => PlanTask[]; onClose: () => void }) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  // Customizable export: the student picks which sections go in.
  const [sections, setSections] = useState({ receipts: true, route: true, plan: true });
  const toggle = (key: keyof typeof sections) => setSections((current) => ({ ...current, [key]: !current[key] }));
  return (
    <div className="dm-scroll print-overlay fixed inset-0 z-[70] overflow-y-auto" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)" }}>
      <div className="dm-glass-3 no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-[var(--space-2)] px-5 py-3 backdrop-blur-[30px] backdrop-saturate-[1.8]" style={{ background: "var(--glass-surface-3)" }}>
        <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Career Report · {career.title}</span>
        <span className="flex flex-wrap items-center gap-[var(--space-2)]">
          {(
            [
              { key: "receipts", label: "Engagement" },
              { key: "route", label: "Pathway" },
              { key: "plan", label: "My Plan" },
            ] as const
          ).map((section) => (
            <button
              key={section.key}
              type="button"
              aria-pressed={sections[section.key]}
              onClick={() => toggle(section.key)}
              className="cursor-pointer rounded-[var(--radius-md)] border px-[12px] py-[4px] text-[15px] font-semibold"
              style={{
                background: sections[section.key] ? "color-mix(in srgb, var(--primary) 24%, transparent)" : "transparent",
                borderColor: sections[section.key] ? "var(--primary)" : "var(--glass-border)",
                color: sections[section.key] ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {section.label}
            </button>
          ))}
          <button type="button" onClick={() => window.print()} className="flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
          <button type="button" onClick={onClose} aria-label="Close report" className="flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px]" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>

      <div className="print-report mx-auto my-6 w-[min(720px,92vw)] rounded-[8px] bg-white p-10 text-[#111827] shadow-2xl print:my-0 print:w-full print:rounded-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <div>
            <p className="text-[15px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">Dreamari · Career Interest Report</p>
            <p className="mt-1 text-[26px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{career.title}</p>
            <p className="text-[15px] text-[#6b7280]">{career.world}</p>
            <p className="mt-1 text-[14px] text-[#6b7280]">Prepared for counselors, school staff, and family</p>
          </div>
          <div className="text-right text-[14px] text-[#6b7280]">
            <p className="font-bold text-[#111827]">{STUDENT.name}</p>
            <p>{STUDENT.grade} · {STUDENT.school}</p>
            <p>{today}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Interest", `${interestTier(career.match)}, based on ${career.receipts.length} logged signals`],
            ["Selected pathway", `${route.type}: ${route.program}`],
            ["Plan progress", `${progress.complete} of ${progress.total} planned actions complete (${progress.pct}%)`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[6px] border border-[#e5e7eb] px-3 py-2">
              <p className="text-[12px] font-bold tracking-[0.1em] text-[#6b7280] uppercase">{label}</p>
              <p className="text-[15px] font-bold">{value}</p>
            </div>
          ))}
        </div>

        {sections.receipts && (
          <ReportSection title="Demonstrated engagement">
            <p className="mb-2 text-[14px] leading-[18px] text-[#6b7280]">Logged automatically from {STUDENT.name.split(" ")[0]}&apos;s activity in Dreamari. Sustained, self-directed engagement is the primary signal behind the match strength above.</p>
            <ul className="list-disc pl-5 text-[15px] leading-[20px]">
              {career.receipts.map((receipt) => (
                <li key={receipt.label}>{receipt.value} · {receipt.label}</li>
              ))}
            </ul>
          </ReportSection>
        )}

        {sections.route && (
        <ReportSection title="Selected pathway">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[15px]">
            {[
              ["Program", route.program],
              ["Location", route.location],
              ["Time", route.duration],
              ["Total cost", route.cost],
              ["Credential", route.credential],
              ["Starting pay", route.salary],
              ["Loan payoff", route.loanPayoff],
              ["Next step", route.nextStep],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[12px] font-bold tracking-[0.1em] text-[#6b7280] uppercase">{label}</p>
                <p className="font-bold">{value}</p>
              </div>
            ))}
          </div>
        </ReportSection>
        )}

        {sections.plan && (
        <ReportSection title="Action plan">
          {career.plan.map((horizon) => (
            <div key={horizon.id} className="mb-3">
              <p className="text-[14px] font-bold">{horizon.title}{horizon.subtitle && <span className="font-normal text-[#6b7280]"> · {horizon.subtitle}</span>}</p>
              <ul className="mt-1 list-disc pl-5 text-[15px] leading-[19px]">
                {tasksFor(career, horizon.id).map((task) => (
                  <li key={task.id}>{task.action}: {task.label}{task.outOfApp ? " (out of app)" : ""}{task.custom ? " (added by student)" : ""}</li>
                ))}
              </ul>
            </div>
          ))}
          {next && <p className="mt-2 text-[15px] font-bold">Immediate next step: {next.action}: {next.label}</p>}
        </ReportSection>
        )}

        <ReportSection title="For the advising conversation">
          <ul className="list-disc pl-5 text-[15px] leading-[19px]">
            <li>Review the {route.type.toLowerCase()} pathway together, including total cost ({route.cost}), typical starting pay ({route.salary}), and the estimated loan payoff window ({route.loanPayoff}).</li>
            <li>Ask {STUDENT.name.split(" ")[0]} which activity felt most engaging. Interest built through repeated, voluntary practice is a stronger indicator than a single assessment.</li>
            <li>If interest holds over the next grading period, help with the concrete next step: {route.nextStep}.</li>
          </ul>
        </ReportSection>

        <p className="mt-6 border-t border-[#e5e7eb] pt-3 text-[12px] leading-[15px] text-[#6b7280]">
          The interest level summarizes {STUDENT.name.split(" ")[0]}&apos;s logged activity in Dreamari. It is an engagement indicator intended to support advising conversations, not a psychometric assessment or a prediction of outcomes. Cost and salary figures are estimates for planning purposes. This report is shared with the student&apos;s consent.
        </p>
      </div>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[15px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">{title}</p>
      {children}
    </div>
  );
}
