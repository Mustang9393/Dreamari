import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { ProfileExperience } from "@/components/profile/ProfileExperience";
import { parsePicksParam } from "@/lib/picks";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "My Profile — Dreamari",
  description: "Your Top 3, your routes after high school, your plan — and a career report you can export.",
};

// My Profile prototype (v4 branch) — informed by the Replit v2-my-profile
// audit and the Career Intelligence Layer V3 doc. Focus-driven: the student
// selects one of their Top 3 and the report, routes, and plan follow.
export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ picks?: string | string[]; focus?: string | string[] }> }) {
  const query = await searchParams;
  const picks = parsePicksParam(query.picks);
  const focusParam = Array.isArray(query.focus) ? query.focus[0] : query.focus;
  const focus = focusParam && picks.includes(focusParam) ? focusParam : (picks[0] ?? null);
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <ProfileExperience initialPicks={picks} initialFocus={focus} />
    </>
  );
}
