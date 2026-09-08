"use client";

import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { AppBackdrop } from "@/components/app/AppBackdrop";

import Image from "next/image";
import { Children, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { type LucideIcon as ResourceIcon, UserRound } from "lucide-react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  FileText,
  FolderOpen,
  Images,
  Link2,
  Presentation,
  ArrowRight,
  Bookmark,
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  Clock,
  MessagesSquare,
  Sparkles,
  Building2,
  GraduationCap,
  ExternalLink,
  Flag,
  KeyRound,
  Share2,
  LayoutDashboard,
  Pin,
  ShieldCheck,
  ThumbsUp,
  Users,
  X,
  Bell,
  Search,
  QrCode,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { Avatar, COMPANY_BRAND, COMPANY_MARKS, CompanyChip, ConnectNav, CONTACT_INFO, CONTACT_WARNING, LetterMark, ProAvatar, SectionSurface, VerifiedBadge } from "./primitives";
import { Segmented } from "./viz";
import { FollowButton } from "./ProProfile";
import { PeopleTab, PeopleWelcome } from "./PeopleTab";
import { answersBy, NewFromFollowing, Panel, PanelRow, PartnerView, PeopleToFollow, postsBy, ProProfileView, RULE, topicFor, useStudentWorlds, type Follows } from "./ProProfile";
import { ProDashboardView } from "./ProDashboard";
import { CommunityCard, PHOTO_COVER, PHOTO_FOCUS, POSTER_GRAIN, communityAccent } from "./CommunityCard";

// Resource cards on an event board: one icon and one chip per file kind.
const RESOURCE_LOOK: Record<EventResource["kind"], { Icon: ResourceIcon; label: string }> = {
  slides: { Icon: Presentation, label: "Slides" },
  pdf: { Icon: FileText, label: "PDF" },
  reading: { Icon: BookOpen, label: "Reading list" },
  link: { Icon: Link2, label: "Link" },
  folder: { Icon: FolderOpen, label: "Folder" },
};
import { AdminDashboardView } from "./AdminDashboard";
import {
  COMMUNITIES,
  EVENTS,
  EVENT_THREADS,
  INSIGHTS,
  PROS,
  STARTER_PROMPTS,
  THREADS,
  type Community,
  type EventBoard,
  type EventResource,
  type Insight,
  type Thread, type ProResponse, OPPORTUNITIES , type Opportunity, type Pro } from "./data";

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
// Plain English for a 15 year old. "Routed" and "Awaiting answer" were
// moderation-queue words describing what the SYSTEM is doing; a student only
// needs to know whether someone has answered yet, so the two waiting states
// read the same and the difference stays internal.
const STATE_LABEL: Record<Thread["state"], string> = {
  awaiting: "Waiting for an answer",
  routed: "Waiting for an answer",
  answered: "Answered",
  resolved: "Answered",
};
const STATE_COLOR: Record<Thread["state"], string> = {
  awaiting: "var(--muted-foreground)",
  routed: "var(--accent-subtle)",
  answered: "var(--world-food-farming-nature)",
  resolved: "var(--world-food-farming-nature)",
};
// warm event accent (handoff 20): the theme-aware gold
const EVENT_ACCENT = "#f59e0b";

type LandingTab = "communities" | "events" | "people" | "notifications";
type View =
  | { kind: "home"; tab: LandingTab }
  | { kind: "board"; id: string; filter: string }
  | { kind: "pro"; id: string }
  | { kind: "proDashboard"; id: string }
  | { kind: "event"; id: string; filter: string }
  | { kind: "thread"; id: string }
  | { kind: "insight"; id: string }
  | { kind: "saved" }
  | { kind: "followingFeed" }
  | { kind: "activity" }
  | { kind: "admin" }
  | { kind: "partner"; org: string };

function viewToQuery(view: View): string {
  if (view.kind === "saved") return "?saved=1";
  if (view.kind === "followingFeed") return "?following=1";
  if (view.kind === "activity") return "?activity=1";
  if (view.kind === "admin") return "?admin=1";
  if (view.kind === "partner") return `?partner=${encodeURIComponent(view.org)}`;
  if (view.kind === "home") return view.tab === "communities" ? "" : `?tab=${view.tab}`;
  if (view.kind === "board") return `?board=${view.id}${view.filter !== "questions" ? `&filter=${view.filter}` : ""}`;
  if (view.kind === "pro") return `?pro=${view.id}`;
  if (view.kind === "proDashboard") return `?dashboard=${view.id}`;
  if (view.kind === "event") return `?event=${view.id}${view.filter !== "all" ? `&filter=${view.filter}` : ""}`;
  if (view.kind === "insight") return `?insight=${view.id}`;
  return `?thread=${view.id}`;
}

function queryToView(search: string): View {
  const q = new URLSearchParams(search);
  if (q.get("saved")) return { kind: "saved" };
  if (q.get("following")) return { kind: "followingFeed" };
  if (q.get("activity")) return { kind: "activity" };
  if (q.get("admin")) return { kind: "admin" };
  if (q.get("partner")) return { kind: "partner", org: q.get("partner")! };
  if (q.get("insight")) return { kind: "insight", id: q.get("insight")! };
  if (q.get("thread")) return { kind: "thread", id: q.get("thread")! };
  if (q.get("event")) return { kind: "event", id: q.get("event")!, filter: q.get("filter") ?? "questions" };
  if (q.get("board")) return { kind: "board", id: q.get("board")!, filter: q.get("filter") ?? "questions" };
  if (q.get("dashboard")) { const id = q.get("dashboard")!; return { kind: "proDashboard", id: id === "pro" ? "pro-okafor" : id }; }
  if (q.get("pro")) return { kind: "pro", id: q.get("pro")! };
  const tab = q.get("tab");
  return { kind: "home", tab: tab === "events" || tab === "people" || tab === "notifications" ? tab : "communities" };
}

const ALL_THREADS = [...THREADS, ...EVENT_THREADS];

function proById(id: string) {
  return PROS.find((p) => p.id === id)!;
}

// The single line that gives a question row real information scent (direct
// feedback, 8 Sept 2026: a title alone doesn't say whether it's worth a
// click -- Stack Overflow/Quora both solve this with a snippet of the top
// answer). Prefers the primary pro answer; falls back to the asker's own
// elaboration (`context`) when nothing has answered yet, so an unanswered
// question still previews as something specific rather than a bare title.
function questionSnippet(thread: Thread): { by?: string; text: string } | undefined {
  const answer = thread.responses.find((r): r is ProResponse => r.kind === "answer" && !!r.primary) ?? thread.responses.find((r): r is ProResponse => r.kind === "answer");
  if (answer) return { by: proById(answer.proId).name, text: answer.body };
  if (thread.context) return { text: thread.context };
  return undefined;
}

function eventById(id: string) {
  return EVENTS.find((e) => e.id === id);
}

/** Every distinct person who's replied, in the order they first appear --
 *  a follow-up borrows its answer's own pro (same rule ThreadView uses),
 *  so it never double-counts as a second, nameless "responder". */
function responderIdentities(thread: Thread): { name: string; pro?: boolean }[] {
  const seen = new Set<string>();
  const people: { name: string; pro?: boolean }[] = [];
  let lastProId: string | undefined;
  for (const r of thread.responses) {
    if (r.kind === "answer") {
      lastProId = r.proId;
      if (!seen.has(r.proId)) { seen.add(r.proId); people.push({ name: proById(r.proId).name, pro: true }); }
    } else if (r.kind === "peer") {
      if (!seen.has(r.handle)) { seen.add(r.handle); people.push({ name: r.handle }); }
    } else if (r.kind === "followup" && lastProId && !seen.has(lastProId)) {
      seen.add(lastProId);
      people.push({ name: proById(lastProId).name, pro: true });
    }
  }
  return people;
}

/** Who's in this conversation, at a glance -- a small overlapping stack of
 *  faces (Slack thread avatars, a GitHub PR's reviewer stack), tried as an
 *  experiment (direct feedback: "is that a good idea? let's experiment if
 *  yes") alongside the reply count it doesn't replace. A visible ring in
 *  the row's own resting surface color is what makes the overlap read as
 *  a stack instead of avatars just crowded together. */
function ResponderStack({ thread, size = 20, max = 3 }: { thread: Thread; size?: number; max?: number }) {
  const people = responderIdentities(thread).slice(0, max);
  if (people.length === 0) return null;
  return (
    <span className="flex items-center" aria-label={`${people.length === 1 ? "1 person has" : `${people.length} people have`} replied`}>
      {people.map((p, i) => (
        <span key={p.name + i} className="rounded-full" style={{ marginLeft: i === 0 ? 0 : -Math.round(size * 0.38), zIndex: people.length - i, boxShadow: "0 0 0 2px var(--glass-surface-1)" }}>
          <Avatar name={p.name} size={size} />
        </span>
      ))}
    </span>
  );
}

/** The one ask affordance. A box you can type into is an invitation; a button
 *  is a door you have to decide to open. Where the question goes is chosen in
 *  the sheet that opens, so this reads the same on every tab. */
// The doc's composer, one for one: a "What do you want to ask?" field with
// Cancel/Post actions along its bottom edge. (AI Ideas/Polish removed 8 Sept
// 2026 -- no AI integration for now.)
/** Posting happens in place, not in a modal: a collapsed invitation that
 *  expands into a real composer right at the top of the feed. Reading is
 *  free; the first attempt to post in an un-joined community routes
 *  through the join sheet instead (onRequireJoin). */
function InlineAsk({
  joined,
  onRequireJoin,
  onPost,
  placeholder = "Ask a question…",
  accent = "var(--primary)",
}: {
  joined: boolean;
  onRequireJoin?: () => void;
  onPost: (text: string) => void;
  placeholder?: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    dispatchAuroraPulse("cta");
    onPost(text.trim());
    setText("");
    setOpen(false);
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => (joined ? setOpen(true) : onRequireJoin?.())}
        className="dm-tap flex min-h-[52px] w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-left"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
      >
        <Avatar name="Jordan Rivera" size={30} />
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>{placeholder}</span>
        <span className="flex flex-none items-center gap-[5px] rounded-[var(--radius-sm)] px-[14px] py-[7px] text-[12px] leading-[16px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: "var(--foreground)" }}>
          Ask <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
        </span>
      </button>
    );
  }
  return (
    <div className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: "var(--color-glass-surface-3)" }}>
      <div className="flex items-start gap-[12px]">
        <Avatar name="Jordan Rivera" size={30} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Your question</span>
          <textarea
            autoFocus
            value={text}
            maxLength={280}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none bg-transparent text-[14px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)]"
            style={{ color: "var(--foreground)" }}
          />
        </label>
      </div>
      <div className="mt-[6px] flex flex-wrap items-center gap-[var(--space-3)] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }}>
        <span className="min-w-0 flex-1 text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          Posting as Jordan · Junior. Pros see your grade, never your full name.
        </span>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{text.length}/280</span>
        <button type="button" onClick={() => { setOpen(false); setText(""); }} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-[var(--radius-md)] border px-[13px] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={!text.trim()} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-[var(--radius-md)] px-[15px] text-[12px] leading-[16px] font-semibold disabled:cursor-default disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
          Post <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** A just-posted question, optimistic: it lands at the top of the feed
 *  immediately with its routing state, so posting feels alive. */
function LocalQuestionCard({ title }: { title: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border p-[var(--space-5)] motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))" }}>
      <div className="flex flex-wrap items-center gap-[8px]">
        <Avatar name="Jordan Rivera" size={28} />
        <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>Jordan</span>
        <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Just now</span>
      </div>
      <p className="mt-[8px] text-[15px] leading-[21px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>&ldquo;{title}&rdquo;</p>
      <p className="mt-[6px] flex items-center gap-[5px] text-[11.5px] leading-[16px] font-semibold" style={{ color: STATE_COLOR.awaiting }}>
        <Clock className="h-3 w-3" aria-hidden /> Sent to verified pros. Answers usually land within 48 hours.
      </p>
    </div>
  );
}

// ——— tiny shared pieces ———

// "Most Recent" needs an actual order, and the seed data only carries a
// display string ("6h ago", "2d ago") -- minutes-ago from the unit lets the
// two feeds (Reddit's Best/New, borrowed per direct feedback, 8 Sept 2026)
// sort on something real instead of authoring order.
const AGO_UNIT_MINUTES: Record<string, number> = { m: 1, h: 60, d: 1440, w: 10080 };
function agoMinutes(postedAgo: string): number {
  const match = /^(\d+)([mhdw])/.exec(postedAgo);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * (AGO_UNIT_MINUTES[match[2]] ?? 1);
}

