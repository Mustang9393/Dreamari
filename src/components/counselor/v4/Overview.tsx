"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Compass, GraduationCap, Sparkles, Target, Users } from "lucide-react";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank, attentionReason, milestonesForGrade, type MilestoneKey } from "@/lib/counselorRoster";
import { Avatar, STATUS_COLORS } from "../chips";
import { GLASS_CARD } from "../surfaces";

// DEMO-ONLY: v4 is an experience study over the existing reviewed roster.
// Seeded rows are reference data; these aggregate values are not live school analytics.
const statusColors = STATUS_COLORS;
const milestones: MilestoneKey[] = ["Career Report", "Resume", "Academic Plan", "College List", "Financial Aid"];
const surface = { ...GLASS_CARD, borderColor: "var(--glass-border)" };

function Tile({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`relative min-w-0 overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`} style={surface}>{children}</section>;
}

function LinkButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="dm-quiet inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[12px] font-bold transition-transform hover:-translate-y-0.5" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-2)" }}>{children}<ArrowUpRight aria-hidden className="size-4" /></button>;
}

export function Overview() {
  const router = useRouter();
  const reviewed = useReviewedRoster();
  const { gradeFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  const roster = useMemo(() => gradeFilter === "All Grades" ? reviewed : reviewed.filter((student) => student.grade === gradeFilter), [reviewed, gradeFilter]);
  const total = roster.length;
  const counts = { "On Track": roster.filter((s) => s.status === "On Track").length, "Needs Attention": roster.filter((s) => s.status === "Needs Attention").length, "At Risk": roster.filter((s) => s.status === "At Risk").length };
  const planned = roster.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const priority = [...roster].filter((s) => s.status === "At Risk").sort(attentionRank).slice(0, 4);
  const pathway = [...roster.reduce((map, student) => map.set(student.careerTrack, (map.get(student.careerTrack) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const approval = (key: MilestoneKey, grade: number) => {
    const eligible = roster.filter((s) => s.grade === grade && milestonesForGrade(s.grade).includes(key));
    return eligible.length ? Math.round(eligible.filter((s) => s.milestones[key] === "Approved").length / eligible.length * 100) : null;
  };
  const goStatus = (status: keyof typeof counts) => { setStatusFilter(status); router.push("/counselor?view=students"); };
  const goPlan = (plan: "With Plan" | "Undecided") => { setPlanFilter(plan); router.push("/counselor?view=students"); };
  const pct = (value: number) => total ? Math.round(value / total * 100) : 0;

  return <div className="flex flex-col gap-[var(--space-4)]">
    <section className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ borderColor: "var(--glass-border)", background: "radial-gradient(circle at 90% 10%, color-mix(in srgb, var(--primary) 34%, transparent), transparent 36%), linear-gradient(125deg, var(--glass-surface-2), var(--card))" }}>
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-72 rounded-full border opacity-25" style={{ borderColor: "var(--primary)", boxShadow: "0 0 0 32px color-mix(in srgb, var(--primary) 10%, transparent), 0 0 0 70px color-mix(in srgb, var(--primary) 7%, transparent)" }} />
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div><span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}><Sparkles className="size-4" /> Your school, in motion</span><h2 className="mt-3 max-w-[680px] text-[clamp(1.7rem,3.5vw,3.2rem)] font-extrabold leading-[1.08]" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>See the whole journey.<br /><span style={{ color: "var(--primary)" }}>Know who needs you.</span></h2><p className="mt-3 text-[13px]" style={{ color: "var(--muted-foreground)" }}>{gradeFilter === "All Grades" ? "All grades" : `Grade ${gradeFilter}`} · {total} students in your current view</p></div>
        <LinkButton onClick={() => router.push("/counselor?view=students")}>Open students</LinkButton>
      </div>
      <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Students", value: total, icon: Users, action: () => router.push("/counselor?view=students") },
          { label: "On track", value: `${pct(counts["On Track"])}%`, icon: Target, action: () => goStatus("On Track") },
          { label: "With a plan", value: `${pct(planned)}%`, icon: Compass, action: () => goPlan("With Plan") },
          { label: "At risk", value: counts["At Risk"], icon: GraduationCap, action: () => goStatus("At Risk") },
        ].map((item) => <button key={item.label} onClick={item.action} className="dm-quiet group min-w-0 rounded-[var(--radius-md)] border p-4 text-left transition-transform hover:-translate-y-0.5" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 70%, transparent)" }}><item.icon className="mb-4 size-5" style={{ color: "var(--primary)" }} aria-hidden /><strong className="block text-[clamp(1.5rem,3vw,2.3rem)] leading-none tabular-nums" style={{ color: "var(--foreground)" }}>{item.value}</strong><span className="mt-2 block text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.label} ↗</span></button>)}
      </div>
    </section>

    <div className="grid gap-[var(--space-4)] xl:grid-cols-[1.25fr_1fr]">
      <Tile><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Caseload pulse</h2><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Where every student stands right now</p></div><span className="text-xs font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{total} total</span></div>
        <div className="mt-6 flex h-16 overflow-hidden rounded-[var(--radius-md)]" role="img" aria-label={`On track ${counts["On Track"]}, needs attention ${counts["Needs Attention"]}, at risk ${counts["At Risk"]}`}>
          {(Object.keys(counts) as (keyof typeof counts)[]).map((key) => <button key={key} type="button" onClick={() => goStatus(key)} title={`${key}: ${counts[key]} students`} className="dm-quiet relative min-w-0 transition-opacity hover:opacity-75" style={{ width: `${pct(counts[key])}%`, background: statusColors[key] }} aria-label={`Open ${counts[key]} ${key.toLowerCase()} students`} />)}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">{(Object.keys(counts) as (keyof typeof counts)[]).map((key) => <button key={key} onClick={() => goStatus(key)} className="dm-quiet flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-2 text-left text-[12px]" style={{ color: "var(--foreground)" }}><span className="size-2.5 shrink-0 rounded-full" style={{ background: statusColors[key] }} /><span className="min-w-0 flex-1 truncate">{key}</span><strong className="tabular-nums">{counts[key]}</strong></button>)}</div>
      </Tile>
      <Tile><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Next moves</h2><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Highest priority students first</p></div><LinkButton onClick={() => goStatus("At Risk")}>See all</LinkButton></div>
        <div className="mt-4 space-y-2">{priority.length ? priority.map((student) => <button key={student.id} onClick={() => router.push(`/counselor?view=students&studentId=${student.id}`)} className="dm-quiet flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-md)] border px-3 text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}><Avatar name={student.name} size={32} index={student.avatarIndex} /><span className="min-w-0 flex-1"><strong className="block truncate text-[13px]" style={{ color: "var(--foreground)" }}>{student.name}</strong><span className="block truncate text-[11px]" style={{ color: "var(--muted-foreground)" }}>{attentionReason(student)}</span></span><ArrowUpRight aria-hidden className="size-4 shrink-0" style={{ color: "var(--muted-foreground)" }} /></button>) : <p className="py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>No at-risk students in this view.</p>}</div>
      </Tile>
    </div>

    <div className="grid gap-[var(--space-4)] xl:grid-cols-[1.25fr_1fr]">
      <Tile><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Milestone map</h2><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Approved share among students eligible for each step</p></div><LinkButton onClick={() => router.push("/counselor?view=milestones")}>Track milestones</LinkButton></div>
        <div className="mt-6 overflow-x-auto"><div className="min-w-[520px]"><div className="mb-2 grid grid-cols-[150px_repeat(4,1fr)] gap-2 text-center text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}><span /><span>Grade 9</span><span>Grade 10</span><span>Grade 11</span><span>Grade 12</span></div>{milestones.map((key) => <div key={key} className="grid grid-cols-[150px_repeat(4,1fr)] gap-2 py-1"><span className="self-center truncate pr-2 text-[12px] font-semibold" title={key} style={{ color: "var(--foreground)" }}>{key}</span>{[9,10,11,12].map((grade) => { const value = approval(key, grade); return <div key={grade} className="flex h-9 items-center justify-center rounded-[var(--radius-sm)] text-[11px] font-bold tabular-nums" title={value === null ? `${key}, grade ${grade}: not applicable or no students` : `${key}, grade ${grade}: ${value}% approved`} style={{ color: value === null ? "var(--muted-foreground)" : "var(--foreground)", background: value === null ? "var(--glass-surface-2)" : `color-mix(in srgb, var(--primary) ${Math.max(12, value)}%, var(--glass-surface-2))` }}>{value === null ? "—" : `${value}%`}</div>; })}</div>)}</div></div>
      </Tile>
      <Tile><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Pathways taking shape</h2><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Students by career interest world</p></div><LinkButton onClick={() => router.push("/counselor?view=insights")}>Explore</LinkButton></div><div className="mt-5 space-y-3">{pathway.slice(0, 7).map(([name, count], index) => <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1"><span className="truncate text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>{name}</span><strong className="text-[12px] tabular-nums" style={{ color: "var(--foreground)" }}>{count}</strong><div className="col-span-2 h-2 overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}><div className="h-full rounded-full" style={{ width: `${total ? count / total * 100 : 0}%`, background: `color-mix(in srgb, var(--primary) ${Math.max(38, 100 - index * 8)}%, var(--card))` }} /></div></div>)}{pathway.length > 7 && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>+ {pathway.length - 7} more worlds in Insights</p>}</div></Tile>
    </div>
    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Preview metrics reflect the current demo roster and your grade filter. Historical trend comparisons are unavailable.</p>
  </div>;
}
