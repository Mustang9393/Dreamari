"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import { Eye, FileText, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { BorderBeam } from "border-beam";
import { EMPTY_RESUME, removeVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, writeResume, type ResumeVersion } from "@/lib/resume";
import { readStudentProfile } from "@/lib/studentProfile";
import { STUDENT } from "@/components/profile/data";
import { CARD_CLASS, INSET, useResumeToast } from "./ui";

/** Only ever called from the zero-resumes empty state below, so this IS
 *  "starting fresh" by definition -- resets the whole draft (education,
 *  experience, skills, certifications) before prefilling identity, rather
 *  than the old empty-check that silently left a deleted resume's answers
 *  in place (direct feedback, 15 Sept 2026: delete your only resume, hit
 *  Create again, and the old fields were all still there). "Create New
 *  Resume" below, the ADD-ANOTHER path when you already have one saved,
 *  never calls this -- that one is supposed to keep the shared answers,
 *  same identity/school prefill everywhere else in Profile. */
function startFreshFromStudentProfile() {
  const sp = readStudentProfile();
  const [firstName, ...rest] = STUDENT.name.split(" ");
  writeResume({ ...EMPTY_RESUME, profile: { firstName, lastName: rest.join(" "), email: sp.email, phone: "", country: "", state: sp.states[0] ?? "", city: "", bio: "" } });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function VersionRow({ version, onOpen, onEdit, onDelete }: { version: ResumeVersion; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={CARD_CLASS} style={INSET}>
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onOpen} className="dm-link flex min-w-0 cursor-pointer flex-col gap-[2px] text-left">
          <span className="truncate text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{version.name}</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            {version.educationIds.length} education · {version.experienceIds.length} experience · updated {formatDate(version.updatedAt)}
          </span>
        </button>
        <div className="flex flex-none items-center gap-[6px]">
          {/* "Edit" alone doesn't say what's actually here -- which
             education/experience to include, the template, and matching to
             a job description (direct feedback, 15 Sept 2026: "I dont see
             the tailor resume feature anymore" -- nothing on screen ever
             said the word "Tailor", just an unlabeled pencil icon, so the
             feature read as missing even though it was one click away). */}
          <button
            type="button"
            aria-label={`Tailor ${version.name}`}
            onClick={onEdit}
            className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[7px] text-[12.5px] font-bold"
            style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Tailor
          </button>
          <button type="button" aria-label={`Delete ${version.name}`} onClick={onDelete} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

// The Resume tab's own content. Default view is a zero state until the
// student actually has a saved resume (direct feedback, 14 Sept 2026: "do we
// also have a zero resume state... that should ideally be the default view
// unless i create a resume") -- no more silently auto-entering the wizard on
// first visit, which was also where the earlier name-wiping bug lived. The
// summary card + "Your Resumes" list only take over once resume.versions
// has at least one entry.
export function ResumeExperience() {
  const router = useRouter();
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const { toast } = useResumeToast();
  const [confirmDelete, setConfirmDelete] = useState<ResumeVersion | null>(null);

  const startBuilding = () => {
    startFreshFromStudentProfile();
    // Template first, with a real example in every option (direct feedback,
    // 14 Sept 2026), then straight into filling it out.
    router.push("/resume-builder?view=templates");
  };

  const versions = [...resume.versions].sort((a, b) => b.updatedAt - a.updatedAt);

  if (versions.length === 0) {
    return (
      <div className={`${CARD_CLASS} items-center gap-[var(--space-4)] py-[var(--space-8)] text-center`} style={INSET}>
        <span className="flex size-14 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}>
          <Sparkles className="h-7 w-7" aria-hidden />
        </span>
        <div className="flex flex-col gap-[6px]">
          <p className="text-[17px] font-extrabold" style={{ color: "var(--foreground)" }}>You haven&apos;t created a resume yet</p>
          <p className="max-w-[46ch] text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            Build your profile step by step, then save it as your own resume. You can make more than one and pick what goes into each.
          </p>
        </div>
        <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active>
          <button
            type="button"
            onClick={startBuilding}
            className="dm-solid relative flex cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[12px] text-[14px] font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Create My Resume
          </button>
        </BorderBeam>
        {toast}
      </div>
    );
  }

  const totalSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className={CARD_CLASS} style={INSET}>
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <span className="flex size-11 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}>
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-extrabold" style={{ color: "var(--foreground)" }}>{resume.profile.firstName ? `${resume.profile.firstName} ${resume.profile.lastName}`.trim() : "Your Resume Profile"}</span>
              <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                {resume.education.length} education · {resume.experience.length} experience · {totalSkills} skills
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <button
              type="button"
              onClick={() => router.push("/resume-builder?view=document")}
              className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              <Eye className="h-4 w-4" aria-hidden /> Preview Full Resume
            </button>
            <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active>
              <button
                type="button"
                onClick={() => router.push("/resume-builder")}
                className="dm-tap relative flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <Pencil className="h-4 w-4" aria-hidden /> Edit My Info
              </button>
            </BorderBeam>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <span className="text-[13px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your Resumes</span>
          <button
            type="button"
            onClick={() => router.push("/resume-builder?view=templates")}
            className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-full px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Create New Resume
          </button>
        </div>

        <div className="flex flex-col gap-[var(--space-3)]">
          {versions.map((v) => (
            <VersionRow
              key={v.id}
              version={v}
              onOpen={() => router.push(`/resume-builder?view=version&version=${v.id}`)}
              onEdit={() => router.push(`/resume-builder?view=tailor&version=${v.id}`)}
              onDelete={() => setConfirmDelete(v)}
            />
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)" }} onPointerDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="flex w-full max-w-[380px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <p className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Delete &ldquo;{confirmDelete.name}&rdquo;?</p>
            <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>This only removes this saved resume. Your education, experience, and skills stay in your profile.</p>
            <div className="flex items-center justify-end gap-[var(--space-3)]">
              <button type="button" onClick={() => setConfirmDelete(null)} className="dm-link cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button
                type="button"
                onClick={() => {
                  removeVersion(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="dm-solid flex min-h-[40px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold text-white"
                style={{ background: "var(--color-feedback-error, #d64545)" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </div>
  );
}
