"use client";

// The counselor's own profile in v4 (9 Oct 2026, Maisha: "Add the clickable
// counselor profile to v4"; same day, on the first version: "This should
// look cooler. Closer to how the Connect professional profiles do. Just
// different info"). Built in the student app's professional-profile
// language (src/components/connect/ProProfile.tsx): a cover photo with the
// portrait, name and role on it and three numbers under them, then
// connected cards. The information is the counselor's: office hours, what
// to ask them about, languages, the caseload (students A to H), the team
// for handoffs, and the card students see when they book.
// Reads as a profile first; Edit Profile on the cover turns the About Me
// card into v5's editors (office-hours switches, topic chips, languages),
// writing to the same stores v5's Profile used (counselorMeetings.ts,
// counselorCard.ts), so an edit made in either build is the same card.
// No lanyard strap (v5's ID-badge look): the preview is a plain card.
// v5 Profile's back-office pieces stay, as quiet cards under My Team
// (Chandu, 9 Oct 2026: "we can include stuff like safety contacts, roster
// sync, sent for you etc in case she didn't explicitly ask for them to be
// removed"): who hears about an alert, where the caseload comes from, and
// what the app sent for you, reading the same stores v5 reads.
// Opens from the account chip in the top bar; the role switcher the chip
// used to open sits in the sheet's bar, so the demo still changes roles in
// two clicks. Portalled like v5's LogSheet, inside a v4-embed wrapper so
// v4's tokens resolve outside the workspace tree. role=dialog with
// aria-modal, so Back and Escape close it (backStep.ts).

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Briefcase, Check, FileText, GraduationCap, Mail, PenLine, Plus, RefreshCw, ShieldCheck, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { SCHOOL_COUNSELORS } from "@/lib/counselorOrg";
import { updateCounselorCard, useCounselorCard } from "@/lib/counselorCard";
import { officeHoursLabel, setOfficeHours, timeLabel, useOfficeHours, type OfficeHours } from "@/lib/counselorMeetings";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { endCoverage, startCoverage, useCoverage } from "@/lib/counselorCoverage";
import { setSafetyContacts, useOutbox, useSafetyContacts } from "@/lib/counselorOutbox";
import { ROSTER_SOURCE, markReviewed, syncNow, useRosterSync } from "@/lib/counselorRosterSync";
import { useShares } from "@/lib/counselorShares";
import { notify } from "../v5/LogSheet";
import { useMeetings } from "../v5/Prepare";
import { Listbox } from "./Listbox";
import { useDialogFocus } from "./useDialogFocus";
import "../v5/v5.css";
import "./profileSheet.css";

const noop = () => () => {};
// DEMO-ONLY: counselors are adults, so a real photo, picked from Connect's
// headshots until counselor photos are stored; a counselor with no photo
// shows initials. The cover is one of the student app's own cover photos.
const PHOTO: Record<string, string | undefined> = {
  "Sarah Chen": "/images/connect/avatars/pro-tanaka.jpg",
  "Renee Alvarez": "/images/connect/avatars/pro-martinez.jpg",
};
const COVER = "/images/profile/covers/ocean-aerial.webp";
// DEMO-ONLY: teammates' card details until counselor profiles are stored
const TEAM_CARD: Record<string, { hours: string; topics: string[]; email: string }> = {
  "Daniel Okafor": { hours: "Tue and Thu, 1 to 3 PM", topics: ["Trades", "Military"], email: "dokafor@lincolnhs.org" },
  "Renee Alvarez": { hours: "Mon and Wed, 9 to 11 AM", topics: ["Financial aid", "Scholarships"], email: "ralvarez@lincolnhs.org" },
};
/** A teammate's school email, made from their name when none is on file. */
const emailFor = (name: string) => TEAM_CARD[name]?.email ?? `${name.split(" ")[0][0]}${name.split(" ").slice(-1)[0]}@lincolnhs.org`.toLowerCase();
const SUGGESTED = ["Applications", "Financial aid", "Course planning", "Careers", "Scholarships", "Trades", "Stress and wellbeing"];
const initialsOf = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const lastInitial = (name: string) => { const parts = name.trim().split(/\s+/); return (parts[parts.length - 1]?.[0] ?? "Z").toUpperCase(); };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function CounselorProfileSheet({ open, onClose, name, role, header }: { open: boolean; onClose: () => void; name: string; role: string; /** shown left of the close button (the role switcher) */ header?: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  useDialogFocus(open, panel, onClose);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!open || !mounted) return null;
  return createPortal(
    <div className="v4-embed marketing-v2 themeable counselor-calm" data-counselor-version="v4" style={{ color: "var(--foreground)" }}>
      <div className="fixed inset-0 z-[90] flex justify-end">
        <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.55)", backdropFilter: "blur(2px)" }} />
        <aside ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="My Profile" className="v4-profile-sheet dm-scroll relative flex h-full w-full max-w-[1120px] flex-col overflow-x-hidden overflow-y-auto border-l outline-none" style={{ background: "var(--background)", borderColor: "var(--glass-border)", boxShadow: "-24px 0 60px -30px rgba(0,0,0,0.6)" }}>
          <div className="v4-cp-bar">
            <span className="v4-overline">My Profile</span>
            <div className="v4-profile-sheet-tools">
              {header}
              <IconTip label="Close">
                <button type="button" onClick={onClose} aria-label="Close profile" className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ color: "var(--foreground)", borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <X className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </IconTip>
            </div>
          </div>
          <ProfileBody name={name} role={role} onClose={onClose} />
        </aside>
      </div>
    </div>,
    document.body,
  );
}

