// Which counselor build is rendering, so the shared screens link inside it
// (7 Oct 2026: v6 reuses v5's Prepare, review desk and Profile). The shell
// sets it while rendering (V5App: v=5, V6App: v=6); every shared link goes
// through cv(). DEMO-ONLY: goes away when one build is chosen.
let base = "/counselor?v=5";

export function setCounselorBase(b: string): void {
  base = b;
}

export function cv(view: string, extra = ""): string {
  return `${base}&view=${view}${extra}`;
}
