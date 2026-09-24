"use client";

// DEMO-ONLY v2 fork of ../MyImpact.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx).
//
// 25 Sept 2026 pass under the v2 budget. This screen is the printable
// report a counselor hands a principal, so it keeps its sections, but the
// reference said every number three times: a stat, then a sentence about
// the stat, then a "Notable Achievements" bullet and a "District Compliance
// Summary" tile restating it again. v2 says each number once, keeps the
// three ASCA cards (they are the report's purpose), drops the two restating
// sections, and marks target misses with the reserved status color only.

import { useMemo } from "react";
import { Printer, Share2, FileBarChart, Users, TrendingUp, GraduationCap, MessageSquare, ClipboardCheck, Megaphone, Flag, BookOpen, Briefcase, Heart } from "lucide-react";
import { MetricTile } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { DEMO_SCHOOL, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { readCounselorAccount } from "@/lib/counselorAccount";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";

import { GLASS_CARD as TINTED_CARD, GLASS_INSET } from "../surfaces";
import { STATUS_COLORS } from "../chips";
import { RankBar } from "./overviewShared";
const GRADES = [9, 10, 11, 12];
const PATHWAY_ORDER: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Military", "Workforce", "Undecided"];

function BigStat({ value, label, sub, color = "var(--foreground)" }: { value: string; label: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-[2px] text-center">
      <span className="text-[26px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color }}>{value}</span>
      <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      {sub && <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sub}</span>}
    </div>
  );
}

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <span className="flex flex-col gap-[2px]">
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
          {sub && <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sub}</span>}
        </span>
        {children}
      </div>
    </HoverBeam>
  );
}

