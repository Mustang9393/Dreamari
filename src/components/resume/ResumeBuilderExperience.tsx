"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react";
import { Download, FileText, Pencil, Sparkles, Wand2, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DreamyGuide } from "@/components/build/DreamyGuide";
import { makeId, readResume, resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, upsertVersion, type ResumeData, type ResumeExperience as ResumeExperienceEntry, type ResumeVersion } from "@/lib/resume";
import { ATSCheckPanel } from "./ATSCheckPanel";
import { DEFAULT_RESUME_TEMPLATE, RESUME_WIZARD_DREAMY, type ResumeTemplateId } from "./data";
import { ExperienceModal } from "./ExperienceModal";
import { ExportChecklistModal } from "./ExportChecklistModal";
import { JobMatchPanel } from "./JobMatchPanel";
import { ResumeExperience } from "./ResumeExperience";
import { ResumeDocument, ZoomResumeButton } from "./ResumeDocument";
import { TailorScreen } from "./TailorScreen";
import { TemplateGallery } from "./TemplateGallery";
import { TextPreviewModal } from "./TextPreviewModal";
import { useResumeToast, WizardProgress } from "./ui";
import { CertificationsStep, EducationStep, ExperienceStep, PersonalInfoStep, ReviewStep, SkillsStep } from "./wizardSteps";

// Which resume section the live preview auto-scrolls to as the student
// moves through the wizard -- matches the `data-section` markers each
// ResumeDocument layout carries (ResumeDocument.tsx).
// Personal Info (step 0) stays null on purpose (direct feedback, 14 Sept
// 2026: "the first zoom is just a scroll down and i dont think its needed
// for the first part... keep it so the preview shows the full header
// including the margin on top") -- nothing to scroll to yet, so the
// preview just rests at its natural top position instead of zooming into
// the header for no reason.
const WIZARD_STEP_SECTIONS = [null, "education", "experience", "skills", "certifications", null] as const;

// The 6-step wizard, full screen: a dedicated route rather than living under
// Profile's own tab chrome (direct feedback, 14 Sept 2026 -- squeezed under
// the profile header + tab row, it lost too much room, mobile worst of all).
// Data still writes straight to the shared resume store, so leaving mid-way
// (the close button, a browser back) loses nothing already entered.
//
// useSearchParams needs a Suspense boundary around it in Next's app router.
export function ResumeBuilderExperience() {
  return (
    <Suspense fallback={null}>
      <ResumeBuilderInner />
    </Suspense>
  );
}

// Outer gutter always matches Home/Explore/Profile (direct feedback, 14
// Sept 2026: "match the margins to the other screens... every screen
// should have the same margins"): max-w-[1440px] + px-5/sm:px-[space-14],
// the exact classes those pages use. A view that wants a narrower reading
// column (a form, a document) centers one inside that same outer gutter
// via contentMaxWidth rather than shrinking the gutter itself.
function Shell({ children, contentMaxWidth, tabs }: { children: ReactNode; contentMaxWidth?: number; tabs?: ReactNode }) {
  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      {/* Rendered full-bleed, BEFORE the padded content column below, so a
         sticky tabs bar docks flush at the true top of the page -- inside
         the padded column it sat under the column's own top padding,
         reading as a floating panel with a gap above it (direct feedback,
         16 Sept 2026: "why are they in a floating black box with gaps on
         top and below"). */}
      {tabs}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-[var(--space-14)] sm:pt-8">
        {contentMaxWidth ? <div className="mx-auto flex w-full flex-1 flex-col" style={{ maxWidth: contentMaxWidth }}>{children}</div> : children}
      </div>
    </div>
  );
}

