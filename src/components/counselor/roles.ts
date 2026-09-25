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
  | "counselors" | "readiness" | "reports" | "schools" | "school-impact";

export type RoleMenuItem = { view: CounselorView; label?: string };

/** The reference's own 11-item menu, in its order. v1 uses exactly this for
 *  every role; it is also the School Counselor's v2 menu minus Platform
 *  Engagement (see ROLE_MENUS). */
export const REFERENCE_VIEWS: CounselorView[] = [
  "overview", "students", "milestones", "review-queue", "progress",
  "connect", "insights", "productivity", "engagement", "impact", "settings",
];

export const ROLE_MENUS: Record<CounselorRole, RoleMenuItem[]> = {
  // "Reports" (26 Sept 2026) consolidates two reference screens a counselor
  // had lost: Student Progress (nine readiness reports, CSV/PDF) and
  // Platform Engagement (logins, active students, check-ins by grade), as
  // two tabs of one screen (v2/CounselorReports.tsx). A v2-vs-Replit audit
  // found both unreachable for this role, against the standing rule that
  // content is never removed, only presented better.
  "School Counselor": [
    { view: "overview" },
    { view: "students" },
    { view: "milestones" },
    { view: "review-queue" },
    { view: "connect" },
    { view: "insights" },
    { view: "productivity" },
    { view: "progress", label: "Reports" },
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
    { view: "insights" },
    { view: "productivity" },
    { view: "progress", label: "Reports" },
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

export function menuForRole(role: CounselorRole | ""): RoleMenuItem[] {
  return ROLE_MENUS[roleOrDefault(role)];
}

/** Screens a role can open by URL but that are not in its menu. */
const HIDDEN_VIEWS: Partial<Record<CounselorRole, CounselorView[]>> = {};
export function roleHasView(role: CounselorRole | "", view: CounselorView): boolean {
  return menuForRole(role).some((item) => item.view === view) || (HIDDEN_VIEWS[roleOrDefault(role)] ?? []).includes(view);
}

/** The Students view doubles as the Student Profile drill-down
 *  (`?view=students&studentId=`), so a role with Students has both. */
export const ALL_VIEWS: CounselorView[] = [
  ...REFERENCE_VIEWS, "counselors", "readiness", "reports", "schools", "school-impact",
];
