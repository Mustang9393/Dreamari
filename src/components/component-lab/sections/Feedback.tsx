"use client";

// DEMO-ONLY: Component Lab section, "Feedback and loading". Every shared
// piece the app uses to say "this is happening", "this worked", "this is
// how far along you are", or "this needs attention". The app-wide surface
// states (skeleton, error boundary, offline, 404, locked, session expired)
// live in the States gallery section now, so they aren't repeated here --
// this file stays scoped to toast/progress/status tones and the one real
// gap in that scope: the app has no error-toast pattern (Toast/UndoToast
// below are success/undo only).

import { useState } from "react";
import { Section, Specimen, StateGrid, StateCell, Reveal, ClippedStage, noop } from "../kit";

import { Working } from "@/components/app/Working";
import { Toast } from "@/components/app/Toast";
import { UndoToast } from "@/components/app/UndoToast";
import { Toast as FlowLabToast } from "@/components/flow-lab/shared";
import { SparkBar } from "@/components/flow/SparkBar";
import { MatchRing } from "@/components/app/MatchRing";
import { ConfirmShimmer } from "@/components/flow/ConfirmShimmer";
import { DreamScoreChip } from "@/components/app/DreamScoreChip";
import { DreamScoreTip } from "@/components/app/DreamScoreTip";
import { StatusChip, MilestoneChip, MilestonesMini } from "@/components/counselor/chips";
import { Verdict, MetricRow, Stat } from "@/components/counselor/v2/overviewShared";
import { LoadingState, ErrorState, EmptyState } from "@/components/counselor/v2/states";
import { PhaseProgress, CardHud } from "@/components/build/ui";
import { LiveRegion, announce } from "@/components/app/LiveRegion";
import { MILESTONE_KEYS, type MilestoneKey, type MilestoneStatus, type CaseloadStatus } from "@/lib/counselorRoster";

const CASELOAD_STATUSES: CaseloadStatus[] = ["On Track", "Needs Attention", "At Risk"];
const MILESTONE_STATUSES: MilestoneStatus[] = ["Approved", "Pending Review", "Changes Requested", "In Progress", "Not Started", "Completed", "Overdue", "Not Applicable"];

function milestonesRecord(mostlyApproved: boolean): Record<MilestoneKey, MilestoneStatus> {
  const cycle: MilestoneStatus[] = mostlyApproved
    ? ["Approved", "Approved", "Approved", "Completed", "Approved", "Pending Review", "Approved", "Approved", "Overdue", "Approved", "Not Applicable"]
    : ["Not Started", "Not Started", "In Progress", "Not Started", "Not Started", "Not Started", "Not Started", "Not Started", "Not Started", "Not Started", "Not Applicable"];
  return Object.fromEntries(MILESTONE_KEYS.map((key, i) => [key, cycle[i % cycle.length]])) as Record<MilestoneKey, MilestoneStatus>;
}

function ToastDemo() {
  const [shown, setShown] = useState(true);
  return (
    // Toast portals straight to document.body (see app/Toast.tsx), so it
    // escapes ClippedStage's clip like GlobalSearch does -- clip={false}
    // avoids an empty box sitting where the (elsewhere-rendered) toast
    // actually appears. Per kit.tsx: fine behind a Reveal, one at a time,
    // as long as it has a working close path (Close here, or the X on the
    // toast itself).
    <Reveal label="Show toast" clip={false}>
      {shown ? (
        // Long duration: this is a demo, not a real 3.2s confirmation -- reviewing
        // the state shouldn't race its own auto-dismiss timer.
        <Toast message="Added to your Top 3" onClose={() => setShown(false)} duration={60000} />
      ) : (
        <p className="p-[var(--space-4)] text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>Dismissed. Reopen with Close / Show toast above.</p>
      )}
    </Reveal>
  );
}

function UndoToastDemo() {
  const [shown, setShown] = useState(true);
  return (
    <Reveal label="Show undo toast" clip={false}>
      {shown ? (
        <UndoToast message="Removed from Top 3" onUndo={noop} onClose={() => setShown(false)} duration={60000} />
      ) : (
        <p className="p-[var(--space-4)] text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>Dismissed. Reopen with Close / Show undo toast above.</p>
      )}
    </Reveal>
  );
}

