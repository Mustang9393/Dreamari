"use client";

// v7 Students: the Replit's Student Directory, as Usman asked on 22 Oct 2026
// after the first declutter ("I like the simplicity of your version, but I
// do not think we should permanently separate students into large At Risk /
// Needs Attention / On Track sections. That forces counselors to scroll
// through one category before reaching everyone else. Keep one mixed
// directory and let counselors filter when needed"): one table, last name
// A to Z, "Hassan, Omar", with Grade, Status, Progress and Last activity as
// labelled columns; a Status filter in place of GPA; no Career Interest and
// no Meetings & Notes in the directory. Progress says the one open item, or
// "2 items", "3 items", "4+ items" when there are several; the profile has
// the rest. The goal: "very close to the simplicity of the SchooLinks
// roster, but cleaner and more Dreamari".
//
// Chandu, on top: "I will default to alphabetical order but we should still
// surface the ones needing attention first so its brought to the attention
// of the counselors when they land on the page. Not a different section",
// then "dont make need you first as a row. Just make them populate first
// in the same table": the one table lists At Risk, then Needs Attention,
// then On Track, each run A to Z by last name. No strip, no sections.
//
// Kept: search, the grade and plan pickers, Export, Message students
// (select mode, "Message selected · N"), and &status=need from Home, which
// opens the directory filtered to the students who need you.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, MessageSquare, Search, X } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { lastActiveLabel, type CounselorStudent } from "@/lib/counselorRoster";
import { StudentFace } from "../v5/StudentFace";
import { flagsFor, gpaOf } from "./data";
import { StudentProfile } from "./StudentProfile";
import { CARD, CARD_STYLE, MUTED, PageHead, PrimaryButton, QuietButton, RULE, STATUS_DOT, studentHref, v7 } from "./ui";

const PICKER = "h-11 min-w-[150px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold";
const PICKER_STYLE = { borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" };

export function V7Students({ studentId, tab }: { studentId?: string; tab?: string }) {
  if (studentId) return <StudentProfile studentId={studentId} initialTab={tab} />;
  return <Directory />;
}

/** The interest a counselor recognises: their #1 match, else their world. */
export const interestOf = (s: CounselorStudent) => s.topMatches[0]?.title ?? s.careerTrack;
export const planOf = (s: CounselorStudent) => (s.postsecondaryIntent === "Undecided" ? "Exploring" : s.postsecondaryIntent);
export function progressOf(s: CounselorStudent): string {
  const f = flagsFor(s);
  if (f.length) return f[0];
  const k = (Object.keys(s.milestones) as (keyof typeof s.milestones)[]).find((m) => s.milestones[m] === "In Progress");
  return k ? `${k} in progress` : "All caught up";
}


/** "Hassan, Omar" (the directory's order and spelling, Usman 22 Oct 2026). */
export function lastFirst(name: string): string {
  const i = name.lastIndexOf(" ");
  return i < 0 ? name : `${name.slice(i + 1)}, ${name.slice(0, i)}`;
}
const byLastName = (a: CounselorStudent, b: CounselorStudent) => lastFirst(a.name).localeCompare(lastFirst(b.name));
// Chandu, 22 Oct 2026: "dont make need you first as a row. Just make them
// populate first in the same table": At Risk first, then Needs Attention,
// then On Track, each run A to Z by last name; one table, no strip.
const NEED_ORDER: Record<CounselorStudent["status"], number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
const needFirst = (a: CounselorStudent, b: CounselorStudent) => NEED_ORDER[a.status] - NEED_ORDER[b.status] || byLastName(a, b);

/** The Progress column: the one open item, or how many there are. */
export function progressCell(s: CounselorStudent): string {
  const f = flagsFor(s);
  if (f.length >= 4) return "4+ items";
  if (f.length >= 2) return `${f.length} items`;
  return progressOf(s);
}

type StatusFilter = "all" | "need" | CounselorStudent["status"];
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" }, { value: "need", label: "Needs you" }, { value: "At Risk", label: "At Risk" }, { value: "Needs Attention", label: "Needs Attention" }, { value: "On Track", label: "On Track" },
];
const PAGE = 25;

