"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  Clock,
  ExternalLink,
  Flag,
  KeyRound,
  MapPin,
  MessageCircleQuestion,
  Pin,
  Search,
  ShieldCheck,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { WORLD_COLORS } from "@/components/app/worlds";
import {
  COMMUNITIES,
  EVENTS,
  EVENT_THREADS,
  INSIGHTS,
  OPPORTUNITIES,
  PROS,
  STARTER_PROMPTS,
  THREADS,
  type Community,
  type EventBoard,
  type Insight,
  type Opportunity,
  type Thread,
} from "./data";

// Connect — moderated career Q&A + post-event continuation, built to the
// implementation handoff (v1.0, 22 Aug 2026). This is the P1 FRONTEND surface
// in the production Dreamari shell with labeled mock data.
//
// PROTOTYPE ASSUMPTIONS (the handoff's P0 items are server-side and cannot be
// implemented client-side — per handoff 16.1, hiding a route is not access
// control):
//   - Event entitlement is simulated (EventBoard.entitled); real AccessGrant
//     redemption, revocation, and server-authorized reads are backend work.
//   - Question routing/SLA states are simulated transitions, not a real
//     routing job. Moderation/PII checks here are a client-side ASSIST only
//     (the draft-preserving contact-info nudge from handoff 11.2).
//   - "Add to my Plan" records locally and links to the Plan; the SavedInsight
//     -> Plan action pipe is P2 backend work.
// Open policy decisions (handoff 26) taken as safe defaults here: students
// display as grade band ONLY everywhere; event tokens single-use;
// peer perspectives enabled with explicit labeling.
//
// Design authority (handoff 20): Dreamari shell + tokens only. Community
// identity = small world-colored icon tile (no emoji identity, no stock
// photos, no gradients per card). Status = text + color, never color alone.

// ——— status vocabulary (handoff 11.3 / 8.4): text plus color ———
const STATE_LABEL: Record<Thread["state"], string> = {
  awaiting: "Awaiting answer",
  routed: "Routed",
  answered: "Pro answered",
  resolved: "Resolved",
};
const STATE_COLOR: Record<Thread["state"], string> = {
  awaiting: "var(--muted-foreground)",
  routed: "var(--accent-subtle)",
  answered: "var(--world-food-farming-nature)",
  resolved: "var(--world-food-farming-nature)",
};
// warm event accent (handoff 20): the theme-aware gold
const EVENT_ACCENT = "var(--chart-3)";

type View =
  | { kind: "home"; tab: "foryou" | "communities" | "events" | "saved" }
  | { kind: "board"; id: string; filter: string }
  | { kind: "event"; id: string; filter: string }
  | { kind: "thread"; id: string };

function viewToQuery(view: View): string {
  if (view.kind === "home") return view.tab === "foryou" ? "" : `?tab=${view.tab}`;
  if (view.kind === "board") return `?board=${view.id}${view.filter !== "all" ? `&filter=${view.filter}` : ""}`;
  if (view.kind === "event") return `?event=${view.id}${view.filter !== "all" ? `&filter=${view.filter}` : ""}`;
  return `?thread=${view.id}`;
}

function queryToView(search: string): View {
  const q = new URLSearchParams(search);
  if (q.get("thread")) return { kind: "thread", id: q.get("thread")! };
  if (q.get("event")) return { kind: "event", id: q.get("event")!, filter: q.get("filter") ?? "all" };
  if (q.get("board")) return { kind: "board", id: q.get("board")!, filter: q.get("filter") ?? "all" };
  const tab = q.get("tab");
  return { kind: "home", tab: tab === "communities" || tab === "events" || tab === "saved" ? tab : "foryou" };
}

const ALL_THREADS = [...THREADS, ...EVENT_THREADS];

function proById(id: string) {
  return PROS.find((p) => p.id === id)!;
}

function eventById(id: string) {
  return EVENTS.find((e) => e.id === id);
}

function communityById(id: string) {
  return COMMUNITIES.find((c) => c.id === id);
}

// ——— For You feed: a fixed, hand-picked mix — answered questions, a
// volunteer insight, one thing trending in a board the student hasn't
// joined — read as posts (Twitter/Reddit-shaped, not Reddit-dense): an
// avatar+name header, the post text, a like/comment stat row. Community
// content only (Events stays its own surface). Insights have no standalone
// page in this prototype (they only ever live inside a board feed), so an
// insight card opens its board; a question card opens the thread.
type FeedItem = {
  key: string;
  target: { kind: "thread"; id: string } | { kind: "board"; id: string };
  authorName: string;
  verified: boolean;
  tag?: string; // "Trending in X" — only when discovery framing applies
  tagColor?: string;
  byline: string; // org/board + time, one short line under the name
  title: string;
  likes: number;
  comments: number;
};

const FEED_THREAD_IDS = ["t-cs-degree", "t-nurse-shadow", "t-ib-hours", "t-ds-vs-ai"] as const;
const FEED_INSIGHT_IDS = ["i-first-internship", "i-day-in-life"] as const;

