"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react";
import { ExternalLink, Pencil, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DreamyGuide } from "@/components/build/DreamyGuide";
import { makeId, readResume, resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, upsertVersion, type ResumeData, type ResumeExperience as ResumeExperienceEntry, type ResumeVersion } from "@/lib/resume";
import { DEFAULT_RESUME_TEMPLATE, RESUME_TEMPLATE_GALLERY_DREAMY, RESUME_WIZARD_DREAMY, type ResumeTemplateId } from "./data";
import { ExperienceModal } from "./ExperienceModal";
import { PrintResumeButton, ResumeDocument, ZoomResumeButton } from "./ResumeDocument";
import { TailorScreen } from "./TailorScreen";
import { TemplateGallery } from "./TemplateGallery";
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

// Own-tab, no app chrome -- what "Open in New Window" opens (direct
// feedback, 14 Sept 2026: the preview should always be zoomable AND
// poppable into its own window, not just the in-page zoom modal).
function OpenInNewWindowButton({ href }: { href: string }) {
  return (
    <button
      type="button"
      data-print-hide
      onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
      className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
      style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
    >
      <ExternalLink className="h-4 w-4" aria-hidden /> New Window
    </button>
  );
}

function DocumentScreen({ resume, title, onBack, backLabel, editHref, selfHref, router, templateId }: { resume: ResumeData; title: string; onBack: () => void; backLabel: string; editHref?: string; selfHref: string; router: ReturnType<typeof useRouter>; templateId: string }) {
  return (
    <Shell contentMaxWidth={900}>
      <TopBar
        label={title}
        onClose={() => router.push("/profile?tab=resume")}
        extra={
          <>
            <ZoomResumeButton resume={resume} templateId={templateId} title={title} />
            <OpenInNewWindowButton href={selfHref} />
            <PrintResumeButton />
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
      <ResumeDocument resume={resume} templateId={templateId} />
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
        <div className="mb-[var(--space-6)] max-w-[440px]">
          <DreamyGuide sprite={RESUME_TEMPLATE_GALLERY_DREAMY.sprite} line={RESUME_TEMPLATE_GALLERY_DREAMY.line} />
        </div>
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
    return (
      <Shell contentMaxWidth={760}>
        <TopBar label={activeVersion ? "Edit Resume" : "Create Resume"} onClose={backToProfile} />
        <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          <TailorScreen
            resume={resume}
            initial={activeVersion}
            initialTemplateId={pickedTemplate}
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
        editHref={`/resume-builder?view=tailor&version=${activeVersion.id}`}
        selfHref={`/resume-builder?view=version&version=${activeVersion.id}`}
        router={router}
        templateId={activeVersion.template}
      />
    );
  }

  if (view === "document") {
    return <DocumentScreen resume={resume} title="Your Resume" onBack={backToProfile} backLabel="Back to Resumes" selfHref="/resume-builder?view=document" router={router} templateId={DEFAULT_RESUME_TEMPLATE} />;
  }

  const dreamy = RESUME_WIZARD_DREAMY[stepIndex];

  return (
    <Shell>
      <TopBar label="Resume Builder" onClose={backToProfile} />
      {/* The preview gets the larger share of the row now (direct feedback,
         14 Sept 2026: "give the preview more prominence... more width so we
         can see it better") -- the form column holds at a comfortable
         reading width, every extra pixel goes to the resume itself. */}
      <div className="grid grid-cols-1 items-start gap-[var(--space-6)] lg:grid-cols-[520px_1fr]">
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
            {stepIndex === 0 && <PersonalInfoStep resume={resume} onNext={() => { react(); setStepIndex(1); }} showToast={showToast} />}
            {stepIndex === 1 && <EducationStep resume={resume} onNext={() => { react(); setStepIndex(2); }} onBack={() => setStepIndex(0)} showToast={showToast} />}
            {stepIndex === 2 && (
              <ExperienceStep
                resume={resume}
                onNext={() => { react(); setStepIndex(3); }}
                onBack={() => setStepIndex(1)}
                onAdd={() => setExperienceModal("new")}
                onEdit={(entry) => setExperienceModal(entry)}
              />
            )}
            {stepIndex === 3 && <SkillsStep resume={resume} onNext={() => { react(); setStepIndex(4); }} onBack={() => setStepIndex(2)} />}
            {stepIndex === 4 && <CertificationsStep resume={resume} onNext={() => { react(); setStepIndex(5); }} onBack={() => setStepIndex(3)} showToast={showToast} />}
            {stepIndex === 5 && (
              <ReviewStep
                resume={resume}
                onBack={() => setStepIndex(4)}
                onEditStep={(step) => setStepIndex(step)}
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
                  // "Edit My Info" on an existing resume). Later finishes
                  // just go to the full preview -- by then there's already
                  // at least one saved resume to open or edit from the list.
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
                      template: pickedTemplate ?? DEFAULT_RESUME_TEMPLATE,
                    };
                    upsertVersion(version);
                    router.push(`/resume-builder?view=version&version=${version.id}`);
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
        <div className="hidden lg:sticky lg:top-8 lg:flex lg:max-h-[calc(100dvh-64px)] lg:flex-col lg:gap-[var(--space-3)] lg:overflow-y-auto">
          <div className="flex flex-none flex-wrap items-center justify-between gap-[var(--space-2)]">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Live Preview</span>
            <div className="flex items-center gap-[var(--space-2)]">
              <ZoomResumeButton resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} title="Live Preview" />
              <OpenInNewWindowButton href="/resume-builder?view=document" />
            </div>
          </div>
          <ResumeDocument resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} cropped focusSection={WIZARD_STEP_SECTIONS[stepIndex]} />
        </div>
      </div>

      {experienceModal !== null && (
        <ExperienceModal
          initial={experienceModal === "new" ? null : experienceModal}
          onClose={() => setExperienceModal(null)}
          onSaved={(title) => {
            setExperienceModal(null);
            showToast(`${title} added`);
          }}
        />
      )}
      {toast}
    </Shell>
  );
}
