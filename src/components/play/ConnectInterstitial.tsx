"use client";

// Connect-before-next-level: a skippable interstitial between career
// simulation levels that pulls a student into Connect for one real
// professional interaction before they move on.
//
// Rebuilt 17 Sept 2026 after live-testing the actual Replit reference
// (dceeai.replit.app/ib-career-game, "CONNECT BEFORE LEVEL 2") end to end,
// which settled several open questions direct feedback had raised:
//   - It is NOT gated on all three actions. Completing any ONE of
//     Like/Comment/Ask immediately shows a small "Connected" success screen
//     (checkmark, "+N Dream Score", Continue, and a "Change interaction"
//     link back to try another) -- so our "do all three for a badge" framing
//     was the wrong model and has been dropped in favor of this per-action
//     loop, with our own XP chain layered on top of it.
//   - The dialog itself is compact (roughly 420-460px), not a wide
//     two-column layout, and its backdrop only dims and blurs the scene
//     behind it -- the page is still visibly there, just darkened.
//   - Picking Like/Comment/Ask is a flat segmented control over ONE real
//     post each, no per-post browsing arrows/dots/like-counts -- direct
//     feedback, 17 Sept 2026: "shouldn't feel too complicated... match the
//     replit's DNA for the userflow, except for our enhancements."
// Our enhancements, kept on top of that same simple shape: switching
// between Like/Comment/Ask slides like a small cinematic carousel instead
// of an instant tab-swap; an escalating XP chain (5 -> 8 -> 12, +15 once
// all three are done) with a big flying number that launches from the
// click and lands on a persistent header XP counter; Ask starts blank and
// only surfaces a real matching thread once the student actually asks
// something similar (never a pre-filled fake post); and a Replay control for
// demos, so the whole loop can be re-run without leaving Play.
//
// Content is always real, never placeholder: Insights/Threads/Communities
// come straight from Connect's own seeded data (connect/data.ts), matched
// to the simulation's career world.

import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, BadgeCheck, Check, ChevronLeft, MessageCircle, RotateCcw, Sparkles, ThumbsUp, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import { WORLD_COLORS } from "@/components/app/worlds";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardBottomScrim } from "@/components/app/cardChrome";
import { awardDreamScore } from "@/lib/dreamScore";
import { playMilestoneChime, playXpRise } from "@/components/build/sound";
import { LocalBurst } from "@/components/build/ui";
import { SparkBar } from "@/components/flow/SparkBar";
import { Avatar, CompanyChip, InlineAsk } from "@/components/connect/primitives";
import { PHOTO_COVER, PHOTO_FOCUS } from "@/components/connect/CommunityCard";
import { COMMUNITIES, INSIGHTS, PROS, THREADS, type Thread } from "@/components/connect/data";
import type { Simulation } from "./types";
import styles from "./ConnectInterstitial.module.css";

/** Escalating chain color, RPG-combo style: green -> gold -> purple. */
const CHAIN_COLOR = ["#33c78c", "#facc15", "#c084fc"];

// Row titles and one-line descriptions are the reference's own copy,
// verbatim (dceeai.replit.app/ib-career-game, "Connect before Level 2").
const STEPS = [
  { id: "like", title: "Like", body: "React to advice from a professional", Icon: ThumbsUp },
  { id: "comment", title: "Comment", body: "Join a professional conversation", Icon: MessageCircle },
  { id: "ask", title: "Ask", body: "Ask professionals in this career", Icon: Sparkles },
] as const;
type Step = typeof STEPS[number]["id"];
type View = "intro" | "posts" | "connected";
type Flight = { id: number; amount: number; colorIndex: number; x: number; y: number; toX: number; toY: number };
const CHAIN_XP = [5, 8, 12];
const BONUS_XP = 15;

/** A real rolling count-up (not just a scale-pop) -- direct feedback, 17
 *  Sept 2026: "make the XP animations and counting much richer." */
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

// A conservative local demo matcher. Shared career words alone are not a
// duplicate; never claim a follower count for something that isn't one.
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
      return { thread, score: shared >= 3 ? shared / Math.max(words.size, candidate.size) : 0 };
    })
    .sort((a, b) => b.score - a.score)
    .find((item) => item.score >= 0.6)?.thread;
}

/** A contained version of WelcomeSplash's own hero (dual-tint radial glow
 *  behind a floating Dreamy sprite) -- the graphic identity that made this
 *  feel cinematic, sized to sit inside a 440px dialog rather than a full
 *  panel (direct feedback, 17 Sept 2026: "where did all our cool graphics
 *  and animations go?"). */
