"use client";

// Prepare > Review, In progress and Missed deadline, as a nudge session
// (10 Oct 2026, Chandu: "the subtabs in reviews also need super engaging
// and exciting like we did for awaiting me just now"). Before: one hairline
// row per draft, 105 of them, the same student three times in a row, the
// same "Send a reminder" button on every line. Now, the same idea as the
// Awaiting me session:
// - One card per student, their drafts as chips, one Nudge that reminds
//   them about all of them (the store still records one reminder per
//   milestone, so the profile and Sent tab read the same as before).
// - A nudge you can feel: a stamp, a burst and a chime on the card, which
//   then reads "Nudged today".
// - Progress you can see: "12 of 48 nudged today", a SparkBar, Dreamy
//   across the hero's edge, and a fanfare when everyone has one.
// - Nothing sends unread (Chandu, same day: "What do the nudges say? I
//   think there should be some sort of review process and also a bulk
//   action like now but content would need to be seen first"). Nudge
//   turns the card into Dreamy's draft, addressed to the student and
//   naming their drafts, editable, with Send. "Nudge all" opens a review:
//   the note with {first} and {drafts} filled in per student, a preview
//   you can step through, and the list of who gets it, before one Send.
// Students nobody has nudged today come first; the order is fixed when the
// tab opens, so a card never jumps away from under the pointer.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { playFanfare, playSelect } from "@/components/play/sound";
import { cv } from "@/lib/counselorBase";
import type { CounselorStudent, MilestoneKey } from "@/lib/counselorRoster";
import { lastReminder, reminderDate, sendNudge, useReminders, type Reminder } from "@/lib/counselorReminders";
import { StudentFace } from "../v5/StudentFace";
import { DreamyMoment } from "./overviewShared";
import { GlassesDreamy } from "./InsightCharts";

type Row = { s: CounselorStudent; k: MilestoneKey };
type Group = { s: CounselorStudent; ks: MilestoneKey[] };

/** Dreamy's note. {first} and {drafts} are filled in per student. DEMO-ONLY
 *  wording until drafts come from the model. */
const TEMPLATE = {
  progress: "Hi {first}, you're close on {drafts}. Open My Plan to finish, or reply if you need help.",
  missed: "Hi {first}, the deadline for {drafts} has passed. That's okay. Open My Plan to catch up this week, or reply and we can make a plan.",
};
/** "your Resume", "your Resume and Career Report", "your Resume, Career
 *  Report and 3 more drafts" */
function draftsPhrase(ks: MilestoneKey[]): string {
  if (ks.length <= 2) return `your ${ks.join(" and ")}`;
  if (ks.length === 3) return `your ${ks[0]}, ${ks[1]} and ${ks[2]}`;
  return `your ${ks[0]}, ${ks[1]} and ${ks.length - 2} more drafts`;
}
const fill = (template: string, g: Group) => template.replaceAll("{first}", g.s.name.split(" ")[0]).replaceAll("{drafts}", draftsPhrase(g.ks));

