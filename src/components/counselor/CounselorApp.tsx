"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, type CounselorRole } from "@/lib/counselorAccount";
import { CounselorShell, type CounselorView } from "./shell";
import { ALL_VIEWS, REFERENCE_VIEWS, roleHasView } from "./roles";
import { useV3Extras } from "./v3Extras";
import { CounselorVersionProvider, useCounselorVersion } from "./version";
import { Counselors } from "./v2/Counselors";
import { Schools } from "./v2/Schools";
import { Readiness } from "./v2/Readiness";
import { Reports } from "./v2/Reports";
import { OverviewLead } from "./v2/OverviewLead";
import { SchoolOverview } from "./v2/leader/school/SchoolOverview";
import { SchoolProgress } from "./v2/leader/school/SchoolProgress";
import { SchoolPostsecondary } from "./v2/leader/school/SchoolPostsecondary";
import { SchoolTeam } from "./v2/leader/school/SchoolTeam";
import { SchoolReports } from "./v2/leader/school/SchoolReports";
import { DistrictOverview } from "./v2/leader/district/DistrictOverview";
import { SchoolPerformance } from "./v2/leader/district/SchoolPerformance";
import { StudentOutcomes } from "./v2/leader/district/StudentOutcomes";
import { CounselingCapacity } from "./v2/leader/district/CounselingCapacity";
import { DistrictReports } from "./v2/leader/district/DistrictReports";
import { roleOrDefault } from "./roles";
import { ScreenStateProvider, StateGate, readStateParam, type ScreenState } from "./v2/states";
import { Overview } from "./Overview";
import { StudentsRoster } from "./StudentsRoster";
import { StudentProfileView } from "./StudentProfile";
import { MilestoneTracker } from "./MilestoneTracker";
import { ReviewQueue } from "./ReviewQueue";
import { StudentProgress } from "./StudentProgress";
import { CounselorConnect } from "./CounselorConnect";
import { CareerCollegeInsights } from "./CareerCollegeInsights";
import { ProductivitySuite } from "./ProductivitySuite";
import { PlatformEngagement } from "./PlatformEngagement";
import { MyImpact } from "./MyImpact";
import { Settings } from "./Settings";
import { Overview as OverviewV2 } from "./v2/Overview";
import { Overview as OverviewV4 } from "./v4/Overview";
import { StudentsRoster as StudentsRosterV4 } from "./v4/StudentsRoster";
import { StudentProfileView as StudentProfileViewV4 } from "./v4/StudentProfile";
import { MilestoneTracker as MilestoneTrackerV4 } from "./v4/MilestoneTracker";
import { ReviewQueue as ReviewQueueV4 } from "./v4/ReviewQueue";
import { StudentProgress as StudentProgressV4 } from "./v4/StudentProgress";
import { CounselorConnect as CounselorConnectV4 } from "./v4/CounselorConnect";
import { CareerCollegeInsights as CareerCollegeInsightsV4 } from "./v4/CareerCollegeInsights";
import { ProductivitySuite as ProductivitySuiteV4 } from "./v4/ProductivitySuite";
import { PlatformEngagement as PlatformEngagementV4 } from "./v4/PlatformEngagement";
import { MyImpact as MyImpactV4 } from "./v4/MyImpact";
import { Settings as SettingsV4 } from "./v4/Settings";
import { Counselors as CounselorsV4 } from "./v4/Counselors";
import { Schools as SchoolsV4 } from "./v4/Schools";
import { Readiness as ReadinessV4 } from "./v4/Readiness";
import { Reports as ReportsV4 } from "./v4/Reports";
import { OverviewLead as OverviewLeadV4 } from "./v4/OverviewLead";
import { SchoolOverview as SchoolOverviewV4 } from "./v4/leader/school/SchoolOverview";
import { SchoolProgress as SchoolProgressV4 } from "./v4/leader/school/SchoolProgress";
import { SchoolPostsecondary as SchoolPostsecondaryV4 } from "./v4/leader/school/SchoolPostsecondary";
import { SchoolTeam as SchoolTeamV4 } from "./v4/leader/school/SchoolTeam";
import { SchoolReports as SchoolReportsV4 } from "./v4/leader/school/SchoolReports";
import { DistrictOverview as DistrictOverviewV4 } from "./v4/leader/district/DistrictOverview";
import { SchoolPerformance as SchoolPerformanceV4 } from "./v4/leader/district/SchoolPerformance";
import { StudentOutcomes as StudentOutcomesV4 } from "./v4/leader/district/StudentOutcomes";
import { CounselingCapacity as CounselingCapacityV4 } from "./v4/leader/district/CounselingCapacity";
import { DistrictReports as DistrictReportsV4 } from "./v4/leader/district/DistrictReports";
import { StudentsRoster as StudentsRosterV2 } from "./v2/StudentsRoster";
import { StudentProfileView as StudentProfileViewV2 } from "./v2/StudentProfile";
import { MilestoneTracker as MilestoneTrackerV2 } from "./v2/MilestoneTracker";
import { ReviewQueue as ReviewQueueV2 } from "./v2/ReviewQueue";
import { CounselorConnect as CounselorConnectV2 } from "./v2/CounselorConnect";
import { ProductivitySuite as ProductivitySuiteV2 } from "./v2/ProductivitySuite";
import { PlatformEngagement as PlatformEngagementV2 } from "./v2/PlatformEngagement";
import { MyImpact as MyImpactV2 } from "./v2/MyImpact";
import { Settings as SettingsV2 } from "./v2/Settings";
import { StudentProgress as StudentProgressV2 } from "./v2/StudentProgress";
import { CareerCollegeInsights as CareerCollegeInsightsV2 } from "./v2/CareerCollegeInsights";
// v3 (29 Sept 2026): today's v2 plus the counselor research build (see
// ./version.tsx). Every import below points at the v3/ directory, never
// at v2/, so v3 work never leaks into v2.
import { Counselors as CounselorsV3 } from "./v3/Counselors";
import { Schools as SchoolsV3 } from "./v3/Schools";
import { Readiness as ReadinessV3 } from "./v3/Readiness";
import { Reports as ReportsV3 } from "./v3/Reports";
import { OverviewLead as OverviewLeadV3 } from "./v3/OverviewLead";
import { Overview as OverviewV3 } from "./v3/Overview";
import { StudentsRoster as StudentsRosterV3 } from "./v3/StudentsRoster";
import { StudentProfileView as StudentProfileViewV3 } from "./v3/StudentProfile";
import { MilestoneTracker as MilestoneTrackerV3 } from "./v3/MilestoneTracker";
import { ReviewQueue as ReviewQueueV3 } from "./v3/ReviewQueue";
import { StudentProgress as StudentProgressV3 } from "./v3/StudentProgress";
import { CounselorConnect as CounselorConnectV3 } from "./v3/CounselorConnect";
import { CareerCollegeInsights as CareerCollegeInsightsV3 } from "./v3/CareerCollegeInsights";
import { ProductivitySuite as ProductivitySuiteV3 } from "./v3/ProductivitySuite";
import { PlatformEngagement as PlatformEngagementV3 } from "./v3/PlatformEngagement";
import { MyImpact as MyImpactV3 } from "./v3/MyImpact";
import { Settings as SettingsV3 } from "./v3/Settings";
import { Meetings as MeetingsV3 } from "./v3/Meetings";
import { FinancialAid as FinancialAidV3 } from "./v3/FinancialAid";
import { Academics as AcademicsV3 } from "./v3/Academics";
import { Applications as ApplicationsV3 } from "./v3/Applications";
import { TimeLog as TimeLogV3 } from "./v3/TimeUse";
import { StateGate as StateGateV3 } from "./v3/states";
import { SchoolOverview as SchoolOverviewV3 } from "./v3/leader/school/SchoolOverview";
import { SchoolProgress as SchoolProgressV3 } from "./v3/leader/school/SchoolProgress";
import { SchoolPostsecondary as SchoolPostsecondaryV3 } from "./v3/leader/school/SchoolPostsecondary";
import { SchoolTeam as SchoolTeamV3 } from "./v3/leader/school/SchoolTeam";
import { SchoolReports as SchoolReportsV3 } from "./v3/leader/school/SchoolReports";
import { DistrictOverview as DistrictOverviewV3 } from "./v3/leader/district/DistrictOverview";
import { SchoolPerformance as SchoolPerformanceV3 } from "./v3/leader/district/SchoolPerformance";
import { StudentOutcomes as StudentOutcomesV3 } from "./v3/leader/district/StudentOutcomes";
import { CounselingCapacity as CounselingCapacityV3 } from "./v3/leader/district/CounselingCapacity";
import { DistrictReports as DistrictReportsV3 } from "./v3/leader/district/DistrictReports";



