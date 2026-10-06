"use client";

// DEMO-ONLY: Component Lab section, "Overlays". Every overlay here is fixed
// or portalled, so each one mounts only after a click (kit's Reveal), with a
// real controlled `open` state and a real `onClose` wired to it -- opening
// one and then using its own Close/Escape actually closes it, the same as a
// live screen. Most of these portal through the one shared `Portal` primitive
// (src/components/profile/CareerReport.tsx), also used by IconTip, SidePanel,
// DocumentDesk/DocumentPreview and every resume modal, so it never sits
// behind the page's own stacking context.

import { useState, type ReactNode } from "react";
import { Bell, Share2 } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { WelcomeSplash } from "@/components/app/WelcomeSplash";
import { SidePanel } from "@/components/counselor/v4/SidePanel";
import { DetailPane } from "@/components/counselor/chips";
import { DocumentPage as DocumentDeskPage, FitPage, FullScreenDocument, type Signer } from "@/components/counselor/v4/DocumentDesk";
import { DocumentPage as DocumentPreviewPage, DocumentPreviewModal } from "@/components/counselor/v4/DocumentPreview";
import { getRoster } from "@/lib/counselorRoster";
import { Top3SwapModal } from "@/components/career/Top3SwapModal";
import { BottomBar, DetailModal, PicksTray, RankSlots, TopThreeScreen } from "@/components/flow-lab/shared";
import { labCatalog } from "@/components/flow-lab/lab";
import { InfoButton, InfoSheet } from "@/components/flow-lab/notes";
import { ResumeModal } from "@/components/resume/ui";
import { ZoomResumeModal } from "@/components/resume/ResumeDocument";
import { ExportChecklistModal } from "@/components/resume/ExportChecklistModal";
import { TextPreviewModal } from "@/components/resume/TextPreviewModal";
import { SAMPLE_RESUME_DATA } from "@/components/resume/data";
import { Section, Specimen, StateGrid, StateCell, NotRendered, Reveal, ClippedStage, ProposedLoading, ProposedError, ProposedEmpty, LiveRoute, EDGE, noop } from "../kit";

const STUDENT = getRoster()[0];
const SIGNER: Signer = { name: "Sarah Chen", role: "School Counselor" };
const LAB_CATALOG = labCatalog();

/** Every overlay Specimen mounts through this: a real controlled `open`
 *  state and a real `onClose` wired to it, so the modal's own Close button
 *  (or Escape) actually closes it. The outer Reveal unmounts it entirely. */
