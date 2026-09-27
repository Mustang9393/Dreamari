"use client";

// My Impact, rebuilt 27 Sept 2026 on Maisha's review of the tabbed version:
// "Am I able to see the principal report? So I can show during demos. It
// can be like the replit." / "Where is the notable achievements portion
// from the replit? Need this here for a snapshot." / "I don't think this
// needs so many tabs within it." / "Please utilize the same numbers as the
// replit because its standard per actual caseload of counselors so it'll
// make more sense for the demo." / "This section needs a lot more work and
// closer to replit."
//
// So: one page, every figure the Replit's own (REPLIT below, read off the
// live Replit's My Impact on 27 Sept 2026), with the Replit's clutter cut
// (direct instruction the same day: "WE CAN for sure clean this up and
// reduce copy and clutter"). Every data point stays; what went is the
// repetition: the District Compliance section (its three comparisons now
// sit on the numbers they judge, and the full table is the Principal
// report's), the sentences restating numbers, and the report footer.
// Activity and student engagement share one card. "Principal report"
// opens the Replit's Principal / District Report on screen, as a modal
// with Print, instead of going straight to the print dialog, so it can be
// shown in a demo. Postsecondary plans by pathway is computed from the
// reference roster, which is the Replit's own 120 students (79 with a
// declared plan, as the Replit states).

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Printer, Share2, FileBarChart, BookOpen, Briefcase, Heart, CheckCircle2, Star, X, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getRoster, DEMO_SCHOOL, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { OverviewCard } from "./overviewShared";
import { printDocumentPage } from "./DocumentDesk";
import { COUNSELOR_COVER, COUNSELOR_HEADSHOTS, CounselorHeadshot, seededPick } from "./MyImpact";
import { GLASS_INSET } from "../surfaces";

/** The Replit's own My Impact figures, verbatim. */
const REPLIT = {
  year: "Academic Year 2023–2024",
  period: "August 2023 – January 2024",
  shortPeriod: "Aug 2023 – Jan 2024",
  caseload: 120,
  onTrackPct: 86,
  withPlan: 79,
  withPlanPct: 66,
  responseRatePct: 33,
  grades: [
    { grade: 9, onTrack: 27, total: 30, avg: 44 },
    { grade: 10, onTrack: 27, total: 30, avg: 65 },
    { grade: 11, onTrack: 23, total: 30, avg: 69 },
    { grade: 12, onTrack: 26, total: 30, avg: 80 },
  ],
  overallAvg: 64,
  milestones: [
    { value: 73, label: "Career reports approved", note: "87 of 120 students" },
    { value: 65, label: "Academic plans approved", note: "78 of 120 students" },
    { value: 39, label: "Résumés complete", note: "35 of 90 in Grades 10-12" },
    { value: 87, label: "Senior plan compliance", note: "27 of 30 applying · target 80%", chip: "met" as const },
  ] as { value: number; label: string; note: string; chip?: "met" }[],
  activity: [
    { value: "15", label: "Plans reviewed", note: "10 pending" },
    { value: "5/15", label: "Questions answered", note: "33%" },
    { value: "10", label: "Announcements", note: "school-wide" },
    { value: "17", label: "Support flags", note: "14% of caseload" },
    { value: "2.1 days", label: "Review turnaround", note: "district standard 5" },
  ],
  turnaround: "2.1 days",
  engagement: [
    { value: 7293, label: "Career drops" },
    { value: 852, label: "Simulations" },
    { value: 1101, label: "Careers saved" },
    { value: 1246, label: "Colleges saved" },
    { value: 410, label: "Community posts" },
  ],
  asca: [
    { icon: BookOpen, title: "Academic", items: ["Planning for all 120 students", "65% with an approved 4-year plan", "Course selection and credit monitoring"] },
    { icon: Briefcase, title: "Career", items: ["73% career reports complete", "66% with a declared pathway", "Simulations and assessments on Dreamari"] },
    { icon: Heart, title: "Social-emotional", items: ["17 students monitored for support", "33% question response rate", "6 at-risk students flagged early"] },
  ],
  // The Replit's eight notable achievements, each cut to one line: every
  // number and comparison kept, the connecting prose dropped.
  snapshot: [
    ["87% senior plan rate,", "above the district's 80% benchmark"],
    ["86% on track", "across 120 students, against a 71% school average"],
    ["2.1-day review turnaround,", "against the district's 5-day standard"],
    ["27 of 30 seniors", "with applications underway"],
    ["33% of student questions", "answered through Counselor Connect"],
    ["17 students", "identified early for extra support"],
    ["7,293 career-exploration activities", "completed on Dreamari"],
    ["3,199 engagement touchpoints", "from simulations, pathways and saved colleges"],
  ] as [string, string][],
  // The Principal / District Report's own six achievements and five-row
  // compliance table, as the Replit's modal words them.
  reportAchievements: [
    "Maintained a 86% on-track rate across a caseload of 120 students, above the school average of 71%.",
    "Senior postsecondary plan rate of 87%: meets the district 80% benchmark.",
    "27 of 30 seniors have active college or postsecondary applications underway.",
    "Achieved a 33% student question response rate, ensuring all inquiries received timely, professional replies.",
    "Reviewed and processed all counseling submissions at an average turnaround of 2.1 days vs. the district 5-day standard.",
    "17 students proactively identified for additional support through early-intervention monitoring.",
  ],
  reportCompliance: [
    { metric: "Postsecondary Plans on File", result: "66%", target: "≥ 80%", met: false },
    { metric: "Senior Plan Compliance", result: "87%", target: "≥ 80%", met: true },
    { metric: "Plan Review Turnaround", result: "2.1 days avg.", target: "≤ 5 days", met: true },
    { metric: "On-Track Rate", result: "86%", target: "≥ 70%", met: true },
    { metric: "Career Report Completion", result: "73%", target: "≥ 60%", met: true },
  ],
};