function LongToastDemo() {
  const [shown, setShown] = useState(true);
  return (
    <Reveal label="Show toast" clip={false}>
      {shown ? (
        <Toast message="Added Registered Nurse, Software Engineer and Aerospace Engineering Technician to your Top 3" onClose={() => setShown(false)} duration={60000} />
      ) : (
        <p className="p-[var(--space-4)] text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>Dismissed. Reopen with Close / Show toast above.</p>
      )}
    </Reveal>
  );
}

function StackedToastDemo() {
  const [shown, setShown] = useState(true);
  return (
    <Reveal label="Show two toasts" clip={false}>
      {shown ? (
        // Both mount at once to show the real stacking behaviour
        // (useToastStack, Toast.tsx, added 27 Sept 2026): each instance
        // claims a slot in mount order and offsets by a gap instead of
        // overlapping in the same fixed slot, newest (UndoToast here) on
        // top with the higher z-index.
        <>
          <Toast message="Added to your Top 3" onClose={noop} duration={60000} />
          <UndoToast message="Removed from Top 3" onUndo={noop} onClose={() => setShown(false)} duration={60000} />
        </>
      ) : (
        <p className="p-[var(--space-4)] text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>Dismissed. Reopen with Close / Show two toasts above.</p>
      )}
    </Reveal>
  );
}

function SparkBarDemo() {
  const [percent, setPercent] = useState(20);
  return (
    <div className="flex w-full flex-col items-center gap-[var(--space-3)]">
      <SparkBar percent={percent} fill="var(--primary)" glow="var(--primary)" height={6} className="w-full" idle={false} />
      <button type="button" onClick={() => setPercent((p) => (p >= 100 ? 20 : p + 30))} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
        Bump progress
      </button>
    </div>
  );
}

function ConfirmShimmerDemo() {
  const [active, setActive] = useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-[var(--space-3)]">
      <div className="relative w-full max-w-[220px] rounded-[var(--radius-md)] border px-[16px] py-[12px] text-center text-[13px] font-semibold" style={{ borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--foreground)" }}>
        Selected answer
        <ConfirmShimmer active={active} />
      </div>
      <button
        type="button"
        onClick={() => { setActive(false); requestAnimationFrame(() => setActive(true)); }}
        className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12px] font-bold"
        style={{ borderColor: "var(--glass-border)" }}
      >
        Replay
      </button>
    </div>
  );
}

function LiveRegionDemo() {
  return (
    <div className="flex flex-col items-center gap-[var(--space-2)]">
      <LiveRegion />
      <button
        type="button"
        onClick={() => announce("Saved Software Engineer to your Top 3")}
        className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12px] font-bold"
        style={{ borderColor: "var(--glass-border)" }}
      >
        Announce a save
      </button>
    </div>
  );
}

