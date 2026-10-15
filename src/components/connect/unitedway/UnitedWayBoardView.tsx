"use client";

// United Way boards (7 Oct 2026, rebuilt 8 and 12 Oct, restructured 15 Oct
// 2026). One engine, three data sets: the national network (uwData.NETWORK),
// Michigan (uwMichigan.MICHIGAN) and South Central Michigan
// (uwSouthCentral.SOUTH_CENTRAL).
//
// 15 Oct 2026, Maisha's review: "There's a strong foundation here, but we
// need to simplify the experience and make it much clearer who is using the
// platform, who can see what, and what each section is for." So:
// - "Viewing as" (Student, Volunteer, United Way Team) sits in the board's
//   header. Each POV changes what is visible, what can be posted and the
//   board's own one-line description. It persists (uwStore.ts).
// - Three communities replace the one mixed feed: Students (questions with
//   a To: tag, and student posts), Volunteers (labelled posts) and Team (a
//   private Slack-like workspace, only in the United Way Team POV). Who
//   sees what lives in uwCommunity.ts.
// - Opportunities (programs, volunteers' Opportunity posts, ways to serve,
//   help at home) and Events (tickets, announcements, Event Updates) keep
//   their own jobs; Impact keeps the numbers. Home, Today, the old Talk and
//   Communities feeds are gone: they repeated these sections.
// - No private messaging between any adult and any student: replies are
//   public, profiles opened here have no message option, and direct
//   messages exist only between United Way staff in Team.
// United Way's own logo and photography, the brand blue on every action,
// copy cut to a title, one line and icon facts. Strings live in uwData.ts.

import Image from "next/image";
import { Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, createContext, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Backpack, Briefcase, CalendarPlus, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Crown, Download, GraduationCap, Handshake, Heart, MapPin, Megaphone, MessageSquareOff, MessagesSquare, Phone, Pin, Plus, ShieldCheck, Sparkles, Sun, Timer, Users } from "lucide-react";
import { downloadCalendarFile } from "@/lib/calendarFile";
import { toggleEventReminder, useEventReminders } from "@/lib/eventReminders";
import { IconTip } from "@/components/app/IconTip";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { markUwInterest, useUwMentorship } from "@/lib/uwMentorship";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { EmptyView } from "@/components/app/states";
import { TextTabs } from "@/components/app/TextTabs";
import { Listbox } from "@/components/app/Listbox";
import { Avatar, CONTACT_INFO, CONTACT_WARNING, ConnectNav, OrgAvatar, PrimaryCta, QuietCta, SectionHead, SectionSurface } from "../primitives";
import { MetricTile, Ring, Segmented, ruledCell } from "../viz";
import { BarChart } from "../mentorship/charts";
import { CommunityHoursChart, RankedRows } from "./uwCharts";
import { LoginsChart, Sparkline } from "@/components/app/engagementCharts";
import { Panel, ProProfileView, useProfilePage, RULE } from "../ProProfile";
import { EventTicket, QrSheet, partnerAccent } from "../ConnectExperience";
import type { EventBoard } from "../data";
import * as D from "./uwData";
import { registerUwEvent, toEventBoard, uwEventById } from "./uwEvents";
import { useBackStep } from "@/lib/backStep";
import { activateUw, takePendingAsk, useUwPov } from "./uwStore";
import type { UwItem, UwPerson, UwQuestion } from "./uwCommunity";
import { ItemList, ItemPage, LabelledPosts, PersonSheet, StudentComposer, StudentsSection, UwNavCtx, VolunteersSection, useBoardItems, type UwNav } from "./UwFeed";
import { TeamWorkspace } from "./UwTeam";
import { BLUE, BLUE_TEXT, ChoiceChips, Eyebrow, Field, GOOD, HERO_BOX, INPUT, INPUT_STYLE, ITEM, MUTED, PillSelect, PovSwitch, SOLID, Sheet, useToast } from "./uwUi";

export { Eyebrow, useToast };

/** The board on screen, for the pieces that need its data. */
const BoardCtx = createContext<D.UwBoard>(D.NETWORK);
const useBoard = () => useContext(BoardCtx);

// ——— small pieces ———

export function Done({ text }: { text: string }) {
  return <span className="flex items-center gap-[6px] text-[13.5px] leading-[18px] font-bold" style={{ color: GOOD }}><CheckCircle2 className="h-4 w-4 flex-none" aria-hidden /> {text}</span>;
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
  const label = status === "open" ? "Open" : status === "returning" ? "Back soon" : status === "closed" ? D.PROGRAM_PAGE.closed : "Soon";
  return <span className="inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: "rgba(6,8,18,0.62)", color: "#fff", backdropFilter: "blur(6px)" }}><span aria-hidden className="size-[6px] rounded-full" style={{ background: tone }} />{label}</span>;
}
const KIND_ICON: Record<D.ProgramKind, typeof Handshake> = { mentor: Handshake, work: Briefcase, college: GraduationCap, internship: Briefcase, summer: Sun, lead: Crown };
function Pill({ children, tone = BLUE_TEXT }: { children: ReactNode; tone?: string }) {
  return <span className="inline-flex w-fit flex-none items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold tabular-nums" style={{ background: `color-mix(in srgb, ${BLUE} 26%, transparent)`, color: tone }}>{children}</span>;
}
/** A section's own small heading, under the tab row. */
function SubHead({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
      <h3 className="text-[18px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{children}</h3>
      {aside}
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** A shift's calendar file (the shared helper, lib/calendarFile.ts). */
const addToCalendar = (title: string, date: D.Shift["date"], where: string, hours = 1) => downloadCalendarFile(title, date, where, hours);

// ——— Programs: the photo is the card ———

/** Where a program runs, the card's chip (13 Oct 2026, Chandu: "instead of
 *  the lead, internship etc chips say which community it belongs to"). */
function useWhereLabel() {
  const board = useBoard();
  return (chapter: string | null) => (chapter ? board.chapters.find((c) => c.id === chapter)?.short ?? "" : board.places?.all ?? D.SCOPE.everywhere);
}
function ProgramCard({ p, joined, onOpen, reason }: { p: D.Program; joined: boolean; onOpen: () => void; reason?: string }) {
  const where = useWhereLabel();
  return (
    <button type="button" onClick={onOpen} className="dm-tap group relative flex aspect-[4/3] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left" style={{ borderColor: "var(--glass-border)", textShadow: CARD_TEXT_SHADOW, boxShadow: "0 18px 40px -26px rgba(0,0,0,0.7)" }}>
      <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" style={{ objectPosition: p.focus }} />
      <CardProgressiveBlur size="52%" />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.55) 38%, transparent 65%)" }} />
      <span className="absolute top-[10px] left-[10px] z-10 inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: BLUE, color: "#fff", textShadow: "none" }}><MapPin className="h-3 w-3" aria-hidden />{where(p.chapter)}</span>
      <span className="relative z-10 flex flex-col gap-[4px] p-[var(--space-4)]">
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
        <li key={s} className="flex items-center gap-[10px] text-[14.5px] leading-[20px] font-semibold" style={{ color: i <= at ? "var(--foreground)" : MUTED }}>
          <span className="flex size-[24px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums" style={i < at ? { background: GOOD, color: "#06120c" } : i === at ? SOLID : { background: "var(--glass-surface-2)", color: MUTED }}>{i < at ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

/** Applying happens here, in three taps, never on the program's own site. */
function ApplySheet({ p, onSend, onClose }: { p: D.Program; onSend: () => void; onClose: () => void }) {
  const F = D.PROGRAM_PAGE.form;
  const [grade, setGrade] = useState<string>();
  const [want, setWant] = useState<string>();
  const [when, setWhen] = useState<string>();
  const opts = (list: readonly string[]) => list.map((o) => ({ key: o, label: o }));
  return (
    <Sheet title={`${F.title}: ${p.title}`} onClose={onClose} titleId="uw-apply-title">
      <Field label={F.grade.q}><ChoiceChips ariaLabel={F.grade.q} options={opts(F.grade.options)} value={grade} onChange={setGrade} /></Field>
      <Field label={F.want}><ChoiceChips ariaLabel={F.want} options={opts(p.gets)} value={want} onChange={setWant} /></Field>
      <Field label={F.when.q}><ChoiceChips ariaLabel={F.when.q} options={opts(F.when.options)} value={when} onChange={setWhen} /></Field>
      <PrimaryCta className="w-fit" style={SOLID} disabled={!grade || !want || !when} onClick={onSend}>{F.submit}</PrimaryCta>
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
            <span className="text-[13px] font-bold" style={{ color: i <= at ? "var(--foreground)" : MUTED }}>{t}</span>
          </li>
        ))}
      </ol>
      <span className="text-[13px] leading-[18px]" style={{ color: MUTED }}>{P.trackLine}</span>
    </div>
  );
}

