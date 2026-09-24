"use client";

// DEMO-ONLY v2 fork of ../MyImpact.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx).
//
// Rebuilt 25 Sept 2026 (direct feedback: "My Impact etc are especially
// cluttered ... a huge overload of information at once with so much copy").
// The report a counselor hands a principal answers one question: did this
// period move the numbers? So: a scorecard of the four outcomes against
// their targets as the hero, one row of the counselor's own activity, one
// row of student engagement, grades as bars that open the roster, and the
// ASCA framing as three short columns. Each number once; no sentences.
// Dropped from the reference: the pathway bar list (the Overview's donut
// already shows it), the milestone stat tiles (folded into the scorecard),
// the achievements list and compliance summary (restated the page).

import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { Printer, Share2, FileBarChart, BookOpen, Briefcase, Heart } from "lucide-react";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { readCounselorAccount } from "@/lib/counselorAccount";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";

import { BAND_COLORS, MetricRow, OverviewCard, Stat, Verdict } from "./overviewShared";
import { CardLink } from "../chips";
import { SCHOOL_COUNSELORS, SCHOOL_TARGETS, TARGET_LABELS, counselorFor, readinessMetrics, targetBand, type TargetKey } from "@/lib/counselorOrg";
const GRADES = [9, 10, 11, 12];

