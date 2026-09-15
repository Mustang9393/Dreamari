"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState, type ReactNode } from "react";
import { ArrowRight, Copy, Download, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { BorderBeam } from "border-beam";
import { EMPTY_RESUME, makeId, removeVersion, resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, upsertVersion, writeResume, type ResumeData, type ResumeVersion } from "@/lib/resume";
import { readStudentProfile } from "@/lib/studentProfile";
import { STUDENT } from "@/components/profile/data";
import { RESUME_TEMPLATES } from "./data";
import { downloadDocx } from "./ExportChecklistModal";
import { CARD_CLASS, INSET, useResumeToast } from "./ui";

// Resume Quality and Job Match scores, right on the card, same tone rule
// ScoreChip/ATSCheckPanel already use elsewhere -- the replit reference
// shows both here too (direct instruction, 16 Sept 2026: "review the
// Replit user flow and replicate it exactly"), instead of only being
// visible after opening ATS Check.
function scoreTone(value: number) {
  return value >= 75 ? "var(--world-food-farming-nature, #3aa66b)" : value >= 45 ? "var(--accent-subtle)" : "var(--muted-foreground)";
}
// "STANDARD" vs "TAILORED", and "APPROVED" -- status pills the reference
// shows on every Saved Resumes card (confirmed live, 16 Sept 2026: a
// resume with no job description reads "STANDARD", one that's been
// through Choose & Tailor reads "TAILORED" + "APPROVED"). Its own API
// stores these as real `type`/`approved` columns rather than deriving
// them, but nothing in our data model exposes an explicit "approved"
// action anywhere in its flow -- the closest real signal we have is
// whether an ATS Check has actually been run on this version, so that's
// what "APPROVED" is derived from here.
function StatusPill({ tone, children }: { tone: "neutral" | "primary" | "success"; children: ReactNode }) {
  const style = tone === "success"
    ? { borderColor: "color-mix(in srgb, var(--color-feedback-success, #3aa66b) 40%, transparent)", background: "color-mix(in srgb, var(--color-feedback-success, #3aa66b) 14%, transparent)", color: "var(--color-feedback-success, #3aa66b)" }
    : tone === "primary"
      ? { borderColor: "color-mix(in srgb, var(--primary) 40%, transparent)", background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }
      : { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" };
  return <span className="rounded-full border px-[9px] py-[3px] text-[10.5px] font-extrabold tracking-[0.04em] uppercase" style={style}>{children}</span>;
}

// A cryptic 2-letter code (NW, JM) next to its own spelled-out label
// ("Needs Work") was decoding nothing -- direct feedback, 16 Sept 2026:
// "what is JM? ... what is NW?". This is the same shape as JobMatchPanel's
// own ScoreChip (uppercase category label, then the number itself as the
// colored anchor with its plain-English verdict after it) -- an older,
// clearer pattern already established elsewhere that this card's own
// badge had drifted from (direct feedback: "there was a better way these
// badges were shown before").
function ScoreBadge({ category, label, value }: { category: string; label: string; value: number }) {
  const tone = scoreTone(value);
  return (
    <span className="flex flex-col gap-[1px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[6px]" style={{ borderColor: "var(--glass-border)" }}>
      <span className="text-[10px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{category}</span>
      <span className="flex items-baseline gap-[5px]">
        <span className="text-[17px] leading-none font-extrabold tabular-nums" style={{ color: tone, fontFamily: "var(--font-display)" }}>{value}</span>
        <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>/100 · {label}</span>
      </span>
    </span>
  );
}

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

function VersionRow({ resume, version, onOpen, onEdit, onDuplicate, onDelete }: { resume: ResumeData; version: ResumeVersion; onOpen: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const ats = version.atsCheck;
  // Stored as "NW — Needs Work"; only the plain-English half is ever shown.
  const gradeLabel = ats ? (ats.qualityGrade.split(" — ")[1] ?? ats.qualityGrade) : "";
  const template = RESUME_TEMPLATES.find((t) => t.id === version.template) ?? RESUME_TEMPLATES[0];
  return (
    // A left accent stripe in the version's own template color, and a
    // faint tint of it behind the whole card -- these read identically
    // flat and interchangeable before (direct feedback, 16 Sept 2026:
    // "the saved resume cards need to be designed way better these are
    // too basic and boring"). Ties each card back to the template you'll
    // actually see when you open it.
    <div
      className="relative flex flex-col gap-[var(--space-3)] overflow-hidden rounded-[var(--radius-lg)] border pl-[calc(var(--space-5)+4px)]"
      style={{ borderColor: "var(--glass-border)", background: `color-mix(in srgb, ${template.accent} 5%, var(--glass-surface-1))` }}
    >
      <span aria-hidden className="absolute top-0 left-0 h-full w-[4px]" style={{ background: template.accent }} />
      <div className="flex items-start justify-between gap-[var(--space-3)] pt-[var(--space-4)]">
        <button type="button" onClick={onOpen} className="dm-link flex min-w-0 cursor-pointer flex-col gap-[4px] text-left">
          <div className="flex flex-wrap items-center gap-[6px]">
            {version.targetPosition ? <StatusPill tone="primary">Tailored</StatusPill> : <StatusPill tone="neutral">Standard</StatusPill>}
            {ats && <StatusPill tone="success">Approved</StatusPill>}
          </div>
          <span className="truncate text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{version.name}</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            {version.educationIds.length} education · {version.experienceIds.length} experience · updated {formatDate(version.updatedAt)}
          </span>
        </button>
        <div className="flex flex-none items-center gap-[6px] pr-[var(--space-3)]">
          <button
            type="button"
            aria-label={`Download ${version.name}`}
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                await downloadDocx(resumeForVersion(resume, version));
              } finally {
                setDownloading(false);
              }
            }}
            className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Download className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label={`Duplicate ${version.name}`} onClick={onDuplicate} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <Copy className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label={`Delete ${version.name}`} onClick={onDelete} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      {(ats || version.targetPosition) && (
        <div className="flex flex-wrap items-center gap-[8px] pr-[var(--space-5)]">
          {ats && <ScoreBadge category="Resume Rating" label={gradeLabel} value={ats.qualityScore} />}
          {ats && ats.jobMatchScore !== null && <ScoreBadge category="Job Match" label={ats.jobMatchLabel || "Possible Match"} value={ats.jobMatchScore} />}
          {version.targetPosition && (
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              Target: <span style={{ color: "var(--foreground)" }}>{version.targetPosition}</span>
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-[var(--space-3)] border-t pt-[var(--space-3)] pr-[var(--space-5)] pb-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
        {/* Which education/experience to include and the template --
           matching to a job lives on the finished resume itself now (the
           "Tailor Resume" button, right beside ATS Check) since it's
           something you'd want to redo against a different job any
           number of times, not a one-time step bundled in here (direct
           feedback, 15 Sept 2026: "the tailoring happens as a seperate
           thing from the last naming/template changer"). Still a
           labeled button, not just an icon (direct feedback: "I dont
           see the tailor resume feature anymore" -- a bare pencil icon
           read as nothing at all). */}
        <button
          type="button"
          aria-label={`Edit ${version.name}`}
          onClick={onEdit}
          className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[7px] text-[12.5px] font-bold"
          style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[8px] text-[13px] font-bold text-white"
          style={{ background: template.accent }}
        >
          Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
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

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* The reference's own page title + subtitle -- missing here
         entirely before (direct feedback, 16 Sept 2026: "the saved
         resumes tab has copy we have ommitted"). */}
      <div className="flex flex-col gap-[2px]">
        <h2 className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Saved Resumes</h2>
        <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Manage, edit, and download your resumes.</p>
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
            <Plus className="h-4 w-4" aria-hidden /> Create New
          </button>
        </div>

        <div className="flex flex-col gap-[var(--space-3)]">
          {versions.map((v) => (
            <VersionRow
              key={v.id}
              resume={resume}
              version={v}
              onOpen={() => router.push(`/resume-builder?view=version&version=${v.id}`)}
              onEdit={() => router.push(`/resume-builder?view=tailor&version=${v.id}&edit=1`)}
              onDuplicate={() => {
                const now = Date.now();
                upsertVersion({ ...v, id: makeId(), name: `${v.name} (Copy)`, createdAt: now, updatedAt: now, atsCheck: null });
              }}
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
