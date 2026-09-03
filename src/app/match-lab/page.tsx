import { MatchLab } from "@/components/match-lab/MatchLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// v3 PROTOTYPE ONLY — the match-flow lab. This route exists so the match
// experience can be iterated in isolation instead of walking all eight build
// steps to reach it. THIS BRANCH (v3) NEVER MERGES OR DEPLOYS unless the user
// explicitly asks; see docs/AI_HANDOFF.md.
export default function MatchLabPage() {
  return (
    <main>
      <MatchLab />
    </main>
  );
}
