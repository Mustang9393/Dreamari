"use client";

import Image from "next/image";
import { useContext, useMemo, useState } from "react";
import { ArrowLeft, Award, Bookmark, CheckCircle2, ChevronRight, Clock, Download, Eye, MessagesSquare, PenLine, ThumbsUp, Undo2, UserPlus, Users } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { COMMUNITIES, INSIGHTS, PROS, THREADS } from "./data";
import { Avatar, CompanyChip, ConnectNav, PrimaryCta, QuietCta, formatCount } from "./primitives";
import { Panel, PanelRow, RULE, RoleLine, SignalRow, signals } from "./ProProfile";
import { AreaChart, MetricTile, Ring, Segmented, demoSeries } from "./viz";

// The professional volunteer's own Connect (DREAMARI CONNECT 2.pdf, section 1
// and 3; the CEO's Replit /volunteer/dashboard). Two jobs, two tabs:
//   My Profile: what students asked me (Ask Me Anything, routed), my posts,
//               my communities.
//   My Impact:  private analytics. Numbers with how they moved, one chart,
//               the activity status as encouragement, the shareable summary.
// Preview only: reached through the demo role switch, never from a student
// surface. Numbers are the brief's and the Replit's examples.

type Tab = "profile" | "impact";
type Range = "30d" | "month" | "90d";
type RoutedState = "open" | "answering" | "answered" | "skipped";

/** Routed this week: one real seeded thread from the volunteer's board plus
 *  two demo questions, so "Answer one?" has something behind it. */
const ROUTED: { id: string; handle: string; grade: string; where: string; ago: string; title: string; threadId?: string }[] = [
  { id: "r1", handle: "Diego", grade: "Sophomore", where: "NJ", ago: "2h", title: "Is accounting actually boring, or is that just a stereotype?", threadId: "t-fin-accounting" },
  { id: "r2", handle: "Priya", grade: "Junior", where: "TX", ago: "1d", title: "Is going to a state school a dealbreaker for investment banking?" },
  { id: "r3", handle: "Theo", grade: "Freshman", where: "CA", ago: "2d", title: "What should I major in if I want to work in finance?" },
];

const POST_PROMPTS = ["5 things I wish I knew before starting my career", "What people misunderstand about investment banking", "What I actually do during a normal workday", "What I would tell my 16-year-old self"];

const RANGE: Record<Range, { label: string; days: number; base: number; labels: [string, string, string] }> = {
  "30d": { label: "Last 30 days", days: 30, base: 26, labels: ["30 days ago", "15 days ago", "Today"] },
  month: { label: "This month", days: 3, base: 26, labels: ["Sep 1", "Sep 2", "Today"] },
  "90d": { label: "Last 90 days", days: 90, base: 22, labels: ["90 days ago", "45 days ago", "Today"] },
};

