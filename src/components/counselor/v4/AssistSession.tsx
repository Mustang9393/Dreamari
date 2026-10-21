"use client";

// WHY (10 Oct 2026, Chandu on Prepare > Assist: "maybe requests should be
// populated? ... I like assist right now how do we gamify it and make it
// more engaging?"). Assist becomes a session, the way Prepare > Review was
// rebuilt the same day:
// - it opens on what is waiting (Dreamy's queue: letters asked for,
//   briefs for the next meetings, summaries for meetings already over),
//   not a blank form;
// - progress you can see, "2 of 6 done" on the app's SparkBar;
// - a finished draft is stamped, with a burst and a chime, and stays on
//   the desk with Edit and Undo until the counselor moves on;
// - a quiet weekly count of the minutes Dreamy saved (Grammarly's weekly
//   stats are the reference);
// - a finish line when the queue is clear.
// Same day, after Chandu tried it live: "split the Dreamy-drafted list and
// the from-scratch one", so the controls open on one of two modes behind
// one switch (ModeSwitch); and "Dreamy sits very awkwardly ... lock its
// position properly", so Dreamy is an inline avatar beside the words he
// says (the start line, "Dreamy is drafting", the finish of a draft), one
// per view, never floating over a frame's edge; only the finish line uses
// a larger Dreamy, centered above its message.
// These are the session's pieces; ProductivitySuite.tsx places them.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Clock3, Pencil, RotateCcw } from "lucide-react";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { IconTip } from "@/components/app/IconTip";
import { cv } from "@/lib/counselorBase";
import { StudentFace } from "../v5/StudentFace";
import { GlassesDreamy } from "./InsightCharts";
import type { DocKind } from "./DocumentDesk";
import { minutesLabel, type AssistItem, type FinishHow } from "./assistModel";

export const profileHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

/** The format, short enough to share a line with the reason. */
const SHORT: Record<DocKind, string> = {
  "recommendation-letter": "Letter",
  "student-brief": "Meeting brief",
  "parent-brief": "Family brief",
  "meeting-summary": "Summary",
  "success-plan": "Action plan",
  "brag-sheet": "Brag sheet",
  "family-questionnaire": "Family form",
};
export const STAMP: Record<FinishHow, string> = { saved: "Saved", copied: "Copied", printed: "Printed" };

const BAR_FILL = "linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))";

export type AssistMode = "drafts" | "scratch";

/** The controls' one switch: Dreamy's drafts, or a blank start. A small
 *  segmented toggle, not a second tab row under the page's tabs. */
export function ModeSwitch({ mode, count, onChange }: { mode: AssistMode; count: number; onChange: (m: AssistMode) => void }) {
  return (
    <div className="as-switch" role="group" aria-label="How to start">
      <button type="button" aria-pressed={mode === "drafts"} onClick={() => onChange("drafts")}>Dreamy&apos;s drafts{count > 0 && <span className="as-switch-n">{count}</span>}</button>
      <button type="button" aria-pressed={mode === "scratch"} onClick={() => onChange("scratch")}>Start from scratch</button>
    </div>
  );
}

/** How far along, and the week's minutes saved, on one line over the bar. */
export function SessionProgress({ total, done, weekMinutes }: { total: number; done: number; weekMinutes: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="as-progress" role="status" aria-live="polite">
      <span className="as-progress-row">
        <span className="as-progress-copy"><b>{done} of {total}</b> done</span>
        <span className="as-saved"><Clock3 className="h-[13px] w-[13px] flex-none" aria-hidden /><b className="tabular-nums"><MinutesUp value={weekMinutes} /></b> saved this week</span>
      </span>
      {total > 0 && <SparkBar percent={pct} min={2} height={6} fill={BAR_FILL} glow="var(--primary)" memoryKey="v4-assist-session" />}
    </div>
  );
}

/** Dreamy beside the line he says, drawn large as a layer (10 Oct 2026,
 *  Chandu: "just place it large anywhere and let it sit a layer over
 *  whatever"). The slot keeps him aligned; side margins keep the larger
 *  layer off the words beside him; above and below he simply overlays. */
export function DreamyInline({ size = 36, thinking = false, hop = 0, pop = 1.5 }: { size?: number; thinking?: boolean; hop?: number; pop?: number }) {
  const room = Math.round((size * pop - size) / 2);
  return <span className="as-dreamy-inline" style={{ marginInline: room }}><GlassesDreamy size={size} thinking={thinking} hop={hop} pop={pop} /></span>;
}

