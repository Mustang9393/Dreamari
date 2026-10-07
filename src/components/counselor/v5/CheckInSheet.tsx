"use client";

// One check-in, opened from any alert or note (8 Oct 2026; Chandu: "there's a
// '1 check-in needs a response today' but ... it doesn't say what it's about
// when I click on it"). What the student said and how they rated the week,
// why it was flagged, and the school's safety steps as three things to do:
// see them today, the safety contacts (already told, with the time), and
// home (the guardian, their number and language). Shared by v4, v5 and v6;
// ExploreSheetHost renders it.

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertTriangle, CalendarPlus, Check, ChevronLeft, ChevronRight, Phone, RotateCcw, UserRound, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { cv } from "@/lib/counselorBase";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { markAlertHandled, reopenAlert, sendOnce, readSafetyContacts, useHandledAlerts, useOutbox, useSafetyContacts } from "@/lib/counselorOutbox";
import { CHECK_DIMS, LEVEL_INK, LEVEL_WORD, alertIn, alertKey, checkInFor, guardiansFor, whenText, type Level } from "./family";
import { notify, openLog } from "./LogSheet";
import { openSendCheckIn } from "./CheckInSend";

// ---- open/close store --------------------------------------------------------
let current: { ids: string[]; index: number } | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Opens one student's check-in; prev/next walks `ids` when given. */
export function openCheckIn(id: string, ids?: string[]): void {
  const list = ids && ids.includes(id) ? ids : [id];
  current = { ids: list, index: list.indexOf(id) };
  emit();
}
const close = () => { current = null; emit(); };

export function CheckInHost() {
  const open = useSyncExternalStore(subscribe, () => current, () => null);
  const roster = useReviewedRoster();
  if (!open) return null;
  const s = roster.find((r) => r.id === open.ids[open.index]);
  if (!s) return null;
  return <Sheet s={s} count={open.ids.length} index={open.index} onIndex={(i) => { current = { ...open, index: i }; emit(); }} />;
}

// DEMO-ONLY: the three weeks before this one, seeded, so a counselor sees
// whether this week is new or a pattern
function pastMood(s: CounselorStudent): Level[] {
  let h = 0;
  for (const ch of `${s.id}:past`) h = (h * 31 + ch.charCodeAt(0)) | 0;
  h = Math.abs(h);
  const lean = s.status === "At Risk" ? 2 : s.status === "Needs Attention" ? 1 : 0;
  return [0, 1, 2].map((k) => { const v = ((h >> (k * 4)) % 10) - lean * 2; return v >= 3 ? "good" : v >= 0 ? "okay" : "low"; });
}

function Highlight({ text, word }: { text: string; word: string | null }) {
  if (!word) return <>{text}</>;
  const i = text.toLowerCase().indexOf(word);
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="rounded-[4px] px-[3px]" style={{ background: "color-mix(in srgb, var(--color-feedback-danger-solid) 22%, transparent)", color: "inherit" }}>{text.slice(i, i + word.length)}</mark>{text.slice(i + word.length)}</>;
}

