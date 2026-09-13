import { MatchGrid } from "@/components/match-lab/MatchGrid";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// THE Match route (13 Sept 2026): the grid-based Top 3 picker won the A/B
// test against the swipe-card MatchLab, which is now dormant at
// /match-lab. Every entry point into Match routes here.
export default function MatchGridPage() {
  return (
    <main>
      <MatchGrid />
    </main>
  );
}
