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
//
// 12 Oct 2026, the client via Chandu: "they needed a means of communication
// between the 4 regions on one board. And also a space like our events tab
// where participants could keep the conversation going after events were
// done ... for events, use the same design language and components as our
// events tab." So:
// - Q&A grew into Talk, the one space where every community on the board
//   talks to the others: questions and volunteers' posts from every
//   community in one list, each with a quiet place tag, a community
//   filter, and replies from anyone. Evolving Q&A (not a sixth tab) keeps
//   one place to ask, and the tab row short.
// - Then (same day, Chandu): "the ask was mainly about the employees having
//   a platform to communicate from these 4 different locations. The
//   student part wasn't even mentioned, but we'll have that as a nice to
//   have." So the board opens on the United Way staff view, whose first
//   tab is Team: staff in every office post updates, ask each other,
//   share ideas and files, reply across offices and pin the plans they
//   share. Its Events tab is the shared calendar across offices (co-host,
//   who hosts, past events with the staff debrief leading). Students come
//   second (their Talk is the student side), volunteers third.
// - Events are Connect's own: the EventTicket from the Events tab, and the
//   EventView event board at /connect?event=<id> (uwEvents.ts turns a
//   United Way event into an EventBoard). Before the day: details, going,
//   Remind me. After it: the board stays open (Questions, Posts, Pro posts,
//   Resources, People, About). Upcoming and Past split the list.

import Image from "next/image";
import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Backpack, Briefcase, Calendar, CalendarPlus, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, FileText, GraduationCap, HandHeart, Handshake, Heart, Lightbulb, MapPin, Megaphone, MessageCircleQuestion, MessageSquareOff, MessagesSquare, Phone, Pin, Plus, ShieldCheck, Sparkles, Sun, Timer, Users, X, Crown } from "lucide-react";
import { setReplyAs } from "@/lib/replyAs";
import { downloadCalendarFile } from "@/lib/calendarFile";
import { toggleEventReminder, useEventReminders } from "@/lib/eventReminders";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { markUwInterest, useUwMentorship } from "@/lib/uwMentorship";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { EmptyView } from "@/components/app/states";
import { Listbox } from "@/components/app/Listbox";
import { Avatar, CONTACT_INFO, CONTACT_WARNING, ConnectNav, InlineAsk, PrimaryCta, QuietCta, SectionHead, SectionSurface } from "../primitives";
import { MetricTile, Ring, Segmented, ruledCell } from "../viz";
import { BarChart } from "../mentorship/charts";
import { ChapterMap, DotDiamondPlot, DualBars, Funnel, GoalArcs, InterestDots, RankedRows, ShareRing } from "./uwCharts";
import { LoginsChart, Sparkline } from "@/components/app/engagementCharts";
import { Panel, ProProfileView, useProfilePage, RULE } from "../ProProfile";
import { CommentRow, EventTicket, InsightCard, PlaceTag, QrSheet, QuestionCard, ReplyComposer, partnerAccent } from "../ConnectExperience";
import { INSIGHTS, THREADS, type EventBoard, type Insight, type Thread } from "../data";
import * as D from "./uwData";
import { registerUwEvent, toEventBoard } from "./uwEvents";
import { useBackStep } from "@/lib/backStep";

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
        <div className="dm-scroll relative z-[1] flex max-h-[calc(calc(100dvh/var(--vz,1))-96px)] w-full max-w-[480px] flex-col overflow-y-auto rounded-[var(--radius-xl)] border sm:max-h-[calc(88dvh/var(--vz,1))] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: `color-mix(in srgb, ${BLUE} 40%, var(--glass-border))`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 45%, transparent), 0 16px 48px -4px rgba(0,0,0,0.55)` }}>
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
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] max-w-[calc(calc(100vw/var(--vz,1))-32px)] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-center text-[13.5px] font-semibold" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7)" }}>{toast}</div>
    </Portal>
  ) : null;
  return [node, setToast];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** A shift's calendar file (the shared helper, lib/calendarFile.ts). */
const addToCalendar = (title: string, date: D.Shift["date"], where: string, hours = 1) => downloadCalendarFile(title, date, where, hours);

// ——— Programs: the photo is the card ———

function ProgramCard({ p, joined, onOpen, wide = false, reason }: { p: D.Program; joined: boolean; onOpen: () => void; wide?: boolean; reason?: string }) {
  const Icon = KIND_ICON[p.kind];
  return (
    <button type="button" onClick={onOpen} className={`dm-tap group relative flex w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left ${wide ? "aspect-[4/3]" : "aspect-[4/5]"}`} style={{ borderColor: "var(--glass-border)", textShadow: CARD_TEXT_SHADOW, boxShadow: "0 18px 40px -26px rgba(0,0,0,0.7)" }}>
      <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" style={{ objectPosition: p.focus }} />
      <CardProgressiveBlur size="52%" />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.55) 38%, transparent 65%)" }} />
      <span className="absolute top-[10px] left-[10px] z-10 inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: BLUE, color: "#fff", textShadow: "none" }}><Icon className="h-3 w-3" aria-hidden />{D.KIND_LABEL[p.kind]}</span>
      <span className="relative z-10 flex flex-col gap-[4px] p-[var(--space-4)]">
        {/* the same "why" line an event row uses, never a second chip */}
        {reason && <span className="flex items-center gap-[4px] text-[12px] leading-[16px] font-bold" style={{ color: D.BRAND.yellow }}><Sparkles className="h-3 w-3" aria-hidden />{reason}</span>}
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

/** Choice chips for the in-board application: one pick, or many. */
function ChoiceChips({ options, value, onChange }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      {options.map((o) => {
        const on = value.includes(o);
        return <button key={o} type="button" aria-pressed={on} onClick={() => onChange([o])} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[14px] font-semibold" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 30%, transparent)` : "transparent", color: "var(--foreground)" }}>{on && <Check className="h-3.5 w-3.5" aria-hidden />}{o}</button>;
      })}
    </div>
  );
}

/** Applying happens here, in three taps, never on the program's own site. */
function ApplySheet({ p, onSend, onClose }: { p: D.Program; onSend: () => void; onClose: () => void }) {
  const F = D.PROGRAM_PAGE.form;
  const [grade, setGrade] = useState<string[]>([]);
  const [want, setWant] = useState<string[]>([]);
  const [when, setWhen] = useState<string[]>([]);
  return (
    <Sheet title={`${F.title}: ${p.title}`} onClose={onClose} titleId="uw-apply-title">
      <Field label={F.grade.q}><ChoiceChips options={F.grade.options} value={grade} onChange={setGrade} /></Field>
      <Field label={F.want}><ChoiceChips options={p.gets} value={want} onChange={setWant} /></Field>
      <Field label={F.when.q}><ChoiceChips options={F.when.options} value={when} onChange={setWhen} /></Field>
      <PrimaryCta className="w-fit" style={SOLID} disabled={!grade.length || !want.length || !when.length} onClick={onSend}>{F.submit}</PrimaryCta>
    </Sheet>
  );
}

/** Where an application stands: three steps, the current one lit. */
function AppTracker({ at }: { at: number }) {
  const P = D.PROGRAM_PAGE;
  return (
    <div className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={HERO_BOX}>
      <ol className="grid grid-cols-3 gap-[8px]">
        {P.track.map((t, i) => (
          <li key={t} className="flex flex-col gap-[6px]">
            <span className="h-[6px] rounded-full" style={{ background: i < at ? GOOD : i === at ? BLUE_TEXT : "var(--glass-border)" }} />
            <span className="text-[13px] font-bold" style={{ color: i <= at ? "var(--foreground)" : "var(--muted-foreground)" }}>{t}</span>
          </li>
        ))}
      </ol>
      <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{P.trackLine}</span>
    </div>
  );
}

/** A program's own page, inside the board: the facts, what you get, how it
 *  works, applying, its events and people, and questions about it. */