/** Dreamy's queue as a list (desktop) or a strip of faces (phones). */
export function QueueList({ items, isDone, activeKey, onOpen, variant = "list" }: { items: AssistItem[]; isDone: (key: string) => boolean; activeKey: string | null; onOpen: (item: AssistItem) => void; variant?: "list" | "strip" }) {
  if (!items.length) return <p className="as-empty">Nothing waiting right now. Start from scratch to write one.</p>;
  if (variant === "strip") {
    return (
      <ol className="as-strip dm-scroll" aria-label="Waiting for you">
        {items.map((it) => {
          const on = it.key === activeKey;
          const done = isDone(it.key);
          return (
            <li key={it.key}>
              <button type="button" onClick={() => onOpen(it)} aria-current={on ? "true" : undefined} aria-label={`${it.student.name}, ${SHORT[it.kind]}, ${it.why}${done ? ", done" : ""}`} className="as-strip-cell" data-on={on ? "true" : undefined}>
                <span className="as-strip-face"><StudentFace s={it.student} size={46} />{done && <span className="as-check" aria-hidden><Check className="h-[11px] w-[11px]" strokeWidth={3} /></span>}</span>
                <span className="as-strip-name">{it.student.name.split(" ")[0]}</span>
                <span className="as-strip-kind">{SHORT[it.kind]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    );
  }
  return (
    <ul className="as-queue" aria-label="Waiting for you">
      {items.map((it) => {
        const on = it.key === activeKey;
        const done = isDone(it.key);
        return (
          <li key={it.key} className="as-row" data-on={on ? "true" : undefined} data-done={done ? "true" : undefined}>
            <Link href={profileHref(it.student.id)} className="as-row-face" aria-label={`Open ${it.student.name}'s profile`}>
              <StudentFace s={it.student} size={36} />
              {done && <span className="as-check" aria-hidden><Check className="h-[11px] w-[11px]" strokeWidth={3} /></span>}
            </Link>
            <button type="button" onClick={() => onOpen(it)} aria-current={on ? "true" : undefined} className="as-row-main">
              <span className="as-row-name">{it.student.name}</span>
              <span className="as-row-what">{SHORT[it.kind]} · {it.why}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Before the first draft is opened, the desk's bar says what Dreamy did. */
export function StartHero({ count, first, onStart }: { count: number; first: AssistItem; onStart: () => void }) {
  return (
    <div className="as-hero">
      <DreamyInline size={42} pop={2.2} />
      <span className="as-hero-copy">
        <h3 className="as-hero-title">Dreamy prepared {count} {count === 1 ? "draft" : "drafts"} for you</h3>
        <p className="as-hero-sub">Check each one and make it yours. Save, copy or print it to finish.</p>
      </span>
      <button type="button" onClick={onStart} className="as-primary dm-solid">Start with {first.student.name.split(" ")[0]}<ArrowRight className="h-4 w-4" aria-hidden /></button>
    </div>
  );
}

/** A finished draft, held on the desk until the counselor moves on. */
export function HeldBar({ how, first, minutes, nextLabel, onEdit, onUndo, onNext, compact = false, hop = 0 }: { how: FinishHow; first: string; minutes: number; nextLabel: string; onEdit: () => void; onUndo: () => void; onNext: () => void; compact?: boolean; /** Dreamy hops when this changes */ hop?: number }) {
  const said = how === "saved" ? `Saved to ${first}'s notes` : how === "copied" ? "Copied" : "Sent to print";
  return (
    <div className={`as-held ${compact ? "is-compact" : ""}`} role="status">
      <span className="as-held-copy">{!compact && <DreamyInline size={34} pop={2.5} hop={hop} />}<Check className="h-4 w-4 flex-none" aria-hidden /><span className="truncate">{said}</span><span className="as-held-gain">+{minutes} min</span></span>
      <span className="as-held-actions">
        <IconTip label="Open it again to change it"><button type="button" onClick={onEdit} className="as-quiet dm-quiet"><Pencil className="h-[14px] w-[14px]" aria-hidden />Edit</button></IconTip>
        <IconTip label={how === "saved" ? "Take it out of the notes" : "Mark it not done"}><button type="button" onClick={onUndo} className="as-quiet dm-quiet"><RotateCcw className="h-[14px] w-[14px]" aria-hidden />Undo</button></IconTip>
        <button type="button" onClick={onNext} className="as-primary dm-solid">{nextLabel}<ChevronRight className="h-4 w-4" aria-hidden /></button>
      </span>
    </div>
  );
}

/** The queue is clear. */
export function FinishLine({ count, minutes, hop }: { count: number; minutes: number | null; hop: number }) {
  return (
    <div className="as-finish">
      <LocalBurst nonce={hop} />
      <DreamyInline size={96} hop={hop} pop={1.3} />
      <h3 className="as-finish-title">All {count} drafts done</h3>
      <p className="as-finish-sub">{minutes ? `${count} drafts in ${minutes} ${minutes === 1 ? "minute" : "minutes"}. ` : ""}Every student on the list is covered.</p>
    </div>
  );
}

/** The week's minutes, counting up to a new total ("1 h 5 min"); still
 *  under reduced motion. */
function MinutesUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      const v = Math.round(start + (value - start) * (1 - (1 - t) ** 3));
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <><span aria-hidden="true">{minutesLabel(shown)}</span><span className="sr-only">{minutesLabel(value)}</span></>;
}
