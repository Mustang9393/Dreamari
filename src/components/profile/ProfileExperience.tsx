"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Archive,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  FileDown,
  Flame,
  Gamepad2,
  GraduationCap,
  Lock,
  Plane,
  Pencil,
  Plus,
  Printer,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { MatchRing, matchTier } from "@/components/app/MatchRing";
import { InkText } from "@/components/build/ui";
import { posterTitleFont, TEXT_SCRIM, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS, routeDetail, STUDENT, type PlanTask, type ProfileCareer, type Receipt } from "./data";

// My Profile, round 2: scannable and visual. No paragraphs, no em dashes.
// Evidence renders as receipt tiles, routes disclose progressively with a
// Compare view (labeled single-hue bars), the plan opens only the current
// horizon, and the Career Locker is its own tab plus a strip at the end of
// Overview. College Lookup CTAs point at /colleges (feature in the works).

type TabId = "overview" | "path" | "plan" | "locker" | "resume" | "settings";

const ACTION_ICON = { Play: Gamepad2, Explore: Compass, Join: Users, Build: BookOpen } as const;
const RECEIPT_ICON: Record<Receipt["kind"], typeof Check> = {
  sim: Gamepad2,
  level: Trophy,
  saved: Bookmark,
  streak: Flame,
  scenario: Target,
  watched: Eye,
};

function careerById(id: string | null): ProfileCareer | null {
  return ALL_PROFILE_CAREERS.find((career) => career.id === id) ?? null;
}


const CAPTION = "text-[10px] leading-[14px] font-semibold tracking-[0.6px] uppercase";
const GLASS = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" } as const;