// DEMO-ONLY: v1 and v2 are separate forks (see ./version.tsx) picked here
// per view, so the bottom-center chip swaps the whole screen, never
// individual pieces inside one.
function ViewFor({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  const { version, setVersion } = useCounselorVersion();
  // The School Leader and District Leader views are built in v2 only, the
  // version that gets shared; v3 is experimental (direct instruction, 2 Oct
  // 2026: "make sure they land in v2 and not v3"). Choosing a leader role
  // while v3 is on switches back to v2.
  //
  // Since 2 Oct 2026 (direct instruction: the redundancy pass is "not just
  // about this one tab but everything, all user roles", built as v3) the
  // leaders have v3 screens too. Choosing a leader role still lands on v2,
  // the shared build; the v3 pill then opens their v3 screens. So the
  // switch happens on the role change only, not on every version change.
  const leader = role === "School Leader" || role === "District Leader";
  const seenRole = useRef(role);
  useEffect(() => {
    if (seenRole.current === role) return;
    seenRole.current = role;
    if (leader && version === "v3") setVersion("v2");
  }, [role, leader, version, setVersion]);
  if (version === "v4") return <StateGate view={view}>{<V4View view={view} initialStudentId={initialStudentId} role={role} />}</StateGate>;
  if (version === "v3") return <StateGateV3 view={view}><V3View view={view} initialStudentId={initialStudentId} role={role} /></StateGateV3>;
  if (version === "v2") return <StateGate view={view}><V2View view={view} initialStudentId={initialStudentId} role={role} /></StateGate>;
  return <V1View view={view} initialStudentId={initialStudentId} />;
}

function V2View({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  {
    switch (view) {
      // Each role's Overview answers a different question (roles.ts).
      case "overview":
        switch (roleOrDefault(role)) {
          case "Lead Counselor": return <OverviewLead />;
          // Rebuilt from the Replit's leader views, 2 Oct 2026.
          case "School Leader": return <SchoolOverview />;
          case "District Leader": return <DistrictOverview />;
          default: return <OverviewV2 />;
        }
      case "students": return initialStudentId ? <StudentProfileViewV2 studentId={initialStudentId} /> : <StudentsRosterV2 />;
      case "milestones": return <MilestoneTrackerV2 />;
      case "review-queue": return <ReviewQueueV2 />;
      case "progress": return <StudentProgressV2 />;
      case "connect": return <CounselorConnectV2 />;
      case "insights": return <CareerCollegeInsightsV2 />;
      case "productivity": return <ProductivitySuiteV2 />;
      case "engagement": return <PlatformEngagementV2 />;
      case "impact": return <MyImpactV2 />;
      case "settings": return <SettingsV2 />;
      // Role-shell views (roles.ts).
      case "counselors": return <Counselors />;
      case "readiness": return <Readiness />;
      case "reports": return <Reports />;
      // School Leader (2 Oct 2026).
      case "leader-progress": return <SchoolProgress />;
      case "postsecondary": return <SchoolPostsecondary />;
      case "team": return <SchoolTeam />;
      case "leader-reports": return <SchoolReports />;
      // District Leader (2 Oct 2026).
      case "school-performance": return <SchoolPerformance />;
      case "outcomes": return <StudentOutcomes />;
      case "capacity": return <CounselingCapacity />;
      case "district-reports": return <DistrictReports />;
      case "schools": return <Schools />;
      case "school-impact": return <MyImpactV2 scope="school" />;
      // v3-only screens: RoutedView never lets v2 reach them.
      case "meetings":
      case "financial-aid":
      case "academics":
      case "applications":
      case "time": return <OverviewV2 />;
    }
  }
}

function V4View({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  {
    switch (view) {
      // Each role's Overview answers a different question (roles.ts).
      case "overview":
        switch (roleOrDefault(role)) {
          case "Lead Counselor": return <OverviewLeadV4 />;
          // Rebuilt from the Replit's leader views, 2 Oct 2026.
          case "School Leader": return <SchoolOverviewV4 />;
          case "District Leader": return <DistrictOverviewV4 />;
          default: return <OverviewV4 />;
        }
      case "students": return initialStudentId ? <StudentProfileViewV4 studentId={initialStudentId} /> : <StudentsRosterV4 />;
      case "milestones": return <MilestoneTrackerV4 />;
      case "review-queue": return <ReviewQueueV4 />;
      case "progress": return <StudentProgressV4 />;
      case "connect": return <CounselorConnectV4 />;
      case "insights": return <CareerCollegeInsightsV4 />;
      case "productivity": return <ProductivitySuiteV4 />;
      case "engagement": return <PlatformEngagementV4 />;
      case "impact": return <MyImpactV4 />;
      case "settings": return <SettingsV4 />;
      // Role-shell views (roles.ts).
      case "counselors": return <CounselorsV4 />;
      case "readiness": return <ReadinessV4 />;
      case "reports": return <ReportsV4 />;
      // School Leader (2 Oct 2026).
      case "leader-progress": return <SchoolProgressV4 />;
      case "postsecondary": return <SchoolPostsecondaryV4 />;
      case "team": return <SchoolTeamV4 />;
      case "leader-reports": return <SchoolReportsV4 />;
      // District Leader (2 Oct 2026).
      case "school-performance": return <SchoolPerformanceV4 />;
      case "outcomes": return <StudentOutcomesV4 />;
      case "capacity": return <CounselingCapacityV4 />;
      case "district-reports": return <DistrictReportsV4 />;
      case "schools": return <SchoolsV4 />;
      case "school-impact": return <MyImpactV4 scope="school" />;
      // v3-only screens: RoutedView never lets v2 reach them.
      case "meetings":
      case "financial-aid":
      case "academics":
      case "applications":
      case "time": return <OverviewV4 />;
    }
  }
}


// V2View wired to the v3/ imports, plus the two v3-only screens.
function V3View({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  const extras = useV3Extras();
  {
    switch (view) {
      case "overview":
        switch (roleOrDefault(role)) {
          case "Lead Counselor": return <OverviewLeadV3 />;
          case "School Leader": return <SchoolOverviewV3 />;
          case "District Leader": return <DistrictOverviewV3 />;
          // The research build's Today list and season strip show only with
          // the dock's Research toggle on; otherwise v3 opens the same
          // Overview v2 does (2 Oct 2026, direct instruction: "DO NOT CHANGE
          // THE OVERVIEW SCREEN, show the same info that was there before").
          default: return extras ? <OverviewV3 /> : <OverviewV2 />;
        }
      case "students": return initialStudentId ? <StudentProfileViewV3 studentId={initialStudentId} /> : <StudentsRosterV3 />;
      case "milestones": return <MilestoneTrackerV3 />;
      case "review-queue": return <ReviewQueueV3 />;
      case "progress": return <StudentProgressV3 />;
      case "connect": return <CounselorConnectV3 />;
      case "insights": return <CareerCollegeInsightsV3 />;
      case "productivity": return <ProductivitySuiteV3 />;
      case "engagement": return <PlatformEngagementV3 />;
      case "impact": return <MyImpactV3 />;
      case "settings": return <SettingsV3 />;
      case "counselors": return <CounselorsV3 />;
      case "readiness": return <ReadinessV3 />;
      case "reports": return <ReportsV3 />;
      case "schools": return <SchoolsV3 />;
      case "school-impact": return <MyImpactV3 scope="school" />;
      case "meetings": return <MeetingsV3 />;
      case "financial-aid": return <FinancialAidV3 />;
      case "academics": return <AcademicsV3 />;
      case "applications": return <ApplicationsV3 />;
      case "time": return <TimeLogV3 />;
      case "leader-progress": return <SchoolProgressV3 />;
      case "postsecondary": return <SchoolPostsecondaryV3 />;
      case "team": return <SchoolTeamV3 />;
      case "leader-reports": return <SchoolReportsV3 />;
      case "school-performance": return <SchoolPerformanceV3 />;
      case "outcomes": return <StudentOutcomesV3 />;
      case "capacity": return <CounselingCapacityV3 />;
      case "district-reports": return <DistrictReportsV3 />;
    }
  }
}

function V1View({ view, initialStudentId }: { view: CounselorView; initialStudentId?: string }) {
  // v1 never reaches a role-shell view: RoutedView redirects them to
  // Overview before this renders.
  switch (view) {
    case "overview": return <Overview />;
    case "students": return initialStudentId ? <StudentProfileView studentId={initialStudentId} /> : <StudentsRoster />;
    case "milestones": return <MilestoneTracker />;
    case "review-queue": return <ReviewQueue />;
    case "progress": return <StudentProgress />;
    case "connect": return <CounselorConnect />;
    case "insights": return <CareerCollegeInsights />;
    case "productivity": return <ProductivitySuite />;
    case "engagement": return <PlatformEngagement />;
    case "impact": return <MyImpact />;
    case "settings": return <Settings />;
    default: return <Overview />;
  }
}

// Which views this build and role may open. v1: the reference's 11, for
// every role. v2: the role's own menu (roles.ts). Anything else, including
// a stale link to a screen the role does not have, lands on Overview, which
// every role has. Waits for the version to be read after mount (see
// version.tsx's `ready`) so a v2-only link is not bounced on the
// pre-hydration v1 placeholder.
function RoutedView({ requestedView, initialStudentId, role }: { requestedView: string | undefined; initialStudentId?: string; role: CounselorRole | "" }) {
  const router = useRouter();
  const { version, ready } = useCounselorVersion();
  const known = ALL_VIEWS.includes(requestedView as CounselorView) ? (requestedView as CounselorView) : "overview";
  const extras = useV3Extras();
  const allowed = version !== "v1" ? roleHasView(role, known, version, extras) : REFERENCE_VIEWS.includes(known);
  const view: CounselorView = allowed ? known : "overview";

  useEffect(() => {
    if (ready && !allowed) router.replace("/counselor?view=overview");
  }, [ready, allowed, router]);

  // DEMO-ONLY: `?state=loading|empty|error` previews a screen's state (see
  // v2/states.tsx). Read after mount, like the version, so the server and
  // first client render agree.
  const [screenState, setScreenState] = useState<ScreenState>("ready");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only URL read after mount, same justification as the hydrated flag
    setScreenState(readStateParam());
  }, [requestedView]);

  if (!ready) return null;
  return (
    <ScreenStateProvider value={screenState}>
      <CounselorShell active={view} showTitle={!(view === "students" && initialStudentId)}>
        <ViewFor view={view} initialStudentId={view === "students" ? initialStudentId : undefined} role={role} />
      </CounselorShell>
    </ScreenStateProvider>
  );
}

export function CounselorApp({ initialView, initialStudentId }: { initialView?: string; initialStudentId?: string }) {
  // DEMO-ONLY: open the counselor prototype directly, without simulated auth.
  // Keep the local profile subscription for Settings and the role switcher.
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);

  return (
    <CounselorVersionProvider>
      <RoutedView requestedView={initialView} initialStudentId={initialStudentId} role={account.role} />
    </CounselorVersionProvider>
  );
}
