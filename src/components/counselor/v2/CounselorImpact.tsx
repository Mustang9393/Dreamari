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

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Printer, Share2, FileBarChart, BookOpen, Briefcase, Heart, CheckCircle2, AlertTriangle, Mail, Copy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { attentionReason, getRoster, DEMO_SCHOOL, type CounselorStudent, type MilestoneKey, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { OverviewCard } from "./overviewShared";
import { BRAND, Crest, FullScreenDocument, PAGE_H, PAGE_W, SANS, SERIF, printDocumentPage } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { DrillPanel, DrillTile, type Drill, type DrillStudent } from "./Drill";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";
import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { Go } from "../chips";
import { curriculumForGrade } from "@/lib/counselorCurriculum";
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
    { icon: BookOpen, title: "Academic", items: ["Planning for all 120 students", "65% with an approved 4-year plan", "Course selection and credit monitoring"], full: ["Academic planning supported for all 120 students", "65% of students have approved 4-year academic plans", "Course selection and credit-monitoring support delivered"] },
    { icon: Briefcase, title: "Career", items: ["73% career reports complete", "66% with a declared pathway", "Simulations and assessments on Dreamari"], full: ["73% career report completion rate across caseload", "Career pathway declared for 66% of students", "Career simulations and assessments facilitated via Dreamari"] },
    { icon: Heart, title: "Social-emotional", items: ["17 students monitored for support", "33% question response rate", "6 at-risk students flagged early"], full: ["17 students identified and actively monitored for support", "33% student question response rate via Counselor Connect", "6 at-risk students flagged for proactive intervention"] },
  ],
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

