// Connect Feed ranking (28 Sept 2026, Joshua's 30-person focus group): "when
// a student follows a professional, it is not obvious what happens next" --
// their new answers and posts were buried at the bottom of People or several
// clicks deep. This pure function is the one place that decides what shows
// up and in what order, so it can be reasoned about (and tested) on its own,
// away from the UI that renders it.
//
// One continuous feed, not a For You/Following split: every candidate --
// every answered question, every professional insight post -- gets scored
// on the same scale, so a followed pro's new answer and a broadly popular
// post from someone the student has never heard of can genuinely compete for
// the top slot. What wins is meant to feel like Instagram's home feed: the
// people you follow, the people you clearly like even without following
// them, and what's resonating in your own worlds.
//
// No randomness, no dates, no DOM: the same inputs always produce the same
// order, so a snapshot test can pin this down without mocking anything.

import { INSIGHTS, THREADS, type Insight, type Pro, type ProResponse, type Thread } from "../data";

export type FeedItem =
  | { key: string; kind: "question"; thread: Thread; pro: Pro; reason: string }
  | { key: string; kind: "insight"; insight: Insight; pro: Pro; reason: string };

export interface RankFeedInput {
  /** Every professional in Connect (PROS), so a candidate can resolve its author. */
  pros: Pro[];
  /** Community-board questions to rank; defaults to every seeded thread. */
  threads?: Thread[];
  /** Community-board posts to rank; defaults to every seeded insight. */
  insights?: Insight[];
  /** Who the student follows (Follows: proId -> true). */
  follows: Record<string, boolean>;
  /** The student's own worlds, most relevant first (useStudentWorlds()). */
  worlds: string[];
  /** Community (board) ids the student has joined. */
  joinedCommunityIds: string[];
  /** Thread/insight ids the student has liked (helpful) or saved -- the
   *  signal that they engage with a pro's work even if they haven't
   *  followed them yet. */
  engagedContentIds: Record<string, boolean>;
  /** "See less like this" (28 Sept 2026): pros/boards the student has
   *  session-demoted from a post's overflow menu. This ranks their OTHER
   *  content lower for the rest of the session; the exact post they hid is
   *  a separate, simpler client-side filter (it's just gone, not merely
   *  demoted). */
  demotedProIds?: Set<string>;
  demotedBoardIds?: Set<string>;
  /** How many items to return; the feed doesn't need the whole catalogue on
   *  screen at once. */
  limit?: number;
}

const AGO_UNIT_MINUTES: Record<string, number> = { m: 1, h: 60, d: 1440, w: 10080 };
/** Minutes-ago from the seed data's own display string ("6h ago", "2d ago"),
 *  same approach as the board feed's own Most Recent sort -- there's no real
 *  timestamp in this prototype's data, just this unit string. */
function agoMinutes(postedAgo: string): number {
  const match = /^(\d+)([mhdw])/.exec(postedAgo);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * (AGO_UNIT_MINUTES[match[2]] ?? 1);
}

/** The pro whose answer a question is attributed to: the primary answer, or
 *  the first one, the same preference order the board feed's own snippet
 *  uses. Unanswered questions have nobody to credit, so they never enter the
 *  feed (they still live on their board, waiting). */
function primaryProForThread(t: Thread): string | undefined {
  const primary = t.responses.find((r): r is ProResponse => r.kind === "answer" && !!r.primary);
  if (primary) return primary.proId;
  return t.responses.find((r): r is ProResponse => r.kind === "answer")?.proId;
}

