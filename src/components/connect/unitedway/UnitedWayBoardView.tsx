"use client";

// United Way · Student Success board (7 Oct 2026). Three views, each the
// Connect role United Way's audience maps to: Student (Home · Programs · Ask
// · Events), Volunteer (Today · My Impact) and United Way (Impact ·
// Programs). Second pass the same day (Chandu: "Use United Way branding...
// official imagery... avoid lots of cluttered text... 8th grade reading"):
// United Way's own logo and photography, the brand blue on every action,
// and copy cut to a title, one line and icon facts. Photos carry the
// programs; numbers sit in the app's existing charts (MetricTile,
// Histogram, GoalTrack, BarChart). Strings live in uwData.ts.

import Image from "next/image";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Flag, Handshake, MapPin, MessageSquareOff, MessagesSquare, ThumbsUp, Timer, Users, X, Briefcase, GraduationCap } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { EmptyView } from "@/components/app/states";
import { Avatar, InlineAsk, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { MetricTile, Segmented, ruledCell } from "../viz";
import { BarChart, GoalTrack, Histogram } from "../mentorship/charts";
import { Panel, ProProfileView, RULE } from "../ProProfile";
import * as D from "./uwData";

const BLUE = D.BRAND.blue;
const BLUE_TEXT = D.BRAND.blueText;
const GOOD = "var(--world-food-farming-nature)";
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
const SOLID = { background: BLUE, color: "#fff" } as const;

// ——— small pieces ———

function Eyebrow({ children, tone = BLUE_TEXT }: { children: ReactNode; tone?: string }) {
  return <span className="block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}>{children}</span>;
}
function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: BLUE_TEXT }}>{children}</button>;
}
function Done({ text }: { text: string }) {
  return <span className="flex items-center gap-[6px] text-[13.5px] leading-[18px] font-bold" style={{ color: GOOD }}><CheckCircle2 className="h-4 w-4" aria-hidden /> {text}</span>;
}
function Fact({ icon: Icon, children }: { icon: typeof Calendar; children: ReactNode }) {
  return <span className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}><Icon className="h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />{children}</span>;
}
function DateTile({ month, day, size = "md" }: { month: string; day: number; size?: "sm" | "md" }) {
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
const KIND_ICON: Record<D.ProgramKind, typeof Handshake> = { mentor: Handshake, work: Briefcase, college: GraduationCap, internship: Briefcase };

const ReportCtx = createContext<(what: string) => void>(() => {});
function ReportButton({ what }: { what: string }) {
  const report = useContext(ReportCtx);
  return (
    <IconTip label="Report">
      <button type="button" aria-label="Report" onClick={() => report(what)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><Flag className="h-3.5 w-3.5" aria-hidden /></button>
    </IconTip>
  );
}
const OpenPro = createContext<(id: string) => void>(() => {});
function ProLine({ id }: { id: string }) {
  const pro = D.VOLUNTEERS[id];
  const openPro = useContext(OpenPro);
  if (!pro) return null;
  return (
    <button type="button" onClick={() => openPro(id)} className="dm-quiet flex min-w-0 cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] text-left">
      <Avatar name={pro.name} size={32} />
      <span className="min-w-0">
        <span className="flex items-center gap-[5px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name.split(" ")[0]} <VerifiedBadge size={13} /></span>
        <span className="block truncate text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{pro.org}</span>
      </span>
    </button>
  );
}

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

function useToast(): [ReactNode, (text: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const node = toast ? (
    <Portal>
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-[13.5px] font-semibold whitespace-nowrap" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7)" }}>{toast}</div>
    </Portal>
  ) : null;
  return [node, setToast];
}

// ——— Programs: the photo is the card ———

function ProgramCard({ p, joined, onOpen, wide = false }: { p: D.Program; joined: boolean; onOpen: () => void; wide?: boolean }) {
  const Icon = KIND_ICON[p.kind];
  return (
    <button type="button" onClick={onOpen} className={`dm-tap group relative flex w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left ${wide ? "aspect-[4/3]" : "aspect-[4/5]"}`} style={{ borderColor: "var(--glass-border)", textShadow: CARD_TEXT_SHADOW, boxShadow: "0 18px 40px -26px rgba(0,0,0,0.7)" }}>
      <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" style={{ objectPosition: p.focus }} />
      <CardProgressiveBlur size="52%" />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.55) 38%, transparent 65%)" }} />
      <span className="absolute top-[10px] left-[10px] z-10 inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: BLUE, color: "#fff", textShadow: "none" }}><Icon className="h-3 w-3" aria-hidden />{p.kindLabel}</span>
      <span className="relative z-10 flex flex-col gap-[4px] p-[var(--space-4)]">
        <span className="text-[19px] leading-[23px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{p.title}</span>
        <span className="text-[13.5px] leading-[18px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{p.line}</span>
        <span className="mt-[4px] w-fit" style={{ textShadow: "none" }}><StatusDot status={p.status} /></span>
        {joined && <span className="mt-[2px] flex items-center gap-[5px] text-[12.5px] font-bold" style={{ color: "#7EE2B0" }}><Check className="h-3.5 w-3.5" aria-hidden /> {D.PROGRAMS_UI.done}</span>}
      </span>
    </button>
  );
}