export function ProDashboardView({ onBack }: { onBack: () => void }) {
  const pro = PROS.find((p) => p.id === "pro-okafor") ?? PROS[0];
  const nav = useContext(ConnectNav);
  const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const [tab, setTab] = useState<Tab>("profile");
  const [routed, setRouted] = useState<Record<string, RoutedState>>({});
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [postDraft, setPostDraft] = useState("");
  const [localPosts, setLocalPosts] = useState<string[]>([]);
  const [range, setRange] = useState<Range>("30d");

  const board = COMMUNITIES.find((c) => c.world === pro.world);
  const boardName = board?.name ?? "the community";
  const answeredNow = Object.values(routed).filter((s) => s === "answered").length;
  const openCount = ROUTED.filter((q) => (routed[q.id] ?? "open") === "open" || routed[q.id] === "answering").length;
  const words = ["No", "One", "Two", "Three"][openCount] ?? String(openCount);
  const answeredThreads = THREADS.filter((t) => t.responses.some((r) => r.kind === "answer" && r.proId === pro.id));
  const posts = INSIGHTS.filter((i) => i.proId === pro.id);
  const myCommunities = COMMUNITIES.filter((c) => c.world === pro.world || c.id === "teaching-education");
  const series = useMemo(() => demoSeries(`${pro.id}-${range}`, RANGE[range].days, RANGE[range].base), [pro.id, range]);

  const metrics = [
    { icon: Eye, value: formatCount(4281), label: "Impressions", delta: 18 },
    { icon: Users, value: formatCount(786), label: "Students reached", delta: 24 },
    { icon: UserPlus, value: formatCount(63), label: "New followers", delta: 16 },
    { icon: Bookmark, value: formatCount(91), label: "Saves", delta: 9 },
    { icon: ThumbsUp, value: formatCount(1204), label: "Likes", delta: 11 },
    { icon: MessagesSquare, value: formatCount(37 + answeredNow), label: "Questions answered", delta: 7 },
  ];

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      {/* who this is, then the two jobs as tabs (the Replit's My Profile / My Impact) */}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[12px]">
          <Avatar name={pro.name} verified size={52} />
          <div className="min-w-0">
            <h1 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pro.name}</h1>
            <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}><RoleLine pro={pro} /></p>
          </div>
        </div>
        <Segmented<Tab> ariaLabel="Dashboard section" value={tab} onChange={setTab} options={[{ key: "profile", label: "My Profile" }, { key: "impact", label: "My Impact" }]} />
      </div>

      {tab === "profile" && (
        <>
          {/* Ask Me Anything: the primary engagement mechanism. A direct student
             question is a far stronger reason to respond than a blank page. */}
          <Panel
            id="ama-routed-title"
            title="Ask Me Anything"
            aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{64 + 0}</strong> asked · <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{58 + answeredNow}</strong> answered</span>}
          >
            <h3 className="text-[18px] leading-[24px] font-semibold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {openCount > 0 ? `${words} students asked about investment banking this week. Answer one?` : "All answered. We will route the next one."}
            </h3>
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {ROUTED.map((q) => {
                const state = routed[q.id] ?? "open";
                return (
                  <li key={q.id} className="flex flex-col gap-[10px] border-t py-[var(--space-4)] first:border-t-0" style={{ borderColor: RULE }}>
                    <div className="flex items-center justify-between gap-[var(--space-3)]">
                      <span className="flex min-w-0 items-center gap-[8px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        <Avatar name={q.handle} size={26} />
                        <span className="truncate"><strong className="font-bold" style={{ color: "var(--foreground)" }}>{q.handle}</strong> · {q.grade} · {q.ago}</span>
                      </span>
                      <span className="flex flex-none items-center gap-[4px] text-[11.5px] leading-[15px] font-bold" style={{ color: state === "answered" ? "var(--world-food-farming-nature)" : state === "skipped" ? "var(--muted-foreground)" : "var(--accent-subtle)" }}>
                        {state === "answered" ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <Clock className="h-3 w-3" aria-hidden />}
                        {state === "answered" ? "Answered" : state === "skipped" ? "Skipped" : "Awaiting"}
                      </span>
                    </div>
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
                          <PrimaryCta className={`min-h-[36px] px-[var(--space-4)] text-[13px] ${draft.trim() ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (!draft.trim()) return; dispatchAuroraPulse("cta"); setRouted((r) => ({ ...r, [q.id]: "answered" })); }}>Post answer</PrimaryCta>
                          <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => setRouted((r) => ({ ...r, [q.id]: "open" }))}>Cancel</QuietCta>
                        </div>
                      </div>
                    )}
                    {state === "answered" && (
                      <span className="flex flex-wrap items-center gap-[10px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        Live on {boardName}.
                        {q.threadId && <button type="button" onClick={() => nav?.openThread(q.threadId!)} className="dm-link cursor-pointer" style={{ color: "var(--foreground)" }}>View response</button>}
                      </span>
                    )}
                    {state === "skipped" && (
                      <button type="button" onClick={() => setRouted((r) => ({ ...r, [q.id]: "open" }))} className="dm-link flex w-fit cursor-pointer items-center gap-[5px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo
                      </button>
                    )}
                  </li>
                );
              })}
              {/* one already-answered question, with what it did */}
              {answeredThreads.slice(0, 1).map((t) => {
                const s = signals(t.views, t.helpful, undefined);
                return (
                  <li key={t.id} className="flex flex-col gap-[8px] border-t py-[var(--space-4)] last:pb-0" style={{ borderColor: RULE }}>
                    <div className="flex items-center justify-between gap-[var(--space-3)]">
                      <span className="flex min-w-0 items-center gap-[8px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        <Avatar name={t.handle} size={26} />
                        <strong className="font-bold" style={{ color: "var(--foreground)" }}>{t.handle}</strong> · {t.grade} · {t.postedAgo}
                      </span>
                      <span className="flex flex-none items-center gap-[4px] text-[11.5px] leading-[15px] font-bold" style={{ color: "var(--world-food-farming-nature)" }}><CheckCircle2 className="h-3 w-3" aria-hidden /> Answered</span>
                    </div>
                    <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{t.title}&rdquo;</span>
                    <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                      <SignalRow {...s} accent={accent} />
                      <button type="button" onClick={() => nav?.openThread(t.id)} className="dm-link flex cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--foreground)" }}>View response <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {/* Posts stay secondary (brief). Prompts remove the blank page. */}
          <Panel
            id="my-posts-title"
            title="My posts"
            aside={
              <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => { setComposing((c) => !c); setPostDraft(""); }}>
                <PenLine className="h-3.5 w-3.5" aria-hidden /> Create post
              </QuietCta>
            }
          >
            {composing && (
              <div className="flex flex-col gap-[10px] border-b pb-[var(--space-4)]" style={{ borderColor: RULE }}>
                <div className="flex flex-wrap gap-[6px]">
                  {POST_PROMPTS.map((p) => (
                    <button key={p} type="button" onClick={() => setPostDraft(p)} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] border px-[10px] py-[5px] text-left text-[13px] leading-[18px] font-semibold" style={{ borderColor: postDraft === p ? `color-mix(in srgb, ${accent} 60%, var(--glass-border))` : "var(--glass-border)", color: "var(--foreground)", background: postDraft === p ? `color-mix(in srgb, ${accent} 14%, transparent)` : "transparent" }}>{p}</button>
                  ))}
                </div>
                <label className="block">
                  <span className="sr-only">Post title</span>
                  <input value={postDraft} onChange={(event) => setPostDraft(event.target.value)} placeholder="Title of your post" className="w-full rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[15px] leading-[22px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
                </label>
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  <PrimaryCta className={`min-h-[36px] px-[var(--space-4)] text-[13px] ${postDraft.trim() ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (!postDraft.trim()) return; dispatchAuroraPulse("cta"); setLocalPosts((l) => [postDraft.trim(), ...l]); setComposing(false); }}>Publish</PrimaryCta>
                  <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => setComposing(false)}>Cancel</QuietCta>
                </div>
              </div>
            )}
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {localPosts.map((title) => (
                <li key={title} className="flex flex-col gap-[6px] border-t py-[var(--space-4)] first:border-t-0" style={{ borderColor: RULE }}>
                  <span className="text-[11px] leading-[15px] font-bold tracking-[0.06em] uppercase" style={{ color: accent }}>Pro tip · Just now</span>
                  <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
                </li>
              ))}
              {posts.map((post) => {
                const s = signals(post.views, post.helpful, post.saves);
                return (
                  <PanelRow key={post.id} onClick={() => nav?.openInsight(post.id)}>
                    <span className="text-[11px] leading-[15px] font-bold tracking-[0.06em] uppercase" style={{ color: accent }}>Pro tip · {post.postedAgo}</span>
                    <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{post.title}</span>
                    <SignalRow {...s} accent={accent} />
                  </PanelRow>
                );
              })}
            </ul>
          </Panel>

          <Panel id="my-communities-title" title="My communities">
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {myCommunities.map((c) => (
                <PanelRow key={c.id} onClick={() => nav?.openBoard(c.id)}>
                  <span className="flex w-full items-center gap-[12px]">
                    <span className="relative block size-[44px] flex-none overflow-hidden rounded-[var(--radius-sm)]">
                      <Image src={c.photo} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
                      <span className="block text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{formatCount(c.students)} students · {c.activePros} pros · {c.posts} posts</span>
                    </span>
                    <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                  </span>
                </PanelRow>
              ))}
            </ul>
          </Panel>
        </>
      )}

      {tab === "impact" && (
        <>
          {/* the private analytics, opened by what the numbers mean */}
          <Panel id="metrics-title" title="This month" >
            <dl className="grid grid-cols-2 gap-x-[var(--space-5)] gap-y-[var(--space-3)] sm:grid-cols-3">
              {metrics.map((m, i) => (
                <div key={m.label} className={`py-[var(--space-3)] ${i >= 2 ? "border-t sm:border-t-0" : ""} ${i >= 3 ? "sm:border-t" : ""}`} style={{ borderColor: RULE }}>
                  <MetricTile icon={m.icon} value={m.value} label={m.label} delta={m.delta} accent={accent} />
                </div>
              ))}
            </dl>
          </Panel>

          <Panel
            id="chart-title"
            title="Students reached"
            aside={<Segmented<Range> ariaLabel="Time range" value={range} onChange={setRange} options={(Object.keys(RANGE) as Range[]).map((k) => ({ key: k, label: RANGE[k].label }))} />}
          >
            <AreaChart points={series} accent={accent} labels={RANGE[range].labels} />
          </Panel>

          {/* activity status: private, encouraging, never a public badge (brief) */}
          <Panel id="status-title" title="Activity status">
            <div className="flex flex-wrap items-center gap-[var(--space-5)]">
              <Ring pct={100} accent="#f5c04e" size={84}>
                <Award className="h-7 w-7" aria-hidden style={{ color: "#f5c04e" }} />
              </Ring>
              <div className="min-w-0 flex-1">
                <h3 className="text-[18px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Gold volunteer</h3>
                <p className="mt-[4px] text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>You helped this week. No penalty for a break.</p>
              </div>
            </div>
          </Panel>

          {/* company-level impact, the employer's story */}
          <Panel id="company-title" title="Your company">
            <div className="flex flex-wrap items-center gap-[var(--space-4)]">
              <CompanyChip name={pro.org} tone="surface" size="lg" />
              <dl className="grid basis-full grid-cols-3 gap-[var(--space-3)] sm:flex-1 sm:basis-auto">
                {[["42", "pros"], ["14,000", "students"], ["2,300", "answers"]].map(([v, l]) => (
                  <div key={l} className="flex flex-col"><dd className="order-1 text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</dd><dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</dt></div>
                ))}
              </dl>
            </div>
          </Panel>

          {/* recognition a professional can actually use: a card to post, like Wrapped */}
          <Panel
            id="summary-title"
            title="2026 Impact Summary"
            aside={<PrimaryCta onClick={() => dispatchAuroraPulse("cta")} className="min-h-[36px] px-[var(--space-4)] text-[14px]"><span className="flex items-center gap-[6px]" style={{ color: "#FFFFFF" }}><Download className="h-4 w-4" aria-hidden /> Download</span></PrimaryCta>}
          >
            <ImpactCard pro={pro} accent={accent} />
          </Panel>
        </>
      )}
    </>
  );
}