function buildFeed(joined: Record<string, boolean>): FeedItem[] {
  const items: FeedItem[] = [];
  for (const id of FEED_THREAD_IDS) {
    const t = THREADS.find((x) => x.id === id);
    if (!t) continue;
    const answer = t.responses.find((r) => r.kind === "answer");
    const board = communityById(t.boardId);
    const isJoined = joined[t.boardId];
    const boardName = board?.name ?? "a community";
    if (answer && answer.kind === "answer") {
      const pro = proById(answer.proId);
      items.push({
        key: t.id, target: { kind: "thread", id: t.id }, authorName: pro.name, verified: true,
        tag: !isJoined ? `Trending in ${boardName}` : undefined, tagColor: "var(--chart-3)",
        byline: `${pro.org} · ${answer.postedAgo}`, title: t.title, likes: t.helpful, comments: t.responses.length,
      });
    } else {
      // Unanswered: the asker (a student handle, never a full name) is the author.
      items.push({
        key: t.id, target: { kind: "thread", id: t.id }, authorName: t.handle, verified: false,
        tag: !isJoined ? `Trending in ${boardName}` : `New in ${boardName}`, tagColor: !isJoined ? "var(--chart-3)" : "var(--accent-subtle)",
        byline: `${t.grade} · ${t.postedAgo}`, title: t.title, likes: t.helpful, comments: t.responses.length,
      });
    }
  }
  for (const id of FEED_INSIGHT_IDS) {
    const i = INSIGHTS.find((x) => x.id === id);
    if (!i) continue;
    const pro = proById(i.proId);
    items.push({
      key: i.id, target: { kind: "board", id: i.boardId }, authorName: pro.name, verified: true,
      byline: `${pro.org} · ${i.postedAgo}`, title: i.title, likes: i.helpful, comments: 0,
    });
  }
  // A fixed interleave reads less like two lists stapled together.
  const order = ["t-cs-degree", "i-first-internship", "t-nurse-shadow", "t-ib-hours", "i-day-in-life", "t-ds-vs-ai"];
  return items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

function FeedRow({ item, onOpen }: { item: FeedItem; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="dm-tap flex w-full cursor-pointer flex-col gap-[10px] rounded-[var(--radius-xl)] border p-[var(--space-4)] text-left" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      {/* Tag sits on its own line above the identity row — beside the name
         it fought long names for space and both wrapped badly. */}
      {item.tag && <span className="text-[10px] font-bold" style={{ color: item.tagColor }}>{item.tag}</span>}
      <div className="flex items-center gap-[10px]">
        <Avatar name={item.authorName} verified={item.verified} size={34} />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{item.authorName}</span>
          <span className="block truncate text-[11px] leading-[14px]" style={{ color: "var(--muted-foreground)" }}>{item.byline}</span>
        </div>
      </div>
      <span className="text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.title}</span>
      <div className="flex items-center gap-[16px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex items-center gap-[5px]"><ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {item.likes}</span>
        {item.comments > 0 && <span className="flex items-center gap-[5px]"><MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden /> {item.comments}</span>}
      </div>
    </button>
  );
}

// ——— tiny shared pieces ———

function StatusChip({ state }: { state: Thread["state"] }) {
  return (
    <span className="inline-flex items-center gap-[5px] text-[11px] leading-[15px] font-semibold" style={{ color: STATE_COLOR[state], fontFamily: "var(--font-body)" }}>
      {state === "awaiting" ? <Clock className="h-3 w-3" aria-hidden /> : state === "routed" ? <ArrowRight className="h-3 w-3" aria-hidden /> : <CheckCircle2 className="h-3 w-3" aria-hidden />}
      {STATE_LABEL[state]}
    </span>
  );
}

// Initials avatar, never a stock photo (handoff 20: "abstract brand asset").
// A verified badge overlaps the corner exactly like the app's other verified
// affordances — a small ShieldCheck on a solid chip, never color alone. Pros
// get the primary-tinted circle; a student handle gets the same shape in a
// quieter, secondary tone so the two read as one family, not two systems.
function Avatar({ name, size = 34, verified }: { name: string; size?: number; verified?: boolean }) {
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="relative inline-flex flex-none" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center rounded-full font-bold"
        style={{
          background: verified ? "var(--primary)" : "var(--secondary)",
          color: verified ? "#FFFFFF" : "var(--foreground)",
          fontSize: size * 0.38,
          fontFamily: "var(--font-body)",
        }}
      >
        {initials}
      </span>
      {verified && (
        <span role="img" aria-label="Verified" className="absolute right-[-2px] bottom-[-2px] flex items-center justify-center rounded-full border-2" style={{ width: size * 0.46, height: size * 0.46, background: "var(--card)", borderColor: "var(--card)" }}>
          <ShieldCheck aria-hidden style={{ width: size * 0.34, height: size * 0.34, color: "var(--accent-subtle)" }} />
        </span>
      )}
    </span>
  );
}

// Student identity: handle + avatar + class year — Twitter-shaped, like the
// marketing site's own Connect chapter — a first-name-only handle, never a
// full/last name or a real photo.
function IdentityBadge({ handle, grade, postedAgo }: { handle: string; grade: string; postedAgo: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <Avatar name={handle} size={34} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>{handle}</span>
        <span className="text-[11px] leading-[14px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{grade} · {postedAgo}</span>
      </div>
    </div>
  );
}

// Volunteer identity: avatar (with the verified checkmark on the badge
// itself, not repeated in text), name, company + role. Nothing else.
function ProBadge({ proId, postedAgo, size = 34 }: { proId: string; postedAgo?: string; size?: number }) {
  const pro = proById(proId);
  return (
    <div className="flex items-center gap-[10px]">
      <Avatar name={pro.name} verified size={size} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>{pro.name}</span>
        <span className="text-[11px] leading-[15px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
          {pro.org} · {pro.role}
          {postedAgo ? ` · ${postedAgo}` : ""}
        </span>
      </div>
    </div>
  );
}

function WorldTile({ world, size = 40 }: { world: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex flex-none items-center justify-center rounded-[var(--radius-md)]"
      style={{ width: size, height: size, background: "color-mix(in srgb, " + (WORLD_COLORS[world] ?? "var(--primary)") + " 18%, transparent)", color: WORLD_COLORS[world] ?? "var(--primary)" }}
    >
      <Users style={{ width: size * 0.45, height: size * 0.45 }} />
    </span>
  );
}

// Three distinct organic blob masks (fractional objectBoundingBox paths, so
// they scale with whatever box they're applied to) — cards read as graphic
// A world-tinted card (same color-mix idiom the hero panels already use).
// No board photography — per the handoff's own imagery direction (section
// 20: "minimal... boards do not need stock photography"; identity is "a
// small icon or abstract brand asset"), the color IS the graphic: a soft
// blurred accent glow (the same .mock-glow idiom ChapterShell already uses
// behind its chapter graphics) sits behind an icon medallion, and every word
// of copy stays on the plain tinted surface for guaranteed legibility.
// Editorial masthead composition: icon + headline on one line (nothing
// floats over the text, so it wraps exactly like normal text always has),
// a hairline rule, then a stat footer with the trailing action at its own
// end. No description sentence — the title and the numbers ARE the content;
// a byline restating "New verified answer · 3h ago" next to a headline that
// already says what the board is about was just noise.
function CommunityCard({
  community,
  trailing,
  onOpen,
}: {
  community: Community;
  trailing?: React.ReactNode;
  onOpen: () => void;
}) {
  const accent = WORLD_COLORS[community.world] ?? "var(--primary)";
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-xl)] border"
      style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 22%, var(--card)) 0%, var(--card) 78%)`, borderColor: "var(--glass-border)" }}
    >
      {/* Ambient color only — blurred and fully behind the content, so it
         never competes for horizontal space or forces a wrap. */}
      <span aria-hidden className="pointer-events-none absolute top-[-30px] right-[-30px] h-[120px] w-[120px] rounded-full blur-[34px]" style={{ background: `color-mix(in srgb, ${accent} 45%, transparent)` }} />

      <button type="button" onClick={onOpen} className="dm-link relative flex w-full cursor-pointer items-center gap-[10px] p-[var(--space-4)] pb-[var(--space-3)] text-left">
        <span aria-hidden className="flex size-8 flex-none items-center justify-center rounded-[var(--radius-md)]" style={{ background: "var(--card)", color: accent }}>
          <Users className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 text-[17px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{community.name}</span>
      </button>

      <div className="relative mx-[var(--space-4)] border-t" style={{ borderColor: "var(--glass-border)" }} />

      <div className="relative flex items-center justify-between gap-[var(--space-3)] p-[var(--space-4)] pt-[var(--space-3)]">
        <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="inline-flex items-center gap-[5px]">
            <Users className="h-3 w-3" aria-hidden style={{ color: accent }} />
            {community.students} students
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <ShieldCheck className="h-3 w-3" aria-hidden style={{ color: accent }} />
            {community.activePros} pros
          </span>
        </span>
        {trailing}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-xl)] border p-[var(--space-5)] ${className}`} style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      {children}
    </div>
  );
}