function ProgramPage({ p, applied, onApply, onMentorship, mentorshipJoined, onBack, events, threads, onAsk, openThread }: { p: D.Program; applied: boolean; onApply: () => void; onMentorship: () => void; mentorshipJoined: boolean; onBack: () => void; events: D.UwEvent[]; threads: Thread[]; onAsk: (text: string, topic: string) => void; openThread: (t: Thread) => void }) {
  const board = useBoard();
  const P = D.PROGRAM_PAGE;
  const U = D.PROGRAMS_UI;
  const [tab, setTab] = useState<D.ProgramTab>("about");
  const [asking, setAsking] = useState(false);
  const chapter = board.chapters.find((c) => c.id === p.chapter);
  const Icon = KIND_ICON[p.kind];
  // its own United Way's upcoming events first, then the ones open to
  // everyone; two tickets, one row
  const ahead = events.filter((e) => !isPast(e));
  const related = (p.chapter ? [...ahead.filter((e) => e.chapter === p.chapter), ...ahead.filter((e) => e.chapter === null)] : ahead).slice(0, 2);
  const about = threads.filter((t) => t.routedScope === p.title);
  const facts = [{ k: "Who", v: p.who }, ...(p.when ? [{ k: "When", v: p.when }] : []), { k: "Where", v: p.where }, ...(p.deadline ? [{ k: "Apply", v: p.deadline.replace(/^Apply /, "") }] : [])];
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> {P.back}</button>

      {/* the program's photo as its header, like a detail page */}
      <section className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] p-[var(--space-6)] sm:min-h-[340px] sm:px-[var(--space-8)]" style={{ background: "#0a0f2a", border: `1px solid color-mix(in srgb, ${BLUE} 55%, transparent)`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 55%, transparent)`, textShadow: CARD_TEXT_SHADOW }}>
        <Image src={p.photo} alt="" fill sizes="1100px" priority className="object-cover" style={{ objectPosition: p.focus }} />
        <CardProgressiveBlur size="58%" />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.6) 40%, transparent 72%)" }} />
        <div className="relative z-10 flex max-w-[620px] flex-col gap-[8px]">
          <span className="inline-flex w-fit items-center gap-[5px] rounded-full px-[10px] py-[4px] text-[12px] leading-[16px] font-bold" style={{ background: BLUE, color: "#fff", textShadow: "none" }}><Icon className="h-3.5 w-3.5" aria-hidden />{D.KIND_LABEL[p.kind]}</span>
          <h1 className="text-[32px] leading-[35px] font-extrabold text-balance sm:text-[42px] sm:leading-[45px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{p.title}</h1>
          <p className="text-[16px] leading-[22px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>{p.line}</p>
          <span className="mt-[4px] flex flex-wrap items-center gap-[8px]" style={{ textShadow: "none" }}><StatusDot status={p.status} />{p.deadline && <Pill tone={D.BRAND.yellow}><Clock className="h-3 w-3" aria-hidden />{p.deadline}</Pill>}</span>
        </div>
      </section>

      {/* the one action, then where the application stands */}
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        {p.mentorship
          ? (mentorshipJoined ? <PrimaryCta onClick={onMentorship} style={SOLID}>{U.continueMentorship} <ChevronRight className="h-4 w-4" aria-hidden /></PrimaryCta> : <PrimaryCta onClick={onApply} style={SOLID}>{U.interested}</PrimaryCta>)
          : applied ? <Done text={P.applied} /> : <PrimaryCta onClick={onApply} style={SOLID}>{P.apply}</PrimaryCta>}
        {p.mentorship && !mentorshipJoined && <QuietCta onClick={onMentorship}>{U.openMentorship}</QuietCta>}
        <QuietCta onClick={() => { setTab("ask"); setAsking(true); }}><MessagesSquare className="h-4 w-4" aria-hidden /> {P.ask}</QuietCta>
      </div>
      {applied && !p.mentorship && <AppTracker at={1} />}
      {p.mentorship && mentorshipJoined && <Done text={U.nextStep} />}

      {/* the facts strip, divided, the way the detail pages show them */}
      <section aria-label="Program facts" className={`grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border ${facts.length === 4 ? "sm:grid-cols-4" : facts.length === 3 ? "sm:grid-cols-3" : ""}`} style={{ ...ITEM, boxShadow: "none" }}>
        {facts.map((f, i) => (
          <div key={f.k} className={`flex flex-col gap-[4px] p-[var(--space-4)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} sm:[&:nth-child(n+2)]:border-l`} style={{ borderColor: RULE }}>
            <Eyebrow tone="var(--muted-foreground)">{f.k}</Eyebrow>
            <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{f.v}</span>
          </div>
        ))}
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        <div className="w-full sm:w-fit"><Segmented ariaLabel="Program section" value={tab} onChange={setTab} options={[...P.tabs]} grow /></div>
        {tab === "about" && (
          <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-[var(--space-5)]">
              {p.about && <p className="max-w-[60ch] text-[16px] leading-[24px]" style={{ color: "var(--foreground)" }}>{p.about}</p>}
              <div className="flex flex-col gap-[10px]"><Eyebrow tone="var(--muted-foreground)">{P.gets}</Eyebrow><Gets items={p.gets} /></div>
              {p.mentorship && <NoMessages />}
            </div>
            <div className="flex flex-col gap-[var(--space-4)]">
              {p.proof && <Proof {...p.proof} />}
              <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <Eyebrow tone="var(--muted-foreground)">{P.runBy}</Eyebrow>
                <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{p.by}</span>
                {chapter && <span className="flex items-center gap-[6px] text-[13px]" style={{ color: "var(--muted-foreground)" }}><MapPin className="h-3.5 w-3.5" aria-hidden />{chapter.place}</span>}
              </div>
              <div className="flex flex-col gap-[10px]">
                <Eyebrow tone="var(--muted-foreground)">{P.people}</Eyebrow>
                <ProStack ids={board.volunteerIds.slice(0, 5)} />
              </div>
            </div>
          </div>
        )}
        {tab === "how" && (
          <div className="flex flex-col gap-[var(--space-5)]">
            <Steps steps={p.steps ?? [U.interested, P.apply, "Start"]} at={applied || mentorshipJoined ? 1 : 0} />
          </div>
        )}
        {tab === "ask" && (
          <div className="flex flex-col gap-[var(--space-4)]">
            {asking ? <Done text={P.asked} /> : null}
            <InlineAsk joined defaultOpen accent={BLUE} placeholder={P.askPlaceholder} onPost={(text) => { onAsk(text, p.title); setAsking(true); }} />
            {about.length === 0 && !asking && <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{P.noQuestions}</p>}
            {about.length > 0 && <QuestionList threads={about} open={openThread} />}
          </div>
        )}
      </SectionSurface>

      {related.length > 0 && (
        <section className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>{P.events}</SectionHead>
          <UwEventGrid events={related} />
        </section>
      )}
    </>
  );
}

/** One opportunity a professional shared: who shared it (their face opens
 *  their profile), what it is, where, and when. */
function SharedRow({ o }: { o: D.SharedOpportunity }) {
  const openPro = useContext(OpenPro);
  const pro = D.VOLUNTEERS[o.proId];
  return (
    <li className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <div className="flex items-center justify-between gap-[8px]">
        <Pill>{o.kind}</Pill>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{o.when}</span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{o.title}</span>
        <span className="text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{o.org} · {o.line}</span>
      </div>
      {pro && (
        <button type="button" onClick={() => openPro(o.proId)} className="dm-quiet flex w-fit cursor-pointer items-center gap-[8px] rounded-full pr-[10px] text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>
          <Avatar name={pro.name} size={26} /> Shared by {pro.name.split(" ")[0]}
        </button>
      )}
    </li>
  );
}

