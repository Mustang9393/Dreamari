"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { CounselorShell, type CounselorView, VIEW_TITLES } from "./shell";
import { CounselorVersionProvider, useCounselorVersion } from "./version";
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

const VALID_VIEWS = Object.keys(VIEW_TITLES) as CounselorView[];

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
    }
  }
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
  }
}

export function CounselorApp({ initialView, initialStudentId }: { initialView?: string; initialStudentId?: string }) {
  const router = useRouter();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const view: CounselorView = VALID_VIEWS.includes(initialView as CounselorView) ? (initialView as CounselorView) : "overview";

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
      <CounselorShell active={view} showTitle={!(view === "students" && initialStudentId)}>
        <ViewFor view={view} initialStudentId={initialStudentId} />
      </CounselorShell>
    </CounselorVersionProvider>
  );
}
