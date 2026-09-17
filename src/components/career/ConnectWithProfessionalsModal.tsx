"use client";

// The Career Detail page's own Connect entry point -- ported from the
// second Replit reference (dceeai.replit.app/explore-careers: Start
// Exploring -> view a career -> tap "Connect" next to "Watch Corporate
// Office Tour" -> "CONNECT WITH [WORLD] PROFESSIONALS", three rows: Ask
// the community / See what professionals have shared / Find professionals
// to follow). Same visual treatment and XP mechanics as Play's own
// between-levels interstitial (ConnectInterstitial.tsx) -- reuses that
// component's own CSS module directly rather than re-authoring the same
// dialog/toolbar/hero chrome a second time -- but a different set of three
// actions (Ask / Answers / People instead of Like / Comment / Ask), and no
// "next level" to advance into: the terminal screen just closes back to
// the career page.
//
// Content is always real: Ask reuses the exact same board-card + composer
// + similar-question matcher as Play's Ask tab; Answers is a horizontal
// carousel of the board's own real Insights, each with inline like/comment
// (board-style, not a single flashy CTA) and a "see more on the community
// board" link out; People is a compact carousel of real professionals with
// a Follow action each, not a full post per person.

import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, BadgeCheck, Check, ChevronLeft, ChevronRight, HelpCircle, MessageCircle, RotateCcw, Sparkles, ThumbsUp, UserPlus, Users, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import { WORLD_COLORS } from "@/components/app/worlds";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardBottomScrim } from "@/components/app/cardChrome";
import { awardDreamScore } from "@/lib/dreamScore";
import { playMilestoneChime, playXpRise } from "@/components/build/sound";
import { LocalBurst } from "@/components/build/ui";
import { SparkBar } from "@/components/flow/SparkBar";
import { Avatar, CompanyChip, InlineAsk } from "@/components/connect/primitives";
import { PHOTO_COVER, PHOTO_FOCUS } from "@/components/connect/CommunityCard";
import { COMMUNITIES, INSIGHTS, PROS, THREADS, type Pro, type Thread } from "@/components/connect/data";
import styles from "../play/ConnectInterstitial.module.css";

// Row titles and one-line descriptions are the reference's own copy,
// verbatim (dceeai.replit.app/explore-careers, "Connect with [World]
// Professionals").
const STEPS = [
  { id: "ask", title: "Ask", body: "Ask the community", Icon: HelpCircle },
  { id: "answers", title: "Answers", body: "See what professionals have shared", Icon: MessageCircle },
  { id: "people", title: "People", body: "Find professionals to follow", Icon: Users },
] as const;
type Step = typeof STEPS[number]["id"];
type View = "intro" | "posts" | "connected" | "profile";
type Flight = { id: number; amount: number; colorIndex: number; x: number; y: number; toX: number; toY: number };
// XP reflects the effort of the action, not the order it was done in --
// feedback from Joshua: asking a real question is more effort than a
// like, so it should be worth more regardless of when it happens. Ask
// matches Play's own Ask; liking/following are the lighter actions, and
// leaving a real comment on an answer sits between the two.
const ACTION_XP: Record<Step, number> = { ask: 20, answers: 5, people: 5 };
const ANSWER_COMMENT_XP = 10;
const BONUS_XP = 15;
const CHAIN_COLOR = ["#33c78c", "#facc15", "#c084fc"];

