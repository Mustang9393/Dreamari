"use client";
import { useState } from "react";
import { WorkArtifact } from "./WorkArtifact";
import { CardBody } from "./interactions";
import { PresentationProvider } from "./presentation";
import type { CardBeat } from "./types";
import type { WorkArtifact as Artifact } from "./work-artifacts";
export function WorkGraphicQA({ fixtures, milestone, score }: { fixtures: Artifact[]; milestone: CardBeat; score: number }) {
  const [done, setDone] = useState(false);
  return <div className="mx-auto flex max-w-[900px] flex-col gap-5 p-5">
    <h1 className="text-[24px] font-bold">Work graphics QA</h1>
    <p>Rendering fixtures only. These are not additional playable careers or saved reputation.</p>
    <nav className="flex gap-4"><a href="?score=75">Review pass fixture · 75</a><a href="?score=50">Review fail fixture · 50</a></nav>
    <PresentationProvider value={{ directed: true, cinematic: true, coreKit: true }}><section aria-label="Mid-project review fixture" className="rounded-[var(--radius-lg)] border p-5" style={{ borderColor: "var(--glass-border)" }}>{done ? <p>Review continued successfully</p> : <CardBody beat={milestone} reputation={score} onNext={() => setDone(true)} accent="var(--primary)" />}</section></PresentationProvider>
    {fixtures.map(a => <WorkArtifact key={a.id} artifact={a} />)}
  </div>;
}