// `scope="school"` is the Lead Counselor's School Impact: the same report
// for the whole school, headed by the school, with a by-counselor card.
export function MyImpact({ scope = "mine" }: { scope?: "mine" | "school" }) {
  const router = useRouter();
  const { setGradeFilter, setCounselorFilter } = useCounselorFilters();
  const roster = useReviewedRoster();
  const account = readCounselorAccount();
  const who = scope === "school" ? (account.school || DEMO_SCHOOL) : (account.name || "Sarah Chen");
  const m = readinessMetrics(roster);
  const total = roster.length || 1;

  const respondedQuestions = QUESTIONS.filter((q) => q.status === "responded" || q.status === "resolved").length;
  const responseRatePct = Math.round((respondedQuestions / QUESTIONS.length) * 100);
  const reviewableKeys = ["Career Report", "Academic Plan", "Resume"] as const;
  const plansReviewed = roster.reduce((sum, s) => sum + reviewableKeys.filter((k) => s.milestones[k] === "Approved" || s.milestones[k] === "Changes Requested").length, 0);
  const monitored = roster.filter((s) => s.status !== "On Track").length;
  const careerReportPct = Math.round((roster.filter((s) => s.milestones["Career Report"] === "Approved").length / total) * 100);
  const academicPlanPct = Math.round((roster.filter((s) => s.milestones["Academic Plan"] === "Approved").length / total) * 100);

  const engagement = { drops: 0, sims: 0, careers: 0, colleges: 0, posts: 0 };
  for (const s of roster) {
    engagement.drops += s.engagement.dailyDropsCompleted;
    engagement.sims += s.engagement.simulations;
    engagement.careers += s.engagement.careersSaved;
    engagement.colleges += s.engagement.collegesSaved;
    engagement.posts += s.engagement.communityPosts;
  }

  const outcomes: { key: TargetKey; value: number | null; note: string }[] = [
    { key: "onTrack", value: m.onTrackPct, note: `${m.onTrack} of ${m.students}` },
    { key: "plansOnFile", value: m.withPlanPct, note: `${m.withPlan} of ${m.students}` },
    { key: "seniorPlan", value: m.seniors ? m.seniorPlanPct : null, note: `${m.seniorsCompliant} of ${m.seniors} seniors` },
    { key: "fafsa", value: m.seniors ? m.fafsaPct : null, note: `${m.fafsaDone} of ${m.seniors} seniors` },
  ];
  const measured = outcomes.filter((o) => o.value !== null) as { key: TargetKey; value: number; note: string }[];
  const met = measured.filter((o) => targetBand(o.value, SCHOOL_TARGETS[o.key]) === "met").length;
  const worst = measured.slice().sort((a, b) => (a.value - SCHOOL_TARGETS[a.key]) - (b.value - SCHOOL_TARGETS[b.key]))[0];
  const heroBand = worst ? targetBand(worst.value, SCHOOL_TARGETS[worst.key]) : "met";

  const grades = GRADES.map((g) => ({ g, m: readinessMetrics(roster.filter((s) => s.grade === g)) })).filter((x) => x.m.students > 0).sort((a, b) => a.m.onTrackPct - b.m.onTrackPct);
  const byCounselor = scope === "school"
    ? SCHOOL_COUNSELORS.map((c) => ({ c, m: readinessMetrics(roster.filter((s) => counselorFor(s).id === c.id)) })).filter((x) => x.m.students > 0).sort((a, b) => a.m.onTrackPct - b.m.onTrackPct)
    : [];

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex flex-col gap-[2px]">
          <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{who}</h2>
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{scope === "school" ? `Prepared by ${account.name || "Sarah Chen"}` : `${account.role || "School Counselor"} · ${account.school || DEMO_SCHOOL}`} · August 2026 to January 2027</span>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <Printer className="h-[14px] w-[14px]" aria-hidden /> Print
          </button>
          <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <Share2 className="h-[14px] w-[14px]" aria-hidden /> Share
          </button>
          <button type="button" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Principal report
          </button>
        </div>
      </div>

      <OverviewCard title="Outcomes" unit="against district targets" hero tint={BAND_COLORS[heroBand]}>
        <Verdict band={heroBand}>{met} of {measured.length} targets met{worst && heroBand !== "met" ? ` · ${TARGET_LABELS[worst.key]} has the most room to grow` : ""}</Verdict>
        <div className="grid grid-cols-1 gap-x-[var(--space-6)] gap-y-[var(--space-4)] sm:grid-cols-2">
          {outcomes.map((o) => <MetricRow key={o.key} label={TARGET_LABELS[o.key]} note={o.value === null ? undefined : o.note} value={o.value} target={SCHOOL_TARGETS[o.key]} />)}
        </div>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        <OverviewCard title={scope === "school" ? "Counselor activity" : "Your activity"} unit="this period">
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-4">
            <Stat value={String(plansReviewed)} label="plans reviewed" />
            <Stat value={`${responseRatePct}%`} label="questions answered" />
            <Stat value={String(ANNOUNCEMENTS.length)} label="announcements" />
            <Stat value={String(monitored)} label="students supported" />
          </div>
          <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Reviews average 2.1 days · district standard 5 · {careerReportPct}% career reports and {academicPlanPct}% academic plans approved</span>
        </OverviewCard>
        <OverviewCard title="Students on Dreamari" unit="this period">
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3">
            <Stat value={engagement.drops.toLocaleString("en-US")} label="Daily Career Drops" />
            <Stat value={engagement.sims.toLocaleString("en-US")} label="simulations" />
            <Stat value={engagement.careers.toLocaleString("en-US")} label="careers saved" />
            <Stat value={engagement.colleges.toLocaleString("en-US")} label="colleges saved" />
            <Stat value={engagement.posts.toLocaleString("en-US")} label="community posts" />
          </div>
        </OverviewCard>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        <OverviewCard title="By grade" unit="% on track" aside={<CardLink onClick={() => router.push("/counselor?view=students")}>Students</CardLink>}>
          <div className="flex flex-col gap-[10px]">
            {grades.map(({ g, m: gm }) => <MetricRow key={g} label={`Grade ${g}`} note={`${gm.students} students · ${gm.withPlanPct}% with a plan`} value={gm.onTrackPct} target={SCHOOL_TARGETS.onTrack} onClick={() => { setGradeFilter(g as 9 | 10 | 11 | 12); router.push("/counselor?view=students"); }} />)}
          </div>
        </OverviewCard>
        {scope === "school" ? (
          <OverviewCard title="By counselor" unit="% on track">
            <div className="flex flex-col gap-[10px]">
              {byCounselor.map(({ c, m: cm }) => <MetricRow key={c.id} label={c.name} note={`${c.range} · ${cm.students} students`} value={cm.onTrackPct} target={SCHOOL_TARGETS.onTrack} onClick={() => { setCounselorFilter(c.id); router.push("/counselor?view=students"); }} />)}
            </div>
          </OverviewCard>
        ) : (
          <OverviewCard title="ASCA National Model" unit="4th edition">
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
              {ASCA(academicPlanPct, careerReportPct, monitored, responseRatePct).map((col) => (
                <div key={col.title} className="flex flex-col gap-[6px]">
                  <span className="flex items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}><col.icon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />{col.title}</span>
                  {col.items.map((it) => <span key={it} className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{it}</span>)}
                </div>
              ))}
            </div>
          </OverviewCard>
        )}
      </div>

      {scope === "school" && (
        <OverviewCard title="ASCA National Model" unit="4th edition">
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
            {ASCA(academicPlanPct, careerReportPct, monitored, responseRatePct).map((col) => (
              <div key={col.title} className="flex flex-col gap-[6px]">
                <span className="flex items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}><col.icon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />{col.title}</span>
                {col.items.map((it) => <span key={it} className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{it}</span>)}
              </div>
            ))}
          </div>
        </OverviewCard>
      )}

      <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Dreamari data, August 2026 to January 2027 · aggregated and anonymized</span>
    </div>
  );
}

function ASCA(academicPlanPct: number, careerReportPct: number, monitored: number, responseRatePct: number) {
  return [
    { icon: BookOpen, title: "Academic", items: [`${academicPlanPct}% approved academic plans`, "Course selection support"] },
    { icon: Briefcase, title: "Career", items: [`${careerReportPct}% career reports approved`, "Simulations and assessments"] },
    { icon: Heart, title: "Social-emotional", items: [`${monitored} students supported`, `${responseRatePct}% of questions answered`] },
  ];
}
