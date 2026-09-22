"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { CounselorShell, type CounselorView, VIEW_TITLES } from "./shell";
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

const VALID_VIEWS = Object.keys(VIEW_TITLES) as CounselorView[];

function ViewFor({ view, initialStudentId }: { view: CounselorView; initialStudentId?: string }) {
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
    <CounselorShell active={view}>
      <ViewFor view={view} initialStudentId={initialStudentId} />
    </CounselorShell>
  );
}