function PrimaryCta({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dm-solid flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-3)] text-[13px] leading-[18px] font-bold transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] ${className}`}
      style={{ background: "var(--primary)", color: "#FFFFFF", fontFamily: "var(--font-body)" }}
    >
      {children}
    </button>
  );
}

function QuietCta({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dm-quiet flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-3)] text-[13px] leading-[18px] font-semibold ${className}`}
      style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--glass-surface-1)", fontFamily: "var(--font-body)" }}
    >
      {children}
    </button>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[16px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
      {children}
    </h2>
  );
}

// ——— feed cards ———

function QuestionCard({ thread, onOpen, saved, onSave, helpful, onHelpful }: { thread: Thread; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <IdentityBadge handle={thread.handle} grade={thread.grade} postedAgo={thread.postedAgo} />
        <StatusChip state={thread.state} />
      </div>
      <button type="button" onClick={onOpen} className="dm-link mt-[6px] block w-full cursor-pointer text-left">
        <h3 className="text-[15.5px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{thread.title}</h3>
        {thread.context && (
          <p className="mt-[4px] line-clamp-2 text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{thread.context}</p>
        )}
      </button>
      <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
      <div className="mt-[12px] flex items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
        <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Helpful · {thread.helpful + (helpful ? 1 : 0)}
        </button>
        <button type="button" onClick={onSave} aria-pressed={saved} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: saved ? "var(--accent-subtle)" : undefined }}>
          <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saved ? "Saved" : "Save"}
        </button>
        <button type="button" onClick={onOpen} className="dm-link ml-auto flex min-h-[44px] cursor-pointer items-center gap-[3px]" style={{ color: "var(--accent-subtle)" }}>
          Open <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </Card>
  );
}

function InsightCard({ insight, saved, onSave, helpful, onHelpful }: { insight: Insight; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  return (
    <Card>
      {/* Eyebrow sits on its own line, above the name row — inline it fought
         the pro's name/company text for space and both wrapped badly. */}
      <span className="text-[10px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)", fontFamily: "var(--font-body)" }}>Pro insight</span>
      <div className="mt-[8px]"><ProBadge proId={insight.proId} postedAgo={insight.postedAgo} /></div>
      <h3 className="mt-[10px] text-[15.5px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{insight.title}</h3>
      <p className="mt-[4px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{insight.body}</p>
      <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
      <div className="mt-[12px] flex items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
        <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Helpful · {insight.helpful + (helpful ? 1 : 0)}
        </button>
        <button type="button" onClick={onSave} aria-pressed={saved} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: saved ? "var(--accent-subtle)" : undefined }}>
          <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saved ? "Saved" : "Save"}
        </button>
      </div>
    </Card>
  );
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <span className="text-[12px] leading-[16px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>{opp.org}</span>
        <span className="flex-none text-[10px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={{ color: EVENT_ACCENT, fontFamily: "var(--font-body)" }}>{opp.kind}</span>
      </div>
      <h3 className="mt-[6px] text-[15.5px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{opp.title}</h3>
      <p className="mt-[4px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{opp.body}</p>
      <dl className="mt-[10px] flex flex-wrap gap-x-[var(--space-6)] gap-y-[4px] text-[11.5px] leading-[16px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
        <div className="flex items-center gap-[5px]"><dt className="font-bold">Who:</dt><dd>{opp.eligibility}</dd></div>
        <div className="flex items-center gap-[5px]"><MapPin className="h-3 w-3" aria-hidden /><dd>{opp.location}</dd></div>
        <div className="flex items-center gap-[5px]"><dt className="font-bold">Deadline:</dt><dd>{opp.deadline}</dd></div>
      </dl>
      <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
      <div className="mt-[12px] flex items-center justify-between gap-[var(--space-3)]">
        <span className="text-[10.5px] leading-[14px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{opp.verifiedDate} · Source: {opp.sourceLabel}</span>
        {/* External destination, accurately labeled (handoff 14.3 / 21). Real
           URL wiring is backend/partner work — disabled-state until then. */}
        <span className="flex items-center gap-[4px] text-[12px] font-bold" style={{ color: "var(--accent-subtle)", fontFamily: "var(--font-body)" }}>
          {opp.cta} <ExternalLink className="h-3 w-3" aria-hidden />
        </span>
      </div>
    </Card>
  );
}

// ——— filter row (mobile: horizontal scroll with edge cue, never clipped) ———

function FilterRow({ options, active, onPick }: { options: { key: string; label: string }[]; active: string; onPick: (key: string) => void }) {
  return (
    <div className="relative -mx-1">
      <div className="flex gap-[var(--space-2)] overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter feed">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active === option.key}
            onClick={() => onPick(option.key)}
            className="dm-quiet min-h-[44px] flex-none cursor-pointer rounded-[999px] border px-[var(--space-4)] py-[6px] text-[12px] leading-[16px] font-bold whitespace-nowrap"
            style={
              active === option.key
                ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#FFFFFF", fontFamily: "var(--font-body)" }
                : { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }
            }
          >
            {option.label}
          </button>
        ))}
        <span aria-hidden className="w-4 flex-none" />
      </div>
    </div>
  );
}

// ——— the experience ———

