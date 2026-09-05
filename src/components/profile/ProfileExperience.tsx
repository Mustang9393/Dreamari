"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SparkBar } from "@/components/flow/SparkBar";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Flame,
  Gamepad2,
  GraduationCap,
  MoreVertical,
  Plane,
  Pencil,
  Plus,
  Printer,
  Settings,
  Shield,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
  ImagePlus,
} from "lucide-react";
import { DesktopNavigation, MobileNav, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { InkText } from "@/components/build/ui";
import { Button } from "@/components/ui/Button";
import { LocalBurst } from "@/components/build/DreamyGuide";
import { playMilestoneChime } from "@/components/build/sound";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS, careerReport, interestTier, routeDetail, STUDENT, type PlanTask, type ProfileCareer } from "./data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks, writePicks } from "@/lib/picks";
import { CareerReportView, ComparisonTable, Portal, REPORT_SECTIONS } from "./CareerReport";
import { EventStubs } from "./EventStubs";
import { EVENTS } from "@/components/connect/data";
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

const ACTION_ICON = { Play: Gamepad2, Explore: Compass, Join: Users, Build: BookOpen } as const;

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
const GLASS = { background: "var(--glass-surface-2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" } as const;

// Covers a student can pick for their header: six rendered materials (fluted
// glass, molten glass, rippled glass, a grain-lit horizon) in the app's dark,
// warm-lit register (scratchpad/covers.js renders them), or their own upload.
// No subject, nothing to crop. Persisted per browser.
const COVERS = ["streaks", "fluted", "smoke", "molten", "frosted", "horizon"].map((n) => `/images/profile/covers/${n}.webp`);
const COVER_KEY = "dreamari-cover";
/** the sentinel that means "use my #1 career's poster as the cover" */
const COVER_CAREER = "career";

