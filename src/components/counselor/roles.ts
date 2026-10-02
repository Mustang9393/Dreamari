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
  // School Leader and District Leader (2 Oct 2026), rebuilt from the
  // Replit's own two leader views (docs/reference/school-district-leader-
  // replit-2026-10/NOTES.md). They replace the proposed School/District
  // Administrator screens above (readiness, reports, schools), which no
  // role's menu opens any more.
  | "leader-progress" | "postsecondary" | "team" | "leader-reports"
  | "school-performance" | "outcomes" | "capacity" | "district-reports"
  // v3 only (29 Sept 2026): built from the counselor platform research
  // (docs/AI_HANDOFF.md, same date). v2's menus never list them.
  | "meetings" | "financial-aid"
  // v3, the imagined school integration (29 Sept 2026, src/lib/counselorSis.ts).
  | "academics" | "applications"
  // v3: the time log, its own screen (29 Sept 2026).
  | "time";

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
  // The Replit's School Leader nav, in its order (2 Oct 2026). Read-only by
  // design: a school leader reviews the school, they don't work a caseload.
  "School Leader": [
    { view: "overview" },
    { view: "leader-progress" },
    { view: "postsecondary" },
    { view: "team" },
    { view: "leader-reports" },
  ],
  // The Replit's District Leader nav, in its order (2 Oct 2026).
  "District Leader": [
    { view: "overview" },
    { view: "school-performance" },
    { view: "outcomes" },
    { view: "capacity" },
    { view: "district-reports" },
  ],
};

/** The Overview subtitle per role: each role's Overview answers a different
 *  question, and the line under the title says which. `first` is the
 *  signed-in person's first name (may be empty). */
export const OVERVIEW_SUBTITLES: Record<CounselorRole, (first: string) => string> = {
  "School Counselor": (first) => `Welcome back${first ? `, ${first}` : ""}. Here's your caseload at a glance.`,
  "Lead Counselor": (first) => `Welcome back${first ? `, ${first}` : ""}. Here's which counselors and grades need you this week.`,
  // The leaders' Overview lines are the Replit's own: what the screen shows,
  // not a greeting (a principal's dashboard is the school's, not theirs).
  "School Leader": () => "A current view of exploration, planning progress, and student support across the school.",
  "District Leader": () => "How the district's 11 schools are doing on exploration, planning and counseling reach.",
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
const V3_EXTRA: Partial<Record<CounselorRole, RoleMenuItem[]>> = {
  "School Counselor": [{ view: "academics" }, { view: "applications" }, { view: "meetings" }, { view: "financial-aid" }, { view: "time" }],
  "Lead Counselor": [{ view: "academics" }, { view: "applications" }, { view: "meetings" }, { view: "financial-aid" }, { view: "time" }],
  "School Leader": [{ view: "academics" }],
};

// v3 groups the menu (29 Sept 2026, direct ask: "ease of navigation"). A
// flat list of thirteen-plus items made every screen equally loud; the
// groups follow the counselor's own mental model (who, college and career,
// my work, reports), the way Linear and Notion section a long sidebar.
// VIEW_ORDER is the one order every role's v3 menu is sorted into, so
// groups are always contiguous whatever a role's menu holds.
export type NavGroup = "" | "Students" | "College and career" | "Your work" | "Reports" | "Account";
export const VIEW_GROUP: Record<CounselorView, NavGroup> = {
  overview: "", students: "Students", academics: "Students", counselors: "Students", milestones: "Students", "review-queue": "Students",
  applications: "College and career", "financial-aid": "College and career", insights: "College and career",
  meetings: "Your work", time: "Your work", connect: "Your work", productivity: "Your work",
  readiness: "Reports", progress: "Reports", engagement: "Reports", reports: "Reports", schools: "Reports", impact: "Reports", "school-impact": "Reports",
  settings: "Account",
  // School Leader and District Leader (2 Oct 2026).
  "leader-progress": "Students", team: "Students", capacity: "Students",
  postsecondary: "College and career", outcomes: "College and career",
  "school-performance": "Reports", "leader-reports": "Reports", "district-reports": "Reports",
};
const VIEW_ORDER: CounselorView[] = ["overview", "school-performance", "leader-progress", "outcomes", "postsecondary", "team", "capacity", "leader-reports", "district-reports", "schools", "students", "academics", "counselors", "milestones", "review-queue", "applications", "financial-aid", "insights", "meetings", "time", "connect", "productivity", "readiness", "progress", "engagement", "reports", "impact", "school-impact", "settings"];

export function menuForRole(role: CounselorRole | "", version?: string): RoleMenuItem[] {
  const base = ROLE_MENUS[roleOrDefault(role)];
  if (version !== "v3") return base;
  const extra = V3_EXTRA[roleOrDefault(role)] ?? [];
  const all = [...base, ...extra.filter((e) => !base.some((b) => b.view === e.view))];
  return all.sort((a, b) => VIEW_ORDER.indexOf(a.view) - VIEW_ORDER.indexOf(b.view));
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
  ...REFERENCE_VIEWS, "counselors", "readiness", "reports", "schools", "school-impact", "meetings", "financial-aid", "academics", "applications", "time",
  "leader-progress", "postsecondary", "team", "leader-reports",
  "school-performance", "outcomes", "capacity", "district-reports",
];