function OverlayDemo({ render }: { render: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return <>{render(() => setOpen(false))}</>;
}

function InfoDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <InfoButton onClick={() => setOpen(true)} />
      <InfoSheet screen={{ heading: "This screen", bullets: ["A short bullet about this screen.", "A second short bullet."] }} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function OverlaysSection() {
  return (
    <Section
      id="overlays"
      title="Overlays"
      intro="Modals, panels and sheets, app-wide. Each one below opens behind its own button so nothing heavy mounts on page load, exactly one at a time."
    >
      <Specimen name="Tip / IconTip" file="src/components/app/IconTip.tsx" purpose="The tooltip every icon-only control shows on hover and keyboard focus: portalled, flips above when short on room below, and clamps to the viewport." when="Any icon-only button, app-wide, the house rule for icon-only controls.">
        <StateGrid min={240}>
          <StateCell label="Default" note="Hover or Tab to each icon to see its label.">
            <div className="flex items-center gap-[var(--space-3)]">
              <IconTip label="Notifications">
                <button type="button" aria-label="Notifications" className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><Bell className="h-5 w-5" aria-hidden /></button>
              </IconTip>
              <IconTip label="Share">
                <button type="button" aria-label="Share" className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><Share2 className="h-5 w-5" aria-hidden /></button>
              </IconTip>
            </div>
          </StateCell>
          <StateCell label="Near the edge" note="Pinned to this cell's own right edge, IconTip clamps its bubble inward from the real viewport edge the same way, so it never spills off-screen.">
            <div className="flex w-full justify-end">
              <IconTip label="Clamped near the edge">
                <button type="button" aria-label="Clamped near the edge" className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><Bell className="h-5 w-5" aria-hidden /></button>
              </IconTip>
            </div>
          </StateCell>
          <StateCell label="off" note="Suppresses the bubble entirely, e.g. while the control's own panel is already open.">
            <IconTip label="Notifications" off>
              <button type="button" aria-label="Notifications" className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><Bell className="h-5 w-5" aria-hidden /></button>
            </IconTip>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="WelcomeSplash" file="src/components/app/WelcomeSplash.tsx" purpose="The full-screen welcome modal: Dreamy, a scene-specific line, one CTA." when="A host screen's own open state (FirstVisitSplash wraps this for the storage-backed first-visit case; this is the modal itself).">
        <StateGrid min={320}>
          <StateCell label="Default" minH={420} note="No Escape or backdrop dismiss built (there is no backdrop click target and no keydown listener): the one CTA is deliberately the only way through.">
            <Reveal label="Open WelcomeSplash" height={420}>
              <OverlayDemo render={(close) => <WelcomeSplash surface="play" open onDone={close} />} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Coachmark / GestureSpotlight" file="src/components/flow/GestureSpotlight.tsx" purpose="A portalled callout pointing at a live target, with an optional spotlight dimmer, for first-run guided hints." when="Guiding a student to a real control the first time it matters.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <NotRendered reason="Gated by a module-private COACHMARKS_ENABLED = false inside the file; `active` is always false regardless of the `active` prop passed in, so no prop can force it on." see="src/components/flow/GestureSpotlight.tsx" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SidePanel" file="src/components/counselor/v4/SidePanel.tsx" purpose="A right-hand slide-in detail panel: Portal, a click-outside backdrop, Escape to close." when="A card's full breakdown in the Counselor Dashboard (Review Queue, Milestone Tracker rows, etc.).">
        <StateGrid min={320}>
          <StateCell label="Default" minH={420} note="Escape and the backdrop click both really close it (real keydown listener + a backdrop button, not just the X). Its own content area is overflow-y-auto without the shared dm-scroll class (house rule gap, not fixed here).">
            <Reveal label="Open SidePanel" height={420}>
              <OverlayDemo render={(close) => (
                <SidePanel open onClose={close} title="Jordan Rivera" subtitle="Grade 11 · Academic Plan">
                  <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Panel content goes here.</p>
                </SidePanel>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Long content (scroll)" minH={420}>
            <Reveal label="Open SidePanel" height={420}>
              <OverlayDemo render={(close) => (
                <SidePanel open onClose={close} title="Jordan Rivera" subtitle="Grade 11 · Academic Plan">
                  {Array.from({ length: 10 }, (_, i) => <p key={i} className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>{EDGE.longBody}</p>)}
                </SidePanel>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Loading inside" kind="built" minH={420} note="The real shared LoadingView (states.tsx) composed inside the real, interactive SidePanel -- not an invented look.">
            <Reveal label="Open SidePanel" height={420}>
              <OverlayDemo render={(close) => (
                <SidePanel open onClose={close} title="Jordan Rivera" subtitle="Grade 11 · Academic Plan">
                  <ProposedLoading shape="list" />
                </SidePanel>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Error inside" kind="built" minH={420} note="The real shared ErrorView composed inside the real SidePanel.">
            <Reveal label="Open SidePanel" height={420}>
              <OverlayDemo render={(close) => (
                <SidePanel open onClose={close} title="Jordan Rivera" subtitle="Grade 11 · Academic Plan">
                  <ProposedError verb="load this student's plan" />
                </SidePanel>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Empty inside" kind="built" minH={420} note="The real shared EmptyView composed inside the real SidePanel.">
            <Reveal label="Open SidePanel" height={420}>
              <OverlayDemo render={(close) => (
                <SidePanel open onClose={close} title="Jordan Rivera" subtitle="Grade 11 · Academic Plan">
                  <ProposedEmpty tier={3} line="Nothing logged for this student yet." />
                </SidePanel>
              )} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DrillPanel" file="src/components/counselor/v4/Drill.tsx" purpose="A roster drill-down panel opened from a chart segment or stat row." when="Overview's donut segments and stat rows, drilling into the matching students.">
        <StateGrid min={260}>
          <StateCell label="In the app">
            <LiveRoute href="/counselor" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DetailPane" file="src/components/counselor/chips.tsx" purpose="A master-detail screen's detail half." when="Review Queue, Counselor Connect and other master-detail Counselor Dashboard screens.">
        <StateGrid min={280}>
          <StateCell label="open" minH={160} note="A grid child on lg and up (always in flow there, `open` or not); only below lg does `open` turn it into the fixed bottom sheet with a Close bar shown here.">
            <ClippedStage height={160}>
              <DetailPane open onClose={noop}>
                <p className="text-[13.5px]" style={{ color: "var(--foreground)" }}>Detail content goes here.</p>
              </DetailPane>
            </ClippedStage>
          </StateCell>
          <StateCell label="Loading" kind="built" minH={160} note="The real shared LoadingView composed inside the real DetailPane.">
            <ClippedStage height={160}>
              <DetailPane open onClose={noop}><ProposedLoading shape="list" /></DetailPane>
            </ClippedStage>
          </StateCell>
          <StateCell label="Error" kind="built" minH={160} note="The real shared ErrorView composed inside the real DetailPane.">
            <ClippedStage height={160}>
              <DetailPane open onClose={noop}><ProposedError verb="load this row's detail" /></DetailPane>
            </ClippedStage>
          </StateCell>
          <StateCell label="Empty" kind="built" minH={160} note="The real shared EmptyView composed inside the real DetailPane.">
            <ClippedStage height={160}>
              <DetailPane open onClose={noop}><ProposedEmpty tier={3} line="Nothing selected yet." /></DetailPane>
            </ClippedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DocumentPage (Desk) + FitPage" file="src/components/counselor/v4/DocumentDesk.tsx" purpose="One US Letter page (816x1056) at real size, scaled to fit its container by FitPage, the same layout on the desk, full screen and in print." when="Productivity Suite's document drafts (recommendation letters, meeting briefs, plans).">
        <StateGrid min={280}>
          <StateCell label="Drafted" minH={260}>
            <FitPage>
              <DocumentDeskPage kind="recommendation-letter" student={STUDENT} letterType="Academic strength" signer={SIGNER} draft="It is my privilege to recommend this student without reservation." onDraft={noop} />
            </FitPage>
          </StateCell>
          <StateCell label="Empty (ghost hint)" minH={260}>
            <FitPage>
              <DocumentDeskPage kind="student-brief" student={STUDENT} letterType="" signer={SIGNER} draft={null} onDraft={noop} />
            </FitPage>
          </StateCell>
          <StateCell label="Loading (drafting)" kind="built" minH={260} note="The real shared LoadingView composed inside the real FitPage frame.">
            <FitPage><ProposedLoading shape="document" label="Drafting" /></FitPage>
          </StateCell>
          <StateCell label="Error" kind="built" minH={260} note="The real shared ErrorView composed inside the real FitPage frame.">
            <FitPage><ProposedError verb="draft this document" /></FitPage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FullScreenDocument" file="src/components/counselor/v4/DocumentDesk.tsx" purpose="The document's own full-screen, dark-chrome viewer: zoom, print, an optional Share menu." when="A document's 'Full screen' button (FullScreenButton).">
        <StateGrid min={320}>
          <StateCell label="Default" minH={480} note="onPrint is a no-op here; for real it calls printDocumentPage(...), which opens the system print dialog. Not clicked in this lab. Escape and its own Close button both really close it.">
            <Reveal label="Open FullScreenDocument" height={480}>
              <OverlayDemo render={(close) => (
                <FullScreenDocument open onClose={close} title="Recommendation Letter" onPrint={noop} share={[{ label: "Copy link", icon: Share2, onClick: noop }]}>
                  <DocumentDeskPage kind="recommendation-letter" student={STUDENT} letterType="Academic strength" signer={SIGNER} draft="It is my privilege to recommend this student without reservation." onDraft={noop} />
                </FullScreenDocument>
              )} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DocumentPreviewModal" file="src/components/counselor/v4/DocumentPreview.tsx" purpose="A centered, realistic PDF-viewer chrome around a milestone attachment's rendered page. Its own DocumentPage export clashes by name with DocumentDesk's, imported here as DocumentPreviewPage." when="A milestone attachment opened from Review Queue or a roster row.">
        <StateGrid min={320}>
          <StateCell label="Default" minH={480} note="Escape and the backdrop click both really close it.">
            <Reveal label="Open DocumentPreviewModal" height={480}>
              <OverlayDemo render={(close) => (
                <DocumentPreviewModal open onClose={close} fileName="resume.pdf" kb={184}>
                  <DocumentPreviewPage student={STUDENT} milestone="Resume" />
                </DocumentPreviewModal>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Loading" kind="built" minH={480} note="The real shared LoadingView composed inside the real, interactive DocumentPreviewModal.">
            <Reveal label="Open DocumentPreviewModal" height={480}>
              <OverlayDemo render={(close) => (
                <DocumentPreviewModal open onClose={close} fileName="resume.pdf" kb={184}>
                  <ProposedLoading shape="document" label="Loading preview" />
                </DocumentPreviewModal>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Error" kind="built" minH={480} note="The real shared ErrorView composed inside the real DocumentPreviewModal.">
            <Reveal label="Open DocumentPreviewModal" height={480}>
              <OverlayDemo render={(close) => (
                <DocumentPreviewModal open onClose={close} fileName="resume.pdf" kb={184}>
                  <ProposedError verb="open this file" />
                </DocumentPreviewModal>
              )} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Top3SwapModal" file="src/components/career/Top3SwapModal.tsx" purpose="Top 3 is full: pick one saved career to swap out for the incoming one. Pure, no store reads or writes of its own." when="Career Detail's '+' action once the student's Top 3 already has three.">
        <StateGrid min={320}>
          <StateCell label="Default" minH={360} note="Closes on a backdrop click (onPointerUp checks the target), but has no Escape-key handler, unlike every other overlay in this section (gap, not fixed here).">
            <Reveal label="Open Top3SwapModal" height={360}>
              <OverlayDemo render={(close) => (
                <Top3SwapModal incomingId="marine-biologist" currentIds={["software-engineer", "registered-nurse", "product-designer"]} onConfirm={close} onCancel={close} />
              )} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ConnectWithProfessionalsModal" file="src/components/career/ConnectWithProfessionalsModal.tsx" purpose="A guided, three-step introduction to a world's professional community: ask a question, browse insights, follow a pro, with a Dream Score reward chain." when="Career Detail's 'Connect with professionals' card.">
        <StateGrid min={320}>
          <StateCell label="Default" minH={200}>
            <LiveRoute href="/career/software-engineer" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DetailModal" file="src/components/flow-lab/shared.tsx" purpose="The Flow Lab's in-place career detail: photo, what you'd do, good fit if, school and path, then Save / Add to Top 3." when="Tapping a card in any Flow Lab screen.">
        <StateGrid min={320}>
          <StateCell label="Default" minH={480} note="Escape, the backdrop click, and Left/Right arrow (onPrev/onNext) all really work here.">
            <Reveal label="Open DetailModal" height={480}>
              <OverlayDemo render={(close) => <DetailModal career={LAB_CATALOG[0]} control="save" selected={false} full={false} onToggle={noop} onClose={close} />} />
            </Reveal>
          </StateCell>
          <StateCell label="Selected, full" minH={480}>
            <Reveal label="Open DetailModal" height={480}>
              <OverlayDemo render={(close) => <DetailModal career={LAB_CATALOG[1]} control="pick" selected full onToggle={noop} onClose={close} />} />
            </Reveal>
          </StateCell>
          <StateCell label="Long content (scroll)" minH={480} note="Its own scroll container is flow-scroll, not the shared dm-scroll class every other overlay uses (gap, not fixed here). Three real sections (What You'd Do / Good Fit If You Like / School & Path) plus the chip row already push most careers past the 480px frame here.">
            <Reveal label="Open DetailModal" height={480}>
              <OverlayDemo render={(close) => <DetailModal career={LAB_CATALOG[2]} control="save" selected={false} full={false} onToggle={noop} onClose={close} />} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TopThreeScreen" file="src/components/flow-lab/shared.tsx" purpose="My Profile > Top Three, drawn around the lab's own three picks: one Change control per card, Explore more and Saved below." when="After ranking, the Flow Lab's landing screen.">
        <StateGrid min={360}>
          <StateCell label="Default" minH={420}>
            <Reveal label="Open TopThreeScreen" height={420}>
              <TopThreeScreen top3={LAB_CATALOG.slice(0, 3)} pool={LAB_CATALOG.slice(0, 8)} poolLabel="Saved" onExploreMore={noop} onOpenPool={noop} onRemove={noop} onReplace={noop} onNext={noop} />
            </Reveal>
          </StateCell>
          <StateCell label="Fewer than 3 (empty slots)" minH={420} note="Built empty-slot treatment: a dashed #N tile that opens the pool, no invented copy.">
            <Reveal label="Open TopThreeScreen" height={420}>
              <TopThreeScreen top3={LAB_CATALOG.slice(0, 1)} pool={LAB_CATALOG.slice(0, 8)} poolLabel="Saved" onExploreMore={noop} onOpenPool={noop} onRemove={noop} onReplace={noop} onNext={noop} />
            </Reveal>
          </StateCell>
          <StateCell label="Empty pool, changing" minH={420} note="Click a card's Change control: built fallback line when nothing else is saved to swap in ('Save more careers to swap one in.')."><Reveal label="Open TopThreeScreen" height={420}>
              <TopThreeScreen top3={LAB_CATALOG.slice(0, 3)} pool={LAB_CATALOG.slice(0, 3)} poolLabel="Saved" onExploreMore={noop} onOpenPool={noop} onRemove={noop} onReplace={noop} onNext={noop} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RankSlots" file="src/components/flow-lab/shared.tsx" purpose="The rank screen's three numbered slots; a fourth career tapped while full turns every slot into a swap target instead of a wall." when="The Flow Lab's Rank screen.">
        <StateGrid min={260}>
          <StateCell label="Empty"><RankSlots picks={[]} onClear={noop} /></StateCell>
          <StateCell label="Partial"><RankSlots picks={LAB_CATALOG.slice(0, 2)} onClear={noop} /></StateCell>
          <StateCell label="Full, swap offered" note="A fourth career tapped while full turns every slot into a swap target."><RankSlots picks={LAB_CATALOG.slice(0, 3)} onClear={noop} incoming={LAB_CATALOG[3]} onSwap={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PicksTray" file="src/components/flow-lab/shared.tsx" purpose="A row of small avatar dots, one per saved slot; empty slots stay dashed outlines." when="A Flow Lab screen's header, showing progress toward the save limit.">
        <StateGrid min={200}>
          <StateCell label="Empty"><PicksTray saved={[]} max={3} /></StateCell>
          <StateCell label="Partial"><PicksTray saved={LAB_CATALOG.slice(0, 1)} max={3} /></StateCell>
          <StateCell label="Full"><PicksTray saved={LAB_CATALOG.slice(0, 3)} max={3} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BottomBar" file="src/components/flow-lab/shared.tsx" purpose="The Flow Lab's floating bottom action dock: status text, an optional leading control, one primary CTA." when="Every Flow Lab screen's footer.">
        <StateGrid min={320}>
          <StateCell label="Default" minH={100}>
            <ClippedStage height={100}><BottomBar status="2 of 3 saved" cta="Continue" onCta={noop} /></ClippedStage>
          </StateCell>
          <StateCell label="CTA disabled" minH={100}>
            <ClippedStage height={100}><BottomBar status="Save at least 1 to continue" cta="Continue" onCta={noop} ctaDisabled /></ClippedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ResumeModal" file="src/components/resume/ui.tsx" purpose="The shared resume popup chrome: a full-screen overlay by default, or an inline in-place swap for the document toolbar's own panels." when="Every Add/Edit flow in the Resume Builder (ExperienceModal, SkillsPicker, ExportChecklistModal, TextPreviewModal, etc. all wrap this).">
        <StateGrid min={280}>
          <StateCell label="overlay" minH={280} note="Escape and the backdrop click both really close it; its own content area already carries dm-scroll.">
            <Reveal label="Open ResumeModal" height={280}>
              <OverlayDemo render={(close) => (
                <ResumeModal title="Add certification" onClose={close}>
                  <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>A wizard step&apos;s fields render here.</p>
                </ResumeModal>
              )} />
            </Reveal>
          </StateCell>
          <StateCell label="Long content (scroll)" minH={280}>
            <Reveal label="Open ResumeModal" height={280}>
              <OverlayDemo render={(close) => (
                <ResumeModal title="Add certification" onClose={close}>
                  {Array.from({ length: 8 }, (_, i) => <p key={i} className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>{EDGE.longBody}</p>)}
                </ResumeModal>
              )} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ZoomResumeModal" file="src/components/resume/ResumeDocument.tsx" purpose="A full-bleed, zoomable read of the whole resume." when="The Resume Builder's own 'zoom' action.">
        <StateGrid min={320}>
          <StateCell label="Default" minH={480}>
            <Reveal label="Open ZoomResumeModal" height={480}>
              <OverlayDemo render={(close) => <ZoomResumeModal open onClose={close} resume={SAMPLE_RESUME_DATA} title="Resume preview" />} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ExportChecklistModal" file="src/components/resume/ExportChecklistModal.tsx" purpose="Confirm six statements before either export unlocks (confirmed live against the reference)." when="The Resume Builder's Export action.">
        <StateGrid min={280}>
          <StateCell label="Default" minH={420} note="Its own Download button reads 'Preparing…' while downloadDocx runs, not clicked in this lab.">
            <Reveal label="Open ExportChecklistModal" height={420}>
              <OverlayDemo render={(close) => <ExportChecklistModal resume={SAMPLE_RESUME_DATA} onClose={close} />} />
            </Reveal>
          </StateCell>
          <StateCell label="Error" kind="built" note="No error prop on ExportChecklistModal itself if the download fails, but the inline voice shown here is the real shared ErrorView (states.tsx), not an invented look.">
            <ProposedError variant="inline" verb="prepare the download" fallback="try Export PDF instead" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TextPreviewModal" file="src/components/resume/TextPreviewModal.tsx" purpose="Plain text the way an ATS parser sees the resume, built straight from the data model, not scraped off the visual document." when="The Resume Builder's 'ATS text preview' action.">
        <StateGrid min={280}>
          <StateCell label="Default" minH={360}>
            <Reveal label="Open TextPreviewModal" height={360}>
              <OverlayDemo render={(close) => <TextPreviewModal resume={SAMPLE_RESUME_DATA} onClose={close} />} />
            </Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="InfoButton / InfoSheet" file="src/components/flow-lab/notes.tsx" purpose="The (i) note explaining a Flow Lab screen: what was built from the note as written, what the lab added on top, and that it's a mock, not final." when="Every Flow Lab screen's own corner.">
        <StateGrid min={280}>
          <StateCell label="Default" minH={200} note="Click the (i) to open the sheet.">
            <Reveal label="Show InfoButton" height={480}><InfoDemo /></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>
    </Section>
  );
}
