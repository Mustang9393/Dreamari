"use client";

import { useState } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { addSkill, upsertVersion, type ResumeData, type ResumeSkills, type ResumeVersion } from "@/lib/resume";
import { CARD_CLASS, Field, INSET, ResumeModal } from "./ui";

type SkillCategory = keyof ResumeSkills;
type SkillSuggestion = { category: SkillCategory; skill: string; reason: string };
type TailorAnalysis = { matchScore: number; matchLabel: string; qualityScore: number; suggestions: SkillSuggestion[]; gaps: string[]; improvements: string[]; targetPosition: string; targetCompany: string };

const CATEGORY_LABEL: Record<SkillCategory, string> = { people: "People", tech: "Tech", languages: "Languages" };

function ScoreChip({ label, value, sublabel }: { label: string; value: number; sublabel?: string }) {
  const tone = value >= 75 ? "var(--world-food-farming-nature, #3aa66b)" : value >= 45 ? "var(--accent-subtle)" : "var(--muted-foreground)";
  return (
    <div className="flex flex-1 flex-col gap-[2px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
      <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="flex items-baseline gap-[6px]">
        <span className="text-[22px] leading-none font-extrabold tabular-nums" style={{ color: tone, fontFamily: "var(--font-display)" }}>{value}</span>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>/100{sublabel ? ` · ${sublabel}` : ""}</span>
      </span>
    </div>
  );
}

function SuggestionRow({ suggestion, added, onAdd }: { suggestion: SkillSuggestion; added: boolean; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
      <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
        <span className="flex items-center gap-[6px] text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>
          {suggestion.skill}
          <span className="rounded-full border px-[6px] py-[1px] text-[10px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{CATEGORY_LABEL[suggestion.category]}</span>
        </span>
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{suggestion.reason}</span>
      </span>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className="dm-tap flex flex-none cursor-pointer items-center gap-[4px] rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold disabled:cursor-default"
        style={added ? { borderColor: "var(--world-food-farming-nature, #3aa66b)", color: "var(--world-food-farming-nature, #3aa66b)", background: "color-mix(in srgb, var(--world-food-farming-nature, #3aa66b) 12%, transparent)" } : { borderColor: "var(--primary)", color: "var(--primary)" }}
      >
        {added ? <><Check className="h-3.5 w-3.5" aria-hidden /> Added</> : <><Plus className="h-3.5 w-3.5" aria-hidden /> Add</>}
      </button>
    </div>
  );
}