export function NudgeSession({ rows, kind }: { rows: Row[]; kind: "progress" | "missed" }) {
  const reminders = useReminders();
  const [today] = useState(() => new Date().toDateString());
  const [bursts, setBursts] = useState<Record<string, number>>({});
  const [composing, setComposing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState(false);
  const [allBurst, setAllBurst] = useState(0);

  const isToday = (r?: Reminder) => !!r && new Date(r.at).toDateString() === today;
  const nudgedToday = (g: Group) => g.ks.every((k) => isToday(lastReminder(reminders, g.s.id, k)));

  const groups = useMemo<Group[]>(() => {
    const by = new Map<string, Group>();
    for (const { s, k } of rows) {
      const g = by.get(s.id) ?? { s, ks: [] };
      g.ks.push(k);
      by.set(s.id, g);
    }
    return [...by.values()];
  }, [rows]);
  // the order is set once, when the tab opens: not yet nudged today first
  const [order] = useState(() => {
    const done = (g: Group) => g.ks.every((k) => { const r = lastReminder(reminders, g.s.id, k); return !!r && new Date(r.at).toDateString() === new Date().toDateString(); });
    return [...groups].sort((a, b) => Number(done(a)) - Number(done(b))).map((g) => g.s.id);
  });
  const sorted = useMemo(() => {
    const at = new Map(order.map((id, i) => [id, i]));
    return [...groups].sort((a, b) => (at.get(a.s.id) ?? 999) - (at.get(b.s.id) ?? 999));
  }, [groups, order]);

  const done = sorted.filter(nudgedToday).length;
  const left = sorted.length - done;
  const missed = kind === "missed";

  const send = (g: Group) => {
    const text = (notes[g.s.id] ?? fill(TEMPLATE[kind], g)).trim();
    if (!text) return;
    const last = left === 1 && !nudgedToday(g);
    sendNudge([{ id: g.s.id, milestones: g.ks }], text, `${g.s.name} · ${g.ks.join(", ")}`);
    setComposing(null);
    setBursts((b) => ({ ...b, [g.s.id]: (b[g.s.id] ?? 0) + 1 }));
    if (last) playFanfare(); else playSelect();
  };
  const sendAll = (groups: Group[], template: string) => {
    sendNudge(groups.map((g) => ({ id: g.s.id, milestones: g.ks })), template, `${groups.length} ${groups.length === 1 ? "student" : "students"} · ${missed ? "Missed deadline" : "In progress"}`);
    setReviewing(false);
    setAllBurst((n) => n + 1);
    playFanfare();
  };

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] py-[var(--space-12)] text-center">
        <DreamyMoment mood="celebrate" size={72} />
        <p className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{missed ? "No missed deadlines." : "Nobody has a draft in progress."}</p>
      </div>
    );
  }

  const pct = Math.round((done / sorted.length) * 100);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <section className="v4-ns-hero" aria-label="Nudge session">
        <span className="v4-ns-dreamy"><GlassesDreamy size={52} pop={1.9} thinking={!!composing || reviewing} hop={allBurst + Object.values(bursts).reduce((a, b) => a + b, 0)} /></span>
        <LocalBurst nonce={allBurst} />
        <div className="v4-ns-hero-copy">
          <h2 className="v4-ns-title">{left === 0 ? "Everyone has a nudge" : missed ? "Help them catch up" : "Give them a nudge to send"}</h2>
          <p className="v4-ns-sub">{left === 0 ? "Dreamy will tell you who sends next." : "Dreamy drafts each note. You read it before it sends."}</p>
        </div>
        <div className="v4-ns-progress" role="status" aria-live="polite">
          <span><b>{done} of {sorted.length}</b> nudged today</span>
          <SparkBar percent={Math.max(pct, 0)} min={2} height={6} fill="linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))" glow="var(--primary)" memoryKey={`v4-nudge-${kind}`} />
        </div>
        {left > 0 && <button type="button" onClick={() => setReviewing(true)} className="v4-ns-btn is-solid dm-solid"><Bell className="h-4 w-4" aria-hidden />Review and nudge all {left}</button>}
      </section>

      <ul className="v4-ns-grid">
        {sorted.map((g) => {
          const on = nudgedToday(g);
          const latest = g.ks.flatMap((k) => { const r = lastReminder(reminders, g.s.id, k); return r ? [r] : []; }).sort((a, b) => (a.at < b.at ? 1 : -1))[0];
          const shown = g.ks.slice(0, 3);
          return (
            <li key={g.s.id} className={`v4-ns-card ${on ? "is-done" : ""}`}>
              <LocalBurst nonce={bursts[g.s.id] ?? 0} />
              {on && bursts[g.s.id] ? <span className="v4-ns-stamp" aria-hidden>Nudged</span> : null}
              <Link href={`${cv("students")}&studentId=${encodeURIComponent(g.s.id)}`} className="v4-ns-who dm-quiet">
                <StudentFace s={g.s} size={48} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{g.s.name}</span>
                  <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {g.s.grade} · {g.ks.length} {missed ? "missed" : g.ks.length === 1 ? "draft" : "drafts"}</span>
                </span>
              </Link>
              {composing === g.s.id ? (
                <div className="v4-ns-compose">
                  <label className="flex flex-col gap-[6px]">
                    <span className="v4-ns-compose-head">Dreamy drafted this. Change anything.</span>
                    <textarea autoFocus rows={4} value={notes[g.s.id] ?? fill(TEMPLATE[kind], g)} onChange={(e) => setNotes((n) => ({ ...n, [g.s.id]: e.target.value }))} className="v4-ns-textarea" />
                  </label>
                  <span className="flex justify-end gap-[8px]">
                    <button type="button" onClick={() => setComposing(null)} className="v4-ns-btn dm-quiet">Cancel</button>
                    <button type="button" onClick={() => send(g)} className="v4-ns-btn is-solid is-sm dm-solid"><Send className="h-[14px] w-[14px]" aria-hidden />Send nudge</button>
                  </span>
                </div>
              ) : (<>
              <span className="v4-ns-chips">
                {shown.map((k) => <span key={k} className={`v4-ns-chip ${missed ? "is-missed" : ""}`}>{k}</span>)}
                {g.ks.length > shown.length && <span className="v4-ns-chip is-more">+{g.ks.length - shown.length}</span>}
              </span>
              <span className="v4-ns-foot">
                <span className="v4-ns-when">{on ? <><Check className="h-[14px] w-[14px]" aria-hidden />Nudged today</> : latest ? `Last nudge ${reminderDate(latest)}` : "No nudge yet"}</span>
                {on
                  ? <button type="button" onClick={() => setComposing(g.s.id)} className="v4-ns-again dm-link">Nudge again</button>
                  : <button type="button" onClick={() => setComposing(g.s.id)} className="v4-ns-btn dm-quiet"><Bell className="h-[14px] w-[14px]" aria-hidden />Nudge</button>}
              </span>
              </>)}
            </li>
          );
        })}
      </ul>
      {reviewing && <BulkReview groups={sorted.filter((g) => !nudgedToday(g))} kind={kind} onCancel={() => setReviewing(false)} onSend={sendAll} />}
    </div>
  );
}

