"use client";

// Your profile, with a job (Chandu, 7 Oct 2026: "I don't understand the
// profile tab. What am I supposed to do there?"). Two things:
// 1. Your card as students see it: edit office hours, what to ask you
//    about and languages; the badge beside it is the live preview of what
//    students see when they book you or find you in Connect.
// 2. Your team, for handoffs: who covers which students, one tap to message.
// The ID-badge look is Maisha's lanyard reference. Counselors are adults, so
// a real photo (DEMO-ONLY picks from Connect's headshots); a counselor with
// no photo yet shows initials. Edits are kept on this page for the demo.

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Check, FileText, MessageCircle, Plus, RefreshCw, ShieldCheck, X } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { SCHOOL_COUNSELORS } from "@/lib/counselorOrg";
import { cv } from "@/lib/counselorBase";
import { officeHoursLabel, setOfficeHours, timeLabel, useOfficeHours, type OfficeHours } from "@/lib/counselorMeetings";
import { IconTip } from "@/components/app/IconTip";
import { endCoverage, startCoverage, useCoverage } from "@/lib/counselorCoverage";
import { setSafetyContacts, useOutbox, useSafetyContacts } from "@/lib/counselorOutbox";
import { ROSTER_SOURCE, markReviewed, syncNow, useRosterSync } from "@/lib/counselorRosterSync";
import { notify } from "./LogSheet";

const PHOTO: Record<string, string | undefined> = {
  "Sarah Chen": "/images/connect/avatars/pro-tanaka.jpg",
  "Renee Alvarez": "/images/connect/avatars/pro-martinez.jpg",
};
const ME = "Sarah Chen";
// DEMO-ONLY: teammates' card details until counselor profiles are stored
const TEAM_CARD: Record<string, { hours: string; topics: string[] }> = {
  "Daniel Okafor": { hours: "Tue and Thu, 1 to 3 PM", topics: ["Trades", "Military"] },
  "Renee Alvarez": { hours: "Mon and Wed, 9 to 11 AM", topics: ["Financial aid", "Scholarships"] },
};
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const SUGGESTED = ["College applications", "Financial aid", "Course planning", "Careers", "Scholarships", "Trades", "Stress and wellbeing"];
const FIELD = { borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" };

function lastInitial(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.[0] ?? "Z").toUpperCase();
}

