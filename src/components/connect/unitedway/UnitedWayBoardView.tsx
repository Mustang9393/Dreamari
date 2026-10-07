"use client";

// United Way boards (7 Oct 2026, rebuilt 8 Oct 2026). One engine, two data
// sets: the national network (uwData.NETWORK) and Michigan
// (uwMichigan.MICHIGAN). Chandu, 8 Oct: "it was such a basic board, nothing
// more than answering questions and seeing some details about a program.
// Please flesh it out to be super useful for everyone involved." So each
// Connect role gets the jobs our research says it actually has:
// - Student (Home · Programs · Events · Serve · Ask): picks that fit their
//   Top 3, what they have going on, programs by kind with who it's for, how
//   to join and the program's own page, events with calendar and My Plan,
//   Serve for service hours (schools, NHS and scholarships ask for them; a
//   signed hours letter is the thing students chase), 2-1-1 for help at
//   home, and Ask.
// - Volunteer (Today · Shifts · My Impact): questions routed to them and
//   answered inline, quick requests, shifts with open spots, campaign hours,
//   team standings, notes from students, an hours export.
// - United Way (Impact · By United Way · Programs · Volunteers): outcome
//   funnel, a daily trend, Youth Success goals, what students want (careers
//   saved, questions asked), the map, a programs table with a Post tool
//   that publishes straight to the other views, and a safety roster.
// United Way's own logo and photography, the brand blue on every action,
// copy cut to a title, one line and icon facts. Strings live in uwData.ts.

import Image from "next/image";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Backpack, Briefcase, Calendar, CalendarPlus, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, ExternalLink, GraduationCap, HandHeart, Handshake, Heart, MapPin, MessageSquareOff, MessagesSquare, Phone, Plus, ShieldCheck, Sparkles, Sun, Timer, Users, X, Crown } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { markUwInterest, useUwMentorship } from "@/lib/uwMentorship";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { EmptyView } from "@/components/app/states";
import { Avatar, CONTACT_INFO, CONTACT_WARNING, ConnectNav, InlineAsk, PrimaryCta, QuietCta, SectionHead, SectionSurface } from "../primitives";
import { AreaChart, MetricTile, Ring, Segmented, demoSeries, ruledCell } from "../viz";
import { BarChart } from "../mentorship/charts";
import { ChapterMap, Funnel, GoalRing, RankedRows } from "./uwCharts";
import { Panel, ProProfileView, RULE } from "../ProProfile";
import { QuestionCard } from "../ConnectExperience";
import { THREADS, type Thread } from "../data";
import * as D from "./uwData";

const BLUE = D.BRAND.blue;
const BLUE_TEXT = D.BRAND.blueText;
const GOOD = "var(--world-food-farming-nature)";
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
const SOLID = { background: BLUE, color: "#fff" } as const;
const HERO_BOX = { background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 30%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` } as const;

/** The board on screen, for the pieces that need its data. */
const BoardCtx = createContext<D.UwBoard>(D.NETWORK);
const useBoard = () => useContext(BoardCtx);

// ——— small pieces ———

export function Eyebrow({ children, tone = BLUE_TEXT }: { children: ReactNode; tone?: string }) {
  return <span className="block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}>{children}</span>;
}
function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: BLUE_TEXT }}>{children}</button>;
}
export function Done({ text }: { text: string }) {
  return <span className="flex items-center gap-[6px] text-[13.5px] leading-[18px] font-bold" style={{ color: GOOD }}><CheckCircle2 className="h-4 w-4 flex-none" aria-hidden /> {text}</span>;
}
export function Fact({ icon: Icon, children }: { icon: typeof Calendar; children: ReactNode }) {
  return <span className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}><Icon className="h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />{children}</span>;
}
export function DateTile({ month, day, size = "md" }: { month: string; day: number; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span aria-label={`${month} ${day}`} className={`flex flex-none flex-col items-center justify-center rounded-[var(--radius-sm)] border ${sm ? "h-[44px] w-[44px]" : "h-[52px] w-[52px]"}`} style={{ borderColor: `color-mix(in srgb, ${BLUE} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${BLUE} 18%, var(--glass-surface-1))` }}>
      <span className="text-[10px] leading-none font-extrabold tracking-[0.08em] uppercase" style={{ color: BLUE_TEXT }}>{month}</span>
      <span className={`${sm ? "mt-[3px] text-[16px]" : "mt-[4px] text-[19px]"} leading-none font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{day}</span>
    </span>
  );
}
function StatusDot({ status }: { status: D.Program["status"] }) {
  const tone = status === "open" ? GOOD : D.BRAND.yellow;
  const label = status === "open" ? "Open" : status === "returning" ? "Back soon" : "Soon";
  return <span className="inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: "rgba(6,8,18,0.62)", color: "#fff", backdropFilter: "blur(6px)" }}><span aria-hidden className="size-[6px] rounded-full" style={{ background: tone }} />{label}</span>;
}
const KIND_ICON: Record<D.ProgramKind, typeof Handshake> = { mentor: Handshake, work: Briefcase, college: GraduationCap, internship: Briefcase, summer: Sun, lead: Crown };
function Pill({ children, tone = BLUE_TEXT }: { children: ReactNode; tone?: string }) {
  return <span className="inline-flex w-fit flex-none items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold tabular-nums" style={{ background: `color-mix(in srgb, ${BLUE} 26%, transparent)`, color: tone }}>{children}</span>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>{label}{children}</label>;
}
const INPUT = "h-[44px] w-full rounded-[var(--radius-md)] border px-[12px] text-[15px] font-medium outline-none focus-visible:ring-2";
const INPUT_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

const OpenPro = createContext<(id: string) => void>(() => {});
function Sheet({ title, onClose, children, titleId, photo, focus }: { title: string; onClose: () => void; children: ReactNode; titleId: string; photo?: string; focus?: string }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[28px]" style={{ background: "rgba(5,7,15,0.6)" }} />
        <div className="dm-scroll relative z-[1] flex max-h-[calc(100dvh-96px)] w-full max-w-[480px] flex-col overflow-y-auto rounded-[var(--radius-xl)] border sm:max-h-[88dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: `color-mix(in srgb, ${BLUE} 40%, var(--glass-border))`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 45%, transparent), 0 16px 48px -4px rgba(0,0,0,0.55)` }}>
          {photo && (
            <div className="relative aspect-[16/9] w-full flex-none overflow-hidden">
              <Image src={photo} alt="" fill sizes="480px" className="object-cover" style={{ objectPosition: focus ?? "50% 35%" }} />
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--card) 0%, transparent 45%)" }} />
            </div>
          )}
          <IconTip label="Close" className="absolute top-[12px] right-[12px] z-10">
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={{ color: "#fff", background: "rgba(6,8,18,0.55)", borderColor: "rgba(255,255,255,0.25)" }}><X className="h-4 w-4" aria-hidden /></button>
          </IconTip>
          <div className={`flex flex-col gap-[var(--space-4)] px-[var(--space-6)] pb-[var(--space-6)] ${photo ? "pt-[var(--space-2)]" : "pt-[var(--space-6)] pr-[56px]"}`}>
            <h2 id={titleId} className="text-[24px] leading-[28px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function useToast(): [ReactNode, (text: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const node = toast ? (
    <Portal>
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-center text-[13.5px] font-semibold" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7)" }}>{toast}</div>
    </Portal>
  ) : null;
  return [node, setToast];
}