function Gets({ items }: { items: string[] }) {
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
function NoMessages() {
  return (
    <div className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: `color-mix(in srgb, ${BLUE} 40%, var(--glass-border))`, background: `color-mix(in srgb, ${BLUE} 14%, var(--glass-surface-1))` }}>
      <MessageSquareOff className="h-5 w-5 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
      <span className="text-[14px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>{D.PROGRAMS_UI.noMessages}</span>
    </div>
  );
}

function ProgramSheet({ p, joined, onJoin, onMentorship, onClose }: { p: D.Program; joined: boolean; onJoin: () => void; onMentorship: () => void; onClose: () => void }) {
  const U = D.PROGRAMS_UI;
  return (
    <Sheet title={p.title} onClose={onClose} titleId="uw-program-title" photo={p.photo} focus={p.focus}>
      <p className="-mt-[8px] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{p.line}</p>
      <Gets items={p.gets} />
      <div className="flex flex-wrap gap-x-[20px] gap-y-[8px]"><Fact icon={Calendar}>{p.when}</Fact><Fact icon={MapPin}>{p.where}</Fact></div>
      {p.proof && <Proof {...p.proof} />}
      {p.mentorship && <NoMessages />}
      <div className="flex flex-wrap items-center gap-[10px] pt-[4px]">
        {joined ? <Done text={`${U.done}. ${U.doneLine}`} /> : <PrimaryCta onClick={onJoin} style={SOLID}>{U.interested}</PrimaryCta>}
        {p.mentorship && <QuietCta onClick={onMentorship}>{U.openMentorship}</QuietCta>}
      </div>
      <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{p.by}</span>
    </Sheet>
  );
}

// ——— Events ———

