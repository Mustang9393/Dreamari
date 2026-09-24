"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, type CounselorRole } from "@/lib/counselorAccount";
import { CounselorShell, type CounselorView } from "./shell";
import { ALL_VIEWS, REFERENCE_VIEWS, roleHasView } from "./roles";
import { CounselorVersionProvider, useCounselorVersion } from "./version";
import { ComingSoon } from "./v2/ComingSoon";
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


// DEMO-ONLY: v1 and v2 are separate forks (see ./version.tsx) picked here
// per view, so the bottom-center chip swaps the whole screen, never
// individual pieces inside one.
function ViewFor({ view, initialStudentId }: { view: CounselorView; initialStudentId?: string }) {
  const { version } = useCounselorVersion();
  if (version === "v2") {
    switch (view) {
      case "overview": return <OverviewV2 />;
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
      // Role-shell views (roles.ts), placeholders until each gets its pass.
      case "counselors":
      case "readiness":
      case "reports":
      case "schools":
      case "school-impact":
        return <ComingSoon view={view} />;
    }
  }
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
  const allowed = version === "v2" ? roleHasView(role, known) : REFERENCE_VIEWS.includes(known);
  const view: CounselorView = allowed ? known : "overview";

  useEffect(() => {
    if (ready && !allowed) router.replace("/counselor?view=overview");
  }, [ready, allowed, router]);

  if (!ready) return null;
  return (
    <CounselorShell active={view} showTitle={!(view === "students" && initialStudentId)}>
      <ViewFor view={view} initialStudentId={view === "students" ? initialStudentId : undefined} />
    </CounselorShell>
  );
}

export function CounselorApp({ initialView, initialStudentId }: { initialView?: string; initialStudentId?: string }) {
  const router = useRouter();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  // The server snapshot (and the client's very first, pre-hydration render,
  // which must match it) has no access to localStorage and always reads
  // signed-out -- redirecting on that render would bounce a genuinely
  // signed-in counselor straight back to login before hydration ever gets
  // a chance to read the real value. Wait one tick for hydration to settle
  // before trusting `isSignedIn` enough to redirect on it.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the value we're waiting on (localStorage) is client-only, same justification used elsewhere in this codebase for a client-only mount flag
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !account.isSignedIn) router.replace("/counselor/login");
  }, [hydrated, account.isSignedIn, router]);

  if (!hydrated || !account.isSignedIn) return null;

  return (
    <CounselorVersionProvider>
      <RoutedView requestedView={initialView} initialStudentId={initialStudentId} role={account.role} />
    </CounselorVersionProvider>
  );
}
