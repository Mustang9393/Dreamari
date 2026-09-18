"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, useState } from "react";
import { DEMO_ALWAYS_SHOW_SPLASH, demoSeenThisSession, markDemoSeenThisSession } from "@/components/app/WelcomeSplash";
import { ArrowRight, Copy, Download, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { BorderBeam } from "border-beam";
import { EMPTY_RESUME, makeId, removeVersion, resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, upsertVersion, writeResume, type ResumeData, type ResumeVersion } from "@/lib/resume";
import { readStudentProfile } from "@/lib/studentProfile";
import { STUDENT } from "@/components/profile/data";
import { downloadDocx } from "./ExportChecklistModal";
import { CARD_CLASS, INSET, useResumeToast, IconTip } from "./ui";

// Resume Quality and Job Match scores, right on the card, same tone rule
// ScoreChip/ATSCheckPanel already use elsewhere -- the replit reference
// shows both here too (direct instruction, 16 Sept 2026: "review the
// Replit user flow and replicate it exactly"), instead of only being
// visible after opening ATS Check.
function scoreTone(value: number) {
  return value >= 75 ? "var(--world-food-farming-nature, #3aa66b)" : value >= 45 ? "var(--accent-subtle)" : "var(--muted-foreground)";
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
    <div className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[7px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      {/* A ring, not just a number, gives the score somewhere to visually
         "fill up to" instead of sitting as flat text (direct feedback,
         16 Sept 2026: "make the stat/score badges more aesthetic"). */}
      <div className="relative flex size-[32px] flex-none items-center justify-center rounded-full" style={{ background: `conic-gradient(${tone} ${value * 3.6}deg, color-mix(in srgb, ${tone} 16%, transparent) 0deg)` }}>
        <div className="flex size-[25px] items-center justify-center rounded-full text-[10px] font-extrabold tabular-nums" style={{ background: "var(--card)", color: tone }}>{value}</div>
      </div>
      <span className="flex flex-col gap-[1px]">
        <span className="text-[10px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{category}</span>
        <span className="text-[11.5px] font-bold" style={{ color: tone }}>{label}</span>
      </span>
    </div>
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

// A small preset palette for tagging saved resumes -- like Finder tags,
// so a student with several versions can tell them apart at a glance
// without reading the name (direct feedback, 16 Sept 2026: "let the user
// choose a color, like apple adds tags so it can be found easier").
// Independent of the template's own accent, which can be black (the
// Classic template's) and read as no color chosen at all.
const TAG_COLORS = ["var(--primary)", "#a855f7", "#ec4899", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#ef4444"];

function TagDot({ color, onPick }: { color: string; onPick: (color: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <button
        type="button"
        aria-label="Choose a tag color"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="dm-tap flex size-[14px] flex-none cursor-pointer items-center justify-center rounded-full"
      >
        <span aria-hidden className="size-[8px] rounded-full" style={{ background: color }} />
      </button>
      {open && (
        <>
          <span aria-hidden className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className="absolute top-[18px] left-0 z-20 flex flex-wrap gap-[6px] rounded-[var(--radius-md)] border p-[8px]"
            style={{ width: "112px", background: "var(--card)", borderColor: "var(--glass-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Tag color ${c}`}
                onClick={() => {
                  onPick(c);
                  setOpen(false);
                }}
                className="dm-tap flex size-[18px] cursor-pointer items-center justify-center rounded-full border"
                style={{ background: c, borderColor: c === color ? "var(--foreground)" : "transparent" }}
              />
            ))}
          </div>
        </>
      )}
    </span>
  );
}

function VersionRow({ resume, version, onOpen, onEdit, onDuplicate, onDelete }: { resume: ResumeData; version: ResumeVersion; onOpen: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const ats = version.atsCheck;
  // Stored as "NW — Needs Work"; only the plain-English half is ever shown.
  const gradeLabel = ats ? (ats.qualityGrade.split(" — ")[1] ?? ats.qualityGrade) : "";
  // The card's own accent follows the student's chosen tag color, not
  // the template's -- a template's own accent can be black (Classic's
  // is) and read as no color at all on both the card tint and the Open
  // button (direct feedback, 16 Sept 2026: "why is the dot on the card
  // black?... lose the black open button"). Falls back to a neutral
  // gray rather than the brand blue -- "Create New" is already blue on
  // this same screen (direct feedback: "do not tint it blue, too many
  // blue ctas on the page right now"); blue is reserved for a tag the
  // student actually picked.
  const accent = version.color ?? "var(--muted-foreground)";
  return (
    // Darker glass surface than a flat tint, backdrop-blur keeps it
    // reading as glass rather than a solid tinted panel (direct feedback,
    // "a better surface color, maybe darker without losing that glass
    // effect"). Kept to two rows plus an optional scores row -- a
    // separate footer band for Edit/Open made the card taller, not
    // sleeker (direct feedback: "much sleeker, much shorter"). A left
    // accent stripe in the template color was here too, dropped on
    // sight (direct feedback: "i dont like the dark colored line on the
    // left of the card either") -- the small dot beside the name is a
    // quieter nod to the same thing instead.
    // One dense row from sm up (direct feedback, 17 Sept 2026: the stacked
    // card "wastes so much space"): identity left, the score chips beside
    // it, then date, actions and Open pushed to the right. Phones stack
    // title, chips, actions in three short rows.
    <div
      className="relative flex flex-col gap-[10px] overflow-hidden rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[12px] backdrop-blur-md sm:flex-row sm:items-center sm:gap-[var(--space-4)]"
      style={{ borderColor: "var(--glass-border)", background: `color-mix(in srgb, var(--inset-surface) 85%, ${accent} 15%)` }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
        className="dm-link flex min-w-0 cursor-pointer flex-col gap-[2px] text-left sm:w-[220px] xl:w-[260px] sm:flex-none"
      >
        <div className="flex items-center gap-[6px]">
          <TagDot color={accent} onPick={(color) => upsertVersion({ ...version, color, updatedAt: Date.now() })} />
          <span className="truncate text-[15.5px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{version.name}</span>
        </div>
        {version.targetPosition ? (
          <span className="truncate pl-[16px] text-[12px] font-semibold" style={{ color: accent }}>Tailored for {version.targetPosition}</span>
        ) : (
          <span className="truncate pl-[16px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{formatDate(version.updatedAt)}</span>
        )}
      </div>
      {ats && (
        <div className="flex flex-wrap items-center gap-[8px] sm:min-w-0 sm:flex-1 sm:flex-nowrap">
          <ScoreBadge category="Resume Rating" label={gradeLabel} value={ats.qualityScore} />
          {ats.jobMatchScore !== null && <ScoreBadge category="Job Match" label={ats.jobMatchLabel || "Possible Match"} value={ats.jobMatchScore} />}
        </div>
      )}
      <div className="flex flex-none items-center gap-[4px] sm:ml-auto">
        {version.targetPosition && <span className="mr-[6px] hidden text-[11px] font-semibold whitespace-nowrap lg:inline" style={{ color: "var(--muted-foreground)" }}>{formatDate(version.updatedAt)}</span>}
        <IconTip label="Edit"><button type="button" aria-label={`Edit ${version.name}`} onClick={onEdit} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <Pencil className="h-4 w-4" aria-hidden />
        </button></IconTip>
        <IconTip label="Download"><button
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
        </button></IconTip>
        <IconTip label="Duplicate"><button type="button" aria-label={`Duplicate ${version.name}`} onClick={onDuplicate} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <Copy className="h-4 w-4" aria-hidden />
        </button></IconTip>
        <IconTip label="Delete"><button type="button" aria-label={`Delete ${version.name}`} onClick={onDelete} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <Trash2 className="h-4 w-4" aria-hidden />
        </button></IconTip>
        <button
          type="button"
          onClick={onOpen}
          className="dm-tap ml-[4px] flex flex-none cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[7px] text-[12.5px] font-bold"
          style={{ borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`, background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
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
/** Dreamy's resume welcome. Once per browser for students; while the
 *  app-wide demo switch is on, once per session and again after a refresh,
 *  like every other surface. Used by the builder route only: the Profile
 *  Resume tab never greets (direct feedback, 18 Sept 2026: "it should only
 *  pop up when I click Create resume"). */
export const RESUME_WELCOME_KEY = "dreamari:welcome:resume";
export function useResumeWelcome(/** show regardless of what was seen: every "Create a new resume" starts with Dreamy (direct feedback, 18 Sept 2026) */ always = false): [boolean, () => void] {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = true;
    try {
      seen = DEMO_ALWAYS_SHOW_SPLASH ? demoSeenThisSession(RESUME_WELCOME_KEY) : window.localStorage.getItem(RESUME_WELCOME_KEY) === "1";
    } catch { seen = false; }
    if (seen && !always) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [always]);
  const dismiss = () => {
    setOpen(false);
    markDemoSeenThisSession(RESUME_WELCOME_KEY);
    try { window.localStorage.setItem(RESUME_WELCOME_KEY, "1"); } catch { /* ignore */ }
  };
  return [open, dismiss];
}

export function ResumeExperience({ hideTitle = false }: { hideTitle?: boolean } = {}) {
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
          <p className="text-[17px] font-extrabold" style={{ color: "var(--foreground)" }}>No resume yet</p>
          {/* One sentence, not a paragraph -- direct feedback, 17 Sept
             2026: "the description is like a whole paragraph." */}
          <p className="max-w-[38ch] text-[13px]" style={{ color: "var(--muted-foreground)" }}>Answer a few questions to build your first one.</p>
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
         resumes tab has copy we have ommitted"). Suppressed when this
         same component is embedded in Profile's own Resume tab, though --
         the tab itself already says "Resume" right above it there, so
         "Saved Resumes" repeated it a third time (direct feedback: "dont
         have 'saved resumes' and its caption in the my profile view"). */}
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        {/* "Your Resumes" as a section label right below this same title
           just repeated it -- nothing else shares the page for it to
           distinguish from (direct feedback, 16 Sept 2026: "it says your
           resumes again"). */}
        {!hideTitle && (
          <div className="flex flex-col gap-[2px]">
            <h2 className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Saved Resumes</h2>
            <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Manage, edit, and download your resumes.</p>
          </div>
        )}
        {/* rounded-md, not a full pill (direct feedback, 16 Sept 2026:
           "do not have any pill shaped ctas please") -- same soft-shadow
           lift as a modern solid CTA, not a flat fill. */}
        <button
          type="button"
          onClick={() => router.push("/resume-builder?view=templates")}
          className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[9px] text-[13.5px] font-bold text-white shadow-[0_4px_14px_-4px_var(--primary)]"
          style={{ background: "var(--primary)" }}
        >
          <Plus className="h-4 w-4" aria-hidden /> Create New
        </button>
      </div>
      <div className="flex flex-col gap-[var(--space-3)]">

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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center p-4 backdrop-blur-[14px] sm:items-center" style={{ background: "rgba(5,7,15,0.55)" }} onPointerDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="flex w-full max-w-[400px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
            <p className="text-[18px] leading-[24px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Delete &ldquo;{confirmDelete.name}&rdquo;?</p>
            <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>This only removes this saved resume. Your education, experience, and skills stay in your profile.</p>
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
