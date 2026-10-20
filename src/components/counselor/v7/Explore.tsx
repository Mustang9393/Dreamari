"use client";

// v7 Explore (20 Oct 2026): the Replit's Careers | Schools | Labor Market.
// v5's Explore already is that page on the student design system (career
// posters with world filters and curated rows, school posters, real pay by
// state from BLS with growth and openings, the counselor's shortlist), so v7
// uses it as is, with the third tab named the Replit's way. Its pathway
// switch (all or skilled trades) sits beside the title, not as a second tab
// row under the first (Chandu's rule: never stack two tab rows). Cards open
// v7's own career and school sheets (ExploreFactSheets.tsx).

import { V5Explore } from "../v5/Explore";

export function V7Explore() {
  return <V5Explore payLabel="Labor Market" consolidated />;
}
