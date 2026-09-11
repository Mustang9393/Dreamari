import { MatchGrid } from "@/components/match-lab/MatchGrid";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// EXPERIMENT ONLY — grid-based Top 3 picker, an alternative to the swipe-card
// MatchLab. Lives at its own route so it never touches /match-lab. Local only:
// do not push or deploy per direct instruction (12 Sept 2026).
export default function MatchGridPage() {
  return (
    <main>
      <MatchGrid />
    </main>
  );
}