/** Hands the browser a one-event calendar file, so the event lands in
 *  whatever calendar the student uses (Google, Apple, Outlook). */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function addToCalendar(title: string, date: D.UwEvent["date"], where: string, hours = 1) {
  const m = /(\d+):(\d+)\s*(AM|PM)/.exec(date.time);
  const h = m ? (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0) : 9;
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = `${date.year}${pad(MONTHS.indexOf(date.month) + 1)}${pad(date.day)}`;
  const stamp = (hh: number) => `${day}T${pad(Math.min(23, hh))}${m ? m[2] : "00"}00`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dreamari//United Way//EN", "BEGIN:VEVENT", `UID:${day}-${title.replace(/\W+/g, "-")}@dreamari`, `DTSTART:${stamp(h)}`, `DTEND:${stamp(h + Math.max(1, Math.round(hours)))}`, `SUMMARY:${title}`, `LOCATION:${where}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ——— Programs: the photo is the card ———

function ProgramCard({ p, joined, onOpen, wide = false, reason }: { p: D.Program; joined: boolean; onOpen: () => void; wide?: boolean; reason?: string }) {
  const Icon = KIND_ICON[p.kind];
  return (
    <button type="button" onClick={onOpen} className={`dm-tap group relative flex w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left ${wide ? "aspect-[4/3]" : "aspect-[4/5]"}`} style={{ borderColor: "var(--glass-border)", textShadow: CARD_TEXT_SHADOW, boxShadow: "0 18px 40px -26px rgba(0,0,0,0.7)" }}>
      <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" style={{ objectPosition: p.focus }} />
      <CardProgressiveBlur size="52%" />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.55) 38%, transparent 65%)" }} />
      <span className="absolute top-[10px] left-[10px] z-10 inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: BLUE, color: "#fff", textShadow: "none" }}><Icon className="h-3 w-3" aria-hidden />{D.KIND_LABEL[p.kind]}</span>
      {reason && <span className="absolute top-[10px] right-[10px] z-10 inline-flex items-center gap-[4px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: "rgba(6,8,18,0.62)", color: D.BRAND.yellow, backdropFilter: "blur(6px)", textShadow: "none" }}><Sparkles className="h-3 w-3" aria-hidden />{reason}</span>}
      <span className="relative z-10 flex flex-col gap-[4px] p-[var(--space-4)]">
        <span className="text-[19px] leading-[23px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{p.title}</span>
        <span className="text-[13.5px] leading-[18px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{p.line}</span>
        <span className="mt-[4px] flex flex-wrap items-center gap-[6px]" style={{ textShadow: "none" }}>
          <StatusDot status={p.status} />
          <span className="rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: "rgba(6,8,18,0.62)", color: "#fff", backdropFilter: "blur(6px)" }}>{p.who}</span>
        </span>
        {joined && <span className="mt-[2px] flex items-center gap-[5px] text-[12.5px] font-bold" style={{ color: "#7EE2B0" }}><Check className="h-3.5 w-3.5" aria-hidden /> {D.PROGRAMS_UI.done}</span>}
      </span>
    </button>
  );
}

