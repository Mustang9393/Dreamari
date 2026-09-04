"use client";

import Image from "next/image";
import { useContext, useMemo, useState } from "react";
import { ArrowLeft, Award, Bookmark, CheckCircle2, ChevronRight, Clock, Download, Eye, MessagesSquare, PenLine, ThumbsUp, Undo2, UserPlus, Users } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { COMMUNITIES, INSIGHTS, PROS, THREADS, type Pro } from "./data";
import { Avatar, COMPANY_BRAND, CompanyChip, CompanyMark, ConnectNav, PrimaryCta, QuietCta, formatCount, volunteerTier } from "./primitives";
import { Panel, PanelRow, RULE, RoleLine, SignalRow, signals } from "./ProProfile";
import { AreaChart, MetricTile, Ring, Segmented, demoSeries, ruledCell } from "./viz";

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

/** Routed this week, by the volunteer's world: three demo questions each, so
 *  "Answer one?" has something behind it for every volunteer. */
type Routed = { id: string; handle: string; grade: string; ago: string; title: string; threadId?: string };
const ROUTED_BY_WORLD: Record<string, Routed[]> = {
  "Business & Money": [
    { id: "r1", handle: "Diego", grade: "Sophomore", ago: "2h", title: "Is accounting actually boring, or is that just a stereotype?", threadId: "t-fin-accounting" },
    { id: "r2", handle: "Priya", grade: "Junior", ago: "1d", title: "Is going to a state school a dealbreaker for finance jobs?" },
    { id: "r3", handle: "Theo", grade: "Freshman", ago: "2d", title: "What should I major in if I want to work in finance?" },
  ],
  "Tech & Engineering": [
    { id: "r1", handle: "Ethan", grade: "Junior", ago: "3h", title: "Do I need a CS degree to work in tech?", threadId: "t-cs-degree" },
    { id: "r2", handle: "Zoe", grade: "Sophomore", ago: "1d", title: "What should my first coding project be?" },
    { id: "r3", handle: "Sam", grade: "Senior", ago: "2d", title: "Is it too late to start coding in 12th grade?" },
  ],
  "Health & Medicine": [
    { id: "r1", handle: "Zoe", grade: "Sophomore", ago: "5h", title: "How do I shadow a nurse while still in high school?", threadId: "t-nurse-shadow" },
    { id: "r2", handle: "Sana", grade: "Junior", ago: "1d", title: "Is nursing school harder than regular college?" },
    { id: "r3", handle: "Noah", grade: "Freshman", ago: "2d", title: "Can I work in healthcare if I hate blood?" },
  ],
  "Arts, Media & Sport": [
    { id: "r1", handle: "Ruby", grade: "Junior", ago: "4h", title: "Do I need to go to art school to become a designer?", threadId: "t-creative-art-school" },
    { id: "r2", handle: "Theo", grade: "Sophomore", ago: "1d", title: "How do I make a portfolio with no clients?" },
    { id: "r3", handle: "Lena", grade: "Senior", ago: "3d", title: "Is it realistic to make money making videos?" },
  ],
  "Teaching & Education": [
    { id: "r1", handle: "Lena", grade: "Junior", ago: "2h", title: "How do I write a resume with no work experience?", threadId: "t-gpd-resume" },
    { id: "r2", handle: "Marcus", grade: "Freshman", ago: "1d", title: "What do I say when they ask about my weaknesses?" },
    { id: "r3", handle: "Ava", grade: "Sophomore", ago: "2d", title: "Should I email a recruiter after a career fair?" },
  ],
};

const POST_PROMPTS = (field: string) => ["5 things I wish I knew before starting my career", `What people misunderstand about ${field.toLowerCase()}`, "What I actually do during a normal workday", "What I would tell my 16-year-old self"];

const RANGE: Record<Range, { label: string; days: number; base: number; labels: [string, string, string] }> = {
  "30d": { label: "Last 30 days", days: 30, base: 26, labels: ["30 days ago", "15 days ago", "Today"] },
  month: { label: "This month", days: 3, base: 26, labels: ["Sep 1", "Sep 2", "Today"] },
  "90d": { label: "Last 90 days", days: 90, base: 22, labels: ["90 days ago", "45 days ago", "Today"] },
};

