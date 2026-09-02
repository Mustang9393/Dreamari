"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Eye, MessagesSquare, ShieldCheck, ThumbsUp, TrendingUp, Users } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { DECK } from "@/components/match-lab/data";
import { readPicks } from "@/lib/picks";
import { COMMUNITIES, EVENT_THREADS, INSIGHTS, PROS, THREADS, type Insight, type Pro, type Thread } from "./data";
import { Avatar, Card, ConnectNav, InlineAsk, LocalQuestionCard, PrimaryCta, QuietCta, SectionHead, formatCount } from "./primitives";

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
// Copy discipline: headings and stat labels are the doc's own words ("Ask Me
// Anything", "Students Reached", "Followers", "Total Likes", "Career posts and
// advice", "People to Follow", "Views · Likes · Saves"). Hierarchy is strictly
// top-down within every block: heading > subheading > body.

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

function answersBy(proId: string): Thread[] {
  return [...THREADS, ...EVENT_THREADS].filter((t) => t.responses.some((r) => r.kind === "answer" && r.proId === proId));
}

function postsBy(proId: string): Insight[] {
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

// ——— follow ———

export type Follows = Record<string, boolean>;

/** The one Follow control, in both of its states. Same label family
 *  everywhere (Follow -> Following), a check when done, the tick as it flips.
 *  aria-pressed drives the shared data-connect lift rule. */
export function FollowButton({ following, onToggle, accent, compact = false }: { following: boolean; onToggle: () => void; accent?: string; compact?: boolean }) {
  const press = () => {
    dispatchAuroraPulse(following ? "select" : "cta");
    onToggle();
  };
  if (following) {
    return (
      <QuietCta onClick={press} done className={compact ? "min-h-[36px] px-[var(--space-4)] text-[12.5px]" : ""}>
        Following
      </QuietCta>
    );
  }
  return (
    <PrimaryCta onClick={press} className={compact ? "min-h-[36px] px-[var(--space-4)] text-[12.5px]" : ""}>
      <span className="flex items-center gap-[6px]" style={accent ? { color: "#FFFFFF" } : undefined}>
        Follow <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
      </span>
    </PrimaryCta>
  );
}

// ——— People to Follow rail (Community tab) ———

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
            Based on your Top 3
          </span>
        )}
      </div>
      <div className="-mx-5 flex snap-x gap-[var(--space-3)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]">
        {ranked.map((pro) => {
          const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
          return (
            <div
              key={pro.id}
              className="dm-tap relative flex w-[236px] flex-none snap-start flex-col gap-[var(--space-3)] rounded-[var(--radius-xl)] border p-[var(--space-4)]"
              style={{ background: `color-mix(in srgb, ${accent} 8%, var(--card))`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}
            >
              <button type="button" onClick={() => nav?.openPro(pro.id)} className="absolute inset-0 z-0 cursor-pointer rounded-[inherit]">
                <span className="sr-only">Open {pro.name}&apos;s profile</span>
              </button>
              <div className="relative z-[1] flex items-center gap-[10px]">
                <Avatar name={pro.name} verified size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</span>
                  <span className="block truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{pro.role} · {pro.org}</span>
                </span>
              </div>
              <span className="relative z-[1] w-fit rounded-full border px-[9px] py-[2px] text-[12px] leading-[16px] font-bold" style={{ borderColor: `color-mix(in srgb, ${accent} 45%, var(--glass-border))`, color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
                {pro.field}
              </span>
              <div className="relative z-[1] mt-auto flex items-center justify-between gap-[var(--space-3)]">
                <span className="text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                  <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{formatCount(pro.followers)}</strong> Followers
                </span>
                <FollowButton compact following={!!follows[pro.id]} onToggle={() => onFollow(pro.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ——— the profile ———

export function ProProfileView({
  pro,
  follows,
  onFollow,
  onBack,
}: {
  pro: Pro;
  follows: Follows;
  onFollow: (id: string) => void;
  onBack: () => void;
}) {
  const nav = useContext(ConnectNav);
  const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const answers = answersBy(pro.id);
  const posts = postsBy(pro.id);
  const [asked, setAsked] = useState<{ id: string; title: string }[]>([]);
  const following = !!follows[pro.id];
  const communityName = (boardId: string) => COMMUNITIES.find((c) => c.id === boardId)?.name ?? "Community";

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      {/* Identity: name is the page's heading; role, company and field sit
         under it; the verification line is the smallest. */}
      <section aria-label="Profile" className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-2xl)] border p-[var(--space-6)]" style={{ background: `color-mix(in srgb, ${accent} 9%, var(--card))`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}>
        <div className="flex flex-wrap items-start gap-[var(--space-4)]">
          <Avatar name={pro.name} verified size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-[31px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</h1>
          </div>
          <div className="flex-none">
            <FollowButton following={following} onToggle={() => onFollow(pro.id)} />
          </div>
        </div>

        {/* Top-down, strictly: name (26) > the doc's three numbers (22) > role
           and story (15) > field and verification (12). */}
        <dl className="grid grid-cols-3 gap-[var(--space-3)]">
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

        <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${accent} 25%, var(--glass-border))` }}>
          <p className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{pro.role} · {pro.org}</p>
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{pro.story}</p>
          <div className="flex flex-wrap items-center gap-[8px] pt-[2px]">
            <span className="rounded-full border px-[10px] py-[3px] text-[12px] leading-[16px] font-bold" style={{ borderColor: `color-mix(in srgb, ${accent} 45%, var(--glass-border))`, color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
              {pro.field}
            </span>
            <span className="flex items-center gap-[5px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <ShieldCheck className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--accent-subtle)" }} /> {pro.verifiedBy}
            </span>
          </div>
        </div>
      </section>

      {/* Ask Me Anything is the primary engagement mechanism (doc). Same
         composer as the boards; the question routes to this person and its
         answer lands publicly on the board. */}
      <section aria-labelledby="ama-title" className="flex flex-col gap-[var(--space-3)]">
        <div>
          <SectionHead id="ama-title">Ask Me Anything</SectionHead>
          <p className="mt-[4px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
            Answers remain public so one response can help hundreds or thousands of students.
          </p>
        </div>
        <InlineAsk
          joined
          accent={accent}
          placeholder={`Ask ${firstName(pro.name)} anything…`}
          onPost={(text) => setAsked((current) => [{ id: `${pro.id}-ama-${current.length}`, title: text }, ...current])}
        />
        {asked.map((q) => <LocalQuestionCard key={q.id} title={q.title} />)}
      </section>

      {answers.length > 0 && (
        <section aria-labelledby="answers-title" className="flex flex-col gap-[var(--space-3)]">
          <SectionHead id="answers-title">Answers</SectionHead>
          {answers.map((thread) => {
            const s = signals(thread.views, thread.helpful, undefined);
            return (
              <Card key={thread.id} accent={accent} className="dm-tap relative cursor-pointer">
                <button type="button" onClick={() => nav?.openThread(thread.id)} className="absolute inset-0 z-0 cursor-pointer rounded-[inherit]">
                  <span className="sr-only">Open question: {thread.title}</span>
                </button>
                <div className="relative z-[1] flex flex-col gap-[8px]">
                  <h3 className="text-[16px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>&ldquo;{thread.title}&rdquo;</h3>
                  <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    <MessagesSquare className="h-3 w-3" aria-hidden /> {communityName(thread.boardId)}
                  </span>
                  <SignalRow {...s} accent={accent} />
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {posts.length > 0 && (
        <section aria-labelledby="posts-title" className="flex flex-col gap-[var(--space-3)]">
          <SectionHead id="posts-title">Career posts and advice</SectionHead>
          {posts.map((insight) => {
            const s = signals(insight.views, insight.helpful, insight.saves);
            return (
              <Card key={insight.id} accent={accent} className="dm-tap relative cursor-pointer">
                <button type="button" onClick={() => nav?.openInsight(insight.id)} className="absolute inset-0 z-0 cursor-pointer rounded-[inherit]">
                  <span className="sr-only">Open insight: {insight.title}</span>
                </button>
                <div className="relative z-[1] flex flex-col gap-[8px]">
                  <h3 className="text-[16px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{insight.title}</h3>
                  <p className="line-clamp-2 text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{insight.body}</p>
                  <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    <MessagesSquare className="h-3 w-3" aria-hidden /> {communityName(insight.boardId)} · {insight.postedAgo}
                  </span>
                  <SignalRow {...s} accent={accent} />
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </>
  );
}

// ——— professional side, one screen, preview only ———

/** Not reachable from any student surface: it exists so the flywheel the doc
 *  describes (route a question -> answer in minutes -> see the impact) can be
 *  demoed end to end. Numbers and copy are the doc's own examples. */
export function ProDashboardView({ onBack }: { onBack: () => void }) {
  const pro = PROS.find((p) => p.id === "pro-okafor") ?? PROS[0];
  const [prompt, setPrompt] = useState<"open" | "answered" | "skipped">("open");
  const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const impact = [
    { value: "4,281", label: "Impressions" },
    { value: "786", label: "Students Reached" },
    { value: "142", label: "Profile Views" },
    { value: "91", label: "Saves" },
    { value: "63", label: "New Followers" },
    { value: "37", label: "Questions Answered" },
  ];
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex items-center gap-[12px]">
          <Avatar name={pro.name} verified size={44} />
          <div>
            <h1 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</h1>
            <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{pro.role} · {pro.org}</p>
          </div>
        </div>
        <span className="rounded-full border px-[10px] py-[3px] text-[11px] leading-[15px] font-bold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Professional view · preview
        </span>
      </div>

      {/* Ask Me Anything routing: a direct student question is a far stronger
         reason to respond than a blank page. Answer · Skip, never an
         obligation. */}
      <section aria-labelledby="route-title" className="flex flex-col gap-[var(--space-3)]">
      <SectionHead id="route-title">Ask Me Anything</SectionHead>
      <Card accent={accent}>
        <div className="flex flex-col gap-[var(--space-3)]">
          <h2 className="text-[19px] leading-[25px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Three students asked questions about investment banking this week. Answer one?
          </h2>
          {prompt === "open" ? (
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <PrimaryCta onClick={() => { dispatchAuroraPulse("cta"); setPrompt("answered"); }}>Answer</PrimaryCta>
              <QuietCta onClick={() => { dispatchAuroraPulse("select"); setPrompt("skipped"); }}>Skip</QuietCta>
            </div>
          ) : (
            <p className="flex items-center gap-[6px] text-[13.5px] leading-[19px] font-semibold" style={{ color: prompt === "answered" ? "var(--world-food-farming-nature)" : "var(--muted-foreground)" }}>
              <CheckCircle2 className="h-4 w-4" aria-hidden /> {prompt === "answered" ? "Answering should take only a few minutes and never feel like an obligation." : "Skipped. Nothing changes; we will route the next relevant question."}
            </p>
          )}
        </div>
      </Card>
      </section>

      {/* Private Impact Dashboard: the doc's example numbers. Private,
         motivational, never a public badge. */}
      <section aria-labelledby="impact-title" className="flex flex-col gap-[var(--space-3)]">
        <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
          <SectionHead id="impact-title">Private Impact Dashboard</SectionHead>
          <span className="flex items-center gap-[5px] text-[13px] leading-[18px] font-extrabold tabular-nums" style={{ color: "var(--world-food-farming-nature)" }}>
            <TrendingUp className="h-4 w-4" aria-hidden /> +28% Reach vs. Last Month
          </span>
        </div>
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3">
          {impact.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-[2px] rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
              <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{stat.value}</span>
              <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{stat.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
          Your answers reached 18% more students this month. Staying active helps us recommend your expertise to more students.
        </p>
      </section>

      {/* Recognition professionals can actually use: the Spotify-Wrapped style
         summary and who it is for. */}
      <Card>
        <div className="flex flex-col gap-[var(--space-3)]">
          <SectionHead>2026 Dreamari Impact Summary</SectionHead>
          <ul className="m-0 grid list-none grid-cols-2 gap-[var(--space-3)] p-0 sm:grid-cols-4">
            {[["842", "students reached"], ["63", "questions answered"], ["14", "volunteer hours contributed"], ["27", "schools impacted"]].map(([value, label]) => (
              <li key={label} className="flex flex-col gap-[2px]">
                <span className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="flex items-center gap-[5px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <Users className="h-3.5 w-3.5" aria-hidden /> Share with
            </span>
            {["Their manager", "Employee resource groups", "Corporate social impact teams", "Internal volunteer programs", "LinkedIn"].map((who) => (
              <span key={who} className="rounded-full border px-[10px] py-[3px] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>{who}</span>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
