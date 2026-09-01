"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  Clock,
  Eye,
  MessagesSquare,
  Sparkles,
  Star,
  ExternalLink,
  Flag,
  KeyRound,
  MapPin,
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
  PROS,
  STARTER_PROMPTS,
  THREADS,
  type Community,
  type EventBoard,
  type Insight,
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

type View =
  | { kind: "home"; tab: "communities" | "events" }
  | { kind: "board"; id: string; filter: string }
  | { kind: "event"; id: string; filter: string }
  | { kind: "thread"; id: string }
  | { kind: "insight"; id: string };

function viewToQuery(view: View): string {
  if (view.kind === "home") return view.tab === "communities" ? "" : `?tab=${view.tab}`;
  if (view.kind === "board") return `?board=${view.id}${view.filter !== "questions" ? `&filter=${view.filter}` : ""}`;
  if (view.kind === "event") return `?event=${view.id}${view.filter !== "all" ? `&filter=${view.filter}` : ""}`;
  if (view.kind === "insight") return `?insight=${view.id}`;
  return `?thread=${view.id}`;
}

function queryToView(search: string): View {
  const q = new URLSearchParams(search);
  if (q.get("insight")) return { kind: "insight", id: q.get("insight")! };
  if (q.get("thread")) return { kind: "thread", id: q.get("thread")! };
  if (q.get("event")) return { kind: "event", id: q.get("event")!, filter: q.get("filter") ?? "all" };
  if (q.get("board")) return { kind: "board", id: q.get("board")!, filter: q.get("filter") ?? "questions" };
  const tab = q.get("tab");
  return { kind: "home", tab: tab === "events" ? tab : "communities" };
}

const ALL_THREADS = [...THREADS, ...EVENT_THREADS];

function proById(id: string) {
  return PROS.find((p) => p.id === id)!;
}

function eventById(id: string) {
  return EVENTS.find((e) => e.id === id);
}

/** The one ask affordance. A box you can type into is an invitation; a button
 *  is a door you have to decide to open. Where the question goes is chosen in
 *  the sheet that opens, so this reads the same on every tab. */
// The doc's composer, one for one: a "What do you want to ask?" field with
// AI Ideas / Polish / Post actions along its bottom edge. All three open the
// same Ask flow -- drafting, AI suggestions and posting live in the sheet.
/** Posting happens in place, not in a modal: a collapsed invitation that
 *  expands into a real composer right at the top of the feed. Reading is
 *  free; the first attempt to post in an un-joined community routes
 *  through the join sheet instead (onRequireJoin). */
function InlineAsk({
  joined,
  onRequireJoin,
  onPost,
  placeholder = "Ask this community anything…",
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
    onPost(text.trim());
    setText("");
    setOpen(false);
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => (joined ? setOpen(true) : onRequireJoin?.())}
        className="dm-tap flex min-h-[52px] w-full cursor-pointer items-center gap-[12px] rounded-full border px-[var(--space-4)] text-left"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
      >
        <Avatar name="Jordan Rivera" size={30} />
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>{placeholder}</span>
        <span className="flex flex-none items-center gap-[5px] rounded-full px-[14px] py-[7px] text-[12px] leading-[16px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: "var(--foreground)" }}>
          Ask <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
        </span>
      </button>
    );
  }
  return (
    <div className="rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: "var(--color-glass-surface-3)" }}>
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
        <button type="button" onClick={() => { setOpen(false); setText(""); }} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-full border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={!text.trim()} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-full px-[15px] text-[12px] leading-[16px] font-bold disabled:cursor-default disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
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
    <div className="rounded-[var(--radius-xl)] border p-[var(--space-5)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))" }}>
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

function StatusChip({ state }: { state: Thread["state"] }) {
  return (
    <span className="inline-flex items-center gap-[5px] text-[11px] leading-[15px] font-semibold" style={{ color: STATE_COLOR[state] }}>
      {state === "awaiting" ? <Clock className="h-3 w-3" aria-hidden /> : state === "routed" ? <ArrowRight className="h-3 w-3" aria-hidden /> : <CheckCircle2 className="h-3 w-3" aria-hidden />}
      {STATE_LABEL[state]}
    </span>
  );
}

// Avatar photos are PARKED for the pitch (direct feedback: mixed cartoons
// and photos read as random) -- every avatar renders as initials until
// USE_PHOTO_AVATARS flips back on. The portrait set and mapping stay.
const USE_PHOTO_AVATARS = false;

// Photo avatars (behind the flag above), initials only as the fallback
// for a name with no portrait. The pool is a committed set of demo portraits
// (public/images/connect/avatars); each named person maps to ONE photo, and
// no two people who share a screen share a face. Jordan (the signed-in
// student) wears their real profile photo.
const AV = "/images/connect/avatars";
const AVATAR_PHOTO: Record<string, string> = {
  "Jordan Rivera": "/images/avatar-jordan.jpg",
  Jordan: "/images/avatar-jordan.jpg",
  // Verified professionals
  "David Chen": `${AV}/m36.jpg`,
  "Elena Martinez": `${AV}/w22.jpg`,
  "Amara Okafor": `${AV}/w45.jpg`,
  "Marcus Reyes": `${AV}/m47.jpg`,
  "Jasmine Cole": `${AV}/w31.jpg`,
  "Nadia Osei": `${AV}/w28.jpg`,
  "Wei Zhang": `${AV}/m29.jpg`,
  "Tom Gallagher": `${AV}/m11.jpg`,
  "Sofia Grant": `${AV}/w5.jpg`,
  "Andre Whitfield": `${AV}/m55.jpg`,
  "Keiko Tanaka": `${AV}/w63.jpg`,
  "Danielle Brooks": `${AV}/w41.jpg`,
  "Leo Fontaine": `${AV}/m77.jpg`,
  "Omar Haddad": `${AV}/m68.jpg`,
  "Camille Vega": `${AV}/w52.jpg`,
  // Students wear friendly illustrated avatars (micah, generated per
  // handle), never real photos -- on-brand for a teen product and no real
  // minor's face is ever implied. Professionals keep realistic portraits:
  // credibility is their whole job here.
  Ethan: `${AV}/c-Ethan.png`,
  Priya: `${AV}/c-Priya.png`,
  Maya: `${AV}/c-Maya.png`,
  Zoe: `${AV}/c-Zoe.png`,
  Sam: `${AV}/c-Sam.png`,
  Lena: `${AV}/c-Lena.png`,
  Ava: `${AV}/c-Ava.png`,
  Diego: `${AV}/c-Diego.png`,
  Sana: `${AV}/c-Sana.png`,
  Ruby: `${AV}/c-Ruby.png`,
  Theo: `${AV}/c-Theo.png`,
  Jo: `${AV}/c-Jo.png`,
  Amir: `${AV}/c-Amir.png`,
  Devon: `${AV}/c-Devon.png`,
  Riley: `${AV}/c-Riley.png`,
  Noah: `${AV}/c-Noah.png`,
  Marcus: `${AV}/c-Riley.png`,
};