function ProfileBody({ name, role, onClose }: { name: string; role: string; onClose: () => void }) {
  const roster = useReviewedRoster();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const school = account.school || DEMO_SCHOOL;
  const me = SCHOOL_COUNSELORS.find((c) => c.name === name) ?? SCHOOL_COUNSELORS[0];
  const team = SCHOOL_COUNSELORS.filter((c) => c.id !== me.id);
  const caseload = (from: string, to: string) => roster.filter((s) => { const c = lastInitial(s.name); return c >= from && c <= to; }).length;
  // office hours set here are the ones the calendar and the booking sheet
  // offer (the shared store in counselorMeetings)
  const officeHours = useOfficeHours();
  const hours = officeHoursLabel(officeHours);
  const { topics, languages } = useCounselorCard();
  const meetings = useMeetings(roster);
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4);
  const thisWeek = meetings.filter((m) => m.day >= iso(monday) && m.day <= iso(friday)).length;
  const [editing, setEditing] = useState(false);
  // a short "Saved" beside the heading after each change
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const flash = () => { setSaved(true); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setSaved(false), 1800); };
  const save = (patch: Parameters<typeof updateCounselorCard>[0]) => { updateCounselorCard(patch); flash(); };
  const photo = PHOTO[name];
  const students = caseload(me.from, me.to);
  const stats = [
    { value: students, label: `Students ${me.range.replace("-", " to ")}`, href: "/counselor?view=students&v=4" },
    { value: thisWeek, label: thisWeek === 1 ? "Meeting this week" : "Meetings this week", href: "/counselor?view=meetings&v=4" },
    { value: officeHours.length, label: officeHours.length === 1 ? "Office-hours day" : "Office-hours days", href: null },
  ];

  return (
    <div className="v4-cp-body">
      {/* the cover: portrait, name and role on the photo, three numbers under
         them, the profile's own control top right (ProProfile's own page
         puts Edit Profile with Cover) */}
      <section className="v4-cp-cover" aria-label="Profile">
        <div className="v4-cp-cover-art" aria-hidden>
          <Image src={COVER} alt="" fill sizes="(max-width: 1120px) 100vw, 1120px" className="object-cover" style={{ objectPosition: "50% 40%" }} priority />
          <span className="v4-cp-scrim" />
        </div>
        <div className="v4-cp-cover-tools">
          <button type="button" aria-pressed={editing} onClick={() => setEditing((e) => !e)} className="dm-quiet">
            {editing ? <><Check className="h-[14px] w-[14px]" aria-hidden /> Done</> : <><PenLine className="h-[14px] w-[14px]" aria-hidden /> Edit Profile</>}
          </button>
        </div>
        <div className="v4-cp-identity">
          <span className="v4-cp-portrait">
            {photo ? <Image src={photo} alt="" fill sizes="104px" className="object-cover" style={{ objectPosition: "50% 20%" }} /> : <span>{initialsOf(name)}</span>}
          </span>
          <div className="v4-cp-who">
            <h2>{name}</h2>
            <p>{role}<span aria-hidden>|</span>{school}</p>
            <dl className="v4-cp-stats">
              {stats.map((s) => {
                const inner = <><dd>{s.value}</dd><dt>{s.label}</dt></>;
                return <div key={s.label}>{s.href ? <Link href={s.href} onClick={onClose} className="dm-quiet">{inner}</Link> : <button type="button" className="dm-quiet" onClick={() => setEditing(true)}>{inner}</button>}</div>;
              })}
            </dl>
          </div>
        </div>
      </section>

      <div className="v4-cp-grid">
        <div className="v4-cp-main">
          <section className="v4-cp-card" aria-label="About me">
            <header className="v4-cp-card-head">
              <h3>About Me</h3>
              <span role="status" className="v4-cp-saved" style={{ opacity: saved ? 1 : 0 }}>{saved && <><Check className="h-[14px] w-[14px]" aria-hidden />Saved</>}</span>
            </header>
            <div className="v4-cp-field">
              <span className="v4-cp-label">Office Hours</span>
              {editing ? <HoursEditor value={officeHours} onSaved={flash} /> : <p>{hours}</p>}
            </div>
            <div className="v4-cp-field">
              <span className="v4-cp-label">Ask Me About</span>
              <div className="v4-cp-chips">
                {(editing ? SUGGESTED : topics).map((t) => {
                  const on = topics.includes(t);
                  if (!editing) return <span key={t} className="v4-cp-chip is-on">{t}</span>;
                  return (
                    <button key={t} type="button" aria-pressed={on} onClick={() => save({ topics: on ? topics.filter((x) => x !== t) : [...topics, t].slice(-4) })} className={`v4-cp-chip dm-quiet${on ? " is-on" : ""}`}>
                      {t}{on && <X className="h-[13px] w-[13px]" aria-hidden />}
                    </button>
                  );
                })}
                {!editing && !topics.length && <span className="v4-cp-muted">Nothing picked yet.</span>}
              </div>
            </div>
            <div className="v4-cp-field">
              <span className="v4-cp-label">Languages</span>
              {editing ? <input value={languages} onChange={(e) => save({ languages: e.target.value })} aria-label="Languages" className="v4-cp-input" /> : <p>{languages || "Not set yet."}</p>}
            </div>
          </section>

          {/* the team, for handoffs: who covers which students, one tap to
             email, one tap to cover for them today (v5's Coverage) */}
          <section className="v4-cp-card" aria-label="My team">
            <header className="v4-cp-card-head">
              <h3>My Team</h3>
              <p>Who covers which students, for handoffs.</p>
            </header>
            <ul className="v4-cp-team">
              {team.map((c) => <TeamRow key={c.id} name={c.name} range={c.range} students={caseload(c.from, c.to)} />)}
            </ul>
          </section>

          {/* the pieces a counselor sets once, quieter than the profile
             above (v5 Profile's three back-office sections) */}
          <SafetyContactsCard />
          <RosterCard />
          <SentCard />
        </div>

        {/* the live preview: what students see when they book or find the
           counselor in Connect */}
        <aside className="v4-cp-preview" aria-label="What students see">
          <span className="v4-overline">What Students See</span>
          <div className="v4-cp-badge">
            <span className="v4-cp-badge-photo">
              {photo ? <Image src={photo} alt="" fill sizes="320px" className="object-cover" style={{ objectPosition: "50% 20%" }} /> : <span>{initialsOf(name)}</span>}
            </span>
            <div className="v4-cp-badge-body">
              <strong>{name}</strong>
              <small>{role} · {school}</small>
              <span className="v4-cp-badge-line"><b>Office hours</b>{hours}</span>
              {topics.length > 0 && <span className="v4-cp-chips">{topics.map((t) => <span key={t} className="v4-cp-chip is-small">{t}</span>)}</span>}
              {languages && <span className="v4-cp-muted">Speaks {languages}</span>}
              <span className="v4-cp-badge-foot"><span>Students {me.range}</span><span>{students}</span></span>
            </div>
          </div>
          <p className="v4-cp-muted">Students see this when they book you.</p>
        </aside>
      </div>
    </div>
  );
}