export function ConnectExperience() {
  const [view, setViewState] = useState<View>({ kind: "home", tab: "foryou" });
  const [askOpen, setAskOpen] = useState<null | { boardId: string; boardName: string; scope: string }>(null);
  const [codeOpenFor, setCodeOpenFor] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(COMMUNITIES.map((c) => [c.id, c.joined])));
  const [eventJoined, setEventJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.entitled])));
  const [dismissedRecs, setDismissedRecs] = useState<Record<string, boolean>>({});
  const [saves, setSaves] = useState<Record<string, boolean>>({ "t-ib-hours": true, "i-day-in-life": true });
  const [helpfuls, setHelpfuls] = useState<Record<string, boolean>>({});
  const [announce, setAnnounce] = useState("");

  // restore view from URL on mount; keep URL in sync so filters survive
  // reload/share (handoff 8.3). Deliberately an effect, not a lazy useState
  // initializer: window.location.search is only knowable client-side, and
  // reading it during the initial render would mismatch the server-rendered
  // HTML. This IS syncing with an external system (the URL), which is what
  // the set-state-in-effect rule exists to allow.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewState(queryToView(window.location.search));
  }, []);
  const setView = useCallback((next: View) => {
    setViewState(next);
    window.history.replaceState(null, "", "/connect" + viewToQuery(next));
    window.scrollTo(0, 0);
  }, []);

  const say = useCallback((message: string) => {
    setAnnounce(message);
    window.setTimeout(() => setAnnounce(""), 4000);
  }, []);

  const toggleSave = (id: string, what = "insight") => {
    setSaves((s) => {
      const next = { ...s, [id]: !s[id] };
      say(next[id] ? `Saved ${what}. Find it under Saved.` : "Removed from Saved.");
      return next;
    });
  };
  const toggleHelpful = (id: string) => setHelpfuls((h) => ({ ...h, [id]: !h[id] }));

  const openAskFor = (boardId: string) => {
    const event = eventById(boardId);
    if (event) {
      setAskOpen({ boardId, boardName: event.name, scope: "professionals from this event" });
    } else {
      const c = COMMUNITIES.find((x) => x.id === boardId)!;
      setAskOpen({ boardId, boardName: c.name, scope: `verified professionals in ${c.topics[0]}` });
    }
  };

  const cardProps = (id: string) => ({
    saved: !!saves[id],
    onSave: () => toggleSave(id),
    helpful: !!helpfuls[id],
    onHelpful: () => toggleHelpful(id),
  });

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <DesktopNavigation active="Connect" />

      {/* Mobile header (matches Home's pattern) */}
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <div aria-live="polite" className="sr-only">{announce}</div>

      <main className="relative z-10 mx-auto flex w-full max-w-[880px] flex-col gap-[var(--space-8)] px-5 pt-[var(--space-6)] pb-[120px] md:px-8 md:pt-[var(--space-10)]">
        {view.kind === "home" && (
          <HomeView
            tab={view.tab}
            onTab={(tab) => setView({ kind: "home", tab })}
            joined={joined}
            dismissedRecs={dismissedRecs}
            onDismissRec={(id) => setDismissedRecs((d) => ({ ...d, [id]: true }))}
            onJoin={(id) => {
              setJoined((j) => ({ ...j, [id]: true }));
              say("Joined. You'll see new answers here and under For You.");
            }}
            eventJoined={eventJoined}
            saves={saves}
            onOpenBoard={(id) => setView({ kind: "board", id, filter: "all" })}
            onOpenEvent={(id) => setView({ kind: "event", id, filter: "all" })}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onAsk={() => openAskFor(COMMUNITIES.find((c) => joined[c.id])?.id ?? COMMUNITIES[0].id)}
            onEnterCode={(id) => setCodeOpenFor(id)}
          />
        )}

        {view.kind === "board" && (
          <BoardView
            community={COMMUNITIES.find((c) => c.id === view.id)!}
            filter={view.filter}
            joined={!!joined[view.id]}
            onJoin={() => {
              setJoined((j) => ({ ...j, [view.id]: true }));
              say("Joined this community.");
            }}
            onFilter={(filter) => setView({ kind: "board", id: view.id, filter })}
            onBack={() => setView({ kind: "home", tab: "foryou" })}
            onAsk={() => openAskFor(view.id)}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            cardProps={cardProps}
          />
        )}

        {view.kind === "event" &&
          (() => {
            const event = eventById(view.id);
            if (!event) return null;
            if (eventJoined[event.id]) {
              return (
                <EventView
                  event={event}
                  filter={view.filter}
                  onFilter={(filter) => setView({ kind: "event", id: event.id, filter })}
                  onBack={() => setView({ kind: "home", tab: "foryou" })}
                  onAsk={() => openAskFor(event.id)}
                  onOpenThread={(id) => setView({ kind: "thread", id })}
                  onSaveTakeaway={() => toggleSave("recap-" + event.id, "takeaway")}
                  takeawaySaved={!!saves["recap-" + event.id]}
                  onAddToPlan={() => say("Added to your Plan as a next action.")}
                  cardProps={cardProps}
                />
              );
            }
            if (event.lifecycle === "Upcoming") {
              return (
                <Card>
                  <h2 className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{event.name}</h2>
                  <p className="mt-[6px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>Discussion opens after the event, on {event.date}.</p>
                </Card>
              );
            }
            return (
              /* Server-side entitlement is the real gate (handoff 16.1); this
                 client fallback only explains the safe route in. */
              <Card>
                <h2 className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Attendees only</h2>
                <div className="mt-[12px]"><QuietCta onClick={() => setCodeOpenFor(event.id)}><KeyRound className="h-4 w-4" aria-hidden /> Enter event code</QuietCta></div>
              </Card>
            );
          })()}

        {view.kind === "thread" && (
          <ThreadView
            thread={ALL_THREADS.find((t) => t.id === view.id)!}
            onBack={() => {
              const t = ALL_THREADS.find((x) => x.id === view.id)!;
              setView(eventById(t.boardId) ? { kind: "event", id: t.boardId, filter: "all" } : { kind: "board", id: t.boardId, filter: "all" });
            }}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onAddToPlan={() => say("Added to your Plan as a next action.")}
            cardProps={cardProps}
            saves={saves}
            toggleSave={toggleSave}
            helpfuls={helpfuls}
            toggleHelpful={toggleHelpful}
          />
        )}
      </main>

      {askOpen && <AskSheet board={askOpen} onClose={() => setAskOpen(null)} onChangeBoard={(id) => openAskFor(id)} joined={joined} />}
      {codeOpenFor && (
        <EventCodeSheet
          event={eventById(codeOpenFor)!}
          onClose={() => setCodeOpenFor(null)}
          onRedeemed={() => {
            const id = codeOpenFor;
            setEventJoined((j) => ({ ...j, [id]: true }));
            setCodeOpenFor(null);
            setView({ kind: "event", id, filter: "all" });
            say("Event board unlocked. It stays under Your events — no code needed next time.");
          }}
        />
      )}

      <MobileNav active="Connect" />
    </div>
  );
}

// ——— Connect home (return-first, handoff 7) ———

