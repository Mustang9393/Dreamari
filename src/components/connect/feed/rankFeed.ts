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

// ---- the rhythm: regular posts, then one visual moment ----------------------
//
// Joshua, 4 Oct 2026: "the Feed is mostly regular professional answers and
// text posts. Roughly every 3 to 4 regular posts, ONE visual break: a
// graphic post from a professional, OR an opportunity, OR occasionally a
// Dreamari PLAY experience", and "never put multiple visual or promotional
// cards back to back". The goal he named: Twitter's simple hierarchy with
// some of Instagram's visual rhythm, so the pictures give the reader room to
// breathe and the Feed never reads as several products glued together.
//
// rankFeed above still decides WHICH answers and posts a student sees and in
// what order. composeFeed only decides WHERE each kind sits. Slots are fixed
// by position, never by content, so the rhythm holds whatever the ranking
// returns, and a later batch (drawn from a fresh ranking after a follow) can
// carry on from any position without ever putting two visuals side by side.
//
// The first 13 slots are the demo order Joshua asked for, item for item:
// three answers, a graphic post, two answers, a text post, two answers, an
// internship, two answers, a Day in the Life game. After that the plain
// rule: three regular posts, then one visual, rotating graphic, opportunity,
// play. Graphic posts only ever fill visual slots, so they can never land
// next to another visual by accident.

export type FeedVisualKind = "graphic" | "opportunity" | "play";
type Slot = "answer" | "text" | "regular" | FeedVisualKind;

export type FeedEntry =
  | { key: string; kind: "post"; item: FeedItem; visual: boolean }
  | { key: string; kind: "opportunity"; id: string }
  | { key: string; kind: "play"; id: string };

const DEMO_HEAD: Slot[] = ["answer", "answer", "answer", "graphic", "answer", "answer", "text", "answer", "answer", "opportunity", "answer", "answer", "play"];
// DEMO-ONLY: three answers pinned by id inside the demo head (0-based
// positions 8, 10 and 11, so items 9, 11 and 12), because the ranking can
// fill those slots differently from one load to the next and the demo needs
// the first 13 to be the same every time. Production drops this map and
// lets rankFeed fill every slot. A pinned answer is held back from earlier
// slots and, once placed, never repeats later in the Feed.
const DEMO_PINS: Record<number, string> = {
  8: "q-t-fin-networking",
  10: "q-t-banks-need-coders",
  11: "q-t-overheating-laptop",
};
const ROTATION: FeedVisualKind[] = ["graphic", "opportunity", "play"];
/** Regular posts between two visuals once the demo head is done. */
const REGULARS_PER_VISUAL = 3;

/** What sits at a 0-based position in the Feed. */
export function feedSlotAt(position: number): Slot {
  if (position < DEMO_HEAD.length) return DEMO_HEAD[position];
  const p = position - DEMO_HEAD.length;
  const cycle = REGULARS_PER_VISUAL + 1;
  if (p % cycle === REGULARS_PER_VISUAL) return ROTATION[Math.floor(p / cycle) % ROTATION.length];
  return "regular";
}

export const opportunityEntryKey = (id: string) => `opp-${id}`;
export const playEntryKey = (id: string) => `play-${id}`;

/** Lays ranked items into the rhythm. `from` is the position the first
 *  returned entry will take (the count already on screen); `exclude` holds
 *  the keys already on screen, so nothing repeats across batches. A visual
 *  whose pool has run dry hands its slot to the next kind in the rotation,
 *  and when every pool is dry the slot simply takes a regular post: the
 *  rhythm thins out at the very end of the catalogue, it never doubles up.
 *  A visual is only placed while regular posts remain, so the Feed never
 *  ends on two visuals either. */
export function composeFeed({
  ranked,
  opportunityIds,
  playIds,
  from = 0,
  exclude = new Set(),
  limit = Infinity,
}: {
  ranked: FeedItem[];
  /** Opportunities in the order to show them, best fit first. */
  opportunityIds: string[];
  /** Play experiences in the order to show them. */
  playIds: string[];
  from?: number;
  exclude?: Set<string>;
  limit?: number;
}): FeedEntry[] {
  const used = new Set(exclude);
  const isGraphic = (i: FeedItem) => i.kind === "insight" && !!i.insight.graphic;
  // pins still waiting for their own slot are not handed out earlier
  let pos = from;
  const reserved = (key: string) => Object.entries(DEMO_PINS).some(([at, k]) => k === key && Number(at) > pos);
  const next = (pick: (i: FeedItem) => boolean) => ranked.find((i) => !used.has(i.key) && !reserved(i.key) && pick(i));
  const regularsLeft = () => ranked.some((i) => !used.has(i.key) && !isGraphic(i));
  const out: FeedEntry[] = [];

  const takeVisual = (kind: FeedVisualKind): FeedEntry | null => {
    if (kind === "graphic") {
      const g = next(isGraphic);
      return g ? { key: g.key, kind: "post", item: g, visual: true } : null;
    }
    if (kind === "opportunity") {
      const id = opportunityIds.find((x) => !used.has(opportunityEntryKey(x)));
      return id ? { key: opportunityEntryKey(id), kind: "opportunity", id } : null;
    }
    const id = playIds.find((x) => !used.has(playEntryKey(x)));
    return id ? { key: playEntryKey(id), kind: "play", id } : null;
  };

  for (; out.length < limit && regularsLeft(); pos++) {
    const slot = feedSlotAt(pos);
    let entry: FeedEntry | null = null;
    const pinKey = DEMO_PINS[pos];
    const pinned = pinKey && !used.has(pinKey) ? ranked.find((i) => i.key === pinKey) : undefined;
    if (pinned) entry = { key: pinned.key, kind: "post", item: pinned, visual: false };
    if (!entry && (slot === "graphic" || slot === "opportunity" || slot === "play")) {
      const start = ROTATION.indexOf(slot);
      for (let k = 0; k < ROTATION.length && !entry; k++) entry = takeVisual(ROTATION[(start + k) % ROTATION.length]);
    }
    if (!entry) {
      const want = slot === "answer" ? (i: FeedItem) => i.kind === "question" : slot === "text" ? (i: FeedItem) => i.kind === "insight" && !isGraphic(i) : () => false;
      const item = next(want) ?? next((i) => !isGraphic(i));
      if (!item) break;
      entry = { key: item.key, kind: "post", item, visual: false };
    }
    used.add(entry.key);
    out.push(entry);
  }
  return out;
}
