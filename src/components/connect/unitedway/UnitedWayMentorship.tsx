"use client";

// United Way e-Mentorship in the Mentorship tab (7 Oct 2026). Chandu: "an
// I'm interested model in the community board where I mark my interest and
// can fully explore the mentorship in Mentorship like we have for Coach. But
// make it make sense." Same shape as the Coach program (banner, Demo switch
// for Student / Mentor / United Way, Home and Year plan) with the high
// school rule baked in: no direct messages, ever. The student's path is one
// visible line of four steps, and the page shows only what fits the step
// they are on:
//   not joined  → what you get, who mentors, how it stays safe, workshops
//   interested  → three quick questions
//   applied     → "matching is next", prep while you wait
//   matched     → your mentor, the next meeting the program lead set up,
//                 your goals, the year plan
// The stage lives in src/lib/uwMentorship.ts, shared with the board.

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, Handshake, MessageSquareOff, ShieldCheck, Users, Video, Briefcase } from "lucide-react";
import { CARD_TEXT_SHADOW } from "@/components/app/cardChrome";
import { setUwStage, useUwMentorship, type UwStage } from "@/lib/uwMentorship";
import { Avatar, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { MetricTile, Ring, Segmented, ruledCell } from "../viz";
import { Panel, ProProfileView, useProfilePage, RULE } from "../ProProfile";
import { DateTile, Done, Eyebrow, Gets, NoMessages, useToast } from "./UnitedWayBoardView";
import { Funnel, RankedRows } from "./uwCharts";
import * as D from "./uwData";

const BLUE = D.BRAND.blue;
const BLUE_TEXT = D.BRAND.blueText;
const GOOD = "var(--world-food-farming-nature)";
const SOLID = { background: BLUE, color: "#fff" } as const;
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
const M = D.UWM;
const P = D.MENTORSHIP_PROGRAM;

/** The four steps, always visible, so a student knows where they are. */
function Path({ stage }: { stage: UwStage }) {
  const at = stage === "none" ? -1 : stage === "interested" ? 0 : stage === "applied" ? 1 : 2;
  return (
    <ol className="grid grid-cols-2 gap-[8px] sm:grid-cols-4" aria-label="Your path">
      {M.path.map((s, i) => {
        const done = i <= at;
        const now = i === at + 1;
        return (
          <li key={s.key} className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={{ borderColor: now ? `color-mix(in srgb, ${BLUE} 60%, var(--glass-border))` : "var(--glass-border)", background: now ? `color-mix(in srgb, ${BLUE} 16%, var(--glass-surface-1))` : "var(--glass-surface-1)" }} aria-current={now ? "step" : undefined}>
            <span className="flex size-[26px] flex-none items-center justify-center rounded-full text-[12.5px] font-extrabold" style={{ background: done ? GOOD : now ? BLUE : "color-mix(in srgb, var(--foreground) 10%, transparent)", color: done || now ? "#fff" : "var(--muted-foreground)" }}>{done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}</span>
            <span className="text-[13.5px] leading-[18px] font-bold" style={{ color: done || now ? "var(--foreground)" : "var(--muted-foreground)" }}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Workshops() {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <SectionHead>Workshops</SectionHead>
      <ol className="grid grid-cols-2 gap-[8px] sm:grid-cols-3 lg:grid-cols-6">
        {P.workshops.map((w) => (
          <li key={w.title} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <DateTile month={w.month} day={w.day} size="sm" />
            <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{w.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Safety() {
  const icons = [MessageSquareOff, ShieldCheck, Users];
  return (
    <section className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
      {M.safe.map((s, i) => {
        const Icon = icons[i];
        return (
          <div key={s.title} className="flex items-start gap-[12px] rounded-[var(--radius-md)] border p-[14px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <span className="flex size-[34px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${BLUE} 26%, transparent)` }}><Icon className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} /></span>
            <span className="flex flex-col gap-[2px]"><span className="text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{s.title}</span><span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{s.line}</span></span>
          </div>
        );
      })}
    </section>
  );
}

function Mentors({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <SectionHead>{M.mentorsTitle}</SectionHead>
      <div className="dm-scroll -mx-[4px] flex gap-[var(--space-3)] overflow-x-auto px-[4px] pb-[4px] [scrollbar-width:none]">
        {D.VOLUNTEER_IDS.map((id) => {
          const pro = D.VOLUNTEERS[id];
          return (
            <button key={id} type="button" onClick={() => onOpen(id)} className="dm-quiet flex w-[96px] flex-none cursor-pointer flex-col items-center gap-[6px] rounded-[var(--radius-md)] p-[6px] text-center">
              <Avatar name={pro.name} size={60} />
              <span className="w-full truncate text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name.split(" ")[0]}</span>
              <span className="w-full truncate text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>{pro.org}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Chips({ options, value, onPick, multi = false }: { options: string[]; value: string[]; onPick: (v: string[]) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => onPick(multi ? (on ? value.filter((v) => v !== o) : [...value, o]) : [o])} className="dm-quiet flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[14px] font-semibold" style={{ borderColor: on ? `color-mix(in srgb, ${BLUE} 70%, transparent)` : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 26%, transparent)` : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {on && <Check className="h-3.5 w-3.5" aria-hidden style={{ color: BLUE_TEXT }} />}{o}
          </button>
        );
      })}
    </div>
  );
}

/** Step 2: three quick questions, one tap each. */
function ShortForm({ onSent }: { onSent: () => void }) {
  const F = M.form;
  const [grade, setGrade] = useState<string[]>([]);
  const [help, setHelp] = useState<string[]>([]);
  const [when, setWhen] = useState<string[]>([]);
  const ready = grade.length > 0 && help.length > 0 && when.length > 0;
  return (
    <Panel id="uwm-form-title" title={F.title}>
      <div className="flex flex-col gap-[var(--space-5)]">
        {[{ q: F.grade.q, opts: F.grade.options, v: grade, set: setGrade, multi: false }, { q: F.help.q, opts: F.help.options, v: help, set: setHelp, multi: true }, { q: F.when.q, opts: F.when.options, v: when, set: setWhen, multi: false }].map((row, i) => (
          <div key={row.q} className="flex flex-col gap-[10px]">
            <span className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}><span className="flex size-[22px] items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: row.v.length ? GOOD : `color-mix(in srgb, ${BLUE} 30%, transparent)`, color: "#fff" }}>{row.v.length ? <Check className="h-3 w-3" aria-hidden /> : i + 1}</span>{row.q}</span>
            <Chips options={row.opts} value={row.v} onPick={row.set} multi={row.multi} />
          </div>
        ))}
        <div><PrimaryCta disabled={!ready} onClick={() => { setUwStage("applied", { grade: grade[0], help, when: when[0] }); onSent(); }} style={SOLID}>{F.submit}</PrimaryCta></div>
      </div>
    </Panel>
  );
}

function MentorCard({ onOpen }: { onOpen: () => void }) {
  const pro = D.VOLUNTEERS[M.mentorId];
  return (
    <button type="button" onClick={onOpen} className="dm-tap flex h-full cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={ITEM}>
      <Eyebrow>My mentor</Eyebrow>
      <span className="flex items-center gap-[14px]">
        <Avatar name={pro.name} size={56} ring={BLUE_TEXT} />
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="flex items-center gap-[6px] text-[17px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={15} /></span>
          <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{pro.role}, {pro.org}</span>
        </span>
      </span>
      <span className="mt-auto flex flex-wrap items-center justify-between gap-[8px] border-t pt-[var(--space-3)] text-[12.5px] font-semibold" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
        <span>{M.mentorWhy}</span>
        <span className="flex items-center gap-[5px]" style={{ color: BLUE_TEXT }}><MessageSquareOff className="h-3.5 w-3.5" aria-hidden /> No direct messages</span>
      </span>
    </button>
  );
}

function NextMeeting({ onToast }: { onToast: (t: string) => void }) {
  const N = M.nextMeeting;
  return (
    <div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 26%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` }}>
      <Eyebrow>Next meeting</Eyebrow>
      <span className="flex items-center gap-[14px]">
        <DateTile month={N.month} day={N.day} />
        <span className="flex flex-col gap-[2px]">
          <span className="text-[17px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>{N.weekday} {N.time}</span>
          <span className="flex items-center gap-[5px] text-[13px]" style={{ color: "var(--muted-foreground)" }}><Video className="h-3.5 w-3.5" aria-hidden /> {N.kind} · {N.by}</span>
        </span>
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-[8px]">
        <PrimaryCta size="sm" disabled style={SOLID}><Video className="h-4 w-4" aria-hidden /> Join</PrimaryCta>
        <QuietCta size="sm" onClick={() => onToast("Added to your calendar")}><CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar</QuietCta>
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>Join opens at 3:55 PM</span>
      </span>
    </div>
  );
}

function Goals() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = M.goals.filter((g) => done[g]).length;
  return (
    <Panel id="uwm-goals-title" title="My goals" aside={<span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{count} of {M.goals.length}</span>}>
      <ul className="flex flex-col gap-[8px]">
        {M.goals.map((g) => (
          <li key={g}>
            <button type="button" aria-pressed={!!done[g]} onClick={() => setDone((m) => ({ ...m, [g]: !m[g] }))} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <span className="flex size-[22px] flex-none items-center justify-center rounded-full border" style={{ borderColor: done[g] ? GOOD : "var(--glass-border)", background: done[g] ? GOOD : "transparent" }}>{done[g] && <Check className="h-3.5 w-3.5" aria-hidden style={{ color: "#fff" }} />}</span>
              <span className="text-[14.5px] font-semibold" style={{ color: "var(--foreground)", textDecoration: done[g] ? "line-through" : "none", opacity: done[g] ? 0.6 : 1 }}>{g}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function YearPlan() {
  return (
    <ol className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-4">
      {M.planMonths.map((m) => {
        const now = m.state === "current";
        return (
          <li key={m.month} className="flex flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: now ? `color-mix(in srgb, ${BLUE} 60%, var(--glass-border))` : "var(--glass-border)", background: now ? `color-mix(in srgb, ${BLUE} 18%, var(--glass-surface-1))` : "var(--glass-surface-1)" }}>
            <span className="flex items-center justify-between"><span className="text-[22px] leading-[24px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", color: now ? "var(--foreground)" : "var(--muted-foreground)" }}>{m.month}</span>{now && <span className="rounded-full px-[8px] py-[2px] text-[11px] font-bold" style={SOLID}>This month</span>}</span>
            <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{m.title}</span>
            <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{m.focus}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StudentSide({ stage, onOpenPro, onToast }: { stage: UwStage; onOpenPro: (id: string) => void; onToast: (t: string) => void }) {
  const [tab, setTab] = useState<"home" | "plan">("home");
  if (stage === "matched") {
    return (
      <div className="flex flex-col gap-[var(--space-5)]">
        <div className="w-full sm:w-fit"><Segmented grow ariaLabel="Sections" value={tab} onChange={setTab} options={[{ key: "home", label: "Home" }, { key: "plan", label: "Year plan" }]} /></div>
        {tab === "home" ? (
          <>
            <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
              <MentorCard onOpen={() => onOpenPro(M.mentorId)} />
              <NextMeeting onToast={onToast} />
            </div>
            <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Goals />
              <Panel id="uwm-progress-title" title="Meetings">
                <div className="flex items-center gap-[16px]">
                  <Ring pct={Math.round((M.meetings.done / M.meetings.total) * 100)} size={96} stroke={9} accent={BLUE_TEXT}>
                    <span className="flex flex-col items-center"><span className="text-[22px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{M.meetings.done}</span><span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of {M.meetings.total}</span></span>
                  </Ring>
                  <span className="flex flex-col gap-[6px]">
                    <span className="text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{M.meetings.done} of {M.meetings.total} done</span>
                    <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{M.lead.line}</span>
                    <QuietCta size="sm" className="w-fit" onClick={() => onToast("Your program lead will get back to you")}>{M.lead.contact}</QuietCta>
                  </span>
                </div>
              </Panel>
            </div>
            <section className="flex flex-col gap-[var(--space-3)]">
              <SectionHead>Bring to your meeting</SectionHead>
              <div className="flex flex-wrap gap-[8px]">{M.prep.map((p) => <Link key={p.label} href={p.href} className="dm-tap flex min-h-[40px] items-center gap-[6px] rounded-[var(--radius-md)] border px-[14px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{p.label} <ChevronRight className="h-3.5 w-3.5" aria-hidden style={{ color: BLUE_TEXT }} /></Link>)}</div>
            </section>
          </>
        ) : <YearPlan />}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <Path stage={stage} />
      {stage === "none" && (
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:flex-row sm:items-center sm:justify-between" style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${BLUE} 30%, transparent), transparent 75%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` }}>
          <Gets items={P.gets} />
          <PrimaryCta onClick={() => { setUwStage("interested"); onToast("Nice. Three quick questions next."); }} style={SOLID}>{D.PROGRAMS_UI.interested}</PrimaryCta>
        </div>
      )}
      {stage === "interested" && <ShortForm onSent={() => onToast("Sent. Matching is next.")} />}
      {stage === "applied" && (
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${GOOD} 22%, transparent), transparent 75%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${GOOD} 45%, var(--glass-border))` }}>
          <Done text={M.waiting.title} />
          <span className="text-[15px]" style={{ color: "var(--foreground)" }}>{M.waiting.line}</span>
          <span className="flex flex-wrap items-center gap-[8px] pt-[4px]"><span className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>{M.waiting.meanwhile}:</span>{M.prep.map((p) => <Link key={p.label} href={p.href} className="dm-tap flex min-h-[36px] items-center gap-[6px] rounded-[var(--radius-md)] border px-[12px] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{p.label} <ChevronRight className="h-3.5 w-3.5" aria-hidden style={{ color: BLUE_TEXT }} /></Link>)}</span>
        </div>
      )}
      <Safety />
      <Mentors onOpen={onOpenPro} />
      <Workshops />
    </div>
  );
}

function MentorSide({ onToast }: { onToast: (t: string) => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>(Object.fromEntries(M.mentorChecks.map((c) => [c.label, c.done])));
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
          <Eyebrow>My mentee</Eyebrow>
          <span className="flex items-center gap-[14px]">
            <Avatar name={M.mentee.name} size={56} />
            <span className="flex flex-col gap-[2px]"><span className="text-[17px] font-bold" style={{ color: "var(--foreground)" }}>{M.mentee.name}</span><span className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>{M.mentee.grade}, {M.mentee.school}</span></span>
          </span>
          <span className="flex flex-wrap gap-[6px]">{M.mentee.wants.map((w) => <span key={w} className="rounded-full px-[10px] py-[3px] text-[12.5px] font-semibold" style={{ background: `color-mix(in srgb, ${BLUE} 22%, transparent)`, color: "var(--foreground)" }}>{w}</span>)}</span>
          <NoMessages />
        </div>
        <NextMeeting onToast={onToast} />
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <Panel id="uwm-ready-title" title="Before you meet">
          <ul className="flex flex-col gap-[8px]">
            {M.mentorChecks.map((c) => (
              <li key={c.label}>
                <button type="button" aria-pressed={!!checks[c.label]} onClick={() => setChecks((m) => ({ ...m, [c.label]: !m[c.label] }))} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="flex size-[22px] flex-none items-center justify-center rounded-full border" style={{ borderColor: checks[c.label] ? GOOD : "var(--glass-border)", background: checks[c.label] ? GOOD : "transparent" }}>{checks[c.label] && <Check className="h-3.5 w-3.5" aria-hidden style={{ color: "#fff" }} />}</span>
                  <span className="text-[14.5px] font-semibold" style={{ color: "var(--foreground)" }}>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel id="uwm-hours-title" title="Mentoring hours">
          <div className="flex items-center gap-[16px]">
            <Ring pct={Math.round((M.mentorHours.logged / M.mentorHours.target) * 100)} size={96} stroke={9} accent={BLUE_TEXT}>
              <span className="flex flex-col items-center"><span className="text-[22px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{M.mentorHours.logged}</span><span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of {M.mentorHours.target}</span></span>
            </Ring>
            <span className="flex flex-col gap-[4px]"><span className="text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>Logged after each meeting</span><span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>Counts toward your company&apos;s campaign.</span></span>
          </div>
        </Panel>
      </div>
      <section className="flex flex-col gap-[var(--space-3)]"><SectionHead>Year plan</SectionHead><YearPlan /></section>
    </div>
  );
}

const PARTNER_ICONS = [Users, Handshake, Clock, Briefcase];
function PartnerSide() {
  const X = M.partner;
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {X.tiles.map((t, i) => <div key={t.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}><MetricTile icon={PARTNER_ICONS[i]} value={t.value} label={t.label} accent={BLUE_TEXT} /></div>)}
        </div>
      </SectionSurface>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel id="uwm-funnel-title" title="From interest to meetings"><Funnel steps={X.funnel} color={BLUE} /></Panel>
        <Panel id="uwm-ontrack-title" title="Graduation">
          <div className="flex items-center gap-[16px]">
            <Ring pct={X.onTrack.value} size={110} stroke={10} accent={BLUE_TEXT}><span className="text-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{X.onTrack.value}%</span></Ring>
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>of matched seniors are {X.onTrack.label}</span>
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel id="uwm-workshops-title" title="Workshop attendance"><RankedRows color={BLUE_TEXT} unit="seniors" rows={X.workshops} /></Panel>
        <Panel id="uwm-safety-title" title="Safety">
          <dl className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {X.safety.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-[12px] py-[10px] first:pt-0" style={{ borderColor: RULE }}>
                <dt className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</dt>
                <dd className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: s.value === "Off" || s.value === "0" ? GOOD : "var(--foreground)" }}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  );
}

function DemoSwitch({ view, setView, stage }: { view: string; setView: (v: "student" | "mentor" | "partner") => void; stage: UwStage }) {
  const [open, setOpen] = useState(false);
  const tab = (on: boolean): React.CSSProperties => ({ background: on ? "var(--glass-surface-2)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? "inset 0 0 0 1px var(--glass-border)" : "none" });
  const stageKey = stage === "interested" ? "none" : stage;
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-[10px]">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Demo</button>
      {open && (
        <>
          <div role="tablist" aria-label="Show as" className="flex gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
            {M.views.map((o) => <button key={o.key} type="button" role="tab" aria-selected={o.key === view} onClick={() => setView(o.key)} className="dm-quiet flex min-h-[28px] cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] font-semibold whitespace-nowrap" style={tab(o.key === view)}>{o.label}</button>)}
          </div>
          {view === "student" && (
            <div role="tablist" aria-label="Student stage" className="flex gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
              {M.stages.map((o) => <button key={o.key} type="button" role="tab" aria-selected={o.key === stageKey} onClick={() => setUwStage(o.key)} className="dm-quiet flex min-h-[28px] cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] font-semibold whitespace-nowrap" style={tab(o.key === stageKey)}>{o.label}</button>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function UnitedWayMentorship({ onBack }: { onBack: () => void }) {
  const { stage } = useUwMentorship();
  const [view, setView] = useState<"student" | "mentor" | "partner">("student");
  const [profile, setProfile, closeProfile] = useProfilePage<string>();
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [toast, onToast] = useToast();
  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    return <ProProfileView pro={pro} follows={follows} onFollow={(id) => setFollows((f) => ({ ...f, [id]: !f[id] }))} onBack={closeProfile} backLabel="Back to e-Mentorship" />;
  }
  const status: ReactNode = stage === "matched" ? "Matched" : stage === "applied" ? "Applied" : stage === "interested" ? "Interested" : "Enrolling";
  return (
    <section className="flex flex-col gap-[var(--space-5)]" aria-label="e-Mentorship">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> Back to programs</button>
        <DemoSwitch view={view} setView={setView} stage={stage} />
      </div>

      <section aria-label="Program" className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-6)] sm:px-[var(--space-8)]" style={{ background: "#0a0f2a", border: `1px solid color-mix(in srgb, ${BLUE} 55%, transparent)`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 55%, transparent), 0 18px 44px -22px rgba(0,0,0,0.65)`, textShadow: CARD_TEXT_SHADOW }}>
        <Image src={P.photo} alt="" fill sizes="1280px" priority className="object-cover" style={{ objectPosition: "60% 18%" }} />
        <span aria-hidden className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,20,70,0.92) 0%, rgba(0,30,90,0.68) 40%, rgba(0,30,90,0.1) 72%, transparent 100%)" }} />
        <span aria-hidden className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(0,20,70,0.95) 0%, rgba(0,25,80,0.7) 45%, rgba(0,25,80,0.15) 75%, rgba(0,20,60,0.35) 100%)" }} />
        <Image src={D.BRAND.logoWhite} alt="United Way" width={156} height={73} unoptimized className="absolute top-[var(--space-6)] left-[var(--space-6)] z-10 h-[42px] w-auto sm:left-[var(--space-8)] sm:h-[50px]" />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative z-10 flex max-w-[520px] flex-col gap-[8px]">
          <span className="w-fit rounded-full px-[10px] py-[3px] text-[12px] font-bold" style={{ background: stage === "matched" ? GOOD : BLUE, color: "#fff", textShadow: "none" }}>{status}</span>
          <h2 className="text-[32px] leading-[34px] font-extrabold sm:text-[42px] sm:leading-[44px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{P.title}</h2>
          <p className="text-[16px] leading-[22px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>{P.line}</p>
          <div className="mt-[4px] flex flex-wrap gap-[8px]">
            {P.meta.map((m) => <span key={m} className="rounded-full px-[12px] py-[4px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", textShadow: "none" }}>{m}</span>)}
            <span className="flex items-center gap-[5px] rounded-full px-[12px] py-[4px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", textShadow: "none" }}><MessageSquareOff className="h-3.5 w-3.5" aria-hidden /> No direct messages</span>
          </div>
        </motion.div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        {view === "student" && <StudentSide stage={stage} onOpenPro={setProfile} onToast={onToast} />}
        {view === "mentor" && <MentorSide onToast={onToast} />}
        {view === "partner" && <PartnerSide />}
        <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{P.by}</span>
      </SectionSurface>
      {toast}
    </section>
  );
}