function Stat({ value, label, note, big, chip, onOpen }: { value: string; label: string; note?: string; big?: boolean; chip?: React.ReactNode | "met"; onOpen?: () => void }) {
  const content = (
    <>
      <span className="flex items-start justify-between gap-[8px]">
        <span className={`${big ? "text-[30px]" : "text-[24px]"} leading-[1.05] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
        {chip === "met" ? <MetChip met /> : chip}
      </span>
      <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      {note && <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </>
  );
  if (onOpen) return <DrillTile onOpen={onOpen} label={label} className={`h-full gap-[3px] rounded-[var(--radius-md)] border p-[var(--space-4)] ${chip ? "" : "pr-[28px]"}`}>{content}</DrillTile>;
  return <div className="flex h-full flex-col gap-[3px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>{content}</div>;
}

function MetChip({ met }: { met: boolean }) {
  return (
    <span className="inline-flex items-center gap-[4px] rounded-full px-[9px] py-[2px] text-[11px] font-extrabold" style={{ background: `color-mix(in srgb, ${met ? MET : OPEN} 16%, transparent)`, color: met ? MET : OPEN }}>
      {met ? <CheckCircle2 className="h-[11px] w-[11px]" aria-hidden /> : <AlertTriangle className="h-[11px] w-[11px]" aria-hidden />}{met ? "Met" : "In progress"}
    </span>
  );
}

/** The Dreamari mark and wordmark in ink, for the masthead: every line
 *  flush right, so the block reads as one right-aligned unit opposite the
 *  school's crest (direct feedback, 27 Sept 2026: "Dreamari should be right
 *  aligned"). */
function DreamariLockup() {
  return (
    <span className="flex flex-col items-end gap-[5px] text-right">
      <span style={{ fontFamily: SANS, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Data from</span>
      <span className="flex items-center gap-[7px]">
        <span aria-hidden className="h-[13px] w-[23px] flex-none" style={{ background: "var(--ink)", maskImage: "url(/images/app/logo-mark.svg)", WebkitMaskImage: "url(/images/app/logo-mark.svg)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "right center", WebkitMaskPosition: "right center" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", color: "var(--ink)" }}>DREAMARI</span>
      </span>
      <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Career readiness platform</span>
    </span>
  );
}

/** The Replit's Principal / District Report as a printed document (27 Sept
 *  2026, direct instruction: "make the principal report much more
 *  editorially composed, designed, beautifully formatted, add a school x
 *  Dreamari branding", and "Make sure the principal report has all the
 *  content that was in the replit dont leave anything out, just present it
 *  better"). Every line of the Replit's report is here except the modal's own
 *  instruction to the counselor ("A presentable summary ... Review and
 *  export or copy before sharing"), which the principal does not need
 *  (direct feedback, 27 Sept 2026: "This is for the counselor to share
 *  with the principal they know what it is"): the title, the summary header (the report's kicker, the counselor and
 *  role, the school and reporting period), the six notable achievements
 *  and the five-row District Compliance Summary with Result, Target and
 *  Status. The Replit's Print Report and Done are the viewer's Print and
 *  close. Presented as a US Letter page: a co-branded masthead (the
 *  school's crest and name, a hairline cross, Dreamari's mark), a serif
 *  headline, the four figures a principal reads first, numbered
 *  achievements and a ruled table. */
function PrincipalReportPage({ who, role, school, photo, pageRef }: { who: string; role: string; school: string; photo: string; pageRef: React.Ref<HTMLDivElement> }) {
  const kicker = { fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const };
  const section = (n: string, title: string) => (
    <div className="flex items-baseline gap-[12px] border-b pb-[8px]" style={{ borderColor: "var(--ink)" }}>
      <span style={{ ...kicker, color: BRAND }}>{n}</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, letterSpacing: "-0.005em", color: "var(--ink)" }}>{title}</h2>
    </div>
  );
  const figures = [
    { value: "86%", label: "On-track rate", note: "school average 71%" },
    { value: "87%", label: "Senior plan compliance", note: "district target 80%" },
    { value: "2.1", unit: "days", label: "Plan review turnaround", note: "district standard 5 days" },
    { value: "73%", label: "Career report completion", note: "target 60%" },
  ];
  return (
    <div ref={pageRef} data-doc-page className="flex flex-col" style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "44px 72px 36px", background: "var(--paper)", color: "var(--ink)" }}>
      {/* Masthead. The school owns this report, so its crest and office
         lead; Dreamari sits on the right as where the figures come from,
         which is what it actually is to a principal (direct feedback,
         27 Sept 2026: "Dont just include a letterhead etc because i said.
         Make sure it makes sense for a report to be shared with the
         principal"). */}
      <header className="flex items-center justify-between gap-[20px] border-b pb-[16px]" style={{ borderColor: "var(--rule)" }}>
        <span className="flex items-center gap-[12px]">
          <Crest size={40} />
          <span className="flex flex-col gap-[3px]">
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, lineHeight: 1.1, color: "var(--ink)" }}>{school}</span>
            <span style={{ ...kicker, fontSize: 8, color: BRAND }}>Office of School Counseling</span>
          </span>
        </span>
        <DreamariLockup />
      </header>

      {/* What this is, who it is for, who prepared it and for when: the
         memo block a report handed to a principal opens with. The Replit's
         summary header (kicker, counselor and role, school and period) is
         all here. */}
      <section className="mt-[24px] flex flex-col gap-[8px]">
        <span className="flex items-center justify-between gap-[16px]">
          <span style={{ ...kicker, color: BRAND }}>Principal / District Report</span>
          <span style={{ ...kicker, color: "var(--ink-faint)" }}>Academic Year 2023–2024</span>
        </span>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.015em" }}>Counselor Impact Summary</h1>
      </section>
      <dl className="mt-[16px] grid grid-cols-[1.35fr_1fr_1fr_0.8fr] border-y" style={{ borderColor: "var(--rule)" }}>
        <div className="flex items-center gap-[10px] py-[12px] pr-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="size-[40px] flex-none rounded-full object-cover" />
          <span className="flex min-w-0 flex-col gap-[2px]">
            <dt style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)" }}>Prepared by</dt>
            <dd style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: "var(--ink)" }}>{who}, {role}</dd>
          </span>
        </div>
        {[
          ["Prepared for", `Principal, ${school}`],
          ["Reporting period", "Aug 2023 – Jan 2024"],
          // Issued just after the period it reports on closes, not today:
          // a 2023-24 report dated this week reads as an error.
          ["Issued", "Feb 2, 2024"],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col justify-center gap-[2px] py-[12px] pl-[14px]" style={{ borderLeft: "1px solid var(--rule)" }}>
            <dt style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)" }}>{k}</dt>
            <dd style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 600, lineHeight: 1.25, color: "var(--ink)" }}>{v}</dd>
          </div>
        ))}
      </dl>

      {/* The figures a principal reads first, from the compliance table. */}
      <section className="mt-[18px] grid grid-cols-4 border-b" style={{ borderColor: "var(--rule)" }}>
        {figures.map((f, i) => (
          <div key={f.label} className="flex flex-col gap-[3px] py-[12px]" style={{ paddingLeft: i === 0 ? 0 : 18, borderLeft: i === 0 ? undefined : "1px solid var(--rule)" }}>
            <span className="flex items-baseline gap-[4px]">
              <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>{f.value}</span>
              {f.unit && <span style={{ fontFamily: SERIF, fontSize: 15, color: "var(--ink-soft)" }}>{f.unit}</span>}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: "var(--ink)" }}>{f.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, color: "var(--ink-faint)" }}>{f.note}</span>
          </div>
        ))}
      </section>

      <section className="mt-[22px] flex flex-col gap-[12px]">
        {section("01", "Notable Achievements")}
        <ol className="grid grid-cols-2 gap-x-[32px] gap-y-[10px]">
          {REPLIT.reportAchievements.map((a, i) => (
            <li key={a} className="flex gap-[12px]">
              <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, lineHeight: 1, color: BRAND, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>{a}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-[22px] flex flex-col gap-[8px]">
        {section("02", "District Compliance Summary")}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Metric", "Result", "Target", "Status"].map((h, i) => (
                <th key={h} className="pt-[4px] pb-[8px]" style={{ ...kicker, fontSize: 8.5, color: "var(--ink-faint)", textAlign: i === 0 ? "left" : i === 3 ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPLIT.reportCompliance.map((r) => (
              <tr key={r.metric} style={{ borderTop: "1px solid var(--rule)" }}>
                <td className="py-[8px]" style={{ fontFamily: SERIF, fontSize: 14, color: "var(--ink)" }}>{r.metric}</td>
                <td className="py-[8px]" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.result}</td>
                <td className="py-[8px]" style={{ fontFamily: SANS, fontSize: 11.5, color: "var(--ink-soft)" }}>{r.target}</td>
                <td className="py-[8px] text-right">
                  <span className="inline-flex items-center gap-[6px]" style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: r.met ? "#157A4A" : "#A35A00" }}>
                    {r.met ? "✓ Met" : "⚠ In Progress"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* One line of small print: where the figures come from, and the
         handling note (direct feedback, 27 Sept 2026: "The footer notes can
         be better designed. Source doesnt have to be this big"). */}
      <footer className="mt-auto flex items-center justify-between gap-[24px] border-t pt-[10px] whitespace-nowrap" style={{ borderColor: "var(--rule)", fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.02em", color: "var(--ink-faint)" }}>
        <span><b style={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginRight: 6 }}>Source</b>{school} counseling records and student activity on Dreamari</span>
        <span>Confidential · Page 1 of 1</span>
      </footer>
    </div>
  );
}

/** Opens the report at print size in the dashboard's full-screen document
 *  viewer, with zoom and Print. */
function PrincipalReport({ who, role, school, onClose }: { who: string; role: string; school: string; onClose: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  // Share (27 Sept 2026, direct instruction: "lets add a share option in
  // the principal report preview too"): an email to the principal with the
  // report's headline figures and achievements in the body, or the same
  // text copied. The PDF itself comes from Print or save PDF.
  const subject = `Counselor Impact Summary: ${who}, ${school}, Aug 2023 – Jan 2024`;
  const summary = [
    `Counselor Impact Summary · Academic Year 2023–2024`,
    `${who}, ${role} · ${school} · Reporting Period: Aug 2023 – Jan 2024`,
    ``,
    `Notable Achievements`,
    ...REPLIT.reportAchievements.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `District Compliance Summary`,
    ...REPLIT.reportCompliance.map((r) => `${r.metric}: ${r.result} (target ${r.target}) · ${r.met ? "Met" : "In Progress"}`),
  ].join("\n");
  const share = [
    { label: "Email to principal", icon: Mail, onClick: () => { window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`; } },
    { label: copied ? "Summary copied" : "Copy summary", icon: Copy, onClick: () => { navigator.clipboard?.writeText(summary).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(() => {}); } },
  ];
  return (
    <FullScreenDocument open title={`Principal / District Report · ${who}`} onClose={onClose} onPrint={() => printDocumentPage(pageRef.current, `Principal report, ${who}`)} share={share}>
      <PrincipalReportPage who={who} role={role} school={school} photo={seededPick(who, COUNSELOR_HEADSHOTS)} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

// The Replit's eight notable achievements, verbatim apart from punctuation.
// On the page each is a win tile (the number, a short label, the
// comparison drawn); the sentence opens in its drill.
const ACHIEVEMENTS = {
  senior: "Senior postsecondary plan rate of 87%, meeting the district-mandated 80% benchmark ahead of the spring deadline.",
  onTrack: "Maintained a 86% on-track rate across a caseload of 120 students, well above the school average of 71%.",
  turnaround: "Delivered all plan reviews at an average of 2.1 days, meeting the district's 5-day turnaround standard with room to spare.",
  applying: "27 of 30 seniors have active college or postsecondary applications underway, positioning Lincoln High School for strong college-going outcomes.",
  answered: "Achieved a 33% Counselor Connect question-response rate, ensuring every student inquiry received a timely, professional reply.",
  flagged: "17 students proactively identified for additional support. Early identification reduces at-risk escalation and supports equitable outcomes.",
  activities: "Over 7,293 career-exploration activities completed by students on the Dreamari platform, driven by counselor-assigned prompts and deadlines.",
  touchpoints: "Career simulations, pathway selections, and college-saving activity contributed to 3,199 total student engagement touchpoints this semester.",
};

/** A win: the number, what it is, and against what. `bar` draws the
 *  comparison (value and benchmark as % of the bar); `delta` says it in
 *  three words. */
function WinTile({ value, label, delta, bar, onOpen }: { value: string; label: string; delta?: string; bar?: { pct: number; tick?: number; tickLabel?: string }; onOpen: () => void }) {
  const reduce = useReducedMotion();
  return (
    <DrillTile onOpen={onOpen} label={label} className="h-full gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]">
      <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
      <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      {bar && (
        <span className="relative mt-[6px] block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
          <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${bar.pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 45%, transparent), var(--primary))" }} />
          {typeof bar.tick === "number" && <span className="absolute -top-[3px] -bottom-[3px] w-[2px] rounded-full" style={{ left: `calc(${bar.tick}% - 1px)`, background: "var(--foreground)" }} />}
        </span>
      )}
      {delta && <span className="mt-auto pt-[4px] text-[12px] font-bold" style={{ color: MET }}>{delta}</span>}
    </DrillTile>
  );
}

