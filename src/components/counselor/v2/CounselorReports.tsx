"use client";

// A counselor's "Reports": the reference's Student Progress (nine readiness
// reports with filters and CSV/PDF export), Career + College Insights and
// Platform Engagement, consolidated into one screen with three tabs instead
// of three separate menu items. Student Progress and Engagement had become
// unreachable for counselors in v2; Insights moved in on 26 Sept 2026
// (direct feedback: "Career+College insights seem like reports to me").
// The first tab is named "Student progress", the reference's own name for
// it: labelled "Readiness reports" it read as missing ("Student progress is
// the thing i am most worried about, we dont have that in our build").
// Content is unchanged, only grouped.

import { useState } from "react";
import { Segmented } from "@/components/connect/viz";
import { StudentProgress } from "./StudentProgress";
import { PlatformEngagement } from "./PlatformEngagement";
import { CareerCollegeInsights } from "./CareerCollegeInsights";

export type ReportsTab = "progress" | "insights" | "engagement";

export function CounselorReports({ initialTab = "progress" }: { initialTab?: ReportsTab }) {
  const [tab, setTab] = useState<ReportsTab>(initialTab);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <Segmented
        ariaLabel="Report"
        options={[
          { key: "progress", label: "Student progress" },
          { key: "insights", label: "Career + college" },
          { key: "engagement", label: "Engagement" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as ReportsTab)}
      />
      {tab === "progress" ? <StudentProgress /> : tab === "insights" ? <CareerCollegeInsights /> : <PlatformEngagement />}
    </div>
  );
}
