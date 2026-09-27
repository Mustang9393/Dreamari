import { MiniExploreMatch } from "@/components/match-lab/MiniExploreMatch";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// THE Match route. 13 Sept 2026: the grid-based Top 3 picker won the A/B
// test against the swipe-card MatchLab (dormant at /match-lab). 27 Sept
// 2026: Joshua's simplified Mini Explore replaced the grid (MatchGrid.tsx,
// now dormant); see MiniExploreMatch.tsx. Every entry point into Match
// routes here.
export default function MatchGridPage() {
  return (
    <main>
      <MiniExploreMatch />
    </main>
  );
}
