"use client";

// The coverage banner (src/lib/counselorCoverage.ts), on Home and Students.

import { endCoverage, useCoverage } from "@/lib/counselorCoverage";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { notify } from "./LogSheet";

export function CoverageBanner() {
  const c = useCoverage();
  const roster = useReviewedRoster();
  if (!c) return null;
  const who = SCHOOL_COUNSELORS.find((x) => x.name === c.name);
  const n = who ? roster.filter((s) => counselorFor(s).id === who.id).length : 0;
  return (
    <p role="status" className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] border-l-[3px] py-[6px] pl-[var(--space-4)] text-[15px]" style={{ borderColor: "var(--accent)" }}>
      <span><span className="font-semibold">Covering for {c.name} today</span> <span style={{ color: "var(--muted-foreground)" }}>· {n} more students in your caseload, students {who?.range}</span></span>
      <button type="button" onClick={() => { endCoverage(); notify("Coverage ended"); }} className="dm-link font-semibold" style={{ color: "var(--accent)" }}>End</button>
    </p>
  );
}