/** A row of volunteer faces that open their profiles. */
function ProStack({ ids }: { ids: string[] }) {
  const openPro = useContext(OpenPro);
  return (
    <div className="flex flex-wrap gap-[var(--space-3)]">
      {ids.map((id) => {
        const pro = D.VOLUNTEERS[id];
        if (!pro) return null;
        return (
          <button key={id} type="button" onClick={() => openPro(id)} className="dm-quiet flex w-[72px] cursor-pointer flex-col items-center gap-[4px] rounded-[var(--radius-md)] p-[4px] text-center">
            <Avatar name={pro.name} size={44} />
            <span className="w-full truncate text-[12px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
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

// ——— Events: Connect's own tickets and event board (12 Oct 2026) ———

/** Opening an event leaves the board for Connect's event page; the toast
 *  confirms a reminder. Provided by the board view. */
const EventsCtx = createContext<{ open: (id: string, filter?: string) => void; toast: (t: string) => void }>({ open: () => {}, toast: () => {} });
/** The Events and Talk filters, held by the board view so Back from an
 *  event page or a thread lands on the same filter (the Back memo). */
type Filters = { when: D.EventWhen; setWhen: (w: D.EventWhen) => void; place: string; setPlace: (p: string) => void; show: Show; setShow: (s: Show) => void; office: string; setOffice: (o: string) => void };
const FiltersCtx = createContext<Filters>({ when: "upcoming", setWhen: () => {}, place: "all", setPlace: () => {}, show: "all", setShow: () => {}, office: "all", setOffice: () => {} });
const isPast = (e: D.UwEvent) => !!e.followUp;

/** United Way events as the Events tab's own tickets: the same card, the
 *  same tap (an upcoming one opens its page, a past one its board), in
 *  United Way's blue with its mark on the stub. */
function UwEventGrid({ events, staff = false }: { events: D.UwEvent[]; /** the staff calendar: who hosts, Co-host, and a past event opens on its debrief */ staff?: boolean }) {
  const board = useBoard();
  const { open, toast } = useContext(EventsCtx);
  const reminders = useEventReminders();
  const [qr, setQr] = useState<EventBoard | null>(null);
  const S = D.STAFF_UI;
  return (
    <>
      <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2">
        {events.map((e) => {
          const ev = toEventBoard(e, board);
          // a staff co-host is its own toggle, kept beside the reminders
          const key = staff ? `cohost:${e.id}` : e.id;
          const host = board.chapters.find((c) => c.id === e.chapter)?.short;
          return (
            <EventTicket key={e.id} event={ev} joined={ev.entitled} onOpenEvent={(id) => open(id, staff && isPast(e) ? "posts" : undefined)} onEnterCode={open} onQr={setQr}
              reminded={!!reminders[key]} onRemind={isPast(e) ? undefined : () => { if (toggleEventReminder(key)) toast(staff ? S.cohostToast : D.EVENTS_UI.remindToast); }}
              remindLabels={staff ? [S.cohost, S.cohosting] : undefined}
              hostLine={staff ? (host ? S.hostedBy(host) : board.staff.all) : undefined}
              openLabel={isPast(e) ? D.EVENTS_UI.open : undefined} />
          );
        })}
      </div>
      {qr && <QrSheet name={qr.name} seed={qr.id} accent={partnerAccent(qr.host)} lead={qr.lead} partner={qr.partner} onClose={() => setQr(null)} />}
    </>
  );
}

function StudentEvents({ events, where }: { events: D.UwEvent[]; /** the board's community picker, in this row (never stacked above it) */ where?: ReactNode }) {
  const U = D.EVENTS_UI;
  const { when, setWhen } = useContext(FiltersCtx);
  const [filter, setFilter] = useState<D.EventFilter>("all");
  const placed = events.filter((e) => filter === "all" || (filter === "online" ? e.virtual : !e.virtual));
  const upcoming = placed.filter((e) => !isPast(e));
  // most recent first: the board you were just at leads
  const past = placed.filter(isPast).reverse();
  const list = when === "upcoming" ? upcoming : past;
  return (
    <>
      {/* one tab row (Upcoming, Past); where it happens is a dropdown, never
         a second row of the same tabs */}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="w-fit"><Segmented ariaLabel="When" value={when} onChange={setWhen} options={U.when.map((w) => ({ ...w, label: `${w.label} ${w.key === "upcoming" ? upcoming.length : past.length}` }))} /></div>
        <span className="flex flex-wrap items-center gap-[8px]">
        {where}
        <Listbox ariaLabel="Online or in person" value={filter} onChange={(v) => setFilter(v as D.EventFilter)} options={U.filters.map((f) => ({ value: f.key, label: f.label }))}
          className="flex min-h-[38px] cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
        </span>
      </div>
      {list.length === 0 && (when === "past" && filter === "all"
        ? <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{U.noPast}</p>
        : <EmptyView tier={5} query={filter} line="Try online or in person." cta="Show all" onAction={() => setFilter("all")} />)}
      <UwEventGrid events={list} />
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
          <QuietCta size="sm" onClick={() => onToast(D.PROGRAMS_UI.done)}>{D.PROGRAMS_UI.interested}</QuietCta>
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

/** Light filter chips with counts, so they never read as a second tab bar.
 *  One line that scrolls sideways on a phone (Michigan has eight places),
 *  its scrollbar hidden on every engine (flow-scroll). */
function CountChips<K extends string>({ options, value, onChange, ariaLabel }: { options: { key: K; label: string; n: number }[]; value: K; onChange: (k: K) => void; ariaLabel: string }) {
  return (
    <div role="group" aria-label={ariaLabel} className="flow-scroll -mx-[4px] flex gap-[6px] overflow-x-auto px-[4px] py-[2px]">
      {options.map((o) => {
        const on = o.key === value;
        return <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(o.key)} className="dm-quiet flex flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[13px] leading-[17px] font-semibold whitespace-nowrap" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 30%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{o.label}<span className="font-extrabold tabular-nums" style={{ color: on ? "var(--foreground)" : "var(--accent-subtle)" }}>{o.n}</span></button>;
      })}
    </div>
  );
}

// ——— Talk: every community on one board (12 Oct 2026) ———
// The client "needed a means of communication between the 4 regions on one
// board". Q&A already held the board's questions, so it grew into Talk
// rather than a sixth tab beside it: questions to volunteers, replies from
// students in other towns and volunteers' posts sit in one list, newest
// first, each with the poster's town as a quiet tag; chips filter by
// community; anyone can reply in the shared thread page.

/** Minutes ago, including weeks, for one newest-first list. */
const agoAll = (ago: string) => { const m = /(\d+)\s*([mhdw])/.exec(ago); return m ? Number(m[1]) * ({ m: 1, h: 60, d: 1440, w: 10080 } as const)[m[2] as "m" | "h" | "d" | "w"] : 0; };
type TalkItem = { id: string; place?: string; at: number } & ({ kind: "q"; t: Thread } | { kind: "post"; i: Insight });
type Show = typeof D.TALK_UI.show[number]["value"];

/** The list itself: questions and posts from every community, the
 *  community chips, and the answered/waiting dropdown. */
function TalkFeed({ threads, posts, openThread, openPost }: { threads: Thread[]; posts: Insight[]; openThread: (t: Thread) => void; openPost: (i: Insight) => void }) {
  const board = useBoard();
  const T = D.TALK_UI;
  const { place, setPlace, show, setShow } = useContext(FiltersCtx);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const items: TalkItem[] = [
    ...threads.map((t) => ({ kind: "q" as const, t, id: t.id, place: t.place, at: agoAll(t.postedAgo) })),
    ...posts.map((i) => ({ kind: "post" as const, i, id: i.id, place: i.place, at: agoAll(i.postedAgo) })),
  ].sort((a, b) => a.at - b.at);
  // a post isn't a question: it shows under Everything, never as waiting
  const shown = items.filter((it) => show === "all" || (it.kind === "q" && (show === "answered") === isAnswered(it.t)));
  const n = (k: string) => shown.filter((it) => it.place === k).length;
  // only the communities with something to show, so no chip leads nowhere
  const chips = [{ key: "all", label: T.all, n: shown.length }, ...board.chapters.filter((c) => n(c.short) > 0).map((c) => ({ key: c.short, label: c.short, n: n(c.short) }))];
  const list = shown.filter((it) => place === "all" || it.place === place);
  const flip = (set: typeof setSaved, id: string) => set((m) => ({ ...m, [id]: !m[id] }));
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <SectionHead>{T.list}</SectionHead>
        <Listbox ariaLabel="Show" value={show} onChange={(v) => setShow(v as Show)} options={T.show.map((o) => ({ value: o.value, label: o.label }))}
          className="flex min-h-[36px] cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
      </div>
      <CountChips ariaLabel="Community" options={chips} value={chips.some((c) => c.key === place) ? place : "all"} onChange={setPlace} />
      {list.length === 0 && <EmptyView tier={5} query={place} line="Try another community." cta="Show all" onAction={() => { setPlace("all"); setShow("all"); }} />}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {list.map((it) => (
          <li key={it.id}>
            {it.kind === "q"
              ? <QuestionCard thread={it.t} onOpen={() => openThread(it.t)} saved={!!saved[it.id]} onSave={() => flip(setSaved, it.id)} helpful={!!helpful[it.id]} onHelpful={() => flip(setHelpful, it.id)} />
              : <InsightCard insight={it.i} onOpen={() => openPost(it.i)} saved={!!saved[it.id]} onSave={() => flip(setSaved, it.id)} helpful={!!helpful[it.id]} onHelpful={() => flip(setHelpful, it.id)} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A past event whose board is still open: one row into it. */
function EventFollowRows() {
  const board = useBoard();
  const { open } = useContext(EventsCtx);
  const past = board.events.filter(isPast);
  if (past.length === 0) return null;
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <Eyebrow tone="var(--muted-foreground)">{D.TALK_UI.fromEvents}</Eyebrow>
      <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
        {past.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => open(e.id)} className="dm-tap flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-lg)] border p-[14px] text-left" style={ITEM}>
              <DateTile month={e.date.month} day={e.date.day} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="truncate text-[15px] leading-[20px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{e.title}</span>
                <span className="flex flex-wrap items-center gap-x-[10px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[7px] rounded-full" style={{ background: GOOD }} />{D.EVENTS_UI.open}</span>
                  <span>{e.followUp!.posts} posts</span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A town picker for a post: where the poster is from. */
function FromPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const board = useBoard();
  return (
    <span className="flex flex-wrap items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
      <MapPin className="h-3.5 w-3.5" aria-hidden />{D.TALK_UI.from}
      <Listbox ariaLabel={D.TALK_UI.from} value={value} onChange={onChange} options={board.chapters.map((c) => ({ value: c.short, label: c.short }))}
        className="flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
    </span>
  );
}

/** The how-it-works line: three steps, one line each. */
function TalkSteps() {
  return (
    <ol className="grid grid-cols-1 gap-[var(--space-3)] border-t pt-[var(--space-4)] sm:grid-cols-3" style={{ borderColor: RULE }}>
      {D.TALK_UI.how.map((h, i) => (
        <li key={h.title} className="flex items-start gap-[10px]">
          <span className="flex size-[24px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums" style={SOLID}>{i + 1}</span>
          <span className="flex flex-col gap-[2px]">
            <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{h.title}</span>
            <span className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{h.line}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function StudentTalk({ threads, onAsk, open, openPost, home }: { threads: Thread[]; onAsk: (text: string, topic?: string, place?: string) => void; open: (t: Thread) => void; openPost: (i: Insight) => void; home: string }) {
  const board = useBoard();
  const [asked, setAsked] = useState(false);
  const [from, setFrom] = useState(home);
  const posts = INSIGHTS.filter((i) => i.boardId === board.id);
  return (
    <>
      <Panel id="uw-talk-title" title={board.talk.title} aside={
        <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex -space-x-[8px]">{board.volunteerIds.slice(0, 4).map((id) => <span key={id} className="rounded-full" style={{ boxShadow: "0 0 0 2px var(--card)" }}><Avatar name={D.VOLUNTEERS[id].name} size={26} /></span>)}</span>
          {board.volunteerIds.length} {D.ASK.answerHere}
        </span>
      }>
        {/* the student-facing side; staff talk in Team (the board's first view) */}
        <Eyebrow>For students</Eyebrow>
        <p className="-mt-[8px] max-w-[64ch] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{board.talk.line}</p>
        {asked ? (
          <div className="flex flex-col gap-[8px]"><Done text={D.TALK_UI.posted} /><LinkButton onClick={() => setAsked(false)}>{D.TALK_UI.again}</LinkButton></div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            <FromPicker value={from} onChange={setFrom} />
            <InlineAsk joined defaultOpen accent={BLUE} placeholder={D.TALK_UI.placeholder} onPost={(text) => { onAsk(text, undefined, from); setAsked(true); }} />
          </div>
        )}
        <TalkSteps />
      </Panel>
      <EventFollowRows />
      <TalkFeed threads={threads} posts={posts} openThread={open} openPost={openPost} />
    </>
  );
}

/** Talk for a volunteer: post a tip or a follow-up to every community,
 *  open the boards of past events to answer there, then the same list. */
function VolunteerTalk({ threads, openThread, openPost, onToast }: { threads: Thread[]; openThread: (t: Thread) => void; openPost: (i: Insight) => void; onToast: (t: string) => void }) {
  const board = useBoard();
  const T = D.TALK_UI.volunteer;
  // the demo volunteer is the one from the board's own team (Deloitte)
  const me = board.volunteerIds.find((id) => D.VOLUNTEERS[id]?.org === board.team.you) ?? board.volunteerIds[0];
  const [from, setFrom] = useState(board.chapters[0].short);
  const [text, setText] = useState("");
  const [mine, setMine] = useState<Insight[]>([]);
  const leaks = CONTACT_INFO.test(text);
  const past = board.events.filter(isPast);
  const send = () => {
    setMine((l) => [{ id: `uw-vpost-${Date.now()}`, boardId: board.id, type: "insight", proId: me, place: from, title: text.trim(), body: "", postedAgo: "Just now", helpful: 0, replies: [] }, ...l]);
    setText("");
    onToast(T.posted);
  };
  return (
    <>
      <Panel id="uw-vtalk-title" title={board.talk.title}>
        <p className="-mt-[4px] max-w-[64ch] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{board.talk.line}</p>
        <FromPicker value={from} onChange={setFrom} />
        <div className="flex items-start gap-[12px]">
          <Avatar name={D.VOLUNTEERS[me].name} size={32} />
          <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={280} placeholder={T.placeholder} aria-label={T.placeholder} className="w-full resize-none rounded-[var(--radius-md)] border p-[12px] text-[15px] leading-[21px] outline-none focus-visible:ring-2" style={INPUT_STYLE} />
            {leaks && <span className="text-[12.5px] font-semibold" style={{ color: D.BRAND.yellow }}>{CONTACT_WARNING}</span>}
            <PrimaryCta size="sm" className="w-fit" style={SOLID} disabled={!text.trim() || leaks} onClick={send}>{T.post}</PrimaryCta>
          </div>
        </div>
      </Panel>
      {past.length > 0 && (
        <section className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>{D.EVENTS_UI.keepTalking}</SectionHead>
          <UwEventGrid events={past} />
        </section>
      )}
      <TalkFeed threads={threads} posts={[...mine, ...INSIGHTS.filter((i) => i.boardId === board.id)]} openThread={openThread} openPost={(i) => (i.id.startsWith("uw-vpost-") ? onToast(T.posted) : openPost(i))} />
    </>
  );
}

// ——— Team: United Way staff across offices (12 Oct 2026) ———
// The board's first view. Chandu: "the ask was mainly about the employees
// having a platform to communicate from these 4 different locations ...
// Focus on United Way chapters or the 4 groups connecting and
// collaborating, and the events." One channel for every office: posts
// carry the office pin, a kind label (Update, Ask the team, Idea, Shared
// resource) instead of another tab row, replies from any office, pinned
// plans on top, and an office filter.

const STAFF_KIND_ICON: Record<D.StaffPostKind, typeof Megaphone> = { update: Megaphone, ask: MessageCircleQuestion, idea: Lightbulb, resource: FileText };
type StaffReply = D.StaffPost["replies"][number];

/** A post's kind, as a small quiet label. */
function KindLabel({ kind, pinned }: { kind: D.StaffPostKind; pinned?: boolean }) {
  const Icon = STAFF_KIND_ICON[kind];
  return (
    <span className="flex flex-wrap items-center gap-[6px]">
      <span className="inline-flex items-center gap-[5px] rounded-full border px-[9px] py-[2px] text-[11.5px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Icon className="h-3 w-3" aria-hidden style={{ color: "var(--accent-subtle)" }} />{D.STAFF_KIND_LABEL[kind]}</span>
      {pinned && <span className="inline-flex items-center gap-[4px] text-[11.5px] leading-[16px] font-bold" style={{ color: "var(--muted-foreground)" }}><Pin className="h-3 w-3" aria-hidden />{D.STAFF_UI.pinned}</span>}
    </span>
  );
}

/** Name, role and office: the staff identity line. */
function StaffByline({ who, ago, size = 26 }: { who: D.StaffMember; ago: string; size?: number }) {
  return (
    <span className="flex min-w-0 items-center gap-[8px]">
      <Avatar name={who.name} size={size} />
      <span className="flex-none text-[12.5px] leading-[16px] font-bold" style={{ color: "var(--foreground)" }}>{who.name}</span>
      <span className="hidden min-w-0 truncate text-[12px] leading-[16px] font-semibold sm:inline" style={{ color: "var(--muted-foreground)" }}>· {who.role}</span>
      <PlaceTag place={who.office} />
      <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>· {ago}</span>
    </span>
  );
}

/** One staff post in the list: the same flat row as a question card. */
function StaffPostCard({ p, replies, onOpen }: { p: D.StaffPost; replies: StaffReply[]; onOpen: () => void }) {
  const offices = [...new Set(replies.map((r) => r.author.office).filter((o) => o !== p.author.office))];
  const done = p.tasks?.filter((t) => t.done).length ?? 0;
  return (
    <div className="group relative rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-lg)]"><span className="sr-only">Open: {p.title}</span></button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-2)" }} />
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[2px] h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />
      <div className="relative flex flex-col gap-[10px] pr-[22px]">
        <StaffByline who={p.author} ago={p.postedAgo} />
        <KindLabel kind={p.kind} pinned={p.pinned} />
        <span className="flex flex-col gap-[4px]">
          <span className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{p.title}</span>
          <span className="line-clamp-2 text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{p.body}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[4px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-[5px]"><MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {replies.length} {replies.length === 1 ? "reply" : "replies"}</span>
          {offices.length > 0 && <span>From {offices.join(", ")}</span>}
          {p.resource && <span className="flex items-center gap-[5px]"><FileText className="h-3.5 w-3.5" aria-hidden />{p.resource.meta}</span>}
          {p.tasks && <span className="flex items-center gap-[5px]"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} />{done} of {p.tasks.length} done</span>}
        </span>
      </div>
    </div>
  );
}

/** Who does what, one owner per office. */
function TaskList({ tasks }: { tasks: NonNullable<D.StaffPost["tasks"]> }) {
  return (
    <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
      {tasks.map((t) => (
        <li key={t.office + t.task} className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] py-[10px] first:pt-0" style={{ borderColor: RULE }}>
          {t.done ? <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> : <span aria-hidden className="size-[16px] flex-none rounded-full border-2" style={{ borderColor: "var(--glass-border)" }} />}
          <span className="min-w-0 flex-1 text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{t.task}</span>
          <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.owner}<PlaceTag place={t.office} /></span>
        </li>
      ))}
    </ul>
  );
}

/** One staff post, opened: everything, the replies from every office, and
 *  a reply box that posts as the staff member (never as a student). */
function StaffPostPage({ p, replies, onReply, onBack }: { p: D.StaffPost; replies: StaffReply[]; onReply: (text: string) => void; onBack: () => void }) {
  const board = useBoard();
  const S = D.STAFF_UI;
  const me = board.staff.me;
  const { open, toast } = useContext(EventsCtx);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> {S.back}</button>
      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        <div className="flex flex-col gap-[10px]">
          <KindLabel kind={p.kind} pinned={p.pinned} />
          <h1 className="text-[24px] leading-[30px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{p.title}</h1>
          <span className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px]"><StaffByline who={p.author} ago={p.postedAgo} size={30} /></span>
          <span className="text-[13px] font-semibold sm:hidden" style={{ color: "var(--muted-foreground)" }}>{p.author.role}</span>
          <p className="max-w-[70ch] text-[15.5px] leading-[23px]" style={{ color: "var(--foreground)" }}>{p.body}</p>
        </div>
        {p.resource && (
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
            <span className="flex items-center gap-[12px]">
              <span className="flex size-[44px] flex-none items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${BLUE} 26%, var(--glass-surface-1))` }}><FileText className="h-[22px] w-[22px]" aria-hidden style={{ color: "var(--accent-subtle)" }} /></span>
              <span className="flex flex-col"><span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{p.resource.label}</span><span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{p.resource.meta} · from {p.author.office}</span></span>
            </span>
            <QuietCta size="sm" onClick={() => toast(`${p.resource!.label} opened. Copy it for ${me.office}.`)}>{S.open}</QuietCta>
          </div>
        )}
        {p.numbers && p.numbers.length > 0 && (
          <div className="flex flex-wrap gap-x-[var(--space-8)] gap-y-[8px]">
            {p.numbers.map((n) => <span key={n.label} className="flex flex-col"><span className="text-[28px] leading-[32px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{n.value}</span><span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{n.label}</span></span>)}
          </div>
        )}
        {(p.worked || p.next) && (
          <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2">
            {p.worked && <div className="flex flex-col gap-[8px]"><Eyebrow tone="var(--muted-foreground)">{S.worked}</Eyebrow><Gets items={p.worked} /></div>}
            {p.next && <div className="flex flex-col gap-[8px]"><Eyebrow tone="var(--muted-foreground)">{S.next}</Eyebrow><TaskList tasks={p.next.map((n) => ({ office: n.office, owner: "", task: n.task, done: false }))} /></div>}
          </div>
        )}
        {p.tasks && <div className="flex flex-col gap-[8px]"><Eyebrow tone="var(--muted-foreground)">{S.tasks}</Eyebrow><TaskList tasks={p.tasks} /></div>}
        {p.eventId && <QuietCta className="w-fit" onClick={() => open(p.eventId!, "posts")}><Calendar className="h-4 w-4" aria-hidden /> {S.openEvent}</QuietCta>}
      </SectionSurface>
      <section className="flex flex-col gap-[var(--space-4)]">
        <SectionHead>{S.replies} · {replies.length}</SectionHead>
        <div className="flex flex-col gap-[var(--space-4)]">
          {replies.map((r, i) => {
            const id = `${p.id}-r${i}`;
            return <CommentRow key={id} id={id} name={r.author.name} chip="United Way" chipTone="pro" meta={`${r.author.role} · ${r.author.office}`} body={r.body} postedAgo={r.postedAgo} likes={0} liked={!!liked[id]} onLike={(k) => setLiked((m) => ({ ...m, [k]: !m[k] }))} />;
          })}
        </div>
        <ReplyComposer as={{ name: me.name, meta: `${me.role} · ${me.office}` }} onPost={onReply} />
      </section>
    </>
  );
}

/** The Team tab: compose, pinned plans, then every office's posts. */
function StaffTeam({ posts, repliesFor, open, onPost, onStudents }: { posts: D.StaffPost[]; repliesFor: (p: D.StaffPost) => StaffReply[]; open: (p: D.StaffPost) => void; onPost: (kind: D.StaffPostKind, text: string, office: string) => void; onStudents: () => void }) {
  const board = useBoard();
  const S = D.STAFF_UI;
  const { office, setOffice } = useContext(FiltersCtx);
  const [kind, setKind] = useState<D.StaffPostKind>("update");
  const [from, setFrom] = useState(board.staff.me.office);
  const [text, setText] = useState("");
  const leaks = CONTACT_INFO.test(text);
  const sorted = [...posts].sort((a, b) => agoAll(a.postedAgo) - agoAll(b.postedAgo));
  const pinned = sorted.filter((p) => p.pinned);
  const rest = sorted.filter((p) => !p.pinned);
  const n = (o: string) => rest.filter((p) => p.author.office === o).length;
  const chips = [{ key: "all", label: board.staff.all, n: rest.length }, ...board.chapters.filter((c) => n(c.short) > 0).map((c) => ({ key: c.short, label: c.short, n: n(c.short) }))];
  const list = rest.filter((p) => office === "all" || p.author.office === office);
  return (
    <>
      <Panel id="uw-team-title" title={board.staff.title} aside={<LinkButton onClick={onStudents}>Student side <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>}>
        <p className="-mt-[4px] max-w-[64ch] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{board.staff.line}</p>
        <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[10px]">
          <FromPicker value={from} onChange={setFrom} />
          <div role="group" aria-label="Kind of post" className="flex flex-wrap gap-[6px]">
            {S.kinds.map((k) => {
              const on = k === kind;
              const Icon = STAFF_KIND_ICON[k];
              return <button key={k} type="button" aria-pressed={on} onClick={() => setKind(k)} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[13px] leading-[17px] font-semibold" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 30%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}><Icon className="h-3.5 w-3.5" aria-hidden />{D.STAFF_KIND_LABEL[k]}</button>;
            })}
          </div>
        </div>
        <div className="flex items-start gap-[12px]">
          <Avatar name={board.staff.me.name} size={32} />
          <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={280} placeholder={S.placeholder} aria-label={S.placeholder} className="w-full resize-none rounded-[var(--radius-md)] border p-[12px] text-[15px] leading-[21px] outline-none focus-visible:ring-2" style={INPUT_STYLE} />
            {leaks && <span className="text-[12.5px] font-semibold" style={{ color: D.BRAND.yellow }}>{CONTACT_WARNING}</span>}
            <span className="flex flex-wrap items-center gap-[12px]">
              <PrimaryCta size="sm" style={SOLID} disabled={!text.trim() || leaks} onClick={() => { onPost(kind, text.trim(), from); setText(""); }}>Post</PrimaryCta>
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Posts as {board.staff.me.name} · {board.staff.me.role} · {from}</span>
            </span>
          </div>
        </div>
      </Panel>
      {pinned.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <Eyebrow tone="var(--muted-foreground)">{S.pinned}</Eyebrow>
          <ul className="flex flex-col gap-[var(--space-3)]">{pinned.map((p) => <li key={p.id}><StaffPostCard p={p} replies={repliesFor(p)} onOpen={() => open(p)} /></li>)}</ul>
        </section>
      )}
      <section className="flex flex-col gap-[var(--space-4)]">
        <SectionHead>{S.list}</SectionHead>
        <CountChips ariaLabel={board.staff.unit} options={chips} value={chips.some((c) => c.key === office) ? office : "all"} onChange={setOffice} />
        {list.length === 0 && <EmptyView tier={5} query={office} line="Try another office." cta="Show all" onAction={() => setOffice("all")} />}
        <ul className="flex flex-col gap-[var(--space-3)]">{list.map((p) => <li key={p.id}><StaffPostCard p={p} replies={repliesFor(p)} onOpen={() => open(p)} /></li>)}</ul>
      </section>
    </>
  );
}

/** The staff calendar: every office's events, who hosts, Co-host, and past
 *  events opening on their debrief. */
function StaffEvents({ events }: { events: D.UwEvent[] }) {
  const board = useBoard();
  const U = D.EVENTS_UI;
  const { when, setWhen, office, setOffice } = useContext(FiltersCtx);
  const hostedHere = (e: D.UwEvent) => office === "all" || e.chapter === null || board.chapters.find((c) => c.id === e.chapter)?.short === office;
  const mine = events.filter(hostedHere);
  const upcoming = mine.filter((e) => !isPast(e));
  const past = mine.filter(isPast).reverse();
  const list = when === "upcoming" ? upcoming : past;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="w-fit"><Segmented ariaLabel="When" value={when} onChange={setWhen} options={U.when.map((w) => ({ ...w, label: `${w.label} ${w.key === "upcoming" ? upcoming.length : past.length}` }))} /></div>
        <Listbox ariaLabel={board.staff.unit} value={office} onChange={setOffice} options={[{ value: "all", label: board.staff.all }, ...board.chapters.map((c) => ({ value: c.short, label: c.short }))]}
          className="flex min-h-[38px] cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
      </div>
      {list.length === 0 && <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{when === "past" ? U.noPast : "Nothing here yet. Try all offices."}</p>}
      <UwEventGrid events={list} staff />
    </>
  );
}

// ——— Home ———

function useStudentWorlds(): string[] {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return picks.ids.map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.world).filter((w): w is string => !!w);
}

/** 2-1-1, inside the app: what it helps with and a button that dials (or
 *  texts) from the phone. No website hand-off (Chandu, 8 Oct 2026:
 *  "don't take users out of the app"). */
function HelpCard() {
  const { help } = useBoard();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="dm-tap flex cursor-pointer flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
        <span className="flex items-center gap-[14px]">
          <span className="flex size-[40px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${D.BRAND.red} 22%, transparent)`, color: "#FF8A80" }}><Heart className="h-5 w-5" aria-hidden /></span>
          <span className="flex flex-col">
            <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{help.title}</span>
            <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{help.line}</span>
          </span>
        </span>
        <span className="flex items-center gap-[6px] text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}><Phone className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} />{help.call}</span>
      </button>
      {open && (
        <Sheet title={help.title} onClose={() => setOpen(false)} titleId="uw-help-title">
          <p className="-mt-[8px] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{D.HELP_UI.line}</p>
          <Gets items={D.HELP_UI.covers} />
          <div className="flex flex-wrap items-center gap-[10px] pt-[4px]">
            <a href="tel:211" className="dm-solid flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] px-[18px] text-[15px] font-bold" style={SOLID}><Phone className="h-4 w-4" aria-hidden /> {D.HELP_UI.call}</a>
            {help.text && <a href={`sms:${help.text}`} className="dm-quiet flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] border px-[18px] text-[15px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><MessagesSquare className="h-4 w-4" aria-hidden /> {D.HELP_UI.text}</a>}
          </div>
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{D.HELP_UI.private}</span>
        </Sheet>
      )}
    </>
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
          <span className="border-t pt-[12px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)", borderColor: RULE }}>{supplies.by}</span>
        </Sheet>
      )}
    </>
  );
}

function StudentHome({ shared = [], go, openProgram, joined, programs, events, served, threads, openThread }: { shared?: D.SharedOpportunity[]; go: (tab: D.StudentTab) => void; openProgram: (p: D.Program) => void; joined: Record<string, boolean>; programs: D.Program[]; events: D.UwEvent[]; served: number; threads: Thread[]; openThread: (t: Thread) => void }) {
  const board = useBoard();
  const worlds = useStudentWorlds();
  const fits = (w?: string) => !!w && worlds.includes(w);
  // No separate "For you" block (Chandu, 8 Oct 2026: "we need consistency
  // in what appears and we don't need HUGE tiles like this to fill the
  // gaps"): what fits the student's Top 3 moves to the front of its own
  // row, at that row's size, with one small line saying why.
  const first = <T extends { world?: string }>(list: T[]) => [...list].sort((a, b) => Number(fits(b.world)) - Number(fits(a.world)));
  const rail = first(programs).slice(0, 4);
  // two tickets, one row: a past event whose talk is still open, then the
  // next one coming up (what fits the Top 3 first)
  const reminders = useEventReminders();
  const soon = [...events.filter(isPast).slice(-1), ...first(events.filter((e) => !isPast(e)))].slice(0, 2);
  // what this student has going on here; hidden until there is something
  const mine = [
    { n: Object.values(joined).filter(Boolean).length, label: "programs", tab: "programs" as const },
    { n: events.filter((e) => reminders[e.id]).length, label: "event reminders", tab: "events" as const },
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

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>Programs</SectionHead>
          <LinkButton onClick={() => go("programs")}>See all {programs.length} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="dm-scroll -mx-[var(--space-5)] flex snap-x snap-mandatory gap-[var(--space-3)] overflow-x-auto px-[var(--space-5)] pb-[4px] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {rail.map((p) => <div key={p.id} className="w-[calc(72vw/var(--vz,1))] max-w-[300px] flex-none snap-start sm:w-auto sm:max-w-none"><ProgramCard p={p} joined={!!joined[p.id]} onOpen={() => openProgram(p)} reason={fits(p.world) ? D.PROGRAMS_UI.forYou : undefined} /></div>)}
        </div>
        {programs.length === 0 && <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{D.SCOPE.none}</p>}
      </section>

      {/* what professionals here post: half of the board's baseline (South
         Central Michigan, 10 Oct 2026: "students ask questions,
         professionals share opportunities") */}
      {shared.length > 0 && (
        <section className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>Shared by professionals</SectionHead>
          <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
            {shared.slice(0, 4).map((o) => <SharedRow key={o.id} o={o} />)}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>Events</SectionHead>
          <LinkButton onClick={() => go("events")}>All events <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <UwEventGrid events={soon} />
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{D.TALK_UI.list}</SectionHead>
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
// the v4 engagement charts colour themselves through these two variables
const V4_COLORS = { "--v4-chart-1": BLUE_TEXT, "--v4-chart-2": GOOD } as CSSProperties;
const PATH_COLORS = [BLUE_TEXT, GOOD, D.BRAND.yellow, "#C79BFF", "color-mix(in srgb, var(--foreground) 35%, transparent)"];

/** A number with its six-month shape under it (v4's engagement stat). */
function TrendTile({ icon: Icon, value, label, series }: { icon: typeof Users; value: string; label: string; series: number[] }) {
  const up = Math.round(((series[series.length - 1] - series[0]) / Math.max(1, series[0])) * 100);
  return (
    <div className="flex h-full flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ ...ITEM, boxShadow: "none" }}>
      <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}><Icon className="h-[14px] w-[14px]" aria-hidden style={{ color: BLUE_TEXT }} />{label}</span>
      <span className="flex items-baseline gap-[8px]"><span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span><span className="text-[12px] font-bold tabular-nums" style={{ color: GOOD }}>+{up}%</span></span>
      <span className="mt-auto flex items-end justify-between gap-[10px]"><span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>vs April</span><Sparkline values={series} /></span>
    </div>
  );
}

function PartnerImpact({ onToast, onPost }: { onToast: (t: string) => void; onPost: () => void }) {
  const board = useBoard();
  const I = board.impact;
  const U = D.PARTNER_UI;
  const [range, setRange] = useState<"month" | "year">("year");
  // each tile's six months, from the board's own monthly shape
  const shape = I.monthly.map((m) => m.unique / I.monthly[0].unique);
  const series = (key: string) => shape.map((f, i) => Math.round(100 * f * (1 + (key.length % 3) * 0.02 * i)));
  const points = I.monthly.map((m) => ({ ...m, avg: Math.round((m.total / m.unique) * 100) / 100 }));
  const declared = I.paths.filter((p) => p.label !== "Still deciding").reduce((n, p) => n + p.count, 0);
  const all = I.paths.reduce((n, p) => n + p.count, 0);
  // goals as this year against last year, each as a share of its goal
  const goals = I.grf.map((g) => (g.unit === "%" ? { label: g.label, sub: `Goal ${g.goal}%`, dot: g.value, diamond: g.last } : { label: g.label, sub: `${g.value.toLocaleString("en-US")} of ${g.goal.toLocaleString("en-US")}`, dot: Math.round((g.value / g.goal) * 100), diamond: Math.round((g.last / g.goal) * 100) }));
  return (
    <div className="flex flex-col gap-[var(--space-5)]" style={V4_COLORS}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented ariaLabel="Range" value={range} onChange={setRange} options={[...U.range]} />
        <QuietCta size="sm" onClick={() => onToast(U.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {U.export}</QuietCta>
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
      <div className="grid grid-cols-1 gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center" style={HERO_BOX}>
        <div className="flex flex-col gap-[4px]">
          <span className="text-[52px] leading-[54px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{I.outcome.value}</span>
          <span className="max-w-[24ch] text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{I.outcome.line}</span>
        </div>
        <Funnel steps={I.funnel} color={BLUE} />
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-4">
        {I.tiles.map((t, i) => <TrendTile key={t.key} icon={TILE_ICONS[i]} value={range === "month" ? t.month : t.year} label={t.label} series={series(t.key)} />)}
      </div>
      <Panel id="uw-trend-title" title={U.trend}><LoginsChart data={points} labels={["Visits", "Active students"]} /></Panel>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel id="uw-grf-title" title={U.grf}><DotDiamondPlot rows={goals} dotLabel="This year" diamondLabel="Last year" dotColor={GOOD} diamondColor={BLUE_TEXT} /></Panel>
        <Panel id="uw-paths-title" title={U.paths}><ShareRing items={I.paths} colors={PATH_COLORS} centre={`${Math.round((declared / all) * 100)}%`} centreLabel={U.pathsCentre} /></Panel>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel id="uw-careers-title" title={U.careers}><InterestDots items={I.careers.map((c) => ({ name: c.label, count: c.value }))} sample={I.monthly[I.monthly.length - 1].unique} color={BLUE_TEXT} /></Panel>
        <Panel id="uw-topics-title" title={U.topics}><RankedRows color={BLUE_TEXT} unit="asks" rows={I.topics.map((t) => ({ label: t.label, value: t.value }))} /></Panel>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3">
        <Panel id="uw-safety-title" title={U.safety}>
          <dl className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {I.safety.map((sf) => (
              <div key={sf.label} className="flex items-baseline justify-between gap-[12px] py-[10px] first:pt-0" style={{ borderColor: RULE }}>
                <dt className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sf.label}</dt>
                <dd className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: sf.value === "Off" ? GOOD : "var(--foreground)" }}>{sf.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      {I.voices && I.voices.length > 0 && (
        <Panel id="uw-voices-title" title="In their words" className={I.context || board.network ? "" : "lg:col-span-2"}>
          <ul className={`grid grid-cols-1 gap-[var(--space-4)] ${I.context || board.network ? "" : "sm:grid-cols-2"}`}>
            {I.voices.map((v) => (
              <li key={v.from} className="flex flex-col gap-[4px]">
                <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{v.text}&rdquo;</span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{v.from}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {(I.context || board.network) && (
        <div className="contents">
          {I.context && (
            <div className="flex flex-col justify-center gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
              <span className="text-[40px] leading-[44px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>{I.context.value}</span>
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{I.context.line}</span>
              <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{I.context.source}</span>
            </div>
          )}
          {board.network && (
            <Panel id="uw-network-title" title={board.network.title}>
              <ul className="flex flex-col gap-[var(--space-3)]">
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
      {board.partners && (
        <Panel id="uw-partners-title" title={board.partners.title}>
          <div className="flex flex-col gap-[var(--space-3)]">
            <p className="text-[14px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{board.partners.names.map((n, i) => <Fragment key={n}>{i > 0 && " · "}<span className="whitespace-nowrap">{n}</span></Fragment>)}</p>
            <a href={board.partners.url} target="_blank" rel="noopener noreferrer" className="dm-link flex w-fit items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: BLUE_TEXT }}>{board.partners.more} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></a>
          </div>
        </Panel>
      )}
      {board.community && (
        <Panel id="uw-community-title" title={board.community.title} className="lg:col-span-3">
          <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
            {board.community.items.map((c) => (
              <li key={c.name} className="flex">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="dm-tap flex w-full flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="flex items-start justify-between gap-[10px]">
                    <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
                    <ArrowUpRight className="mt-[2px] h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
                  </span>
                  <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{c.line}</span>
                  <span className="mt-auto flex items-center gap-[6px] pt-[2px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}><span aria-hidden className="size-[6px] rounded-full" style={{ background: D.BRAND.yellow }} />{c.status}</span>
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      </div>
    </div>
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
      <Panel id="uw-chapters-title" title={board.places?.panel ?? "Students and volunteer hours by United Way"}>
        <DualBars labels={["Students", "Volunteer hours"]} colors={[BLUE_TEXT, GOOD]} rows={[...board.chapters].sort((a, b) => b.students - a.students).map((k) => ({ label: k.short, a: k.students, b: k.hours, on: k.id === picked, onClick: () => setPicked(k.id) }))} />
      </Panel>
      <TalkByCommunity />
    </>
  );
}

/** United Way's read on Talk (12 Oct 2026): how much each community posts
 *  on the shared board, and how often a reply comes from another town,
 *  the client's ask in one number. Counted from the board's own posts,
 *  its events' boards included. */
function TalkByCommunity() {
  const board = useBoard();
  const eventIds = new Set(board.events.map((e) => e.id));
  const mine = (id: string) => id === board.id || eventIds.has(id);
  const qs = THREADS.filter((t) => mine(t.boardId));
  const posts = INSIGHTS.filter((i) => mine(i.boardId));
  const rows = board.chapters.map((c) => ({ label: c.short, value: qs.filter((t) => t.place === c.short).length + posts.filter((i) => i.place === c.short).length })).filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  const crossed = qs.reduce((n, t) => n + t.responses.filter((r) => r.kind === "peer" && r.place && r.place !== t.place).length, 0) + posts.reduce((n, i) => n + i.replies.filter((r) => r.place && r.place !== i.place).length, 0);
  if (rows.length === 0) return null;
  return (
    <Panel id="uw-talk-partner-title" title={D.TALK_UI.partner} aside={<span className="flex items-baseline gap-[6px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}><strong className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: GOOD }}>{crossed}</strong> replies from another town</span>}>
      <p className="-mt-[4px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{D.TALK_UI.partnerLine}</p>
      <RankedRows color={BLUE_TEXT} unit="posts" rows={rows} />
    </Panel>
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
          <span className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pending} still need a background check or training</span>
        </span>
      </div>
      <Panel id="uw-ops-title" title={U.ops}>
        <GoalArcs colors={[BLUE_TEXT, GOOD, D.BRAND.yellow]} items={board.ops.map((o) => ({ value: o.value, label: o.label, extra: `Goal ${o.goal}%${o.value >= o.goal ? ", met" : ""}` }))} />
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
  const [open, setOpen] = useState(view !== D.VIEWS[0].key);
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
type Memo = { view: D.UwView; studentTab: D.StudentTab; volunteerTab: D.VolunteerTab; partnerTab: D.PartnerTab; scope: D.Scope; chapter: string; asked: Thread[]; y: number; programId?: string; staffPostId?: string; when: D.EventWhen; place: string; show: Show; office: string };
const MEMO: Record<string, Memo | undefined> = {};

/** A link's `filter`: the board opens on the staff view (Team, or Events
 *  for "events"); "talk" (an event's "Keep talking") and the other student
 *  tab keys open the student side. */
const STUDENT_FILTERS = new Set(["talk", "ask", "home", "programs", "serve"]);
const viewFromFilter = (f?: string): D.UwView => (f && STUDENT_FILTERS.has(f) ? "student" : "partner");
const tabFromFilter = (f?: string): D.StudentTab => (f === "talk" ? "ask" : D.STUDENT_TABS.find((t) => t.key === f)?.key ?? "home");

export function UnitedWayBoardView({ board = D.NETWORK, onBack, backLabel = D.BACK, initialTab }: { board?: D.UwBoard; onBack: () => void; backLabel?: string; initialTab?: string }) {
  // a link that names a tab ("Keep talking" on an event's board opens
  // Talk) is a fresh visit, not a Back, so it starts there
  const [memo] = useState(() => { const m = MEMO[board.id]; MEMO[board.id] = undefined; return initialTab === "talk" || initialTab === "team" ? undefined : m; });
  const router = useRouter();
  const nav = useContext(ConnectNav);
  const onOpenMentorship = () => (nav?.openMentorship ? nav.openMentorship(D.MENTORSHIP_PROGRAM.id) : router.push(`/connect?tab=mentorship&program=${D.MENTORSHIP_PROGRAM.id}`));
  const [view, setView] = useState<D.UwView>(memo?.view ?? viewFromFilter(initialTab));
  const [studentTab, setStudentTab] = useState<D.StudentTab>(memo?.studentTab ?? tabFromFilter(initialTab));
  const [volunteerTab, setVolunteerTab] = useState<D.VolunteerTab>(memo?.volunteerTab ?? "today");
  const [partnerTab, setPartnerTab] = useState<D.PartnerTab>(memo?.partnerTab ?? (initialTab === "events" ? "events" : "team"));
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
  const [profile, setProfile, closeProfile] = useProfilePage<string>();
  // a program opens as its own page inside the board; Back comes back to
  // the same scroll spot
  const [program, setProgram] = useState<D.Program | undefined>(() => board.programs.find((x) => x.id === memo?.programId));
  const listY = useRef(0);
  const openProgram = (p: D.Program) => { listY.current = window.scrollY; setProgram(p); window.scrollTo(0, 0); };
  const closeProgram = () => {
    setProgram(undefined);
    const y = listY.current;
    let t = 0;
    const until = performance.now() + 1000;
    const tick = () => { window.scrollTo(0, y); if (Math.abs(window.scrollY - y) > 2 && performance.now() < until) t = window.setTimeout(tick, 16); };
    t = window.setTimeout(tick, 0);
    void t;
  };
  // the program page and a profile are each one step on Back (8 Oct 2026)
  useBackStep(!!program, closeProgram);
  useBackStep(!!profile, closeProfile);
  const [applyFor, setApplyFor] = useState<D.Program>();
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState(false);
  const [when, setWhen] = useState<D.EventWhen>(memo?.when ?? "upcoming");
  const [talkPlace, setTalkPlace] = useState(memo?.place ?? "all");
  const [talkShow, setTalkShow] = useState<Show>(memo?.show ?? "all");
  const [office, setOffice] = useState(memo?.office ?? "all");
  // staff posts made here, replies added here, and the post that's open
  const [staffMine, setStaffMine] = useState<D.StaffPost[]>([]);
  const [staffReplies, setStaffReplies] = useState<Record<string, D.StaffPost["replies"]>>({});
  const staffPosts = [...staffMine, ...board.staff.posts];
  const [staffPost, setStaffPost] = useState<D.StaffPost | undefined>(() => board.staff.posts.find((p) => p.id === memo?.staffPostId));
  const repliesFor = (p: D.StaffPost) => [...p.replies, ...(staffReplies[p.id] ?? [])];
  const [joinedLocal, setJoined] = useState<Record<string, boolean>>({});
  const uw = useUwMentorship();
  // e-Mentorship's interest is shared with the Mentorship tab
  const joined: Record<string, boolean> = { ...joinedLocal, ...Object.fromEntries(board.programs.filter((p) => p.mentorship).map((p) => [p.id, uw.stage !== "none"])) };
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
  const ask = (text: string, topic = "Volunteers here", place?: string) => {
    setAsked((l) => [{ id: `uw-asked-${Date.now()}`, boardId: board.id, type: "question", title: text, handle: "Jordan", grade: "Senior", place, postedAgo: "Just now", state: "routed", routedScope: topic, expectedWindow: "within 1 day", helpful: 0, followers: 0, responses: [] }, ...l]);
    nav?.noteAsked(text, board.id);
  };
  // leaving for a thread, a post or an event page: Back returns here
  const remember = () => {
    MEMO[board.id] = { view, studentTab, volunteerTab, partnerTab, scope, chapter, asked, y: window.scrollY, programId: program?.id, staffPostId: staffPost?.id, when, place: talkPlace, show: talkShow, office };
    // a reply on the page we hand off to posts as this view's role
    const vol = D.VOLUNTEERS[board.volunteerIds.find((id) => D.VOLUNTEERS[id]?.org === board.team.you) ?? board.volunteerIds[0]];
    setReplyAs(view === "partner" ? { name: board.staff.me.name, chip: "United Way", meta: `${board.staff.me.role} · ${board.staff.me.office}`, tone: "pro" } : view === "volunteer" && vol ? { name: vol.name, chip: "Volunteer", meta: vol.org, tone: "pro" } : null);
  };
  const openThread = (t: Thread) => {
    if (t.id.startsWith("uw-asked-")) { onToast("Volunteers have it. Answers show up in Your questions."); return; }
    remember();
    nav?.openThread(t.id);
  };
  const openPost = (i: Insight) => { remember(); nav?.openInsight(i.id); };
  // an event opens on Connect's own event page (12 Oct 2026)
  const openEvent = (id: string, filter?: string) => {
    remember();
    if (nav?.openEvent) nav.openEvent(id, filter);
    else router.push(`/connect?event=${id}${filter ? `&filter=${filter}` : ""}`);
  };
  const staffY = useRef(0);
  const openStaffPost = (p: D.StaffPost) => { staffY.current = window.scrollY; setStaffPost(p); window.scrollTo(0, 0); };
  const closeStaffPost = () => { setStaffPost(undefined); const y = staffY.current; window.setTimeout(() => window.scrollTo(0, y), 0); };
  useBackStep(!!staffPost, closeStaffPost);
  const postStaff = (kind: D.StaffPostKind, text: string, from: string) => {
    const me = { ...board.staff.me, office: from };
    setStaffMine((l) => [{ id: `uw-staff-${Date.now()}`, kind, author: me, title: text, body: "", postedAgo: "Just now", replies: [] }, ...l]);
    onToast(D.STAFF_UI.posted);
  };
  const local = scope === "local";
  const inScope = (c: string | null) => !local || c === null || c === chapter;
  const programs = board.programs.filter((p) => !local || p.chapter === chapter || p.chapter === null);
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
    if (kind === "event") {
      const e: D.UwEvent = { id, kind: "New", title, where, virtual: /online/i.test(where), about: title, who: "Any student", date, going: 0, chapter: null };
      registerUwEvent(e, board);
      setPostedEvents((l) => [...l, e]);
    }
    else setPostedShifts((l) => [...l, { id, kind: "New", title, where, date, hours: 2, spots: 20, who: "Ages 14 and up", chapter: null, length: "day" }]);
    setPosting(false);
    onToast(D.PARTNER_UI.posted);
  };

  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    return <ProProfileView key={pro.id} pro={pro} follows={follows} onFollow={() => flip(setFollows)(profile)} onBack={closeProfile} backLabel="Back to United Way" />;
  }

  const cover = view === "volunteer" ? board.photos.volunteers : board.photos.hero;
  const focus = view === "volunteer" ? board.photos.volunteersFocus : board.photos.heroFocus;
  // the staff view leads with the board's name and its offices; students
  // see the board's own line; volunteers their role
  const title = view === "volunteer" ? "Volunteer" : board.name;
  // (staff: the counts say it; Team's own panel carries the line)
  const heroLine = view === "student" ? board.line : undefined;
  const heroStats = view === "partner" ? [{ value: String(board.chapters.length), label: board.chapters.length === 1 ? board.staff.unit : `${board.staff.unit}s` }, { value: String(board.events.length), label: "events" }] : view === "student" ? board.stats : [];
  const scopeBox = (
    <Listbox ariaLabel="Where" value={local ? chapter : "all"} onChange={(v) => { if (v === "all") setScope("all"); else { setScope("local"); setChapter(v); } }}
      options={[{ value: "all", label: board.places?.all ?? D.SCOPE.everywhere }, ...board.chapters.map((k) => ({ value: k.id, label: k.short }))]}
      className="flex min-h-[38px] cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
  );
  return (
    <BoardCtx.Provider value={board}>
    <OpenPro.Provider value={setProfile}>
    <EventsCtx.Provider value={{ open: openEvent, toast: onToast }}>
    <FiltersCtx.Provider value={{ when, setWhen, place: talkPlace, setPlace: setTalkPlace, show: talkShow, setShow: setTalkShow, office, setOffice }}>
      {applyFor && <ApplySheet p={applyFor} onClose={() => setApplyFor(undefined)} onSend={() => { setApplied((m) => ({ ...m, [applyFor.id]: true })); setJoined((m) => ({ ...m, [applyFor.id]: true })); setApplyFor(undefined); onToast(D.PROGRAM_PAGE.applied); }} />}
      {posting && <PostSheet onPost={post} onClose={() => setPosting(false)} />}
      {toast}

      {staffPost ? (
        <StaffPostPage p={staffPost} replies={repliesFor(staffPost)} onBack={closeStaffPost}
          onReply={(text) => setStaffReplies((m) => ({ ...m, [staffPost.id]: [...(m[staffPost.id] ?? []), { author: board.staff.me, body: text, postedAgo: "Just now" }] }))} />
      ) : program ? (
        <ProgramPage p={program} applied={!!applied[program.id]} mentorshipJoined={!!program.mentorship && uw.stage !== "none"}
          onApply={() => { if (program.mentorship) { markUwInterest(); onToast(D.PROGRAMS_UI.done); } else setApplyFor(program); }}
          onMentorship={() => { setProgram(undefined); onOpenMentorship(); }} onBack={closeProgram}
          events={events} threads={threads} onAsk={ask} openThread={openThread} />
      ) : (<>
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
          {heroLine && <p className="text-[16px] leading-[22px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>{heroLine}</p>}
          {heroStats.length > 0 && (
            <div className="mt-[6px] flex flex-wrap gap-[8px]">
              {heroStats.map((s) => <span key={s.label} className="rounded-full px-[12px] py-[5px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", textShadow: "none" }}><strong className="font-extrabold">{s.value}</strong> {s.label}</span>)}
            </div>
          )}
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        {view === "student" && (
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <div className="w-full sm:w-fit"><Segmented ariaLabel="Section" value={studentTab} onChange={keep(setStudentTab)} options={[...D.STUDENT_TABS]} grow dense /></div>
            {/* where, as a dropdown: never a second tab row beside the tabs
               (Chandu: "we should never repeat these together") */}
            {/* on Events it sits in the Upcoming row instead, so the two
               dropdowns never stack */}
            {studentTab !== "ask" && studentTab !== "events" && scopeBox}
          </div>
        )}
        <div className={view === "student" ? "hidden" : "w-full sm:w-fit"}>
          {view === "volunteer" && <Segmented ariaLabel="Section" value={volunteerTab} onChange={keep(setVolunteerTab)} options={[...D.VOLUNTEER_TABS]} grow />}
          {view === "partner" && <Segmented ariaLabel="Section" value={partnerTab} onChange={keep(setPartnerTab)} options={D.PARTNER_TABS.map((t) => (t.key === "chapters" && board.places ? { ...t, label: board.places.tab } : t))} grow />}
        </div>
        <motion.div key={`${view}-${view === "student" ? studentTab : view === "volunteer" ? volunteerTab : partnerTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-[var(--space-6)]">
          {view === "student" && studentTab === "home" && <StudentHome shared={(board.shared ?? []).filter((o) => inScope(o.chapter))} go={keep(setStudentTab)} openProgram={openProgram} joined={joined} programs={programs} events={events} served={servedHours} threads={threads} openThread={openThread} />}
          {view === "student" && studentTab === "programs" && <StudentPrograms programs={programs} joined={joined} open={openProgram} />}
          {view === "student" && studentTab === "events" && <StudentEvents events={events} where={scopeBox} />}
          {view === "student" && studentTab === "serve" && <StudentServe shifts={serve} signed={served} toggle={flip(setServed)} onToast={onToast} />}
          {view === "student" && studentTab === "ask" && <StudentTalk threads={threads} onAsk={ask} open={openThread} openPost={openPost} home={board.chapters.find((k) => k.id === chapter)?.short ?? board.chapters[0].short} />}

          {view === "volunteer" && volunteerTab === "today" && <VolunteerToday go={keep(setVolunteerTab)} nextShift={nextShift} onToast={onToast} />}
          {view === "volunteer" && volunteerTab === "shifts" && <VolunteerShifts shifts={shifts} signed={shiftsSigned} toggle={flip(setShiftsSigned)} />}
          {view === "volunteer" && volunteerTab === "talk" && <VolunteerTalk threads={threads} openThread={openThread} openPost={openPost} onToast={onToast} />}
          {view === "volunteer" && volunteerTab === "impact" && <VolunteerImpact onToast={onToast} />}

          {view === "partner" && partnerTab === "team" && <StaffTeam posts={staffPosts} repliesFor={repliesFor} open={openStaffPost} onPost={postStaff} onStudents={() => { setView("student"); setStudentTab("ask"); }} />}
          {view === "partner" && partnerTab === "events" && <StaffEvents events={sortByDate([...board.events, ...postedEvents])} />}
          {view === "partner" && partnerTab === "impact" && <PartnerImpact onToast={onToast} onPost={() => setPosting(true)} />}
          {view === "partner" && partnerTab === "chapters" && <PartnerChapters />}
          {view === "partner" && partnerTab === "programs" && <PartnerPrograms onPost={() => setPosting(true)} />}
          {view === "partner" && partnerTab === "people" && <PartnerPeople onToast={onToast} />}
        </motion.div>
      </SectionSurface>
      </>)}
    </FiltersCtx.Provider>
    </EventsCtx.Provider>
    </OpenPro.Provider>
    </BoardCtx.Provider>
  );
}
