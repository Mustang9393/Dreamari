"use client";

// United Way · Student Success board (7 Oct 2026). Three views on one
// board, each the Connect role United Way's audience already maps to:
// Student (Home · Programs · Ask · Opportunities · People), Volunteer
// (Today · Questions · My Impact) and United Way (Impact in Global Results
// Framework vocabulary · Programs). Built from the same primitives as the
// AT&T board (banner, Segmented tabs, Panel, SectionSurface, MetricTile,
// AreaChart, the mentorship charts) so it reads as one family; every string
// lives in uwData.ts. Research and the reasoning: docs/reference/
// united-way-board-research-2026-10-07.md. No chapter picker: one global
// board, programs carry where they run. No direct messages for high school.

import Image from "next/image";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Download, Eye, Flag, Handshake, MapPin, MessagesSquare, ThumbsUp, Timer, Users, X, CheckCircle2, Briefcase, GraduationCap, Sparkles } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { studentAvatarSrc } from "@/lib/avatar";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { EmptyView } from "@/components/app/states";
import { Avatar, InlineAsk, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { AreaChart, MetricTile, Segmented, ruledCell } from "../viz";
import { BarChart, GoalTrack, Histogram, ShareBar } from "../mentorship/charts";
import { FollowButton, Panel, ProProfileView, RULE } from "../ProProfile";
import * as D from "./uwData";

const accent = D.UW.color;
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
const GOOD = "var(--world-food-farming-nature)";

// ——— small shared pieces (same shapes as the AT&T board) ———

function Eyebrow({ children, tone = accent }: { children: ReactNode; tone?: string }) {
  return <span className="block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}>{children}</span>;
}
function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] leading-[19px] ${className}`} style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}
function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>{children}</button>
  );
}
function Submitted({ text }: { text: string }) {
  return <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-bold" style={{ color: GOOD }}><CheckCircle2 className="h-4 w-4" aria-hidden /> {text}</span>;
}
function CountPill({ icon: Icon, count, on, onClick, label }: { icon: typeof ThumbsUp; count: number; on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} onClick={onClick} className="dm-quiet flex cursor-pointer items-center gap-[5px] rounded-full border px-[10px] py-[3px] text-[12.5px] leading-[17px] font-bold tabular-nums" style={{ borderColor: on ? `color-mix(in srgb, ${accent} 50%, transparent)` : "var(--glass-border)", background: on ? `color-mix(in srgb, ${accent} 14%, transparent)` : "transparent", color: on ? accent : "var(--muted-foreground)" }}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {count}
    </button>
  );
}
const ReportCtx = createContext<(what: string) => void>(() => {});
function ReportButton({ what }: { what: string }) {
  const report = useContext(ReportCtx);
  return (
    <IconTip label="Report">
      <button type="button" aria-label="Report" onClick={() => report(what)} className="dm-quiet flex size-[28px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><Flag className="h-3.5 w-3.5" aria-hidden /></button>
    </IconTip>
  );
}
const OpenPro = createContext<(id: string) => void>(() => {});
function ProLine({ id, size = 36 }: { id: string; size?: number }) {
  const pro = D.VOLUNTEERS[id];
  const openPro = useContext(OpenPro);
  if (!pro) return null;
  return (
    <button type="button" onClick={() => openPro(id)} className="dm-quiet flex w-fit cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] text-left">
      <Avatar name={pro.name} size={size} />
      <span className="min-w-0">
        <span className="flex items-center gap-[5px] text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={14} /></span>
        <span className="block truncate text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{pro.role} · {pro.org}</span>
      </span>
    </button>
  );
}

function Sheet({ title, label, onClose, children, titleId }: { title: string; label?: string; onClose: () => void; children: ReactNode; titleId: string }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[28px]" style={{ background: "rgba(5,7,15,0.6)" }} />
        <div className="dm-scroll relative z-[1] flex max-h-[calc(100dvh-96px)] w-full max-w-[520px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: `color-mix(in srgb, ${accent} 35%, var(--glass-border))`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${accent} 40%, transparent), 0 16px 48px -4px rgba(0,0,0,0.55)` }}>
          <IconTip label="Close" className="absolute top-[14px] right-[14px] z-10">
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
          </IconTip>
          <div className="flex flex-col gap-[6px] pr-[40px]">
            {label && <Eyebrow>{label}</Eyebrow>}
            <h2 id={titleId} className="text-[22px] leading-[27px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h2>
          </div>
          {children}
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

function DateTile({ month, day, size = "md" }: { month: string; day: number; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span aria-label={`${month} ${day}`} className={`flex flex-none flex-col items-center justify-center rounded-[var(--radius-sm)] border ${sm ? "h-[40px] w-[40px]" : "h-[48px] w-[48px]"}`} style={{ borderColor: `color-mix(in srgb, ${accent} 35%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 10%, var(--glass-surface-1))` }}>
      <span className={`${sm ? "text-[9px]" : "text-[10px]"} leading-none font-extrabold tracking-[0.08em] uppercase`} style={{ color: accent }}>{month}</span>
      <span className={`${sm ? "mt-[2px] text-[15px]" : "mt-[3px] text-[18px]"} leading-none font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{day}</span>
    </span>
  );
}
function StatusChip({ status, short = false }: { status: "open" | "soon" | "upcoming" | "returning"; short?: boolean }) {
  const U = D.OPPORTUNITY_UI;
  const live = status === "open";
  const tone = live ? GOOD : status === "soon" || status === "returning" ? "var(--world-business-money-office)" : "var(--muted-foreground)";
  const label = status === "returning" ? "Returning" : short ? U.short[status] : U.status[status];
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full px-[8px] py-[1px] text-[11px] leading-[15px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}>
      {live && <span aria-hidden className="size-[6px] rounded-full" style={{ background: tone }} />}{label}
    </span>
  );
}
function Chips<K extends string>({ options, value, onChange }: { options: readonly { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((o) => {
        const on = o.key === value;
        return <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(o.key)} className="dm-quiet cursor-pointer rounded-full border px-[11px] py-[4px] text-[12.5px] leading-[17px] font-semibold" style={{ borderColor: on ? `color-mix(in srgb, ${accent} 55%, transparent)` : "var(--glass-border)", background: on ? `color-mix(in srgb, ${accent} 16%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{o.label}</button>;
      })}
    </div>
  );
}
const KIND_ICON: Record<D.ProgramKind, typeof Handshake> = { mentorship: Handshake, work: Briefcase, college: GraduationCap, exposure: Sparkles };

