"use client";

// Prepare > FAFSA (8 Oct 2026). counselorFafsa.ts already had each senior's
// status and Remind, Confirm and Opt out, but no screen used them, so
// Home's "Closing soon: FAFSA" and a brief's "FAFSA not filed yet" led to
// the inbox. Here is the whole senior class in three groups, the ones who
// need help first: Not yet (with the one thing in the way), Filed (with
// Confirm where only the student says so) and Opted out. Remind opens the
// student's thread with a short reminder to edit and send; Remind all
// sends that reminder to everyone not filed in one go. A link with
// &studentId= marks that student's row.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeDollarSign, Check, Send } from "lucide-react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { confirmFafsa, fafsaRows, meetsRequirement, remindFafsa, setOptOut, useFafsaOverrides, type FafsaRow } from "@/lib/counselorFafsa";
import { draftFor, sendToStudent } from "@/lib/counselorMessages";
import { logTime } from "@/lib/counselorTimeLog";
import { shortDate, isoDay } from "@/lib/localRecord";
import { cv } from "@/lib/counselorBase";
import { StudentFace } from "./StudentFace";
import { notify } from "./LogSheet";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const remindHref = (id: string) => cv("workspace", `&tab=messages&studentId=${encodeURIComponent(id)}&draft=fafsa`);
const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

/** Not filed yet: not submitted, or submitted and stuck. */
export const notFiled = (r: FafsaRow) => r.state === "not-submitted" || r.state === "incomplete";

export function FafsaView({ focusId }: { focusId?: string }) {
  const roster = useReviewedRoster();
  const overrides = useFafsaOverrides();
  const rows = useMemo(() => fafsaRows(roster, overrides), [roster, overrides]);
  const notYet = rows.filter(notFiled);
  const filed = rows.filter((r) => r.state === "completed");
  const opted = rows.filter((r) => r.state === "opted-out");
  const met = rows.filter(meetsRequirement).length;
  const today = isoDay(new Date());
  const toRemind = notYet.filter((r) => r.remindedAt?.slice(0, 10) !== today);
  const [sentAll, setSentAll] = useState(false);

  // bring the linked student's row into view
  useEffect(() => {
    if (focusId) document.getElementById(`fafsa-${focusId}`)?.scrollIntoView({ block: "center" });
  }, [focusId]);

  const remindAll = () => {
    for (const r of toRemind) sendToStudent(r.student.id, r.student.name, draftFor("fafsa", r.student.name.split(" ")[0]));
    remindFafsa(toRemind.map((r) => r.student.id));
    logTime({ activity: "FAFSA reminders", minutes: 5, kind: "indirect" });
    notify(`Reminded ${toRemind.length} ${toRemind.length === 1 ? "senior" : "seniors"}`);
    setSentAll(true);
  };

  const group = (label: string, list: FafsaRow[]) => list.length > 0 && (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>{label} · {list.length}</span>
      <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
        {list.map((r) => <Row key={r.student.id} r={r} focus={r.student.id === focusId} />)}
      </ul>
    </div>
  );

  return (
    <section aria-label="FAFSA" className="flex max-w-[920px] flex-col gap-[var(--space-6)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <span className="flex items-center gap-[8px] text-[16px] font-semibold">
          <BadgeDollarSign className="h-[18px] w-[18px]" style={{ color: "var(--accent)" }} aria-hidden />
          <span className="tabular-nums">{met} of {rows.length}</span> seniors filed or opted out
        </span>
        {notYet.length > 0 && (
          <button type="button" disabled={!toRemind.length} onClick={remindAll} className="dm-solid inline-flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {toRemind.length ? <><Send className="h-4 w-4" aria-hidden /> Remind all {toRemind.length}</> : <><Check className="h-4 w-4" aria-hidden /> {sentAll ? "Reminders sent" : "All reminded today"}</>}
          </button>
        )}
      </div>
      {rows.length === 0 && <p className="py-[var(--space-8)] text-[16px]" style={{ color: "var(--muted-foreground)" }}>No seniors on your caseload.</p>}
      {group("Not yet", notYet)}
      {group("Filed", filed)}
      {group("Opted out", opted)}
    </section>
  );

}

function Row({ r, focus }: { r: FafsaRow; focus: boolean }) {
  const s = r.student;
  const reminded = r.remindedAt ? `Reminded ${shortDate(r.remindedAt.slice(0, 10))}` : null;
  return (
    <li id={`fafsa-${s.id}`} className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] border-b py-[10px]" style={{ borderColor: RULE }}>
      <Link href={studentHref(s.id)} className="dm-quiet -mx-[var(--space-2)] flex min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[4px]" style={focus ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
        <StudentFace s={s} size={40} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
          <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.note}{reminded && notFiled(r) ? ` · ${reminded}` : ""}</span>
        </span>
      </Link>
      <span className="flex flex-none items-center gap-[var(--space-3)]">
        {notFiled(r) && (
          <>
            <button type="button" onClick={() => { setOptOut(s.id, true); notify(`${s.name.split(" ")[0]}: opt-out form on file`); }} className="dm-link text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Opt out</button>
            <Link href={remindHref(s.id)} className="dm-quiet inline-flex h-9 items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}>
              <Send className="h-[14px] w-[14px]" aria-hidden /> Remind
            </Link>
          </>
        )}
        {r.state === "completed" && (r.needsConfirm
          ? <button type="button" onClick={() => { confirmFafsa(s.id); notify(`${s.name.split(" ")[0]}'s FAFSA confirmed`); }} className="dm-quiet inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}><Check className="h-[14px] w-[14px]" aria-hidden /> Confirm</button>
          : <span className="flex items-center gap-[4px] text-[13.5px] font-semibold v5-ok"><Check className="h-[14px] w-[14px]" aria-hidden />Filed</span>)}
        {r.state === "opted-out" && <button type="button" onClick={() => setOptOut(s.id, false)} className="dm-link text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>Undo</button>}
      </span>
    </li>
  );
}