// Tailor Resume, on its own now -- a button on the finished resume, exactly
// like ATS Check, not a one-time step bundled into naming/education/
// template selection (direct feedback, 15 Sept 2026: "I WANT THE TAILOR
// RESUME TO BE A BUTTON ON THE FINAL PREVIEW SCREEN JUST LIKE ATS CHECK.
// AND THE TAILORING HAPPENS AS A SEPERATE THING FROM THE LAST
// NAMING/TEMPLATE CHANGER"). Reachable anytime after saving, any number of
// times, against a different job each time -- re-running just overwrites
// the job description/target fields on the version, the same way ATS Check
// overwrites its own stored result on a re-run (direct feedback: "once
// ive saved, i could want to tailor it to many jobs").
export function JobMatchPanel({ resume, version, onClose }: { resume: ResumeData; version: ResumeVersion; onClose: () => void }) {
  const [jobDescription, setJobDescription] = useState(version.jobDescription);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TailorAnalysis | null>(null);
  const [analyzedFor, setAnalyzedFor] = useState("");
  const [analyzeError, setAnalyzeError] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const isStale = analysis !== null && analyzedFor !== jobDescription;

  async function findMatchingSkills() {
    setAnalyzing(true);
    setAnalyzeError(false);
    try {
      const res = await fetch("/api/resume-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          experience: resume.experience.map((e) => ({ id: e.id, title: e.title, where: e.where, bullets: e.bullets })),
          skills: resume.skills,
        }),
      });
      const data = (await res.json()) as { ok: boolean } & Partial<TailorAnalysis>;
      if (data.ok && typeof data.matchScore === "number") {
        const targetPosition = data.targetPosition ?? "";
        const targetCompany = data.targetCompany ?? "";
        setAnalysis({ matchScore: data.matchScore, matchLabel: data.matchLabel ?? "", qualityScore: data.qualityScore ?? 0, suggestions: data.suggestions ?? [], gaps: data.gaps ?? [], improvements: data.improvements ?? [], targetPosition, targetCompany });
        setAnalyzedFor(jobDescription);
        upsertVersion({ ...version, jobDescription, targetPosition, targetCompany, updatedAt: Date.now() });
      } else {
        setAnalyzeError(true);
      }
    } catch {
      setAnalyzeError(true);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <ResumeModal title="Tailor Resume" onClose={onClose}>
      <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        Paste a job description to see how this resume fits, and which skills are worth adding. Come back and tailor it to a different job anytime.
      </p>

      {/* Just the job description, no separate Target Position/Company
         fields -- the replit reference only ever asks for this, and reads
         the title/company straight out of the pasted text itself (direct
         instruction, 16 Sept 2026: "match it exactly"). */}
      <Field label="Job Description" htmlFor="jm-jd">
        <textarea
          id="jm-jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={6}
          className="w-full rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] text-[14px] font-semibold outline-none focus:border-[var(--primary)]"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        />
      </Field>

      <button
        type="button"
        onClick={findMatchingSkills}
        disabled={analyzing || jobDescription.trim().length === 0}
        className="dm-tap flex min-h-[44px] cursor-pointer items-center justify-center gap-[8px] self-start rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
        style={{ background: "var(--primary)" }}
      >
        <Sparkles className="h-4 w-4" aria-hidden /> {analyzing ? "Finding matches…" : analysis ? "Re-run" : "Find Matching Skills"}
      </button>
      {analyzeError && <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>Couldn&apos;t match this job. Try again in a moment.</p>}

      {analysis && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {isStale && (
            <div className="flex flex-wrap items-center justify-between gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px]" style={{ borderColor: "var(--color-amber-500, #f59e0b)", background: "color-mix(in srgb, var(--color-amber-500, #f59e0b) 10%, transparent)" }}>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>These results are for a different job description now.</span>
            </div>
          )}

          <div className={CARD_CLASS} style={INSET}>
            {(analysis.targetPosition || analysis.targetCompany) && (
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                Target: <span style={{ color: "var(--foreground)" }}>{[analysis.targetPosition, analysis.targetCompany].filter(Boolean).join(" at ")}</span>
              </span>
            )}
            <div className="flex gap-[var(--space-3)]">
              <ScoreChip label="Resume Quality" value={analysis.qualityScore} />
              <ScoreChip label="Job Match" value={analysis.matchScore} sublabel={analysis.matchLabel} />
            </div>
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Skills worth adding</span>
              {analysis.suggestions.map((s) => (
                <SuggestionRow
                  key={s.skill}
                  suggestion={s}
                  added={added.has(s.skill) || resume.skills[s.category].some((have) => have.toLowerCase() === s.skill.toLowerCase())}
                  onAdd={() => { addSkill(s.category, s.skill); setAdded((cur) => new Set(cur).add(s.skill)); }}
                />
              ))}
            </div>
          )}

          {analysis.improvements.length > 0 && (
            <div className="flex flex-col gap-[4px]">
              <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Worth strengthening</span>
              <ul className="flex flex-col gap-[3px] pl-[16px]" style={{ listStyleType: "disc", color: "var(--muted-foreground)" }}>
                {analysis.improvements.map((tip) => <li key={tip} className="text-[12.5px]">{tip}</li>)}
              </ul>
            </div>
          )}

          {analysis.gaps.length > 0 && (
            <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Not yet covered: {analysis.gaps.join(", ")}.</p>
          )}
        </div>
      )}
    </ResumeModal>
  );
}
