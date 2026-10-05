import type { Metadata } from "next";
import { LeaderboardExperience } from "@/components/leaderboard/LeaderboardExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Daily Leaderboard · Dreamari",
  description: "Rankings update daily. Points accumulate and never reset.",
};

// DEMO-ONLY: the Daily Leaderboard mockup (Joshua's Replit vision, 6 Oct
// 2026), reached from the Quick links menu. Seeded standings (data.ts).
export default function LeaderboardPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <LeaderboardExperience />
    </>
  );
}
