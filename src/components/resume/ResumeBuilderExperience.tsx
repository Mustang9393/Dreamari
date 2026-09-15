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
function Shell({ children, contentMaxWidth }: { children: ReactNode; contentMaxWidth?: number }) {
  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-[var(--space-14)] sm:pt-8">
        {contentMaxWidth ? <div className="mx-auto flex w-full flex-1 flex-col" style={{ maxWidth: contentMaxWidth }}>{children}</div> : children}
      </div>
    </div>
  );
}

function TopBar({ label, onClose, extra }: { label: string; onClose: () => void; extra?: ReactNode }) {
  return (
    <div data-print-hide className="mb-[var(--space-5)] flex flex-none flex-wrap items-center justify-between gap-[var(--space-3)]">
      <span className="text-[13px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <div className="flex items-center gap-[var(--space-3)]">
        {extra}
        <button
          type="button"
          aria-label="Close and return to Profile"
          onClick={onClose}
          className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border"
          style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
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
  // Which `data-field` the live preview's camera should pan to right now --
  // set by whichever drawer field is focused (`${entryId}:${fieldKind}`),
  // cleared back to section-level framing when the drawer closes or the
  // step changes (direct feedback, 15 Sept 2026: "the camera tracking all
  // updates one by one, per field... after one section is done it can fit
  // the whole section... before we move on" -- that whole-section fit is
  // just what ResumeDocument already does once activeField goes back to
  // null, no separate state needed for it).
  const [activeField, setActiveField] = useState<string | null>(null);
  const goToStep = (i: number) => { setActiveField(null); setStepIndex(i); };
  const { toast, showToast } = useResumeToast();

  const backToProfile = () => router.push("/profile?tab=resume");
  const view = searchParams.get("view");
  const versionId = searchParams.get("version");
  const activeVersion = versionId ? (resume.versions.find((v) => v.id === versionId) ?? null) : null;
  // Carried from the template gallery into wizard/tailor so the FIRST save
  // uses what was actually picked, not always the default.
  const pickedTemplate = (searchParams.get("template") as ResumeTemplateId | null) ?? undefined;

  if (view === "templates") {
    return (
      <Shell contentMaxWidth={1200}>
        <TopBar label="New Resume" onClose={backToProfile} />
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
      <Shell contentMaxWidth={760}>
        <TopBar label={activeVersion ? "Edit Selection" : "New Resume"} onClose={backToProfile} />
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

  return (
    <Shell>
      <TopBar label="Resume Builder" onClose={backToProfile} />
      {/* The preview gets the larger share of the row now (direct feedback,
         14 Sept 2026: "give the preview more prominence... more width so we
         can see it better") -- the preview column runs 20% wider than the
         form column (direct feedback, 15 Sept 2026), both flexible so the
         ratio holds as the viewport grows. */}
      <div className="grid grid-cols-1 items-start gap-[var(--space-6)] lg:grid-cols-[minmax(420px,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-[var(--space-5)]">
          {/* Dreamy front and center for every step, the same treatment
             Build gives him -- not the reference's small inline coaching
             tip (direct feedback, 14 Sept 2026). Capped width so his
             bubble hugs the line instead of stretching full column width. */}
          <div className="max-w-[440px]">
            <DreamyGuide sprite={dreamy.sprite} line={dreamy.line} reactionNonce={reactionNonce} />
          </div>
          <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
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
            {stepIndex === 3 && <SkillsStep resume={resume} onNext={() => { react(); goToStep(4); }} onBack={() => goToStep(2)} />}
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
        <div className="hidden lg:sticky lg:top-8 lg:flex lg:h-[calc(100dvh-64px)] lg:min-w-0 lg:flex-col lg:gap-[var(--space-3)]">
          <div className="flex flex-none flex-wrap items-center justify-between gap-[var(--space-2)]">
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