export function FeedbackSection() {
  return (
    <Section id="feedback" title="Feedback and loading" intro="How the app says something is happening, worked, is in progress, or needs attention.">
      <Specimen name="Working" file="src/components/app/Working.tsx" purpose="The app's one &quot;it's thinking&quot; chip: beam, shimmering label, stepping dots." when="Any short async wait that isn't a whole-screen or whole-card load.">
        <StateGrid>
          <StateCell label="Checking"><Working label="Checking" /></StateCell>
          <StateCell label="Generating"><Working label="Generating" /></StateCell>
          <StateCell label="Saving"><Working label="Saving" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Toast / UndoToast" file="src/components/app/Toast.tsx, src/components/app/UndoToast.tsx" purpose="A self-dismissing confirmation, with or without an Undo action. Both are fixed-position and portalled to the page." when="Toast: an action needs acknowledgement but nothing to undo. UndoToast: the action can be reversed (removed from Top 3, unliked).">
        <StateGrid>
          <StateCell label="Toast (success)" minH={160}><ToastDemo /></StateCell>
          <StateCell label="UndoToast" minH={160}><UndoToastDemo /></StateCell>
          <StateCell label="Long message" note="max-w-[420px] with no truncation built; a long message just wraps to more lines." minH={160}><LongToastDemo /></StateCell>
          <StateCell label="Stacked" kind="built" note="Fixed 27 Sept 2026 (direct report + screenshot: two toasts overlapped): each instance now claims a slot in mount order via useToastStack and offsets by a gap, newest on top." minH={200}><StackedToastDemo /></StateCell>
          <StateCell label="Error toast" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL." minH={160}>
            <div className="flex max-w-[320px] items-center gap-[14px] rounded-[14px] border px-[16px] py-[12px] text-[14px] font-semibold" style={{ background: "var(--card)", borderColor: "color-mix(in srgb, var(--color-feedback-danger, #ff6b6b) 45%, var(--glass-border))", color: "var(--foreground)" }}>
              <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: "var(--color-feedback-danger, #ff6b6b)" }} />
              <span className="min-w-0 flex-1">Couldn&apos;t save. Try again.</span>
            </div>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Flow-lab Toast" file="src/components/flow-lab/shared.tsx" purpose="Flow Lab's own inline (non-fixed) toast line." when="Inside /flow-lab screens only.">
        <StateGrid>
          <StateCell label="Default" pad={false}><ClippedStage height={160}><FlowLabToast text="Saved" /></ClippedStage></StateCell>
          <StateCell label="Low (no bottom bar on screen)" pad={false}><ClippedStage height={160}><FlowLabToast text="Saved" low /></ClippedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SparkBar" file="src/components/flow/SparkBar.tsx" purpose="The app's one animated progress fill: transitions, a particle spark on gain, and an idle flicker so it never reads as dead." when="Any percent-complete bar (Build's PhaseProgress, Resume's WizardProgress, Match Lab's picks).">
        <StateGrid>
          <StateCell label="0%"><SparkBar percent={0} fill="var(--primary)" glow="var(--primary)" height={6} idle={false} /></StateCell>
          <StateCell label="Tiny value (1%)" note="min defaults to 0, so a real 1% renders as a hairline sliver; no visual floor is enforced by default."><SparkBar percent={1} fill="var(--primary)" glow="var(--primary)" height={6} idle={false} /></StateCell>
          <StateCell label="40%"><SparkBar percent={40} fill="var(--primary)" glow="var(--primary)" height={6} idle={false} /></StateCell>
          <StateCell label="100%"><SparkBar percent={100} fill="var(--primary)" glow="var(--primary)" height={6} idle={false} /></StateCell>
          <StateCell label="Idle flicker" note="Fires an unprompted flicker after ~10-18s of no page activity while the bar is visible and incomplete."><SparkBar percent={65} fill="var(--primary)" glow="var(--primary)" height={6} idle memoryKey="lab-idle-demo" /></StateCell>
          <StateCell label="Gain spark" note="Click to grow the bar and see the particle spark fire."><SparkBarDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MatchRing" file="src/components/app/MatchRing.tsx" purpose="A percentage ring with match language, not a generic progress ring." when="Any career/college match score.">
        <StateGrid>
          <StateCell label="Strong match (>=75)"><MatchRing score={80} /></StateCell>
          <StateCell label="Solid match (>=50)"><MatchRing score={60} /></StateCell>
          <StateCell label="Early match (>=25)"><MatchRing score={30} /></StateCell>
          <StateCell label="Low signal"><MatchRing score={10} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ConfirmShimmer" file="src/components/flow/ConfirmShimmer.tsx" purpose="A one-shot diagonal light sweep confirming a selection registered." when="Placed absolutely inside a position:relative selected row/card, alongside Play's OptionButton and Build's answer rows.">
        <StateGrid>
          <StateCell label="Replay the sweep"><ConfirmShimmerDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DreamScoreChip / DreamScoreTip" file="src/components/app/DreamScoreChip.tsx, src/components/app/DreamScoreTip.tsx" purpose="The streak + Dream Score chip shown in every header, and its hover tooltip." when="Desktop nav and every phone/tablet header.">
        <StateGrid>
          <StateCell label="Chip (reads the live score)" note="Reads the dreamScore store; never writes to it."><DreamScoreChip /></StateCell>
          <StateCell label="Tooltip" note="Hover or Tab to the number to see the explanation.">
            <DreamScoreTip>
              <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>1,240 XP</span>
            </DreamScoreTip>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="StatusChip, MilestoneChip, MilestonesMini" file="src/components/counselor/chips.tsx" purpose="Caseload-status pill, milestone-review pill, and the 11-milestone completion strip, the same status vocabulary reused on Students, Milestone Tracker and Review Queue." when="Any counselor row or card that needs a status at a glance.">
        <StateGrid>
          {CASELOAD_STATUSES.map((s) => (
            <StateCell key={s} label={`StatusChip: ${s}`}><StatusChip status={s} /></StateCell>
          ))}
          {MILESTONE_STATUSES.map((s) => (
            <StateCell key={s} label={`MilestoneChip: ${s}`}><MilestoneChip status={s} /></StateCell>
          ))}
          <StateCell label="MilestonesMini: mostly approved"><MilestonesMini milestones={milestonesRecord(true)} /></StateCell>
          <StateCell label="MilestonesMini: just started"><MilestonesMini milestones={milestonesRecord(false)} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Verdict, MetricRow, Stat" file="src/components/counselor/v2/overviewShared.tsx" purpose="Overview card primitives: a one-line colored verdict, a labelled metric bar with a target tick, and a headline number." when="Counselor v2 Overview cards.">
        <StateGrid>
          <StateCell label="Verdict: met"><Verdict band="met">On track district-wide</Verdict></StateCell>
          <StateCell label="Verdict: near"><Verdict band="near">Close to target</Verdict></StateCell>
          <StateCell label="Verdict: missed"><Verdict band="missed">Below target</Verdict></StateCell>
          <StateCell label="MetricRow: met"><MetricRow label="On-track students" value={82} target={75} /></StateCell>
          <StateCell label="MetricRow: near"><MetricRow label="On-track students" value={70} target={75} /></StateCell>
          <StateCell label="MetricRow: missed"><MetricRow label="On-track students" value={48} target={75} /></StateCell>
          <StateCell label="Stat"><Stat value="92%" label="Milestones approved" /></StateCell>
          <StateCell label="Stat, large number" note="value is a plain string; whatever formatting (1.2k, commas) is the caller's job, not Stat's."><Stat value="1,240" label="Students served" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LoadingState / ErrorState / EmptyState" file="src/components/counselor/v2/states.tsx" purpose="The one place in the repo with a full loading + error + empty state contract for a whole screen." when="Every counselor v2 screen, wired once through StateGate.">
        <StateGrid min={280}>
          <StateCell label="Loading"><LoadingState /></StateCell>
          <StateCell label="Error"><ErrorState onRetry={noop} /></StateCell>
          <StateCell label="Empty, with CTA"><EmptyState view="overview" /></StateCell>
          <StateCell label="Empty, no CTA" note="Not every SCREEN_EMPTY entry has a cta (e.g. students); the button is conditional, not always there."><EmptyState view="students" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PhaseProgress, CardHud" file="src/components/build/ui.tsx" purpose="Build's own labelled progress bar (built on SparkBar) and the compact HUD card that wraps it." when="The Build flow's question screens.">
        <StateGrid>
          <StateCell label="0%"><PhaseProgress percent={0} /></StateCell>
          <StateCell label="50%"><PhaseProgress percent={50} /></StateCell>
          <StateCell label="Almost done"><PhaseProgress percent={92} almostDone /></StateCell>
          <StateCell label="CardHud"><CardHud percent={50} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LiveRegion" file="src/components/app/LiveRegion.tsx" purpose="One polite screen-reader announcement channel for the whole app: announce(message) speaks it, nothing changes visually." when="Any state change that only shows up visually otherwise (a save, an unlock, a score change).">
        <StateGrid>
          <StateCell label="Announce" note="Visually hidden (sr-only). Turn on a screen reader, or inspect the DOM node this renders, to hear/see the announcement fire."><LiveRegionDemo /></StateCell>
        </StateGrid>
      </Specimen>
    </Section>
  );
}