function scoreItem({
  proId,
  boardId,
  postedAgo,
  engagementCount,
  pro,
  follows,
  worlds,
  joinedCommunityIds,
  engagedProIds,
  demotedProIds,
  demotedBoardIds,
}: {
  proId: string;
  boardId: string;
  postedAgo: string;
  /** the seed data's own "helpful" count -- this prototype's stand-in for
   *  broad engagement (likes/answers/opens all roll up into one number). */
  engagementCount: number;
  pro: Pro;
  follows: Record<string, boolean>;
  worlds: string[];
  joinedCommunityIds: string[];
  engagedProIds: Set<string>;
  demotedProIds: Set<string>;
  demotedBoardIds: Set<string>;
}): { score: number; reason: string } {
  const followed = !!follows[proId];
  // A pro the student keeps liking/saving without following yet -- ranked
  // just under an actual follow, never above it.
  const engagedWithPro = !followed && engagedProIds.has(proId);
  const worldMatch = worlds.includes(pro.world);
  const communityMatch = joinedCommunityIds.includes(boardId);
  const recencyMinutes = agoMinutes(postedAgo);
  const popularity = Math.min(engagementCount, 600) / 4;
  const recency = Math.max(0, 200 - recencyMinutes / 20);
  const highEngagement = engagementCount >= 40;

  // Weights, high to low, matching the doc's own priority order: a follow
  // outranks everything: then a pro the student demonstrably engages with;
  // then relevance to their own worlds/communities; then plain popularity
  // and freshness break remaining ties. "See less like this" (28 Sept 2026)
  // subtracts afterward -- a demoted pro/board can still surface (a real
  // follow isn't erased by one session's demotion), just far less often.
  const score =
    (followed ? 1000 : 0) +
    (engagedWithPro ? 600 : 0) +
    (worldMatch ? 300 : 0) +
    (communityMatch ? 150 : 0) +
    popularity +
    recency -
    (demotedProIds.has(proId) ? 700 : 0) -
    (demotedBoardIds.has(boardId) ? 400 : 0);

  const firstName = pro.name.split(" ")[0];
  let reason: string;
  if (followed) reason = `You follow ${firstName}`;
  else if (engagedWithPro) reason = `Because you engage with ${firstName}`;
  else if (worldMatch && highEngagement) reason = `Popular in ${pro.world}`;
  else if (worldMatch) reason = `Because you like ${pro.world}`;
  else if (communityMatch) reason = "From a community you've joined";
  else if (highEngagement) reason = `Popular in ${pro.world}`;
  else reason = "New on Connect";

  return { score, reason };
}

/** The ranked, mixed (questions + posts) feed. Cold state (no follows, no
 *  worlds, no engagement yet) still returns a full feed: with every bonus at
 *  zero, popularity and recency alone still produce a real order, so a
 *  student who follows no one gets recommendations instead of an empty
 *  screen. */
export function rankFeed({
  pros,
  threads = THREADS,
  insights = INSIGHTS,
  follows,
  worlds,
  joinedCommunityIds,
  engagedContentIds,
  demotedProIds = new Set(),
  demotedBoardIds = new Set(),
  limit = 40,
}: RankFeedInput): FeedItem[] {
  const proById = new Map(pros.map((p) => [p.id, p]));

  const engagedProIds = new Set<string>();
  for (const t of threads) {
    if (!engagedContentIds[t.id]) continue;
    const proId = primaryProForThread(t);
    if (proId) engagedProIds.add(proId);
  }
  for (const i of insights) {
    if (engagedContentIds[i.id]) engagedProIds.add(i.proId);
  }

  const scored: (FeedItem & { score: number })[] = [];

  for (const t of threads) {
    const proId = primaryProForThread(t);
    if (!proId) continue;
    const pro = proById.get(proId);
    if (!pro) continue;
    const { score, reason } = scoreItem({ proId, boardId: t.boardId, postedAgo: t.postedAgo, engagementCount: t.helpful, pro, follows, worlds, joinedCommunityIds, engagedProIds, demotedProIds, demotedBoardIds });
    scored.push({ key: `q-${t.id}`, kind: "question", thread: t, pro, reason, score });
  }
  for (const i of insights) {
    const pro = proById.get(i.proId);
    if (!pro) continue;
    const { score, reason } = scoreItem({ proId: i.proId, boardId: i.boardId, postedAgo: i.postedAgo, engagementCount: i.helpful, pro, follows, worlds, joinedCommunityIds, engagedProIds, demotedProIds, demotedBoardIds });
    scored.push({ key: `p-${i.id}`, kind: "insight", insight: i, pro, reason, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) =>
    s.kind === "question"
      ? { key: s.key, kind: "question", thread: s.thread, pro: s.pro, reason: s.reason }
      : { key: s.key, kind: "insight", insight: s.insight, pro: s.pro, reason: s.reason },
  );
}
