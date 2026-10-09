"use client";

// "Turn Interest into Opportunity" inside v4's Explore (9 Oct 2026, Maisha's
// Home note: "Turn Interest into Opportunity ... for now, let's put that
// within Explore, allowing counselors to discover and share relevant
// opportunities with students"). v5's HomeExtras section as is (the
// opportunity posters with world pills and Send), fed the worlds this
// caseload explores most. Kept out of Home. The embedded v5 Explore takes
// it through its opt-in `afterCareers` slot, so v5's own Explore is unchanged.

import { useMemo } from "react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { InterestToOpportunity } from "../v5/HomeExtras";

export function ExploreOpportunity() {
  const roster = useReviewedRoster();
  const worlds = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of roster) m.set(s.careerTrack, (m.get(s.careerTrack) ?? 0) + 1);
    return [...m].map(([world, students]) => ({ world, students })).sort((a, b) => b.students - a.students);
  }, [roster]);
  return <InterestToOpportunity worlds={worlds} />;
}
