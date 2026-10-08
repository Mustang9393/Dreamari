"use client";

// Insight → Students → Action (9 Oct 2026, Maisha: "Wherever possible,
// clicking a number, segment, grade, career, college, or category should
// reveal the students represented by it. From the student list, allow
// contextual actions such as View Student, Message, Schedule Meeting. The
// flow should consistently be: Insight → Students → Action.").
//
// One panel for every Insights number: the same right-hand SidePanel v4's
// drills already use, listing exactly the students the number counts (so
// the count in the title and the rows always agree), each with View, Message
// and Schedule, and one Message All at the foot. StudentRows is the same row
// for lists that sit on the page itself (Readiness's Needs Support list).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, MessageSquare } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { openLog } from "../v5/LogSheet";
import { GLASS_INSET } from "../surfaces";
import { Avatar, Go } from "./chips";
import { SidePanel } from "./SidePanel";

export type StudentsDrill = {
  title: string;
  subtitle?: string;
  /** a breakdown shown above the list, e.g. by grade */
  stats?: { value: string; label: string }[];
  students: { s: CounselorStudent; note: string }[];
  /** what the list is called, e.g. "Needs support" */
  listLabel?: string;
  /** ideas or facts above the list, as a short checklist */
  items?: string[];
  itemsLabel?: string;
  /** a second action beside Message All, e.g. "Open in Explore" */
  extra?: { label: string; onClick: () => void };
};

export const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;
export const messageHref = (ids: string[]) => `/counselor?view=connect&compose=1&ids=${ids.map(encodeURIComponent).join(",")}&v=4`;

const SHOWN = 12;

/** Student rows with their actions: the name opens the student; Message and
 *  Schedule sit beside it as icon buttons with tooltips. */
export function StudentRows({ students, onLeave, columns = false, limit = SHOWN }: { students: { s: CounselorStudent; note: string }[]; /** close a panel before navigating */ onLeave?: () => void; /** lay rows out in columns (on a page, not in a panel) */ columns?: boolean; limit?: number }) {
  const router = useRouter();
  const [all, setAll] = useState(false);
  const rows = all ? students : students.slice(0, limit);
  const go = (href: string) => { onLeave?.(); router.push(href); };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <ul className={columns ? "v4-student-rows grid grid-cols-1 gap-x-[var(--space-6)] md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"}>
        {rows.map(({ s, note }) => (
          <li key={s.id} className="flex items-center gap-[4px] border-b py-[2px]" style={{ borderColor: "var(--glass-border)" }}>
            <button type="button" onClick={() => go(studentHref(s.id))} aria-label={`View ${s.name}`} className="dm-quiet group flex min-w-0 flex-1 cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[10px] py-[8px] text-left">
              <Avatar name={s.name} size={32} index={s.avatarIndex} />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {note}</span>
              </span>
              <Go kind="open" className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            </button>
            <IconTip label={`Message ${s.name.split(" ")[0]}`}>
              <button type="button" aria-label={`Message ${s.name}`} onClick={() => go(messageHref([s.id]))} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                <MessageSquare size={15} aria-hidden />
              </button>
            </IconTip>
            <IconTip label="Schedule a meeting">
              <button type="button" aria-label={`Schedule a meeting with ${s.name}`} onClick={() => { onLeave?.(); openLog({ mode: "book", studentId: s.id }); }} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                <CalendarPlus size={15} aria-hidden />
              </button>
            </IconTip>
          </li>
        ))}
      </ul>
      {students.length > limit && (
        <button type="button" onClick={() => setAll((v) => !v)} className="v4-text-action self-start" style={{ color: "var(--primary)" }}>
          {all ? "Show fewer" : `Show all ${students.length}`}
        </button>
      )}
    </div>
  );
}

/** The panel. `drill` null keeps it closed. */
export function InsightStudentsPanel({ drill, onClose }: { drill: StudentsDrill | null; onClose: () => void }) {
  const router = useRouter();
  const ids = drill?.students.map((x) => x.s.id) ?? [];
  return (
    <SidePanel open={!!drill} onClose={onClose} title={drill?.title ?? ""} subtitle={drill?.subtitle}>
      {drill && (
        <>
          {drill.stats && drill.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-[8px]">
              {drill.stats.map((st) => (
                <span key={st.label} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
                  <span className="text-[20px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{st.value}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{st.label}</span>
                </span>
              ))}
            </div>
          )}
          {drill.items && drill.items.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              {drill.itemsLabel && <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{drill.itemsLabel}</span>}
              <ul className="flex flex-col gap-[8px]">
                {drill.items.map((it) => (
                  <li key={it} className="flex items-start gap-[9px] text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: "var(--primary)" }} />{it}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {drill.students.length ? (
            <div className="flex flex-col gap-[8px]">
              <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{drill.listLabel ?? (drill.students.length === 1 ? "1 student" : `${drill.students.length} students`)}</span>
              <StudentRows students={drill.students} onLeave={onClose} />
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No students match these filters.</p>
          )}
          {(ids.length > 0 || drill.extra) && (
            <div className="mt-auto flex flex-col gap-[8px]">
              {ids.length > 0 && (
                <button type="button" onClick={() => { onClose(); router.push(messageHref(ids)); }} className="dm-solid flex h-10 w-full flex-none cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--primary)] text-[13px] font-bold text-[var(--primary-foreground)]">
                  <MessageSquare size={15} aria-hidden /> {ids.length === 1 ? "Message this student" : `Message all ${ids.length}`}
                </button>
              )}
              {drill.extra && (
                <button type="button" onClick={() => { onClose(); drill.extra!.onClick(); }} className="dm-quiet flex h-10 w-full flex-none cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] border text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  {drill.extra.label} <Go />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </SidePanel>
  );
}
