// Which screens each Counselor Dashboard role sees, in menu order. This is
// the ONE place the four menus live: the sidebar, the "is this view allowed
// for this role" redirect and the mobile drawer all read from here, so a
// change to a menu is one edit in one file.
//
// Status (24 Sept 2026): these four menus are PROPOSED, built as proposed so
// they can be reviewed live, and still awaiting Joshua's sign-off. Expect
// them to move; that is why nothing else in the dashboard hard-codes a
// role's screen list.
//
// Rules the shell applies to these lists:
// - A screen a role does not have disappears from the nav (not greyed, not
//   locked). An admin never sees "Review Queue" at all.
// - Opening a view the role does not have redirects to that role's Overview.
// - `label` overrides the shared VIEW_TITLES label for that role's menu only
//   ("Platform Engagement" reads as "Engagement" in a district menu that is
//   already about engagement across schools).
// - Role-driven menus apply to v2 of the dashboard only (counselor/version.tsx);
//   v1 stays the reference's fixed 11 items for every role.

import type { CounselorRole } from "@/lib/counselorAccount";

export type CounselorView =
  | "overview" | "students" | "milestones" | "review-queue" | "progress"
  | "connect" | "insights" | "productivity" | "engagement" | "impact" | "settings"
  // Role-shell views (v2 only). "school-impact" is the Lead Counselor's
  // school-wide counterpart to a counselor's own "My Impact".
  | "counselors" | "readiness" | "reports" | "schools" | "school-impact"
  // v3 only (29 Sept 2026): built from the counselor platform research
  // (docs/AI_HANDOFF.md, same date). v2's menus never list them.
  | "meetings" | "financial-aid";

export type RoleMenuItem = { view: CounselorView; label?: string };

/** The reference's own 11-item menu, in its order. v1 uses exactly this for
 *  every role; it is also the School Counselor's v2 menu minus Platform
 *  Engagement (see ROLE_MENUS). */
export const REFERENCE_VIEWS: CounselorView[] = [
  "overview", "students", "milestones", "review-queue", "progress",
  "connect", "insights", "productivity", "engagement", "impact", "settings",
];

export const ROLE_MENUS: Record<CounselorRole, RoleMenuItem[]> = {
  // Student Progress, Career + College Insights and Platform Engagement
  // are three menu items again, as in the reference (27 Sept 2026, Maisha:
  // "I'm not sure if we should call this part 'reports'. I see you've tried
  // to consolidate certain tabs into one. But they feel different."). The
  // 26 Sept "Reports" screen held all three as tabs; the reason for it (two
  // of them had become unreachable for counselors) is still met, because
  // each is now its own item.
  "School Counselor": [
    { view: "overview" },
    { view: "students" },
    { view: "milestones" },
    { view: "review-queue" },
    { view: "connect" },
    { view: "productivity" },
    { view: "progress" },
    { view: "insights" },
    { view: "engagement" },
    { view: "impact" },
    { view: "settings" },
  ],
  "Lead Counselor": [
    { view: "overview" },
    { view: "counselors" },
    { view: "students" },
    { view: "milestones" },
    { view: "review-queue" },
    { view: "connect" },
    { view: "productivity" },
    { view: "progress" },
    { view: "insights" },
    { view: "engagement" },
    { view: "school-impact" },
    { view: "settings" },
  ],
  "School Administrator": [
    { view: "overview" },
    { view: "readiness" },
    { view: "students" },
    { view: "counselors" },
    { view: "engagement" },
    { view: "reports" },
    { view: "settings" },
  ],
  "District Administrator": [
    { view: "overview" },
    { view: "schools" },
    { view: "readiness" },
    { view: "engagement", label: "Engagement" },
    { view: "reports" },
    { view: "settings" },
  ],
};

/** The Overview subtitle per role: each role's Overview answers a different
 *  question, and the line under the title says which. `first` is the
 *  signed-in person's first name (may be empty). */
export const OVERVIEW_SUBTITLES: Record<CounselorRole, (first: string) => string> = {
  "School Counselor": (first) => `Welcome back${first ? `, ${first}` : ""}. Here's your caseload at a glance.`,
  "Lead Counselor": (first) => `Welcome back${first ? `, ${first}` : ""}. Here's which counselors and grades need you this week.`,
  "School Administrator": (first) => `Welcome back${first ? `, ${first}` : ""}. Here's whether the school is on target.`,
  "District Administrator": (first) => `Welcome back${first ? `, ${first}` : ""}. Here's how the district's schools compare.`,
};

/** An account whose role was never set (a sign-up before the role field
 *  existed, or a cleared value) is treated as a School Counselor, the
 *  reference's own persona. */
export const DEFAULT_ROLE: CounselorRole = "School Counselor";

export function roleOrDefault(role: CounselorRole | ""): CounselorRole {
  return role === "" ? DEFAULT_ROLE : role;
}

// v3 (29 Sept 2026): the counselor research's two daily jobs the menus
// lacked, meetings and financial aid, sit right after Review Queue for the
// two roles that carry a caseload. Admin roles keep FAFSA inside Readiness.
// Kept as an insertion over ROLE_MENUS, not a second copy of every menu, so
// a change to a v2 menu reaches v3 too.
const V3_INSERT_AFTER: CounselorView = "review-queue";
const V3_EXTRA: Partial<Record<CounselorRole, RoleMenuItem[]>> = {
  "School Counselor": [{ view: "meetings" }, { view: "financial-aid" }],
  "Lead Counselor": [{ view: "meetings" }, { view: "financial-aid" }],
};

export function menuForRole(role: CounselorRole | "", version?: string): RoleMenuItem[] {
  const base = ROLE_MENUS[roleOrDefault(role)];
  const extra = version === "v3" ? V3_EXTRA[roleOrDefault(role)] : undefined;
  if (!extra) return base;
  const at = base.findIndex((i) => i.view === V3_INSERT_AFTER);
  return at < 0 ? [...base, ...extra] : [...base.slice(0, at + 1), ...extra, ...base.slice(at + 1)];
}

/** Screens a role can open by URL but that are not in its menu. */
// Insights moved inside Reports (26 Sept 2026) but its old URL still opens
// it, on the Reports "Career + college" tab (Overview's Career Pathways
// links there).
const HIDDEN_VIEWS: Partial<Record<CounselorRole, CounselorView[]>> = {};

/** A hidden view shown inside another menu item's screen: the sidebar
 *  highlights, and the page is titled, as that item. */
export const VIEW_HOME: Partial<Record<CounselorView, CounselorView>> = {};
export function roleHasView(role: CounselorRole | "", view: CounselorView, version?: string): boolean {
  return menuForRole(role, version).some((item) => item.view === view) || (HIDDEN_VIEWS[roleOrDefault(role)] ?? []).includes(view);
}

/** The Students view doubles as the Student Profile drill-down
 *  (`?view=students&studentId=`), so a role with Students has both. */
export const ALL_VIEWS: CounselorView[] = [
  ...REFERENCE_VIEWS, "counselors", "readiness", "reports", "schools", "school-impact", "meetings", "financial-aid",
];
