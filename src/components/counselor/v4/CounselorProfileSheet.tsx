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
//
// 10 Oct 2026, Chandu: "Make the profile page full page. Redesign the thing,
// the student view ID card thing is good. Let's make that the identity of
// the profile ... left aligned on top, and the rest of the info stays in
// the column after it. The cover image etc can be the ID card's background.
// We'll need better options." So: the profile fills the screen; the ID card
// students see is the identity, top left and sticky, drawn on the chosen
// background; everything else is the column beside it (under it on a
// phone). The card shows what About Me used to (hours, topics, languages)
// plus the three numbers, so About Me is no longer a card of its own: Edit
// Profile opens one "Edit your card" panel at the head of the column with
// the background picker (the 21 cover photos and five calm colour washes)
// and the existing editors.

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Briefcase, Camera, Check, FileText, GraduationCap, ImageIcon, Mail, PenLine, Plus, RefreshCw, ShieldCheck, Upload, X } from "lucide-react";
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
// The ID card's backgrounds: the student app's cover photos, and calm
// washes for anyone who wants a plain card. All dark enough for white type.
const COVER_PHOTOS = ["ocean-aerial", "aurora-sky", "starry-sky", "galaxy-space", "nebula-color", "bokeh-blue", "bokeh-warm", "crystal-glass", "crystal-macro", "glass-refract", "prism-light", "gradient-glow", "desert-dunes", "fluid-paint", "ink-marble", "ink-swirl", "neon-streak", "neon-tunnel", "smoke", "smoke-color", "smoke-purple"].map((n) => `/images/profile/covers/${n}.webp`);
const COVER_WASHES: Record<string, string> = {
  ink: "linear-gradient(155deg,#25357d 0%,#0b1027 100%)",
  ocean: "linear-gradient(155deg,#0f5f8a 0%,#081a33 100%)",
  dusk: "linear-gradient(155deg,#5d2d8c 0%,#170d2e 100%)",
  forest: "linear-gradient(155deg,#17643a 0%,#081a12 100%)",
  ember: "linear-gradient(155deg,#a2401a 0%,#250b05 100%)",
};
const DEFAULT_COVER = COVER_PHOTOS[0];

/** A picked image file, shrunk on a canvas and kept as a JPEG data URL, so
 *  an upload stays small enough for the browser's card store (DEMO-ONLY:
 *  real profiles will upload to the account). */