function Directory() {
  const roster = useReviewedRoster();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState<StatusFilter>(() => (params.get("status") === "need" ? "need" : "all"));
  const [shown, setShown] = useState(PAGE);
  // Message students (the Replit's row checkboxes and "Message selected (N)",
  // 22 Oct 2026): a select mode, so the rows stay one line until asked
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const router = useRouter();
  const plans = useMemo(() => [...new Set(roster.map(planOf))].sort(), [roster]);
  const needle = q.trim().toLowerCase();
  const list = useMemo(() => roster
    .filter((s) => !needle || s.name.toLowerCase().includes(needle) || lastFirst(s.name).toLowerCase().includes(needle))
    .filter((s) => grade === "all" || String(s.grade) === grade)
    .filter((s) => plan === "all" || planOf(s) === plan)
    .filter((s) => status === "all" || (status === "need" ? s.status !== "On Track" : s.status === status))
    .sort(needFirst), [roster, needle, grade, plan, status]);
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const messageSelected = () => {
    const ids = [...picked];
    if (!ids.length) return;
    router.push(v7("workspace", `&tab=messages&to=${encodeURIComponent(ids.join(","))}`));
  };
  const clear = () => { setQ(""); setGrade("all"); setPlan("all"); setStatus("all"); setShown(PAGE); };

  const exportCsv = () => {
    const rows = [["Student", "Grade", "Status", "Plan", "GPA", "Progress", "Last activity"], ...list.map((s) => [lastFirst(s.name), String(s.grade), s.status, planOf(s), gpaOf(s)?.toFixed(1) ?? "", progressCell(s), lastActiveLabel(s.lastActive)])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Students" />
      <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-[14px] h-4 w-4" style={MUTED} aria-hidden />
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Search students" aria-label="Search students"
            className="h-11 w-full rounded-[var(--radius-md)] border bg-transparent pr-[12px] pl-[40px] text-[15px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
        </label>
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Listbox ariaLabel="Grade" value={grade} onChange={(v) => { setGrade(v); setShown(PAGE); }} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "All grades" }, ...[9, 10, 11, 12].map((g) => ({ value: String(g), label: `Grade ${g}` }))]} />
          <Listbox ariaLabel="Status" value={status} onChange={(v) => { setStatus(v as StatusFilter); setShown(PAGE); }} className={PICKER} style={PICKER_STYLE} options={STATUS_OPTIONS} />
          <Listbox ariaLabel="Plan" value={plan} onChange={(v) => { setPlan(v); setShown(PAGE); }} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "Any plan" }, ...plans.map((p) => ({ value: p, label: p }))]} />
          <QuietButton onClick={exportCsv} icon={<Download className="h-4 w-4" aria-hidden />} label="Export as CSV" />
          {selecting
            ? <QuietButton onClick={() => { setSelecting(false); setPicked(new Set()); }} icon={<X className="h-4 w-4" aria-hidden />}>Done</QuietButton>
            : <QuietButton onClick={() => setSelecting(true)} icon={<MessageSquare className="h-4 w-4" aria-hidden />}>Message students</QuietButton>}
        </div>
      </div>
      {selecting && (
        <div role="status" className={`sticky top-[88px] z-[5] flex items-center justify-between gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-3)] ${CARD}`} style={CARD_STYLE}>
          <span className="text-[14px]" style={MUTED}>{picked.size ? `${picked.size} selected` : "Pick the students to message"}</span>
          <PrimaryButton onClick={messageSelected} icon={<MessageSquare className="h-4 w-4" aria-hidden />}>{picked.size ? `Message selected · ${picked.size}` : "Message selected"}</PrimaryButton>
        </div>
      )}

      {list.length ? (
        <div className="flex flex-col gap-[var(--space-3)]">
          <div className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
            <div className="hidden items-center gap-[14px] border-b px-[var(--space-5)] py-[10px] text-[12px] font-semibold tracking-[0.08em] uppercase md:flex" style={{ ...MUTED, borderColor: RULE }}>
              <span className="w-[36px] flex-none" />
              <span className="w-[220px] flex-none">Name</span>
              <span className="w-[72px] flex-none">Grade</span>
              <span className="w-[150px] flex-none">Status</span>
              <span className="min-w-0 flex-1">Progress</span>
              <span className="w-[110px] flex-none text-right">Last activity</span>
            </div>
            {/* roomy rows in faint alternating bands, so a wide row reads
               across (Chandu, 22 Oct 2026: "give the rows room to breathe and
               allow more space between them. Make it very easy to scan. We
               can even have alternate light and dark bands") */}
            <ul>
              {list.slice(0, shown).map((s, i) => <Row key={s.id} s={s} band={i % 2 === 1} picked={selecting ? picked.has(s.id) : null} onToggle={() => toggle(s.id)} />)}
            </ul>
          </div>
          <div className="flex items-center justify-between gap-[var(--space-3)] text-[14px]" style={MUTED}>
            <span className="tabular-nums">{Math.min(shown, list.length)} of {list.length} students</span>
            {list.length > shown && <button type="button" onClick={() => setShown((n) => n + PAGE)} className="dm-link inline-flex min-h-[24px] cursor-pointer items-center font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Show {Math.min(PAGE, list.length - shown)} more</button>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-6)]">
          <p className="text-[16px] font-semibold">No students match.</p>
          <button type="button" onClick={clear} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}

/** One line: face, Last, First, grade, status, the one open item, last activity. */
const BAND = { background: "color-mix(in srgb, var(--foreground) 4%, transparent)" } as const;
function Row({ s, band, picked, onToggle }: { s: CounselorStudent; /** every other row, a faint band */ band: boolean; /** null outside select mode */ picked: boolean | null; onToggle: () => void }) {
  const cells = (
    <>
      <StudentFace s={s} size={36} />
      <span className="flex min-w-0 flex-1 flex-col md:w-[220px] md:flex-none">
        <span className="truncate text-[15px] font-semibold">{lastFirst(s.name)}</span>
        <span className="truncate text-[13px] md:hidden" style={MUTED}>Grade {s.grade} · {progressCell(s)}</span>
      </span>
      <span className="hidden w-[72px] flex-none text-[14px] md:block" style={MUTED}>{s.grade}</span>
      <span className="flex w-[150px] flex-none items-center gap-[7px] text-[13px] font-semibold whitespace-nowrap max-md:w-auto">
        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: STATUS_DOT[s.status] }} />
        <span className="max-md:sr-only">{s.status}</span>
      </span>
      <span className="hidden min-w-0 flex-1 truncate text-[14px] md:block" style={MUTED}>{progressCell(s)}</span>
      <span className="hidden w-[110px] flex-none text-right text-[13px] md:block" style={MUTED}>{lastActiveLabel(s.lastActive)}</span>
    </>
  );
  if (picked !== null) {
    return (
      <li style={band ? BAND : undefined}>
        <label className="dm-quiet flex cursor-pointer items-center gap-[14px] px-[var(--space-5)] py-[16px]">
          <input type="checkbox" checked={picked} onChange={onToggle} aria-label={`Select ${s.name} for a group message`} className="size-[18px] flex-none accent-[var(--primary)]" />
          {cells}
        </label>
      </li>
    );
  }
  return (
    <li style={band ? BAND : undefined}>
      <Link href={studentHref(s.id)} className="dm-quiet group flex items-center gap-[14px] px-[var(--space-5)] py-[16px]">
        {cells}
      </Link>
    </li>
  );
}