function TeamRow({ name, range, students }: { name: string; range: string; students: number }) {
  const coverage = useCoverage();
  const covering = coverage?.name === name;
  const photo = PHOTO[name];
  const card = TEAM_CARD[name];
  const first = name.split(" ")[0];
  return (
    <li className="v4-cp-mate">
      <span className="v4-cp-mate-photo">{photo ? <Image src={photo} alt="" fill sizes="48px" className="object-cover" style={{ objectPosition: "50% 20%" }} /> : <span>{initialsOf(name)}</span>}</span>
      <span className="v4-cp-mate-who">
        <strong>{name}</strong>
        <small>Students {range} · {students}{card ? ` · ${card.hours}` : ""}</small>
        {card && <span className="v4-cp-chips">{card.topics.map((t) => <span key={t} className="v4-cp-chip is-small">{t}</span>)}</span>}
      </span>
      <span className="v4-cp-mate-actions">
        <IconTip label={`Email ${first}`}><a href={`mailto:${emailFor(name)}`} aria-label={`Email ${name}`} className="v4-round dm-quiet"><Mail size={16} aria-hidden /></a></IconTip>
        <button type="button" aria-pressed={covering} onClick={() => { if (covering) { endCoverage(); notify("Coverage ended"); } else { startCoverage(name); notify(`Covering for ${name} today`); } }} className={`v4-cp-cover-btn${covering ? " is-on" : " dm-quiet"}`}>
          <ShieldCheck size={15} aria-hidden /> {covering ? "Covering today" : `Cover for ${first}`}
        </button>
      </span>
    </li>
  );
}