// The one element Reddit renders as a rounded pill in both Card and Compact
// (its vote widget) -- everything else in its action row (comments, share,
// save...) is plain text/icon, not its own button-shaped chip (direct
// feedback, 8 Sept 2026: don't clone the whole row, just the one real signal
// that "this is a live control"). This feed has no downvote, so the pill
// carries just the thumbs-up and its count.
function HelpfulPill({ onClick, pressed, count }: { onClick: () => void; pressed: boolean; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full px-[10px] text-[12px] leading-[16px] font-bold tabular-nums"
      style={pressed ? { background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" } : { background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}
    >
      <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {count}
    </button>
  );
}

function StatusChip({ state }: { state: Thread["state"] }) {
  return (
    <span className="inline-flex items-center gap-[5px] text-[11px] leading-[15px] font-semibold" style={{ color: STATE_COLOR[state] }}>
      {state === "awaiting" ? <Clock className="h-3 w-3" aria-hidden /> : state === "routed" ? <ArrowRight className="h-3 w-3" aria-hidden /> : <CheckCircle2 className="h-3 w-3" aria-hidden />}
      {STATE_LABEL[state]}
    </span>
  );
}

// Avatars come from primitives.tsx, the one portrait map (the copy that lived
// here still pointed at the old photo set, so the volunteer picker showed
// empty circles: direct feedback, 7 Sept 2026).


// Student identity: handle + avatar + class year — Twitter-shaped, like the
// marketing site's own Connect chapter — a first-name-only handle, never a
// full/last name or a real photo.
function IdentityBadge({ handle, grade, postedAgo }: { handle: string; grade: string; postedAgo: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <Avatar name={handle} size={34} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{handle}</span>
        <span className="text-[11px] leading-[14px]" style={{ color: "var(--muted-foreground)" }}>{grade} · {postedAgo}</span>
      </div>
    </div>
  );
}

// Volunteer identity: avatar (with the verified checkmark on the badge
// itself, not repeated in text), name, company + role. Nothing else.
function ProBadge({ proId, postedAgo, size = 34 }: { proId: string; postedAgo?: string; size?: number }) {
  const pro = proById(proId);
  const nav = useContext(ConnectNav);
  return (
    <div className="flex items-center gap-[10px]">
      <ProAvatar proId={proId} name={pro.name} size={size} />
      <div className="flex min-w-0 flex-col">
        <button type="button" onClick={() => nav?.openPro(proId)} className="dm-link w-fit cursor-pointer text-left text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</button>
        <span className="flex flex-wrap items-center gap-x-[6px] gap-y-[3px] text-[11px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
          {pro.role} <CompanyChip name={pro.org} tone="surface" size="sm" />
          {postedAgo ? <span>· {postedAgo}</span> : null}
        </span>
      </div>
    </div>
  );
}


// Colored gradient headers on the community cards are the Aug 29 doc's
// mockup, followed by direct instruction -- and each community's color is
// its own APPROVED world accent (WORLD_COLORS tokens), not an invented
// palette: "each one a distinct color so they feel like different career
// worlds", using the accents those worlds already carry everywhere else in
// the app. Mixed toward the app's dark base at both stops so the white
// header text stays legible on every accent.

// EXPLORATION 3 (connect-redesign-lab): pastel tiles, organic-masked ART.
// The references' shaped masks stay -- but they hold the community's own
// people-free artwork, not a portrait. Symmetric grid, every tile equal.
// Signals kept to the earned three: name, verified-pro count, students.

// Community feeds read in the platform's own UI face (what Instagram,
// Facebook, and every OS-native feed does): sturdy at small sizes, high
// x-height, no display-font airiness. Bricolage stays for identity type.
const FEED_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// The mask IS the topic (per direct feedback): each community's art is
// clipped into an icon of its own subject -- a briefcase, rising bars, a
// microchip, a medical cross, a flower. Paths live in a 128px box, the
// tile's exact size, unioned subpaths via clip-path: path().
// Figma's grain on the design-system posters is a procedural "Noise"
// layer; reproduced as a fine tiled monochrome grain blended in "overlay"
// mode at low opacity.

// The CEO's own reference photography (people-free), cropped for the cards.

// Focal point per scene so the card strip frames the SUBJECT (the laptop,
// the towers, the monitors, the stethoscope, the studio desk) -- never an
// empty stretch of room.
// Events are Dream Opportunity branded in the photo lane -- one DO cover
// for all events, with the partner's own logo as the identity mark.
// Internal demo; we work with these partners, so their logos are cleared.
/** The event surface, everywhere an event is shown (direct feedback: no
 *  photos on event cards or boards): dark glass, the partner's colour as one
 *  glow rising from the top-right corner, a fine ruled pattern, grain. */
/** A QR-shaped code for the ticket stub: three finder squares and a module
 *  field seeded from the event id, so every event's code is stable and
 *  distinct. A picture of a QR for the prototype, not a scannable one; the
 *  real code comes with the QR onboarding work. */
export function MockQr({ seed, size = 84, ink = "#0e0c20", paper = "#ffffff" }: { seed: string; size?: number; ink?: string; paper?: string }) {
  const n = 21;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const rnd = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  const inFinder = (x: number, y: number) => {
    const fx = x < 7 ? x : x - (n - 7); const fy = y < 7 ? y : y - (n - 7);
    const ring = fx === 0 || fy === 0 || fx === 6 || fy === 6; const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
    return ring || core;
  };
  const cells: string[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const on = finder(x, y) ? inFinder(x, y) : (x === 6 || y === 6) ? (x + y) % 2 === 0 : rnd() < 0.46;
    if (on) cells.push(`M${x} ${y}h1v1h-1z`);
  }
  const pad = 2;
  return (
    <svg aria-hidden viewBox={`${-pad} ${-pad} ${n + pad * 2} ${n + pad * 2}`} width={size} height={size} className="block rounded-[6px]" style={{ background: paper }} shapeRendering="crispEdges">
      <path d={cells.join("")} fill={ink} />
    </svg>
  );
}

/** The three counts on small frosted discs (direct feedback: not coloured
 *  rings, a quiet blurred surface under each figure), tighter than before,
 *  the label under each. */
function RingStats({ items }: { items: [number, string][] }) {
  return (
    <div className="flex items-start gap-[var(--space-3)]" style={{ textShadow: "none" }}>
      {items.map(([value, label]) => (
        <span key={label} className="flex flex-col items-center gap-[4px]">
          <span
            className="flex size-[46px] items-center justify-center rounded-full border"
            style={{ background: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          >
            <span className="text-[13px] leading-[16px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{value.toLocaleString("en-US")}</span>
          </span>
          <span className="text-[10.5px] leading-[13px] font-semibold tracking-[0.04em] uppercase" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.7)" }}>{label}</span>
        </span>
      ))}
    </div>
  );
}

/** The ticket's side stub: the lockup turned on its side, the way a stub
 *  carries its printing along the tear (an upright stack may replace this
 *  before shipping, brands forbid rotated logos), and one small QR badge in
 *  the corner that opens the branded code. */
function TicketStub({ lead, partner, accent, onQr }: { lead: string; partner?: string; accent: string; onQr: () => void }) {
  return (
    <div className="relative z-10 flex w-[var(--stubw)] flex-none items-center justify-center overflow-hidden" style={{ textShadow: "none" }}>
      <span aria-hidden className="connect-ticket-tear pointer-events-none absolute border-dashed" style={{ borderColor: `color-mix(in srgb, ${accent} 50%, rgba(255,255,255,0.18))` }} />
      <span className="block -rotate-90 whitespace-nowrap"><EventMarks lead={lead} partner={partner} /></span>
      <QrBadge onClick={onQr} className="absolute top-[10px] right-[10px]" />
    </div>
  );
}

/** The QR entry point: one small ghost icon in a corner, quiet until hovered
 *  (direct feedback: tasteful, never distracting). Opens the branded sheet. */
export function QrBadge({ onClick, className = "", label = "Show event QR code" }: { onClick: () => void; className?: string; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`dm-quiet flex size-[28px] cursor-pointer items-center justify-center rounded-[8px] border opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 ${className}`}
      style={{ background: "rgba(8,10,22,0.55)", borderColor: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textShadow: "none" }}
    >
      <QrCode className="h-[15px] w-[15px]" aria-hidden />
    </button>
  );
}

/** The branded QR, full size, over a scrim: the code on a white plate with
 *  the partner's colour on its centre tile, the lockup and the event name
 *  under it. Prototype pattern, not a scannable code. */
export function QrSheet({ name, seed, accent, lead, partner, onClose }: { name: string; seed: string; accent: string; lead: string; partner?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const lit = `color-mix(in srgb, ${accent} 62%, #ffffff)`;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${name} QR code`} className="fixed inset-0 z-[120] flex items-center justify-center p-[var(--space-5)]" style={{ background: "rgba(5,8,20,0.9)" }} onClick={onClose}>
      <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet absolute top-[var(--space-4)] right-[var(--space-4)] flex size-10 cursor-pointer items-center justify-center rounded-full border" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.24)", color: "#fff" }}>
        <X className="h-5 w-5" />
      </button>
      <div className="relative w-full max-w-[320px] overflow-hidden rounded-[var(--radius-lg)] motion-safe:animate-[fade-slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ background: "#0e0c20", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.9)" }} onClick={(e) => e.stopPropagation()}>
        <EventSurface accent={accent} />
        <div className="relative z-10 flex flex-col items-center gap-[var(--space-4)] p-[var(--space-6)]">
          <span className="relative block rounded-[12px] p-[10px]" style={{ background: "#ffffff" }}>
            <MockQr seed={seed} size={196} ink="#0e0c20" paper="#ffffff" />
            <span className="absolute top-1/2 left-1/2 flex size-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px]" style={{ background: "#ffffff" }}>
              <span className="block size-[30px] rounded-[6px]" style={{ background: lit }} />
            </span>
          </span>
          <EventMarks lead={lead} partner={partner} />
          <p className="text-center text-[15px] leading-[20px] font-bold" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{name}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function EventSurface({ accent, edge = true, tab = true }: { accent: string; edge?: boolean; tab?: boolean }) {
  // Brand colours run from EY yellow to Morgan Stanley's near-black navy. A
  // dark one vanished against the card (no glow, no visible edge: direct
  // feedback), so every accent is lifted toward white by the same amount
  // before it is used for the glow, the edge and the tab.
  const lit = `color-mix(in srgb, ${accent} 62%, #ffffff)`;
  return (
    <>
      <span aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(70% 70% at 100% 0%, color-mix(in srgb, ${lit} 58%, transparent) 0%, color-mix(in srgb, ${lit} 18%, transparent) 42%, transparent 72%)` }} />
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.055) 0 1px, transparent 1px 14px)" }} />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.85) 0%, rgba(12,16,35,0.35) 45%, transparent 100%)" }} />
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: `url(${POSTER_GRAIN})`, backgroundSize: "128px 128px", backgroundRepeat: "repeat", mixBlendMode: "overlay", opacity: 0.18 }} />
      {tab && <span aria-hidden className="absolute top-0 z-20 h-[6px] w-[44px] -translate-x-1/2 rounded-b-[6px] opacity-90" style={{ background: lit, left: "var(--tab-x, 50%)" }} />}
      {/* the card's edge, drawn here so every event surface gets the same one
         (the ticket card draws its own edge so it can follow the notches) */}
      {edge && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${lit} 45%, transparent)` }} />}
    </>
  );
}

// Each event wears its partner's brand accent (EY yellow, Chase blue,
// AT&T blue) across surface, CTA, and filters.
export function partnerAccent(host: string): string {
  const brand = COMPANY_BRAND[partnerCompany(host)];
  if (brand && !/^#(000000|111111|141414)$/i.test(brand.bg)) return brand.bg;
  if (/jpmorgan|chase/i.test(host)) return "#117aca";
  if (/at&t/i.test(host)) return "#00a8e0";
  if (/ernst|\bey\b/i.test(host)) return "#2e2e38";
  return EVENT_ACCENT;
}



/** The partner's mark, alone -- no "DO x" lockup. A live "DO" wordmark next
 *  to raster partner logos never quite settled: text and PNG ink don't
 *  share a real cap-height to match against (a wordmark like J.P.Morgan
 *  and a compact glyph like EY don't either, honestly), so every fix for
 *  one host's scale or baseline nudged another host out of line. One
 *  mark, well-placed, reads cleaner than two mismatched typographic
 *  systems forced into a row. The cover art used to bake in a star for
 *  the mark to center on; the star's gone (a decorative flourish that
 *  read as one person's aesthetic pick, not the app's).
 *
 *  A real flex participant now, not an absolute overlay: overlaying it
 *  meant reserving fixed horizontal room from the title on every card
 *  width, which either squeezed the title into word-by-word wrapping on
 *  a narrow card or, hidden below that width instead, vanished the mark
 *  entirely. As a normal flex child next to the title, a wide card keeps
 *  them side by side and a narrow one wraps the mark onto its own line
 *  below the title -- never fighting it for the same horizontal space. */
/** Which company chip a host maps to (the hosts are written as people say
 *  them; the marks are keyed by brand name). No match → a text chip. */
function partnerCompany(host: string): string {
  if (/jpmorgan|chase/i.test(host)) return "JPMorgan Chase";
  if (/ernst|\bey\b/i.test(host)) return "EY";
  if (/morgan stanley/i.test(host)) return "Morgan Stanley";
  if (/at&t/i.test(host)) return "AT&T";
  return host;
}

/** Every event is Dream Opportunity's with a partner. Not chips: the two
 *  marks alone, in one light, over an ambient glow in the partner's brand
 *  colour, with a slow shimmer moving through the ink. One line, one
 *  baseline: the lead mark, a small ×, then the partner in a fixed-width
 *  slot, so on every card the lead starts, the × sits and the partner
 *  begins at the same pixels. Letters are sized to the lead's letter
 *  height; a wordmark wider than its slot scales down to fit. */
const LOCKUP = { md: { L: 16, slot: 118, h: 36 }, lg: { L: 21, slot: 160, h: 48 } } as const;
// Marks we hold that are wrong for the board they would sit on are set in
// type instead (the JA Singapore lockup lived here until the plain JA
// symbol arrived, 4 Sept). Empty today; the mechanism stays.
const NO_MARK = new Set<string>([]);
/** A partner with no mark file yet, set in the display face at letter height. */
function MarkWord({ name, max, L, color }: { name: string; max: number; L: number; color: string }) {
  return <span className="flex items-center truncate font-extrabold tracking-[-0.01em]" style={{ height: L, maxWidth: max, fontSize: L * 0.9, lineHeight: 1, fontFamily: "var(--font-display)", color }}>{name}</span>;
}
export function EventMarks({ lead, partner, size = "md", ink: inkColor }: { lead: string; partner?: string; size?: "md" | "lg"; ink?: string }) {
  const box = LOCKUP[size];
  const gap = Math.round(box.L * 0.6);
  const cross = Math.round(box.L * 0.62);
  const markOf = (name: string) => (NO_MARK.has(name) ? undefined : COMPANY_MARKS[name]);
  // a symbol with no letters (the JA triangles) reads at nearly the full box
  // height; a two-line wordmark (Goldman Sachs) at 1.4 letter heights
  const SYMBOL = new Set(["Junior Achievement"]);
  const fit = (name: string, tall: boolean, max: number) => {
    const m = markOf(name);
    let L = SYMBOL.has(name) ? Math.round(box.h * 0.82) : tall ? Math.round(box.L * 1.4) : box.L;
    if (m) {
      const w = (L / (m.letters?.h ?? 1)) * m.aspect;
      if (w > max) L = Math.max(10, Math.floor(L * (max / w)));
    }
    return L;
  };
  // the lead slot is exactly the lead mark's width, so the box starts where
  // the mark starts (no dead space when the lockup wraps under a title)
  const leadL = fit(lead, false, Math.round(box.L * 3.9));
  const lm = markOf(lead);
  // a wordmark set in type needs about half a letter height per character in
  // the display face at 0.9 L; a touch of room so it never truncates
  const leadSlot = lm ? Math.round((leadL / (lm.letters?.h ?? 1)) * lm.aspect) : Math.round(box.L * 0.52 * lead.length) + 8;
  const partnerL = partner ? fit(partner, partner === "Goldman Sachs", box.slot) : 0;
  // the partner slot hugs its mark, so the lockup's visible right edge IS its
  // box edge: a lockup pinned to a corner then sits on the padding exactly,
  // with no invisible slack after a narrow mark like EY (direct feedback)
  const pm = partner ? markOf(partner) : undefined;
  const partnerSlot = pm ? Math.min(box.slot, Math.round((partnerL / (pm.letters?.h ?? 1)) * pm.aspect)) : undefined;
  const width = partner && partnerSlot !== undefined ? leadSlot + gap + cross + gap + partnerSlot : undefined;
  const dark = !!inkColor && !/^#f/i.test(inkColor);
  const base = dark ? inkColor! : "rgba(255,255,255,0.94)";
  const tint = dark ? `color-mix(in srgb, ${inkColor} 70%, #ffffff)` : "rgba(255,255,255,0.7)";
  const ink = `linear-gradient(110deg, ${base} 0%, ${base} 38%, ${tint} 50%, ${base} 62%, ${base} 100%)`;
  return (
    <span className="relative flex flex-none items-center" style={{ width: lm && width !== undefined ? width : undefined, height: box.h, gap, textShadow: "none" }}>
      <span className="relative flex flex-none items-center justify-end" style={{ width: lm ? leadSlot : undefined, height: box.h }}>
        {lm ? <LetterMark name={lead} ink={ink} letterHeight={leadL} markClassName="dm-logo-shimmer" /> : <MarkWord name={lead} max={leadSlot} L={box.L} color={base} />}
      </span>
      {partner && (
        <>
          {/* the collab mark: a rounded × in the partner's light, breathing slowly */}
          <svg aria-hidden viewBox="0 0 24 24" className="dm-collab-mark relative flex-none" style={{ width: cross, height: cross, color: dark ? inkColor : tint }} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
          <span className="relative flex flex-none items-center" style={{ width: partnerSlot, height: box.h }}>
            {markOf(partner) ? <LetterMark name={partner} ink={ink} letterHeight={partnerL} markClassName="dm-logo-shimmer" /> : <MarkWord name={partner} max={box.slot} L={box.L} color={base} />}
          </span>
        </>
      )}
    </span>
  );
}


// The community card follows the Replit prototype's structure one for one
// (the CEO's gold standard): a header band carrying the name and its
// category, four stat tiles, then one action at the right. Ours puts the


function Card({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`}
      // the career page's frosted panel (direct feedback: same aesthetic)
      style={{
        background: accent ? `color-mix(in srgb, ${accent} 8%, var(--glass-surface-2))` : "var(--glass-surface-2)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: accent ? `color-mix(in srgb, ${accent} 30%, rgba(255,255,255,0.16))` : "rgba(255,255,255,0.16)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryCta({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dm-solid flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-3)] text-[13px] leading-[18px] font-semibold transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] ${className}`}
      style={{ background: "var(--primary)", color: "#FFFFFF" }}
    >
      {children}
    </button>
  );
}

// `done`: the confirmed state of the SAME control -- filled with the success
// tint plus a check, and aria-pressed so the data-connect lift rule fires once
// as it flips. The label doesn't change; the state does, visibly.
function QuietCta({ children, onClick, className = "", done = false }: { children: React.ReactNode; onClick?: () => void; className?: string; done?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done || undefined}
      className={`dm-quiet flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-5)] py-[var(--space-3)] text-[13px] leading-[18px] font-semibold ${className}`}
      style={
        done
          ? { borderColor: "color-mix(in srgb, var(--world-food-farming-nature) 55%, var(--border))", color: "var(--foreground)", background: "color-mix(in srgb, var(--world-food-farming-nature) 14%, var(--glass-surface-1))" }
          : { borderColor: "var(--border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }
      }
    >
      {done && <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--world-food-farming-nature)" }} />}
      {children}
    </button>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
      {children}
    </h2>
  );
}

// ——— feed cards ———

// The doc's question card, one for one: an "Unanswered" pill when nothing
// has come back yet, the quoted bold question as the card's heading, a chip
// row for the asker's grade and country, then likes · views · comments, with
// the time at the top right.
function QuestionCard({ thread, onOpen, saved, onSave, helpful, onHelpful }: { thread: Thread; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  // Display count for the demo (data.ts `comments`), falling back to the
  // real list; the thread itself may hold fewer. Direct feedback.
  const comments = thread.comments ?? thread.responses.length;
  const snippet = questionSnippet(thread);
  return (
    // A post in a feed, not a box on a page (direct feedback, 8 Sept 2026:
    // "let's not do the cards for the card view, do it like Reddit does") --
    // Reddit's own posts sit straight in the feed, divided by a hairline,
    // never a bordered/shadowed card. The whole row still opens the thread
    // (earlier direct feedback: "make it obviously easily clickable") -- an
    // overlay target under the like/save controls, a hover tint standing in
    // for the old hover ring, and a chevron that says "this goes somewhere"
    // before you ever hover.
    <div className="group relative rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-lg)]">
        <span className="sr-only">Open question: {thread.title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-2)" }} />
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[2px] h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />

      {/* A living row starts with a person: the asker's avatar and handle
         lead, the time sits at the far edge -- the same anatomy as every
         social feed a student already reads. */}
      <div className="flex items-center justify-between gap-[var(--space-3)] pr-[22px]">
        <span className="flex min-w-0 items-center gap-[8px]">
          <Avatar name={thread.handle} size={26} />
          <span className="flex-none text-[12px] leading-[16px] font-bold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{thread.handle}</span>
          <span className="min-w-0 truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>· {thread.grade}</span>
        </span>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{thread.postedAgo}</span>
      </div>
      {/* Plain heading, not a quoted line (direct feedback, 8 Sept 2026: a
         question is the SUBJECT of the post, not something to read as a
         quotation -- Reddit and Stack Overflow both just set the title). */}
      <h3 className="mt-[12px] pr-[22px] text-[16px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{thread.title}</h3>
      {/* Information scent (direct feedback: a title alone doesn't say
         whether it's worth a click) -- a one-line snippet of the top answer
         if one exists, or the asker's own elaboration if not, the way Stack
         Overflow and Quora both preview a question before you open it. */}
      {snippet && (
        <p className="mt-[4px] line-clamp-1 pr-[22px] text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          {snippet.by && <span className="font-bold" style={{ color: "var(--foreground)" }}>{snippet.by}: </span>}
          {snippet.text}
        </p>
      )}
      <div className="relative z-20 mt-[14px] flex items-center gap-[var(--space-4)] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {/* The real answered/waiting state (direct feedback: make this the
           obvious, always-visible signal, not a small pill that only ever
           shows for the zero-comments case) -- leftmost, since it's the one
           fact that actually decides whether this question needs you. */}
        <StatusChip state={thread.state} />
        <HelpfulPill onClick={onHelpful} pressed={helpful} count={thread.helpful + (helpful ? 1 : 0)} />
        <button type="button" onClick={onOpen} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]">
          <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {comments}
        </button>
        {/* Experiment (direct feedback: "is that a good idea? let's
           experiment if yes") -- who's actually in this conversation, at a
           glance. Additive: the reply count above still says how many,
           this says who. */}
        <ResponderStack thread={thread} />
        {/* Icon-only, pushed to the far edge: Save is a secondary action and
           doesn't need to compete in text with the status/helpful/comments
           cluster that actually explains the post (direct feedback). */}
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} className="dm-quiet ml-auto flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)]" style={{ color: saved ? "var(--accent-subtle)" : "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
          <Bookmark className="h-4 w-4" aria-hidden fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

// The doc's insight row -- avatar, the pro's name with a "Professional" chip
// and their company chip, the insight's title line, then likes and comments
// -- and the whole row OPENS: title and comment count both land on the
// insight's own thread, where the conversation lives.
function InsightCard({ insight, onOpen, saved, onSave, helpful, onHelpful }: { insight: Insight; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  const pro = proById(insight.proId);
  const nav = useContext(ConnectNav);
  return (
    // Same flat-feed-row treatment as QuestionCard (direct feedback, 8 Sept
    // 2026) -- no bordered/shadowed box, a hairline divider instead.
    <div className="group relative rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-lg)]">
        <span className="sr-only">Open insight: {insight.title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-2)" }} />
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[2px] h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />

      <div className="flex items-start gap-[12px] pr-[22px]">
        <ProAvatar proId={pro.id} name={pro.name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[6px]">
            <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link relative z-20 flex cursor-pointer items-center gap-[4px] text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={13} /></button>
            <span className="flex min-w-0 items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span className="truncate">{pro.role}</span> <CompanyChip name={pro.org} tone="surface" size="sm" /></span>
          </div>
          <h3 className="mt-[8px] text-[15.5px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>{insight.title}</h3>
          <p className="mt-[4px] line-clamp-2 text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{insight.body}</p>
          <div className="relative z-20 mt-[10px] flex items-center gap-[var(--space-4)] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <HelpfulPill onClick={onHelpful} pressed={helpful} count={insight.helpful + (helpful ? 1 : 0)} />
            <button type="button" onClick={onOpen} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]">
              <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {insight.replies.length}
            </button>
            {/* Icon-only, same reasoning as QuestionCard's Save (direct
               feedback): a secondary action, not something to compete in
               text with the counts that actually explain the post. */}
            <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} className="dm-quiet ml-auto flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)]" style={{ color: saved ? "var(--accent-subtle)" : "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
              <Bookmark className="h-4 w-4" aria-hidden fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{insight.postedAgo}</span>
      </div>
    </div>
  );
}

// ——— feed controls: sort + view, learned from Reddit's community feed
// (direct feedback, 8 Sept 2026), kept to the two moves worth borrowing:
// a sort (Best/Most Recent, standing in for Reddit's Best/New -- no
// "Rising"/"Controversial", this feed doesn't have the volume to need them)
// and a view toggle (Card/Compact). Reddit's own left/right rails, awards,
// crossposts etc. are out of scope -- just how the post LIST itself reads. ———

export type FeedSort = "best" | "recent";
// "card" is the original shipped row; "aligned" and "rail" are the two
// hierarchy options from the mockup review (direct feedback, 8 Sept 2026:
// "let's go with option 2 [rail] on the live site... return to option 1
// [aligned] if needed" -- then, a toggle for all of them at once so they're
// comparable live rather than one-at-a-time). "compact" is the existing
// dense single-line view, unrelated to which of the other three is active.
export type FeedView = "card" | "aligned" | "rail" | "compact";

// Reddit's own version of this row is quiet plain text ("Best ⌄", a small
// icon+chevron for view) -- never a second solid chip bar directly under the
// real tabs. The first pass used the same Segmented pill as Questions/
// Insights/Updates/About and it fought with them for the eye (direct
// feedback, 8 Sept 2026). Plain text links now, muted except the active one.
// The avatar-style switch and the four-way feed-view toggle that used to
// live here were both demo-comparison scaffolding, removed once the real
// choices were made (direct feedback, 8 Sept 2026: "remove the avatar
// style toggles, we will be using custom generated ones", "remove the
// question style toggles too, we will use a custom version of the columns
// version" -- see the `view` constant in BoardView, fixed to "aligned").
function FeedControls({ sort, onSort }: { sort: FeedSort; onSort: (s: FeedSort) => void }) {
  const SORTS: { key: FeedSort; label: string }[] = [{ key: "best", label: "Best" }, { key: "recent", label: "Most Recent" }];
  return (
    <div className="flex flex-wrap items-center gap-[10px] text-[12.5px] leading-[17px] font-semibold">
      {SORTS.map((s, i) => (
        <span key={s.key} className="flex items-center gap-[10px]">
          {i > 0 && <span aria-hidden style={{ color: "var(--muted-foreground)" }}>·</span>}
          <button type="button" aria-pressed={sort === s.key} onClick={() => onSort(s.key)} className="dm-quiet cursor-pointer" style={{ color: sort === s.key ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {s.label}
          </button>
        </span>
      ))}
    </div>
  );
}

// One dense row, single hairline divider, no card box -- Reddit's compact
// view swaps a floating card for a plain list because a list of thin rows
// reads as "posts, scan and pick one" more plainly than a stack of separated
// boxes does. No vote arrows (this feed's engagement signal is a helpful
// count, not a score to up/down-vote), but the same left-anchored-number
// idea: the thumbs-up count sits first, in the position a vote count would.
function CompactRow({ onOpen, avatarName, title, meta, state, helpful, comments }: { onOpen: () => void; avatarName: string; title: string; meta: string; state?: Thread["state"]; helpful: number; comments: number }) {
  return (
    <button type="button" onClick={onOpen} className="dm-quiet group flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[10px] py-[10px] text-left transition-colors duration-150" style={{ background: "var(--glass-surface-1)" }}>
      {/* Visually the same pill HelpfulPill renders in Card view -- just not
         its own nested button here, since the whole row already is one. */}
      <span aria-hidden className="flex flex-none items-center gap-[4px] rounded-full px-[8px] py-[4px] text-[11px] leading-[13px] font-bold tabular-nums" style={{ background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>
        <ThumbsUp className="h-3 w-3" /> {helpful}
      </span>
      {/* The real answered/waiting state as a plain colored dot -- the full
         StatusChip's text ("Waiting for an answer") doesn't fit a one-line
         row, but the fact still needs to be visible without opening the
         thread (direct feedback, 8 Sept 2026). */}
      {state && <span aria-label={STATE_LABEL[state]} className="size-[7px] flex-none rounded-full" style={{ background: STATE_COLOR[state] }} />}
      <Avatar name={avatarName} size={24} />
      <span className="min-w-0 flex-1">
        <span className="block min-w-0 truncate text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{title}</span>
        <span className="block truncate text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{meta}</span>
      </span>
      <span className="flex flex-none items-center gap-[4px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {comments}
      </span>
      <ChevronRight aria-hidden className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

function CompactQuestionCard({ thread, onOpen }: { thread: Thread; onOpen: () => void }) {
  const comments = thread.comments ?? thread.responses.length;
  return (
    <CompactRow
      onOpen={onOpen}
      avatarName={thread.handle}
      title={thread.title}
      meta={`${thread.handle} · ${thread.grade} · ${thread.postedAgo}`}
      state={thread.state}
      helpful={thread.helpful}
      comments={comments}
    />
  );
}

function CompactInsightCard({ insight, onOpen }: { insight: Insight; onOpen: () => void }) {
  const pro = proById(insight.proId);
  return <CompactRow onOpen={onOpen} avatarName={pro.name} title={insight.title} meta={`${pro.name} · ${pro.role} · ${insight.postedAgo}`} helpful={insight.helpful} comments={insight.replies.length} />;
}

// ——— Option 1: aligned stat column (Discourse) ———
// A fixed-width, right-aligned, tabular-numeral column for the one number
// that actually decides whether a question needs attention -- the reply
// count -- so it scans down the page the way a spreadsheet's own numbers
// do. Helpful and Save stay inline under the snippet, same actions as the
// shipped row, just no longer repeating the reply count a second time.
function AlignedRow({ onOpen, avatarName, proId, head, title, snippet, count, countLabel, countTone, time, children }: {
  onOpen: () => void; avatarName: string; proId?: string; head: string; title: string; snippet?: { by?: string; text: string };
  count: number; countLabel: string; countTone: string; time: string; children: React.ReactNode;
}) {
  return (
    <div className="group relative grid items-center gap-[14px] rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", gridTemplateColumns: "40px 1fr 72px" }}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">Open: {title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-2)" }} />
      {/* A professional's avatar opens THEIR profile, not the post, the way
         Instagram/Twitter treat an author's avatar vs. the post body
         (direct feedback) -- ProAvatar is already its own higher-stacked,
         stopPropagation'd button that overrides the row's own overlay. */}
      {proId ? <ProAvatar proId={proId} name={avatarName} size={40} /> : <Avatar name={avatarName} size={40} />}
      {/* Plain (no z-index) -- text with no handler of its own must stay
         BELOW the overlay button, or it silently swallows the click
         instead of letting it fall through (direct feedback: "only
         registers at a specific unobvious point" -- this was why). Only
         `children` (real buttons) need to sit above the overlay. */}
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{head}</p>
        <p className="mt-[3px] truncate text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</p>
        {snippet && (
          <p className="mt-[3px] truncate text-[12.5px]" style={{ color: "color-mix(in srgb, var(--muted-foreground) 88%, transparent)" }}>
            {snippet.by && <b style={{ color: "var(--muted-foreground)" }}>{snippet.by}: </b>}
            {snippet.text}
          </p>
        )}
        <div className="relative z-20 mt-[8px] flex items-center gap-[12px]">{children}</div>
      </div>
      <div className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
        <p className="text-[18px] leading-[20px] font-extrabold" style={{ color: countTone }}>{count}</p>
        <p className="mt-[2px] text-[10px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>{countLabel}</p>
        <p className="mt-[6px] text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{time}</p>
      </div>
    </div>
  );
}

function AlignedQuestionRow({ thread, onOpen, saved, onSave, helpful, onHelpful }: { thread: Thread; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  const comments = thread.comments ?? thread.responses.length;
  const answered = thread.state === "answered" || thread.state === "resolved";
  return (
    <AlignedRow
      onOpen={onOpen}
      avatarName={thread.handle}
      head={`${thread.handle} · ${thread.grade}`}
      title={thread.title}
      snippet={questionSnippet(thread)}
      count={comments}
      countLabel="replies"
      countTone={answered ? "var(--world-food-farming-nature)" : "var(--muted-foreground)"}
      time={thread.postedAgo}
    >
      <StatusChip state={thread.state} />
      <HelpfulPill onClick={onHelpful} pressed={helpful} count={thread.helpful + (helpful ? 1 : 0)} />
      <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} className="dm-quiet flex size-[28px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)]" style={{ color: saved ? "var(--accent-subtle)" : "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
        <Bookmark className="h-[15px] w-[15px]" aria-hidden fill={saved ? "currentColor" : "none"} />
      </button>
    </AlignedRow>
  );
}

function AlignedInsightRow({ insight, onOpen, saved, onSave, helpful, onHelpful }: { insight: Insight; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  const pro = proById(insight.proId);
  return (
    <AlignedRow
      onOpen={onOpen}
      avatarName={pro.name}
      proId={pro.id}
      head={`${pro.name} · ${pro.role}`}
      title={insight.title}
      snippet={{ text: insight.body }}
      count={insight.replies.length}
      countLabel="replies"
      countTone="var(--muted-foreground)"
      time={insight.postedAgo}
    >
      <HelpfulPill onClick={onHelpful} pressed={helpful} count={insight.helpful + (helpful ? 1 : 0)} />
      <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} className="dm-quiet flex size-[28px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)]" style={{ color: saved ? "var(--accent-subtle)" : "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
        <Bookmark className="h-[15px] w-[15px]" aria-hidden fill={saved ? "currentColor" : "none"} />
      </button>
    </AlignedRow>
  );
}

// ——— Option 2: accent rail + sharper type scale ———
// A slim bar at the row's left edge and a bigger, bolder title with
// metadata pushed down in size and color -- the contrast alone says "this
// is the important thing" without a box (direct feedback, 8 Sept 2026:
// "let's go with option 2 on the live site"). The rail is a constant brand
// color, not the question's answered/waiting state -- an early pass colored
// it per-state (Discourse colors its own category dot the same way), but
// green-for-answered read as over-signaling on every single row rather than
// a real status cue (direct feedback: "I like rail without the green rail,
// let's get rid of that"). The StatusChip inside the row already says
// answered/waiting in words; the rail doesn't need to repeat it in color.
// The rail bar itself is gone (direct feedback, 8 Sept 2026: "remove the
// rail from the rail variant, I don't want that line thing") -- what's left
// is the part of the option that actually mattered, the sharper type scale
// (bigger bolder title, metadata pushed down), plus two things this pass
// adds: a chevron so the row reads as "opens somewhere" before you ever
// hover (same device QuestionCard/InsightCard already use), and pill-chip
// actions so Helpful/comments/Save read as distinct pressable things
// instead of quiet inline text (direct feedback: "likes and comments and
// save should be on chips so it's more prominent").
function RailRow({ onOpen, avatarName, proId, head, title, snippet, children }: {
  onOpen: () => void; avatarName: string; proId?: string; head: string; title: string; snippet?: { by?: string; text: string }; children: React.ReactNode;
}) {
  return (
    <div className="group relative flex gap-[12px] rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">Open: {title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-2)" }} />
      {/* A professional's avatar opens THEIR profile, not the post (direct
         feedback) -- same override as AlignedRow. */}
      {proId ? <ProAvatar proId={proId} name={avatarName} size={34} /> : <Avatar name={avatarName} size={34} />}
      {/* Plain (no z-index) -- same fix as AlignedRow: text with no click
         handler of its own must stay below the overlay button, or it
         swallows the click instead of letting it reach the overlay. */}
      <div className="min-w-0 flex-1 pr-[22px]">
        <p className="truncate text-[10.5px] font-bold tracking-[0.05em] uppercase" style={{ color: "color-mix(in srgb, var(--muted-foreground) 70%, transparent)" }}>{head}</p>
        <h3 className="mt-[5px] text-[19px] leading-[23px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
        {snippet && (
          <p className="mt-[4px] truncate text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            {snippet.by && <b style={{ color: "var(--foreground)" }}>{snippet.by}: </b>}
            {snippet.text}
          </p>
        )}
        <div className="relative z-20 mt-[10px] flex items-center gap-[8px]">{children}</div>
      </div>
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[2px] z-20 h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />
    </div>
  );
}

// The shared pill shape behind comments/Save in Rail (Helpful already has
// its own via HelpfulPill) -- one consistent chip language for every action
// in the row, not one style for Helpful and plain text for the rest.
function ActionChip({ children, onClick, pressed, label }: { children: React.ReactNode; onClick?: () => void; pressed?: boolean; label?: string }) {
  const style = pressed
    ? { background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" }
    : { background: "var(--glass-surface-1)", color: "var(--muted-foreground)" };
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={pressed} aria-label={label} className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full px-[10px] text-[12px] font-bold" style={style}>
      {children}
    </button>
  ) : (
    <span className="flex min-h-[30px] items-center gap-[5px] rounded-full px-[10px] text-[12px] font-bold" style={style}>
      {children}
    </span>
  );
}

function RailQuestionRow({ thread, onOpen, saved, onSave, helpful, onHelpful }: { thread: Thread; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  const comments = thread.comments ?? thread.responses.length;
  return (
    <RailRow
      onOpen={onOpen}
      avatarName={thread.handle}
      head={`${thread.handle} · ${thread.grade} · ${thread.postedAgo}`}
      title={thread.title}
      snippet={questionSnippet(thread)}
    >
      <StatusChip state={thread.state} />
      <HelpfulPill onClick={onHelpful} pressed={helpful} count={thread.helpful + (helpful ? 1 : 0)} />
      <ActionChip>
        <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {comments}
      </ActionChip>
      <ActionChip onClick={onSave} pressed={saved} label={saved ? "Saved" : "Save"}>
        <Bookmark className="h-3.5 w-3.5" aria-hidden fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
      </ActionChip>
    </RailRow>
  );
}

function RailInsightRow({ insight, onOpen, saved, onSave, helpful, onHelpful }: { insight: Insight; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void }) {
  const pro = proById(insight.proId);
  return (
    <RailRow
      onOpen={onOpen}
      avatarName={pro.name}
      proId={pro.id}
      head={`${pro.name} · ${pro.role} · ${insight.postedAgo}`}
      title={insight.title}
      snippet={{ text: insight.body }}
    >
      <HelpfulPill onClick={onHelpful} pressed={helpful} count={insight.helpful + (helpful ? 1 : 0)} />
      <ActionChip>
        <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {insight.replies.length}
      </ActionChip>
      <ActionChip onClick={onSave} pressed={saved} label={saved ? "Saved" : "Save"}>
        <Bookmark className="h-3.5 w-3.5" aria-hidden fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
      </ActionChip>
    </RailRow>
  );
}

// ——— filter row (mobile: horizontal scroll with edge cue, never clipped) ———

type LucideIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function FilterRow({ options, active, onPick, accent }: { options: { key: string; label: string; Icon?: LucideIcon }[]; active: string; onPick: (key: string) => void; accent?: string }) {
  return (
    <div className="relative -mx-1">
      <div className="flex gap-[var(--space-2)] overflow-x-auto px-1 pt-1 pb-3 [scrollbar-width:none]" role="tablist" aria-label="Filter feed">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active === option.key}
            onClick={() => onPick(option.key)}
            className="dm-quiet flex min-h-[44px] flex-none cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[6px] text-[12.5px] leading-[16px] font-bold whitespace-nowrap"
            style={
              active === option.key
                ? accent
                  ? { background: `color-mix(in srgb, ${accent} 20%, var(--card))`, borderColor: `color-mix(in srgb, ${accent} 60%, var(--glass-border))`, color: "var(--foreground)" }
                  : { background: "var(--primary)", borderColor: "var(--primary)", color: "#FFFFFF" }
                : { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }
            }
          >
            {option.Icon && <option.Icon className="h-[15px] w-[15px]" aria-hidden />}
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
  const [view, setViewState] = useState<View>({ kind: "home", tab: "communities" });
  // Every view Connect has been on this session, oldest first -- real back
  // navigation, not a hardcoded parent per view kind. Direct feedback, 9
  // Sept 2026: "these screens go to the community home when I click back...
  // all the back navigation from any screen, no matter what they say,
  // should go to the last screen, the very previous step." Connect's own
  // "view" state was never real browser history to begin with (setView
  // below calls history.replaceState, not pushState, so the URL tracks the
  // CURRENT view for reload/share but never accumulates entries a real
  // back button could walk) -- so every onBack handler had to hardcode
  // where it assumed the user came from (a pro's profile always "back" to
  // Communities home, a thread always "back" to its own board), which is
  // wrong the moment someone arrives from anywhere else (Saved, Following,
  // a board's insights tab, another thread). This stack is that missing
  // history: pushed once per setView call, popped by goBack below.
  const [viewStack, setViewStack] = useState<View[]>([]);
  // People tab's welcome modal: shown once per Connect visit, not once per
  // PeopleTab mount (see PeopleWelcome in PeopleTab.tsx for why).
  const [peopleWelcomeShown, setPeopleWelcomeShown] = useState(false);
  const [codeOpenFor, setCodeOpenFor] = useState<string | null>(null);
  /** Community awaiting join confirmation in the JoinSheet. */
  const [joinFor, setJoinFor] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(COMMUNITIES.map((c) => [c.id, c.joined])));
  const [eventJoined, setEventJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.entitled])));
  const [saves, setSaves] = useState<Record<string, boolean>>({ "t-ib-hours": true, "i-day-in-life": true });
  const [helpfuls, setHelpfuls] = useState<Record<string, boolean>>({});
  const [announce, setAnnounce] = useState("");
  // Connect 2.0: who the student follows (local for the prototype). Seeded
  // with two real pros who already have posts/answers in the data, so
  // "New from people you follow" has something to show out of the box
  // (direct feedback: "where is the new from people you follow thing?" --
  // it was correctly empty for a fresh student who's followed no one,
  // same principle as every other "no invented stats" empty state this
  // session, but the review needs to see the finished section, the way
  // the reference always shows it with its own sample people).
  const [follows, setFollows] = useState<Follows>({ "pro-chen": true, "pro-martinez": true });
  const toggleFollow = (id: string) => setFollows((f) => ({ ...f, [id]: !f[id] }));
  // Connect 2.0: every question the student posts this session, from any
  // composer, so "Your questions" on the landing can show it waiting.
  const [asked, setAsked] = useState<AskedQuestion[]>([]);
  const [askOpen, setAskOpen] = useState(false);
  const [reportFor, setReportFor] = useState<string | null>(null);
  // Demo only: which of the four roles Connect is being shown as. A
  // segmented switch at the top (like the earlier ?cards= lane switcher), so
  // the demo can flip between journeys in one tap.
  const [role, setRole] = useState<DemoRole>("student");
  // Demo only: which volunteer the Volunteer and Partner roles are shown for.
  const volunteer = view.kind === "proDashboard" || view.kind === "pro" ? view.id : view.kind === "partner" ? (PROS.find((p) => p.org === view.org)?.id ?? "pro-okafor") : "pro-okafor";

  // restore view from URL on mount; keep URL in sync so filters survive
  // reload/share (handoff 8.3). Deliberately an effect, not a lazy useState
  // initializer: window.location.search is only knowable client-side, and
  // reading it during the initial render would mismatch the server-rendered
  // HTML. This IS syncing with an external system (the URL), which is what
  // the set-state-in-effect rule exists to allow.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const as = params.get("as");
    const restored = queryToView(window.location.search);
    // ?as=pro with no view named opens the volunteer's profile as students
    // see it, the same place the Volunteer tab lands (direct feedback, 5 Sept 2026)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewState(as === "pro" && restored.kind === "home" ? { kind: "pro", id: "pro-okafor" } : restored);
    if (as && ROLES.some((r) => r.key === as)) setRole(as as DemoRole);
    else if (params.get("admin")) setRole("admin");
    else if (params.get("dashboard")) setRole("pro");
    else if (params.get("partner")) setRole("partner");
  }, []);
  const setView = useCallback((next: View, as?: DemoRole) => {
    setViewStack((stack) => [...stack, view]);
    setViewState(next);
    const base = viewToQuery(next);
    const keep = as ?? new URLSearchParams(window.location.search).get("as");
    window.history.replaceState(null, "", "/connect" + base + (keep && keep !== "student" ? (base ? "&" : "?") + "as=" + keep : ""));
    window.scrollTo(0, 0);
  }, [view]);

  /** Real "back": pop the last view off the stack and restore it exactly,
   *  rather than jumping to a hardcoded parent. Every onBack handler below
   *  calls this instead of setView({kind: "..."}); the stack only runs dry
   *  on a fresh page load with nothing to pop, so home is a landing, not a
   *  fallback pretending to be a real previous step. */
  const goBack = useCallback(() => {
    // The side effects (setViewState, history, scroll) used to live inside
    // the setViewStack updater itself -- React runs that updater during a
    // render-like phase, so calling other setters and window.history from
    // in there triggered "Cannot update a component (Router) while
    // rendering a different component" (console, 9 Sept 2026). Read the
    // stack directly and keep the updater to a pure pop.
    if (viewStack.length === 0) {
      setViewState({ kind: "home", tab: "communities" });
      window.history.replaceState(null, "", "/connect");
      window.scrollTo(0, 0);
      return;
    }
    const prev = viewStack[viewStack.length - 1];
    setViewStack((stack) => stack.slice(0, -1));
    setViewState(prev);
    const base = viewToQuery(prev);
    const keep = new URLSearchParams(window.location.search).get("as");
    window.history.replaceState(null, "", "/connect" + base + (keep && keep !== "student" ? (base ? "&" : "?") + "as=" + keep : ""));
    window.scrollTo(0, 0);
  }, [viewStack]);

  const say = useCallback((message: string) => {
    setAnnounce(message);
    window.setTimeout(() => setAnnounce(""), 4000);
  }, []);

  const nav = useMemo(
    () => ({
      openPro: (id: string) => setView({ kind: "pro", id }),
      openThread: (id: string) => setView({ kind: "thread", id }),
      openInsight: (id: string) => setView({ kind: "insight", id }),
      openBoard: (id: string) => setView({ kind: "board", id, filter: "questions" }),
      openSaved: () => setView({ kind: "saved" }),
      openFollowingFeed: () => setView({ kind: "followingFeed" }),
      noteAsked: (title: string, boardId: string) => setAsked((current) => [{ id: `asked-${Date.now()}`, title, boardId }, ...current]),
      report: (id: string) => setReportFor(id),
      isFollowing: (id: string) => !!follows[id],
      toggleFollow,
      share: async (query: string, title: string) => {
        const url = `${window.location.origin}/connect${query}`;
        dispatchAuroraPulse("select");
        try {
          if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            await navigator.share({ title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          say("Link copied.");
        } catch {
          say("Could not copy. Long-press the address bar to copy the link.");
        }
      },
    }),
    [setView, follows, say],
  );


  const toggleSave = (id: string, what = "insight") => {
    dispatchAuroraPulse("select");
    setSaves((s) => {
      const next = { ...s, [id]: !s[id] };
      say(next[id] ? `Saved ${what}. Find it under Saved.` : "Removed from Saved.");
      return next;
    });
  };
  const toggleHelpful = (id: string) => {
    dispatchAuroraPulse("select");
    setHelpfuls((h) => ({ ...h, [id]: !h[id] }));
  };


  // `what` names the thing being saved for the confirmation toast --
  // defaults to "insight" (most callers save an insight), question rows
  // pass "question" explicitly so the toast doesn't lie about what you
  // just saved (direct feedback: flesh out what Save actually does).
  const cardProps = (id: string, what = "insight") => ({
    saved: !!saves[id],
    onSave: () => toggleSave(id, what),
    helpful: !!helpfuls[id],
    onHelpful: () => toggleHelpful(id),
  });

  return (
    <div data-connect className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)" }}>
      <AppBackdrop />
      <ConnectNav.Provider value={nav}>
      <DesktopNavigation active="Connect" />

      {/* Mobile header (matches Home's pattern) */}
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      {/* say()'s confirmations ("Saved insight. Find it under Saved.", "Added to
          your Plan as a next action.") used to land ONLY in an sr-only region,
          so sighted students got no confirmation at all. Same strings, now a
          real toast above the nav; still aria-live for screen readers. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-[95] flex justify-center px-5 md:bottom-8">
        {announce && (
          <span key={announce} className="flex items-center gap-[8px] rounded-[var(--radius-sm)] border px-[16px] py-[10px] text-[13.5px] leading-[18px] font-bold motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "color-mix(in srgb, var(--world-food-farming-nature) 45%, var(--glass-border))", color: "var(--foreground)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)" }}>
            <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--world-food-farming-nature)" }} /> {announce}
          </span>
        )}
      </div>

      {/* The home view carries a sidebar on wide screens, so it gets a wider
          column than a thread or a board, which are reading surfaces. */}
      <main
        style={{ fontFamily: FEED_FONT }}
        // Same side padding as every other tab (px-5, then the 56px rail from
        // sm). The home view fills the shared 1440 column; reading views (a
        // board, a thread, a profile) keep a centred 880px column, because a
        // reading column pinned to the left rail sat awkwardly on wide
        // screens (direct feedback, 4 Sept 2026).
        className={`relative z-10 mx-auto flex w-full flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] sm:px-[var(--space-14)] md:pt-[var(--space-10)] ${
          view.kind === "home" ? "max-w-[1440px]" : "max-w-[992px]"
        }`}
      >
        <RoleTabs
          role={role}
          onPick={(next) => {
            setRole(next);
            if (next === "student") setView({ kind: "home", tab: "communities" }, next);
            if (next === "attendee") setView({ kind: "home", tab: "events" }, next);
            // Volunteer opens on the profile as students see it (direct
            // feedback, 5 Sept 2026: a company wants the result first); the
            // private dashboard is one tap from there.
            if (next === "pro") setView({ kind: "pro", id: volunteer }, next);
            if (next === "partner") setView({ kind: "partner", org: PROS.find((p) => p.id === volunteer)?.org ?? "JPMorgan Chase" }, next);
            if (next === "admin") setView({ kind: "admin" }, next);
          }}
        />
        {(role === "pro" || role === "partner") && (
          <VolunteerPicker
            selected={volunteer}
            onPick={(id) => {
              const p = PROS.find((x) => x.id === id)!;
              if (role === "partner") setView({ kind: "partner", org: p.org }, role);
              else setView({ kind: "pro", id }, role);
            }}
          />
        )}

        {view.kind === "home" && (
          <HomeView
            tab={view.tab}
            onTab={(tab) => setView({ kind: "home", tab })}
            eventJoined={eventJoined}
            onOpenBoard={(id) => setView({ kind: "board", id, filter: "questions" })}
            onOpenEvent={(id) => setView({ kind: "event", id, filter: "questions" })}
            onEnterCode={(id) => setCodeOpenFor(id)}
            joined={joined}
            onJoinCommunity={(id) => setJoinFor(id)}
            follows={follows}
            onFollow={toggleFollow}
            joinedCount={Object.values(joined).filter(Boolean).length}
            onAsk={() => setAskOpen(true)}
            asked={asked}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onOpenAll={() => setView({ kind: "activity" })}
            savedCount={Object.values(saves).filter(Boolean).length}
            onDeleteAsked={(id) => setAsked((current) => current.filter((q) => q.id !== id))}
            peopleWelcomeShown={peopleWelcomeShown}
            onPeopleWelcomeShown={() => setPeopleWelcomeShown(true)}
          />
        )}

        {view.kind === "pro" &&
          (() => {
            const pro = PROS.find((p) => p.id === view.id);
            if (!pro) return null;
            const boardId = COMMUNITIES.find((c) => c.world === pro.world)?.id ?? "teaching-education";
            // key={pro.id}: without it, navigating from one pro's profile to
            // a different one reused the same component instance, so its
            // useState(coverFor(pro.id)) never re-ran and every profile kept
            // showing whichever cover the FIRST one you viewed that session
            // had -- read as "they're all the same" / "no real cover" from
            // Connect and People (direct feedback, 8 Sept 2026).
            return <ProProfileView key={pro.id} pro={pro} follows={follows} onFollow={toggleFollow} onBack={goBack} onAsked={(title) => nav.noteAsked(title, boardId)} onOpenDashboard={role === "pro" ? () => setView({ kind: "proDashboard", id: pro.id }, "pro") : undefined} />;
          })()}
        {view.kind === "proDashboard" && <ProDashboardView key={view.id} pro={PROS.find((p) => p.id === view.id)} onBack={goBack} />}
        {view.kind === "admin" && <AdminDashboardView onBack={goBack} />}
        {view.kind === "partner" && <PartnerView org={view.org} onBack={goBack} />}
        {view.kind === "activity" && (
          <ActivityView
            asked={asked}
            follows={follows}
            savedCount={Object.values(saves).filter(Boolean).length}
            onBack={goBack}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onDeleteAsked={(id) => { setAsked((a) => a.filter((q) => q.id !== id)); say("Question deleted."); }}
          />
        )}
        {view.kind === "saved" && <SavedView saves={saves} onUnsave={(id) => toggleSave(id)} onBack={goBack} onOpenThread={(id) => setView({ kind: "thread", id })} onOpenInsight={(id) => setView({ kind: "insight", id })} />}
        {view.kind === "followingFeed" && <FollowingFeedView follows={follows} onBack={goBack} />}

        {view.kind === "board" &&
          (() => {
            const community = COMMUNITIES.find((c) => c.id === view.id);
            if (!community) return null;
            return (
          <BoardView
            community={community}
            filter={view.filter}
            joined={!!joined[view.id]}
            onJoin={() => setJoinFor(view.id)}
            onFilter={(filter) => setView({ kind: "board", id: view.id, filter })}
            onBack={goBack}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onOpenInsight={(id) => setView({ kind: "insight", id })}
            cardProps={cardProps}
          />
            );
          })()}

        {view.kind === "insight" &&
          (() => {
            const insight = INSIGHTS.find((i) => i.id === view.id);
            if (!insight) return null;
            const p = cardProps(insight.id);
            return (
              <InsightThreadView
                insight={insight}
                onBack={goBack}
                saved={p.saved}
                onSave={p.onSave}
                helpful={p.helpful}
                onHelpful={p.onHelpful}
                helpfuls={helpfuls}
                toggleHelpful={toggleHelpful}
              />
            );
          })()}

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
                  onBack={goBack}
                  onOpenCommunity={(id) => setView({ kind: "board", id, filter: "questions" })}
                  onOpenThread={(id) => setView({ kind: "thread", id })}
                  onSaveTakeaway={() => toggleSave("recap-" + event.id, "takeaway")}
                  onAddToPlan={() => say("Added to your Plan as a next action.")}
                  takeawaySaved={!!saves["recap-" + event.id]}
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

        {view.kind === "thread" &&
          (() => {
            const thread = ALL_THREADS.find((t) => t.id === view.id);
            if (!thread) return null;
            return (
          <ThreadView
            thread={thread}
            onBack={goBack}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            cardProps={cardProps}
            saves={saves}
            toggleSave={toggleSave}
            helpfuls={helpfuls}
            toggleHelpful={toggleHelpful}
          />
            );
          })()}
      </main>

      {joinFor && (
        <JoinSheet
          community={COMMUNITIES.find((c) => c.id === joinFor)!}
          onClose={() => setJoinFor(null)}
          onJoin={() => {
            dispatchAuroraPulse("cta");
            const id = joinFor;
            setJoined((j) => ({ ...j, [id]: true }));
            setJoinFor(null);
            say("Joined. New answers show up in your feed.");
          }}
        />
      )}
      {codeOpenFor && (
        <EventCodeSheet
          event={eventById(codeOpenFor)!}
          onClose={() => setCodeOpenFor(null)}
          onRedeemed={() => {
            dispatchAuroraPulse("cta");
            const id = codeOpenFor;
            setEventJoined((j) => ({ ...j, [id]: true }));
            setCodeOpenFor(null);
            setView({ kind: "event", id, filter: "questions" });
            say("Event board unlocked. It stays under Your events. No code needed next time.");
          }}
        />
      )}

      {askOpen && (
        <AskSheet
          onClose={() => setAskOpen(false)}
          onOpenThread={(id) => { setAskOpen(false); setView({ kind: "thread", id }); }}
          onPost={(title, boardId) => {
            dispatchAuroraPulse("cta");
            nav.noteAsked(title, boardId);
            setAskOpen(false);
            const community = COMMUNITIES.find((c) => c.id === boardId);
            say(`Sent to verified pros in ${community?.name ?? "the community"}. ${community?.responseWindow ?? "Most questions are answered within 2 days"}.`);
          }}
        />
      )}
      {reportFor && (
        <ReportSheet
          onClose={() => setReportFor(null)}
          onSubmit={() => {
            setReportFor(null);
            say("Thanks. A moderator will look at it.");
          }}
        />
      )}

      <MobileNav active="Connect" />
      </ConnectNav.Provider>
    </div>
  );
}

// ——— DEMO ONLY: role switcher and volunteer picker. Not a product feature;
// production has one role per signed-in user. See docs/HANDOFF_INDEX.md. ———

type DemoRole = "student" | "attendee" | "pro" | "partner" | "admin";

const ROLES: { key: DemoRole; title: string; who: string; line: string; Icon: LucideIcon }[] = [
  { key: "student", title: "Student", who: "Jordan · Junior", line: "Asks, follows, saves. The default Connect tab.", Icon: GraduationCap },
  { key: "attendee", title: "Attendee", who: "Jordan, after a JA event", line: "Unlocks the event board with a code and keeps the conversation going.", Icon: Calendar },
  { key: "pro", title: "Volunteer", who: "Amara Okafor · JPMorgan Chase", line: "Answers routed questions in minutes and sees the impact, privately.", Icon: ShieldCheck },
  { key: "partner", title: "Partner", who: "JPMorgan Chase", line: "Company-level impact for recognition and sponsorship reporting.", Icon: Building2 },
  { key: "admin", title: "Staff", who: "Dreamari", line: "Sitewide numbers, moderation, people and features.", Icon: LayoutDashboard },
];

/** Demo: which volunteer we are looking at. Faces first, the name under. */
function VolunteerPicker({ selected, onPick }: { selected: string; onPick: (id: string) => void }) {
  return (
    <div role="tablist" aria-label="Volunteer" className="-mx-5 flex gap-[var(--space-2)] overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none]">
      {PROS.map((p) => {
        const on = p.id === selected;
        return (
          <button key={p.id} type="button" role="tab" aria-selected={on} onClick={() => onPick(p.id)} className="dm-quiet flex w-[72px] flex-none cursor-pointer flex-col items-center gap-[6px] rounded-[var(--radius-md)] px-[4px] py-[8px]" style={on ? { background: "color-mix(in srgb, var(--primary) 18%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 60%, transparent)" } : undefined}>
            <Avatar name={p.name} size={40} />
            <span className="w-full truncate text-center text-[11px] leading-[14px] font-semibold" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{p.name.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Demo switch: one segmented control at the top of every Connect screen,
 *  the way the ?cards= lane switcher worked, so a demo flips between the
 *  four journeys in one tap. Rides the URL as ?as=. */
function RoleTabs({ role, onPick }: { role: DemoRole; onPick: (role: DemoRole) => void }) {
  // The five roles stay hidden until Demo is pressed (Joshua Pierce, Slack,
  // 6 Sept 2026): a student sees a plain Connect page, a demo opens the
  // switcher. Once a non-student role is showing, the switcher stays open so
  // the way back is visible.
  const [open, setOpen] = useState(false);
  const showTabs = open || role !== "student";
  return (
    <div className="flex items-center gap-[10px]">
      <button
        type="button"
        aria-expanded={showTabs}
        aria-controls="connect-demo-roles"
        onClick={() => setOpen((value) => !value)}
        className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
        style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
      >
        Demo
      </button>
      {showTabs && <div id="connect-demo-roles" role="tablist" aria-label="Show Connect as" className="flex min-w-0 max-w-full flex-1 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none] sm:flex-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        {ROLES.map(({ key, title, Icon }) => {
          const on = key === role;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onPick(key)}
              className="dm-quiet flex min-h-[32px] flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] px-[10px] text-[12.5px] leading-[16px] font-semibold whitespace-nowrap sm:flex-none sm:px-[12px]"
              style={on ? { background: "var(--primary)", color: "#FFFFFF" } : { color: "var(--muted-foreground)" }}
            >
              <Icon className="hidden h-[14px] w-[14px] sm:block" aria-hidden /> {title}
            </button>
          );
        })}
      </div>}
    </div>
  );
}

// ——— Connect 2.0: your questions, ask from anywhere, saved, report ———

type AskedQuestion = { id: string; title: string; boardId: string };

/** The signed-in student's own questions: the seeded ones Jordan asked plus
 *  anything posted this session. One row each: what happened to it, then the
 *  question. The panel's aside is the way into Saved. */
function YourQuestions({ asked, onOpenThread, savedCount, onDeleteAsked }: { asked: AskedQuestion[]; onOpenThread: (id: string) => void; savedCount: number; onDeleteAsked?: (id: string) => void }) {
  const nav = useContext(ConnectNav);
  const mine = ALL_THREADS.filter((t) => t.handle === "Jordan");
  const empty = asked.length === 0 && mine.length === 0;
  return (
    <Panel id="your-questions-title" title="Your questions">
      {empty && (
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>Nothing yet.</p>
      )}
      <ul className="-mt-[var(--space-2)] flex flex-col">
        {asked.map((q) => (
          <li key={q.id} className="flex flex-col gap-[6px] border-t py-[var(--space-4)] first:border-t-0" style={{ borderColor: RULE }}>
            <span className="flex items-center justify-between gap-[var(--space-3)] text-[12px] leading-[16px] font-semibold" style={{ color: STATE_COLOR.routed }}>
              <span className="flex items-center gap-[5px]"><Clock className="h-3 w-3" aria-hidden /> Waiting for an answer</span>
              {onDeleteAsked && <button type="button" onClick={() => onDeleteAsked(q.id)} className="dm-link cursor-pointer" style={{ color: "var(--muted-foreground)" }}>Delete</button>}
            </span>
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{q.title}&rdquo;</span>
          </li>
        ))}
        {mine.map((t) => {
          const answered = t.state === "answered" || t.state === "resolved";
          const fresh = answered && t.unreadAnswer;
          const primary = t.responses.find((r) => r.kind === "answer" && r.primary) ?? t.responses.find((r) => r.kind === "answer");
          const who = primary && primary.kind === "answer" ? proById(primary.proId) : null;
          return (
            <PanelRow key={t.id} onClick={() => onOpenThread(t.id)}>
              <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: answered ? STATE_COLOR.answered : STATE_COLOR.routed }}>
                {who ? <Avatar name={who.name} size={20} /> : <Clock className="h-3 w-3" aria-hidden />}
                {who ? <span>{fresh ? "New answer" : "Answered"} <span style={{ color: "var(--muted-foreground)" }}>{fresh ? "from" : "by"}</span> <span style={{ color: "var(--foreground)" }}>{who.name}</span></span> : STATE_LABEL[t.state]}
              </span>
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{t.title}&rdquo;</span>
            </PanelRow>
          );
        })}
        {/* the way into Saved: one row, no extra control in the header */}
        <li className={`border-t ${empty ? "-mt-[var(--space-2)]" : ""}`} style={{ borderColor: RULE }}>
          <button type="button" onClick={() => nav?.openSaved()} className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[8px] py-[var(--space-3)] text-left">
            <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
              <Bookmark className="h-3.5 w-3.5" aria-hidden /> Saved · {savedCount}
            </span>
            <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          </button>
        </li>
      </ul>
    </Panel>
  );
}


/** Everything of yours in one place: the "See all" page. Your questions and their
 *  answers, what the people you follow did, and the way into Saved. */
function ActivityView({ asked, follows, savedCount, onBack, onOpenThread, onDeleteAsked }: { asked: AskedQuestion[]; follows: Follows; savedCount: number; onBack: () => void; onOpenThread: (id: string) => void; onDeleteAsked: (id: string) => void }) {
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      <YourQuestions asked={asked} onOpenThread={onOpenThread} savedCount={savedCount} onDeleteAsked={onDeleteAsked} />
      <NewFromFollowing follows={follows} />
    </>
  );
}

// Where a question goes when the student doesn't pick: the words in it.
const ROUTE_WORDS: { id: string; test: RegExp }[] = [
  { id: "business-money", test: /\b(bank|financ|invest|money|account|econom|stock|business|consult|trad)/i },
  { id: "tech-engineering", test: /\b(cod|software|tech|computer|engineer|cyber|data|ai\b|program|app\b|robot)/i },
  { id: "health-medicine", test: /\b(nurs|doctor|medic|health|hospital|patient|biolog|surg|therap)/i },
  { id: "arts-media", test: /\b(design|art\b|artist|music|film|video|content|creat|media|market|brand|photo)/i },
];

const STOP = new Set(["what", "does", "have", "with", "that", "this", "your", "from", "when", "should", "really", "actually", "there", "they", "them", "about", "into", "like", "want", "need", "know"]);

/** The one place to ask from the landing. Type the question; it picks the
 *  community from your words (changeable), shows a question that was already
 *  answered when there is one, and keeps contact details out. */
function AskSheet({ onClose, onPost, onOpenThread }: { onClose: () => void; onPost: (title: string, boardId: string) => void; onOpenThread: (id: string) => void }) {
  const worlds = useStudentWorlds();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const fromWords = ROUTE_WORDS.find((r) => r.test.test(text))?.id;
  const fromTop3 = COMMUNITIES.find((c) => worlds.includes(c.world))?.id;
  const boardId = picked ?? fromWords ?? fromTop3 ?? "teaching-education";
  const community = COMMUNITIES.find((c) => c.id === boardId)!;
  const accent = communityAccent(community);
  const blocked = CONTACT_INFO.test(text);
  const words = text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP.has(w));
  const similar = words.length === 0 ? [] : ALL_THREADS.filter((t) => (t.state === "answered" || t.state === "resolved") && words.some((w) => t.title.toLowerCase().includes(w))).slice(0, 2);
  const canPost = text.trim().length >= 12 && !blocked;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ask-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.6)" }} />
      <div className="relative z-[1] flex w-full max-w-[520px] flex-col gap-[var(--space-4)] rounded-t-[var(--radius-xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <h2 id="ask-title" className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Ask a question</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <label className="block">
          <span className="sr-only">Your question</span>
          <textarea
            autoFocus
            value={text}
            maxLength={280}
            rows={3}
            onChange={(event) => setText(event.target.value)}
            placeholder="What do you want to know?"
            className="w-full resize-none rounded-[var(--radius-md)] border px-[14px] py-[12px] text-[16px] leading-[23px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
            style={{ background: "var(--glass-surface-1)", borderColor: blocked ? "var(--world-business-money-office)" : "var(--glass-border)", color: "var(--foreground)" }}
          />
        </label>
        {blocked && <p role="alert" className="-mt-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</p>}
        {!blocked && text.trim().length > 0 && text.trim().length < 12 && <p className="-mt-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>A few more words helps the right pro find it.</p>}
        {text.length > 220 && <p className="-mt-[6px] text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{280 - text.length} left</p>}

        {/* where it goes: picked from the words, one tap to change */}
        <div className="flex flex-col gap-[8px]">
          <span className="flex flex-wrap items-center gap-x-[8px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Goes to <strong className="font-bold" style={{ color: accent }}>{community.name}</strong>
            {!choosing && <button type="button" onClick={() => setChoosing(true)} className="dm-link cursor-pointer" style={{ color: "var(--accent-subtle)" }}>Change</button>}
          </span>
          {choosing && (
          <div className="flex flex-wrap gap-[6px]" role="radiogroup" aria-label="Community">
            {COMMUNITIES.map((c) => {
              const on = c.id === boardId;
              const a = communityAccent(c);
              return (
                <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => { setPicked(c.id); setChoosing(false); }} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] border px-[10px] py-[5px] text-[13px] leading-[18px] font-semibold" style={on ? { borderColor: `color-mix(in srgb, ${a} 60%, var(--glass-border))`, background: `color-mix(in srgb, ${a} 18%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                  {c.name}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {similar.length > 0 && (
          <div className="flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
            <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Already answered</span>
            {similar.map((t) => (
              <button key={t.id} type="button" onClick={() => onOpenThread(t.id)} className="dm-quiet -mx-[8px] flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[8px] py-[8px] text-left">
                <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{t.title}&rdquo;</span>
                <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <span className="flex min-w-0 flex-1 items-start gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <ShieldCheck className="mt-[1px] h-[13px] w-[13px] flex-none" aria-hidden style={{ color: accent }} />
            <span>Posting as Jordan · Junior</span>
          </span>
          <PrimaryCta onClick={() => canPost && onPost(text.trim(), boardId)} className={`min-h-[44px] ${canPost ? "" : "pointer-events-none opacity-50"}`}>
            <span className="flex items-center gap-[6px]" style={{ color: "#FFFFFF" }}>Post <ArrowRight className="h-[14px] w-[14px]" aria-hidden /></span>
          </PrimaryCta>
        </div>
      </div>
    </div>
  );
}

/** Everything the student saved, resolved from the one saves map: whole
 *  questions, single answers, posts and event takeaways. */
function SavedView({ saves, onUnsave, onBack, onOpenThread, onOpenInsight }: { saves: Record<string, boolean>; onUnsave: (id: string) => void; onBack: () => void; onOpenThread: (id: string) => void; onOpenInsight: (id: string) => void }) {
  const rows: { key: string; kicker: string; title: string; open: () => void }[] = [];
  for (const id of Object.keys(saves).filter((k) => saves[k])) {
    const thread = ALL_THREADS.find((t) => t.id === id);
    if (thread) { rows.push({ key: id, kicker: "Question", title: `“${thread.title}”`, open: () => onOpenThread(thread.id) }); continue; }
    const insight = INSIGHTS.find((i) => i.id === id);
    if (insight) { rows.push({ key: id, kicker: `Post by ${proById(insight.proId).name}`, title: insight.title, open: () => onOpenInsight(insight.id) }); continue; }
    const answer = id.match(/^(.+)-a(\d+)$/);
    if (answer) {
      const t = ALL_THREADS.find((x) => x.id === answer[1]);
      const r = t?.responses[Number(answer[2])];
      if (t && r && r.kind === "answer") { rows.push({ key: id, kicker: `Answer by ${proById(r.proId).name}`, title: `“${t.title}”`, open: () => onOpenThread(t.id) }); continue; }
    }
    const recap = id.match(/^recap-(.+)$/);
    if (recap) {
      const e = eventById(recap[1]);
      if (e) rows.push({ key: id, kicker: "Event takeaways", title: e.name, open: () => {} });
    }
  }
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      <Panel id="saved-title" title="Saved" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{rows.length} saved</span>}>
        {rows.length === 0 ? (
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet.</p>
        ) : (
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center gap-[var(--space-3)] border-t first:border-t-0" style={{ borderColor: RULE }}>
                <button type="button" onClick={row.open} className="dm-quiet -mx-[8px] flex min-w-0 flex-1 cursor-pointer flex-col gap-[4px] rounded-[var(--radius-sm)] px-[8px] py-[var(--space-4)] text-left">
                  <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{row.kicker}</span>
                  <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{row.title}</span>
                </button>
                <button type="button" onClick={() => onUnsave(row.key)} aria-label="Remove from Saved" className="dm-quiet flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--accent-subtle)" }}>
                  <Bookmark className="h-4 w-4" aria-hidden fill="currentColor" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

/** Every post and answer from everyone the student follows, newest first --
 *  not the capped one-per-person preview "New from people you follow"
 *  shows. Direct feedback, 8 Sept 2026: "we know to follow people but
 *  there is no real place to catch up on where those people's posts are or
 *  how to get back to all of their profiles" -- reached via the same kind
 *  of "View all" link Browse by industry already uses. Each row's name and
 *  avatar open that pro's profile directly, answering the second half of
 *  the note. */
function FollowingFeedView({ follows, onBack }: { follows: Follows; onBack: () => void }) {
  const nav = useContext(ConnectNav);
  const ids = Object.keys(follows).filter((id) => follows[id]);
  const rows: { key: string; pro: Pro; verb: "answered" | "posted"; topic: string; postedAgo: string; open: () => void }[] = [];
  for (const id of ids) {
    const pro = proById(id);
    for (const thread of answersBy(id)) rows.push({ key: `a-${id}-${thread.id}`, pro, verb: "answered", topic: topicFor(thread.boardId), postedAgo: thread.postedAgo, open: () => nav?.openThread(thread.id) });
    for (const post of postsBy(id)) rows.push({ key: `p-${post.id}`, pro, verb: "posted", topic: topicFor(post.boardId), postedAgo: post.postedAgo, open: () => nav?.openInsight(post.id) });
  }
  rows.sort((a, b) => agoMinutes(a.postedAgo) - agoMinutes(b.postedAgo));
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      <Panel id="following-feed-title" title="New from people you follow" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{rows.length} {rows.length === 1 ? "update" : "updates"}</span>}>
        {rows.length === 0 ? (
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>Follow a professional to see their posts and answers here.</p>
        ) : (
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center gap-[var(--space-3)] border-t first:border-t-0" style={{ borderColor: RULE }}>
                <button type="button" onClick={() => nav?.openPro(row.pro.id)} aria-label={`Open ${row.pro.name}'s profile`} className="dm-tap flex flex-none cursor-pointer rounded-full leading-none">
                  <Avatar name={row.pro.name} size={40} />
                </button>
                <button type="button" onClick={() => nav?.openPro(row.pro.id)} className="dm-quiet -mx-[8px] flex min-w-0 flex-1 cursor-pointer flex-col gap-[2px] rounded-[var(--radius-sm)] px-[8px] py-[var(--space-3)] text-left">
                  <span className="flex items-center gap-[4px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                    <span className="truncate">{row.pro.name}</span> <VerifiedBadge size={13} />
                  </span>
                  <span className="truncate text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{row.verb === "answered" ? `Answered a question about ${row.topic}` : `Posted about ${row.topic}`} · {row.postedAgo}</span>
                </button>
                <button type="button" onClick={row.open} className="dm-link flex-none cursor-pointer text-[13px] leading-[18px] font-bold whitespace-nowrap" style={{ color: "var(--accent-subtle)" }}>{row.verb === "answered" ? "Read answer" : "Read post"}</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

const REPORT_REASONS = ["Shares personal contact details", "Unkind or bullying", "Not about careers or school", "Something else"];

/** Report, made visible (safety by design): pick why, send, done. */
function ReportSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.6)" }} />
      <div className="relative z-[1] flex w-full max-w-[440px] flex-col gap-[var(--space-4)] rounded-t-[var(--radius-xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <h2 id="report-title" className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Report this</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex flex-col" role="radiogroup" aria-label="Reason">
          {REPORT_REASONS.map((r) => {
            const on = reason === r;
            return (
              <button key={r} type="button" role="radio" aria-checked={on} onClick={() => setReason(r)} className="dm-quiet -mx-[8px] flex cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] border-t px-[8px] py-[12px] text-left text-[15px] leading-[21px] font-semibold first:border-t-0" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                <span aria-hidden className="flex size-[18px] flex-none items-center justify-center rounded-full border-2" style={{ borderColor: on ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {on && <span className="size-[8px] rounded-full" style={{ background: "var(--primary)" }} />}
                </span>
                {r}
              </button>
            );
          })}
        </div>
        <PrimaryCta onClick={() => reason && onSubmit(reason)} className={reason ? "" : "pointer-events-none opacity-50"}>Send report</PrimaryCta>
      </div>
    </div>
  );
}

// ——— Connect home (return-first, handoff 7) ———

function HomeView({
  tab,
  onTab,
  eventJoined,
  onOpenBoard,
  onOpenEvent,
  onEnterCode,
  joined,
  onJoinCommunity,
  follows,
  onFollow,
  joinedCount,
  onAsk,
  asked,
  onOpenThread,
  onOpenAll,
  savedCount,
  onDeleteAsked,
  peopleWelcomeShown,
  onPeopleWelcomeShown,
}: {
  tab: LandingTab;
  onTab: (tab: LandingTab) => void;
  eventJoined: Record<string, boolean>;
  onOpenBoard: (id: string) => void;
  onOpenEvent: (id: string) => void;
  onEnterCode: (id: string) => void;
  joined: Record<string, boolean>;
  onJoinCommunity: (id: string) => void;
  follows: Follows;
  onFollow: (id: string) => void;
  joinedCount: number;
  onAsk: () => void;
  asked: AskedQuestion[];
  onOpenThread: (id: string) => void;
  onOpenAll: () => void;
  savedCount: number;
  onDeleteAsked: (id: string) => void;
  peopleWelcomeShown: boolean;
  onPeopleWelcomeShown: () => void;
}) {
  const eventInk = "#f6f5fb";
  const [qrEvent, setQrEvent] = useState<EventBoard | null>(null);
  // People's own drill-in views (one industry, or the full industry list)
  // hide this shared "Find a professional" heading and search box (direct
  // feedback: one task on screen at a time instead of carrying the whole
  // People page along into a focused sub-view).
  const [peopleFocused, setPeopleFocused] = useState(false);
  void onAsk; void onOpenAll;
  // Search, not Ask, at the top of Connect (CEO, 4 Sept): students come here
  // to find the right room, and asking lives inside each room. Typing
  // "invest" narrows the communities and boards to finance as you type.
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const hit = (...fields: (string | string[] | undefined)[]) => !q || fields.some((f) => (Array.isArray(f) ? f : [f ?? ""]).some((v) => v.toLowerCase().includes(q)));
  const searched = COMMUNITIES.filter((c) => hit(c.name, c.world, c.purpose, c.topics, c.professionalsFrom));
  const searchedEvents = EVENTS.filter((e) => hit(e.name, e.host, e.location, e.topics, e.orgs));

  return (
    <>
      {/* Shows for every tab, not just People (direct feedback, 9 Sept 2026:
         "nobody lands on people tab from other places in the site directly
         without landing on connect") -- one instance here, at the top of
         the whole Connect landing, so it pops on arrival from anywhere else
         on the site regardless of which tab is active, and stays mounted
         (not re-triggered) while switching tabs or drilling into People's
         own sub-views. */}
      <PeopleWelcome hasShown={peopleWelcomeShown} onShown={onPeopleWelcomeShown} />

      {/* Title and the Community/Events toggle share one row on wider
         screens (same pattern as Explore's header: title left, controls
         right, one row instead of three stacked blocks) and wrap onto
         their own line on phones where there isn't room. */}
      <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-5)] gap-y-[var(--space-4)]">
        <div className="min-w-0">
          <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Connect</h1>
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <TopTabs tab={tab} onTab={onTab} />
          {/* Notifications live behind the bell: your questions and what the
             people you follow did lately */}
          <button
            type="button"
            aria-label="Notifications"
            aria-pressed={tab === "notifications"}
            onClick={() => onTab(tab === "notifications" ? "communities" : "notifications")}
            className="dm-quiet flex h-[48px] w-[48px] flex-none cursor-pointer items-center justify-center rounded-full border"
            style={{ background: tab === "notifications" ? "var(--primary)" : "var(--glass-surface-1)", borderColor: tab === "notifications" ? "var(--primary)" : "var(--glass-border)", color: tab === "notifications" ? "#FFFFFF" : "var(--muted-foreground)" }}
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </div>

      {/* "Find a professional" heads the shared search box on People, the
         way the reference has it -- the heading has to come from here,
         not from PeopleTab, since the search box itself is this shared
         one line above every tab's own content (direct feedback: "the
         search bar is above its title Find a professional... match the
         Replit"). */}
      {tab === "people" && !peopleFocused && <SectionHead>Find a professional</SectionHead>}
      {tab !== "notifications" && !(tab === "people" && peopleFocused) && (
        <label className="flex min-h-[48px] items-center gap-[10px] rounded-[var(--radius-md)] border px-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          <Search className="h-[18px] w-[18px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "events" ? "Search events and partners" : tab === "people" ? "Search professionals, careers, companies" : "Search communities, topics, companies"}
            aria-label={tab === "events" ? "Search events" : tab === "people" ? "Search professionals" : "Search communities"}
            className="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-[var(--muted-foreground)]"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="dm-quiet flex h-[28px] w-[28px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </label>
      )}

      {/* Ask and "your questions" moved off the landing (direct feedback):
         they live under Notifications, and every board has its own Ask. */}
      {tab === "notifications" && (
        <>
          <YourQuestions asked={asked} onOpenThread={onOpenThread} savedCount={savedCount} onDeleteAsked={onDeleteAsked} />
          <NewFromFollowing follows={follows} />
        </>
      )}

      {tab === "communities" && (
        /* One section, exactly like the doc: "Your Communities" with the
           joined count at the row's end, all five cards in a two-column
           grid. Search filters this same grid rather than a separate
           "All communities" section. */
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Your communities">
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <SectionHead>Your Communities</SectionHead>
            {/* The card-style A/B switcher that sat here was a lab control in a
               student's face; the lane still rides ?cards= in the URL. This
               slot is the doc's joined count. */}
            {(
              <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{joinedCount} joined</span>
            )}
          </div>
          {/* Symmetric grid, every tile equal weight: three across, two
             centered beneath. */}
          <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2">
            {searched.map((c, index) => (
              <div key={c.id}>
                <CommunityCard community={c} joined={!!joined[c.id]} onOpen={() => onOpenBoard(c.id)} onJoin={() => onJoinCommunity(c.id)} featured={index === 0} />
              </div>
            ))}
            {!q && (
              <div>
                <LaunchVoteCard />
              </div>
            )}
          </div>
          {q && searched.length === 0 && <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>No community matches &ldquo;{query}&rdquo; yet. Vote for it below when the search is cleared.</p>}
        </section>
      )}

      {/* People after places (direct feedback): the communities are the
         doors, the people are who is behind them. Then what the people you
         already follow did lately, only once you follow someone. */}
      {tab === "communities" && <PeopleToFollow follows={follows} onFollow={onFollow} />}

      {/* People: search companies or careers and find people to follow
         (Joshua Pierce, Slack, 6 Sept 2026) */}
      {tab === "people" && <PeopleTab follows={follows} onFollow={onFollow} query={query} onFocusChange={setPeopleFocused} />}

      {tab === "events" && (
        <section className="flex flex-col gap-[var(--space-4)]" aria-label="Your events">
          {/* Photo cards, the same anatomy as the community cards: the
             partnership's photo under a wash of the partner's colour (a
             flat colour block read as a blob, CEO 4 Sept), the name, the
             last or next event date (the name already says company and
             city, so neither repeats), the three counts a paying nonprofit
             wants to see at a glance, then the lockup and one solid button. */}
          <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2">
            {searchedEvents.map((event) => {
              const upcoming = event.lifecycle === "Upcoming";
              const pAccent = partnerAccent(event.host);
              const lit = `color-mix(in srgb, ${pAccent} 62%, #ffffff)`;
              const joined = eventJoined[event.id];
              // the date the card is about (the next one when booked), its time
              // once confirmed, then where: the city lives here, not in the name
              const when = [event.nextDate ?? event.date, event.time].filter(Boolean).join(", ");
              return (
                /* Ticket shape (direct feedback, 4 Sept 2026): the event card
                   is torn into a body and a stub. Round notches at both edges
                   and a perforated line sit where the stub begins; the stub
                   holds the counts and the lockup with the action, like the
                   tear-off of a paper ticket. The shadow rides an outer
                   wrapper as a drop-shadow so it follows the notched outline.
                   Community cards keep their own shape. */
                <div key={event.id} className="group relative h-full" style={{ filter: "drop-shadow(0 16px 22px rgba(0,0,0,0.45))" }}>
                  {/* Ticket (direct feedback, 4 Sept 2026): body on the left, a
                     side stub on the right at every width, torn apart by two
                     notches and a perforation. The stub carries the lockup,
                     turned on its side like a stub's printed edge; tapping the
                     stub flips it to the event's branded QR. The counts sit in
                     three small rings, not full-width boxes. The outer box is
                     masked and its background is the ticket's edge; the inner
                     box, one pixel inside with the same notches, holds the
                     surface. */}
                  {/* the whole ticket is the tap target (direct feedback, 5 Sept
                     2026): tapping anywhere opens the board (or the code sheet
                     when not yet joined); the stub's own flip and the buttons
                     keep their own behaviour */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`${joined ? "Open" : "Join"} ${event.name}`}
                    onClick={(e) => { if ((e.target as HTMLElement).closest("button, a")) return; if (joined) onOpenEvent(event.id); else onEnterCode(event.id); }}
                    onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (joined) onOpenEvent(event.id); else onEnterCode(event.id); } }}
                    className="connect-ticket dm-tap relative flex h-[316px] cursor-pointer overflow-hidden rounded-[var(--radius-lg)]"
                    style={{ background: `color-mix(in srgb, ${lit} 50%, rgba(255,255,255,0.12))`, fontFamily: "var(--font-display)", textShadow: CARD_TEXT_SHADOW }}
                  >
                    <div aria-hidden className="connect-ticket-inner absolute inset-px overflow-hidden rounded-[calc(var(--radius-lg)-1px)]" style={{ background: "#0e0c20", ["--tab-x" as string]: "calc((100% - var(--stubw)) / 2)" }}>
                      <EventSurface accent={pAccent} edge={false} />
                      <span className="connect-ticket-paper absolute" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${lit} 16%, rgba(255,255,255,0.05)) 0%, color-mix(in srgb, ${lit} 8%, rgba(255,255,255,0.03)) 100%)` }} />
                    </div>
                    {/* body */}
                    <div className="relative z-10 flex min-w-0 flex-1 flex-col px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-5)] sm:px-[var(--space-6)] sm:pt-[var(--space-6)]">
                      <h3 className="line-clamp-3 min-h-[78px] text-[21px] leading-[26px] font-extrabold text-balance" style={{ color: eventInk }}>{event.name}</h3>
                      <p className="mt-[8px] flex flex-col gap-[3px] text-[13.5px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)" }}>
                        <span className="flex items-center gap-[7px]"><Calendar className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${pAccent} 60%, #fff)` }} /> {when}</span>
                        <span className="flex items-center gap-[7px]"><MapPin className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${pAccent} 60%, #fff)` }} /> {event.location}</span>
                      </p>
                      {/* fixed zones so every ticket is the same height: the
                         counts row, then the action on its own line */}
                      <div className="mt-auto flex min-h-[63px] items-end pt-[var(--space-4)]">
                        {typeof event.students === "number" && (
                          <RingStats items={[[event.students, "Students"], [event.pros ?? 0, "Pros"], [event.postCount ?? 0, "Posts"]]} />
                        )}
                      </div>
                      {/* the action row: a button, or for an unopened event the one
                         line that says why there is none, in the same place */}
                      <div className="mt-[var(--space-4)] flex min-h-[38px] items-center">
                        {joined ? (
                          <PrimaryCta className="min-h-[38px] px-[var(--space-4)] whitespace-nowrap" onClick={() => onOpenEvent(event.id)}>Open board <ArrowRight className="h-[14px] w-[14px]" aria-hidden strokeWidth={2.75} /></PrimaryCta>
                        ) : upcoming ? (
                          <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)" }}>Opens after the event</p>
                        ) : (
                          <PrimaryCta className="min-h-[38px] px-[var(--space-4)] whitespace-nowrap" onClick={() => onEnterCode(event.id)}><KeyRound className="h-[14px] w-[14px]" aria-hidden /> Enter code</PrimaryCta>
                        )}
                      </div>
                    </div>
                    {/* stub: the lockup on its side; tap for the branded QR */}
                    <TicketStub lead={event.partner === "Dream Opportunity" ? event.partner : event.lead} partner={event.partner === "Dream Opportunity" ? event.lead : event.partner} accent={lit} onQr={() => setQrEvent(event)} />
                  </div>
                </div>
              );
            })}
          </div>
          {qrEvent && (
            <QrSheet
              name={qrEvent.name}
              seed={qrEvent.id}
              accent={partnerAccent(qrEvent.host)}
              lead={qrEvent.partner === "Dream Opportunity" ? qrEvent.partner : qrEvent.lead}
              partner={qrEvent.partner === "Dream Opportunity" ? qrEvent.lead : qrEvent.partner}
              onClose={() => setQrEvent(null)}
            />
          )}
        </section>
      )}
    </>
  );
}

/** The page-level Community/Events switcher: one glass segmented control
 *  with a sliding thumb, instead of two disconnected chips. */
// Communities, People, Events (direct feedback, 8 Sept 2026): People moved
// to the middle slot -- more valuable and scalable than Events, so it reads
// second, not last. Notifications moved to the bell beside them.
const LANDING_TABS = [
  { key: "communities", label: "Communities", Icon: Users },
  { key: "people", label: "People", Icon: UserRound },
  { key: "events", label: "Events", Icon: Calendar },
] as const;
function TopTabs({ tab, onTab }: { tab: LandingTab; onTab: (tab: LandingTab) => void }) {
  const index = LANDING_TABS.findIndex((t) => t.key === tab);
  return (
    <div
      role="tablist"
      aria-label="Connect sections"
      className="relative grid w-full grid-cols-3 rounded-full border p-[4px] sm:w-auto sm:min-w-[420px]"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      <span
        aria-hidden
        className="absolute top-[4px] bottom-[4px] left-[4px] w-[calc(33.333%-2.667px)] rounded-full transition-transform duration-300 ease-out"
        style={{ background: "var(--primary)", transform: `translateX(${Math.max(index, 0) * 100}%)`, opacity: index < 0 ? 0 : 1, boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--primary) 70%, transparent)" }}
      />
      {LANDING_TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={tab === key}
          onClick={() => onTab(key)}
          className="dm-quiet relative z-10 flex min-h-[40px] cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] text-[13px] leading-[18px] font-bold transition-colors duration-300"
          style={{ color: tab === key ? "#FFFFFF" : "var(--muted-foreground)" }}
        >
          <Icon className="hidden h-[15px] w-[15px] min-[420px]:block" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

/** The sixth grid cell: a quiet promise. Same card anatomy as its five
 *  neighbors -- title, sub in the dek slot, folio rule -- but ghosted, with
 *  the suggest affordance living in the folio where a CTA belongs. */
/** What should we launch next? (CEO, 4 Sept) Instead of a free-text
 *  suggestion, the communities being considered, and one vote each: real
 *  demand data, and the student sees their pick land. Votes are local to the
 *  prototype. */
const LAUNCH_CANDIDATES = [
  { id: "law", name: "Law & Government", votes: 214 },
  { id: "trades", name: "Engineering & Trades", votes: 187 },
  { id: "sport", name: "Sports & Fitness", votes: 162 },
  { id: "founders", name: "Entrepreneurship", votes: 149 },
];
function LaunchVoteCard() {
  const [picked, setPicked] = useState<string | null>(null);
  const top = Math.max(...LAUNCH_CANDIDATES.map((c) => c.votes)) + 1;
  return (
    <div
      className="group relative flex h-full min-h-[312px] flex-col overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "#0e0c20", border: "1px solid color-mix(in srgb, var(--primary) 45%, transparent)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW, fontFamily: "var(--font-display)" }}
    >
      <span aria-hidden className="absolute inset-0">
        <Image src="/images/connect/covers/photo4-event-door.webp" alt="" fill sizes="640px" className="object-cover" style={{ objectPosition: "68% 45%", filter: "brightness(0.6) saturate(0.85)" }} />
        <CardProgressiveBlur size="74%" />
        <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.96) 0%, rgba(12,16,35,0.88) 40%, rgba(12,16,35,0.5) 70%, rgba(12,16,35,0.2) 100%), ${cardTopScrim()}` }} />
      </span>
      <div className="relative z-10 flex h-full w-full flex-col px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-4)]">
        <h3 className="text-[24px] leading-[28px] font-extrabold text-balance" style={{ color: "#FFFFFF" }}>What should we launch next?</h3>
        <ul className="mt-auto flex flex-col gap-[6px] pt-[var(--space-4)]" style={{ textShadow: "none" }}>
          {LAUNCH_CANDIDATES.map((c) => {
            const votes = c.votes + (picked === c.id ? 1 : 0);
            const mine = picked === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={picked !== null}
                  onClick={() => { dispatchAuroraPulse("cta"); setPicked(c.id); }}
                  className={`dm-quiet relative flex min-h-[40px] w-full cursor-pointer items-center justify-between gap-[10px] overflow-hidden rounded-[var(--radius-sm)] px-[12px] text-left text-[14px] leading-[18px] font-semibold disabled:cursor-default ${mine ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
                  style={{ background: "rgba(12,16,35,0.58)", boxShadow: `inset 0 0 0 1px ${mine ? "var(--primary)" : "rgba(255,255,255,0.12)"}`, color: "#FFFFFF" }}
                >
                  {picked && <span aria-hidden className="absolute inset-y-0 left-0 rounded-[var(--radius-sm)]" style={{ width: `${(votes / top) * 100}%`, background: mine ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "rgba(255,255,255,0.08)", transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />}
                  <span className="relative flex items-center gap-[8px]">{mine && <CheckCircle2 className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--accent-subtle)" }} />}{c.name}</span>
                  <span className="relative text-[12px] tabular-nums" style={{ color: "rgba(255,255,255,0.7)" }}>{picked ? `${votes} votes` : "Vote"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ——— community board (handoff 8) ———

function BoardView({
  community,
  filter,
  joined,
  onJoin,
  onFilter,
  onBack,
  onOpenThread,
  onOpenInsight,
  cardProps,
}: {
  community: Community;
  filter: string;
  joined: boolean;
  onJoin: () => void;
  onFilter: (f: string) => void;
  onBack: () => void;
  onOpenThread: (id: string) => void;
  onOpenInsight: (id: string) => void;
  cardProps: (id: string, what?: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const [sort, setSort] = useState<FeedSort>("best");
  // Fixed to Columns, no toggle (direct feedback, 8 Sept 2026: "remove the
  // question style toggles too, we will use a custom version of the
  // columns version" -- Rail/Compact/Current stay defined below should a
  // custom Columns build want to borrow a piece of one, just no longer
  // switchable at runtime).
  const view: FeedView = "aligned";
  const sortFeed = useCallback(
    <T extends { helpful: number; postedAgo: string }>(items: T[]): T[] =>
      [...items].sort((a, b) => (sort === "best" ? b.helpful - a.helpful : agoMinutes(a.postedAgo) - agoMinutes(b.postedAgo))),
    [sort],
  );
  const threads = sortFeed(THREADS.filter((t) => t.boardId === community.id));
  const insights = sortFeed(INSIGHTS.filter((i) => i.boardId === community.id));
  const updates = OPPORTUNITIES.filter((o) => o.boardId === community.id);
  const firms = Array.from(new Set(updates.map((o) => o.org)));
  const [firm, setFirm] = useState<string>("All");
  const shownUpdates = firm === "All" ? updates : updates.filter((o) => o.org === firm);
  const about = filter === "about";
  const tab = filter === "about" ? "about" : filter === "insights" ? "insights" : filter === "updates" ? "updates" : "questions";
  const bannerCover = PHOTO_COVER[community.id];
  const bannerInk = "#f6f5fb";
  const nav = useContext(ConnectNav);
  const [postedQs, setPostedQs] = useState<{ id: string; title: string }[]>([]);

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to all communities
      </button>

      {/* Identity banner in the community-card language: pastel accent
         surface, ink type in three tiers, the topic shape with its radials
         at the right, a full-width folio rule underneath. */}
      <section
        aria-label="Community overview"
        className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)] sm:min-h-[300px] sm:px-[var(--space-8)] sm:py-[var(--space-6)]"
        style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${communityAccent(community)} 40%, transparent)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
      >
        {/* taller, like the career and college headers: the photo gets room to
           breathe and the title sits low on the frost */}
        <Image src={bannerCover ?? community.photo} alt="" fill sizes="1280px" className="object-cover" style={{ objectPosition: PHOTO_FOCUS[community.id] ?? "60% 42%" }} />
        <CardProgressiveBlur size="64%" />
        <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.6) 40%, rgba(12,16,35,0.18) 70%, transparent 100%), ${cardTopScrim()}` }} />
        <span aria-hidden className="absolute top-[10px] left-1/2 h-[5px] w-[48px] -translate-x-1/2 rounded-full" style={{ background: `color-mix(in srgb, ${bannerInk} 18%, transparent)` }} />
        <div className="relative z-10 flex items-center gap-[var(--space-5)]">
          <div className="min-w-0 flex-1 self-start pt-[8px]">
            <h1 className="text-[28px] leading-[32px] font-extrabold text-balance sm:text-[34px] sm:leading-[38px]" style={{ color: bannerInk }}>{community.name.replace(/ Careers$/, "")}</h1>
            <p className="mt-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${bannerInk} 80%, transparent)` }}>{community.topics.join(" · ")}</p>
          </div>
        </div>
        <div className="relative z-10 mt-[var(--space-4)] flex w-full flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[4px] border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${bannerInk} 18%, transparent)` }}>
          <span className="min-w-0 text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${bannerInk} 62%, transparent)` }}>
            <strong className="font-extrabold" style={{ color: `color-mix(in srgb, ${bannerInk} 90%, transparent)` }}>{community.students}</strong> students · <strong className="font-extrabold" style={{ color: `color-mix(in srgb, ${bannerInk} 90%, transparent)` }}>{community.activePros}</strong> verified pros{" "}
            <ShieldCheck className="inline-block h-[13px] w-[13px] align-[-2px]" aria-hidden style={{ color: `color-mix(in srgb, ${communityAccent(community)} 70%, ${bannerInk})` }} />
            {" "}· <strong className="font-extrabold" style={{ color: `color-mix(in srgb, ${bannerInk} 90%, transparent)` }}>{community.posts}</strong> posts
          </span>
          {joined ? (
            <span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.08em] uppercase" style={{ color: `color-mix(in srgb, ${communityAccent(community)} 45%, ${bannerInk})` }}>
              <CheckCircle2 className="h-[14px] w-[14px]" aria-hidden /> Joined
            </span>
          ) : (
            <button type="button" onClick={onJoin} className="dm-quiet flex cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.08em] uppercase" style={{ color: `color-mix(in srgb, ${communityAccent(community)} 45%, ${bannerInk})` }}>
              Join <ArrowRight className="h-[14px] w-[14px]" aria-hidden strokeWidth={2.75} />
            </button>
          )}
        </div>
      </section>

      {/* one row of tabs for the whole board (Questions, Insights, About); the
         feed cards sit straight on the page, no box around boxes */}
      {/* The Replit v2-connect (source of truth for HOW information is
         delivered, CEO 4 Sept): three feeds plus About: Student Questions,
         Professional Insights, Industry Updates. The board header, the tabs
         row and the card designs stay exactly as they were (direct
         instruction); only what each feed carries changed. */}
      {/* Everything below the identity banner -- the tab row, the composer,
         the feed -- now sits on one solid --card floor instead of loose on
         the page's own gradient wash (direct feedback: this audience spans
         students to corporate volunteers to older teacher/staff moderators,
         closer to LinkedIn/Facebook's comfort zone than a young social
         app's; too much reliance on gradients and transparency made the
         page slower to parse). Individual rows keep their own lighter
         glass-surface-1 tint, one visible step up from this floor, so the
         two-level hierarchy (section, then item) reads the same way it now
         does on Connect > People. */}
      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
      <Segmented ariaLabel="Board section" value={tab} onChange={(key) => onFilter(key)} options={[{ key: "questions", label: "Questions" }, { key: "insights", label: "Insights" }, { key: "updates", label: "Updates" }, { key: "about", label: "About" }]} />

      {about && (
        <Panel id="about-community-title" title="About this community">
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{community.purpose}</p>
          <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
            <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Topics</span>
            <div className="flex flex-wrap gap-[6px]">
              {community.topics.map((name) => (
                <span key={name} className="rounded-[var(--radius-sm)] border px-[11px] py-[3px] text-[12px] leading-[17px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>{name}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
            <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Pros from</span>
            <div className="flex flex-wrap gap-[6px]">
              {community.professionalsFrom.map((name) => <CompanyChip key={name} name={name} tone="surface" />)}
            </div>
          </div>
          <p className="flex items-center gap-[6px] border-t pt-[var(--space-4)] text-[13px] leading-[18px] font-semibold" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
            <ShieldCheck className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: communityAccent(community) }} />
            {community.responseWindow}.
          </p>
          <details className="group border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
            <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>Community rules <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden style={{ color: "var(--muted-foreground)" }} /></summary>
            <ul className="mt-[var(--space-3)] flex flex-col gap-[6px] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>
              <li>Ask about the work, the path and the people. Keep it on this community&apos;s topic.</li>
              <li>First names only. No phone numbers, emails or social handles in posts.</li>
              <li>Pros answer inside the scope they were verified for, and say so when a question is outside it.</li>
              <li>Be kind. Every question here was once someone&apos;s first question.</li>
            </ul>
          </details>
          <details className="group border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
            <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>Moderators <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden style={{ color: "var(--muted-foreground)" }} /></summary>
            <p className="mt-[var(--space-3)] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>The Dreamari team reviews every post before it goes live, with verified pros from {community.professionalsFrom.slice(0, 2).join(" and ")} as topic moderators.</p>
          </details>
        </Panel>
      )}

      {tab === "questions" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {/* the composer sits at the top of the feed, right under the board's
             header, so asking is the first thing on offer rather than a
             reward for scrolling past every existing thread (direct
             feedback, 5 Sept 2026) */}
          <InlineAsk
            joined={joined}
            onRequireJoin={onJoin}
            accent={communityAccent(community)}
            placeholder="What do you want to ask?"
            onPost={(text) => { setPostedQs((current) => [{ id: `${community.id}-local-${current.length}`, title: text }, ...current]); nav?.noteAsked(text, community.id); }}
          />
          {threads.length + postedQs.length > 1 && <FeedControls sort={sort} onSort={setSort} />}
          {postedQs.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
          {threads.map((t) => <AlignedQuestionRow key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} {...cardProps(t.id, "question")} />)}
          {threads.length === 0 && (
            <Card>
              <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>No questions here yet. Yours could be the first.</p>
              <ul className="mt-[8px] flex flex-col gap-[6px]">
                {STARTER_PROMPTS.map((p) => (
                  <li key={p} className="text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>&ldquo;{p}&rdquo;</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
      {tab === "insights" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {insights.length > 1 && <FeedControls sort={sort} onSort={setSort} />}
          {insights.map((i) => <AlignedInsightRow key={i.id} insight={i} onOpen={() => onOpenInsight(i.id)} {...cardProps(i.id)} />)}
          {insights.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>No professional insights posted here yet.</p>
          )}
        </div>
      )}
      {tab === "updates" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {firms.length > 1 && (
            <div className="flex flex-wrap gap-[6px]">
              {["All", ...firms].map((f) => (
                <button key={f} type="button" aria-pressed={firm === f} onClick={() => setFirm(f)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center rounded-full border px-[12px] text-[13px] leading-[18px] font-semibold" style={firm === f ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#FFFFFF" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{f}</button>
              ))}
            </div>
          )}
          {shownUpdates.map((o) => <UpdateCard key={o.id} update={o} accent={communityAccent(community)} />)}
          {updates.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>No firm posts here yet. Pros&apos; firms post internships, insight days and resources here.</p>
          )}
        </div>
      )}
      </SectionSurface>
    </>
  );
}

/** One verified firm post (Industry Updates): the firm and the kind of thing
 *  it is, when it closes, what it is, who it is for and where, one action. */
function UpdateCard({ update, accent }: { update: Opportunity; accent: string }) {
  return (
    <Card accent={accent}>
      <div className="flex flex-wrap items-center gap-[8px]">
        <CompanyChip name={update.org} tone="surface" />
        <span className="rounded-[var(--radius-sm)] px-[9px] py-[3px] text-[12px] leading-[16px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: "var(--foreground)" }}>{update.kind}</span>
        <span className="ml-auto text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{/^check/i.test(update.deadline) ? update.deadline : `Deadline ${update.deadline}`}</span>
      </div>
      <h3 className="mt-[10px] text-[17px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{update.title}</h3>
      <p className="mt-[6px] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{update.body}</p>
      <div className="mt-[10px] flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[4px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex items-center gap-[5px]"><GraduationCap className="h-[14px] w-[14px]" aria-hidden /> {update.eligibility}</span>
        <span className="flex items-center gap-[5px]"><MapPin className="h-[14px] w-[14px]" aria-hidden /> {update.location}</span>
      </div>
      <div className="mt-[12px] flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <span className="flex items-center gap-[5px] text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><ShieldCheck className="h-[13px] w-[13px]" aria-hidden style={{ color: accent }} /> {update.verifiedDate}</span>
        <QuietCta onClick={() => dispatchAuroraPulse("cta")}>{update.cta} <ExternalLink className="h-[14px] w-[14px]" aria-hidden /></QuietCta>
      </div>
    </Card>
  );
}

// ——— event board (handoff 10) ———

function EventView({
  event,
  filter,
  onFilter,
  onBack,
  onOpenCommunity,
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
  onOpenCommunity?: (id: string) => void;
  onOpenThread: (id: string) => void;
  onSaveTakeaway: () => void;
  takeawaySaved: boolean;
  onAddToPlan: () => void;
  cardProps: (id: string, what?: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const threads = EVENT_THREADS.filter((t) => t.boardId === event.id);
  // Real professionals, not an invented roster: whoever in PROS works at one
  // of this board's orgs is who showed up (same match the community cards
  // use for their own "Professionals from" row). `host`/`partner` are
  // included too: event-ey's own `orgs` spells the host out in full
  // ("Ernst & Young") while every Pro record uses the short form its own
  // partner-program name goes by ("EY").
  const eventOrgNames = [...event.orgs, event.host, event.partner].filter((v): v is string => !!v);
  const eventPros = PROS.filter((p) => eventOrgNames.includes(p.org));
  const [postedQs, setPostedQs] = useState<{ id: string; title: string }[]>([]);
  const [planAdded, setPlanAdded] = useState(false);
  const eventInk = "#f6f5fb";
  const pAccent = partnerAccent(event.host);
  const [qrOpen, setQrOpen] = useState(false);
  // Falls back to Questions for any old/unrecognised ?filter= value.
  const tab = filter === "posts" || filter === "insights" || filter === "resources" || filter === "people" || filter === "about" ? filter : "questions";
  // the Resources tab's photo viewer: which frame is open, if any
  const [photoOpen, setPhotoOpen] = useState<number | null>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  useEffect(() => {
    if (photoOpen === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setPhotoOpen(null); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [photoOpen]);
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Connect
      </button>
      {qrOpen && (
        <QrSheet name={event.name} seed={event.id} accent={pAccent} lead={event.partner === "Dream Opportunity" ? event.partner : event.lead} partner={event.partner === "Dream Opportunity" ? event.lead : event.partner} onClose={() => setQrOpen(false)} />
      )}

      <section
        aria-label="Event context"
        className="group relative overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)]"
        style={{ background: "#0e0c20", fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
      >
        <EventSurface accent={pAccent} />
        {/* the lockup sits in the header's top-right corner, on the header's own
           padding, at card size: a fixed anchor rather than a flex item that
           drifted with the title's line count (direct feedback) */}
        <div className="absolute top-[var(--space-5)] right-[var(--space-6)] z-10 flex items-center gap-[10px]">
          <EventMarks lead={event.partner === "Dream Opportunity" ? event.partner : event.lead} partner={event.partner === "Dream Opportunity" ? event.lead : event.partner} />
          <QrBadge onClick={() => setQrOpen(true)} />
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-x-[var(--space-5)] gap-y-[12px]">
          {/* on phones the corner lockup owns the first row, so the text starts
             under it; from sm the text clears it on the right instead */}
          <div className="min-w-[220px] flex-1 self-start pt-[48px] sm:pt-[8px] sm:pr-[240px]">
            <p className="text-[11px] leading-[15px] font-medium tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${pAccent} 45%, ${eventInk})` }}>{event.lifecycle}</p>
            <h1 className="mt-[6px] text-[24px] leading-[29px] font-extrabold text-balance" style={{ color: eventInk }}>{event.name}</h1>
            {/* the name carries the partnership; the line under it says when
               and where (the company is not repeated) */}
            <p className="mt-[6px] flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[2px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${eventInk} 74%, transparent)` }}>
              <span className="flex items-center gap-[5px]"><Calendar className="h-3.5 w-3.5 flex-none" aria-hidden /> {[event.nextDate ?? event.date, event.time].filter(Boolean).join(", ")}</span>
              <span className="flex items-center gap-[5px]"><MapPin className="h-3.5 w-3.5 flex-none" aria-hidden /> {event.location}</span>
            </p>
          </div>
        </div>
        {/* who is inside: the numbers a partner nonprofit is paying for, on the
           same frosted discs as the ticket cards */}
        {typeof event.students === "number" && (
          <div className="relative z-10 mt-[var(--space-4)]">
            <RingStats items={[[event.students, "Students"], [event.pros ?? 0, "Pros"], [event.postCount ?? 0, "Posts"]]} />
          </div>
        )}
        <div className="relative z-10 mt-[var(--space-4)] flex w-full items-center justify-between border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${eventInk} 18%, transparent)` }}>
          <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${eventInk} 74%, transparent)` }}>
            <ShieldCheck className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${pAccent} 70%, ${eventInk})` }} />
            Attendees + event pros only
          </span>
        </div>
      </section>

      {/* Six clearly separated rooms instead of one long stacked scroll
         (direct feedback, 5 Sept 2026): Questions is the tab a reader lands
         on, with the ask composer at its very top. */}
      <Segmented
        ariaLabel="Event board section"
        value={tab}
        onChange={(key) => onFilter(key)}
        options={[
          { key: "questions", label: "Questions" },
          { key: "posts", label: "Posts" },
          { key: "insights", label: "Insights" },
          { key: "resources", label: "Resources" },
          { key: "people", label: "People" },
          { key: "about", label: "About" },
        ]}
      />

      {tab === "questions" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <InlineAsk
            joined
            accent={pAccent}
            placeholder="Ask what you missed…"
            onPost={(text) => setPostedQs((current) => [{ id: `${event.id}-local-${current.length}`, title: text }, ...current])}
          />
          {postedQs.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
          {threads.map((t) => <QuestionCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} {...cardProps(t.id, "question")} />)}
          {threads.length === 0 && postedQs.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>No questions here yet. Yours could be the first.</p>
          )}
        </div>
      )}

      {tab === "posts" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {/* The official Dream Opportunity post (CEO, 4 Sept): the event keeps
             going after the day ends. Rows and short lists, no essay. */}
          {event.official && (
            <Card accent={pAccent}>
              <div className="flex items-center gap-[10px]">
                <span className="flex h-[36px] w-[36px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 55%, transparent)" }}>
                  <LetterMark name="Dream Opportunity" ink="#FFFFFF" letterHeight={14} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-[5px] text-[14px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>Dream Opportunity <ShieldCheck className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--accent-subtle)" }} /></span>
                  <span className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Official event account · {event.official.postedAgo}</span>
                </span>
              </div>
              <p className="mt-[12px] text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{event.official.summary}</p>
              <p className="mt-[10px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{event.official.about}</p>
              <p className="mt-[14px] text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>What to do next</p>
              <ul className="mt-[6px] flex flex-col gap-[6px]">
                {event.official.next.map((line, i) => (
                  <li key={line} className="flex items-start gap-[10px] text-[14px] leading-[19px]" style={{ color: "var(--foreground)" }}>
                    <span className="mt-[1px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: `color-mix(in srgb, ${pAccent} 30%, transparent)`, color: "var(--foreground)" }}>{i + 1}</span>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-[14px] flex flex-wrap gap-[8px]">
                <QuietCta onClick={() => onOpenCommunity?.(event.official!.communityId)}>Keep talking in {event.official.communityName} <ArrowRight className="h-[14px] w-[14px]" aria-hidden /></QuietCta>
              </div>
            </Card>
          )}

          {/* Pinned host recap with three takeaways (handoff 10.3) */}
          {event.recap && (
            <Card>
              <span className="flex items-center gap-[6px] text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
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
                <QuietCta onClick={onSaveTakeaway} done={takeawaySaved}>{!takeawaySaved && <Bookmark className="h-4 w-4" aria-hidden />} {takeawaySaved ? "Takeaway saved" : "Save a takeaway"}</QuietCta>
                <QuietCta onClick={() => { setPlanAdded(true); onAddToPlan(); }} done={planAdded}>{!planAdded && <ArrowRight className="h-4 w-4" aria-hidden />} Add to my Plan</QuietCta>
              </div>
            </Card>
          )}

          {!event.official && !event.recap && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>No posts from the event account yet.</p>
          )}
        </div>
      )}

      {tab === "insights" && (
        <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Professional insights from this event will appear here after the answer round.</p>
      )}

      {tab === "resources" && (
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* Photos first: a gallery of the day, not a text link (direct
             feedback, 5 Sept 2026). One big frame, four small, the last one
             carries the rest of the count. Tap opens a viewer; view-only. */}
          {event.photos && (
            <section aria-label="Event photos" className="flex flex-col gap-[var(--space-3)]">
              <div className="flex items-baseline justify-between gap-[var(--space-3)]">
                <SectionHead>Photos</SectionHead>
                <span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><Images className="h-3.5 w-3.5" aria-hidden /> {event.photos.count} photos</span>
              </div>
              {/* four columns, two rows: the first frame takes the left half, four more fill the right */}
              <ul className="grid grid-cols-4 grid-rows-2 gap-[6px] sm:gap-[8px]" style={{ aspectRatio: "2 / 1" }}>
                {event.photos.images.slice(0, 5).map((src, index) => {
                  const last = index === 4;
                  const more = event.photos!.count - 5;
                  return (
                    <li key={src} className={`relative min-h-0 ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                      <button type="button" onClick={() => setPhotoOpen(index)} aria-label={`Open photo ${index + 1} of ${event.photos!.count}`} className="dm-tap group relative block h-full w-full cursor-pointer overflow-hidden rounded-[var(--radius-md)]" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
                        <Image src={src} alt="" fill sizes={index === 0 ? "(max-width: 992px) 66vw, 640px" : "(max-width: 992px) 33vw, 320px"} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                        {last && more > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[18px] font-extrabold" style={{ background: "rgba(9,10,20,0.58)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}>+{more}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Files: the icon says what it is, the title says which, one small
             line says how much. Nothing else until you tap: a folder opens
             to list what it holds (progressive disclosure, 5 Sept 2026). */}
          <section aria-label="Event files" className="flex flex-col gap-[var(--space-3)]">
            <SectionHead>Files</SectionHead>
            {event.resources && event.resources.length > 0 ? (
              <ul className="grid gap-[var(--space-3)] sm:grid-cols-2">
                {event.resources.map((r) => {
                  const Icon = RESOURCE_LOOK[r.kind].Icon;
                  const isFolder = r.kind === "folder" && !!r.items;
                  const open = openFolder === r.title;
                  return (
                    <li key={r.title} className="min-w-0">
                      <button
                        type="button"
                        aria-expanded={isFolder ? open : undefined}
                        onClick={() => { if (isFolder) setOpenFolder(open ? null : r.title); else dispatchAuroraPulse("select"); }}
                        className="dm-tap group flex h-full w-full cursor-pointer flex-col rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
                        style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--glass-border)" }}
                      >
                        <span className="flex items-center gap-[12px]">
                          <span className="relative flex size-[44px] flex-none items-center justify-center rounded-[10px]" style={{ background: "color-mix(in srgb, var(--primary) 22%, var(--glass-surface-1))", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 40%, transparent)" }}>
                            {r.kind === "folder" && <span aria-hidden className="absolute top-[-4px] right-[6px] h-[6px] w-[22px] rounded-t-[3px]" style={{ background: "color-mix(in srgb, var(--primary) 55%, var(--glass-surface-1))" }} />}
                            <Icon className="h-[22px] w-[22px]" aria-hidden style={{ color: "var(--accent-subtle)" }} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                            <span className="block text-[12.5px] leading-[17px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.meta}</span>
                          </span>
                          {isFolder ? (
                            <ChevronDown className="h-4 w-4 flex-none transition-transform duration-200" aria-hidden style={{ color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none" }} />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-none transition-transform duration-200 group-hover:translate-x-[2px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                          )}
                        </span>
                        {isFolder && open && (
                          <ul className="filters-reveal mt-[var(--space-3)] flex flex-col border-t pt-[var(--space-2)]" style={{ borderColor: RULE }}>
                            {r.items!.map((item) => (
                              <li key={item} className="flex items-center gap-[8px] py-[7px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--foreground)" }}>
                                <FileText className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} /> {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Nothing posted yet.</p>
            )}
          </section>

          {/* the viewer: one photo large, the count, previous and next; Escape or the X closes */}
          {photoOpen !== null && event.photos && typeof document !== "undefined" && createPortal(
            <div role="dialog" aria-modal="true" aria-label={`Photo ${photoOpen + 1} of ${event.photos.count}`} className="fixed inset-0 z-[95] flex flex-col items-center justify-center p-4 sm:p-8" style={{ background: "rgba(6,7,16,0.9)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
              <button type="button" aria-label="Close" onClick={() => setPhotoOpen(null)} className="absolute inset-0 cursor-default" />
              <div className="relative z-[1] flex w-full max-w-[1100px] flex-col gap-[var(--space-3)]">
                <div className="flex items-center justify-between text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                  <span>{event.name} · Photo {photoOpen + 1} of {event.photos.count}</span>
                  <button type="button" onClick={() => setPhotoOpen(null)} aria-label="Close" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)]" style={{ aspectRatio: "16 / 9", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.9)" }}>
                  <Image key={photoOpen} src={event.photos.images[photoOpen % event.photos.images.length]} alt="" fill sizes="1100px" className="object-cover motion-safe:animate-[fade-slide-up_0.35s_ease-out_both]" priority />
                  <button type="button" aria-label="Previous photo" onClick={() => setPhotoOpen((i) => (i === null ? 0 : (i - 1 + event.photos!.images.length) % event.photos!.images.length))} className="dm-quiet absolute top-1/2 left-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(9,10,20,0.6)", color: "#FFFFFF" }}>
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button type="button" aria-label="Next photo" onClick={() => setPhotoOpen((i) => (i === null ? 0 : (i + 1) % event.photos!.images.length))} className="dm-quiet absolute top-1/2 right-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(9,10,20,0.6)", color: "#FFFFFF" }}>
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <ul className="flex justify-center gap-[6px]">
                  {event.photos.images.map((src, i) => (
                    <li key={src}>
                      <button type="button" aria-label={`Photo ${i + 1}`} onClick={() => setPhotoOpen(i)} className="relative block h-[44px] w-[64px] cursor-pointer overflow-hidden rounded-[6px]" style={{ boxShadow: i === photoOpen ? "0 0 0 2px var(--primary)" : "inset 0 0 0 1px rgba(255,255,255,0.15)", opacity: i === photoOpen ? 1 : 0.6 }}>
                        <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>,
            document.body,
          )}
        </div>
      )}

      {tab === "people" && (
        <div className="flex flex-col gap-[var(--space-5)]">
          <div className="flex flex-col gap-[8px]">
            <SectionHead>Professionals</SectionHead>
            {eventPros.length > 0 ? (
              <div className="flex flex-col gap-[var(--space-3)]">
                {eventPros.map((p) => (
                  <div key={p.id} className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--glass-border)" }}>
                    <ProBadge proId={p.id} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>No verified professionals listed for this event yet.</p>
            )}
          </div>
          <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
            <SectionHead>Students</SectionHead>
            <p className="text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
              <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{event.students ?? 0}</strong> students attended. Names stay private here; you will meet people through the Questions and Posts tabs.
            </p>
          </div>
        </div>
      )}

      {tab === "about" && (
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--glass-border)" }}>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Hosted by</span>
            <div className="flex flex-wrap gap-[6px]">
              {event.orgs.map((name) => <CompanyChip key={name} name={name} tone="surface" />)}
            </div>
          </div>
          <div className="flex flex-col gap-[6px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Topics</span>
            <div className="flex flex-wrap gap-[6px]">
              {event.topics.map((name) => (
                <span key={name} className="rounded-[var(--radius-sm)] border px-[11px] py-[3px] text-[12px] leading-[17px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>{name}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-[6px] border-t pt-[var(--space-4)] text-[13px] leading-[19px]" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-[6px]"><Calendar className="h-[13px] w-[13px] flex-none" aria-hidden /> {event.nextDate ? `Next: ${event.nextDate} · Last: ${event.date}` : `Last: ${event.date}`}</span>
            <span className="flex items-center gap-[6px]"><MapPin className="h-[13px] w-[13px] flex-none" aria-hidden /> {event.location}</span>
            {event.closesOn && <span className="flex items-center gap-[6px]"><ShieldCheck className="h-[13px] w-[13px] flex-none" aria-hidden /> This board closes to new questions on {event.closesOn}.</span>}
          </div>
        </div>
      )}
    </>
  );
}// ——— thread (handoff 12) ———

function ThreadView({
  thread,
  onBack,
  onOpenThread,
  cardProps,
  saves,
  toggleSave,
  helpfuls,
  toggleHelpful,
}: {
  thread: Thread;
  onBack: () => void;
  onOpenThread: (id: string) => void;
  cardProps: (id: string, what?: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
  saves: Record<string, boolean>;
  toggleSave: (id: string, what?: string) => void;
  helpfuls: Record<string, boolean>;
  toggleHelpful: (id: string) => void;
}) {
  const boardCommunity = COMMUNITIES.find((c) => c.id === thread.boardId);
  const boardName = eventById(thread.boardId)?.name ?? boardCommunity?.name ?? "Community";
  const boardAccent = boardCommunity ? communityAccent(boardCommunity) : EVENT_ACCENT;
  const related = ALL_THREADS.filter((t) => t.boardId === thread.boardId && t.id !== thread.id && (t.state === "answered" || t.state === "resolved")).slice(0, 2);
  const p = cardProps(thread.id, "question");
  const nav = useContext(ConnectNav);
  const [posted, setPosted] = useState<LocalReply[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleCollapsed = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {boardName}
      </button>

      <article className="flex flex-col gap-[var(--space-5)]">
        <div>
          <h1 className="text-[20px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{thread.title}</h1>
          {thread.context && <p className="mt-[6px] text-[13.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{thread.context}</p>}
          <div className="mt-[10px]"><IdentityBadge handle={thread.handle} grade={thread.grade} postedAgo={thread.postedAgo} /></div>
        </div>

        <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[4px] text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>
          <StatusChip state={thread.state} />
          {/* the question's likes live up here with the question, not at the
             bottom of the answer (direct feedback) */}
          <button type="button" onClick={() => toggleHelpful(thread.id)} aria-pressed={!!helpfuls[thread.id]} className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-[var(--radius-sm)] px-[8px] text-[12.5px] font-semibold" style={{ color: helpfuls[thread.id] ? "var(--accent-subtle)" : "var(--foreground)" }}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {thread.helpful + (helpfuls[thread.id] ? 1 : 0)}
          </button>
        </div>

        {/* A solid, edge-to-edge surface for the whole reply stream --
           answers, comments, the composer, Save/Share -- so the question
           itself reads as its own thing above a clearly separate "replies"
           zone, not one continuous gradient wash (direct feedback: "the
           area under the question... should be a solid black or dark blue
           color instead of having the background with the gradients...
           the div line... can run edge to edge"). True viewport-edge
           bleed at every width (direct feedback: "no need to limit its
           width on larger screens") -- relative+left/right 50% with a
           matching negative margin breaks out of the page's own centered
           max-w container regardless of how deep it's nested, not just
           out of <main>'s side padding. Re-applies that padding inside so
           the content still lines up with the title above it. */}
        <div className="relative left-1/2 right-1/2 w-screen border-t" style={{ marginLeft: "-50vw", marginRight: "-50vw", background: "var(--background)", borderColor: "var(--glass-border)" }}>
          <div className="mx-auto flex max-w-[992px] flex-col gap-[var(--space-5)] px-5 py-[var(--space-5)] sm:px-[var(--space-14)]">
        <CommentStream>
          {(() => {
            // Every answer is its own top-level branch on the main trunk;
            // every reply that FOLLOWS an answer (until the next one)
            // belongs to it -- exactly the read a person gets looking at
            // the thread (direct feedback: "the bake sale comment and the
            // one under it seem like replies to the top answer, Andre and
            // Keiko seem like direct replies to the question" -- that's
            // literally what the array order already means; it just
            // wasn't drawn that way). One curved branch per answer serves
            // every one of its replies, the way Reddit draws one line for
            // a whole sub-thread, not one curve per reply.
            type AnswerResponse = Extract<Thread["responses"][number], { kind: "answer" }>;
            type ReplyResponse = Exclude<Thread["responses"][number], { kind: "answer" }>;
            type Group = { rid: string; answer: AnswerResponse; children: { index: number; r: ReplyResponse }[] };
            const groups: Group[] = [];
            thread.responses.forEach((r, index) => {
              if (r.kind === "answer") {
                groups.push({ rid: thread.id + "-a" + index, answer: r, children: [] });
              } else if (groups.length > 0) {
                groups[groups.length - 1].children.push({ index, r });
              }
            });

            return groups.map((g) => (
              <div key={g.rid} className="flex flex-col gap-[var(--space-4)]">
                <AnswerRow
                  r={g.answer}
                  rid={g.rid}
                  threadId={thread.id}
                  threadTitle={thread.title}
                  collapsed={!!collapsed[g.rid]}
                  onToggleCollapse={() => toggleCollapsed(g.rid)}
                  helpfuls={helpfuls}
                  toggleHelpful={toggleHelpful}
                  saves={saves}
                  toggleSave={toggleSave}
                />
                {g.children.length > 0 && (
                  <FollowupBranch>
                    <CommentStream>
                      {g.children.map(({ index, r }) => {
                        if (r.kind === "followup") {
                          // A follow-up carries no name of its own -- it's
                          // the same pro continuing their answer, so it
                          // borrows that pro's identity for its avatar.
                          const fid = thread.id + "-f" + index;
                          const pro = proById(g.answer.proId);
                          return <CommentRow key={fid} id={fid} name={pro.name} chip="Pro" chipTone="pro" body={r.body} postedAgo={r.postedAgo} likes={0} liked={!!helpfuls[fid]} onLike={toggleHelpful} collapsed={!!collapsed[fid]} onToggleCollapse={() => toggleCollapsed(fid)} />;
                        }
                        const pid = thread.id + "-p" + index;
                        return <CommentRow key={pid} id={pid} name={r.handle} chip="Student" meta={r.grade} chipTone="student" body={r.body} postedAgo={r.postedAgo} likes={r.likes ?? 0} liked={!!helpfuls[pid]} onLike={toggleHelpful} image={r.image} imageAlt={r.imageAlt} collapsed={!!collapsed[pid]} onToggleCollapse={() => toggleCollapsed(pid)} />;
                      })}
                    </CommentStream>
                  </FollowupBranch>
                )}
              </div>
            ));
          })()}
        </CommentStream>

        {thread.responses.length === 0 && (
          <Card>
            <p className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>No answer yet.</p>
            <p className="mt-[4px] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Sent to verified pros in {boardName}. Usually answered {thread.expectedWindow}.</p>
          </Card>
        )}

        {posted.length > 0 && (
          <CommentStream>
            {posted.map((reply) => (
              <CommentRow key={reply.id} id={reply.id} name="Jordan" chip="Student" meta="Junior" chipTone="student" body={reply.body} postedAgo="Just now" likes={0} liked={!!helpfuls[reply.id]} onLike={toggleHelpful} collapsed={!!collapsed[reply.id]} onToggleCollapse={() => toggleCollapsed(reply.id)} />
            ))}
          </CommentStream>
        )}
        <ReplyComposer onPost={(text) => setPosted((current) => [...current, { id: `${thread.id}-local-${current.length}`, body: text }])} />

        <div className="flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <button type="button" onClick={p.onSave} aria-pressed={p.saved} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: p.saved ? "var(--accent-subtle)" : undefined }}>
            <Bookmark className="h-3.5 w-3.5" aria-hidden /> {p.saved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={() => nav?.share(`?thread=${thread.id}`, thread.title)} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]">
            <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
          </button>
          <button type="button" onClick={() => nav?.report(thread.id)} className="dm-link ml-auto flex min-h-[44px] cursor-pointer items-center gap-[4px] text-[11px] opacity-55 hover:opacity-100">
            <Flag className="h-3 w-3" aria-hidden /> Report
          </button>
        </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }} aria-label="Related answered questions">
            <SectionHead>Related answered questions</SectionHead>
            {related.map((t) => (
              <button key={t.id} type="button" onClick={() => onOpenThread(t.id)} className="dm-quiet group flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={{ background: `color-mix(in srgb, ${boardAccent} 9%, var(--card))`, borderColor: `color-mix(in srgb, ${boardAccent} 26%, var(--glass-border))` }}>
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

/** Seeded like count for an answer (the data carries likes per thread, not
 *  per answer): the top answer leads, the others trail it. */
function answerLikes(rid: string, primary?: boolean): number {
  let h = 2166136261;
  for (let i = 0; i < rid.length; i++) { h ^= rid.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (primary ? 120 : 24) + ((h >>> 0) % (primary ? 180 : 60));
}

/** A run of replies under one answer: no card boxes, one continuous
 *  trunk line down the left like Reddit — the line never breaks between
 *  replies, only where an answer (a new "message", not a reply) starts. */
// Reddit's own thread line is drawn from avatar CENTER to avatar center,
// not from a padded edge -- every row in the stream uses a 32px avatar
// (space-4, 16px, is exactly half of that), so the trunk sits at x=16px
// and a nested reply's elbow lands precisely on ITS avatar's center too,
// instead of a straight line disconnected from anyone's face.
// OPAQUE, not a transparent tint -- the elbow and the trunk necessarily
// overlap where a follow-up branches off, and two translucent layers
// stacked on top of each other compound into a visibly brighter seam
// right at that overlap (direct feedback: "it looks bad, not properly
// designed"). Mixing toward the opaque page background instead of
// "transparent" keeps it a single flat color no matter how many shapes
// paint over the same pixels -- which is also how Reddit's own lines
// stay a single flat gray at every junction.
const THREAD_LINE = "color-mix(in srgb, var(--foreground) 26%, var(--background))";
const AVATAR_CENTER = 16; // px: half of the 32px avatar every row here uses
const ROW_GAP = 16; // px: the gap between stacked rows (space-4)
const INDENT = 44; // px: one avatar (32) + a nesting indent -- one level

/** The trunk, drawn per-row instead of as one span sized to the whole
 *  container. A single absolutely-positioned line from "container top" to
 *  "container bottom" only lands on the LAST avatar's center by accident --
 *  the container's real bottom edge is wherever that row's own body text
 *  and reactions end, which varies per reply, so the line either fell
 *  short of or ran past the last avatar (direct feedback: "this line
 *  should end at Ruby's avatar circle, not extend beyond it and sit
 *  awkwardly"). Anchoring each segment to ITS OWN row's avatar center --
 *  and only drawing one for a row that HAS a next sibling -- means the
 *  trunk is exactly as long as the replies are, never longer. */
function CommentStream({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children);
  return (
    <div className="flex flex-col">
      {items.map((child, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="relative isolate">
            {/* `isolate` (not just `relative`) is load-bearing: a negative
               z-index only paints behind THIS row's own background if this
               row actually forms its own stacking context. `relative`
               alone doesn't -- without a z-index of its own, it has none,
               so the trunk escaped upward looking for the nearest one that
               did, which used to be harmless when there was nothing opaque
               in between. Once the reply stream sat on its own solid
               background (direct feedback: "a solid black or dark blue
               color instead of the gradients"), that escape put the trunk
               BEHIND the new opaque surface -- invisible, while the
               elbow (a plain border, no z-index trick) kept showing fine
               (direct feedback: "only the curved lines are visible"). */}
            {!isLast && (
              <span aria-hidden className="pointer-events-none absolute z-[-1] w-[2px]" style={{ top: AVATAR_CENTER, height: `calc(100% - ${AVATAR_CENTER}px + ${ROW_GAP}px + ${AVATAR_CENTER}px)`, left: AVATAR_CENTER - 1, background: THREAD_LINE }} />
            )}
            {child}
            {!isLast && <div style={{ height: ROW_GAP }} aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}

/** A follow-up branching off the trunk: a rounded elbow curves out of the
 *  vertical line, landing exactly on THIS reply's own avatar CENTER --
 *  not its edge. The center is what matters: when the branch holds more
 *  than one reply, CommentStream draws a second, continuing trunk at
 *  that same avatar-center x -- stopping the curve at the avatar's edge
 *  instead left that continuing line 16px off from the curve, a visible
 *  kink (direct feedback: "alignment issues on the main threadline and
 *  the curved one nested on it"). Landing on the center instead means
 *  both lines share one x-coordinate, and the curve's last few pixels
 *  simply disappear behind the (opaque) avatar circle, same as Reddit. */
function FollowupBranch({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ marginLeft: INDENT }}>
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-bl-[16px]"
        style={{
          // The trunk (CommentStream) is a `background` span centered on
          // x=AVATAR_CENTER, occupying [AVATAR_CENTER-1, AVATAR_CENTER+1].
          // A CSS border instead draws OUTWARD from its box edge, so
          // matching only the box's nominal x (not this -1px offset) left
          // the two lines 1px apart -- close enough to read as "almost
          // aligned, but off" (direct feedback: "one is slightly off to
          // the side"). The -1 here is that same correction, so both
          // lines occupy the exact same pixels.
          top: -(AVATAR_CENTER + 8),
          left: -(INDENT - AVATAR_CENTER) - 1,
          width: INDENT + 1,
          height: 2 * AVATAR_CENTER + 8,
          borderLeft: `2px solid ${THREAD_LINE}`,
          borderBottom: `2px solid ${THREAD_LINE}`,
        }}
      />
      {children}
    </div>
  );
}

// ——— comments: one shape everywhere ———

const EXTRA_REACTIONS = ["🔥", "💯"] as const;

/** Deterministic seeded counts so reaction chips look lived-in without
 *  Math.random (render purity). */
function seededReactions(id: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return EXTRA_REACTIONS.map((_, i) => ((h >> (i * 5)) % 8) + 1);
}

/** The like button grown up: 👍 plus tap-to-react emoji, the same
 *  vocabulary as the GIFs in the threads. One row, one shape, everywhere. */
function ReactionRow({ id, likes, liked, onLike }: { id: string; likes: number; liked: boolean; onLike: (id: string) => void }) {
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const seeds = seededReactions(id);
  const chip = "dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-[var(--radius-md)] border px-[10px] text-[11.5px] leading-[15px] font-semibold transition-transform duration-150 active:scale-90";
  const offStyle = { borderColor: "var(--glass-border)", color: "var(--muted-foreground)", background: "transparent" };
  const onStyle = { borderColor: "color-mix(in srgb, var(--accent-subtle) 55%, transparent)", background: "color-mix(in srgb, var(--accent-subtle) 14%, transparent)", color: "var(--accent-subtle)" };
  return (
    <div className="mt-[6px] flex flex-wrap items-center gap-[6px]">
      <button type="button" onClick={() => onLike(id)} aria-pressed={liked} className={chip} style={liked ? onStyle : offStyle}>
        <ThumbsUp className="h-3 w-3" aria-hidden /> {likes + (liked ? 1 : 0)}
      </button>
      {EXTRA_REACTIONS.map((emoji, index) => {
        const on = !!mine[emoji];
        const count = seeds[index] + (on ? 1 : 0);
        return (
          <button key={emoji} type="button" aria-pressed={on} aria-label={`React ${emoji}`} onClick={() => setMine((m) => ({ ...m, [emoji]: !m[emoji] }))} className={chip} style={on ? onStyle : offStyle}>
            <span aria-hidden>{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** The pro's answer, in the exact same flat shape as every reply below it
 *  (direct feedback, 8 Sept 2026: "why is Andre's comment a card" -- Reddit
 *  never gives one reply its own box, only badges say it's the notable
 *  one). Lives in the SAME CommentStream as the replies underneath it, so
 *  the thread line runs straight through both without a visual seam. */
function AnswerRow({ r, rid, threadId, threadTitle, collapsed, onToggleCollapse, helpfuls, toggleHelpful, saves, toggleSave }: {
  r: Extract<Thread["responses"][number], { kind: "answer" }>;
  rid: string;
  threadId: string;
  threadTitle: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  helpfuls: Record<string, boolean>;
  toggleHelpful: (id: string) => void;
  saves: Record<string, boolean>;
  toggleSave: (id: string, what?: string) => void;
}) {
  const pro = proById(r.proId);
  const nav = useContext(ConnectNav);
  return (
    <div className="flex items-start gap-[12px]">
      {/* ProAvatar is already its own button (opens the profile) -- the
         collapse toggle lives on the header row instead of double-nesting
         buttons here. */}
      <ProAvatar proId={pro.id} name={pro.name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[6px]">
          <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link flex cursor-pointer items-center gap-[4px] text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={13} /></button>
          <CompanyChip name={pro.org} tone="surface" size="sm" />
          {nav && <FollowButton dense following={nav.isFollowing(pro.id)} onToggle={() => nav.toggleFollow(pro.id)} />}
          <button type="button" onClick={onToggleCollapse} aria-expanded={!collapsed} className="dm-link ml-auto flex cursor-pointer items-center gap-[3px] text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {r.postedAgo}
            <ChevronDown className={collapsed ? "h-3 w-3 -rotate-90 transition-transform" : "h-3 w-3 transition-transform"} aria-hidden />
          </button>
        </div>
        {collapsed ? (
          <p className="mt-[3px] text-[12px] leading-[16px] italic" style={{ color: "var(--muted-foreground)" }}>Answer collapsed</p>
        ) : (
          <>
            {/* Top answer moved off the crowded header row (direct
               feedback: "everyone has so many badges/chips right now") --
               a small label of its own, right where the answer it's
               praising actually starts. */}
            {r.primary && (
              <span className="mt-[6px] flex items-center gap-[4px] text-[10.5px] leading-[14px] font-extrabold tracking-[0.05em] uppercase" style={{ color: "var(--world-food-farming-nature)" }}>
                <Sparkles className="h-3 w-3" aria-hidden /> Top answer
              </span>
            )}
            <p className="mt-[5px] text-[14px] leading-[21px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
            {r.disclosure && <p className="mt-[6px] text-[11px] leading-[15px] italic" style={{ color: "var(--muted-foreground)" }}>{r.disclosure}</p>}
            <div className="mt-[8px] flex flex-wrap items-center gap-[var(--space-4)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <button type="button" onClick={() => toggleHelpful(rid)} aria-pressed={!!helpfuls[rid]} className="dm-link flex min-h-[30px] cursor-pointer items-center gap-[5px] tabular-nums" style={{ color: helpfuls[rid] ? "var(--accent-subtle)" : undefined }}>
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {answerLikes(rid, r.primary) + (helpfuls[rid] ? 1 : 0)}
              </button>
              <button type="button" onClick={() => toggleSave(rid, "answer")} aria-pressed={!!saves[rid]} className="dm-link flex min-h-[30px] cursor-pointer items-center gap-[5px]" style={{ color: saves[rid] ? "var(--accent-subtle)" : undefined }}>
                <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saves[rid] ? "Saved" : "Save"}
              </button>
              <button type="button" onClick={() => nav?.share(`?thread=${threadId}`, threadTitle)} className="dm-link flex min-h-[30px] cursor-pointer items-center gap-[5px]">
                <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
              </button>
              <button type="button" onClick={() => nav?.report(rid)} aria-label="Report this answer" className="dm-link ml-auto flex min-h-[30px] cursor-pointer items-center gap-[4px] text-[11px] opacity-55 hover:opacity-100">
                <Flag className="h-3 w-3" aria-hidden /> Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** A comment under an insight or thread: avatar, name + role chip, the
 *  line itself, then a working like button and the time. `likes` is the
 *  seeded count; the toggle adds the student's own on top. */
function CommentRow({ id, name, chip, chipTone, meta, body, postedAgo, likes, liked, onLike, image, imageAlt, collapsed, onToggleCollapse }: { id: string; name: string; chip: string; chipTone: "pro" | "student"; meta?: string; body: string; postedAgo: string; likes: number; liked: boolean; onLike: (id: string) => void; image?: string; imageAlt?: string; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const tone = chipTone === "pro" ? "var(--world-food-farming-nature)" : "var(--accent-subtle)";
  const nav = useContext(ConnectNav);
  // a professional's face and name open their profile; students have none
  const pro = chipTone === "pro" ? PROS.find((p) => p.name === name) : undefined;
  return (
    <div className="flex items-start gap-[12px]">
      {/* ProAvatar is already its own button (opens the profile) -- only a
         student's plain (non-button) avatar can also serve as the collapse
         toggle without nesting a button inside a button. */}
      {pro ? (
        <ProAvatar proId={pro.id} name={name} size={32} />
      ) : (
        <button type="button" onClick={onToggleCollapse} aria-expanded={!collapsed} aria-label={collapsed ? `Expand ${name}'s comment` : `Collapse ${name}'s comment`} className="dm-quiet flex-none cursor-pointer rounded-full">
          <Avatar name={name} size={32} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[6px]">
          {pro ? (
            <>
              <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link flex cursor-pointer items-center gap-[4px] text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{name} <VerifiedBadge size={13} /></button>
            </>
          ) : (
            <>
              <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{name}</span>
              <span className="rounded-[var(--radius-sm)] border px-[8px] py-[1px] text-[10.5px] leading-[15px] font-bold" style={{ borderColor: `color-mix(in srgb, ${tone} 50%, var(--glass-border))`, color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>{chip}</span>
            </>
          )}
          {meta && <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{meta}</span>}
          <button type="button" onClick={onToggleCollapse} aria-expanded={!collapsed} className="dm-link ml-auto flex cursor-pointer items-center gap-[3px] text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {postedAgo}
            <ChevronDown className={collapsed ? "h-3 w-3 -rotate-90 transition-transform" : "h-3 w-3 transition-transform"} aria-hidden />
          </button>
        </div>
        {collapsed ? (
          <p className="mt-[3px] text-[12px] leading-[16px] italic" style={{ color: "var(--muted-foreground)" }}>Comment collapsed</p>
        ) : (
          <>
            <p className="mt-[5px] text-[13.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{body}</p>
            {/* Reaction GIFs between pros and students are deliberate (the doc
               shows them; it's a pitch beat about speaking Gen Z) -- rendered
               unoptimized so the animation actually plays. */}
            {image && (
              <Image src={image} alt={imageAlt ?? ""} width={356} height={200} unoptimized className="mt-[8px] h-auto w-[200px] max-w-full rounded-[var(--radius-lg)] sm:w-[220px]" style={{ background: "var(--glass-surface-1)" }} />
            )}
            <div className="flex flex-wrap items-center gap-[10px]">
              <ReactionRow id={id} likes={likes} liked={liked} onLike={onLike} />
              <button type="button" onClick={focusReplyComposer} className="dm-link mt-[6px] flex min-h-[30px] cursor-pointer items-center gap-[4px] text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <CornerDownRight className="h-3 w-3" aria-hidden /> Reply
              </button>
              <button type="button" onClick={() => nav?.report(id)} aria-label="Report this comment" className="dm-link mt-[6px] ml-auto flex min-h-[30px] cursor-pointer items-center gap-[4px] text-[11px] leading-[15px] font-semibold opacity-55 hover:opacity-100" style={{ color: "var(--muted-foreground)" }}>
                <Flag className="h-3 w-3" aria-hidden /> Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The reply box at the foot of a thread: type, post, and the comment
 *  appears immediately as the signed-in student ("Jordan · Junior"). */
function focusReplyComposer() {
  const box = document.getElementById("dm-reply-composer");
  box?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => box?.querySelector("textarea")?.focus(), 350);
}

function ReplyComposer({ onPost }: { onPost: (text: string) => void }) {
  const [text, setText] = useState("");
  const blocked = CONTACT_INFO.test(text);
  const submit = () => {
    if (!text.trim() || blocked) return;
    dispatchAuroraPulse("cta");
    onPost(text.trim());
    setText("");
  };
  return (
    <div id="dm-reply-composer" className="flex items-start gap-[12px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--card))", borderColor: "var(--glass-border)" }}>
      <Avatar name="Jordan Rivera" size={32} />
      <div className="min-w-0 flex-1">
        <label className="block">
          <span className="sr-only">Add a comment</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
            maxLength={280}
            rows={2}
            placeholder="Add a comment…"
            className="w-full resize-none rounded-[var(--radius-md)] border p-[10px] text-[13px] leading-[19px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
            style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}
          />
        </label>
        {blocked && <p role="alert" className="mt-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</p>}
        <div className="mt-[8px] flex items-center justify-between gap-[var(--space-3)]">
          <span className="text-[11px] leading-[15px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>Posts as Jordan · Junior{text.length > 200 ? ` · ${280 - text.length} left` : ""}</span>
          <button type="button" onClick={submit} disabled={!text.trim() || blocked} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[5px] rounded-[var(--radius-md)] px-[15px] text-[12px] leading-[16px] font-semibold disabled:cursor-default disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            Post <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/** A local, this-session comment the student just posted. */
type LocalReply = { id: string; body: string };

// ——— insight thread (a Professional Insight, opened) ———

function InsightThreadView({
  insight,
  onBack,
  saved,
  onSave,
  helpful,
  onHelpful,
  helpfuls,
  toggleHelpful,
}: {
  insight: Insight;
  onBack: () => void;
  saved: boolean;
  onSave: () => void;
  helpful: boolean;
  onHelpful: () => void;
  helpfuls: Record<string, boolean>;
  toggleHelpful: (id: string) => void;
}) {
  const pro = proById(insight.proId);
  const boardCommunity = COMMUNITIES.find((c) => c.id === insight.boardId);
  const boardName = boardCommunity?.name ?? "Community";
  const nav = useContext(ConnectNav);
  const [posted, setPosted] = useState<LocalReply[]>([]);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {boardName}
      </button>

      <article className="flex flex-col gap-[var(--space-5)]">
        {/* Plain on the page's own colored backdrop, same as ThreadView's
           header -- no bordered/tinted card box (direct feedback, 9 Sept
           2026: "the professional insight opened page should also follow
           the question page ... on top with the colored backdrop"). */}
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--world-food-farming-nature)" }}>Professional insight</span>
          <h1 className="mt-[6px] text-[20px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{insight.title}</h1>
          <div className="mt-[12px]"><ProBadge proId={insight.proId} postedAgo={insight.postedAgo} size={38} /></div>
          <p className="mt-[14px] text-[13.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>{insight.body}</p>
          <p className="mt-[10px] text-[11px] leading-[15px] italic" style={{ color: "var(--muted-foreground)" }}>{pro.verifiedBy}</p>
        </div>

        <div className="flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Like · {insight.helpful + (helpful ? 1 : 0)}
          </button>
          <button type="button" onClick={onSave} aria-pressed={saved} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]" style={{ color: saved ? "var(--accent-subtle)" : undefined }}>
            <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={() => nav?.share(`?insight=${insight.id}`, insight.title)} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]">
            <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
          </button>
          <button type="button" onClick={() => nav?.report(insight.id)} aria-label="Report this insight" className="dm-link ml-auto flex min-h-[40px] cursor-pointer items-center gap-[4px] text-[11px] opacity-55 hover:opacity-100">
            <Flag className="h-3 w-3" aria-hidden /> Report
          </button>
        </div>

        {/* A solid, edge-to-edge surface for the whole comment stream --
           the exact same full-bleed panel ThreadView uses for its answers
           (direct feedback, 9 Sept 2026), so the insight itself reads as
           its own thing above a clearly separate "comments" zone instead
           of one continuous wash. */}
        <div className="relative left-1/2 right-1/2 w-screen border-t" style={{ marginLeft: "-50vw", marginRight: "-50vw", background: "var(--background)", borderColor: "var(--glass-border)" }}>
          <div className="mx-auto flex max-w-[992px] flex-col gap-[var(--space-4)] px-5 py-[var(--space-5)] sm:px-[var(--space-14)]">
            <h2 className="text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Comments ({insight.replies.length + posted.length})
            </h2>
            {/* Same CommentStream every reply list uses (direct feedback, 9
               Sept 2026: "the insights is missing the thread rails and the
               curved lines etc, do that exactly like the questions, follow
               exact alignments too") -- the trunk line, avatar-center math
               and row spacing all come from the shared component, not a
               plain flex column. */}
            <CommentStream>
              {insight.replies.map((reply, index) => {
                const rid = `${insight.id}-r${index}`;
                const isPro = !!reply.proId;
                return (
                  <CommentRow
                    key={rid}
                    id={rid}
                    name={isPro ? proById(reply.proId!).name : reply.handle!}
                    chip={isPro ? "Professional" : "Student"}
                    meta={isPro ? undefined : reply.grade}
                    chipTone={isPro ? "pro" : "student"}
                    body={reply.body}
                    postedAgo={reply.postedAgo}
                    likes={reply.likes}
                    liked={!!helpfuls[rid]}
                    onLike={toggleHelpful}
                    image={reply.image}
                    imageAlt={reply.imageAlt}
                  />
                );
              })}
              {posted.map((reply) => (
                <CommentRow
                  key={reply.id}
                  id={reply.id}
                  name="Jordan"
                  chip="Junior"
                  chipTone="student"
                  body={reply.body}
                  postedAgo="Just now"
                  likes={0}
                  liked={!!helpfuls[reply.id]}
                  onLike={toggleHelpful}
                />
              ))}
            </CommentStream>
            <ReplyComposer onPost={(text) => setPosted((current) => [...current, { id: `${insight.id}-local-${current.length}`, body: text }])} />
          </div>
        </div>
      </article>
    </>
  );
}

// ——— Ask flow (handoff 11) ———


function JoinSheet({ community, onClose, onJoin }: { community: Community; onClose: () => void; onJoin: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const perks = [
    { title: "Ask verified professionals", body: `People from ${community.professionalsFrom.slice(0, 2).join(" and ")} answer questions here.` },
    { title: "Learn from other students", body: "Read real questions and answers from students on the same path." },
    { title: "Save what helps", body: "Keep answers and insights in your Locker for later." },
  ];
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={community.name}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.6)" }} />
      <div className="relative z-[1] w-full max-w-[480px] overflow-hidden rounded-t-[var(--radius-xl)] border sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        <div className="relative flex items-center gap-[12px] overflow-hidden px-[var(--space-5)] py-[14px]" style={{ background: "#0e0c20", fontFamily: "var(--font-display)" }}>
          <Image src={PHOTO_COVER[community.id] ?? community.photo} alt="" fill sizes="480px" className="object-cover" style={{ objectPosition: PHOTO_FOCUS[community.id] ?? "60% 42%" }} />
          <span aria-hidden className="absolute inset-0" style={{ background: "rgba(14,12,32,0.55)" }} />
          <h2 className="relative z-10 min-w-0 flex-1 text-[16px] leading-[21px] font-extrabold" style={{ color: "#f6f5fb", textShadow: CARD_TEXT_SHADOW }}>{community.name}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet relative z-10 flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(246,245,251,0.18)", color: "#f6f5fb" }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
          {/* No unlock ladder, no points gate (direct feedback): joining is
             one agreement away. What you get, then the ground rules. */}
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-center gap-[12px] py-[6px]">
              <CheckCircle2 aria-hidden className="h-[16px] w-[16px] flex-none" style={{ color: "var(--world-food-farming-nature)" }} />
              <strong className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{perk.title}</strong>
            </div>
          ))}
          <label className="flex cursor-pointer items-start gap-[10px] pt-[2px]">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-[3px] size-4 flex-none accent-[var(--primary)]" />
            <span className="text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}>
              I&apos;ll keep it kind and won&apos;t share personal contact details.
            </span>
          </label>
          <button
            type="button"
            onClick={onJoin}
            disabled={!agreed}
            className="dm-solid flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[13.5px] font-semibold disabled:cursor-default disabled:opacity-50"
            style={{ background: "var(--primary)", color: "#FFFFFF" }}
          >
            Agree &amp; Join
          </button>
        </div>
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
      <div className="relative z-[1] w-full max-w-[480px] rounded-t-[var(--radius-xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        {confirming ? (
          <div aria-live="polite">
            <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase" style={{ color: EVENT_ACCENT }}>You&apos;re on the list</span>
            <h2 className="mt-[4px] text-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{event.name}</h2>
            <p className="mt-[4px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{[event.nextDate ?? event.date, event.time, event.location].filter(Boolean).join(", ")}</p>
            <p className="mt-[10px] text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}>
              This private board is limited to verified attendees and event professionals. Joining adds it to Your events. You won&apos;t need the code again, and access can be managed by the host.
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
              Event codes come from a Dreamari event: on your badge, the closing slide, or the follow-up email. They unlock a private board for attendees.
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