/** The Wrapped-style card: one gradient in the person's world accent, one
 *  hero number, three supporting ones, who it is about. Sized to post. */
function ImpactCard({ pro, accent }: { pro: (typeof PROS)[number]; accent: string }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-6)]"
      style={{ background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${accent} 55%, transparent), transparent 60%), linear-gradient(160deg, color-mix(in srgb, ${accent} 42%, #0e0c20) 0%, #0e0c20 100%)`, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.8)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}
    >
      <span aria-hidden className="absolute top-[-60px] right-[-40px] size-[220px] rounded-full opacity-40 blur-[50px]" style={{ background: accent }} />
      <div className="relative flex items-start justify-between gap-[var(--space-3)]">
        <span className="text-[11px] leading-[15px] font-bold tracking-[0.1em] uppercase" style={{ color: "rgba(255,255,255,0.8)" }}>2026 · Dreamari Impact Summary</span>
        <CompanyChip name={pro.org} tone="photo" size="sm" />
      </div>
      <div className="relative mt-[var(--space-6)] flex flex-col">
        <span className="text-[64px] leading-[64px] font-extrabold tracking-[-0.02em] tabular-nums">842</span>
        <span className="text-[18px] leading-[24px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>students reached</span>
      </div>
      <dl className="relative mt-[var(--space-5)] grid grid-cols-3 gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: "rgba(255,255,255,0.22)" }}>
        {[["63", "questions answered"], ["14", "volunteer hours"], ["27", "schools"]].map(([value, label]) => (
          <div key={label} className="flex flex-col">
            <dd className="order-1 text-[24px] leading-[28px] font-extrabold tabular-nums">{value}</dd>
            <dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)" }}>{label}</dt>
          </div>
        ))}
      </dl>
      <div className="relative mt-[var(--space-5)] flex items-center gap-[10px]" style={{ fontFamily: "var(--font-body)" }}>
        <Avatar name={pro.name} verified size={36} />
        <span className="min-w-0">
          <span className="block truncate text-[14px] leading-[18px] font-bold">{pro.name}</span>
          <span className="block truncate text-[12px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>{pro.role}</span>
        </span>
      </div>
    </div>
  );
}
