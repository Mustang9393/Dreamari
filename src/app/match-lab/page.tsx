import { MatchLab } from "@/components/match-lab/MatchLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// DORMANT (13 Sept 2026): the original swipe-card Match flow, "Option A" in
// the A/B test. The user chose Option B (the grid at /match-grid) as the
// real Match experience going forward -- every entry point into Match now
// points there instead. This route and MatchLab.tsx are deliberately left
// working and untouched so the swipe deck stays one revert away if ever
// needed again; nothing in the app links here anymore.
export default function MatchLabPage() {
  return (
    <main>
      <MatchLab />
    </main>
  );
}