const PATHWAY_ORDER: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Military", "Workforce", "Undecided"];
const MET = "var(--cd-green)";
const OPEN = "var(--cd-amber)";

function Bar({ pct, muted }: { pct: number; muted?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative block h-[8px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
      <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: muted ? "color-mix(in srgb, var(--foreground) 28%, transparent)" : "linear-gradient(90deg, color-mix(in srgb, var(--primary) 45%, transparent), var(--primary))" }} />
    </span>
  );
}

function Stat({ value, label, note, big, chip }: { value: string; label: string; note?: string; big?: boolean; chip?: React.ReactNode | "met" }) {
  return (
    <div className="flex flex-col gap-[3px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>
      <span className="flex items-start justify-between gap-[8px]">
        <span className={`${big ? "text-[30px]" : "text-[24px]"} leading-[1.05] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
        {chip === "met" ? <MetChip met /> : chip}
      </span>
      <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      {note && <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </div>
  );
}

function MetChip({ met }: { met: boolean }) {
  return (
    <span className="inline-flex items-center gap-[4px] rounded-full px-[9px] py-[2px] text-[11px] font-extrabold" style={{ background: `color-mix(in srgb, ${met ? MET : OPEN} 16%, transparent)`, color: met ? MET : OPEN }}>
      {met ? <CheckCircle2 className="h-[11px] w-[11px]" aria-hidden /> : <AlertTriangle className="h-[11px] w-[11px]" aria-hidden />}{met ? "Met" : "In progress"}
    </span>
  );
}

/** The Replit's Principal / District Report, on screen: a summary header,
 *  six notable achievements and the compliance table, with Print. */
function PrincipalReport({ who, role, school, onClose }: { who: string; role: string; school: string; onClose: () => void }) {
  const docRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-[var(--space-4)]" role="dialog" aria-modal="true" aria-label="Principal / District Report">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 58%, transparent)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
      <div className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "var(--cd-panel-shadow)" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex flex-col gap-[2px]">
            <h2 className="flex items-center gap-[8px] text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><FileBarChart className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />Principal / District Report</h2>
            <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>A presentable summary of counselor impact and compliance for administrative review. Review and export or copy before sharing.</span>
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="overflow-y-auto p-[var(--space-5)]">
          <div ref={docRef} className="flex flex-col gap-[var(--space-5)]" style={{ color: "var(--foreground)" }}>
            <div className="flex flex-col gap-[4px] rounded-[var(--radius-md)] p-[var(--space-5)]" style={{ background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #1b1f5e))", color: "#FFFFFF" }}>
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "rgba(255,255,255,0.8)" }}>Counselor Impact Summary · {REPLIT.year}</span>
              <span className="text-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{who}, {role}</span>
              <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{school} · Reporting Period: {REPLIT.shortPeriod}</span>
            </div>
            <section className="flex flex-col gap-[10px]">
              <h3 className="flex items-center gap-[8px] text-[14px] font-bold"><Star className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />Notable Achievements</h3>
              <ul className="flex flex-col gap-[8px]">
                {REPLIT.reportAchievements.map((a) => (
                  <li key={a} className="flex items-start gap-[8px] text-[13px] leading-[19px]"><CheckCircle2 className="mt-[2px] h-[14px] w-[14px] flex-none" aria-hidden style={{ color: MET }} />{a}</li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col gap-[10px]">
              <h3 className="flex items-center gap-[8px] text-[14px] font-bold"><CheckCircle2 className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />District Compliance Summary</h3>
              <div className="overflow-x-auto rounded-[var(--radius-md)] border" style={{ borderColor: "var(--glass-border)" }}>
                <table className="w-full min-w-[480px] border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--glass-border)", background: "var(--inset-bg)" }}>
                      {["Metric", "Result", "Target", "Status"].map((h) => <th key={h} className="px-[12px] py-[9px] text-left text-[11.5px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {REPLIT.reportCompliance.map((r) => (
                      <tr key={r.metric} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                        <td className="px-[12px] py-[9px] font-semibold">{r.metric}</td>
                        <td className="px-[12px] py-[9px] font-extrabold tabular-nums">{r.result}</td>
                        <td className="px-[12px] py-[9px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.target}</td>
                        <td className="px-[12px] py-[9px]"><MetChip met={r.met} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
        <div className="flex justify-end gap-[8px] border-t px-[var(--space-5)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
          <button type="button" onClick={() => printDocumentPage(docRef.current, `Principal report, ${who}`)} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Printer className="h-[14px] w-[14px]" aria-hidden /> Print report</button>
          <button type="button" onClick={onClose} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold">Done</button>
        </div>
      </div>
    </div>
  );
}

export function CounselorImpact() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const who = account.name || "Sarah Chen";
  const role = account.role || "School Counselor";
  const school = account.school || DEMO_SCHOOL;
  const [report, setReport] = useState(false);
  const pathways = useMemo(() => {
    const roster = getRoster();
    const counts = new Map<PostsecondaryIntent, number>(PATHWAY_ORDER.map((p) => [p, 0]));
    for (const s of roster) counts.set(s.postsecondaryIntent, (counts.get(s.postsecondaryIntent) ?? 0) + 1);
    return PATHWAY_ORDER.map((p) => ({ label: p, count: counts.get(p) ?? 0 }));
  }, []);
  const pathwayMax = Math.max(...pathways.map((p) => p.count), 1);
  const hdrBtn = { background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" } as const;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <section className="relative min-h-[208px] overflow-hidden rounded-[var(--radius-lg)] border print:hidden" style={{ borderColor: "var(--glass-border)" }}>
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COUNSELOR_COVER} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.88) 0%, rgba(12,16,35,0.55) 45%, rgba(12,16,35,0.18) 75%, transparent 100%)" }} />
        </div>
        <div className="relative flex min-h-[208px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-4)] pt-[52px] sm:p-[var(--space-5)]">
          <div className="flex min-w-0 items-end gap-[var(--space-4)]">
            <CounselorHeadshot src={seededPick(who, COUNSELOR_HEADSHOTS)} />
            <div className="flex min-w-0 flex-col gap-[2px]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              <h2 className="truncate text-[18px] font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{who}</h2>
              <span className="truncate text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{role} · {school} · {REPLIT.shortPeriod}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[6px] sm:gap-[8px]">
            <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={hdrBtn}><Printer className="h-[14px] w-[14px]" aria-hidden /> Print</button>
            <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={hdrBtn}><Share2 className="h-[14px] w-[14px]" aria-hidden /> Share</button>
            <button type="button" onClick={() => setReport(true)} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold"><FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Principal report</button>
          </div>
        </div>
      </section>

      {/* The Replit's four headline numbers; the two with a district
         target carry it, so the compliance comparisons need no section of
         their own (they are also the Principal report's table). */}
      <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4">
        <Stat big value={String(REPLIT.caseload)} label="Caseload" note="students" />
        <Stat big value={`${REPLIT.onTrackPct}%`} label="On track" note="school average 71%" chip={<MetChip met />} />
        <Stat big value={`${REPLIT.withPlanPct}%`} label="Postsecondary plans" note="target 80%" chip={<MetChip met={false} />} />
        <Stat big value={`${REPLIT.responseRatePct}%`} label="Questions answered" note="5 of 15" />
      </div>

      {/* The snapshot Maisha asked for, near the top: each achievement as
         one short line, the numbers in bold. */}
      <OverviewCard title="Notable achievements" unit="Fall semester">
        <ul className="grid grid-cols-1 gap-x-[var(--space-5)] gap-y-[10px] lg:grid-cols-2">
          {REPLIT.snapshot.map((a) => (
            <li key={a.join("")} className="flex items-start gap-[9px] text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>
              <Star className="mt-[2px] h-[13px] w-[13px] flex-none" aria-hidden fill="currentColor" style={{ color: "var(--primary)" }} />
              <span><b>{a[0]}</b> {a[1]}</span>
            </li>
          ))}
        </ul>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <OverviewCard title="Plans by pathway" unit={`${REPLIT.withPlan} of ${REPLIT.caseload} declared`}>
          <ul className="flex flex-col gap-[10px]">
            {pathways.map((p) => (
              <li key={p.label} className="grid grid-cols-[150px_minmax(0,1fr)_28px] items-center gap-[12px] text-[13px]">
                <span className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{p.label}</span>
                <Bar pct={(p.count / pathwayMax) * 100} muted={p.label === "Undecided"} />
                <span className="text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{p.count}</span>
              </li>
            ))}
          </ul>
        </OverviewCard>
        <OverviewCard title="Progress by grade" unit={`${REPLIT.overallAvg}% average completion`}>
          <ul className="flex flex-col gap-[12px]">
            {REPLIT.grades.map((g) => (
              <li key={g.grade} className="flex flex-col gap-[5px]">
                <span className="flex items-baseline justify-between gap-[10px] text-[13px]">
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>Grade {g.grade}</span>
                  <span className="font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{g.onTrack}/{g.total} on track · {g.avg}%</span>
                </span>
                <Bar pct={g.avg} />
              </li>
            ))}
          </ul>
        </OverviewCard>
      </div>

      <OverviewCard title="Readiness milestones">
        <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4">
          {REPLIT.milestones.map((m) => <Stat key={m.label} value={`${m.value}%`} label={m.label} note={m.note} chip={m.chip} />)}
        </div>
      </OverviewCard>

      {/* The Replit's activity and engagement sections as one card: what the
         counselor did, then what their students did. */}
      <OverviewCard title="Your work this period">
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-5">
          {REPLIT.activity.map((a) => <Stat key={a.label} value={a.value} label={a.label} note={a.note} />)}
        </div>
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student activity on Dreamari</span>
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-5">
          {REPLIT.engagement.map((e) => <Stat key={e.label} value={e.value.toLocaleString("en-US")} label={e.label} />)}
        </div>
      </OverviewCard>

      <OverviewCard title="ASCA alignment" unit="National Model, 4th Ed.">
        <div className="grid grid-cols-1 gap-[var(--space-3)] lg:grid-cols-3">
          {REPLIT.asca.map((c) => (
            <div key={c.title} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>
              <span className="flex items-center gap-[8px]"><c.icon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} /><h3 className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.title}</h3></span>
              <ul className="flex flex-col gap-[5px]">
                {c.items.map((it) => <li key={it} className="flex items-start gap-[7px] text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}><CheckCircle2 className="mt-[2px] h-[12px] w-[12px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </OverviewCard>

      {report && <PrincipalReport who={who} role={role} school={school} onClose={() => setReport(false)} />}
    </div>
  );
}