const STOP_WORDS = new Set("a an the i me my we you your what which how does do is are in on at to of for and or with can should would could actually about it as be get have am im look like".split(" "));
function questionWords(text: string) {
  return new Set((text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((word) => !STOP_WORDS.has(word)).map((word) => word.replace(/s$/, "")));
}
function similarQuestion(text: string, threads: Thread[]) {
  const words = questionWords(text);
  if (words.size < 3) return undefined;
  return threads
    .map((thread) => {
      const candidate = questionWords(thread.title);
      const shared = [...words].filter((word) => candidate.has(word)).length;
      // Coverage of the CANDIDATE's own key words -- see ConnectInterstitial.tsx
      // for the full reasoning (a longer, more realistic student question
      // used to fail this even when it covered every word in the title).
      return { thread, score: shared >= 3 ? shared / candidate.size : 0 };
    })
    .sort((a, b) => b.score - a.score)
    .find((item) => item.score >= 0.6)?.thread;
}

function useCountUp(target: number, duration = 1100) {
  const [display, setDisplay] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

/** A plain scrolling row of fixed-width tiles, using the full width the
 *  modal has -- direct feedback, 17 Sept 2026: "the [tiles] can show more
 *  at once, the carousel width needs to use the full width available to
 *  it in the modal... clipping only happens at the edge." Native overflow
 *  does the work: as many tiles as fit show in full, and only a trailing
 *  one is ever partially clipped, by the row's own right edge -- not a
 *  single-focus depth effect (tried and reverted: "everything is wrongly
 *  stretching... the modal is unnecessarily tall now"). `cardClassName`
 *  sets each tile's width -- narrow for People, wide enough to fit real
 *  sentences for Answers. */
function Row<T>({ items, renderCard, ariaLabel, cardClassName }: { items: T[]; renderCard: (item: T) => React.ReactNode; ariaLabel: string; cardClassName?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  function scroll(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-row-card]");
    const step = (card?.offsetWidth ?? 132) + 10;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }
  return (
    <div>
      <div className={styles.row} ref={trackRef} role="group" aria-label={ariaLabel}>
        {items.map((item, i) => (
          <div className={`${styles.rowCard} ${cardClassName ?? ""}`} data-row-card key={i}>{renderCard(item)}</div>
        ))}
      </div>
      {items.length > 1 && (
        <div className={styles.stackNav}>
          <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)}><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Scroll right" onClick={() => scroll(1)}><ChevronRight size={17} /></button>
        </div>
      )}
    </div>
  );
}

