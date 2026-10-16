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

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { glossaryFor, type GlossaryQuestion } from "@/components/glossary/data";
import { DREAMY_FACING } from "@/components/glossary/dreamyReactions";
import { WORLD_SYSTEMS, worldTheme } from "@/components/glossary/industries";
import { GLOSSARY_HUB_RELEASED, glossaryIndustries } from "@/components/glossary/data";
import { validateBlueprint, type GlossaryBlueprint } from "@/components/glossary/generate";
import { NURSING_GLOSSARY } from "@/components/glossary/blueprints/health";
import { CULINARY_GLOSSARY } from "@/components/glossary/blueprints/culinary";
import { GLOSSARY_GAMES } from "@/components/play/games";
import { HeroShelfCard } from "@/components/play/PlayHub";
import { LEVEL_DREAMY_BY_STATE } from "@/components/glossary/levelPlates";
import {
  CompleteScreen,
  DreamyFace,
  FeedbackPanel,
  GlossaryLabAtmosphere,
  IntroScreen,
  LabLevelMap,
  MasteryHud,
  MasteryLoadingScreen,
  PowerPlayIntroScreen,
  PowerPlayScreen,
  QuestionScreen,
  RewardPluses,
  SceneCardView,
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
const SW = glossaryFor("software");
const SW2 = SW?.lessons[1];
const SW3 = SW?.lessons[2];
const SW4 = SW?.lessons[3];
const RN4 = RN?.lessons[3];
const RN5 = RN?.lessons[4];
const IB2 = IB?.lessons[1];
const IB4 = IB?.lessons[3];
const AV1 = glossaryFor("aviation")?.lessons[0];
const CU3 = glossaryFor("culinary")?.lessons[2];

/** A deliberately broken blueprint, so the lab shows the developer-facing
 *  error state: what validateBlueprint reports before a bad file can build. */
function brokenBlueprint(): GlossaryBlueprint {
  const bad = structuredClone(NURSING_GLOSSARY) as GlossaryBlueprint;
  bad.industry = { ...bad.industry, slug: "Bad Slug", world: "Nowhere" };
  bad.levels[0].terms![0].definition = "A patient is a patient.";
  bad.levels[1].terms![0].moments = ["Ana works a long shift today and tomorrow and the next day too ok.", "A second moment.", "A second moment."];
  bad.levels[1].terms![1].cue = "one two three four five six seven eight";
  bad.levels[0].terms![1].example = "No anchor named here with vital signs.";
  bad.levels[2].terms![0].confusion = "Nope";
  bad.levels[3].terms![0].example = "Code Blue costs $500.";
  return bad;
}
/** A second broken blueprint for the 17 Oct 2026 rules: reading level,
 *  feedback length, the Power Play's size and order, required levels. */
function brokenReadingBlueprint(): GlossaryBlueprint {
  const bad = structuredClone(CULINARY_GLOSSARY) as GlossaryBlueprint;
  bad.levels[0].terms![0].example = "Dice the onion into small even cubes so that every single piece cooks at the very same speed.";
  bad.levels[0].powerPlay = { intro: "Prep.", paragraph: "{1} the onion into small even cubes for the soup. {2} the garlic until it is almost a paste, then {3} the carrot into thin sticks for the salad. {4} the parsley rough and toss it in at the very end. {5} the tomato into flat rounds for the plates." };
  bad.levels[1].cases![0].feedbackCorrect = "High heat browns the outside of the steak fast. Low heat lets the sauce cook gently for an hour. Both matter.";
  const l4 = bad.levels[3];
  bad.levels[3] = { number: 4, title: l4.title, tier: l4.tier, goal: l4.goal, milestone: l4.milestone, nextMilestone: l4.nextMilestone, companyValue: l4.companyValue, nextCompanyValue: l4.nextCompanyValue, words: (l4.terms ?? []).map((t) => t.term) };
  return bad;
}
/** A synthetic term at every limit, for the layout edge cases. */
const EDGE_TERM = { term: "Interprofessional Care", definition: "Doctors, nurses, therapists and aides planning one patient's care together, each bringing their own training.", cue: "Many roles, one plan for the patient" };
const ACRONYM_TERM = { term: "FIFO", definition: "Using the oldest stock first so nothing sits long enough to spoil.", cue: "Oldest stock gets used first" };
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
          <StateCell label="Words only (Level 3, a term with a worked line)" surface="game" minH={300} note="The front is the word and its meaning only; the worked line (500 pairs × $200 = $100,000) shows on the back with the example (17 Oct 2026)."><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={L3.terms[0].term} definition={L3.terms[0].definition} icon={L3.terms[0].icon} words /></div></div></Stage></StateCell>
          <StateCell label="Words only (generated, Registered Nurse)" surface="game" minH={300}><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={RN1.terms[3].term} definition={RN1.terms[3].definition} icon={RN1.terms[3].icon} formula={RN1.terms[3].formula} words /></div></div></Stage></StateCell>
          <StateCell label="Picture (Level 1 only)" surface="game" minH={300}><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={L1.terms[0].term} definition={L1.terms[0].definition} icon={L1.terms[0].icon} artSrc="/images/glossary/themes-oct08/drift/company.webp" /></div></div></Stage></StateCell>
          <StateCell label="Edge: 22-character term (the limit)" surface="game" minH={300} note="--term-chars shrinks the face; the underline is exactly the word's width in both themes (16 Oct)."><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={EDGE_TERM.term} definition={EDGE_TERM.definition} icon="users" words concept /></div></div></Stage></StateCell>
          <StateCell label="Edge: acronym" surface="game" minH={300} note="A short word: the underline is short too, and no letter or picture stands in."><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term={ACRONYM_TERM.term} definition={ACRONYM_TERM.definition} icon="layers" words concept /></div></div></Stage></StateCell>
          <StateCell label="Edge: definition near the 110-character limit" surface="game" minH={300}><Stage theme={theme} world={world} screen="unlock" height={290}><div className="glossary-flashbook-shell relative w-full max-w-[440px]"><div className="relative h-[270px] w-full"><SketchFace term="Handoff" definition={EDGE_TERM.definition.slice(0, 120)} icon="arrow-left-right" words concept /></div></div></Stage></StateCell>
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
          {SW2 ? <StateCell label="Apply: Dreamy asks a moment, which word (generated L2)" surface="game" minH={400} note="Dreamy speaks the situation, then one short question, over single-word tiles, like Finance (17 Oct 2026)."><Stage theme={theme} world={world} height={390}><QuestionScreen question={SW2.questions[0]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {SW3 ? <StateCell label="Analyze: compare card (generated L3)" surface="game" minH={440}><Stage theme={theme} world={world} height={430}><QuestionScreen question={SW3.questions[0]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {SW3 ? <StateCell label="Analyze: compare card, right" surface="game" minH={440}><Stage theme={theme} world={world} height={430}><QuestionScreen question={SW3.questions[0]} onAnswer={noop} onReset={noop} answerState="correct" /></Stage></StateCell> : null}
          {SW3 ? <StateCell label="Analyze: select all about one word (generated L3)" surface="game" minH={440}><Stage theme={theme} world={world} height={430}><QuestionScreen question={SW3.questions.find((q) => q.kind === "multiSelect") ?? SW3.questions[3]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {SW4 ? <StateCell label="Decide: which option fits (generated L4)" surface="game" minH={400}><Stage theme={theme} world={world} height={390}><QuestionScreen question={SW4.questions[0]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {SW4 ? <StateCell label="Decide: Type the Term from a moment (generated L4)" surface="game" minH={400}><Stage theme={theme} world={world} height={390}><QuestionScreen question={SW4.questions.find((q) => q.kind === "typeTerm") ?? SW4.questions[6]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {SW3?.questions.some((q) => q.kind === "chain") ? <StateCell label="Authored case, step 1 (generated L3)" surface="game" minH={440} note="A level's authored case: a scene and two to four steps, answered one at a time, like Finance Level 3's &quot;Which helps Dream Sneakers keep more money?&quot; (17 Oct 2026)."><Stage theme={theme} world={world} height={430}><QuestionScreen question={SW3!.questions.find((q) => q.kind === "chain")!} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {SW3?.questions.some((q) => q.kind === "sortBuckets") ? <StateCell label="Authored concept sort (generated L3)" surface="game" minH={480} note="Concrete things into concept buckets, never cues into words: Finance's &quot;Money in / Money out&quot; made scalable (17 Oct 2026)."><Stage theme={theme} world={world} height={470}><QuestionScreen question={SW3!.questions.find((q) => q.kind === "sortBuckets")!} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {RN4 ? <StateCell label="Edge: two-word options fall to a list" surface="game" minH={440} note="isWordSet: single words of 14 characters or fewer tile as a 2x2 grid; anything longer, or with a space (Code Blue, Rapid Response), lists in one column."><Stage theme={theme} world={world} height={430}><QuestionScreen question={RN4.questions[0]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          <StateCell label="Edge: Catch the Misuse, long pairs" surface="game" minH={400} note="Word = cue pairs at the 34-character cue limit; the pair wraps inside its tile."><Stage theme={theme} world={world} height={390}><QuestionScreen question={{ kind: "choice", type: "Catch the Misuse", id: "LAB-EDGE-1", termId: EDGE_TERM.term, playOrder: 1, label: "Quick check", prompt: "Which one is wrong?", options: [`${EDGE_TERM.term} = ${ACRONYM_TERM.cue}`, `${ACRONYM_TERM.term} = ${ACRONYM_TERM.cue}`, "Handoff = Passing care to the next nurse", "Triage = Who is seen first"], correctIndex: 0, feedbackCorrect: "Right.", feedbackWrong: "Not quite." }} onAnswer={noop} onReset={noop} /></Stage></StateCell>
          {(() => {
            const pick = <T,>(list: T[] | undefined, test: (q: T) => boolean) => list?.find(test);
            const profit = pick(L1.questions, (q) => q.kind === "profitBuilder");
            const profitVisual = pick(L1.questions, (q) => q.kind === "choice" && Boolean(q.visual));
            const shares = pick(IB2?.questions, (q) => q.kind === "choice" && q.scene?.kind === "shares");
            const split = pick(IB4?.questions, (q) => q.kind === "choice" && q.scene?.kind === "split");
            const caseCompare = pick(IB4?.questions, (q) => q.kind === "chain" && q.scene?.kind === "compare");
            const threeBuckets = pick(SW3?.questions, (q) => q.kind === "sortBuckets" && q.buckets.length === 3);
            const useItWhen = pick(SW4?.questions, (q) => q.kind === "matchUp");
            const derivedSelect = pick(CU3?.questions, (q) => q.kind === "multiSelect");
            const cells: [string, GlossaryQuestion | undefined, number, string][] = [
              ["Finance: Profit Builder (Level 1)", profit, 470, "Two typed numbers over a units x price card. Finance only: generated levels never write a calculation."],
              ["Finance: profit card, which word (Level 1)", profitVisual, 420, "A sells / costs / left card above a 2x2 of words."],
              ["Finance: shares card (Level 2)", shares, 470, "Scene cards carry the numbers; the art never does."],
              ["Finance: split card (Level 4)", split, 440, ""],
              ["Finance: case over a compare card (Level 4)", caseCompare, 470, "Two-option steps; the compare card stays while the steps change."],
              ["Generated: concept sort, three buckets", threeBuckets, 500, "Software Level 3. Concrete items into concept buckets; three buckets lay out as a row on desktop and stack on phones."],
              ["Generated: match, Use it when (decide levels)", useItWhen, 470, "Software Level 4. The right column is the cue, read as when to use the word."],
              ["Generated: Select All built from moments", derivedSelect, 470, "Culinary Level 3. A level without an authored Select All gets two of the word's moments against two others."],
            ];
            return cells.map(([label, question, height, note]) => question ? <StateCell key={label} label={label} surface="game" minH={height + 10} note={note || undefined}><Stage theme={theme} world={world} height={height}><QuestionScreen question={question} onAnswer={noop} onReset={noop} /></Stage></StateCell> : <StateCell key={label} label={label} minH={80}><NotRendered reason="The fixture lesson no longer has this screen; pick another level in GlossaryLive.tsx." see="src/components/component-lab/sections/game/GlossaryLive.tsx" /></StateCell>);
          })()}
        </StateGrid>
      </Specimen>

      <Specimen name="Review questions (remediation)" scale="core" file={FILE} purpose="One Reverse Recall per word: the definition read aloud, then which word. Drawn after the main loop only for words still short of mastery (two credits), and never used in the main loop, so the student always meets a new screen." when="After the last main question, before the Power Play, if any word is short.">
        <StateGrid min={340}>
          {RN1.reviewQuestions[0] ? <StateCell label="Generated (Registered Nurse, Level 1)" surface="game" minH={420}><Stage theme={theme} world={world} height={410}><QuestionScreen question={RN1.reviewQuestions[0]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
          {IB2?.reviewQuestions[0] ? <StateCell label="Authored (Finance, Level 2)" surface="game" minH={420}><Stage theme={theme} world={world} height={410}><QuestionScreen question={IB2.reviewQuestions[0]} onAnswer={noop} onReset={noop} /></Stage></StateCell> : null}
        </StateGrid>
      </Specimen>

      <Specimen name="FeedbackPanel" scale="core" file={FILE} purpose="The result card under a question: the verdict, the why-line typing in, Continue or 'Change your answer'. No Dreamy of its own: the question's Dreamy reacts and speaks the line (15 Oct 2026, one Dreamy per screen)." when="After every graded answer.">
        <StateGrid min={320}>
          <StateCell label="Right" surface="game" minH={160}><Stage theme={theme} world={world} height={150}><FeedbackPanel correct text={choice.feedbackCorrect} isLast={false} onNext={noop} inline /></Stage></StateCell>
          <StateCell label="Wrong" surface="game" minH={160}><Stage theme={theme} world={world} height={150}><FeedbackPanel correct={false} text={choice.feedbackWrong} isLast={false} onNext={noop} inline /></Stage></StateCell>
          <StateCell label="Right, last question" surface="game" minH={160}><Stage theme={theme} world={world} height={150}><FeedbackPanel correct text={choice.feedbackCorrect} isLast onNext={noop} inline /></Stage></StateCell>
          <StateCell label="Wrong, names the confusion (generated)" surface="game" minH={160} note="The generator quotes the cue of the word it was mixed up with: the SOP's &quot;say exactly what was wrong&quot;."><Stage theme={theme} world={world} height={150}><FeedbackPanel correct={false} text={SW3?.questions.find((q) => q.kind === "choice" && q.type === "Catch the Misuse")?.feedbackWrong ?? ""} isLast={false} onNext={noop} inline /></Stage></StateCell>
          <StateCell label="Long line (edge)" surface="game" minH={200} note="Two sentences at the definition and example limits; the panel grows, nothing clips."><Stage theme={theme} world={world} height={190}><FeedbackPanel correct={false} text={`${EDGE_TERM.definition} At Riverside Clinic, interprofessional care means the whole team meets before the shift so no patient falls between two roles.`} isLast={false} onNext={noop} inline /></Stage></StateCell>
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
          {AV1 ? <StateCell label="Generated Level 1: five short lines" surface="game" minH={560} note="Level 1 caps: 200 characters, five sentences, one blank each. The word bank is shuffled so it never runs in the blanks' order (17 Oct 2026)."><Stage theme={theme} world={world} screen="powerPlay" height={550}><PowerPlayScreen lesson={AV1} onComplete={noop} /></Stage></StateCell> : null}
          {RN5 ? <StateCell label="Edge: the longest generated paragraph (Level 5)" surface="game" minH={640} note="Levels 5 and up hold 330 characters and six sentences; this one is the longest the QA script reports."><Stage theme={theme} world={world} screen="powerPlay" height={630}><PowerPlayScreen lesson={RN5} onComplete={noop} /></Stage></StateCell> : null}
        </StateGrid>
      </Specimen>

      <Specimen name="ValuationTicker" scale="core" file={FILE} purpose="A continuous story's company value counting up to the level's milestone. A scenario thread or practice world has no company value, so it shows the milestone in words and Level n of N instead (the Master Scaling Plan SOP, 16 Oct 2026)." when="The Complete screen (reached) and the level welcome (goal).">
        <StateGrid min={280}>
          <StateCell label="Reached (counts up)" surface="game" minH={180}><Stage theme={theme} world={world} screen="complete" height={170}><ValuationTicker from={0} to={L1.companyValue} milestone={L1.milestone} mode="reached" company={L1.exampleCompany} /></Stage></StateCell>
          <StateCell label="Goal" surface="game" minH={180}><Stage theme={theme} world={world} screen="intro" height={170}><ValuationTicker from={L3.previousCompanyValue ?? 0} to={L3.companyValue} milestone={L3.milestone} mode="goal" company={L3.exampleCompany} /></Stage></StateCell>
          <StateCell label="Milestone progress (scenario thread, Riverside Clinic)" surface="game" minH={180}><Stage theme={theme} world={world} screen="complete" height={170}><ValuationTicker from={0} to={RN1.companyValue} milestone={RN1.milestone} mode="reached" company={RN1.exampleCompany} progress={{ level: 1, total: 6 }} /></Stage></StateCell>
          <StateCell label="Milestone progress, goal (intro)" surface="game" minH={180} note="Level 4 of 6 ahead: the track shows three done."><Stage theme={theme} world={world} screen="intro" height={170}><ValuationTicker from={0} to={RN4?.companyValue ?? 0} milestone={RN4?.milestone ?? ""} mode="goal" company={RN1.exampleCompany} progress={{ level: 4, total: 6 }} /></Stage></StateCell>
          <StateCell label="Last level reached (6 of 6)" surface="game" minH={180}><Stage theme={theme} world={world} screen="complete" height={170}><ValuationTicker from={0} to={1} milestone="Pick a specialty" mode="reached" company={RN1.exampleCompany} progress={{ level: 6, total: 6 }} /></Stage></StateCell>
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
          <StateCell label="Registered welcome art (stand-in asset)" surface="game" minH={340} note="welcomeArt.ts: WELCOME_ART[industry] or LEVEL_WELCOME_ART[lesson] per theme. Shown here with a finance asset standing in until Codex delivers."><Stage theme={theme} world={world} screen="intro" height={330}><IntroScreen lesson={RN1} onNext={noop} variant="lab" atmosphere={theme} subject={RN.subject} hero={false} heroSrc={theme === "v2" ? "/images/glossary/signal/building.webp" : "/images/glossary/themes-oct08/drift/company.webp"} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TopBar" scale="core" file={FILE} purpose="Back, Levels, the theme switch, Restart, the DEMO-ONLY Skip, sound, the hamburger. In Signal the progress HUD rides in this bar." when="Every screen.">
        <StateGrid min={420}>
          <StateCell label="In play, with Skip (demo)" surface="game" minH={100} note="Skip and the theme switch are the demo's chrome; Skip must not ship to students."><Stage theme={theme} world={world} height={90}><TopBar onBack={noop} onOpenLevels={noop} atmosphere={theme} onAtmosphereChange={noop} onRestart={noop} onSkip={noop} /></Stage></StateCell>
          <StateCell label="Intro (no theme switch, no Skip)" surface="game" minH={100}><Stage theme={theme} world={world} screen="intro" height={90}><TopBar onBack={noop} onOpenLevels={noop} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MasteryHud" scale="core" file={FILE} purpose="The progress strip over every question: the level's title and question count, the SparkBar, and mastery as a count with five anonymous segments sorted by progress. They fill left to right in whatever order words are mastered, so nothing hints at the next term, and no term needs a picture or a letter (16 Oct 2026, Chandu: remove the dots)." when="Every question and review question.">
        <StateGrid min={320}>
          <StateCell label="Fresh" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><MasteryHud title={RN1.title} current={1} total={7} percent={14} terms={RN1.terms} mastery={{}} /></Stage></StateCell>
          <StateCell label="Mid lesson: one mastered, two started" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><MasteryHud title={RN1.title} current={4} total={7} percent={57} terms={RN1.terms} mastery={{ [RN1.terms[2].id]: 2, [RN1.terms[0].id]: 1, [RN1.terms[4].id]: 1 }} /></Stage></StateCell>
          <StateCell label="All five mastered" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><MasteryHud title={RN1.title} current={7} total={7} percent={100} terms={RN1.terms} mastery={Object.fromEntries(RN1.terms.map((t) => [t.id, 2]))} /></Stage></StateCell>
          <StateCell label="Edge: 30-character level title" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><MasteryHud title="Public Offerings and Dilution" current={2} total={9} percent={22} terms={RN1.terms} mastery={{}} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SceneCardView" scale="core" file={FILE} purpose="The six shared scene cards a question can carry above its prompt: story (one line), compare (two words with their cues), figures, ledger, shares, split. One kit, so every industry composes the same shapes; in Signal they take the square frame (16 Oct 2026)." when="Level 2 and up: moments on story cards, compare cards; Finance's money diagrams.">
        <StateGrid min={300}>
          <StateCell label="Story" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><SceneCardView scene={{ kind: "story", text: SW2?.terms[0].example ?? "Dream Sneakers wants to open Store #2." }} /></Stage></StateCell>
          <StateCell label="Story with note" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><SceneCardView scene={{ kind: "story", text: "Maya invests $25,000.", note: "Dream Sneakers has 10 equal shares." }} /></Stage></StateCell>
          <StateCell label="Compare" surface="game" minH={200}><Stage theme={theme} world={world} height={190}><SceneCardView scene={{ kind: "compare", title: "Test or Debug?", options: [{ label: "Test", points: ["A check that it works"] }, { label: "Debug", points: ["Find and fix the cause"] }] }} /></Stage></StateCell>
          <StateCell label="Figures" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><SceneCardView scene={{ kind: "figures", items: [{ label: "Revenue", value: "$30,000" }, { label: "Costs", value: "$40,000" }], ops: ["−"] }} /></Stage></StateCell>
          <StateCell label="Ledger" surface="game" minH={200}><Stage theme={theme} world={world} height={190}><SceneCardView scene={{ kind: "ledger", title: "This month", rows: [{ label: "Sneaker sales", value: "$30,000", tone: "in" }, { label: "Rent", value: "$8,000", tone: "out" }, { label: "Wages", value: "$12,000", tone: "out" }] }} /></Stage></StateCell>
          <StateCell label="Shares, before and after the answer" surface="game" minH={200}><Stage theme={theme} world={world} height={190}><div className="flex flex-col gap-2"><SceneCardView scene={{ kind: "shares", total: 10, owned: 2, label: "10 equal shares", result: "2 of 10 shares = 20%" }} /><SceneCardView scene={{ kind: "shares", total: 10, owned: 2, label: "10 equal shares", result: "2 of 10 shares = 20%" }} answered /></div></Stage></StateCell>
          <StateCell label="Split" surface="game" minH={150}><Stage theme={theme} world={world} height={140}><SceneCardView scene={{ kind: "split", title: "Who owns Dream Sneakers", parts: [{ label: "You", pct: 80 }, { label: "Maya", pct: 20 }] }} /></Stage></StateCell>
          <StateCell label="Edge: story at 72 characters" surface="game" minH={150} note="The validator's moment limit; the line wraps to two at phone width and never clips."><Stage theme={theme} world={world} height={140}><SceneCardView scene={{ kind: "story", text: "Your notes appear on your laptop and your phone. Something stores them." }} /></Stage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LabLevelMap (Levels)" scale="core" file={FILE} purpose="The Levels overlay. Every level is a card with a plate: registered art when there is any, otherwise the level's first term icon on the world accent (no letters, no painted sky until plate art exists). The selected card opens in place with its goal, words, time, what it unlocks and the Play button; in Drift it shows one Dreamy expression for its state, the only Dreamy on that screen. A continuous story shows the value each level unlocks; every other mode shows the milestone. Progress comes from the browser's saved lessons, so finished levels show here only after you finish them." when="The Levels button in the top bar.">
        <StateGrid min={340}>
          <StateCell label="Continuous story (Finance): dollar unlocks" surface="game" minH={660} note="Six of twenty levels per page; the pager at the bottom turns pages."><div style={{ position: "relative", height: 650, transform: "translateZ(0)", overflow: "hidden" }}><Stage theme={theme} world={world} screen="question" height={650}><LabLevelMap career={IB} lesson={L1} atmosphere={theme} onClose={noop} onPlay={noop} /></Stage></div></StateCell>
          <StateCell label="Scenario thread (Nursing): milestones, playing Level 2" surface="game" minH={660} note="Level 2 open with the arrow expression; Level 1 ready with its icon; 3 to 6 locked."><div style={{ position: "relative", height: 650, transform: "translateZ(0)", overflow: "hidden" }}><Stage theme={theme} world={world} screen="question" height={650}><LabLevelMap career={RN} lesson={RN.lessons[1]} atmosphere={theme} onClose={noop} onPlay={noop} /></Stage></div></StateCell>
          {SW ? <StateCell label="Registered plate art (stand-in on Level 1)" surface="game" minH={660} note="A level's `plate` (or PLATES by tier) replaces the icon; shown with the Signal skyline standing in."><div style={{ position: "relative", height: 650, transform: "translateZ(0)", overflow: "hidden" }}><Stage theme={theme} world={world} screen="question" height={650}><LabLevelMap career={{ ...SW, levels: SW.levels.map((lv, i) => (i === 0 ? { ...lv, plate: "/images/glossary/signal/bg.webp" } : lv)) }} lesson={SW.lessons[0]} atmosphere={theme} onClose={noop} onPlay={noop} /></Stage></div></StateCell> : null}
        </StateGrid>
      </Specimen>

      <Specimen name="Dreamy expressions by level state" scale="core" file="src/components/glossary/levelPlates.ts" purpose="The four stills from Chandu's Dream Expressions V2 pack that the Drift Levels map uses on its open card, by state. Static on purpose; the rest of the pack waits for Codex to animate it (SOP 6.6)." when="The open card on the Drift Levels map.">
        <StateGrid min={160}>
          {(["open", "current", "complete", "locked"] as const).map((state) => (
            <StateCell key={state} label={state} surface="game" minH={170}><Stage theme="v1" world={world} height={160}><span className="glossary-map-plate is-icon is-dreamy" style={{ height: 140, width: 220, display: "grid", placeItems: "center" }}><Image src={LEVEL_DREAMY_BY_STATE[state]} alt="" width={256} height={256} unoptimized style={{ height: 120, width: "auto" }} /></span></Stage></StateCell>
          ))}
        </StateGrid>
      </Specimen>

      <Specimen name="Blueprint validation (the error state)" scale="core" file="src/components/glossary/generate.ts" purpose="A blueprint that breaks a rule never builds: validateBlueprint returns every problem it can see and buildGlossaryCareer throws with the list, so a bad file fails in development, not in a student's hands. This is the developer-facing error state of the whole system; students never see an unfinished glossary." when="At import time, for every registered blueprint, and in scripts/qa/glossary-blueprints.test.mjs.">
        <StateGrid min={320}>
          <StateCell label="A deliberately broken Nursing blueprint" minH={200} note="Bad slug, unknown world, a definition that says its word, an example without the anchor, a 14-word moment, two moments that are the same line, an 8-word cue, an unknown confusion, numbers without math.">
            <ol className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--foreground)" }}>
              {validateBlueprint(brokenBlueprint()).map((problem) => <li key={problem} className="rounded-[var(--radius-sm)] border px-[8px] py-[4px]" style={{ borderColor: "color-mix(in srgb, var(--danger, #e0483e) 45%, var(--glass-border))" }}>{problem}</li>)}
            </ol>
          </StateCell>
          <StateCell label="Broken against the reading and level rules" minH={200} note="17 Oct 2026: an 18-word sentence, a three-sentence feedback line over 90 characters, a Level 1 Power Play over 200 characters with two blanks in one sentence and its blanks in teaching order, and Level 4 left as roadmap words.">
            <ol className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--foreground)" }}>
              {validateBlueprint(brokenReadingBlueprint()).map((problem) => <li key={problem} className="rounded-[var(--radius-sm)] border px-[8px] py-[4px]" style={{ borderColor: "color-mix(in srgb, var(--danger, #e0483e) 45%, var(--glass-border))" }}>{problem}</li>)}
            </ol>
          </StateCell>
          <StateCell label="Unknown route" minH={120}><NotRendered reason="/play/glossary/<unknown> calls notFound(): the app's 404, nothing half-built." see="src/app/play/glossary/[career]/page.tsx" /></StateCell>
          <StateCell label="Hub release state" minH={160} note="GLOSSARY_HUB_RELEASED decides which cards the Play hub sells as playable; the rest read as Coming soon and play from /play-tools/glossary-qa.">
            <ul className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--foreground)" }}>
              {glossaryIndustries().map((g) => <li key={g.industrySlug}><b>{g.industryTitle}</b> ({g.industrySlug}): {GLOSSARY_HUB_RELEASED.includes(g.industrySlug) ? "released to the hub" : "QA only"} · {g.lessons.length} of {g.levels.length} levels playable · {g.mode.replace("_", " ")}</li>)}
            </ul>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Play hub glossary cards" scale="core" file="src/components/play/PlayHub.tsx" purpose="The Play tab's glossary row: one card per GLOSSARY_GAMES entry with its 1400 by 788 thumbnail. A released industry opens its game; the rest show the lock until their slug joins GLOSSARY_HUB_RELEASED (Prompt C in the SOP)." when="The Play hub, Glossary Games row.">
        <StateGrid min={240}>
          {GLOSSARY_GAMES.map((game) => {
            const g = glossaryFor(game.careerSlug);
            const released = Boolean(g && GLOSSARY_HUB_RELEASED.includes(g.industrySlug));
            return <StateCell key={game.careerSlug} label={`${game.title}: ${released ? "released" : "locked"}`} minH={300}><HeroShelfCard item={{ id: game.careerSlug, title: game.title, cover: game.cover, world: g?.world, sub: game.sub, href: `/play/glossary/${game.careerSlug}`, locked: !released }} onSelect={noop} /></StateCell>;
          })}
          <StateCell label="Active (expanded, 16:9)" minH={300} note="The shelf card is portrait at rest and 16:9 when active, so Dreamy and the centre card sit in the thumbnail's middle third."><HeroShelfCard item={{ id: GLOSSARY_GAMES[0].careerSlug, title: GLOSSARY_GAMES[0].title, cover: GLOSSARY_GAMES[0].cover, sub: GLOSSARY_GAMES[0].sub }} active onSelect={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Generated career, whole lesson" scale="core" file="src/components/glossary/generate.ts" purpose="What the generator makes from five terms: the seven to ten screen loop in Level 1's order (every line shown once), one review question per term, the Power Play paragraph, written per level with its blanks out of teaching order. Shown as data so the recipe is checkable without playing." when="Every level of every career after Investment Banking.">
        <StateGrid min={320}>
          <StateCell label="Registered Nurse, Level 1" minH={200}>
            <ol className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--foreground)" }}>
              {RN1.questions.map((q) => <li key={q.id}><b>{q.playOrder}. {q.kind === "choice" || q.kind === "typeTerm" || q.kind === "matchUp" || q.kind === "sortBuckets" ? q.type : q.kind}</b>{"termId" in q && q.termId ? ` (${q.termId})` : ""}: {q.prompt || "(no prompt)"}</li>)}
              <li><b>Review:</b> {RN1.reviewQuestions.length} Reverse Recall, one per term</li>
              <li><b>Power Play:</b> {RN1.powerPlay.paragraph}</li>
            </ol>
          </StateCell>
          {SW ? SW.lessons.slice(0, 4).map((lesson) => (
            <StateCell key={lesson.id} label={`Software, Level ${lesson.lessonNumber} (${["recognize", "apply", "analyze", "decide"][lesson.lessonNumber - 1]})`} minH={200} note="The recipe changes by level: the same five-term shape, a harder question set.">
              <ol className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--foreground)" }}>
                {lesson.questions.map((q) => <li key={q.id}><b>{q.playOrder}. {q.kind === "choice" || q.kind === "typeTerm" || q.kind === "matchUp" || q.kind === "sortBuckets" || q.kind === "multiSelect" ? q.type : q.kind}</b>{"termId" in q && q.termId ? ` (${q.termId})` : ""}: {q.prompt || "(no prompt)"}</li>)}
              </ol>
            </StateCell>
          )) : null}
          <StateCell label="Not rendered here" minH={120}><NotRendered reason="A whole level is a route: /play/glossary/nursing, or every level of every glossary from /play-tools/glossary-qa (Skip walks a level in about 14 presses)." see="src/components/glossary/blueprints/health.ts" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
