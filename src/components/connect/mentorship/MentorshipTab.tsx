"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Check, ChevronDown, ChevronRight, Clock, Download, Flag, GraduationCap, Handshake, Link2, MessageCircle, Send, ShieldCheck, Sparkles, Target, Timer, Users, Video, X } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { Avatar, PrimaryCta, QuietCta, VerifiedBadge } from "../primitives";
import { Meter, Ring, Segmented, ruledCell } from "../viz";
import { BarChart, GoalTrack, Histogram, ShareBar, Sparkline, compact } from "./charts";
import * as D from "./mentorshipData";

// The Mentorship tab in Connect: the Coach Foundation Dreamer Mentorship
// Program as a student, a mentor and the enterprise sees it. Structure and
// copy follow Joshua's Replit (18 Sept 2026); the visual execution, the
// charts and every secondary action are ours (the Replit's View Report,
// Export, Configure rules, Prepare, Reschedule and Report buttons were all
// dead ends). Which view opens follows Connect's demo role; the Demo chip
// flips between the three, same pattern as the AT&T board.

const accent = "var(--accent-subtle)";
const GOOD = "var(--world-food-farming-nature)";
const RULE = "var(--inset-border)";
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
const PANEL = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" } as const;

function Eyebrow({ children, tone = accent, className = "" }: { children: ReactNode; tone?: string; className?: string }) {
  return <span className={`block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase ${className}`} style={{ color: tone }}>{children}</span>;
}
function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] leading-[19px] ${className}`} style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}
function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-[17px] leading-[22px] font-extrabold ${className}`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{children}</h3>;
}
function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`} style={PANEL}>{children}</section>;
}
function Item({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[var(--radius-md)] border p-[var(--space-4)] ${className}`} style={ITEM}>{children}</div>;
}
function Chip({ children, tone = accent }: { children: ReactNode; tone?: string }) {
  return <span className="inline-flex items-center gap-[5px] rounded-full px-[8px] py-[1px] text-[11px] leading-[15px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}>{children}</span>;
}
function DateTile({ month, day }: { month: string; day: number }) {
  return (
    <span aria-label={`${month} ${day}`} className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[var(--radius-sm)] border" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 10%, var(--glass-surface-1))` }}>
      <span className="text-[10px] leading-none font-extrabold tracking-[0.08em] uppercase" style={{ color: accent }}>{month}</span>
      <span className="mt-[3px] text-[20px] leading-none font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{day}</span>
    </span>
  );
}

/** Same sheet chrome as the AT&T board's opportunity sheet. */
function Sheet({ title, onClose, children, label }: { title: string; onClose: () => void; children: ReactNode; label?: string }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[14px]" style={{ background: "rgba(5,7,15,0.6)" }} />
        <div className="relative z-[1] flex max-h-[calc(100dvh-96px)] w-full max-w-[480px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet absolute top-[14px] right-[14px] z-10 flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
          <div className="flex flex-col gap-[6px] pr-[40px]">
            {label && <Eyebrow>{label}</Eyebrow>}
            <h2 className="text-[22px] leading-[27px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
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
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-[13.5px] font-semibold whitespace-nowrap motion-safe:animate-[fade-slide-up_0.2s_ease-out_both]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 40px -20px rgba(0,0,0,0.8)" }}>
        {toast}
      </div>
    </Portal>
  ) : null;
  return [node, setToast];
}

/** Demo-only switch between the three views, hidden behind a Demo chip
 *  (direct feedback, 17 Sept 2026: demo controls should not feel like UI). */