// ——— Programs ———

function ProgramCard({ p, interested, onOpen }: { p: D.Program; interested: boolean; onOpen: () => void }) {
  const Icon = KIND_ICON[p.kind];
  return (
    <button type="button" onClick={onOpen} className="dm-tap group relative flex h-full w-full cursor-pointer flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
      <div className="flex items-center justify-between gap-[8px]">
        <span className="flex items-center gap-[6px]"><Icon className="h-3.5 w-3.5" aria-hidden style={{ color: accent }} /><Eyebrow tone="var(--muted-foreground)">{p.kindLabel}</Eyebrow></span>
        <StatusChip status={p.status} short />
      </div>
      <span className="text-[17px] leading-[22px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{p.title}</span>
      <Muted>{p.line}</Muted>
      <span className="mt-auto flex flex-wrap items-center gap-x-[10px] gap-y-[2px] pt-[4px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex items-center gap-[4px]"><MapPin className="h-3 w-3" aria-hidden /> {p.where}</span>
        {interested && <span className="flex items-center gap-[4px]" style={{ color: GOOD }}><CheckCircle2 className="h-3 w-3" aria-hidden /> {D.PROGRAMS_UI.interestedDone}</span>}
      </span>
      <ChevronRight className="absolute top-[14px] right-[14px] h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

function ProgramSheet({ p, interested, onInterested, onMentorship, onClose }: { p: D.Program; interested: boolean; onInterested: () => void; onMentorship: () => void; onClose: () => void }) {
  const U = D.PROGRAMS_UI;
  return (
    <Sheet title={p.title} label={`${p.kindLabel} · ${U.by} ${p.by}`} onClose={onClose} titleId="uw-program-title">
      <div className="flex flex-wrap items-center gap-[8px]"><StatusChip status={p.status} /><Muted>{p.statusLine}</Muted></div>
      <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{p.line}</p>
      <dl className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <div><dt><Eyebrow tone="var(--muted-foreground)">{U.who}</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{p.who}</dd></div>
        <div><dt><Eyebrow tone="var(--muted-foreground)">{U.when}</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{p.cadence}</dd></div>
        <div className="sm:col-span-2"><dt><Eyebrow tone="var(--muted-foreground)">{U.where}</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{p.where}</dd></div>
      </dl>
      <div>
        <Eyebrow tone="var(--muted-foreground)">{U.what}</Eyebrow>
        <ul className="mt-[6px] flex flex-col gap-[6px]">
          {p.what.map((w) => <li key={w} className="flex items-start gap-[8px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}><span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: accent }} />{w}</li>)}
        </ul>
      </div>
      {p.proof && (
        <div className="rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 8%, var(--glass-surface-1))` }}>
          <Eyebrow>{U.proof}</Eyebrow>
          <p className="mt-[4px] text-[13.5px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>{p.proof}</p>
        </div>
      )}
      {p.kind === "mentorship" && <Muted>{D.HOME.mentoring.note}</Muted>}
      <div className="flex flex-wrap items-center gap-[10px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
        {interested ? <Submitted text={`${U.interestedDone} · ${U.interestedLine}`} /> : <PrimaryCta onClick={onInterested} style={{ background: accent, color: "#fff" }}>{U.interested}</PrimaryCta>}
        {p.mentorshipId && <QuietCta onClick={onMentorship}>{U.openMentorship}</QuietCta>}
      </div>
    </Sheet>
  );
}

function StudentPrograms({ interest, setInterest, openProgram, filter, setFilter }: { interest: Record<string, boolean>; setInterest: (id: string) => void; openProgram: (p: D.Program) => void; filter: D.ProgramFilter; setFilter: (f: D.ProgramFilter) => void }) {
  void setInterest;
  const list = D.PROGRAMS.filter((p) => filter === "all" || p.kind === filter);
  return (
    <>
      <div>
        <SectionHead>{D.PROGRAMS_UI.title}</SectionHead>
        <Muted className="mt-[2px]">{D.PROGRAMS_UI.sub}</Muted>
      </div>
      <Chips options={D.PROGRAMS_UI.kinds} value={filter} onChange={setFilter} />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <ProgramCard key={p.id} p={p} interested={!!interest[p.id]} onOpen={() => openProgram(p)} />)}
      </div>
    </>
  );
}

// ——— Opportunities ———

function OppCard({ o, saved, onSave, onOpen, showKind = true }: { o: D.UwOpportunity; saved: boolean; onSave: () => void; onOpen: () => void; showKind?: boolean }) {
  const U = D.OPPORTUNITY_UI;
  return (
    <div className="dm-tap group relative flex h-full flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {o.title}</span></button>
      <div className="flex items-start justify-between gap-[8px]">
        {o.date ? <DateTile month={o.date.month} day={o.date.day} size="sm" /> : <span className="flex h-[40px] items-center"><StatusChip status={o.status} short /></span>}
        <span className="flex items-center gap-[6px]">{showKind && <Eyebrow tone="var(--muted-foreground)">{o.kind}</Eyebrow>}{o.date && <StatusChip status={o.status} short />}</span>
      </div>
      <span className="text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{o.title}</span>
      <Muted>{o.line}</Muted>
      <div className="relative z-20 mt-auto flex items-center justify-between gap-[8px] pt-[4px]">
        <span className="flex items-center gap-[4px] text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><Users className="h-3 w-3" aria-hidden /> {o.interested} {U.interested}</span>
        <span className="flex items-center gap-[6px]">
          {o.deadline && <span className="inline-flex items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold whitespace-nowrap" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}><Clock className="h-3 w-3" aria-hidden /> {U.closes} {o.deadline.month} {o.deadline.day}</span>}
          <QuietCta size="sm" done={saved} onClick={onSave}>{saved ? U.saved : U.save}</QuietCta>
        </span>
      </div>
    </div>
  );
}

function OppSheet({ o, saved, onSave, inPlan, onPlan, onClose }: { o: D.UwOpportunity; saved: boolean; onSave: () => void; inPlan: boolean; onPlan: () => void; onClose: () => void }) {
  const U = D.OPPORTUNITY_UI;
  return (
    <Sheet title={o.title} label={`${o.kind} · ${U.by} ${o.by}`} onClose={onClose} titleId="uw-opportunity-title">
      <div className="flex flex-wrap items-center gap-[10px]">
        {o.date && <DateTile month={o.date.month} day={o.date.day} />}
        <div className="flex flex-col gap-[4px]">
          <StatusChip status={o.status} />
          {o.date?.time && <Muted>{o.date.time}</Muted>}
          {o.deadline && <Muted>{U.closes} {o.deadline.month} {o.deadline.day}</Muted>}
        </div>
      </div>
      <div><Eyebrow tone="var(--muted-foreground)">{U.about}</Eyebrow><p className="mt-[4px] text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>{o.about}</p></div>
      <dl className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <div><dt><Eyebrow tone="var(--muted-foreground)">{U.who}</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{o.who}</dd></div>
        <div><dt><Eyebrow tone="var(--muted-foreground)">{U.where}</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{o.where}</dd></div>
      </dl>
      <Muted>{U.note}</Muted>
      <div className="flex flex-wrap items-center gap-[10px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
        <PrimaryCta onClick={onPlan} style={{ background: inPlan ? GOOD : accent, color: "#fff" }}>{inPlan ? U.inPlan : U.addPlan}</PrimaryCta>
        <QuietCta done={saved} onClick={onSave}>{saved ? U.saved : U.save}</QuietCta>
      </div>
    </Sheet>
  );
}

function StudentOpportunities({ saves, toggleSave, open }: { saves: Record<string, boolean>; toggleSave: (id: string) => void; open: (o: D.UwOpportunity) => void }) {
  const [filter, setFilter] = useState<D.OpportunityFilter>("all");
  const keep = (o: D.UwOpportunity) => filter === "all" || (filter === "virtual" ? o.virtual : !o.virtual);
  const groups = D.OPPORTUNITY_UI.groups.map((g) => ({ g, items: D.OPPORTUNITIES.filter((o) => g.kinds.includes(o.kind) && keep(o)) })).filter((x) => x.items.length > 0);
  return (
    <>
      <div className="flex flex-wrap items-center gap-[10px]">
        <Eyebrow tone="var(--muted-foreground)">Where</Eyebrow>
        <Chips options={D.OPPORTUNITY_UI.filters} value={filter} onChange={setFilter} />
      </div>
      {groups.length === 0 && <EmptyView tier={5} query={D.OPPORTUNITY_UI.filters.find((f) => f.key === filter)?.label ?? filter} line="Try All to see every opportunity." cta="Show all" onAction={() => setFilter("all")} />}
      {groups.map(({ g, items }) => (
        <section key={g.title} className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>{g.title}</SectionHead>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
            {items.map((o) => <OppCard key={o.id} o={o} saved={!!saves[o.id]} onSave={() => toggleSave(o.id)} onOpen={() => open(o)} showKind={new Set(items.map((i) => i.kind)).size > 1} />)}
          </div>
        </section>
      ))}
    </>
  );
}

// ——— Ask and People ———

function StudentAsk() {
  const [asked, setAsked] = useState(false);
  const [open, setOpen] = useState<string>();
  const [more, setMore] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const shown = more ? D.RECENT_ANSWERS : D.RECENT_ANSWERS.slice(0, 2);
  return (
    <>
      <Panel id="uw-ask-title" title={D.ASK.eyebrow}>
        {asked ? (
          <div className="flex flex-col gap-[8px]"><Submitted text={D.ASK.submitted} /><LinkButton onClick={() => setAsked(false)}>{D.ASK.again}</LinkButton></div>
        ) : (
          <InlineAsk joined defaultOpen accent={accent} placeholder={D.ASK.placeholder} onPost={() => setAsked(true)} />
        )}
      </Panel>
      <Panel id="uw-answers-title" title={D.ASK.answersEyebrow}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {shown.map((item) => {
            const isOpen = open === item.id;
            return (
              <li key={item.id} className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
                <h3 className="text-[16px] leading-[22px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.question}</h3>
                <ProLine id={item.pro} size={32} />
                {isOpen && <blockquote className="border-l-2 pl-[12px] text-[14.5px] leading-[21px]" style={{ borderColor: accent, color: "var(--foreground)" }}>{item.answer}</blockquote>}
                <div className="mt-auto flex items-center gap-[var(--space-3)] pt-[2px]">
                  <CountPill icon={ThumbsUp} count={item.helpful + (liked[item.id] ? 1 : 0)} on={!!liked[item.id]} onClick={() => setLiked((m) => ({ ...m, [item.id]: !m[item.id] }))} label={D.ASK.like} />
                  <CountPill icon={MessagesSquare} count={item.comments} on={false} onClick={() => setOpen(item.id)} label={D.ASK.comment} />
                  <span className="ml-auto flex items-center gap-[4px]"><ReportButton what={`answer ${item.id}`} /><LinkButton onClick={() => setOpen(isOpen ? undefined : item.id)}>{isOpen ? D.ASK.hide : D.ASK.read} <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden /></LinkButton></span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <LinkButton onClick={() => setMore((v) => !v)}>{more ? D.ASK.less : <>{D.ASK.more} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
        </div>
      </Panel>
    </>
  );
}

function StudentPeople({ follows, toggleFollow }: { follows: Record<string, boolean>; toggleFollow: (id: string) => void }) {
  const openPro = useContext(OpenPro);
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div><SectionHead>{D.PEOPLE.title}</SectionHead><Muted className="mt-[2px]">{D.PEOPLE.sub}</Muted></div>
      {D.PEOPLE.rows.map((row) => (
        <section key={row.title} className="flex flex-col gap-[var(--space-4)]">
          <Eyebrow tone="var(--muted-foreground)">{row.title}</Eyebrow>
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4">
            {row.pros.map((id) => {
              const pro = D.VOLUNTEERS[id];
              if (!pro) return null;
              return (
                <div key={id} className="dm-tap group relative flex flex-col items-center gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-center" style={ITEM}>
                  <button type="button" onClick={() => openPro(id)} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {pro.name}</span></button>
                  <Avatar name={pro.name} size={56} />
                  <span className="mt-[4px] flex items-center gap-[5px] text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={14} /></span>
                  <span className="max-w-full truncate text-[12.5px] leading-[17px]" title={`${pro.role} · ${pro.org}`} style={{ color: "var(--muted-foreground)" }}>{pro.role} · {pro.org}</span>
                  <span className="text-[12px] leading-[16px] font-bold tabular-nums" style={{ color: accent }}>{D.ANSWER_COUNTS[id]} {D.PEOPLE.answers}</span>
                  <FollowButton compact following={!!follows[id]} onToggle={() => toggleFollow(id)} className="relative z-20 mt-[8px] w-full" tone={{ background: accent, color: "#FFFFFF" }} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <Muted>{D.VOLUNTEER_LINE}</Muted>
    </div>
  );
}

// ——— Student Home ———

function useStudentState(): string {
  return useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot).states[0] ?? "";
}
function useStudentWorlds(): string[] {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return picks.ids.map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.world).filter((w): w is string => !!w);
}

function StudentHome({ go, openProgram, interest, saves, toggleSave, openOpp }: { go: (tab: typeof D.STUDENT_TABS[number]["key"]) => void; openProgram: (p: D.Program) => void; interest: Record<string, boolean>; saves: Record<string, boolean>; toggleSave: (id: string) => void; openOpp: (o: D.UwOpportunity) => void }) {
  const H = D.HOME;
  const worlds = useStudentWorlds();
  const state = useStudentState();
  const forYou = [...D.OPPORTUNITIES].sort((a, b) => Number(!!b.world && worlds.includes(b.world)) - Number(!!a.world && worlds.includes(a.world))).slice(0, 4);
  const openPrograms = D.PROGRAMS.filter((p) => p.status === "open").slice(0, 3);
  const ementorship = D.PROGRAMS.find((p) => p.id === "uw-ementorship")!;
  return (
    <>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 18%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}>
          <Eyebrow>{H.theme.eyebrow}</Eyebrow>
          <h3 className="text-[22px] leading-[27px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{H.theme.title}</h3>
          <p className="max-w-[52ch] text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{H.theme.line}</p>
          <PrimaryCta size="sm" className="w-fit" style={{ background: accent, color: "#fff" }} onClick={() => go("ask")}>{H.theme.cta}</PrimaryCta>
        </div>
        <button type="button" onClick={() => openProgram(ementorship)} className="dm-tap flex cursor-pointer flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={ITEM}>
          <span className="flex items-center gap-[6px]"><Handshake className="h-3.5 w-3.5" aria-hidden style={{ color: accent }} /><Eyebrow tone="var(--muted-foreground)">{H.mentoring.eyebrow}</Eyebrow></span>
          <span className="text-[18px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{H.mentoring.title}</span>
          <Muted>{H.mentoring.line}</Muted>
          <span className="mt-auto flex items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>{H.mentoring.cta} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></span>
        </button>
      </div>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{H.programsTitle}</SectionHead>
          <LinkButton onClick={() => go("programs")}>{H.programsSeeAll} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          {openPrograms.map((p) => <ProgramCard key={p.id} p={p} interested={!!interest[p.id]} onOpen={() => openProgram(p)} />)}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{H.opportunitiesTitle}</SectionHead>
          <LinkButton onClick={() => go("opportunities")}>{D.OPPORTUNITY_UI.seeAll} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          {forYou.map((o) => <OppCard key={o.id} o={o} saved={!!saves[o.id]} onSave={() => toggleSave(o.id)} onOpen={() => openOpp(o)} />)}
        </div>
        <Muted>{state ? H.nearYou.line.replace("{state}", state) : "Set your state in Build and opportunities near you come first."}</Muted>
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{H.answersTitle}</SectionHead>
          <LinkButton onClick={() => go("ask")}>{H.answersSeeAll} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {D.RECENT_ANSWERS.slice(0, 2).map((item) => (
            <li key={item.id} className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
              <h3 className="text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.question}</h3>
              <ProLine id={item.pro} size={32} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// ——— Volunteer ———

function AnswerForm({ id, placeholder, submit, onDone }: { id: string; placeholder: string; submit: string; onDone: () => void }) {
  const [text, setText] = useState("");
  return (
    <form className="flex flex-col gap-[8px]" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onDone(); }}>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <textarea id={id} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="w-full rounded-[var(--radius-md)] border px-[14px] py-[11px] text-[14.5px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
      <div className="flex justify-end"><PrimaryCta size="sm" disabled={!text.trim()} style={{ background: accent, color: "#fff" }} onClick={() => { if (text.trim()) onDone(); }}>{submit}</PrimaryCta></div>
    </form>
  );
}

function VolunteerToday({ go }: { go: (tab: typeof D.VOLUNTEER_TABS[number]["key"]) => void }) {
  const T = D.VOLUNTEER_TODAY;
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  return (
    <>
      <Panel id="uw-since-title" title={T.since.title}>
        <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
          {T.since.items.map((it) => (
            <li key={it.text} style={{ borderColor: RULE }}>
              <button type="button" onClick={() => go(it.go)} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] py-[10px] text-left text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{it.text} <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} /></button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel id="uw-requests-title" title={T.title} aside={<Muted>{T.sub}</Muted>}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {T.requests.map((r) => {
            const on = !!accepted[r.id];
            return (
              <li key={r.id} className="flex flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
                <div className="flex items-center justify-between gap-[8px]">
                  <Eyebrow tone="var(--muted-foreground)">{r.kind}</Eyebrow>
                  <span className="flex items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold tabular-nums" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}><Timer className="h-3 w-3" aria-hidden /> {r.minutes} {T.minutes}</span>
                </div>
                <span className="text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.title}</span>
                <Muted>{r.why}</Muted>
                <div className="mt-auto pt-[4px]">{on ? <Submitted text={`${T.accepted} · ${T.acceptedLine}`} /> : <PrimaryCta size="sm" className="w-fit" style={{ background: accent, color: "#fff" }} onClick={() => setAccepted((m) => ({ ...m, [r.id]: true }))}>{T.accept}</PrimaryCta>}</div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

function VolunteerQuestions() {
  const Q = D.VOLUNTEER_QUESTIONS;
  const [more, setMore] = useState(false);
  const [openIdx, setOpenIdx] = useState<number>();
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const shown = more ? Q.items : Q.items.slice(0, 2);
  return (
    <>
      <Panel id="uw-waiting-title" title={Q.title} aside={<Muted>{Q.sub}</Muted>}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {shown.map((question, i) => (
            <li key={question} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
              <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                <span className="min-w-0 flex-1 text-[15.5px] leading-[21px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{question}</span>
                {sent[i] ? <Submitted text={Q.live} /> : <PrimaryCta size="sm" style={{ background: accent, color: "#fff" }} onClick={() => setOpenIdx(openIdx === i ? undefined : i)}>{Q.answer}</PrimaryCta>}
              </div>
              {openIdx === i && !sent[i] && <AnswerForm id={`uw-waiting-${i}`} placeholder={Q.placeholder} submit={Q.send} onDone={() => { setSent((s) => ({ ...s, [i]: true })); setOpenIdx(undefined); }} />}
            </li>
          ))}
        </ul>
        <div className="border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <LinkButton onClick={() => setMore((v) => !v)}>{more ? Q.fewer : <>{Q.more} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
        </div>
      </Panel>
      <Panel id="uw-your-answers-title" title={Q.yours.title} aside={<Muted>{Q.yours.summary}</Muted>}>
        <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
          {Q.yours.items.map((a) => (
            <li key={a.question} className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[4px] py-[10px]" style={{ borderColor: RULE }}>
              <span className="min-w-0 flex-1 text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{a.question}</span>
              <span className="flex items-center gap-[12px] text-[12.5px] leading-[17px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-[4px]"><Eye className="h-3.5 w-3.5" aria-hidden /> {a.reads}</span>
                <span className="flex items-center gap-[4px]"><ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {a.helpful}</span>
                <span>{a.when}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

const IMPACT_ICONS = [Clock, MessagesSquare, Users, Handshake];
function VolunteerImpact({ onToast }: { onToast: (t: string) => void }) {
  const M = D.MY_IMPACT;
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
        <div><SectionHead>{M.title}</SectionHead><Muted className="mt-[2px]">{M.sub}</Muted></div>
        <QuietCta size="sm" onClick={() => onToast(M.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {M.export}</QuietCta>
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {M.tiles.map((tile, i) => (
            <div key={tile.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}><MetricTile icon={IMPACT_ICONS[i]} value={tile.value} label={tile.label} accent={accent} /></div>
          ))}
        </div>
      </SectionSurface>
      <Panel id="uw-goal-title" title={M.goal.eyebrow}>
        <GoalTrack logged={M.goal.logged} target={M.goal.target} pace={M.goal.pace} accent={accent} unit={M.goal.unit} />
        <Muted>{M.goal.line}</Muted>
      </Panel>
      <Panel id="uw-hours-title" title={M.hoursEyebrow}>
        <BarChart values={M.hours} labels={M.months} accent={accent} highlight={M.hours.length - 1} height={150} unit="hours" ariaLabel="Volunteer hours by month" />
      </Panel>
      <Panel id="uw-students-title" title={M.studentsEyebrow}>
        <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
          {M.students.map((s) => (
            <li key={s.name} className="flex items-center gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={ITEM}>
              <Avatar name={s.name} size={36} photo={studentAvatarSrc(s.name)} />
              <span className="min-w-0 flex-1"><span className="block truncate text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span><Muted>{s.what}</Muted></span>
              <span className="flex-none text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.when}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}

// ——— United Way (partner) ———

const TILE_ICONS = [Users, GraduationCap, Handshake, Clock, Briefcase, Sparkles];
function IndicatorRow({ label, value, goal, last, unit = "" }: { label: string; value: number; goal: number; last: number; unit?: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const tick = Math.min(100, Math.round((last / goal) * 100));
  const fmt = (n: number) => `${n.toLocaleString()}${unit}`;
  return (
    <li className="flex flex-col gap-[5px]">
      <span className="flex items-baseline justify-between gap-[12px] text-[13.5px] leading-[18px]">
        <span className="min-w-0 truncate font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
        <span className="flex-none font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{fmt(value)} <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>of {fmt(goal)}</span></span>
      </span>
      <span className="relative block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} aria-hidden>
        <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 45%, transparent), ${accent})` }} />
        <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${tick}% - 1px)`, background: "var(--foreground)", opacity: 0.6 }} title={`Last year ${fmt(last)}`} />
      </span>
    </li>
  );
}

function PartnerImpact({ onToast }: { onToast: (t: string) => void }) {
  const I = D.IMPACT;
  const [range, setRange] = useState<"month" | "year">("year");
  const [metric, setMetric] = useState<string>(I.trend.metrics[0].key);
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div><SectionHead>{I.title}</SectionHead><Muted className="mt-[2px]">{I.sub}</Muted></div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <Segmented ariaLabel="Range" value={range} onChange={setRange} options={[...I.range]} />
          <QuietCta size="sm" onClick={() => onToast(I.exported)}><Download className="h-3.5 w-3.5" aria-hidden /> {I.export}</QuietCta>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 16%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}>
        <div className="flex flex-col gap-[6px]">
          <Eyebrow>{I.outcome.eyebrow} · {range === "month" ? I.range[0].label : I.range[1].label}</Eyebrow>
          <span className="text-[44px] leading-[48px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{I.outcome.value}</span>
          <p className="max-w-[34ch] text-[14.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{I.outcome.line}</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <Eyebrow tone="var(--muted-foreground)">{I.outcome.funnelLabel}</Eyebrow>
          <Histogram values={I.outcome.funnel.map((f) => f.value)} labels={I.outcome.funnel.map((f) => f.label)} accent={accent} height={110} ariaLabel={I.outcome.funnelLabel} />
        </div>
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-3">
          {I.tiles.map((tile, i) => (
            <div key={tile.key} className={`p-[var(--space-4)] ${ruledCell(i, 3)}`} style={{ borderColor: RULE }}><MetricTile icon={TILE_ICONS[i]} value={range === "month" ? tile.month : tile.year} label={tile.label} accent={accent} /></div>
          ))}
        </div>
      </SectionSurface>
      <Panel id="uw-grf-title" title={I.indicators.eyebrow} aside={<Muted>{I.indicators.note}</Muted>}>
        <ul className="flex flex-col gap-[14px]">{I.indicators.rows.map((r) => <IndicatorRow key={r.label} {...r} />)}</ul>
      </Panel>
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
        <Panel id="uw-takepart-title" title={I.takePart.eyebrow}><ShareBar parts={I.takePart.parts} accent={accent} /><Muted>{I.takePart.note}</Muted></Panel>
        <Panel id="uw-volunteers-title" title={I.volunteers.eyebrow}><ShareBar parts={I.volunteers.parts} accent={accent} /><Muted>{I.volunteers.note}</Muted></Panel>
        <Panel id="uw-hoursgoal-title" title={I.goal.eyebrow}><GoalTrack logged={I.goal.logged} target={I.goal.target} pace={I.goal.pace} accent={accent} unit={I.goal.unit} /></Panel>
      </div>
      <Panel id="uw-safety-title" title={D.SAFETY.eyebrow} aside={<Muted>{D.SAFETY.note}</Muted>}>
        <dl className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
          {D.SAFETY.rows.map((r) => (
            <div key={r.label} className="flex flex-col gap-[2px]">
              <dt className="text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{r.label}</dt>
              <dd className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.value}</dd>
              <dd className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{r.sub}</dd>
            </div>
          ))}
        </dl>
      </Panel>
      <Panel id="uw-trend-title" title={I.trend.metrics.find((m) => m.key === metric)?.label ?? ""} aside={<Segmented ariaLabel={I.trend.eyebrow} value={metric} onChange={setMetric} options={I.trend.metrics.map((m) => ({ key: m.key, label: m.label }))} />}>
        <AreaChart points={I.trend.series[metric]} accent={accent} height={170} labels={[I.trend.months[0], I.trend.months[3], I.trend.months[5]]} />
      </Panel>
    </section>
  );
}

function PartnerPrograms() {
  const P = D.PARTNER_PROGRAMS;
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div><SectionHead>{P.title}</SectionHead><Muted className="mt-[2px]">{P.sub}</Muted></div>
      <SectionSurface className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[14px]">
          <thead><tr>{P.columns.map((c, i) => <th key={c} className={`px-[var(--space-4)] py-[10px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase ${i === 0 ? "text-left" : "text-right"} ${i === P.columns.length - 1 ? "text-left" : ""}`} style={{ color: "var(--muted-foreground)", borderBottom: `1px solid ${RULE}` }}>{c}</th>)}</tr></thead>
          <tbody>
            {P.rows.map((r) => (
              <tr key={r.program} style={{ borderBottom: `1px solid ${RULE}` }}>
                <td className="px-[var(--space-4)] py-[12px]"><span className="block font-bold" style={{ color: "var(--foreground)" }}>{r.program}</span><span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{r.by}</span></td>
                <td className="px-[var(--space-4)] py-[12px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.students}</td>
                <td className="px-[var(--space-4)] py-[12px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.volunteers}</td>
                <td className="px-[var(--space-4)] py-[12px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.hours}</td>
                <td className="px-[var(--space-4)] py-[12px] text-left"><StatusChip status={/^Open/.test(r.status) ? "open" : /Returning/.test(r.status) ? "returning" : "soon"} /> <span className="ml-[6px] text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{r.status.replace(/^Open$/, "")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionSurface>
    </section>
  );
}

// ——— the demo switch and the board ———

function DemoViewSwitch({ view, onPick }: { view: D.UwView; onPick: (view: D.UwView) => void }) {
  const [open, setOpen] = useState(view !== "student");
  return (
    <div className="flex min-w-0 items-center justify-end gap-[10px]">
      <button type="button" aria-expanded={open} aria-controls="uw-demo-views" onClick={() => setOpen((v) => !v)} className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Demo</button>
      {open && (
        <div id="uw-demo-views" role="tablist" aria-label="Show this board as" className="flex min-w-0 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          {D.VIEWS.map((o) => {
            const on = o.key === view;
            return <button key={o.key} type="button" role="tab" aria-selected={on} onClick={() => onPick(o.key)} className="dm-quiet flex min-h-[28px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: on ? "var(--glass-surface-2)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>{o.label.replace(/ View$/, "")}</button>;
          })}
        </div>
      )}
    </div>
  );
}

export function UnitedWayBoardView({ onBack, backLabel = D.BACK }: { onBack: () => void; backLabel?: string }) {
  // the board hands off to the Mentorship tab with the United Way program open
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
  const [opp, setOpp] = useState<D.UwOpportunity>();
  const [filter, setFilter] = useState<D.ProgramFilter>("all");
  const [interest, setInterest] = useState<Record<string, boolean>>({});
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const toggle = (set: (f: (m: Record<string, boolean>) => Record<string, boolean>) => void) => (id: string) => set((m) => ({ ...m, [id]: !m[id] }));
  const ink = "#f6f5fb";

  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    const tabs = view === "student" ? D.STUDENT_TABS : view === "volunteer" ? D.VOLUNTEER_TABS : D.PARTNER_TABS;
    const key = view === "student" ? studentTab : view === "volunteer" ? volunteerTab : partnerTab;
    const tab = (tabs as readonly { key: string; label: string }[]).find((t) => t.key === key);
    return <ProProfileView key={pro.id} pro={pro} follows={follows} onFollow={() => toggle(setFollows)(profile)} onBack={() => setProfile(undefined)} backLabel={`Back to ${!tab || tab.key === "home" ? "United Way" : tab.label}`} />;
  }

  return (
    <OpenPro.Provider value={setProfile}>
    <ReportCtx.Provider value={setReportFor}>
      {reportFor && (
        <Sheet title={D.REPORT.title} label={D.REPORT.label} onClose={() => setReportFor(undefined)} titleId="uw-report-title">
          <Muted>{D.REPORT.note}</Muted>
          <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.REPORT.reasons.map((r) => (
              <li key={r} style={{ borderColor: RULE }}>
                <button type="button" onClick={() => { setReportFor(undefined); onToast(D.REPORT.sent); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between py-[12px] text-left text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{r} <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} /></button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
      {program && <ProgramSheet p={program} interested={!!interest[program.id]} onInterested={() => { setInterest((m) => ({ ...m, [program.id]: true })); onToast(D.PROGRAMS_UI.interestedDone); }} onMentorship={() => { setProgram(undefined); onOpenMentorship(); }} onClose={() => setProgram(undefined)} />}
      {opp && <OppSheet o={opp} saved={!!saves[opp.id]} onSave={() => toggle(setSaves)(opp.id)} inPlan={!!plan[opp.id]} onPlan={() => { toggle(setPlan)(opp.id); onToast(plan[opp.id] ? "Removed from My Plan" : "Added to My Plan"); }} onClose={() => setOpp(undefined)} />}
      {toast}

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</button>
        <DemoViewSwitch key={view} view={view} onPick={setView} />
      </div>

      {/* the same identity banner as every board, in United Way blue; the
         mark is a text lockup until the published file lands */}
      <section aria-label="Community overview" className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)] sm:min-h-[300px] sm:px-[var(--space-8)] sm:py-[var(--space-6)]" style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`, fontFamily: "var(--font-display)", boxShadow: `0 30px 90px -34px color-mix(in srgb, ${accent} 40%, transparent), 0 18px 44px -22px rgba(0,0,0,0.65)`, textShadow: CARD_TEXT_SHADOW }}>
        <Image src={D.UW.cover} alt="" fill sizes="1280px" className="object-cover" style={{ objectPosition: "50% 35%" }} />
        <CardProgressiveBlur size="64%" />
        <span aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(70% 60% at 100% 0, color-mix(in srgb, ${accent} 22%, transparent), transparent 70%), linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.6) 40%, rgba(12,16,35,0.18) 70%, transparent 100%), ${cardTopScrim()}` }} />
        <span className="absolute top-[var(--space-5)] right-[var(--space-6)] z-10 flex items-center gap-[8px] rounded-full border px-[12px] py-[6px] text-[13px] font-extrabold tracking-[0.02em] sm:top-[var(--space-6)] sm:right-[var(--space-8)]" style={{ borderColor: "rgba(255,255,255,0.35)", background: "rgba(12,16,35,0.55)", color: ink, backdropFilter: "blur(8px)" }}><span aria-hidden className="size-[8px] rounded-full" style={{ background: accent }} />United Way</span>
        <div className="relative z-10 min-w-0 pr-[84px] sm:pr-[130px]">
          <span className="text-[11.5px] leading-[15px] font-extrabold tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${accent} 60%, ${ink})` }}>{D.UW.eyebrow}</span>
          <h1 className="mt-[6px] text-[24px] leading-[28px] font-extrabold text-balance sm:text-[34px] sm:leading-[38px]" style={{ color: ink }}>{D.UW.name}</h1>
          <p className="mt-[8px] max-w-[62ch] text-[14px] leading-[20px] font-semibold" style={{ color: `color-mix(in srgb, ${ink} 82%, transparent)`, fontFamily: "var(--font-body)" }}>{D.UW.about}</p>
        </div>
        <div className="relative z-10 mt-[var(--space-4)] flex w-full flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] border-t pt-[10px] text-[13px] leading-[18px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${ink} 18%, transparent)`, color: `color-mix(in srgb, ${ink} 62%, transparent)` }}>
          {D.UW.stats.map((s, i) => <span key={s.label}>{i > 0 && <span className="mr-[var(--space-3)]">·</span>}<strong className="font-extrabold" style={{ color: `color-mix(in srgb, ${ink} 90%, transparent)` }}>{s.value}</strong> {s.label}</span>)}
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        <div className="w-full sm:w-fit">
          {view === "student" && <Segmented ariaLabel="Student section" value={studentTab} onChange={keep(setStudentTab)} options={[...D.STUDENT_TABS]} grow />}
          {view === "volunteer" && <Segmented ariaLabel="Volunteer section" value={volunteerTab} onChange={keep(setVolunteerTab)} options={[...D.VOLUNTEER_TABS]} grow />}
          {view === "partner" && <Segmented ariaLabel="United Way section" value={partnerTab} onChange={keep(setPartnerTab)} options={[...D.PARTNER_TABS]} grow />}
        </div>
        <motion.div key={`${view}-${view === "student" ? studentTab : view === "volunteer" ? volunteerTab : partnerTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-[var(--space-6)]">
          {view === "student" && studentTab === "home" && <StudentHome go={setStudentTab} openProgram={setProgram} interest={interest} saves={saves} toggleSave={toggle(setSaves)} openOpp={setOpp} />}
          {view === "student" && studentTab === "programs" && <StudentPrograms interest={interest} setInterest={() => {}} openProgram={setProgram} filter={filter} setFilter={setFilter} />}
          {view === "student" && studentTab === "ask" && <StudentAsk />}
          {view === "student" && studentTab === "opportunities" && <StudentOpportunities saves={saves} toggleSave={toggle(setSaves)} open={setOpp} />}
          {view === "student" && studentTab === "people" && <StudentPeople follows={follows} toggleFollow={toggle(setFollows)} />}

          {view === "volunteer" && volunteerTab === "today" && <VolunteerToday go={setVolunteerTab} />}
          {view === "volunteer" && volunteerTab === "questions" && <VolunteerQuestions />}
          {view === "volunteer" && volunteerTab === "impact" && <VolunteerImpact onToast={onToast} />}

          {view === "partner" && partnerTab === "impact" && <PartnerImpact onToast={onToast} />}
          {view === "partner" && partnerTab === "programs" && <PartnerPrograms />}
        </motion.div>
      </SectionSurface>
    </ReportCtx.Provider>
    </OpenPro.Provider>
  );
}

// ——— Mentorship tab: the United Way program sheet (no direct messages) ———

export function UnitedWayProgramSheet({ onClose, onInterested, interested }: { onClose: () => void; onInterested: () => void; interested: boolean }) {
  const P = D.MENTORSHIP_PROGRAM;
  return (
    <Sheet title={`${P.company} · ${P.title}`} label={`${P.kind} · ${P.meta}`} onClose={onClose} titleId="uw-mentorship-title">
      <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{P.line}</p>
      <dl className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <div><dt><Eyebrow tone="var(--muted-foreground)">Run by</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{P.by}</dd></div>
        <div><dt><Eyebrow tone="var(--muted-foreground)">Who it&apos;s for</Eyebrow></dt><dd className="mt-[4px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{P.who}</dd></div>
      </dl>
      <div>
        <Eyebrow tone="var(--muted-foreground)">How it works</Eyebrow>
        <ul className="mt-[6px] flex flex-col gap-[6px]">{P.how.map((h) => <li key={h} className="flex items-start gap-[8px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}><span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: accent }} />{h}</li>)}</ul>
      </div>
      <div className="rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 8%, var(--glass-surface-1))` }}>
        <div className="flex items-center justify-between gap-[8px]"><Eyebrow>{P.messages.title}</Eyebrow><span className="rounded-full px-[8px] py-[1px] text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>{P.messages.tag}</span></div>
        <p className="mt-[4px] text-[13.5px] leading-[19px]" style={{ color: "var(--foreground)" }}>{P.messages.line}</p>
      </div>
      <div>
        <Eyebrow tone="var(--muted-foreground)">Workshops</Eyebrow>
        <ol className="mt-[8px] flex flex-col divide-y" style={{ borderColor: RULE }}>
          {P.workshops.map((w) => (
            <li key={w.title} className="flex items-center gap-[12px] py-[8px]" style={{ borderColor: RULE }}>
              <DateTile month={w.month} day={w.day} size="sm" />
              <span className="min-w-0"><span className="block text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{w.title}</span><Muted>{w.line}</Muted></span>
            </li>
          ))}
        </ol>
      </div>
      <Muted>{P.proof}</Muted>
      <div className="flex flex-wrap items-center gap-[10px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
        {interested ? <Submitted text={`${P.done} · ${P.doneLine}`} /> : <PrimaryCta onClick={onInterested} style={{ background: accent, color: "#fff" }}>{P.cta}</PrimaryCta>}
      </div>
    </Sheet>
  );
}
