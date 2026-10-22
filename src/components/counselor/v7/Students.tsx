"use client";

// v7 Students (20 Oct 2026): the Replit's Student Directory. Search,
// filters, Export, and one row per student with grade, status, career
// interest, plan, progress and last active. Opening a row opens the
// student's profile (StudentProfile.tsx).
//
// Declutter (20 Oct 2026, Chandu: "the lists are too cluttered still, i
// dont see any declutter happening"): the seven-column table is now three
// groups (At risk, Needs attention, On track) with one line per student:
// face, name, the one thing open, last active. Status is the group, not a
// column (Gestalt proximity); On track starts folded (progressive
// disclosure: 103 quiet rows a counselor rarely needs first). Grade, career
// interest and plan left the row; they lead the profile, stay searchable,
// filterable (grade, plan) and in the export. No row checkboxes (batch sends
// live with the message tools, Chandu 25 Sept).

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, MessageSquare, Search, X } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank, lastActiveLabel, type CounselorStudent } from "@/lib/counselorRoster";
import { StudentFace } from "../v5/StudentFace";
import { flagsFor, GPA_BANDS, gpaOf, inGpaBand, type GpaBand } from "./data";
import { StudentProfile } from "./StudentProfile";
import { ChevronDown } from "lucide-react";
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

const GROUPS: { key: CounselorStudent["status"]; label: string; open: boolean }[] = [
  { key: "At Risk", label: "At risk", open: true },
  { key: "Needs Attention", label: "Needs attention", open: true },
  { key: "On Track", label: "On track", open: false },
];

function Directory() {
  const roster = useReviewedRoster();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [plan, setPlan] = useState("all");
  const [gpa, setGpa] = useState<GpaBand>("all");
  // Message students (the Replit's row checkboxes and "Message selected (N)",
  // 22 Oct 2026): a select mode, so the rows stay one line until asked
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const router = useRouter();
  const plans = useMemo(() => [...new Set(roster.map(planOf))].sort(), [roster]);
  const needle = q.trim().toLowerCase();
  const filtering = !!needle || grade !== "all" || plan !== "all" || gpa !== "all";
  const list = useMemo(() => roster
    .filter((s) => !needle || s.name.toLowerCase().includes(needle) || interestOf(s).toLowerCase().includes(needle))
    .filter((s) => grade === "all" || String(s.grade) === grade)
    .filter((s) => plan === "all" || planOf(s) === plan)
    .filter((s) => inGpaBand(s, gpa))
    .sort(attentionRank), [roster, needle, grade, plan, gpa]);
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const messageSelected = () => {
    const ids = [...picked];
    if (!ids.length) return;
    router.push(v7("workspace", `&tab=messages&to=${encodeURIComponent(ids.join(","))}`));
  };

  const exportCsv = () => {
    const rows = [["Student", "Grade", "Status", "Career interest", "Plan", "GPA", "Progress", "Last active"], ...list.map((s) => [s.name, String(s.grade), s.status, interestOf(s), planOf(s), gpaOf(s)?.toFixed(1) ?? "", progressOf(s), lastActiveLabel(s.lastActive)])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Students" />
      <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-[14px] h-4 w-4" style={MUTED} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students or careers" aria-label="Search students"
            className="h-11 w-full rounded-[var(--radius-md)] border bg-transparent pr-[12px] pl-[40px] text-[15px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
        </label>
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Listbox ariaLabel="Grade" value={grade} onChange={setGrade} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "All grades" }, ...[9, 10, 11, 12].map((g) => ({ value: String(g), label: `Grade ${g}` }))]} />
          <Listbox ariaLabel="Plan" value={plan} onChange={setPlan} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "Any plan" }, ...plans.map((p) => ({ value: p, label: p }))]} />
          <Listbox ariaLabel="GPA" value={gpa} onChange={(v) => setGpa(v as GpaBand)} className={PICKER} style={PICKER_STYLE} options={GPA_BANDS} />
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
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* a search or filter opens every group, so a match is never folded away */}
          {GROUPS.map((g) => <Group key={`${g.key}-${filtering}`} label={g.label} status={g.key} open={g.open || filtering} list={list.filter((s) => s.status === g.key)} picked={selecting ? picked : null} onToggle={toggle} />)}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-6)]">
          <p className="text-[16px] font-semibold">No students match.</p>
          <button type="button" onClick={() => { setQ(""); setGrade("all"); setPlan("all"); setGpa("all"); }} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}

const PAGE_IN_GROUP = 12;

function Group({ label, status, open: startOpen, list, picked, onToggle }: { label: string; status: CounselorStudent["status"]; open: boolean; list: CounselorStudent[]; /** select mode: the picked ids */ picked: Set<string> | null; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(startOpen);
  const [shown, setShown] = useState(PAGE_IN_GROUP);
  if (!list.length) return null;
  return (
    <section aria-label={label} className="flex flex-col gap-[var(--space-2)]">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="dm-quiet -mx-[8px] flex w-fit cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[6px]">
        <span aria-hidden className="size-[9px] rounded-full" style={{ background: STATUS_DOT[status] }} />
        <span className="text-[16px] font-semibold">{label}</span>
        <span className="text-[16px] font-semibold tabular-nums" style={MUTED}>{list.length}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} style={MUTED} aria-hidden />
      </button>
      {open && (
        <>
          <ul className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
            {list.slice(0, shown).map((s) => <Row key={s.id} s={s} picked={picked ? picked.has(s.id) : null} onToggle={() => onToggle(s.id)} />)}
          </ul>
          {list.length > shown && <button type="button" onClick={() => setShown((n) => n + 25)} className="dm-link w-fit cursor-pointer pt-[4px] text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Show {Math.min(25, list.length - shown)} more</button>}
        </>
      )}
    </section>
  );
}

/** One line: face, name, the one thing open, last active. */
function Row({ s, picked, onToggle }: { s: CounselorStudent; /** null outside select mode */ picked: boolean | null; onToggle: () => void }) {
  if (picked !== null) {
    return (
      <li className="border-b last:border-b-0" style={{ borderColor: RULE }}>
        <label className="dm-quiet flex cursor-pointer items-center gap-[14px] px-[var(--space-5)] py-[11px]">
          <input type="checkbox" checked={picked} onChange={onToggle} aria-label={`Select ${s.name} for a group message`} className="size-[18px] flex-none accent-[var(--primary)]" />
          <StudentFace s={s} size={32} />
          <span className="w-[132px] flex-none truncate text-[15px] font-semibold sm:w-[220px]">{s.name}</span>
          <span className="min-w-0 flex-1 truncate text-[14px]" style={MUTED}>{progressOf(s)}</span>
          <span className="hidden w-[96px] flex-none text-right text-[13px] sm:block" style={MUTED}>{lastActiveLabel(s.lastActive)}</span>
        </label>
      </li>
    );
  }
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: RULE }}>
      <Link href={studentHref(s.id)} className="dm-quiet group flex items-center gap-[14px] px-[var(--space-5)] py-[11px]">
        <StudentFace s={s} size={32} />
        <span className="w-[132px] flex-none truncate text-[15px] font-semibold sm:w-[220px]">{s.name}</span>
        <span className="min-w-0 flex-1 truncate text-[14px]" style={MUTED}>{progressOf(s)}</span>
        <span className="hidden w-[96px] flex-none text-right text-[13px] sm:block" style={MUTED}>{lastActiveLabel(s.lastActive)}</span>
      </Link>
    </li>
  );
}