function DemoViewSwitch({ view, onPick }: { view: D.MentorshipView; onPick: (view: D.MentorshipView) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-w-0 items-center justify-end gap-[10px]">
      <button type="button" aria-expanded={open} aria-controls="mentorship-demo-views" onClick={() => setOpen((v) => !v)} className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
        Demo
      </button>
      {open && (
        <div id="mentorship-demo-views" role="tablist" aria-label="Show this program as" className="flex min-w-0 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none]" style={PANEL}>
          {D.VIEWS.map((option) => {
            const on = option.key === view;
            return (
              <button key={option.key} type="button" role="tab" aria-selected={on} onClick={() => onPick(option.key)} className="dm-quiet flex min-h-[28px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: on ? "var(--glass-surface-2)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>
                {option.label.replace(/ View$/, "")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MentorshipTab({ role }: { role: "student" | "attendee" | "pro" | "partner" | "admin" }) {
  const defaultView: D.MentorshipView = role === "pro" ? "mentor" : role === "partner" || role === "admin" ? "enterprise" : "student";
  const [view, setView] = useState<D.MentorshipView>(defaultView);
  return (
    <section className="flex flex-col gap-[var(--space-5)]" aria-label="Mentorship">
      {/* program header: one panel, the partner's colour, the facts on one line */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={{ borderColor: "var(--glass-border)", background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 22%, var(--glass-surface-2)) 0%, var(--glass-surface-1) 70%)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" }}>
        <span aria-hidden className="pointer-events-none absolute top-[-120px] right-[-80px] size-[320px] rounded-full" style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 22%, transparent), transparent)` }} />
        <div className="relative flex flex-wrap items-start justify-between gap-[var(--space-4)]">
          <div className="flex min-w-0 flex-col gap-[4px]">
            <Eyebrow className="flex items-center gap-[6px]"><Handshake className="h-3.5 w-3.5" aria-hidden /> {D.PROGRAM.partner}</Eyebrow>
            <h2 className="text-[26px] leading-[30px] font-extrabold tracking-[-0.01em] sm:text-[30px] sm:leading-[34px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.PROGRAM.title}</h2>
            <Muted>{D.PROGRAM.cohort} · {D.PROGRAM.counts}</Muted>
          </div>
          <DemoViewSwitch key={view} view={view} onPick={setView} />
        </div>
        <p className="relative mt-[var(--space-4)] flex items-center gap-[6px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <ShieldCheck className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: GOOD }} /> {D.PROGRAM.safeguard}
        </p>
      </div>
      {view === "student" && <StudentView />}
      {view === "mentor" && <MentorView />}
      {view === "enterprise" && <EnterpriseView />}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces: schedule, thread, plan

function ScheduleCard({ onToast, showMeter }: { onToast: (t: string) => void; showMeter?: boolean }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const when = slot ?? `${D.MEETING.date.weekday} · ${D.MEETING.time}`;
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[14px]">
          <DateTile month={slot ? slot.split(" ")[1] : D.MEETING.date.month} day={slot ? Number(slot.split(" ")[2]) : D.MEETING.date.day} />
          <div className="flex min-w-0 flex-col gap-[2px]">
            <Eyebrow>Next meeting</Eyebrow>
            <span className="text-[16px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{when.replace(/^\w+, \w+ \d+ · /, (m) => m)}</span>
            <Muted className="flex items-center gap-[5px]"><Video className="h-3.5 w-3.5" aria-hidden /> {D.MEETING.where}</Muted>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" className="dm-solid flex min-h-[36px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            <Video className="h-4 w-4" aria-hidden /> Join Meeting
          </a>
          <QuietCta size="sm" onClick={() => setOpen(true)}>Reschedule</QuietCta>
        </div>
      </div>
      {showMeter && (
        <div className="mt-[var(--space-4)] flex items-center justify-between gap-[10px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
          <Muted>Required meetings this year</Muted>
          <Meter value={D.MEETING.completed} max={D.MEETING.required} accent={GOOD} label="completed" />
        </div>
      )}
      {open && (
        <Sheet title="Pick a new time" label="Reschedule" onClose={() => setOpen(false)}>
          <Muted>Both calendars are free at these times. Your mentor is asked to confirm.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.MEETING.reschedule.map((s) => (
              <button key={s} type="button" onClick={() => { setSlot(s); setOpen(false); onToast("Request sent. You will hear back within a day."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] py-[12px] text-left text-[14.5px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                <span className="flex items-center gap-[8px]"><Clock className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {s}</span>
                <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </Panel>
  );
}

function Thread({ me, onToast }: { me: "mentee" | "mentor"; onToast: (t: string) => void }) {
  const [messages, setMessages] = useState<D.Message[]>(D.THREAD);
  const [draft, setDraft] = useState("");
  const [sheet, setSheet] = useState<"none" | "escalate" | "resource" | "time">("none");
  const other = me === "mentee" ? { name: D.MENTOR.name, line: `${D.MENTOR.org} · Your Mentor`, photo: D.MENTOR.photo } : { name: D.MENTEE.name, line: "Your Mentee", photo: undefined };
  const suggested = me === "mentee" ? D.STUDENT_SUGGESTED : D.MENTOR_SUGGESTED;
  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: me, text: text.trim(), when: "Just now" }]);
    setDraft("");
  };
  return (
    <Panel className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between gap-[10px] border-b pb-[var(--space-3)]" style={{ borderColor: RULE }}>
        <div className="flex items-center gap-[10px]">
          <Avatar name={other.name} size={36} photo={other.photo} />
          <div className="flex flex-col">
            <span className="flex items-center gap-[5px] text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{other.name} <VerifiedBadge size={14} /></span>
            <Muted className="text-[12.5px] leading-[16px]">{other.line}</Muted>
          </div>
        </div>
        <Chip tone={GOOD}><span aria-hidden className="size-[6px] rounded-full" style={{ background: GOOD }} />Matched</Chip>
      </div>

      <div className="flex flex-col gap-[10px]">
        {messages.map((m, i) => {
          const mine = m.from === me;
          return (
            <div key={i} className={`flex flex-col gap-[3px] ${mine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-[16px] px-[14px] py-[9px] text-[14.5px] leading-[20px] ${mine ? "rounded-br-[6px]" : "rounded-bl-[6px]"}`} style={mine ? { background: "var(--primary)", color: "#FFFFFF" } : { background: "var(--glass-surface-2)", color: "var(--foreground)", border: "1px solid var(--glass-border)" }}>
                {m.text}
              </div>
              <span className="px-[4px] text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{m.when}</span>
            </div>
          );
        })}
      </div>

      {me === "mentor" && (
        <div className="flex flex-wrap gap-[6px]">
          <QuietCta size="xs" onClick={() => setSheet("resource")}><BookOpen className="h-3.5 w-3.5" aria-hidden /> {D.MENTOR_TOOLS[0]}</QuietCta>
          <QuietCta size="xs" onClick={() => { send("Here is our meeting link for Tuesday: teams.microsoft.com/l/meetup-join/coach-dreamer"); onToast("Meeting link sent."); }}><Link2 className="h-3.5 w-3.5" aria-hidden /> {D.MENTOR_TOOLS[1]}</QuietCta>
          <QuietCta size="xs" onClick={() => setSheet("time")}><Calendar className="h-3.5 w-3.5" aria-hidden /> {D.MENTOR_TOOLS[2]}</QuietCta>
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">Suggested questions</Eyebrow>
        <div className="flex flex-wrap gap-[6px]">
          {suggested.map((q) => (
            <button key={q} type="button" onClick={() => setDraft(q)} className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[5px] text-left text-[12.5px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <form className="flex items-center gap-[8px]" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={me === "mentee" ? "Ask your mentor" : "Message Maya"} aria-label="Message" className="min-w-0 flex-1 rounded-[var(--radius-md)] border px-[14px] py-[10px] text-[14.5px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:border-[color:var(--primary)]" style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
        <PrimaryCta size="sm" onClick={() => send(draft)}><Send className="h-4 w-4" aria-hidden /> Send</PrimaryCta>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
        <Muted className="flex items-center gap-[5px] text-[12px] leading-[16px]"><ShieldCheck className="h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} /> {D.THREAD_FOOT}</Muted>
        <button type="button" onClick={() => setSheet("escalate")} className="dm-link flex cursor-pointer items-center gap-[4px] text-[12px] leading-[16px] font-bold" style={{ color: "var(--muted-foreground)" }}><Flag className="h-3.5 w-3.5" aria-hidden /> Report / escalate</button>
      </div>

      {sheet === "escalate" && (
        <Sheet title="What happened?" label="Report / escalate" onClose={() => setSheet("none")}>
          <Muted>Dreamari moderators and the Coach Foundation program lead see this. The other person is not told who reported.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.ESCALATE_REASONS.map((r) => (
              <button key={r} type="button" onClick={() => { setSheet("none"); onToast("Sent to moderators. Someone will follow up within a day."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between py-[12px] text-left text-[14.5px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                {r} <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "resource" && (
        <Sheet title="Share an approved resource" label="Approved by Coach Foundation" onClose={() => setSheet("none")}>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.APPROVED_RESOURCES.map((r) => (
              <button key={r.title} type="button" onClick={() => { setSheet("none"); send(`Have a look at this before we meet: ${r.title} (${r.kind})`); onToast("Resource shared."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] py-[12px] text-left" style={{ borderColor: RULE }}>
                <span className="flex flex-col gap-[2px]"><span className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{r.title}</span><Muted className="text-[12px] leading-[16px]">{r.kind} · {r.min}</Muted></span>
                <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "time" && (
        <Sheet title="Suggest a meeting time" onClose={() => setSheet("none")}>
          <Muted>Maya picks one and the meeting lands on both calendars.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.MEETING.reschedule.map((s) => (
              <button key={s} type="button" onClick={() => { setSheet("none"); send(`Would ${s} work for our next meeting?`); onToast("Time suggested."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between py-[12px] text-left text-[14.5px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                <span className="flex items-center gap-[8px]"><Clock className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {s}</span>
                <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </Panel>
  );
}

function YearPlan({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [open, setOpen] = useState<string | null>(D.YEAR_PLAN.find((m) => m.state === "current")?.key ?? null);
  const done = D.YEAR_PLAN.filter((m) => m.state === "complete").length;
  return (
    <Panel className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
        <div className="flex flex-col gap-[2px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Title className="text-[20px] leading-[25px]">{title}</Title>
        </div>
        <Meter value={done} max={D.YEAR_PLAN.length} accent={GOOD} label="months" />
      </div>
      <ol className="flex flex-col">
        {D.YEAR_PLAN.map((m, i) => {
          const isOpen = open === m.key;
          const tone = m.state === "complete" ? GOOD : m.state === "current" ? accent : "var(--muted-foreground)";
          return (
            <li key={m.key} className="relative flex gap-[14px] border-t py-[10px] first:border-t-0" style={{ borderColor: RULE }}>
              {/* rail */}
              <span aria-hidden className="absolute top-[38px] bottom-[-10px] left-[13px] w-[2px]" style={{ background: i === D.YEAR_PLAN.length - 1 ? "transparent" : RULE }} />
              <span className="relative z-[1] mt-[2px] flex size-[28px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums" style={{ background: m.state === "upcoming" ? "var(--glass-surface-2)" : tone, color: m.state === "upcoming" ? "var(--muted-foreground)" : "#05070f", boxShadow: m.state === "upcoming" ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>
                {m.state === "complete" ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : m.key)} className="dm-quiet -mx-[6px] flex cursor-pointer items-center justify-between gap-[10px] rounded-[var(--radius-sm)] px-[6px] py-[2px] text-left">
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}>{m.month}</span>
                    <span className="text-[15.5px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{m.title}</span>
                  </span>
                  <span className="flex flex-none items-center gap-[8px]">
                    <Chip tone={tone}>{m.state === "complete" ? "Complete" : m.state === "current" ? "This month" : "Upcoming"}</Chip>
                    <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: isOpen ? "rotate(180deg)" : "none" }} aria-hidden />
                  </span>
                </button>
                {isOpen && (
                  <Item className="mt-[8px] flex flex-col gap-[6px]">
                    <Eyebrow tone="var(--muted-foreground)">Focus</Eyebrow>
                    <span className="text-[15px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{m.focus}</span>
                    {m.note && <Muted>{m.note}</Muted>}
                    {m.state === "current" && (
                      <Link href="/explore?tab=browse" className="dm-link mt-[2px] flex w-fit items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>View Careers <ChevronRight className="h-3.5 w-3.5" aria-hidden /></Link>
                    )}
                  </Item>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Student

function StudentView() {
  const [tab, setTab] = useState<"home" | "messages" | "plan">("home");
  const [toast, onToast] = useToast();
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Segmented ariaLabel="Mentorship sections" value={tab} onChange={setTab} options={[{ key: "home", label: "Home" }, { key: "messages", label: "Messages" }, { key: "plan", label: "Year Plan" }]} />
      {tab === "home" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Panel className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
            <div className="flex items-center gap-[14px]">
              <Avatar name={D.MENTOR.name} size={56} photo={D.MENTOR.photo} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Eyebrow>My mentor</Eyebrow>
                <span className="flex items-center gap-[6px] text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.MENTOR.name} <VerifiedBadge size={16} /></span>
                <Muted>{D.MENTOR.title} · {D.MENTOR.org} · {D.MENTOR.years}</Muted>
              </div>
            </div>
            <PrimaryCta size="sm" onClick={() => setTab("messages")}><MessageCircle className="h-4 w-4" aria-hidden /> Message Mentor</PrimaryCta>
          </Panel>

          <div className="flex flex-col gap-[var(--space-3)]">
            <div className="flex flex-col gap-[2px]">
              <Eyebrow>Prep for mentor</Eyebrow>
              <Muted>Get ready for your next conversation.</Muted>
            </div>
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
              {D.PREP.map((p) => (
                <Link key={p.key} href={p.href} className="dm-tap group relative flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={ITEM}>
                  <Eyebrow>{p.label}</Eyebrow>
                  <span className="text-[15.5px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{p.item}</span>
                  <Muted>{p.line}</Muted>
                  <span className="mt-auto flex items-center gap-[4px] pt-[4px] text-[13px] font-bold" style={{ color: accent }}>{p.cta} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
                </Link>
              ))}
            </div>
          </div>

          <ScheduleCard onToast={onToast} showMeter />
        </div>
      )}
      {tab === "messages" && <Thread me="mentee" onToast={onToast} />}
      {tab === "plan" && <YearPlan eyebrow="Year plan" title="Topics to discuss each month." />}
      {toast}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mentor

function MentorView() {
  const [tab, setTab] = useState<"home" | "messages" | "journey">("home");
  const [prep, setPrep] = useState(false);
  const [toast, onToast] = useToast();
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Segmented ariaLabel="Mentorship sections" value={tab} onChange={setTab} options={[{ key: "home", label: "Home" }, { key: "messages", label: "Messages" }, { key: "journey", label: "Journey" }]} />
      {tab === "home" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Panel className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
            <div className="flex items-center gap-[14px]">
              <Avatar name={D.MENTEE.name} size={56} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Eyebrow>My mentee</Eyebrow>
                <span className="flex items-center gap-[6px] text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.MENTEE.name} <VerifiedBadge size={16} /></span>
                <Muted>{D.MENTEE.line} · {D.MENTEE.sub}</Muted>
              </div>
            </div>
            <PrimaryCta size="sm" onClick={() => setTab("messages")}><MessageCircle className="h-4 w-4" aria-hidden /> Message</PrimaryCta>
          </Panel>

          <Panel className="flex flex-col gap-[var(--space-3)]">
            <Eyebrow>Your next conversation</Eyebrow>
            <div className="flex flex-wrap items-center gap-[8px]">
              <Title>{D.NEXT_CONVERSATION.head}</Title>
              {D.MENTEE.exploring.map((c) => <Chip key={c}>{c}</Chip>)}
            </div>
            <Item className="flex items-start gap-[10px]">
              <Sparkles className="mt-[2px] h-4 w-4 flex-none" aria-hidden style={{ color: accent }} />
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{D.NEXT_CONVERSATION.prompt}</span>
            </Item>
            <QuietCta size="sm" className="w-fit" onClick={() => setPrep(true)}>{D.NEXT_CONVERSATION.cta} <ChevronRight className="h-4 w-4" aria-hidden /></QuietCta>
          </Panel>

          <ScheduleCard onToast={onToast} showMeter />
        </div>
      )}
      {tab === "messages" && <Thread me="mentor" onToast={onToast} />}
      {tab === "journey" && <YearPlan eyebrow="Mentorship journey" title="A clear next step, every month." />}
      {prep && (
        <Sheet title="Before you meet Maya" label="Prepare for meeting" onClose={() => setPrep(false)}>
          <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.NEXT_CONVERSATION.prep.map((line) => (
              <li key={line} className="flex items-start gap-[10px] py-[10px] text-[14.5px] leading-[20px]" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                <Check className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> {line}
              </li>
            ))}
          </ul>
          <Item className="flex flex-col gap-[4px]">
            <Eyebrow tone="var(--muted-foreground)">Opening question</Eyebrow>
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{D.NEXT_CONVERSATION.prompt}</span>
          </Item>
          <Link href="/explore?tab=browse" className="dm-link flex w-fit items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>Open Maya&apos;s saved careers <ChevronRight className="h-3.5 w-3.5" aria-hidden /></Link>
        </Sheet>
      )}
      {toast}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enterprise

const KPI_ICON = { hours: Timer, students: GraduationCap, mentors: Users, meetings: Handshake } as const;

function EnterpriseView() {
  const [tab, setTab] = useState<"overview" | "countries" | "settings">("overview");
  const [period, setPeriod] = useState<"month" | "year">("year");
  const [grain, setGrain] = useState<"monthly" | "weekly">("monthly");
  const [program, setProgram] = useState<D.ProgramId>("all");
  const [exporting, setExporting] = useState(false);
  const [toast, onToast] = useToast();
  const selected = D.PROGRAMS.find((p) => p.id === program) ?? null;

  const monthly = selected ? selected.monthly : D.MONTHS.map((_, i) => D.PROGRAMS.reduce((a, p) => a + p.monthly[i], 0));
  const values = period === "month" ? D.THIS_MONTH_WEEKS : grain === "monthly" ? monthly : D.THIS_YEAR_WEEKS;
  const labels = period === "month" ? ["Wk 1", "Wk 2", "Wk 3", "Wk 4"] : grain === "monthly" ? [...D.MONTHS] : D.THIS_YEAR_WEEKS.map((_, i) => `W${i + 1}`);
  const lastYear = grain === "monthly" && period === "year" ? monthly.map((v) => Math.round(v * 0.86)) : undefined;
  const hoursTotal = values.reduce((a, b) => a + b, 0);
  const onTrackPairs = D.MEETINGS_PER_PAIR.slice(2).reduce((a, r) => a + r.pairs, 0);
  const allPairs = D.MEETINGS_PER_PAIR.reduce((a, r) => a + r.pairs, 0);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Segmented ariaLabel="Enterprise sections" value={tab} onChange={setTab} options={[{ key: "overview", label: "Overview" }, { key: "countries", label: "Programs" }, { key: "settings", label: "Settings" }]} />

      {tab === "overview" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
            <div className="flex flex-col gap-[2px]">
              <Eyebrow>Global impact</Eyebrow>
              <Muted className="flex flex-wrap items-center gap-[8px]">
                {selected ? `${selected.name} program.` : "Coach Foundation mentorship across all programs."}
                {selected && <button type="button" onClick={() => setProgram("all")} className="dm-link cursor-pointer text-[12.5px] font-bold" style={{ color: accent }}>All programs</button>}
              </Muted>
            </div>
            <div className="flex flex-wrap items-center gap-[8px]">
              <Segmented ariaLabel="Period" value={period} onChange={setPeriod} options={[{ key: "month", label: "This Month" }, { key: "year", label: "This Year" }]} />
              <QuietCta size="sm" onClick={() => setExporting(true)}><Download className="h-4 w-4" aria-hidden /> Export</QuietCta>
            </div>
          </div>

          {/* KPIs: value, change, and the last nine months as a line */}
          <Panel className="grid grid-cols-2 !p-0 sm:grid-cols-4">
            {D.KPIS.map((k, i) => {
              const Icon = KPI_ICON[k.key];
              const value = period === "year" ? k.year : k.month;
              const delta = period === "year" ? k.deltaYear : k.deltaMonth;
              return (
                <div key={k.key} className={`flex flex-col gap-[10px] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}>
                  <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><Icon className="h-3.5 w-3.5" aria-hidden style={{ color: accent }} /> {k.label}</span>
                  <span className="flex items-baseline gap-[8px]">
                    <span className="text-[26px] leading-[30px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{compact(value)}</span>
                    <span className="text-[12px] leading-[16px] font-bold tabular-nums" style={{ color: GOOD }}>+{delta}%</span>
                  </span>
                  <span className="flex items-center justify-between gap-[8px]">
                    <Sparkline values={k.spark} accent={accent} />
                    <span className="hidden text-[11px] leading-[14px] font-semibold whitespace-nowrap sm:inline" style={{ color: "var(--muted-foreground)" }}>vs last {period}</span>
                  </span>
                </div>
              );
            })}
          </Panel>

          {/* hours */}
          <Panel className="flex flex-col gap-[var(--space-3)]">
            <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <div className="flex flex-col gap-[2px]">
                <Title>Volunteer hours</Title>
                <Muted>{compact(hoursTotal)} hours {period === "month" ? "this month" : "this year"}{lastYear ? ", ghost bars show last year" : ""}.</Muted>
              </div>
              {period === "year" && <Segmented ariaLabel="Chart grain" value={grain} onChange={setGrain} options={[{ key: "monthly", label: "Monthly" }, { key: "weekly", label: "Weekly" }]} />}
            </div>
            <BarChart values={values} labels={labels} accent={accent} highlight={values.length - 1} compare={lastYear} height={240} ariaLabel={`Volunteer hours by ${period === "month" ? "week" : grain === "monthly" ? "month" : "week"}`} />
            <Muted className="flex items-center gap-[5px] text-[12px] leading-[16px]"><ShieldCheck className="h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} /> Counted from completed meetings and messages under the program&apos;s hour rules. <button type="button" onClick={() => setTab("settings")} className="dm-link cursor-pointer font-bold" style={{ color: accent }}>See rules</button></Muted>
          </Panel>

          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            {/* the two 2030 goals from the Tapestry call */}
            <Panel className="flex flex-col gap-[var(--space-4)]">
              <div className="flex items-center justify-between gap-[10px]">
                <Title className="flex items-center gap-[8px]"><Target className="h-4 w-4" aria-hidden style={{ color: accent }} /> 2030 goals</Title>
                <Muted className="text-[12px] leading-[16px]">Counted through Dreamari</Muted>
              </div>
              {D.GOALS.map((g) => (
                <div key={g.key} className="flex flex-col gap-[8px] border-t pt-[var(--space-3)] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                  <span className="flex flex-wrap items-baseline justify-between gap-[6px]">
                    <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{g.title}</span>
                    <Muted className="text-[12px] leading-[16px]">{g.scope}</Muted>
                  </span>
                  <GoalTrack logged={g.logged} target={g.target} pace={g.pace} accent={accent} unit={g.unit} />
                </div>
              ))}
            </Panel>

            {/* student impact */}
            <Panel className="flex flex-col gap-[var(--space-4)]">
              <Title>Student impact</Title>
              <div className="grid grid-cols-3 gap-[var(--space-3)]">
                {D.IMPACT.map((m) => (
                  <div key={m.key} className="flex flex-col items-center gap-[8px] text-center">
                    <Ring pct={m.pct} size={84} stroke={7} accent={accent}>
                      <span className="text-[18px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.pct}%</span>
                    </Ring>
                    <span className="text-[12.5px] leading-[16px] font-semibold text-balance" style={{ color: "var(--foreground)" }}>{m.label}</span>
                    <span className="text-[11.5px] leading-[14px] font-bold tabular-nums" style={{ color: GOOD }}>+{m.delta} pts vs last year</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
                <span className="flex items-baseline justify-between gap-[10px]">
                  <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>Required meetings completed, per pair</span>
                  <span className="text-[12.5px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><strong style={{ color: "var(--foreground)" }}>{Math.round((onTrackPairs / allPairs) * 100)}%</strong> met twice or more</span>
                </span>
                <Histogram values={D.MEETINGS_PER_PAIR.map((r) => r.pairs)} labels={D.MEETINGS_PER_PAIR.map((r) => r.label)} accent={accent} emphasisFrom={2} height={110} ariaLabel="Pairs by number of required meetings completed" />
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "countries" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-col gap-[2px]">
            <Eyebrow>Programs</Eyebrow>
            <Muted>Mentorship impact by program. Hours are January to September.</Muted>
          </div>
          <Panel className="flex flex-col gap-[var(--space-4)]">
            <ShareBar parts={D.PROGRAMS.map((p) => ({ label: p.name, value: p.hours }))} accent={accent} />
            <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
              {D.PROGRAMS.map((p) => (
                <div key={p.id} className="grid grid-cols-[1fr_auto] items-center gap-x-[var(--space-4)] gap-y-[8px] py-[12px] sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(72px,0.6fr))_120px_auto]" style={{ borderColor: RULE }}>
                  <div className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[15.5px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{p.name}</span>
                    <Muted className="text-[12px] leading-[16px]">{p.window} · {p.cadence}</Muted>
                  </div>
                  <button type="button" onClick={() => { setProgram(p.id); setTab("overview"); }} className="dm-link flex cursor-pointer items-center gap-[4px] text-[13px] font-bold sm:order-last" style={{ color: accent }}>View report <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>
                  {([[p.students, "Students"], [p.mentors, p.mentorLabel], [p.hours, "Hours"]] as [number, string][]).map(([n, l]) => (
                    <span key={l} className="flex flex-col">
                      <span className="text-[17px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: l === "Hours" ? accent : "var(--foreground)" }}>{l === "Hours" ? compact(n) : n.toLocaleString("en-US")}</span>
                      <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</span>
                    </span>
                  ))}
                  <span className="col-span-2 flex items-center sm:col-span-1">
                    <Sparkline values={p.monthly} accent={accent} width={110} height={28} />
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "settings" && <SettingsView onToast={onToast} />}

      {exporting && (
        <Sheet title="Export report" label={selected ? selected.name : "All programs"} onClose={() => setExporting(false)}>
          <Muted>Figures for {period === "month" ? "this month" : "this year"}. Message content is never included.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.EXPORT_ITEMS.map((e) => (
              <button key={e.title} type="button" onClick={() => { setExporting(false); onToast(`${e.title} is on its way to your email.`); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] py-[12px] text-left" style={{ borderColor: RULE }}>
                <span className="flex flex-col gap-[2px]"><span className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{e.title}</span><Muted className="text-[12px] leading-[16px]">{e.line}</Muted></span>
                <Download className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {toast}
    </div>
  );
}

function SettingsView({ onToast }: { onToast: (t: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(D.SETTINGS.map((s) => [s.key, s.value])));
  const [rules, setRules] = useState<Record<string, boolean>>(Object.fromEntries(D.HOUR_RULES.map((r) => [r.key, r.on])));
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-col gap-[2px]">
        <Eyebrow>Settings</Eyebrow>
        <Muted>Program configuration. Changes apply to the next cohort.</Muted>
      </div>
      <Panel className="flex flex-col divide-y !p-0" >
        {D.SETTINGS.map((s) => (
          <div key={s.key} className="flex flex-wrap items-center justify-between gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: RULE }}>
            <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{s.title}</span>
            <div role="radiogroup" aria-label={s.title} className="flex flex-wrap gap-[6px]">
              {s.options.map((o) => {
                const on = values[s.key] === o;
                return (
                  <button key={o} type="button" role="radio" aria-checked={on} onClick={() => { setValues((v) => ({ ...v, [s.key]: o })); onToast(`${s.title}: ${o}`); }} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12.5px] leading-[16px] font-semibold whitespace-nowrap" style={on ? { borderColor: `color-mix(in srgb, ${accent} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Panel>
      <Panel className="flex flex-col gap-[var(--space-3)]">
        <div className="flex flex-col gap-[2px]">
          <Eyebrow>Volunteer hour rules</Eyebrow>
          <Title className="text-[16px] leading-[21px]">Choose what counts toward approved service hours.</Title>
        </div>
        <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
          {D.HOUR_RULES.map((r) => {
            const on = rules[r.key];
            return (
              <li key={r.key} className="flex items-center justify-between gap-[var(--space-4)] py-[11px]" style={{ borderColor: RULE }}>
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                  <Muted className="text-[12.5px] leading-[17px]">{r.line}</Muted>
                </span>
                <button type="button" role="switch" aria-checked={on} aria-label={r.title} onClick={() => setRules((v) => ({ ...v, [r.key]: !on }))} className="relative h-[24px] w-[42px] flex-none cursor-pointer rounded-full transition-colors" style={{ background: on ? accent : "rgba(255,255,255,0.14)" }}>
                  <motion.span layout aria-hidden className="absolute top-[3px] size-[18px] rounded-full" style={{ left: on ? 21 : 3, background: "#FFFFFF" }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                </button>
              </li>
            );
          })}
        </ul>
        <Muted className="text-[12px] leading-[16px]">Hours roll up to Tapestry&apos;s 500,000-hour goal. Message counts are used, never message content.</Muted>
      </Panel>
    </div>
  );
}