function EventRow({ e, saved, onSave, onOpen }: { e: D.UwEvent; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return (
    <div className="dm-tap group relative flex items-center gap-[14px] rounded-[var(--radius-lg)] border p-[14px]" style={ITEM}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {e.title}</span></button>
      <DateTile month={e.date.month} day={e.date.day} />
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
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
      </div>
    </Sheet>
  );
}

function StudentEvents({ saves, toggleSave, open }: { saves: Record<string, boolean>; toggleSave: (id: string) => void; open: (e: D.UwEvent) => void }) {
  const [filter, setFilter] = useState<D.EventFilter>("all");
  const list = D.EVENTS.filter((e) => filter === "all" || (filter === "online" ? e.virtual : !e.virtual));
  return (
    <>
      <div className="w-fit"><Segmented ariaLabel="Where" value={filter} onChange={setFilter} options={[...D.EVENTS_UI.filters]} /></div>
      {list.length === 0 && <EmptyView tier={5} query={filter} line="Try All." cta="Show all" onAction={() => setFilter("all")} />}
      <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
        {list.map((e) => <EventRow key={e.id} e={e} saved={!!saves[e.id]} onSave={() => toggleSave(e.id)} onOpen={() => open(e)} />)}
      </div>
    </>
  );
}

// ——— Ask ———

function StudentAsk() {
  const [asked, setAsked] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const openPro = useContext(OpenPro);
  return (
    <>
      <Panel id="uw-ask-title" title={D.ASK.title}>
        {asked ? (
          <div className="flex flex-col gap-[8px]"><Done text={D.ASK.submitted} /><LinkButton onClick={() => setAsked(false)}>{D.ASK.again}</LinkButton></div>
        ) : (
          <InlineAsk joined defaultOpen accent={BLUE} placeholder={D.ASK.placeholder} onPost={() => setAsked(true)} />
        )}
      </Panel>

      <section className="flex flex-col gap-[var(--space-3)]">
        <SectionHead>{D.ASK.people}</SectionHead>
        <div className="dm-scroll -mx-[4px] flex gap-[var(--space-3)] overflow-x-auto px-[4px] pb-[4px] [scrollbar-width:none]">
          {D.VOLUNTEER_IDS.map((id) => {
            const pro = D.VOLUNTEERS[id];
            return (
              <button key={id} type="button" onClick={() => openPro(id)} className="dm-quiet flex w-[96px] flex-none cursor-pointer flex-col items-center gap-[6px] rounded-[var(--radius-md)] p-[6px] text-center">
                <Avatar name={pro.name} size={60} />
                <span className="w-full truncate text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name.split(" ")[0]}</span>
                <span className="w-full truncate text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>{pro.org}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-3)]">
        <SectionHead>{D.ASK.answers}</SectionHead>
        <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-3">
          {D.ANSWERS.map((a) => (
            <li key={a.id} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
              <h3 className="text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{a.question}</h3>
              <p className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{a.answer}</p>
              <div className="mt-auto flex items-center justify-between gap-[8px] pt-[4px]">
                <ProLine id={a.pro} />
                <span className="flex flex-none items-center gap-[2px]">
                  <button type="button" aria-pressed={!!liked[a.id]} aria-label="Helpful" onClick={() => setLiked((m) => ({ ...m, [a.id]: !m[a.id] }))} className="dm-quiet flex cursor-pointer items-center gap-[5px] rounded-full px-[8px] py-[3px] text-[12.5px] font-bold tabular-nums" style={{ color: liked[a.id] ? BLUE_TEXT : "var(--muted-foreground)" }}><ThumbsUp className="h-3.5 w-3.5" aria-hidden />{a.helpful + (liked[a.id] ? 1 : 0)}</button>
                  <ReportButton what={a.id} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// ——— Home ———

function useStudentWorlds(): string[] {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return picks.ids.map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.world).filter((w): w is string => !!w);
}

function StudentHome({ go, openProgram, joined, saves, toggleSave, openEvent }: { go: (tab: typeof D.STUDENT_TABS[number]["key"]) => void; openProgram: (p: D.Program) => void; joined: Record<string, boolean>; saves: Record<string, boolean>; toggleSave: (id: string) => void; openEvent: (e: D.UwEvent) => void }) {
  const worlds = useStudentWorlds();
  const soon = [...D.EVENTS].sort((a, b) => Number(!!b.world && worlds.includes(b.world)) - Number(!!a.world && worlds.includes(a.world))).slice(0, 4);
  return (
    <>
      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <SectionHead>Programs</SectionHead>
          <LinkButton onClick={() => go("programs")}>See all <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="dm-scroll -mx-[var(--space-5)] flex snap-x snap-mandatory gap-[var(--space-3)] overflow-x-auto px-[var(--space-5)] pb-[4px] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {D.PROGRAMS.map((p) => <div key={p.id} className="w-[72vw] max-w-[300px] flex-none snap-start sm:w-auto sm:max-w-none"><ProgramCard p={p} joined={!!joined[p.id]} onOpen={() => openProgram(p)} /></div>)}
        </div>
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

      <button type="button" onClick={() => go("ask")} className="dm-tap flex cursor-pointer flex-wrap items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${BLUE} 34%, transparent), transparent 75%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` }}>
        <span className="flex items-center gap-[14px]">
          <span className="flex -space-x-[10px]">{D.VOLUNTEER_IDS.slice(0, 4).map((id) => <span key={id} className="rounded-full" style={{ boxShadow: "0 0 0 2px var(--card)" }}><Avatar name={D.VOLUNTEERS[id].name} size={36} /></span>)}</span>
          <span className="flex flex-col">
            <span className="text-[18px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.ASK.title}</span>
            <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>Real people. Real jobs. Checked and safe.</span>
          </span>
        </span>
        <span className="flex items-center gap-[6px] rounded-[var(--radius-md)] px-[16px] py-[10px] text-[14px] font-semibold" style={SOLID}><MessagesSquare className="h-4 w-4" aria-hidden /> Ask</span>
      </button>
    </>
  );
}

// ——— Volunteer ———

function VolunteerToday() {
  const T = D.TODAY;
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <SectionHead>{T.title}</SectionHead>
      <ul className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
        {T.requests.map((r) => (
          <li key={r.id} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
            <div className="flex items-center justify-between gap-[8px]">
              <Eyebrow>{r.kind}</Eyebrow>
              <span className="flex items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold tabular-nums" style={{ background: `color-mix(in srgb, ${BLUE} 26%, transparent)`, color: BLUE_TEXT }}><Timer className="h-3 w-3" aria-hidden /> {r.minutes} {T.min}</span>
            </div>
            <span className="text-[16px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.title}</span>
            <div className="mt-auto pt-[2px]">{accepted[r.id] ? <Done text={T.accepted} /> : <PrimaryCta size="sm" className="w-fit" style={SOLID} onClick={() => setAccepted((m) => ({ ...m, [r.id]: true }))}>{T.accept}</PrimaryCta>}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const IMPACT_ICONS = [Clock, MessagesSquare, Users, Handshake];
function VolunteerImpact({ onToast }: { onToast: (t: string) => void }) {
  const M = D.MY_IMPACT;
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <SectionHead>My Impact</SectionHead>
        <QuietCta size="sm" onClick={() => onToast(M.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {M.export}</QuietCta>
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {M.tiles.map((t, i) => <div key={t.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}><MetricTile icon={IMPACT_ICONS[i]} value={t.value} label={t.label} accent={BLUE_TEXT} /></div>)}
        </div>
      </SectionSurface>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel id="uw-goal-title" title={M.goal.title}><GoalTrack logged={M.goal.logged} target={M.goal.target} pace={M.goal.pace} accent={BLUE_TEXT} unit={M.goal.unit} /></Panel>
        <Panel id="uw-months-title" title={M.monthsTitle}><BarChart values={M.hours} labels={M.months} accent={BLUE_TEXT} highlight={M.hours.length - 1} height={140} unit="hours" ariaLabel="Hours by month" /></Panel>
      </div>
    </section>
  );
}

// ——— United Way view ———

function GoalRow({ label, value, goal, last, unit = "" }: { label: string; value: number; goal: number; last: number; unit?: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const tick = Math.min(100, Math.round((last / goal) * 100));
  const fmt = (n: number) => `${n.toLocaleString()}${unit}`;
  return (
    <li className="flex flex-col gap-[6px]">
      <span className="flex items-baseline justify-between gap-[12px] text-[14px] leading-[19px]">
        <span className="min-w-0 truncate font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
        <span className="flex-none font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{fmt(value)}<span className="font-medium" style={{ color: "var(--muted-foreground)" }}> / {fmt(goal)}</span></span>
      </span>
      <span className="relative block h-[8px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} aria-hidden>
        <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${BLUE_TEXT} 40%, transparent), ${BLUE_TEXT})` }} />
        <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${tick}% - 1px)`, background: D.BRAND.yellow }} />
      </span>
    </li>
  );
}

const TILE_ICONS = [Users, Handshake, Clock, Briefcase];
function PartnerImpact({ onToast }: { onToast: (t: string) => void }) {
  const I = D.IMPACT;
  const [range, setRange] = useState<"month" | "year">("year");
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented ariaLabel="Range" value={range} onChange={setRange} options={[...I.range]} />
        <QuietCta size="sm" onClick={() => onToast(I.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {I.export}</QuietCta>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 30%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` }}>
        <div className="flex flex-col gap-[4px]">
          <span className="text-[52px] leading-[54px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{I.outcome.value}</span>
          <span className="max-w-[24ch] text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{I.outcome.line}</span>
        </div>
        <Histogram values={I.funnel.map((f) => f.value)} labels={I.funnel.map((f) => f.label)} accent={BLUE_TEXT} height={110} ariaLabel="From reached to matched" />
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {I.tiles.map((t, i) => <div key={t.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}><MetricTile icon={TILE_ICONS[i]} value={range === "month" ? t.month : t.year} label={t.label} accent={BLUE_TEXT} /></div>)}
        </div>
      </SectionSurface>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel id="uw-grf-title" title={I.grfTitle} aside={<span className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="inline-block h-[10px] w-[2px] rounded-[1px]" style={{ background: D.BRAND.yellow }} />{I.grfNote}</span>}>
          <ul className="flex flex-col gap-[16px]">{I.grf.map((r) => <GoalRow key={r.label} {...r} />)}</ul>
        </Panel>
        <Panel id="uw-safety-title" title="Safety">
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
    </section>
  );
}

function PartnerPrograms() {
  const P = D.PARTNER_PROGRAMS;
  const max = Math.max(...P.rows.map((r) => r.students));
  return (
    <SectionSurface className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[14px]">
        <thead><tr>{P.columns.map((c, i) => <th key={c} className={`px-[var(--space-4)] py-[12px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase ${i === 0 ? "text-left" : "text-right"}`} style={{ color: "var(--muted-foreground)", borderBottom: `1px solid ${RULE}` }}>{c}</th>)}</tr></thead>
        <tbody>
          {P.rows.map((r) => (
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

export function UnitedWayBoardView({ onBack, backLabel = D.BACK }: { onBack: () => void; backLabel?: string }) {
  const router = useRouter();
  const onOpenMentorship = () => router.push(`/connect?tab=mentorship&program=${D.MENTORSHIP_PROGRAM.id}`, { scroll: false });
  const [view, setView] = useState<D.UwView>("student");
  const [studentTab, setStudentTab] = useState<typeof D.STUDENT_TABS[number]["key"]>("home");
  const [volunteerTab, setVolunteerTab] = useState<typeof D.VOLUNTEER_TABS[number]["key"]>("today");
  const [partnerTab, setPartnerTab] = useState<typeof D.PARTNER_TABS[number]["key"]>("impact");
  const keepY = useRef<number | null>(null);
  const keep = <T,>(set: (v: T) => void) => (v: T) => { keepY.current = window.scrollY; set(v); };
  useLayoutEffect(() => {
    if (keepY.current == null) return;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo(0, Math.min(keepY.current, max));
    keepY.current = null;
  }, [studentTab, volunteerTab, partnerTab]);
  const [toast, onToast] = useToast();
  const [reportFor, setReportFor] = useState<string>();
  const [profile, setProfile] = useState<string>();
  const [program, setProgram] = useState<D.Program>();
  const [event, setEvent] = useState<D.UwEvent>();
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const flip = (set: (f: (m: Record<string, boolean>) => Record<string, boolean>) => void) => (id: string) => set((m) => ({ ...m, [id]: !m[id] }));

  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    return <ProProfileView key={pro.id} pro={pro} follows={follows} onFollow={() => flip(setFollows)(profile)} onBack={() => setProfile(undefined)} backLabel="Back to United Way" />;
  }

  const cover = view === "volunteer" ? D.PHOTOS.volunteers : D.PHOTOS.hero;
  const title = view === "volunteer" ? "Volunteer" : view === "partner" ? "Impact" : D.UW.name;
  return (
    <OpenPro.Provider value={setProfile}>
    <ReportCtx.Provider value={setReportFor}>
      {reportFor && (
        <Sheet title={D.REPORT.title} onClose={() => setReportFor(undefined)} titleId="uw-report-title">
          <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.REPORT.reasons.map((r) => (
              <li key={r} style={{ borderColor: RULE }}>
                <button type="button" onClick={() => { setReportFor(undefined); onToast(D.REPORT.sent); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between py-[12px] text-left text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{r} <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} /></button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
      {program && <ProgramSheet p={program} joined={!!joined[program.id]} onJoin={() => { setJoined((m) => ({ ...m, [program.id]: true })); onToast(D.PROGRAMS_UI.done); }} onMentorship={() => { setProgram(undefined); onOpenMentorship(); }} onClose={() => setProgram(undefined)} />}
      {event && <EventSheet e={event} saved={!!saves[event.id]} onSave={() => flip(setSaves)(event.id)} inPlan={!!plan[event.id]} onPlan={() => { flip(setPlan)(event.id); onToast(plan[event.id] ? "Removed from My Plan" : "Added to My Plan"); }} onClose={() => setEvent(undefined)} />}
      {toast}

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</button>
        <DemoViewSwitch key={view} view={view} onPick={setView} />
      </div>

      {/* United Way's own photo and mark; the white mark is the brand's
         one-colour version for dark grounds */}
      <section aria-label="United Way" className="relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-6)] sm:min-h-[340px] sm:px-[var(--space-8)]" style={{ background: "#0a0f2a", border: `1px solid color-mix(in srgb, ${BLUE} 55%, transparent)`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 55%, transparent), 0 18px 44px -22px rgba(0,0,0,0.65)`, textShadow: CARD_TEXT_SHADOW }}>
        <Image key={cover} src={cover} alt="" fill sizes="1280px" priority className="object-cover" style={{ objectPosition: view === "volunteer" ? "50% 40%" : "62% 40%" }} />
        <span aria-hidden className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,20,70,0.92) 0%, rgba(0,30,90,0.7) 38%, rgba(0,30,90,0.1) 70%, transparent 100%), linear-gradient(to top, rgba(6,8,18,0.7) 0%, transparent 45%)" }} />
        <span aria-hidden className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(0,20,70,0.95) 0%, rgba(0,25,80,0.75) 42%, rgba(0,25,80,0.15) 72%, rgba(0,20,60,0.35) 100%)" }} />
        <Image src={D.BRAND.logoWhite} alt="United Way" width={156} height={73} unoptimized className="absolute top-[var(--space-6)] left-[var(--space-6)] z-10 h-[46px] w-auto sm:left-[var(--space-8)] sm:h-[56px]" />
        <div className="relative z-10 flex max-w-[520px] flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[34px] font-extrabold sm:text-[44px] sm:leading-[46px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{title}</h1>
          {view === "student" && <p className="text-[16px] leading-[22px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>{D.UW.line}</p>}
          {view === "student" && (
            <div className="mt-[6px] flex flex-wrap gap-[8px]">
              {D.UW.stats.map((s) => <span key={s.label} className="rounded-full px-[12px] py-[5px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", textShadow: "none" }}><strong className="font-extrabold">{s.value}</strong> {s.label}</span>)}
            </div>
          )}
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        <div className="w-full sm:w-fit">
          {view === "student" && <Segmented ariaLabel="Section" value={studentTab} onChange={keep(setStudentTab)} options={[...D.STUDENT_TABS]} grow />}
          {view === "volunteer" && <Segmented ariaLabel="Section" value={volunteerTab} onChange={keep(setVolunteerTab)} options={[...D.VOLUNTEER_TABS]} grow />}
          {view === "partner" && <Segmented ariaLabel="Section" value={partnerTab} onChange={keep(setPartnerTab)} options={[...D.PARTNER_TABS]} grow />}
        </div>
        <motion.div key={`${view}-${view === "student" ? studentTab : view === "volunteer" ? volunteerTab : partnerTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-[var(--space-6)]">
          {view === "student" && studentTab === "home" && <StudentHome go={setStudentTab} openProgram={setProgram} joined={joined} saves={saves} toggleSave={flip(setSaves)} openEvent={setEvent} />}
          {view === "student" && studentTab === "programs" && (
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
              {D.PROGRAMS.map((p) => <ProgramCard key={p.id} p={p} joined={!!joined[p.id]} onOpen={() => setProgram(p)} wide />)}
            </div>
          )}
          {view === "student" && studentTab === "ask" && <StudentAsk />}
          {view === "student" && studentTab === "events" && <StudentEvents saves={saves} toggleSave={flip(setSaves)} open={setEvent} />}

          {view === "volunteer" && volunteerTab === "today" && <VolunteerToday />}
          {view === "volunteer" && volunteerTab === "impact" && <VolunteerImpact onToast={onToast} />}

          {view === "partner" && partnerTab === "impact" && <PartnerImpact onToast={onToast} />}
          {view === "partner" && partnerTab === "programs" && <PartnerPrograms />}
        </motion.div>
      </SectionSurface>
    </ReportCtx.Provider>
    </OpenPro.Provider>
  );
}

// ——— Mentorship tab: the e-Mentorship sheet (no direct messages) ———

export function UnitedWayProgramSheet({ onClose, onInterested, interested }: { onClose: () => void; onInterested: () => void; interested: boolean }) {
  const P = D.MENTORSHIP_PROGRAM;
  return (
    <Sheet title={P.title} onClose={onClose} titleId="uw-mentorship-title" photo={P.photo} focus="50% 30%">
      <div className="-mt-[8px] flex items-center gap-[10px]">
        <Image src={D.BRAND.logo} alt="United Way" width={156} height={73} unoptimized className="h-[28px] w-auto rounded-[6px] bg-white px-[6px] py-[3px]" />
        <Eyebrow>{P.kind}</Eyebrow>
      </div>
      <p className="text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{P.line}</p>
      <Gets items={P.gets} />
      <div className="flex flex-wrap gap-x-[20px] gap-y-[8px]"><Fact icon={Calendar}>{P.when}</Fact><Fact icon={MapPin}>{P.where}</Fact></div>
      <NoMessages />
      <div className="flex flex-col gap-[8px]">
        <Eyebrow tone="var(--muted-foreground)">Workshops</Eyebrow>
        <ol className="grid grid-cols-2 gap-[8px] sm:grid-cols-3">
          {P.workshops.map((w) => (
            <li key={w.title} className="flex items-center gap-[10px] rounded-[var(--radius-md)] border p-[8px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <DateTile month={w.month} day={w.day} size="sm" />
              <span className="min-w-0 text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{w.title}</span>
            </li>
          ))}
        </ol>
      </div>
      <Proof {...P.proof} />
      <div className="pt-[4px]">{interested ? <Done text={`${D.PROGRAMS_UI.done}. ${D.PROGRAMS_UI.doneLine}`} /> : <PrimaryCta onClick={onInterested} style={SOLID}>{D.PROGRAMS_UI.interested}</PrimaryCta>}</div>
    </Sheet>
  );
}