function HomeView({
  tab,
  onTab,
  joined,
  dismissedRecs,
  onDismissRec,
  onJoin,
  eventJoined,
  saves,
  onOpenBoard,
  onOpenEvent,
  onOpenThread,
  onAsk,
  onEnterCode,
}: {
  tab: "foryou" | "communities" | "events" | "saved";
  onTab: (tab: "foryou" | "communities" | "events" | "saved") => void;
  joined: Record<string, boolean>;
  dismissedRecs: Record<string, boolean>;
  onDismissRec: (id: string) => void;
  onJoin: (id: string) => void;
  eventJoined: Record<string, boolean>;
  saves: Record<string, boolean>;
  onOpenBoard: (id: string) => void;
  onOpenEvent: (id: string) => void;
  onOpenThread: (id: string) => void;
  onAsk: () => void;
  onEnterCode: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const myCommunities = COMMUNITIES.filter((c) => joined[c.id]);
  const recommended = COMMUNITIES.filter((c) => !joined[c.id] && c.recommendedBecause && !dismissedRecs[c.id]).slice(0, 3);
  const savedThreads = ALL_THREADS.filter((t) => saves[t.id]);
  const savedInsights = INSIGHTS.filter((i) => saves[i.id]);
  const searched = COMMUNITIES.filter((c) => !query || (c.name + " " + c.purpose + " " + c.topics.join(" ")).toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div>
        <h1 className="text-[28px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Connect</h1>
        <p className="mt-[4px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Ask real people about careers you are exploring.</p>
        {/* Enter-event-code lives only where event cards do (the Events tab)
           — it doesn't need a permanent slot next to the primary action on
           every tab when most sessions have no code to redeem. */}
        <div className="mt-[var(--space-5)]">
          <PrimaryCta onClick={onAsk}><MessageCircleQuestion className="h-4 w-4" aria-hidden /> Ask a question</PrimaryCta>
        </div>
      </div>

      <FilterRow
        options={[
          { key: "foryou", label: "For You" },
          { key: "communities", label: "Communities" },
          { key: "events", label: "Events" },
          { key: "saved", label: "Saved" },
        ]}
        active={tab}
        onPick={(key) => onTab(key as "foryou")}
      />

      {/* For You is just a feed — a question, an insight, something trending
         in a board you haven't joined, nothing to read beyond the posts
         themselves. No section headers, no status explainers. */}
      {tab === "foryou" && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Feed">
          {buildFeed(joined).map((item) => (
            <FeedRow key={item.key} item={item} onOpen={() => (item.target.kind === "thread" ? onOpenThread(item.target.id) : onOpenBoard(item.target.id))} />
          ))}
        </section>
      )}

      {tab === "communities" && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Your communities">
          <SectionHead>Your communities</SectionHead>
          {myCommunities.map((c) => (
            <CommunityRow key={c.id} community={c} joined onOpen={() => onOpenBoard(c.id)} />
          ))}
          {myCommunities.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>You haven&apos;t joined a community yet — start with one below.</p>
          )}
        </section>
      )}

      {tab === "communities" && recommended.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Recommended communities">
          <SectionHead>Recommended for you</SectionHead>
          {recommended.map((c) => (
            <CommunityRow key={c.id} community={c} joined={false} onOpen={() => onOpenBoard(c.id)} onJoin={() => onJoin(c.id)} onDismiss={() => onDismissRec(c.id)} />
          ))}
        </section>
      )}

      {tab === "communities" && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Browse all communities">
          <SectionHead>Browse all</SectionHead>
          <label className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[10px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
            <Search className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            <span className="sr-only">Search communities</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities and topics"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
              style={{ color: "var(--foreground)" }}
            />
          </label>
          {searched.filter((c) => !joined[c.id]).map((c) => (
            <CommunityRow key={c.id} community={c} joined={false} onOpen={() => onOpenBoard(c.id)} onJoin={() => onJoin(c.id)} />
          ))}
        </section>
      )}

      {tab === "events" && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Your events">
          <SectionHead>Your events</SectionHead>
          {EVENTS.map((event) =>
            eventJoined[event.id] ? (
              <button key={event.id} type="button" onClick={() => onOpenEvent(event.id)} className="dm-tap cursor-pointer rounded-[var(--radius-xl)] border p-[var(--space-5)] text-left" style={{ background: "var(--card)", borderColor: "color-mix(in srgb, " + EVENT_ACCENT + " 40%, var(--glass-border))" }}>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: EVENT_ACCENT }}>Active follow-up</span>
                <span className="mt-[3px] block text-[16px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{event.name}</span>
                <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{event.date} · {event.host}</span>
              </button>
            ) : event.lifecycle === "Upcoming" ? (
              <div key={event.id} className="rounded-[var(--radius-xl)] border p-[var(--space-5)] opacity-70" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
                <span className="flex items-center gap-[5px] text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
                  <Clock className="h-3 w-3" aria-hidden /> Upcoming · {event.date}
                </span>
                <span className="mt-[3px] block text-[16px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{event.name}</span>
                <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{event.host}</span>
                <p className="mt-[8px] text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Discussion opens after the event.</p>
              </div>
            ) : (
              <Card key={event.id}>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: EVENT_ACCENT }}>Active follow-up</span>
                <p className="mt-[3px] text-[16px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{event.name}</p>
                <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{event.date} · {event.host}</p>
                <div className="mt-[10px]"><QuietCta onClick={() => onEnterCode(event.id)}><KeyRound className="h-4 w-4" aria-hidden /> Enter event code</QuietCta></div>
              </Card>
            )
          )}
        </section>
      )}

      {tab === "saved" && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Saved">
          <SectionHead>Saved</SectionHead>
          <p className="text-[11.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Private to you unless you choose to share it.</p>
          {savedThreads.map((t) => (
            <button key={t.id} type="button" onClick={() => onOpenThread(t.id)} className="dm-tap flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-xl)] border p-[var(--space-4)] text-left" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <span className="min-w-0 truncate text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{t.title}</span>
              <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            </button>
          ))}
          {savedInsights.map((i) => (
            <div key={i.id} className="rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>Pro insight</span>
              <p className="mt-[2px] text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{i.title}</p>
            </div>
          ))}
          {savedThreads.length === 0 && savedInsights.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet. Tap Save on any answer or insight worth keeping.</p>
          )}
        </section>
      )}
    </>
  );
}

function CommunityRow({ community, joined, onOpen, onJoin, onDismiss }: { community: Community; joined: boolean; onOpen: () => void; onJoin?: () => void; onDismiss?: () => void }) {
  const trailing = joined ? (
    community.unreadAnswers > 0 ? (
      <span className="flex-none rounded-full px-[10px] py-[4px] text-[11px] font-bold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
        {community.unreadAnswers} new
      </span>
    ) : (
      <ChevronRight className="h-5 w-5 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
    )
  ) : (
    <span className="flex flex-none flex-col items-end gap-[4px]">
      <button type="button" onClick={onJoin} className="dm-quiet flex min-h-[44px] cursor-pointer items-center rounded-[999px] px-[var(--space-5)] text-[12px] font-bold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
        Join
      </button>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="dm-link cursor-pointer text-[10px] font-semibold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
          Not interested
        </button>
      )}
    </span>
  );
  return <CommunityCard community={community} trailing={trailing} onOpen={onOpen} />;
}

// ——— community board (handoff 8) ———

