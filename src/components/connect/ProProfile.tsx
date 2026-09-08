"use client";

import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, ChevronRight, Download, Eye, Gem, GraduationCap, ImagePlus, Medal, ShieldCheck, ThumbsUp, TrendingUp, Trophy, X } from "lucide-react";
import { Meter, Ring } from "./viz";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { DECK } from "@/components/match-lab/data";
import { readPicks } from "@/lib/picks";
import { COMMUNITIES, EVENT_THREADS, INSIGHTS, PROS, THREADS, type Insight, type Pro, type Thread } from "./data";
import { CommunityCard } from "./CommunityCard";
import { Avatar, CompanyChip, CompanyMark, ConnectNav, InlineAsk, LocalQuestionCard, PrimaryCta, QuietCta, SectionHead, VerifiedBadge, formatCount, volunteerTier } from "./primitives";

// Connect 2.0 (DREAMARI CONNECT 2.pdf): profiles, Ask Me Anything as the
// primary engagement mechanism, People to Follow ranked by relevance first,
// and visible learning signals on every post -- plus a one-screen PREVIEW of
// the professional side (the private impact dashboard and the "Answer one?"
// routing prompt) so the flywheel can be demoed end to end.
//
// Safety by design, expressed in what the UI simply does not offer: students
// follow professionals; professionals never follow students; students have no
// follower count anywhere; there is no message entry point; every question and
// answer lives on a public board.
//
// Density rule (direct feedback, 2026-09-03): the least information that still
// does the job. A person is a portrait, a name, what they do and where (the
// company as its logo), and one Follow button, the way Instagram and TikTok
// suggest people. No field chip, no follower count on the card, no repeated
// role line.

// ——— relevance ———

/** The worlds the student has told us about: their Match Top 3 first. The
 *  DECK is the shared career catalogue, so a picked career id resolves to its
 *  world. Empty when nothing has been picked yet (SSR and first paint). */