function Sheet({ s, count, index, onIndex }: { s: CounselorStudent; count: number; index: number; onIndex: (i: number) => void }) {
  const c = useMemo(() => checkInFor(s), [s]);
  const word = alertIn(c.note);
  const key = alertKey(s.id);
  const handled = useHandledAlerts()[key];
  const contacts = useSafetyContacts();
  const sent = useOutbox().find((e) => e.key === key);
  const guardian = guardiansFor(s)[0];
  const first = s.name.split(" ")[0];
  const past = pastMood(s);
  const lows = CHECK_DIMS.filter((d) => c.levels[d] === "low");
  const studentHref = `${cv("students")}&studentId=${encodeURIComponent(s.id)}`;

  // an alert reaches the safety contacts once, however the counselor got here
  useEffect(() => {
    if (word) sendOnce({ kind: "alert", key, to: readSafetyContacts().map((x) => x.email), subject: `Check-in alert: ${s.name}, Grade ${s.grade}` });
  }, [word, key, s.name, s.grade]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && index < count - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [index, count, onIndex]);

  const step = (n: number, title: string, body: React.ReactNode, done = false) => (
    <li className="flex gap-[12px] border-b py-[12px] last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
      <span className="flex size-[24px] flex-none items-center justify-center rounded-full text-[12px] font-bold" style={done ? { background: "var(--color-feedback-success-solid)", color: "#fff" } : { background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>{done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-[4px]"><span className="text-[15px] font-semibold">{title}</span><span className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>{body}</span></span>
    </li>
  );

  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog" aria-modal="true" aria-labelledby="checkin-title">
      <div className="relative flex max-h-[min(820px,100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--card)", borderColor: word ? "color-mix(in srgb, var(--color-feedback-danger-solid) 45%, var(--glass-border))" : "var(--glass-border)", fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
        <div className="absolute top-[12px] right-[12px] z-[2] flex gap-[8px]">
          {count > 1 && (
            <>
              <IconTip label="Previous"><button type="button" aria-label="Previous check-in" disabled={index === 0} onClick={() => onIndex(index - 1)} className="cpk-ctl"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
              <IconTip label="Next"><button type="button" aria-label="Next check-in" disabled={index === count - 1} onClick={() => onIndex(index + 1)} className="cpk-ctl"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
            </>
          )}
          <IconTip label="Close"><button type="button" aria-label="Close" onClick={close} className="cpk-ctl"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-5)]">
          <header className="flex flex-col gap-[6px] pr-[120px]">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Weekly check-in · {c.answered ? whenText(c.daysAgo) : "not answered"}</span>
            <h2 id="checkin-title" className="text-[26px] leading-[30px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              <Link href={studentHref} onClick={close} className="dm-link">{s.name}</Link>
            </h2>
            <span className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.status}</span>
          </header>

          {word && (
            <p className="flex items-start gap-[10px] border-l-[3px] py-[4px] pl-[12px] text-[14.5px]" style={{ borderColor: "var(--color-feedback-danger-solid)" }}>
              <AlertTriangle className="mt-[2px] h-4 w-4 flex-none v5-risk" aria-hidden />
              <span><span className="font-semibold v5-risk">Needs a response today.</span> The note uses &ldquo;{word}&rdquo;, a word on your district&apos;s alert list.</span>
            </p>
          )}

          {c.note && (
            <section className="flex flex-col gap-[8px]">
              <h3 className="text-[13px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>What {first} wrote</h3>
              <blockquote className="text-[18px] leading-[26px]" style={{ fontFamily: "var(--font-display)" }}>&ldquo;<Highlight text={c.note} word={word} />&rdquo;</blockquote>
            </section>
          )}

          {c.answered ? (
            <section className="flex flex-col gap-[8px]">
              <h3 className="text-[13px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>How the week went</h3>
              <ul className="grid grid-cols-2 gap-x-[var(--space-6)] sm:grid-cols-4">
                {CHECK_DIMS.map((d) => (
                  <li key={d} className="flex flex-col gap-[2px] py-[6px]">
                    <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>{d}</span>
                    <span className="flex items-center gap-[6px] text-[15px] font-semibold"><span aria-hidden className="size-[9px] rounded-full" style={{ background: LEVEL_INK[c.levels[d]] }} />{LEVEL_WORD[c.levels[d]]}</span>
                  </li>
                ))}
              </ul>
              <p className="flex flex-wrap items-center gap-[8px] text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>
                Mood, last 4 weeks:
                {[...past, c.levels.Mood].map((l, i) => <span key={i} aria-label={`${i === 3 ? "This week" : `${3 - i} weeks ago`}: ${LEVEL_WORD[l]}`} className="size-[10px] rounded-full" style={{ background: LEVEL_INK[l], opacity: i === 3 ? 1 : 0.55 }} />)}
                {past.every((l) => l !== "low") && c.levels.Mood === "low" ? <span className="font-semibold">New this week</span> : past.filter((l) => l === "low").length >= 2 ? <span className="font-semibold v5-risk">Low most weeks</span> : null}
              </p>
            </section>
          ) : (
            <div className="flex flex-col items-start gap-[10px]">
              <p className="text-[15px]">{first} has not checked in this week. A quick hello in the hallway counts too.</p>
              <button type="button" onClick={() => { close(); openSendCheckIn({ studentId: s.id }); }} className="dm-link text-[14.5px] font-semibold" style={{ color: "var(--accent)" }}>Send {first} a check-in</button>
            </div>
          )}

          {(word || lows.length > 0) && (
            <section className="flex flex-col gap-[4px]">
              <h3 className="text-[13px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{word ? "Your school's safety steps" : "Next step"}</h3>
              <ol className="flex flex-col">
                {step(1, `See ${first} today`, <>A short check-in in person. Log it so the note and time land on {first}&apos;s page.</>, !!handled)}
                {word && step(2, "Tell your safety contacts", contacts.length
                  ? <>{sent ? "Sent" : "Sending"} to {contacts.map((x) => `${x.name} (${x.role.toLowerCase()})`).join(" and ")}{sent ? `, ${new Date(sent.at).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}` : ""}.</>
                  : <>No safety contacts set. <Link href={cv("profile")} onClick={close} className="dm-link font-semibold" style={{ color: "var(--accent)" }}>Add them in Profile</Link>.</>, !!sent && contacts.length > 0)}
                {guardian && step(word ? 3 : 2, "Call home if you need to", <>{guardian.name}, {guardian.relation.toLowerCase()}. <a href={`tel:${guardian.phone.replace(/[^\d]/g, "")}`} className="dm-link font-semibold" style={{ color: "var(--accent)" }}><Phone className="mr-[3px] inline h-3.5 w-3.5 align-[-2px]" aria-hidden />{guardian.phone}</a>{guardian.language !== "English" ? ` · Speaks ${guardian.language}, ask for an interpreter` : ""}.</>)}
              </ol>
            </section>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-[10px] border-t px-[var(--space-5)] py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
          <button type="button" onClick={() => { close(); openLog({ mode: "walkin", studentId: s.id, alert: word && !handled ? key : undefined }); }} className="dm-solid inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><UserRound className="h-4 w-4" aria-hidden /> Log a check-in</button>
          {!word && <button type="button" onClick={() => { close(); openLog({ mode: "book", studentId: s.id }); }} className="dm-quiet inline-flex h-11 cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}><CalendarPlus className="h-4 w-4" aria-hidden /> Book</button>}
          {word && (handled
            ? <button type="button" onClick={() => reopenAlert(key)} className="dm-quiet inline-flex h-11 cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}><RotateCcw className="h-4 w-4" aria-hidden /> Handled {new Date(handled).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}. Reopen</button>
            : <button type="button" onClick={() => { markAlertHandled(key); notify(`Marked handled: ${s.name}`); }} className="dm-quiet inline-flex h-11 cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}><Check className="h-4 w-4" aria-hidden /> Mark handled</button>)}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
