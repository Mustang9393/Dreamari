"use client";

// DEMO-ONLY: Component Lab, Game UI part. The LIVE Glossary engine
// (GlossaryLabGameExperience.tsx, the one the Play tab routes to), every
// piece in both themes with every state the props allow. Added 16 Oct 2026
// (Chandu: "add all our scaleable glossary game components etc to our
// component library, fill in all the gaps"): the older "Glossary game"
// group documents the first, unrouted engine, so none of this was in the
// lab. Beside every authored specimen sits one from the generated
// Registered Nurse career, so "scalable for any career" is visible, not
// claimed. Only `export` was added to the engine's pieces plus a theme
// provider; no behaviour, markup or styles changed.

import { useState, type ReactNode } from "react";
import { glossaryFor } from "@/components/glossary/data";
import { DREAMY_FACING } from "@/components/glossary/dreamyReactions";
import { WORLD_SYSTEMS, worldTheme } from "@/components/glossary/industries";
import { glossaryIndustries } from "@/components/glossary/data";
import {
  CompleteScreen,
  DreamyFace,
  FeedbackPanel,
  GlossaryLabAtmosphere,
  IntroScreen,
  MasteryLoadingScreen,
  PowerPlayIntroScreen,
  PowerPlayScreen,
  QuestionScreen,
  RewardPluses,
  SketchFace,
  SpeechBubble,
  StreakBanner,
  TopBar,
  UnlockCompleteScreen,
  UnlockScreen,
  ValuationTicker,
  type GlossaryLabTheme,
} from "@/components/glossary/GlossaryLabGameExperience";
import { ClippedStage, NotRendered, Reveal, Specimen, StateCell, StateGrid, noop } from "../../kit";

const IB = glossaryFor("investment-banking");
const RN = glossaryFor("nursing");
const L1 = IB?.lessons[0];
const L3 = IB?.lessons[2];
const RN1 = RN?.lessons[0];
const POSES = ["welcome", "explain", "choose", "match", "sort", "calculate", "recall", "case", "hint", "correct", "retry", "mastery"] as const;
const FILE = "src/components/glossary/GlossaryLabGameExperience.tsx";

const THEMES: { id: GlossaryLabTheme; label: string }[] = [
  { id: "v1", label: "Drift" },
  { id: "v2", label: "Signal" },
];

