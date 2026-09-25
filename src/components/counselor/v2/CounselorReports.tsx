"use client";

// A counselor's "Reports": the reference's Student Progress (nine readiness
// reports with filters and CSV/PDF export) and Platform Engagement (active
// students, logins by month, check-ins by grade), consolidated into one
// screen with two tabs instead of two separate menu items. Both had become
// unreachable for counselors in v2; the content is unchanged, only grouped.

import { useState } from "react";
import { Segmented } from "@/components/connect/viz";
import { StudentProgress } from "./StudentProgress";
import { PlatformEngagement } from "./PlatformEngagement";

type ReportsTab = "readiness" | "engagement";

export function CounselorReports() {
  const [tab, setTab] = useState<ReportsTab>("readiness");
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <Segmented
        ariaLabel="Report type"
        options={[
          { key: "readiness", label: "Readiness reports" },
          { key: "engagement", label: "Platform engagement" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as ReportsTab)}
      />
      {tab === "readiness" ? <StudentProgress /> : <PlatformEngagement />}
    </div>
  );
}
