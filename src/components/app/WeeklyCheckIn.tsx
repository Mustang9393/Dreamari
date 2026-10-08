"use client";

// The student's check-in, as a sheet (8 Oct 2026; Chandu: "remove the 'how's
// your week' thing from the student side. Just make sure there is a workflow
// to trigger these from the counselor side"). Nothing stands on Home: a
// counselor sends a check-in, it arrives in the bell, and tapping it opens
// four quick taps and an optional note here. A low answer shows the 988 line,
// the way school check-in tools do.

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { CHECK_AREAS, submitWeeklyCheckIn, type CheckArea, type CheckLevel } from "@/lib/weeklyCheckIn";

const OPTIONS: { key: CheckLevel; label: string; face: string }[] = [
  { key: "good", label: "Good", face: "🙂" },
  { key: "okay", label: "Okay", face: "😐" },
  { key: "low", label: "Low", face: "🙁" },
];

let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** Opens the check-in (the bell's "sent you a weekly check-in" row). */
export function openStudentCheckIn(): void { open = true; emit(); }
const close = () => { open = false; emit(); };

export function StudentCheckInHost() {
  const on = useSyncExternalStore(subscribe, () => open, () => false);
  return on ? <Sheet /> : null;
}

function Sheet() {
  const [levels, setLevels] = useState<Partial<Record<CheckArea, CheckLevel>>>({});
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const complete = CHECK_AREAS.every((a) => levels[a]);
  const anyLow = CHECK_AREAS.some((a) => levels[a] === "low");
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[125] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="checkin-student-title">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={close} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 60%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />
      <section className="relative flex max-h-[calc(92dvh/var(--vz,1))] w-full max-w-[520px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-t-[22px] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)", paddingBottom: "max(var(--space-5), env(safe-area-inset-bottom))" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <h2 id="checkin-student-title" className="text-[20px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{sent ? "Thanks for checking in" : "How's your week?"}</h2>
          <button type="button" aria-label="Close" onClick={close} className="dm-quiet flex size-10 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        {sent ? (
          <>
            <p className="flex items-center gap-[8px] text-[15px]"><Check className="h-4 w-4" aria-hidden style={{ color: "var(--color-feedback-success)" }} />Your counselor will see it.</p>
            {anyLow && <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Need to talk now? Find an adult you trust, or call or text <a href="tel:988" className="dm-link font-semibold" style={{ color: "var(--foreground)" }}>988</a>.</p>}
            <button type="button" onClick={close} className="dm-solid inline-flex h-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Done</button>
          </>
        ) : (
          <>
            <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>Four quick taps. Only your counselor sees it.</p>
            <ul className="flex flex-col gap-[var(--space-3)]">
              {CHECK_AREAS.map((area) => (
                <li key={area} className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                  <span className="text-[15px] font-semibold">{area}</span>
                  <span role="radiogroup" aria-label={area} className="flex gap-[6px]">
                    {OPTIONS.map((o) => {
                      const on = levels[area] === o.key;
                      return (
                        <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => setLevels((l) => ({ ...l, [area]: o.key }))}
                          className={`${on ? "" : "dm-quiet "}inline-flex h-10 cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[14px] font-semibold`}
                          style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>
                          <span aria-hidden>{o.face}</span>{o.label}
                        </button>
                      );
                    })}
                  </span>
                </li>
              ))}
            </ul>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[14px] font-semibold">Anything you want your counselor to know?</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={400} placeholder="Optional"
                className="w-full resize-none rounded-[var(--radius-md)] border bg-transparent px-[12px] py-[10px] text-[16px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "var(--glass-border)" }} />
            </label>
            <button type="button" disabled={!complete} onClick={() => { submitWeeklyCheckIn(levels as Record<CheckArea, CheckLevel>, note); setSent(true); }}
              className="dm-solid inline-flex h-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Send to my counselor
            </button>
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}