export function CounselorImpact() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const who = account.name || "Sarah Chen";
  const role = account.role || "School Counselor";
  const school = account.school || DEMO_SCHOOL;
  const router = useRouter();
  const { setStatusFilter, setPlanFilter, setGradeFilter } = useCounselorFilters();
  const [report, setReport] = useState(false);
  const [drill, setDrill] = useState<Drill | null>(null);
  // The Replit's own 120 students: every list in a drill counts the same
  // students the Replit's numbers do.
  const roster = useMemo(() => getRoster(), []);
  const ds = (s: CounselorStudent, note: string): DrillStudent => ({ id: s.id, name: s.name, grade: s.grade, avatarIndex: s.avatarIndex, note });
  const pathways = useMemo(() => PATHWAY_ORDER.map((p) => ({ label: p, count: roster.filter((s) => s.postsecondaryIntent === p).length })), [roster]);
  const pathwayMax = Math.max(...pathways.map((p) => p.count), 1);
  const notOnTrack = roster.filter((s) => s.status !== "On Track");
  const flagged = roster.filter((s) => s.supportFlagReason);
  const seniors = roster.filter((s) => s.grade === 12);
  const applying = seniors.filter((s) => ["In Progress", "Completed", "Approved", "Pending Review"].includes(s.milestones.Applications));
  const go = (view: string, set?: () => void) => () => { set?.(); setDrill(null); router.push(`/counselor?view=${view}`); };
  const approvedByGrade = (key: MilestoneKey, grades: number[]) => grades.map((g) => {
    const gs = roster.filter((s) => s.grade === g);
    const n = gs.filter((s) => s.milestones[key] === "Approved" || s.milestones[key] === "Completed").length;
    return { label: `Grade ${g}`, value: `${n} of ${gs.length}`, pct: gs.length ? (n / gs.length) * 100 : 0 };
  });
  const hdrBtn = { background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" } as const;

  const drills = {
    caseload: (): Drill => ({ title: "Caseload", subtitle: "120 students, Grades 9 to 12", rowsLabel: "By grade", rows: REPLIT.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.total} students` })), stats: [{ value: String(REPLIT.caseload - notOnTrack.length), label: "on track" }, { value: String(notOnTrack.length), label: "need attention or at risk" }], action: { label: "Open Students", onClick: go("students") } }),
    onTrack: (): Drill => ({ title: "On track", subtitle: "86% of the caseload · school average 71%", lead: ACHIEVEMENTS.onTrack, rowsLabel: "On track by grade", rows: REPLIT.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.onTrack} of ${g.total}`, pct: (g.onTrack / g.total) * 100 })), students: notOnTrack.map((s) => ds(s, attentionReason(s))), studentsLabel: `${notOnTrack.length} not on track`, action: { label: "Open these students", onClick: go("students", () => setStatusFilter("At Risk")) } }),
    plans: (): Drill => ({ title: "Postsecondary plans", subtitle: `${REPLIT.withPlan} of ${REPLIT.caseload} declared · target 80%`, rowsLabel: "By pathway", rows: pathways.map((p) => ({ label: p.label, value: String(p.count), pct: (p.count / REPLIT.caseload) * 100 })), students: roster.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "Undecided")), studentsLabel: `${pathways.find((p) => p.label === "Undecided")?.count ?? 0} undecided`, action: { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } }),
    answered: (): Drill => ({ title: "Student questions", subtitle: "5 of 15 answered", lead: ACHIEVEMENTS.answered, items: QUESTIONS.slice(0, 8).map((q) => `${q.name}: ${q.question}`), itemsLabel: "Recent questions", action: { label: "Open Counselor Connect", onClick: go("connect") } }),
    senior: (): Drill => ({ title: "Senior plan rate", subtitle: "87% · district target 80%", lead: ACHIEVEMENTS.senior, stats: [{ value: "30", label: "seniors" }, { value: String(applying.length), label: "applying" }], students: seniors.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "No plan declared yet")), studentsLabel: "Seniors still without a plan", action: { label: "Open Grade 12", onClick: go("students", () => setGradeFilter(12)) } }),
    turnaround: (): Drill => ({ title: "Review turnaround", subtitle: "2.1 days on average · standard 5 days", lead: ACHIEVEMENTS.turnaround, stats: [{ value: "15", label: "plans reviewed" }, { value: "10", label: "still pending" }], action: { label: "Open Review Queue", onClick: go("review-queue") } }),
    applying: (): Drill => ({ title: "Seniors applying", subtitle: `${applying.length} of ${seniors.length}`, lead: ACHIEVEMENTS.applying, students: seniors.filter((s) => !applying.includes(s)).map((s) => ds(s, `Applications ${s.milestones.Applications.toLowerCase()}`)), studentsLabel: "Not applying yet", action: { label: "Open Grade 12", onClick: go("students", () => setGradeFilter(12)) } }),
    flagged: (): Drill => ({ title: "Support flags", subtitle: `${flagged.length} students · 14% of caseload`, lead: ACHIEVEMENTS.flagged, students: flagged.map((s) => ds(s, s.supportFlagReason ?? "")), studentsLabel: "Flagged students", action: { label: "Open Students", onClick: go("students") } }),
    activities: (): Drill => ({ title: "Student activity on Dreamari", subtitle: "This reporting period", lead: ACHIEVEMENTS.activities, rowsLabel: "By activity", rows: REPLIT.engagement.map((e) => ({ label: e.label, value: e.value.toLocaleString("en-US"), pct: (e.value / REPLIT.engagement[0].value) * 100 })), action: { label: "Open Platform Engagement", onClick: go("engagement") } }),
    touchpoints: (): Drill => ({ title: "Engagement touchpoints", subtitle: "3,199 this semester", lead: ACHIEVEMENTS.touchpoints, rowsLabel: "Made up of", rows: REPLIT.engagement.slice(1, 4).map((e) => ({ label: e.label, value: e.value.toLocaleString("en-US"), pct: (e.value / 3199) * 100 })), action: { label: "Open Platform Engagement", onClick: go("engagement") } }),
    grade: (g: (typeof REPLIT.grades)[number]): Drill => ({ title: `Grade ${g.grade}`, subtitle: `${g.onTrack} of ${g.total} on track · ${g.avg}% average completion`, rowsLabel: "Checkpoints done", rows: curriculumForGrade(g.grade as 9 | 10 | 11 | 12).map((c) => ({ label: c.name, value: `${c.donePct}%`, pct: c.donePct })), students: roster.filter((s) => s.grade === g.grade && s.status !== "On Track").map((s) => ds(s, attentionReason(s))), studentsLabel: "Not on track", action: { label: `Open Grade ${g.grade} in the Milestone Tracker`, onClick: go("milestones", () => setGradeFilter(g.grade as 9 | 10 | 11 | 12)) } }),
    pathway: (label: PostsecondaryIntent): Drill => { const list = roster.filter((s) => s.postsecondaryIntent === label); return { title: label, subtitle: `${list.length} students`, students: list.map((s) => ds(s, s.careerTrack)), studentsLabel: "Students", action: label === "Undecided" ? { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } : { label: "Open Students", onClick: go("students") } }; },
    milestone: (m: (typeof REPLIT.milestones)[number]): Drill => {
      const key: MilestoneKey = m.label.startsWith("Career") ? "Career Report" : m.label.startsWith("Academic") ? "Academic Plan" : m.label.startsWith("Résumés") ? "Resume" : "Applications";
      const grades = key === "Resume" ? [10, 11, 12] : key === "Applications" ? [12] : [9, 10, 11, 12];
      return { title: m.label, subtitle: `${m.value}% · ${m.note}`, rowsLabel: "Done by grade", rows: approvedByGrade(key, grades), action: { label: "Open the Milestone Tracker", onClick: go("milestones") } };
    },
    work: (label: string): Drill => {
      if (label === "Plans reviewed") return drills.turnaround();
      if (label === "Questions answered") return drills.answered();
      if (label === "Support flags") return drills.flagged();
      if (label === "Review turnaround") return drills.turnaround();
      return { title: "Announcements", subtitle: "10 sent, school-wide", items: ANNOUNCEMENTS.map((a) => `${a.title} · ${a.read}% read`), itemsLabel: "Sent", action: { label: "Open Counselor Connect", onClick: go("connect") } };
    },
    asca: (c: (typeof REPLIT.asca)[number]): Drill => ({ title: `${c.title} development`, subtitle: "ASCA National Model, 4th Ed.", items: c.full, itemsLabel: "What the caseload shows", action: c.title === "Career" ? { label: "Open Career + College Insights", onClick: go("insights") } : c.title === "Academic" ? { label: "Open the Milestone Tracker", onClick: go("milestones") } : { label: "Open Students", onClick: go("students") } }),
  };
  const open = (d: Drill) => setDrill(d);

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

      {/* The Replit's four headline numbers; each opens its breakdown. */}
      <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4">
        <Stat big value={String(REPLIT.caseload)} label="Caseload" note="students" onOpen={() => open(drills.caseload())} />
        <Stat big value={`${REPLIT.onTrackPct}%`} label="On track" note="school average 71%" chip={<MetChip met />} onOpen={() => open(drills.onTrack())} />
        <Stat big value={`${REPLIT.withPlanPct}%`} label="Postsecondary plans" note="target 80%" chip={<MetChip met={false} />} onOpen={() => open(drills.plans())} />
        <Stat big value={`${REPLIT.responseRatePct}%`} label="Questions answered" note="5 of 15" onOpen={() => open(drills.answered())} />
      </div>

      {/* Notable achievements as wins: the number, what it is, and the
         comparison drawn, no sentence (27 Sept 2026: "How can we make the
         notable achievements read better and not so wordy?"). The Replit's
         sentence opens in each drill. All eight of the Replit's
         achievements are tiles here. */}
      <OverviewCard title="Notable achievements" unit="Fall semester">
        <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
          <WinTile value="87%" label="Senior plan rate" bar={{ pct: 87, tick: 80 }} delta="Target 80% met" onOpen={() => open(drills.senior())} />
          <WinTile value="86%" label="On track" bar={{ pct: 86, tick: 71 }} delta="+15 over school" onOpen={() => open(drills.onTrack())} />
          <WinTile value="2.1d" label="Turnaround" bar={{ pct: 42, tick: 100 }} delta="2.9 days faster" onOpen={() => open(drills.turnaround())} />
          <WinTile value="27/30" label="Seniors applying" bar={{ pct: 90 }} delta="90% of seniors" onOpen={() => open(drills.applying())} />
          <WinTile value="17" label="Flagged early" delta="14% of caseload" onOpen={() => open(drills.flagged())} />
          <WinTile value="33%" label="Questions answered" bar={{ pct: 33 }} delta="5 of 15 replied" onOpen={() => open(drills.answered())} />
          <WinTile value="7,293" label="Career activities" delta="on Dreamari" onOpen={() => open(drills.activities())} />
          <WinTile value="3,199" label="Engagement touchpoints" delta="sims, pathways, colleges" onOpen={() => open(drills.touchpoints())} />
        </div>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <OverviewCard title="Plans by pathway" unit={`${REPLIT.withPlan} of ${REPLIT.caseload} declared`}>
          <ul className="flex flex-col gap-[2px]">
            {pathways.map((p) => (
              <li key={p.label}>
                <button type="button" onClick={() => open(drills.pathway(p.label))} className="dm-quiet group grid w-full cursor-pointer grid-cols-[150px_minmax(0,1fr)_28px_14px] items-center gap-[12px] rounded-[var(--radius-sm)] px-[4px] py-[5px] text-left text-[13px]">
                  <span className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{p.label}</span>
                  <Bar pct={(p.count / pathwayMax) * 100} muted={p.label === "Undecided"} />
                  <span className="text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{p.count}</span>
                  <Go className="opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </OverviewCard>
        <OverviewCard title="Progress by grade" unit={`${REPLIT.overallAvg}% average completion`}>
          <ul className="flex flex-col gap-[2px]">
            {REPLIT.grades.map((g) => (
              <li key={g.grade}>
                <button type="button" onClick={() => open(drills.grade(g))} className="dm-quiet group flex w-full cursor-pointer flex-col gap-[5px] rounded-[var(--radius-sm)] px-[4px] py-[6px] text-left">
                  <span className="flex w-full items-baseline justify-between gap-[10px] text-[13px]">
                    <span className="font-bold" style={{ color: "var(--foreground)" }}>Grade {g.grade}</span>
                    <span className="flex items-center gap-[6px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{g.onTrack}/{g.total} on track · {g.avg}%<Go className="opacity-0 transition-opacity group-hover:opacity-100" /></span>
                  </span>
                  <Bar pct={g.avg} />
                </button>
              </li>
            ))}
          </ul>
        </OverviewCard>
      </div>

      <OverviewCard title="Readiness milestones">
        <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4">
          {REPLIT.milestones.map((m) => <Stat key={m.label} value={`${m.value}%`} label={m.label} note={m.note} chip={m.chip} onOpen={() => open(drills.milestone(m))} />)}
        </div>
      </OverviewCard>

      <OverviewCard title="Your work this period">
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-5">
          {REPLIT.activity.map((a) => <Stat key={a.label} value={a.value} label={a.label} note={a.note} onOpen={() => open(drills.work(a.label))} />)}
        </div>
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student activity on Dreamari</span>
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-5">
          {REPLIT.engagement.map((e) => <Stat key={e.label} value={e.value.toLocaleString("en-US")} label={e.label} onOpen={() => open(drills.activities())} />)}
        </div>
      </OverviewCard>

      <OverviewCard title="ASCA alignment" unit="National Model, 4th Ed.">
        <div className="grid grid-cols-1 gap-[var(--space-3)] lg:grid-cols-3">
          {REPLIT.asca.map((c) => (
            <DrillTile key={c.title} onOpen={() => open(drills.asca(c))} label={c.title} className="h-full gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]">
              <span className="flex items-center gap-[8px]"><c.icon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} /><h3 className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.title}</h3></span>
              <ul className="flex flex-col gap-[5px]">
                {c.items.map((it) => <li key={it} className="flex items-start gap-[7px] text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}><CheckCircle2 className="mt-[2px] h-[12px] w-[12px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />{it}</li>)}
              </ul>
            </DrillTile>
          ))}
        </div>
      </OverviewCard>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      {report && <PrincipalReport who={who} role={role} school={school} onClose={() => setReport(false)} />}
    </div>
  );
}
