"use client";

import { createPortal } from "react-dom";
import { openCareerPeek } from "@/components/app/peek";
import { useRouter } from "next/navigation";
import { careerProfile } from "@/components/career/profiles";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { AVATAR_POOL, useStudentAvatarSrc, writeAvatarOverride } from "@/lib/avatar";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { FacePhoto } from "@/components/app/FacePhoto";
import { EmptyView } from "@/components/app/states";
import { IconTip } from "@/components/app/IconTip";
import { announce } from "@/components/app/LiveRegion";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, useLayoutEffect } from "react";
import { SparkBar } from "@/components/flow/SparkBar";
import { Coachmark, useFirstUseHint } from "@/components/flow/GestureSpotlight";
import { NextStepBanner } from "@/components/app/NextStepBanner";
import { HoverBeam } from "@/components/app/HoverBeam";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useStage, writeStage } from "@/lib/stage";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { BuildModal } from "./PreferencesTab";
import { CareerPeek } from "./CareerPeek";
import { CompareHighlights } from "./CompareHighlights";
import { CardDeck } from "@/components/play/PlayHub";
import { simulationFor } from "@/components/play/games";
import { ArrowLeftRight, FileText, Minus, Play, ChevronLeft, ChevronUp, ChevronRight, ArrowUpRight, BadgeCheck, BookOpen, Check, ChevronDown, Compass, Flame, GraduationCap, ImageOff, Pencil, Plane, Plus, Printer, Settings, Shield, SlidersHorizontal, Sparkles, Star, Users, Wrench, X, ImagePlus, AlertTriangle, RefreshCw, UserRound, Lock, type LucideIcon } from "lucide-react";
import { DesktopNavigation, MobileHeaderShell, MobileNav, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, ScrollEdges } from "@/components/app/cardChrome";
import { InkText } from "@/components/build/ui";
import { Listbox } from "@/components/app/Listbox";
import { DEMO_ALWAYS_SHOW_SPLASH, demoSeenThisSession, markDemoSeenThisSession, WelcomeSplash } from "@/components/app/WelcomeSplash";
import { deleteArchivedProfile, profileArchiveSnapshot, restoreArchivedProfile, serverProfileArchiveSnapshot, serverStudentProfileSnapshot, studentProfileSnapshot, subscribeProfileArchive, subscribeStudentProfile, writeStudentProfile, type StudentProfile } from "@/lib/studentProfile";
import { GPA_OPTIONS, TRAVEL_DISTANCE_OPTIONS } from "@/components/build/types";
import { liftSplashVeil } from "@/components/app/SplashVeil";
import { playMilestoneChime } from "@/components/build/sound";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS, careerReport, DEMO_TOP3, interestTier, routeDetail, STUDENT, type PlanTask, type ProfileCareer, strongestCareerId } from "./data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks, writePicks } from "@/lib/picks";
import { CareerReportView, ComparisonTable, NOT_IN_REPORT, Portal, cellsFromReport } from "./CareerReport";
import { collegePlan, currentPlanWindowId, gradePlan, type CollegeYear, type GradeStep, type GradeWindow, type PlanStage } from "./gradePlanData";
import { flyXp } from "@/components/app/xpFlight";
import { top3PhotoFocus } from "./top3PhotoFocus";
import { SeasonScene, SEASON_STYLE } from "./SeasonScene";
import { TextTabs } from "@/components/app/TextTabs";
import { EventStubs } from "./EventStubs";
import { ResumeExperience } from "@/components/resume/ResumeExperience";
import { EVENTS } from "@/components/connect/data";
import { collegeBySlug, collegeImage } from "@/components/colleges/data";
import { SaveButton, tags as collegeTags, useSaved as useSavedColleges } from "@/components/colleges/shared";
import { COMPANY_VIDEOS } from "@/components/app/companyVideos";
import { useSavedVideos } from "@/lib/savedVideos";
import { useSavedCareers } from "@/lib/savedCareers";
import { useConnectSaves } from "@/lib/connectSaves";
import { OpportunitiesShelf, useSavedOpportunityCount } from "@/components/opportunities/SavedShelf";
import { playArrival } from "@/lib/showTheWay";
import { resumeSnapshot, serverResumeSnapshot, subscribeResume } from "@/lib/resume";
import { useBackStep } from "@/lib/backStep";
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

type TabId = "overview" | "top3" | "routes" | "plan" | "report" | "locker" | "resume" | "preferences" | "settings";

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

const TAB_IDS: TabId[] = ["overview", "top3", "routes", "plan", "report", "locker", "resume", "preferences", "settings"];
/** Has the student opened My Build? Retires its nudge. In demo mode it
 *  follows the welcomes' rule, once per session, so a demo shows it again
 *  after a reload (Chandu, 2 Oct 2026: "I don't see the nudge for My Build
 *  anymore"; one click had retired it for good). */
const BUILD_OPENED = "dreamari:build-opened";
// Under the welcomes' prefix, so a reload clears it like theirs
// (WelcomeSplash.clearOnReload only clears "dreamari:welcome:" keys; the old
// name survived reloads, so the nudge never came back).
const BUILD_OPENED_SESSION = "dreamari:welcome:build-opened";
function buildOpened(): boolean {
  if (DEMO_ALWAYS_SHOW_SPLASH) return demoSeenThisSession(BUILD_OPENED_SESSION);
  try { return window.localStorage.getItem(BUILD_OPENED) === "1"; } catch { return true; }
}
function markBuildOpened(): void {
  if (DEMO_ALWAYS_SHOW_SPLASH) { markDemoSeenThisSession(BUILD_OPENED_SESSION); return; }
  try { window.localStorage.setItem(BUILD_OPENED, "1"); } catch { /* nothing to persist to */ }
}

/** Hand-rolled ease with explicit instant steps: on this page a smooth
 *  scroll, including the two-argument scrollTo, is cancelled before it moves
 *  (measured 2 Oct 2026); an instant scroll is not. */