export function ProDashboardView({ pro: given, onBack }: { pro?: Pro; onBack: () => void }) {
  const pro = given ?? PROS.find((p) => p.id === "pro-okafor") ?? PROS[0];
  const ROUTED = ROUTED_BY_WORLD[pro.world] ?? ROUTED_BY_WORLD["Teaching & Education"];
  const nav = useContext(ConnectNav);
  const accent = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const [tab, setTab] = useState<Tab>("profile");
  const [routed, setRouted] = useState<Record<string, RoutedState>>({});
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [postDraft, setPostDraft] = useState("");
  const [postBody, setPostBody] = useState("");
  const [disclose, setDisclose] = useState(true);
  const [localPosts, setLocalPosts] = useState<{ title: string; body: string }[]>([]);
  const [range, setRange] = useState<Range>("30d");

  const board = COMMUNITIES.find((c) => c.world === pro.world);
  const boardName = board?.name ?? "the community";
  const answeredNow = Object.values(routed).filter((s) => s === "answered").length;
  const openCount = ROUTED.filter((q) => (routed[q.id] ?? "open") === "open" || routed[q.id] === "answering").length;
  const words = ["No", "One", "Two", "Three"][openCount] ?? String(openCount);
  const answeredThreads = THREADS.filter((t) => t.responses.some((r) => r.kind === "answer" && r.proId === pro.id));
  // "87 answered" needs somewhere to go (direct feedback): View all opens a
  // full screen of answered questions, its own page, since this list will
  // run to hundreds. One recent answer stays on the dashboard as a preview.
  const [showAnswered, setShowAnswered] = useState(false);
  const posts = INSIGHTS.filter((i) => i.proId === pro.id);
  const myCommunities = COMMUNITIES.filter((c) => c.world === pro.world || c.id === "teaching-education");
  const series = useMemo(() => demoSeries(`${pro.id}-${range}`, RANGE[range].days, RANGE[range].base), [pro.id, range]);

  // the month's numbers, scaled from this volunteer's totals (demo)
  const m = {
    impressions: Math.round(pro.studentsReached * 0.34),
    reached: Math.round(pro.studentsReached * 0.062),
    followers: Math.round(pro.followers * 0.05),
    saves: Math.round(pro.totalLikes * 0.019),
    likes: Math.round(pro.totalLikes * 0.18),
    year: Math.round(pro.studentsReached * 0.067),
    hours: Math.max(3, Math.round(pro.questionsAnswered * 0.22)),
    schools: Math.max(4, Math.round(pro.studentsReached / 520)),
    asked: pro.questionsAnswered + 6,
  };
  const metrics = [
    { icon: Eye, value: formatCount(m.impressions), label: "Impressions", delta: 18 },
    { icon: Users, value: formatCount(m.reached), label: "Students reached", delta: 24 },
    { icon: UserPlus, value: formatCount(m.followers), label: "New followers", delta: 16 },
    { icon: Bookmark, value: formatCount(m.saves), label: "Saves", delta: 9 },
    { icon: ThumbsUp, value: formatCount(m.likes), label: "Likes", delta: 11 },
    { icon: MessagesSquare, value: formatCount(pro.questionsAnswered + answeredNow), label: "Questions answered", delta: 7 },
  ];
  const company = { pros: 8 + (pro.org.length * 7) % 40, get students() { return this.pros * 330; }, get answers() { return this.pros * 55; } };

  if (showAnswered) {
    const total = pro.questionsAnswered + answeredNow;
    return (
      <>
        <button type="button" onClick={() => setShowAnswered(false)} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> My profile
        </button>
        <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
          <h1 className="text-[26px] leading-[31px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Questions you answered</h1>
          <span className="text-[14px] leading-[19px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{total} answered</span>
        </div>
        <Panel id="answered-all-title" title="Newest first">
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {answeredThreads.map((t) => {
              const s = signals(t.views, t.helpful, undefined);
              return (
                <li key={t.id} className="flex flex-col gap-[8px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
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
          {total > answeredThreads.length && (
            <p className="border-t pt-[var(--space-4)] text-[13px] leading-[18px]" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
              {`${answeredThreads.length} of the ${total} are in`} this prototype&apos;s data. The real feed pages through all of them.
            </p>
          )}
        </Panel>
      </>
    );
  }

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
            <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link mt-[4px] flex cursor-pointer items-center gap-[4px] text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--accent-subtle)" }}>See my profile as students do <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>
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
            aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{m.asked}</strong> asked · <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{pro.questionsAnswered + answeredNow}</strong> answered</span>}
          >
            <h3 className="text-[18px] leading-[24px] font-semibold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {openCount > 0 ? `${words} students asked about ${pro.field.toLowerCase()} this week. Answer one?` : "All answered. We will route the next one."}
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
                        {state === "answered" ? "Answered" : state === "skipped" ? "Skipped" : "Waiting"}
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
                        <label className="flex w-fit cursor-pointer items-center gap-[8px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                          <input type="checkbox" checked={disclose} onChange={(event) => setDisclose(event.target.checked)} className="size-4 accent-[var(--primary)]" /> Add &ldquo;Based on my own experience&rdquo;
                        </label>
                        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                          <PrimaryCta className={`min-h-[36px] px-[var(--space-4)] text-[13px] ${draft.trim().length >= 40 ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (draft.trim().length < 40) return; dispatchAuroraPulse("cta"); setRouted((r) => ({ ...r, [q.id]: "answered" })); }}>Post answer</PrimaryCta>
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
              {/* one already-answered question, with what it did; View all opens the rest */}
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
              <li className="flex items-center justify-between gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
                <button type="button" onClick={() => setShowAnswered(true)} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                  View all {pro.questionsAnswered + answeredNow} answered <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
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
                  {POST_PROMPTS(pro.field).map((p) => (
                    <button key={p} type="button" onClick={() => setPostDraft(p)} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] border px-[10px] py-[5px] text-left text-[13px] leading-[18px] font-semibold" style={{ borderColor: postDraft === p ? `color-mix(in srgb, ${accent} 60%, var(--glass-border))` : "var(--glass-border)", color: "var(--foreground)", background: postDraft === p ? `color-mix(in srgb, ${accent} 14%, transparent)` : "transparent" }}>{p}</button>
                  ))}
                </div>
                <label className="block">
                  <span className="sr-only">Post title</span>
                  <input value={postDraft} onChange={(event) => setPostDraft(event.target.value)} maxLength={90} placeholder="Title" className="w-full rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[15px] leading-[22px] font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
                </label>
                <label className="block">
                  <span className="sr-only">Post body</span>
                  <textarea value={postBody} onChange={(event) => setPostBody(event.target.value)} rows={4} maxLength={600} placeholder="Three to five sentences. Plain words, one idea each." className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[15px] leading-[22px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
                </label>
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <PrimaryCta className={`min-h-[36px] px-[var(--space-4)] text-[13px] ${postDraft.trim() && postBody.trim().length >= 40 ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (!postDraft.trim() || postBody.trim().length < 40) return; dispatchAuroraPulse("cta"); setLocalPosts((l) => [{ title: postDraft.trim(), body: postBody.trim() }, ...l]); setComposing(false); setPostBody(""); }}>Publish</PrimaryCta>
                  <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => setComposing(false)}>Cancel</QuietCta>
                  {postBody.length > 500 && <span className="text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{600 - postBody.length} left</span>}
                </div>
              </div>
            )}
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {localPosts.map((post) => (
                <li key={post.title} className="flex flex-col gap-[6px] border-t py-[var(--space-4)] first:border-t-0" style={{ borderColor: RULE }}>
                  <span className="text-[11px] leading-[15px] font-bold tracking-[0.06em] uppercase" style={{ color: accent }}>Pro tip · Just now</span>
                  <span className="text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{post.title}</span>
                  <span className="line-clamp-2 text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{post.body}</span>
                  <button type="button" onClick={() => setLocalPosts((l) => l.filter((x) => x.title !== post.title))} className="dm-link w-fit cursor-pointer text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Delete</button>
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
            <dl className="-mx-[var(--space-2)] grid grid-cols-2 sm:grid-cols-3">
              {metrics.map((m, i) => (
                <div key={m.label} className={ruledCell(i, 3)} style={{ borderColor: RULE }}>
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
            {(() => {
              const tier = volunteerTier(pro);
              const color = tier?.color ?? "var(--muted-foreground)";
              return (
                <div className="flex flex-wrap items-center gap-[var(--space-5)]">
                  <Ring pct={tier ? (tier.name === "Diamond" ? 100 : tier.name === "Gold" ? 70 : 40) : 10} accent={color} size={84}>
                    <Award className="h-7 w-7" aria-hidden style={{ color }} />
                  </Ring>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[18px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{tier ? `${tier.name} volunteer` : "Taking a break"}</h3>
                    <p className="mt-[4px] text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>{tier ? `${tier.note}. No penalty for a break.` : "One answer brings you back to Silver. No penalty for a break."}</p>
                  </div>
                </div>
              );
            })()}
          </Panel>

          {/* company-level impact, in the company's own colours: the one place
             the employer is the subject rather than a tag */}
          {(() => {
            const brand = COMPANY_BRAND[pro.org] ?? { bg: "#1c1a2e", ink: "#FFFFFF" };
            return (
              <section aria-label={`${pro.org} on Dreamari`} className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={{ background: `linear-gradient(135deg, ${brand.bg} 0%, color-mix(in srgb, ${brand.bg} 78%, #000000) 100%)`, borderColor: `color-mix(in srgb, ${brand.ink} 22%, transparent)`, color: brand.ink, boxShadow: "0 18px 40px -28px rgba(0,0,0,0.6)" }}>
                <span aria-hidden className="absolute top-[-70px] right-[-50px] size-[240px] rounded-full opacity-25 blur-[60px]" style={{ background: brand.ink }} />
                <div className="relative flex flex-wrap items-center justify-between gap-[var(--space-4)]">
                  <CompanyMark name={pro.org} ink={brand.ink} height={26} />
                  <span className="text-[13px] leading-[18px] font-semibold" style={{ color: `color-mix(in srgb, ${brand.ink} 78%, transparent)` }}>on Dreamari · 2026</span>
                </div>
                <dl className="relative mt-[var(--space-5)] grid grid-cols-3 gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${brand.ink} 22%, transparent)` }}>
                  {[[formatCount(company.pros), "pros"], [formatCount(company.students), "students"], [formatCount(company.answers), "answers"]].map(([v, l]) => (
                    <div key={l} className="flex flex-col"><dd className="order-1 text-[24px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{v}</dd><dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: `color-mix(in srgb, ${brand.ink} 78%, transparent)` }}>{l}</dt></div>
                  ))}
                </dl>
              </section>
            );
          })()}

          {/* recognition a professional can actually use: the card itself is the
             section, nothing wrapped around it */}
          <ImpactCard pro={pro} accent={accent} numbers={m} />
        </>
      )}
    </>
  );
}

/** The Wrapped-style card: one gradient in the person's world accent, one
 *  hero number, three supporting ones, who it is about. Sized to post. */
function ImpactCard({ pro, accent, numbers }: { pro: Pro; accent: string; numbers: { year: number; hours: number; schools: number } }) {
  return (
    <section
      aria-label="My 2026 Impact Summary"
      className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]"
      style={{ background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${accent} 55%, transparent), transparent 60%), linear-gradient(160deg, color-mix(in srgb, ${accent} 42%, #0e0c20) 0%, #0e0c20 100%)`, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.8)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}
    >
      <span aria-hidden className="absolute top-[-60px] right-[-40px] size-[220px] rounded-full opacity-40 blur-[50px]" style={{ background: accent }} />
      <div className="relative flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 className="text-[22px] leading-[27px] font-extrabold">My 2026 Impact Summary</h2>
        <PrimaryCta onClick={() => dispatchAuroraPulse("cta")} className="min-h-[36px] px-[var(--space-4)] text-[14px]" style={{ background: "rgba(255,255,255,0.92)", color: "#0e0c20" }}><span className="flex items-center gap-[6px]"><Download className="h-4 w-4" aria-hidden /> Download</span></PrimaryCta>
      </div>
      <div className="relative mt-[var(--space-6)] flex flex-col">
        <span className="font-extrabold tracking-[-0.02em] tabular-nums" style={{ fontSize: 64, lineHeight: "64px" }}>{formatCount(numbers.year)}</span>
        <span className="text-[18px] leading-[24px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>students reached</span>
      </div>
      <dl className="relative mt-[var(--space-5)] grid grid-cols-3 gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: "rgba(255,255,255,0.22)" }}>
        {[[String(pro.questionsAnswered), "questions answered"], [String(numbers.hours), "volunteer hours"], [String(numbers.schools), "schools"]].map(([value, label]) => (
          <div key={label} className="flex flex-col">
            <dd className="order-1 text-[24px] leading-[28px] font-extrabold tabular-nums">{value}</dd>
            <dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)" }}>{label}</dt>
          </div>
        ))}
      </dl>
      <div className="relative mt-[var(--space-5)] flex items-center justify-between gap-[var(--space-3)]" style={{ fontFamily: "var(--font-body)" }}>
        <span className="flex min-w-0 items-center gap-[10px]">
          <Avatar name={pro.name} verified size={36} />
          <span className="min-w-0">
            <span className="block truncate text-[14px] leading-[18px] font-bold">{pro.name}</span>
            <span className="block truncate text-[12px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>{pro.role}</span>
          </span>
        </span>
        <CompanyChip name={pro.org} tone="photo" size="sm" />
      </div>
    </section>
  );
}