/** Review before a bulk nudge: the note (editable, with {first} and
 *  {drafts}), a preview per student you can step through, and who gets it
 *  (untick anyone). Nothing sends until Send. */
function BulkReview({ groups, kind, onCancel, onSend }: { groups: Group[]; kind: "progress" | "missed"; onCancel: () => void; onSend: (groups: Group[], template: string) => void }) {
  const [template, setTemplate] = useState(TEMPLATE[kind]);
  const [off, setOff] = useState<Set<string>>(() => new Set());
  const [at, setAt] = useState(0);
  const [showList, setShowList] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const picked = groups.filter((g) => !off.has(g.s.id));
  const g = picked[Math.min(at, Math.max(0, picked.length - 1))];
  useEffect(() => {
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  const insert = (token: string) => {
    const el = box.current;
    const from = el?.selectionStart ?? template.length;
    const to = el?.selectionEnd ?? template.length;
    setTemplate(template.slice(0, from) + token + template.slice(to));
  };
  return (
    <>
      <div className="v4-ns-scrim" onClick={onCancel} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="v4-ns-review-title" className="v4-ns-review">
        <IconTip label="Close" className="v4-ns-review-close"><button type="button" onClick={onCancel} aria-label="Close" className="dm-quiet"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        <div className="v4-ns-review-head">
          <span className="v4-ns-review-dreamy"><GlassesDreamy size={44} pop={2} thinking /></span>
          <h2 id="v4-ns-review-title" className="v4-ns-title">Read before you send</h2>
          <p className="v4-ns-sub">One note each. Dreamy fills in each name and their drafts.</p>
        </div>

        <label className="flex flex-col gap-[8px]">
          <span className="v4-ns-label">The note</span>
          <textarea ref={box} rows={3} value={template} onChange={(e) => setTemplate(e.target.value)} className="v4-ns-textarea" />
        </label>
        <span className="flex flex-wrap items-center gap-[8px]">
          <button type="button" onClick={() => insert("{first}")} className="v4-ns-token dm-quiet">+ First name</button>
          <button type="button" onClick={() => insert("{drafts}")} className="v4-ns-token dm-quiet">+ Their drafts</button>
        </span>

        {g && (
          <div className="v4-ns-preview">
            <span className="flex items-center justify-between gap-[8px]">
              <span className="v4-ns-label">What {g.s.name.split(" ")[0]} gets</span>
              <span className="v4-ns-step">
                <IconTip label="Previous"><button type="button" onClick={() => setAt((i) => Math.max(0, i - 1))} disabled={at === 0} aria-label="Previous student" className="dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
                <span className="tabular-nums">{Math.min(at, picked.length - 1) + 1} of {picked.length}</span>
                <IconTip label="Next"><button type="button" onClick={() => setAt((i) => Math.min(picked.length - 1, i + 1))} disabled={at >= picked.length - 1} aria-label="Next student" className="dm-quiet"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
              </span>
            </span>
            <div className="v4-ns-bubble-row">
              <span className="v4-ns-bubble">{fill(template, g)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <button type="button" onClick={() => setShowList((v) => !v)} aria-expanded={showList} className="v4-ns-who-toggle dm-quiet">
            <span className="flex -space-x-[8px]">{picked.slice(0, 5).map((p) => <span key={p.s.id} className="rounded-full" style={{ boxShadow: "0 0 0 2px var(--card)" }}><StudentFace s={p.s} size={26} /></span>)}</span>
            <span>To {picked.length} {picked.length === 1 ? "student" : "students"}</span>
            <span className="v4-ns-link">{showList ? "Hide list" : "See list"}</span>
          </button>
          {showList && (
            <ul className="v4-ns-list dm-scroll">
              {groups.map((p) => (
                <li key={p.s.id}>
                  <label className="v4-ns-list-row">
                    <input type="checkbox" checked={!off.has(p.s.id)} onChange={() => setOff((o) => { const n = new Set(o); if (n.has(p.s.id)) n.delete(p.s.id); else n.add(p.s.id); return n; })} />
                    <StudentFace s={p.s} size={26} />
                    <span className="truncate font-semibold">{p.s.name}</span>
                    <span className="truncate" style={{ color: "var(--muted-foreground)" }}>{p.ks.length} {p.ks.length === 1 ? "draft" : "drafts"}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="flex justify-end gap-[8px]">
          <button type="button" onClick={onCancel} className="v4-ns-btn dm-quiet">Cancel</button>
          <button type="button" disabled={!picked.length || !template.trim()} onClick={() => onSend(picked, template.trim())} className="v4-ns-btn is-solid dm-solid"><Send className="h-4 w-4" aria-hidden />Send {picked.length} {picked.length === 1 ? "nudge" : "nudges"}</button>
        </span>
      </div>
    </>
  );
}
