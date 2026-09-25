"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, type CounselorRole } from "@/lib/counselorAccount";
import { CounselorShell, type CounselorView } from "./shell";
import { ALL_VIEWS, REFERENCE_VIEWS, roleHasView } from "./roles";
import { CounselorVersionProvider, useCounselorVersion } from "./version";
import { Counselors } from "./v2/Counselors";
import { Schools } from "./v2/Schools";
import { Readiness } from "./v2/Readiness";
import { Reports } from "./v2/Reports";
import { OverviewLead } from "./v2/OverviewLead";
import { OverviewSchoolAdmin } from "./v2/OverviewSchoolAdmin";
import { OverviewDistrict } from "./v2/OverviewDistrict";
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
import { StudentsRoster as StudentsRosterV2 } from "./v2/StudentsRoster";
import { StudentProfileView as StudentProfileViewV2 } from "./v2/StudentProfile";
import { MilestoneTracker as MilestoneTrackerV2 } from "./v2/MilestoneTracker";
import { ReviewQueue as ReviewQueueV2 } from "./v2/ReviewQueue";
import { StudentProgress as StudentProgressV2 } from "./v2/StudentProgress";
import { CounselorConnect as CounselorConnectV2 } from "./v2/CounselorConnect";
import { CareerCollegeInsights as CareerCollegeInsightsV2 } from "./v2/CareerCollegeInsights";
import { ProductivitySuite as ProductivitySuiteV2 } from "./v2/ProductivitySuite";
import { PlatformEngagement as PlatformEngagementV2 } from "./v2/PlatformEngagement";
import { MyImpact as MyImpactV2 } from "./v2/MyImpact";
import { Settings as SettingsV2 } from "./v2/Settings";
// v3 (25 Sept 2026): a frozen snapshot of v2 taken before this round of
// content-audit fixes (see ./version.tsx). Every import below points at
// the v3/ directory copy, never at v2/.
import { Counselors as CounselorsV3 } from "./v3/Counselors";
import { Schools as SchoolsV3 } from "./v3/Schools";
import { Readiness as ReadinessV3 } from "./v3/Readiness";
import { Reports as ReportsV3 } from "./v3/Reports";
import { OverviewLead as OverviewLeadV3 } from "./v3/OverviewLead";
import { OverviewSchoolAdmin as OverviewSchoolAdminV3 } from "./v3/OverviewSchoolAdmin";
import { OverviewDistrict as OverviewDistrictV3 } from "./v3/OverviewDistrict";
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


// DEMO-ONLY: v1 and v2 are separate forks (see ./version.tsx) picked here
// per view, so the bottom-center chip swaps the whole screen, never
// individual pieces inside one.
function ViewFor({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  const { version } = useCounselorVersion();
  if (version === "v3") return <StateGate view={view}><V3View view={view} initialStudentId={initialStudentId} role={role} /></StateGate>;
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
          case "School Administrator": return <OverviewSchoolAdmin />;
          case "District Administrator": return <OverviewDistrict />;
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
      case "schools": return <Schools />;
      case "school-impact": return <MyImpactV2 scope="school" />;
    }
  }
}

// A frozen snapshot of V2View, wired to the v3/ imports (see the header
// comment above and ./version.tsx). Never edited to match V2View again --
// that would defeat the point of a backup.
function V3View({ view, initialStudentId, role }: { view: CounselorView; initialStudentId?: string; role: CounselorRole | "" }) {
  {
    switch (view) {
      case "overview":
        switch (roleOrDefault(role)) {
          case "Lead Counselor": return <OverviewLeadV3 />;
          case "School Administrator": return <OverviewSchoolAdminV3 />;
          case "District Administrator": return <OverviewDistrictV3 />;
          default: return <OverviewV3 />;
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
  const allowed = version !== "v1" ? roleHasView(role, known) : REFERENCE_VIEWS.includes(known);
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