// Office hours by weekday (7 Oct 2026: hours set on Profile drive the booking
// slots and the calendar). One row a day: a switch, then from and to, as
// v4 Listboxes (a native <select> leaks OS chrome on Windows and
// Chromebooks; docs/CROSS_BROWSER_GUARDRAILS.md).
const TIMES = Array.from({ length: 21 }, (_, i) => { const t = 7 * 60 + i * 30; return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; });
const WEEKDAYS: [number, string][] = [[1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"]];

function HoursEditor({ value, onSaved }: { value: OfficeHours; onSaved: () => void }) {
  const set = (weekday: number, patch: Partial<{ from: string; to: string }> | null) => {
    const rest = value.filter((o) => o.weekday !== weekday);
    if (patch === null) { setOfficeHours(rest); onSaved(); return; }
    const cur = value.find((o) => o.weekday === weekday) ?? { weekday, from: "10:00", to: "11:30" };
    const next = { ...cur, ...patch };
    if (next.to <= next.from) next.to = TIMES[Math.min(TIMES.length - 1, TIMES.indexOf(next.from) + 1)];
    setOfficeHours([...rest, next]);
    onSaved();
  };
  const panel = { background: "var(--card)", color: "var(--foreground)" };
  return (
    <ul className="v4-cp-hours">
      {WEEKDAYS.map(([d, name]) => {
        const oh = value.find((o) => o.weekday === d);
        return (
          <li key={d}>
            <button type="button" role="switch" aria-checked={!!oh} aria-label={`${name} office hours`} onClick={() => set(d, oh ? null : {})} className="v4-cp-switch" data-on={oh ? "true" : "false"}>
              <span aria-hidden />
            </button>
            <span className="v4-cp-day" style={{ color: oh ? "var(--foreground)" : "var(--muted-foreground)" }}>{name}</span>
            {oh ? (
              <span className="v4-cp-times">
                <Listbox ariaLabel={`${name} from`} value={oh.from} onChange={(v) => set(d, { from: v })} options={TIMES.slice(0, -1).map((t) => ({ value: t, label: timeLabel(t) }))} className="v4-cp-time" panelStyle={panel} />
                <span className="v4-cp-muted">to</span>
                <Listbox ariaLabel={`${name} to`} value={oh.to} onChange={(v) => set(d, { to: v })} options={TIMES.filter((t) => t > oh.from).map((t) => ({ value: t, label: timeLabel(t) }))} className="v4-cp-time" panelStyle={panel} />
              </span>
            ) : <span className="v4-cp-muted">Off</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Who hears about an alert word in a student's note (src/lib/counselorOutbox.ts). */
function SafetyContactsCard() {
  const contacts = useSafetyContacts();
  const [draft, setDraft] = useState({ name: "", role: "", email: "" });
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.email.includes("@")) return;
    setSafetyContacts([...contacts, { name: draft.name.trim(), role: draft.role.trim() || "Staff", email: draft.email.trim() }]);
    setDraft({ name: "", role: "", email: "" });
  };
  return (
    <section className="v4-cp-card is-quiet" aria-label="Safety contacts">
      <header className="v4-cp-card-head"><h3>Safety Contacts</h3><p>They get an email when a student&apos;s note uses an alert word.</p></header>
      <ul className="v4-cp-rows">
        {contacts.map((c) => (
          <li key={c.email}>
            <span className="v4-cp-row-text"><strong>{c.name} <small>· {c.role}</small></strong><small>{c.email}</small></span>
            <IconTip label="Remove"><button type="button" aria-label={`Remove ${c.name}`} onClick={() => setSafetyContacts(contacts.filter((x) => x.email !== c.email))} className="v4-round dm-quiet"><X size={15} aria-hidden /></button></IconTip>
          </li>
        ))}
        {!contacts.length && <li className="v4-cp-row-note">No one is set. Alerts only reach you.</li>}
      </ul>
      <form onSubmit={add} className="v4-cp-add">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" aria-label="Contact name" className="v4-cp-input" />
        <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" aria-label="Contact role" className="v4-cp-input" />
        <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" aria-label="Contact email" className="v4-cp-input" />
        <button type="submit" className="v4-cp-cover-btn dm-quiet"><Plus size={15} aria-hidden />Add</button>
      </form>
    </section>
  );
}

/** The caseload from the school's student system (src/lib/counselorRosterSync.ts). */
function RosterCard() {
  const { lastSync, changes, reviewed } = useRosterSync();
  const [busy, setBusy] = useState(false);
  const open = changes.filter((c) => !reviewed.includes(c.id));
  const KIND: Record<string, { word: string; color: string }> = { in: { word: "In", color: "var(--v4-positive)" }, out: { word: "Out", color: "var(--destructive)" }, moved: { word: "Moved", color: "var(--v4-caution)" } };
  return (
    <section className="v4-cp-card is-quiet" aria-label="My roster">
      <header className="v4-cp-card-head">
        <h3>My Roster</h3>
        <button type="button" disabled={busy} onClick={() => { setBusy(true); window.setTimeout(() => { syncNow(); setBusy(false); notify("Roster up to date"); }, 900); }} className="v4-cp-cover-btn dm-quiet"><RefreshCw size={14} aria-hidden className={busy ? "animate-spin" : ""} />{busy ? "Syncing" : "Sync now"}</button>
        <p>From {ROSTER_SOURCE.system} through {ROSTER_SOURCE.via}. {ROSTER_SOURCE.schedule}. Last synced {lastSync.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}.</p>
      </header>
      <span className="v4-cp-label">Changes this week · {open.length} to review</span>
      <ul className="v4-cp-rows">
        {changes.map((c) => {
          const done = reviewed.includes(c.id);
          return (
            <li key={c.id} style={{ opacity: done ? 0.55 : 1 }}>
              <span className="v4-cp-kind" style={{ color: KIND[c.kind].color }}>{KIND[c.kind].word}</span>
              <span className="v4-cp-row-text"><strong>{c.name} <small>· Grade {c.grade}</small></strong><small>{c.detail}</small></span>
              {done ? <Check size={16} aria-label="Reviewed" style={{ color: "var(--v4-positive)" }} /> : <button type="button" onClick={() => markReviewed(c.id)} className="v4-cp-link">Got it</button>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** What the app sent for the counselor: alerts, reports and Explore shares, newest first. */
function SentCard() {
  const outbox = useOutbox();
  const shares = useShares();
  const [all, setAll] = useState(false);
  const when = (at: string) => new Date(at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const items = [
    ...outbox.map((e) => ({ id: e.id, at: e.at, icon: e.kind === "alert" ? "alert" : "report", title: e.subject, line: `${when(e.at)} · to ${e.to.join(", ")}`, word: "Delivered" })),
    ...shares.map((sh) => ({ id: sh.id, at: sh.at, icon: sh.kind, title: sh.title, line: `${when(sh.at)} · to ${sh.studentIds.length <= 2 ? sh.studentNames.join(" and ") : `${sh.studentIds.length} students`}`, word: "Shared" })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const shown = all ? items.slice(0, 12) : items.slice(0, 3);
  return (
    <section className="v4-cp-card is-quiet" aria-label="Sent for you">
      <header className="v4-cp-card-head">
        <h3>Sent for You</h3>
        {items.length > 3 && <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="v4-cp-link">{all ? "Show less" : `View all ${items.length}`}</button>}
        <p>Alerts, reports and what you shared from Explore.</p>
      </header>
      {items.length ? (
        <ul className="v4-cp-rows">
          {shown.map((e) => {
            const Icon = e.icon === "alert" ? AlertTriangle : e.icon === "career" ? Briefcase : e.icon === "school" ? GraduationCap : FileText;
            return (
              <li key={e.id}>
                <Icon size={16} aria-hidden style={{ color: e.icon === "alert" ? "var(--destructive)" : "var(--primary)", flex: "none" }} />
                <span className="v4-cp-row-text"><strong>{e.title}</strong><small>{e.line}</small></span>
                <span className="v4-cp-kind" style={{ color: "var(--v4-positive)", width: "auto" }}>{e.word}</span>
              </li>
            );
          })}
        </ul>
      ) : <p className="v4-cp-muted">Nothing sent yet.</p>}
    </section>
  );
}
