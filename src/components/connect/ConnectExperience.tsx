"use client";

import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { AppBackdrop } from "@/components/app/AppBackdrop";

import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
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
  Star,
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
  Camera,
} from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { WORLD_COLORS } from "@/components/app/worlds";
import { COMPANY_BRAND, COMPANY_MARKS, CompanyChip, ConnectNav, CONTACT_INFO, CONTACT_WARNING, LetterMark, ProAvatar } from "./primitives";
import { Segmented } from "./viz";
import { FollowButton } from "./ProProfile";
import { NewFromFollowing, Panel, PanelRow, PartnerView, PeopleToFollow, ProProfileView, RULE, useStudentWorlds, type Follows } from "./ProProfile";
import { ProDashboardView } from "./ProDashboard";
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
  type Insight,
  type Thread, OPPORTUNITIES , type Opportunity } from "./data";

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

type LandingTab = "communities" | "events" | "notifications";
type View =
  | { kind: "home"; tab: LandingTab }
  | { kind: "board"; id: string; filter: string }
  | { kind: "pro"; id: string }
  | { kind: "proDashboard"; id: string }
  | { kind: "event"; id: string; filter: string }
  | { kind: "thread"; id: string }
  | { kind: "insight"; id: string }
  | { kind: "saved" }
  | { kind: "activity" }
  | { kind: "admin" }
  | { kind: "partner"; org: string };

function viewToQuery(view: View): string {
  if (view.kind === "saved") return "?saved=1";
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
  if (q.get("activity")) return { kind: "activity" };
  if (q.get("admin")) return { kind: "admin" };
  if (q.get("partner")) return { kind: "partner", org: q.get("partner")! };
  if (q.get("insight")) return { kind: "insight", id: q.get("insight")! };
  if (q.get("thread")) return { kind: "thread", id: q.get("thread")! };
  if (q.get("event")) return { kind: "event", id: q.get("event")!, filter: q.get("filter") ?? "all" };
  if (q.get("board")) return { kind: "board", id: q.get("board")!, filter: q.get("filter") ?? "questions" };
  if (q.get("dashboard")) { const id = q.get("dashboard")!; return { kind: "proDashboard", id: id === "pro" ? "pro-okafor" : id }; }
  if (q.get("pro")) return { kind: "pro", id: q.get("pro")! };
  const tab = q.get("tab");
  return { kind: "home", tab: tab === "events" || tab === "notifications" ? tab : "communities" };
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
        <button type="button" onClick={() => setText((t) => t || "What does a typical week actually look like in this career?")} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-[var(--radius-md)] border px-[13px] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--hero-accent-purple) 50%, var(--glass-border))", color: "var(--accent-subtle)", background: "color-mix(in srgb, var(--hero-accent-purple) 12%, transparent)" }}>
          <Sparkles className="h-[13px] w-[13px]" aria-hidden /> AI Ideas
        </button>
        <button type="button" onClick={() => setText((t) => t.trim() ? t.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase()).replace(/([^?.!])$/, "$1?") : t)} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-[var(--radius-md)] border px-[13px] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Polish
        </button>
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
  // Professionals always wear their portrait (direct feedback: a face for
  // Elena Martinez); students stay behind the flag.
  const isPro = PROS.some((p) => p.name === name);
  const photo = USE_PHOTO_AVATARS || isPro ? AVATAR_PHOTO[name] : undefined;
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
function communityAccent(community: Pick<Community, "world">): string {
  return WORLD_COLORS[community.world] ?? "var(--primary)";
}

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
const POSTER_GRAIN = "/images/connect/covers/grain.png";

// The CEO's own reference photography (people-free), cropped for the cards.
const PHOTO_COVER: Record<string, string> = {
  "teaching-education": "/images/connect/covers/photo4-teaching-education.webp",
  "business-money": "/images/connect/covers/photo4-business-money.webp",
  "tech-engineering": "/images/connect/covers/photo4-tech-engineering.webp",
  "health-medicine": "/images/connect/covers/photo4-health-medicine.webp",
  "arts-media": "/images/connect/covers/photo4-arts-media.webp",
};

// Focal point per scene so the card strip frames the SUBJECT (the laptop,
// the towers, the monitors, the stethoscope, the studio desk) -- never an
// empty stretch of room.
// Events are Dream Opportunity branded in the photo lane -- one DO cover
// for all events, with the partner's own logo as the identity mark.
// Internal demo; we work with these partners, so their logos are cleared.
/** The event surface, everywhere an event is shown (direct feedback: no
 *  photos on event cards or boards): dark glass, the partner's colour as one
 *  glow rising from the top-right corner, a fine ruled pattern, grain. */