export function Gets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-[10px]">
      {items.map((g) => <li key={g} className="flex items-center gap-[10px] text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}><span className="flex size-[22px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${BLUE} 30%, transparent)` }}><Check className="h-3.5 w-3.5" aria-hidden style={{ color: BLUE_TEXT }} /></span>{g}</li>)}
    </ul>
  );
}
function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-[10px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      <span className="text-[26px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>{value}</span>
      <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
    </div>
  );
}
export function NoMessages() {
  return (
    <div className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: `color-mix(in srgb, ${BLUE} 40%, var(--glass-border))`, background: `color-mix(in srgb, ${BLUE} 14%, var(--glass-surface-1))` }}>
      <MessageSquareOff className="h-5 w-5 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
      <span className="text-[14px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>{D.PROGRAMS_UI.noMessages}</span>
    </div>
  );
}
/** Numbered steps, the first one lit: "how to join" in three moves. */
function Steps({ steps, at = 0 }: { steps: string[]; at?: number }) {
  return (
    <ol className="flex flex-col gap-[8px]">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-[10px] text-[14.5px] leading-[20px] font-semibold" style={{ color: i <= at ? "var(--foreground)" : "var(--muted-foreground)" }}>
          <span className="flex size-[24px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums" style={i < at ? { background: GOOD, color: "#06120c" } : i === at ? SOLID : { background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>{i < at ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

function ProgramSheet({ p, joined, onJoin, onMentorship, onClose }: { p: D.Program; joined: boolean; onJoin: () => void; onMentorship: () => void; onClose: () => void }) {
  const U = D.PROGRAMS_UI;
  return (
    <Sheet title={p.title} onClose={onClose} titleId="uw-program-title" photo={p.photo} focus={p.focus}>
      <p className="-mt-[8px] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{p.line}</p>
      <Gets items={p.gets} />
      <div className="flex flex-wrap gap-x-[20px] gap-y-[8px]"><Fact icon={Users}>{p.who}</Fact><Fact icon={Calendar}>{p.when}</Fact><Fact icon={MapPin}>{p.where}</Fact></div>
      {p.deadline && <Pill tone={D.BRAND.yellow}><Clock className="h-3 w-3" aria-hidden />{p.deadline}</Pill>}
      {p.proof && <Proof {...p.proof} />}
      {p.steps && (
        <div className="flex flex-col gap-[10px]">
          <Eyebrow tone="var(--muted-foreground)">{U.how}</Eyebrow>
          <Steps steps={p.steps} at={joined ? 1 : 0} />
        </div>
      )}
      {p.mentorship && <NoMessages />}
      <div className="flex flex-wrap items-center gap-[10px] pt-[4px]">
        {/* a mentorship program continues in the Mentorship tab: raising a
           hand here is step one of four there (three quick questions next) */}
        {p.mentorship
          ? (joined ? <PrimaryCta onClick={onMentorship} style={SOLID}>{U.continueMentorship} <ChevronRight className="h-4 w-4" aria-hidden /></PrimaryCta> : <PrimaryCta onClick={onJoin} style={SOLID}>{U.interested}</PrimaryCta>)
          : (joined ? <Done text={`${U.done}. ${U.doneLine}`} /> : <PrimaryCta onClick={onJoin} style={SOLID}>{U.interested}</PrimaryCta>)}
        {p.mentorship && !joined && <QuietCta onClick={onMentorship}>{U.openMentorship}</QuietCta>}
      </div>
      {p.mentorship && joined && <Done text={U.nextStep} />}
      <div className="flex flex-wrap items-center justify-between gap-[10px] border-t pt-[12px]" style={{ borderColor: RULE }}>
        <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{p.by}</span>
        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="dm-link flex items-center gap-[4px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>{U.page} <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>}
      </div>
    </Sheet>
  );
}

const KIND_FILTERS: { key: "all" | D.ProgramKind; label: string }[] = [{ key: "all", label: "All" }, ...(Object.keys(D.KIND_LABEL) as D.ProgramKind[]).map((k) => ({ key: k, label: D.KIND_LABEL[k] }))];
function StudentPrograms({ programs, joined, open }: { programs: D.Program[]; joined: Record<string, boolean>; open: (p: D.Program) => void }) {
  const [kind, setKind] = useState<"all" | D.ProgramKind>("all");
  // only the kinds this list actually has, so no chip leads nowhere
  const kinds = KIND_FILTERS.filter((k) => k.key === "all" || programs.some((p) => p.kind === k.key));
  const list = programs.filter((p) => kind === "all" || p.kind === kind);
  return (
    <>
      <div className="dm-scroll -mx-[4px] flex gap-[6px] overflow-x-auto px-[4px] pb-[2px] [scrollbar-width:none]">
        {kinds.map((k) => {
          const on = k.key === kind;
          return <button key={k.key} type="button" aria-pressed={on} onClick={() => setKind(k.key)} className="dm-quiet flex-none cursor-pointer rounded-full border px-[12px] py-[6px] text-[13px] leading-[17px] font-semibold" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 30%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{k.label}</button>;
        })}
      </div>
      {list.length === 0 && <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{D.SCOPE.none}</p>}
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <ProgramCard key={p.id} p={p} joined={!!joined[p.id]} onOpen={() => open(p)} wide />)}
      </div>
    </>
  );
}

// ——— Events ———

function EventRow({ e, saved, onSave, onOpen, reason }: { e: D.UwEvent; saved: boolean; onSave: () => void; onOpen: () => void; reason?: string }) {
  return (
    <div className="dm-tap group relative flex items-center gap-[14px] rounded-[var(--radius-lg)] border p-[14px]" style={ITEM}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {e.title}</span></button>
      <DateTile month={e.date.month} day={e.date.day} />
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        {reason && <span className="flex items-center gap-[4px] text-[11.5px] leading-[15px] font-bold" style={{ color: D.BRAND.yellow }}><Sparkles className="h-3 w-3" aria-hidden />{reason}</span>}
        <span className="text-[15.5px] leading-[20px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{e.title}</span>
        <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-[4px]"><MapPin className="h-3 w-3" aria-hidden />{e.where}</span>
          <span className="flex items-center gap-[4px]"><Users className="h-3 w-3" aria-hidden />{e.going} {D.EVENTS_UI.going}</span>
        </span>
      </span>
      <span className="relative z-20 flex-none"><QuietCta size="sm" done={saved} onClick={onSave}>{saved ? D.EVENTS_UI.saved : D.EVENTS_UI.save}</QuietCta></span>
    </div>
  );
}

function EventSheet({ e, saved, onSave, inPlan, onPlan, onClose }: { e: D.UwEvent; saved: boolean; onSave: () => void; inPlan: boolean; onPlan: () => void; onClose: () => void }) {
  const U = D.EVENTS_UI;
  return (
    <Sheet title={e.title} onClose={onClose} titleId="uw-event-title">
      <div className="flex items-center gap-[12px]">
        <DateTile month={e.date.month} day={e.date.day} />
        <div className="flex flex-col gap-[2px]">
          <Eyebrow>{e.kind}</Eyebrow>
          <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>{e.date.time}</span>
        </div>
      </div>
      <p className="text-[15px] leading-[21px]" style={{ color: "var(--foreground)" }}>{e.about}</p>
      <div className="flex flex-col gap-[8px]"><Fact icon={Users}>{e.who}</Fact><Fact icon={MapPin}>{e.where}</Fact></div>
      <div className="flex flex-wrap items-center gap-[10px] pt-[4px]">
        <PrimaryCta onClick={onPlan} style={{ background: inPlan ? GOOD : BLUE, color: "#fff" }}>{inPlan ? U.inPlan : U.addPlan}</PrimaryCta>
        <QuietCta done={saved} onClick={onSave}>{saved ? U.saved : U.save}</QuietCta>
        <IconTip label={U.calendar}>
          <button type="button" aria-label={U.calendar} onClick={() => addToCalendar(e.title, e.date, e.where)} className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><CalendarPlus className="h-4 w-4" aria-hidden /></button>
        </IconTip>
      </div>
      {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="dm-link flex w-fit items-center gap-[4px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>Event page <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>}
    </Sheet>
  );
}

function StudentEvents({ saves, toggleSave, open, events }: { saves: Record<string, boolean>; toggleSave: (id: string) => void; open: (e: D.UwEvent) => void; events: D.UwEvent[] }) {
  const [filter, setFilter] = useState<D.EventFilter>("all");
  const list = events.filter((e) => filter === "all" || (filter === "online" ? e.virtual : !e.virtual));
  // grouped by month, so a long list still scans
  const months = [...new Set(list.map((e) => `${e.date.month} ${e.date.year}`))];
  return (
    <>
      <div className="w-fit"><Segmented ariaLabel="Where" value={filter} onChange={setFilter} options={[...D.EVENTS_UI.filters]} /></div>
      {list.length === 0 && <EmptyView tier={5} query={filter} line="Try All." cta="Show all" onAction={() => setFilter("all")} />}
      {months.map((m) => (
        <section key={m} className="flex flex-col gap-[var(--space-3)]">
          <Eyebrow tone="var(--muted-foreground)">{m.split(" ")[0]}</Eyebrow>
          <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
            {list.filter((e) => `${e.date.month} ${e.date.year}` === m).map((e) => <EventRow key={e.id} e={e} saved={!!saves[e.id]} onSave={() => toggleSave(e.id)} onOpen={() => open(e)} />)}
          </div>
        </section>
      ))}
    </>
  );
}

// ——— Serve: teen volunteer shifts, counted as service hours ———

function ShiftRow({ s, signed, onSign, onCal, verified, onCheckIn }: { s: D.Shift; signed: boolean; onSign: () => void; onCal?: () => void; verified?: boolean; onCheckIn?: () => void }) {
  const U = D.SERVE_UI;
  return (
    <li className="flex items-center gap-[14px] rounded-[var(--radius-lg)] border p-[14px]" style={ITEM}>
      <DateTile month={s.date.month} day={s.date.day} />
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <Eyebrow>{s.kind}</Eyebrow>
        <span className="text-[15.5px] leading-[20px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.title}</span>
        <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-[4px]"><MapPin className="h-3 w-3" aria-hidden />{s.where}</span>
          <span className="flex items-center gap-[4px]"><Clock className="h-3 w-3" aria-hidden />{s.hours} {U.hours}</span>
          <span>{s.who}</span>
          <span style={{ color: s.spots - (signed ? 1 : 0) <= 3 ? D.BRAND.yellow : undefined }}>{Math.max(0, s.spots - (signed ? 1 : 0))} {U.spots}</span>
        </span>
        {s.check && <span className="flex items-center gap-[4px] text-[12px] leading-[16px] font-bold" style={{ color: BLUE_TEXT }}><ShieldCheck className="h-3.5 w-3.5" aria-hidden />{U.check}</span>}
      </span>
      <span className="flex flex-none flex-col items-end gap-[6px]">
        {signed ? <QuietCta size="sm" done onClick={onSign}>{D.VOLUNTEER_UI.signed}</QuietCta> : <PrimaryCta size="sm" style={SOLID} onClick={onSign}>{U.signUp}</PrimaryCta>}
        {signed && onCheckIn && (verified
          ? <span className="flex items-center gap-[4px] text-[12px] font-bold" style={{ color: GOOD }}><CheckCircle2 className="h-3.5 w-3.5" aria-hidden />{U.checkedIn}</span>
          : <button type="button" onClick={onCheckIn} className="dm-link flex cursor-pointer items-center gap-[4px] text-[12px] font-bold" style={{ color: BLUE_TEXT }}><Check className="h-3.5 w-3.5" aria-hidden /> {U.checkIn}</button>)}
        {signed && onCal && !verified && <button type="button" onClick={onCal} className="dm-link flex cursor-pointer items-center gap-[4px] text-[12px] font-bold" style={{ color: BLUE_TEXT }}><CalendarPlus className="h-3.5 w-3.5" aria-hidden /> Calendar</button>}
      </span>
    </li>
  );
}

function StudentServe({ shifts, signed, toggle, onToast }: { shifts: D.Shift[]; signed: Record<string, boolean>; toggle: (id: string) => void; onToast: (t: string) => void }) {
  const board = useBoard();
  const U = D.SERVE_UI;
  const G = board.serveGoal;
  // checking in at the shift is what turns planned hours into verified
  // ones (the hours ledger the Gemini research proposed: no paper logs,
  // a record the counselor can trust)
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const logged = G.logged + shifts.filter((s) => verified[s.id]).reduce((n, s) => n + s.hours, 0);
  const planned = shifts.filter((s) => signed[s.id] && !verified[s.id]).reduce((n, s) => n + s.hours, 0);
  return (
    <>
      <div className="grid grid-cols-1 items-center gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] md:grid-cols-[auto_minmax(0,1fr)_auto]" style={HERO_BOX}>
        <Ring pct={Math.min(100, Math.round((logged / G.target) * 100))} size={104} stroke={10} accent={BLUE_TEXT}>
          <span className="flex flex-col items-center"><span className="text-[26px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{logged}</span><span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of {G.target}</span></span>
        </Ring>
        <span className="flex flex-col gap-[4px]">
          <span className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{U.title}</span>
          <span className="text-[14px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{G.line}</span>
          {planned > 0 && <span className="text-[13.5px] font-bold" style={{ color: GOOD }}>+{planned} {U.hours} signed up</span>}
          {planned > 0 && <span className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{U.checkLine}</span>}
        </span>
        <QuietCta size="sm" onClick={() => onToast(U.lettered)}><Download className="h-3.5 w-3.5" aria-hidden /> {U.letter}</QuietCta>
      </div>
      <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
        {shifts.map((s) => <ShiftRow key={s.id} s={s} signed={!!signed[s.id]} onSign={() => toggle(s.id)} onCal={() => addToCalendar(s.title, s.date, s.where, s.hours)} verified={!!verified[s.id]} onCheckIn={() => { setVerified((m) => ({ ...m, [s.id]: true })); onToast(`${s.hours} ${U.hours} added to your record`); }} />)}
      </ul>
      {board.youth && (
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
          <span className="flex items-center gap-[14px]">
            <span className="flex size-[44px] flex-none items-center justify-center rounded-full" style={SOLID}><HandHeart className="h-5 w-5" aria-hidden /></span>
            <span className="flex flex-col">
              <span className="text-[17px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{board.youth.title}</span>
              <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{board.youth.line}</span>
            </span>
          </span>
          {board.youth.url
            ? <a href={board.youth.url} target="_blank" rel="noopener noreferrer" className="dm-link flex items-center gap-[4px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>Learn more <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>
            : <QuietCta size="sm" onClick={() => onToast(D.PROGRAMS_UI.done)}>{D.PROGRAMS_UI.interested}</QuietCta>}
        </div>
      )}
    </>
  );
}

// ——— Q&A: every question on this board, as the other boards list them ———
// Chandu, 8 Oct: "it's not clear where the questions go, how many recent
// answers and questions can I see? ... a questions tab listing every
// question like we have in the other boards." The questions are Connect
// threads (uwThreads.ts), so the cards are the shared QuestionCard and a
// tap opens the shared thread page; Back returns here, same tab, same
// scroll (see MEMO below).

/** A board's questions, the student's own first. Takes the board rather
 *  than reading BoardCtx: the board view is the provider, not inside it. */
const agoMinutes = (ago: string) => { const m = /(\d+)\s*([mhd])/.exec(ago); return m ? Number(m[1]) * ({ m: 1, h: 60, d: 1440 } as const)[m[2] as "m" | "h" | "d"] : 0; };
const boardThreads = (boardId: string, asked: Thread[]): Thread[] => [...asked, ...THREADS.filter((t) => t.boardId === boardId).sort((a, b) => agoMinutes(a.postedAgo) - agoMinutes(b.postedAgo))];
const isAnswered = (t: Thread) => t.state === "answered" || t.state === "resolved";

function QuestionList({ threads, open }: { threads: Thread[]; open: (t: Thread) => void }) {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  return (
    <ul className="flex flex-col gap-[var(--space-3)]">
      {threads.map((t) => (
        <li key={t.id}>
          <QuestionCard thread={t} onOpen={() => open(t)} saved={!!saved[t.id]} onSave={() => setSaved((m) => ({ ...m, [t.id]: !m[t.id] }))} helpful={!!helpful[t.id]} onHelpful={() => setHelpful((m) => ({ ...m, [t.id]: !m[t.id] }))} />
        </li>
      ))}
    </ul>
  );
}

/** Light filter chips with counts, so they never read as a second tab bar. */
function CountChips<K extends string>({ options, value, onChange }: { options: { key: K; label: string; n: number }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((o) => {
        const on = o.key === value;
        return <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(o.key)} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[13px] leading-[17px] font-semibold" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 30%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{o.label}<span className="font-extrabold tabular-nums" style={{ color: on ? "var(--foreground)" : BLUE_TEXT }}>{o.n}</span></button>;
      })}
    </div>
  );
}

function StudentQuestions({ threads, onAsk, open }: { threads: Thread[]; onAsk: (text: string) => void; open: (t: Thread) => void }) {
  const board = useBoard();
  const [asked, setAsked] = useState(false);
  const [filter, setFilter] = useState<typeof D.ASK.filters[number]["key"]>("all");
  const answered = threads.filter(isAnswered).length;
  const counts = { all: threads.length, answered, waiting: threads.length - answered };
  const list = threads.filter((t) => filter === "all" || (filter === "answered") === isAnswered(t));
  return (
    <>
      <Panel id="uw-ask-title" title={D.ASK.title} aside={
        <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex -space-x-[8px]">{board.volunteerIds.slice(0, 4).map((id) => <span key={id} className="rounded-full" style={{ boxShadow: "0 0 0 2px var(--card)" }}><Avatar name={D.VOLUNTEERS[id].name} size={26} /></span>)}</span>
          {board.volunteerIds.length} {D.ASK.answerHere}
        </span>
      }>
        {asked ? (
          <div className="flex flex-col gap-[8px]"><Done text={D.ASK.submitted} /><LinkButton onClick={() => setAsked(false)}>{D.ASK.again}</LinkButton></div>
        ) : (
          <InlineAsk joined defaultOpen accent={BLUE} placeholder={D.ASK.placeholder} onPost={(text) => { onAsk(text); setAsked(true); setFilter("all"); }} />
        )}
        {/* where the question goes: three steps, one line each */}
        <ol className="grid grid-cols-1 gap-[var(--space-3)] border-t pt-[var(--space-4)] sm:grid-cols-3" style={{ borderColor: RULE }}>
          {D.ASK.how.map((h, i) => (
            <li key={h.title} className="flex items-start gap-[10px]">
              <span className="flex size-[24px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums" style={SOLID}>{i + 1}</span>
              <span className="flex flex-col gap-[2px]">
                <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{h.title}</span>
                <span className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{h.line}</span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{D.ASK.all}</SectionHead>
          <CountChips options={D.ASK.filters.map((f) => ({ ...f, n: counts[f.key] }))} value={filter} onChange={setFilter} />
        </div>
        <QuestionList threads={list} open={open} />
      </section>
    </>
  );
}

// ——— Local: pick one United Way ———

function ChapterPicker({ picked, onPick }: { picked: string; onPick: (id: string) => void }) {
  const board = useBoard();
  const c = board.chapters.find((k) => k.id === picked) ?? board.chapters[0];
  return (
    <section className="grid grid-cols-1 items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" style={ITEM}>
      <div className="hidden md:block"><ChapterMap chapters={board.chapters} picked={picked} onPick={onPick} blue={BLUE} yellow={D.BRAND.yellow} height={board.map === "michigan" ? 360 : 280} region={board.map} /></div>
      <div className="flex flex-col gap-[10px]">
        <Eyebrow tone="var(--muted-foreground)">{board.pick}</Eyebrow>
        <div className="flex flex-wrap gap-[6px]">
          {board.chapters.map((k) => {
            const on = k.id === picked;
            return <button key={k.id} type="button" aria-pressed={on} onClick={() => onPick(k.id)} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[13px] leading-[17px] font-semibold" style={{ borderColor: on ? D.BRAND.yellow : "var(--glass-border)", background: on ? `color-mix(in srgb, ${D.BRAND.yellow} 16%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{k.short}</button>;
          })}
        </div>
        <span className="text-[18px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{c.name}</span>
        <span className="flex flex-wrap gap-x-[16px] gap-y-[4px]"><Fact icon={MapPin}>{c.place}</Fact><Fact icon={Users}>{c.students.toLocaleString("en-US")} students</Fact></span>
        {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="dm-link flex w-fit items-center gap-[4px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>Website <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>}
      </div>
    </section>
  );
}

