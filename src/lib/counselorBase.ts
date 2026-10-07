// Which counselor build is rendering, so the shared screens link inside it
// (7 Oct 2026: v6 reuses v5's Prepare, review desk and Profile). The shell
// sets it while rendering (V5App: v=5, V6App: v=6); every shared link goes
// through cv(). DEMO-ONLY: goes away when one build is chosen.
let base = "/counselor?v=5";

export function setCounselorBase(b: string): void {
  base = b;
}

export function setCounselorBaseV4(): void {
  base = "/counselor?v=4";
}

// v4 names some places differently (8 Oct 2026 audit: shared v5 sheets used
// in v4 linked to v5-only views, so a link either bounced to Today or
// switched the build): Profile is Preferences, Prepare is the student's
// profile, Workspace is the review desk, its Messages tab is Connect and its
// Documents tab is Assist.
function v4View(view: string, extra: string): [string, string] {
  if (view === "profile") return ["settings", ""];
  if (view === "prepare") return [/studentId=/.test(extra) ? "students" : "overview", extra.replace(/&tab=[^&]*/, "")];
  if (view === "workspace") {
    if (/tab=messages/.test(extra)) return ["connect", extra.replace(/&tab=[^&]*/, "")];
    if (/tab=documents/.test(extra)) return ["productivity", extra.replace(/&tab=[^&]*/, "")];
    return ["review-queue", extra.replace(/&tab=[^&]*/, "")];
  }
  if (view === "analytics") return ["impact", ""];
  return [view, extra];
}

export function cv(view: string, extra = ""): string {
  if (base.endsWith("v=4")) {
    const [v, e] = v4View(view, extra);
    return `${base}&view=${v}${e}`;
  }
  return `${base}&view=${view}${extra}`;
}