function EventSurface({ accent }: { accent: string }) {
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
      <span aria-hidden className="absolute top-0 left-1/2 z-20 h-[6px] w-[44px] -translate-x-1/2 rounded-b-[6px] opacity-90" style={{ background: lit }} />
      {/* the card's edge, drawn here so every event surface gets the same one */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${lit} 45%, transparent)` }} />
    </>
  );
}

// Each event wears its partner's brand accent (EY yellow, Chase blue,
// AT&T blue) across surface, CTA, and filters.
function partnerAccent(host: string): string {
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
function EventMarks({ lead, partner, size = "md", ink: inkColor }: { lead: string; partner?: string; size?: "md" | "lg"; ink?: string }) {
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

const PHOTO_FOCUS: Record<string, string> = {
  "teaching-education": "58% 42%",
  "business-money": "68% 42%",
  "tech-engineering": "50% 48%",
  "health-medicine": "48% 38%",
  "arts-media": "48% 45%",
};

// The community card follows the Replit prototype's structure one for one
// (the CEO's gold standard): a header band carrying the name and its
// category, four stat tiles, then one action at the right. Ours puts the
function StatTile({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-[1px] rounded-[var(--radius-sm)] px-[2px] py-[9px]" style={{ background: "rgba(12,16,35,0.58)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
      <span className="text-[17px] leading-[21px] font-extrabold tabular-nums" style={{ color: "#FFFFFF" }}>{value}</span>
      <span className="max-w-full truncate text-[10.5px] leading-[14px] font-semibold tracking-[-0.01em]" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
    </div>
  );
}

function CommunityCard({ community, joined, onOpen, onJoin, featured }: { community: Community; joined: boolean; onOpen: () => void; onJoin: () => void; featured?: boolean }) {
  const accent = communityAccent(community);
  return (
    <div
      className="dm-tap group @container relative flex h-full min-h-[312px] flex-col overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${accent} 45%, transparent)`, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
    >
      {/* Our full-bleed photo, but dimmed and frosted so type wins: the photo
         runs at reduced brightness, the poster card's progressive blur
         ramps up from the folio over most of the card, a heavy bottom
         vignette sits under the tiles and rows, a light top scrim under the
         title, then the accent tint and grain. */}
      <span aria-hidden className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <Image src={PHOTO_COVER[community.id] ?? community.photo} alt="" fill sizes="640px" className="object-cover" style={{ objectPosition: PHOTO_FOCUS[community.id] ?? "60% 42%", filter: "brightness(0.78) saturate(0.92)" }} />
        <CardProgressiveBlur size="74%" />
        <span
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, rgba(12,16,35,0.94) 0%, rgba(12,16,35,0.8) 30%, rgba(12,16,35,0.42) 56%, rgba(12,16,35,0.08) 80%, transparent 100%), ${cardTopScrim()}, linear-gradient(90deg, color-mix(in srgb, ${accent} 12%, transparent), color-mix(in srgb, ${accent} 12%, transparent))` }}
        />
        <span className="absolute inset-0" style={{ backgroundImage: `url(${POSTER_GRAIN})`, backgroundSize: "128px 128px", backgroundRepeat: "repeat", mixBlendMode: "overlay", opacity: 0.2 }} />
      </span>
      <span aria-hidden className="absolute top-0 left-1/2 z-20 h-[6px] w-[44px] -translate-x-1/2 rounded-b-[6px] opacity-90" style={{ background: accent }} />

      {/* the whole card is the tap target (direct feedback) */}
      <button type="button" onClick={joined ? onOpen : onJoin} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">Open {community.name}</span>
      </button>

      {featured && (
        <span className="absolute top-[14px] right-[16px] z-20 inline-flex items-center gap-[5px] rounded-[var(--radius-sm)] px-[11px] py-[4px] text-[11px] leading-[15px] font-medium" style={{ background: "rgba(9,10,20,0.72)", color: "#FFFFFF" }}>
          <Star className="h-[11px] w-[11px]" fill="currentColor" aria-hidden style={{ color: "#f5c04e" }} /> Most Popular
        </span>
      )}

      {/* Information in the Replit's order: name and category up top; four
         stat tiles; the companies row; one action at the right. */}
      <div className="pointer-events-none relative z-20 flex h-full w-full flex-col px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-4)]" style={{ fontFamily: "var(--font-display)" }}>
        {/* the title carries the card: bigger than anything under it */}
        <h3 className={`text-[24px] leading-[28px] font-extrabold text-balance ${featured ? "pr-[104px]" : ""}`} style={{ color: "#FFFFFF" }}>{community.name.replace(/ Careers$/, "")}</h3>

        {/* three tiles fill the card's width, the same on every card; the
           marks sit centred under them */}
        {/* three tiles: who is here, who answers, and from how many
           companies. Post counts came off (CEO, 4 Sept); companies stayed
           because a partner nonprofit reads them as reach. */}
        <div className="mt-auto grid grid-cols-3 gap-[8px] pt-[var(--space-5)]" style={{ textShadow: "none" }}>
          <StatTile value={community.students.toLocaleString("en-US")} label="Students" />
          <StatTile value={community.activePros} label="Pros" />
          <StatTile value={community.professionalsFrom.length} label="Companies" />
        </div>
        {/* one row closes the card: the marks left, the action right. No rule. */}
        <div className="pointer-events-auto mt-[10px] flex min-w-0 items-center justify-between gap-[var(--space-3)]" style={{ textShadow: "none" }}>
          {/* marks step down with the card's own width (container query):
             one under 360px, two under 460px, three above. The count chip
             always says how many are missing, so Open never gets crowded. */}
          <div className="flex min-w-0 items-center gap-[6px]">
            {community.professionalsFrom.slice(0, 3).map((name, index) => (
              <span key={name} className={index === 0 ? "flex" : index === 1 ? "hidden @[360px]:flex" : "hidden @[460px]:flex"}><CompanyChip name={name} /></span>
            ))}
            {[1, 2, 3].map((shown) => {
              const missing = community.professionalsFrom.length - shown;
              if (missing <= 0) return null;
              const vis = shown === 1 ? "flex @[360px]:hidden" : shown === 2 ? "hidden @[360px]:flex @[460px]:hidden" : "hidden @[460px]:flex";
              return (
                <span key={shown} className={`${vis} h-[28px] flex-none items-center rounded-[var(--radius-sm)] px-[9px] text-[12px] leading-[16px] font-bold`} style={{ background: "rgba(12,16,35,0.58)", color: "#FFFFFF", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>+{missing}{shown === 3 ? " more" : ""}</span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${community.name}`}
            className="dm-quiet group/cta flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-[var(--radius-sm)] px-[8px] text-[13px] leading-[18px] font-extrabold tracking-[0.04em] whitespace-nowrap uppercase"
            style={{ color: `color-mix(in srgb, ${accent} 45%, #FFFFFF)` }}
          >
            Open <ArrowRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover/cta:translate-x-[3px]" aria-hidden strokeWidth={2.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

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
function QuestionCard({ thread, onOpen, saved, onSave, helpful, onHelpful, accent = "var(--primary)" }: { thread: Thread; onOpen: () => void; saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void; accent?: string }) {
  // Display count for the demo (data.ts `comments`), falling back to the
  // real list; the thread itself may hold fewer. Direct feedback.
  const comments = thread.comments ?? thread.responses.length;
  return (
    <Card accent={accent} className="dm-tap group relative cursor-pointer">
      {/* The WHOLE card opens the thread (direct feedback: "make it
         obviously easily clickable") -- an overlay target under the
         like/save controls, a hover ring, and a chevron that says "this
         goes somewhere" before you ever hover. */}
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-lg)]">
        <span className="sr-only">Open question: {thread.title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent)` }} />
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
            <span className="inline-flex flex-none rounded-[var(--radius-sm)] border px-[9px] py-[2px] text-[10.5px] leading-[15px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: "color-mix(in srgb, var(--hero-accent-purple) 55%, var(--glass-border))", color: "var(--accent-subtle)", background: "color-mix(in srgb, var(--hero-accent-purple) 14%, transparent)" }}>
              Unanswered
            </span>
          )}
        </span>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{thread.postedAgo}</span>
      </div>
      <h3 className="mt-[12px] pr-[22px] text-[16px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>&ldquo;{thread.title}&rdquo;</h3>
      <div className="relative z-20 mt-[14px] flex items-center gap-[var(--space-5)] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <button type="button" onClick={onHelpful} aria-pressed={helpful} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]" style={{ color: helpful ? "var(--accent-subtle)" : undefined }}>
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {thread.helpful + (helpful ? 1 : 0)}
        </button>
        <button type="button" onClick={onOpen} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[5px]">
          <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> <span className="whitespace-nowrap">{comments} comments</span>
        </button>
        {/* Save rides next to comments at a smaller size (direct feedback):
           one cluster to read, not three corners. */}
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-sm)] px-[6px] text-[11.5px]" style={{ color: saved ? "var(--accent-subtle)" : "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
          <Bookmark className="h-3 w-3" aria-hidden /> {saved ? "Saved" : "Save"}
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
  const nav = useContext(ConnectNav);
  return (
    <Card accent={accent} className="dm-tap group relative cursor-pointer">
      {/* The WHOLE card opens the insight's thread -- overlay target under
         the like/save controls, hover ring, and an always-visible chevron. */}
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-lg)]">
        <span className="sr-only">Open insight: {insight.title}</span>
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent)` }} />
      <ChevronRight aria-hidden className="pointer-events-none absolute top-1/2 right-[10px] h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />

      <div className="flex items-start gap-[12px] pr-[22px]">
        <ProAvatar proId={pro.id} name={pro.name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[6px]">
            <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link relative z-20 cursor-pointer text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</button>
            <span className="rounded-[var(--radius-sm)] border px-[8px] py-[1px] text-[10.5px] leading-[15px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--world-food-farming-nature) 55%, var(--glass-border))", color: "var(--world-food-farming-nature)", background: "color-mix(in srgb, var(--world-food-farming-nature) 12%, transparent)" }}>Pro</span>
            <span className="flex min-w-0 items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span className="truncate">{pro.role}</span> <CompanyChip name={pro.org} tone="surface" size="sm" /></span>
          </div>
          <h3 className="mt-[8px] text-[15.5px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>{insight.title}</h3>
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
  const [codeOpenFor, setCodeOpenFor] = useState<string | null>(null);
  /** Community awaiting join confirmation in the JoinSheet. */
  const [joinFor, setJoinFor] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(COMMUNITIES.map((c) => [c.id, c.joined])));
  const [eventJoined, setEventJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.entitled])));
  const [saves, setSaves] = useState<Record<string, boolean>>({ "t-ib-hours": true, "i-day-in-life": true });
  const [helpfuls, setHelpfuls] = useState<Record<string, boolean>>({});
  const [announce, setAnnounce] = useState("");
  // Connect 2.0: who the student follows (local for the prototype).
  const [follows, setFollows] = useState<Follows>({});
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
  const volunteer = view.kind === "proDashboard" ? view.id : view.kind === "partner" ? (PROS.find((p) => p.org === view.org)?.id ?? "pro-okafor") : "pro-okafor";

  // restore view from URL on mount; keep URL in sync so filters survive
  // reload/share (handoff 8.3). Deliberately an effect, not a lazy useState
  // initializer: window.location.search is only knowable client-side, and
  // reading it during the initial render would mismatch the server-rendered
  // HTML. This IS syncing with an external system (the URL), which is what
  // the set-state-in-effect rule exists to allow.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewState(queryToView(window.location.search));
    const params = new URLSearchParams(window.location.search);
    const as = params.get("as");
    if (as && ROLES.some((r) => r.key === as)) setRole(as as DemoRole);
    else if (params.get("admin")) setRole("admin");
    else if (params.get("dashboard")) setRole("pro");
    else if (params.get("partner")) setRole("partner");
  }, []);
  const setView = useCallback((next: View, as?: DemoRole) => {
    setViewState(next);
    const base = viewToQuery(next);
    const keep = as ?? new URLSearchParams(window.location.search).get("as");
    window.history.replaceState(null, "", "/connect" + base + (keep && keep !== "student" ? (base ? "&" : "?") + "as=" + keep : ""));
    window.scrollTo(0, 0);
  }, []);

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


  const cardProps = (id: string) => ({
    saved: !!saves[id],
    onSave: () => toggleSave(id),
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
        className={`relative z-10 mx-auto flex w-full flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] md:px-8 md:pt-[var(--space-10)] ${
          view.kind === "home" ? "max-w-[1100px]" : "max-w-[880px]"
        }`}
      >
        <RoleTabs
          role={role}
          onPick={(next) => {
            setRole(next);
            if (next === "student") setView({ kind: "home", tab: "communities" }, next);
            if (next === "attendee") setView({ kind: "home", tab: "events" }, next);
            if (next === "pro") setView({ kind: "proDashboard", id: volunteer }, next);
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
              else setView({ kind: "proDashboard", id }, role);
            }}
          />
        )}

        {view.kind === "home" && (
          <HomeView
            tab={view.tab}
            onTab={(tab) => setView({ kind: "home", tab })}
            eventJoined={eventJoined}
            onOpenBoard={(id) => setView({ kind: "board", id, filter: "questions" })}
            onOpenEvent={(id) => setView({ kind: "event", id, filter: "all" })}
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
          />
        )}

        {view.kind === "pro" &&
          (() => {
            const pro = PROS.find((p) => p.id === view.id);
            if (!pro) return null;
            const boardId = COMMUNITIES.find((c) => c.world === pro.world)?.id ?? "teaching-education";
            return <ProProfileView pro={pro} follows={follows} onFollow={toggleFollow} onBack={() => setView({ kind: "home", tab: "communities" })} onAsked={(title) => nav.noteAsked(title, boardId)} />;
          })()}
        {view.kind === "proDashboard" && <ProDashboardView key={view.id} pro={PROS.find((p) => p.id === view.id)} onBack={() => setView({ kind: "home", tab: "communities" })} />}
        {view.kind === "admin" && <AdminDashboardView onBack={() => setView({ kind: "home", tab: "communities" })} />}
        {view.kind === "partner" && <PartnerView org={view.org} onBack={() => setView({ kind: "home", tab: "communities" })} />}
        {view.kind === "activity" && (
          <ActivityView
            asked={asked}
            follows={follows}
            savedCount={Object.values(saves).filter(Boolean).length}
            onBack={() => setView({ kind: "home", tab: "communities" })}
            onOpenThread={(id) => setView({ kind: "thread", id })}
            onDeleteAsked={(id) => { setAsked((a) => a.filter((q) => q.id !== id)); say("Question deleted."); }}
          />
        )}
        {view.kind === "saved" && <SavedView saves={saves} onUnsave={(id) => toggleSave(id)} onBack={() => setView({ kind: "home", tab: "communities" })} onOpenThread={(id) => setView({ kind: "thread", id })} onOpenInsight={(id) => setView({ kind: "insight", id })} />}

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
            onBack={() => setView({ kind: "home", tab: "communities" })}
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
                onBack={() => setView({ kind: "board", id: insight.boardId, filter: "insights" })}
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
                  onBack={() => setView({ kind: "home", tab: "events" })}
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
            onBack={() => {
              setView(eventById(thread.boardId) ? { kind: "event", id: thread.boardId, filter: "all" } : { kind: "board", id: thread.boardId, filter: "questions" });
            }}
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
            setView({ kind: "event", id, filter: "all" });
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