function HeroGlow({ accent }: { accent: string }) {
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
        <Image src="/images/dreamy/v2/splash/dreamy-puzzle-wide.webp" alt="" width={104} height={76} unoptimized />
      </motion.div>
    </div>
  );
}

export function ConnectInterstitial({ simulation, nextLevelLabel, onContinue }: {
  simulation: Simulation; nextLevelLabel: string; onContinue: () => void;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<View>("intro");
  const [step, setStep] = useState<Step>("like");
  const [done, setDone] = useState<Set<Step>>(new Set());
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState<string>();
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [match, setMatch] = useState<Thread>();
  const [askPosted, setAskPosted] = useState(false);
  const [usedAnswer, setUsedAnswer] = useState(false);
  const [matchComposing, setMatchComposing] = useState(false);
  const [matchDraft, setMatchDraft] = useState("");
  const [matchNote, setMatchNote] = useState<string>();
  const [totalXp, setTotalXp] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [burstNonce, setBurstNonce] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const xpTarget = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [stepDir, setStepDir] = useState<1 | -1>(1);
  const sequence = useRef(0);
  const reduceMotion = useReducedMotion();
  const displayXp = useCountUp(totalXp);
  const accent = WORLD_COLORS[simulation.world] ?? "var(--primary)";
  const community = COMMUNITIES.find((item) => item.world === simulation.world);
  const { insight, thread } = useMemo(() => {
    const insights = INSIGHTS.filter((item) => item.boardId === community?.id).slice().sort((a, b) => b.helpful - a.helpful);
    const threadsHere = THREADS.filter((item) => item.boardId === community?.id);
    return { insight: insights[0], thread: threadsHere };
  }, [community?.id]);
  const pro = PROS.find((item) => item.id === insight?.proId);
  const matchAnswer = match?.responses.find((item) => item.kind === "answer" && item.primary) ?? match?.responses.find((item) => item.kind === "answer");
  const matchAnswerPro = matchAnswer?.kind === "answer" ? PROS.find((item) => item.id === matchAnswer.proId) : undefined;
  const milestone = `connect-play:${simulation.id}:${nextLevelLabel}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
    setHost(document.body);
  }, []);
  useEffect(() => {
    if (!host) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onContinue(); }
      if (event.key !== "Tab") return;
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, input, [tabindex="0"]') ?? []).filter((el) => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [host, onContinue]);

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

  /** Direct instruction, 17 Sept 2026: "I should be shown all my options in
   *  succession and have to at least like 1, at least comment on 1, and at
   *  least ask 1" -- all three are required before "Connected" shows (the
   *  reference itself only requires one and stops there, confirmed live,
   *  but this app's version deliberately asks for more). Each individual
   *  completion still earns its own escalating chain XP (5 -> 8 -> 12) with
   *  its own flying-number feedback; only the THIRD one closes the loop
   *  and adds the +15 bonus. Skip/X always remain available regardless of
   *  progress -- required to finish the loop, never required to leave it. */
  function reward(action: Step) {
    if (done.has(action)) return;
    const nextDone = new Set(done).add(action);
    const chainAmount = CHAIN_XP[Math.min(nextDone.size - 1, CHAIN_XP.length - 1)];
    const bonus = nextDone.size === STEPS.length;
    const amount = chainAmount + (bonus ? BONUS_XP : 0);
    awardDreamScore(`${milestone}:${action}`, chainAmount);
    if (bonus) awardDreamScore(`${milestone}:all3`, BONUS_XP);
    setDone(nextDone);
    setTotalXp((value) => value + amount);
    setBurstNonce((n) => n + 1);
    fly(amount, nextDone.size - 1);
    if (bonus) playMilestoneChime(); else playXpRise(nextDone.size > 1 ? 460 : 380);
    // No auto-advance -- direct feedback, 17 Sept 2026: "once that's done
    // don't immediately nudge them to go to the next thing... give them the
    // option to skip and see the next action." The completed card just
    // shows its own done state; a small "Next: X · +N XP" prompt (rendered
    // per-card below) lets them move on when THEY choose to, and the tabs
    // themselves are always tappable too.
    if (bonus) window.setTimeout(() => setView("connected"), 700);
  }

  function goToStep(next: Step) {
    setStepDir(STEPS.findIndex((s) => s.id === next) > STEPS.findIndex((s) => s.id === step) ? 1 : -1);
    setStep(next);
  }
  function choose(next: Step) { goToStep(next); setView("posts"); }
  function replay() {
    setView("intro"); setStep("like"); setDone(new Set());
    setLiked(false); setComment(undefined); setDraft(""); setQuestion(""); setMatch(undefined);
    setAskPosted(false); setUsedAnswer(false); setMatchComposing(false); setMatchDraft(""); setMatchNote(undefined); setTotalXp(0); setFlights([]);
  }
  function postQuestion(text: string) {
    setQuestion(text);
    const candidate = similarQuestion(text, thread);
    setMatch(candidate);
    if (!candidate) { setAskPosted(true); reward("ask"); }
  }
  function postComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || comment) return;
    setComment(draft.trim());
    reward("comment");
  }

  if (!host) return null;

  return createPortal(
    <div className={`marketing-v2 themeable ${styles.overlay}`} style={{ "--connect-accent": accent, background: "transparent" } as CSSProperties}>
      {/* backdrop-filter must be a Tailwind utility, not a hand-authored CSS
         rule -- Lightning CSS silently strips a plain `backdrop-filter`
         declaration from a stylesheet/CSS-module rule (confirmed live, 17
         Sept 2026: computed style showed `backdrop-filter: none` despite
         the rule being right there in the .module.css). */}
      <button
        type="button"
        aria-label="Close and continue to next level"
        onClick={onContinue}
        className={`${styles.backdrop} backdrop-blur-[14px]`}
      />
      <motion.div
        ref={dialog} role="dialog" aria-modal="true" aria-labelledby="connect-title" tabIndex={-1}
        className={`${styles.dialog} backdrop-blur-[22px]`} initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }}
      >
        <header className={styles.toolbar}>
          {view === "posts" ? (
            <button className={styles.iconButton} aria-label="Back to menu" onClick={() => setView("intro")}><ChevronLeft size={18} /></button>
          ) : (
            <button className={styles.iconButton} aria-label="Replay" title="Replay" onClick={replay}><RotateCcw size={16} /></button>
          )}
          <div ref={xpTarget} className={styles.xp} aria-live="polite" aria-atomic="true">
            <LocalBurst nonce={burstNonce} />
            <Sparkles size={15} />
            <motion.strong key={totalXp > 0 ? Math.ceil(totalXp / 1000) : 0} animate={reduceMotion ? {} : { scale: [1.3, 1] }}>{displayXp} XP</motion.strong>
            <SparkBar
              className={styles.chainMeter}
              percent={(done.size / STEPS.length) * 100}
              height={4}
              min={done.size > 0 ? 8 : 0}
              track="var(--glass-border)"
              fill={`linear-gradient(90deg, ${CHAIN_COLOR[0]}, ${CHAIN_COLOR[1]}, ${CHAIN_COLOR[2]})`}
              glow={CHAIN_COLOR[Math.max(0, done.size - 1)]}
              idle={false}
              memoryKey="connect-interstitial-chain"
            />
          </div>
          <button className={styles.skip} onClick={onContinue}>Skip</button>
          <button className={styles.iconButton} aria-label="Close" onClick={onContinue}><X size={18} /></button>
        </header>

        <div ref={content} className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            {view === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <HeroGlow accent={accent} />
                <div className={styles.heading}>
                  <h1 id="connect-title" className="dm-title-shimmer" style={{ "--shimmer-tint": accent } as CSSProperties}>Connect before {nextLevelLabel.split(" · ")[0]}</h1>
                  <p>Engage with real professionals to continue.</p>
                  <p className={styles.requirement}>Do all three for a bonus.</p>
                </div>
                <div className={styles.menu}>
                  {STEPS.map(({ id, title, body, Icon }) => {
                    // Colored by the ORDER each was completed in, not by
                    // which step it is -- doing Ask first earns the green
                    // (first) color, not a fixed per-step color.
                    const orderIndex = [...done].indexOf(id);
                    const color = orderIndex >= 0 ? CHAIN_COLOR[orderIndex] : accent;
                    return (
                      <button key={id} className={styles.menuRow} onClick={() => choose(id)}>
                        <Icon size={20} color={color} />
                        <span><strong>{title}</strong><small>{body}</small></span>
                        <b style={{ color: done.has(id) ? color : "var(--connect-accent)" }}>{done.has(id) ? <Check size={16} /> : `+${CHAIN_XP[Math.min(done.size, CHAIN_XP.length - 1)]} XP`}</b>
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
                                  {community.professionalsFrom.slice(0, 3).map((name) => (
                                    <CompanyChip key={name} name={name} tone="frost" size="sm" />
                                  ))}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {askPosted ? (
                          <div className={styles.posted} role="status">
                            <Check size={22} />
                            <p>{matchNote ? match?.title : usedAnswer ? match?.title : question}</p>
                            <small>
                              {matchNote ? "Your comment was added." : usedAnswer ? "Marked as helpful." : `${community?.name ?? simulation.world} will get a notification.`}
                            </small>
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
                                  setMatchNote(matchDraft.trim());
                                  setUsedAnswer(true);
                                  setAskPosted(true);
                                  reward("ask");
                                }}
                              >
                                <label className="sr-only" htmlFor="connect-match-comment">Your comment</label>
                                <textarea id="connect-match-comment" required maxLength={200} rows={2} placeholder="Add a comment…" value={matchDraft} onChange={(event) => setMatchDraft(event.target.value)} />
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
                            <InlineAsk joined defaultOpen accent={accent} placeholder={`Ask the ${community?.name ?? simulation.world} community…`} onPost={postQuestion} />
                          </div>
                        )}
                      </div>
                    ) : insight && pro ? (
                      <div className={styles.post}>
                        <div className={styles.author}>
                          <Avatar name={pro.name} size={38} />
                          <div>
                            <strong>{pro.name} <BadgeCheck size={14} /></strong>
                            <small>{pro.role} · {pro.org}</small>
                          </div>
                          <CompanyChip name={pro.org} tone="surface" size="sm" />
                        </div>
                        <p className={styles.quote}>&ldquo;{insight.body}&rdquo;</p>
                        <div className={styles.postMeta}>
                          <span><ThumbsUp size={13} /> {insight.helpful + (liked ? 1 : 0)}</span>
                          <span><MessageCircle size={13} /> {insight.replies.length + (comment ? 1 : 0)}</span>
                        </div>
                        {step === "like" ? (
                          <button className={liked ? styles.done : styles.primary} disabled={liked} onClick={() => { setLiked(true); reward("like"); }}>
                            <ThumbsUp size={16} />{liked ? "Liked" : "Like"}
                          </button>
                        ) : comment ? (
                          <div className={styles.savedComment} role="status">
                            <Avatar name="Jordan" size={28} />
                            <div><strong>Jordan <small>· Just now</small></strong><p>{comment}</p></div>
                          </div>
                        ) : (
                          <form className={styles.commentForm} onSubmit={postComment}>
                            <label className="sr-only" htmlFor="connect-comment">Your comment</label>
                            <textarea id="connect-comment" required maxLength={200} rows={2} placeholder="Add a comment…" value={draft} onChange={(event) => setDraft(event.target.value)} />
                            <button className={styles.primary} type="submit" disabled={!draft.trim()}>Post</button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <p>No professional posts here yet. You can still ask a question.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
                {done.has(step) && done.size < STEPS.length && (() => {
                  const next = STEPS.find((s) => !done.has(s.id))!;
                  const nextXp = CHAIN_XP[Math.min(done.size, CHAIN_XP.length - 1)];
                  return (
                    <button className={styles.nextUp} onClick={() => goToStep(next.id)}>
                      Next: {next.title} <b>+{nextXp} XP</b> <ArrowRight size={14} />
                    </button>
                  );
                })()}
                <button className={`${styles.secondary} ${styles.continueFooter}`} disabled={done.size === 0} onClick={() => setView("connected")}>
                  Continue to {nextLevelLabel.split(" · ")[0]} <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {view === "connected" && (() => {
              const doneTitles = STEPS.filter((s) => done.has(s.id)).map((s) => s.title);
              const copy = done.size === 3
                ? { title: "All connected!", body: "Liked. Commented. Asked.", note: `+${BONUS_XP} XP bonus for all three, included above.` }
                : done.size === 2
                  ? { title: "Two connections made!", body: `${doneTitles.join(" and ")}, done.`, note: `One more (+${CHAIN_XP[2]} XP) for the full bonus.` }
                  : done.size === 1
                    ? { title: "Connected!", body: `${doneTitles[0]}, done.`, note: `Two more for a +${BONUS_XP} XP bonus.` }
                    : { title: "Heading out", body: "You can always connect next time.", note: "" };
              return (
                <motion.div key="connected" className={styles.connected} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <HeroGlow accent={accent} />
                  <motion.div className={styles.check} initial={{ scale: reduceMotion ? 1 : 0.4, rotate: reduceMotion ? 0 : -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 11 }}>
                    <LocalBurst nonce={burstNonce} />
                    <Check size={30} strokeWidth={2.75} />
                  </motion.div>
                  <h2 className="dm-title-shimmer" style={{ "--shimmer-tint": accent } as CSSProperties}>{copy.title}</h2>
                  <p>{copy.body}</p>
                  {done.size === 3 && <span className={styles.combo}>×3 COMBO</span>}
                  {totalXp > 0 && <strong className={styles.gain}>+{displayXp} XP</strong>}
                  {copy.note && <small>{copy.note}</small>}
                  <div className={styles.connectedActions}>
                    <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4.5} strength={0.9} active={done.size === 3}>
                      <button className={styles.primary} onClick={onContinue}>Continue to {nextLevelLabel.split(" · ")[0]} <ArrowRight size={16} /></button>
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
