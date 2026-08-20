import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { ProfileExperience } from "@/components/profile/ProfileExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "My Profile — Dreamari",
  description: "Your Top 3, your routes after high school, your plan — and a career report you can export.",
};

// My Profile prototype (v4 branch) — informed by the Replit v2-my-profile
// audit and the Career Intelligence Layer V3 doc. Focus-driven: the student
// selects one of their Top 3 and the report, routes, and plan follow.
export default function ProfilePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <ProfileExperience />
    </>
  );
}