// A verified badge overlaps the corner exactly like the app's other verified
// affordances — a small ShieldCheck on a solid chip, never color alone.
function Avatar({ name, size = 34, verified }: { name: string; size?: number; verified?: boolean }) {
  const photo = USE_PHOTO_AVATARS ? AVATAR_PHOTO[name] : undefined;
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="relative inline-flex flex-none" style={{ width: size, height: size }}>
      {photo ? (
        <Image src={photo} alt="" width={128} height={128} className="h-full w-full rounded-full object-cover" style={{ background: "var(--secondary)" }} />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-bold"
          style={{
            background: verified ? "var(--primary)" : "var(--secondary)",
            color: verified ? "#FFFFFF" : "var(--foreground)",
            fontSize: Math.max(11, size * 0.4),
            fontFamily: "var(--font-body)",
          }}
        >
          {initials}
        </span>
      )}
      {verified && (
        <span role="img" aria-label="Verified" className="absolute right-[-2px] bottom-[-2px] flex items-center justify-center rounded-full border-2" style={{ width: size * 0.46, height: size * 0.46, background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-surface-3)" }}>
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
  return (
    <div className="flex items-center gap-[10px]">
      <Avatar name={pro.name} verified size={size} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</span>
        <span className="text-[11px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
          {pro.org} · {pro.role}
          {postedAgo ? ` · ${postedAgo}` : ""}
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
function communityAccent(community: Pick<Community, "world">): string {
  return WORLD_COLORS[community.world] ?? "var(--primary)";
}

// EXPLORATION 3 (connect-redesign-lab): pastel tiles, organic-masked ART.
// The references' shaped masks stay -- but they hold the community's own
// people-free artwork, not a portrait. Symmetric grid, every tile equal.
// Signals kept to the earned three: name, verified-pro count, students.
const CARD_INK = "#221e33";

// Community feeds read in the platform's own UI face (what Instagram,
// Facebook, and every OS-native feed does): sturdy at small sizes, high
// x-height, no display-font airiness. Bricolage stays for identity type.
const FEED_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// The mask IS the topic (per direct feedback): each community's art is
// clipped into an icon of its own subject -- a briefcase, rising bars, a
// hexagon, a medical cross, a flower. Paths live in a 128px box, the
// tile's exact size, unioned subpaths via clip-path: path().
const SHAPE_CLIP: Record<string, string> = {
  "teaching-education": 'M26 44 h76 a16 16 0 0 1 16 16 v42 a16 16 0 0 1 -16 16 h-76 a16 16 0 0 1 -16 -16 v-42 a16 16 0 0 1 16 -16 Z M54 16 h20 a10 10 0 0 1 10 10 v14 a10 10 0 0 1 -10 10 h-20 a10 10 0 0 1 -10 -10 v-14 a10 10 0 0 1 10 -10 Z',
  "business-money": 'M24 70 h10 a10 10 0 0 1 10 10 v38 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 v-38 a10 10 0 0 1 10 -10 Z M59 38 h10 a10 10 0 0 1 10 10 v70 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 v-70 a10 10 0 0 1 10 -10 Z M94 10 h10 a10 10 0 0 1 10 10 v98 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 v-98 a10 10 0 0 1 10 -10 Z',
  "tech-engineering": 'M64 4 L114 33 V95 L64 124 L14 95 V33 Z',
  "health-medicine": 'M61 6 h6 a16 16 0 0 1 16 16 v84 a16 16 0 0 1 -16 16 h-6 a16 16 0 0 1 -16 -16 v-84 a16 16 0 0 1 16 -16 Z M22 45 h84 a16 16 0 0 1 16 16 v6 a16 16 0 0 1 -16 16 h-84 a16 16 0 0 1 -16 -16 v-6 a16 16 0 0 1 16 -16 Z',
  "arts-media": 'M90 28 a26 26 0 1 1 -52 0 a26 26 0 1 1 52 0 Z M54 54 a26 26 0 1 1 -52 0 a26 26 0 1 1 52 0 Z M68 97 a26 26 0 1 1 -52 0 a26 26 0 1 1 52 0 Z M112 97 a26 26 0 1 1 -52 0 a26 26 0 1 1 52 0 Z M126 54 a26 26 0 1 1 -52 0 a26 26 0 1 1 52 0 Z M93 66 a29 29 0 1 1 -58 0 a29 29 0 1 1 58 0 Z',
};


// Purpose-built art for the masks: tone-on-tone "accent glass" gradients
// generated for each world, so the shapes read as luminous color at 128px
// instead of dark photo crops.
const SHAPE_ART: Record<string, string> = {
  "teaching-education": "/images/connect/shapes/teaching-education.webp",
  "business-money": "/images/connect/shapes/business-money.webp",
  "tech-engineering": "/images/connect/shapes/tech-engineering.webp",
  "health-medicine": "/images/connect/shapes/health-medicine.webp",
  "arts-media": "/images/connect/shapes/arts-media.webp",
};
// Events wear a star -- the one shape that says "occasion".
const STAR_CLIP =
  "M64 6 L79.9 46.2 L123 48.8 L89.7 76.3 L100.4 118.2 L64 95 L27.6 118.2 L38.3 76.3 L5 48.8 L48.1 46.2 Z";

const SHAPE_KIND: Record<string, string> = {
  "teaching-education": "briefcase",
  "business-money": "bars",
  "tech-engineering": "hex",
  "health-medicine": "cross",
  "arts-media": "flower",
};

// On hover each mask does the thing its shape depicts: the briefcase gets
// picked up, the bars grow (the clip-path itself morphs taller), the hex
// turns like a nut, the cross beats like a heart, the flower blooms.
const BARS_GROWN =
  "M24 44 h10 a10 10 0 0 1 10 10 v64 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 v-64 a10 10 0 0 1 10 -10 Z M59 20 h10 a10 10 0 0 1 10 10 v88 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 v-88 a10 10 0 0 1 10 -10 Z M94 4 h10 a10 10 0 0 1 10 10 v104 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 v-104 a10 10 0 0 1 10 -10 Z";
const SHAPE_ANIM_CSS = `
.dm-shape { transition: transform .55s cubic-bezier(.22,1,.36,1), clip-path .55s cubic-bezier(.22,1,.36,1); }
.group:hover .dm-shape-briefcase { transform: translateY(-7px) rotate(-5deg); }
.group:hover .dm-shape-bars { clip-path: path('${BARS_GROWN}') !important; }
.group:hover .dm-shape-hex { transform: rotate(60deg); }
.group:hover .dm-shape-cross { animation: dm-heartbeat 1.1s ease-in-out infinite; }
.group:hover .dm-shape-flower { transform: rotate(30deg) scale(1.05); transition-duration: .85s; }
.group:hover .dm-shape-star { transform: rotate(-12deg) scale(1.08); }
@keyframes dm-heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.1); } 28% { transform: scale(0.98); } 42% { transform: scale(1.08); } 56% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .dm-shape, .group:hover .dm-shape-cross { transition: none; animation: none; } }
`;

/** A community's (or event's) shape mask with the dashed radials drawn
 *  concentric to it. The clip-path lives in a fixed 128px box, so other
 *  sizes render the 128 box scaled inside a wrapper. */
function ShapeBadge({ id, size = 128, radials = true, className = "" }: { id: string; size?: number; radials?: boolean; className?: string }) {
  const event = id === "event";
  const clip = event ? STAR_CLIP : SHAPE_CLIP[id];
  const art = event ? "/images/connect/shapes/event.webp" : SHAPE_ART[id];
  const kind = event ? "star" : (SHAPE_KIND[id] ?? "blob");
  if (!clip || !art) return null;
  return (
    <span className={`pointer-events-none relative flex-none ${className}`} style={{ height: size, width: size }}>
      {radials && (
        <svg aria-hidden className="absolute top-1/2 left-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 220 220" fill="none">
          {[52, 78, 104].map((r) => (
            <circle key={r} cx="110" cy="110" r={r} stroke={`color-mix(in srgb, ${CARD_INK} 20%, transparent)`} strokeWidth="1.5" strokeDasharray="2 7" />
          ))}
        </svg>
      )}
      <span aria-hidden className="absolute top-0 left-0 h-[128px] w-[128px] origin-top-left" style={size !== 128 ? { transform: `scale(${size / 128})` } : undefined}>
        <span className={`dm-shape dm-shape-${kind} relative block h-full w-full overflow-hidden`} style={{ clipPath: `path('${clip}')` }}>
          <Image src={art} alt="" fill sizes="256px" className="object-cover" />
        </span>
      </span>
    </span>
  );
}

function CommunityCard({
  community,
  onOpen,
  featured,
}: {
  community: Community;
  onOpen: () => void;
  featured?: boolean;
}) {
  const accent = communityAccent(community);
  const surface = `color-mix(in srgb, ${accent} 24%, #f4f1ea)`;
  const clip = SHAPE_CLIP[community.id];
  return (
    <div
      className="dm-tap group relative flex h-full min-h-[212px] items-center overflow-hidden rounded-[26px]"
      style={{ background: surface, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)" }}
    >
      {/* pull-tab notch, from the reference's sheet stack */}
      <span aria-hidden className="absolute top-[10px] left-1/2 h-[5px] w-[48px] -translate-x-1/2 rounded-full" style={{ background: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }} />

      {/* dashed radials behind the shaped art */}
      <svg aria-hidden className="pointer-events-none absolute top-[-6px] right-[-22px] h-[220px] w-[220px]" viewBox="0 0 220 220" fill="none">
        {[52, 78, 104].map((r) => (
          <circle key={r} cx="110" cy="110" r={r} stroke={`color-mix(in srgb, ${CARD_INK} 20%, transparent)`} strokeWidth="1.5" strokeDasharray="2 7" />
        ))}
      </svg>

      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">{`Open ${community.name}`}</span>
      </button>

      {featured && (
        <span className="absolute top-[14px] right-[16px] z-20 inline-flex items-center gap-[5px] rounded-full px-[11px] py-[4px] text-[11px] leading-[15px] font-medium" style={{ background: `color-mix(in srgb, ${CARD_INK} 82%, transparent)`, color: "#FFFFFF" }}>
          <Star className="h-[11px] w-[11px]" fill="currentColor" aria-hidden style={{ color: "#f5c04e" }} /> Most Popular
        </span>
      )}

      <div className="pointer-events-none relative z-20 flex h-full w-full flex-col px-[var(--space-6)] py-[var(--space-5)]" style={{ fontFamily: "var(--font-display)" }}>
        {/* Single family, three tiers only: heading 20/800 -> subheading
           13/600 -> body 11/500 (CTA reuses 13 + 800 for prominence).
           Title up top, shape on the right; the pros line sits directly on a
           full-card-width rule with students left and the CTA far right, so
           every row lands at the same y no matter how long the name is. */}
        <div className="flex flex-1 items-center gap-[var(--space-4)]">
          <h3 className="min-w-0 flex-1 self-start text-[20px] leading-[25px] font-extrabold text-balance" style={{ color: CARD_INK }}>
            {community.name}
          </h3>

          {/* the shaped mask holds generated accent-glass art -- no people.
             mt clears the Most Popular chip so they never overlap. */}
          <span
            className={`dm-shape dm-shape-${SHAPE_KIND[community.id] ?? "blob"} relative mt-[20px] h-[128px] w-[128px] flex-none overflow-hidden`}
            style={clip ? { clipPath: `path('${clip}')` } : { borderRadius: "58% 42% 63% 37% / 45% 55% 45% 55%" }}
          >
            <Image src={SHAPE_ART[community.id] ?? community.photo} alt="" fill sizes="256px" className="object-cover" />
          </span>
        </div>

        <p className="mt-[10px] flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold whitespace-nowrap" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
          {community.activePros} verified pros
          <ShieldCheck className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${accent} 70%, ${CARD_INK})` }} />
        </p>
        <div className="mt-[8px] flex w-full items-center justify-between border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }}>
          <span className="text-[13px] leading-[18px] font-semibold whitespace-nowrap" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
            {community.students} students
          </span>
          <span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.04em] whitespace-nowrap uppercase" style={{ color: `color-mix(in srgb, ${accent} 45%, ${CARD_INK})` }}>
            Open Community <ArrowRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover:translate-x-[3px]" aria-hidden strokeWidth={2.75} />
          </span>
        </div>
      </div>
    </div>
  );
}


function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-xl)] border p-[var(--space-5)] ${className}`} style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--card))", borderColor: "var(--glass-border)" }}>
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
      style={{ background: "var(--primary)", color: "#FFFFFF" }}
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
      style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}
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

// The doc's question card, one for one: an "Unanswered" pill when nothing
// has come back yet, the quoted bold question as the card's heading, a chip
// row for the asker's grade and country, then likes · views · comments, with
// the time at the top right.
function QuestionCard({ thread, onOpen, saved, onSave, helpful, onHelpful, accent = "var(--primary)" }: { thread: Thread; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void; accent?: string }) {
  const comments = thread.responses.length;
  const answeredBy = thread.responses.find((r): r is Extract<Thread["responses"][number], { kind: "answer" }> => r.kind === "answer");
  return (
    <Card className="dm-tap group relative cursor-pointer">
      {/* The WHOLE card opens the thread (direct feedback: "make it
         obviously easily clickable") -- an overlay target under the
         like/save controls, a hover ring, and a chevron that says "this
         goes somewhere" before you ever hover. */}
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-xl)]">
        <span className="sr-only">Open question: {thread.title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent)` }} />
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[10px] h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />

      {/* A living row starts with a person: the asker's avatar and handle
         lead, the time sits at the far edge -- the same anatomy as every
         social feed a student already reads. */}
      <div className="flex items-center justify-between gap-[var(--space-3)] pr-[22px]">
        <span className="flex min-w-0 items-center gap-[8px]">
          <Avatar name={thread.handle} size={26} />
          <span className="flex-none text-[12px] leading-[16px] font-bold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{thread.handle}</span>
          <span className="min-w-0 truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>· {thread.grade}{thread.location ? ` · ${thread.location}` : ""}</span>
          {comments === 0 && (
            <span className="inline-flex flex-none rounded-full border px-[9px] py-[2px] text-[10.5px] leading-[15px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: "color-mix(in srgb, var(--hero-accent-purple) 55%, var(--glass-border))", color: "var(--accent-subtle)", background: "color-mix(in srgb, var(--hero-accent-purple) 14%, transparent)" }}>
              Unanswered
            </span>
          )}
        </span>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{thread.postedAgo}</span>
      </div>
      <h3 className="mt-[10px] pr-[22px] text-[15px] leading-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>&ldquo;{thread.title}&rdquo;</h3>
      {answeredBy && (
        <p className="mt-[8px] flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--world-food-farming-nature)" }}>
          <CheckCircle2 className="h-[13px] w-[13px] flex-none" aria-hidden />
          Answered by {proById(answeredBy.proId).name} · {proById(answeredBy.proId).org}
        </p>
      )}
      <div className="relative z-20 mt-[12px] flex items-center gap-[var(--space-5)] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {thread.helpful + (helpful ? 1 : 0)}
        </button>
        {typeof thread.views === "number" && (
          <span className="flex items-center gap-[5px]"><Eye className="h-3.5 w-3.5" aria-hidden /> {thread.views.toLocaleString()}</span>
        )}
        <button type="button" onClick={onOpen} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]">
          <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> <span className="whitespace-nowrap">{comments} comments</span>
        </button>
        <button type="button" onClick={onSave} aria-pressed={saved} className="dm-link ml-auto flex min-h-[36px] cursor-pointer items-center gap-[5px]" style={{ color: saved ? "var(--accent-subtle)" : undefined }}>
          <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saved ? "Saved" : "Save"}
        </button>
      </div>
    </Card>
  );
}

// The doc's insight row -- avatar, the pro's name with a "Professional" chip
// and their company chip, the insight's title line, then likes and comments
// -- and the whole row OPENS: title and comment count both land on the
// insight's own thread, where the conversation lives.
function InsightCard({ insight, onOpen, saved, onSave, helpful, onHelpful, accent = "var(--primary)" }: { insight: Insight; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void; accent?: string }) {
  const pro = proById(insight.proId);
  return (
    <Card className="dm-tap group relative cursor-pointer">
      {/* The WHOLE card opens the insight's thread -- overlay target under
         the like/save controls, hover ring, and an always-visible chevron. */}
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-xl)]">
        <span className="sr-only">Open insight: {insight.title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent)` }} />
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[10px] h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />

      <div className="flex items-start gap-[12px] pr-[22px]">
        <Avatar name={pro.name} verified size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[6px]">
            <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</span>
            <span className="rounded-full border px-[8px] py-[1px] text-[10.5px] leading-[15px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--world-food-farming-nature) 55%, var(--glass-border))", color: "var(--world-food-farming-nature)", background: "color-mix(in srgb, var(--world-food-farming-nature) 12%, transparent)" }}>Professional</span>
            <span className="rounded-full border px-[8px] py-[1px] text-[10.5px] leading-[15px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{pro.org}</span>
          </div>
          <h3 className="mt-[7px] text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{insight.title}</h3>
          <p className="mt-[4px] line-clamp-2 text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{insight.body}</p>
          <div className="relative z-20 mt-[10px] flex items-center gap-[var(--space-5)] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {insight.helpful + (helpful ? 1 : 0)}
            </button>
            <button type="button" onClick={onOpen} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]">
              <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> <span className="whitespace-nowrap">{insight.replies.length} comments</span>
            </button>
            <button type="button" onClick={onSave} aria-pressed={saved} className="dm-link ml-auto flex min-h-[36px] cursor-pointer items-center gap-[5px]" style={{ color: saved ? "var(--accent-subtle)" : undefined }}>
              <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{insight.postedAgo}</span>
      </div>
    </Card>
  );
}