function ThemeSwitcher({ value, onChange }: { value: GlossaryLabTheme; onChange: (v: GlossaryLabTheme) => void }) {
  return (
    <div role="group" aria-label="Glossary theme" className="flex flex-wrap gap-[6px]">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={value === t.id}
          onClick={() => onChange(t.id)}
          className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12px] font-bold"
          style={{ borderColor: value === t.id ? "var(--primary)" : "var(--glass-border)", background: value === t.id ? "color-mix(in srgb, var(--primary) 18%, var(--card))" : "var(--glass-surface-1)", color: "var(--foreground)" }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** The engine's shell, as the Play tab builds it: the stylesheets key on
 *  these classes and on data-screen, so a piece rendered outside them is
 *  not the piece students see. */
function Stage({ theme, world = "Business & Finance", screen = "question", height = 320, children }: { theme: GlossaryLabTheme; world?: string; screen?: string; height?: number; children: ReactNode }) {
  return (
    <ClippedStage height={height}>
      <GlossaryLabAtmosphere atmosphere={theme}>
        <div className={`glossary-game-shell glossary-game-lab glossary-fit-shell glossary-lab-atmosphere-${theme} marketing-v2 themeable relative flex h-full w-full flex-col`} data-screen={screen} style={{ ...worldTheme(world), background: "var(--background)" }}>
          <div className="glossary-game-frame flex flex-1 flex-col">
            <main className="glossary-engine-main relative z-0 mx-auto flex w-full flex-1 flex-col justify-center gap-[var(--space-5)] px-5 py-[var(--space-4)]">
              {children}
            </main>
          </div>
        </div>
      </GlossaryLabAtmosphere>
    </ClippedStage>
  );
}

export function GlossaryLiveGroup() {
  const [theme, setTheme] = useState<GlossaryLabTheme>("v1");
  const [world, setWorld] = useState<string>("Business & Finance");
  if (!IB || !L1 || !L3 || !RN || !RN1) return <NotRendered reason="The Investment Banking and Registered Nurse glossaries must both resolve." see="src/components/glossary/data.ts" />;
  const choice = L1.questions.find((q) => q.kind === "choice" && q.type === "Definition")!;
  const match = L1.questions.find((q) => q.kind === "matchUp")!;
  const sort = L1.questions.find((q) => q.kind === "sortBuckets")!;
  const typeTerm = RN1.questions.find((q) => q.kind === "typeTerm")!;
  const fill = RN1.questions.find((q) => q.kind === "choice" && q.type === "Fill in the Blank")!;
  const misuse = RN1.questions.find((q) => q.kind === "choice" && q.type === "Catch the Misuse")!;
  const chain = L3.questions.find((q) => q.kind === "chain") ?? L3.questions[0];
  const multi = L3.questions.find((q) => q.kind === "multiSelect") ?? L3.questions[1];

  return (
    <>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-3)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <p className="text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>Theme (every specimen below):</p>
        <ThemeSwitcher value={theme} onChange={setTheme} />
        <p className="text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>World:</p>
        <select aria-label="World design system" value={world} onChange={(e) => setWorld(e.target.value)} className="rounded-full border px-[10px] py-[5px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
          {WORLD_SYSTEMS.map((w) => <option key={w.world} value={w.world}>{w.world}</option>)}
        </select>
      </div>

      <Specimen name="World design systems" scale="core" file="src/components/glossary/industries.ts" purpose="Glossaries are industries grouped under the career worlds. The world owns the design system (its accent, its Career Poster Card face for display type, a readable body face); every industry under it shares that system and brings its own levels. Every world has a row, so a new industry only needs a blueprint." when="The Drift shell wears the world's faces; Signal keeps its pixel faces and takes the accent. Pick a world above to see every specimen below in it.">
        <StateGrid min={250}>
          {WORLD_SYSTEMS.map((w) => {
            const here = glossaryIndustries().filter((g) => g.world === w.world);
            return (
              <StateCell key={w.world} label={w.world} surface="game" minH={200} note={here.length ? `Industries: ${here.map((g) => `${g.industryTitle} (/play/glossary/${g.industrySlug})`).join(", ")}` : "No industry glossary yet; the system is ready for one."}>
                <div className="flex h-full flex-col justify-between gap-[10px] rounded-[var(--radius-md)] border p-[14px]" style={{ ...worldTheme(w.world), borderColor: "color-mix(in srgb, var(--glossary-accent) 45%, var(--glass-border))", background: "radial-gradient(120% 90% at 50% -20%, color-mix(in srgb, var(--glossary-accent) 22%, transparent), transparent 60%), var(--card)" }}>
                  <div>
                    <p className="text-[10.5px] font-extrabold uppercase tracking-[.14em]" style={{ color: "var(--glossary-accent)", fontFamily: "var(--glossary-body)" }}>Level 01 · {here[0]?.lessons[0]?.title ?? "First level"}</p>
                    <p className="mt-[4px] text-[26px] leading-[1.1]" style={{ fontFamily: "var(--glossary-display)", fontWeight: w.displayWeight, color: "var(--foreground)" }}>{here[0]?.industryTitle ?? "Industry Terms"}</p>
                    <p className="mt-[6px] text-[13px] leading-[1.4]" style={{ fontFamily: "var(--glossary-body)", color: "var(--foreground)" }}>What does this word mean? Tap the answer that fits.</p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="inline-block h-[22px] w-[22px] rounded-full" style={{ background: "var(--glossary-accent)" }} aria-hidden />
                    <span className="rounded-full px-[12px] py-[5px] text-[12px] font-bold" style={{ background: "var(--glossary-accent)", color: "#05070f", fontFamily: "var(--glossary-body)" }}>Check Answers</span>
                    <span className="text-[11px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--glossary-body)" }}>{w.display.replace("var(--font-poster", "poster").replace(")", "")} / {w.body.replace(/'/g, "")}</span>
                  </div>
                </div>
              </StateCell>
            );
          })}
        </StateGrid>
      </Specimen>

      <Specimen name="DreamyFace" scale="core" file={FILE} purpose="The one Dreamy, in the 12 activity and outcome poses. Drift plays a four-frame atlas (blink, speak); Signal routes four reviewed pixel reactions and keeps its canonical cloud for the rest. Each pose knows which way it is drawn facing, so a slot can mirror him to face its content." when="Every screen that has content for him to speak to; one per screen.">
        <StateGrid min={150}>
          {POSES.map((pose) => (
            <StateCell key={pose} label={`${pose} (faces ${DREAMY_FACING[pose]})`} surface="game" minH={150}>
              <Stage theme={theme} world={world} screen="question" height={130}><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose={pose} size={84} /></span></div></Stage>
            </StateCell>
          ))}
          <StateCell label="talking" surface="game" minH={150} note="The mouth cycles while a feedback line types."><Stage theme={theme} world={world} height={130}><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose="correct" size={84} talking /></span></div></Stage></StateCell>
          <StateCell label="reward" surface="game" minH={150} note="Plus-shaped sparks rise once on mount; Signal adds its coins."><Reveal label="Play" height={130}><Stage theme={theme} world={world} height={130}><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose="correct" size={84} reward /></span></div></Stage></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RewardPluses" scale="core" file={FILE} purpose="The right-answer reward at the one Dreamy: eight plus-shaped sparks rising and fading (glowing amber in Drift, hard pixels on a stepped curve in Signal), plus Signal's coin fountain." when="Mounted behind Dreamy on every right answer, matched pair and cleared case step; on the Complete screen's hero.">
        <StateGrid min={200}>
          <StateCell label="Once, on mount" surface="game" minH={160}><Reveal label="Play" height={150}><Stage theme={theme} world={world} height={150}><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><RewardPluses /><DreamyFace pose="correct" size={84} /></span></div></Stage></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SpeechBubble" scale="core" file={FILE} purpose="Dreamy's line: the question, the Power Play instruction, with an optional aside under it (a step line, a hint, the spelling note)." when="Beside Dreamy on every question and on the Power Play head.">
        <StateGrid min={260}>
          <StateCell label="Neutral" surface="game" minH={130}><Stage theme={theme} world={world} height={120}><div className="glossary-question-guide"><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose="choose" size={84} /></span></div><SpeechBubble>What is a company?</SpeechBubble></div></Stage></StateCell>
          <StateCell label="With aside" surface="game" minH={130}><Stage theme={theme} world={world} height={120}><div className="glossary-question-guide"><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose="recall" size={84} /></span></div><SpeechBubble aside={<div className="glossary-qa-hint-line" data-tone="go"><span>Spelling counts.</span></div>}>Drag a word into each blank, or type it.</SpeechBubble></div></Stage></StateCell>
          <StateCell label="Wrong tone" surface="game" minH={130}><Stage theme={theme} world={world} height={120}><div className="glossary-question-guide"><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose="retry" size={84} /></span></div><SpeechBubble tone="wrong" aside={<div className="glossary-qa-hint-line" data-tone="wrong"><span>Swap the words marked red.</span></div>}>Not quite. A few words are in the wrong spot.</SpeechBubble></div></Stage></StateCell>
          <StateCell label="Correct tone" surface="game" minH={130}><Stage theme={theme} world={world} height={120}><div className="glossary-question-guide"><div className="glossary-question-dreamy"><span className="glossary-dreamy-stage"><DreamyFace pose="correct" size={84} /></span></div><SpeechBubble tone="correct">You used every word.</SpeechBubble></div></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SketchFace (teach card front)" scale="core" file={FILE} purpose="The flashcard's front. Level 1 of an authored career shows the term's picture; every other lesson, and every generated career, is words only: term, definition and the worked line, centred, no picture and no icon (15 Oct 2026)." when="Each of the five unlock screens.">
        <StateGrid min={300}>
          <StateCell label="Words only (Level 3, formula)" surface="game" minH={300}><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={L3.terms[0].term} definition={L3.terms[0].definition} icon={L3.terms[0].icon} formula={L3.terms[0].formula} words /></div></div></Stage></StateCell>
          <StateCell label="Words only (generated, Registered Nurse)" surface="game" minH={300}><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={RN1.terms[3].term} definition={RN1.terms[3].definition} icon={RN1.terms[3].icon} formula={RN1.terms[3].formula} words /></div></div></Stage></StateCell>
          <StateCell label="Picture (Level 1 only)" surface="game" minH={300}><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={L1.terms[0].term} definition={L1.terms[0].definition} icon={L1.terms[0].icon} artSrc="/images/glossary/themes-oct08/drift/company.webp" /></div></div></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="UnlockScreen" scale="core" file={FILE} purpose="One term's unlock moment: the card (Dreamy leaning over its corner, facing into it) and the Unlock button." when="Five times per lesson, before practice.">
        <StateGrid min={320}>
          <StateCell label="Authored Level 1" surface="game" minH={380}><Stage theme={theme} world={world} screen="unlock" height={370}><UnlockScreen lesson={L1} index={0} onUnlock={noop} variant="lab" atmosphere={theme} /></Stage></StateCell>
          <StateCell label="Authored Level 3 (words)" surface="game" minH={380}><Stage theme={theme} world={world} screen="unlock" height={370}><UnlockScreen lesson={L3} index={3} onUnlock={noop} variant="lab" atmosphere={theme} /></Stage></StateCell>
          <StateCell label="Generated (Registered Nurse)" surface="game" minH={380}><Stage theme={theme} world={world} screen="unlock" height={370}><UnlockScreen lesson={RN1} index={1} onUnlock={noop} variant="lab" atmosphere={theme} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="UnlockCompleteScreen" scale="core" file={FILE} purpose="'5 terms unlocked.' The relics (pictures on Level 1, the word on every other level), the one Dreamy, Start practice." when="After the fifth unlock.">
        <StateGrid min={320}>
          <StateCell label="Authored Level 1" minH={380} note="Plays a sweep and a burst on mount, so it is behind Play."><Reveal label="Play" height={370}><Stage theme={theme} world={world} screen="unlockComplete" height={370}><UnlockCompleteScreen lesson={L1} onStartPractice={noop} variant="lab" /></Stage></Reveal></StateCell>
          <StateCell label="Generated (Registered Nurse)" minH={380}><Reveal label="Play" height={370}><Stage theme={theme} world={world} screen="unlockComplete" height={370}><UnlockCompleteScreen lesson={RN1} onStartPractice={noop} variant="lab" /></Stage></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="QuestionScreen" scale="core" file={FILE} purpose="Every question type inside the one frame: Dreamy asks (facing the bubble), the scene if any, the answers. answerState drives his reaction; the card below the screen is the FeedbackPanel." when="Seven main questions and any review questions per lesson.">
        <StateGrid min={340}>
          <StateCell label="Definition, idle" surface="game" minH={360}><Stage theme={theme} world={world} height={350}><QuestionScreen question={choice} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Definition, right (Dreamy reacts)" surface="game" minH={360}><Stage theme={theme} world={world} height={350}><QuestionScreen question={choice} onAnswer={noop} onReset={noop} answerState="correct" /></Stage></StateCell>
          <StateCell label="Definition, wrong" surface="game" minH={360}><Stage theme={theme} world={world} height={350}><QuestionScreen question={choice} onAnswer={noop} onReset={noop} answerState="wrong" /></Stage></StateCell>
          <StateCell label="Match It Up (live)" surface="game" minH={400} note="Pair state is internal; drag or tap for real."><Stage theme={theme} world={world} height={390}><QuestionScreen question={match} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Sort the Buckets (live)" surface="game" minH={400}><Stage theme={theme} world={world} height={390}><QuestionScreen question={sort} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Type the Term (generated)" surface="game" minH={360}><Stage theme={theme} world={world} height={350}><QuestionScreen question={typeTerm} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Fill in the Blank (generated)" surface="game" minH={360}><Stage theme={theme} world={world} height={350}><QuestionScreen question={fill} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Catch the Misuse (generated)" surface="game" minH={360}><Stage theme={theme} world={world} height={350}><QuestionScreen question={misuse} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Case, step by step (Level 3)" surface="game" minH={400}><Stage theme={theme} world={world} height={390}><QuestionScreen question={chain} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          <StateCell label="Select all (Level 3)" surface="game" minH={400}><Stage theme={theme} world={world} height={390}><QuestionScreen question={multi} onAnswer={noop} onReset={noop} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FeedbackPanel" scale="core" file={FILE} purpose="The result card under a question: the verdict, the why-line typing in, Continue or 'Change your answer'. No Dreamy of its own: the question's Dreamy reacts and speaks the line (15 Oct 2026, one Dreamy per screen)." when="After every graded answer.">
        <StateGrid min={320}>
          <StateCell label="Right" surface="game" minH={160}><Stage theme={theme} world={world} height={150}><FeedbackPanel correct text={choice.feedbackCorrect} isLast={false} onNext={noop} inline /></Stage></StateCell>
          <StateCell label="Wrong" surface="game" minH={160}><Stage theme={theme} world={world} height={150}><FeedbackPanel correct={false} text={choice.feedbackWrong} isLast={false} onNext={noop} inline /></Stage></StateCell>
          <StateCell label="Right, last question" surface="game" minH={160}><Stage theme={theme} world={world} height={150}><FeedbackPanel correct text={choice.feedbackCorrect} isLast onNext={noop} inline /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="StreakBanner" scale="core" file={FILE} purpose="'5 in a row!' over the question, no Dreamy of its own." when="Every fifth right answer in a row.">
        <StateGrid min={280}>
          <StateCell label="5 in a row" minH={140} note="Chimes on mount, so it is behind Play."><Reveal label="Play" height={130}><Stage theme={theme} world={world} height={130}><StreakBanner streak={5} onDismiss={noop} /></Stage></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PowerPlayIntroScreen" scale="core" file={FILE} purpose="The finale's door: Dreamy, the level's own challenge line, one button." when="After the last question.">
        <StateGrid min={360}>
          <StateCell label="Level 1" surface="game" minH={520} note="On the Play tab FitToScreen scales this to the room; the lab shows it at full size."><Stage theme={theme} world={world} screen="powerPlayIntro" height={510}><PowerPlayIntroScreen onStart={noop} /></Stage></StateCell>
          <StateCell label="Level 3 (own line)" surface="game" minH={520}><Stage theme={theme} world={world} screen="powerPlayIntro" height={510}><PowerPlayIntroScreen onStart={noop} line={L3.powerPlay.intro} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PowerPlayScreen" scale="core" file={FILE} purpose="One Power Play, one paragraph, all five words (Joshua's rule). Dreamy speaks the instruction; word tiles leave the bank as they land in dashed slots; the dragged tile rides with the pointer; one centred button." when="The finale of every level, authored or generated.">
        <StateGrid min={360}>
          <StateCell label="Level 1 (live)" surface="game" minH={560} note="Fill state is internal; drag, tap or type for real."><Stage theme={theme} world={world} screen="powerPlay" height={550}><PowerPlayScreen lesson={L1} onComplete={noop} /></Stage></StateCell>
          <StateCell label="Level 3 (live)" surface="game" minH={560}><Stage theme={theme} world={world} screen="powerPlay" height={550}><PowerPlayScreen lesson={L3} onComplete={noop} /></Stage></StateCell>
          <StateCell label="Generated (Registered Nurse)" surface="game" minH={560}><Stage theme={theme} world={world} screen="powerPlay" height={550}><PowerPlayScreen lesson={RN1} onComplete={noop} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ValuationTicker" scale="core" file={FILE} purpose="A continuous story's company value counting up to the level's milestone. A scenario thread or practice world has no company value, so it shows the milestone in words and Level n of N instead (the Master Scaling Plan SOP, 16 Oct 2026)." when="The Complete screen (reached) and the level welcome (goal).">
        <StateGrid min={280}>
          <StateCell label="Reached (counts up)" surface="game" minH={180}><Stage theme={theme} world={world} screen="complete" height={170}><ValuationTicker from={0} to={L1.companyValue} milestone={L1.milestone} mode="reached" company={L1.exampleCompany} /></Stage></StateCell>
          <StateCell label="Goal" surface="game" minH={180}><Stage theme={theme} world={world} screen="intro" height={170}><ValuationTicker from={L3.previousCompanyValue ?? 0} to={L3.companyValue} milestone={L3.milestone} mode="goal" company={L3.exampleCompany} /></Stage></StateCell>
          <StateCell label="Milestone progress (scenario thread, Riverside Clinic)" surface="game" minH={180}><Stage theme={theme} world={world} screen="complete" height={170}><ValuationTicker from={0} to={RN1.companyValue} milestone={RN1.milestone} mode="reached" company={RN1.exampleCompany} progress={{ level: 1, total: 6 }} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MasteryLoadingScreen" scale="core" file={FILE} purpose="The built loading state: Dreamy and one fact while mastery is counted." when="Between the Power Play and the results.">
        <StateGrid min={280}>
          <StateCell label="Built loading" surface="game" minH={220}><Stage theme={theme} world={world} screen="masteryLoading" height={210}><MasteryLoadingScreen fact={L1.facts[0] ?? null} /></Stage></StateCell>
          <StateCell label="Generated fact" surface="game" minH={220}><Stage theme={theme} world={world} screen="masteryLoading" height={210}><MasteryLoadingScreen fact={RN1.facts[0] ?? null} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CompleteScreen" scale="core" file={FILE} purpose="The results as a payoff: the simulations' ticker-tape storm (Drift) or a pixel coin rain (Signal), Dreamy with the reward, the level kicker, the value counting up, the three tiles and the buttons arriving in order." when="The end of every level.">
        <StateGrid min={320}>
          <StateCell label="Authored, next level available" minH={460} note="Storm, sweep and burst on mount, so it is behind Play."><Reveal label="Play" height={450}><Stage theme={theme} world={world} screen="complete" height={450}><CompleteScreen lesson={L1} masteredCount={5} onContinue={noop} nextLesson={IB.lessons[1]} onNextLesson={noop} onReplay={noop} onLevels={noop} /></Stage></Reveal></StateCell>
          <StateCell label="Generated, last level" minH={460}><Reveal label="Play" height={450}><Stage theme={theme} world={world} screen="complete" height={450}><CompleteScreen lesson={RN1} masteredCount={4} onContinue={noop} onReplay={noop} onLevels={noop} /></Stage></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="IntroScreen (level welcome)" scale="core" file={FILE} purpose="'Meet the company' for Level 1, the level's headline and goal after that. The sneaker shop is Investment Banking's own illustration; a career without welcome art gets Dreamy alone." when="The first screen of every level.">
        <StateGrid min={340}>
          <StateCell label="Authored Level 1" surface="game" minH={340}><Stage theme={theme} world={world} screen="intro" height={330}><IntroScreen lesson={L1} onNext={noop} variant="lab" atmosphere={theme} subject="finance" /></Stage></StateCell>
          <StateCell label="Authored Level 3" surface="game" minH={340}><Stage theme={theme} world={world} screen="intro" height={330}><IntroScreen lesson={L3} onNext={noop} variant="lab" atmosphere={theme} subject="finance" /></Stage></StateCell>
          <StateCell label="Generated (no welcome art)" surface="game" minH={340}><Stage theme={theme} world={world} screen="intro" height={330}><IntroScreen lesson={RN1} onNext={noop} variant="lab" atmosphere={theme} subject={RN.subject} hero={false} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TopBar" scale="core" file={FILE} purpose="Back, Levels, the theme switch, Restart, the DEMO-ONLY Skip, sound, the hamburger. In Signal the progress HUD rides in this bar." when="Every screen.">
        <StateGrid min={420}>
          <StateCell label="In play, with Skip (demo)" surface="game" minH={100} note="Skip and the theme switch are the demo's chrome; Skip must not ship to students."><Stage theme={theme} world={world} height={90}><TopBar onBack={noop} onOpenLevels={noop} atmosphere={theme} onAtmosphereChange={noop} onRestart={noop} onSkip={noop} /></Stage></StateCell>
          <StateCell label="Intro (no theme switch, no Skip)" surface="game" minH={100}><Stage theme={theme} world={world} screen="intro" height={90}><TopBar onBack={noop} onOpenLevels={noop} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Generated career, whole lesson" scale="core" file="src/components/glossary/generate.ts" purpose="What the generator makes from five terms: the seven-question loop in Level 1's order, one review question per term, the Power Play paragraph from the five examples. Shown as data so the recipe is checkable without playing." when="Every level of every career after Investment Banking.">
        <StateGrid min={320}>
          <StateCell label="Registered Nurse, Level 1" minH={200}>
            <ol className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--foreground)" }}>
              {RN1.questions.map((q) => <li key={q.id}><b>{q.playOrder}. {q.kind === "choice" || q.kind === "typeTerm" || q.kind === "matchUp" || q.kind === "sortBuckets" ? q.type : q.kind}</b>{"termId" in q && q.termId ? ` (${q.termId})` : ""}: {q.prompt || "(no prompt)"}</li>)}
              <li><b>Review:</b> {RN1.reviewQuestions.length} Reverse Recall, one per term</li>
              <li><b>Power Play:</b> {RN1.powerPlay.paragraph}</li>
            </ol>
          </StateCell>
          <StateCell label="Not rendered here" minH={120}><NotRendered reason="A whole level is a route: /play/glossary/registered-nurse (Skip walks it in 14 presses)." see="src/components/glossary/blueprints/registered-nurse.ts" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