export function ProfileExperience() {
  const [tab, setTab] = useState<TabId>("overview");
  const [top3, setTop3] = useState<string[]>(["investment-banking", "airline-pilot"]);
  const [focusId, setFocusId] = useState<string | null>("investment-banking");
  const [routeChoice, setRouteChoice] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, string[]>>({});
  const [swapCandidate, setSwapCandidate] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  // "Updated" pulses on every tab whose content just changed (focus swap
  // touches report + routes + plan; a route choice touches report + plan).
  // The tab currently in view is skipped: the change is visible live there.
  const [pings, setPings] = useState<Partial<Record<TabId, boolean>>>({});
  const pingTimer = useRef<number | null>(null);
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
    pingTabs(["overview", "path", "plan"]);
  }, [focusId]);
  useEffect(() => {
    if (!pingMounted.current) {
      pingMounted.current = true;
      return;
    }
    pingTabs(["overview", "plan"]);
  }, [routeChoice]);
  const [reportOpen, setReportOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(STUDENT.avatar);
  const [customTasks, setCustomTasks] = useState<Record<string, PlanTask[]>>({}); // key: careerId:horizonId

  const focus = careerById(focusId);
  const locker = useMemo(() => ALL_PROFILE_CAREERS.filter((career) => !top3.includes(career.id)).sort((a, b) => b.match - a.match), [top3]);

  const chosenRoute = (career: ProfileCareer) => career.routes.find((route) => route.id === routeChoice[career.id]) ?? career.routes[0];
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
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src="/images/app/background-space.svg" className="absolute top-0 left-0 h-[2602px] w-full max-w-none object-cover" />
      </div>

      <div className="no-print">
        <DesktopNavigation active="Profile" />
      </div>

      <header className="no-print relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <span className="flex items-center gap-[var(--space-4)] text-[13px] font-bold">
          <span className="flex items-center gap-[6px]" style={{ color: "var(--accent)" }}>
            <Flame className="h-4 w-4" /> {STUDENT.streakDays}
          </span>
          <QuickLinksMenu />
        </span>
      </header>

      <main className="no-print relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] md:px-[var(--space-14)] md:pt-[var(--space-10)]">
        {/* ---- Identity: the focus career's art follows the switch ---- */}
        <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          {focus && (
            <div aria-hidden className="absolute inset-y-0 right-0 w-[75%] opacity-80 sm:w-[58%]" style={{ maskImage: "linear-gradient(90deg, transparent 0%, #000 45%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 45%)" }}>
              <Image src={focus.photo} alt="" fill sizes="420px" priority className="object-cover object-[center_35%]" />
            </div>
          )}
          {focus && <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${WORLD_COLORS[focus.world]} 10%, transparent) 0%, transparent 45%)` }} />}
          {/* Progress-blue backdrop, left to right, so the header signals stay legible over the art */}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 30%, color-mix(in srgb, var(--primary) 16%, color-mix(in srgb, var(--background) 88%, transparent)) 62%, color-mix(in srgb, var(--primary) 30%, var(--background)) 100%)" }} />
          <div className="relative flex flex-col gap-[var(--space-5)] p-[var(--space-6)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-[var(--space-4)]">
              <label className="group relative size-16 flex-none cursor-pointer" aria-label="Change profile photo">
                <img src={avatarUrl} alt={`${STUDENT.name}'s profile photo`} className="size-16 rounded-full border-[1.5px] object-cover" style={{ borderColor: "var(--accent)" }} />
                <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border transition-transform group-hover:scale-110" style={{ background: "var(--primary)", borderColor: "var(--background)", color: "var(--primary-foreground)" }}>
                  <Pencil className="h-3 w-3" />
                </span>
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAvatarUrl(URL.createObjectURL(file)); }} />
              </label>
              <span className="flex flex-col gap-[2px]">
                <span className="text-[24px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.name}</span>
                <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{STUDENT.grade} · {STUDENT.school}</span>
              </span>
            </div>
            <div className="flex flex-col items-start gap-[var(--space-3)] sm:items-end">
              {/* Utility pills: labeled so the Locker is findable, small so it
                  reads as an archive rather than a main destination. */}
              <span className="flex items-center gap-[var(--space-2)]">
                <button type="button" aria-label="Open Career Locker" onClick={() => setTab("locker")} className="flex h-8 cursor-pointer items-center gap-[6px] rounded-full px-[10px] text-[11.5px] font-bold" style={{ background: tab === "locker" ? "var(--glass-surface-3)" : "transparent", color: tab === "locker" ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
                  <Archive className="h-3.5 w-3.5" /> Locker
                </button>
                <button type="button" aria-label="Profile settings" onClick={() => setTab("settings")} className="flex h-8 cursor-pointer items-center gap-[6px] rounded-full px-[10px] text-[11.5px] font-bold" style={{ background: tab === "settings" ? "var(--glass-surface-3)" : "transparent", color: tab === "settings" ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
                  <Settings className="h-3.5 w-3.5" /> Settings
                </button>
              </span>
              <span className="flex items-center gap-[8px]">
                <Flame className="h-5 w-5" style={{ color: "var(--chart-3)" }} />
                <span className="flex flex-col">
                  <span className="text-[19px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.streakDays} days</span>
                  <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Streak</span>
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Utility views (Locker, Settings) take over everything under the
            header; the Top 3 and tabs belong to the career-facing views. */}
        {(tab === "locker" || tab === "settings") ? null : (
        <>
        {/* ---- My Top 3: the profile's context switcher, above the tabs.
             Tap a card and every tab below shows that career. ---- */}
        <section className="flex flex-col gap-[var(--space-2)]">
          <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-2)]">
            <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>My Top 3</h2>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tap a card to switch focus</span>
          </div>
          <FocusPicker top3={top3} focus={focus} setFocusId={setFocusId} onAdd={() => setAddOpen(true)} onRemove={removeFromTop3} />
        </section>

        {/* ---- Tabs ---- */}
        <div className="flex w-full items-center gap-[var(--space-1)] rounded-[var(--radius-xl)] border p-[var(--space-1)]" style={GLASS}>
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "path", label: "Path" },
              { id: "plan", label: "Plan" },
              { id: "resume", label: "Resume" },
            ] as const
          ).map((item) => (
            <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className="relative flex-1 cursor-pointer rounded-[var(--radius-md-alt)] px-[var(--space-2)] py-[7px] text-center text-[13px] leading-[18px] font-bold" style={{ background: tab === item.id ? "var(--primary)" : "transparent", color: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)" }}>
              {item.label}
              {pings[item.id] && (
                <span className="filters-reveal absolute -top-[7px] right-[6px] rounded-full px-[7px] py-[1px] text-[8.5px] font-bold tracking-[0.4px] uppercase" style={{ background: "var(--accent-subtle)", color: "var(--primary-foreground)" }}>Updated</span>
              )}
            </button>
          ))}
        </div>
        </>
        )}

        {tab === "overview" && (
          <OverviewTab focus={focus} chosenRoute={chosenRoute} planProgress={planProgress} nextTask={nextTask} onExport={() => setReportOpen(true)} onGoPath={() => setTab("path")} onGoLocker={() => setTab("locker")} />
        )}
        {tab === "path" && (
          <PathTab focus={focus} chosenRoute={chosenRoute} setRouteChoice={setRouteChoice} onGoPlan={() => setTab("plan")} />
        )}
        {tab === "plan" && (
          <PlanTab focus={focus} chosenRoute={chosenRoute} horizonProgress={horizonProgress} horizonUnlocked={horizonUnlocked} doneSet={doneSet} toggleTask={toggleTask} tasksFor={tasksFor} addCustomTask={addCustomTask} removeCustomTask={removeCustomTask} onGoPath={() => setTab("path")} />
        )}
        {tab === "locker" && <LockerTab locker={locker} top3Count={top3.length} addToTop3={addToTop3} onClose={() => setTab("overview")} />}
        {tab === "settings" && <SettingsView onClose={() => setTab("overview")} />}
        {tab === "resume" && <ResumeTab />}
      </main>

      <div className="no-print">
        <MobileNav active="Profile" />
      </div>

      {/* ---- Swap sheet ---- */}
      {swapCandidate && (
        <div className="no-print fixed inset-0 z-[60] flex items-end justify-center sm:items-center" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setSwapCandidate(null); }}>
          <div className="filters-reveal w-full max-w-[440px] rounded-t-[var(--radius-2xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-2xl)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Top 3 is full</p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted-foreground)" }}>Swap one out for <strong style={{ color: "var(--foreground)" }}>{careerById(swapCandidate)?.title}</strong>. It returns to your locker.</p>
            <div className="mt-4 flex flex-col gap-[var(--space-2)]">
              {top3.map((id, index) => {
                const career = careerById(id)!;
                return (
                  <button key={id} type="button" onClick={() => confirmSwap(id)} className="flex cursor-pointer items-center justify-between rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)] text-left" style={GLASS}>
                    <span className="text-[14px] font-semibold">{index + 1} · {career.title}</span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--accent-subtle)" }}>Replace</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setSwapCandidate(null)} className="mt-4 w-full cursor-pointer rounded-[var(--radius-md)] border py-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Never mind
            </button>
          </div>
        </div>
      )}

      {/* ---- Add-from-Locker sheet: pick right here, no tab switch ---- */}
      {addOpen && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <div className="filters-reveal w-full max-w-[420px] rounded-t-[var(--radius-2xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-2xl)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <div>
                <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Add to your Top 3</p>
                <p className="mt-[2px] text-[12px]" style={{ color: "var(--muted-foreground)" }}>{3 - top3.length} open {top3.length === 2 ? "slot" : "slots"} · from your Locker</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-[var(--space-4)] flex max-h-[50vh] flex-col gap-[var(--space-2)] overflow-y-auto">
              {locker.length === 0 && (
                <Link href="/match-lab" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-center text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Locker is empty · swipe careers</Link>
              )}
              {locker.map((career) => (
                <div key={career.id} className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border p-[var(--space-2)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="relative h-[52px] w-[38px] flex-none overflow-hidden rounded-[8px]">
                    <Image src={career.photo} alt="" fill sizes="38px" className="object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-bold">{career.title}</span>
                    <span className="truncate text-[10.5px] font-semibold" style={{ color: WORLD_COLORS[career.world] }}>{career.world} · {matchTier(career.match)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { addToTop3(career.id); if (top3.length >= 2) setAddOpen(false); }}
                    className="flex-none cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-[12px] font-bold"
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

function FocusPicker({ top3, focus, setFocusId, onAdd, onRemove, compact }: { top3: string[]; focus: ProfileCareer | null; setFocusId: (id: string) => void; onAdd: () => void; onRemove?: (id: string) => void; compact?: boolean }) {
  const emptySlots = Math.max(0, 3 - top3.length);
  const containerClass = compact
    ? "flex gap-[var(--space-2)] overflow-x-auto pb-1 [scrollbar-width:none] md:gap-[var(--space-3)]"
    : "flex gap-[var(--space-3)] overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-[var(--space-4)] md:overflow-visible md:pb-0";
  const cardClass = compact
    ? "relative h-[148px] w-[104px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border-2 text-center uppercase select-none md:h-[184px] md:w-[132px]"
    : "relative h-[210px] w-[148px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-xl)] border-2 text-center uppercase select-none md:aspect-[148/128] md:h-auto md:w-full";
  return (
    <div className={containerClass} style={{ touchAction: "pan-x pan-y" }}>
      {top3.map((id, index) => {
        const career = careerById(id)!;
        const isFocus = focus?.id === id;
        return (
          <button
            key={id}
            data-top3-card
            type="button"
            aria-pressed={isFocus}
            onClick={() => setFocusId(id)}
            className={cardClass}
            style={{ containerType: "inline-size", borderColor: isFocus ? "var(--primary)" : "var(--glass-border)", opacity: isFocus ? 1 : 0.72, transform: isFocus ? "scale(1)" : "scale(0.97)", transition: "transform 160ms ease", WebkitUserSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}
          >
            <Image src={career.photo} alt="" fill sizes={compact ? "132px" : "(min-width: 768px) 340px, 148px"} className="object-cover" />
            <span className={compact ? "absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold" : "absolute top-2 left-2 flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold md:top-3 md:left-3 md:size-8 md:text-[14px]"} style={{ background: "var(--glass-surface-3)", color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
              {index + 1}
            </span>
            <span className={`absolute flex items-center ${compact ? "top-1.5 right-1.5 gap-[4px]" : "top-2 right-2 gap-[6px] md:top-3 md:right-3"}`}>
              {isFocus && !compact && (
                <span className="rounded-full px-[8px] py-[2px] text-[8.5px] font-bold tracking-[0.6px] md:px-[10px] md:py-[3px] md:text-[10px]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>FOCUS</span>
              )}
              {onRemove && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${career.title} from Top 3`}
                  onClick={(event) => { event.stopPropagation(); onRemove(id); }}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onRemove(id); } }}
                  className={`flex cursor-pointer items-center justify-center rounded-full ${compact ? "size-5" : "size-6"}`}
                  style={{ background: "var(--glass-surface-3)", color: "var(--muted-foreground)" }}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </span>
            <span className={`absolute inset-x-0 bottom-0 flex flex-col items-center px-1 ${compact ? "gap-[2px] pt-[18px] pb-[7px]" : "gap-[4px] pt-[26px] pb-[10px] md:px-3 md:pb-[14px]"}`} style={{ backgroundImage: TEXT_SCRIM }}>
              <span className="w-full text-balance [overflow-wrap:normal]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)", fontSize: "clamp(11px, calc(7px + 4cqw), 22px)", lineHeight: 1.15 }}>{career.title}</span>
              <span className="w-full font-semibold" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world], fontSize: "clamp(7px, calc(4.5px + 2cqw), 11.5px)", lineHeight: 1.35, letterSpacing: "0.5px" }}>{career.world}</span>
            </span>
          </button>
        );
      })}
      {Array.from({ length: emptySlots }).map((_, slot) => (
        <button
          key={`empty-${slot}`}
          type="button"
          onClick={onAdd}
          className={`flex flex-none cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors ${compact ? "h-[148px] w-[104px] gap-[6px] rounded-[var(--radius-lg)] md:h-[184px] md:w-[132px]" : "h-[210px] w-[148px] gap-[var(--space-2)] rounded-[var(--radius-xl)] md:aspect-[148/128] md:h-auto md:w-full"}`}
          style={{ containerType: "inline-size", borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
        >
          <span className={`flex items-center justify-center rounded-full ${compact ? "size-8" : "size-9 md:size-12"}`} style={{ background: "var(--glass-surface-3)" }}>
            <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4 md:h-5 md:w-5"} style={{ color: "var(--accent-subtle)" }} />
          </span>
          <span className="px-2 font-bold" style={{ color: "var(--foreground)", fontSize: "clamp(10.5px, calc(8px + 2.4cqw), 15px)", lineHeight: 1.3 }}>Add a career</span>
          <span className="px-2 font-semibold" style={{ color: "var(--muted-foreground)", fontSize: "clamp(9px, calc(7px + 1.8cqw), 12px)", lineHeight: 1.3 }}>From your Locker</span>
        </button>
      ))}
    </div>
  );
}

function ReceiptTiles({ receipts }: { receipts: Receipt[] }) {
  return (
    <div className="seq-reveal grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-4">
      {receipts.map((receipt) => {
        const ReceiptIcon = RECEIPT_ICON[receipt.kind];
        return (
          <span key={receipt.label} className="flex flex-col gap-[6px] rounded-[var(--radius-xl)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)" }}>
            <span className="flex items-start justify-between gap-[6px]">
              <span className="min-w-0 truncate text-[9px] leading-[14px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }} title={receipt.label}>{receipt.label}</span>
              <ReceiptIcon className="h-3.5 w-3.5 flex-none" style={{ color: "var(--accent-subtle)" }} />
            </span>
            <span className="mt-auto text-[26px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{receipt.value}</span>
          </span>
        );
      })}
    </div>
  );
}

function OverviewTab({
  focus,
  chosenRoute,
  planProgress,
  nextTask,
  onExport,
  onGoPath,
  onGoLocker,
}: {
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  planProgress: (career: ProfileCareer) => { complete: number; total: number; pct: number };
  nextTask: (career: ProfileCareer) => PlanTask | null;
  onExport: () => void;
  onGoPath: () => void;
  onGoLocker: () => void;
}) {
  if (!focus) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-4)] rounded-[var(--radius-2xl)] border p-[var(--space-10)] text-center" style={GLASS}>
        <p className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Pick a Top 3 to start</p>
        <div className="flex gap-[var(--space-3)]">
          <Link href="/match-lab" className="rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-3)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Swipe careers</Link>
          <button type="button" onClick={onGoLocker} className="cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-5)] py-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>Open Locker</button>
        </div>
      </section>
    );
  }

  const route = chosenRoute(focus);
  const progress = planProgress(focus);
  const next = nextTask(focus);
  const NextIcon = next ? ACTION_ICON[next.action] : Compass;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Career Report */}
      <section className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-2xl)] border p-[var(--space-6)]" style={GLASS}>
        <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-2)]">
          <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Career Report · Today</span>
          <span className="text-[11px] font-semibold tracking-[0.6px] uppercase" style={{ color: WORLD_COLORS[focus.world] }}>{focus.world}</span>
        </div>
        <p key={focus.id} className="text-[28px] leading-[32px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}><InkText text={focus.title} /></p>

        <div className="seq-reveal grid grid-cols-1 gap-[var(--space-2)] sm:grid-cols-3">
          <span className="relative flex flex-col gap-[4px] rounded-[var(--radius-xl)] p-[var(--space-4)] pr-[68px]" style={{ background: "var(--glass-surface-2)" }}>
            <span className="text-[9px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>Match</span>
            <span className="min-w-0 truncate text-[20px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{matchTier(focus.match)}</span>
            <span className="text-[10.5px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>From your activity</span>
            <span className="absolute top-1/2 right-[var(--space-4)] -translate-y-1/2">
              <MatchRing score={focus.match} size={46} />
            </span>
          </span>
          <span className="flex flex-col gap-[4px] rounded-[var(--radius-xl)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)" }}>
            <span className="text-[9px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>Route</span>
            <span className="text-[20px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{route.type}</span>
            <span className="truncate text-[10.5px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{route.program}</span>
          </span>
          <span className="flex flex-col gap-[5px] rounded-[var(--radius-xl)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)" }}>
            <span className="flex items-baseline justify-between">
              <span className="text-[9px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>Plan</span>
              <span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{progress.complete === 0 ? "10 min start" : `${progress.complete}/${progress.total}`}</span>
            </span>
            <span className="text-[20px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{progress.complete === 0 ? "Ready" : `${progress.pct}%`}</span>
            <span className="relative h-[6px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }}>
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(progress.pct, 2)}%`, background: "var(--accent-subtle)" }} />
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Your receipts</span>
          <ReceiptTiles receipts={focus.receipts} />
        </div>

        <div className="flex flex-wrap gap-[var(--space-3)]">
          <button type="button" onClick={onExport} className="flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-3)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <FileDown className="h-4 w-4" /> Export report
          </button>
          <button type="button" onClick={onGoPath} className="flex cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] border px-[var(--space-5)] py-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>
            My Path <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Next action */}
      {next && (
        <section className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-2xl)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--primary) 14%, var(--glass-surface-1))", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))" }}>
          <span className="flex min-w-0 flex-col gap-[2px]">
            <span className={CAPTION} style={{ color: "var(--accent-subtle)" }}>Next · {next.minutes} min</span>
            <span className="text-[15px] leading-[20px] font-bold">{next.label}</span>
          </span>
          <Link href={next.href} className="flex flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-bold" style={{ background: "var(--foreground)", color: "var(--background)" }}>
            <NextIcon className="h-4 w-4" /> {next.action}
          </Link>
        </section>
      )}

    </div>
  );
}

// ---- Compare charts: one measure per chart, single hue, labeled bars ----

function CompareChart({ title, better, unit, rows, selectedId }: { title: string; better: "lower" | "higher"; unit: (value: number) => string; rows: { id: string; name: string; value: number }[]; selectedId: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-bold">{title}</span>
        <span className="text-[9px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{better} is better</span>
      </div>
      <div className="flex flex-col gap-[6px]">
        {rows.map((row) => (
          <div key={row.id} title={`${row.name}: ${unit(row.value)}`} className="flex items-center gap-[8px]">
            <span className="w-[88px] flex-none truncate text-[10.5px] leading-[14px] font-semibold" style={{ color: row.id === selectedId ? "var(--foreground)" : "var(--muted-foreground)" }}>{row.name}</span>
            <span className="relative h-[10px] min-w-0 flex-1">
              <span className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: `${Math.max((row.value / max) * 100, 2)}%`, background: row.id === selectedId ? "var(--accent-subtle)" : "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }} />
            </span>
            <span className="w-[52px] flex-none text-right text-[10.5px] font-bold">{unit(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PathTab({ focus, chosenRoute, setRouteChoice, onGoPlan }: {
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  setRouteChoice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onGoPlan: () => void;
}) {
  const [routeView, setRouteView] = useState<"cards" | "compare">("cards");
  // Mobile: the route the carousel is resting on, for the switcher pills.
  const [visibleRoute, setVisibleRoute] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);

  if (!focus) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-2xl)] border p-[var(--space-8)] text-center" style={GLASS}>
        <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Pick a career above to see its routes</p>
        <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Your Top 3 lives at the top of this page. Tap a card or add one.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Three ALTERNATE ways in, side by side */}
      <h2 key={focus.id} className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}><InkText text={`Ways into ${focus.title}`} /></h2>

      {routeView === "cards" ? (
        <>
        {/* ONE control row: route pills + the Compare view, nothing else */}
        <div className="-mt-[6px] flex flex-wrap items-center gap-[var(--space-2)]">
          {focus.routes.map((routeOption, index) => (
            <button
              key={routeOption.id}
              type="button"
              aria-pressed={visibleRoute === index}
              onClick={() => {
                const card = railRef.current?.children[index] as HTMLElement | undefined;
                card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                setVisibleRoute(index);
              }}
              className="cursor-pointer rounded-full px-[12px] py-[5px] text-[11.5px] font-bold"
              style={{ background: visibleRoute === index ? "var(--primary)" : "transparent", color: visibleRoute === index ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
            >
              <span className="flex items-center gap-[4px]">
                {routeOption.recommended && <Sparkles className="h-3 w-3" style={{ color: visibleRoute === index ? "var(--primary-foreground)" : "var(--accent-subtle)" }} />}
                {routeOption.short}
              </span>
            </button>
          ))}
          <span aria-hidden className="h-[16px] w-px" style={{ background: "var(--glass-border)" }} />
          <button
            type="button"
            aria-pressed={false}
            onClick={() => setRouteView("compare")}
            className="cursor-pointer rounded-full px-[12px] py-[5px] text-[11.5px] font-bold"
            style={{ background: "transparent", color: "var(--muted-foreground)" }}
          >
            Compare
          </button>
        </div>
        <div className="relative">
          <div
            ref={railRef}
            onScroll={(event) => {
              const rail = event.currentTarget;
              const step = rail.scrollWidth / focus.routes.length;
              setVisibleRoute(Math.min(focus.routes.length - 1, Math.max(0, Math.round(rail.scrollLeft / step))));
            }}
            className="-mx-5 flex snap-x snap-mandatory gap-[var(--space-3)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:-mx-[calc((100vw-100%)/2)] md:gap-[var(--space-4)] md:px-[calc((100vw-100%)/2)]"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {focus.routes.map((routeOption) => (
              <RouteColumn
                key={routeOption.id}
                route={routeOption}
                selected={chosenRoute(focus).id === routeOption.id}
                onSelect={() => setRouteChoice((current) => ({ ...current, [focus.id]: routeOption.id }))}
                onGoPlan={onGoPlan}
              />
            ))}
          </div>
          {/* Desktop: previous / next route */}
          <button
            type="button"
            aria-label="Previous route"
            disabled={visibleRoute === 0}
            onClick={() => { const card = railRef.current?.children[visibleRoute - 1] as HTMLElement | undefined; card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
            className="absolute top-1/2 -left-[48px] z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30 md:flex"
            style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", color: "var(--foreground)", backdropFilter: "blur(8px)" }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next route"
            disabled={visibleRoute >= focus.routes.length - 1}
            onClick={() => { const card = railRef.current?.children[visibleRoute + 1] as HTMLElement | undefined; card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
            className="absolute top-1/2 -right-[48px] z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30 md:flex"
            style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", color: "var(--foreground)", backdropFilter: "blur(8px)" }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        </>
      ) : (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="-mt-[6px] flex items-center gap-[var(--space-2)]">
            <button type="button" onClick={() => setRouteView("cards")} className="cursor-pointer rounded-full px-[12px] py-[5px] text-[11.5px] font-bold" style={{ background: "transparent", color: "var(--muted-foreground)" }}><span className="inline-flex items-center gap-[4px]"><ArrowLeft size={12} strokeWidth={2.75} aria-hidden />Cards</span></button>
            <span className="rounded-full px-[12px] py-[5px] text-[11.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Compare</span>
          </div>
          <CompareTable routes={focus.routes} selectedId={chosenRoute(focus).id} />
          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
            <CompareChart title="Total cost" better="lower" unit={(value) => (value === 0 ? "$0" : `$${value}K`)} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.costMidK }))} selectedId={chosenRoute(focus).id} />
            <CompareChart title="Years to job" better="lower" unit={(value) => `${value} yr`} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.years }))} selectedId={chosenRoute(focus).id} />
            <CompareChart title="First-year pay" better="higher" unit={(value) => `$${value}K`} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.payMidK }))} selectedId={chosenRoute(focus).id} />
            <CompareChart title="Loan payoff" better="lower" unit={(value) => (value === 0 ? "None" : `${value} yr`)} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.payoffYears }))} selectedId={chosenRoute(focus).id} />
          </div>
        </div>
      )}
    </div>
  );
}