// Where the Top 3 comes from, in order: the ?picks= handoff the report chooser
// navigates with (so the right career server-renders, no flash of someone
// else's), then stored picks on a later visit, and finally the demo default so
// /profile still stands up on its own with nothing saved.
const DEMO_TOP3 = ["investment-banking", "airline-pilot"];

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
  const [welcomeBurst, setWelcomeBurst] = useState(0);
  useEffect(() => {
    if (!initialWelcome) return;
    const open = setTimeout(() => {
      setWelcomeOpen(true);
      playMilestoneChime();
      setWelcomeBurst((n) => n + 1);
    }, 900);
    return () => clearTimeout(open);
  }, [initialWelcome]);
  const dismissWelcome = () => {
    setWelcomeOpen(false);
    // so a refresh doesn't replay the introduction
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // nothing to tidy
    }
  };
  const buildIn = (order: number) =>
    initialWelcome
      ? { className: "motion-safe:animate-[card-cascade_0.7s_cubic-bezier(0.16,1,0.3,1)_both]", style: { animationDelay: `${180 + order * 220}ms` } as React.CSSProperties }
      : { className: "", style: {} as React.CSSProperties };
  // ?tab= from Home's Your Next Moves opens straight onto that tab
  const [tab, setTab] = useState<TabId>(initialTab && (TAB_IDS as string[]).includes(initialTab) ? (initialTab as TabId) : "overview");
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  // Screen-reader announcement when the focused career changes (a11y brief).
  const [announce, setAnnounce] = useState("");
  // Storage is an external store, so it is READ, never copied into state by an
  // effect: the handoff wins if there is one, then whatever they last chose,
  // then the demo default. Their own edits below layer on top of that.
  const fromHandoff = initialPicks.length > 0;
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const [edits, setEdits] = useState<{ ids: string[]; focus: string | null } | null>(null);
  const base = useMemo(() => {
    if (fromHandoff) return { ids: initialPicks, focus: initialFocus ?? initialPicks[0] };
    const valid = stored.ids.filter((id) => ALL_PROFILE_CAREERS.some((career) => career.id === id));
    if (valid.length) return { ids: valid, focus: stored.focus && valid.includes(stored.focus) ? stored.focus : valid[0] };
    return { ids: DEMO_TOP3, focus: DEMO_TOP3[0] as string | null };
  }, [fromHandoff, initialPicks, initialFocus, stored]);
  const top3 = edits?.ids ?? base.ids;
  const focusId = edits ? edits.focus : base.focus;
  const setTop3 = (next: string[] | ((previous: string[]) => string[])) =>
    setEdits((current) => {
      const previous = current ?? base;
      return { ids: typeof next === "function" ? next(previous.ids) : next, focus: previous.focus };
    });
  const setFocusId = (id: string | null) => setEdits((current) => ({ ids: (current ?? base).ids, focus: id }));
  const [routeChoice, setRouteChoice] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, string[]>>({});
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
  const [avatarUrl, setAvatarUrl] = useState(STUDENT.avatar);
  // Covers are curated backgrounds only (CEO, 4 Sept): no career-poster
  // switch, no uploads (inappropriate-content risk). The real app should
  // carry about 40 strong options; the prototype ships six.
  const [coverUrl, setCoverUrl] = useState<string>(COVERS[0]);
  // the last background picked, kept so both cover layers stay mounted and
  // the A/B switch is a crossfade, never a half-decoded swap
  const [bgUrl, setBgUrl] = useState<string>(COVERS[0]);
  const [coverOpen, setCoverOpen] = useState(false);
  useEffect(() => {
    // the browser is the store for the prototype; read after mount so the
    // server render and the first paint match
    try {
      const saved = window.localStorage.getItem(COVER_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && saved !== COVER_CAREER && !saved.startsWith("blob:")) { setCoverUrl(saved); setBgUrl(saved); }
    } catch {}
  }, []);
  const pickCover = (url: string) => {
    setCoverUrl(url);
    if (url !== COVER_CAREER) setBgUrl(url);
    setCoverOpen(false);
    try { window.localStorage.setItem(COVER_KEY, url); } catch {}
  };
  const [customTasks, setCustomTasks] = useState<Record<string, PlanTask[]>>({}); // key: careerId:horizonId

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
  const careerSrc = focus?.photo ?? COVERS[0];
  const careerPosition = focus?.photoFocus ?? "50% 30%";
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

  function addCustomTask(careerId: string, horizonId: string, label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const task: PlanTask = { id: `custom-${Date.now()}`, label: trimmed, minutes: 10, action: "Build", href: "#", custom: true };
    setCustomTasks((current) => ({ ...current, [`${careerId}:${horizonId}`]: [...(current[`${careerId}:${horizonId}`] ?? []), task] }));
  }

  function removeCustomTask(careerId: string, horizonId: string, taskId: string) {
    setCustomTasks((current) => ({ ...current, [`${careerId}:${horizonId}`]: (current[`${careerId}:${horizonId}`] ?? []).filter((task) => task.id !== taskId) }));
    setDone((current) => ({ ...current, [careerId]: (current[careerId] ?? []).filter((id) => id !== taskId) }));
  }

  function toggleTask(careerId: string, taskId: string) {
    // Checking a step off was a silent color change. The shared select tick (the
    // pulse event has no aurora canvas here, so only the sound lands) plus the
    // two progress bars above sparking as they grow (SparkBar) make it register.
    dispatchAuroraPulse("select");
    setDone((current) => {
      const list = current[careerId] ?? [];
      return { ...current, [careerId]: list.includes(taskId) ? list.filter((id) => id !== taskId) : [...list, taskId] };
    });
  }

  function addToTop3(id: string) {
    if (top3.includes(id)) return;
    if (top3.length < 3) {
      setTop3((current) => [...current, id]);
      if (!focusId) setFocusId(id);
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

  function removeFromTop3(id: string) {
    const next = top3.filter((item) => item !== id);
    setTop3(next);
    if (focusId === id) setFocusId(next[0] ?? null);
  }



  return (
    // overflowX clip (not the class's hidden) keeps sideways-drag protection without
    // creating a scroll container, so the report's sticky section rail can pin.
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)", overflowX: "clip" }}>
      <AppBackdrop />

      <div className="no-print">
        <DesktopNavigation active="Profile" />
      </div>

      <header className="no-print relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <span className="flex items-center gap-[var(--space-4)] text-[15px] font-bold">
          <span className="flex items-center gap-[6px]" style={{ color: "var(--accent-subtle)" }}>
            <Flame className="h-4 w-4" /> {STUDENT.streakDays}
          </span>
          <QuickLinksMenu />
        </span>
      </header>

      <main className="no-print relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] sm:px-[var(--space-14)] md:pt-[var(--space-10)]">
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
            <img src={careerSrc} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ objectPosition: careerPosition, opacity: coverIsCareer ? 1 : 0 }} />
            <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ objectPosition: "50% 40%", opacity: coverIsCareer ? 0 : 1 }} />
            <CardProgressiveBlur size="66%" />
            <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.62) 34%, rgba(12,16,35,0.12) 64%, transparent 100%), linear-gradient(90deg, color-mix(in srgb, ${heroAccent} 14%, transparent), transparent 60%)` }} />
          </div>
          <div className="relative flex min-h-[280px] flex-col justify-end gap-[var(--space-5)] p-[var(--space-5)] pt-[96px] sm:min-h-[312px] sm:p-[var(--space-6)]">
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
                  <ImagePlus className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Cover</span>
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
                      <div className="grid grid-cols-3 gap-[8px]">
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
              <span className="relative">
                <button
                  type="button"
                  aria-label="Settings menu"
                  aria-expanded={settingsMenuOpen}
                  onClick={() => setSettingsMenuOpen((open) => !open)}
                  className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-auto sm:gap-[5px] sm:px-[10px] sm:text-[14px] sm:font-semibold"
                  style={{ background: tab === "settings" || settingsMenuOpen ? "var(--glass-surface-3)" : "transparent", color: tab === "settings" || settingsMenuOpen ? "var(--accent-subtle)" : "var(--muted-foreground)" }}
                >
                  <Settings className="h-4 w-4 flex-none sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Settings</span>
                </button>
                {settingsMenuOpen && (
                  <>
                    <button type="button" aria-label="Close menu" className="fixed inset-0 z-[55] cursor-default" onClick={() => setSettingsMenuOpen(false)} />
                    <div className="absolute top-[44px] right-0 z-[56] w-[200px] rounded-[var(--radius-lg)] border p-[var(--space-1)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "var(--shadow-md)" }}>
                      <button
                        type="button"
                        onClick={() => { setSettingsMenuOpen(false); setTab("settings"); }}
                        className="dm-quiet flex w-full cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-left text-[15px] font-bold"
                      >
                        <Settings className="h-4 w-4 flex-none" aria-hidden /> Profile and privacy
                      </button>
                    </div>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-end gap-[var(--space-4)]">
              <label className="group relative size-[72px] flex-none cursor-pointer" aria-label="Change profile photo">
                <img src={avatarUrl} alt={`${STUDENT.name}'s profile photo`} className="size-[72px] rounded-full border-2 object-cover" style={{ borderColor: "rgba(255,255,255,0.9)" }} />
                <span className="absolute right-0 bottom-0 flex size-[22px] items-center justify-center rounded-full border transition-transform group-hover:scale-110" style={{ background: "var(--glass-surface-3)", borderColor: "#0e0c20", color: "var(--foreground)", textShadow: "none" }}>
                  <Pencil className="h-[11px] w-[11px]" />
                </span>
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAvatarUrl(URL.createObjectURL(file)); }} />
              </label>
              <span className="flex min-w-0 flex-1 flex-col gap-[2px] pb-[4px]">
                <h2 className="text-[28px] leading-[32px] font-extrabold tracking-[-0.02em] text-balance sm:text-[36px] sm:leading-[40px]" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.name}</h2>
                <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "rgba(255,255,255,0.82)" }}>{STUDENT.school}</span>
              </span>
            </div>
            {/* the three facts as the community cards' tiles: icon in the
               #1 career's accent, the figure, then the label */}
            <dl className="grid grid-cols-3 gap-[8px]" style={{ textShadow: "none" }}>
              {[
                { Icon: GraduationCap, value: STUDENT.grade.replace("Grade ", ""), note: null as string | null, label: "Grade", verified: false, sub: null as string | null },
                { Icon: BadgeCheck, value: ACADEMIC_RECORD.gpa, note: null as string | null, label: "GPA", verified: ACADEMIC_RECORD.verified, sub: null as string | null },
                { Icon: Flame, value: `${STUDENT.streakDays}`, note: "days" as string | null, label: "Streak", verified: false, sub: "142/190" as string | null },
              ].map((fact) => (
                <div key={fact.label} className="flex min-w-0 flex-col items-center gap-[2px] rounded-[var(--radius-sm)] px-[6px] py-[10px] text-center" style={{ background: "rgba(12,16,35,0.58)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${heroAccent} 28%, rgba(255,255,255,0.1))` }}>
                  <fact.Icon className="h-[16px] w-[16px]" aria-hidden style={{ color: heroAccent }} />
                  <dd className="order-2 flex items-baseline gap-[4px] text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>
                    {fact.value}
                    {fact.note && <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{fact.note}</span>}
                  </dd>
                  <dt className="order-3 flex items-center gap-[4px] text-[11.5px] leading-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {fact.label}{fact.sub ? ` · ${fact.sub}` : ""}
                    {fact.verified && <span className="sr-only">verified by {ACADEMIC_RECORD.source}, {ACADEMIC_RECORD.updated}</span>}
                  </dt>
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
          /* One surface for every tab: the tab bar and the active panel share
             this card. Inside it nothing is a card again (direct feedback,
             4 Sept): groups are drawn with borders on the shared surface,
             the way the career report keeps one sheet of paper. */
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
            if (event.key === "ArrowRight") next = order[(index + 1) % order.length];
            if (event.key === "ArrowLeft") next = order[(index + order.length - 1) % order.length];
            if (next) {
              event.preventDefault();
              setTab(next);
              document.getElementById(`profile-tab-${next}`)?.focus();
            }
          }}
          className="flex w-full items-center gap-[var(--space-1)] overflow-x-auto rounded-[var(--radius-lg)] p-[var(--space-1)] [scrollbar-width:none]"
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
              style={{ background: tab === item.id ? "var(--primary)" : "transparent", color: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)", ["--ink" as string]: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)" }}
            >
              {/* "content changed" cue: the light passes through the letters
                 only, never the pill's padding (direct feedback, 4 Sept 2026) */}
              <span className={pings[item.id] ? "profile-tab-ping-text" : undefined}>{item.label}</span>
            </button>
          ))}
        </div>

            {tab === "overview" && (
            <div role="tabpanel" id="profile-panel-overview" aria-labelledby="profile-tab-overview">
              <OverviewTab
                focus={focus} nextTask={nextTask} planProgress={planProgress} top3Count={top3.length}
                onGoTop3={() => setTab("top3")} onGoPlan={() => setTab("plan")} onGoReport={() => setTab("report")}
                onGoLocker={() => setTab("locker")}
              />
            </div>
            )}
        {tab === "top3" && (
          <div role="tabpanel" id="profile-panel-top3" aria-labelledby="profile-tab-top3">
            <Top3Tab
              top3={top3} focusId={focusId} setFocusId={setFocusId} chosenRoute={chosenRoute}
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
            <MyPlanTab
              focus={focus} horizonProgress={horizonProgress} horizonUnlocked={horizonUnlocked}
              doneSet={doneSet} toggleTask={toggleTask} tasksFor={tasksFor} addCustomTask={addCustomTask}
              removeCustomTask={removeCustomTask} onGoRoutes={() => setTab("routes")}
            />
          </div>
        )}
        {tab === "report" && focus && (
          <div role="tabpanel" id="profile-panel-report" aria-labelledby="profile-tab-report">
            <CareerReportView
              student={{ name: STUDENT.name, grade: STUDENT.grade, school: STUDENT.school }}
              career={focus}
              savedMajors={savedMajors} onToggleMajor={toggleMajor}
              onOpenEvidence={() => setEvidenceOpen(true)} updatedLabel="today"
            />
          </div>
        )}
        {tab === "resume" && (
          <div role="tabpanel" id="profile-panel-resume" aria-labelledby="profile-tab-resume">
            <ResumeView />
          </div>
        )}
          </div>
        )}
        {/* Reachable only via PlanTab's "Change route" link now, not a main
           tab -- hidden from the tablist per direct feedback (see the
           comment above), but the underlying route-choice flow still needs
           a real destination rather than a dead link. */}
        {tab === "locker" && <LockerTab locker={locker} top3Count={top3.length} addToTop3={addToTop3} onClose={() => setTab("overview")} />}
        {tab === "settings" && <SettingsView onClose={() => setTab("overview")} />}
      </main>

      {/* ---- Welcome to Your Profile (arrival from Match only): the popup
         from the notes, played over the page it introduces rather than a
         dark screen — a light frosted scrim, the assembled profile still
         readable behind it. Dreamy's celebration bounce and confetti with
         the chime, the heading revealing word by word, one caption, the
         standard Continue. ---- */}
      {welcomeOpen && (
        <Portal>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-welcome-title"
            className="fixed inset-0 z-[120] flex items-center justify-center p-5 motion-safe:animate-[fade-slide-up_0.35s_ease-out_both]"
            style={{ background: "color-mix(in srgb, var(--background) 42%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            onPointerUp={(e) => { if (e.target === e.currentTarget) dismissWelcome(); }}
          >
            <div
              className="relative w-full max-w-[440px] overflow-hidden rounded-[var(--radius-lg)] border p-6 text-center motion-safe:animate-[dreamy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]"
              /* near-solid, not glass: on glass the profile bled through the
                 card and the text sat on it (direct feedback, 5 Sept 2026) —
                 the same surface the quick-links menu and search sheet use */
              style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.55)" }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-20 left-1/2 h-[240px] w-[90%] -translate-x-1/2 rounded-full blur-[70px]"
                style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--hero-accent-purple, var(--primary)) 40%, transparent), transparent 70%)" }}
              />
              <div className="relative flex flex-col items-center gap-4">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                  <span className="absolute inset-0 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite]">
                    <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="128px" className="object-contain" />
                  </span>
                  <LocalBurst nonce={welcomeBurst} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h2 id="profile-welcome-title" className="text-[24px] leading-[28px] font-extrabold sm:text-[28px] sm:leading-[32px]" style={{ fontFamily: "var(--font-display)" }}>
                    <InkText text="Welcome to Your Profile" delay={0.25} />
                  </h2>
                  <p className="motion-safe:animate-[fade-slide-up_0.6s_0.85s_ease-out_both] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>
                    Your Top 3 is saved.
                  </p>
                </div>
                <Button variant="primary" size="large" className="motion-safe:animate-[fade-slide-up_0.6s_1.05s_ease-out_both]" onClick={dismissWelcome} type="button">
                  Continue <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

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
        <div className="no-print fixed inset-0 z-[60] flex items-end justify-center sm:items-center" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setSwapCandidate(null); }}>
          <div className="filters-reveal w-full max-w-[440px] rounded-t-[var(--radius-xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Top 3 is full</p>
            <p className="mt-1 text-[15px]" style={{ color: "var(--muted-foreground)" }}>Swap one out for <strong style={{ color: "var(--foreground)" }}>{careerById(swapCandidate)?.title}</strong>. It returns to Saved.</p>
            <div className="mt-4 flex flex-col gap-[var(--space-2)]">
              {top3.map((id, index) => {
                const career = careerById(id)!;
                return (
                  <button key={id} type="button" onClick={() => confirmSwap(id)} className="dm-quiet flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-left" style={GLASS}>
                    <span className="text-[14px] font-bold">{index + 1} · {career.title}</span>
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
        <div className="no-print fixed inset-0 z-[66] flex items-end justify-center sm:items-center" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setConfirmRemove(null); }}>
          <div className="filters-reveal w-full max-w-[400px] rounded-t-[var(--radius-xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
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
        <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <div className="filters-reveal w-full max-w-[420px] rounded-t-[var(--radius-xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <div>
                <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Add to your Top 3</p>
                <p className="mt-[2px] text-[14px]" style={{ color: "var(--muted-foreground)" }}>{3 - top3.length} open {top3.length === 2 ? "slot" : "slots"} · from Saved</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-[var(--space-4)] flex max-h-[50vh] flex-col gap-[var(--space-2)] overflow-y-auto">
              {locker.length === 0 && (
                <Link href="/match-lab" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-center text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Nothing saved yet · swipe careers</Link>
              )}
              {locker.map((career) => (
                <div key={career.id} className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-2)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
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
function MoreFactsAccordion({ facts, accent }: { facts: { label: string; value: string }[]; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col border-t pt-[var(--space-3)]" style={{ borderColor: `color-mix(in srgb, ${accent} 25%, var(--glass-border))` }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="dm-quiet flex min-h-[36px] w-full cursor-pointer items-center justify-between gap-[8px] px-[4px] text-[12px] font-bold tracking-[0.6px] uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        Employers & schools
        <ChevronDown className={`h-4 w-4 flex-none transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <dl className="flex flex-col gap-[var(--space-3)] pt-[var(--space-2)] motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]">
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
  top3, focusId, setFocusId, chosenRoute, onAdd, onRemove, onOpenCompare, onGoReport,
}: {
  top3: string[];
  focusId: string | null;
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
        <p className="max-w-[42ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Add up to 3 careers here to compare them and choose your #1.</p>
        <button type="button" onClick={onAdd} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Add a career</button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-baseline justify-between gap-[var(--space-3)]">
        <p className="max-w-[46ch] text-[14px] leading-[19px] font-bold" style={{ color: "var(--muted-foreground)" }}>Compare your best-fit careers and choose your #1.</p>
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
      {top3.map((id, index) => {
        const career = careerById(id)!;
        const report = reportV2(id);
        const route = chosenRoute(career);
        const isFocus = focusId === id;
        const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
        const schools = report ? [...report.colleges].sort((a, b) => (BAND_ORDER[a.status] ?? 9) - (BAND_ORDER[b.status] ?? 9)).slice(0, 2).map((c) => c.name) : [];
        // Split by criticality (direct feedback): the three decision facts
        // stay on the card at RESERVED row heights, so all three columns
        // align 1:1 whatever wraps; employers + schools fold into a
        // collapsed-by-default accordion below them.
        const facts = [
          { label: "Estimated pay", value: report?.salary.median ?? "Coming soon", lines: "line-clamp-1 md:min-h-[18px]" },
          { label: "Education", value: report?.education.find((r) => r.common)?.name ?? "Coming soon", lines: "line-clamp-2 md:min-h-[36px]" },
          { label: "Years in school", value: route.duration, lines: "line-clamp-1 md:min-h-[18px]" },
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
              background: isFocus ? `color-mix(in srgb, ${accent} 9%, var(--glass-surface-1))` : "var(--glass-surface-1)",
            }}
          >
            {/* The photo carries the card: a wide cover clipped by the card's
               own radius, not a floating thumbnail square. The rank rides
               quietly on the photo corner instead of its own chip row. */}
            <div className="relative aspect-[4/3] w-full flex-none overflow-hidden rounded-t-[inherit]">
              {/* Per-photo focal point (data.ts photoFocus): each poster's
                 subject sits at a different height, so one shared crop puts
                 faces at different heights across the row. */}
              <Image src={career.photo} alt="" fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" style={{ objectPosition: career.photoFocus ?? "50% 25%" }} />
              <span
                className="absolute top-[10px] left-[10px] flex h-[26px] min-w-[26px] items-center justify-center rounded-[var(--radius-sm)] px-[9px] text-[13px] font-extrabold"
                style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", backdropFilter: "blur(6px)", fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                #{index + 1}
              </span>
              <div className="absolute top-[6px] right-[6px]">
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

            <div className="relative flex flex-1 flex-col gap-[var(--space-4)] p-[var(--space-5)]">
              {/* Every block below reserves its height at lg (the 3-up
                 layout), so the three cards' sections line up 1:1 whatever
                 wraps -- a two-line description next to a three-line one
                 was making whole cards run long (direct feedback). */}
              <div className="flex flex-col gap-[var(--space-3)]">
                <span className="flex min-w-0 flex-col gap-[1px]">
                  {/* World name carries the accent, never the career title. */}
                  <span className="text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: accent }}>{career.world}</span>
                  <span className="text-balance text-[18px] leading-[22px] font-extrabold sm:text-[22px] sm:leading-[26px] md:line-clamp-2 md:min-h-[52px]" style={{ fontFamily: "var(--font-display)" }}>{career.title}</span>
                </span>
                {isFocus ? (
                  <span className="flex h-[36px] w-fit flex-none items-center gap-[4px] rounded-[var(--radius-md)] px-[12px] text-[14px] font-semibold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: accent }}>
                    <Star className="h-3 w-3" fill="currentColor" aria-hidden /> Your #1
                  </span>
                ) : (
                  <button type="button" onClick={() => setFocusId(id)} className="dm-quiet flex h-[36px] w-fit flex-none cursor-pointer items-center rounded-[var(--radius-md)] border px-[12px] text-[12px] font-semibold whitespace-nowrap" style={{ borderColor: "var(--border)" }}>Make my #1</button>
                )}
              </div>

              <p className="text-[14px] leading-[19px] font-medium md:line-clamp-2 md:min-h-[38px]" style={{ color: "var(--muted-foreground)" }}>{report?.glance.simple ?? "Report details coming soon for this one."}</p>

              <dl className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${accent} 25%, var(--glass-border))` }}>
                {facts.map((fact) => (
                  <div key={fact.label} className="flex min-w-0 flex-col gap-[1px]">
                    <dt className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{fact.label}</dt>
                    <dd className={`text-[14px] leading-[18px] font-semibold ${fact.lines}`}>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <MoreFactsAccordion facts={moreFacts} accent={accent} />

              <button type="button" onClick={() => { setFocusId(id); onGoReport(); }} className="dm-link mt-auto flex min-h-[44px] w-fit cursor-pointer items-center gap-[4px] text-[14px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                View Career Report <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}

      {top3.length < 3 && (
        <button
          type="button"
          onClick={onAdd}
          className="dm-tap flex min-h-[120px] w-full cursor-pointer items-center justify-center gap-[var(--space-2)] self-stretch rounded-[var(--radius-lg)] border-2 border-dashed"
          style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
        >
          <span className="flex size-8 items-center justify-center rounded-full" style={{ background: "var(--glass-surface-3)" }}>
            <Plus className="h-4 w-4" style={{ color: "var(--accent-subtle)" }} />
          </span>
          <span className="text-[15px] font-bold">Add a career</span>
        </button>
      )}
      </div>

      {!focusId && (
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={INSET}>
          <span className="text-[14px] font-bold">Choose your #1 career to build your plan around it.</span>
          <button type="button" onClick={() => setFocusId(top3[0])} className="dm-solid flex min-h-[44px] flex-none cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-semibold" style={{ background: "var(--foreground)", color: "var(--background)" }}>Choose my #1</button>
        </div>
      )}
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
        <div className="dm-report min-h-0 flex-1 overflow-y-auto px-5 py-[var(--space-5)]">
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

function OverviewTab({
  focus, nextTask, planProgress, top3Count,
  onGoTop3, onGoPlan, onGoReport, onGoLocker,
}: {
  focus: ProfileCareer | null;
  nextTask: (career: ProfileCareer) => PlanTask | null;
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
        <p className="max-w-[42ch] text-[15px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Swipe through some careers and save the ones you want to look at properly. Your profile builds itself from there.</p>
        <div className="flex flex-wrap justify-center gap-[var(--space-3)]">
          <Link href="/match-lab" className="dm-solid flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Start swiping</Link>
          <button type="button" onClick={onGoLocker} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ borderColor: "var(--border)" }}>Open Saved</button>
        </div>
      </section>
    );
  }

  const next = nextTask(focus);
  const NextIcon = next ? ACTION_ICON[next.action] : Compass;
  const progress = planProgress(focus);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Bento: three equal doorways, same shape each time (caption, one
          number, one line) — matches how the reference architecture weighs
          Top Three / Plan / Report the same, instead of one dominant tile. */}
      <section aria-labelledby="bento-title" className="grid grid-cols-3 gap-[var(--space-2)] sm:gap-[var(--space-3)]">
        <h3 id="bento-title" className="sr-only">Your top three, plan and report at a glance</h3>

        <button type="button" onClick={onGoTop3} className="dm-tap flex min-w-0 cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left sm:gap-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
          <span className="flex items-start justify-between gap-[var(--space-2)]">
            <span className="text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><span className="sm:hidden">Top Three</span><span className="hidden sm:inline">My Top Three</span></span>
            <ArrowUpRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
          </span>
          <span className="text-[13px] leading-[17px] font-medium sm:text-[15px] sm:leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{top3Count} of 3 chosen</span>
        </button>

        <button type="button" onClick={onGoPlan} className="dm-tap flex min-w-0 cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left sm:gap-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
          <span className="flex items-start justify-between gap-[var(--space-2)]">
            <span className="text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><span className="sm:hidden">Plan</span><span className="hidden sm:inline">My Plan</span></span>
            <ArrowUpRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
          </span>
          <span className="flex flex-col gap-[6px]">
            <span className="text-[13px] leading-[17px] font-medium sm:text-[15px] sm:leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{progress.complete} of {progress.total} steps</span>
            <SparkBar percent={progress.pct} min={2} height={6} track="var(--glass-surface-2)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" />
          </span>
        </button>

        <button type="button" onClick={onGoReport} className="dm-tap flex min-w-0 cursor-pointer flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left sm:gap-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
          <span className="flex items-start justify-between gap-[var(--space-2)]">
            <span className="text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><span className="sm:hidden">Report</span><span className="hidden sm:inline">Career Report</span></span>
            <ArrowUpRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
          </span>
          <span className="text-[13px] leading-[17px] font-medium sm:text-[15px] sm:leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{REPORT_SECTIONS.length} sections</span>
        </button>
      </section>

      {/* The one thing to do next — a single action, nothing else in the box */}
      <section aria-labelledby="next-title" className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:p-[var(--space-5)]" style={INSET}>
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Do this next{next ? ` · ${next.minutes} min` : ""}</span>
          <h3 id="next-title" className="text-balance text-[15px] leading-[19px] font-extrabold sm:text-[19px] sm:leading-[24px]" style={{ fontFamily: "var(--font-display)" }}>
            {next ? next.label : "Every step on your plan is done. Add one, or book the counselor meeting."}
          </h3>
        </span>
        {next ? (
          <Link href={next.href} className="dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            <NextIcon className="h-4 w-4" aria-hidden /> {next.action}
          </Link>
        ) : (
          <button type="button" onClick={onGoPlan} className="dm-solid flex min-h-[40px] flex-none cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>Open my plan</button>
        )}
      </section>
    </div>
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
      <div className="relative flex w-full max-w-[560px] flex-col gap-[var(--space-4)] overflow-y-auto border-l p-5 pb-[calc(env(safe-area-inset-bottom)+var(--space-6))] pt-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
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
    <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
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

function MyPlanTab({
  focus, horizonProgress, horizonUnlocked, doneSet, toggleTask, tasksFor,
  addCustomTask, removeCustomTask, onGoRoutes,
}: {
  focus: ProfileCareer | null;
  horizonProgress: (career: ProfileCareer, index: number) => { complete: number; total: number; pct: number };
  horizonUnlocked: (career: ProfileCareer, index: number) => boolean;
  doneSet: (careerId: string) => Set<string>;
  toggleTask: (careerId: string, taskId: string) => void;
  tasksFor: (career: ProfileCareer, horizonId: string) => PlanTask[];
  addCustomTask: (careerId: string, horizonId: string, label: string) => void;
  removeCustomTask: (careerId: string, horizonId: string, taskId: string) => void;
  onGoRoutes: () => void;
}) {
  if (!focus) return null;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <PlanTab
        focus={focus} horizonProgress={horizonProgress} horizonUnlocked={horizonUnlocked}
        doneSet={doneSet} toggleTask={toggleTask} tasksFor={tasksFor} addCustomTask={addCustomTask}
        removeCustomTask={removeCustomTask} onGoPath={onGoRoutes}
      />
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
        <div className="min-h-0 flex-1 overflow-y-auto p-[var(--space-4)] pb-[calc(env(safe-area-inset-bottom)+var(--space-5))] sm:p-[var(--space-5)]">
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

function PlanTab({ focus, horizonProgress, horizonUnlocked, doneSet, toggleTask, tasksFor, addCustomTask, removeCustomTask, onGoPath }: {
  focus: ProfileCareer | null;
  horizonProgress: (career: ProfileCareer, index: number) => { complete: number; total: number; pct: number };
  horizonUnlocked: (career: ProfileCareer, index: number) => boolean;
  doneSet: (careerId: string) => Set<string>;
  toggleTask: (careerId: string, taskId: string) => void;
  tasksFor: (career: ProfileCareer, horizonId: string) => PlanTask[];
  addCustomTask: (careerId: string, horizonId: string, label: string) => void;
  removeCustomTask: (careerId: string, horizonId: string, taskId: string) => void;
  onGoPath: () => void;
}) {
  const [draftTask, setDraftTask] = useState("");
  // Every level starts closed (CEO, 4 Sept): opening into all the steps at
  // once was overwhelming. The student taps the level they want.
  const [openHorizon, setOpenHorizon] = useState<string | null>(null);

  if (!focus) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-8)] text-center" style={INSET}>
        <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Pick a career above to see its plan</p>
        <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Your Top 3 lives at the top of this page. Tap a card or add one.</p>
      </section>
    );
  }

  const allTasks = focus.plan.flatMap((horizon) => tasksFor(focus, horizon.id));
  const doneCount = allTasks.filter((task) => doneSet(focus.id).has(task.id)).length;
  const RULE = "var(--inset-border)";

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* One header surface: title, the change-route link, and the whole-plan
         progress as a single line. Built like the career page's panels: one
         layer of glass, hairlines inside, nothing stacked on top. */}
      <section className="flex flex-col rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={INSET}>
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
          <h2 key={focus.id} className="text-[22px] leading-[26px] font-bold tracking-[-0.01em] sm:text-[26px] sm:leading-[30px]" style={{ fontFamily: "var(--font-display)" }}><InkText text={`Plan for ${focus.title}`} /></h2>
          <button type="button" onClick={onGoPath} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: "var(--accent-subtle)" }}>Change route <ArrowRight size={14} strokeWidth={2.75} aria-hidden /></button>
        </div>
        <div className="mt-[var(--space-4)] flex items-baseline justify-between gap-[var(--space-4)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <span className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>Steps done</span>
          <span className="text-[15px] leading-[22px] font-bold tabular-nums">{doneCount} of {allTasks.length}</span>
        </div>
        <SparkBar className="mt-[var(--space-2)] w-full" percent={Math.round((doneCount / Math.max(allTasks.length, 1)) * 100)} min={2} height={6} track="color-mix(in srgb, var(--accent-subtle) 22%, transparent)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" />
      </section>

      {focus.plan.map((horizon, index) => {
        const unlocked = horizonUnlocked(focus, index);
        const stats = horizonProgress(focus, index);
        // Visibility is never gated (report handoff 11.2): every level opens;
        // only CHECKING OFF waits for the earlier steps.
        const isOpen = openHorizon === horizon.id;
        const tasks = tasksFor(focus, horizon.id);
        return (
          <section key={horizon.id} className="flex w-full flex-col rounded-[var(--radius-lg)] border" style={{ ...INSET, opacity: unlocked ? 1 : 0.85 }}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpenHorizon(isOpen ? null : horizon.id)} className="dm-quiet flex w-full cursor-pointer items-start justify-between gap-[var(--space-4)] rounded-[inherit] p-[var(--space-5)] text-left sm:p-[var(--space-6)]">
              <span className="flex min-w-0 flex-col gap-[2px]">
                <span className="text-[12px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: unlocked ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>Level {index + 1}</span>
                <span className="text-[22px] leading-[26px] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{horizon.title}</span>
                <span className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>{horizon.subtitle}</span>
              </span>
              <span className="flex flex-none flex-col items-end gap-[6px] pt-[4px]">
                <span className="text-[15px] leading-[22px] tabular-nums" style={{ color: stats.complete > 0 ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{stats.complete} of {stats.total}</span>
                <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: isOpen ? "rotate(180deg)" : "none" }} aria-hidden />
              </span>
            </button>
            {isOpen && (
              <div className="filters-reveal flex flex-col px-[var(--space-5)] pb-[var(--space-5)] sm:px-[var(--space-6)] sm:pb-[var(--space-6)]">
                {!unlocked && (
                  <p className="mb-[var(--space-2)] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Recommended after Level {index}. You can read ahead; checking off waits.</p>
                )}
                {/* rows on hairlines, like every row on the career page: the
                   check, the step in body weight, the time, the one action */}
                {tasks.map((task, i) => {
                  const complete = doneSet(focus.id).has(task.id);
                  const TaskIcon = ACTION_ICON[task.action];
                  return (
                    <div key={task.id} className={`flex items-center gap-[12px] py-[11px] ${i === 0 ? "border-t" : "border-t"}`} style={{ borderColor: RULE, opacity: complete ? 0.55 : 1 }}>
                      <button type="button" aria-label={complete ? `Mark "${task.label}" not done` : `Mark "${task.label}" done`} disabled={!unlocked} onClick={() => toggleTask(focus.id, task.id)} className="dm-quiet flex size-[22px] flex-none cursor-pointer items-center justify-center rounded-[6px] border disabled:cursor-default disabled:opacity-40" style={{ background: complete ? "var(--color-feedback-success, #33c78c)" : "transparent", borderColor: complete ? "transparent" : "rgba(255,255,255,0.35)" }}>
                        {complete && <Check className="h-3.5 w-3.5" style={{ color: "#05070f" }} />}
                      </button>
                      <span className={`min-w-0 flex-1 text-[15px] leading-[22px] ${complete ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>
                        {task.label}
                        {task.custom && <span className="ml-[8px] text-[12px] font-semibold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Yours</span>}
                      </span>
                      <span className="flex-none text-[13px] leading-[17px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{task.minutes} min</span>
                      {!complete && !task.custom && (
                        <Link href={task.href} aria-label={`${task.action}: ${task.label}`} title={task.action} className="dm-quiet flex h-[32px] flex-none items-center gap-[6px] rounded-[var(--radius-sm)] px-[10px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                          <TaskIcon className="h-3.5 w-3.5" aria-hidden /> {task.action}
                        </Link>
                      )}
                      {task.custom && (
                        <button type="button" aria-label={`Delete "${task.label}"`} onClick={() => removeCustomTask(focus.id, horizon.id, task.id)} className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] p-[6px]" style={{ color: "var(--muted-foreground)" }}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
                <form
                  className="flex items-center gap-[12px] border-t pt-[11px]"
                  style={{ borderColor: RULE }}
                  onSubmit={(event) => {
                    event.preventDefault();
                    addCustomTask(focus.id, horizon.id, draftTask);
                    setDraftTask("");
                  }}
                >
                  <Plus className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                  <input
                    value={draftTask}
                    onChange={(event) => setDraftTask(event.target.value)}
                    placeholder="Add your own step"
                    className="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
                    style={{ color: "var(--foreground)" }}
                  />
                  <button type="submit" disabled={!draftTask.trim()} className="dm-quiet flex h-[32px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[13px] font-bold disabled:opacity-35" style={{ color: "var(--accent-subtle)" }}>
                    Add
                  </button>
                </form>
              </div>
            )}
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
              College lookup <ChevronRight className="h-3 w-3" />
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

function LockerTab({ locker, top3Count, addToTop3, onClose }: { locker: ProfileCareer[]; top3Count: number; addToTop3: (id: string) => void; onClose: () => void }) {
  // The locker holds two collections: careers the student saved, and the
  // ticket stubs of events they attended (direct feedback, 4 Sept 2026).
  const [shelf, setShelf] = useState<"careers" | "events">("careers");
  const stubCount = EVENTS.filter((e) => e.lifecycle === "Active follow-up").length;
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>{shelf === "careers" ? "Saved" : "Event Stubs"}</h2>
        <span className="flex items-center gap-[var(--space-3)]">
          <span className="text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{shelf === "careers" ? `${locker.length} saved` : `${stubCount} kept`}</span>
          <button type="button" aria-label="Close Saved" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>
      <div role="tablist" aria-label="Locker shelves" className="flex w-fit items-center gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        {([["careers", "Saved"], ["events", "Event Stubs"]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={shelf === id} onClick={() => setShelf(id)} className="dm-quiet min-h-[32px] cursor-pointer rounded-[calc(var(--radius-md)-3px)] px-[14px] text-[13px] leading-[16px] font-semibold" style={{ background: shelf === id ? "var(--foreground)" : "transparent", color: shelf === id ? "var(--background)" : "var(--foreground)" }}>
            {label}
          </button>
        ))}
      </div>
      {shelf === "events" ? (
        <EventStubs />
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
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1 pb-[10px] text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)", paddingTop: "30px" }}>
                  <span className="w-full text-[14px] leading-[16px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
                  <span className="w-full text-[8px] leading-[11px] font-bold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}>{career.world}</span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-[var(--space-2)] p-[10px]" style={{ background: "var(--glass-surface-1)" }}>
                <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                  <span className="truncate text-[14px] leading-[15px] font-bold" style={{ color: "var(--accent-subtle)" }}>{interestTier(career.match)}</span>
                  <span className="text-[8.5px] leading-[11px] font-bold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>From your activity</span>
                </span>
                <button
                  type="button"
                  onClick={() => addToTop3(career.id)}
                  aria-label={top3Count >= 3 ? `Swap ${career.title} into your Top 3` : `Add ${career.title} to your Top 3`}
                  title={top3Count >= 3 ? "Swap into Top 3" : "Add to Top 3"}
                  className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border"
                  style={{ borderColor: "var(--accent-subtle)", color: "var(--accent-subtle)" }}
                >
                  {top3Count >= 3 ? <ArrowLeftRight className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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

function SettingsView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Settings</h2>
        <button type="button" aria-label="Close settings" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex max-w-[560px] flex-col gap-[var(--space-2)]">
        <div className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
          <span className="text-[15px] font-bold">Profile photo</span>
          <span className="text-[15px] font-bold" style={{ color: "var(--muted-foreground)" }}>Tap your avatar to change it</span>
        </div>
        {["Notifications", "Privacy and sharing", "Talent Pipeline opt-in", "Linked school account"].map((item) => (
          <div key={item} className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="text-[15px] font-bold">{item}</span>
            <span className="rounded-[var(--radius-sm)] px-[8px] py-[2px] text-[12px] font-bold tracking-[0.5px] uppercase" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>Soon</span>
          </div>
        ))}
        <button type="button" className="dm-quiet cursor-pointer rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-left text-[15px] font-bold" style={{ background: "var(--glass-surface-1)", color: "var(--destructive)" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function ResumeView() {
  return (
    <section id="resume" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={INSET}>
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <h2 className="text-[19px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Resume Builder</h2>
        {/* Said plainly (CEO, 4 Sept): a partner was told this exists, opened
           it, and found nothing that said it was still being built. */}
        <span className="rounded-[var(--radius-sm)] px-[10px] py-[3px] text-[12px] leading-[16px] font-bold tracking-[0.06em] uppercase" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--accent-subtle)" }}>Coming soon</span>
      </div>
      <p className="max-w-[56ch] text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>The resume builder is being designed now. When it opens, it will build a first draft from your plan and your saved careers, then tailor it to a job and get volunteer feedback.</p>
      {/* rows on hairlines, not cards stacked on the card (CEO, 4 Sept) */}
      <ol className="flex flex-col">
        {["Build it", "Tailor it to a job", "Get volunteer feedback"].map((step, index) => (
          <li key={step} className="flex items-center gap-[var(--space-3)] border-t py-[11px]" style={{ borderColor: "var(--inset-border)" }}>
            <span className="flex size-7 flex-none items-center justify-center rounded-full text-[13px] font-bold tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--accent-subtle)" }}>{index + 1}</span>
            <span className="text-[15px] leading-[22px]">{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-[var(--space-3)]">
        <button type="button" disabled className="w-fit rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-3)] text-[15px] font-bold opacity-50" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
          Opens soon
        </button>
      </div>
    </section>
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
    <div className="print-overlay fixed inset-0 z-[70] overflow-y-auto" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)" }}>
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-[var(--space-2)] px-5 py-3 backdrop-blur-[10px]" style={{ background: "var(--glass-surface-3)" }}>
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
              <p className="text-[14px] font-bold">{horizon.title} <span className="font-normal text-[#6b7280]">· {horizon.subtitle}</span></p>
              <ul className="mt-1 list-disc pl-5 text-[15px] leading-[19px]">
                {tasksFor(career, horizon.id).map((task) => (
                  <li key={task.id}>{task.label} · {task.minutes} min{task.custom ? " (added by student)" : ""}</li>
                ))}
              </ul>
            </div>
          ))}
          {next && <p className="mt-2 text-[15px] font-bold">Immediate next step: {next.label} ({next.minutes} min)</p>}
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
