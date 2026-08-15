"use client";

import { useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// PLACEHOLDER content: the real personality/skill assessment question bank wasn't
// available to source this from, so these are stand-ins in the same plain, 8th-grade
// voice as the taxonomy copy elsewhere on this page. Swap QUESTIONS for the real set.
const QUESTIONS = [
  { text: "Which of these sounds most like you?", options: ["Solving number puzzles", "Building or fixing things", "Leading a group project"] },
  { text: "A free afternoon: what are you doing?", options: ["Reading about how markets work", "Sketching or designing something", "Organizing an event"] },
  { text: "Pick the class you'd never skip.", options: ["Economics", "Computer Science", "Debate"] },
];
const TOTAL_QUESTIONS = 12;

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function BuildChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const question = QUESTIONS[qIndex % QUESTIONS.length];

  function next() {
    setSelected(null);
    setQIndex((i) => i + 1);
  }

  return (
    <ChapterShell
      id="build"
      title="Build"
      color="#6366f1"
      oneliner="by taking a personality, skill, and academic assessment."
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="flex flex-col items-center" style={{ width: "clamp(270px, 68cqw, 480px)", gap: "calc(var(--mu) * 14px)" }}>
        <p className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 9px)", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 700 }}>
          Question {(qIndex % TOTAL_QUESTIONS) + 1} of {TOTAL_QUESTIONS}
        </p>

        <p className="text-center font-bold" style={{ fontSize: "calc(var(--mu) * 16px)", lineHeight: 1.3, color: "var(--foreground)" }}>
          {question.text}
        </p>

        <div className="flex w-full flex-col" style={{ gap: "calc(var(--mu) * 10px)" }}>
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isNudge = selected === null && i === 0;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(i)}
                className={`flex items-center justify-between rounded-[var(--radius-md-alt)] border text-left transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""}`}
                style={{
                  padding: "calc(var(--mu) * 14px) calc(var(--mu) * 18px)",
                  fontSize: "calc(var(--mu) * 12px)",
                  fontWeight: 600,
                  background: isSelected ? "color-mix(in srgb, #6366f1 16%, var(--glass-surface-2))" : "var(--glass-surface-2)",
                  borderColor: isSelected ? "#6366f1" : "var(--border)",
                  color: isSelected ? "var(--foreground)" : "var(--muted-foreground)",
                  opacity: selected !== null && !isSelected ? 0.6 : 1,
                }}
              >
                {option}
                <span
                  className="mkt-build-check flex flex-none items-center justify-center rounded-full text-white transition-all duration-200"
                  style={{
                    width: "calc(var(--mu) * 20px)",
                    height: "calc(var(--mu) * 20px)",
                    padding: "calc(var(--mu) * 5px)",
                    background: "#6366f1",
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? "scale(1)" : "scale(0.4)",
                  }}
                >
                  {CHECK}
                </span>
              </button>
            );
          })}
        </div>

        {selected === null ? (
          <p className="text-center" style={{ fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}>
            Tap an answer. {TOTAL_QUESTIONS - 1} more questions like this build your profile.
          </p>
        ) : (
          <button
            type="button"
            onClick={next}
            className="flex items-center rounded-full border font-semibold"
            style={{
              gap: "calc(var(--mu) * 6px)",
              padding: "calc(var(--mu) * 8px) calc(var(--mu) * 16px)",
              fontSize: "calc(var(--mu) * 11px)",
              background: "var(--glass-surface-2)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Next question
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 12px)", height: "calc(var(--mu) * 12px)" }}>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </ChapterShell>
  );
}