function shrinkImage(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Not an image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
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
        <aside ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="My Profile" className="v4-profile-sheet is-page dm-scroll relative flex h-full w-full flex-col overflow-x-hidden overflow-y-auto outline-none" style={{ background: "var(--background)", borderColor: "var(--glass-border)", boxShadow: "-24px 0 60px -30px rgba(0,0,0,0.6)" }}>
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
  const card = useCounselorCard();
  const { topics, languages } = card;
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
  const photo = card.photo ?? PHOTO[name];
  const students = caseload(me.from, me.to);
  const stats = [
    { value: students, label: `Students ${me.range.replace("-", " to ")}`, href: "/counselor?view=students&v=4" },
    { value: thisWeek, label: thisWeek === 1 ? "Meeting this week" : "Meetings this week", href: "/counselor?view=meetings&v=4" },
    { value: officeHours.length, label: officeHours.length === 1 ? "Office-hours day" : "Office-hours days", href: null },
  ];

  const cover = card.cover ?? DEFAULT_COVER;
  const wash = cover.startsWith("gradient:") ? COVER_WASHES[cover.slice(9)] : null;
  // the contextual controls: change the photo from the photo, the
  // background from the card (10 Oct 2026, Chandu: "allow changing dp and
  // cover by controls that are contextually there")
  const photoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [pickingCover, setPickingCover] = useState(false);
  const upload = async (kind: "photo" | "cover", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await shrinkImage(file, kind === "photo" ? 480 : 1000);
      save(kind === "photo" ? { photo: url } : { cover: url });
      if (kind === "cover") setPickingCover(false);
      notify(kind === "photo" ? "Photo updated" : "Background updated");
    } catch { notify("That file couldn't be read. Try a JPG or PNG."); }
  };

  return (
    <div className="v4-cp-body">
      <div className="v4-cp-layout">
        {/* the identity: the card students see, on the chosen background */}
        <aside className="v4-cp-id-col" aria-label="Your card">
          {/* a premium lanyard, the lower part of it (10 Oct 2026, Chandu:
             "make it look like an ID card, a premium looking lanyard or part
             of it is nice"): a woven strap rising out of view, a polished
             swivel clip, and a punched slot in the card */}
          <div className="v4-cp-lanyard" aria-hidden><span className="v4-cp-strap" /><span className="v4-cp-clip"><i /></span></div>
          <section className="v4-cp-id" style={wash ? { background: wash } : undefined}>
            {!wash && <span className="v4-cp-id-art" aria-hidden><Image src={cover} alt="" fill sizes="380px" className="object-cover" priority unoptimized={cover.startsWith("data:")} /></span>}
            <span className="v4-cp-id-scrim" aria-hidden />
            <span className="v4-cp-id-slot" aria-hidden />
            <div className="v4-cp-id-top">
              <span className="v4-cp-id-org">{school}</span>
              <span className="v4-cp-id-tools">
                <IconTip label="Change background"><button type="button" aria-label="Change background" aria-expanded={pickingCover} onClick={() => setPickingCover((v) => !v)} className="v4-cp-id-icon dm-quiet"><ImageIcon className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>
                <button type="button" aria-pressed={editing} onClick={() => setEditing((e) => !e)} className="v4-cp-id-edit dm-quiet">
                  {editing ? <><Check className="h-[14px] w-[14px]" aria-hidden /> Done</> : <><PenLine className="h-[14px] w-[14px]" aria-hidden /> Edit Profile</>}
                </button>
              </span>
            </div>
            {pickingCover && <>
              <button type="button" aria-label="Close background picker" tabIndex={-1} className="v4-cp-pop-scrim" onClick={() => setPickingCover(false)} />
              <div className="v4-cp-pop" role="dialog" aria-label="Card background" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setPickingCover(false); } }}>
                <span className="v4-cp-covers-label">Colors</span>
                <div className="v4-cp-cover-grid is-washes">{Object.entries(COVER_WASHES).map(([k, g]) => { const v = `gradient:${k}`; return <button key={k} type="button" aria-pressed={cover === v} aria-label={`${k} wash`} onClick={() => save({ cover: v })} className="v4-cp-cover-pick dm-quiet" style={{ background: g }} />; })}</div>
                <span className="v4-cp-covers-label">Photos</span>
                <div className="v4-cp-cover-grid">{COVER_PHOTOS.map((src) => <button key={src} type="button" aria-pressed={cover === src} aria-label={src.split("/").pop()!.replace(".webp", "").replace(/-/g, " ")} onClick={() => save({ cover: src })} className="v4-cp-cover-pick dm-quiet" style={{ backgroundImage: `url(${src})` }} />)}</div>
                <button type="button" onClick={() => coverInput.current?.click()} className="v4-cp-cover-btn dm-quiet v4-cp-upload"><Upload className="h-[14px] w-[14px]" aria-hidden /> Upload your own</button>
              </div>
            </>}
            <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => { void upload("cover", e); }} />
            <span className="v4-cp-id-photo">
              {photo ? <Image src={photo} alt="" fill sizes="132px" className="object-cover" style={{ objectPosition: "50% 20%" }} unoptimized={photo.startsWith("data:")} /> : <span>{initialsOf(name)}</span>}
              <IconTip label="Change photo" className="v4-cp-photo-tip"><button type="button" aria-label="Change photo" onClick={() => photoInput.current?.click()} className="v4-cp-photo-btn"><Camera className="h-[20px] w-[20px]" aria-hidden /></button></IconTip>
              <input ref={photoInput} type="file" accept="image/*" hidden onChange={(e) => { void upload("photo", e); }} />
            </span>
            <div className="v4-cp-id-who">
              <h2>{name}</h2>
              <p>{role}</p>
            </div>
            <div className="v4-cp-id-facts">
              <div><span>Office hours</span><p>{hours}</p></div>
              {topics.length > 0 && <div><span>Ask me about</span><p className="v4-cp-id-chips">{topics.map((t) => <i key={t}>{t}</i>)}</p></div>}
              {languages && <div><span>Speaks</span><p>{languages}</p></div>}
            </div>
            <dl className="v4-cp-id-stats">
              {stats.map((s) => {
                const inner = <><dd>{s.value}</dd><dt>{s.label}</dt></>;
                return <div key={s.label}>{s.href ? <Link href={s.href} onClick={onClose} className="dm-quiet">{inner}</Link> : <button type="button" className="dm-quiet" onClick={() => setEditing(true)}>{inner}</button>}</div>;
              })}
            </dl>
          </section>
          <p className="v4-cp-muted v4-cp-id-note">Students see this card when they book you.</p>
        </aside>

        <div className="v4-cp-main">
          {editing && (
            <section className="v4-cp-card" aria-label="Edit your card">
              <header className="v4-cp-card-head">
                <h3>Edit Your Card</h3>
                <span role="status" className="v4-cp-saved" style={{ opacity: saved ? 1 : 0 }}>{saved && <><Check className="h-[14px] w-[14px]" aria-hidden />Saved</>}</span>
              </header>
              <div className="v4-cp-field">
                <span className="v4-cp-label">Office Hours</span>
                <HoursEditor value={officeHours} onSaved={flash} />
              </div>
              <div className="v4-cp-field">
                <span className="v4-cp-label">Ask Me About</span>
                <div className="v4-cp-chips">
                  {SUGGESTED.map((t) => {
                    const on = topics.includes(t);
                    return (
                      <button key={t} type="button" aria-pressed={on} onClick={() => save({ topics: on ? topics.filter((x) => x !== t) : [...topics, t].slice(-4) })} className={`v4-cp-chip dm-quiet${on ? " is-on" : ""}`}>
                        {t}{on && <X className="h-[13px] w-[13px]" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="v4-cp-field">
                <span className="v4-cp-label">Languages</span>
                <input value={languages} onChange={(e) => save({ languages: e.target.value })} aria-label="Languages" className="v4-cp-input" />
              </div>
            </section>
          )}

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
