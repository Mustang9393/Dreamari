"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, type CounselorRole } from "@/lib/counselorAccount";
import { CounselorShell, type CounselorView } from "./shell";
import { ALL_VIEWS, REFERENCE_VIEWS, roleHasView } from "./roles";
import { useV3Extras } from "./v3Extras";
import { ScreenStateProvider, StateGate, readStateParam, type ScreenState } from "./v4/states";
import { CounselorVersionProvider, useCounselorVersion } from "./version";
import { roleOrDefault } from "./roles";
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
import { Overview as OverviewV4 } from "./v4/Overview";
import { StudentsRoster as StudentsRosterV4 } from "./v4/StudentsRoster";
import { StudentProfileView as StudentProfileViewV4 } from "./v4/StudentProfile";
import { ReviewQueue as ReviewQueueV4 } from "./v4/ReviewQueue";
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
import { MilestonesHub } from "./v4/MilestonesHub";

function ViewFor({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  const { version } = useCounselorVersion();
  // v2 and v3 were deleted 7 Oct 2026 (direct instruction: "lets kill v2 and
  // v3 and default the counselor dashboard to v4", then "also delete the v2
  // and v3 code"). v4 is the dashboard; v1 (the reference fork) stays
  // hidden behind V1_ENABLED in version.tsx.
  if (version === "v1") return <V1View view={view} initialStudentId={initialStudentId} />;
  return <StateGate view={view}><V4View view={view} initialStudentId={initialStudentId} role={role} /></StateGate>;
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
      // Student Progress folded into Milestones (7 Oct 2026); an old Student Progress link lands here too.
      case "milestones": return <MilestonesHub />;
      case "review-queue": return <ReviewQueueV4 />;
      case "progress": return <MilestonesHub />;
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
  // v4/states.tsx). Read after mount, like the version, so the server and
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