/** A program's own page, inside the board: the facts, what you get, how it
 *  works, applying, its events and people, and questions about it. */
function ProgramPage({ p, applied, onApply, onMentorship, mentorshipJoined, onBack, events, questions, canAsk }: { p: D.Program; applied: boolean; onApply: () => void; onMentorship: () => void; mentorshipJoined: boolean; onBack: () => void; events: D.UwEvent[]; questions: UwItem[]; canAsk: boolean }) {
  const board = useBoard();
  const P = D.PROGRAM_PAGE;
  const U = D.PROGRAMS_UI;
  const [tab, setTab] = useState<D.ProgramTab>("about");
  const [asking, setAsking] = useState(false);
  const chapter = board.chapters.find((c) => c.id === p.chapter);
  const Icon = KIND_ICON[p.kind];
  const ahead = events.filter((e) => !isPast(e));
  const related = p.status === "closed" ? [] : (p.chapter ? [...ahead.filter((e) => e.chapter === p.chapter), ...ahead.filter((e) => e.chapter === null)] : ahead).slice(0, 2);
  const about = questions.filter((q): q is UwQuestion => q.kind === "question" && (q.programId === p.id || q.scope === p.title));
  const facts = [{ k: "Who", v: p.who }, ...(p.when ? [{ k: "When", v: p.when }] : []), { k: "Where", v: p.where }, ...(p.deadline ? [{ k: "Apply", v: p.deadline.replace(/^Apply /, "") }] : [])];
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: MUTED }}><ChevronLeft className="h-4 w-4" aria-hidden /> {P.back}</button>
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

      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        {p.mentorship
          ? (mentorshipJoined ? <PrimaryCta onClick={onMentorship} style={SOLID}>{U.continueMentorship} <ChevronRight className="h-4 w-4" aria-hidden /></PrimaryCta> : <PrimaryCta onClick={onApply} style={SOLID}>{U.interested}</PrimaryCta>)
          : p.status === "closed" ? null
          : applied ? <Done text={P.applied} /> : <PrimaryCta onClick={onApply} style={SOLID}>{P.apply}</PrimaryCta>}
        {p.mentorship && !mentorshipJoined && <QuietCta onClick={onMentorship}>{U.openMentorship}</QuietCta>}
        {canAsk && <QuietCta onClick={() => { setTab("ask"); setAsking(true); }}><MessagesSquare className="h-4 w-4" aria-hidden /> {P.ask}</QuietCta>}
      </div>
      {asking && <StudentComposer programId={p.id} onClose={() => setAsking(false)} />}
      {applied && !p.mentorship && <AppTracker at={1} />}
      {p.mentorship && mentorshipJoined && <Done text={U.nextStep} />}

      <section aria-label="Program facts" className={`grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border ${facts.length === 4 ? "sm:grid-cols-4" : facts.length === 3 ? "sm:grid-cols-3" : ""}`} style={{ ...ITEM, boxShadow: "none" }}>
        {facts.map((f, i) => (
          <div key={f.k} className={`flex flex-col gap-[4px] p-[var(--space-4)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} sm:[&:nth-child(n+2)]:border-l`} style={{ borderColor: RULE }}>
            <Eyebrow tone={MUTED}>{f.k}</Eyebrow>
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
              <div className="flex flex-col gap-[10px]"><Eyebrow tone={MUTED}>{P.gets}</Eyebrow><Gets items={p.gets} /></div>
              {p.mentorship && <NoMessages />}
            </div>
            <div className="flex flex-col gap-[var(--space-4)]">
              {p.proof && <Proof {...p.proof} />}
              <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <Eyebrow tone={MUTED}>{P.runBy}</Eyebrow>
                <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{p.by}</span>
                {chapter && <span className="flex items-center gap-[6px] text-[13px]" style={{ color: MUTED }}><MapPin className="h-3.5 w-3.5" aria-hidden />{chapter.place}</span>}
              </div>
              {p.status !== "closed" && (
                <div className="flex flex-col gap-[10px]">
                  <Eyebrow tone={MUTED}>{P.people}</Eyebrow>
                  <ProStack ids={board.volunteerIds.slice(0, 5)} />
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "how" && <Steps steps={p.steps ?? [U.interested, P.apply, "Start"]} at={applied || mentorshipJoined ? 1 : 0} />}
        {tab === "ask" && <ItemList items={about} empty={P.noQuestions} />}
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

/** A row of volunteer faces that open their profiles. */
function ProStack({ ids }: { ids: string[] }) {
  const nav = useContext(UwNavCtx);
  return (
    <div className="flex flex-wrap gap-[var(--space-3)]">
      {ids.map((id) => {
        const pro = D.VOLUNTEERS[id];
        if (!pro) return null;
        return (
          <button key={id} type="button" onClick={() => nav?.openPerson({ kind: "volunteer", proId: id })} className="dm-quiet flex w-[72px] cursor-pointer flex-col items-center gap-[4px] rounded-[var(--radius-md)] p-[4px] text-center">
            <Avatar name={pro.name} size={44} />
            <span className="w-full truncate text-[12px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Light filter chips with counts, so they never read as a second tab bar. */
function CountChips<K extends string>({ options, value, onChange, ariaLabel }: { options: { key: K; label: string; n?: number }[]; value: K; onChange: (k: K) => void; ariaLabel: string }) {
  return (
    <div role="group" aria-label={ariaLabel} className="flow-scroll -mx-[4px] flex gap-[6px] overflow-x-auto px-[4px] py-[2px]">
      {options.map((o) => {
        const on = o.key === value;
        return <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(o.key)} className="dm-quiet flex flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[13px] leading-[17px] font-semibold whitespace-nowrap" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 22%, transparent)` : "transparent", color: on ? "var(--foreground)" : MUTED }}>{o.label}{o.n !== undefined && <span className="font-extrabold tabular-nums" style={{ color: on ? "var(--foreground)" : "var(--accent-subtle)" }}>{o.n}</span>}</button>;
      })}
    </div>
  );
}

/** Programs as photo cards, filtered by community (13 Oct 2026). Staff also
 *  get the Post tool and each program's reach under its card. */
function ProgramsGrid({ programs, joined, open, onPost, stats }: { programs: D.Program[]; joined: Record<string, boolean>; open: (p: D.Program) => void; onPost?: () => void; stats?: D.UwBoard["partnerPrograms"] }) {
  const board = useBoard();
  const where = useWhereLabel();
  const worlds = useStudentWorlds();
  const { programPlace: place, setProgramPlace: setPlace } = useContext(FiltersCtx);
  const fits = (p: D.Program, k: string) => k === "all" || p.chapter === k || p.chapter === null;
  const n = (k: string) => programs.filter((p) => fits(p, k)).length;
  const chips = [{ key: "all", label: where(null), n: programs.length }, ...board.chapters.map((c) => ({ key: c.id, label: c.short, n: n(c.id) }))].filter((c) => c.key === "all" || c.n > 0);
  const at = chips.some((c) => c.key === place) ? place : "all";
  // what fits the student's Top 3 first, then the community's own
  const fitsTop3 = (p: D.Program) => !stats && !!p.world && worlds.includes(p.world);
  const list = programs.filter((p) => fits(p, at)).sort((a, b) => Number(fitsTop3(b)) - Number(fitsTop3(a)) || (a.chapter === null ? 1 : 0) - (b.chapter === null ? 1 : 0));
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="min-w-0 flex-1"><CountChips ariaLabel="Community" options={chips} value={at} onChange={setPlace} /></div>
        {onPost && <PrimaryCta size="sm" style={SOLID} onClick={onPost}><Plus className="h-4 w-4" aria-hidden /> {D.POST_UI.title}</PrimaryCta>}
      </div>
      {list.length === 0 && <EmptyView tier={5} query={at} line="Try another community." cta="Show all" onAction={() => setPlace("all")} />}
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const st = stats?.find((r) => r.program === p.title);
          return (
            <div key={p.id} className="flex flex-col gap-[8px]">
              <ProgramCard p={p} joined={!!joined[p.id]} onOpen={() => open(p)} reason={fitsTop3(p) ? D.PROGRAMS_UI.forYou : undefined} />
              {st && <span className="flex flex-wrap gap-x-[12px] px-[4px] text-[12.5px] font-semibold tabular-nums" style={{ color: MUTED }}><span><strong style={{ color: "var(--foreground)" }}>{st.students}</strong> students</span><span><strong style={{ color: "var(--foreground)" }}>{st.volunteers}</strong> volunteers</span><span><strong style={{ color: "var(--foreground)" }}>{st.hours}</strong> hours</span></span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ——— Events: Connect's own tickets (12 Oct 2026) ———

const EventsCtx = createContext<{ open: (id: string, filter?: string) => void; toast: (t: string) => void }>({ open: () => {}, toast: () => {} });
/** The filters, held by the board view so Back from an event page or an
 *  item lands on the same filter (the Back memo). */
type Filters = { when: D.EventWhen; setWhen: (w: D.EventWhen) => void; office: string; setOffice: (o: string) => void; programPlace: string; setProgramPlace: (p: string) => void };
const FiltersCtx = createContext<Filters>({ when: "upcoming", setWhen: () => {}, office: "all", setOffice: () => {}, programPlace: "all", setProgramPlace: () => {} });
const isPast = (e: D.UwEvent) => !!e.followUp;

/** United Way events as the Events tab's own tickets. */
function UwEventGrid({ events, staff = false }: { events: D.UwEvent[]; staff?: boolean }) {
  const board = useBoard();
  const { open, toast } = useContext(EventsCtx);
  const reminders = useEventReminders();
  const [qr, setQr] = useState<EventBoard | null>(null);
  const S = D.STAFF_UI;
  const nav = useContext(ConnectNav);
  return (
    <>
      <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2">
        {events.map((e) => {
          const ev = toEventBoard(e, board);
          const key = staff ? `cohost:${e.id}` : e.id;
          const host = board.chapters.find((c) => c.id === e.chapter)?.short;
          return (
            <EventTicket key={e.id} gated event={ev} joined={!!nav?.isEventJoined?.(e.id)} onOpenEvent={(id) => open(id)} onEnterCode={open} onQr={setQr}
              reminded={!!reminders[key]} onRemind={isPast(e) ? undefined : () => { if (toggleEventReminder(key)) toast(staff ? S.cohostToast : D.EVENTS_UI.remindToast); }}
              remindLabels={staff ? [S.cohost, S.cohosting] : undefined}
              hostLine={staff ? `${host ? S.hostedBy(host) : board.staff.all}${e.followUp ? ` · Attendee code ${e.followUp.code}` : ""}` : undefined}
              openLabel={isPast(e) ? D.EVENTS_UI.open : undefined} />
          );
        })}
      </div>
      {qr && <QrSheet name={qr.name} seed={qr.id} accent={partnerAccent(qr.host)} lead={qr.lead} partner={qr.partner} onClose={() => setQr(null)} />}
    </>
  );
}

/** Upcoming or Past, one tab row; where it happens is a dropdown. Staff
 *  also see who hosts and can co-host. */
/** How many tabs fit a phone row whole, with a More dropdown after them for
 *  the rest. A tab's name is never clipped (Chandu, 15 Oct 2026: "this
 *  shouldn't happen to the tabs, don't clip a tab's name, then add a More
 *  dropdown"): the labels are measured in the row's own font, so it holds at
 *  320px as much as at 430px. */
function useFitTabs(labels: string[]): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(2);
  const key = labels.join("|");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      const width = el.getBoundingClientRect().width;
      if (!width) return;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      const cs = getComputedStyle(el);
      ctx.font = `700 14px ${cs.fontFamily}`;
      const PAD = 30; // a tab's side padding and the control's gaps
      const MORE = 112; // the More button and the gap before it
      const widths = labels.map((l) => ctx.measureText(l).width + PAD);
      const all = widths.reduce((a, b) => a + b, 0) + 8;
      if (all <= width) { setFit(labels.length); return; }
      let used = MORE;
      let n = 0;
      for (const w of widths) { if (used + w > width) break; used += w; n++; }
      setFit(Math.max(1, n));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- labels are keyed by their joined text
  }, [key]);
  return [ref, fit];
}

function EventsList({ events, staff = false }: { events: D.UwEvent[]; staff?: boolean }) {
  const board = useBoard();
  const { office, setOffice } = useContext(FiltersCtx);
  const here = (e: D.UwEvent) => office === "all" || e.chapter === null || e.chapter === office;
  const placed = events.filter(here);
  // One list, one card. 15 Oct 2026 (Chandu: "the only filters should be by
  // communities, Kalamazoo, Battle Creek etc. The event cards should be the
  // same"): the Upcoming/Past tabs are gone, upcoming events lead by date and
  // past ones follow on the same card ("Conversation open" still marks
  // them), and the community is the only filter.
  const list = [...placed.filter((e) => !isPast(e)), ...placed.filter(isPast).reverse()];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <PillSelect ariaLabel={staff ? board.staff.unit : "Where"} value={office} onChange={setOffice} options={[{ value: "all", label: board.places?.all ?? (staff ? board.staff.all : D.SCOPE.everywhere) }, ...board.chapters.map((c) => ({ value: c.id, label: c.short }))]} />
      </div>
      {list.length === 0 && <p className="text-[14px] font-semibold" style={{ color: MUTED }}>Nothing here yet. Try another place.</p>}
      <UwEventGrid events={list} staff={staff} />
    </>
  );
}

// ——— announcements: United Way's public posts, with posters ———

/** An announcement poster made from the post's own details (14 Oct 2026). */
export function UwPoster({ title, when, where, photo }: { title: string; when?: string; where?: string; photo?: string }) {
  const m = when ? /^([A-Za-z]{3,9})\s+(\d{1,2})\b\s*(?:·\s*)?(.*)$/.exec(when.trim()) : null;
  const rest = [m ? m[3] : when, where].filter(Boolean).join(" · ");
  return (
    <span className="flex aspect-[4/5] w-full flex-col overflow-hidden rounded-[14px]" style={{ background: "#FBF8F2", boxShadow: "0 14px 34px -18px rgba(0,0,0,0.6)" }}>
      <span className="relative block min-h-0 flex-1">
        <Image src={photo ?? D.PHOTOS.volunteers} alt="" fill sizes="340px" className="object-cover" style={{ objectPosition: "50% 35%" }} />
        <span className="absolute top-[12px] left-[12px] rounded-[10px] px-[9px] py-[6px]" style={{ background: "#FBF8F2", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.45)" }}>
          <Image src={D.BRAND.logo} alt="United Way" width={88} height={41} unoptimized className="block h-[22px] w-auto" />
        </span>
      </span>
      <span className="flex items-center gap-[14px] px-[16px] py-[14px]" style={{ borderTop: `4px solid ${D.BRAND.yellow}` }}>
        {m && (
          <span className="flex size-[58px] flex-none flex-col items-center justify-center rounded-[10px]" style={{ background: "#141824", color: "#fff" }}>
            <span className="text-[11px] leading-[13px] font-extrabold tracking-[0.12em] uppercase" style={{ color: D.BRAND.yellow }}>{m[1].slice(0, 3)}</span>
            <span className="text-[24px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{m[2]}</span>
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-[4px]">
          <span className="text-[20px] leading-[23px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "#141824" }}>{title}</span>
          {rest && <span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "#3A4150" }}>{rest}</span>}
        </span>
      </span>
    </span>
  );
}

function PosterView({ poster }: { poster: NonNullable<D.StaffPost["poster"]> }) {
  return poster.kind === "made"
    ? <UwPoster title={poster.title} when={poster.when} where={poster.where} photo={poster.photo} />
    // eslint-disable-next-line @next/next/no-img-element -- a staff upload, a data URL in the demo
    : <img src={poster.src} alt="" className="block w-full rounded-[14px] object-cover" style={{ aspectRatio: "4 / 5", boxShadow: "0 14px 34px -18px rgba(0,0,0,0.6)" }} />;
}

/** An announcement's small picture in a card: the poster's photo with its
 *  date, never the whole poster squeezed (its type can't shrink that far). */
function PosterThumb({ post }: { post: D.StaffPost }) {
  const poster = post.poster;
  const m = poster?.kind === "made" && poster.when ? /^([A-Za-z]{3})[a-z]*\s+(\d{1,2})/.exec(poster.when) : null;
  return (
    <span className="relative block w-[76px] flex-none self-stretch overflow-hidden rounded-[10px]" style={poster ? { background: "#0a0f2a", minHeight: 92 } : { ...SOLID, minHeight: 92 }}>
      {poster?.kind === "made" && <Image src={poster.photo ?? D.PHOTOS.volunteers} alt="" fill sizes="76px" className="object-cover" />}
      {/* eslint-disable-next-line @next/next/no-img-element -- a staff upload, a data URL in the demo */}
      {poster?.kind === "upload" && <img src={poster.src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {!poster && <span className="absolute inset-0 flex items-center justify-center"><Image src={D.BRAND.logoWhite} alt="" width={44} height={21} unoptimized className="h-[22px] w-auto" /></span>}
      {m && (
        <span className="absolute bottom-[6px] left-1/2 flex -translate-x-1/2 flex-col items-center rounded-[8px] px-[8px] py-[3px]" style={{ background: "#141824", color: "#fff", borderTop: `3px solid ${D.BRAND.yellow}` }}>
          <span className="text-[9.5px] leading-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: D.BRAND.yellow }}>{m[1]}</span>
          <span className="text-[16px] leading-[18px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{m[2]}</span>
        </span>
      )}
    </span>
  );
}

/** United Way's announcement composer: title, details, when, where and an
 *  optional poster (made or uploaded). */
function AnnounceSheet({ section, onPost, onClose }: { section: "events" | "opportunities"; onPost: (p: { title: string; body: string; poster?: D.StaffPost["poster"] }) => void; onClose: () => void }) {
  const A = D.ANNOUNCE_UI;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [choice, setChoice] = useState<D.PosterChoice>(section === "events" ? "made" : "none");
  const [upload, setUpload] = useState<string>();
  const leaks = CONTACT_INFO.test(title + body);
  const poster: D.StaffPost["poster"] = choice === "made" && title.trim() ? { kind: "made", title: title.trim(), when: when.trim() || undefined, where: where.trim() || undefined } : choice === "upload" && upload ? { kind: "upload", src: upload } : undefined;
  return (
    <Sheet title={A.title} onClose={onClose} titleId="uw-announce-title">
      <Field label={A.fields.title}><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={A.placeholders.title} className={INPUT} style={INPUT_STYLE} /></Field>
      <Field label={A.fields.body}><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={400} placeholder={A.placeholders.body} className="w-full resize-none rounded-[var(--radius-md)] border p-[12px] text-[15px] leading-[21px] outline-none focus-visible:ring-2" style={INPUT_STYLE} /></Field>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <Field label={A.fields.when}><input value={when} onChange={(e) => setWhen(e.target.value)} placeholder={A.placeholders.when} className={INPUT} style={INPUT_STYLE} /></Field>
        <Field label={A.fields.where}><input value={where} onChange={(e) => setWhere(e.target.value)} placeholder={A.placeholders.where} className={INPUT} style={INPUT_STYLE} /></Field>
      </div>
      <Field label={A.poster}><ChoiceChips ariaLabel={A.poster} options={A.posterOptions.map((o) => ({ key: o.key, label: o.label }))} value={choice} onChange={setChoice} /></Field>
      {choice === "upload" && (
        <label className="dm-quiet flex cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border border-dashed p-[14px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)", color: MUTED }}>
          <Plus className="h-4 w-4" aria-hidden /> {upload ? "Change image" : `Choose an image · ${A.uploadHint}`}
          <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setUpload(String(r.result)); r.readAsDataURL(f); }} />
        </label>
      )}
      {poster && <span className="block w-[220px]"><PosterView poster={poster} /></span>}
      {leaks && <span className="text-[12.5px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</span>}
      <PrimaryCta className="w-fit" style={SOLID} disabled={!title.trim() || leaks} onClick={() => { onPost({ title: title.trim(), body: body.trim(), poster }); onClose(); }}>{A.post}</PrimaryCta>
    </Sheet>
  );
}

/** Announcements as a row of cards: the poster (or United Way's mark), the
 *  title and when. Each opens its page. */
function Announcements({ posts, open, onNew }: { posts: D.StaffPost[]; open: (p: D.StaffPost) => void; onNew?: () => void }) {
  if (!posts.length && !onNew) return null;
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <SubHead aside={onNew && <PrimaryCta size="sm" style={SOLID} onClick={onNew}><Megaphone className="h-4 w-4" aria-hidden /> New Announcement</PrimaryCta>}>From United Way</SubHead>
      {posts.length === 0 ? <p className="text-[14px]" style={{ color: MUTED }}>No announcements yet.</p> : (
        <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id} className="flex">
              <button type="button" onClick={() => open(p)} className="dm-tap flex w-full cursor-pointer items-stretch gap-[14px] rounded-[var(--radius-lg)] border p-[12px] text-left" style={{ ...ITEM, boxShadow: "none" }}>
                <PosterThumb post={p} />
                <span className="flex min-w-0 flex-1 flex-col gap-[4px] py-[2px]">
                  {p.pinned && <span className="flex items-center gap-[4px] text-[11.5px] font-bold" style={{ color: MUTED }}><Pin className="h-3 w-3" aria-hidden /> Pinned</span>}
                  <span className="text-[15.5px] leading-[20px] font-bold text-balance" style={{ color: "var(--foreground)" }}>{p.title}</span>
                  <span className="line-clamp-2 text-[13px] leading-[18px]" style={{ color: MUTED }}>{p.body}</span>
                  <span className="mt-auto pt-[4px] text-[12px] font-semibold" style={{ color: MUTED }}>{p.author.name}, {p.author.office} · {p.postedAgo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** An announcement, opened: everything, and its poster. */
function AnnouncementPage({ p, onBack }: { p: D.StaffPost; onBack: () => void }) {
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: MUTED }}><ChevronLeft className="h-4 w-4" aria-hidden /> Back</button>
      <SectionSurface className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-[var(--space-3)]">
          <span className="flex items-center gap-[10px]">
            <Avatar name={p.author.name} photo={D.staffPhoto(p.author)} size={40} />
            <span className="flex flex-col"><span className="flex items-center gap-[6px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{p.author.name} <span className="rounded-full px-[7px] py-[1px] text-[11px] font-bold" style={SOLID}>United Way</span></span><span className="text-[13px]" style={{ color: MUTED }}>{p.author.role} · {p.author.office} · {p.postedAgo}</span></span>
          </span>
          <h1 className="text-[26px] leading-[32px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{p.title}</h1>
          <p className="max-w-[60ch] text-[16px] leading-[24px]" style={{ color: "var(--foreground)" }}>{p.body}</p>
        </div>
        {p.poster && <span className="block w-full max-w-[300px]"><PosterView poster={p.poster} /></span>}
      </SectionSurface>
    </>
  );
}

// ——— Opportunities: programs, volunteers' opportunities, ways to serve ———

function ShiftRow({ s, signed, onSign, onCal, verified, onCheckIn }: { s: D.Shift; signed: boolean; onSign: () => void; onCal?: () => void; verified?: boolean; onCheckIn?: () => void }) {
  const U = D.SERVE_UI;
  return (
    <li className="flex h-full items-center gap-[14px] rounded-[var(--radius-lg)] border p-[14px]" style={ITEM}>
      <DateTile month={s.date.month} day={s.date.day} />
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <Eyebrow>{s.kind}</Eyebrow>
        <span className="text-[15.5px] leading-[20px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.title}</span>
        <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[12.5px] leading-[17px] font-semibold" style={{ color: MUTED }}>
          <span className="flex items-center gap-[4px]"><MapPin className="h-3 w-3" aria-hidden />{s.where}</span>
          <span className="flex items-center gap-[4px]"><Clock className="h-3 w-3" aria-hidden />{s.hours} {s.hours === 1 ? "hr" : U.hours}</span>
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

/** Service hours for students, as one card that opens the ways to serve:
 *  the hours ledger kept, without its own tab. */
function ServiceHoursCard({ shifts, signed, toggle, onToast }: { shifts: D.Shift[]; signed: Record<string, boolean>; toggle: (id: string) => void; onToast: (t: string) => void }) {
  const board = useBoard();
  const U = D.SERVE_UI;
  const G = board.serveGoal;
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const logged = G.logged + shifts.filter((s) => verified[s.id]).reduce((n, s) => n + s.hours, 0);
  const planned = shifts.filter((s) => signed[s.id] && !verified[s.id]).reduce((n, s) => n + s.hours, 0);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="dm-tap flex h-full w-full cursor-pointer items-center gap-[14px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
        <Ring pct={Math.min(100, Math.round((logged / G.target) * 100))} size={48} stroke={5} accent={BLUE_TEXT}><span className="text-[13px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{logged}</span></Ring>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{U.title}</span>
          <span className="text-[13.5px] leading-[18px]" style={{ color: MUTED }}>{logged} of {G.target} hours{planned > 0 ? ` · +${planned} signed up` : ""}</span>
        </span>
        <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
      </button>
      {open && (
        <Sheet title="Ways to serve" onClose={() => setOpen(false)} titleId="uw-serve-title">
          <span className="-mt-[8px] text-[14px] leading-[20px]" style={{ color: MUTED }}>{G.line} {planned > 0 ? U.checkLine : ""}</span>
          <QuietCta size="sm" className="w-fit" onClick={() => onToast(U.lettered)}><Download className="h-3.5 w-3.5" aria-hidden /> {U.letter}</QuietCta>
          <ul className="flex flex-col gap-[var(--space-3)]">
            {shifts.map((s) => <ShiftRow key={s.id} s={s} signed={!!signed[s.id]} onSign={() => toggle(s.id)} onCal={() => addToCalendar(s.title, s.date, s.where, s.hours)} verified={!!verified[s.id]} onCheckIn={() => { setVerified((m) => ({ ...m, [s.id]: true })); onToast(`${s.hours} ${U.hours} added to your record`); }} />)}
          </ul>
        </Sheet>
      )}
    </>
  );
}

function useStudentWorlds(): string[] {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return picks.ids.map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.world).filter((w): w is string => !!w);
}

/** 2-1-1, inside the app: what it helps with and a button that dials (or
 *  texts) from the phone (Chandu, 8 Oct 2026: "don't take users out of the
 *  app"). */
function HelpCard() {
  const { help } = useBoard();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="dm-tap flex h-full w-full cursor-pointer items-center gap-[14px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
        <span className="flex size-[48px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${D.BRAND.red} 18%, transparent)`, color: "#E5483E" }}><Heart className="h-5 w-5" aria-hidden /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{help.title}</span>
          <span className="text-[13.5px] leading-[18px]" style={{ color: MUTED }}>{help.line}</span>
        </span>
        <Phone className="h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
      </button>
      {open && (
        <Sheet title={help.title} onClose={() => setOpen(false)} titleId="uw-help-title">
          <p className="-mt-[8px] text-[15px] leading-[21px]" style={{ color: MUTED }}>{D.HELP_UI.line}</p>
          <Gets items={D.HELP_UI.covers} />
          <div className="flex flex-wrap items-center gap-[10px] pt-[4px]">
            <a href="tel:211" className="dm-solid flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] px-[18px] text-[15px] font-bold" style={SOLID}><Phone className="h-4 w-4" aria-hidden /> {D.HELP_UI.call}</a>
            {help.text && <a href={`sms:${help.text}`} className="dm-quiet flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] border px-[18px] text-[15px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><MessagesSquare className="h-4 w-4" aria-hidden /> {D.HELP_UI.text}</a>}
          </div>
          <span className="text-[12.5px]" style={{ color: MUTED }}>{D.HELP_UI.private}</span>
        </Sheet>
      )}
    </>
  );
}

/** School supplies asked for privately: a pickup code instead of a line
 *  at the office. */
function SuppliesCard() {
  const { supplies } = useBoard();
  const U = D.SUPPLY_UI;
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [code, setCode] = useState<string>();
  if (!supplies) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="dm-tap flex h-full w-full cursor-pointer items-center gap-[14px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
        <span className="flex size-[48px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${D.BRAND.yellow} 22%, transparent)`, color: "#B07D00" }}><Backpack className="h-5 w-5" aria-hidden /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[16px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{supplies.title}</span>
          <span className="text-[13.5px] leading-[18px]" style={{ color: MUTED }}>{supplies.line}</span>
        </span>
        <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
      </button>
      {open && (
        <Sheet title={supplies.title} onClose={() => setOpen(false)} titleId="uw-supplies-title">
          {code ? (
            <div className="flex flex-col items-start gap-[10px]">
              <Eyebrow tone={MUTED}>{U.ready}</Eyebrow>
              <span className="rounded-[var(--radius-md)] border px-[18px] py-[10px] text-[30px] leading-[34px] font-extrabold tracking-[0.18em] tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", borderColor: `color-mix(in srgb, ${BLUE} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${BLUE} 16%, var(--glass-surface-1))` }}>{code}</span>
              <span className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{U.readyLine}</span>
            </div>
          ) : (
            <>
              <Eyebrow tone={MUTED}>{U.pick}</Eyebrow>
              <div className="flex flex-wrap gap-[8px]">
                {supplies.items.map((it) => {
                  const on = !!picked[it];
                  return <button key={it} type="button" aria-pressed={on} onClick={() => setPicked((m) => ({ ...m, [it]: !m[it] }))} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[14px] font-semibold" style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 22%, transparent)` : "transparent", color: "var(--foreground)" }}>{on && <Check className="h-3.5 w-3.5" aria-hidden />}{it}</button>;
                })}
              </div>
              <PrimaryCta className="w-fit" style={SOLID} disabled={!Object.values(picked).some(Boolean)} onClick={() => setCode(`BP-${Math.floor(1000 + Math.random() * 9000)}`)}>{U.send}</PrimaryCta>
            </>
          )}
          <span className="border-t pt-[12px] text-[12.5px] font-semibold" style={{ color: MUTED, borderColor: RULE }}>{supplies.by}</span>
        </Sheet>
      )}
    </>
  );
}

/** Volunteers' ways to help: quick asks first, then shifts. */
function WaysToHelp({ shifts, signed, toggle }: { shifts: D.Shift[]; signed: Record<string, boolean>; toggle: (id: string) => void }) {
  const board = useBoard();
  const U = D.VOLUNTEER_UI;
  const [len, setLen] = useState<typeof U.shiftFilters[number]["key"]>("all");
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const list = shifts.filter((s) => len === "all" || s.length === len);
  return (
    <>
      <section className="flex flex-col gap-[var(--space-3)]">
        <SubHead>{U.requests}</SubHead>
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
      <section className="flex flex-col gap-[var(--space-3)]">
        <SubHead aside={<PillSelect ariaLabel="How long" value={len} onChange={setLen} options={U.shiftFilters.map((f) => ({ value: f.key, label: f.label }))} />}>Ways to help</SubHead>
        <span className="flex items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: MUTED }}><ShieldCheck className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />{U.checkNote}</span>
        {list.length === 0 && <EmptyView tier={5} query={len} line="Try All." cta="Show all" onAction={() => setLen("all")} />}
        <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
          {list.map((s) => <ShiftRow key={s.id} s={s} signed={!!signed[s.id]} onSign={() => toggle(s.id)} onCal={() => addToCalendar(s.title, s.date, s.where, s.hours)} />)}
        </ul>
      </section>
    </>
  );
}

// ——— Impact ———

const IMPACT_ICONS = [Clock, MessagesSquare, Users, Handshake];
function VolunteerImpact({ onToast }: { onToast: (t: string) => void }) {
  const board = useBoard();
  const M = board.myImpact;
  const U = D.VOLUNTEER_UI;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[13px] font-semibold">
          <span className="flex items-center gap-[6px]" style={{ color: GOOD }}><ShieldCheck className="h-4 w-4" aria-hidden />{board.clearance.status}</span>
          <span style={{ color: MUTED }}>{board.clearance.line}</span>
        </span>
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
              <span className="flex flex-col items-center"><span className="text-[26px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{M.goal.logged}</span><span className="text-[11px] font-semibold" style={{ color: MUTED }}>of {M.goal.target}</span></span>
            </Ring>
            <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{M.goal.target - M.goal.logged} hours to go</span>
          </div>
        </Panel>
        <Panel id="uw-months-title" title={U.monthsTitle}><BarChart values={M.hours} labels={M.months} accent={BLUE_TEXT} highlight={M.hours.length - 1} height={140} unit="hours" ariaLabel="Hours by month" /></Panel>
      </div>
      <Testimonials id="uw-thanks-title" title={U.thanks} items={board.thanks} />
    </>
  );
}

const TILE_ICONS = [Users, Handshake, Clock, Briefcase];
const V4_COLORS = { "--v4-chart-1": BLUE_TEXT, "--v4-chart-2": GOOD } as CSSProperties;

/** A number with its six-month shape under it (v4's engagement stat). */
function TrendTile({ icon: Icon, value, label, series }: { icon: typeof Users; value: string; label: string; series: number[] }) {
  const up = Math.round(((series[series.length - 1] - series[0]) / Math.max(1, series[0])) * 100);
  return (
    <div className="flex h-full flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ ...ITEM, boxShadow: "none" }}>
      <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: MUTED }}><Icon className="h-[14px] w-[14px]" aria-hidden style={{ color: BLUE_TEXT }} />{label}</span>
      <span className="flex items-baseline gap-[8px]"><span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span><span className="text-[12px] font-bold tabular-nums" style={{ color: GOOD }}>+{up}%</span></span>
      <span className="mt-auto flex items-end justify-between gap-[10px]"><span className="text-[11.5px] font-medium" style={{ color: MUTED }}>vs April</span><Sparkline values={series} /></span>
    </div>
  );
}

/** Quotes as a row of cards that slides sideways (13 Oct 2026). */
function Testimonials({ id, title, items }: { id: string; title: string; items: { from: string; text: string }[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const step = (dir: 1 | -1) => { const el = ref.current; if (el) el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" }); };
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setMore(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);
  return (
    <section aria-labelledby={id} className="flex flex-col gap-[var(--space-3)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <h3 id={id} className="text-[18px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
        {more && (
          <span className="flex gap-[6px]">
            {([-1, 1] as const).map((d) => (
              <IconTip key={d} label={d < 0 ? "Previous" : "Next"}>
                <button type="button" aria-label={d < 0 ? "Previous" : "Next"} onClick={() => step(d)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{d < 0 ? <ChevronLeft className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}</button>
              </IconTip>
            ))}
          </span>
        )}
      </div>
      <ul ref={ref} className="flow-scroll -mx-[4px] flex snap-x snap-mandatory gap-[var(--space-3)] overflow-x-auto px-[4px] pb-[4px]">
        {items.map((v) => {
          const [who, where] = v.from.split(/,\s*/);
          return (
            <li key={v.from + v.text} className="flex w-[85%] flex-none snap-start sm:w-[calc((100%-2*var(--space-3))/2)] lg:w-[calc((100%-2*var(--space-3))/3)]">
              <figure className="flex w-full flex-col justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ ...ITEM, boxShadow: "none" }}>
                <span aria-hidden className="text-[44px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>&ldquo;</span>
                <blockquote className="text-[16px] leading-[23px] font-semibold" style={{ color: "var(--foreground)" }}>{v.text}</blockquote>
                <figcaption className="flex items-center gap-[10px]">
                  {/student|junior|senior|sophomore|freshman/i.test(v.from) ? <Avatar name={who} size={30} /> : <OrgAvatar org={who} size={30} />}
                  <span className="flex flex-col"><span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{who}</span>{where && <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{where}</span>}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const HOURS_COLORS = [BLUE_TEXT, GOOD, D.BRAND.yellow, "#C79BFF", "#FF8FA3", "#6FE3E3"];

/** Impact, one tab (13 Oct 2026): a community picker (the wider view
 *  first), the four measures, hours by community, visits, what students
 *  ask, then their words. */
function PartnerImpact({ onToast, onPost }: { onToast: (t: string) => void; onPost: () => void }) {
  const board = useBoard();
  const I = board.impact;
  const U = D.PARTNER_UI;
  const [range, setRange] = useState<"month" | "year">("year");
  const [picked, setPicked] = useState("all");
  const total = board.chapters.reduce((n, k) => n + k.students, 0);
  const c = board.chapters.find((k) => k.id === picked);
  // DEMO-ONLY: a community's numbers are the region's, by its share of students
  const share = c ? c.students / total : 1;
  const scaled = (v: string) => Math.round(Number(v.replace(/,/g, "")) * share).toLocaleString("en-US");
  const shape = I.monthly.map((m) => m.unique / I.monthly[0].unique);
  const series = (key: string) => shape.map((f, i) => Math.round(100 * f * (1 + (key.length % 3) * 0.02 * i)));
  const points = I.monthly.map((m) => ({ label: m.label, total: Math.round(m.total * share), unique: Math.round(m.unique * share), avg: Math.round((m.total / m.unique) * 100) / 100 }));
  // DEMO-ONLY: each community's hours spread over the months in the board's own monthly shape
  const weights = I.monthly.map((m) => m.unique);
  const wsum = weights.reduce((n, w) => n + w, 0);
  const hours = board.chapters.map((k) => ({ id: k.id, label: k.short, values: weights.map((w) => Math.round((k.hours * w) / wsum)) }));
  const tabs = [{ key: "all", label: board.places?.all ?? D.COMMUNITY_UI.across }, ...board.chapters.map((k) => ({ key: k.id, label: k.short }))];
  const voices = [...(I.voices ?? [])].sort((a, b) => (c && b.from.includes(c.short) ? 1 : 0) - (c && a.from.includes(c.short) ? 1 : 0));
  return (
    <div className="flex flex-col gap-[var(--space-5)]" style={V4_COLORS}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="w-full min-w-0 sm:w-auto sm:flex-1"><TextTabs caps={false} ariaLabel="Community" layoutId="uw-impact-place" items={tabs} value={picked} onChange={setPicked} /></div>
        <span className="flex items-center gap-[8px]">
          <PillSelect ariaLabel="Range" value={range} onChange={setRange} options={U.range.map((r) => ({ value: r.key, label: r.key === "year" ? "This year" : "This month" }))} />
          <QuietCta size="sm" onClick={() => onToast(U.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {U.export}</QuietCta>
        </span>
      </div>
      {I.signal && !c && (
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${D.BRAND.yellow} 45%, var(--glass-border))`, background: `color-mix(in srgb, ${D.BRAND.yellow} 8%, var(--glass-surface-1))` }}>
          <span className="flex items-center gap-[12px]">
            <span className="text-[24px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#B07D00" }}>{I.signal.value}</span>
            <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{I.signal.line}</span>
          </span>
          <PrimaryCta size="sm" style={SOLID} onClick={onPost}><Plus className="h-4 w-4" aria-hidden /> {I.signal.action}</PrimaryCta>
        </div>
      )}
      <div className="flex flex-col gap-[4px]">
        <h2 className="text-[24px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{c ? c.name : board.name}</h2>
        <span className="text-[13.5px] font-semibold" style={{ color: MUTED }}>{c ? `${c.place} · ${Math.round(share * 100)}% of students` : `${board.places?.all ?? "All"}: ${board.chapters.length} combined · ${total.toLocaleString("en-US")} students`}</span>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-4">
        {I.tiles.map((t, i) => <TrendTile key={t.key} icon={TILE_ICONS[i]} value={scaled(range === "month" ? t.month : t.year)} label={t.label} series={series(t.key)} />)}
      </div>
      <Panel id="uw-hours-title" title={U.hours}>
        <CommunityHoursChart months={I.monthly.map((m) => m.label)} series={hours} picked={picked} onPick={setPicked} colors={HOURS_COLORS} />
      </Panel>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel id="uw-trend-title" title={U.trend}><LoginsChart data={points} labels={["Visits", "Active students"]} /></Panel>
        <Panel id="uw-topics-title" title={U.topics}><RankedRows color={BLUE_TEXT} unit="asks" rows={I.topics.map((t) => ({ label: t.label, value: Math.max(1, Math.round(t.value * share)) }))} /></Panel>
      </div>
      {voices.length > 0 && <Testimonials id="uw-voices-title" title={U.voices} items={voices} />}
      {board.network && (
        <Panel id="uw-network-title" title={board.network.title}>
          <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
            {board.network.items.map((n) => (
              <li key={n.name} className="flex flex-col gap-[4px]">
                <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>{n.stat}</span>
                <span className="text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{n.name}</span>
                <span className="text-[12.5px] leading-[17px]" style={{ color: MUTED }}>{n.line}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {board.partners && (
        <Panel id="uw-partners-title" title={board.partners.title}>
          <div className="flex flex-col gap-[var(--space-3)]">
            <p className="text-[14px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{board.partners.names.map((n, i) => <Fragment key={n}>{i > 0 && " · "}<span className="whitespace-nowrap">{n}</span></Fragment>)}</p>
            <a href={board.partners.url} target="_blank" rel="noopener noreferrer" className="dm-link flex w-fit items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: BLUE_TEXT }}>{board.partners.more} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></a>
          </div>
        </Panel>
      )}
    </div>
  );
}

/** United Way's Post tool: an event or a way to help, straight to the
 *  other POVs. */
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
        <Field label={U.fields.date}><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} style={INPUT_STYLE} /></Field>
      </div>
      <PrimaryCta className="w-fit" style={SOLID} disabled={!title.trim() || !date} onClick={() => onPost(kind, title.trim(), where.trim() || "Online", date)}><Plus className="h-4 w-4" aria-hidden /> {U.submit}</PrimaryCta>
    </Sheet>
  );
}

// ——— the board ———

const sortByDate = <T extends { date: { month: string; day: number; year: number } }>(list: T[]) => [...list].sort((a, b) => (a.date.year - b.date.year) || (MONTHS.indexOf(a.date.month) - MONTHS.indexOf(b.date.month)) || (a.date.day - b.date.day));

/** Where the reader was when they left the board for an event page, per
 *  board, so Back lands on the same section, filters and scroll. In memory
 *  only, so a fresh load starts at the top. */
type Memo = { section: D.UwSection; y: number; programId?: string; announcementId?: string; itemId?: string; when: D.EventWhen; office: string; programPlace: string; studentsShow: string; studentsPlace: string; volunteersLabel: string; volunteersPlace: string };
const MEMO: Record<string, Memo | undefined> = {};

/** A link's `filter` names a section (an event's links into the board). */
const sectionFromFilter = (f?: string): D.UwSection | undefined =>
  f === "talk" || f === "ask" || f === "questions" || f === "students" ? "students"
    : f === "volunteers" ? "volunteers" : f === "team" ? "team" : f === "events" ? "events"
    : f === "programs" || f === "opportunities" || f === "serve" ? "opportunities" : f === "impact" ? "impact" : undefined;

export function UnitedWayBoardView({ board = D.NETWORK, onBack, backLabel = D.BACK, initialTab }: { board?: D.UwBoard; onBack: () => void; backLabel?: string; initialTab?: string }) {
  const [memo] = useState(() => { const m = MEMO[board.id]; MEMO[board.id] = undefined; return m; });
  // a question started in the Mentorship tab opens here, To: United Way Team
  const [pendingAsk, setPendingAskState] = useState(() => takePendingAsk(board.id));
  const router = useRouter();
  const nav = useContext(ConnectNav);
  const [pov, setPov] = useUwPov();
  // opening a United Way board turns the staff messages on in the top nav, app-wide
  useEffect(() => { activateUw(); }, []);
  const sections = D.POV_SECTIONS[pov];
  const onOpenMentorship = () => (nav?.openMentorship ? nav.openMentorship(D.MENTORSHIP_PROGRAM.id) : router.push(`/connect?tab=mentorship&program=${D.MENTORSHIP_PROGRAM.id}`));
  const [sectionRaw, setSection] = useState<D.UwSection>(memo?.section ?? sectionFromFilter(initialTab) ?? "students");
  // a POV that doesn't have the section lands on Students (a student never
  // reaches Team, not even through an old link)
  const section = sections.includes(sectionRaw) ? sectionRaw : "students";
  useEffect(() => {
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
  }, [section, pov]);
  const [toast, onToast] = useToast();
  const [profile, setProfile, closeProfile] = useProfilePage<string>();
  const [person, setPerson] = useState<UwPerson>();
  // a page inside the board (a program, an announcement, an item) is one
  // step on Back, and Back returns to the same scroll spot
  const listY = useRef(0);
  const returnTo = () => {
    const y = listY.current;
    let t = 0;
    const until = performance.now() + 1000;
    const tick = () => { window.scrollTo(0, y); if (Math.abs(window.scrollY - y) > 2 && performance.now() < until) t = window.setTimeout(tick, 16); };
    t = window.setTimeout(tick, 0);
    void t;
  };
  const [program, setProgram] = useState<D.Program | undefined>(() => board.programs.find((x) => x.id === memo?.programId));
  const openProgram = (p: D.Program) => { listY.current = window.scrollY; setProgram(p); window.scrollTo(0, 0); };
  const closeProgram = () => { setProgram(undefined); returnTo(); };
  const [announcementMine, setAnnouncementMine] = useState<D.StaffPost[]>([]);
  const announcements = [...announcementMine, ...board.staff.posts.filter((p) => p.public)];
  const [announcement, setAnnouncement] = useState<D.StaffPost | undefined>(() => announcements.find((p) => p.id === memo?.announcementId));
  const openAnnouncement = (p: D.StaffPost) => { listY.current = window.scrollY; setAnnouncement(p); window.scrollTo(0, 0); };
  const closeAnnouncement = () => { setAnnouncement(undefined); returnTo(); };
  const items = useBoardItems(board);
  const [itemId, setItemId] = useState<string | undefined>(memo?.itemId);
  const item = items.find((i) => i.id === itemId);
  const openItem = (i: UwItem) => { listY.current = window.scrollY; setItemId(i.id); window.scrollTo(0, 0); };
  const closeItem = () => { setItemId(undefined); returnTo(); };
  useBackStep(!!program, closeProgram);
  useBackStep(!!announcement, closeAnnouncement);
  useBackStep(!!item, closeItem);
  useBackStep(!!profile, closeProfile);
  const [applyFor, setApplyFor] = useState<D.Program>();
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState(false);
  const [announcing, setAnnouncing] = useState<"events" | "opportunities" | null>(null);
  const [eventsTab, setEventsTab] = useState<"events" | "announcements">("events");
  const [when, setWhen] = useState<D.EventWhen>(memo?.when ?? "upcoming");
  const [office, setOffice] = useState(memo?.office ?? "all");
  const [programPlace, setProgramPlace] = useState(memo?.programPlace ?? "all");
  const [studentsShow, setStudentsShow] = useState(memo?.studentsShow ?? "all");
  const [studentsPlace, setStudentsPlace] = useState(memo?.studentsPlace ?? "all");
  const [volunteersLabel, setVolunteersLabel] = useState(memo?.volunteersLabel ?? "all");
  const [volunteersPlace, setVolunteersPlace] = useState(memo?.volunteersPlace ?? "all");
  const [joinedLocal, setJoined] = useState<Record<string, boolean>>({});
  const uw = useUwMentorship();
  // e-Mentorship's interest is shared with the Mentorship tab
  const joined: Record<string, boolean> = { ...joinedLocal, ...Object.fromEntries(board.programs.filter((p) => p.mentorship).map((p) => [p.id, uw.stage !== "none"])) };
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [served, setServed] = useState<Record<string, boolean>>({});
  const [shiftsSigned, setShiftsSigned] = useState<Record<string, boolean>>({});
  const [postedEvents, setPostedEvents] = useState<D.UwEvent[]>([]);
  const [postedShifts, setPostedShifts] = useState<D.Shift[]>([]);
  const homeState = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot).states[0];
  const home = board.chapters.find((k) => homeState && k.place.includes(homeState)) ?? board.chapters[0];
  const volunteerMe = board.volunteerIds.find((id) => D.VOLUNTEERS[id]?.org === board.team.you) ?? board.volunteerIds[0];
  const me: UwPerson = pov === "student" ? { kind: "student", name: "Jordan", grade: "Senior", place: home.short } : pov === "volunteer" ? { kind: "volunteer", proId: volunteerMe } : { kind: "staff", ...board.staff.me };
  // leaving for an event page: Back returns here
  const remember = () => {
    MEMO[board.id] = { section, y: window.scrollY, programId: program?.id, announcementId: announcement?.id, itemId, when, office, programPlace, studentsShow, studentsPlace, volunteersLabel, volunteersPlace };
  };
  // every event needs its attendee code first (13 Oct 2026); once entered
  // it stays open (Connect's Your events)
  const openEvent = (id: string, filter?: string) => {
    remember();
    if (uwEventById(id) && nav?.isEventJoined && !nav.isEventJoined(id)) { nav.enterEventCode?.(id); return; }
    if (nav?.openEvent) nav.openEvent(id, filter);
    else router.push(`/connect?event=${id}${filter ? `&filter=${filter}` : ""}`);
  };
  const go = (s: D.UwSection, filter?: string) => {
    setItemId(undefined); setProgram(undefined); setAnnouncement(undefined);
    if (s === "volunteers" && filter) setVolunteersLabel(filter);
    setSection(s);
    window.setTimeout(() => document.getElementById("uw-sections")?.scrollIntoView({ block: "start" }), 0);
  };
  const openPerson = (who: UwPerson) => { if (who.kind === "volunteer") setProfile(who.proId); else setPerson(who); };
  const local = office !== "all";
  const inScope = (c: string | null) => !local || c === null || c === office;
  const events = sortByDate([...board.events, ...postedEvents]);
  const serve = sortByDate([...board.serve, ...postedShifts.filter((s) => s.who !== "Any volunteer")]).filter((s) => inScope(s.chapter));
  const shifts = sortByDate([...board.shifts, ...postedShifts]);
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
  const uwNav: UwNav = { board, pov, me, openItem, openPerson, openEvent, go, toast: onToast };

  const tabOptions = sections.map((k) => ({ key: k, label: pov === "volunteer" && k === "impact" ? "My Impact" : D.SECTION_LABEL[k] }));
  // phones: as many whole tabs as fit, the rest under More
  const [tabsRef, phoneTabs] = useFitTabs(tabOptions.map((o) => o.label));

  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    // no private message option from a board where students are minors
    return <ProProfileView key={pro.id} pro={pro} follows={follows} onFollow={() => flip(setFollows)(profile)} onBack={closeProfile} backLabel="Back to United Way" noDirectMessage />;
  }

  // The hero leads with the board's real scale (the same chapter totals the
  // Impact maps add up to), not small counts like "4 communities" or "8
  // events" (Chandu, 15 Oct 2026: "don't show small numbers, this will make
  // it feel unimpressive"). Every POV sees the same three, so a card, the
  // hero and the Impact tab can never disagree.
  const sum = (k: "students" | "volunteers" | "hours") => board.chapters.reduce((n, c) => n + c[k], 0);
  const heroStats = [
    { value: sum("students").toLocaleString("en-US"), label: "students" },
    { value: sum("volunteers").toLocaleString("en-US"), label: "volunteers" },
    { value: sum("hours").toLocaleString("en-US"), label: "volunteer hours" },
  ];
  const cover = pov === "volunteer" ? board.photos.volunteers : board.photos.hero;
  const focus = pov === "volunteer" ? board.photos.volunteersFocus : board.photos.heroFocus;
  const evAnnouncements = announcements.filter((p) => (p.section ?? "events") === "events");
  const oppAnnouncements = announcements.filter((p) => p.section === "opportunities" && (pov !== "student" || p.audience !== "volunteers"));
  return (
    <BoardCtx.Provider value={board}>
    <UwNavCtx.Provider value={uwNav}>
    <EventsCtx.Provider value={{ open: openEvent, toast: onToast }}>
    <FiltersCtx.Provider value={{ when, setWhen, office, setOffice, programPlace, setProgramPlace }}>
      {applyFor && <ApplySheet p={applyFor} onClose={() => setApplyFor(undefined)} onSend={() => { setApplied((m) => ({ ...m, [applyFor.id]: true })); setJoined((m) => ({ ...m, [applyFor.id]: true })); setApplyFor(undefined); onToast(D.PROGRAM_PAGE.applied); }} />}
      {posting && <PostSheet onPost={post} onClose={() => setPosting(false)} />}
      {announcing && <AnnounceSheet section={announcing} onClose={() => setAnnouncing(null)} onPost={({ title, body, poster }) => { setAnnouncementMine((l) => [{ id: `uw-ann-${Date.now()}`, kind: "update", public: true, section: announcing, author: board.staff.me, title, body, poster, postedAgo: "Just now", replies: [] }, ...l]); onToast("Posted. Students and volunteers can see it."); }} />}
      {person && <PersonSheet who={person} onClose={() => setPerson(undefined)} />}
      {pendingAsk && pov === "student" && <StudentComposer programId={pendingAsk.programId} initialText={pendingAsk.text} onClose={() => setPendingAskState(null)} />}
      {toast}

      {item ? (
        <ItemPage item={item} onBack={closeItem} backLabel={`Back to ${D.SECTION_LABEL[section]}`} />
      ) : announcement ? (
        <AnnouncementPage p={announcement} onBack={closeAnnouncement} />
      ) : program ? (
        <ProgramPage p={program} applied={!!applied[program.id]} mentorshipJoined={!!program.mentorship && uw.stage !== "none"}
          onApply={() => { if (program.mentorship) { markUwInterest(); onToast(D.PROGRAMS_UI.done); } else setApplyFor(program); }}
          onMentorship={() => { setProgram(undefined); onOpenMentorship(); }} onBack={closeProgram}
          events={events} questions={items} canAsk={pov === "student"} />
      ) : (<>
      <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[6px]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: MUTED }}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</button>
        <PovSwitch pov={pov} onChange={keep(setPov)} />
      </div>

      {/* United Way's own photo and mark; the white mark is the brand's
         one-colour version for dark grounds */}
      <section aria-label="United Way" className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-6)] sm:min-h-[300px] sm:px-[var(--space-8)]" style={{ background: "#0a0f2a", border: `1px solid color-mix(in srgb, ${BLUE} 55%, transparent)`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 55%, transparent), 0 18px 44px -22px rgba(0,0,0,0.65)`, textShadow: CARD_TEXT_SHADOW }}>
        <Image key={cover} src={cover} alt="" fill sizes="1280px" priority className="object-cover" style={{ objectPosition: focus }} />
        <span aria-hidden className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,20,70,0.92) 0%, rgba(0,30,90,0.7) 38%, rgba(0,30,90,0.1) 70%, transparent 100%), linear-gradient(to top, rgba(6,8,18,0.7) 0%, transparent 45%)" }} />
        <span aria-hidden className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(0,20,70,0.95) 0%, rgba(0,25,80,0.75) 42%, rgba(0,25,80,0.15) 72%, rgba(0,20,60,0.35) 100%)" }} />
        <Image src={D.BRAND.logoWhite} alt="United Way" width={156} height={73} unoptimized className="absolute top-[var(--space-6)] left-[var(--space-6)] z-10 h-[46px] w-auto sm:left-[var(--space-8)] sm:h-[56px]" />
        <div className="relative z-10 flex max-w-[560px] flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[34px] font-extrabold sm:text-[44px] sm:leading-[46px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{board.name}</h1>
          {heroStats.length > 0 && (
            <div className="mt-[6px] flex flex-wrap gap-[8px]">
              {heroStats.map((s) => <span key={s.label} className="rounded-full px-[12px] py-[5px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", textShadow: "none" }}><strong className="font-extrabold">{s.value}</strong> {s.label}</span>)}
            </div>
          )}
        </div>
      </section>

      {/* One panel, two zones (Chandu, 15 Oct 2026: "break the UI into a header
          housing the tabs, counts, dropdowns, and then in the next section make
          the messages use the full width, so it's all sitting in one padding").
          The header holds the tabs, and each feed section its own count and
          dropdowns; the rows sit below it at the panel's full width with only a
          hairline between them. Below lg the panel is a solid band from screen
          edge to screen edge instead of a boxed card inside the page's
          gutters, so a phone or tablet keeps its width for the words. */}
      <SectionSurface flush className="flex flex-col">
        {/* one tab row. From sm every section is a tab; on a phone the
           first two or three are tabs and the rest sit in a More dropdown, so the
           row fits 390px with no sideways scroll (Chandu, 15 Oct 2026: the
           Team POV's six tabs scrolled sideways) */}
        <div id="uw-sections" className="scroll-mt-[96px] px-[var(--space-4)] pt-[var(--space-4)] sm:px-[var(--space-6)] sm:pt-[var(--space-5)]">
          <div className="hidden sm:block"><div className="w-full sm:w-fit"><Segmented ariaLabel="Section" value={section} onChange={keep(setSection)} options={tabOptions} grow dense /></div></div>
          <div ref={tabsRef} className="flex items-center gap-[8px] sm:hidden">
            <div className="min-w-0 flex-1"><Segmented ariaLabel="Section" value={section} onChange={keep(setSection)} options={tabOptions.slice(0, phoneTabs)} grow dense /></div>
            {tabOptions.length > phoneTabs && (
              <Listbox ariaLabel="More sections" placeholder="More" value={tabOptions.slice(phoneTabs).some((o) => o.key === section) ? section : ""} onChange={(v) => keep(setSection)(v as D.UwSection)} options={tabOptions.slice(phoneTabs).map((o) => ({ value: o.key, label: o.label }))}
                className="flex min-h-[40px] flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[12px] text-[13px] font-semibold" style={tabOptions.slice(phoneTabs).some((o) => o.key === section) ? { ...SOLID, borderColor: BLUE } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
            )}
          </div>
        </div>
        <motion.div key={`${pov}-${section}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className={section === "students" || section === "volunteers" ? "flex flex-col" : "flex flex-col gap-[var(--space-6)] px-[var(--space-4)] py-[var(--space-5)] sm:px-[var(--space-6)]"}>
          {section === "students" && <StudentsSection items={items} show={studentsShow} setShow={setStudentsShow} place={studentsPlace} setPlace={setStudentsPlace} />}
          {section === "volunteers" && <VolunteersSection items={items} label={volunteersLabel} setLabel={setVolunteersLabel} place={volunteersPlace} setPlace={setVolunteersPlace} />}
          {section === "team" && pov === "team" && <TeamWorkspace board={board} openEvent={openEvent} toast={onToast} />}
          {section === "opportunities" && (
            <>
              {pov === "volunteer"
                ? <WaysToHelp shifts={shifts} signed={shiftsSigned} toggle={flip(setShiftsSigned)} />
                : (
                  <section className="flex flex-col gap-[var(--space-4)]">
                    <SubHead>Programs</SubHead>
                    <ProgramsGrid programs={pov === "student" ? board.programs.filter((p) => !p.adults) : board.programs} joined={joined} open={openProgram} onPost={pov === "team" ? () => setPosting(true) : undefined} stats={pov === "team" ? board.partnerPrograms : undefined} />
                  </section>
                )}
              <LabelledPosts items={items} label="opportunity" title="From volunteers" />
              <Announcements posts={oppAnnouncements} open={openAnnouncement} onNew={pov === "team" ? () => setAnnouncing("opportunities") : undefined} />
              {pov === "student" && (
                <section className="flex flex-col gap-[var(--space-3)]">
                  <SubHead>Help for you</SubHead>
                  <div className={`grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2 ${board.supplies ? "lg:grid-cols-3" : ""}`}>
                    <ServiceHoursCard shifts={serve} signed={served} toggle={flip(setServed)} onToast={onToast} />
                    <HelpCard />
                    {board.supplies && <SuppliesCard />}
                  </div>
                </section>
              )}
            </>
          )}
          {section === "events" && (
            <>
              {/* Events and Announcements are two tabs, not one long page
                  (15 Oct 2026, Chandu: "make announcements and event tabs, I
                  shouldn't need to scroll to get to events"). Events leads. */}
              <TextTabs caps={false} ariaLabel="Events section" layoutId="uw-events-tab" value={eventsTab} onChange={(k) => setEventsTab(k as "events" | "announcements")} items={[{ key: "events", label: "Events" }, { key: "announcements", label: `Announcements (${evAnnouncements.length})` }]} />
              {eventsTab === "announcements" ? (
                <Announcements posts={evAnnouncements} open={openAnnouncement} onNew={pov === "team" ? () => setAnnouncing("events") : undefined} />
              ) : (
                <>
                  <section className="flex flex-col gap-[var(--space-4)]">
                    <EventsList events={events} staff={pov === "team"} />
                  </section>
                  <LabelledPosts items={items} label="event" title="Event Updates From Volunteers" />
                </>
              )}
            </>
          )}
          {section === "impact" && (pov === "team" ? <PartnerImpact onToast={onToast} onPost={() => setPosting(true)} /> : <VolunteerImpact onToast={onToast} />)}
        </motion.div>
      </SectionSurface>
      </>)}
    </FiltersCtx.Provider>
    </EventsCtx.Provider>
    </UwNavCtx.Provider>
    </BoardCtx.Provider>
  );
}