function PlanTab({ focus, chosenRoute, horizonProgress, horizonUnlocked, doneSet, toggleTask, tasksFor, addCustomTask, removeCustomTask, onGoPath }: {
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
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
  const [openHorizon, setOpenHorizon] = useState<string | null>(null);

  if (!focus) {
    return (
      <section className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-2xl)] border p-[var(--space-8)] text-center" style={GLASS}>
        <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Pick a career above to see its plan</p>
        <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Your Top 3 lives at the top of this page. Tap a card or add one.</p>
      </section>
    );
  }

  const currentHorizonId = (career: ProfileCareer) => {
    for (let index = 0; index < career.plan.length; index++) {
      if (!horizonUnlocked(career, index)) break;
      if (tasksFor(career, career.plan[index].id).some((task) => !doneSet(career.id).has(task.id))) return career.plan[index].id;
    }
    return career.plan[0].id;
  };
  const allTasks = focus.plan.flatMap((horizon) => tasksFor(focus, horizon.id));
  const doneCount = allTasks.filter((task) => doneSet(focus.id).has(task.id)).length;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-2)]">
        <div>
          <h2 key={focus.id} className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}><InkText text={`Plan · ${focus.title}`} /></h2>
          <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Next steps, clear and small · built for the {chosenRoute(focus).short} route</p>
        </div>
        <button type="button" onClick={onGoPath} className="cursor-pointer text-[12px] font-bold" style={{ color: "var(--accent-subtle)" }}><span className="inline-flex items-center gap-[4px]">Change route <ArrowRight size={12} strokeWidth={2.75} aria-hidden /></span></button>
      </div>

      {/* Your roadmap: overall progress across every step */}
      <section className="flex flex-wrap items-center justify-between gap-x-[var(--space-8)] gap-y-[var(--space-4)] rounded-[var(--radius-2xl)] border p-[var(--space-4)]" style={GLASS}>
        <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Your roadmap</span>
          <span className="text-[19px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{doneCount}/{allTasks.length} steps done</span>
          <span className="relative h-[6px] w-full max-w-[420px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }}>
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(Math.round((doneCount / Math.max(allTasks.length, 1)) * 100), 2)}%`, background: "var(--accent-subtle)" }} />
          </span>
        </span>
      </section>
      <div className="flex flex-col gap-[var(--space-3)]">
        {focus.plan.map((horizon, index) => {
          const unlocked = horizonUnlocked(focus, index);
          const stats = horizonProgress(focus, index);
          const isOpen = unlocked && (openHorizon ? openHorizon === horizon.id : currentHorizonId(focus) === horizon.id);
          return (
            <div key={horizon.id} className="overflow-hidden rounded-[var(--radius-2xl)] border" style={{ ...GLASS, opacity: unlocked ? 1 : 0.55 }}>
              <button type="button" aria-expanded={isOpen} disabled={!unlocked} onClick={() => setOpenHorizon(isOpen ? "none" : horizon.id)} className="flex w-full cursor-pointer items-center justify-between gap-[var(--space-3)] p-[var(--space-4)] text-left disabled:cursor-default">
                <span className="flex min-w-0 items-center gap-[var(--space-3)]">
                  <span className="flex size-8 flex-none items-center justify-center rounded-full text-[13px] font-extrabold" style={{ fontFamily: "var(--font-display)", background: unlocked ? "var(--primary)" : "var(--glass-surface-2)", color: unlocked ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>{index + 1}</span>
                  <span className="flex min-w-0 flex-col">
                    <span className={CAPTION} style={{ color: unlocked ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>Level {index + 1}</span>
                    <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{horizon.title}</span>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{horizon.subtitle}</span>
                  </span>
                </span>
                <span className="flex flex-none items-center gap-[var(--space-3)]">
                  {unlocked ? (
                    <>
                      <MatchRing score={Math.round(stats.pct * 100)} size={38} />
                      <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: isOpen ? "rotate(180deg)" : "none" }} />
                    </>
                  ) : (
                    <span className="flex items-center gap-[6px] text-[10px] font-semibold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>
                      <Lock className="h-3.5 w-3.5" /> Unlocks at 40% of Level {index}
                    </span>
                  )}
                </span>
              </button>
              {isOpen && (
                <div className="filters-reveal flex flex-col gap-[var(--space-2)] border-t p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                  {tasksFor(focus, horizon.id).map((task) => {
                    const complete = doneSet(focus.id).has(task.id);
                    const TaskIcon = ACTION_ICON[task.action];
                    return (
                      <div key={task.id} className="flex items-center gap-[10px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)]" style={{ background: "var(--glass-surface-1)", opacity: complete ? 0.6 : 1 }}>
                        <button type="button" aria-label={complete ? `Mark "${task.label}" not done` : `Mark "${task.label}" done`} onClick={() => toggleTask(focus.id, task.id)} className="flex size-5 flex-none cursor-pointer items-center justify-center rounded-[6px] border" style={{ background: complete ? "var(--color-feedback-success, #33c78c)" : "transparent", borderColor: complete ? "transparent" : "var(--glass-stroke, rgba(255,255,255,0.3))" }}>
                          {complete && <Check className="h-3.5 w-3.5" style={{ color: "#05070f" }} />}
                        </button>
                        <span className={`min-w-0 flex-1 text-[12.5px] leading-[17px] font-semibold ${complete ? "line-through" : ""}`}>{task.label}</span>
                        {task.custom && (
                          <span className="flex-none rounded-full px-[8px] py-[2px] text-[8.5px] font-bold tracking-[0.4px] uppercase" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>Yours</span>
                        )}
                        <span className="flex-none text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{task.minutes} min</span>
                        {!complete && !task.custom && (
                          <Link href={task.href} aria-label={`${task.action}: ${task.label}`} title={task.action} className="flex flex-none items-center rounded-full border p-[6px]" style={{ borderColor: "var(--glass-border)", color: "var(--accent-subtle)" }}>
                            <TaskIcon className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        {task.custom && (
                          <button type="button" aria-label={`Delete "${task.label}"`} onClick={() => removeCustomTask(focus.id, horizon.id, task.id)} className="flex-none cursor-pointer rounded p-[2px]" style={{ color: "var(--muted-foreground)" }}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {/* Add your own step */}
                  <form
                    className="flex items-center gap-[8px] rounded-[var(--radius-md)] border border-dashed px-[var(--space-3)] py-[var(--space-2)]"
                    style={{ borderColor: "var(--glass-border)" }}
                    onSubmit={(event) => {
                      event.preventDefault();
                      addCustomTask(focus.id, horizon.id, draftTask);
                      setDraftTask("");
                    }}
                  >
                    <Plus className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} />
                    <input
                      value={draftTask}
                      onChange={(event) => setDraftTask(event.target.value)}
                      placeholder="Add your own step"
                      className="min-w-0 flex-1 bg-transparent text-[12.5px] font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
                      style={{ color: "var(--foreground)" }}
                    />
                    <button type="submit" disabled={!draftTask.trim()} className="flex-none cursor-pointer rounded-full border px-[12px] py-[4px] text-[11px] font-bold disabled:opacity-35" style={{ borderColor: "var(--accent-subtle)", color: "var(--accent-subtle)" }}>
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="pt-[var(--space-2)] text-center text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        You&apos;re building something real. <span style={{ color: "var(--accent-subtle)" }}>Every step brings your future closer.</span>
      </p>
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
function RouteColumn({ route, selected, onSelect, onGoPlan }: { route: ProfileCareer["routes"][number]; selected: boolean; onSelect: () => void; onGoPlan: () => void }) {
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
      className="flex w-[86vw] max-w-[340px] flex-none snap-center flex-col gap-[var(--space-4)] rounded-[var(--radius-2xl)] border-2 p-[var(--space-5)] md:grid md:w-[86%] md:max-w-[880px] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:grid-rows-[auto_auto_1fr] md:gap-x-[var(--space-8)] md:p-[var(--space-6)] md:[grid-template-areas:'chips_tabs'_'head_pane'_'decide_pane']"
      style={{ background: selected ? "color-mix(in srgb, var(--primary) 10%, var(--glass-surface-1))" : "var(--glass-surface-1)", borderColor: selected ? "var(--primary)" : "var(--glass-border)" }}
    >
      {/* Status chips */}
      <div className="flex items-center gap-[6px] md:[grid-area:chips]">
        {route.recommended && (
          <span className="flex items-center gap-[4px] rounded-full px-[10px] py-[3px] text-[9.5px] font-bold tracking-[0.6px] whitespace-nowrap uppercase" style={{ background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" }}>
            <Sparkles className="h-3 w-3" /> Recommended
          </span>
        )}
        {selected && <span className="rounded-full px-[10px] py-[3px] text-[9.5px] font-bold tracking-[0.6px] whitespace-nowrap uppercase" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Your path</span>}
      </div>

      {/* Editorial masthead: kicker, headline, deck, meta */}
      <div className="seq-reveal flex flex-col gap-[var(--space-2)] md:self-start md:[grid-area:head]">
        <span className="flex items-center gap-[6px] text-[10px] font-bold tracking-[1.2px] uppercase" style={{ color: selected ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>
          <Icon className="h-3.5 w-3.5" /> {route.type}
        </span>
        <h3 className="text-[30px] leading-[32px] font-extrabold md:text-[38px] md:leading-[40px]" style={{ fontFamily: "var(--font-display)" }}><InkText text={route.short} /></h3>
        {detail && <p className="text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{detail.pitch}</p>}
        <div className="mt-[2px] flex flex-col gap-[2px] border-t pt-[var(--space-2)] text-[11px] leading-[15px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
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
              className="-mb-[1px] cursor-pointer border-b-2 pb-[8px] text-[10.5px] font-bold tracking-[1px] uppercase"
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
            { label: "First-year pay", value: route.salary.split(",")[0].replace(/ first year/i, "") },
          ].map((stat, index) => (
            <div key={stat.label} className={`flex flex-1 flex-col justify-center gap-[4px] ${index < 2 ? "border-b pb-[var(--space-3)]" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>{stat.label}</span>
              <span className="text-[30px] leading-[32px] font-extrabold md:text-[34px] md:leading-[36px]" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {detail && pane === "fit" && (
        <div className={`seq-reveal flex flex-col gap-[var(--space-4)] self-start md:[grid-area:pane] ${PANE_MIN}`}>
          {/* Lead: the thesis, set like Life's pull quote */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>The fit</span>
            <p className="text-[17px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.fit.tagline}</p>
          </div>

          <div className="flex flex-col gap-[4px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Acceptance</span>
            {detail.fit.acceptancePct !== undefined ? (
              <>
                <span className="text-[26px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.fit.acceptancePct}%</span>
                <div className="relative h-[7px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }}>
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(detail.fit.acceptancePct, 3)}%`, background: "var(--accent-subtle)" }} />
                </div>
                <span className="text-[10.5px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{detail.fit.acceptance}</span>
              </>
            ) : (
              <span className="text-[13px] leading-[17px] font-semibold">{detail.fit.acceptance}</span>
            )}
          </div>

          {/* Placement as a stat, not a chip */}
          <div className="flex flex-col gap-[2px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Job placement</span>
            <span className="text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: detail.fit.placement === "High" ? "var(--color-feedback-success, #33c78c)" : "var(--foreground)" }}>{detail.fit.placement}</span>
          </div>

          <div className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <FactRow label="Financial aid" value={detail.fit.aid} />
            <FactRow label="Where you'd work" value={detail.fit.targets} />
          </div>

        </div>
      )}

      {detail && pane === "life" && (
        <div className={`seq-reveal flex flex-col gap-[var(--space-4)] self-start md:[grid-area:pane] ${PANE_MIN}`}>
          {/* Lead: the vibe, set like a pull quote */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>The vibe</span>
            <p className="text-[18px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.life.feel}</p>
          </div>

          <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Student life</span>
            <div className="flex flex-col">
              {detail.life.clubs.map((club, index) => (
                <span key={club} className={`py-[7px] text-[12px] leading-[16px] font-semibold ${index < detail.life.clubs.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                  {club}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-[2px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Study abroad</span>
            <span className="text-[13px] leading-[17px] font-bold">{detail.life.abroad}</span>
          </div>
        </div>
      )}

      {detail && pane === "payoff" && (
        <div className={`seq-reveal flex flex-col gap-[var(--space-4)] self-start md:[grid-area:pane] ${PANE_MIN}`}>
          {/* One stat leads; the loan rides shotgun as a stat, not a sentence.
             (Starting salary is already the chart's Year 1 base segment.) */}
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="flex min-w-0 flex-col gap-[4px]">
              <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>{detail.payoff.time === "None" ? "Debt-free" : "Debt-free in"}</span>
              <span className="text-[26px] leading-[28px] font-extrabold whitespace-nowrap" style={{ fontFamily: "var(--font-display)", backgroundImage: "linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{detail.payoff.time === "None" ? "From day 1" : detail.payoff.time}</span>
            </div>
            <div className="flex flex-none flex-col items-end gap-[4px]">
              <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--muted-foreground)" }}>Typical loan</span>
              <span className="text-[22px] leading-[24px] font-extrabold whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{detail.payoff.avgLoan === "$0" ? "$0" : `~${detail.payoff.avgLoan}`}</span>
            </div>
          </div>

          {/* Pay curve: bonus lives IN the bar (stacked), not in a caption */}
          <div className="flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>What you make</span>
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
                    <span className="text-[12.5px] leading-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{year.amount}</span>
                    <span className="flex w-full flex-col overflow-hidden rounded-t-[5px]">
                      {year.bonus > 0 && <span className="w-full" style={{ height: `${Math.max(Math.round((year.bonus / max) * 56), 4)}px`, background: "var(--accent-subtle)" }} />}
                      <span className="w-full" style={{ height: `${Math.max(Math.round((year.base / max) * 56), 8)}px`, background: "color-mix(in srgb, var(--accent-subtle) 40%, transparent)" }} />
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>{year.label}</span>
                  </span>
                ));
              })()}
            </div>
            {detail.payoff.years.some((year) => /\+\s*\$?\d+K/i.test(year.note ?? "")) && (
              <div className="flex items-center gap-[var(--space-3)] text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-[5px]"><span className="size-2 rounded-[2px]" style={{ background: "color-mix(in srgb, var(--accent-subtle) 40%, transparent)" }} /> Base</span>
                <span className="flex items-center gap-[5px]"><span className="size-2 rounded-[2px]" style={{ background: "var(--accent-subtle)" }} /> Bonus</span>
              </div>
            )}
          </div>

          {/* Budget: base lives in the caption, one-line legend */}
          <div className="flex flex-col gap-[5px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: "var(--accent-subtle)" }}>Monthly budget · on {detail.payoff.budget.income}</span>
            <div className="flex h-[10px] w-full overflow-hidden rounded-full">
              <span style={{ width: `${Math.max(detail.payoff.budget.pct, 3)}%`, background: "var(--accent-subtle)" }} />
              <span className="flex-1" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }} />
            </div>
            <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[2px] text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-[5px]"><span className="size-2 rounded-full" style={{ background: "var(--accent-subtle)" }} /> Loan</span>
              <span className="flex items-center gap-[5px]"><span className="size-2 rounded-full" style={{ background: "color-mix(in srgb, var(--accent-subtle) 22%, transparent)" }} /> In hand</span>
            </div>
          </div>

          <span className="border-t pt-[var(--space-3)] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--accent-subtle)" }}>{detail.payoff.takeaway}</span>
        </div>
      )}

      {/* Decide */}
      <div className="mt-auto flex flex-col gap-[var(--space-2)] md:self-end md:[grid-area:decide]">
        <button
          type="button"
          onClick={selected ? onGoPlan : onSelect}
          aria-pressed={selected}
          className="w-full cursor-pointer rounded-[var(--radius-md)] py-[var(--space-3)] text-[13px] font-bold"
          style={selected ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          {selected ? "Open your plan for this path" : `Continue with ${route.short}`}
        </button>
        <div className="flex items-center justify-between gap-[var(--space-2)] text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
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
      <span className="text-[10px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[12px] leading-[16px] font-semibold">{value}</span>
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
      <div className="min-w-[640px] overflow-hidden rounded-[var(--radius-2xl)] border" style={{ ...GLASS }}>
        <div className="grid" style={{ gridTemplateColumns: `130px repeat(${routes.length}, minmax(150px, 1fr))` }}>
          <span className="border-b p-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }} />
          {routes.map((route) => (
            <span key={route.id} className="border-b p-[var(--space-3)] text-[13px] font-extrabold" style={{ borderColor: "var(--glass-border)", fontFamily: "var(--font-display)", color: route.id === selectedId ? "var(--accent-subtle)" : "var(--foreground)" }}>
              {route.short}
              {route.recommended && <span className="ml-[6px] rounded-full px-[7px] py-[1px] text-[8.5px] font-bold tracking-[0.4px] uppercase" style={{ background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" }}>Recommended</span>}
              {route.id === selectedId && <span className="ml-[6px] rounded-full px-[7px] py-[1px] text-[8.5px] font-bold tracking-[0.4px] uppercase" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Yours</span>}
            </span>
          ))}
          {rows.map((row, rowIndex) => (
            <Fragment key={row.label}>
              <span className={`p-[var(--space-3)] text-[10.5px] font-bold tracking-[0.4px] uppercase ${rowIndex < rows.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{row.label}</span>
              {routes.map((route) => (
                <span key={route.id} className={`flex flex-col items-start gap-[3px] p-[var(--space-3)] ${rowIndex < rows.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)", background: route.id === selectedId ? "color-mix(in srgb, var(--primary) 7%, transparent)" : "transparent" }}>
                  <span className="text-[12.5px] leading-[16px] font-semibold">{row.value(route)}</span>
                  {row.tag(route) && <span className="rounded-full px-[8px] py-[2px] text-[9px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}>{row.tag(route)}</span>}
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
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Career Locker</h2>
        <span className="flex items-center gap-[var(--space-3)]">
          <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{locker.length} saved</span>
          <button type="button" aria-label="Close Locker" onClick={onClose} className="flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>
      {locker.length === 0 ? (
        <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-2xl)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[15px] font-bold">Everything saved is in your Top 3</p>
          <Link href="/explore" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Explore careers</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-4">
          {locker.map((career) => (
            <div key={career.id} className="flex flex-col overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--glass-border)" }}>
              <span className="relative block aspect-[2/3] w-full">
                <Image src={career.photo} alt="" fill sizes="220px" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1 pb-[10px] text-center uppercase" style={{ backgroundImage: TEXT_SCRIM, paddingTop: "30px" }}>
                  <span className="w-full text-[14px] leading-[16px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
                  <span className="w-full text-[8px] leading-[11px] font-semibold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}>{career.world}</span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-[var(--space-2)] p-[10px]" style={{ background: "var(--glass-surface-1)" }}>
                <span className="flex min-w-0 flex-1 items-center gap-[8px]">
                  <MatchRing score={career.match} size={36} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[10.5px] leading-[13px] font-bold">{matchTier(career.match)}</span>
                    <span className="text-[8.5px] leading-[11px] font-semibold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>Match</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => addToTop3(career.id)}
                  aria-label={top3Count >= 3 ? `Swap ${career.title} into your Top 3` : `Add ${career.title} to your Top 3`}
                  title={top3Count >= 3 ? "Swap into Top 3" : "Add to Top 3"}
                  className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border"
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
        <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Settings</h2>
        <button type="button" aria-label="Close settings" onClick={onClose} className="flex size-8 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex max-w-[560px] flex-col gap-[var(--space-2)]">
        <div className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
          <span className="text-[13px] font-semibold">Profile photo</span>
          <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tap your avatar to change it</span>
        </div>
        {["Notifications", "Privacy and sharing", "Talent Pipeline opt-in", "Linked school account"].map((item) => (
          <div key={item} className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="text-[13px] font-semibold">{item}</span>
            <span className="rounded-full px-[8px] py-[2px] text-[9px] font-bold tracking-[0.5px] uppercase" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>Soon</span>
          </div>
        ))}
        <button type="button" className="cursor-pointer rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-left text-[13px] font-semibold" style={{ background: "var(--glass-surface-1)", color: "var(--destructive)" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function ResumeTab() {
  return (
    <section id="resume" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-2xl)] border p-[var(--space-8)]" style={GLASS}>
      <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Resume Builder</h2>
      <ol className="flex flex-col gap-[var(--space-3)]">
        {["Build it", "Tailor it to a job", "Get volunteer feedback"].map((step, index) => (
          <li key={step} className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)]" style={GLASS}>
            <span className="flex size-7 flex-none items-center justify-center rounded-full text-[13px] font-bold" style={{ background: index === 0 ? "var(--primary)" : "var(--glass-surface-2)", color: index === 0 ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>{index + 1}</span>
            <span className="text-[14px] font-semibold">{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-[var(--space-3)]">
        <button type="button" className="w-fit cursor-pointer rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-3)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Continue
        </button>
      </div>
    </section>
  );
}

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
              { key: "plan", label: "Plan" },
            ] as const
          ).map((section) => (
            <button
              key={section.key}
              type="button"
              aria-pressed={sections[section.key]}
              onClick={() => toggle(section.key)}
              className="cursor-pointer rounded-full border px-[12px] py-[4px] text-[11px] font-bold"
              style={{
                background: sections[section.key] ? "color-mix(in srgb, var(--primary) 24%, transparent)" : "transparent",
                borderColor: sections[section.key] ? "var(--primary)" : "var(--glass-border)",
                color: sections[section.key] ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {section.label}
            </button>
          ))}
          <button type="button" onClick={() => window.print()} className="flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
          <button type="button" onClick={onClose} aria-label="Close report" className="flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[var(--space-3)] text-[13px]" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>

      <div className="print-report mx-auto my-6 w-[min(720px,92vw)] rounded-[8px] bg-white p-10 text-[#111827] shadow-2xl print:my-0 print:w-full print:rounded-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">Dreamari · Career Interest Report</p>
            <p className="mt-1 text-[26px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{career.title}</p>
            <p className="text-[13px] text-[#6b7280]">{career.world}</p>
            <p className="mt-1 text-[11.5px] text-[#6b7280]">Prepared for counselors, school staff, and family</p>
          </div>
          <div className="text-right text-[12px] text-[#6b7280]">
            <p className="font-bold text-[#111827]">{STUDENT.name}</p>
            <p>{STUDENT.grade} · {STUDENT.school}</p>
            <p>{today}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Match strength", `${career.match}% (${matchTier(career.match)}), derived from logged in-app activity`],
            ["Selected pathway", `${route.type}: ${route.program}`],
            ["Plan progress", `${progress.complete} of ${progress.total} planned actions complete (${progress.pct}%)`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[6px] border border-[#e5e7eb] px-3 py-2">
              <p className="text-[10px] font-bold tracking-[0.1em] text-[#6b7280] uppercase">{label}</p>
              <p className="text-[13px] font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {sections.receipts && (
          <ReportSection title="Demonstrated engagement">
            <p className="mb-2 text-[12px] leading-[18px] text-[#6b7280]">Logged automatically from {STUDENT.name.split(" ")[0]}&apos;s activity in Dreamari. Sustained, self-directed engagement is the primary signal behind the match strength above.</p>
            <ul className="list-disc pl-5 text-[13px] leading-[20px]">
              {career.receipts.map((receipt) => (
                <li key={receipt.label}>{receipt.value} · {receipt.label}</li>
              ))}
            </ul>
          </ReportSection>
        )}

        {sections.route && (
        <ReportSection title="Selected pathway">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[12.5px]">
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
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#6b7280] uppercase">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </ReportSection>
        )}

        {sections.plan && (
        <ReportSection title="Action plan">
          {career.plan.map((horizon) => (
            <div key={horizon.id} className="mb-3">
              <p className="text-[12px] font-bold">{horizon.title} <span className="font-normal text-[#6b7280]">· {horizon.subtitle}</span></p>
              <ul className="mt-1 list-disc pl-5 text-[12.5px] leading-[19px]">
                {tasksFor(career, horizon.id).map((task) => (
                  <li key={task.id}>{task.label} · {task.minutes} min{task.custom ? " (added by student)" : ""}</li>
                ))}
              </ul>
            </div>
          ))}
          {next && <p className="mt-2 text-[12.5px] font-semibold">Immediate next step: {next.label} ({next.minutes} min)</p>}
        </ReportSection>
        )}

        <ReportSection title="For the advising conversation">
          <ul className="list-disc pl-5 text-[12.5px] leading-[19px]">
            <li>Review the {route.type.toLowerCase()} pathway together, including total cost ({route.cost}), typical starting pay ({route.salary}), and the estimated loan payoff window ({route.loanPayoff}).</li>
            <li>Ask {STUDENT.name.split(" ")[0]} which activity felt most engaging. Interest built through repeated, voluntary practice is a stronger indicator than a single assessment.</li>
            <li>If interest holds over the next grading period, help with the concrete next step: {route.nextStep}.</li>
          </ul>
        </ReportSection>

        <p className="mt-6 border-t border-[#e5e7eb] pt-3 text-[10.5px] leading-[15px] text-[#6b7280]">
          Match strength summarizes {STUDENT.name.split(" ")[0]}&apos;s logged activity in Dreamari. It is an engagement indicator intended to support advising conversations, not a psychometric assessment or a prediction of outcomes. Cost and salary figures are estimates for planning purposes. This report is shared with the student&apos;s consent.
        </p>
      </div>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">{title}</p>
      {children}
    </div>
  );
}
