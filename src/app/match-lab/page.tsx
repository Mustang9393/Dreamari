import { MatchLab } from "@/components/match-lab/MatchLab";

// v3 PROTOTYPE ONLY — the match-flow lab. This route exists so the match
// experience can be iterated in isolation instead of walking all eight build
// steps to reach it. THIS BRANCH (v3) NEVER MERGES OR DEPLOYS unless the user
// explicitly asks; see docs/AI_HANDOFF.md.
export default function MatchLabPage() {
  return (
    <main>
      {/* TEMP debug trap (v3 lab only): paints any runtime error onto the
         screen so device testing doesn't need a remote console. Remove
         before this flow ever promotes. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('error',function(e){var d=document.getElementById('mlerr')||Object.assign(document.body.appendChild(document.createElement('div')),{id:'mlerr'});d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;font:11px monospace;padding:6px;max-height:30vh;overflow:auto;white-space:pre-wrap';d.textContent+=(e.message||e.type)+' @ '+(e.filename||'')+':'+(e.lineno||'')+'\n';});window.addEventListener('unhandledrejection',function(e){var d=document.getElementById('mlerr')||Object.assign(document.body.appendChild(document.createElement('div')),{id:'mlerr'});d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;font:11px monospace;padding:6px;max-height:30vh;overflow:auto;white-space:pre-wrap';d.textContent+='REJECTION: '+String(e.reason)+'\n';});`,
        }}
      />
      <MatchLab />
    </main>
  );
}