// ——— Home ———

function useStudentWorlds(): string[] {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return picks.ids.map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.world).filter((w): w is string => !!w);
}

function HelpCard() {
  const { help } = useBoard();
  return (
    <a href={help.url} target="_blank" rel="noopener noreferrer" className="dm-tap flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <span className="flex items-center gap-[14px]">
        <span className="flex size-[40px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${D.BRAND.red} 22%, transparent)`, color: "#FF8A80" }}><Heart className="h-5 w-5" aria-hidden /></span>
        <span className="flex flex-col">
          <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{help.title}</span>
          <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{help.line}</span>
        </span>
      </span>
      <span className="flex items-center gap-[6px] text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}><Phone className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} />{help.call}</span>
    </a>
  );
}

/** School supplies asked for privately: a pickup code instead of a line
 *  at the office (the Gemini research's point on stigma). */
function SuppliesCard() {
  const { supplies } = useBoard();
  const U = D.SUPPLY_UI;
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [code, setCode] = useState<string>();
  if (!supplies) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="dm-tap flex cursor-pointer flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
        <span className="flex items-center gap-[14px]">
          <span className="flex size-[40px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${D.BRAND.yellow} 22%, transparent)`, color: D.BRAND.yellow }}><Backpack className="h-5 w-5" aria-hidden /></span>
          <span className="flex flex-col">
            <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{supplies.title}</span>
            <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{supplies.line}</span>
          </span>
        </span>
        <span className="flex items-center gap-[4px] text-[14px] font-extrabold" style={{ color: BLUE_TEXT }}>{U.ask} <ChevronRight className="h-4 w-4" aria-hidden /></span>
      </button>
      {open && (
        <Sheet title={supplies.title} onClose={() => setOpen(false)} titleId="uw-supplies-title">
          {code ? (
            <div className="flex flex-col items-start gap-[10px]">
              <Eyebrow tone="var(--muted-foreground)">{U.ready}</Eyebrow>
              <span className="rounded-[var(--radius-md)] border px-[18px] py-[10px] text-[30px] leading-[34px] font-extrabold tracking-[0.18em] tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", borderColor: `color-mix(in srgb, ${BLUE} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${BLUE} 16%, var(--glass-surface-1))` }}>{code}</span>
              <span className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{U.readyLine}</span>
            </div>
          ) : (
            <>
              <Eyebrow tone="var(--muted-foreground)">{U.pick}</Eyebrow>
              <div className="flex flex-wrap gap-[8px]">
                {supplies.items.map((it) => {
                  const on = !!picked[it];
                  return <button key={it} type="button" aria-pressed={on} onClick={() => setPicked((m) => ({ ...m, [it]: !m[it] }))} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[14px] font-semibold" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 30%, transparent)` : "transparent", color: "var(--foreground)" }}>{on && <Check className="h-3.5 w-3.5" aria-hidden />}{it}</button>;
                })}
              </div>
              <PrimaryCta className="w-fit" style={SOLID} disabled={!Object.values(picked).some(Boolean)} onClick={() => setCode(`BP-${Math.floor(1000 + Math.random() * 9000)}`)}>{U.send}</PrimaryCta>
            </>
          )}
          <a href={supplies.url} target="_blank" rel="noopener noreferrer" className="dm-link flex w-fit items-center gap-[4px] border-t pt-[12px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)", borderColor: RULE }}>{supplies.by} <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>
        </Sheet>
      )}
    </>
  );
}