function BoardView({
  community,
  filter,
  joined,
  onJoin,
  onFilter,
  onBack,
  onAsk,
  onOpenThread,
  cardProps,
}: {
  community: Community;
  filter: string;
  joined: boolean;
  onJoin: () => void;
  onFilter: (f: string) => void;
  onBack: () => void;
  onAsk: () => void;
  onOpenThread: (id: string) => void;
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const threads = THREADS.filter((t) => t.boardId === community.id);
  const insights = INSIGHTS.filter((i) => i.boardId === community.id);
  const opps = OPPORTUNITIES.filter((o) => o.boardId === community.id);
  const showQ = filter === "all" || filter === "questions" || filter === "awaiting" || filter === "answered";
  const filteredThreads = threads.filter((t) => (filter === "awaiting" ? t.state === "awaiting" || t.state === "routed" : filter === "answered" ? t.state === "answered" || t.state === "resolved" : true));

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Connect
      </button>

      <section aria-label="Community overview" className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-start gap-[var(--space-4)]">
          <WorldTile world={community.world} size={52} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{community.name}</h1>
          </div>
          {!joined && (
            <button type="button" onClick={onJoin} className="dm-quiet min-h-[40px] flex-none cursor-pointer rounded-[999px] px-[var(--space-6)] py-[8px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
              Join
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-[var(--space-5)] gap-y-[6px] text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-[5px]"><Users className="h-3.5 w-3.5" aria-hidden /> {community.students} students</span>
          <span className="flex items-center gap-[5px]"><ShieldCheck className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--accent-subtle)" }} /> {community.activePros} pros</span>
          {joined && <span style={{ color: "var(--world-food-farming-nature)" }}>Joined</span>}
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          {community.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="rounded-[999px] border px-[10px] py-[3px] text-[11px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)", background: "var(--glass-surface-1)" }}>{topic}</span>
          ))}
          {community.topics.length > 3 && <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>+{community.topics.length - 3} more</span>}
        </div>
        <PrimaryCta onClick={onAsk} className="w-full sm:w-fit"><MessageCircleQuestion className="h-4 w-4" aria-hidden /> Ask a question</PrimaryCta>
      </section>

      <FilterRow
        options={[
          { key: "all", label: "All" },
          { key: "questions", label: "Questions" },
          { key: "insights", label: "Professional insights" },
          { key: "opportunities", label: "Opportunities" },
          { key: "awaiting", label: "Awaiting answer" },
          { key: "answered", label: "Answered" },
        ]}
        active={filter}
        onPick={onFilter}
      />

      <div className="flex flex-col gap-[var(--space-4)]">
        {showQ &&
          filteredThreads.map((t) => <QuestionCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} {...cardProps(t.id)} />)}
        {(filter === "all" || filter === "insights") && insights.map((i) => <InsightCard key={i.id} insight={i} {...cardProps(i.id)} />)}
        {(filter === "all" || filter === "opportunities") && opps.map((o) => <OpportunityCard key={o.id} opp={o} />)}
        {showQ && filteredThreads.length === 0 && (
          <Card>
            <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>No questions here yet — yours could be the first.</p>
            <ul className="mt-[8px] flex flex-col gap-[6px]">
              {STARTER_PROMPTS.map((p) => (
                <li key={p} className="text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>&ldquo;{p}&rdquo;</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}

// ——— event board (handoff 10) ———

function EventView({
  event,
  filter,
  onFilter,
  onBack,
  onAsk,
  onOpenThread,
  onSaveTakeaway,
  takeawaySaved,
  onAddToPlan,
  cardProps,
}: {
  event: EventBoard;
  filter: string;
  onFilter: (f: string) => void;
  onBack: () => void;
  onAsk: () => void;
  onOpenThread: (id: string) => void;
  onSaveTakeaway: () => void;
  takeawaySaved: boolean;
  onAddToPlan: () => void;
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const opps = OPPORTUNITIES.filter((o) => o.boardId === event.id);
  const threads = EVENT_THREADS.filter((t) => t.boardId === event.id);
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Connect
      </button>

      <section aria-label="Event context" className="rounded-[var(--radius-2xl)] border p-[var(--space-6)]" style={{ background: "color-mix(in srgb, " + EVENT_ACCENT + " 8%, var(--glass-surface-1))", borderColor: "color-mix(in srgb, " + EVENT_ACCENT + " 40%, var(--glass-border))" }}>
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: EVENT_ACCENT }}>{event.lifecycle}</span>
        <h1 className="mt-[4px] text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{event.name}</h1>
        <p className="mt-[3px] flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[2px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-[5px]"><Calendar className="h-3.5 w-3.5" aria-hidden /> {event.date}</span>
          <span className="flex items-center gap-[5px]"><MapPin className="h-3.5 w-3.5" aria-hidden /> {event.location}</span>
          <span>Hosted by {event.host}</span>
        </p>
        <p className="mt-[8px] flex items-center gap-[5px] text-[12px] leading-[17px] font-semibold" style={{ color: "var(--foreground)" }}>
          <ShieldCheck className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: EVENT_ACCENT }} /> Attendees + event pros only
        </p>
        <div className="mt-[var(--space-4)]"><PrimaryCta onClick={onAsk}><MessageCircleQuestion className="h-4 w-4" aria-hidden /> Ask what you missed</PrimaryCta></div>
      </section>

      {/* Pinned host recap with three takeaways (handoff 10.3) */}
      {event.recap && (
        <Card>
          <span className="flex items-center gap-[6px] text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            <Pin className="h-3.5 w-3.5" aria-hidden /> Pinned recap
          </span>
          <div className="mt-[8px]"><ProBadge proId={event.recap.proId} postedAgo={event.recap.postedAgo} /></div>
          <p className="mt-[8px] text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>Great meeting everyone. Three things I hope you remember:</p>
          <ol className="mt-[6px] flex list-decimal flex-col gap-[6px] pl-5">
            {event.recap.takeaways.map((t) => (
              <li key={t} className="text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}>{t}</li>
            ))}
          </ol>
          <div className="mt-[10px] flex flex-wrap gap-[var(--space-3)]">
            <QuietCta onClick={onSaveTakeaway}><Bookmark className="h-4 w-4" aria-hidden /> {takeawaySaved ? "Takeaway saved" : "Save a takeaway"}</QuietCta>
            <QuietCta onClick={onAddToPlan}><ArrowRight className="h-4 w-4" aria-hidden /> Add to my Plan</QuietCta>
          </div>
        </Card>
      )}

      {/* Resources: View resource, never Apply now (handoff 10.3) */}
      {event.resources && event.resources.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Event resources">
          <SectionHead>Resources from the event</SectionHead>
          {event.resources.map((r) => (
            <div key={r.title} className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <div className="min-w-0">
                <p className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</p>
                <p className="mt-[2px] text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{r.description} · {r.sourceLabel}</p>
              </div>
              <span className="flex flex-none items-center gap-[4px] text-[12px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                View resource <ExternalLink className="h-3 w-3" aria-hidden />
              </span>
            </div>
          ))}
        </section>
      )}

      <FilterRow
        options={[
          { key: "all", label: "All" },
          { key: "questions", label: "Questions" },
          { key: "insights", label: "Professional insights" },
          { key: "opportunities", label: "Opportunities" },
        ]}
        active={filter}
        onPick={onFilter}
      />

      <div className="flex flex-col gap-[var(--space-4)]">
        {(filter === "all" || filter === "questions") &&
          threads.map((t) => <QuestionCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} {...cardProps(t.id)} />)}
        {(filter === "all" || filter === "opportunities") && opps.map((o) => <OpportunityCard key={o.id} opp={o} />)}
        {filter === "insights" && (
          <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Professional insights from this event will appear here after the answer round.</p>
        )}
      </div>
    </>
  );
}

// ——— thread (handoff 12) ———