export function V5Profile() {
  const roster = useReviewedRoster();
  const caseload = (from: string, to: string) => roster.filter((s) => { const c = lastInitial(s.name); return c >= from && c <= to; }).length;
  const me = SCHOOL_COUNSELORS.find((c) => c.name === ME) ?? SCHOOL_COUNSELORS[0];
  const team = SCHOOL_COUNSELORS.filter((c) => c.id !== me.id);
  // office hours set here are the ones the calendar and the booking sheet
  // offer (the shared store in counselorMeetings)
  const officeHours = useOfficeHours();
  const hours = officeHoursLabel(officeHours);
  const [topics, setTopics] = useState<string[]>(["College applications", "Careers"]);
  const [languages, setLanguages] = useState("English, Mandarin");

  return (
    <div className="flex flex-col gap-[48px] pt-[var(--space-2)] lg:gap-[64px] lg:pt-[var(--space-4)]">
      <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Profile</h1>

      <section aria-label="Your card" className="grid grid-cols-1 items-start gap-[40px] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[64px]">
        <div className="flex min-w-0 flex-col gap-[var(--space-6)]">
          <div className="flex flex-col gap-[6px]">
            <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Your Card</h2>
            <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Students see this when they book you.</p>
          </div>
          <Field label="Office hours"><HoursEditor value={officeHours} /></Field>
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[14px] font-semibold">Ask me about</span>
            <div className="flex flex-wrap gap-[8px]">
              {SUGGESTED.map((t) => {
                const on = topics.includes(t);
                return (
                  <button key={t} type="button" aria-pressed={on} onClick={() => setTopics((l) => (on ? l.filter((x) => x !== t) : [...l, t].slice(-4)))}
                    className="dm-quiet inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold"
                    style={on ? { background: "color-mix(in srgb, var(--primary) 14%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 50%, transparent)", color: "var(--foreground)" } : { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                    {t}{on && <X className="h-[13px] w-[13px]" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Languages"><input value={languages} onChange={(e) => setLanguages(e.target.value)} className="h-11 w-full max-w-[520px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] outline-none" style={FIELD} /></Field>
        </div>
        {/* the live preview */}
        <div className="flex flex-col items-center gap-[var(--space-3)] justify-self-center">
          <Badge name={me.name} range={me.range} students={caseload(me.from, me.to)} hours={hours} topics={topics} languages={languages} big />
          <span className="text-[12.5px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Preview</span>
        </div>
      </section>

      <section aria-label="Your team" className="flex flex-col gap-[var(--space-5)]">
        <div className="flex flex-col gap-[6px]">
          <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Your Team</h2>
          <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Who covers which students, for handoffs.</p>
        </div>
        <div className="flex flex-wrap gap-[var(--space-6)]">
          {team.map((c) => <Badge key={c.id} name={c.name} range={c.range} students={caseload(c.from, c.to)} hours={TEAM_CARD[c.name]?.hours} topics={TEAM_CARD[c.name]?.topics} message cover />)}
        </div>
      </section>

      {/* the back-office pieces a counselor sets once: who hears about a
         check-in alert, where the caseload comes from, and a record of what
         the app sent (7 Oct 2026: "please build" the open backend list) */}
      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-3 lg:gap-[var(--space-12)]">
        <SafetyContactsSection />
        <RosterSection />
        <SentSection />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[var(--space-2)]">
      <span className="text-[14px] font-semibold">{label}</span>
      {children}
    </label>
  );
}

/** A hanging ID badge: a strap, a clip, then the card. */
function Badge({ name, range, students, hours, topics = [], languages, big = false, message = false, cover = false }: { name: string; range: string; students: number; hours?: string; topics?: string[]; languages?: string; big?: boolean; message?: boolean; cover?: boolean }) {
  const coverage = useCoverage();
  const covering = coverage?.name === name;
  const photo = PHOTO[name];
  const w = big ? 300 : 240;
  const initials = name.split(" ").map((p) => p[0]).join("");
  return (
    <figure className="group relative flex flex-none flex-col items-center" style={{ width: w }}>
      <span aria-hidden className="block h-[40px] w-[18px] rounded-b-[4px]" style={{ background: "var(--primary)" }} />
      <span aria-hidden className="-mt-[2px] block h-[14px] w-[30px] rounded-[4px] border-2" style={{ borderColor: "color-mix(in srgb, var(--foreground) 40%, transparent)", background: "var(--card)" }} />
      <div className="mt-[6px] flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-transform duration-300 group-hover:-translate-y-[2px] motion-reduce:transition-none"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 50px -30px rgba(20,30,70,0.55)" }}>
        <div className="relative w-full" style={{ height: big ? 250 : 190, background: "color-mix(in srgb, var(--primary) 14%, var(--card))" }}>
          {photo
            ? <Image src={photo} alt="" fill sizes={`${w}px`} className="object-cover" style={{ objectPosition: "50% 20%" }} />
            : <span className="absolute inset-0 flex items-center justify-center text-[56px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>{initials}</span>}
        </div>
        <figcaption className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-5)]">
          <span className="flex flex-col gap-[2px]">
            <span className={`${big ? "text-[22px] leading-[28px]" : "text-[18px] leading-[24px]"} font-semibold`} style={{ fontFamily: "var(--font-display)" }}>{name}</span>
            <span className="text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>School Counselor · {DEMO_SCHOOL}</span>
          </span>
          {hours && <span className="text-[13.5px]"><span className="font-semibold">Office hours</span><br /><span style={{ color: "var(--muted-foreground)" }}>{hours}</span></span>}
          {topics.length > 0 && <span className="flex flex-wrap gap-[6px]">{topics.map((t) => <span key={t} className="rounded-full px-[10px] py-[3px] text-[12px] font-semibold" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>{t}</span>)}</span>}
          {languages && <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Speaks {languages}</span>}
          <span className="flex items-center justify-between border-t pt-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: RULE }}>
            <span>Students {range}</span>
            <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{students}</span>
          </span>
          {message && (
            <Link href={cv("workspace")} className="dm-quiet inline-flex h-10 items-center justify-center gap-[8px] rounded-[var(--radius-md)] border text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
              <MessageCircle className="h-4 w-4" aria-hidden /> Message {name.split(" ")[0]}
            </Link>
          )}
          {cover && (
            <button type="button" aria-pressed={covering} onClick={() => { if (covering) { endCoverage(); notify("Coverage ended"); } else { startCoverage(name); notify(`Covering for ${name} today`); } }}
              className="dm-quiet inline-flex h-10 cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] border text-[14px] font-semibold"
              style={covering ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>
              <ShieldCheck className="h-4 w-4" aria-hidden /> {covering ? "Covering today" : `Cover for ${name.split(" ")[0]} today`}
            </button>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

// Office hours by weekday (7 Oct 2026: hours set on Profile drive the booking
// slots and the calendar). One row a day: a switch, then from and to.
const TIMES = Array.from({ length: 21 }, (_, i) => { const t = 7 * 60 + i * 30; return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; });
const WEEKDAYS: [number, string][] = [[1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"]];

function HoursEditor({ value }: { value: OfficeHours }) {
  const set = (weekday: number, patch: Partial<{ from: string; to: string }> | null) => {
    const rest = value.filter((o) => o.weekday !== weekday);
    if (patch === null) { setOfficeHours(rest); return; }
    const cur = value.find((o) => o.weekday === weekday) ?? { weekday, from: "10:00", to: "11:30" };
    const next = { ...cur, ...patch };
    if (next.to <= next.from) next.to = TIMES[Math.min(TIMES.length - 1, TIMES.indexOf(next.from) + 1)];
    setOfficeHours([...rest, next]);
  };
  const select = "h-10 rounded-[var(--radius-md)] border px-[10px] text-[14px] font-semibold tabular-nums outline-none";
  return (
    <ul className="flex w-full max-w-[520px] flex-col">
      {WEEKDAYS.map(([d, name]) => {
        const oh = value.find((o) => o.weekday === d);
        return (
          <li key={d} className="flex min-h-[52px] items-center gap-[var(--space-3)] border-b" style={{ borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
            <button type="button" role="switch" aria-checked={!!oh} aria-label={`${name} office hours`} onClick={() => set(d, oh ? null : {})}
              className="relative h-[24px] w-[42px] flex-none cursor-pointer rounded-full transition-colors" style={{ background: oh ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 18%, transparent)" }}>
              <span aria-hidden className="absolute top-[3px] size-[18px] rounded-full bg-white transition-[left]" style={{ left: oh ? 21 : 3 }} />
            </button>
            <span className="w-[96px] flex-none text-[15px] font-semibold" style={{ color: oh ? "var(--foreground)" : "var(--muted-foreground)" }}>{name}</span>
            {oh ? (
              <span className="flex items-center gap-[8px]">
                <select aria-label={`${name} from`} value={oh.from} onChange={(e) => set(d, { from: e.target.value })} className={select} style={FIELD}>{TIMES.slice(0, -1).map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</select>
                <span className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>to</span>
                <select aria-label={`${name} to`} value={oh.to} onChange={(e) => set(d, { to: e.target.value })} className={select} style={FIELD}>{TIMES.filter((t) => t > oh.from).map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</select>
              </span>
            ) : <span className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Off</span>}
          </li>
        );
      })}
    </ul>
  );
}

function SectionTitle({ title, line }: { title: string; line: string }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>{line}</p>
    </div>
  );
}

/** Who hears about a check-in alert word (src/lib/counselorOutbox.ts). */
function SafetyContactsSection() {
  const contacts = useSafetyContacts();
  const [draft, setDraft] = useState({ name: "", role: "", email: "" });
  return (
    <section aria-label="Safety contacts" className="flex min-w-0 flex-col gap-[var(--space-4)]">
      <SectionTitle title="Safety Contacts" line="They get an email when a check-in note uses an alert word." />
      <ul className="flex flex-col">
        {contacts.map((c) => (
          <li key={c.email} className="flex items-center gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE }}>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[15px] font-semibold">{c.name} <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>· {c.role}</span></span>
              <span className="truncate text-[13px]" style={{ color: "var(--muted-foreground)" }}>{c.email}</span>
            </span>
            <IconTip label="Remove"><button type="button" aria-label={`Remove ${c.name}`} onClick={() => setSafetyContacts(contacts.filter((x) => x.email !== c.email))} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button></IconTip>
          </li>
        ))}
        {!contacts.length && <li className="py-[10px] text-[14.5px] v5-warn">No one is set. Alerts only reach you.</li>}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); if (!draft.name.trim() || !draft.email.includes("@")) return; setSafetyContacts([...contacts, { name: draft.name.trim(), role: draft.role.trim() || "Staff", email: draft.email.trim() }]); setDraft({ name: "", role: "", email: "" }); }} className="flex flex-col gap-[var(--space-2)]">
        <div className="grid grid-cols-2 gap-[var(--space-2)]">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" aria-label="Contact name" className="h-10 min-w-0 rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14.5px] outline-none" style={FIELD} />
          <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" aria-label="Contact role" className="h-10 min-w-0 rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14.5px] outline-none" style={FIELD} />
        </div>
        <div className="flex gap-[var(--space-2)]">
          <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" aria-label="Contact email" className="h-10 min-w-0 flex-1 rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14.5px] outline-none" style={FIELD} />
          <button type="submit" className="dm-quiet inline-flex h-10 cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)" }}><Plus className="h-4 w-4" aria-hidden />Add</button>
        </div>
      </form>
    </section>
  );
}

/** The caseload from the school's student system (src/lib/counselorRosterSync.ts). */
function RosterSection() {
  const { lastSync, changes, reviewed } = useRosterSync();
  const [busy, setBusy] = useState(false);
  const open = changes.filter((c) => !reviewed.includes(c.id));
  const KIND: Record<string, { word: string; cls: string }> = { in: { word: "In", cls: "v5-ok" }, out: { word: "Out", cls: "v5-risk" }, moved: { word: "Moved", cls: "v5-warn" } };
  return (
    <section aria-label="Roster" className="flex min-w-0 flex-col gap-[var(--space-4)]">
      <SectionTitle title="Your Roster" line={`From ${ROSTER_SOURCE.system} through ${ROSTER_SOURCE.via}. ${ROSTER_SOURCE.schedule}.`} />
      <div className="flex flex-wrap items-center gap-[var(--space-3)] text-[14px]">
        <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>Last synced {lastSync.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
        <button type="button" disabled={busy} onClick={() => { setBusy(true); window.setTimeout(() => { syncNow(); setBusy(false); notify("Roster up to date"); }, 900); }} className="dm-link inline-flex cursor-pointer items-center gap-[6px] font-semibold disabled:opacity-60" style={{ color: "var(--accent)" }}><RefreshCw className={`h-[14px] w-[14px] ${busy ? "animate-spin" : ""}`} aria-hidden />{busy ? "Syncing" : "Sync now"}</button>
      </div>
      <span className="text-[13px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Changes this week · {open.length} to review</span>
      <ul className="flex flex-col">
        {changes.map((c) => {
          const done = reviewed.includes(c.id);
          return (
            <li key={c.id} className="flex items-start gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE, opacity: done ? 0.55 : 1 }}>
              <span className={`w-[48px] flex-none pt-[1px] text-[12.5px] font-semibold ${KIND[c.kind].cls}`}>{KIND[c.kind].word}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-semibold">{c.name} <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>· Grade {c.grade}</span></span>
                <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>{c.detail}</span>
              </span>
              {done ? <Check className="mt-[2px] h-4 w-4 flex-none v5-ok" aria-label="Reviewed" /> : <button type="button" onClick={() => markReviewed(c.id)} className="dm-link flex-none text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>Got it</button>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** What the app sent for the counselor: alerts and reports. */
function SentSection() {
  const outbox = useOutbox();
  return (
    <section aria-label="Sent for you" className="flex min-w-0 flex-col gap-[var(--space-4)]">
      <SectionTitle title="Sent for You" line="Alerts and reports the app sent on your behalf." />
      {outbox.length ? (
        <ul className="flex flex-col">
          {outbox.slice(0, 8).map((e) => (
            <li key={e.id} className="flex items-start gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE }}>
              {e.kind === "alert" ? <AlertTriangle className="mt-[2px] h-4 w-4 flex-none v5-risk" aria-hidden /> : <FileText className="mt-[2px] h-4 w-4 flex-none" style={{ color: "var(--accent)" }} aria-hidden />}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[14.5px] font-semibold">{e.subject}</span>
                <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{new Date(e.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · to {e.to.join(", ")}</span>
              </span>
              <span className="flex-none text-[12.5px] font-semibold v5-ok">Delivered</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>Nothing sent yet.</p>}
    </section>
  );
}