// The replit reference keeps three peer sections always reachable in one
// persistent nav (Resume Builder / Saved Resumes / Choose & Tailor), not
// a directed one-way flow -- direct instruction, 16 Sept 2026: "match it
// exactly". Scoped to the screens that actually correspond to those three
// (template pick + wizard, the saved list, and name/education/template
// selection); the finished document keeps its own header, which already
// covers the reference's equivalent actions (ATS Check, Export, etc.).
function ResumeBuilderTabs({ active, router, onClose }: { active: "builder" | "saved" | "tailor"; router: ReturnType<typeof useRouter>; onClose: () => void }) {
  const items: { key: typeof active; label: string; href: string }[] = [
    { key: "builder", label: "Resume Builder", href: "/resume-builder" },
    { key: "saved", label: "Saved Resumes", href: "/resume-builder?view=list" },
    { key: "tailor", label: "Choose & Tailor", href: "/resume-builder?view=tailor" },
  ];
  return (
    <div
      data-print-hide
      // Sticky, not just top-of-page -- it was scrolling out of view on
      // any tall step (direct feedback, 16 Sept 2026: "make sure they are
      // more prominent and always visible/sticky"), same pattern
      // WizardFooter already uses for staying put at the bottom. Full-bleed
      // (Shell renders this outside its own padded column) so it docks
      // flush at the page's true top edge instead of floating under the
      // column's own top padding.
      className="sticky top-0 z-30 w-full backdrop-blur-md"
      style={{ borderBottom: "1px solid var(--glass-border)", background: "color-mix(in srgb, var(--background) 78%, transparent)" }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-[var(--space-4)] px-5 pt-[max(14px,env(safe-area-inset-top))] sm:px-[var(--space-14)]">
        {/* Active tab already says what this page is -- a separate
           "Resume Builder" title repeated the same word right below it
           (direct feedback, 16 Sept 2026: "it already says what it is in
           the tabs label, make those bigger"), so the tabs carry both the
           page identity and the navigation now. */}
        <div role="tablist" aria-label="Resume Builder sections" className="flex flex-none gap-[var(--space-6)]">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => router.push(item.href)}
                className="relative cursor-pointer pb-[14px] text-[16px] font-extrabold whitespace-nowrap sm:text-[17px]"
                style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-display)" }}
              >
                {item.label}
                {isActive && <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] rounded-full" style={{ background: "var(--primary)" }} />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Close and return to Profile"
          onClick={onClose}
          className="dm-quiet mb-[10px] flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
          style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function TopBar({ label, onClose, extra }: { label: string; onClose?: () => void; extra?: ReactNode }) {
  return (
    <div data-print-hide className="mb-[var(--space-5)] flex flex-none flex-wrap items-center justify-between gap-[var(--space-3)]">
      <span className="text-[13px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <div className="flex items-center gap-[var(--space-3)]">
        {extra}
        {onClose && (
          <button
            type="button"
            aria-label="Close and return to Profile"
            onClick={onClose}
            className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border"
            style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

function DocumentScreen({ resume, title, onBack, backLabel, editHref, router, templateId, version }: { resume: ResumeData; title: string; onBack: () => void; backLabel: string; editHref?: string; router: ReturnType<typeof useRouter>; templateId: string; version?: ResumeVersion }) {
  const [panel, setPanel] = useState<"none" | "tailor" | "ats" | "text" | "export">("none");
  return (
    <Shell contentMaxWidth={900}>
      <TopBar
        label={title}
        onClose={() => router.push("/profile?tab=resume")}
        extra={
          <>
            {version && (
              <button
                type="button"
                data-print-hide
                onClick={() => setPanel("tailor")}
                className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <Wand2 className="h-4 w-4" aria-hidden /> Tailor Resume
              </button>
            )}
            {version && (
              <button
                type="button"
                data-print-hide
                onClick={() => setPanel("ats")}
                className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <Sparkles className="h-4 w-4" aria-hidden /> ATS Check
              </button>
            )}
            <button
              type="button"
              data-print-hide
              onClick={() => setPanel("text")}
              className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              <FileText className="h-4 w-4" aria-hidden /> Text Preview
            </button>
            <ZoomResumeButton resume={resume} templateId={templateId} title={title} />
            <button
              type="button"
              data-print-hide
              onClick={() => setPanel("export")}
              className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              <Download className="h-4 w-4" aria-hidden /> Export
            </button>
            {editHref && (
              <button
                type="button"
                data-print-hide
                onClick={() => router.push(editHref)}
                className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <Pencil className="h-4 w-4" aria-hidden /> Edit Selection
              </button>
            )}
          </>
        }
      />
      {panel === "tailor" && version ? (
        <JobMatchPanel resume={resume} version={version} onClose={() => setPanel("none")} />
      ) : panel === "ats" && version ? (
        <ATSCheckPanel resume={resume} version={version} onClose={() => setPanel("none")} />
      ) : panel === "text" ? (
        <TextPreviewModal resume={resume} onClose={() => setPanel("none")} />
      ) : panel === "export" ? (
        <ExportChecklistModal resume={resume} onClose={() => setPanel("none")} />
      ) : (
        <ResumeDocument resume={resume} templateId={templateId} />
      )}
      <button
        type="button"
        data-print-hide
        onClick={onBack}
        className="dm-link mt-[var(--space-4)] cursor-pointer self-center text-[13.5px] font-bold"
        style={{ color: "var(--accent-subtle)" }}
      >
        {backLabel}
      </button>
    </Shell>
  );
}

function ResumeBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const [stepIndex, setStepIndex] = useState(0);
  const [reactionNonce, setReactionNonce] = useState(0);
  const react = () => setReactionNonce((n) => n + 1);
  const [experienceModal, setExperienceModal] = useState<ResumeExperienceEntry | null | "new">(null);
  // Set by a step that's swapped its own body for a sub-flow with its own
  // DreamyGuide (SkillsStep's category picker) -- suppresses the wizard's
  // own top-level Dreamy so only one ever shows at once, not stacked
  // (direct feedback, 16 Sept 2026: "two dreamys on screen"). Experience's
  // sub-flow doesn't need this passed in -- the parent already knows
  // `experienceModal !== null` directly.
  const [subDreamy, setSubDreamy] = useState<{ sprite: string; line: string } | null>(null);
  // Which `data-field` the live preview's camera should pan to right now --
  // set by whichever drawer field is focused (`${entryId}:${fieldKind}`),
  // cleared back to section-level framing when the drawer closes or the
  // step changes (direct feedback, 15 Sept 2026: "the camera tracking all
  // updates one by one, per field... after one section is done it can fit
  // the whole section... before we move on" -- that whole-section fit is
  // just what ResumeDocument already does once activeField goes back to
  // null, no separate state needed for it).
  const [activeField, setActiveField] = useState<string | null>(null);
  const goToStep = (i: number) => { setActiveField(null); setSubDreamy(null); setStepIndex(i); };
  const { toast, showToast } = useResumeToast();

  const backToProfile = () => router.push("/profile?tab=resume");
  const view = searchParams.get("view");
  const versionId = searchParams.get("version");
  const activeVersion = versionId ? (resume.versions.find((v) => v.id === versionId) ?? null) : null;
  // Carried from the template gallery into wizard/tailor so the FIRST save
  // uses what was actually picked, not always the default.
  const pickedTemplate = (searchParams.get("template") as ResumeTemplateId | null) ?? undefined;

  if (view === "list") {
    return (
      <Shell contentMaxWidth={900} tabs={<ResumeBuilderTabs active="saved" router={router} onClose={backToProfile} />}>
        <ResumeExperience />
      </Shell>
    );
  }

  if (view === "templates") {
    return (
      <Shell contentMaxWidth={1200} tabs={<ResumeBuilderTabs active="builder" router={router} onClose={backToProfile} />}>
        <TopBar label="New Resume" />
        <TemplateGallery
          onSelect={(templateId) => {
            const isFirstResume = readResume().versions.length === 0;
            router.push(isFirstResume ? `/resume-builder?view=wizard&template=${templateId}` : `/resume-builder?view=tailor&template=${templateId}`);
          }}
        />
      </Shell>
    );
  }

  if (view === "tailor") {
    // Name it, pick what's in it, pick a template -- matching to a job is
    // its own separate thing now (JobMatchPanel, opened from the finished
    // document), so this screen isn't called "Tailor" anymore either
    // (direct feedback, 15 Sept 2026: "the tailoring happens as a
    // seperate thing from the last naming/template changer"). Present
    // (not resume-home's "Edit" button, not "Edit Selection" on a
    // finished document -- both append &edit=1) whenever this is still
    // part of creating the resume: straight from finishing the wizard, or
    // from picking a template for another one.
    const isEditingExisting = searchParams.get("edit") === "1";
    return (
      <Shell contentMaxWidth={760} tabs={<ResumeBuilderTabs active="tailor" router={router} onClose={backToProfile} />}>
        <TopBar label={activeVersion ? "Edit Selection" : "New Resume"} />
        <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          <TailorScreen
            resume={resume}
            initial={activeVersion}
            initialTemplateId={pickedTemplate}
            skippable={!isEditingExisting}
            onCancel={backToProfile}
            onSaved={(saved) => router.push(`/resume-builder?view=version&version=${saved.id}`)}
          />
        </div>
      </Shell>
    );
  }

  if (view === "version" && activeVersion) {
    return (
      <DocumentScreen
        resume={resumeForVersion(resume, activeVersion)}
        title={activeVersion.name}
        onBack={backToProfile}
        backLabel="Back to Resumes"
        editHref={`/resume-builder?view=tailor&version=${activeVersion.id}&edit=1`}
        router={router}
        templateId={activeVersion.template}
        version={activeVersion}
      />
    );
  }

  if (view === "document") {
    return <DocumentScreen resume={resume} title="Your Resume" onBack={backToProfile} backLabel="Back to Resumes" router={router} templateId={DEFAULT_RESUME_TEMPLATE} />;
  }

  const dreamy = RESUME_WIZARD_DREAMY[stepIndex];
  const showWizardDreamy = !(stepIndex === 2 && experienceModal !== null) && !subDreamy;

  return (
    <Shell tabs={<ResumeBuilderTabs active="builder" router={router} onClose={backToProfile} />}>
      {/* The preview gets the larger share of the row now (direct feedback,
         14 Sept 2026: "give the preview more prominence... more width so we
         can see it better") -- the preview column runs 20% wider than the
         form column (direct feedback, 15 Sept 2026), both flexible so the
         ratio holds as the viewport grows. */}
      <div className="grid grid-cols-1 items-start gap-[var(--space-6)] lg:grid-cols-[minmax(420px,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-[var(--space-5)]">
          {/* Empty, matching-height spacer -- the live preview column's own
             "Live Preview / Full Screen" row (below) is the same height, so
             the card and the document start at the same Y instead of the
             two frames drifting apart (direct feedback, 16 Sept 2026: "I
             need these two frames to be aligned"). Dreamy himself lives
             inside the card's own surface, not out here (direct feedback,
             16 Sept 2026: "Dreamy should sit inside the left panel
             surface") -- perched on the card's top edge below, his head
             pokes up into the top of this reserved band rather than the
             band holding him directly. */}
          <div aria-hidden className="hidden flex-none lg:block lg:min-h-[56px]" />
          <div
            className={`relative flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border px-[var(--space-6)] pb-[var(--space-6)] ${showWizardDreamy ? "pt-[34px]" : "pt-[var(--space-6)]"}`}
            style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
          >
            {showWizardDreamy && (
              <div className="absolute -top-[24px] right-[var(--space-6)] left-[var(--space-6)]">
                <DreamyGuide sprite={dreamy.sprite} line={dreamy.line} reactionNonce={reactionNonce} size="sm" />
              </div>
            )}
            <WizardProgress stepIndex={stepIndex} />
            {stepIndex === 0 && <PersonalInfoStep resume={resume} onNext={() => { react(); goToStep(1); }} showToast={showToast} onFieldFocus={setActiveField} />}
            {stepIndex === 1 && <EducationStep resume={resume} onNext={() => { react(); goToStep(2); }} onBack={() => goToStep(0)} showToast={showToast} onFieldFocus={setActiveField} />}
            {stepIndex === 2 && (
              // In-place, like Education/Certifications: the drawer swaps
              // this same card's body rather than floating over it, so
              // there's never a second layer sitting on top of the list.
              experienceModal !== null ? (
                <ExperienceModal
                  initial={experienceModal === "new" ? null : experienceModal}
                  onClose={() => { setActiveField(null); setExperienceModal(null); }}
                  onSaved={(title) => {
                    setActiveField(null);
                    setExperienceModal(null);
                    showToast(`${title} added`);
                  }}
                  onFieldFocus={setActiveField}
                />
              ) : (
                <ExperienceStep
                  resume={resume}
                  onNext={() => { react(); goToStep(3); }}
                  onBack={() => goToStep(1)}
                  onAdd={() => setExperienceModal("new")}
                  onEdit={(entry) => setExperienceModal(entry)}
                />
              )
            )}
            {stepIndex === 3 && <SkillsStep resume={resume} onNext={() => { react(); goToStep(4); }} onBack={() => goToStep(2)} onSubDreamy={setSubDreamy} />}
            {stepIndex === 4 && <CertificationsStep resume={resume} onNext={() => { react(); goToStep(5); }} onBack={() => goToStep(3)} showToast={showToast} onFieldFocus={setActiveField} />}
            {stepIndex === 5 && (
              <ReviewStep
                resume={resume}
                onBack={() => goToStep(4)}
                onEditStep={(step) => goToStep(step)}
                onFinish={() => {
                  react();
                  // First finish with nothing saved yet: create a real,
                  // named resume right away instead of only a preview, so
                  // "Your Resumes" isn't confusingly empty right after
                  // finishing (direct feedback, 14 Sept 2026 -- "there is an
                  // alex chen resume right there" pointing at exactly this
                  // gap). Uses whatever template was picked on the way in
                  // (the gallery, if this came from there); falls back to
                  // the default when the wizard was entered directly (e.g.
                  // "Edit My Info" on an existing resume). Routes into
                  // Tailor next, not straight to the finished document --
                  // Choose & Tailor (which education/experience to include,
                  // and matching to a job description) is a real step in
                  // the reference flow, not a thing you stumble into later
                  // via "Edit Selection" on the finished resume (direct
                  // feedback, 15 Sept 2026: "matching the job is hidden in
                  // the last screen inside edit selection... tailor resume
                  // is a big part of the flow in the replit"). Later
                  // finishes (editing shared info via "Edit My Info") just
                  // go to the full preview -- there's no new version being
                  // created there to tailor.
                  const current = readResume();
                  if (current.versions.length === 0) {
                    const name = `${current.profile.firstName} ${current.profile.lastName}`.trim() || "My Resume";
                    const version: ResumeVersion = {
                      id: makeId(),
                      name,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                      educationIds: current.education.map((e) => e.id),
                      experienceIds: current.experience.map((e) => e.id),
                      jobDescription: "",
                      targetPosition: "",
                      targetCompany: "",
                      template: pickedTemplate ?? DEFAULT_RESUME_TEMPLATE,
                      atsCheck: null,
                    };
                    upsertVersion(version);
                    router.push(`/resume-builder?view=tailor&version=${version.id}`);
                  } else {
                    router.push("/resume-builder?view=document");
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Live preview, desktop only (direct feedback, 14 Sept 2026): the
           same ResumeDocument the finished document view uses, fed by the
           same reactive resume state, so it updates as the student types. */}
        {/* A firm height (not max-height + its own scroll) so the preview
           below can actually fill it via height:100% instead of hugging
           its content vertically (direct feedback, 14 Sept 2026). The
           camera/crop inside ResumeDocument handles framing now, so this
           column itself never needs to scroll. */}
        <div className="hidden lg:sticky lg:top-8 lg:flex lg:h-[calc(100dvh-64px)] lg:min-w-0 lg:flex-col lg:gap-[var(--space-5)]">
          <div className="flex flex-none flex-wrap items-center justify-between gap-[var(--space-2)] lg:min-h-[56px]">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Live Preview</span>
            <ZoomResumeButton resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} title="Live Preview" />
          </div>
          <div className="min-h-0 min-w-0 flex-1">
            <ResumeDocument resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} cropped focusSection={WIZARD_STEP_SECTIONS[stepIndex]} activeField={activeField} />
          </div>
        </div>
      </div>

      {toast}
    </Shell>
  );
}