function ThreadView({
  thread,
  onBack,
  onOpenThread,
  onAddToPlan,
  cardProps,
  saves,
  toggleSave,
  helpfuls,
  toggleHelpful,
}: {
  thread: Thread;
  onBack: () => void;
  onOpenThread: (id: string) => void;
  onAddToPlan: () => void;
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
  saves: Record<string, boolean>;
  toggleSave: (id: string, what?: string) => void;
  helpfuls: Record<string, boolean>;
  toggleHelpful: (id: string) => void;
}) {
  const boardName = eventById(thread.boardId)?.name ?? COMMUNITIES.find((c) => c.id === thread.boardId)?.name ?? "Community";
  const related = ALL_THREADS.filter((t) => t.boardId === thread.boardId && t.id !== thread.id && (t.state === "answered" || t.state === "resolved")).slice(0, 2);
  const answered = thread.responses.some((r) => r.kind === "answer");
  const p = cardProps(thread.id);

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> {boardName}
      </button>

      <article className="flex flex-col gap-[var(--space-4)]">
        <div>
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Question</span>
          <h1 className="mt-[3px] text-[20px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{thread.title}</h1>
          {thread.context && <p className="mt-[6px] text-[13.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{thread.context}</p>}
          <div className="mt-[10px]"><IdentityBadge handle={thread.handle} grade={thread.grade} postedAgo={thread.postedAgo} /></div>
        </div>

        <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-[11.5px] leading-[16px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          <StatusChip state={thread.state} />
          {!answered && <span aria-hidden>·</span>}
          {!answered && <span>Routed to {thread.routedScope.toLowerCase()}</span>}
          <span aria-hidden>·</span>
          <span>Shown as {thread.handle} · {thread.grade}</span>
        </div>

        {thread.responses.map((r, index) => {
          if (r.kind === "answer") {
            const rid = thread.id + "-a" + index;
            return (
              <div key={rid} className="rounded-[var(--radius-xl)] border p-[var(--space-5)]" style={{ background: "var(--card)", borderColor: r.primary ? "color-mix(in srgb, var(--world-food-farming-nature) 50%, var(--glass-border))" : "var(--glass-border)" }}>
                <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
                  <ProBadge proId={r.proId} postedAgo={r.postedAgo} />
                  {r.primary && (
                    <span className="flex-none rounded-[999px] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] uppercase" style={{ background: "color-mix(in srgb, var(--world-food-farming-nature) 18%, transparent)", color: "var(--world-food-farming-nature)" }}>
                      Primary answer
                    </span>
                  )}
                </div>
                <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
                <p className="mt-[12px] text-[13.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
                {r.disclosure && (
                  <p className="mt-[8px] text-[11px] leading-[15px] italic" style={{ color: "var(--muted-foreground)" }}>{r.disclosure}</p>
                )}
                <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
                <div className="mt-[12px] flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <button type="button" onClick={() => toggleHelpful(rid)} aria-pressed={!!helpfuls[rid]} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: helpfuls[rid] ? "var(--accent-subtle)" : undefined }}>
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Helpful
                  </button>
                  <button type="button" onClick={() => toggleSave(rid, "answer")} aria-pressed={!!saves[rid]} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: saves[rid] ? "var(--accent-subtle)" : undefined }}>
                    <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saves[rid] ? "Saved" : "Save insight"}
                  </button>
                  <button type="button" onClick={onAddToPlan} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden /> Add to Plan
                  </button>
                  <button type="button" className="dm-link ml-auto flex min-h-[44px] cursor-pointer items-center gap-[5px]">
                    <Flag className="h-3.5 w-3.5" aria-hidden /> Report
                  </button>
                </div>
              </div>
            );
          }
          if (r.kind === "followup") {
            return (
              <div key={thread.id + "-f" + index} className="ml-[var(--space-6)] flex flex-col gap-[3px] rounded-[var(--radius-lg)] p-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
                <span className="flex items-center gap-[5px] text-[11px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                  <CornerDownRight className="h-3 w-3" aria-hidden /> Follow-up · {r.postedAgo}
                </span>
                <p className="text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
              </div>
            );
          }
          return (
            <div key={thread.id + "-p" + index} className="rounded-[var(--radius-lg)] p-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
              <span className="text-[10px] font-bold tracking-[0.05em] uppercase" style={{ color: EVENT_ACCENT }}>Peer · {r.handle} · {r.grade} · {r.postedAgo}</span>
              <p className="mt-[3px] text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
            </div>
          );
        })}

        {thread.responses.length === 0 && (
          <Card>
            <p className="text-[13px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>No answer yet — we&apos;ll notify you.</p>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <button type="button" onClick={p.onHelpful} aria-pressed={p.helpful} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: p.helpful ? "var(--accent-subtle)" : undefined }}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Helpful · {thread.helpful + (p.helpful ? 1 : 0)}
          </button>
          <button type="button" onClick={p.onSave} aria-pressed={p.saved} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: p.saved ? "var(--accent-subtle)" : undefined }}>
            <Bookmark className="h-3.5 w-3.5" aria-hidden /> {p.saved ? "Saved" : "Save"}
          </button>
          <button type="button" className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]">
            <Flag className="h-3.5 w-3.5" aria-hidden /> Report
          </button>
        </div>

        {related.length > 0 && (
          <section className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }} aria-label="Related answered questions">
            <SectionHead>Related answered questions</SectionHead>
            {related.map((t) => (
              <button key={t.id} type="button" onClick={() => onOpenThread(t.id)} className="dm-quiet flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
                <span className="min-w-0 truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{t.title}</span>
                <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </section>
        )}
      </article>
    </>
  );
}

// ——— Ask flow (handoff 11) ———

const CONTACT_PATTERN = /(\b[\w.+-]+@[\w-]+\.[\w.]+\b)|(\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b)|(@[a-z0-9_.]{3,}\b)|(\bsnap(chat)?\b|\binsta(gram)?\b|\bdiscord\b)/i;

