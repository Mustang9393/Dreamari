"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles, Trash2 } from "lucide-react";
import { makeId, removeExperience, upsertExperience, type ExperienceType, type ResumeExperience } from "@/lib/resume";
import { EXPERIENCE_QUESTIONS, EXPERIENCE_TYPES } from "./data";
import { Field, ResumeModal, TextInput } from "./ui";

type SubStep = "type" | "info" | "questions" | "lines";

const EMPTY: ResumeExperience = { id: "", type: "job", where: "", title: "", location: "", startDate: "", endDate: "", current: false, bullets: [], aiAssisted: false };

export function ExperienceModal({ initial, onClose, onSaved, onFieldFocus }: { initial: ResumeExperience | null; onClose: () => void; onSaved: (title: string) => void; onFieldFocus?: (field: string | null) => void }) {
  const [sub, setSub] = useState<SubStep>(initial ? "info" : "type");
  const [draft, setDraft] = useState<ResumeExperience>(initial ?? { ...EMPTY, id: makeId() });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [ownLines, setOwnLines] = useState(false);
  const [lineDraft, setLineDraft] = useState("");
  const [genError, setGenError] = useState(false);
  // Matches the `data-field` markers ExperienceEntries puts on the live
  // preview (ResumeDocument.tsx). The Questions step's answers don't map
  // to a visible resume field (they only feed bullet generation), so
  // there's nothing to track there -- the camera just keeps the section-
  // level framing from the Info step until Lines has real bullets to pan to.
  const track = (kind: string) => () => onFieldFocus?.(`${draft.id}:${kind}`);

  // Live-write the draft into the actual resume on every change (direct
  // feedback, 14-15 Sept 2026: "everything I type on any input field
  // should be zoomed+tracked+shown live updating in the preview") -- not
  // just on Save. This is also what gives the camera a real `data-field`
  // node to pan to from the moment the modal opens, even before the
  // entry has ever been saved (ResumeDocument.tsx's FieldText renders the
  // muted placeholder for whatever's still empty). Closing without saving
  // rolls this back below rather than leaving a half-filled entry behind.
  useEffect(() => {
    upsertExperience(draft);
  }, [draft]);

  const closeAndClear = () => {
    onFieldFocus?.(null);
    if (initial) upsertExperience(initial); // revert live edits made this session
    else removeExperience(draft.id); // discard a new entry that was never saved
    onClose();
  };

  const infoValid = draft.where.trim().length > 0 && draft.title.trim().length > 0;

  async function generate() {
    setGenerating(true);
    setGenError(false);
    try {
      const res = await fetch("/api/resume-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: draft.type, title: draft.title, where: draft.where, answers }),
      });
      const data = (await res.json()) as { ok: boolean; bullets?: string[]; aiAssisted?: boolean };
      if (data.ok && data.bullets) {
        setDraft((d) => ({ ...d, bullets: data.bullets!, aiAssisted: !!data.aiAssisted }));
        setSub("lines");
      } else {
        setGenError(true);
      }
    } catch {
      setGenError(true);
    } finally {
      setGenerating(false);
    }
  }

  function save() {
    // already live-written by the effect above; just stop tracking and hand back
    onFieldFocus?.(null);
    onSaved(draft.title);
  }

  const titleByStep: Record<SubStep, string> = {
    type: "What kind of experience is this?",
    info: "Tell us the details",
    questions: "A few quick questions",
    lines: "Your experience, written up",
  };

  return (
    <ResumeModal title={titleByStep[sub]} onClose={closeAndClear}>
      {sub === "type" && (
        <div className="flex flex-col gap-[var(--space-3)]">
          {EXPERIENCE_TYPES.map(({ type, label, hint, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setDraft({ ...draft, type: type as ExperienceType });
                setSub("info");
              }}
              className="dm-tap flex cursor-pointer items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-4)] text-left"
              style={{ borderColor: "var(--glass-border)" }}
            >
              <span className="flex size-10 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{label}</span>
                <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {sub === "info" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Field label="Where" htmlFor="exp-where" required>
            <TextInput id="exp-where" value={draft.where} onChange={(v) => setDraft({ ...draft, where: v })} onFocus={track("title")} placeholder="e.g. Target, City Animal Shelter" />
          </Field>
          <Field label="Your Title / Role" htmlFor="exp-title" required>
            <TextInput id="exp-title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} onFocus={track("title")} placeholder="e.g. Sales Associate" />
          </Field>
          <Field label="Location (optional)" htmlFor="exp-location">
            <TextInput id="exp-location" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} onFocus={track("location")} placeholder="City, State" />
          </Field>
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <Field label="Start Date" htmlFor="exp-start">
              <TextInput id="exp-start" value={draft.startDate} onChange={(v) => setDraft({ ...draft, startDate: v })} onFocus={track("dates")} placeholder="e.g. June 2025" />
            </Field>
            <Field label="End Date" htmlFor="exp-end">
              <TextInput id="exp-end" value={draft.endDate} onChange={(v) => setDraft({ ...draft, endDate: v })} onFocus={track("dates")} placeholder="e.g. August 2025" disabled={draft.current} />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-[8px] text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={draft.current} onChange={(e) => setDraft({ ...draft, current: e.target.checked, endDate: e.target.checked ? "" : draft.endDate })} className="size-4 cursor-pointer" />
            I currently do this
          </label>
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("type")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <button
              type="button"
              disabled={!infoValid}
              onClick={() => setSub("questions")}
              className="dm-solid flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--primary)" }}
            >
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {sub === "questions" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Answer what applies. Skip any that don&apos;t.</p>
          {EXPERIENCE_QUESTIONS.map((q) => (
            <Field key={q.key} label={q.label} htmlFor={`exp-q-${q.key}`}>
              <TextInput id={`exp-q-${q.key}`} value={answers[q.key] ?? ""} onChange={(v) => setAnswers({ ...answers, [q.key]: v })} placeholder={q.placeholder} />
            </Field>
          ))}
          {genError && <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>Couldn&apos;t generate bullets. Try again, or write your own.</p>}
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("info")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <div className="flex items-center gap-[var(--space-3)]">
              <button
                type="button"
                onClick={() => {
                  setOwnLines(true);
                  setDraft((d) => ({ ...d, bullets: d.bullets.length > 0 ? d.bullets : [""], aiAssisted: false }));
                  setSub("lines");
                }}
                className="dm-link cursor-pointer text-[13.5px] font-bold"
                style={{ color: "var(--muted-foreground)" }}
              >
                I&apos;ll write my own lines
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={generate}
                className="dm-solid flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: "var(--primary)" }}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                {generating ? "Generating…" : "Generate bullets"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sub === "lines" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {draft.aiAssisted && !ownLines && (
            <p className="flex items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> AI-drafted. Edit anything below.
            </p>
          )}
          <div className="flex flex-col gap-[var(--space-2)]">
            {draft.bullets.map((line, i) => (
              <div key={i} className="flex items-center gap-[var(--space-2)]">
                <TextInput id={`exp-line-${i}`} value={line} onChange={(v) => setDraft((d) => ({ ...d, bullets: d.bullets.map((b, j) => (j === i ? v : b)) }))} onFocus={track(`bullet:${i}`)} placeholder="Describe what you did…" />
                <button type="button" aria-label="Remove line" onClick={() => setDraft((d) => ({ ...d, bullets: d.bullets.filter((_, j) => j !== i) }))} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-[var(--space-2)]">
            <TextInput id="exp-line-new" value={lineDraft} onChange={setLineDraft} placeholder="Add another line…" />
            <button
              type="button"
              onClick={() => {
                if (!lineDraft.trim()) return;
                setDraft((d) => ({ ...d, bullets: [...d.bullets, lineDraft.trim()] }));
                setLineDraft("");
              }}
              className="dm-tap flex-none cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold"
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              Add
            </button>
          </div>
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("questions")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <button
              type="button"
              disabled={draft.bullets.filter((b) => b.trim()).length === 0}
              onClick={save}
              className="dm-solid flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--primary)" }}
            >
              <Check className="h-4 w-4" aria-hidden /> Save Experience
            </button>
          </div>
        </div>
      )}
    </ResumeModal>
  );
}
