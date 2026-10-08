"use client";

// Send a check-in (8 Oct 2026; Chandu: "remove the 'how's your week' thing
// from the student side. Just make sure there is a workflow to trigger these
// from the counselor side"). Who gets it (everyone, a grade, the ones who
// haven't answered this week, or one student), an optional line, Send. The
// students get a notification and answer in a sheet; answers land in
// Check-ins and on each student's page. Shared by v4, v5 and v6
// (ExploreSheetHost renders it).

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { addShare } from "@/lib/counselorShares";
import { sendCheckInRequest, useCheckInRequests } from "@/lib/weeklyCheckIn";
import { checkInFor } from "./family";
import { notify } from "./LogSheet";

type Who = "all" | "unanswered" | 9 | 10 | 11 | 12 | "one";
let current: { studentId?: string; who?: Who } | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** Opens the send sheet; `studentId` sends to one student. */
export function openSendCheckIn(opts: { studentId?: string; who?: Who } = {}): void { current = opts; emit(); }
const close = () => { current = null; emit(); };

export function SendCheckInHost() {
  const req = useSyncExternalStore(subscribe, () => current, () => null);
  return req ? <Sheet key={`${req.studentId ?? ""}-${req.who ?? ""}`} req={req} /> : null;
}

function Sheet({ req }: { req: { studentId?: string; who?: Who } }) {
  const roster = useReviewedRoster();
  const sent = useCheckInRequests();
  const one = req.studentId ? roster.find((s) => s.id === req.studentId) : undefined;
  const [who, setWho] = useState<Who>(one ? "one" : req.who ?? "all");
  const [note, setNote] = useState("");
  const unanswered = useMemo(() => roster.filter((s) => !checkInFor(s).answered), [roster]);
  const to = useMemo(() => (who === "one" && one ? [one] : who === "all" ? roster : who === "unanswered" ? unanswered : roster.filter((s) => s.grade === who)), [who, one, roster, unanswered]);
  const label = who === "one" && one ? one.name : who === "all" ? "Everyone" : who === "unanswered" ? "Haven't answered" : `Grade ${who}`;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const send = () => {
    sendCheckInRequest({ label, studentIds: to.map((s) => s.id), count: to.length, note: note.trim() || undefined });
    // recorded with its recipients, so it shows in Sent and on their pages
    addShare({ kind: "reminder", title: "Weekly check-in", ref: "checkin", studentIds: to.map((s) => s.id), studentNames: to.map((s) => s.name) });
    notify(`Check-in sent to ${to.length} ${to.length === 1 ? "student" : "students"}`);
    close();
  };
  const chip = (k: Who, text: string) => {
    const on = who === k;
    return (
      <button key={String(k)} type="button" aria-pressed={on} onClick={() => setWho(k)} className={`${on ? "" : "dm-quiet "}inline-flex h-10 cursor-pointer items-center rounded-full border px-[14px] text-[14px] font-semibold`}
        style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>{text}</button>
    );
  };
  const last = sent[0];
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="send-checkin-title">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={close} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} />
      <section className="relative flex max-h-[calc(92dvh/var(--vz,1))] w-full max-w-[540px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-t-[22px] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)", paddingBottom: "max(var(--space-5), env(safe-area-inset-bottom))" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="flex flex-col gap-[4px]">
            <h2 id="send-checkin-title" className="text-[22px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>Send a Check-in</h2>
            <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Mood, friends, sleep and school, plus a note. Students answer from their notifications.</p>
          </div>
          <button type="button" aria-label="Close" onClick={close} className="dm-quiet flex size-10 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        <div className="flex flex-col gap-[8px]">
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Who</span>
          <div className="flex flex-wrap gap-[8px]">
            {one && chip("one", one.name.split(" ")[0])}
            {chip("all", `Everyone · ${roster.length}`)}
            {unanswered.length > 0 && chip("unanswered", `Haven't answered · ${unanswered.length}`)}
            {([9, 10, 11, 12] as const).map((g) => chip(g, `Grade ${g}`))}
          </div>
        </div>
        <label className="flex flex-col gap-[6px]">
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>A line from you (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder="Quick check-in before break. How's it going?" className="h-11 rounded-[var(--radius-md)] border bg-transparent px-[12px] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "var(--glass-border)" }} />
        </label>
        <button type="button" disabled={!to.length} onClick={send} className="dm-solid inline-flex h-12 cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] text-[15px] font-bold disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Send className="h-4 w-4" aria-hidden /> Send to {to.length} {to.length === 1 ? "student" : "students"}
        </button>
        {last && <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Last sent {new Date(last.at).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })} to {last.label === "Everyone" ? `all ${last.count}` : `${last.label} (${last.count})`}.</p>}
      </section>
    </div>,
    document.body,
  );
}