// ——— demo role switcher (for showing the journeys separately, not a product feature) ———

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
            <Avatar name={p.name} verified size={40} />
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
  return (
    <div className="flex items-center gap-[10px]">
      <span className="hidden flex-none rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase sm:inline" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Demo</span>
      <div role="tablist" aria-label="Show Connect as" className="flex min-w-0 max-w-full flex-1 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none] sm:flex-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
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
      </div>
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
}) {
  const eventInk = "#f6f5fb";
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
      {/* Title and the Community/Events toggle share one row on wider
         screens (same pattern as Explore's header: title left, controls
         right, one row instead of three stacked blocks) and wrap onto
         their own line on phones where there isn't room. */}
      <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-5)] gap-y-[var(--space-4)]">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-[32px] font-extrabold tracking-[0.02em] uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Find your community</h1>
        </div>
        <TopTabs tab={tab} onTab={onTab} />
      </div>

      {tab !== "notifications" && (
        <label className="flex min-h-[48px] items-center gap-[10px] rounded-[var(--radius-md)] border px-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          <Search className="h-[18px] w-[18px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "events" ? "Search events and partners" : "Search communities, topics, companies"}
            aria-label={tab === "events" ? "Search events" : "Search communities"}
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
              const joined = eventJoined[event.id];
              // the date the card is about (the next one when booked), its time
              // once confirmed, then where: the city lives here, not in the name
              const when = [event.nextDate ?? event.date, event.time].filter(Boolean).join(", ");
              return (
                <div
                  key={event.id}
                  className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-[var(--radius-lg)]"
                  style={{ background: "#0e0c20", fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
                >
                  <EventSurface accent={pAccent} />
                  <div className="relative z-10 flex flex-1 flex-col px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-5)]">
                    <h3 className="text-[22px] leading-[27px] font-extrabold text-balance" style={{ color: eventInk }}>{event.name}</h3>
                    {/* when, then where, one per line with its icon; the
                       company is in the name so only the city appears */}
                    <p className="mt-[8px] flex flex-col gap-[3px] text-[13.5px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)" }}>
                      <span className="flex items-center gap-[7px]"><Calendar className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${pAccent} 60%, #fff)` }} /> {when}</span>
                      <span className="flex items-center gap-[7px]"><MapPin className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${pAccent} 60%, #fff)` }} /> {event.location}</span>
                    </p>
                    <div className="mt-auto pt-[var(--space-5)]">
                      {typeof event.students === "number" ? (
                        <div className="grid grid-cols-3 gap-[6px]">
                          <StatTile value={event.students.toLocaleString("en-US")} label="Students" />
                          <StatTile value={(event.pros ?? 0).toLocaleString("en-US")} label="Pros" />
                          <StatTile value={(event.postCount ?? 0).toLocaleString("en-US")} label="Posts" />
                        </div>
                      ) : (
                        <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)" }}>Opens after the event</p>
                      )}
                    </div>
                    <div className="mt-[var(--space-4)] flex w-full flex-wrap items-center justify-between gap-[var(--space-3)]">
                      <EventMarks lead={event.partner === "Dream Opportunity" ? event.partner : event.lead} partner={event.partner === "Dream Opportunity" ? event.lead : event.partner} />
                      {joined ? (
                        <PrimaryCta className="min-h-[38px] px-[var(--space-4)]" onClick={() => onOpenEvent(event.id)}>Open board <ArrowRight className="h-[14px] w-[14px]" aria-hidden strokeWidth={2.75} /></PrimaryCta>
                      ) : upcoming ? null : (
                        <PrimaryCta className="min-h-[38px] px-[var(--space-4)]" onClick={() => onEnterCode(event.id)}><KeyRound className="h-[14px] w-[14px]" aria-hidden /> Enter code</PrimaryCta>
                      )}
                    </div>
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

/** The page-level Community/Events switcher: one glass segmented control
 *  with a sliding thumb, instead of two disconnected chips. */
const LANDING_TABS = [
  { key: "communities", label: "Community", Icon: Users },
  { key: "events", label: "Events", Icon: Calendar },
  { key: "notifications", label: "Notifications", Icon: Bell },
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
        style={{ background: "var(--primary)", transform: `translateX(${index * 100}%)`, boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--primary) 70%, transparent)" }}
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
        <p className="mt-[4px] text-[13px] leading-[18px] font-medium" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)" }}>{picked ? "Your vote is in. We launch the winner." : "One vote. The winner opens first."}</p>
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
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const threads = THREADS.filter((t) => t.boardId === community.id);
  const insights = INSIGHTS.filter((i) => i.boardId === community.id);
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
         delivered, CEO 4 Sept): three feeds, each named with one line under
         it, plus About. Student Questions, Professional Insights, Industry
         Updates. Card designs and the header stay ours. */}
      <Segmented ariaLabel="Board section" value={tab} onChange={(key) => onFilter(key)} options={[{ key: "questions", label: "Questions" }, { key: "insights", label: "Insights" }, { key: "updates", label: "Updates" }, { key: "about", label: "About" }]} />
      {tab !== "about" && (
        <div className="-mt-[var(--space-2)]">
          <h2 className="text-[22px] leading-[26px] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            {tab === "questions" ? "Student Questions" : tab === "insights" ? "Professional Insights" : "Industry Updates"}
          </h2>
          <p className="mt-[2px] text-[14px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
            {tab === "questions" ? "Ask. Learn. Grow." : tab === "insights" ? "Read insights from professionals and join the conversation." : "Verified posts from the firms whose pros answer here."}
          </p>
        </div>
      )}

      {about && (
        <Panel id="about-community-title" title="About this community">
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{community.purpose}</p>
            ))}
          </div>
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
          {postedQs.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
          {threads.map((t) => <QuestionCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} accent={communityAccent(community)} {...cardProps(t.id)} />)}
          {/* the composer closes the feed (reference order): read first, then ask */}
          <InlineAsk
            joined={joined}
            onRequireJoin={onJoin}
            accent={communityAccent(community)}
            placeholder="What do you want to ask?"
            onPost={(text) => { setPostedQs((current) => [{ id: `${community.id}-local-${current.length}`, title: text }, ...current]); nav?.noteAsked(text, community.id); }}
          />
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
          {insights.map((i) => <InsightCard key={i.id} insight={i} onOpen={() => onOpenInsight(i.id)} accent={communityAccent(community)} {...cardProps(i.id)} />)}
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
  cardProps: (id: string) => { saved: boolean; onSave: () => void; helpful: boolean; onHelpful: () => void };
}) {
  const threads = EVENT_THREADS.filter((t) => t.boardId === event.id);
  const [postedQs, setPostedQs] = useState<{ id: string; title: string }[]>([]);
  const [planAdded, setPlanAdded] = useState(false);
  const eventInk = "#f6f5fb";
  const pAccent = partnerAccent(event.host);
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Connect
      </button>

      <section
        aria-label="Event context"
        className="group relative overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)]"
        style={{ background: "#0e0c20", fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
      >
        <EventSurface accent={pAccent} />
        {/* the lockup sits in the header's top-right corner, on the header's own
           padding, at card size: a fixed anchor rather than a flex item that
           drifted with the title's line count (direct feedback) */}
        <div className="absolute top-[var(--space-5)] right-[var(--space-6)] z-10">
          <EventMarks lead={event.partner === "Dream Opportunity" ? event.partner : event.lead} partner={event.partner === "Dream Opportunity" ? event.lead : event.partner} />
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
        {/* who is inside: the numbers a partner nonprofit is paying for */}
        {typeof event.students === "number" && (
          <div className="relative z-10 mt-[var(--space-4)] grid max-w-[420px] grid-cols-3 gap-[6px]">
            <StatTile value={event.students.toLocaleString("en-US")} label="Students" />
            <StatTile value={(event.pros ?? 0).toLocaleString("en-US")} label="Pros" />
            <StatTile value={(event.postCount ?? 0).toLocaleString("en-US")} label="Posts" />
          </div>
        )}
        <div className="relative z-10 mt-[var(--space-4)] flex w-full items-center justify-between border-t pt-[10px]" style={{ borderColor: `color-mix(in srgb, ${eventInk} 18%, transparent)` }}>
          <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${eventInk} 74%, transparent)` }}>
            <ShieldCheck className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: `color-mix(in srgb, ${pAccent} 70%, ${eventInk})` }} />
            Attendees + event pros only
          </span>
        </div>
      </section>

      <InlineAsk
        joined
        accent={pAccent}
        placeholder="Ask what you missed…"
        onPost={(text) => setPostedQs((current) => [{ id: `${event.id}-local-${current.length}`, title: text }, ...current])}
      />
      {postedQs.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}

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
            <QuietCta onClick={() => dispatchAuroraPulse("cta")}><Camera className="h-[14px] w-[14px]" aria-hidden /> {event.official.photosLabel}</QuietCta>
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

      {/* Resources: View resource, never Apply now (handoff 10.3) */}
      {event.resources && event.resources.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Event resources">
          <SectionHead>Resources from the event</SectionHead>
          {event.resources.map((r) => (
            <div key={r.title} className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--glass-border)" }}>
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
        accent={pAccent}
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
  cardProps,
  saves,
  toggleSave,
  helpfuls,
  toggleHelpful,
}: {
  thread: Thread;
  onBack: () => void;
  onOpenThread: (id: string) => void;
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
        <div>
          <h1 className="text-[20px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{thread.title}</h1>
          {thread.context && <p className="mt-[6px] text-[13.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{thread.context}</p>}
          <div className="mt-[10px]"><IdentityBadge handle={thread.handle} grade={thread.grade} postedAgo={thread.postedAgo} /></div>
        </div>

        <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[4px] border-b pb-[12px] text-[12px] leading-[16px]" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          <StatusChip state={thread.state} />
          {/* the question's likes live up here with the question, not at the
             bottom of the answer (direct feedback) */}
          <button type="button" onClick={() => toggleHelpful(thread.id)} aria-pressed={!!helpfuls[thread.id]} className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-[var(--radius-sm)] px-[8px] text-[12.5px] font-semibold" style={{ color: helpfuls[thread.id] ? "var(--accent-subtle)" : "var(--foreground)" }}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {thread.helpful + (helpfuls[thread.id] ? 1 : 0)}
          </button>
        </div>

        {thread.responses.map((r, index) => {
          if (r.kind === "answer") {
            const rid = thread.id + "-a" + index;
            return (
              <div key={rid} className="rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--glass-surface-2)", borderColor: r.primary ? "color-mix(in srgb, var(--world-food-farming-nature) 50%, var(--glass-border))" : "var(--glass-border)" }}>
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                  <ProBadge proId={r.proId} postedAgo={r.postedAgo} />
                  <span className="flex items-center gap-[8px]">
                  {nav && <FollowButton compact following={nav.isFollowing(r.proId)} onToggle={() => nav.toggleFollow(r.proId)} />}
                  {r.primary && (
                    <span className="flex-none rounded-[var(--radius-sm)] px-[10px] py-[3px] text-[11px] font-extrabold tracking-[0.05em] uppercase" style={{ background: "color-mix(in srgb, var(--world-food-farming-nature) 18%, transparent)", color: "var(--world-food-farming-nature)" }}>
                      Top answer
                    </span>
                  )}
                  </span>
                </div>
                <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
                <p className="mt-[12px] text-[14px] leading-[22px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
                {r.disclosure && (
                  <p className="mt-[8px] text-[11px] leading-[15px] italic" style={{ color: "var(--muted-foreground)" }}>{r.disclosure}</p>
                )}
                <div className="mt-[12px] border-t" style={{ borderColor: "var(--glass-border)" }} />
                <div className="mt-[12px] flex flex-wrap items-center gap-[var(--space-5)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <button type="button" onClick={() => toggleHelpful(rid)} aria-pressed={!!helpfuls[rid]} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px] tabular-nums" style={{ color: helpfuls[rid] ? "var(--accent-subtle)" : undefined }}>
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {answerLikes(rid, r.primary) + (helpfuls[rid] ? 1 : 0)}
                  </button>
                  <button type="button" onClick={() => toggleSave(rid, "answer")} aria-pressed={!!saves[rid]} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]" style={{ color: saves[rid] ? "var(--accent-subtle)" : undefined }}>
                    <Bookmark className="h-3.5 w-3.5" aria-hidden /> {saves[rid] ? "Saved" : "Save"}
                  </button>
                  <button type="button" onClick={() => nav?.share(`?thread=${thread.id}`, thread.title)} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[5px]">
                    <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
                  </button>
                  <button type="button" onClick={() => nav?.report(rid)} aria-label="Report this answer" className="dm-link ml-auto flex min-h-[44px] cursor-pointer items-center gap-[4px] text-[11px] opacity-55 hover:opacity-100">
                    <Flag className="h-3 w-3" aria-hidden /> Report
                  </button>
                </div>
              </div>
            );
          }
          if (r.kind === "followup") {
            return (
              <div key={thread.id + "-f" + index} className="ml-[var(--space-6)] flex flex-col gap-[3px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)", borderColor: "rgba(255,255,255,0.16)" }}>
                <span className="flex items-center gap-[5px] text-[11px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                  <CornerDownRight className="h-3 w-3" aria-hidden /> Follow-up · {r.postedAgo}
                </span>
                <p className="text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
              </div>
            );
          }
          const pid = thread.id + "-p" + index;
          return (
            <div key={pid} className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)", borderColor: "rgba(255,255,255,0.16)" }}>
              <CommentRow id={pid} name={r.handle} chip="Student" meta={r.grade} chipTone="student" body={r.body} postedAgo={r.postedAgo} likes={r.likes ?? 0} liked={!!helpfuls[pid]} onLike={toggleHelpful} image={r.image} imageAlt={r.imageAlt} />
            </div>
          );
        })}

        {thread.responses.length === 0 && (
          <Card>
            <p className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>No answer yet.</p>
            <p className="mt-[4px] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Sent to verified pros in {boardName}. Usually answered {thread.expectedWindow}.</p>
          </Card>
        )}

        {posted.map((reply) => (
          <div key={reply.id} className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)", borderColor: "rgba(255,255,255,0.16)" }}>
            <CommentRow id={reply.id} name="Jordan" chip="Student" meta="Junior" chipTone="student" body={reply.body} postedAgo="Just now" likes={0} liked={!!helpfuls[reply.id]} onLike={toggleHelpful} />
          </div>
        ))}
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

/** A comment under an insight or thread: avatar, name + role chip, the
 *  line itself, then a working like button and the time. `likes` is the
 *  seeded count; the toggle adds the student's own on top. */
function CommentRow({ id, name, chip, chipTone, meta, body, postedAgo, likes, liked, onLike, image, imageAlt }: { id: string; name: string; chip: string; chipTone: "pro" | "student"; meta?: string; body: string; postedAgo: string; likes: number; liked: boolean; onLike: (id: string) => void; image?: string; imageAlt?: string }) {
  const tone = chipTone === "pro" ? "var(--world-food-farming-nature)" : "var(--accent-subtle)";
  const nav = useContext(ConnectNav);
  // a professional's face and name open their profile; students have none
  const pro = chipTone === "pro" ? PROS.find((p) => p.name === name) : undefined;
  return (
    <div className="flex items-start gap-[12px]">
      {pro ? <ProAvatar proId={pro.id} name={name} size={32} /> : <Avatar name={name} size={32} />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[6px]">
          {pro ? (
            <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link cursor-pointer text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{name}</button>
          ) : (
            <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{name}</span>
          )}
          <span className="rounded-[var(--radius-sm)] border px-[8px] py-[1px] text-[10.5px] leading-[15px] font-bold" style={{ borderColor: `color-mix(in srgb, ${tone} 50%, var(--glass-border))`, color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>{chip}</span>
          {meta && <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{meta}</span>}
          <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{postedAgo}</span>
        </div>
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
        <div className="rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--card))", borderColor: "var(--glass-border)" }}>
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
              <button type="button" onClick={() => nav?.share(`?insight=${insight.id}`, insight.title)} className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[5px]">
                <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
              </button>
              <button type="button" onClick={() => nav?.report(insight.id)} aria-label="Report this insight" className="dm-link ml-auto flex min-h-[40px] cursor-pointer items-center gap-[4px] text-[11px] opacity-55 hover:opacity-100">
                <Flag className="h-3 w-3" aria-hidden /> Report
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