function HeroGlow({ accent, sprite = "/images/dreamy/v2/splash/dreamy-puzzle-wide.webp" }: { accent: string; sprite?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={styles.hero} aria-hidden>
      <motion.span
        className={styles.heroGlow}
        style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 55%, transparent), transparent 100%)` }}
        animate={reduceMotion ? {} : { opacity: [0.55, 0.8, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className={styles.heroDreamy} animate={reduceMotion ? {} : { y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <Image src={sprite} alt="" width={104} height={76} unoptimized />
      </motion.div>
    </div>
  );
}

export function ConnectWithProfessionalsModal({ world, onClose }: { world: string; onClose: () => void }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<View>("intro");
  const [step, setStep] = useState<Step>("ask");
  const [done, setDone] = useState<Set<Step>>(new Set());
  const [likedInsights, setLikedInsights] = useState<Set<string>>(new Set());
  const [commentingInsight, setCommentingInsight] = useState<string>();
  const [insightComments, setInsightComments] = useState<Record<string, string>>({});
  const [insightDraft, setInsightDraft] = useState("");
  const [followedPros, setFollowedPros] = useState<Set<string>>(new Set());
  const [profilePro, setProfilePro] = useState<Pro>();
  const [question, setQuestion] = useState("");
  const [match, setMatch] = useState<Thread>();
  const [askPosted, setAskPosted] = useState(false);
  const [usedAnswer, setUsedAnswer] = useState(false);
  const [matchComposing, setMatchComposing] = useState(false);
  const [matchDraft, setMatchDraft] = useState("");
  const [matchNote, setMatchNote] = useState<string>();
  const [totalXp, setTotalXp] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stepDir, setStepDir] = useState<1 | -1>(1);
  const dialog = useRef<HTMLDivElement>(null);
  const xpTarget = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const reduceMotion = useReducedMotion();
  const displayXp = useCountUp(totalXp);
  const accent = WORLD_COLORS[world] ?? "var(--primary)";
  const router = useRouter();

  const community = COMMUNITIES.find((item) => item.world === world) ?? COMMUNITIES.find((item) => item.id === "teaching-education");
  const { thread, answerInsights, peoplePros } = useMemo(() => {
    const insights = INSIGHTS.filter((item) => item.boardId === community?.id).slice().sort((a, b) => b.helpful - a.helpful);
    const threadsHere = THREADS.filter((item) => item.boardId === community?.id && item.type === "question");
    const pros = [...PROS].filter((p) => p.world === world).sort((a, b) => b.followers - a.followers);
    return { thread: threadsHere, answerInsights: insights.slice(0, 3), peoplePros: pros.slice(0, 5) };
  }, [community?.id, world]);
  const matchAnswer = match?.responses.find((item) => item.kind === "answer" && item.primary) ?? match?.responses.find((item) => item.kind === "answer");
  const matchAnswerPro = matchAnswer?.kind === "answer" ? PROS.find((item) => item.id === matchAnswer.proId) : undefined;
  const milestone = `connect-career:${community?.id ?? world}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
    setHost(document.body);
  }, []);
  // A ref, not a dependency -- if the parent ever passes a fresh inline
  // onClose on re-render, this effect must not re-run (it would call
  // dialog.current?.focus() again and rip focus out of whatever the
  // student is typing into). See ConnectInterstitial.tsx for the same
  // pattern and the fuller writeup.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!host) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [host]);

  function fly(amount: number, colorIndex: number) {
    const from = content.current?.getBoundingClientRect();
    const to = xpTarget.current?.getBoundingClientRect();
    if (!from || !to) return;
    setFlights((previous) => [...previous, {
      id: ++sequence.current, amount, colorIndex,
      x: from.left + from.width / 2, y: from.top + Math.min(from.height / 2, 200),
      toX: to.left + to.width / 2, toY: to.top + to.height / 2,
    }]);
  }

  function reward(action: Step, amountOverride?: number) {
    if (done.has(action)) return;
    const nextDone = new Set(done).add(action);
    const chainAmount = amountOverride ?? ACTION_XP[action];
    const bonus = nextDone.size === STEPS.length;
    const amount = chainAmount + (bonus ? BONUS_XP : 0);
    awardDreamScore(`${milestone}:${action}`, chainAmount);
    if (bonus) awardDreamScore(`${milestone}:all3`, BONUS_XP);
    setDone(nextDone);
    setTotalXp((value) => value + amount);
    fly(amount, nextDone.size - 1);
    if (bonus) playMilestoneChime(); else playXpRise(nextDone.size > 1 ? 460 : 380);
    if (bonus) window.setTimeout(() => setView("connected"), 700);
  }

  function goToStep(next: Step) {
    setStepDir(STEPS.findIndex((s) => s.id === next) > STEPS.findIndex((s) => s.id === step) ? 1 : -1);
    setStep(next);
  }
  function choose(next: Step) { goToStep(next); setView("posts"); }
  function replay() {
    setView("intro"); setStep("ask"); setDone(new Set());
    setLikedInsights(new Set()); setCommentingInsight(undefined); setInsightComments({}); setInsightDraft("");
    setFollowedPros(new Set()); setQuestion(""); setMatch(undefined);
    setAskPosted(false); setUsedAnswer(false); setMatchComposing(false); setMatchDraft(""); setMatchNote(undefined);
    setTotalXp(0); setFlights([]);
  }
  function toggleLikeInsight(id: string) {
    if (likedInsights.has(id)) return;
    setLikedInsights((previous) => new Set(previous).add(id));
    reward("answers");
  }
  function postInsightComment(id: string, text: string) {
    if (!text.trim()) return;
    setInsightComments((previous) => ({ ...previous, [id]: text.trim() }));
    setCommentingInsight(undefined);
    setInsightDraft("");
    reward("answers", ANSWER_COMMENT_XP);
  }
  function followPro(id: string) {
    if (followedPros.has(id)) return;
    setFollowedPros((previous) => new Set(previous).add(id));
    reward("people");
  }
  function openProfile(pro: Pro) {
    setProfilePro(pro);
    setView("profile");
  }
  function goToBoard() {
    router.push(`/connect?board=${community?.id ?? ""}`);
    onClose();
  }
  function postQuestion(text: string) {
    setQuestion(text);
    const candidate = similarQuestion(text, thread);
    setMatch(candidate);
    if (!candidate) { setAskPosted(true); reward("ask"); }
  }

  if (!host) return null;

  const allDone = done.size === STEPS.length;

  return createPortal(
    <div className={`marketing-v2 themeable ${styles.overlay}`} style={{ "--connect-accent": accent, background: "transparent" } as CSSProperties}>
      <button type="button" aria-label="Close" onClick={onClose} className={`${styles.backdrop} backdrop-blur-[14px]`} />
      <motion.div
        ref={dialog} role="dialog" aria-modal="true" aria-labelledby="connect-pros-title" tabIndex={-1}
        className={`${styles.dialog} backdrop-blur-[22px]`} initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }}
      >
        <header className={styles.toolbar}>
          {view === "profile" ? (
            <button className={styles.iconButton} aria-label="Back" onClick={() => setView("posts")}><ArrowLeftIcon /></button>
          ) : view === "posts" ? (
            <button className={styles.iconButton} aria-label="Back to menu" onClick={() => setView("intro")}><ArrowLeftIcon /></button>
          ) : (
            <button className={styles.iconButton} aria-label="Replay" title="Replay" onClick={replay}><RotateCcw className="h-4 w-4" aria-hidden /></button>
          )}
          <div ref={xpTarget} className={styles.xp} aria-live="polite" aria-atomic="true">
            <LocalBurst nonce={done.size} />
            <Sparkles size={15} />
            <motion.strong key={totalXp} animate={reduceMotion ? {} : { scale: [1.3, 1] }}>{displayXp} XP</motion.strong>
            <SparkBar
              className={styles.chainMeter}
              percent={(done.size / STEPS.length) * 100}
              height={4}
              min={done.size > 0 ? 8 : 0}
              track="var(--glass-border)"
              fill={`linear-gradient(90deg, ${CHAIN_COLOR[0]}, ${CHAIN_COLOR[1]}, ${CHAIN_COLOR[2]})`}
              glow={CHAIN_COLOR[Math.max(0, done.size - 1)]}
              idle={false}
              memoryKey="connect-career-chain"
            />
          </div>
          <button className={styles.skip} onClick={onClose}>Close</button>
          <button className={styles.iconButton} aria-label="Close" onClick={onClose}><X size={18} /></button>
        </header>

        <div ref={content} className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            {view === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <HeroGlow accent={accent} />
                <div className={styles.heading}>
                  <h1 id="connect-pros-title" className="dm-title-shimmer" style={{ "--shimmer-tint": accent } as CSSProperties}>Connect with {world} Professionals</h1>
                  <p>Ask a question, explore answers, or follow professionals in the field.</p>
                  <p className={styles.requirement}>Do all three for a bonus.</p>
                </div>
                <div className={styles.menu}>
                  {STEPS.map(({ id, title, body, Icon }) => {
                    const orderIndex = [...done].indexOf(id);
                    const color = orderIndex >= 0 ? CHAIN_COLOR[orderIndex] : accent;
                    return (
                      <button key={id} className={styles.menuRow} onClick={() => choose(id)}>
                        <Icon size={20} color={color} />
                        <span><strong>{title}</strong><small>{body}</small></span>
                        <b style={{ color: done.has(id) ? color : "var(--connect-accent)" }}>{done.has(id) ? <Check size={16} /> : `+${ACTION_XP[id]} XP`}</b>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view === "posts" && (
              <motion.div key="posts" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <nav className={styles.tabs} aria-label="Connect actions">
                  {STEPS.map(({ id, title }) => (
                    <button key={id} aria-pressed={step === id} onClick={() => goToStep(id)}>{title}{done.has(id) && <Check size={13} />}</button>
                  ))}
                </nav>
                <AnimatePresence mode="wait" initial={false} custom={stepDir}>
                  <motion.div
                    key={step} custom={stepDir}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 28 * stepDir }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -28 * stepDir }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {step === "ask" ? (
                      <div className={styles.ask}>
                        {community && (
                          <div className={styles.board}>
                            <Image src={PHOTO_COVER[community.id] ?? community.photo} alt="" fill sizes="600px" className={styles.boardPhoto} style={{ objectPosition: PHOTO_FOCUS[community.id] ?? "60% 42%" }} />
                            <CardProgressiveBlur size="80%" />
                            <span className={styles.boardScrim} style={{ background: cardBottomScrim("heavy") }} />
                            <div className={styles.boardInfo} style={{ textShadow: CARD_TEXT_SHADOW }}>
                              <strong>{community.name}</strong>
                              <span>{community.students} students · {community.activePros} pros</span>
                              {community.professionalsFrom.length > 0 && (
                                <span className={styles.boardLogos}>
                                  {community.professionalsFrom.slice(0, 3).map((name) => <CompanyChip key={name} name={name} tone="frost" size="sm" />)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {askPosted ? (
                          <div className={styles.posted} role="status">
                            <Check size={22} />
                            <p>{matchNote ? match?.title : usedAnswer ? match?.title : question}</p>
                            <small>{matchNote ? "Your comment was added." : usedAnswer ? "Marked as helpful." : `${community?.name ?? world} will get a notification.`}</small>
                          </div>
                        ) : match ? (
                          <div className={styles.match}>
                            <p>{match.followers}+ students already asked this</p>
                            <h2>{match.title}</h2>
                            {matchAnswer?.kind === "answer" && matchAnswerPro && (
                              <>
                                <div className={styles.author}><Avatar name={matchAnswerPro.name} size={30} /><strong>{matchAnswerPro.name}</strong><BadgeCheck size={14} /></div>
                                <p>{matchAnswer.body}</p>
                              </>
                            )}
                            {matchComposing ? (
                              <form
                                className={styles.commentForm}
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  if (!matchDraft.trim()) return;
                                  setMatchNote(matchDraft.trim()); setUsedAnswer(true); setAskPosted(true); reward("ask");
                                }}
                              >
                                <label className="sr-only" htmlFor="connect-pros-match-comment">Your comment</label>
                                <textarea id="connect-pros-match-comment" required maxLength={200} rows={2} placeholder="Add a comment…" value={matchDraft} onChange={(event) => setMatchDraft(event.target.value)} />
                                <button className={styles.primary} type="submit" disabled={!matchDraft.trim()}>Post</button>
                              </form>
                            ) : (
                              <div className={styles.matchActions}>
                                <button className={styles.primary} onClick={() => { setUsedAnswer(true); setAskPosted(true); reward("ask"); }}>This helps, thanks</button>
                                <button className={styles.textButton} onClick={() => setMatchComposing(true)}>Comment</button>
                                <button className={styles.textButton} onClick={() => { setMatch(undefined); setQuestion(""); }}>Ask something else</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={styles.askComposer}>
                            <InlineAsk joined defaultOpen accent={accent} placeholder={`Ask the ${community?.name ?? world} community…`} onPost={postQuestion} />
                          </div>
                        )}
                      </div>
                    ) : step === "answers" ? (
                      answerInsights.length > 0 ? (
                        <>
                          <Row
                            items={answerInsights}
                            ariaLabel="Answers from professionals"
                            cardClassName={styles.answerRowCard}
                            renderCard={(item) => {
                              const itemPro = PROS.find((p) => p.id === item.proId);
                              if (!itemPro) return null;
                              const liked = likedInsights.has(item.id);
                              const savedComment = insightComments[item.id];
                              const untouched = !liked && !savedComment && commentingInsight !== item.id;
                              return (
                                <div className={styles.answerCard}>
                                  <button type="button" className={styles.author} onClick={() => openProfile(itemPro)}>
                                    <Avatar name={itemPro.name} size={32} />
                                    <div><strong>{itemPro.name} <BadgeCheck size={13} /></strong><small>{itemPro.role} · {itemPro.org}</small></div>
                                  </button>
                                  <p className={styles.quote}>&ldquo;{item.body}&rdquo;</p>
                                  <div className={styles.postActions} data-nudge={untouched || undefined}>
                                    <button type="button" aria-pressed={liked} onClick={() => toggleLikeInsight(item.id)}>
                                      <ThumbsUp size={13} /> Like <b>{item.helpful + (liked ? 1 : 0)}</b>
                                    </button>
                                    <button
                                      type="button"
                                      aria-pressed={commentingInsight === item.id || !!savedComment}
                                      onClick={() => setCommentingInsight(commentingInsight === item.id ? undefined : item.id)}
                                    >
                                      <MessageCircle size={13} /> Comment <b>{item.replies.length + (savedComment ? 1 : 0)}</b>
                                    </button>
                                  </div>
                                  {savedComment ? (
                                    <div className={styles.savedComment} role="status">
                                      <Avatar name="Jordan" size={26} />
                                      <div><strong>Jordan <small>· Just now</small></strong><p>{savedComment}</p></div>
                                    </div>
                                  ) : commentingInsight === item.id ? (
                                    <form
                                      className={styles.commentForm}
                                      onSubmit={(event) => { event.preventDefault(); postInsightComment(item.id, insightDraft); }}
                                    >
                                      <label className="sr-only" htmlFor={`answer-comment-${item.id}`}>Your comment</label>
                                      <textarea id={`answer-comment-${item.id}`} required maxLength={200} rows={2} placeholder="Add a comment…" value={insightDraft} onChange={(event) => setInsightDraft(event.target.value)} />
                                      <button className={styles.primary} type="submit" disabled={!insightDraft.trim()}>Post</button>
                                    </form>
                                  ) : null}
                                </div>
                              );
                            }}
                          />
                          <button type="button" className={styles.seeMore} onClick={goToBoard}>
                            Find more pros on Connect <ChevronRight size={14} />
                          </button>
                        </>
                      ) : (
                        <p>Nothing shared here yet.</p>
                      )
                    ) : peoplePros.length > 0 ? (
                      <>
                        <Row
                          items={peoplePros}
                          ariaLabel="Professionals to follow"
                          renderCard={(p) => {
                            const following = followedPros.has(p.id);
                            return (
                              <div className={styles.peopleCard}>
                                <button type="button" className={styles.peopleCardMain} onClick={() => openProfile(p)}>
                                  <Avatar name={p.name} size={44} />
                                  <strong>{p.name}</strong>
                                  <small>{p.role}</small>
                                  <CompanyChip name={p.org} tone="surface" size="sm" />
                                  <small>{p.followers} followers</small>
                                </button>
                                <button type="button" className={styles.followBtn} data-following={following || undefined} onClick={() => followPro(p.id)}>
                                  {following ? <Check size={13} /> : <UserPlus size={13} />}{following ? "Following" : "Follow"}
                                </button>
                              </div>
                            );
                          }}
                        />
                        <button type="button" className={styles.seeMore} onClick={goToBoard}>
                          Find more pros on Connect <ChevronRight size={14} />
                        </button>
                      </>
                    ) : (
                      <p>No professionals here yet.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
                {done.has(step) && done.size < STEPS.length && (() => {
                  const next = STEPS.find((s) => !done.has(s.id))!;
                  const nextXp = ACTION_XP[next.id];
                  return (
                    <button className={styles.nextUp} onClick={() => goToStep(next.id)}>
                      Next: {next.title} <b>+{nextXp} XP</b> <ArrowRight size={14} />
                    </button>
                  );
                })()}
                <button className={`${styles.secondary} ${styles.continueFooter}`} disabled={done.size === 0} onClick={() => setView("connected")}>
                  Done for now <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {view === "profile" && profilePro && (() => {
              const following = followedPros.has(profilePro.id);
              return (
                <motion.div key="profile" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <div className={styles.profileHead}>
                    <Avatar name={profilePro.name} size={64} />
                    <h2><strong>{profilePro.name}</strong> <BadgeCheck size={16} /></h2>
                    <p>{profilePro.role} · {profilePro.org}</p>
                    <CompanyChip name={profilePro.org} tone="surface" size="sm" />
                    <small>{profilePro.followers} followers</small>
                  </div>
                  <p className={styles.quote}>&ldquo;{profilePro.story}&rdquo;</p>
                  <button className={following ? styles.done : styles.primary} disabled={following} onClick={() => followPro(profilePro.id)}>
                    {following ? <Check size={16} /> : <UserPlus size={16} />}{following ? "Following" : "Follow"}
                  </button>
                </motion.div>
              );
            })()}

            {view === "connected" && (() => {
              const doneTitles = STEPS.filter((s) => done.has(s.id)).map((s) => s.title);
              const missing = STEPS.find((s) => !done.has(s.id));
              const copy = done.size === 3
                ? { title: "All connected!", body: "Asked. Answered. Followed.", note: `+${BONUS_XP} XP bonus for all three, included above.` }
                : done.size === 2
                  ? { title: "Two connections made!", body: `${doneTitles.join(" and ")}, done.`, note: `One more (+${missing ? ACTION_XP[missing.id] : 0} XP) for the full bonus.` }
                  : done.size === 1
                    ? { title: "Connected!", body: `${doneTitles[0]}, done.`, note: `Two more for a +${BONUS_XP} XP bonus.` }
                    : { title: "Heading out", body: "You can always connect next time.", note: "" };
              return (
                <motion.div key="connected" className={styles.connected} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <HeroGlow accent={accent} sprite="/images/dreamy/v2/splash/dreamy-party.webp" />
                  <motion.div className={styles.check} initial={{ scale: reduceMotion ? 1 : 0.4, rotate: reduceMotion ? 0 : -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 11 }}>
                    <LocalBurst nonce={allDone ? 1 : 0} />
                    <Check size={30} strokeWidth={2.75} />
                  </motion.div>
                  <h2 className="dm-title-shimmer" style={{ "--shimmer-tint": accent } as CSSProperties}>{copy.title}</h2>
                  <p>{copy.body}</p>
                  {allDone && <span className={styles.combo}>×3 COMBO</span>}
                  {totalXp > 0 && <strong className={styles.gain}>+{displayXp} XP</strong>}
                  {copy.note && <small>{copy.note}</small>}
                  <div className={styles.connectedActions}>
                    <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4.5} strength={0.9} active={allDone}>
                      <button className={styles.primary} onClick={onClose}>Done <ArrowRight size={16} /></button>
                    </BorderBeam>
                    {done.size > 0 && done.size < 3 && <button className={styles.textButton} onClick={() => setView("posts")}>Keep connecting</button>}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </motion.div>

      {flights.map((flight) => (
        <motion.div
          key={flight.id} className={styles.flight} aria-hidden
          style={{ color: CHAIN_COLOR[flight.colorIndex] ?? accent, textShadow: `0 0 18px ${CHAIN_COLOR[flight.colorIndex] ?? accent}` }}
          initial={{ left: flight.x, top: flight.y, opacity: 0, scale: 0.4, rotate: -6 }}
          animate={reduceMotion
            ? { left: flight.x, top: flight.y, opacity: [0, 1, 1, 0], scale: 1, rotate: 0 }
            : { left: [flight.x, flight.x, flight.x, flight.toX], top: [flight.y, flight.y - 40, flight.y - 40, flight.toY], opacity: [0, 1, 1, 0], scale: [0.4, 1.4, 1.15, 0.25], rotate: [-6, 4, 0, 0] }}
          transition={{ duration: 2.2, times: [0, 0.15, 0.8, 1], ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setFlights((previous) => previous.filter((item) => item.id !== flight.id))}
        >
          {flight.colorIndex === STEPS.length - 1 && <span className={styles.combo}>×3 COMBO</span>}
          +{flight.amount} XP
        </motion.div>
      ))}
    </div>,
    host,
  );
}

// A tiny inline back-chevron so this file doesn't need a second lucide
// import line duplicating ChevronLeft under a different local name.
function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
