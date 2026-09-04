"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, Download, Eye, ShieldCheck, ThumbsUp, TrendingUp } from "lucide-react";
import { Meter, Ring } from "./viz";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { DECK } from "@/components/match-lab/data";
import { readPicks } from "@/lib/picks";
import { EVENT_THREADS, INSIGHTS, PROS, THREADS, type Insight, type Pro, type Thread } from "./data";
import { Avatar, CompanyChip, ConnectNav, InlineAsk, LocalQuestionCard, PrimaryCta, QuietCta, SectionHead, formatCount } from "./primitives";

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

function firstName(name: string) {
  return name.split(" ")[0];
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
export function FollowButton({ following, onToggle, compact = false, className = "" }: { following: boolean; onToggle: () => void; compact?: boolean; className?: string }) {
  const press = () => {
    dispatchAuroraPulse(following ? "select" : "cta");
    onToggle();
  };
  const size = compact ? "sm" : "md";
  if (following) {
    return (
      <QuietCta onClick={press} done size={size} className={className}>
        Following
      </QuietCta>
    );
  }
  return (
    <PrimaryCta onClick={press} size={size} className={className}>
      Follow
    </PrimaryCta>
  );
}

// ——— the career page's section shell: frosted panel, title ruled edge to edge ———
export const PANEL = { background: "var(--glass-surface-2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" } as const;
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
  const ranked = useMemo(() => rankPros(PROS, worlds).slice(0, limit), [worlds, limit]);
  return (
    <section className="flex flex-col gap-[var(--space-3)]" aria-label="Professionals to Follow">
      <SectionHead>Professionals to Follow</SectionHead>
      <ul className="-mx-5 flex gap-[var(--space-5)] overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-[var(--space-8)] sm:px-0" style={{ touchAction: "pan-x pan-y" }}>
        {ranked.map((pro) => {
          // no ring of any kind (direct feedback: a ring reads as a story)
          const following = !!follows[pro.id];
          return (
            <li key={pro.id} className="flex w-[118px] flex-none flex-col items-center gap-[8px] text-center">
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
                <span className="line-clamp-2 block min-h-[32px] w-full text-[13px] leading-[16px] font-semibold" style={{ color: "color-mix(in srgb, var(--foreground) 86%, transparent)" }}>{pro.role}</span>
                <span className="block w-full truncate text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>{pro.org}</span>
              </span>
              <FollowButton compact following={following} onToggle={() => onFollow(pro.id)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Three rows, then the rest on request: "View all 7" / "Show less". */
function MoreToggle({ total, open, onToggle }: { total: number; open: boolean; onToggle: () => void }) {
  if (total <= 3) return <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{total}</span>;
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="dm-link flex min-h-[32px] cursor-pointer items-center text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>
      {open ? "Show less" : `View all ${total}`}
    </button>
  );
}

// ——— New from people you follow ———

type FeedItem = { key: string; pro: Pro; verb: "answered" | "posted"; title: string; open: () => void };

/** What the people the student follows did lately: their newest posts and
 *  answers as plain rows. Renders nothing until they follow someone; the
 *  People to Follow rail above is the invitation. */
export function NewFromFollowing({ follows, limit = 4 }: { follows: Follows; limit?: number }) {
  const nav = useContext(ConnectNav);
  const ids = Object.keys(follows).filter((id) => follows[id]);
  if (ids.length === 0 || !nav) return null;
  const items: FeedItem[] = [];
  for (const id of ids) {
    const pro = PROS.find((p) => p.id === id);
    if (!pro) continue;
    for (const post of postsBy(id)) items.push({ key: `p-${post.id}`, pro, verb: "posted", title: post.title, open: () => nav.openInsight(post.id) });
    for (const thread of answersBy(id)) items.push({ key: `a-${id}-${thread.id}`, pro, verb: "answered", title: thread.title, open: () => nav.openThread(thread.id) });
  }
  if (items.length === 0) return null;
  return (
    <Panel id="following-title" title="New from people you follow">
      <ul className="-mt-[var(--space-2)] flex flex-col">
        {items.slice(0, limit).map((item) => (
          <PanelRow key={item.key} onClick={item.open}>
            <span className="flex items-center gap-[8px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <Avatar name={item.pro.name} verified size={24} />
              <strong className="font-bold" style={{ color: "var(--foreground)" }}>{item.pro.name}</strong> {item.verb}
            </span>
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{item.verb === "answered" ? `“${item.title}”` : item.title}</span>
          </PanelRow>
        ))}
      </ul>
    </Panel>
  );
}

// ——— the profile ———

export function ProProfileView({
  pro,
  follows,
  onFollow,
  onBack,
  onAsked,
}: {
  pro: Pro;
  follows: Follows;
  onFollow: (id: string) => void;
  onBack: () => void;
  onAsked?: (title: string) => void;
}) {
  const nav = useContext(ConnectNav);
  const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const answers = answersBy(pro.id);
  const posts = postsBy(pro.id);
  const [asked, setAsked] = useState<{ id: string; title: string }[]>([]);
  const [allAnswers, setAllAnswers] = useState(false);
  const [allPosts, setAllPosts] = useState(false);
  const following = !!follows[pro.id];

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      {/* Identity: name > the doc's three numbers > role line and story >
         verification. The company is its logo, once. */}
      <section aria-label="Profile" className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={{ ...PANEL, background: `color-mix(in srgb, ${accent} 8%, var(--glass-surface-2))`, borderColor: `color-mix(in srgb, ${accent} 30%, rgba(255,255,255,0.16))` }}>
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <Avatar name={pro.name} verified size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] leading-[29px] font-extrabold text-balance sm:text-[26px] sm:leading-[31px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</h1>
            <p className="mt-[6px] text-[15px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <RoleLine pro={pro} size="md" />
            </p>
          </div>
          {/* full width under the identity on phones, beside it from sm */}
          <div className="basis-full sm:basis-auto">
            <FollowButton following={following} onToggle={() => onFollow(pro.id)} className="w-full sm:w-auto" />
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          {[
            { value: pro.studentsReached + (following ? 1 : 0), label: "Students Reached" },
            { value: pro.followers + (following ? 1 : 0), label: "Followers" },
            { value: pro.totalLikes, label: "Total Likes" },
          ].map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col gap-[2px]">
              <dd className="order-1 text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{formatCount(stat.value)}</dd>
              <dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{stat.label}</dt>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{pro.story}</p>
          <span className="flex items-center gap-[5px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <ShieldCheck className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--accent-subtle)" }} /> {pro.verifiedBy}
          </span>
        </div>
      </section>

      {/* Ask Me Anything is the primary engagement mechanism (doc). The
         composer, and one plain line about where the answer goes. No private
         messages exist, by design. */}
      <Panel id="ama-title" title="Ask Me Anything">
        <InlineAsk
          joined
          accent={accent}
          placeholder={`Ask ${firstName(pro.name)} a question…`}
          onPost={(text) => {
            setAsked((current) => [{ id: `${pro.id}-ama-${current.length}`, title: text }, ...current]);
            onAsked?.(text);
          }}
        />
        {asked.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
      </Panel>

      {answers.length > 0 && (
        <Panel id="answers-title" title="Answers" aside={<MoreToggle total={answers.length} open={allAnswers} onToggle={() => setAllAnswers((v) => !v)} />}>
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {(allAnswers ? answers : answers.slice(0, 3)).map((thread) => {
              const s = signals(thread.views, thread.helpful, undefined);
              return (
                <PanelRow key={thread.id} onClick={() => nav?.openThread(thread.id)}>
                  <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{thread.title}&rdquo;</span>
                  <SignalRow {...s} accent={accent} />
                </PanelRow>
              );
            })}
          </ul>
        </Panel>
      )}

      {posts.length > 0 && (
        <Panel id="posts-title" title="Career posts" aside={<MoreToggle total={posts.length} open={allPosts} onToggle={() => setAllPosts((v) => !v)} />}>
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {(allPosts ? posts : posts.slice(0, 3)).map((insight) => {
              const s = signals(insight.views, insight.helpful, insight.saves);
              return (
                <PanelRow key={insight.id} onClick={() => nav?.openInsight(insight.id)}>
                  <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{insight.title}</span>
                  <SignalRow {...s} accent={accent} />
                </PanelRow>
              );
            })}
          </ul>
        </Panel>
      )}
      {(pro.education || pro.journey || pro.topics) && (
        <Panel id="about-title" title={`About ${firstName(pro.name)}`}>
          <dl className="-mt-[var(--space-2)] flex flex-col">
            {[
              ["Education", pro.education],
              ["Career journey", pro.journey],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-[2px] border-t py-[var(--space-3)] first:border-t-0" style={{ borderColor: RULE }}>
                <dt className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{k}</dt>
                <dd className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{v}</dd>
              </div>
            ))}
            {pro.topics && (
              <div className="flex flex-col gap-[8px] border-t py-[var(--space-3)]" style={{ borderColor: RULE }}>
                <dt className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Can help with</dt>
                <dd className="flex flex-wrap gap-[6px]">
                  {pro.topics.map((t) => (
                    <span key={t} className="rounded-[var(--radius-sm)] border px-[10px] py-[3px] text-[12.5px] leading-[17px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${accent} 45%, var(--glass-border))`, color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }}>{t}</span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </Panel>
      )}
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
                <Avatar name={pro.name} verified size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</span>
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
