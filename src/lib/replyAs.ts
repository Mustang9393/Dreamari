// Who a reply posts as (12 Oct 2026). Connect's thread and post pages post
// replies as the demo student ("Jordan · Junior"). A partner board's
// volunteer or staff view opens the same pages, and a reply from there must
// post as that role, not as a student. The United Way board sets this when
// it hands off to a thread, post or event; Connect clears it on any other
// board or the landing. DEMO-ONLY: the real identity comes from the
// signed-in account.

export type ReplyIdentity = { name: string; chip: string; meta?: string; tone: "pro" | "student" };

let current: ReplyIdentity | null = null;

export function setReplyAs(identity: ReplyIdentity | null) {
  current = identity;
}

/** The identity to post as, or null for the demo student. */
export function replyAs(): ReplyIdentity | null {
  return current;
}