function AskSheet({ board, onClose, onChangeBoard, joined }: { board: { boardId: string; boardName: string; scope: string }; onClose: () => void; onChangeBoard: (id: string) => void; joined: Record<string, boolean> }) {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [who, setWho] = useState("any");
  const [agreed, setAgreed] = useState(false);
  const [changing, setChanging] = useState(false);
  const [submitted, setSubmitted] = useState<null | "review" | "routed">(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.querySelector("textarea")?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // PII assist (handoff 11.2): flag contact info, preserve the draft
  const pii = CONTACT_PATTERN.test(question) || CONTACT_PATTERN.test(context);
  const tooShort = question.trim().length > 0 && question.trim().length < 20;
  const valid = question.trim().length >= 20 && question.length <= 180 && !pii && agreed;

  const submit = () => {
    if (!valid) return;
    setSubmitted("review");
    window.setTimeout(() => setSubmitted("routed"), 1600);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Ask a question">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.55)" }} />
      <div ref={dialogRef} className="relative z-[1] max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[var(--radius-2xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-2xl)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
        {submitted ? (
          <div aria-live="polite">
            <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {submitted === "review" ? "Being checked before it appears" : "Sent to verified professionals"}
            </h2>
            <div className="mt-[10px] flex items-center gap-[6px] text-[12.5px] font-bold" style={{ color: submitted === "routed" ? "var(--world-food-farming-nature)" : "var(--muted-foreground)" }}>
              {submitted === "routed" ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Clock className="h-4 w-4" aria-hidden />}
              {submitted === "review" ? "Quick safety check in progress" : `Routed to ${board.scope}`}
            </div>
            <ul className="mt-[12px] flex flex-col gap-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
              <li>Editable for 15 min</li>
              <li>We&apos;ll notify you when answered</li>
            </ul>
            <div className="mt-[var(--space-5)]"><PrimaryCta onClick={onClose} className="w-full">Done</PrimaryCta></div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Ask a question</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--border)" }}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Posting-to lock with Change (handoff 11.1) */}
            <div className="mt-[var(--space-4)] flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-3)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                Posting to <strong style={{ color: "var(--foreground)" }}>{board.boardName}</strong>
              </span>
              <button type="button" onClick={() => setChanging((c) => !c)} className="dm-link cursor-pointer text-[12px] font-bold" style={{ color: "var(--accent-subtle)" }}>Change</button>
            </div>
            {changing && (
              <div className="mt-[6px] flex flex-col gap-[4px]">
                {COMMUNITIES.filter((c) => joined[c.id]).map((c) => (
                  <button key={c.id} type="button" onClick={() => { onChangeBoard(c.id); setChanging(false); }} className="dm-quiet cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[8px] text-left text-[13px] font-semibold hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]" style={{ color: "var(--foreground)" }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <label className="mt-[var(--space-4)] block">
              <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Your question</span>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 180))}
                rows={2}
                placeholder="Ask it like you'd ask a person."
                className="mt-[4px] w-full resize-none rounded-[var(--radius-lg)] border bg-transparent p-[var(--space-3)] text-[14px] leading-[20px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                aria-describedby="q-count"
              />
              <span id="q-count" className="text-[11px]" style={{ color: tooShort ? EVENT_ACCENT : "var(--muted-foreground)" }}>
                {tooShort ? "20+ characters" : `${question.length}/180`}
              </span>
            </label>

            <label className="mt-[var(--space-3)] block">
              <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Context <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>(optional)</span></span>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value.slice(0, 600))}
                rows={3}
                className="mt-[4px] w-full resize-none rounded-[var(--radius-lg)] border bg-transparent p-[var(--space-3)] text-[13px] leading-[19px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                aria-label="Context"
              />
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{context.length}/600</span>
            </label>

            {pii && (
              <p role="alert" className="mt-[8px] rounded-[var(--radius-md)] border p-[var(--space-3)] text-[12px] leading-[17px] font-semibold" style={{ borderColor: "color-mix(in srgb, " + EVENT_ACCENT + " 50%, transparent)", color: EVENT_ACCENT, background: "color-mix(in srgb, " + EVENT_ACCENT + " 8%, transparent)" }}>
                Please remove personal contact information (emails, phone numbers, social handles). Your draft is safe — just edit it above.
              </p>
            )}

            <fieldset className="mt-[var(--space-4)]">
              <legend className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Who should answer?</legend>
              <div className="mt-[6px] flex flex-wrap gap-[var(--space-2)]">
                {[
                  { key: "any", label: "Any verified professional" },
                  { key: "topic", label: board.scope.replace("verified professionals in ", "") },
                ].map((o) => (
                  <button key={o.key} type="button" onClick={() => setWho(o.key)} aria-pressed={who === o.key} className="dm-quiet min-h-[44px] cursor-pointer rounded-[999px] border px-[var(--space-4)] py-[6px] text-[12px] font-bold" style={who === o.key ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#FFFFFF" } : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <p className="mt-[var(--space-4)] text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
              Posts as <strong style={{ color: "var(--foreground)" }}>Jordan · Junior</strong>. Routed to {board.scope}.
            </p>

            <label className="dm-link mt-[var(--space-3)] flex cursor-pointer items-start gap-[var(--space-3)]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-[2px] size-4 accent-[var(--primary)]" />
              <span className="text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
                I&apos;ll keep it kind and won&apos;t share personal contact details. <span className="font-bold" style={{ color: "var(--accent-subtle)" }}>Community Rules</span>
              </span>
            </label>

            <div className="mt-[var(--space-5)]">
              <PrimaryCta onClick={submit} className={`w-full ${valid ? "" : "pointer-events-none opacity-45"}`}>Submit question</PrimaryCta>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ——— event code redemption (handoff 9) ———

function EventCodeSheet({ event, onClose, onRedeemed }: { event: EventBoard; onClose: () => void; onRedeemed: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const check = () => {
    // Prototype: one demo token per event. Real validation/redemption is
    // server-side (single-use token hashes, throttling, revocation —
    // handoff 9.2).
    if (event.code && code.trim().toUpperCase() === event.code) {
      setError(null);
      setConfirming(true);
    } else {
      // Neutral error: never confirm whether an event exists (handoff 18)
      setAttempts((a) => a + 1);
      setError("That code didn't work. Check it against your badge or follow-up email and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Enter event code">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.55)" }} />
      <div className="relative z-[1] w-full max-w-[480px] rounded-t-[var(--radius-2xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-2xl)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
        {confirming ? (
          <div aria-live="polite">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: EVENT_ACCENT }}>You&apos;re on the list</span>
            <h2 className="mt-[4px] text-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{event.name}</h2>
            <p className="mt-[4px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{event.date} · {event.location} · Hosted by {event.host}</p>
            <p className="mt-[10px] text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}>
              This private board is limited to verified attendees and event professionals. Joining adds it to Your events — you won&apos;t need the code again, and access can be managed by the host.
            </p>
            <div className="mt-[var(--space-5)] flex gap-[var(--space-3)]">
              <PrimaryCta onClick={onRedeemed} className="flex-1">Join event board</PrimaryCta>
              <QuietCta onClick={onClose}>Cancel</QuietCta>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Enter event code</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--border)" }}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-[6px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
              Event codes come from a Dreamari event — on your badge, the closing slide, or the follow-up email. They unlock a private board for attendees.
            </p>
            <label className="mt-[var(--space-4)] block">
              <span className="sr-only">Event code</span>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && check()}
                placeholder={`e.g. ${event.code ?? "EY2026"}`}
                autoCapitalize="characters"
                className="w-full rounded-[var(--radius-lg)] border bg-transparent p-[var(--space-4)] text-center text-[18px] font-bold tracking-[0.2em] uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] placeholder:tracking-normal placeholder:text-[color:var(--muted-foreground)]"
                style={{ borderColor: error ? EVENT_ACCENT : "var(--border)", color: "var(--foreground)" }}
                aria-invalid={!!error}
                aria-describedby={error ? "code-error" : undefined}
              />
            </label>
            {error && (
              <p id="code-error" role="alert" className="mt-[8px] text-[12px] leading-[17px] font-semibold" style={{ color: EVENT_ACCENT }}>
                {error}
                {attempts >= 2 && " Still stuck? Ask the event host or your teacher for a fresh code."}
              </p>
            )}
            <div className="mt-[var(--space-5)]"><PrimaryCta onClick={check} className="w-full">Continue</PrimaryCta></div>
            <p className="mt-[8px] text-center text-[10.5px]" style={{ color: "var(--muted-foreground)" }}>Prototype: use {event.code} to preview the event board.</p>
          </>
        )}
      </div>
    </div>
  );
}
