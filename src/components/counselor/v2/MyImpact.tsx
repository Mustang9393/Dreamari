"use client";

// DEMO-ONLY v2 fork of ../MyImpact.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useMemo } from "react";
import { Printer, Share2, FileBarChart, Users, TrendingUp, GraduationCap, MessageSquare, ClipboardCheck, Megaphone, Flag, CheckCircle2, Award, BookOpen, Briefcase, Heart, Star } from "lucide-react";
import { MetricTile } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { DEMO_SCHOOL, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { readCounselorAccount } from "@/lib/counselorAccount";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";
const GRADES = [9, 10, 11, 12];
const PATHWAY_ORDER: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade / Technical School", "Military", "Workforce", "Undecided"];

function BigStat({ value, label, sub, color }: { value: string; label: string; sub?: string; color: string }) {
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
  const seniorsCompliant = seniors.filter((s) => s.milestones.Applications === "Approved" || s.milestones["Financial Aid"] === "Approved" || s.milestones.Applications === "Pending Review").length;
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

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-col gap-[var(--space-4)]">
        <span className="flex items-center gap-[6px] text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          <Award className="h-[13px] w-[13px]" aria-hidden /> My Impact · Academic Year 2026-2027
        </span>
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-col gap-[2px]">
            <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{counselorName}</h2>
            <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{account.role || "School Counselor"} · {account.school || DEMO_SCHOOL}</span>
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Reporting Period: August 2026 – January 2027</span>
          </div>
          <div className="flex items-center gap-[8px]">
            <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <Printer className="h-[14px] w-[14px]" aria-hidden /> Print
            </button>
            <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <Share2 className="h-[14px] w-[14px]" aria-hidden /> Share
            </button>
            <button type="button" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
              <FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Generate Principal / District Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Users} value={String(total)} label="Total Caseload · students" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={TrendingUp} value={`${Math.round((onTrack / total) * 100)}%`} label="On-Track Rate · of caseload on pace" accent="#33C78C" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={GraduationCap} value={`${withPlanPct}%`} label="Postsecondary Plans · students with a declared plan" accent="#F5A623" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={MessageSquare} value={`${responseRatePct}%`} label="Question Response Rate · student inquiries answered" accent="#EC5FA6" /></div></HoverBeam>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <SectionCard title="Postsecondary Plans by Pathway">
          <div className="flex flex-col gap-[10px]">
            {pathway.map((p) => (
              <div key={p.label} className="flex items-center gap-[12px]">
                <span className="w-[150px] flex-none truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{p.label}</span>
                <span className="relative h-[10px] flex-1 overflow-hidden rounded-[5px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span className="absolute inset-y-0 left-0 rounded-[5px]" style={{ width: `${(p.count / pathwayMax) * 100}%`, background: "var(--primary)" }} />
                </span>
                <span className="w-[26px] flex-none text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{p.count}</span>
              </div>
            ))}
            <p className="pt-[4px] text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{withPlan} of {total} students ({withPlanPct}%) have a declared postsecondary path</p>
          </div>
        </SectionCard>

        <SectionCard title="Caseload Progress by Grade Level" sub={`Overall average plan completion: ${overallAvg}%`}>
          <div className="flex flex-col gap-[12px]">
            {gradeStats.map((g) => (
              <div key={g.grade} className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <span style={{ color: "var(--foreground)" }}>Grade {g.grade}</span>
                  <span>{g.onTrackCount}/{g.total} on track · {g.avg}% avg completion</span>
                </div>
                <span className="relative h-[8px] w-full overflow-hidden rounded-[4px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span className="absolute inset-y-0 left-0 rounded-[4px]" style={{ width: `${g.avg}%`, background: "var(--primary)" }} />
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="College & Career Readiness Milestones">
        <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
          <BigStat value={`${Math.round((careerReportApproved / total) * 100)}%`} label="Career Reports Approved" sub={`${careerReportApproved} of ${total} students`} color="#5B6CF9" />
          <BigStat value={`${Math.round((academicPlanApproved / total) * 100)}%`} label="Academic Plans Approved" sub={`${academicPlanApproved} of ${total} students`} color="#33C78C" />
          <BigStat value={`${gr10Plus.length ? Math.round((resumeApproved / gr10Plus.length) * 100) : 0}%`} label="Résumés Complete (Gr. 10+)" sub={`${resumeApproved} of ${gr10Plus.length} students`} color="#F5A623" />
          <BigStat value={`${seniorCompliancePct}%`} label="Senior Plan Compliance" sub={`${seniors.length} seniors · district target: 80%`} color="#EC5FA6" />
        </div>
        <div className="flex items-start gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 8%, var(--card))", color: "var(--foreground)" }}>
          <CheckCircle2 className="mt-[1px] h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />
          <span>{seniorsCompliant} of {seniors.length} seniors have college or postsecondary applications in progress or submitted. Senior postsecondary plan rate of {seniorCompliancePct}% {meetsSeniorTarget ? "meets" : "is below"} the district 80% target.</span>
        </div>
      </SectionCard>

      <SectionCard title="Counselor Activity & Accountability">
        <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
          <div className="flex flex-col items-center gap-[4px] text-center">
            <ClipboardCheck className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{plansApproved + plansPending}</span>
            <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Plans Reviewed</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{plansApproved} approved · {plansPending} pending</span>
          </div>
          <div className="flex flex-col items-center gap-[4px] text-center">
            <MessageSquare className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{respondedQuestions}/{QUESTIONS.length}</span>
            <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Student Questions</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{responseRatePct}% response rate</span>
          </div>
          <div className="flex flex-col items-center gap-[4px] text-center">
            <Megaphone className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{ANNOUNCEMENTS.length}</span>
            <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Announcements Sent</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>school-wide communications</span>
          </div>
          <div className="flex flex-col items-center gap-[4px] text-center">
            <Flag className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{monitored}</span>
            <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Support Flags Active</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{monitoredPct}% of caseload monitored</span>
          </div>
        </div>
        <div className="flex items-center gap-[6px] text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          <CheckCircle2 className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />
          Average plan review turnaround: <b style={{ color: "var(--foreground)" }}>2.1 days</b> vs. district standard of 5 business days.
        </div>
      </SectionCard>

      <SectionCard title="Platform-Facilitated Student Engagement">
        <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-5">
          <BigStat value={engagement.drops.toLocaleString("en-US")} label="Daily Career Drops Completed" color="#5B6CF9" />
          <BigStat value={engagement.sims.toLocaleString("en-US")} label="Career Simulations Completed" color="#33C78C" />
          <BigStat value={engagement.careers.toLocaleString("en-US")} label="Careers Saved to Profiles" color="#F5A623" />
          <BigStat value={engagement.colleges.toLocaleString("en-US")} label="Colleges Saved by Students" color="#EC5FA6" />
          <BigStat value={engagement.posts.toLocaleString("en-US")} label="Community Contributions" color="#7C5CFA" />
        </div>
        <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>All engagement activity was generated by students in {counselorName.split(" ")[0]}&apos;s caseload through the Dreamari platform during this reporting period.</p>
      </SectionCard>

      <div className="flex flex-col gap-[2px]">
        <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>ASCA National Model Alignment <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>4th Ed.</span></span>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3">
        {[
          { icon: BookOpen, color: "#5B6CF9", title: "Academic Development", items: [
            `Academic planning supported for all ${total} students`,
            `${Math.round((academicPlanApproved / total) * 100)}% of students have approved four-year academic plans`,
            "Course selection and credit-monitoring support delivered",
          ] },
          { icon: Briefcase, color: "#7C5CFA", title: "Career Development", items: [
            `${Math.round((careerReportApproved / total) * 100)}% career report completion rate across caseload`,
            `Career pathway declared for ${careerPathwayDeclaredPct}% of students`,
            "Career simulations and assessments facilitated via Dreamari",
          ] },
          { icon: Heart, color: "#EC5FA6", title: "Social-Emotional Development", items: [
            `${monitored} students identified and actively monitored for support`,
            `${responseRatePct}% student question response rate via Counselor Connect`,
            `${roster.filter((s) => s.status === "At Risk").length} at-risk students flagged for proactive intervention`,
          ] },
        ].map((card) => (
          <HoverBeam key={card.title} strength={0.6} className="h-full">
            <div className="flex h-full flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ borderColor: "color-mix(in srgb, " + card.color + " 30%, var(--glass-border))", background: `color-mix(in srgb, ${card.color} 8%, var(--card))` }}>
              <span className="flex items-center gap-[8px]">
                <card.icon className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: card.color }} />
                <h3 className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{card.title}</h3>
              </span>
              <ul className="flex flex-col gap-[6px]">
                {card.items.map((it) => (
                  <li key={it} className="flex items-start gap-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--foreground)" }}>
                    <CheckCircle2 className="mt-[2px] h-[12px] w-[12px] flex-none" aria-hidden style={{ color: card.color }} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </HoverBeam>
        ))}
      </div>

      <SectionCard title="Notable Achievements — Fall Semester 2026">
        <ul className="flex flex-col gap-[8px]">
          {[
            `Senior postsecondary plan rate of ${seniorCompliancePct}% ${meetsSeniorTarget ? "meets" : "falls short of"} the district-mandated 80% benchmark${meetsSeniorTarget ? " ahead of the spring deadline" : ""}.`,
            `Maintained a ${Math.round((onTrack / total) * 100)}% on-track rate across a caseload of ${total} students.`,
            "Delivered all plan reviews at an average of 2.1 days, meeting the district's 5-day turnaround standard with room to spare.",
            `${seniorsCompliant} of ${seniors.length} seniors have active college or postsecondary applications underway, positioning ${DEMO_SCHOOL} for strong college-going outcomes.`,
            `Achieved a ${responseRatePct}% Counselor Connect question-response rate, ensuring every student inquiry received a timely, professional reply.`,
            `${monitored} students proactively identified for additional support — early identification reduces at-risk escalation and supports equitable outcomes.`,
            `Over ${engagement.drops.toLocaleString("en-US")} career-exploration activities completed by students on the Dreamari platform, driven by counselor-assigned prompts and deadlines.`,
          ].map((a) => (
            <li key={a} className="flex items-start gap-[8px] text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>
              <Star className="mt-[3px] h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "#F5A623" }} />
              {a}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="District Compliance Summary">
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          <BigStat value={`${withPlanPct}%`} label="Postsecondary Plans on File" sub="Target: ≥ 80% (district)" color={withPlanPct >= 80 ? "#33C78C" : "#E0453C"} />
          <BigStat value={`${seniorCompliancePct}%`} label="Senior Plan Compliance" sub="Target: ≥ 80% (district)" color={meetsSeniorTarget ? "#33C78C" : "#E0453C"} />
          <BigStat value="2.1 days avg." label="Plan Review Turnaround" sub="Target: ≤ 5 days (district)" color="#33C78C" />
        </div>
      </SectionCard>

      <div className="flex flex-col gap-[6px] border-t pt-[var(--space-4)] text-[12px]" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
        <span className="font-bold" style={{ color: "var(--foreground)" }}>{counselorName} · {account.role || "School Counselor"} · {account.school || DEMO_SCHOOL} · Academic Year 2026-2027</span>
        <p>This report reflects Dreamari platform data and counselor activity from August 2026 through January 2027. All student metrics are aggregated and anonymized in distribution. Prepared for administrative review in accordance with ASCA National Model (4th Edition) program accountability standards.</p>
        <span className="font-bold tracking-[0.04em] uppercase">Generated via Dreamari Counselor Dashboard · Confidential — for authorized personnel only</span>
      </div>
    </div>
  );
}
