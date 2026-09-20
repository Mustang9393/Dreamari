"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, GripVertical, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { makeId, removeExperience, upsertExperience, type ExperienceType, type ResumeExperience } from "@/lib/resume";
import { EXPERIENCE_QUESTIONS, EXPERIENCE_TYPES } from "./data";
import { Field, ResumeModal, TextInput } from "./ui";

// Six sub-steps, not four -- the reference's own progress bar shows four
// stages (Type / Info / Questions / Lines) but Info and Questions are each
// two real screens (Where/Title/Location, then Start/End dates; two
// questions, then two more), each with its own Dreamy line (direct
// instruction, 16 Sept 2026: "take no liberties... each thing... needs to
// be there"). Checked live against the reference for every screen below.
type SubStep = "type" | "info" | "dates" | "questions1" | "questions2" | "lines";

const BULLET_MAX = 200;

const EMPTY: ResumeExperience = { id: "", type: "job", where: "", title: "", location: "", startDate: "", endDate: "", current: false, bullets: [], aiAssisted: false };

export function ExperienceModal({ initial, onClose, onSaved, onFieldFocus, onSubDreamy }: { initial: ResumeExperience | null; onClose: () => void; onSaved: (title: string) => void; onFieldFocus?: (field: string | null) => void; onSubDreamy?: (dreamy: { sprite: string; line: string } | null) => void }) {
  const [sub, setSub] = useState<SubStep>(initial ? "info" : "type");
  const [draft, setDraft] = useState<ResumeExperience>(initial ?? { ...EMPTY, id: makeId() });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [ownLines, setOwnLines] = useState(false);
  const [genError, setGenError] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
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

  const infoValid = draft.where.trim().length > 0 && draft.title.trim().length > 0 && draft.location.trim().length > 0;

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
        setOwnLines(false);
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

  function enterOwnLines() {
    setOwnLines(true);
    setDraft((d) => ({ ...d, bullets: d.bullets.length > 0 ? d.bullets : [""], aiAssisted: false }));
    setSub("lines");
  }

  function save() {
    // already live-written by the effect above; just stop tracking and hand back
    onFieldFocus?.(null);
    onSaved(draft.title);
  }

  const titleByStep: Record<SubStep, string> = {
    type: "What did you do?",
    info: "Tell me about it!",
    dates: "When did you do this?",
    questions1: "A couple quick questions…",
    questions2: "Almost done – two more!",
    lines: "Here are your resume lines!",
  };
  const modalHeaderByStep: Record<SubStep, string> = {
    type: "New Experience",
    info: "New Experience",
    dates: "New Experience",
    questions1: "New Experience",
    questions2: "New Experience",
    lines: "New Experience",
  };
  // Dreamy follows the student through every one of these screens in the
  // reference, not just the outer wizard step -- direct feedback, 16 Sept
  // 2026: "bring dreamy into the places wherever it was in the replit...
  // you havent made dreamy follow the users screens more and be more
  // involved." The modal's own title bar shrinks to a plain label since
  // Dreamy now carries the actual line.
  const spriteByStep: Record<SubStep, string> = {
    type: "/images/dreamy/v2/dreamy-curious.png",
    info: "/images/dreamy/v2/dreamy-happy.png",
    dates: "/images/dreamy/v2/dreamy-glasses.png",
    questions1: "/images/dreamy/v2/dreamy-idea.png",
    questions2: "/images/dreamy/v2/dreamy-party.png",
    lines: "/images/dreamy/v2/dreamy-heart.png",
  };

  const [q1, q2, q3, q4] = EXPERIENCE_QUESTIONS;

  // Reports this sub-step's own line up to the single Dreamy that lives
  // outside the card, instead of rendering a second one in here (direct
  // feedback, 16 Sept 2026: "revert the dreamy position to before when it
  // was outside, and just have it update to say what each modal was
  // saying").
  useEffect(() => {
    onSubDreamy?.({ sprite: spriteByStep[sub], line: titleByStep[sub] });
    return () => onSubDreamy?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub]);

  return (
    <ResumeModal title={modalHeaderByStep[sub]} onClose={closeAndClear} dreamy={{ sprite: spriteByStep[sub], line: titleByStep[sub] }}>
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
          <Field label="Where?" htmlFor="exp-where" required>
            <TextInput id="exp-where" value={draft.where} onChange={(v) => setDraft({ ...draft, where: v })} onFocus={track("where")} placeholder="e.g. Target, Library" />
          </Field>
          <Field label="Your title or role?" htmlFor="exp-title" required>
            <TextInput id="exp-title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} onFocus={track("title")} />
          </Field>
          <Field label="Location" htmlFor="exp-location" required>
            <TextInput id="exp-location" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} onFocus={track("location")} placeholder="City, State" />
          </Field>
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("type")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <button
              type="button"
              disabled={!infoValid}
              onClick={() => setSub("dates")}
              className="dm-solid flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--primary)" }}
            >
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {sub === "dates" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <Field label="Start date" htmlFor="exp-start">
              <TextInput id="exp-start" value={draft.startDate} onChange={(v) => setDraft({ ...draft, startDate: v })} onFocus={track("dates")} placeholder="Aug 2023" />
            </Field>
            <Field label="End date" htmlFor="exp-end">
              <TextInput id="exp-end" value={draft.endDate} onChange={(v) => setDraft({ ...draft, endDate: v })} onFocus={track("dates")} placeholder="Jun 2024" disabled={draft.current} />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <input type="checkbox" checked={draft.current} onChange={(e) => setDraft({ ...draft, current: e.target.checked, endDate: e.target.checked ? "" : draft.endDate })} className="size-4 cursor-pointer" />
            I still do this
          </label>
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("info")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <button type="button" onClick={() => setSub("questions1")} className="dm-solid flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white" style={{ background: "var(--primary)" }}>
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {sub === "questions1" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Field label={q1.label} htmlFor={`exp-q-${q1.key}`}>
            <TextInput id={`exp-q-${q1.key}`} value={answers[q1.key] ?? ""} onChange={(v) => setAnswers({ ...answers, [q1.key]: v })} placeholder={q1.placeholder} />
          </Field>
          <Field label={q2.label} htmlFor={`exp-q-${q2.key}`}>
            <TextInput id={`exp-q-${q2.key}`} value={answers[q2.key] ?? ""} onChange={(v) => setAnswers({ ...answers, [q2.key]: v })} placeholder={q2.placeholder} />
          </Field>
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("dates")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <button type="button" onClick={() => setSub("questions2")} className="dm-solid flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white" style={{ background: "var(--primary)" }}>
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button type="button" onClick={enterOwnLines} className="dm-link cursor-pointer self-center text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            Enter my own resume lines
          </button>
        </div>
      )}

      {sub === "questions2" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Field label={q3.label} htmlFor={`exp-q-${q3.key}`}>
            <TextInput id={`exp-q-${q3.key}`} value={answers[q3.key] ?? ""} onChange={(v) => setAnswers({ ...answers, [q3.key]: v })} placeholder={q3.placeholder} />
          </Field>
          <Field label={q4.label} htmlFor={`exp-q-${q4.key}`}>
            <TextInput id={`exp-q-${q4.key}`} value={answers[q4.key] ?? ""} onChange={(v) => setAnswers({ ...answers, [q4.key]: v })} placeholder={q4.placeholder} />
          </Field>
          {genError && <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>Couldn&apos;t generate bullets. Try again, or write your own.</p>}
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub("questions1")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </button>
            <button
              type="button"
              disabled={generating}
              onClick={generate}
              className="dm-solid flex cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[10px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: "var(--primary)" }}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {generating ? "Generating…" : "Generate Lines"}
              {!generating && (
                <span className="rounded-[5px] px-[6px] py-[2px] text-[10px] font-extrabold" style={{ background: "rgba(255,255,255,0.22)" }}>AI</span>
              )}
            </button>
          </div>
          <button type="button" onClick={enterOwnLines} className="dm-link cursor-pointer self-center text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            Skip and save without AI lines
          </button>
        </div>
      )}

      {sub === "lines" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Edit these lines – they&apos;ll appear exactly as written on your resume.</p>
          <div className="flex flex-col gap-[var(--space-2)]">
            {draft.bullets.map((line, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex === null || dragIndex === i) return;
                  setDraft((d) => {
                    const next = [...d.bullets];
                    const [moved] = next.splice(dragIndex, 1);
                    next.splice(i, 0, moved);
                    return { ...d, bullets: next };
                  });
                  setDragIndex(null);
                }}
                className="flex items-start gap-[var(--space-2)]"
              >
                <span className="mt-[10px] flex-none cursor-grab touch-none" style={{ color: "var(--muted-foreground)" }} aria-hidden>
                  <GripVertical className="h-4 w-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <textarea
                    id={`exp-line-${i}`}
                    value={line}
                    onChange={(e) => setDraft((d) => ({ ...d, bullets: d.bullets.map((b, j) => (j === i ? e.target.value.slice(0, BULLET_MAX) : b)) }))}
                    onFocus={track(`bullet:${i}`)}
                    placeholder="Describe what you did…"
                    rows={2}
                    className="w-full rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-[14px] font-semibold outline-none focus:border-[var(--primary)]"
                    style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                  />
                  <span className="self-end text-[11px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{line.length} / {BULLET_MAX}</span>
                </div>
                <button type="button" aria-label="Remove line" onClick={() => setDraft((d) => ({ ...d, bullets: d.bullets.filter((_, j) => j !== i) }))} className="dm-quiet mt-[2px] flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, bullets: [...d.bullets, ""] }))}
            className="dm-tap flex cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border border-dashed px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
            style={{ borderColor: "var(--glass-border)", color: "var(--accent-subtle)" }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Add bullet
          </button>
          <div className="flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
            <button type="button" onClick={() => setSub(ownLines ? "questions1" : "questions2")} className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
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
