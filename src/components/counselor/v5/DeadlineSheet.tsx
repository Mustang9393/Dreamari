"use client";

// A "Closing soon" deadline, opened in place (8 Oct 2026 audit: "Early
// action · 14 students" opened the whole directory and a scholarship opened
// the student app). Exactly the students it names, a Book and a Message on
// each, and one way to act on all of them: send the scholarship, remind about
// early action, or open the FAFSA tracker. Shared by v5 and v6;
// ExploreSheetHost renders it.

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CalendarPlus, MessageCircle, Send, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { cv } from "@/lib/counselorBase";
import { addShare } from "@/lib/counselorShares";
import type { Deadline } from "@/lib/counselorV5";
import { notify, openLog } from "./LogSheet";

/** `lede` replaces the default line under the title (opportunities, simulations). */
export type ListSheet = Deadline & { lede?: string };
let current: ListSheet | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export function openDeadline(d: ListSheet): void { current = d; emit(); }
const close = () => { current = null; emit(); };

const DOT = { "On Track": "var(--color-feedback-success-solid)", "Needs Attention": "var(--color-feedback-warning-solid)", "At Risk": "var(--color-feedback-danger-solid)" } as const;

export function DeadlineHost() {
  const d = useSyncExternalStore(subscribe, () => current, () => null);
  return d ? <Sheet d={d} /> : null;
}

function Sheet({ d }: { d: ListSheet }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, []);
  const n = d.students.length;
  const people = (word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
  const lede = d.id === "fafsa" ? `${people("senior")} ${n === 1 ? "has" : "have"} not filed yet.` : d.id === "early-action" ? `${people("senior")} applying early.` : d.lede ? `${people("student")}. ${d.lede}` : `Fits ${people("student")}.`;
  const sendAll = () => {
    addShare({ kind: d.id === "early-action" ? "reminder" : "opportunity", title: d.title, ref: d.id, studentIds: d.students.map((s) => s.id), studentNames: d.students.map((s) => s.name) });
    notify(d.id === "early-action" ? `Reminder sent to ${n} ${n === 1 ? "senior" : "seniors"}` : `${d.title} sent to ${n} ${n === 1 ? "student" : "students"}`);
    close();
  };
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog" aria-modal="true" aria-labelledby="deadline-title">
      <div className="relative flex max-h-[min(760px,100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--card)", borderColor: "var(--glass-border)", fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
        <IconTip label="Close"><button type="button" aria-label="Close" onClick={close} className="cpk-ctl absolute top-[12px] right-[12px] z-[2]"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-4)]">
          <header className="flex flex-col gap-[6px] pr-[48px]">
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{d.when}{d.days !== null ? ` · ${d.days} days` : ""}</span>
            <h2 id="deadline-title" className="text-[24px] leading-[28px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{d.title}</h2>
            <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>{lede}</p>
          </header>
          <ul className="flex flex-col">
            {d.students.map((s) => (
              <li key={s.id} className="flex items-center gap-[10px] border-b py-[8px] last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                <Link href={`${cv("students")}&studentId=${encodeURIComponent(s.id)}`} onClick={close} className="dm-quiet -mx-[8px] flex min-w-0 flex-1 items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[4px]">
                  <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: DOT[s.status] }} />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{s.name}</span>
                  <span className="flex-none text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
                </Link>
                <IconTip label="Message"><Link href={cv("workspace", `&tab=messages&studentId=${encodeURIComponent(s.id)}`)} onClick={close} aria-label={`Message ${s.name}`} className="dm-quiet flex size-9 flex-none items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><MessageCircle className="h-4 w-4" aria-hidden /></Link></IconTip>
                <IconTip label="Book a meeting"><button type="button" aria-label={`Book a meeting with ${s.name}`} onClick={() => { close(); openLog({ mode: "book", studentId: s.id }); }} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}><CalendarPlus className="h-4 w-4" aria-hidden /></button></IconTip>
              </li>
            ))}
          </ul>
        </div>
        <footer className="border-t px-[var(--space-5)] py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
          {d.id === "fafsa"
            ? <Link href={cv("prepare", "&tab=fafsa")} onClick={close} className="dm-solid inline-flex h-11 w-full items-center justify-center gap-[8px] rounded-[var(--radius-md)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Open the FAFSA tracker</Link>
            : <button type="button" onClick={sendAll} className="dm-solid inline-flex h-11 w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Send className="h-4 w-4" aria-hidden />{n === 1 ? `${d.id === "early-action" ? "Remind" : "Send to"} ${d.students[0].name.split(" ")[0]}` : d.id === "early-action" ? `Remind all ${n}` : `Send to all ${n}`}</button>}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
