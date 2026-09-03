"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, CheckCircle2, Eye, ShieldCheck, ThumbsUp, TrendingUp, Users } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { DECK } from "@/components/match-lab/data";
import { readPicks } from "@/lib/picks";
import { COMMUNITIES, EVENT_THREADS, INSIGHTS, PROS, THREADS, type Insight, type Pro, type Thread } from "./data";
import { Avatar, CompanyMark, ConnectNav, InlineAsk, LocalQuestionCard, PrimaryCta, QuietCta, SectionHead, formatCount } from "./primitives";

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
function signals(views: number | undefined, likes: number, saves: number | undefined) {
  const v = views ?? likes * 23 + 140;
  const s = saves ?? Math.max(1, Math.round(likes * 0.29));
  return { views: v, likes, saves: s };
}

function SignalRow({ views, likes, saves, accent }: { views: number; likes: number; saves: number; accent: string }) {
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
function RoleLine({ pro, className = "" }: { pro: Pro; className?: string }) {
  return (
    <span className={`inline-flex min-w-0 flex-wrap items-center gap-x-[6px] gap-y-[2px] ${className}`}>
      <span className="min-w-0 truncate">{pro.role}</span>
      <span className="flex-none">at</span>
      <CompanyMark name={pro.org} ink="currentColor" />
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
  const size = compact ? "min-h-[36px] px-[var(--space-4)] text-[13px]" : "";
  if (following) {
    return (
      <QuietCta onClick={press} done className={`${size} ${className}`}>
        Following
      </QuietCta>
    );
  }
  return (
    <PrimaryCta onClick={press} className={`${size} ${className}`}>
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

/** Instagram's "Suggested for you" shape: portrait, name, one line for what
 *  they do and where, Follow. The whole card opens the profile. */
export function PeopleToFollow({ follows, onFollow, limit = 8 }: { follows: Follows; onFollow: (id: string) => void; limit?: number }) {
  const nav = useContext(ConnectNav);
  const worlds = useStudentWorlds();
  const ranked = useMemo(() => rankPros(PROS, worlds).slice(0, limit), [worlds, limit]);
  return (
    <section className="flex flex-col gap-[var(--space-3)]" aria-label="People to Follow">
      <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
        <SectionHead>People to Follow</SectionHead>
        {worlds.length > 0 && (
          <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Picked for your Top 3
          </span>
        )}
      </div>
      <div className="-mx-5 flex snap-x gap-[var(--space-3)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]">
        {ranked.map((pro) => {
          const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
          return (
            <div
              key={pro.id}
              className="dm-tap relative flex w-[172px] flex-none snap-start flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-3)] pt-[var(--space-5)] pb-[var(--space-3)] text-center"
              style={{ ...PANEL, background: `color-mix(in srgb, ${accent} 8%, var(--glass-surface-2))`, borderColor: `color-mix(in srgb, ${accent} 30%, rgba(255,255,255,0.16))` }}
            >
              <button type="button" onClick={() => nav?.openPro(pro.id)} className="absolute inset-0 z-0 cursor-pointer rounded-[inherit]">
                <span className="sr-only">Open {pro.name}&apos;s profile</span>
              </button>
              <Avatar name={pro.name} verified size={72} />
              <div className="relative z-[1] flex min-w-0 w-full flex-col items-center gap-[2px]">
                <span className="block w-full truncate text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</span>
                <span className="block w-full truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
                <span className="mt-[4px] flex h-[16px] items-center" style={{ color: "var(--foreground)" }}>
                  <CompanyMark name={pro.org} ink="var(--foreground)" className="text-[12px] leading-[16px] font-semibold" />
                </span>
              </div>
              <div className="relative z-[1] mt-[2px] w-full">
                <FollowButton compact className="w-full" following={!!follows[pro.id]} onToggle={() => onFollow(pro.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
          <Avatar name={pro.name} verified size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-[31px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</h1>
            <p className="mt-[4px] text-[15px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <RoleLine pro={pro} />
            </p>
          </div>
          <div className="flex-none">
            <FollowButton following={following} onToggle={() => onFollow(pro.id)} />
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
        <p className="flex items-center gap-[6px] text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          <ShieldCheck className="h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
          Answers are public, so one answer helps every student. There are no private messages.
        </p>
      </Panel>

      {answers.length > 0 && (
        <Panel id="answers-title" title="Answers" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{answers.length} answered</span>}>
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {answers.map((thread) => {
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
        <Panel id="posts-title" title="Career posts">
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {posts.map((insight) => {
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
    </>
  );
}

// ——— professional side, one screen, preview only ———

/** The questions Dreamari routed to this professional this week: one real
 *  seeded thread from their board plus two demo questions, so the
 *  "Answer one?" prompt has something behind it. */
const ROUTED: { id: string; handle: string; grade: string; title: string; threadId?: string }[] = [
  { id: "r1", handle: "Diego", grade: "Sophomore", title: "Is accounting actually boring, or is that just a stereotype?", threadId: "t-fin-accounting" },
  { id: "r2", handle: "Priya", grade: "Junior", title: "Is going to a state school a dealbreaker for investment banking?" },
  { id: "r3", handle: "Theo", grade: "Freshman", title: "What should I major in if I want to work in finance?" },
];

type RoutedState = "open" | "answering" | "answered" | "skipped";

/** Not reachable from any student surface: it exists so the flywheel the doc
 *  describes (route a question -> answer in minutes -> see the impact) can be
 *  demoed end to end. Numbers and copy are the doc's own examples. */
export function ProDashboardView({ onBack }: { onBack: () => void }) {
  const pro = PROS.find((p) => p.id === "pro-okafor") ?? PROS[0];
  const nav = useContext(ConnectNav);
  const [routed, setRouted] = useState<Record<string, RoutedState>>({});
  const [draft, setDraft] = useState("");
  const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const board = COMMUNITIES.find((c) => c.world === pro.world)?.name ?? "the community";
  const answeredNow = Object.values(routed).filter((s) => s === "answered").length;
  const openCount = ROUTED.filter((q) => (routed[q.id] ?? "open") === "open" || routed[q.id] === "answering").length;
  const impact = [
    { value: 4281, label: "Impressions" },
    { value: 786, label: "Students Reached" },
    { value: 142, label: "Profile Views" },
    { value: 91, label: "Saves" },
    { value: 63, label: "New Followers" },
    { value: 37 + answeredNow, label: "Questions Answered" },
  ];
  const words = openCount === 3 ? "Three" : openCount === 2 ? "Two" : openCount === 1 ? "One" : "No";

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex items-center gap-[12px]">
          <Avatar name={pro.name} verified size={44} />
          <div className="min-w-0">
            <h1 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</h1>
            <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}><RoleLine pro={pro} /></p>
          </div>
        </div>
        <span className="rounded-[var(--radius-sm)] border px-[10px] py-[3px] text-[11px] leading-[15px] font-bold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Professional view · preview
        </span>
      </div>

      {/* Ask Me Anything routing: a direct student question is a far stronger
         reason to respond than a blank page. Answer · Skip, never an
         obligation. Each row is one routed question. */}
      <Panel id="route-title" title="Ask Me Anything">
        <h3 className="text-[18px] leading-[24px] font-semibold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          {openCount > 0 ? `${words} students asked questions about investment banking this week. Answer one?` : "You answered this week's questions. We will route the next relevant one."}
        </h3>
        <ul className="-mt-[var(--space-2)] flex flex-col">
          {ROUTED.map((q) => {
            const state = routed[q.id] ?? "open";
            return (
              <li key={q.id} className="flex flex-col gap-[10px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{q.handle} · {q.grade}</span>
                <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{q.title}&rdquo;</span>
                {state === "open" && (
                  <div className="flex flex-wrap gap-[var(--space-2)]">
                    <PrimaryCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => { dispatchAuroraPulse("select"); setRouted((r) => ({ ...r, [q.id]: "answering" })); setDraft(""); }}>Answer</PrimaryCta>
                    <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => setRouted((r) => ({ ...r, [q.id]: "skipped" }))}>Skip</QuietCta>
                  </div>
                )}
                {state === "answering" && (
                  <div className="flex flex-col gap-[8px]">
                    <label className="block">
                      <span className="sr-only">Your answer</span>
                      <textarea
                        autoFocus
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={3}
                        placeholder="A few honest sentences from your own experience is plenty."
                        className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[15px] leading-[22px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
                        style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                      <PrimaryCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => { if (!draft.trim()) return; dispatchAuroraPulse("cta"); setRouted((r) => ({ ...r, [q.id]: "answered" })); }}>Post answer</PrimaryCta>
                      <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => setRouted((r) => ({ ...r, [q.id]: "open" }))}>Cancel</QuietCta>
                      <span className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Public on {board}. Students see your name and company, never their classmates&apos; details.</span>
                    </div>
                  </div>
                )}
                {state === "answered" && (
                  <span className="flex flex-wrap items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--world-food-farming-nature)" }}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Live on {board}.
                    {q.threadId && (
                      <button type="button" onClick={() => nav?.openThread(q.threadId!)} className="dm-link cursor-pointer" style={{ color: "var(--foreground)" }}>See the thread</button>
                    )}
                  </span>
                )}
                {state === "skipped" && (
                  <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Skipped. Nothing changes.</span>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>

      {/* Career posts stay secondary (doc). Suggested prompts remove the
         blank-page problem. */}
      <Panel id="post-title" title="Career posts">
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>Optional. Start from a prompt.</p>
        <div className="flex flex-wrap gap-[8px]">
          {["5 things I wish I knew before starting my career", "What people misunderstand about investment banking", "What I actually do during a normal workday", "What I would tell my 16-year-old self"].map((p) => (
            <button key={p} type="button" className="dm-quiet rounded-[var(--radius-md)] border px-[14px] py-[9px] text-left text-[14px] leading-[18px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>
              {p}
            </button>
          ))}
        </div>
      </Panel>

      {/* Private Impact Dashboard: the doc's example numbers. Private,
         motivational, never a public badge. */}
      <Panel
        id="impact-title"
        title="Private Impact Dashboard"
        aside={
          <span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--world-food-farming-nature)" }}>
            <TrendingUp className="h-4 w-4" aria-hidden /> +28% Reach vs. Last Month
          </span>
        }
      >
        <dl className="grid grid-cols-2 gap-x-[var(--space-5)] sm:grid-cols-3">
          {impact.map((stat, i) => (
            <div key={stat.label} className={`flex flex-col gap-[2px] py-[var(--space-3)] ${i >= 2 ? "border-t sm:border-t-0" : ""} ${i >= 3 ? "sm:border-t" : ""}`} style={{ borderColor: RULE }}>
              <dd className="order-1 text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{formatCount(stat.value)}</dd>
              <dt className="order-2 text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{stat.label}</dt>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-[6px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>
            Your answers reached 18% more students this month. Staying active helps us recommend your expertise to more students.
          </p>
          <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>Active weekly. Only you can see this.</p>
        </div>
        <div className="flex flex-col gap-[6px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <h3 className="flex items-center gap-[8px] text-[18px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)", color: accent }}>
            <CompanyMark name={pro.org} ink={accent} /> <span>on Dreamari</span>
          </h3>
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>{pro.org} professionals reached 14,000 students and answered 2,300 career questions this year.</p>
        </div>
      </Panel>

      {/* Recognition professionals can actually use: the Spotify-Wrapped style
         summary and who it is for. */}
      <Panel id="summary-title" title="2026 Dreamari Impact Summary" aside={<PrimaryCta onClick={() => dispatchAuroraPulse("cta")} className="min-h-[36px] px-[var(--space-4)] text-[14px]">Download</PrimaryCta>}>
        <div className="flex flex-col gap-[var(--space-3)]">
          <ul className="m-0 grid list-none grid-cols-2 gap-[var(--space-3)] p-0 sm:grid-cols-4">
            {[["842", "students reached"], ["63", "questions answered"], ["14", "volunteer hours contributed"], ["27", "schools impacted"]].map(([value, label]) => (
              <li key={label} className="flex flex-col gap-[2px]">
                <span className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
            <span className="flex items-center gap-[5px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <Users className="h-3.5 w-3.5" aria-hidden /> Share with
            </span>
            {["Your manager", "Employee resource groups", "Social impact teams", "LinkedIn"].map((who) => (
              <span key={who} className="rounded-[var(--radius-sm)] border px-[10px] py-[3px] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>{who}</span>
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}