function easeScrollTo(to: number, ms = 420) {
  const from = window.scrollY;
  if (Math.abs(to - from) < 24) return;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / ms);
    const e = 1 - Math.pow(1 - p, 3);
    window.scrollTo({ top: from + (to - from) * e, behavior: "instant" as ScrollBehavior });
    if (p < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

// "View saved" shows the way (2 Oct 2026, Chandu: "when coming from a view
// saved cta, land on top 3 after the profile modal dismisses and then
// animate the tab sliding and the page also transitioning smoothly to the
// saved tab... smooth and not all at once. But fast enough that it's not a
// pain point. Only when coming from the view saved"). Sequence: the welcome
// modal (when it shows), Top 3 held for a beat, Top 3 eases out, the tab
// pill slides to Saved while Saved eases in, the tab strip scrolls into view.
// CAVEAT, for production: this is meant to run the FIRST time a student
// opens Saved from a "View saved" link only, then land straight on Saved
// (REVEAL_SEEN_KEY in localStorage). DEMO-ONLY: DEMO_ALWAYS_REVEAL_SAVED
// keeps it running on every "View saved" so it can be shown in a demo;
// set it to false to ship the first-time-only behavior.
const DEMO_ALWAYS_REVEAL_SAVED = true;
const REVEAL_SEEN_KEY = "dreamari:saved-reveal-seen";
const REVEAL_HOLD_MS = 450;
const REVEAL_OUT_MS = 200;

export function ProfileExperience({ initialPicks = [], initialFocus = null, initialTab, initialWelcome = false, initialFromSaved = false }: { initialPicks?: string[]; initialFocus?: string | null; initialTab?: string; initialWelcome?: boolean; initialFromSaved?: boolean } = {}) {
  const [showProfileTour, dismissProfileTour] = useFirstUseHint("profile-overview-tour", { repeatOnReload: true });
  // Arriving from a "View saved" or "See Top 3": the page slides in, then
  // the tab strip, then the open panel (src/lib/showTheWay.ts).
  useEffect(() => { playArrival(); }, []);
  // One layout since 4 Oct 2026 (Chandu: "V2 is finalised right? lets remove
  // v1"): five tabs, no Overview. Top 3 is where the Profile opens and where
  // Close buttons return.
  const homeTab: TabId = "top3";
  const [profileTourReady, setProfileTourReady] = useState(false);
  const [profileTourStep, setProfileTourStep] = useState<"plan" | "report" | "resume" | "top3">("plan");
  // Arriving from Match (?welcome=1): the page is assembled in front of the
  // student — title, then the identity card, then the tab card — with one
  // welcome line, instead of everything simply being there. Only for that
  // arrival; a normal visit renders at rest.
  // The welcome popup opens once the page has visibly begun assembling (so the
  // student sees the profile arrive first, then gets introduced to it), and
  // Continue simply dismisses it — the Top Three tab is already open under it.
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  // true from the moment a welcome is scheduled until it is dismissed, so the
  // Top Three hint waits for it instead of growing in underneath it
  const [welcomePending, setWelcomePending] = useState(false);
  // Demo: every visit shows the welcome, like the other tabs' splashes
  // (direct feedback, 10 Sept 2026: "the pop up isn't happening on my
  // profile"); once DEMO_ALWAYS_SHOW_SPLASH is off it's arrival-only again.
  // Before paint and with no delay: the welcome comes first, the page
  // second (Chandu, 2 Oct 2026, a rule for every welcome: "first the modal
  // with the blurred background, then the page loads"; SplashVeil.tsx).
  useLayoutEffect(() => {
    if (!initialWelcome && !(DEMO_ALWAYS_SHOW_SPLASH && !demoSeenThisSession("dreamari:welcome:profile"))) { liftSplashVeil(); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a client-only storage read, applied before paint
    setWelcomePending(true);
    setWelcomeOpen(true);
    playMilestoneChime();
  }, [initialWelcome]);
  // A "View saved" arrival starts on Top 3 and slides to Saved (runSavedReveal).
  const revealOnArrival = initialFromSaved && initialTab === "locker";
  const revealRef = useRef(revealOnArrival);
  const [panelPhase, setPanelPhase] = useState<"idle" | "out" | "in">("idle");
  const [tab, setTab] = useState<TabId>(revealOnArrival ? "top3" : initialTab && (TAB_IDS as string[]).includes(initialTab) ? (initialTab as TabId) : "top3");
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const runSavedReveal = () => {
    if (!revealRef.current) return;
    revealRef.current = false;
    try { window.localStorage.setItem(REVEAL_SEEN_KEY, "1"); } catch { /* fine */ }
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("from");
      window.history.replaceState(window.history.state, "", url.toString());
    } catch { /* nothing to tidy */ }
    const bringTabsIntoView = () => {
      const el = tablistRef.current;
      if (el) easeScrollTo(Math.max(0, el.getBoundingClientRect().top + window.scrollY - 84));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTab("locker"); bringTabsIntoView(); return; }
    window.setTimeout(() => {
      setPanelPhase("out");
      window.setTimeout(() => {
        setPanelPhase("in");
        setTab("locker");
        bringTabsIntoView();
        window.setTimeout(() => setPanelPhase("idle"), 600);
      }, REVEAL_OUT_MS);
    }, REVEAL_HOLD_MS);
  };
  // No modal this visit: the way to Saved plays once the page has arrived.
  // Outside the demo, a student who has seen it once lands on Saved directly.
  useLayoutEffect(() => {
    if (!revealRef.current) return;
    let seen = false;
    try { seen = window.localStorage.getItem(REVEAL_SEEN_KEY) === "1"; } catch { /* fine */ }
    if (!DEMO_ALWAYS_REVEAL_SAVED && seen) {
      revealRef.current = false;
      setTab("locker");
      return;
    }
    const modalDue = initialWelcome || (DEMO_ALWAYS_SHOW_SPLASH && !demoSeenThisSession("dreamari:welcome:profile"));
    if (modalDue) return;
    const t = window.setTimeout(runSavedReveal, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);
  const dismissWelcome = () => {
    setWelcomeOpen(false);
    setWelcomePending(false);
    // An explicit ?tab= (Home's links, the Preferences link) wins over the
    // first-visit Overview tour; the tour waits for the next Overview visit.
    if (showProfileTour) {
      if (!initialTab) setTab(homeTab);
      setProfileTourReady(true);
    }
    markDemoSeenThisSession("dreamari:welcome:profile");
    // A "View saved" arrival: the modal goes, then the way to Saved plays.
    if (revealRef.current) runSavedReveal();
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
      // Arriving from Match on Top Three (28 Sept 2026: "auto scroll to the
      // three cards... so we don't miss the nudge"): land on the how-to line
      // and the cards themselves, the tabs just above them in view.
      const cards = tab === "top3" ? document.getElementById("top3-rank-row") ?? document.querySelector<HTMLElement>('[id^="top3-card-"]') : null;
      const target = cards ?? (showProfileTour ? null : tablistRef.current);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - (cards ? 104 : 84);
      easeScrollTo(Math.max(0, top));
    });
  };
  const buildIn = (order: number) =>
    initialWelcome
      ? { className: "motion-safe:animate-[card-cascade_0.7s_cubic-bezier(0.16,1,0.3,1)_both]", style: { animationDelay: `${180 + order * 220}ms` } as React.CSSProperties }
      : { className: "", style: {} as React.CSSProperties };
  // ?tab= from Home's Your Next Moves opens straight onto that tab

  useEffect(() => {
    if (initialWelcome || (DEMO_ALWAYS_SHOW_SPLASH && !demoSeenThisSession("dreamari:welcome:profile"))) return;
    const timer = window.setTimeout(() => {
      if (showProfileTour && !initialTab) setTab(homeTab);
      setProfileTourReady(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [initialWelcome, showProfileTour]);
  // The tour used to centre its hint with a page scroll, on every load in
  // demo mode, which read as the profile scrolling down by itself (Chandu,
  // 2 Oct 2026: "if I just visit my profile properly don't scroll down
  // automatically"). The hints show in place now. The only automatic scroll
  // left is below: landing on a tab a link asked for.
  useEffect(() => {
    // With a welcome due, the dismiss handler does the scroll instead, so
    // the popup is the first thing seen (Chandu, 2 Oct 2026: "make sure the
    // welcome modal displays first and only then the scroll to my Top 3").
    if (!initialTab || initialWelcome || revealRef.current) return;
    const t = window.setTimeout(() => {
      const el = tablistRef.current;
      if (el) easeScrollTo(el.getBoundingClientRect().top + window.scrollY - 84);
    }, 420);
    return () => window.clearTimeout(t);
  }, [initialTab, initialWelcome]);
  // Roadmap tasks link to /profile?tab=... from inside the profile itself;
  // follow the new tab when the URL changes under us (state adjusted during
  // render, the React-recommended shape, so no effect is needed).
  useEffect(() => {
    // There is no Overview any more; a stale ?tab=overview link lands on Top 3.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one correction for an old link, no cascade
    if (tab === "overview") setTab("top3");
  }, [tab]);
  const [seenInitialTab, setSeenInitialTab] = useState(initialTab);
  // Which Settings section the gear menu asked for; Settings scrolls to it.
  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(null);
  // The tab Settings was opened from (8 Oct 2026, "ALWAYS EVERYTHING SHOULD
  // GO ONLY ONE STEP BACK"): its X and the browser's Back both return there,
  // not to a fixed Top 3. null means Settings was the page's first view (a
  // ?tab=settings link), so X falls back to Top 3 and Back leaves the page.
  const [settingsFrom, setSettingsFrom] = useState<TabId | null>(null);
  const closeSettings = () => { setSettingsSection(null); setTab(settingsFrom ?? "top3"); setSettingsFrom(null); };
  useBackStep(tab === "settings" && settingsFrom !== null, closeSettings);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  // Preferences teaching moment: counts visits, fires once on the second.
  const [prefsTag, setPrefsTag] = useState(false);
  const [buildDot, setBuildDot] = useState(false);
  const buildBtnRef = useRef<HTMLButtonElement>(null);
  const [tagPos, setTagPos] = useState<{ top: number; right: number } | null>(null);
  useEffect(() => {
    if (!prefsTag) return;
    // Re-measured every 200ms while the tag is live (it lives 9s), so it
    // follows the header through the arrival animation and any resize; a
    // single measurement at show time sometimes landed before layout settled.
    // The tag only paints while the icon itself is on screen and clear of
    // the nav bar (Chandu, 2 Oct 2026: "otherwise it's pointing at the
    // profile avatar on the navbar"). When the page has scrolled, as it does
    // landing on Saved from a nudge, the tag waits and appears the moment
    // the header is back in view; its nine seconds count only while shown.
    // The dot on the icon covers the wait.
    let shownAt = 0;
    const place = () => {
      const r = buildBtnRef.current?.getBoundingClientRect();
      if (!r || r.width === 0) return;
      const clearOfNav = r.top >= 80 && r.bottom <= window.innerHeight - 40;
      if (!clearOfNav) { setTagPos(null); return; }
      if (!shownAt) shownAt = Date.now();
      if (Date.now() - shownAt > 9000) { setPrefsTag(false); return; }
      const next = { top: Math.round(r.bottom + window.scrollY + 10), right: Math.max(12, Math.round(document.documentElement.clientWidth - r.right)) };
      setTagPos((cur) => (cur && cur.top === next.top && cur.right === next.right ? cur : next));
    };
    const id = window.setInterval(place, 200);
    const raf = window.requestAnimationFrame(place);
    return () => { window.clearInterval(id); window.cancelAnimationFrame(raf); setTagPos(null); };
  }, [prefsTag]);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a client-only flag read after mount
      setBuildDot(!buildOpened());
    } catch { /* no storage: no dot */ }
  }, []);
  // My Build is a modal over the page (6 Oct 2026): sections down the left,
  // the editor on the right, one Save for all of it.
  const [buildOpen, setBuildOpen] = useState(false);
  const openBuild = () => {
    setPrefsTag(false);
    setBuildDot(false);
    markBuildOpened();
    setBuildOpen(true);
  };
  // v2 first visit: Overview, which hosted the four-step tour, is gone, so
  // the tour is the Top 3 tab's own hint (the pulsing banner and the #1
  // card's tag), armed once the page has settled.
  // One thing at a time (Chandu, 2 Oct 2026: "do not scroll down on the Top
  // 3 without first finishing the Build coachmark"): the Top 3 hint arms
  // only once the My Build tag has had its turn, or was not due at all.
  const [tagCycleDone, setTagCycleDone] = useState(false);
  const tagWasShown = useRef(false);
  useEffect(() => {
    if (prefsTag) { tagWasShown.current = true; return; }
    if (tagWasShown.current) { setTagCycleDone(true); return; }
    // Not due: My Build already opened once, or a forced/first-view tag has
    // not fired yet. Give the 1.6s show timer its chance before deciding.
    const t = window.setTimeout(() => {
      if (buildOpened()) setTagCycleDone(true);
    }, 2200);
    return () => window.clearTimeout(t);
  }, [prefsTag]);
  useEffect(() => {
    if (!showProfileTour || initialWelcome || !tagCycleDone) return;
    const t = window.setTimeout(() => { setProfileTourStep("top3"); setProfileTourReady(true); }, 400);
    return () => window.clearTimeout(t);
  }, [showProfileTour, initialWelcome, tagCycleDone]);
  useEffect(() => {
    // Waits for the welcome splash, so the two never fire together.
    if (welcomeOpen || welcomePending) return;
    // DEMO-ONLY: ?nudge=build shows it on demand (Chandu, 1 Oct 2026: "I don't
    // think I ever saw that second visit nudge, how do I trigger it?").
    const forced = new URLSearchParams(window.location.search).get("nudge") === "build";
    if (!forced) {
      // Every visit until My Build has been opened once (Chandu, 2 Oct 2026:
      // "I need to see the nudge on the first view itself", then "I don't
      // see the My Build nudge": a once-ever flag had already been spent).
      // Opening My Build is the only thing that retires it, and the icon
      // keeps a dot between visits (see buildDot), the way Instagram marks a
      // tab with something new, instead of a coachmark.
      try {
        if (buildOpened()) return;
      } catch { return; }
    }
    // Shown 1.6s after the page settles; it retires itself nine seconds
    // after it is first on screen (see the position loop), or on tap.
    const show = window.setTimeout(() => setPrefsTag(true), 1600);
    return () => window.clearTimeout(show);
  }, [welcomeOpen, welcomePending]);
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
    //
    // Custom-designed edge case, 22 Sept 2026: this branch used to trust
    // `initialPicks`/`initialFocus` (straight from the `?picks=`/`?focus=`
    // URL params, only trimmed/deduped/capped by `parsePicksParam` -- never
    // checked against the real catalog) unfiltered, while the `stored.ids`
    // branch right below already validates. A stale bookmark, a renamed/
    // removed career, or a hand-edited share URL put an id here that
    // `careerById()` can't resolve -- and several call sites below read it
    // with a non-null assertion (`careerById(id)!`), so a bad id doesn't
    // fail gracefully, it throws and (no error boundary exists anywhere in
    // this app) blanks the whole page. Filtered the same way the stored
    // branch already is; if EVERY handed-off id was bad, fall through to
    // the student's own real saved picks rather than a hard-fail on a
    // corrupted link.
    if (fromHandoff) {
      const validHandoff = initialPicks.filter((id) => ALL_PROFILE_CAREERS.some((career) => career.id === id));
      if (validHandoff.length) return { ids: validHandoff, focus: initialFocus && validHandoff.includes(initialFocus) ? initialFocus : null };
    }
    const valid = stored.ids.filter((id) => ALL_PROFILE_CAREERS.some((career) => career.id === id));
    if (valid.length) return { ids: valid, focus: stored.focus && valid.includes(stored.focus) ? stored.focus : null };
    return { ids: DEMO_TOP3, focus: null as string | null };
  }, [fromHandoff, initialPicks, initialFocus, stored]);
  // Rank is position: whichever career leads (the chosen primary, or the
  // strongest match standing in) is placed first once, so card #1 and the
  // career the Report and Plan follow are always the same one.
  const ranked = useMemo(() => {
    const lead = base.focus ?? strongestCareerId(base.ids);
    return lead && base.ids.includes(lead) ? { ids: [lead, ...base.ids.filter((id) => id !== lead)], focus: base.focus } : base;
  }, [base]);
  const top3 = edits?.ids ?? ranked.ids;
  /** the student's own choice, or null while the strongest match is the default */
  const chosenPrimaryId = edits ? edits.focus : ranked.focus;
  const primaryChosen = chosenPrimaryId !== null && top3.includes(chosenPrimaryId);
  // Algorithmic default: the highest Career Interest Score among the three.
  const strongestId = useMemo(() => strongestCareerId(top3), [top3]);
  const focusId = primaryChosen ? chosenPrimaryId : strongestId;
  const setTop3 = (next: string[] | ((previous: string[]) => string[])) =>
    setEdits((current) => {
      const previous = current ?? ranked;
      return { ids: typeof next === "function" ? next(previous.ids) : next, focus: previous.focus };
    });
  const setFocusId = (id: string | null) => setEdits((current) => ({ ids: (current ?? ranked).ids, focus: id }));
  const [routeChoice, setRouteChoice] = useState<Record<string, string>>({});
  // Build is already behind the student when the plan first opens, so the
  // steps marked doneByDefault start checked and no plan opens at 0%.
  const [done, setDone] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(ALL_PROFILE_CAREERS.map((c) => [c.id, c.plan.flatMap((h) => h.tasks.filter((task) => task.doneByDefault).map((task) => task.id))])),
  );
  const [swapCandidate, setSwapCandidate] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  // Both are plain overlays (not aria-modal dialogs, which HistoryHost
  // handles), so each holds its own Back step (8 Oct 2026): Back closes
  // the overlay, not the page under it.
  useBackStep(swapCandidate !== null, () => setSwapCandidate(null));
  useBackStep(addOpen, () => setAddOpen(false));
  // "Updated" pulses on every tab whose content just changed (focus swap
  // touches report + routes + plan; a route choice touches report + plan).
  // The tab currently in view is skipped: the change is visible live there.
  const [pings, setPings] = useState<Partial<Record<TabId, boolean>>>({});
  const pingTimer = useRef<number | null>(null);
  // Fade the tablist's right edge only while there's actually more to scroll
  // to -- a static fade would misrepresent state once the last tab (Resume)
  // is fully in view, reading as a cut-off pill rather than a genuine cue.
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
  // What the student really saved (lib/savedCareers, the one store Career
  // Detail, Explore and the Saved tab all write), newest first, minus the
  // Top 3. One list drives the v2 Saved tab's count, its Careers shelf
  // (LockerTab builds the same list) and the Add to Top 3 sheet, so the
  // three can never disagree. There is no demo seed in that store: a
  // fresh visitor has nothing saved.
  const [savedCareerIds, toggleSavedCareer] = useSavedCareers();
  const savedLocker = useMemo(
    () => [...savedCareerIds].reverse().map((id) => ALL_PROFILE_CAREERS.find((career) => career.id === id)).filter((career): career is ProfileCareer => !!career && !top3.includes(career.id)),
    [savedCareerIds, top3],
  );
  const savedTotal = savedLocker.length;
  // The Add sheet says "from Saved", so it lists what Saved lists and
  // nothing else (Joshua, 4 Oct 2026: it showed HR Manager, Art Director and
  // others the student never saved).
  const addChoices = savedLocker;

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

  const [undoRemove, setUndoRemove] = useState<{ ids: string[]; focus: string | null; title: string; id: string } | null>(null);
  function removeFromTop3(id: string) {
    const before = { ids: top3, focus: chosenPrimaryId, title: careerById(id)?.title ?? "that career", id };
    // The slot promises "{career} went back to Saved", so make it true: a
    // pick that came straight from Match was never in the saved store, and
    // with the Add sheet now reading only that store it would otherwise
    // vanish. Undo puts it back in the Top 3, where Saved hides it anyway.
    if (!savedCareerIds.has(id)) toggleSavedCareer(id);
    const next = top3.filter((item) => item !== id);
    // Removing #1 promotes the next card, and the Report and Plan follow it.
    setEdits({ ids: next, focus: focusId === id || top3[0] === id ? (next[0] ?? null) : chosenPrimaryId });
    setUndoRemove(before);
  }
  // Rank is position (28 Sept 2026, with Match's ranking screen gone): the
  // card in first place is the primary career the Report and Plan follow, so
  // moving a card to #1 is what "Make My Primary" used to be.
  function reorderTop3(ids: string[]) {
    setEdits({ ids, focus: ids[0] ?? null });
    setUndoRemove(null);
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
      {/* gap-[22px] + title's own +2px margin, pt-3/md:pt-8: the shared
         "title page" rhythm (Home/Explore/Profile/Play/Colleges/Connect),
         direct feedback 22 Sept 2026 -- see HomeExperience.tsx's own
         comment for the full reasoning. */}
      <main className="no-print relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-5 pt-3 pb-[120px] sm:px-[var(--space-14)] md:pt-8">
        <div className={`${buildIn(0).className} mb-[2px]`} style={buildIn(0).style}>
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
            {/* data-night-scene: this cluster always sits on dark glass over
               the cover photo, so it keeps the dark UI tokens in light mode
               too (Saved and Settings used --muted-foreground, which turned
               dark grey on the dark pill; 26 Sept 2026). */}
            <div data-night-scene className="absolute top-[var(--space-4)] right-[var(--space-4)] flex max-w-[calc(100%-32px)] flex-wrap items-center justify-end gap-[6px] rounded-[var(--radius-md)] p-[2px]" style={{ background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", textShadow: "none" }}>
              <span className="relative">
                <button
                  type="button"
                  aria-label="Change cover photo"
                  aria-expanded={coverOpen}
                  onClick={() => setCoverOpen((open) => !open)}
                  className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-auto sm:gap-[5px] sm:px-[10px] sm:text-[14px] sm:font-semibold"
                  style={{ color: coverOpen ? "var(--accent-subtle)" : "rgba(255,255,255,0.86)" }}
                >
                  {/* The dot, not the shimmer (Chandu, 2 Oct 2026: "give the blue
                     dot to the cover button and the shimmer to My Build"). */}
                  {coverNudge && <span aria-hidden className="absolute top-[4px] right-[4px] size-[7px] rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 0 2px rgba(9,10,20,0.8)" }} />}
                  <ImagePlus className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" />{" "}
                  {/* The sweep fills the text with currentColor + a white
                     glint (dm-text-nudge, background-clip: text), so it
                     needs a muted base to show against -- this label's
                     normal resting color is already near-white, the same
                     tone as the sweep itself, which is why it read as
                     invisible (direct feedback, 20 Sept). */}
                  <span className="relative hidden sm:inline">Cover</span>
                </button>
                {coverOpen && (
                  /* a sheet through the portal: the header clips and the blurred
                     cluster would otherwise contain a fixed child */
                  <Portal>
                  <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Choose a cover photo" style={{ textShadow: "none", fontFamily: "var(--font-body)" }}>
                    {/* the page stays visible behind a frosted overlay, never a black screen */}
                    <button type="button" aria-label="Close" onClick={() => setCoverOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
                    <div className="relative z-[1] flex w-full max-w-[480px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
                      <div className="flex items-center justify-between gap-[var(--space-3)]">
                        <h3 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Cover photo</h3>
                        <IconTip label="Close">
                        <button type="button" onClick={() => setCoverOpen(false)} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                        </IconTip>
                      </div>
                      {/* Same max-h + overflow-y-auto pattern as the avatar
                         picker's own grid just below -- with 21 covers now
                         (was 6 when this had no scroll constraint at all),
                         the grid ran taller than the viewport on shorter
                         screens and just got cropped (direct feedback, 20
                         Sept). The header above stays put; only the grid
                         scrolls. */}
                      {/* The scroller wraps the grid rather than being it: a
                         height-capped grid shrinks its rows, and overflow-hidden
                         tiles have no minimum height, so the covers collapsed
                         onto each other (2 Oct 2026: "the cover picker has all
                         the options overlapping again"). */}
                      <div className="dm-scroll max-h-[calc(60vh/var(--vz,1))] overflow-y-auto pr-[2px]">
                      <div className="grid grid-cols-3 gap-[8px]">
                        {COVERS.map((url) => (
                          <button key={url} type="button" aria-label="Use this cover" aria-pressed={coverUrl === url} onClick={() => pickCover(url)} className="dm-tap relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[var(--radius-sm)]" style={{ boxShadow: coverUrl === url ? "0 0 0 2px var(--primary)" : "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
                            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                      </div>
                    </div>
                  </div>
                  </Portal>
                )}
              </span>
              {/* Resume moved into the main tablist below -- it deserves the
                 same first-class standing as Overview/Report, not a small
                 icon tucked in the header. */}
              {/* Preferences takes the header spot Saved had (direct
                 instruction, 30 Sept 2026), since Saved is a tab. */}
              <span className="relative">
              <button
                ref={buildBtnRef}
                type="button"
                aria-label="My Build"
                onClick={openBuild}
                className={`dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-auto sm:gap-[5px] sm:px-[10px] sm:text-[14px] sm:font-semibold ${prefsTag ? "dm-tab-nudge" : ""}`}
                style={{ background: tab === "preferences" || prefsTag ? "var(--glass-surface-3)" : "transparent", color: tab === "preferences" || prefsTag ? "var(--accent-subtle)" : "var(--muted-foreground)" }}
              >
                <SlidersHorizontal className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" />{" "}
                {/* The text sweep with its spark (the Cover button's old nudge)
                   until My Build has been opened once; the coachmark rides
                   alongside on the first views. A muted base so the glint
                   shows (same reason Cover's label had one). */}
                <span className={`relative hidden sm:inline ${buildDot ? "dm-text-nudge" : ""}`} style={buildDot ? { color: "rgba(255,255,255,0.55)" } : undefined}>
                  My Build
                  {buildDot && (
                    <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark pointer-events-none absolute -top-[7px] -right-[9px] h-[9px] w-[9px]">
                      <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="#FFFFFF" />
                    </svg>
                  )}
                </span>
              </button>
              {/* The teaching moment (Chandu, 1 Oct 2026: "a teaching moment
                 for preferences, timed, maybe on the second visit"). Second
                 visit only: the first visit belongs to the profile tour and
                 the welcome. 1.6s after the page settles, the icon pulses and
                 one line slides out under it. Tapping the line opens
                 Preferences; otherwise it leaves after 9s. Once, ever. */}
              {/* Rendered through a portal: inside the cover card the tag was
                 clipped by the card's rounded overflow on desktop (2 Oct 2026;
                 Chandu: "I don't see the My Build nudge"). Positioned in page
                 coordinates under the button, so it scrolls with the header. */}
              {prefsTag && tagPos && (
                <Portal>
                  <div className="marketing-v2 themeable" style={{ background: "transparent" }}>
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      onClick={openBuild}
                      className="dm-tap absolute z-[80] flex w-max max-w-[280px] cursor-pointer items-center gap-[10px] rounded-[12px] px-[14px] py-[11px] text-left text-[14px] leading-[18px] font-bold"
                      style={{ top: tagPos.top, right: tagPos.right, background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 14px 30px -12px rgba(0,0,0,0.6)", textShadow: "none", fontFamily: "var(--font-body)" }}
                    >
                      <span aria-hidden className="absolute -top-[5px] right-[14px] size-[10px] rotate-45" style={{ background: "var(--primary)" }} />
                      <Sparkles className="h-[16px] w-[16px] flex-none" aria-hidden />
                      {/* 2 Oct 2026, Chandu: better copy that says they can change
                         their preferences and Dreamari changes with them. */}
                      Into something new? Change it here and your matches follow.
                    </motion.button>
                  </div>
                </Portal>
              )}
              </span>
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
                      {/* Preferences also tops the gear menu, so it has two
                         entry points (header icon, menu). */}
                      {(
                        <>
                          <button type="button" role="menuitem" onClick={() => { setSettingsMenuOpen(false); openBuild(); }} className="dm-quiet flex w-full cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-left text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>
                            <SlidersHorizontal className="h-4 w-4 flex-none" aria-hidden /> My Build
                          </button>
                          <span aria-hidden className="my-[4px] block h-px" style={{ background: "var(--glass-border)" }} />
                        </>
                      )}
                      {/* "Your answers" is My Build; one entry, not two. */}
                      {SETTINGS_SECTIONS.filter((item) => item.id !== "answers").map((item) => (
                        <Fragment key={item.id}>
                          {item.divider && <span aria-hidden className="my-[4px] block h-px" style={{ background: "var(--glass-border)" }} />}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setSettingsMenuOpen(false); setSettingsSection(item.id); if (tab !== "settings") setSettingsFrom(tab); setTab("settings"); }}
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
                {/* Custom-designed edge case, 22 Sept 2026: `avatarSrc` can
                   be a student-picked override persisted in localStorage
                   (writeAvatarOverride) with no check that the file still
                   exists -- shown on every single Profile visit, unlike a
                   career photo a student might never scroll to. Keyed by
                   src so a fresh pick always gets a fresh failed-state
                   (same remount-on-key idiom as Build's QuestionSprite),
                   falling back to a generic UserRound glyph instead of a
                   broken-image icon on the student's own header. */}
                <StudentAvatarImage key={avatarSrc} src={avatarSrc} />
                <IconTip label="Change picture">
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
                </IconTip>
                {avatarPickerOpen && (
                  <Portal>
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Choose your picture" style={{ textShadow: "none", fontFamily: "var(--font-body)" }}>
                      <button type="button" aria-label="Close" onClick={() => setAvatarPickerOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
                      <div className="relative z-[1] flex w-full max-w-[480px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
                        <div className="flex items-center justify-between gap-[var(--space-3)]">
                          <h3 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Choose your picture</h3>
                          <IconTip label="Close">
                          <button type="button" onClick={() => setAvatarPickerOpen(false)} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                          </IconTip>
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
                        <div className="dm-scroll grid max-h-[calc(60vh/var(--vz,1))] grid-cols-5 gap-[10px] overflow-y-auto pr-[2px] sm:grid-cols-6">
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
        {tab === "settings" ? null : (
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
            const order: TabId[] = ["top3", "locker", "plan", "report", "resume"];
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
            // Five tabs (1 Oct 2026). Overview is gone, Saved is second with
            // a count, Preferences is in the header and the Settings menu.
            // Joshua's concern was a seventh tab ("too much info or too
            // long?"); this is five.
            [
              { id: "top3", label: "Top 3" },
              { id: "locker", label: "Saved", badge: savedTotal || undefined },
              { id: "plan", label: "My Plan" },
              { id: "report", label: "Report" },
              { id: "resume", label: "Resume" },
            ] as { id: TabId; label: string; badge?: number }[]
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
              className={`dm-quiet relative cursor-pointer rounded-[var(--radius-md)] py-[10px] text-center leading-[15px] font-bold whitespace-nowrap sm:flex-1 sm:px-[var(--space-2)] sm:py-[13px] sm:text-[15px] sm:leading-[18px] flex-1 px-[6px] text-[12px]`}
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
              {/* The count as a small numeral chip, not part of the word
                 (Chandu, 1 Oct 2026: "I don't want it reading like Saved 6");
                 Gmail's and Linear's tab counts. Inherits the tab's ink. */}
              {item.badge ? <span aria-label={`${item.badge} saved`} className="relative ml-[6px] inline-flex min-w-[18px] items-center justify-center rounded-full px-[5px] text-[10.5px] leading-[16px] font-bold tabular-nums" style={{ background: tab === item.id ? "rgba(255,255,255,0.22)" : "color-mix(in srgb, var(--foreground) 12%, transparent)", color: "var(--ink)" }}>{item.badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === "top3" && (
          <motion.div role="tabpanel" id="profile-panel-top3" aria-labelledby="profile-tab-top3" initial={false} animate={panelPhase === "out" ? { opacity: 0, x: -28 } : { opacity: 1, x: 0 }} transition={{ duration: REVEAL_OUT_MS / 1000, ease: [0.4, 0, 1, 1] }}>
            <Top3Tab
              top3={top3} focusId={focusId} primaryChosen={primaryChosen} setFocusId={setFocusId} chosenRoute={chosenRoute}
              showTour={showProfileTour && profileTourReady && !welcomeOpen && profileTourStep === "top3"}
              hintPaused={welcomeOpen || welcomePending}
              onTourDone={dismissProfileTour}
              // No confirm dialog: a removed career goes back to Saved and
              // the freed slot offers Undo right where the card was, so a
              // mis-tap costs one tap (a dialog plus a toast was two layers
              // for a reversible action).
              onAdd={() => { setUndoRemove(null); setAddOpen(true); }} onRemove={removeFromTop3} onReorder={reorderTop3}
              removed={undoRemove ? { id: undoRemove.id, title: undoRemove.title, index: undoRemove.ids.indexOf(undoRemove.id) } : null}
              onDismissUndo={() => setUndoRemove(null)}
              onUndo={() => { if (undoRemove) setEdits({ ids: undoRemove.ids, focus: undoRemove.focus }); setUndoRemove(null); }}
              onOpenCompare={() => setCompareOpen(true)} onGoReport={() => setTab("report")}
            />
          </motion.div>
        )}
        {tab === "routes" && (
          <div role="tabpanel" id="profile-panel-routes" aria-labelledby="profile-tab-plan">
            <RoutesTab
              focus={focus} chosenRoute={chosenRoute} setRouteChoice={setRouteChoice}
              savedMajors={savedMajors} onToggleMajor={toggleMajor} onGoPlan={() => setTab("plan")}
              onGoTop3={() => setTab("top3")}
            />
          </div>
        )}
        {tab === "plan" && (
          <div role="tabpanel" id="profile-panel-plan" aria-labelledby="profile-tab-plan">
            {/* V2 approved, 22 Sept 2026 ("v2 is approved for my plan...
               no more toggle") -- hard-coded "v2". */}
            <MyPlanTab focus={focus} onGoRoutes={() => setTab("routes")} variant="v2" />
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
        {/* v2 opens it from the header button; it still shows here, inside
           the tab card, so the tabs stay the way back (no second title, no
           close button over the page's own header). */}
        {buildOpen && <BuildModal onClose={() => setBuildOpen(false)} />}
        {tab === "locker" && (
          <motion.div role="tabpanel" id="profile-panel-locker" aria-labelledby="profile-tab-locker" initial={panelPhase === "in" ? { opacity: 0, x: 28 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}>
            <LockerTab locker={locker} top3Count={top3.length} addToTop3={addToTop3} onClose={() => setTab("top3")} embedded />
          </motion.div>
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
          </>
        )}
        {/* Reachable only via PlanTab's "Change route" link now, not a main
           tab -- hidden from the tablist per direct feedback (see the
           comment above), but the underlying route-choice flow still needs
           a real destination rather than a dead link. */}
        {tab === "settings" && <SettingsView section={settingsSection} onClose={closeSettings} />}
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


      {/* ---- Swap sheet ---- */}
      {swapCandidate && (
        <div className="no-print fixed inset-0 z-[60] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setSwapCandidate(null); }}>
          <div className="dm-scroll filters-reveal max-h-[calc(calc(100dvh/var(--vz,1))-96px)] w-full max-w-[440px] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[calc(85dvh/var(--vz,1))] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
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

      {/* ---- Add-from-Locker sheet: pick right here, no tab switch ---- */}
      {addOpen && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <div className="filters-reveal flex max-h-[calc(calc(100dvh/var(--vz,1))-96px)] w-full max-w-[420px] flex-col rounded-[var(--radius-xl)] border p-[var(--space-5)] sm:max-h-[calc(85dvh/var(--vz,1))] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <div>
                <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Add to your Top 3</p>
                <p className="mt-[2px] text-[14px]" style={{ color: "var(--muted-foreground)" }}>{3 - top3.length} open {top3.length === 2 ? "slot" : "slots"} · from Saved</p>
              </div>
              <IconTip label="Close">
              <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
                <X className="h-4 w-4" />
              </button>
              </IconTip>
            </div>
            <div className="dm-scroll mt-[var(--space-4)] flex max-h-[calc(50vh/var(--vz,1))] flex-col gap-[var(--space-2)] overflow-y-auto">
              {/* Empty: a list inside a sheet, so the playbook's tier 3 (one
                 plain muted line, no border), plus one way out since nothing
                 else on the sheet points anywhere (COMPONENT_STATES_PLAYBOOK). */}
              {addChoices.length === 0 && (
                <div className="flex flex-col items-start gap-[var(--space-3)] py-[var(--space-2)]">
                  <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>
                    {savedCareerIds.size > 0 ? "Everything you saved is in your Top 3. Find more in Explore." : "Nothing saved yet. Tap Save on a career in Explore and it shows up here."}
                  </p>
                  <Link href="/explore" className="dm-solid rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Explore careers</Link>
                </div>
              )}
              {addChoices.map((career) => (
                <div key={career.id} className="dm-glass flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-2)] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="relative h-[52px] w-[38px] flex-none overflow-hidden rounded-[8px]">
                    <ProfilePhoto career={career} sizes="38px" className="object-cover" />
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
            {addChoices.length > 0 && (
              // The way to a career that is not saved yet (Chandu, 7 Oct 2026:
              // "show me the saved ones and also allow me to explore other
              // careers in case I don't have the one I want saved yet").
              <div className="mt-[var(--space-4)] flex flex-wrap items-center justify-between gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
                <span className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Not saved yet?</span>
                <Link href="/explore" className="dm-tap flex min-h-[36px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[12px] text-[13.5px] font-bold" style={FROST}><Compass className="h-3.5 w-3.5" aria-hidden /> Explore careers</Link>
              </div>
            )}
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
// (pay, education, employers, schools), the same facts
// the report goes deeper on, so this reads as a preview of it, not a
// duplicate. Tapping a card's "Make this my #1" is the only way focus
// changes now; there is no separate always-visible switcher.
const BAND_ORDER: Record<string, number> = { Target: 0, Reach: 1, Safety: 2 };

/** The Top 3 card's collapsed-by-default drawer for the not-as-critical
 *  facts (employers, schools) -- keeps the three cards' visible sections
 *  aligned 1:1 while the detail stays one tap away (direct feedback). */
/** Text locked to a set number of lines, its height reserved even when it is
 *  shorter, so the three Top 3 cards line up row for row whatever each one
 *  says (3 Oct 2026, Chandu: "the top 3 cards... moving around based on the
 *  length of the first descriptions or if things wrap... Make layouts locked
 *  and consistent, if something needs to wrap, truncate with a read more
 *  action"). When the text is cut, "Read more" sits over the end of the
 *  last line and opens the full text in a small panel over the card, so
 *  reading it never changes the layout either. */
function LockedText({ text, lines, lineHeight, className = "", style, heading }: { text: string; lines: number; lineHeight: number; className?: string; style?: CSSProperties; heading: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);
  return (
    <span className="relative block min-w-0">
      {/* When cut, the end of the last line fades out under the link (a
         mask, not a painted patch, so it works on any card surface). */}
      <span ref={ref} className={`block overflow-hidden ${className}`} style={{ ...style, lineHeight: `${lineHeight}px`, height: lines * lineHeight, display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", ...(cut ? { mask: `linear-gradient(#000, #000) top / 100% ${(lines - 1) * lineHeight}px no-repeat, linear-gradient(to left, transparent 82px, #000 124px) bottom / 100% ${lineHeight}px no-repeat`, WebkitMask: `linear-gradient(#000, #000) top / 100% ${(lines - 1) * lineHeight}px no-repeat, linear-gradient(to left, transparent 82px, #000 124px) bottom / 100% ${lineHeight}px no-repeat` } : {}) }}>{text}</span>
      {cut && (
        <button type="button" onClick={() => setOpen(true)} className="dm-link absolute right-0 bottom-0 cursor-pointer text-[12.5px] font-semibold" style={{ lineHeight: `${lineHeight}px`, color: "var(--accent-subtle)" }}>
          Read more
        </button>
      )}
      {open && (
        <>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="fixed inset-0 z-[30] cursor-default" />
          <span role="dialog" aria-label={heading} className="absolute top-[-8px] right-[-8px] left-[-8px] z-[31] flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[12px] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
            <span className="flex items-center justify-between gap-[8px]">
              <span className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{heading}</span>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>
            </span>
            <span className={className} style={{ ...style, lineHeight: `${lineHeight}px` }}>{text}</span>
          </span>
        </>
      )}
    </span>
  );
}

/** A card fact whose text may run long (Education). Two lines are always
 *  reserved, plus the row for its toggle, so the three cards stay level;
 *  when the text needs more, "+ More" opens it in place (3 Oct 2026,
 *  Chandu: "reserve heights for at least 2 things in education and if
 *  there's more show an accordion or a plus more that they can expand"). */
function ExpandableFact({ text, lineHeight, className = "" }: { text: string; lineHeight: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);
  return (
    <span className="flex min-w-0 flex-col">
      <span ref={ref} className={`block ${open ? "" : "overflow-hidden"} ${className}`} style={{ lineHeight: `${lineHeight}px`, ...(open ? {} : { height: 2 * lineHeight, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }) }}>{text}</span>
      <span className="flex h-[18px] items-center">
        {(cut || open) && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="dm-link flex cursor-pointer items-center gap-[2px] text-[12px] font-semibold" style={{ color: "var(--accent-subtle)" }}>
            {open ? <><Minus className="h-3 w-3" aria-hidden /> Less</> : <><Plus className="h-3 w-3" aria-hidden /> More</>}
          </button>
        )}
      </span>
    </span>
  );
}

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

// The inline "how to rank" line (28 Sept 2026, with Match's ranking screen
// gone): testers missed that a career could be removed, and a toast at the
// screen edge gets missed too (direct feedback: "should the nudge be in line
// somehow?"). So the hint sits right above the cards it explains, draws the
// eye with the house text-sweep nudge, shows the controls' own glyphs, and
// retires itself the first time the student moves or removes a card.
const RANK_HINT_KEY = "dreamari:nudge:top3-rank";
/** null until storage is read (the nudge copy renders meanwhile, so the demo
 *  never flashes the resting copy first); `retired` is true only when the
 *  nudge ended in front of the student, which is what earns the morph. */
function useRankHint(): { show: boolean | null; retired: boolean; retire: () => void } {
  const [show, setShow] = useState<boolean | null>(null);
  const [retired, setRetired] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      // DEMO-ONLY: with DEMO_ALWAYS_SHOW_SPLASH on, the hint comes back every
      // visit like the other first-use cues; otherwise it is seen once.
      if (DEMO_ALWAYS_SHOW_SPLASH) { setShow(true); return; }
      try { setShow(!window.localStorage.getItem(RANK_HINT_KEY)); } catch { setShow(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const retire = () => {
    if (show === false) return;
    setShow(false);
    setRetired(true);
    try { window.localStorage.setItem(RANK_HINT_KEY, "1"); } catch { /* nothing to persist to */ }
  };
  return { show, retired, retire };
}

// The Top Three banner's one sentence, in two moods (direct idea, 28 Sept
// 2026: the "change these anytime" nudge lives in the Explore banner, then
// "the other copy should fade away and this copy should come take its place
// from where it sat in the sentence"). The two sentences share their key
// word: the nudge ends on "Explore", the resting line starts with it, and it
// is the banner's own button label. So the nudge words blur away, "Explore"
// glides from the end of the line to the start (a layout animation on the
// same element), and the resting words arrive after it one by one.
const NUDGE_WORDS = ["Change", "these", "anytime:", "move", "#arrows", "remove", "#x", "or", "add", "more", "from"];
const REST_WORDS = ["hundreds", "of", "careers", "and", "save", "the", "ones", "that", "interest", "you."];
// The sweep glints white over currentColor, so the nudge words sit a step
// below full white for the glint to show (same reason as Cover's label).
const NUDGE_INK = "color-mix(in srgb, var(--foreground) 76%, transparent)";
function RankBannerCopy({ nudging, retired }: { nudging: boolean; retired: boolean }) {
  const reduce = useReducedMotion();
  // "leaving": the nudge words fade in place first, then the swap.
  const [swapped, setSwapped] = useState(false);
  useEffect(() => {
    if (nudging || !retired) return;
    const timer = window.setTimeout(() => setSwapped(true), reduce ? 0 : 420);
    return () => window.clearTimeout(timer);
  }, [nudging, retired, reduce]);
  const phase: "nudge" | "leaving" | "rest" = nudging ? "nudge" : retired && !swapped ? "leaving" : "rest";
  const explore = (
    <motion.span key="explore" layout="position" transition={{ layout: { duration: reduce ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] } }} className="font-bold" style={{ color: "var(--accent-subtle)" }}>
      Explore{phase === "rest" ? "" : "."}
    </motion.span>
  );
  return (
    <span className="flex flex-wrap items-center gap-x-[0.27em]">
      {phase === "rest" ? (
        <>
          {explore}
          {REST_WORDS.map((word, index) => (
            <motion.span
              key={`r-${index}`}
              initial={retired && !reduce ? { opacity: 0, y: 4, filter: "blur(3px)" } : false}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.34, delay: 0.38 + index * 0.045 }}
            >
              {word}
            </motion.span>
          ))}
        </>
      ) : (
        <>
          {NUDGE_WORDS.map((word, index) => (
            <motion.span
              key={`n-${index}`}
              // no word sweep: the faster beam is the one shimmer while it
              // nudges (Chandu, 2 Oct 2026: "remove one of the shimmers, a
              // little too much in the first half")
              className={undefined}
              style={{ color: NUDGE_INK }}
              animate={phase === "leaving" ? { opacity: 0, y: -3, filter: "blur(3px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.3, delay: phase === "leaving" ? index * 0.012 : 0 }}
            >
              {word === "#arrows" ? (
                <><HintGlyph><ChevronUp className="h-3 w-3 lg:hidden" /><ChevronDown className="h-3 w-3 lg:hidden" /><ChevronLeft className="hidden h-3 w-3 lg:block" /><ChevronRight className="hidden h-3 w-3 lg:block" /></HintGlyph>,</>
              ) : word === "#x" ? (
                <><HintGlyph><X className="h-3 w-3" /></HintGlyph>,</>
              ) : word}
            </motion.span>
          ))}
          {explore}
        </>
      )}
    </span>
  );
}

/** A control glyph drawn the way the real control looks, for the hint line. */
function HintGlyph({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="mr-[1px] ml-[3px] inline-flex h-[20px] min-w-[20px] translate-y-[-1px] items-center justify-center gap-[1px] rounded-full border px-[3px] align-middle" style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      {children}
    </span>
  );
}

export function Top3Tab({
  top3, primaryChosen, setFocusId, chosenRoute, onAdd, onRemove, onReorder, removed, onUndo, onDismissUndo, onOpenCompare, onGoReport, showTour, onTourDone, hintPaused = false,
}: {
  top3: string[];
  focusId: string | null;
  /** false while the strongest match is only the default */
  primaryChosen: boolean;
  setFocusId: (id: string) => void;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  onAdd: () => void;
  onRemove: (id: string) => void;
  /** the new order; its first career becomes the primary */
  onReorder: (ids: string[]) => void;
  /** the career just removed, shown in its own slot with Undo */
  removed: { id: string; title: string; index: number } | null;
  onUndo: () => void;
  onDismissUndo: () => void;
  onOpenCompare: () => void;
  onGoReport: () => void;
  showTour: boolean;
  onTourDone: () => void;
  /** a popup is over the page: the hint's reading clock waits */
  hintPaused?: boolean;
}) {
  const { show: hint, retired: hintRetired, retire: retireHint } = useRankHint();
  // Not permanent, but read (28 Sept 2026: "I don't want the nudge to be
  // permanent. How can we solve but make sure it's read?"): the clock only
  // runs while the banner is fully on screen, nothing covers the page and
  // the pointer or focus isn't on it (the copy never changes mid-read). A
  // move or remove ends the nudge at once: they've got it.
  const nudging = hint !== false && top3.length > 1;
  const [holding, setHolding] = useState(false);
  const [pulse, setPulse] = useState(false);
  const pulsed = useRef(false);
  const clockOn = hint === true && top3.length > 1 && !hintPaused && !holding;
  useEffect(() => {
    const el = document.getElementById("top3-rank-row");
    if (!clockOn || !el) return;
    // 2.5s of the banner on screen (Chandu, 2 Oct 2026: 3s "was too long",
    // 1.5s "is short"; ~11 words at a normal reading pace). The clock pauses
    // when it leaves view and resumes, rather than restarting, and counts
    // while most of the banner is visible: restarting at full visibility
    // meant a small scroll reset it, so people never saw the swap to the
    // Explore line ("people will scroll a bit if it isn't fast enough").
    const HOLD = 2500;
    let timer: number | null = null;
    let shownAt = 0;
    let spent = 0;
    const pause = () => {
      if (timer === null) return;
      window.clearTimeout(timer);
      timer = null;
      spent += performance.now() - shownAt;
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && document.visibilityState === "visible") {
        // one pulse, the first time the student can actually see it
        if (!pulsed.current) { pulsed.current = true; setPulse(true); window.setTimeout(() => setPulse(false), 2600); }
        if (timer === null) { shownAt = performance.now(); timer = window.setTimeout(retireHint, Math.max(0, HOLD - spent)); }
      } else pause();
    }, { threshold: 0.6, rootMargin: "-88px 0px -80px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); if (timer !== null) window.clearTimeout(timer); };
    // retireHint is stable in behaviour; re-running on its identity would restart the clock every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockOn]);
  const [moved, setMoved] = useState<string | null>(null);
  // Two ways to read the cards (6 Oct 2026, after the production profile's
  // Simple / Detailed): Simple is the poster, the name, one line and a
  // Show more; Detailed is the full card with the facts out. Remembered.
  // Simple is the only card now (Chandu, 7 Oct 2026: "remove the simplified
  // / detailed toggle"); the Detailed branch stays in the code for the
  // Compare sheet's table, not as a card style the student can pick.
  const [view] = useState<"simple" | "detailed">("simple");
  // The deck (phones, tablets) and the row (lg up) are the same cards, so
  // only one renders at a time: duplicate card ids would break the
  // scroll-to-card anchors and the tour's anchor.
  const [wide, setWide] = useState(true);
  // Tablets fan the deck wider so the stack uses the box's width (Chandu, 7
  // Oct 2026: "fan them out even more on tablet, let it use the width of
  // its containing box as much as possible with proper margins").
  const [tablet, setTablet] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const t = window.matchMedia("(min-width: 640px)");
    const sync = () => { setWide(m.matches); setTablet(t.matches); };
    sync();
    m.addEventListener("change", sync);
    t.addEventListener("change", sync);
    return () => { m.removeEventListener("change", sync); t.removeEventListener("change", sync); };
  }, []);
  // Career Peek: the card opens into the whole career without leaving Profile.
  const [peek, setPeek] = useState<number | null>(null);
  // the Top 3 sheet at every width: full height on phones and tablets, with
  // its own Top 3 actions (8 Oct 2026, Chandu: "for the top 3 cards pop ups
  // this will have different CTAs and it can follow the CTA placement of the
  // top 3 cards popups")
  const openPeek = (i: number) => setPeek(i);
  const tourCareerId = top3[1] ?? top3[0];
  // The Undo slot belongs to this visit of the tab only.
  const dismissRef = useRef(onDismissUndo);
  useEffect(() => { dismissRef.current = onDismissUndo; });
  useEffect(() => () => dismissRef.current(), []);

  const move = (id: string, delta: -1 | 1) => {
    const from = top3.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= top3.length) return;
    const next = [...top3];
    [next[from], next[to]] = [next[to], next[from]];
    onReorder(next);
    retireHint();
    if (showTour) onTourDone();
    setMoved(id);
    window.setTimeout(() => setMoved((current) => (current === id ? null : current)), 900);
    const title = careerById(id)?.title ?? "Career";
    announce(to === 0 ? `${title} is now your number 1. Report and Plan follow it.` : `${title} moved to number ${to + 1}.`);
    // Stacked on phones and tablets, a card moving down can leave the
    // screen; bring it back into view once the slide has started.
    window.setTimeout(() => document.getElementById(`top3-card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  };
  const remove = (id: string) => {
    retireHint();
    if (showTour) onTourDone();
    onRemove(id);
  };

  // The freed slot, where the removed card was: its name, Undo, and Add.
  const undoSlot = removed && (
    <motion.div
      key={`removed-${removed.id}`}
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      role="status"
      className="flex min-h-[140px] w-full flex-col items-center justify-center gap-[var(--space-3)] self-stretch rounded-[var(--radius-lg)] border-2 border-dashed p-[var(--space-5)] text-center backdrop-blur-[20px]"
      style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
    >
      <p className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span style={{ color: "var(--foreground)" }}>{removed.title}</span> went back to Saved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-[var(--space-2)]">
        <button type="button" onClick={onUndo} className="dm-solid flex min-h-[40px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Undo</button>
        <button type="button" onClick={onAdd} className="dm-tap flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold" style={FROST}>
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add a career
        </button>
      </div>
    </motion.div>
  );

  if (top3.length === 0) {
    if (undoSlot) return <div className="flex flex-col">{undoSlot}</div>;
    return (
      <section className="flex flex-col items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={INSET}>
        <p className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Nothing saved yet</p>
        <p className="max-w-[42ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Add up to 3 careers, then pick one to start with.</p>
        <button type="button" onClick={onAdd} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Add a career</button>
      </section>
    );
  }

  // Always three columns and three slots (Chandu, 1 Oct 2026: "make sure it
  // shows 3 slots, even when there's only one selected"): the empty ones are
  // the promise of the feature, not dead space.
  const showHint = nudging;

  // One Top 3 card, used by the desktop row and by the phone/tablet deck.
  const buildCard = (id: string, index: number) => {
        const career = careerById(id)!;
        const report = reportV2(id);
        const route = chosenRoute(career);
        const isFocus = index === 0;
        const sim = simulationFor(id);
        const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
        const schools = report ? [...report.colleges].sort((a, b) => (BAND_ORDER[a.status] ?? 9) - (BAND_ORDER[b.status] ?? 9)).slice(0, 3).map((c) => c.name) : [];
        // Split by criticality (direct feedback): the decision facts stay on
        // the card; employers + schools fold into a collapsed-by-default
        // accordion below them. Years in school left the card (Joshua, 4 Oct
        // 2026: save height; Education already implies it and Compare still
        // shows years side by side).
        const facts = [
          // Careers without a report yet (any Match career, 28 Sept 2026) fall
          // back to their Career Detail facts carried on the route.
          { label: "Estimated pay", value: report?.salary.median ?? (route.salary && route.salary !== "See Career Detail" ? route.salary : "Coming soon"), lines: 1 },
          { label: "Education", value: report?.education.find((r) => r.common)?.name ?? (route.program && route.program !== "See Career Detail" ? route.program : "Coming soon"), lines: 2 },
        ];
        const moreFacts = [
          { label: "Typical employers", value: report ? report.glance.employers.slice(0, 3).join(" · ") : "Coming soon" },
          { label: "Suggested schools", value: schools.length ? schools.join(" · ") : "Coming soon" },
        ];
        const card = (
          <motion.div
            key={id}
            id={`top3-card-${id}`}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
            transition={{ layout: { type: "spring", stiffness: 380, damping: 34 }, duration: 0.22 }}
            className={`group/card relative flex h-full flex-col rounded-[var(--radius-lg)] border ${moved === id ? "dm-rank-flash" : ""}`}
            style={{
              ["--rank-accent" as string]: accent,
              // the world glow dreamonna's cards carry (7 Oct 2026)
              boxShadow: view === "simple" ? `0 30px 80px -40px color-mix(in srgb, ${accent} 40%, transparent)` : undefined,
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
            {/* The original 16:10 photo in both layouts (3 Oct 2026, Chandu:
               "revert to the original sizes of the images in top 3 cards, it's
               okay if it's long"). The 2:1 crop and then the 112px band of
               2 Oct are undone; arriving from Match scrolls the cards into
               view instead (dismissWelcome). */}
            <div className={`t3s-frame relative w-full flex-none overflow-hidden ${view === "simple" ? "aspect-[4/5] rounded-[inherit]" : "aspect-[16/10] rounded-t-[inherit]"}`}>
              {/* Per-photo focal point for this 16:10 window
                 (top3PhotoFocus.ts): each poster's subject sits at a
                 different height, so one shared crop cut some heads off and
                 hid others under too much body (Joshua, 4 Oct 2026). Every
                 face now sits in the top half of the card. */}
              <ProfilePhoto career={career} sizes="(min-width: 1024px) 360px, 100vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover/card:scale-[1.04]" style={{ objectPosition: view === "simple" ? "50% 20%" : top3PhotoFocus(career) }} />
              {/* The photo opens the Career Peek (6 Oct 2026): everything about
                 this career on one sheet, the other two a key press away. */}
              <button type="button" onClick={() => openPeek(index)} aria-label={`See everything about ${career.title}`} className="absolute inset-0 z-[2] cursor-pointer" />
              {/* Rank, on the photo's top-left: the number is the control.
                 Up/down while cards stack (phones, tablets), left/right
                 once they sit side by side (lg), so an arrow always points
                 where the card will go. Both arrows always render (dimmed
                 at the ends) so every card's pill is the same width and
                 keyboard focus never lands on a vanished button. #1 wears
                 the star: the career the Report and Plan follow. */}
              <div className="absolute top-[8px] left-[8px] z-[3]">
                <Coachmark
                  active={showTour && id === tourCareerId}
                  anchorId={id === tourCareerId ? "profile-tour-top3" : undefined}
                  label={top3.length === 1 ? "Your #1 career. Add up to 3, and remove one anytime with the X." : "Use the arrows to change your order. Your #1 leads your Report and Plan."}
                  onDismiss={onTourDone}
                  spotlight
                  side="bottom"
                  align="start"
                >
                  <div
                    className="flex h-[36px] items-center rounded-full border"
                    style={{ background: "rgba(5,8,20,0.62)", borderColor: isFocus ? `color-mix(in srgb, ${accent} 60%, rgba(255,255,255,0.4))` : "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
                  >
                    {top3.length > 1 && (
                      <IconTip label={index === 0 ? "Already #1" : `Move to #${index}`}>
                        <button
                          type="button"
                          aria-label={index === 0 ? `${career.title} is #1` : `Move ${career.title} to #${index}`}
                          disabled={index === 0}
                          onClick={() => move(id, -1)}
                          className={`dm-quiet flex size-[34px] flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30 ${showHint && index === 1 ? "dm-slot-pulse-faint" : ""}`}
                          style={{ color: "#fff" }}
                        >
                          <ChevronUp className="h-4 w-4 lg:hidden" aria-hidden />
                          <ChevronLeft className="hidden h-4 w-4 lg:block" aria-hidden />
                        </button>
                      </IconTip>
                    )}
                    <span
                      role="img"
                      aria-label={isFocus ? (primaryChosen ? `#1, my primary career` : `#1, your strongest match`) : `#${index + 1}`}
                      className={`flex items-center gap-[4px] text-[14px] font-extrabold tabular-nums ${top3.length > 1 ? "px-[2px]" : "px-[12px]"}`}
                      style={{ color: isFocus ? accent : "#fff", fontFamily: "var(--font-display)" }}
                    >
                      {isFocus && <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden />}
                      <motion.span key={index} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>#{index + 1}</motion.span>
                    </span>
                    {top3.length > 1 && (
                      <IconTip label={index === top3.length - 1 ? `Already #${index + 1}` : `Move to #${index + 2}`}>
                        <button
                          type="button"
                          aria-label={index === top3.length - 1 ? `${career.title} is last` : `Move ${career.title} to #${index + 2}`}
                          disabled={index === top3.length - 1}
                          onClick={() => move(id, 1)}
                          className="dm-quiet flex size-[34px] flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30"
                          style={{ color: "#fff" }}
                        >
                          <ChevronDown className="h-4 w-4 lg:hidden" aria-hidden />
                          <ChevronRight className="hidden h-4 w-4 lg:block" aria-hidden />
                        </button>
                      </IconTip>
                    )}
                  </div>
                </Coachmark>
              </div>
              {/* Remove, in plain sight on the photo's other corner (testers
                 missed it inside the old ... menu). No confirm: it goes back
                 to Saved and its slot offers Undo in place. */}
              <div className="absolute top-[8px] right-[8px] z-[3]">
                <IconTip label="Remove from Top 3">
                  <button
                    type="button"
                    aria-label={`Remove ${career.title} from Top 3`}
                    onClick={() => remove(id)}
                    className="dm-quiet flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full border"
                    style={{ background: "rgba(5,8,20,0.62)", borderColor: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#fff" }}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </IconTip>
              </div>

              {view === "simple" && (
                // 7 Oct 2026: dreamonna's Simple card, read pixel by pixel in
                // the browser (Chandu: "dreamonna has way less copy on the top
                // 3 cards before the show more... please do that"). Before
                // Show more: the world, the name, one line. Show more opens
                // Education, Estimated pay, Typical employers and Suggested
                // schools, and the photo darkens behind them. The more-block
                // opens ABOVE the toggle row, so Show less lands exactly where
                // Show more was ("keep the show less CTA in place somehow so I
                // don't have to move my mouse"). Styles: .t3s-* in app.css.
                <>
                  <span aria-hidden className="t3s-shade" style={{ ["--t3s-world" as string]: accent }} />
                  <div className="t3s-text pointer-events-none" style={{ ["--t3s-world" as string]: accent }}>
                    {isFocus && <span className="t3s-primary"><Star className="h-3 w-3" fill="currentColor" aria-hidden /> {primaryChosen ? "My primary" : "Strongest match"}</span>}
                    <span className="t3s-world">{career.world}</span>
                    <button type="button" onClick={() => openPeek(index)} className="t3s-title pointer-events-auto" style={{ ...posterTitleFont(career.world), textShadow: "0 2px 18px rgba(0,0,0,0.5)" }}>{career.title}</button>
                    <p className="t3s-line">{report?.glance.simple ?? careerProfile(id)?.summary ?? ""}</p>
                    {/* 7 Oct 2026, for the deck's narrower card (Chandu: "the
                       show more can directly open the modal view... maybe the
                       play button doesn't need a label or report doesn't"):
                       Show more opens the Peek, Play keeps its word, Report is
                       its icon with a tooltip. Three things, one line, room. */}
                    <div className="t3s-actions pointer-events-auto">
                      <button type="button" onClick={() => openPeek(index)} className="t3s-toggle" aria-label={`Show more about ${career.title}`}>
                        Show more <ChevronRight className="h-4 w-4" aria-hidden />
                      </button>
                      <Link href={sim ? `/play/${sim.id}` : `/play?focus=${id}`} aria-label={`Play ${career.title}`} className="t3s-play dm-solid"><Play className="h-[12px] w-[12px]" fill="currentColor" aria-hidden /> Play</Link>
                      <IconTip label="Career Report">
                        <button type="button" onClick={() => { setFocusId(id); onGoReport(); }} aria-label={`Career Report for ${career.title}`} className="t3s-report">
                          <FileText className="h-[15px] w-[15px]" aria-hidden />
                          {/* the word, when the card has room (Chandu, 8 Oct
                             2026: "say Report instead of just the icon AS LONG
                             AS THERE IS SPACE AND NOTHING OVERLAPS") */}
                          <span className="t3s-report-label">Report</span>
                        </button>
                      </IconTip>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* The accent glow lives in its own clipped layer: the card itself
               stays overflow-visible (the kebab menu must escape it), so the
               blob is clipped here to the card's radius instead of bleeding
               past the border. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <span className="absolute right-[-40px] bottom-[-40px] h-[140px] w-[140px] rounded-full blur-[38px]" style={{ background: `color-mix(in srgb, ${accent} 38%, transparent)` }} />
            </span>

            {/* v2: a shorter card (Chandu, 2 Oct 2026: "decrease the height
               of the image header, make the cards shorter, fonts smaller if
               needed, as long as it's legible and accessible"). Body text
               stays at 13px or more, labels at 11px, and every button at
               36px or taller, above WCAG 2.2's 24px target minimum. */}
            {view === "detailed" && (
            <div className={`relative flex flex-1 flex-col gap-[6px] p-[12px]`}>
              {/* Tight rhythm throughout (direct feedback, 11 Sept 2026: the
                 cards were getting long, and a reserved title height left a
                 hole under one-line titles). Everything clamps rather than
                 reserves height. */}
              <span className="flex min-w-0 flex-col gap-[1px]">
                {/* World name carries the accent, never the career title. */}
                <span className="truncate text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: accent }}>{career.world}</span>
                <LockedText heading={career.world} text={career.title} lines={2} lineHeight={22} className={`font-extrabold text-[17px] sm:text-[18px]`} style={{ fontFamily: "var(--font-display)" }} />
              </span>
              <div className="mt-[2px]">
                <LockedText heading={career.title} text={report?.glance.simple ?? careerProfile(id)?.summary ?? "Report details coming soon for this one."} lines={2} lineHeight={18} className={`font-medium text-[13px]`} style={{ color: "var(--muted-foreground)" }} />
              </div>
              {/* The card answers one question (Joshua, 11 Sept 2026): test
                 this career, or learn more about it? Play and Learn more side
                 by side, above the fold. Play is in the Play cards' own badge
                 language (disc + glyph); a career without its own game goes
                 to the Play tab, focused on it, and says Play like the rest
                 (Joshua: never "coming soon" in a demo). Learn more opens this
                 career's page, the diagonal arrow for leaving the profile. */}
              {/* ▶ Play, the one action on the card (3 Oct 2026). Simulations
                 say Play with the play triangle everywhere, as Home and the
                 Play tab already did (Chandu: "playing the simulations should
                 always have the same CTA, the same icon too"). Career Report
                 left the card: the Report tab sits in the same strip with its
                 own switcher between the three careers ("we have the career
                 report tab anyway right?"). Learn more stays at the foot. */}
              <Link
                href={sim ? `/play/${sim.id}` : `/play?focus=${id}`}
                aria-label={`Play ${career.title}`}
                className="dm-solid mt-[var(--space-1)] flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[14px] text-[14px] font-semibold whitespace-nowrap"
                style={{ background: "color-mix(in srgb, var(--primary) 32%, rgba(12,16,35,0.6))", borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)", color: "#fff" }}
              >
                <Play className="h-[14px] w-[14px] flex-none" fill="currentColor" aria-hidden /> Play
              </Link>


              {/* Pay, then Education directly under it, stacked in both
                 layouts: v2 keeps its five tabs but takes v1's card flow
                 (Joshua, 4 Oct 2026). The v2 two-column grid split the two
                 facts side by side, which squeezed Education's two lines. */}
              <dl className={`flex flex-col gap-[8px] pt-[2px]`}>
                {facts.map((fact) => (
                  <div key={fact.label} className="flex min-w-0 flex-col gap-[1px]">
                    <dt className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{fact.label}</dt>
                    {/* Read more is for the description only (3 Oct 2026: "the
                       read more stuff is designed weird, do that only for the
                       descriptions"): one-line facts cut with an ellipsis,
                       Education reserves two lines and expands. */}
                    <dd className={`font-semibold text-[13px] leading-[17px]`}>
                      {fact.lines > 1
                        ? <ExpandableFact text={fact.value} lineHeight={17} />
                        : <span className="block truncate">{fact.value}</span>}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* mt-auto on this whole group (not just the button below):
                 the description/facts above it clamp to different heights
                 per card ("Coming soon" vs a real report), so anchoring
                 only the button left the accordion floating at a different
                 height on every card -- pushing accordion+button down
                 together keeps the accordion's own position consistent
                 across all three cards instead of jumping around with
                 whatever content gap happens to be above it (direct
                 feedback, 23 Sept 2026: "anchor the employers and school
                 accordion to the bottom consistently"). */}
              <div className="mt-auto flex flex-col gap-[var(--space-1)] pt-[var(--space-1)]">
                <MoreFactsAccordion facts={moreFacts} />

                {/* Learn more apart at the foot; no rules anywhere in the card
                   (direct feedback, 11 Sept 2026). */}
                <Link href={`/career/${id}`} aria-label={`Learn more about ${career.title}`} className="dm-tap flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-[3px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-bold" style={FROST}>
                  Learn more <ArrowUpRight className="h-3.5 w-3.5 flex-none" aria-hidden />
                </Link>
              </div>
            </div>
            )}
          </motion.div>
        );
        // The Undo slot sits where the removed card was, not at the end.
        return card;
  };

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* One banner, two moods. While nudging: the "change these anytime"
         sentence, a faster brighter beam, the wash and a pulsing Explore
         button, and one soft pulse ring when it first comes into view.
         Once read: the sentence morphs into the resting Explore line and
         the banner settles to the calm, slow beam it always had (same
         treatment as "Do this next", direct feedback 11 Sept 2026). */}
      <div onPointerEnter={() => setHolding(true)} onPointerLeave={() => setHolding(false)} onFocus={() => setHolding(true)} onBlur={() => setHolding(false)}>
        <NextStepBanner
          text={nudging ? "Change these anytime: move, remove, or add more from Explore." : "Explore hundreds of careers and save the ones that interest you."}
          content={<RankBannerCopy nudging={nudging} retired={hintRetired} />}
          ctaLabel="Explore"
          href="/explore"
          Icon={Compass}
          emphasis="priority"
          calm={!nudging}
          // slower ring at rest (direct feedback, 11 Sept 2026: "reduce speed and shimmer")
          beamDuration={nudging ? 2.4 : 5}
          // The button waits for the resting line (direct idea, 28 Sept
          // 2026: "maybe the explore cta only appears after the first
          // transition"): the nudge is about the cards, so nothing competes
          // with it; the button arrives once "Explore" has led the new line.
          ctaHidden={nudging}
          sizeTo="Explore hundreds of careers and save the ones that interest you."
          ctaDelayMs={hintRetired ? 1100 : 0}
          wrapperId="top3-rank-row"
          wrapperClassName={pulse ? "dm-banner-pulse" : ""}
          // demo: comes back every visit; remembered once the demo flag is off
          storageKey={DEMO_ALWAYS_SHOW_SPLASH ? undefined : "dreamari:top3-keep-exploring-dismissed"}
        />
      </div>

      {/* Side by side from md: up (stacked on phones only, where three columns
         would be unreadable), info running vertically inside each column --
         side-by-side comparison per direct feedback ("much easier and
         faster to skim, analyze and process"). Each card carries its own
         career-world accent (border tint + ambient glow + labels) so the
         three read as three different Career Worlds -- accent as glow and
         tint per the design language, never a solid color block. Copy is
         unchanged from the stacked version. */}
      {/* Custom-designed edge case, 22 Sept 2026: Top 3 has a max of 3 but
         no minimum -- a fixed md:grid-cols-3 left a lopsided 1/3 or 2/3
         empty row for a student who's only saved 1 or 2 so far. Same
         dead-space-grid class already fixed for Match's deck and Career
         Detail's facts strip; column count now matches the real count.
         Corrected same day: the count has to include the "Add a career"
         tile below (rendered whenever top3.length < 3), not just the real
         cards -- the first version keyed columns off top3.length alone, so
         at 2 selected the grid was forced to 2 columns while 3 things
         (2 cards + Add) actually rendered, and the Add tile wrapped to its
         own row below instead of sitting beside them as an equal-height
         third column (direct report + screenshot).
         27 Sept 2026: columns start at lg, not md. At tablet widths three
         cards were crushed (truncated "Learn more", cramped copy; direct
         report: "the 3 stacked horizontally is just causing problems"), so
         tablets now stack one card per row at full width. */}
      {/* 7 Oct 2026 (Chandu: "top 3 cards horizontally arranged on tablet and
         phones too... no stacking so I have to scroll so much", then "TRY A
         STACKED DECK for mobile and tablet, like we did for the mobile play
         carousel"): from lg up the three sit in a row; below that they are
         the Play tab's swipeable CardDeck, the front card full width (capped
         at 420px on tablets) with the other two fanned behind it. */}
      {!wide && (
      <div>
        <div className="mx-auto w-full sm:max-w-[680px]">
          <CardDeck items={top3.map((id) => ({ id }))} focusId={top3[0]} className="" aspect="4 / 5" stepX={tablet ? 104 : 18} stepScale={tablet ? 0.05 : 0.05} depthBlur={1.4} renderCard={(item, front) => <div className={`h-full w-full ${front ? "" : "t3s-back"}`}>{buildCard(item.id, top3.indexOf(item.id))}</div>} />
        </div>
        {undoSlot && <div className="mt-[var(--space-3)]">{undoSlot}</div>}
        {top3.length < 3 && (
          <button type="button" onClick={onAdd} className="dm-tap dm-glass mt-[var(--space-3)] flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border text-[15px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <Plus className="h-4 w-4" style={{ color: "var(--accent-subtle)" }} aria-hidden /> Add a career
          </button>
        )}
      </div>
      )}
      {wide && (
      <div className={`grid items-stretch ${view === "simple" ? "grid-cols-3 gap-[var(--space-4)]" : "grid-cols-1 gap-[var(--space-4)] md:grid-cols-3"}`}>
      {/* Position is rank: #1 is the primary career (Joshua, 11 Sept 2026:
         the primary takes the first card), and the arrows on each photo
         move a card one place, sliding the others to make room. */}
      <AnimatePresence initial={false} mode="popLayout">
      {top3.flatMap((id, index) => {
        const card = buildCard(id, index);
        return undoSlot && removed && removed.index === index ? [undoSlot, card] : [card];
      })}
      {undoSlot && removed && removed.index >= top3.length && undoSlot}

      {Array.from({ length: Math.max(0, 3 - top3.length - (undoSlot ? 1 : 0)) }, (_, i) => (
        <motion.button
          key={`add-career-${i}`}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          type="button"
          onClick={onAdd}
          className="dm-tap dm-glass flex min-h-[120px] w-full cursor-pointer items-center justify-center gap-[var(--space-2)] self-stretch rounded-[var(--radius-lg)] border-2 border-dashed backdrop-blur-[20px] backdrop-saturate-[1.5]"
          style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
        >
          <span className="flex size-8 items-center justify-center rounded-full" style={{ background: "var(--glass-surface-3)" }}>
            <Plus className="h-4 w-4" style={{ color: "var(--accent-subtle)" }} />
          </span>
          <span className="text-[15px] font-bold">{i === 0 ? "Add a career" : "Open slot"}</span>
        </motion.button>
      ))}
      </AnimatePresence>
      </div>
      )}

      {/* Compare, centred under the three cards: comparing is what comes
         after reading them, and here it no longer holds a row open above
         the grid. A real button, since it stands on its own. */}
      {/* Compare centred, the Simple / Detailed switch at the right: one
         quiet row under the cards. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <span />
        {top3.length > 1 ? (
          <button type="button" onClick={onOpenCompare} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[8px] text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> Compare all {top3.length}
          </button>
        ) : <span />}
        <span />
      </div>

      <AnimatePresence>
        {peek !== null && top3[peek] && (
          <CareerPeek key="peek" variant="top3" ids={top3} index={peek} onIndex={setPeek} onClose={() => setPeek(null)} onReport={(id) => { setFocusId(id); setPeek(null); onGoReport(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Compare my Top 3 ----
// Lives beside My Top 3, not inside the report: a report is one career's
// document, and stacking three of them in it made it read as a bundle.

function CompareSheet({ careers, focusId, onClose }: { careers: ProfileCareer[]; focusId: string; onClose: () => void }) {
  // Highlights first (6 Oct 2026): one story per slide (pay, growth, what
  // each asks, where each leads, the work, what is the same); Original is
  // the thirteen-row table for the student who wants every cell.
  const [mode, setMode] = useState<"highlights" | "original">("highlights");
  // Every Top 3 career gets a column. A career with a written report shows
  // all twelve rows; one without shows what its card already knows (what it
  // is, pay, education, years in school, from its route) and says so for the rest.
  const entries = careers.map((career) => {
    const report = reportV2(career.id);
    if (report) return { career, cells: cellsFromReport(report.comparison) };
    const route = career.routes[0];
    const known = (v: string | undefined) => (v && v !== "See Career Detail" ? v : NOT_IN_REPORT);
    return {
      career,
      cells: {
        work: careerProfile(career.id)?.summary ?? NOT_IN_REPORT, setting: NOT_IN_REPORT,
        education: known(route?.program), timeToEnter: known(route?.duration), cost: NOT_IN_REPORT,
        salaryRange: known(route?.salary), outlook: NOT_IN_REPORT, majors: NOT_IN_REPORT, tradeoff: NOT_IN_REPORT,
        whySaved: NOT_IN_REPORT, evidence: NOT_IN_REPORT, investigate: NOT_IN_REPORT,
      },
    };
  });
  return (
    <div className="no-print fixed inset-0 z-[120] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="compare-sheet-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(28px)" }} />
      <div className="relative mx-auto flex max-h-[calc(92dvh/var(--vz,1))] w-full max-w-[1000px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:my-auto sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)] border-b px-5 py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Side by side</span>
            <h3 id="compare-sheet-title" className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>My top {entries.length}</h3>
          </span>
          <span className="flex items-center gap-[8px]">
            <div role="radiogroup" aria-label="Compare as" className="flex rounded-full p-[3px]" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
              {([["highlights", "Highlights"], ["original", "Detailed"]] as const).map(([k, label]) => (
                <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => setMode(k)} className="dm-quiet h-[30px] cursor-pointer rounded-full px-[12px] text-[12.5px] font-bold" style={mode === k ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>{label}</button>
              ))}
            </div>
            <IconTip label="Close">
            <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label="Close comparison">
              <X className="h-5 w-5" aria-hidden />
            </button>
            </IconTip>
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="dm-report dm-scroll min-h-0 flex-1 overflow-y-auto px-5 py-[var(--space-5)]">
            {entries.length > 1 && mode === "highlights" ? (
              <CompareHighlights careers={careers} focusId={focusId} />
            ) : entries.length > 1 ? (
              <ComparisonTable entries={entries} focusId={focusId} />
            ) : (
              <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>Save at least two careers to your Top 3 and they will line up here.</p>
            )}
          </div>
          <ScrollEdges top={20} bottom={56} />
        </div>
      </div>
    </div>
  );
}

// ---- Overview: who I am, where I am, what is next ----
// Deliberately thin. Its job is orientation in about five seconds, then it
// hands off. Streaks and totals live at the bottom, not in the identity.

// Custom-designed edge case, 22 Sept 2026: shared between OverviewTab (v1)
// and OverviewTabV2 -- v1 already had this for a genuinely new/zero-Top3
// student; v2 used to just `return null` for the identical condition,
// rendering a silently blank tab body instead of guidance. The v1/v2
// toggle is a real, always-visible control (not demo-gated), so any
// student who empties their Top 3 while on v2 hit this.
// Custom-designed edge case, 22 Sept 2026: none of Profile's own career
// photo call sites (Top3's card hero, the Add-to-Top3 sheet's thumbnail,
// Locker's poster grid) had `onError` handling -- a distinct gap from the
// app-wide `PosterCard`/`PosterPhoto` fix (Explore, 22 Sept), since
// PosterCard is never actually imported into this file. Same shared
// world-tinted-gradient-plus-muted-`ImageOff` pattern as everywhere else
// this session.
export function ProfilePhoto({ career, sizes, className, style }: { career: ProfileCareer; sizes: string; className: string; style?: CSSProperties }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    const worldColor = WORLD_COLORS[career.world] ?? "var(--muted-foreground)";
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center ${className}`}
        style={{ background: `linear-gradient(155deg, color-mix(in srgb, ${worldColor} 30%, var(--card)) 0%, var(--card) 100%)` }}
      >
        <ImageOff className="h-5 w-5" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </div>
    );
  }
  // face-aware in any card shape (8 Oct 2026); the given position is the
  // fallback for photos without face data
  return <FacePhoto src={career.photo} sizes={sizes} className={className} style={style} fallback={(style?.objectPosition as string | undefined) ?? "50% 25%"} onError={() => setFailed(true)} />;
}

function StudentAvatarImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className="flex size-[72px] flex-none items-center justify-center rounded-full border-2"
        style={{ borderColor: "rgba(255,255,255,0.9)", background: "color-mix(in srgb, var(--color-brand-500) 20%, var(--card))" }}
      >
        <UserRound className="h-8 w-8" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={144}
      height={144}
      className="size-[72px] flex-none rounded-full border-2 object-cover"
      style={{ borderColor: "rgba(255,255,255,0.9)" }}
      onError={() => setFailed(true)}
    />
  );
}

function NothingSavedYet({ onGoLocker }: { onGoLocker: () => void }) {
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

// ---- Overview dashboard: a real dashboard, not three doorways ----
// Replaced the original bento (a caption + one number, each tile just a
// link to a tab that's already in the tab strip right below it, direct
// feedback 20 Sept) with a real graphic treatment -- gradient-filled marks
// throughout (RingStat, GradientPips), the same technique, not a chart per
// tile. No career-match bar chart here on purpose (direct feedback, 20
// Sept: cut) -- "3 of 3 chosen" is the real metric for Top Three, drawn as
// a mark instead of printed as a sentence. The v1/v2 toggle this shipped
// behind is gone (v2 approved app-wide, 22 Sept 2026) -- this is the only
// Overview now.

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

export function OverviewTabV2({
  focus, top3Careers, onGoTop3, onGoPlan, onGoReport, onGoResume, onGoLocker, seasonOverride, tourStep, onTourNext,
}: {
  focus: ProfileCareer | null;
  top3Careers: ProfileCareer[];
  onGoTop3: () => void;
  onGoPlan: () => void;
  onGoReport: () => void;
  onGoResume: () => void;
  onGoLocker: () => void;
  seasonOverride: "fall" | "winter" | "spring" | null;
  tourStep: "plan" | "report" | "resume" | "top3" | null;
  onTourNext: () => void;
}) {
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const stage = useStage();
  // Custom-designed edge case, 22 Sept 2026: used to `return null` here --
  // a silently blank tab body for a genuinely new/zero-Top3 student, while
  // v1 (OverviewTab) already had a real empty state for the identical
  // condition. See NothingSavedYet's own comment for why this matters.
  if (!focus) return <NothingSavedYet onGoLocker={onGoLocker} />;
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
                <span className="text-[13.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>chosen (up to 3)</span>
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
                    Add more (optional)
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
        <Coachmark active={tourStep === "plan"} anchorId="profile-tour-plan" wrapperClassName="relative block min-w-0" label="My Plan gives you steps for each school term, in the app and beyond, for your #1 career. You can change #1 anytime." onDismiss={onTourNext} cta="Next" spotlight side="bottom">
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
        </Coachmark>
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
        <Coachmark active={tourStep === "report"} anchorId="profile-tour-report" wrapperClassName="relative flex min-w-0 flex-1" label="Your Career Report is made from what you explore and choose here. Share it with your counselor." onDismiss={onTourNext} cta="Next" spotlight side="bottom">
        <button type="button" onClick={onGoReport} className="dm-tap group relative flex flex-1 min-w-0 cursor-pointer items-center justify-between gap-[var(--space-3)] p-[var(--space-4)] text-left sm:p-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex min-w-0 items-center gap-[var(--space-3)]">
            <span className="flex size-[36px] flex-none items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-[1.08]" style={{ background: "color-mix(in srgb, var(--accent-subtle) 16%, transparent)" }}>
              <BadgeCheck className="h-4 w-4" aria-hidden style={{ color: "var(--accent-subtle)" }} />
            </span>
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Career Report</span>
              <span className="flex items-baseline gap-[6px]">
                <span className="text-[22px] leading-[26px] font-extrabold tabular-nums transition-colors duration-150 group-hover:text-[var(--accent-subtle)]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{top3Careers.length}</span>
                <span className="text-[13.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>career report{top3Careers.length === 1 ? "" : "s"} ready</span>
              </span>
            </span>
          </span>
          <DashHoverChevron />
        </button>
        </Coachmark>

        {/* Resume: dropped the version count entirely (direct feedback, 21
           Sept 2026: "simplify to Not started or Start your resume") --
           complete-or-not is the only fact this tile needs to give in a
           snapshot; how many versions exist is real detail for the Resume
           tab itself, not the Overview. */}
        <Coachmark active={tourStep === "resume"} anchorId="profile-tour-resume" wrapperClassName="relative flex min-w-0 flex-1" label="Build a resume from your skills and experiences. Update it as you grow." onDismiss={onTourNext} cta="Next" spotlight side="bottom">
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
        </Coachmark>
      </div>
    </div>
  );
}

/** QA-only: cycles Auto (real date) -> Fall -> Winter -> Spring -> Auto,
 *  one click at a time -- lets the season art on the Plan tile be checked
 *  without waiting for the calendar to actually reach each window. */
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
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 76%, transparent)", backdropFilter: "blur(28px)" }} />
      <div className="dm-scroll relative flex w-full max-w-[560px] flex-col gap-[var(--space-4)] overflow-y-auto border-l p-5 pb-[calc(env(safe-area-inset-bottom)+var(--space-6))] pt-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <span className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Evidence</span>
          <h3 id="evidence-intro" className="text-[18px] leading-[22px] font-extrabold sm:text-[21px] sm:leading-[26px]" style={{ fontFamily: "var(--font-display)" }}>What your report is built from</h3>
          <span className="max-w-[54ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
            Only things you chose, did or wrote. If something here is wrong, fix it and the report changes with it.
          </span>
        </span>
        <IconTip label="Close">
        <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label="Close evidence">
          <X className="h-5 w-5" aria-hidden />
        </button>
        </IconTip>
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

export function RoutesTab({
  focus, chosenRoute, setRouteChoice, savedMajors, onToggleMajor, onGoPlan, onGoTop3,
}: {
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  setRouteChoice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savedMajors: Set<string>;
  onToggleMajor: (name: string) => void;
  onGoPlan: () => void;
  /** Surface 21's empty tier 2 CTA: back to Top 3 to choose a focus career. */
  onGoTop3?: () => void;
}) {
  // Surface 21: this used to `return null` with no focus career, a silently
  // blank tab body -- a real empty tier 2 instead (27 Sept 2026, states pass).
  if (!focus) {
    return <EmptyView tier={2} heading="No routes yet" line="Pick a focus career and its routes show up here." cta="Choose a focus" onAction={onGoTop3} />;
  }
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

export function RouteRow({ route, selected, onOpen, onSelect }: {
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
      className="dm-tap group relative flex w-[calc(74vw/var(--vz,1))] max-w-[280px] flex-none snap-start flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:w-auto sm:max-w-none"
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
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(28px)" }} />
      <div className="relative flex max-h-[calc(92dvh/var(--vz,1))] w-full max-w-[920px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <IconTip label="Close" className="absolute top-[10px] right-[10px] z-10">
        <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] cursor-pointer items-center justify-center rounded-full" aria-label="Close details">
          <X className="h-5 w-5" aria-hidden />
        </button>
        </IconTip>
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
  // Compare is a view the student stepped into from the paths (8 Oct 2026,
  // one step back): browser Back returns to the paths, like "Back to paths".
  useBackStep(routeView === "compare", () => setRouteView("cards"));

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
const START_XP = 10;
const SEASON_ORDER: GradeWindow["id"][] = ["fall", "winter", "spring"];
/** Where the school year is: Aug to Nov fall, Dec to Feb winter, Mar to
 *  Jul spring (a summer student has finished spring). */
function seasonIndexFor(d: Date): number {
  const m = d.getMonth();
  return m >= 7 && m <= 10 ? 0 : m === 11 || m <= 1 ? 1 : 2;
}

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
  // A counselor-confirmed step opens its note inline, as an accordion
  // under its own row (direct feedback, 29 Sept 2026: "for locked tasks make
  // the entire row clickable like the rest with hover accordions not just
  // the lock icons"). It used to open a modal from the small lock only.
  const [openNote, setOpenNote] = useState<string | null>(null);
  const basePlan = stage === "hs" ? gradePlan(grade) : collegePlan(year, focus ? { id: focus.id, title: focus.title } : null);
  const levelLabel = stage === "hs" ? `Grade ${grade}` : `Year ${year}`;
  // No progress bar starts at zero (Joshua Pierce, 29 Sept 2026: "always
  // start a progress bar with one action completed such as 'start Fall
  // semester' that can give them points immediately... Duolingo states no
  // progress bar should ever start at 0"). The endowed-progress effect:
  // people given a head start finish more often (Nunes and Dreze, 2006;
  // Duolingo, LinkedIn's profile meter). Each season opens with a START
  // step that checks itself once that season has begun, so the plan never
  // reads 0%, and it banks +10 XP the first time. Added here, in the
  // student's view only, not in gradePlanData: the counselor dashboard
  // reads that data, and a free step must not count as a real milestone
  // there.
  const planKey = stage === "hs" ? `g${grade}` : `y${year}`;
  const seasonNow = seasonIndexFor(new Date());
  const startId = (w: GradeWindow) => `start-${planKey}-${w.id}`;
  const started = (w: GradeWindow) => SEASON_ORDER.indexOf(w.id) <= seasonNow;
  const plan = { ...basePlan, windows: basePlan.windows.map((w) => ({ ...w, steps: [{ id: startId(w), label: "START", inApp: true, title: `Start your ${w.title} ${w.id === "winter" ? "term" : "semester"}` } as GradeStep, ...w.steps] })) };
  const autoDone = new Set(plan.windows.filter(started).map(startId));
  const allSteps = plan.windows.flatMap((w) => w.steps).filter((s) => !s.optional);
  const doneCount = allSteps.filter((s) => done.has(s.id) || autoDone.has(s.id)).length;
  const pct = Math.round((doneCount / Math.max(allSteps.length, 1)) * 100);
  const RULE = "var(--inset-border)";
  // The head start's points fly from the percentage the first time a
  // season's START step checks itself; once per plan and season.
  const pctRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      for (const w of plan.windows) if (started(w)) flyXp({ from: pctRef.current, amount: START_XP, milestone: `myplan:${startId(w)}` });
    }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per plan shown
  }, [planKey]);

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
        {/* The percentage leads, so the student reads how far along they
           are at a glance, with what is left beside it (Joshua, 29 Sept
           2026: "have the progress bar have a percentage with it so at a
           glance they can see how much numerically they have left"). */}
        {/* One line, one thing each side (Chandu, 29 Sept 2026: "Too much
           to read... Maybe it can be on one line and say only one thing. 1
           of 12 is enough"): the count on the left, Joshua's percentage on
           the right, the bar under both. */}
        <div className="flex items-baseline justify-between gap-[var(--space-4)]">
          <span className="text-[15px] leading-[22px] tabular-nums" style={{ color: "var(--foreground)" }}>{doneCount} of {allSteps.length} done</span>
          <span ref={pctRef} className="text-[15px] leading-[22px] font-bold tabular-nums" style={{ color: "var(--foreground)" }} aria-label={`${pct} percent done`}>{pct}%</span>
        </div>
        <SparkBar className="w-full" percent={pct} min={2} height={6} track="color-mix(in srgb, var(--accent-subtle) 22%, transparent)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" idle />
      </div>

      {plan.windows.map((w) => {
        const countedSteps = w.steps.filter((s) => !s.optional);
        const wDone = countedSteps.filter((s) => done.has(s.id) || autoDone.has(s.id)).length;
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
            <button type="button" aria-expanded={isOpen} onClick={() => setOpenWindow(isOpen ? null : w.id)} className={`dm-quiet relative z-[1] flex w-full cursor-pointer items-center justify-between gap-[var(--space-4)] rounded-[inherit] px-[var(--space-5)] py-[var(--space-5)] text-left sm:px-[var(--space-6)] sm:py-[var(--space-6)] ${isOpen ? "pb-[var(--space-4)]" : ""}`}>
              {/* One centred row (design sweep, 29 Sept 2026): the step count
                 rides beside the season name as its quiet second line of
                 information, and the chevron sits alone in a glass circle,
                 so the season art keeps its corner and never covers the
                 count (it used to stack count over chevron, under a leaf). */}
              <span className="flex min-w-0 items-center gap-[10px]">
                {v2 ? (
                  <CalendarMonthChip label={GRADE_WINDOW_MONTHS[w.id]} tint={SEASON_STYLE[w.id].tint} />
                ) : (
                  <span className="text-[12px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{GRADE_WINDOW_MONTHS[w.id]}</span>
                )}
                <span className="text-[22px] leading-[26px] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{w.title}</span>
                <span className="pl-[2px] text-[14px] leading-[20px] tabular-nums" style={{ color: wDone > 0 ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{wDone} of {countedSteps.length}</span>
              </span>
              <span aria-hidden className="relative z-[2] flex size-[32px] flex-none items-center justify-center rounded-full border" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: RULE, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" style={{ color: "var(--foreground)", transform: isOpen ? "rotate(180deg)" : "none" }} />
              </span>
            </button>
            {isOpen && (() => {
              // Two columns, IN APP | OUT OF APP (Joshua, 29 Sept 2026: "the
              // tasks read like one long vertical checklist, so during demos
              // it is not immediately clear what students can do inside
              // Dreamari versus what they need to do outside the app").
              // One panel, not two boxes (direct question, 29 Sept 2026: "it
              // looks weird with different sized boxes in both columns and
              // otherwise there will be too much blank space on one column"):
              // a hairline splits it down the middle and the rows pair up
              // across it like a table, so row 1 sits beside row 1 on one
              // shared line. When one list is shorter its cells are simply
              // empty, the way a table ends, with no box edge to mismatch.
              // The same two columns in every season (a season with nothing
              // in one group says so in one quiet line). Below 1024px it
              // stacks inside the same panel, IN APP first, like Top Three's
              // cards: half-width columns at tablet width wrapped every task
              // to three or four lines.
              const groups = (["app", "out"] as const).map((group) => {
                const rows = w.steps.filter((s) => (group === "out") === !s.inApp);
                const counted = rows.filter((s) => !s.optional);
                return { group, rows, counted, groupDone: counted.filter((s) => !s.counselorVerified && (done.has(s.id) || autoDone.has(s.id))).length };
              });
              const rowCount = Math.max(1, ...groups.map((g) => g.rows.length));
              const renderRow = (s: (typeof w.steps)[number]) => {
                  // The head-start step: checked by the season itself, not
                  // by the student, so it has no working checkbox, and it
                  // says what it earned instead of being struck through.
                  if (s.label === "START") {
                    const on = autoDone.has(s.id);
                    return (
                      <div key={s.id} className="flex items-center gap-[12px] border-t py-[10px]" style={{ borderColor: RULE }}>
                        <span aria-hidden className="flex size-[28px] flex-none items-center justify-center rounded-[6px] border md:size-[22px]" style={{ background: on ? "var(--color-feedback-success, #33c78c)" : "transparent", borderColor: on ? "transparent" : "rgba(255,255,255,0.35)" }}>
                          {on && <Check className="h-3.5 w-3.5" style={{ color: "#05070f" }} />}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                          <span className="text-[11px] leading-[15px] font-bold tracking-[0.08em] uppercase" style={{ color: on ? "var(--muted-foreground)" : "var(--accent-subtle)" }}>{s.label}</span>
                          <span className="min-w-0 text-[15px] leading-[21px]" style={{ color: "var(--foreground)" }}>{s.title}</span>
                          <span className="pt-[1px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{on ? "Done the day it began" : `Checks itself when ${w.title} begins`}</span>
                        </span>
                        <span className="flex-none rounded-full px-[9px] py-[3px] text-[12px] leading-[16px] font-bold tabular-nums" style={{ background: on ? "color-mix(in srgb, var(--accent-subtle) 18%, transparent)" : "transparent", border: on ? "none" : "1px solid var(--glass-border)", color: on ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>+{START_XP} XP</span>
                      </div>
                    );
                  }
                  const complete = !s.counselorVerified && done.has(s.id);
                  // Verb above the task, not in a fixed side column, so
                  // a half-width column keeps the task line long.
                  const body = (
                    <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                      <span className="text-[11px] leading-[15px] font-bold tracking-[0.08em] uppercase" style={{ color: complete ? "var(--muted-foreground)" : "var(--accent-subtle)" }}>{s.label}</span>
                      <span className={`min-w-0 text-[15px] leading-[21px] ${complete ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>
                        {s.optional && "(Optional) "}{s.title}
                      </span>
                      {/* Status as one quiet line under the task, not
                         stacked uppercase tags on the right (they ran
                         over the title on phones). */}
                      {(s.counselorVerified || s.deadlineBound) && (
                        <span className="pt-[1px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
                          {s.counselorVerified && "Counselor confirms"}
                          {s.counselorVerified && s.deadlineBound && " · "}
                          {s.deadlineBound && <span className="whitespace-nowrap" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>{GRADE_WINDOW_DUE[w.id]}</span>}
                        </span>
                      )}
                    </span>
                  );
                  if (s.counselorVerified) {
                    const noteOpen = openNote === s.id;
                    return (
                      <div key={s.id} className="border-t" style={{ borderColor: RULE }}>
                        <button type="button" aria-expanded={noteOpen} aria-label={`${s.label}: ${s.title}. Your counselor confirms this one. ${noteOpen ? "Hide" : "Show"} what to do.`} onClick={() => setOpenNote(noteOpen ? null : s.id)} className="dm-quiet -mx-[8px] my-[4px] flex w-[calc(100%+16px)] cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left">
                          <span aria-hidden className="flex size-[28px] flex-none items-center justify-center rounded-[6px] border border-dashed md:size-[22px]" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
                            <Lock className="h-3 w-3" style={{ color: "var(--muted-foreground)" }} />
                          </span>
                          {body}
                          <ChevronDown className="h-4 w-4 flex-none transition-transform duration-200" style={{ color: "var(--muted-foreground)", transform: noteOpen ? "rotate(180deg)" : "none" }} aria-hidden />
                        </button>
                        {noteOpen && (
                          <div className="filters-reveal flex flex-col gap-[4px] pb-[12px] pl-[40px] md:pl-[34px]">
                            <p className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{s.counselorNote}</p>
                            <p className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Your counselor checks this off on their dashboard, so it can&apos;t be checked off here.</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={s.id} className="flex items-center gap-[12px] border-t py-[10px]" style={{ borderColor: RULE, opacity: complete ? 0.55 : 1 }}>
                        <IconTip label={complete ? "Mark not done" : "Mark done"}>
                        <button type="button" aria-label={complete ? `Mark "${s.title}" not done` : `Mark "${s.title}" done`} onClick={() => toggle(s.id)} className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-[6px] border md:size-[22px]" style={{ background: complete ? "var(--color-feedback-success, #33c78c)" : "transparent", borderColor: complete ? "transparent" : "rgba(255,255,255,0.35)" }}>
                          {complete && <Check className="h-3.5 w-3.5" style={{ color: "#05070f" }} />}
                        </button>
                        </IconTip>

                      {s.href && !complete ? (
                        <Link href={s.href} aria-label={`${s.label}: ${s.title}`} className="dm-quiet -mx-[8px] -my-[6px] flex min-w-0 flex-1 items-center gap-[10px] rounded-[var(--radius-sm)] px-[8px] py-[6px]">
                          {body}
                          <ChevronRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                        </Link>
                      ) : (
                        body
                      )}
                    </div>
                  );
              };
              return (
              <div className="filters-reveal relative z-[1] px-[var(--space-3)] pt-[var(--space-1)] pb-[var(--space-3)] sm:px-[var(--space-6)] sm:pb-[var(--space-6)]">
                <div className="grid overflow-hidden rounded-[var(--radius-md)] border lg:grid-cols-2" style={{ background: "color-mix(in srgb, var(--background) 42%, transparent)", borderColor: RULE }}>
                  {groups.map(({ group, rows, counted, groupDone }, col) => {
                    // Right-hand cells carry the centre hairline; below lg the
                    // second group opens with a full-width rule instead.
                    const cell = col === 1 ? "lg:border-l" : "";
                    return (
                      <Fragment key={group}>
                        <div className={`flex items-end gap-[10px] px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-3)] sm:px-[var(--space-5)] sm:pt-[var(--space-5)] ${col === 1 ? "border-t lg:border-t-0" : ""} ${cell}`} style={{ borderColor: RULE }}>
                          <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                            <span className="text-[16px] leading-[20px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--foreground)" }}>{group === "app" ? "In app" : "Out of app"}</span>
                            <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{group === "app" ? "Do these here in Dreamari" : "Do these in the real world"}</span>
                          </span>
                          {rows.length > 0 && <span className="flex-none text-[14px] leading-[20px] tabular-nums" style={{ color: groupDone > 0 ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{groupDone} of {counted.length}</span>}
                        </div>
                        {Array.from({ length: rowCount }, (_, i) => {
                          const step = rows[i];
                          // An empty cell below lg is dropped (the stack just
                          // ends); at lg it holds the grid line open.
                          if (!step && !(i === 0 && rows.length === 0)) return <div key={`${group}-empty-${i}`} aria-hidden className={`hidden lg:block ${cell}`} style={{ borderColor: RULE, gridColumn: col + 1, gridRow: i + 2 }} />;
                          return (
                            <div key={step?.id ?? `${group}-none`} data-col={col} className={`grid min-w-0 px-[var(--space-4)] sm:px-[var(--space-5)] ${cell} max-lg:![grid-column:auto] max-lg:![grid-row:auto]`} style={{ borderColor: RULE, gridColumn: col + 1, gridRow: i + 2 }}>
                              {step ? renderRow(step) : (
                                <p className="border-t py-[12px] text-[14px] leading-[20px]" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
                                  {group === "app" ? "Nothing to do in Dreamari this season." : "Nothing to do outside Dreamari this season."}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
              );
            })()}
          </section>
        );
      })}
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
      className={`flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] p-[var(--space-5)] md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:grid-rows-[auto_auto_1fr] md:gap-x-[var(--space-8)] md:p-[var(--space-6)] md:[grid-template-areas:'chips_tabs'_'head_pane'_'decide_pane'] ${inModal ? "w-full border-0" : "w-[calc(86vw/var(--vz,1))] max-w-[340px] flex-none snap-center border-2 md:w-[86%] md:max-w-[880px]"}`}
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
export function CompareTable({ routes, selectedId }: { routes: ProfileCareer["routes"]; selectedId: string }) {
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

export function SchoolsShelf() {
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

/** Answers and posts saved from the Connect Feed (28 Sept 2026, direct ask:
 *  "saved posts/answers are stored and shown on Profile next to the
 *  related career" -- kept minimal per that same instruction, since a full
 *  per-career grouping would need a real career match on every saved item,
 *  which isn't always available; this is a plain "From Connect" shelf,
 *  same shape as Videos/Schools, until that's worth building out). Each
 *  card opens the original discussion back in Connect. */
function ConnectSavesShelf() {
  const saved = useConnectSaves();
  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">Nothing saved from Connect yet</p>
        <Link href="/connect" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Open Connect</Link>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-[var(--space-3)]">
      {saved.map((item) => (
        <li key={item.id}>
          <Link
            href={`/connect?${item.kind === "question" ? "thread" : "insight"}=${item.id}`}
            className="dm-quiet -mx-[8px] flex flex-col gap-[3px] rounded-[var(--radius-md)] border px-[12px] py-[10px]"
            style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
          >
            <span className="line-clamp-2 text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{item.title}</span>
            <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.kind === "question" ? "Answered" : "Posted"} by {item.proName}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function VideosShelf() {
  const [saved, toggleSaved] = useSavedVideos();
  // a saved video plays when tapped (8 Oct 2026: "the cards in the saved tab
  // ... should be clickable but they don't work right now")
  const [playing, setPlaying] = useState<string | null>(null);
  const nowPlaying = COMPANY_VIDEOS.find((v) => v.video === playing);
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
          <button type="button" aria-label={`Play ${v.title}`} onClick={() => setPlaying(v.video)} className="dm-tap group relative block aspect-[3/4] w-full cursor-pointer">
            <Image src={v.poster} alt="" fill sizes="220px" className="object-cover" />
            <span aria-hidden className="absolute top-1/2 left-1/2 flex size-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}><Play className="ml-[2px] h-[20px] w-[20px]" fill="currentColor" /></span>
          </button>
          {/* Same unsave gap as SchoolsShelf (direct feedback, 21 Sept 2026). */}
          <IconTip label="Remove" className="absolute top-[8px] right-[8px] z-10">
          <button
            type="button"
            aria-label="Remove from saved"
            onClick={() => toggleSaved(v.video)}
            className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.22)", background: "rgba(12,16,35,0.55)", color: "#fff", backdropFilter: "blur(8px)" }}
          >
            <X className="h-[16px] w-[16px]" aria-hidden />
          </button>
          </IconTip>
          <span className="dm-glass flex flex-col gap-[2px] p-[10px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="truncate text-[14px] leading-[16px] font-bold" style={{ color: "var(--foreground)" }}>{v.title}</span>
            <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{v.company}</span>
          </span>
        </div>
      ))}
      {nowPlaying && typeof document !== "undefined" && createPortal(
        <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-[var(--space-4)]" role="dialog" aria-modal="true" aria-label={nowPlaying.title} onKeyDown={(e) => { if (e.key === "Escape") setPlaying(null); }}>
          <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setPlaying(null)} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />
          <div className="relative flex max-h-full w-full max-w-[460px] flex-col gap-[10px]">
            <div className="flex items-center justify-between gap-[10px] text-white">
              <span className="flex min-w-0 flex-col"><span className="truncate text-[16px] font-bold">{nowPlaying.title}</span><span className="truncate text-[13px] opacity-80">{nowPlaying.company}</span></span>
              <button type="button" aria-label="Close" autoFocus onClick={() => setPlaying(null)} className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <video src={nowPlaying.video} poster={nowPlaying.poster} controls autoPlay playsInline className="max-h-[calc(80dvh/var(--vz,1))] w-full rounded-[var(--radius-lg)] bg-black object-contain" />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function LockerTab({ locker, top3Count, addToTop3, onClose, embedded = false }: { locker: ProfileCareer[]; top3Count: number; addToTop3: (id: string) => void; onClose: () => void; /** inside a tab (v2) or under Top 3 (v3): no close button */ embedded?: boolean }) {
  const router = useRouter();
  // The locker holds everything a student saves across Dreamari, grouped
  // into the four categories students actually save (direct feedback, 16
  // Sept 2026, Slack): careers, schools, videos (Explore's "Videos Inside
  // Leading Companies," not tied to one specific career), and event stubs.
  const [shelf, setShelf] = useState<"careers" | "schools" | "opportunities" | "videos" | "events" | "connect">("careers");
  // ?shelf= lands on one shelf (the "View saved" nudges and Explore Schools'
  // "See saved" use it), read after mount so the first render matches the server.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("shelf");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a URL-driven initial shelf, read after mount
    if (want === "careers" || want === "schools" || want === "opportunities" || want === "videos" || want === "events" || want === "connect") setShelf(want);
  }, []);
  const savedOpportunities = useSavedOpportunityCount();
  const [savedSchools] = useSavedColleges();
  const [savedVideos] = useSavedVideos();
  const [savedCareers, toggleSavedCareer] = useSavedCareers();
  const connectSaves = useConnectSaves();
  const stubCount = EVENTS.filter((e) => e.lifecycle === "Active follow-up").length;
  const SHELF_LABEL: Record<typeof shelf, string> = { careers: "Careers", schools: "Schools", opportunities: "Opportunities", videos: "Videos", events: "Event Stubs", connect: "From Connect" };
  // v2 (layoutVersion.tsx): the careers shelf is what the student
  // actually saved, newest first, so "View saved" lands on the career they
  // just saved. v1 keeps its demo list of every career from their activity.
  const careers = embedded ? [...savedCareers].reverse().map((id) => locker.find((c) => c.id === id)).filter((c): c is ProfileCareer => !!c) : locker;
  const SHELF_COUNT: Record<typeof shelf, number> = { careers: careers.length, schools: savedSchools.size, opportunities: savedOpportunities, videos: savedVideos.size, events: stubCount, connect: connectSaves.length };
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Inside the Saved tab (v2) the tab already says "Saved" and carries
         the count, so the heading row repeated it (2 Oct 2026, Chandu:
         "remove the redundant repeating Saved title from inside the saved
         tab"). The standalone view (v1) keeps its title and Close. */}
      {!embedded && (
      <div className="flex items-baseline justify-between">
        <h2 className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Saved</h2>
        <span className="flex items-center gap-[var(--space-3)]">
          <span className="text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{SHELF_COUNT[shelf]} {shelf === "events" ? "kept" : "saved"}</span>
          {!embedded && (
          <IconTip label="Close">
          <button type="button" aria-label="Close Saved" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
          </IconTip>
          )}
        </span>
      </div>
      )}
      {/* Secondary tabs: text + underline (TextTabs), not a second pill
         track under the Profile's own pill tabs. */}
      <TextTabs ariaLabel="Saved shelves" layoutId="locker-shelf-underline" value={shelf} onChange={setShelf}
        items={(["careers", "schools", "opportunities", "videos", "events", "connect"] as const).map((id) => ({ key: id, label: SHELF_LABEL[id] }))} />
      {shelf === "events" ? (
        <EventStubs />
      ) : shelf === "schools" ? (
        <SchoolsShelf />
      ) : shelf === "opportunities" ? (
        <OpportunitiesShelf />
      ) : shelf === "videos" ? (
        <VideosShelf />
      ) : shelf === "connect" ? (
        <ConnectSavesShelf />
      ) : careers.length === 0 ? (
        <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[15px] font-bold">{embedded ? "Nothing saved yet. Tap Save on any career and it shows up here." : "Everything saved is in your Top 3"}</p>
          <Link href="/explore" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Explore careers</Link>
        </div>
      ) : (
        /* v2: six to a row and a squarer crop, so a full shelf sits above
           the fold (Chandu, 2 Oct 2026: "saved cards can be considerably
           smaller and shorter so they fit above the fold"). */
        <div className={embedded ? "grid grid-cols-3 gap-[var(--space-2)] sm:grid-cols-4 lg:grid-cols-6" : "grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-4"}>
          {careers.map((career) => (
            <div key={career.id} className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)" }}>
              <span className={`dm-tap relative block w-full ${embedded ? "aspect-[3/4]" : "aspect-[2/3]"}`}>
                {/* the poster opens the career (8 Oct 2026, Chandu: "the cards
                   in the saved tab in the profile should be clickable"),
                   prev/next through the saved shelf */}
                <button type="button" aria-label={`Open ${career.title}`} onClick={() => { if (!openCareerPeek(career.id, careers.map((c) => c.id))) router.push(`/career/${career.id}`); }} className="absolute inset-0 z-[5] cursor-pointer rounded-t-[var(--radius-lg)]" />
                <ProfilePhoto career={career} sizes="220px" className="object-cover" />
                {/* Careers had no save/unsave concept at all -- the bookmark
                   on Career Detail was a local-only toggle that never
                   persisted anywhere (direct feedback, 21 Sept 2026:
                   "careers should also have unsave concept"). Same control
                   as SchoolsShelf's own SaveButton, now backed by the same
                   kind of real, shared, persisted state. */}
                <span className="absolute top-[8px] right-[8px] z-10"><SaveButton on={savedCareers.has(career.id)} onToggle={() => toggleSavedCareer(career.id)} size={32} /></span>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1 pb-[10px] text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)", paddingTop: "30px" }}>
                  <span className="w-full text-[14px] leading-[16px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
                  <span className="w-full text-[8px] leading-[11px] font-bold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}>{career.world}</span>
                </span>
              </span>
              {/* Real bug fix, 27 Sept 2026: at this grid's narrowest columns
                 (2 up on phones, 4 up on desktop) the side-by-side label +
                 button footer left the title truncated to "S.." and the
                 button overlapping "FROM YOUR ACTIVITY". A card this narrow
                 never has room for both on one line at any breakpoint the
                 grid uses, so the footer now always stacks: label row on
                 top with its own line, the action full width below it. */}
              <span className="dm-glass flex flex-col gap-[6px] p-[10px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ background: "var(--glass-surface-1)" }}>
                {/* v2 drops the interest line (Chandu, 2 Oct 2026: "let's not do
                   the growing interest thing on the saved cards"): the card is
                   the poster and one action. */}
                {!embedded && (
                <span className="flex min-w-0 flex-col gap-[1px]">
                  <span className="truncate text-[14px] leading-[15px] font-bold" style={{ color: "var(--accent-subtle)" }}>{interestTier(career.match)}</span>
                  <span className="truncate text-[8.5px] leading-[11px] font-bold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>From your activity</span>
                </span>
                )}
                {/* Labelled, not an icon alone: the swap arrows were not
                   understood (direct feedback, 11 Sept 2026). */}
                <button
                  type="button"
                  onClick={() => addToTop3(career.id)}
                  aria-label={top3Count >= 3 ? `Swap ${career.title} into your Top 3` : `Add ${career.title} to your Top 3`}
                  className="dm-quiet flex h-8 w-full cursor-pointer items-center justify-center gap-[5px] rounded-[var(--radius-md)] border px-[10px] text-[12px] font-bold whitespace-nowrap"
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
        <IconTip label="Close">
        <button type="button" aria-label="Close settings" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}>
          <X className="h-4 w-4" />
        </button>
        </IconTip>
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
                      <IconTip label="Delete">
                      <button type="button" onClick={() => deleteArchivedProfile(entry.id)} aria-label="Delete this build" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
                      </IconTip>
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
          <IconTip label="Close">
          <button type="button" onClick={onClose} aria-label="Close report" className="flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px]" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
          </IconTip>
        </span>
      </div>

      <div className="print-report mx-auto my-6 w-[min(720px,calc(92vw/var(--vz,1)))] rounded-[8px] bg-white p-10 text-[#111827] shadow-2xl print:my-0 print:w-full print:rounded-none print:shadow-none">
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
