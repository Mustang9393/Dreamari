"use client";

// DEMO-ONLY: Component Lab, Game UI part. The WHOLE Glossary game, every
// screen and every question-type card, in all four background versions
// (the game's own `bgVersion`: v1 default, v2 CRT via `.play-crt`, v3 Dots
// via `.play-dots`, v4 Synth via `.play-synth`, applied as a class on the
// game root in GlossaryGameExperience.tsx). Answers a direct question, 27
// Sept 2026: "I don't think the glossary game UI is documented? Is it? All
// the versions/themes?" -- it wasn't, fully; this group is.
//
// Only `export` was added to TopBar, IntroScreen, LessonIntroScreen,
// UnlockScreen, UnlockCompleteScreen, QuestionScreen, TypeTermCard,
// MatchUpCard, SortBucketsCard, ProfitBuilderCard, DocumentOptionList,
// PowerPlayIntroScreen, PowerPlayScreen (plus the ones already exported:
// SpeechBubble, TermFlipCard, OptionList, FeedbackPanel, StreakModal,
// MasteryLoadingScreen, CompleteScreen) in GlossaryGameExperience.tsx -- no
// behavior, markup or styles changed. Every one of those was checked for a
// mount-time sound/store write; only UnlockCompleteScreen has one (a level-
// up sweep + burst), so it alone sits behind a Play reveal, same as
// StreakModal/CompleteScreen below. CompleteScreenGate is never rendered
// here: it writes real progress and awards Dream Score on mount.
// TypeTermCard/MatchUpCard/SortBucketsCard/ProfitBuilderCard manage their
// own answered/checked state internally with no prop to force it, so each
// gets one live specimen (click through it for real to see the other
// states) rather than a forced state per the "where props allow" rule.

import { useState, type ReactNode } from "react";
import { glossaryFor } from "@/components/glossary/data";
import {
  CompleteScreen,
  DocumentOptionList,
  FeedbackPanel,
  IntroScreen,
  LessonIntroScreen,
  MasteryLoadingScreen,
  MatchUpCard,
  OptionList,
  PowerPlayIntroScreen,
  PowerPlayScreen,
  ProfitBuilderCard,
  QuestionScreen,
  SortBucketsCard,
  SpeechBubble,
  StreakModal,
  TermFlipCard,
  TopBar,
  TypeTermCard,
  UnlockCompleteScreen,
  UnlockScreen,
} from "@/components/glossary/GlossaryGameExperience";
import { SurfaceStateView } from "@/components/app/SurfaceState";
import { WORLD_COLORS } from "@/components/app/worlds";
import type { PlayBgVersion } from "@/components/play/PlayVersionChip";
import { ClippedStage, NotRendered, Reveal, Specimen, StateCell, StateGrid, noop } from "../../kit";

const CAREER = glossaryFor("investment-banking");
const LESSON = CAREER?.lessons[0];
const TERM = LESSON?.terms[0];
const ACCENT = CAREER ? (WORLD_COLORS[CAREER.world] ?? "var(--world-business-money-office)") : "var(--primary)";
const CHOICE_Q = LESSON?.questions.find((q) => q.kind === "choice" && q.type !== "Catch the Misuse");
const MISUSE_Q = LESSON?.questions.find((q) => q.kind === "choice" && q.type === "Catch the Misuse");
const TYPE_TERM_Q = LESSON?.questions.find((q) => q.kind === "typeTerm");
const MATCH_Q = LESSON?.questions.find((q) => q.kind === "matchUp");
const SORT_Q = LESSON?.questions.find((q) => q.kind === "sortBuckets");
const PROFIT_Q = LESSON?.questions.find((q) => q.kind === "profitBuilder");

// ---------------------------------------------------------------------------
// Theme switcher: one selection drives every specimen in this group, so
// "is v3 documented" is answered by pressing one button, not hunting for a
// separate copy of each screen per theme.

const THEMES: { version: PlayBgVersion; label: string; scope: string }[] = [
  { version: "v1", label: "Default", scope: "" },
  { version: "v2", label: "CRT", scope: "play-crt" },
  { version: "v3", label: "Dots", scope: "play-dots" },
  { version: "v4", label: "Synth", scope: "play-synth" },
];