// ——— filter row (mobile: horizontal scroll with edge cue, never clipped) ———

type LucideIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function FilterRow({ options, active, onPick, accent }: { options: { key: string; label: string; Icon?: LucideIcon }[]; active: string; onPick: (key: string) => void; accent?: string }) {
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
            className="dm-quiet flex min-h-[44px] flex-none cursor-pointer items-center gap-[7px] rounded-[999px] border px-[var(--space-4)] py-[6px] text-[12.5px] leading-[16px] font-bold whitespace-nowrap"
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
  const [codeOpenFor, setCodeOpenFor] = useState<string | null>(null);
  /** Community awaiting join confirmation in the JoinSheet. */
  const [joinFor, setJoinFor] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(COMMUNITIES.map((c) => [c.id, c.joined])));
  const [eventJoined, setEventJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.entitled])));
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


  const cardProps = (id: string) => ({
    saved: !!saves[id],
    onSave: () => toggleSave(id),
    helpful: !!helpfuls[id],
    onHelpful: () => toggleHelpful(id),
  });

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)" }}>
      <DesktopNavigation active="Connect" />

      {/* Mobile header (matches Home's pattern) */}
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <div aria-live="polite" className="sr-only">{announce}</div>

      {/* The home view carries a sidebar on wide screens, so it gets a wider
          column than a thread or a board, which are reading surfaces. */}
      <style>{SHAPE_ANIM_CSS}</style>
      <main
        style={{ fontFamily: FEED_FONT }}
        className={`relative z-10 mx-auto flex w-full flex-col px-5 pt-2 pb-[120px] md:px-8 md:pt-[var(--space-10)] ${view.kind === "home" ? "gap-[var(--space-4)]" : "gap-[var(--space-6)]"} ${
          view.kind === "home" ? "max-w-[1280px]" : "max-w-[880px]"
        }`}
      >
        {view.kind === "home" && (
          <HomeView
            tab={view.tab}
            onTab={(tab) => setView({ kind: "home", tab })}
            eventJoined={eventJoined}
            onOpenBoard={(id) => setView({ kind: "board", id, filter: "questions" })}
            onOpenEvent={(id) => setView({ kind: "event", id, filter: "all" })}
            onEnterCode={(id) => setCodeOpenFor(id)}
          />
        )}

        {view.kind === "board" && (
          <BoardView
            community={COMMUNITIES.find((c) => c.id === view.id)!}
            filter={view.filter}
            joined={!!joined[view.id]}
            onJoin={() => setJoinFor(view.id)}
            onFilter={(filter) => setView({ kind: "board", id: view.id, filter })}
            onBack={() => setView({ kind: "home", tab: "communities" })}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onOpenInsight={(id) => setView({ kind: "insight", id })}
            cardProps={cardProps}
          />
        )}

        {view.kind === "insight" &&
          (() => {
            const insight = INSIGHTS.find((i) => i.id === view.id);
            if (!insight) return null;
            const p = cardProps(insight.id);
            return (
              <InsightThreadView
                insight={insight}
                onBack={() => setView({ kind: "board", id: insight.boardId, filter: "insights" })}
                saved={p.saved}
                onSave={p.onSave}
                helpful={p.helpful}
                onHelpful={p.onHelpful}
                helpfuls={helpfuls}
                toggleHelpful={toggleHelpful}
                onAddToPlan={() => say("Added to your Plan as a next action.")}
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
                  onBack={() => setView({ kind: "home", tab: "events" })}
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
              setView(eventById(t.boardId) ? { kind: "event", id: t.boardId, filter: "all" } : { kind: "board", id: t.boardId, filter: "questions" });
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

      {joinFor && (
        <JoinSheet
          community={COMMUNITIES.find((c) => c.id === joinFor)!}
          onClose={() => setJoinFor(null)}
          onJoin={() => {
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
            const id = codeOpenFor;
            setEventJoined((j) => ({ ...j, [id]: true }));
            setCodeOpenFor(null);
            setView({ kind: "event", id, filter: "all" });
            say("Event board unlocked. It stays under Your events. No code needed next time.");
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
  eventJoined,
  onOpenBoard,
  onOpenEvent,
  onEnterCode,
}: {
  tab: "communities" | "events";
  onTab: (tab: "communities" | "events") => void;
  eventJoined: Record<string, boolean>;
  onOpenBoard: (id: string) => void;
  onOpenEvent: (id: string) => void;
  onEnterCode: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const searched = COMMUNITIES.filter((c) => !query || (c.name + " " + c.purpose + " " + c.topics.join(" ") + " " + c.professionalsFrom.join(" ")).toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      {/* "Find your community" masthead + Community/Events toggle, same on
         both tabs -- matches the reference doc's mockup exactly (title case,
         one-line sub, Dreamy in glasses at the header's right edge). */}
      <div className="relative pr-[100px] sm:pr-[120px]">
        <h1 className="text-[26px] leading-[32px] font-extrabold tracking-[0.02em] uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Connect</h1>
        <p className="mt-[6px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Explore careers and connect with professionals.</p>
        <Image src="/images/dreamy/v2/dreamy-glasses.png" alt="" width={192} height={192} aria-hidden className="absolute -top-[10px] right-0 h-[88px] w-[88px] object-contain sm:h-[108px] sm:w-[108px]" />
      </div>

      <FilterRow
        options={[
          { key: "communities", label: "Community", Icon: Users },
          { key: "events", label: "Events", Icon: Calendar },
        ]}
        active={tab}
        onPick={(key) => onTab(key as "communities" | "events")}
      />

      {tab === "communities" && (
        <label className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[13px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          <Search className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <span className="sr-only">Search communities</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search communities, topics, or companies"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
            style={{ color: "var(--foreground)" }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="dm-quiet flex size-6 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </label>
      )}

      {tab === "communities" && (
        /* One section, exactly like the doc: "Your Communities" with the
           joined count at the row's end, all five cards in a two-column
           grid. Search filters this same grid rather than a separate
           "All communities" section. */
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Your communities">
          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
            <SectionHead>{query ? `Matching “${query}”` : "Your Communities"}</SectionHead>
            {!query && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{searched.length} communities</span>}
          </div>
          {/* Symmetric grid, every tile equal weight: three across, two
             centered beneath. */}
          <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-6">
            {searched.map((c, index) => (
              <div
                key={c.id}
                className={`lg:col-span-2 ${index === 3 && searched.length === 5 ? "lg:col-start-2" : ""} ${index === 4 && searched.length === 5 ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-var(--space-5)/2)] lg:col-span-2 lg:mx-0 lg:w-auto" : ""}`}
              >
                <CommunityRow community={c} onOpen={() => onOpenBoard(c.id)} featured={index === 0 && !query} />
              </div>
            ))}
          </div>
          {searched.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Nothing matches “{query}” yet.</p>
          )}
          <SuggestCommunityCard />
        </section>
      )}

      {tab === "events" && (
        <section className="flex flex-col gap-[var(--space-4)]" aria-label="Your events">
          {/* The doc's event card, one for one: an orange gradient header
             (star chip, event name, date · location in white), then the
             stats row, the Partner line, and one action for this event's
             state. */}
          <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2">
            {EVENTS.map((event) => {
              const upcoming = event.lifecycle === "Upcoming";
              const joined = eventJoined[event.id];
              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col overflow-hidden rounded-[26px] px-[var(--space-6)] py-[var(--space-5)]"
                  style={{ background: `color-mix(in srgb, ${EVENT_ACCENT} 24%, #f4f1ea)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)" }}
                >
                  <span aria-hidden className="absolute top-[10px] left-1/2 h-[5px] w-[48px] -translate-x-1/2 rounded-full" style={{ background: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }} />
                  <div className="flex flex-1 items-center gap-[var(--space-4)]">
                    <div className="min-w-0 flex-1 self-start">
                      <h3 className="min-h-[50px] text-[20px] leading-[25px] font-extrabold text-balance" style={{ color: CARD_INK }}>{event.name}</h3>
                      <p className="mt-[4px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>{event.date} · {event.location}</p>
                      <p className="mt-[2px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>Hosted by {event.host}</p>
                    </div>
                    <ShapeBadge id="event" size={76} className="sm:hidden" />
                    <ShapeBadge id="event" size={108} className="hidden sm:block" />
                  </div>
                  <div className="mt-[10px] flex w-full items-center justify-between gap-[var(--space-3)] border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }}>
                    <span className="min-w-0 truncate text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
                      {typeof event.students === "number" ? (
                        <>
                          {event.students} students · {event.pros} pros
                          <span className="hidden sm:inline"> · {event.postCount} posts</span>
                        </>
                      ) : (
                        event.lifecycle
                      )}
                    </span>
                    {joined ? (
                      <button type="button" onClick={() => onOpenEvent(event.id)} className="dm-quiet flex flex-none cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.08em] whitespace-nowrap uppercase" style={{ color: `color-mix(in srgb, ${EVENT_ACCENT} 45%, ${CARD_INK})` }}>
                        Open Board <ArrowRight className="h-[14px] w-[14px]" aria-hidden strokeWidth={2.75} />
                      </button>
                    ) : upcoming ? (
                      <span className="flex-none text-[13px] leading-[18px] font-semibold whitespace-nowrap" style={{ color: `color-mix(in srgb, ${CARD_INK} 60%, transparent)` }}>
                        Opens after the event
                      </span>
                    ) : (
                      <button type="button" onClick={() => onEnterCode(event.id)} className="dm-quiet flex flex-none cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.08em] whitespace-nowrap uppercase" style={{ color: `color-mix(in srgb, ${EVENT_ACCENT} 45%, ${CARD_INK})` }}>
                        <KeyRound className="h-[14px] w-[14px]" aria-hidden /> Enter Code
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

/** The mock's closing row: an invitation, not a dead end. */
function SuggestCommunityCard() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border p-[var(--space-5)] sm:flex-row sm:items-center" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--card))", borderColor: "var(--glass-border)" }}>
      <span aria-hidden className="flex size-11 flex-none items-center justify-center rounded-full" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
        <Sparkles className="h-[19px] w-[19px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>Can&apos;t find what you&apos;re looking for?</span>
        <span className="mt-[2px] block text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Request a community or suggest topics you&apos;d love to explore.</span>
      </span>
      <button
        type="button"
        onClick={() => setSent(true)}
        disabled={sent}
        className="dm-quiet flex min-h-[42px] flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[18px] text-[12.5px] leading-[17px] font-bold disabled:cursor-default"
        style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}
      >
        {sent ? <><CheckCircle2 className="h-4 w-4" aria-hidden style={{ color: "var(--world-food-farming-nature)" }} /> Request sent</> : <>Suggest a Community <ArrowRight className="h-4 w-4" aria-hidden /></>}
      </button>
    </div>
  );
}

function CommunityRow({ community, onOpen, featured }: { community: Community; onOpen: () => void; featured?: boolean }) {
  return <CommunityCard community={community} onOpen={onOpen} featured={featured} />;
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
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const threads = THREADS.filter((t) => t.boardId === community.id);
  const insights = INSIGHTS.filter((i) => i.boardId === community.id);
  const about = filter === "about";
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
        className="group relative overflow-hidden rounded-[26px] px-[var(--space-6)] py-[var(--space-5)]"
        style={{ background: `color-mix(in srgb, ${communityAccent(community)} 24%, #f4f1ea)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)" }}
      >
        <span aria-hidden className="absolute top-[10px] left-1/2 h-[5px] w-[48px] -translate-x-1/2 rounded-full" style={{ background: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }} />
        <div className="flex items-center gap-[var(--space-5)]">
          <div className="min-w-0 flex-1 self-start pt-[8px]">
            <h1 className="text-[24px] leading-[29px] font-extrabold text-balance" style={{ color: CARD_INK }}>{community.name}</h1>
            <p className="mt-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
              {community.activePros} verified pros{" "}
              <ShieldCheck className="inline-block h-[13px] w-[13px] align-[-2px]" aria-hidden style={{ color: `color-mix(in srgb, ${communityAccent(community)} 70%, ${CARD_INK})` }} />
            </p>
          </div>
          <ShapeBadge id={community.id} size={84} className="sm:hidden" />
          <ShapeBadge id={community.id} className="hidden sm:block" />
        </div>
        <div className="mt-[4px] flex flex-wrap items-center gap-[8px]">
          {[
            { key: "feed", label: "Feed", active: !about, onPick: () => onFilter(about ? "questions" : filter) },
            { key: "about", label: "About", active: about, onPick: () => onFilter("about") },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={pill.onPick}
              className="dm-quiet min-h-[34px] cursor-pointer rounded-full px-[16px] text-[13px] leading-[18px] font-semibold"
              style={pill.active ? { background: CARD_INK, color: "#f7f4ec" } : { background: `color-mix(in srgb, ${CARD_INK} 10%, transparent)`, color: CARD_INK }}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <div className="mt-[var(--space-4)] flex w-full items-center justify-between border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }}>
          <span className="text-[13px] leading-[18px] font-semibold whitespace-nowrap" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
            {community.students} students
          </span>
          {joined ? (
            <span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.08em] uppercase" style={{ color: `color-mix(in srgb, ${communityAccent(community)} 45%, ${CARD_INK})` }}>
              <CheckCircle2 className="h-[14px] w-[14px]" aria-hidden /> Joined
            </span>
          ) : (
            <button type="button" onClick={onJoin} className="dm-quiet flex cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tracking-[0.08em] uppercase" style={{ color: `color-mix(in srgb, ${communityAccent(community)} 45%, ${CARD_INK})` }}>
              Join <ArrowRight className="h-[14px] w-[14px]" aria-hidden strokeWidth={2.75} />
            </button>
          )}
        </div>
      </section>

      {about ? (
        <Card>
          <h2 className="text-[16px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>About this community</h2>
          <p className="mt-[6px] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{community.purpose}</p>
          <p className="mt-[10px] text-[10.5px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Professionals from</p>
          <div className="mt-[6px] flex flex-wrap gap-[6px]">
            {community.professionalsFrom.map((name) => (
              <span key={name} className="rounded-[999px] border px-[9px] py-[2px] text-[11.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>{name}</span>
            ))}
          </div>
          <p className="mt-[10px] text-[12px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{community.responseWindow}.</p>
        </Card>
      ) : (
        /* The Replit reference's board layout, verified at desktop width:
           the banner sits above ONE content card that contains both the
           left rail (Student Questions / Professional Insights -- the doc
           cuts Industry Updates) and the active panel. The rail collapses
           to a pill row on phones. */
        <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-xl)] border p-[var(--space-5)] md:p-[var(--space-6)]" style={{ background: `color-mix(in srgb, ${communityAccent(community)} 7%, var(--card))`, borderColor: `color-mix(in srgb, ${communityAccent(community)} 30%, var(--glass-border))` }}>
          <FilterRow
            options={[
              { key: "questions", label: "Student Questions", Icon: MessagesSquare },
              { key: "insights", label: "Professional Insights", Icon: ShieldCheck },
            ]}
            active={filter}
            onPick={onFilter}
            accent={communityAccent(community)}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-5)]">
            {filter === "questions" && (
              <>
                <p className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Ask. Learn. Grow.</p>
                <InlineAsk
                  joined={joined}
                  onRequireJoin={onJoin}
                  accent={communityAccent(community)}
                  onPost={(text) => setPostedQs((current) => [{ id: `${community.id}-local-${current.length}`, title: text }, ...current])}
                />
                {postedQs.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
                {threads.map((t) => <QuestionCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} accent={communityAccent(community)} {...cardProps(t.id)} />)}
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
              </>
            )}
            {filter === "insights" && (
              <>
                <p className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Read insights from professionals and join the conversation.</p>
                {insights.map((i) => <InsightCard key={i.id} insight={i} onOpen={() => onOpenInsight(i.id)} accent={communityAccent(community)} {...cardProps(i.id)} />)}
                {insights.length === 0 && (
                  <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>No professional insights posted here yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ——— event board (handoff 10) ———

function EventView({
  event,
  filter,
  onFilter,
  onBack,
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
  onOpenThread: (id: string) => void;
  onSaveTakeaway: () => void;
  takeawaySaved: boolean;
  onAddToPlan: () => void;
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const threads = EVENT_THREADS.filter((t) => t.boardId === event.id);
  const [postedQs, setPostedQs] = useState<{ id: string; title: string }[]>([]);
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Connect
      </button>

      <section
        aria-label="Event context"
        className="group relative overflow-hidden rounded-[26px] px-[var(--space-6)] py-[var(--space-5)]"
        style={{ background: `color-mix(in srgb, ${EVENT_ACCENT} 24%, #f4f1ea)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)" }}
      >
        <span aria-hidden className="absolute top-[10px] left-1/2 h-[5px] w-[48px] -translate-x-1/2 rounded-full" style={{ background: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }} />
        <div className="flex items-center gap-[var(--space-5)]">
          <div className="min-w-0 flex-1 self-start pt-[8px]">
            <p className="text-[11px] leading-[15px] font-medium tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${EVENT_ACCENT} 45%, ${CARD_INK})` }}>{event.lifecycle}</p>
            <h1 className="mt-[6px] text-[24px] leading-[29px] font-extrabold text-balance" style={{ color: CARD_INK }}>{event.name}</h1>
            <p className="mt-[6px] flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[2px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
              <span className="flex items-center gap-[5px]"><Calendar className="h-3.5 w-3.5" aria-hidden /> {event.date}</span>
              <span className="flex items-center gap-[5px]"><MapPin className="h-3.5 w-3.5" aria-hidden /> {event.location}</span>
              <span>Hosted by {event.host}</span>
            </p>
          </div>
          <ShapeBadge id="event" size={84} className="sm:hidden" />
          <ShapeBadge id="event" className="hidden sm:block" />
        </div>
        <div className="mt-[var(--space-4)] flex w-full items-center justify-between border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${CARD_INK} 18%, transparent)` }}>
          <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${CARD_INK} 74%, transparent)` }}>
            <ShieldCheck className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${EVENT_ACCENT} 70%, ${CARD_INK})` }} />
            Attendees + event pros only
          </span>
        </div>
      </section>

      <InlineAsk
        joined
        accent={EVENT_ACCENT}
        placeholder="Ask what you missed…"
        onPost={(text) => setPostedQs((current) => [{ id: `${event.id}-local-${current.length}`, title: text }, ...current])}
      />
      {postedQs.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}

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
            <div key={r.title} className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--glass-border)" }}>
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
        ]}
        active={filter}
        onPick={onFilter}
        accent={EVENT_ACCENT}
      />

      <div className="flex flex-col gap-[var(--space-4)]">
        {(filter === "all" || filter === "questions") &&
          threads.map((t) => <QuestionCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} accent={EVENT_ACCENT} {...cardProps(t.id)} />)}
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
  const boardCommunity = COMMUNITIES.find((c) => c.id === thread.boardId);
  const boardName = eventById(thread.boardId)?.name ?? boardCommunity?.name ?? "Community";
  const boardAccent = boardCommunity ? communityAccent(boardCommunity) : EVENT_ACCENT;
  const related = ALL_THREADS.filter((t) => t.boardId === thread.boardId && t.id !== thread.id && (t.state === "answered" || t.state === "resolved")).slice(0, 2);
  const p = cardProps(thread.id);
  const [posted, setPosted] = useState<LocalReply[]>([]);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="dm-quiet flex min-h-[38px] w-fit cursor-pointer items-center gap-[7px] rounded-full px-[16px] text-[13px] leading-[18px] font-semibold"
        style={{ background: `color-mix(in srgb, ${boardAccent} 24%, #f4f1ea)`, color: CARD_INK, fontFamily: "var(--font-display)" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {boardName}
      </button>

      <article className="flex flex-col gap-[var(--space-4)]">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Question</span>
          <h1 className="mt-[3px] text-[20px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{thread.title}</h1>
          {thread.context && <p className="mt-[6px] text-[13.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{thread.context}</p>}
          <div className="mt-[10px]"><IdentityBadge handle={thread.handle} grade={thread.grade} postedAgo={thread.postedAgo} /></div>
        </div>

        <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-[11.5px] leading-[16px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          {/* Who it went to is our plumbing, not their business. */}
          <StatusChip state={thread.state} />
          <span aria-hidden>·</span>
          <span>Shown as {thread.handle} · {thread.grade}</span>
        </div>

        {thread.responses.map((r, index) => {
          if (r.kind === "answer") {
            const rid = thread.id + "-a" + index;
            return (
              <div key={rid} className="rounded-[var(--radius-xl)] border p-[var(--space-5)]" style={{ background: "var(--color-glass-surface-3)", borderColor: r.primary ? "color-mix(in srgb, var(--world-food-farming-nature) 50%, var(--glass-border))" : "var(--glass-border)" }}>
                <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
                  <ProBadge proId={r.proId} postedAgo={r.postedAgo} />
                  {r.primary && (
                    <span className="flex-none rounded-[999px] px-[10px] py-[3px] text-[11px] font-extrabold tracking-[0.05em] uppercase" style={{ background: "color-mix(in srgb, var(--world-food-farming-nature) 18%, transparent)", color: "var(--world-food-farming-nature)" }}>
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
          const pid = thread.id + "-p" + index;
          return (
            <div key={pid} className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
              <CommentRow id={pid} name={r.handle} chip={r.grade} chipTone="student" body={r.body} postedAgo={r.postedAgo} likes={r.likes ?? 0} liked={!!helpfuls[pid]} onLike={toggleHelpful} image={r.image} imageAlt={r.imageAlt} />
            </div>
          );
        })}

        {thread.responses.length === 0 && (
          <Card>
            <p className="text-[13px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>No answer yet. We&apos;ll notify you.</p>
          </Card>
        )}

        {posted.map((reply) => (
          <div key={reply.id} className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
            <CommentRow id={reply.id} name="Jordan" chip="Junior" chipTone="student" body={reply.body} postedAgo="Just now" likes={0} liked={!!helpfuls[reply.id]} onLike={toggleHelpful} />
          </div>
        ))}
        <ReplyComposer onPost={(text) => setPosted((current) => [...current, { id: `${thread.id}-local-${current.length}`, body: text }])} />

        <div className="flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <button type="button" onClick={p.onHelpful} aria-pressed={p.helpful} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: p.helpful ? "var(--accent-subtle)" : undefined }}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Like · {thread.helpful + (p.helpful ? 1 : 0)}
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
              <button key={t.id} type="button" onClick={() => onOpenThread(t.id)} className="dm-quiet flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--glass-border)" }}>
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

// ——— comments: one shape everywhere ———

const EXTRA_REACTIONS = ["🔥", "💯", "😂"] as const;

/** Deterministic seeded counts so reaction chips look lived-in without
 *  Math.random (render purity). */
function seededReactions(id: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return EXTRA_REACTIONS.map((_, i) => (h >> (i * 5)) % 9);
}

/** The like button grown up: 👍 plus tap-to-react emoji, the same
 *  vocabulary as the GIFs in the threads. One row, one shape, everywhere. */
function ReactionRow({ id, likes, liked, onLike }: { id: string; likes: number; liked: boolean; onLike: (id: string) => void }) {
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const seeds = seededReactions(id);
  const chip = "dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[11.5px] leading-[15px] font-semibold transition-transform duration-150 active:scale-90";
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

/** A comment under an insight or thread: avatar, name + role chip, the
 *  line itself, then a working like button and the time. `likes` is the
 *  seeded count; the toggle adds the student's own on top. */
function CommentRow({ id, name, chip, chipTone, body, postedAgo, likes, liked, onLike, image, imageAlt }: { id: string; name: string; chip: string; chipTone: "pro" | "student"; body: string; postedAgo: string; likes: number; liked: boolean; onLike: (id: string) => void; image?: string; imageAlt?: string }) {
  const tone = chipTone === "pro" ? "var(--world-food-farming-nature)" : "var(--accent-subtle)";
  return (
    <div className="flex items-start gap-[12px]">
      <Avatar name={name} verified={chipTone === "pro"} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[6px]">
          <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{name}</span>
          <span className="rounded-full border px-[8px] py-[1px] text-[10.5px] leading-[15px] font-bold" style={{ borderColor: `color-mix(in srgb, ${tone} 50%, var(--glass-border))`, color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>{chip}</span>
          <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{postedAgo}</span>
        </div>
        <p className="mt-[4px] text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>{body}</p>
        {/* Reaction GIFs between pros and students are deliberate (the doc
           shows them; it's a pitch beat about speaking Gen Z) -- rendered
           unoptimized so the animation actually plays. */}
        {image && (
          <Image src={image} alt={imageAlt ?? ""} width={356} height={200} unoptimized className="mt-[8px] h-auto w-[200px] max-w-full rounded-[14px] sm:w-[220px]" style={{ background: "var(--glass-surface-1)" }} />
        )}
        <ReactionRow id={id} likes={likes} liked={liked} onLike={onLike} />
      </div>
    </div>
  );
}

/** The reply box at the foot of a thread: type, post, and the comment
 *  appears immediately as the signed-in student ("Jordan · Junior"). */
function ReplyComposer({ onPost }: { onPost: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onPost(text.trim());
    setText("");
  };
  return (
    <div className="flex items-start gap-[12px] rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--card))", borderColor: "var(--glass-border)" }}>
      <Avatar name="Jordan Rivera" size={32} />
      <div className="min-w-0 flex-1">
        <label className="block">
          <span className="sr-only">Add a comment</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            placeholder="Add a comment…"
            className="w-full resize-none rounded-[var(--radius-md)] border p-[10px] text-[13px] leading-[19px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
            style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}
          />
        </label>
        <div className="mt-[8px] flex items-center justify-between gap-[var(--space-3)]">
          <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Posts as Jordan · Junior</span>
          <button type="button" onClick={submit} disabled={!text.trim()} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[5px] rounded-full px-[15px] text-[12px] leading-[16px] font-bold disabled:cursor-default disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
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
  onAddToPlan,
}: {
  insight: Insight;
  onBack: () => void;
  saved: boolean;
  onSave: () => void;
  helpful: boolean;
  onHelpful: () => void;
  helpfuls: Record<string, boolean>;
  toggleHelpful: (id: string) => void;
  onAddToPlan: () => void;
}) {
  const pro = proById(insight.proId);
  const boardCommunity = COMMUNITIES.find((c) => c.id === insight.boardId);
  const boardName = boardCommunity?.name ?? "Community";
  const boardAccent = boardCommunity ? communityAccent(boardCommunity) : EVENT_ACCENT;
  const [posted, setPosted] = useState<LocalReply[]>([]);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="dm-quiet flex min-h-[38px] w-fit cursor-pointer items-center gap-[7px] rounded-full px-[16px] text-[13px] leading-[18px] font-semibold"
        style={{ background: `color-mix(in srgb, ${boardAccent} 24%, #f4f1ea)`, color: CARD_INK, fontFamily: "var(--font-display)" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {boardName}
      </button>

      <article className="flex flex-col gap-[var(--space-5)]">
        <div className="rounded-[var(--radius-xl)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--card))", borderColor: "var(--glass-border)" }}>
          <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--world-food-farming-nature)" }}>Professional insight</span>
          <h1 className="mt-[6px] text-[20px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{insight.title}</h1>
          <div className="mt-[12px]"><ProBadge proId={insight.proId} postedAgo={insight.postedAgo} size={38} /></div>
          <p className="mt-[14px] text-[13.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>{insight.body}</p>
          <p className="mt-[10px] text-[11px] leading-[15px] italic" style={{ color: "var(--muted-foreground)" }}>{pro.verifiedBy}</p>
          <div className="mt-[14px] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Like · {insight.helpful + (helpful ? 1 : 0)}
              </button>
              <button type="button" onClick={onSave} aria-pressed={saved} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]" style={{ color: saved ? "var(--accent-subtle)" : undefined }}>
                <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saved ? "Saved" : "Save"}
              </button>
              <button type="button" onClick={onAddToPlan} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden /> Add to Plan
              </button>
              <button type="button" className="dm-link ml-auto flex min-h-[40px] cursor-pointer items-center gap-[5px]">
                <Flag className="h-3.5 w-3.5" aria-hidden /> Report
              </button>
            </div>
          </div>
        </div>

        <section aria-label="Comments" className="flex flex-col gap-[var(--space-4)]">
          <h2 className="text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Comments ({insight.replies.length + posted.length})
          </h2>
          <div className="flex flex-col gap-[var(--space-4)]">
            {insight.replies.map((reply, index) => {
              const rid = `${insight.id}-r${index}`;
              const isPro = !!reply.proId;
              return (
                <CommentRow
                  key={rid}
                  id={rid}
                  name={isPro ? proById(reply.proId!).name : reply.handle!}
                  chip={isPro ? "Professional" : reply.grade!}
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
          </div>
          <ReplyComposer onPost={(text) => setPosted((current) => [...current, { id: `${insight.id}-local-${current.length}`, body: text }])} />
        </section>
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
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Join ${community.name}`}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.6)" }} />
      <div className="relative z-[1] w-full max-w-[480px] overflow-hidden rounded-t-[var(--radius-2xl)] border sm:rounded-[var(--radius-2xl)]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        <div className="relative flex items-center gap-[12px] overflow-hidden px-[var(--space-5)] py-[14px]" style={{ background: `color-mix(in srgb, ${communityAccent(community)} 24%, #f4f1ea)`, fontFamily: "var(--font-display)" }}>
          <ShapeBadge id={community.id} size={48} radials={false} />
          <h2 className="min-w-0 flex-1 text-[16px] leading-[21px] font-extrabold" style={{ color: CARD_INK }}>Join {community.name}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet relative flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${CARD_INK} 12%, transparent)`, color: CARD_INK }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-[var(--space-3)] p-[var(--space-5)]">
          {/* No unlock ladder, no points gate (direct feedback): joining is
             one agreement away. What you get, then the ground rules. */}
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-start gap-[12px] rounded-[var(--radius-lg)] border p-[var(--space-3)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <CheckCircle2 aria-hidden className="mt-[2px] h-[16px] w-[16px] flex-none" style={{ color: "var(--world-food-farming-nature)" }} />
              <span className="min-w-0 flex-1">
                <strong className="block text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{perk.title}</strong>
                <span className="mt-[2px] block text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{perk.body}</span>
              </span>
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
            className="dm-solid flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] text-[13.5px] font-bold disabled:cursor-default disabled:opacity-50"
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
      <div className="relative z-[1] w-full max-w-[480px] rounded-t-[var(--radius-2xl)] border p-[var(--space-6)] sm:rounded-[var(--radius-2xl)]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        {confirming ? (
          <div aria-live="polite">
            <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase" style={{ color: EVENT_ACCENT }}>You&apos;re on the list</span>
            <h2 className="mt-[4px] text-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{event.name}</h2>
            <p className="mt-[4px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{event.date} · {event.location} · Hosted by {event.host}</p>
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