function StudentHome({ go, openProgram, joined, saves, toggleSave, openEvent, programs, events, served, threads, openThread }: { go: (tab: D.StudentTab) => void; openProgram: (p: D.Program) => void; joined: Record<string, boolean>; saves: Record<string, boolean>; toggleSave: (id: string) => void; openEvent: (e: D.UwEvent) => void; programs: D.Program[]; events: D.UwEvent[]; served: number; threads: Thread[]; openThread: (t: Thread) => void }) {
  const board = useBoard();
  const worlds = useStudentWorlds();
  const fits = (w?: string) => !!w && worlds.includes(w);
  const pickedProgram = programs.find((p) => fits(p.world));
  const pickedEvent = events.find((e) => fits(e.world));
  const soon = events.filter((e) => e.id !== pickedEvent?.id).slice(0, 4);
  // what this student has going on here; hidden until there is something
  const mine = [
    { n: Object.values(joined).filter(Boolean).length, label: "programs", tab: "programs" as const },
    { n: Object.values(saves).filter(Boolean).length, label: "events saved", tab: "events" as const },
    { n: served, label: "service hours planned", tab: "serve" as const },
  ].filter((m) => m.n > 0);
  return (
    <>
      {mine.length > 0 && (
        <div className="flex flex-wrap items-center gap-[8px]">
          <Eyebrow tone="var(--muted-foreground)">You here</Eyebrow>
          {mine.map((m) => <button key={m.label} type="button" onClick={() => go(m.tab)} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><strong className="font-extrabold tabular-nums" style={{ color: BLUE_TEXT }}>{m.n}</strong>{m.label}<ChevronRight className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--muted-foreground)" }} /></button>)}
        </div>
      )}

      {(pickedProgram || pickedEvent) && (
        <section className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>For you</SectionHead>
          <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
            {pickedProgram && <ProgramCard p={pickedProgram} joined={!!joined[pickedProgram.id]} onOpen={() => openProgram(pickedProgram)} wide reason={D.PROGRAMS_UI.forYou} />}
            {pickedEvent && <div className="flex flex-col justify-center"><EventRow e={pickedEvent} saved={!!saves[pickedEvent.id]} onSave={() => toggleSave(pickedEvent.id)} onOpen={() => openEvent(pickedEvent)} reason={D.PROGRAMS_UI.forYou} /></div>}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>Programs</SectionHead>
          <LinkButton onClick={() => go("programs")}>See all {programs.length} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="dm-scroll -mx-[var(--space-5)] flex snap-x snap-mandatory gap-[var(--space-3)] overflow-x-auto px-[var(--space-5)] pb-[4px] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {programs.filter((p) => p.id !== pickedProgram?.id).slice(0, 4).map((p) => <div key={p.id} className="w-[72vw] max-w-[300px] flex-none snap-start sm:w-auto sm:max-w-none"><ProgramCard p={p} joined={!!joined[p.id]} onOpen={() => openProgram(p)} /></div>)}
        </div>
        {programs.length === 0 && <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{D.SCOPE.none}</p>}
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>Coming up</SectionHead>
          <LinkButton onClick={() => go("events")}>All events <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
          {soon.map((e) => <EventRow key={e.id} e={e} saved={!!saves[e.id]} onSave={() => toggleSave(e.id)} onOpen={() => openEvent(e)} />)}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{D.ASK.latest}</SectionHead>
          <LinkButton onClick={() => go("ask")}>All {threads.length} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <QuestionList threads={threads.slice(0, 3)} open={openThread} />
      </section>

      <div className={`grid grid-cols-1 gap-[var(--space-3)] ${board.supplies ? "lg:grid-cols-2" : ""}`}>
        <HelpCard />
        <SuppliesCard />
      </div>
    </>
  );
}

// ——— Volunteer ———

function RoutedQuestion({ q, onDone }: { q: Thread; onDone: () => void }) {
  const U = D.VOLUNTEER_UI;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const leaks = CONTACT_INFO.test(text);
  return (
    <li className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <div className="flex items-center justify-between gap-[8px]">
        <Pill>{q.routedScope}</Pill>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{q.handle}, {q.grade.toLowerCase()} · {q.postedAgo}</span>
      </div>
      <span className="text-[16px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{q.title}</span>
      {done ? <Done text={U.posted} /> : open ? (
        <div className="flex flex-col gap-[8px]">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={U.placeholder} aria-label={U.answer} className="w-full resize-none rounded-[var(--radius-md)] border p-[12px] text-[15px] leading-[21px] outline-none focus-visible:ring-2" style={INPUT_STYLE} />
          {leaks && <span className="text-[12.5px] font-semibold" style={{ color: D.BRAND.yellow }}>{CONTACT_WARNING}</span>}
          <PrimaryCta size="sm" className="w-fit" style={SOLID} disabled={!text.trim() || leaks} onClick={() => { setDone(true); onDone(); }}>{U.post}</PrimaryCta>
        </div>
      ) : <PrimaryCta size="sm" className="w-fit" style={SOLID} onClick={() => setOpen(true)}>{U.answer}</PrimaryCta>}
    </li>
  );
}

function VolunteerToday({ go, nextShift, onToast }: { go: (t: D.VolunteerTab) => void; nextShift?: D.Shift; onToast: (t: string) => void }) {
  const board = useBoard();
  const U = D.VOLUNTEER_UI;
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  return (
    <>
      <div className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={HERO_BOX}>
        <Eyebrow>{U.since}</Eyebrow>
        <ul className="flex flex-col gap-[6px]">
          {board.today.since.map((s) => <li key={s} className="flex items-center gap-[8px] text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}><span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: D.BRAND.yellow }} />{s}</li>)}
        </ul>
        {/* the volunteer's own screening, the gate for any shift with students */}
        <div className="mt-[4px] flex flex-wrap items-center gap-x-[10px] gap-y-[2px] border-t pt-[10px] text-[13px] font-semibold" style={{ borderColor: RULE }}>
          <span className="flex items-center gap-[6px]" style={{ color: GOOD }}><ShieldCheck className="h-4 w-4" aria-hidden />{board.clearance.status}</span>
          <span style={{ color: "var(--muted-foreground)" }}>{board.clearance.line}</span>
        </div>
      </div>

      {nextShift && (
        <div className="flex items-center gap-[14px] rounded-[var(--radius-lg)] border p-[14px]" style={ITEM}>
          <DateTile month={nextShift.date.month} day={nextShift.date.day} />
          <span className="flex min-w-0 flex-1 flex-col"><Eyebrow tone="var(--muted-foreground)">Your next shift</Eyebrow><span className="text-[15.5px] leading-[20px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{nextShift.title}</span><span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{nextShift.date.time} · {nextShift.where}</span></span>
        </div>
      )}

      <section className="flex flex-col gap-[var(--space-4)]">
        <SectionHead>{U.routed}</SectionHead>
        <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-3">
          {/* the same waiting questions students see in Q&A */}
          {THREADS.filter((t) => t.boardId === board.id && !isAnswered(t)).map((q) => <RoutedQuestion key={q.id} q={q} onDone={() => onToast(U.posted)} />)}
        </ul>
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{U.requests}</SectionHead>
          <LinkButton onClick={() => go("shifts")}>All shifts <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-3">
          {board.today.requests.map((r) => (
            <li key={r.id} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
              <div className="flex items-center justify-between gap-[8px]">
                <Eyebrow>{r.kind}</Eyebrow>
                <Pill><Timer className="h-3 w-3" aria-hidden /> {r.minutes} {U.min}</Pill>
              </div>
              <span className="text-[16px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.title}</span>
              <div className="mt-auto pt-[2px]">{accepted[r.id] ? <Done text={U.accepted} /> : <PrimaryCta size="sm" className="w-fit" style={SOLID} onClick={() => setAccepted((m) => ({ ...m, [r.id]: true }))}>{U.accept}</PrimaryCta>}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function VolunteerShifts({ shifts, signed, toggle }: { shifts: D.Shift[]; signed: Record<string, boolean>; toggle: (id: string) => void }) {
  const U = D.VOLUNTEER_UI;
  const [len, setLen] = useState<typeof U.shiftFilters[number]["key"]>("all");
  const list = shifts.filter((s) => len === "all" || s.length === len);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="w-full sm:w-fit"><Segmented ariaLabel="How long" value={len} onChange={setLen} options={[...U.shiftFilters]} grow /></div>
        <span className="flex items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}><ShieldCheck className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />{U.checkNote}</span>
      </div>
      {list.length === 0 && <EmptyView tier={5} query={len} line="Try All." cta="Show all" onAction={() => setLen("all")} />}
      <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
        {list.map((s) => <ShiftRow key={s.id} s={s} signed={!!signed[s.id]} onSign={() => toggle(s.id)} onCal={() => addToCalendar(s.title, s.date, s.where, s.hours)} />)}
      </ul>
    </>
  );
}

const IMPACT_ICONS = [Clock, MessagesSquare, Users, Handshake];
function VolunteerImpact({ onToast }: { onToast: (t: string) => void }) {
  const board = useBoard();
  const M = board.myImpact;
  const U = D.VOLUNTEER_UI;
  return (
    <>
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <SectionHead>My Impact</SectionHead>
        <QuietCta size="sm" onClick={() => onToast(U.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {U.export}</QuietCta>
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {M.tiles.map((t, i) => <div key={t.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}><MetricTile icon={IMPACT_ICONS[i]} value={t.value} label={t.label} accent={BLUE_TEXT} /></div>)}
        </div>
      </SectionSurface>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel id="uw-goal-title" title={U.goal}>
          <div className="flex items-center gap-[18px]">
            <Ring pct={Math.round((M.goal.logged / M.goal.target) * 100)} size={112} stroke={10} accent={BLUE_TEXT}>
              <span className="flex flex-col items-center"><span className="text-[26px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{M.goal.logged}</span><span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of {M.goal.target}</span></span>
            </Ring>
            <span className="flex flex-col gap-[4px]">
              <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{M.goal.target - M.goal.logged} hours to go</span>
              <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Your company counts every hour.</span>
            </span>
          </div>
        </Panel>
        <Panel id="uw-months-title" title={U.monthsTitle}><BarChart values={M.hours} labels={M.months} accent={BLUE_TEXT} highlight={M.hours.length - 1} height={140} unit="hours" ariaLabel="Hours by month" /></Panel>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel id="uw-team-title" title={U.team}>
          <RankedRows color={BLUE_TEXT} unit="hrs" rows={board.team.rows.map((r) => ({ label: r.label, sub: r.label === board.team.you ? "Your team" : undefined, value: r.value, on: r.label === board.team.you }))} />
        </Panel>
        <Panel id="uw-thanks-title" title={U.thanks}>
          <ul className="flex flex-col gap-[var(--space-3)]">
            {board.thanks.map((t) => (
              <li key={t.from} className="flex flex-col gap-[4px]">
                <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{t.text}&rdquo;</span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.from}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

// ——— United Way view ———

const TILE_ICONS = [Users, Handshake, Clock, Briefcase];
function PartnerImpact({ onToast, onPost }: { onToast: (t: string) => void; onPost: () => void }) {
  const board = useBoard();
  const I = board.impact;
  const U = D.PARTNER_UI;
  const [range, setRange] = useState<"month" | "year">("year");
  const trend = demoSeries(board.id, 30, I.trendBase);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented ariaLabel="Range" value={range} onChange={setRange} options={[...U.range]} />
        <QuietCta size="sm" onClick={() => onToast(U.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {U.export}</QuietCta>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center" style={HERO_BOX}>
        <div className="flex flex-col gap-[4px]">
          <span className="text-[52px] leading-[54px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{I.outcome.value}</span>
          <span className="max-w-[24ch] text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{I.outcome.line}</span>
        </div>
        <Funnel steps={I.funnel} color={BLUE} />
      </div>
      {I.signal && (
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${D.BRAND.yellow} 45%, var(--glass-border))`, background: `color-mix(in srgb, ${D.BRAND.yellow} 8%, var(--glass-surface-1))` }}>
          <span className="flex items-center gap-[12px]">
            <span className="text-[24px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: D.BRAND.yellow }}>{I.signal.value}</span>
            <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{I.signal.line}</span>
          </span>
          <PrimaryCta size="sm" style={SOLID} onClick={onPost}><Plus className="h-4 w-4" aria-hidden /> {I.signal.action}</PrimaryCta>
        </div>
      )}
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {I.tiles.map((t, i) => <div key={t.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}><MetricTile icon={TILE_ICONS[i]} value={range === "month" ? t.month : t.year} label={t.label} accent={BLUE_TEXT} /></div>)}
        </div>
      </SectionSurface>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel id="uw-trend-title" title={U.trend}><AreaChart points={trend} accent={BLUE_TEXT} height={190} labels={["30 days ago", "15 days ago", "Today"]} /></Panel>
        <Panel id="uw-safety-title" title={U.safety}>
          <dl className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {I.safety.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-[12px] py-[10px] first:pt-0" style={{ borderColor: RULE }}>
                <dt className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</dt>
                <dd className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: s.value === "Off" ? GOOD : "var(--foreground)" }}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
      <Panel id="uw-grf-title" title={U.grf}>
        <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-4">{I.grf.map((r) => <GoalRing key={r.label} {...r} color={BLUE_TEXT} />)}</div>
      </Panel>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <Panel id="uw-careers-title" title={U.careers}><RankedRows color={BLUE_TEXT} unit="saves" rows={I.careers.map((c) => ({ label: c.label, sub: c.world, value: c.value }))} /></Panel>
        <Panel id="uw-topics-title" title={U.topics}><RankedRows color={BLUE_TEXT} unit="asks" rows={I.topics.map((t) => ({ label: t.label, value: t.value }))} /></Panel>
      </div>
      {(I.context || board.network) && (
        <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          {I.context && (
            <div className="flex flex-col justify-center gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
              <span className="text-[40px] leading-[44px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>{I.context.value}</span>
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{I.context.line}</span>
              <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{I.context.source}</span>
            </div>
          )}
          {board.network && (
            <Panel id="uw-network-title" title={board.network.title}>
              <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
                {board.network.items.map((n) => (
                  <li key={n.name} className="flex flex-col gap-[4px]">
                    <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>{n.stat}</span>
                    <span className="text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{n.name}</span>
                    <span className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{n.line}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}

function PartnerChapters() {
  const board = useBoard();
  const [picked, setPicked] = useState(board.chapters[0].id);
  const c = board.chapters.find((k) => k.id === picked)!;
  const total = board.chapters.reduce((n, k) => n + k.students, 0);
  return (
    <>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SectionSurface className="p-[var(--space-4)]"><ChapterMap chapters={board.chapters} picked={picked} onPick={setPicked} blue={BLUE} yellow={D.BRAND.yellow} height={board.map === "michigan" ? 400 : 300} region={board.map} /></SectionSurface>
        <div className="flex flex-col justify-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={HERO_BOX}>
          <span className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{c.name}</span>
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.place} · {Math.round((c.students / total) * 100)}% of students here</span>
          <div className="grid grid-cols-3 gap-[var(--space-3)]">
            {[{ v: c.students, l: "Students" }, { v: c.volunteers, l: "Volunteers" }, { v: c.hours, l: "Hours" }].map((x) => (
              <span key={x.l} className="flex flex-col"><span className="text-[26px] leading-[30px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{x.v.toLocaleString("en-US")}</span><span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{x.l}</span></span>
            ))}
          </div>
        </div>
      </div>
      <Panel id="uw-chapters-title" title="Students by United Way">
        <RankedRows color={BLUE_TEXT} unit="students" rows={[...board.chapters].sort((a, b) => b.students - a.students).map((k) => ({ label: k.short, sub: k.place, value: k.students, on: k.id === picked, onClick: () => setPicked(k.id) }))} />
      </Panel>
    </>
  );
}

function PostSheet({ onPost, onClose }: { onPost: (kind: "event" | "shift", title: string, where: string, date: string) => void; onClose: () => void }) {
  const U = D.POST_UI;
  const [kind, setKind] = useState<"event" | "shift">("event");
  const [title, setTitle] = useState("");
  const [where, setWhere] = useState("");
  const [date, setDate] = useState("2026-11-14");
  return (
    <Sheet title={U.title} onClose={onClose} titleId="uw-post-title">
      <div className="w-full"><Segmented ariaLabel="What" value={kind} onChange={setKind} options={[...U.kinds]} grow /></div>
      <Field label={U.fields.title}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={U.placeholders[kind]} className={INPUT} style={INPUT_STYLE} /></Field>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <Field label={U.fields.where}><input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Online" className={INPUT} style={INPUT_STYLE} /></Field>
        <Field label={U.fields.date}><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} style={{ ...INPUT_STYLE, colorScheme: "dark" }} /></Field>
      </div>
      <PrimaryCta className="w-fit" style={SOLID} disabled={!title.trim() || !date} onClick={() => onPost(kind, title.trim(), where.trim() || "Online", date)}><Plus className="h-4 w-4" aria-hidden /> {U.submit}</PrimaryCta>
    </Sheet>
  );
}

function PartnerPrograms({ onPost }: { onPost: () => void }) {
  const board = useBoard();
  const rows = board.partnerPrograms;
  const max = Math.max(...rows.map((r) => r.students));
  const cols = ["Program", "Students", "Volunteers", "Hours"];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <SectionHead>{rows.length} programs</SectionHead>
        <PrimaryCta size="sm" style={SOLID} onClick={onPost}><Plus className="h-4 w-4" aria-hidden /> {D.POST_UI.title}</PrimaryCta>
      </div>
      <SectionSurface className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[14px]">
          <thead><tr>{cols.map((c, i) => <th key={c} className={`px-[var(--space-4)] py-[12px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase ${i === 0 ? "text-left" : "text-right"}`} style={{ color: "var(--muted-foreground)", borderBottom: `1px solid ${RULE}` }}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.program} style={{ borderBottom: `1px solid ${RULE}` }}>
                <td className="px-[var(--space-4)] py-[12px]"><span className="block font-bold" style={{ color: "var(--foreground)" }}>{r.program}</span><span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{r.by}</span></td>
                <td className="px-[var(--space-4)] py-[12px]">
                  <span className="flex items-center justify-end gap-[10px]"><span className="hidden h-[6px] w-[90px] overflow-hidden rounded-full sm:block" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}><span className="block h-full rounded-full" style={{ width: `${(r.students / max) * 100}%`, background: BLUE_TEXT }} /></span><span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.students}</span></span>
                </td>
                <td className="px-[var(--space-4)] py-[12px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.volunteers}</td>
                <td className="px-[var(--space-4)] py-[12px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionSurface>
    </>
  );
}

function PartnerPeople({ onToast }: { onToast: (t: string) => void }) {
  const board = useBoard();
  const U = D.PARTNER_UI;
  const openPro = useContext(OpenPro);
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  // safety: one tap takes a volunteer off every shift
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const tone = { done: GOOD, training: BLUE_TEXT, pending: D.BRAND.yellow } as const;
  const pending = board.roster.filter((r) => r.checks !== "done").length;
  return (
    <>
      <div className="flex flex-wrap items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={HERO_BOX}>
        <ShieldCheck className="h-8 w-8 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
        <span className="flex flex-col">
          <span className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pending} need a step before they meet students</span>
          <span className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Background check and training come first.</span>
        </span>
      </div>
      <Panel id="uw-ops-title" title={U.ops}>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          {board.ops.map((o) => {
            const met = o.lower ? o.value <= o.goal : o.value >= o.goal;
            return (
              <div key={o.label} className="flex flex-col gap-[4px]">
                <span className="text-[30px] leading-[34px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{o.value}{o.unit ?? ""}</span>
                <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{o.label}</span>
                <span className="flex items-center gap-[5px] text-[12.5px] font-semibold" style={{ color: met ? GOOD : D.BRAND.yellow }}><span aria-hidden className="size-[6px] rounded-full" style={{ background: met ? GOOD : D.BRAND.yellow }} />Goal {o.lower ? `${o.goal} or less` : `${o.goal}${o.unit ?? ""}`}</span>
              </div>
            );
          })}
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel id="uw-roster-title" title={U.roster}>
          <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {board.roster.map((r) => {
              const pro = D.VOLUNTEERS[r.pro];
              if (!pro) return null;
              return (
                <li key={r.pro} className="flex items-center justify-between gap-[12px] py-[10px] first:pt-0" style={{ borderColor: RULE }}>
                  <button type="button" onClick={() => openPro(r.pro)} className="dm-quiet flex min-w-0 cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] text-left">
                    <Avatar name={pro.name} size={34} />
                    <span className="min-w-0"><span className="block truncate text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</span><span className="block truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{pro.org} · {r.hours} hrs</span></span>
                  </button>
                  <span className="flex flex-none items-center gap-[8px]">
                    <span className="flex items-center gap-[5px] text-[12.5px] font-bold" style={{ color: paused[r.pro] ? D.BRAND.red : tone[r.checks] }}><span aria-hidden className="size-[6px] rounded-full" style={{ background: paused[r.pro] ? D.BRAND.red : tone[r.checks] }} />{paused[r.pro] ? U.paused : U.checks[r.checks]}</span>
                    {r.checks === "pending" && (reminded[r.pro] ? <Check className="h-4 w-4" aria-label={U.reminded} style={{ color: GOOD }} /> : <QuietCta size="sm" onClick={() => { setReminded((m) => ({ ...m, [r.pro]: true })); onToast(U.reminded); }}>{U.remind}</QuietCta>)}
                    {r.checks !== "pending" && <QuietCta size="sm" done={!!paused[r.pro]} onClick={() => { setPaused((m) => ({ ...m, [r.pro]: !m[r.pro] })); if (!paused[r.pro]) onToast(U.pausedToast); }}>{paused[r.pro] ? U.resume : U.pause}</QuietCta>}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel id="uw-companies-title" title="Hours by company">
          <RankedRows color={BLUE_TEXT} unit="hrs" rows={board.team.rows.map((r) => ({ label: r.label, value: r.value }))} />
        </Panel>
      </div>
    </>
  );
}

// ——— demo switch and the board ———

function DemoViewSwitch({ view, onPick }: { view: D.UwView; onPick: (view: D.UwView) => void }) {
  const [open, setOpen] = useState(view !== "student");
  return (
    <div className="flex min-w-0 items-center justify-end gap-[10px]">
      <button type="button" aria-expanded={open} aria-controls="uw-demo-views" onClick={() => setOpen((v) => !v)} className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Demo</button>
      {open && (
        <div id="uw-demo-views" role="tablist" aria-label="Show this board as" className="flex min-w-0 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          {D.VIEWS.map((o) => {
            const on = o.key === view;
            return <button key={o.key} type="button" role="tab" aria-selected={on} onClick={() => onPick(o.key)} className="dm-quiet flex min-h-[28px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: on ? "var(--glass-surface-2)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>{o.label}</button>;
          })}
        </div>
      )}
    </div>
  );
}

const sortByDate = <T extends { date: { month: string; day: number; year: number } }>(list: T[]) => [...list].sort((a, b) => (a.date.year - b.date.year) || (MONTHS.indexOf(a.date.month) - MONTHS.indexOf(b.date.month)) || (a.date.day - b.date.day));

/** Where the student was when they opened a question, per board. Opening a
 *  question leaves the board for the shared thread page, which unmounts
 *  this view; Back remounts it, and this puts them on the same view, tab,
 *  scope and scroll instead of the top of Home (Chandu: "I'll have to
 *  click back and lose my way or last scroll position"). In memory only,
 *  so a fresh load still starts at Home. */
type Memo = { view: D.UwView; studentTab: D.StudentTab; volunteerTab: D.VolunteerTab; partnerTab: D.PartnerTab; scope: D.Scope; chapter: string; asked: Thread[]; y: number };
const MEMO: Record<string, Memo | undefined> = {};

export function UnitedWayBoardView({ board = D.NETWORK, onBack, backLabel = D.BACK }: { board?: D.UwBoard; onBack: () => void; backLabel?: string }) {
  const [memo] = useState(() => { const m = MEMO[board.id]; MEMO[board.id] = undefined; return m; });
  const router = useRouter();
  const nav = useContext(ConnectNav);
  const onOpenMentorship = () => (nav?.openMentorship ? nav.openMentorship(D.MENTORSHIP_PROGRAM.id) : router.push(`/connect?tab=mentorship&program=${D.MENTORSHIP_PROGRAM.id}`));
  const [view, setView] = useState<D.UwView>(memo?.view ?? "student");
  const [studentTab, setStudentTab] = useState<D.StudentTab>(memo?.studentTab ?? "home");
  const [volunteerTab, setVolunteerTab] = useState<D.VolunteerTab>(memo?.volunteerTab ?? "today");
  const [partnerTab, setPartnerTab] = useState<D.PartnerTab>(memo?.partnerTab ?? "impact");
  useEffect(() => {
    // after Connect's own scroll-to-top on Back, and after the board paints
    // retried for up to a second: the page is not tall enough to reach the
    // old spot until the tab's content and photos have laid out
    if (!memo) return;
    let id = 0;
    const until = performance.now() + 1000;
    const tick = () => {
      window.scrollTo(0, memo.y);
      if (Math.abs(window.scrollY - memo.y) > 2 && performance.now() < until) id = window.setTimeout(tick, 16);
    };
    id = window.setTimeout(tick, 0);
    return () => window.clearTimeout(id);
  }, [memo]);
  const keepY = useRef<number | null>(null);
  const keep = <T,>(set: (v: T) => void) => (v: T) => { keepY.current = window.scrollY; set(v); };
  useLayoutEffect(() => {
    if (keepY.current == null) return;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo(0, Math.min(keepY.current, max));
    keepY.current = null;
  }, [studentTab, volunteerTab, partnerTab]);
  const [toast, onToast] = useToast();
  const [profile, setProfile] = useState<string>();
  const [program, setProgram] = useState<D.Program>();
  const [event, setEvent] = useState<D.UwEvent>();
  const [posting, setPosting] = useState(false);
  const [joinedLocal, setJoined] = useState<Record<string, boolean>>({});
  const uw = useUwMentorship();
  // e-Mentorship's interest is shared with the Mentorship tab
  const joined: Record<string, boolean> = { ...joinedLocal, ...Object.fromEntries(board.programs.filter((p) => p.mentorship).map((p) => [p.id, uw.stage !== "none"])) };
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [served, setServed] = useState<Record<string, boolean>>({});
  const [shiftsSigned, setShiftsSigned] = useState<Record<string, boolean>>({});
  // what United Way posts here appears straight away in the other views
  const [postedEvents, setPostedEvents] = useState<D.UwEvent[]>([]);
  const [postedShifts, setPostedShifts] = useState<D.Shift[]>([]);
  // Everywhere or one local United Way; Local starts on the student's own
  // state when a United Way there is on the board
  const [scope, setScope] = useState<D.Scope>(memo?.scope ?? "all");
  const homeState = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot).states[0];
  const [chapter, setChapter] = useState<string>(() => memo?.chapter ?? board.chapters.find((k) => homeState && k.place.includes(homeState))?.id ?? board.chapters[0].id);
  // questions this student asks here sit at the top of Q&A as waiting
  const [asked, setAsked] = useState<Thread[]>(memo?.asked ?? []);
  const threads = boardThreads(board.id, asked);
  const ask = (text: string) => {
    setAsked((l) => [{ id: `uw-asked-${Date.now()}`, boardId: board.id, type: "question", title: text, handle: "Jordan", grade: "Senior", postedAgo: "Just now", state: "routed", routedScope: "Volunteers here", expectedWindow: "within 1 day", helpful: 0, followers: 0, responses: [] }, ...l]);
    nav?.noteAsked(text, board.id);
  };
  const openThread = (t: Thread) => {
    if (t.id.startsWith("uw-asked-")) { onToast("Volunteers have it. Answers show up in Your questions."); return; }
    MEMO[board.id] = { view, studentTab, volunteerTab, partnerTab, scope, chapter, asked, y: window.scrollY };
    nav?.openThread(t.id);
  };
  const local = scope === "local";
  const inScope = (c: string | null) => !local || c === null || c === chapter;
  const programs = board.programs.filter((p) => !local || p.chapter === chapter);
  const events = sortByDate([...board.events, ...postedEvents]).filter((e) => inScope(e.chapter));
  const serve = sortByDate([...board.serve, ...postedShifts.filter((s) => s.who !== "Any volunteer")]).filter((s) => inScope(s.chapter));
  const shifts = sortByDate([...board.shifts, ...postedShifts]);
  const servedHours = serve.filter((s) => served[s.id]).reduce((n, s) => n + s.hours, 0);
  const nextShift = shifts.find((s) => shiftsSigned[s.id]);
  const flip = (set: (f: (m: Record<string, boolean>) => Record<string, boolean>) => void) => (id: string) => set((m) => ({ ...m, [id]: !m[id] }));
  const post = (kind: "event" | "shift", title: string, where: string, iso: string) => {
    const [y, mo, d] = iso.split("-").map(Number);
    const date = { month: MONTHS[mo - 1], day: d, time: "4:00 PM", year: y };
    const id = `posted-${Date.now()}`;
    if (kind === "event") setPostedEvents((l) => [...l, { id, kind: "New", title, where, virtual: /online/i.test(where), about: title, who: "Any student", date, going: 0, chapter: null }]);
    else setPostedShifts((l) => [...l, { id, kind: "New", title, where, date, hours: 2, spots: 20, who: "Ages 14 and up", chapter: null, length: "day" }]);
    setPosting(false);
    onToast(D.PARTNER_UI.posted);
  };

  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    return <ProProfileView key={pro.id} pro={pro} follows={follows} onFollow={() => flip(setFollows)(profile)} onBack={() => setProfile(undefined)} backLabel="Back to United Way" />;
  }

  const cover = view === "volunteer" ? board.photos.volunteers : board.photos.hero;
  const focus = view === "volunteer" ? board.photos.volunteersFocus : board.photos.heroFocus;
  const title = view === "volunteer" ? "Volunteer" : view === "partner" ? "Impact" : board.name;
  return (
    <BoardCtx.Provider value={board}>
    <OpenPro.Provider value={setProfile}>
      {program && <ProgramSheet p={program} joined={!!joined[program.id]} onJoin={() => { if (program.mentorship) markUwInterest(); else setJoined((m) => ({ ...m, [program.id]: true })); onToast(D.PROGRAMS_UI.done); }} onMentorship={() => { setProgram(undefined); onOpenMentorship(); }} onClose={() => setProgram(undefined)} />}
      {event && <EventSheet e={event} saved={!!saves[event.id]} onSave={() => flip(setSaves)(event.id)} inPlan={!!plan[event.id]} onPlan={() => { flip(setPlan)(event.id); onToast(plan[event.id] ? "Removed from My Plan" : "Added to My Plan"); }} onClose={() => setEvent(undefined)} />}
      {posting && <PostSheet onPost={post} onClose={() => setPosting(false)} />}
      {toast}

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</button>
        <DemoViewSwitch key={view} view={view} onPick={setView} />
      </div>

      {/* United Way's own photo and mark; the white mark is the brand's
         one-colour version for dark grounds */}
      <section aria-label="United Way" className="relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-6)] sm:min-h-[340px] sm:px-[var(--space-8)]" style={{ background: "#0a0f2a", border: `1px solid color-mix(in srgb, ${BLUE} 55%, transparent)`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 55%, transparent), 0 18px 44px -22px rgba(0,0,0,0.65)`, textShadow: CARD_TEXT_SHADOW }}>
        <Image key={cover} src={cover} alt="" fill sizes="1280px" priority className="object-cover" style={{ objectPosition: focus }} />
        <span aria-hidden className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,20,70,0.92) 0%, rgba(0,30,90,0.7) 38%, rgba(0,30,90,0.1) 70%, transparent 100%), linear-gradient(to top, rgba(6,8,18,0.7) 0%, transparent 45%)" }} />
        <span aria-hidden className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(0,20,70,0.95) 0%, rgba(0,25,80,0.75) 42%, rgba(0,25,80,0.15) 72%, rgba(0,20,60,0.35) 100%)" }} />
        <Image src={D.BRAND.logoWhite} alt="United Way" width={156} height={73} unoptimized className="absolute top-[var(--space-6)] left-[var(--space-6)] z-10 h-[46px] w-auto sm:left-[var(--space-8)] sm:h-[56px]" />
        <div className="relative z-10 flex max-w-[520px] flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[34px] font-extrabold sm:text-[44px] sm:leading-[46px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{title}</h1>
          {view === "student" && <p className="text-[16px] leading-[22px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>{board.line}</p>}
          {view === "student" && (
            <div className="mt-[6px] flex flex-wrap gap-[8px]">
              {board.stats.map((s) => <span key={s.label} className="rounded-full px-[12px] py-[5px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", textShadow: "none" }}><strong className="font-extrabold">{s.value}</strong> {s.label}</span>)}
            </div>
          )}
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        {view === "student" && (
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <div className="w-full sm:w-fit"><Segmented ariaLabel="Section" value={studentTab} onChange={keep(setStudentTab)} options={[...D.STUDENT_TABS]} grow dense /></div>
            {studentTab !== "ask" && <Segmented ariaLabel="Where" value={scope} onChange={setScope} options={[...D.SCOPE.options]} />}
          </div>
        )}
        {view === "student" && local && studentTab !== "ask" && <ChapterPicker picked={chapter} onPick={setChapter} />}
        <div className={view === "student" ? "hidden" : "w-full sm:w-fit"}>
          {view === "volunteer" && <Segmented ariaLabel="Section" value={volunteerTab} onChange={keep(setVolunteerTab)} options={[...D.VOLUNTEER_TABS]} grow />}
          {view === "partner" && <Segmented ariaLabel="Section" value={partnerTab} onChange={keep(setPartnerTab)} options={[...D.PARTNER_TABS]} grow />}
        </div>
        <motion.div key={`${view}-${view === "student" ? studentTab : view === "volunteer" ? volunteerTab : partnerTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-[var(--space-6)]">
          {view === "student" && studentTab === "home" && <StudentHome go={keep(setStudentTab)} openProgram={setProgram} joined={joined} saves={saves} toggleSave={flip(setSaves)} openEvent={setEvent} programs={programs} events={events} served={servedHours} threads={threads} openThread={openThread} />}
          {view === "student" && studentTab === "programs" && <StudentPrograms programs={programs} joined={joined} open={setProgram} />}
          {view === "student" && studentTab === "events" && <StudentEvents saves={saves} toggleSave={flip(setSaves)} open={setEvent} events={events} />}
          {view === "student" && studentTab === "serve" && <StudentServe shifts={serve} signed={served} toggle={flip(setServed)} onToast={onToast} />}
          {view === "student" && studentTab === "ask" && <StudentQuestions threads={threads} onAsk={ask} open={openThread} />}

          {view === "volunteer" && volunteerTab === "today" && <VolunteerToday go={keep(setVolunteerTab)} nextShift={nextShift} onToast={onToast} />}
          {view === "volunteer" && volunteerTab === "shifts" && <VolunteerShifts shifts={shifts} signed={shiftsSigned} toggle={flip(setShiftsSigned)} />}
          {view === "volunteer" && volunteerTab === "impact" && <VolunteerImpact onToast={onToast} />}

          {view === "partner" && partnerTab === "impact" && <PartnerImpact onToast={onToast} onPost={() => setPosting(true)} />}
          {view === "partner" && partnerTab === "chapters" && <PartnerChapters />}
          {view === "partner" && partnerTab === "programs" && <PartnerPrograms onPost={() => setPosting(true)} />}
          {view === "partner" && partnerTab === "people" && <PartnerPeople onToast={onToast} />}
        </motion.div>
      </SectionSurface>
    </OpenPro.Provider>
    </BoardCtx.Provider>
  );
}