function ThemeSwitcher({ value, onChange }: { value: PlayBgVersion; onChange: (v: PlayBgVersion) => void }) {
  return (
    <div role="group" aria-label="Glossary game background theme" className="flex flex-wrap gap-[6px]">
      {THEMES.map((t) => (
        <button
          key={t.version}
          type="button"
          aria-pressed={value === t.version}
          onClick={() => onChange(t.version)}
          className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12px] font-bold"
          style={{
            borderColor: value === t.version ? "var(--primary)" : "var(--glass-border)",
            background: value === t.version ? "color-mix(in srgb, var(--primary) 18%, var(--card))" : "var(--glass-surface-1)",
            color: "var(--foreground)",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Every specimen stage in this group: a themed scope (`.marketing-v2` +
 *  the version's own class, exactly what GlossaryGameExperience's root div
 *  applies) so v2/v3/v4's token overrides (font, radius, glass, the CRT
 *  glitch vars) actually take effect, clipped so nothing escapes the cell. */
function ThemedStage({ theme, height = 260, children }: { theme: PlayBgVersion; height?: number; children: ReactNode }) {
  const scope = THEMES.find((t) => t.version === theme)?.scope ?? "";
  return (
    <ClippedStage height={height}>
      <div className={`marketing-v2 themeable relative flex h-full w-full flex-col ${scope}`} style={{ background: "var(--background)" }}>
        {children}
      </div>
    </ClippedStage>
  );
}

export function GlossaryScreensGroup() {
  const [theme, setTheme] = useState<PlayBgVersion>("v1");
  if (!CAREER || !LESSON || !TERM || !CHOICE_Q || CHOICE_Q.kind !== "choice" || !MISUSE_Q || MISUSE_Q.kind !== "choice" || !TYPE_TERM_Q || TYPE_TERM_Q.kind !== "typeTerm" || !MATCH_Q || MATCH_Q.kind !== "matchUp" || !SORT_Q || SORT_Q.kind !== "sortBuckets" || !PROFIT_Q || PROFIT_Q.kind !== "profitBuilder") return null;
  const lastIndex = LESSON.terms.length - 1;

  return (
    <>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-3)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <p className="text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>Theme (every specimen below):</p>
        <ThemeSwitcher value={theme} onChange={setTheme} />
      </div>

      <Specimen name="TopBar" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Back, the Levels button, Music/Mute, and the app's own hamburger -- the one bar every screen shares." when="The top of every Glossary Game screen.">
        <StateGrid min={320}>
          <StateCell label="Default" surface="game" note="Music/sound toggles write real localStorage keys on click; don't click-test them here.">
            <ThemedStage theme={theme} height={90}>
              <TopBar onBack={noop} career={CAREER} currentLesson={LESSON.lessonNumber} accent={ACCENT} bgVersion={theme} topBarRef={{ current: null }} />
            </ThemedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="IntroScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="'Meet {Company}' -- the first screen of every lesson." when="Opening a lesson for the first time.">
        <StateGrid min={320}>
          <StateCell label="Default" surface="game" minH={260}>
            <ThemedStage theme={theme}><IntroScreen lesson={LESSON} onNext={noop} /></ThemedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LessonIntroScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The company-value meter and the word chips for what's about to unlock." when="After IntroScreen, before the first term unlocks.">
        <StateGrid min={320}>
          <StateCell label="Default" surface="game" minH={260}>
            <ThemedStage theme={theme}><LessonIntroScreen lesson={LESSON} onStart={noop} /></ThemedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SpeechBubble" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Dreamy's line and the question prompt, in a solid always-dark bubble so it reads over any animated backdrop." when="Above every question in the Glossary Game.">
        <StateGrid min={260}>
          <StateCell label="Neutral" surface="game"><ThemedStage theme={theme} height={110}><SpeechBubble>What is a company?</SpeechBubble></ThemedStage></StateCell>
          <StateCell label="Correct" surface="game"><ThemedStage theme={theme} height={110}><SpeechBubble tone="correct">Right, a company sells things to make money.</SpeechBubble></ThemedStage></StateCell>
          <StateCell label="Wrong" surface="game"><ThemedStage theme={theme} height={110}><SpeechBubble tone="wrong">Not quite. A company sells things to make money.</SpeechBubble></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TermFlipCard" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="One vocabulary term, drawn as a hand-sketched illustration with its definition on the same face; an optional flip reveals a worked example." when="The Glossary Game's term-teaching screens.">
        <StateGrid min={260}>
          <StateCell label="Default" surface="game" minH={220}><ThemedStage theme={theme}><TermFlipCard lesson={LESSON} term={TERM} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="UnlockScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="One term's own unlock moment: the flip card plus the Unlock button, cycled once per term." when="Between LessonIntroScreen and UnlockCompleteScreen, once per term.">
        <StateGrid min={320}>
          <StateCell label="First term" surface="game" minH={320}><ThemedStage theme={theme} height={320}><UnlockScreen lesson={LESSON} index={0} onUnlock={noop} /></ThemedStage></StateCell>
          <StateCell label="Last term" surface="game" minH={320}><ThemedStage theme={theme} height={320}><UnlockScreen lesson={LESSON} index={lastIndex} onUnlock={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="UnlockCompleteScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="'All N terms unlocked!' -- a level-up sweep, a burst, and fireworks the moment the last term unlocks." when="Once, right after the last term's UnlockScreen.">
        <StateGrid min={280}>
          <StateCell label="Default" note="Plays a level-up sweep and lights fireworks on mount (real behavior), so it's gated behind Play." minH={340}>
            <Reveal label="Play" height={340}><ThemedStage theme={theme} height={340}><UnlockCompleteScreen lesson={LESSON} onStartPractice={noop} /></ThemedStage></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="OptionList" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The multiple-choice list for a Definition/Fill in the Blank/Reverse Recall question." when="Inside QuestionScreen, every choice-kind question except Catch the Misuse.">
        <StateGrid min={260}>
          <StateCell label="Unanswered" surface="game"><ThemedStage theme={theme} height={220}><OptionList options={CHOICE_Q.options} correctIndex={CHOICE_Q.correctIndex} picked={null} onPick={noop} /></ThemedStage></StateCell>
          <StateCell label="Picked correct" surface="game"><ThemedStage theme={theme} height={220}><OptionList options={CHOICE_Q.options} correctIndex={CHOICE_Q.correctIndex} picked={CHOICE_Q.correctIndex} onPick={noop} /></ThemedStage></StateCell>
          <StateCell label="Picked wrong" surface="game"><ThemedStage theme={theme} height={220}><OptionList options={CHOICE_Q.options} correctIndex={CHOICE_Q.correctIndex} picked={0} onPick={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DocumentOptionList" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The document-styled option list for a Catch the Misuse question -- a sheet of options rather than plain pills." when="Inside QuestionScreen, only for Catch the Misuse questions.">
        <StateGrid min={260}>
          <StateCell label="Unanswered" surface="game"><ThemedStage theme={theme} height={260}><DocumentOptionList options={MISUSE_Q.options} correctIndex={MISUSE_Q.correctIndex} picked={null} onPick={noop} /></ThemedStage></StateCell>
          <StateCell label="Picked correct" surface="game"><ThemedStage theme={theme} height={260}><DocumentOptionList options={MISUSE_Q.options} correctIndex={MISUSE_Q.correctIndex} picked={MISUSE_Q.correctIndex} onPick={noop} /></ThemedStage></StateCell>
          <StateCell label="Picked wrong" surface="game"><ThemedStage theme={theme} height={260}><DocumentOptionList options={MISUSE_Q.options} correctIndex={MISUSE_Q.correctIndex} picked={0} onPick={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TypeTermCard" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="A Type the Term question: a word bank of shortcuts plus a real text input, checked on demand." when="Inside QuestionScreen, Type the Term questions.">
        <StateGrid min={280}>
          <StateCell label="Live (type or tap a word, then Check Answer)" surface="game" note="Answered/checked state is internal, no prop to force it -- interact with it for real." minH={240}><ThemedStage theme={theme} height={240}><TypeTermCard question={TYPE_TERM_Q} onAnswer={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MatchUpCard" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Term-to-example matching: tap a left term, then its right match; a confirmation line snaps and fades on a correct pair." when="Inside QuestionScreen, Match It Up questions.">
        <StateGrid min={280}>
          <StateCell label="Live (tap a term, then its match)" surface="game" note="Matched-count is internal state, no prop to force it -- interact with it for real to reach 'all matched'." minH={260}><ThemedStage theme={theme} height={260}><MatchUpCard question={MATCH_Q} onAnswer={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SortBucketsCard" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Tap an item, then tap the bucket it belongs in; Check My Sorting grades every placement at once." when="Inside QuestionScreen, Sort the Buckets questions.">
        <StateGrid min={280}>
          <StateCell label="Live (place every item, then check)" surface="game" note="Placement/checked state is internal, no prop to force it -- interact with it for real." minH={280}><ThemedStage theme={theme} height={280}><SortBucketsCard question={SORT_Q} onAnswer={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ProfitBuilderCard" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="A worked scenario with a numeric answer per step; Check My Math grades every step at once." when="Inside QuestionScreen, Profit Builder questions.">
        <StateGrid min={280}>
          <StateCell label="Live (fill every step, then check)" surface="game" note="Checked state is internal, no prop to force it -- interact with it for real." minH={280}><ThemedStage theme={theme} height={280}><ProfitBuilderCard question={PROFIT_Q} onAnswer={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="QuestionScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The surface every question type sits inside: Dreamy's prompt bubble (or a plain heading for Match It Up/Sort the Buckets) over the right answer renderer for that question's kind." when="The game's main practice loop, one screen per question.">
        <StateGrid min={320}>
          <StateCell label="Choice (Definition)" surface="game" minH={340}><ThemedStage theme={theme} height={340}><QuestionScreen question={CHOICE_Q} onAnswer={noop} /></ThemedStage></StateCell>
          <StateCell label="Choice (Catch the Misuse)" surface="game" minH={360}><ThemedStage theme={theme} height={360}><QuestionScreen question={MISUSE_Q} onAnswer={noop} /></ThemedStage></StateCell>
          <StateCell label="Type the Term" surface="game" minH={340}><ThemedStage theme={theme} height={340}><QuestionScreen question={TYPE_TERM_Q} onAnswer={noop} /></ThemedStage></StateCell>
          <StateCell label="Match It Up" surface="game" minH={340}><ThemedStage theme={theme} height={340}><QuestionScreen question={MATCH_Q} onAnswer={noop} /></ThemedStage></StateCell>
          <StateCell label="Sort the Buckets" surface="game" minH={360}><ThemedStage theme={theme} height={360}><QuestionScreen question={SORT_Q} onAnswer={noop} /></ThemedStage></StateCell>
          <StateCell label="Profit Builder" surface="game" minH={360}><ThemedStage theme={theme} height={360}><QuestionScreen question={PROFIT_Q} onAnswer={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FeedbackPanel" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The full-screen result card after a question: Dreamy's reaction pose, the why-line, Next Question / See Results." when="After every Glossary Game question resolves.">
        <StateGrid min={280}>
          <StateCell label="Correct" note="Fixed full-screen overlay, contained behind Play." minH={260}>
            <Reveal label="Play" height={260}><ThemedStage theme={theme} height={260}><FeedbackPanel correct text={CHOICE_Q.feedbackCorrect} isLast={false} onNext={noop} /></ThemedStage></Reveal>
          </StateCell>
          <StateCell label="Wrong" minH={260}>
            <Reveal label="Play" height={260}><ThemedStage theme={theme} height={260}><FeedbackPanel correct={false} text={CHOICE_Q.feedbackWrong} isLast={false} onNext={noop} /></ThemedStage></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="StreakModal" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="A bonus 'N in a row!' celebration modal, distinct from the per-question feedback panel." when="Every third correct answer in a row.">
        <StateGrid min={280}>
          <StateCell label="5 in a row" note="Plays a chime and a burst on mount, so it's gated behind Play." minH={260}>
            <Reveal label="Play" height={260}><ThemedStage theme={theme} height={260}><StreakModal streak={5} onDismiss={noop} /></ThemedStage></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PowerPlayIntroScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The bonus round's own intro card, between the main practice loop and its fill-in-the-blanks paragraph." when="After the last question, before PowerPlayScreen.">
        <StateGrid min={280}>
          <StateCell label="Default" surface="game" minH={280}><ThemedStage theme={theme} height={280}><PowerPlayIntroScreen onStart={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PowerPlayScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The bonus round itself: a paragraph with word-bank blanks to fill and check, own violet theme." when="The Glossary Game's bonus round, after the main practice loop.">
        <StateGrid min={320}>
          <StateCell label="Live (fill the blanks, then Check Answers)" surface="game" note="Checked/correct state is internal, no prop to force it -- interact with it for real." minH={340}><ThemedStage theme={theme} height={340}><PowerPlayScreen lesson={LESSON} onComplete={noop} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MasteryLoadingScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The one built loading state in the Glossary Game: a centered Dreamy plus an optional fact card while mastery is being checked." when="Between the last question and the Complete screen.">
        <StateGrid min={280}>
          <StateCell label="Built loading" minH={220}><ThemedStage theme={theme} height={220}><MasteryLoadingScreen fact={LESSON.facts[0] ?? null} /></ThemedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CompleteScreen" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The lesson's finish line: Dream Score, XP earned, mastery percent, fireworks. Never CompleteScreenGate, which writes progress and awards score on mount." when="Finishing a Glossary Game lesson.">
        <StateGrid min={280}>
          <StateCell label="Default" note="Plays a level-up sweep and lights fireworks on mount (real behavior), so it's gated behind Play, not shown on load." minH={420}>
            <Reveal label="Play" height={420}><ThemedStage theme={theme} height={420}><CompleteScreen lesson={LESSON} masteredCount={LESSON.terms.length} onContinue={noop} /></ThemedStage></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Error" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="A lesson authored with no terms or no questions can't actually be played -- wired 27 Sept 2026 to this real error instead of a broken run." when="Never in the shipped content today (every authored lesson has terms and questions); the real path for one that doesn't. Whole-surface loading/error is also cataloged as States gallery #54.">
        <StateGrid min={260}>
          <StateCell label="Couldn't load this lesson" minH={200}><SurfaceStateView id={54} state="error" what="lesson" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Other Glossary Game screens" scale="core" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Everything else in the file is either file-local scaffolding for the ones above, or writes/plays audio/navigates on mount." when="See docs/handoff/COMPONENT_INVENTORY.md, section 4, Glossary.">
        <StateGrid min={260}>
          <StateCell label="CompleteScreenGate"><NotRendered reason="Writes real Glossary progress and awards Dream Score on mount." see="src/components/glossary/GlossaryGameExperience.tsx" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