export function useStudentWorlds(): string[] {
  const [worlds, setWorlds] = useState<string[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const ids = readPicks().ids;
      const found = ids.map((id) => DECK.find((c) => c.id === id)?.world).filter((w): w is string => Boolean(w));
      setWorlds(Array.from(new Set(found)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return worlds;
}

/** The doc's order: career/industry relevance, then quality and helpfulness,
 *  then credibility, then recent activity, then engagement. Activity separates
 *  similarly relevant people; it never lets an unrelated daily user outrank a
 *  relevant executive. */
export function rankPros(pros: Pro[], worlds: string[]): Pro[] {
  const score = (p: Pro) => {
    const relevance = worlds.length === 0 ? 0 : worlds.indexOf(p.world) === -1 ? 0 : worlds.length - worlds.indexOf(p.world);
    const quality = p.questionsAnswered * 3 + p.totalLikes / 400;
    const activity = p.activeDaysAgo <= 1 ? 2 : p.activeDaysAgo <= 7 ? 1 : 0;
    return relevance * 1000 + quality + activity;
  };
  return [...pros].sort((a, b) => score(b) - score(a));
}

// The 9 newest volunteers (9 Sept 2026) lead every "people to follow" list
// in this exact order (direct feedback: a requested grid order), ahead of
// the engagement-ranked rest -- a brand-new pro has no answers/likes yet to
// rank on, so the ordinary quality score would bury them past page one.
// Shared by the People tab's carousel and the community board's own
// Professionals to Follow strip (direct feedback: "this section in
// communities need to update too" -- same fix, same place, once).
const NEW_PRO_ORDER = ["pro-johnson", "pro-desai", "pro-freeman", "pro-park", "pro-walsh", "pro-brennan", "pro-hartley", "pro-cruz", "pro-sullivan", "pro-iyer"];

export function withNewProsFirst(pros: Pro[], worlds: string[]): Pro[] {
  const byId = new Map(pros.map((p) => [p.id, p]));
  const newOnes = NEW_PRO_ORDER.map((id) => byId.get(id)).filter((p): p is Pro => !!p);
  const newIds = new Set(newOnes.map((p) => p.id));
  return [...newOnes, ...rankPros(pros.filter((p) => !newIds.has(p.id)), worlds)];
}


export function answersBy(proId: string): Thread[] {
  return [...THREADS, ...EVENT_THREADS].filter((t) => t.responses.some((r) => r.kind === "answer" && r.proId === proId));
}

export function postsBy(proId: string): Insight[] {
  return INSIGHTS.filter((i) => i.proId === proId);
}

/** Per-post learning signals in the doc's own format, "8.4K Views · 642 Likes
 *  · 187 Saves". Views and saves that the seed data doesn't carry are derived
 *  deterministically from what it does, so a post never reads as zero. */
export function signals(views: number | undefined, likes: number, saves: number | undefined) {
  const v = views ?? likes * 23 + 140;
  const s = saves ?? Math.max(1, Math.round(likes * 0.29));
  return { views: v, likes, saves: s };
}

export function SignalRow({ views, likes, saves, accent }: { views: number; likes: number; saves: number; accent: string }) {
  return (
    <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
      <span className="flex items-center gap-[4px]"><Eye className="h-3 w-3" aria-hidden style={{ color: accent }} /> {formatCount(views, "compact")} Views</span>
      <span aria-hidden>·</span>
      <span className="flex items-center gap-[4px]"><ThumbsUp className="h-3 w-3" aria-hidden style={{ color: accent }} /> {formatCount(likes)} Likes</span>
      <span aria-hidden>·</span>
      <span className="flex items-center gap-[4px]"><Bookmark className="h-3 w-3" aria-hidden style={{ color: accent }} /> {formatCount(saves)} Saves</span>
    </span>
  );
}

/** "Brand Strategist at [EY]": the role in words, the company as its mark. */
export function RoleLine({ pro, className = "", size = "sm" }: { pro: Pro; className?: string; size?: "sm" | "md" }) {
  return (
    <span className={`inline-flex min-w-0 flex-wrap items-center gap-x-[8px] gap-y-[4px] ${className}`}>
      <span className="min-w-0 truncate">{pro.role}</span>
      <CompanyChip name={pro.org} tone="surface" size={size} />
    </span>
  );
}

// ——— follow ———

export type Follows = Record<string, boolean>;

/** The one Follow control, in both of its states. Same label family
 *  everywhere (Follow -> Following), a check when done, the tick as it flips.
 *  aria-pressed drives the shared data-connect lift rule. */
export function FollowButton({ following, onToggle, compact = false, dense = false, className = "", tone }: { following: boolean; onToggle: () => void; compact?: boolean; /** smaller still, for a Follow button sharing a line with a name and other badges */ dense?: boolean; className?: string; /** the company's colours on a branded card, instead of the app's blue */ tone?: { background: string; color: string; border?: string } }) {
  const press = () => {
    dispatchAuroraPulse(following ? "select" : "cta");
    onToggle();
  };
  const size = dense ? "xs" : compact ? "sm" : "md";
  if (following) {
    return (
      <QuietCta onClick={press} done size={size} className={className}>
        Following
      </QuietCta>
    );
  }
  return (
    <PrimaryCta onClick={press} size={size} className={className} style={tone}>
      Follow
    </PrimaryCta>
  );
}

// ——— the career page's section shell: frosted panel, title ruled edge to edge ———
export const PANEL = { background: "var(--glass-surface-2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" } as const;
export const RULE = "rgba(255,255,255,0.12)";

export function Panel({ id, title, aside, children, className = "" }: { id: string; title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`flex w-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)] ${className}`} style={PANEL}>
      <div className="-mx-[var(--space-5)] flex flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]" style={{ borderColor: RULE }}>
        <SectionHead id={id}>{title}</SectionHead>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** One card of the professional's profile (the reference's structure):
 *  same dark glass as its neighbours, a title row with an optional aside, an
 *  optional lede-plus-side row (Ask Me's composer sits to the right of its
 *  title), then the content. Cards sit space-4 apart so they read as one
 *  page, not five products. */
// darker than the shared panel but still glass: a translucent night tint
// over the page wash, blurred, so the surface recedes without going solid
// (direct feedback, 7 Sept 2026)
// lifted a step from the near-black glass (direct feedback, 7 Sept 2026:
// less moody): the shared panel glass with a touch of the brand blue in it
const CARD = { ...PANEL, background: "color-mix(in srgb, var(--primary) 7%, var(--glass-surface-2))" } as const;
export function ProfileCard({ id, title, lede, side, aside, first = false, children }: { id: string; title: string; lede?: string; side?: React.ReactNode; aside?: React.ReactNode; first?: boolean; children: React.ReactNode }) {
  // one section of the single profile surface: ruled off from the one above,
  // no box of its own (direct feedback, 7 Sept 2026: no card after card)
  return (
    <section aria-labelledby={id} className={`flex w-full flex-col gap-[var(--space-4)] p-[var(--space-5)] sm:p-[var(--space-6)] ${first ? "" : "border-t"}`} style={{ borderColor: RULE }}>
      <div className={`flex flex-col gap-[var(--space-3)] ${side ? "sm:flex-row sm:items-center sm:justify-between sm:gap-[var(--space-5)]" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <span className="flex flex-col gap-[2px]">
            <SectionHead id={id}>{title}</SectionHead>
            {lede && <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{lede}</span>}
          </span>
          {aside}
        </div>
        {side && <div className="min-w-0 flex-1 sm:max-w-[520px]">{side}</div>}
      </div>
      {children}
    </section>
  );
}

/** An inset row inside a profile card: a quieter surface than the card, the
 *  content, a chevron at the end. */
export function InsetRow({ onClick, children, label }: { onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <li>
      <button type="button" onClick={onClick} aria-label={label} className="dm-quiet flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-left" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        <span className="flex min-w-0 flex-1 flex-col gap-[6px]">{children}</span>
        <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </button>
    </li>
  );
}

/** One row in a panel: hairline above, the row's own hover inside the
 *  panel's padding, never a box inside a box. */
export function PanelRow({ onClick, children, label }: { onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <li className="border-t first:border-t-0" style={{ borderColor: RULE }}>
      <button type="button" onClick={onClick} aria-label={label} className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] cursor-pointer flex-col gap-[6px] rounded-[var(--radius-sm)] px-[8px] py-[var(--space-4)] text-left">
        {children}
      </button>
    </li>
  );
}

// ——— People to Follow (below the communities) ———

/** A row of faces, no frames (direct feedback): the portrait is the card.
 *  Big avatar, no ring, the verified shield on its corner and nothing else, the first name, the role, the firm as text, and
 *  a small Follow button. Tapping the face opens the profile. */
export function PeopleToFollow({ follows, onFollow, limit = 6 }: { follows: Follows; onFollow: (id: string) => void; limit?: number }) {
  const nav = useContext(ConnectNav);
  const worlds = useStudentWorlds();
  const ranked = useMemo(() => withNewProsFirst(PROS, worlds).slice(0, limit), [worlds, limit]);
  return (
    <section className="flex flex-col gap-[var(--space-3)]" aria-label="Professionals to Follow">
      <SectionHead>Professionals to Follow</SectionHead>
      <ul className="-mx-5 flex gap-[var(--space-5)] overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-[var(--space-8)] sm:px-0" style={{ touchAction: "pan-x pan-y" }}>
        {ranked.map((pro) => {
          // no ring of any kind (direct feedback: a ring reads as a story)
          const following = !!follows[pro.id];
          return (
            <li key={pro.id} className="flex w-[124px] flex-none flex-col items-center gap-[8px] text-center">
              <span className="relative block h-[88px] w-[88px]">
                <button
                  type="button"
                  onClick={() => nav?.openPro(pro.id)}
                  aria-label={`Open ${pro.name}'s profile`}
                  className="dm-tap flex h-[88px] w-[88px] cursor-pointer items-center justify-center rounded-full leading-none"
                >
                  <Avatar name={pro.name} size={80} />
                </button>
                {/* the one badge: verified. Tier medals came off (direct
                   feedback): one icon in three tints that everyone wore said
                   nothing a student could use. */}
                <span
                  role="img"
                  aria-label="Verified professional"
                  title="Verified professional"
                  className="absolute right-[-1px] bottom-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-full border-2"
                  style={{ background: "var(--color-glass-surface-3, #1c1a2e)", borderColor: "var(--background)" }}
                >
                  <ShieldCheck className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--accent-subtle)" }} />
                </span>
              </span>
              <span className="flex w-full min-w-0 flex-col items-center gap-[1px]">
                {/* three tiers, top down: the name (heading), what they do
                   (subheading, in ink), where (body, muted) */}
                <span className="block w-full truncate text-[15px] leading-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name.split(" ")[0]}</span>
                {/* one line each, like Instagram's suggestions: every column is the
                   same height, so Follow sits the same distance from every face.
                   A long role truncates and the full text shows on hover. */}
                <span className="block w-full truncate text-[13px] leading-[16px] font-semibold" title={pro.role} style={{ color: "color-mix(in srgb, var(--foreground) 86%, transparent)" }}>{pro.role}</span>
                <span className="block w-full truncate text-[11.5px] leading-[15px]" title={pro.org} style={{ color: "var(--muted-foreground)" }}>{pro.org}</span>
              </span>
              <FollowButton compact following={following} onToggle={() => onFollow(pro.id)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}


// ——— New from people you follow ———

type FeedItem = { key: string; pro: Pro; verb: "answered" | "posted"; topic: string; open: () => void };

/** A plain-language topic, not the literal question/post title -- the
 *  reference's own copy is "Answered a question about healthcare", never
 *  a quoted title (direct feedback: "do not add copy that is not there on
 *  the Replit screenshot"). */
function topicFor(boardId: string): string {
  const world = COMMUNITIES.find((c) => c.id === boardId)?.world;
  return (world ?? "their field").toLowerCase();
}

/** What the people the student follows did lately: a grid of flat cards,
 *  each with a "Read answer"/"Read post" link -- the reference's own shape
 *  (direct feedback: "stick to the Replit's structure, the new from people
 *  you follow are cards with read answer etc"), not a bordered ruled-row
 *  panel. Renders nothing until they follow someone; the People to Follow
 *  section above is the invitation. */
export function NewFromFollowing({ follows, limit = 4 }: { follows: Follows; limit?: number }) {
  const nav = useContext(ConnectNav);
  const ids = Object.keys(follows).filter((id) => follows[id]);
  if (ids.length === 0 || !nav) return null;
  // One card per followed person, not one per thing they ever posted --
  // direct feedback: with only a couple of people followed by default, a
  // prolific pro's whole backlog buried everyone else ("David Chen is
  // everywhere"). Prefer their most recent answer, else their most recent
  // post, so the list stays as varied as who the student actually follows.
  const items: FeedItem[] = [];
  for (const id of ids) {
    const pro = PROS.find((p) => p.id === id);
    if (!pro) continue;
    const thread = answersBy(id)[0];
    const post = postsBy(id)[0];
    if (thread) items.push({ key: `a-${id}-${thread.id}`, pro, verb: "answered", topic: topicFor(thread.boardId), open: () => nav.openThread(thread.id) });
    else if (post) items.push({ key: `p-${post.id}`, pro, verb: "posted", topic: topicFor(post.boardId), open: () => nav.openInsight(post.id) });
  }
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-[var(--space-3)]" aria-label="New from people you follow">
      <SectionHead>New from people you follow</SectionHead>
      <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        {items.slice(0, limit).map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
            <span className="flex min-w-0 items-center gap-[10px]">
              <Avatar name={item.pro.name} size={36} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-[4px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                  <span className="truncate">{item.pro.name}</span> <VerifiedBadge size={13} />
                </span>
                <span className="block truncate text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{item.verb === "answered" ? `Answered a question about ${item.topic}` : `Posted about ${item.topic}`}</span>
              </span>
            </span>
            <button type="button" onClick={item.open} className="dm-link flex-none cursor-pointer text-[13px] leading-[18px] font-bold whitespace-nowrap" style={{ color: "var(--accent-subtle)" }}>{item.verb === "answered" ? "Read answer" : "Read post"}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ——— the profile ———

// Covers: the same set the student's My Profile offers, so a professional's
// header is their own identity, never their employer's colours (direct
// feedback, 5 Sept 2026). Picked per person from their id until profiles
// carry a real cover choice.
const PRO_COVERS = ["streaks", "fluted", "smoke", "molten", "frosted", "horizon"].map((n) => `/images/profile/covers/${n}.webp`);
function coverFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PRO_COVERS[h % PRO_COVERS.length];
}

/** 48.1K, 1.9K, 6.8K: the shortened counts students know from Instagram and TikTok. */
export function shortCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

// One accent for every professional profile, whatever the industry (direct
// feedback, 5 Sept 2026): likes, saves, chips and buttons are Dreamari blue,
// the way LinkedIn's profile chrome never changes with the job.
const PRO_ACCENT = "var(--accent-subtle)";

export function ProProfileView({
  pro,
  follows,
  onFollow,
  onBack,
  onAsked,
  onOpenDashboard,
}: {
  pro: Pro;
  follows: Follows;
  onFollow: (id: string) => void;
  onBack: () => void;
  onAsked?: (title: string) => void;
  /** Volunteer demo only: the professional looking at their own page can step into the private dashboard. */
  onOpenDashboard?: () => void;
}) {
  const nav = useContext(ConnectNav);
  const answers = answersBy(pro.id);
  const posts = postsBy(pro.id);
  // the boards they answer in: their world's board plus the shared one
  const communities = COMMUNITIES.filter((c) => c.world === pro.world || c.id === "teaching-education");
  const [asked, setAsked] = useState<{ id: string; title: string }[]>([]);
  const [allAnswers, setAllAnswers] = useState(false);
  const [allPosts, setAllPosts] = useState(false);
  const following = !!follows[pro.id];
  const tier = volunteerTier(pro);
  const TierIcon = tier?.name === "Diamond" ? Gem : tier?.name === "Gold" ? Trophy : Medal;
  // views of the profile and its answers, the public number IG and TikTok lead with
  const views = Math.round(pro.studentsReached * 3.8);
  const ink = "#FFFFFF";
  const soft = "rgba(255,255,255,0.78)";
  const rule = "rgba(255,255,255,0.18)";
  // The professional's own cover choice (their page, their identity). Kept
  // per person in the browser until profiles carry it server-side.
  const coverKey = `dreamari:pro-cover:${pro.id}`;
  const [cover, setCover] = useState(coverFor(pro.id));
  const [coverOpen, setCoverOpen] = useState(false);
  useEffect(() => {
    // syncing with the browser's storage (an external system), which is what
    // the set-state-in-effect rule exists to allow
    try {
      const saved = window.localStorage.getItem(coverKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && PRO_COVERS.includes(saved)) setCover(saved);
    } catch {}
  }, [coverKey]);
  const pickCover = (url: string) => {
    setCover(url);
    setCoverOpen(false);
    try { window.localStorage.setItem(coverKey, url); } catch {}
  };

  return (
    <>
      {/* Structure follows Joshua's reference (6 Sept 2026), minus the
         full-bleed cover: the way back and Follow on one row above the
         header, the header itself, then Ask Me, Latest Posts, Communities
         and About as connected cards. */}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> View all professionals
        </button>
        <div className="flex items-center gap-[var(--space-3)]">
          {onOpenDashboard && (
            <QuietCta size="sm" onClick={onOpenDashboard}>
              My dashboard <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </QuietCta>
          )}
          <FollowButton following={following} onToggle={() => onFollow(pro.id)} />
        </div>
      </div>

      {/* Identity, in the student profile's own language: a personal cover
         photo with the name on it (never the company's colours), the tier by
         the name, role and company mark, Follow, three shortened numbers,
         the story, then what was verified. */}
      <section aria-label="Profile" className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "rgba(255,255,255,0.16)", background: "#0e0c20", color: ink, boxShadow: "0 18px 40px -28px rgba(0,0,0,0.6)" }}>
        <div className="absolute inset-0" aria-hidden>
          <Image src={cover} alt="" fill sizes="(max-width: 992px) 100vw, 992px" className="object-cover transition-opacity duration-500" style={{ objectPosition: "50% 40%" }} priority />
          <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.96) 0%, rgba(12,16,35,0.82) 40%, rgba(12,16,35,0.3) 78%, rgba(12,16,35,0.08) 100%)" }} />
        </div>
        {/* the professional's own controls, the student header's Cover button
           in the same corner; students see no controls here */}
        {onOpenDashboard && (
          <div className="absolute top-[var(--space-4)] right-[var(--space-4)] z-10 flex items-center rounded-[var(--radius-md)] p-[2px]" style={{ background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
            <button type="button" aria-label="Change cover photo" aria-expanded={coverOpen} onClick={() => setCoverOpen((o) => !o)} className="dm-quiet flex h-9 cursor-pointer items-center gap-[5px] rounded-[var(--radius-md)] px-[10px] text-[14px] font-semibold" style={{ color: coverOpen ? PRO_ACCENT : "rgba(255,255,255,0.86)" }}>
              <ImagePlus className="h-3.5 w-3.5" aria-hidden /> Cover
            </button>
          </div>
        )}
        {coverOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Choose a cover photo" style={{ fontFamily: "var(--font-body)" }}>
            <button type="button" aria-label="Close" onClick={() => setCoverOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }} />
            <div className="relative z-[1] flex w-full max-w-[480px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
              <div className="flex items-center justify-between gap-[var(--space-3)]">
                <h3 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Cover photo</h3>
                <button type="button" onClick={() => setCoverOpen(false)} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-[8px]">
                {PRO_COVERS.map((url) => (
                  <button key={url} type="button" aria-label="Use this cover" aria-pressed={cover === url} onClick={() => pickCover(url)} className="dm-tap relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[var(--radius-sm)]" style={{ boxShadow: cover === url ? "0 0 0 2px var(--primary)" : "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
                    <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="relative flex flex-col gap-[var(--space-5)] p-[var(--space-5)] pt-[72px] sm:p-[var(--space-6)] sm:pt-[88px]">
          <div className="flex flex-wrap items-center gap-[var(--space-4)] sm:gap-[var(--space-5)]">
            <Avatar name={pro.name} size={96} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
                <span className="flex items-center gap-[6px]">
                  <h1 className="text-[24px] leading-[29px] font-extrabold text-balance sm:text-[26px] sm:leading-[31px]" style={{ fontFamily: "var(--font-display)", color: ink }}>{pro.name}</h1>
                  <VerifiedBadge size={18} />
                </span>
                {tier && (
                  <span className="inline-flex items-center gap-[5px] rounded-[6px] px-[8px] py-[3px] text-[11px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={{ background: "rgba(255,255,255,0.12)", color: ink, border: `1px solid ${rule}` }} title={tier.note}>
                    <TierIcon className="h-[12px] w-[12px]" aria-hidden style={{ color: PRO_ACCENT }} /> {tier.name} volunteer
                  </span>
                )}
              </div>
              <p className="mt-[6px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[15px] leading-[20px] font-semibold" style={{ color: soft }}>
                <span>{pro.role}</span>
                <span aria-hidden style={{ color: rule }}>|</span>
                <CompanyMark name={pro.org} ink={ink} height={13} />
              </p>
              {/* the three public numbers as one line with icons and
                 dividers, the reference's stat row */}
              <dl className="mt-[var(--space-4)] flex flex-wrap items-center gap-y-[var(--space-2)]">
                {[
                  { value: views, label: "Views" },
                  { value: pro.followers + (following ? 1 : 0), label: "Followers" },
                  { value: pro.totalLikes, label: "Likes" },
                ].map((stat, index) => (
                  <div key={stat.label} className={`flex items-center pr-[var(--space-4)] ${index > 0 ? "border-l pl-[var(--space-4)]" : ""}`} style={{ borderColor: rule }}>
                    <span className="flex flex-col">
                      <dd className="text-[18px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: ink }}>{shortCount(stat.value)}</dd>
                      <dt className="text-[12px] leading-[16px] font-semibold" style={{ color: soft }}>{stat.label}</dt>
                    </span>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Ask Me: title and one line on the left, the composer on the right,
         then the questions already answered as inset rows */}
      <div className="flex w-full flex-col rounded-[var(--radius-lg)] border" style={CARD}>
      {/* no lede: "Ask Me" and the composer already say it (Chandu, 7 Sept 2026) */}
      <ProfileCard id="ask-title" title="Ask Me" first side={
        <InlineAsk
          joined
          accent="var(--primary)"
          placeholder="Ask a question…"
          onPost={(text) => {
            setAsked((current) => [{ id: `${pro.id}-ama-${current.length}`, title: text }, ...current]);
            onAsked?.(text);
          }}
        />
      }>
        {asked.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
        {answers.length > 0 && (
          <ul className="flex flex-col gap-[var(--space-3)]">
            {/* one question at rest, the rest behind View all: shorter section */}
            {(allAnswers ? answers : answers.slice(0, 1)).map((thread) => {
              const s = signals(thread.views, thread.helpful, undefined);
              return (
                <InsetRow key={thread.id} onClick={() => nav?.openThread(thread.id)} label={thread.title}>
                  <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{thread.title}</span>
                  <span className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                    <SignalRow {...s} accent={PRO_ACCENT} />
                    <span className="flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[12px] leading-[16px] font-bold" style={{ background: "color-mix(in srgb, var(--color-feedback-success, #33c78c) 18%, transparent)", color: "var(--color-feedback-success, #33c78c)" }}><ShieldCheck className="h-3 w-3" aria-hidden /> Answered</span>
                  </span>
                </InsetRow>
              );
            })}
          </ul>
        )}
        {answers.length > 1 && (
          <div className="flex justify-end">
            <button type="button" onClick={() => setAllAnswers((v) => !v)} aria-expanded={allAnswers} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>{allAnswers ? "Show less" : `View all ${answers.length}`} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>
          </div>
        )}
      </ProfileCard>

      {posts.length > 0 && (
        <ProfileCard id="posts-title" title="My Posts" aside={posts.length > 2 ? <button type="button" onClick={() => setAllPosts((v) => !v)} aria-expanded={allPosts} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>{allPosts ? "Show less" : "View all"} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button> : undefined}>
          <ul className="flex flex-col gap-[var(--space-3)]">
            {(allPosts ? posts : posts.slice(0, 2)).map((insight) => {
              const s = signals(insight.views, insight.helpful, insight.saves);
              return (
                <InsetRow key={insight.id} onClick={() => nav?.openInsight(insight.id)} label={insight.title}>
                  <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{insight.title}</span>
                  <SignalRow {...s} accent={PRO_ACCENT} />
                </InsetRow>
              );
            })}
          </ul>
        </ProfileCard>
      )}

      {communities.length > 0 && (
        <ProfileCard id="communities-title" title="Communities" aside={<button type="button" onClick={() => nav?.openBoard(communities[0].id)} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>View all <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>}>
          <ul className="grid gap-[var(--space-4)] sm:grid-cols-2">
            {communities.map((c) => (
              <li key={c.id} className="min-w-0">
                <CommunityCard community={c} joined compact onOpen={() => nav?.openBoard(c.id)} onJoin={() => nav?.openBoard(c.id)} />
              </li>
            ))}
          </ul>
        </ProfileCard>
      )}

      <ProfileCard id="about-title" title="About">
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{pro.story}</p>
        {pro.education && (
          <div className="flex items-center gap-[var(--space-3)]">
            <span aria-hidden className="flex size-[44px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "var(--glass-surface-2)", boxShadow: "inset 0 0 0 1px var(--glass-border)" }}>
              <GraduationCap className="h-[18px] w-[18px]" style={{ color: "var(--muted-foreground)" }} />
            </span>
            <span className="flex min-w-0 flex-col gap-[1px]">
              <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Education</span>
              <span className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{pro.education}</span>
            </span>
          </div>
        )}
        {pro.topics && (
          <div className="flex flex-wrap gap-[6px]">
            {pro.topics.map((t) => (
              <span key={t} className="rounded-[var(--radius-sm)] border px-[10px] py-[4px] text-[12.5px] leading-[17px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${PRO_ACCENT} 45%, var(--glass-border))`, color: PRO_ACCENT, background: `color-mix(in srgb, ${PRO_ACCENT} 12%, transparent)` }}>{t}</span>
            ))}
          </div>
        )}
        <span className="flex items-center gap-[5px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <ShieldCheck className="h-[13px] w-[13px]" aria-hidden style={{ color: PRO_ACCENT }} /> {pro.verifiedBy}
        </span>
      </ProfileCard>
      </div>
    </>
  );
}

// ——— partner / employer side, one screen, preview only ———

// Shape follows the CEO's Replit "Corporate Partnership Dashboard"
// (/corporate/dashboard): goals against targets, the two lanes (in-person
// events and virtual mentorship on Dreamari), the events themselves, the
// professionals, and an exportable report. Demo figures for the named company.
const PARTNER_GOALS = [
  { label: "Students reached", value: 3420, target: 4000 },
  { label: "Employee volunteers", value: 1247, target: 2000 },
  { label: "Events completed", value: 8, target: 19 },
];
const PARTNER_EVENTS = [
  { name: "Interview Prep Workshop", where: "Wilmington campus", when: "Jan 8", volunteers: 88, students: 150, done: true },
  { name: "Networking Workshop", where: "Jersey City campus", when: "Jan 29", volunteers: 94, students: 200, done: true },
  { name: "STEM in Corporate", where: "Chicago tower", when: "Feb 5", volunteers: 97, students: 188, done: true },
  { name: "Career Exposure Panel", where: "Park Ave, New York", when: "Oct 14", volunteers: 61, students: 0, done: false },
];

export function PartnerView({ org, onBack }: { org: string; onBack: () => void }) {
  const nav = useContext(ConnectNav);
  const people = PROS.filter((p) => p.org === org);
  const accent = WORLD_COLORS[people[0]?.world ?? "Business & Money"] ?? "var(--primary)";
  const lanes = [
    { title: "In person", stats: [["8", "events"], ["1,247", "volunteers"], ["3,118", "hours"]] },
    { title: "On Dreamari", stats: [["42", "professionals"], ["2,300", "answers"], ["14,000", "students"]] },
  ];
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="min-w-0">
          <h1 className="flex items-center gap-[10px] text-[26px] leading-[31px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            <CompanyChip name={org} tone="surface" size="lg" /> <span>on Dreamari</span>
          </h1>
        </div>
        <PrimaryCta onClick={() => dispatchAuroraPulse("cta")} className="min-h-[36px] px-[var(--space-4)] text-[14px]"><span className="flex items-center gap-[6px]" style={{ color: "#FFFFFF" }}><Download className="h-4 w-4" aria-hidden /> Export report</span></PrimaryCta>
      </div>

      {/* goals against targets: the Replit's "North Star" block, as three rows */}
      <Panel id="partner-goals-title" title="2026 goals" aside={<span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--world-food-farming-nature)" }}><TrendingUp className="h-4 w-4" aria-hidden /> +27% volunteers vs. last year</span>}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          {PARTNER_GOALS.map((g, i) => {
            const pct = Math.round((g.value / g.target) * 100);
            return (
              <li key={g.label} className={`flex items-center gap-[var(--space-4)] ${i > 0 ? "border-t pt-[var(--space-4)] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[var(--space-4)]" : ""}`} style={{ borderColor: RULE }}>
                <Ring pct={pct} accent={accent} size={84}>
                  <span className="text-[18px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pct}%</span>
                </Ring>
                <span className="min-w-0 flex flex-col gap-[2px]">
                  <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{g.label}</span>
                  <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                    <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{formatCount(g.value)}</strong> of {formatCount(g.target)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      {/* the two lanes the CEO reports on, and how the students split between them */}
      <Panel id="partner-lanes-title" title="This year" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><strong className="font-extrabold" style={{ color: "var(--foreground)" }}>16,220</strong> students reached</span>}>
        <div className="flex flex-col gap-[6px]">
          <span className="flex h-[10px] w-full overflow-hidden rounded-[5px]" aria-hidden>
            <span className="h-full" style={{ width: "21%", background: `color-mix(in srgb, ${accent} 70%, #ffffff)` }} />
            <span className="h-full flex-1" style={{ background: accent }} />
          </span>
          <span className="flex justify-between text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
            <span><span aria-hidden className="mr-[6px] inline-block size-[8px] rounded-[2px] align-[-1px]" style={{ background: `color-mix(in srgb, ${accent} 70%, #ffffff)` }} />In person 3,420 · 21%</span>
            <span><span aria-hidden className="mr-[6px] inline-block size-[8px] rounded-[2px] align-[-1px]" style={{ background: accent }} />On Dreamari 12,800 · 79%</span>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
          {lanes.map((lane, i) => (
            <div key={lane.title} className={`flex flex-col gap-[var(--space-3)] ${i === 1 ? "border-t pt-[var(--space-4)] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[var(--space-5)]" : ""}`} style={{ borderColor: RULE }}>
              <h3 className="text-[18px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)", color: accent }}>{lane.title}</h3>
              <dl className="grid grid-cols-3 gap-[var(--space-3)]">
                {lane.stats.map(([value, label]) => (
                  <div key={label} className="flex flex-col gap-[2px]">
                    <dd className="order-1 text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</dd>
                    <dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="partner-events-title" title="Events" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>8 of 19 completed</span>}>
        <ul className="-mt-[var(--space-2)] flex flex-col">
          {PARTNER_EVENTS.map((e) => (
            <li key={e.name + e.when} className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[8px] border-t py-[var(--space-3)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
              <span className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                <span className="block text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{e.name}</span>
                <span className="block text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{e.when} · {e.where}</span>
              </span>
              <span className="flex basis-full flex-wrap items-center gap-x-[var(--space-4)] gap-y-[6px] sm:basis-auto">
                <Meter value={e.volunteers} max={200} accent={accent} label="volunteers" />
                {e.done ? <Meter value={e.students} max={300} accent={`color-mix(in srgb, ${accent} 70%, #ffffff)`} label="students" /> : <span className="text-[12px] leading-[16px] font-semibold" style={{ color: accent }}>Upcoming</span>}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel id="company-people-title" title="Your professionals" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{people.length} on Dreamari</span>}>
        <ul className="-mt-[var(--space-2)] flex flex-col">
          {people.map((pro) => (
            <PanelRow key={pro.id} onClick={() => nav?.openPro(pro.id)}>
              <span className="flex w-full items-center gap-[10px]">
                <Avatar name={pro.name} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-[4px] truncate text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={13} /></span>
                  <span className="block truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
                </span>
                <span className="flex-none text-right text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                  <strong className="block text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: accent }}>{formatCount(pro.studentsReached)}</strong> students reached
                </span>
              </span>
            </PanelRow>
          ))}
        </ul>
      </Panel>
    </>
  );
}
