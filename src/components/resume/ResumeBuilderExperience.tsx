"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { makeId, readResume, resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, upsertVersion, type ResumeData, type ResumeExperience as ResumeExperienceEntry, type ResumeVersion } from "@/lib/resume";
import { DEFAULT_RESUME_TEMPLATE } from "./data";
import { ExperienceModal } from "./ExperienceModal";
import { PrintResumeButton, ResumeDocument } from "./ResumeDocument";
import { TailorScreen } from "./TailorScreen";
import { useResumeToast, WizardProgress } from "./ui";
import { CertificationsStep, EducationStep, ExperienceStep, PersonalInfoStep, ReviewStep, SkillsStep } from "./wizardSteps";

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

function Shell({ children, maxWidth = 640 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full flex-col px-5 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] sm:pt-8" style={{ maxWidth }}>
        {children}
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

function DocumentScreen({ resume, title, onBack, backLabel, editHref, router, templateId }: { resume: ResumeData; title: string; onBack: () => void; backLabel: string; editHref?: string; router: ReturnType<typeof useRouter>; templateId: string }) {
  return (
    <Shell maxWidth={720}>
      <TopBar
        label={title}
        onClose={() => router.push("/profile?tab=resume")}
        extra={
          <>
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
  const [experienceModal, setExperienceModal] = useState<ResumeExperienceEntry | null | "new">(null);
  const { toast, showToast } = useResumeToast();

  const backToProfile = () => router.push("/profile?tab=resume");
  const view = searchParams.get("view");
  const versionId = searchParams.get("version");
  const activeVersion = versionId ? (resume.versions.find((v) => v.id === versionId) ?? null) : null;

  if (view === "tailor") {
    return (
      <Shell>
        <TopBar label={activeVersion ? "Edit Resume" : "Create Resume"} onClose={backToProfile} />
        <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          <TailorScreen
            resume={resume}
            initial={activeVersion}
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
        router={router}
        templateId={activeVersion.template}
      />
    );
  }

  if (view === "document") {
    return <DocumentScreen resume={resume} title="Your Resume" onBack={backToProfile} backLabel="Back to Resumes" router={router} templateId={DEFAULT_RESUME_TEMPLATE} />;
  }

  return (
    <Shell maxWidth={1100}>
      <TopBar label="Resume Builder" onClose={backToProfile} />
      <div className="grid grid-cols-1 items-start gap-[var(--space-6)] lg:grid-cols-[minmax(0,640px)_1fr]">
        <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          <WizardProgress stepIndex={stepIndex} />
          {stepIndex === 0 && <PersonalInfoStep resume={resume} onNext={() => setStepIndex(1)} showToast={showToast} />}
          {stepIndex === 1 && <EducationStep resume={resume} onNext={() => setStepIndex(2)} onBack={() => setStepIndex(0)} showToast={showToast} />}
          {stepIndex === 2 && (
            <ExperienceStep
              resume={resume}
              onNext={() => setStepIndex(3)}
              onBack={() => setStepIndex(1)}
              onAdd={() => setExperienceModal("new")}
              onEdit={(entry) => setExperienceModal(entry)}
            />
          )}
          {stepIndex === 3 && <SkillsStep resume={resume} onNext={() => setStepIndex(4)} onBack={() => setStepIndex(2)} />}
          {stepIndex === 4 && <CertificationsStep resume={resume} onNext={() => setStepIndex(5)} onBack={() => setStepIndex(3)} showToast={showToast} />}
          {stepIndex === 5 && (
            <ReviewStep
              resume={resume}
              onBack={() => setStepIndex(4)}
              onEditStep={(step) => setStepIndex(step)}
              onFinish={() => {
                // First finish with nothing saved yet: create a real,
                // named resume right away instead of only a preview, so
                // "Your Resumes" isn't confusingly empty right after
                // finishing (direct feedback, 14 Sept 2026 -- "there is an
                // alex chen resume right there" pointing at exactly this
                // gap). Later finishes just go to the full preview --
                // by then there's already at least one saved resume to
                // open or edit from the list.
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
                    template: DEFAULT_RESUME_TEMPLATE,
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

        {/* Live preview, desktop only (direct feedback, 14 Sept 2026): the
           same ResumeDocument the finished document view uses, fed by the
           same reactive resume state, so it updates as the student types. */}
        <div className="hidden lg:sticky lg:top-8 lg:flex lg:max-h-[calc(100dvh-64px)] lg:flex-col lg:gap-[var(--space-3)] lg:overflow-y-auto">
          <span className="flex-none text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Live Preview</span>
          <ResumeDocument resume={resume} templateId={DEFAULT_RESUME_TEMPLATE} />
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