export function MyImpact() {
  const roster = useReviewedRoster();
  const account = readCounselorAccount();
  const counselorName = account.name || "Sarah Chen";

  const total = roster.length || 1;
  const onTrack = roster.filter((s) => s.status === "On Track").length;
  const withPlan = roster.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const withPlanPct = Math.round((withPlan / total) * 100);

  const respondedQuestions = QUESTIONS.filter((q) => q.status === "responded" || q.status === "resolved").length;
  const responseRatePct = Math.round((respondedQuestions / QUESTIONS.length) * 100);

  const pathway = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of PATHWAY_ORDER) counts[p] = 0;
    for (const s of roster) counts[s.postsecondaryIntent] = (counts[s.postsecondaryIntent] ?? 0) + 1;
    return PATHWAY_ORDER.map((p) => ({ label: p, count: counts[p] }));
  }, [roster]);
  const pathwayMax = Math.max(...pathway.map((p) => p.count), 1);

  const byGrade = (g: number) => roster.filter((s) => s.grade === g);
  const gradeStats = GRADES.map((g) => {
    const gr = byGrade(g);
    const onTrackCount = gr.filter((s) => s.status === "On Track").length;
    const avg = gr.length ? Math.round(gr.reduce((sum, s) => sum + s.roadmapPct, 0) / gr.length) : 0;
    return { grade: g, onTrackCount, total: gr.length, avg };
  });
  const overallAvg = Math.round(gradeStats.reduce((a, g) => a + g.avg, 0) / gradeStats.length);

  const careerReportApproved = roster.filter((s) => s.milestones["Career Report"] === "Approved").length;
  const academicPlanApproved = roster.filter((s) => s.milestones["Academic Plan"] === "Approved").length;
  const gr10Plus = roster.filter((s) => s.grade >= 10);
  const resumeApproved = gr10Plus.filter((s) => s.milestones.Resume === "Approved").length;
  const seniors = byGrade(12);
  // The reference's own definition (v1 My Impact reads 87% off it): seniors
  // with a declared postsecondary plan. Same figure the School Administrator
  // Overview shows, so the two never disagree.
  const seniorsCompliant = seniors.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const seniorCompliancePct = seniors.length ? Math.round((seniorsCompliant / seniors.length) * 100) : 0;
  const meetsSeniorTarget = seniorCompliancePct >= 80;

  const reviewableKeys = ["Career Report", "Academic Plan", "Resume"] as const;
  const plansApproved = roster.reduce((sum, s) => sum + reviewableKeys.filter((k) => s.milestones[k] === "Approved").length, 0);
  const plansPending = roster.reduce((sum, s) => sum + reviewableKeys.filter((k) => s.milestones[k] === "Changes Requested").length, 0);
  const monitored = roster.filter((s) => s.status !== "On Track").length;
  const monitoredPct = Math.round((monitored / total) * 100);

  const engagement = { drops: 0, sims: 0, careers: 0, colleges: 0, posts: 0 };
  for (const s of roster) {
    engagement.drops += s.engagement.dailyDropsCompleted;
    engagement.sims += s.engagement.simulations;
    engagement.careers += s.engagement.careersSaved;
    engagement.colleges += s.engagement.collegesSaved;
    engagement.posts += s.engagement.communityPosts;
  }

  const careerPathwayDeclaredPct = Math.round((roster.filter((s) => s.careerTrack).length / total) * 100);

  const seniorColor = meetsSeniorTarget ? "var(--foreground)" : STATUS_COLORS["Needs Attention"];

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-col gap-[2px]">
          <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{counselorName}</h2>
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{account.role || "School Counselor"} · {account.school || DEMO_SCHOOL} · August 2026 to January 2027</span>
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

      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Users} value={String(total)} label="Students" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={TrendingUp} value={`${Math.round((onTrack / total) * 100)}%`} label="On track" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={GraduationCap} value={`${withPlanPct}%`} label="With a postsecondary plan" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={MessageSquare} value={`${responseRatePct}%`} label="Questions answered" accent="#5B6CF9" /></div></HoverBeam>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <SectionCard title="Postsecondary plans" sub={`${withPlan} of ${total} students have a declared path`}>
          <div className="flex flex-col gap-[10px]">
            {pathway.map((p) => (
              <div key={p.label} className="flex items-center gap-[12px]">
                <span className="w-[150px] flex-none truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{p.label}</span>
                <span className="flex-1"><RankBar value={(p.count / pathwayMax) * 100} /></span>
                <span className="w-[26px] flex-none text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{p.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Progress by grade" sub={`${overallAvg}% average plan completion`}>
          <div className="flex flex-col gap-[12px]">
            {gradeStats.map((g) => (
              <div key={g.grade} className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <span style={{ color: "var(--foreground)" }}>Grade {g.grade}</span>
                  <span>{g.onTrackCount} of {g.total} on track · {g.avg}%</span>
                </div>
                <RankBar value={g.avg} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Milestones">
        <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
          <BigStat value={`${Math.round((careerReportApproved / total) * 100)}%`} label="Career reports approved" sub={`${careerReportApproved} of ${total}`} />
          <BigStat value={`${Math.round((academicPlanApproved / total) * 100)}%`} label="Academic plans approved" sub={`${academicPlanApproved} of ${total}`} />
          <BigStat value={`${gr10Plus.length ? Math.round((resumeApproved / gr10Plus.length) * 100) : 0}%`} label="Resumes complete" sub={`${resumeApproved} of ${gr10Plus.length}, Grade 10 up`} />
          <BigStat value={`${seniorCompliancePct}%`} label="Senior plan compliance" sub={`${seniorsCompliant} of ${seniors.length} seniors · target 80%`} color={seniorColor} />
        </div>
      </SectionCard>

      <SectionCard title="Your activity" sub="Plan reviews average 2.1 days against the district's 5-day standard">
        <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
          {[
            { icon: ClipboardCheck, value: String(plansApproved + plansPending), label: "Plans reviewed", sub: `${plansApproved} approved · ${plansPending} pending` },
            { icon: MessageSquare, value: `${respondedQuestions}/${QUESTIONS.length}`, label: "Questions answered", sub: `${responseRatePct}% response rate` },
            { icon: Megaphone, value: String(ANNOUNCEMENTS.length), label: "Announcements sent", sub: "school-wide" },
            { icon: Flag, value: String(monitored), label: "Support flags", sub: `${monitoredPct}% of students monitored` },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-[4px] text-center">
              <t.icon className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />
              <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{t.value}</span>
              <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>{t.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.sub}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Student engagement on Dreamari" sub="This reporting period, students in your caseload">
        <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-5">
          <BigStat value={engagement.drops.toLocaleString("en-US")} label="Daily Career Drops" />
          <BigStat value={engagement.sims.toLocaleString("en-US")} label="Career simulations" />
          <BigStat value={engagement.careers.toLocaleString("en-US")} label="Careers saved" />
          <BigStat value={engagement.colleges.toLocaleString("en-US")} label="Colleges saved" />
          <BigStat value={engagement.posts.toLocaleString("en-US")} label="Community posts" />
        </div>
      </SectionCard>

      <div className="flex flex-col gap-[var(--space-3)]">
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>ASCA National Model alignment <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>4th edition</span></h2>
        <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3">
          {[
            { icon: BookOpen, title: "Academic development", items: [
              `Academic planning supported for all ${total} students`,
              `${Math.round((academicPlanApproved / total) * 100)}% have an approved four-year academic plan`,
              "Course selection and credit monitoring delivered",
            ] },
            { icon: Briefcase, title: "Career development", items: [
              `${Math.round((careerReportApproved / total) * 100)}% career report completion`,
              `Career pathway declared for ${careerPathwayDeclaredPct}% of students`,
              "Career simulations and assessments via Dreamari",
            ] },
            { icon: Heart, title: "Social-emotional development", items: [
              `${monitored} students identified and monitored for support`,
              `${responseRatePct}% question response rate via Counselor Connect`,
              `${roster.filter((s) => s.status === "At Risk").length} at-risk students flagged for early intervention`,
            ] },
          ].map((card) => (
            <div key={card.title} className="flex h-full flex-col gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>
              <span className="flex items-center gap-[8px]">
                <card.icon className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />
                <h3 className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{card.title}</h3>
              </span>
              <ul className="flex flex-col gap-[6px]">
                {card.items.map((it) => (
                  <li key={it} className="flex items-start gap-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="mt-[6px] size-[5px] flex-none rounded-full" style={{ background: "var(--primary)" }} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-[8px] border-t pt-[var(--space-4)] text-[12px]" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
        <span className="font-bold" style={{ color: "var(--foreground)" }}>{counselorName} · {account.role || "School Counselor"} · {account.school || DEMO_SCHOOL} · 2026-2027</span>
        <span>Dreamari platform data, August 2026 to January 2027 · aggregated and anonymized · prepared to ASCA National Model (4th edition) accountability standards</span>
      </div>
    </div>
  );
}
