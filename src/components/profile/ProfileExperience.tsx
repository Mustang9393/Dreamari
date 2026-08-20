"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Eye,
  FileDown,
  Flame,
  Gamepad2,
  GraduationCap,
  GripVertical,
  Lock,
  Pencil,
  Plus,
  Printer,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu } from "@/components/app/chrome";
import { posterTitleFont, TEXT_SCRIM, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS, STUDENT, type PlanTask, type ProfileCareer, type Receipt } from "./data";

// My Profile, round 2: scannable and visual. No paragraphs, no em dashes.
// Evidence renders as receipt tiles, routes disclose progressively with a
// Compare view (labeled single-hue bars), the plan opens only the current
// horizon, and the Career Locker is its own tab plus a strip at the end of
// Overview. College Lookup CTAs point at /colleges (feature in the works).

type TabId = "overview" | "path" | "locker" | "resume";

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

function matchTier(score: number): string {
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Solid match";
  if (score >= 25) return "Early match";
  return "Low signal";
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

  function move(id: string, delta: number) {
    setTop3((current) => {
      const index = current.indexOf(id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function reorderTo(id: string, targetIndex: number) {
    setTop3((current) => {
      const from = current.indexOf(id);
      if (from < 0 || targetIndex < 0 || targetIndex >= current.length || from === targetIndex) return current;
      const next = [...current];
      next.splice(from, 1);
      next.splice(targetIndex, 0, id);
      return next;
    });
  }

  return (
    <div className="marketing-v2 relative min-h-dvh w-full" style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src="/images/app/background-space.svg" className="absolute top-0 left-0 h-[2602px] w-full max-w-none object-cover" />
      </div>

      <div className="no-print">
        <DesktopNavigation active="Profile" />
      </div>

      <header className="no-print relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Link href="/" aria-label="Dreamari landing page" className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          DREAMARI
        </Link>
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
            <div className="flex items-center gap-[var(--space-8)]">
              <span className="flex items-center gap-[8px]">
                <Flame className="h-5 w-5" style={{ color: "var(--chart-3)" }} />
                <span className="flex flex-col">
                  <span className="text-[19px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.streakDays} days</span>
                  <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Streak</span>
                </span>
              </span>
              <ReadinessMeter value={STUDENT.readiness} />
            </div>
          </div>
        </section>

        {/* ---- Tabs ---- */}
        <div className="flex w-full items-center gap-[var(--space-1)] rounded-[var(--radius-xl)] border p-[var(--space-1)]" style={GLASS}>
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "path", label: "My Path" },
              { id: "locker", label: "Locker" },
              { id: "resume", label: "Resume" },
            ] as const
          ).map((item) => (
            <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className="flex-1 cursor-pointer rounded-[var(--radius-md-alt)] px-[var(--space-2)] py-[7px] text-center text-[13px] leading-[18px] font-bold" style={{ background: tab === item.id ? "var(--primary)" : "transparent", color: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)" }}>
              {item.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <OverviewTab top3={top3} focus={focus} setFocusId={setFocusId} locker={locker} chosenRoute={chosenRoute} planProgress={planProgress} nextTask={nextTask} onExport={() => setReportOpen(true)} onGoPath={() => setTab("path")} onGoLocker={() => setTab("locker")} />
        )}
        {tab === "path" && (
          <PathTab top3={top3} focusId={focusId} setFocusId={setFocusId} focus={focus} chosenRoute={chosenRoute} setRouteChoice={setRouteChoice} horizonProgress={horizonProgress} horizonUnlocked={horizonUnlocked} doneSet={doneSet} toggleTask={toggleTask} removeFromTop3={removeFromTop3} move={move} reorderTo={reorderTo} onGoLocker={() => setTab("locker")} tasksFor={tasksFor} addCustomTask={addCustomTask} removeCustomTask={removeCustomTask} />
        )}
        {tab === "locker" && <LockerTab locker={locker} top3Count={top3.length} addToTop3={addToTop3} />}
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
                    <span className="text-[14px] font-semibold">#{index + 1} {career.title}</span>
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

      {reportOpen && focus && <ReportOverlay career={focus} route={chosenRoute(focus)} progress={planProgress(focus)} next={nextTask(focus)} tasksFor={tasksFor} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

// ------------------------------------------------------------- pieces ----

// Match ring: percentage in the middle, "match" language around it. The
// score reflects what the student actually does in Dreamari (doc 14).
function MatchRing({ score, size = 44 }: { score: number; size?: number }) {
  const stroke = size >= 40 ? 4 : 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span title={`${matchTier(score)}: from your activity in Dreamari`} className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--glass-surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent-subtle)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
      </svg>
      <span className="font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: size >= 44 ? 12 : size >= 36 ? 10.5 : 8.5 }}>{score}%</span>
    </span>
  );
}

// Readiness journey: where the student stands on the road to real
// opportunities (doc 22 status labels), not an unexplained ring.
const READINESS_STAGES = [
  { label: "Building", at: 25 },
  { label: "Pipeline Ready", at: 75 },
  { label: "Opted In", at: 100 },
];

function ReadinessMeter({ value }: { value: number }) {
  return (
    <span className="flex w-[210px] flex-col gap-[6px]">
      <span className="flex items-baseline justify-between">
        <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Readiness</span>
        <span className="text-[13px] leading-[16px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{value}<span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>/100</span></span>
      </span>
      <span className="relative h-[6px] w-full rounded-full" style={{ background: "var(--glass-surface-2)" }}>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value}%`, background: "var(--accent-subtle)" }} />
        {READINESS_STAGES.slice(0, 2).map((stage) => (
          <span key={stage.label} aria-hidden className="absolute top-[-2px] h-[10px] w-[2px] rounded-full" style={{ left: `${stage.at}%`, background: "var(--glass-stroke, rgba(255,255,255,0.3))" }} />
        ))}
      </span>
      <span className="flex justify-between">
        {READINESS_STAGES.map((stage) => {
          const reached = value >= (stage.at === 25 ? 25 : stage.at);
          const current = value >= 25 && value < 75 ? stage.at === 25 : value >= 75 && value < 100 ? stage.at === 75 : stage.at === 100 && value >= 100;
          return (
            <span key={stage.label} className="text-[8.5px] leading-[11px] font-bold tracking-[0.3px] uppercase" style={{ color: current ? "var(--accent-subtle)" : reached ? "var(--foreground)" : "var(--muted-foreground)" }}>
              {stage.label}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function FocusPicker({ top3, focus, setFocusId }: { top3: string[]; focus: ProfileCareer | null; setFocusId: (id: string) => void }) {
  if (top3.length === 0) return null;
  return (
    <div className="flex gap-[var(--space-3)] overflow-x-auto pb-1 [scrollbar-width:none]" style={{ touchAction: "pan-x pan-y" }}>
      {top3.map((id, index) => {
        const career = careerById(id)!;
        const isFocus = focus?.id === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isFocus}
            onClick={() => setFocusId(id)}
            className="relative h-[210px] w-[148px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-xl)] border-2 text-center uppercase transition-all"
            style={{ borderColor: isFocus ? "var(--primary)" : "var(--glass-border)", opacity: isFocus ? 1 : 0.72, transform: isFocus ? "scale(1)" : "scale(0.97)" }}
          >
            <Image src={career.photo} alt="" fill sizes="148px" className="object-cover" />
            <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: "var(--glass-surface-3)", color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{index + 1}</span>
            {isFocus && (
              <span className="absolute top-2 right-2 rounded-full px-[8px] py-[2px] text-[8.5px] font-bold tracking-[0.6px]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>FOCUS</span>
            )}
            <span className="absolute right-2 bottom-[64px] flex items-center justify-center rounded-full p-[3px]" style={{ background: "var(--glass-surface-3)" }}>
              <MatchRing score={career.match} size={34} />
            </span>
            <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1 pb-[10px]" style={{ backgroundImage: TEXT_SCRIM, paddingTop: "34px" }}>
              <span className="w-full text-[14px] leading-[16px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
              <span className="w-full text-[8px] leading-[11px] font-semibold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}>{career.world}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ReceiptTiles({ receipts }: { receipts: Receipt[] }) {
  return (
    <div className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-4">
      {receipts.map((receipt) => {
        const ReceiptIcon = RECEIPT_ICON[receipt.kind];
        return (
          <span key={receipt.label} className="flex flex-col gap-[4px] rounded-[var(--radius-lg)] p-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
            <ReceiptIcon className="h-4 w-4" style={{ color: "var(--accent-subtle)" }} />
            <span className="text-[17px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{receipt.value}</span>
            <span className="text-[10.5px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{receipt.label}</span>
          </span>
        );
      })}
    </div>
  );
}

function OverviewTab({
  top3,
  focus,
  setFocusId,
  locker,
  chosenRoute,
  planProgress,
  nextTask,
  onExport,
  onGoPath,
  onGoLocker,
}: {
  top3: string[];
  focus: ProfileCareer | null;
  setFocusId: (id: string) => void;
  locker: ProfileCareer[];
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
      <section className="flex flex-col gap-[var(--space-3)]">
        <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Focus</span>
        <FocusPicker top3={top3} focus={focus} setFocusId={setFocusId} />
      </section>

      {/* Career Report */}
      <section className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-2xl)] border p-[var(--space-6)]" style={GLASS}>
        <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-2)]">
          <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Career Report · Today</span>
          <span className="text-[11px] font-semibold tracking-[0.6px] uppercase" style={{ color: WORLD_COLORS[focus.world] }}>{focus.world}</span>
        </div>
        <p className="text-[28px] leading-[32px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{focus.title}</p>

        <div className="grid grid-cols-1 divide-y overflow-hidden rounded-[var(--radius-lg)] border sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
            <MatchRing score={focus.match} size={48} />
            <span className="flex min-w-0 flex-col gap-[1px]">
              <span className="text-[9.5px] leading-[13px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>Match</span>
              <span className="text-[13px] leading-[17px] font-bold">{matchTier(focus.match)}</span>
              <span className="text-[10px] leading-[13px]" style={{ color: "var(--muted-foreground)" }}>From your activity</span>
            </span>
          </span>
          <ReportStat label="Route" big={route.type} small={route.program} />
          <span className="flex flex-col gap-[6px] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="text-[9.5px] leading-[13px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>Plan</span>
            <span className="flex items-baseline justify-between">
              <span className="text-[15px] leading-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{progress.complete === 0 ? "Ready" : `${progress.pct}%`}</span>
              <span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{progress.complete === 0 ? "10 min start" : `${progress.complete}/${progress.total}`}</span>
            </span>
            <span className="relative h-[6px] w-full overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
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

      {/* Readiness chips */}
      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <span className="rounded-full border px-[12px] py-[5px] text-[11px] font-bold" style={{ borderColor: "var(--accent-subtle)", color: "var(--accent-subtle)" }}>{STUDENT.readinessStatus}</span>
        <span className="rounded-full px-[12px] py-[5px] text-[11px] font-semibold" style={{ background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>Next: {STUDENT.readinessNext}</span>
      </div>

      {/* Locker strip, last */}
      {locker.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex items-center justify-between">
            <span className={CAPTION} style={{ color: "var(--muted-foreground)" }}>Locker · {locker.length} saved</span>
            <button type="button" onClick={onGoLocker} className="cursor-pointer text-[12px] font-bold" style={{ color: "var(--accent-subtle)" }}>Open Locker →</button>
          </div>
          <div className="-mx-5 flex gap-[var(--space-3)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-[var(--space-14)] md:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {locker.map((career) => (
              <button key={career.id} type="button" onClick={onGoLocker} className="relative h-[150px] w-[106px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left" style={{ borderColor: "var(--glass-border)" }}>
                <Image src={career.photo} alt="" fill sizes="106px" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[2px] px-1 pb-[8px] text-center uppercase" style={{ backgroundImage: TEXT_SCRIM, paddingTop: "24px" }}>
                  <span className="w-full text-[10.5px] leading-[12px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
                  <span className="flex items-center justify-center rounded-full p-[2px]" style={{ background: "var(--glass-surface-3)" }}>
                    <MatchRing score={career.match} size={26} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReportStat({ label, big, small }: { label: string; big: string; small: string }) {
  return (
    <span className="flex flex-col gap-[2px] px-[var(--space-4)] py-[var(--space-3)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <span className="text-[9.5px] leading-[13px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[17px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{big}</span>
      <span className="text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>{small}</span>
    </span>
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

function PathTab(props: {
  top3: string[];
  focusId: string | null;
  setFocusId: (id: string) => void;
  focus: ProfileCareer | null;
  chosenRoute: (career: ProfileCareer) => ProfileCareer["routes"][number];
  setRouteChoice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  horizonProgress: (career: ProfileCareer, index: number) => { complete: number; total: number; pct: number };
  horizonUnlocked: (career: ProfileCareer, index: number) => boolean;
  doneSet: (careerId: string) => Set<string>;
  toggleTask: (careerId: string, taskId: string) => void;
  removeFromTop3: (id: string) => void;
  move: (id: string, delta: number) => void;
  reorderTo: (id: string, targetIndex: number) => void;
  onGoLocker: () => void;
  tasksFor: (career: ProfileCareer, horizonId: string) => PlanTask[];
  addCustomTask: (careerId: string, horizonId: string, label: string) => void;
  removeCustomTask: (careerId: string, horizonId: string, taskId: string) => void;
}) {
  const { top3, focusId, setFocusId, focus, chosenRoute, setRouteChoice, horizonProgress, horizonUnlocked, doneSet, toggleTask, removeFromTop3, move, reorderTo, onGoLocker, tasksFor, addCustomTask, removeCustomTask } = props;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  // Pointer-based reorder (HTML5 dnd never fires on touch): the grip captures
  // the pointer, rows live-reorder under it; the grip also takes arrow keys.
  function onGripPointerDown(event: React.PointerEvent, id: string) {
    event.preventDefault();
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // capture can be unavailable (synthetic pointers); drag still works
    }
    setDragId(id);
  }
  function onGripPointerMove(event: React.PointerEvent, id: string) {
    if (dragId !== id) return;
    const over = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-top3-index]");
    if (!over) return;
    const targetIndex = Number((over as HTMLElement).dataset.top3Index);
    if (!Number.isNaN(targetIndex)) reorderTo(id, targetIndex);
  }
  function onGripPointerUp() {
    setDragId(null);
  }
  const [draftTask, setDraftTask] = useState("");
  const [routeView, setRouteView] = useState<"cards" | "compare">("cards");
  const [openHorizon, setOpenHorizon] = useState<string | null>(null);

  const currentHorizonId = (career: ProfileCareer) => {
    for (let index = 0; index < career.plan.length; index++) {
      if (!horizonUnlocked(career, index)) break;
      if (tasksFor(career, career.plan[index].id).some((task) => !doneSet(career.id).has(task.id))) return career.plan[index].id;
    }
    return career.plan[0].id;
  };

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      {/* ---- 1. Top 3 ---- */}
      <section className="flex flex-col gap-[var(--space-4)]">
        <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Top 3</h2>
        {top3.length === 0 ? (
          <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-2xl)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-[15px] font-bold">No picks yet</p>
            <div className="flex gap-[var(--space-3)]">
              <Link href="/match-lab" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Swipe careers</Link>
              <button type="button" onClick={onGoLocker} className="cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>Open Locker</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[var(--space-2)]">
            {top3.map((id, index) => {
              const career = careerById(id)!;
              const isFocus = focusId === id;
              return (
                <div
                  key={id}
                  data-top3-index={index}
                  className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border p-[var(--space-3)] transition-[opacity,transform]"
                  style={{ background: isFocus ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-1))" : "var(--glass-surface-1)", borderColor: dragId === id ? "var(--accent-subtle)" : isFocus ? "var(--primary)" : "var(--glass-border)", opacity: dragId === id ? 0.6 : 1, transform: dragId === id ? "scale(1.01)" : "none" }}
                >
                  <button
                    type="button"
                    aria-label={`Reorder ${career.title}: drag, or press the arrow keys`}
                    title="Drag to reorder"
                    onPointerDown={(event) => onGripPointerDown(event, id)}
                    onPointerMove={(event) => onGripPointerMove(event, id)}
                    onPointerUp={onGripPointerUp}
                    onPointerCancel={onGripPointerUp}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") { event.preventDefault(); move(id, -1); }
                      if (event.key === "ArrowDown") { event.preventDefault(); move(id, 1); }
                    }}
                    className="flex flex-none cursor-grab items-center rounded p-1 active:cursor-grabbing"
                    style={{ color: "var(--muted-foreground)", touchAction: "none" }}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>#{index + 1}</span>
                  {/* Tap the career itself for a preview */}
                  <button type="button" onClick={() => setPreviewId(id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-[var(--space-3)] text-left" aria-label={`Preview ${career.title}`}>
                    <span className="relative h-14 w-10 flex-none overflow-hidden rounded-[8px]">
                      <Image src={career.photo} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] font-bold">{career.title}</span>
                      <span className="truncate text-[11px] font-semibold" style={{ color: WORLD_COLORS[career.world] }}>{career.world} · {matchTier(career.match)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusId(id)}
                    aria-pressed={isFocus}
                    aria-label={isFocus ? `${career.title} is in focus` : `Set ${career.title} as focus`}
                    title={isFocus ? "In focus" : "Set focus"}
                    className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border"
                    style={{ background: isFocus ? "var(--primary)" : "transparent", borderColor: isFocus ? "var(--primary)" : "var(--glass-border)", color: isFocus ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
                  >
                    <Target className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Remove ${career.title} from Top 3`} title="Remove" onClick={() => removeFromTop3(id)} className="flex-none cursor-pointer rounded-full border p-[6px]" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {Array.from({ length: 3 - top3.length }).map((_, index) => (
              <button key={index} type="button" onClick={onGoLocker} className="flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border border-dashed px-[var(--space-4)] py-[var(--space-4)] text-left" style={{ borderColor: "var(--glass-border)" }}>
                <span className="w-7 text-center text-[17px] font-extrabold opacity-50" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>#{top3.length + index + 1}</span>
                <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Open slot · pick from your Locker</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {focus && (
        <>
          {/* ---- 2. Routes: cards with disclosure, or compare charts ---- */}
          <section className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Routes to {focus.title}</h2>
              <div className="flex items-center gap-[var(--space-1)] rounded-[var(--radius-xl)] border p-[3px]" style={GLASS}>
                {(["cards", "compare"] as const).map((view) => (
                  <button key={view} type="button" aria-pressed={routeView === view} onClick={() => setRouteView(view)} className="cursor-pointer rounded-[var(--radius-md-alt)] px-[14px] py-[5px] text-[12px] font-bold capitalize" style={{ background: routeView === view ? "var(--primary)" : "transparent", color: routeView === view ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {routeView === "cards" ? (
              <div className="flex flex-col gap-[var(--space-3)]">
                {focus.routes.map((routeOption) => {
                  const selected = chosenRoute(focus).id === routeOption.id;
                  return (
                    <div key={routeOption.id} className="overflow-hidden rounded-[var(--radius-2xl)] border transition-colors" style={{ background: selected ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-1))" : "var(--glass-surface-1)", borderColor: selected ? "var(--primary)" : "var(--glass-border)" }}>
                      <button type="button" aria-expanded={selected} onClick={() => setRouteChoice((current) => ({ ...current, [focus.id]: routeOption.id }))} className="flex w-full cursor-pointer flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] p-[var(--space-4)] text-left">
                        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                          <span className={CAPTION} style={{ color: selected ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{routeOption.type}</span>
                          <span className="text-[15px] leading-[19px] font-bold">{routeOption.program}</span>
                        </span>
                        <span className="flex items-center gap-[var(--space-5)]">
                          <MiniStat label="Cost" value={routeOption.cost} />
                          <MiniStat label="Pay" value={routeOption.salary.split(",")[0]} />
                          <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: selected ? "rotate(180deg)" : "none" }} />
                        </span>
                      </button>
                      {selected && (
                        <div className="filters-reveal flex flex-col gap-[var(--space-4)] border-t px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                          <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-3)] sm:grid-cols-4">
                            <RouteFact label="Time" value={routeOption.duration} />
                            <RouteFact label="Loan payoff" value={routeOption.loanPayoff} />
                            <RouteFact label="You earn" value={routeOption.credential} />
                            <RouteFact label="Where" value={routeOption.location} />
                          </div>
                          <div className="flex flex-wrap gap-[var(--space-2)]">
                            <Link href="/colleges" className="flex items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[12px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                              <GraduationCap className="h-4 w-4" /> Find schools
                            </Link>
                            <span className="flex items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)] text-[12px] font-semibold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                              <ChevronRight className="h-3.5 w-3.5" /> {routeOption.nextStep}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
                <CompareChart title="Total cost" better="lower" unit={(value) => (value === 0 ? "$0" : `$${value}K`)} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.costMidK }))} selectedId={chosenRoute(focus).id} />
                <CompareChart title="Years to job" better="lower" unit={(value) => `${value} yr`} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.years }))} selectedId={chosenRoute(focus).id} />
                <CompareChart title="First-year pay" better="higher" unit={(value) => `$${value}K`} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.payMidK }))} selectedId={chosenRoute(focus).id} />
                <CompareChart title="Loan payoff" better="lower" unit={(value) => (value === 0 ? "None" : `${value} yr`)} rows={focus.routes.map((r) => ({ id: r.id, name: r.short, value: r.payoffYears }))} selectedId={chosenRoute(focus).id} />
              </div>
            )}
          </section>

          {/* ---- 3. Plan: only the current horizon open ---- */}
          <section className="flex flex-col gap-[var(--space-3)]">
            <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Plan · {focus.title}</h2>
            <div className="flex flex-col gap-[var(--space-3)]">
              {focus.plan.map((horizon, index) => {
                const unlocked = horizonUnlocked(focus, index);
                const stats = horizonProgress(focus, index);
                const isOpen = unlocked && (openHorizon ? openHorizon === horizon.id : currentHorizonId(focus) === horizon.id);
                return (
                  <div key={horizon.id} className="overflow-hidden rounded-[var(--radius-2xl)] border" style={{ ...GLASS, opacity: unlocked ? 1 : 0.55 }}>
                    <button type="button" aria-expanded={isOpen} disabled={!unlocked} onClick={() => setOpenHorizon(isOpen ? "none" : horizon.id)} className="flex w-full cursor-pointer items-center justify-between gap-[var(--space-3)] p-[var(--space-4)] text-left disabled:cursor-default">
                      <span className="flex items-center gap-[var(--space-3)]">
                        <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{horizon.title}</span>
                        <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{horizon.subtitle}</span>
                      </span>
                      <span className="flex items-center gap-[var(--space-3)]">
                        {unlocked ? (
                          <>
                            {stats.complete > 0 && (
                              <span className="relative h-[5px] w-[64px] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
                                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${stats.pct * 100}%`, background: "var(--accent-subtle)" }} />
                              </span>
                            )}
                            <span className="text-[11px] font-bold" style={{ color: stats.complete > 0 ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{stats.complete}/{stats.total}</span>
                            <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: isOpen ? "rotate(180deg)" : "none" }} />
                          </>
                        ) : (
                          <span className="flex items-center gap-[6px] text-[10px] font-semibold tracking-[0.4px] uppercase" style={{ color: "var(--muted-foreground)" }}>
                            <Lock className="h-3.5 w-3.5" /> 40% of {focus.plan[index - 1].title}
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
                            className="min-w-0 flex-1 bg-transparent text-[12.5px] font-semibold outline-none placeholder:text-[color:var(--muted-foreground)]"
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
          </section>
        </>
      )}

      {/* ---- Career preview sheet ---- */}
      {previewId && (() => {
        const career = careerById(previewId)!;
        const isFocus = focusId === previewId;
        return (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(event) => { if (event.target === event.currentTarget) setPreviewId(null); }}>
            <div className="filters-reveal w-full max-w-[420px] overflow-hidden rounded-t-[var(--radius-2xl)] border sm:rounded-[var(--radius-2xl)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <div className="relative h-[240px] w-full">
                <Image src={career.photo} alt="" fill sizes="420px" className="object-cover" />
                <button type="button" aria-label="Close preview" onClick={() => setPreviewId(null)} className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ background: "var(--glass-surface-3)", color: "var(--foreground)" }}>
                  <X className="h-4 w-4" />
                </button>
                <span className="absolute right-3 bottom-3 flex items-center justify-center rounded-full p-[3px]" style={{ background: "var(--glass-surface-3)" }}>
                  <MatchRing score={career.match} size={40} />
                </span>
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-2 pb-[12px] text-center uppercase" style={{ backgroundImage: TEXT_SCRIM, paddingTop: "48px" }}>
                  <span className="w-full text-[20px] leading-[23px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</span>
                  <span className="w-full text-[9px] leading-[12px] font-semibold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}>{career.world}</span>
                </span>
              </div>
              <div className="flex flex-col gap-[var(--space-4)] p-[var(--space-5)]">
                <ReceiptTiles receipts={career.receipts} />
                <div className="flex gap-[var(--space-2)]">
                  {!isFocus && (
                    <button type="button" onClick={() => { setFocusId(career.id); setPreviewId(null); }} className="flex flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] py-[var(--space-3)] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      <Target className="h-4 w-4" /> Set focus
                    </button>
                  )}
                  <button type="button" onClick={() => setPreviewId(null)} className="flex flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border py-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col items-end">
      <span className="text-[9px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[12.5px] leading-[16px] font-bold whitespace-nowrap">{value}</span>
    </span>
  );
}

function RouteFact({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-[9.5px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[12px] leading-[16px] font-semibold">{value}</span>
    </span>
  );
}

// ---- Locker tab: rich poster grid ----

function LockerTab({ locker, top3Count, addToTop3 }: { locker: ProfileCareer[]; top3Count: number; addToTop3: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Career Locker</h2>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{locker.length} saved</span>
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
        <span className="rounded-full px-[12px] py-[5px] text-[11px] font-semibold" style={{ background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>Feeds Readiness</span>
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
              { key: "receipts", label: "Receipts" },
              { key: "route", label: "Route" },
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
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">Dreamari · Career Report</p>
            <p className="mt-1 text-[26px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{career.title}</p>
            <p className="text-[13px] text-[#6b7280]">{career.world}</p>
          </div>
          <div className="text-right text-[12px] text-[#6b7280]">
            <p className="font-bold text-[#111827]">{STUDENT.name}</p>
            <p>{STUDENT.grade} · {STUDENT.school}</p>
            <p>{today}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Match score", `${career.match}% (${matchTier(career.match)}), from activity in Dreamari`],
            ["Readiness", `${STUDENT.readiness} / 100 (${STUDENT.readinessStatus})`],
            ["Selected route", `${route.type}: ${route.program}`],
            ["Plan progress", `${progress.complete}/${progress.total} tasks (${progress.pct}%)`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[6px] border border-[#e5e7eb] px-3 py-2">
              <p className="text-[10px] font-bold tracking-[0.1em] text-[#6b7280] uppercase">{label}</p>
              <p className="text-[13px] font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {sections.receipts && (
          <ReportSection title="Receipts">
            <ul className="list-disc pl-5 text-[13px] leading-[20px]">
              {career.receipts.map((receipt) => (
                <li key={receipt.label}>{receipt.value} · {receipt.label}</li>
              ))}
            </ul>
          </ReportSection>
        )}

        {sections.route && (
        <ReportSection title="Chosen route">
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
        <ReportSection title="The plan">
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
          {next && <p className="mt-2 text-[12.5px] font-semibold">Next up: {next.label} ({next.minutes} min)</p>}
        </ReportSection>
        )}

        <p className="mt-6 border-t border-[#e5e7eb] pt-3 text-[10.5px] leading-[15px] text-[#6b7280]">
          Interest and Readiness reflect what {STUDENT.name.split(" ")[0]} actually does in Dreamari. Shared only with {STUDENT.name.split(" ")[0]}&apos;s consent.
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
