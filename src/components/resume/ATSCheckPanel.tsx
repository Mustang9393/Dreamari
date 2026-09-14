"use client";

import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Sparkles } from "lucide-react";
import { saveATSCheck, type ATSCheckResult, type ResumeData, type ResumeVersion } from "@/lib/resume";
import { CARD_CLASS, INSET, ResumeModal } from "./ui";

// The full "ATS Check" audit -- resume-quality rating (score + grade + a
// 7-category breakdown + strengths/improvements), a job-match breakdown,
// a deterministic ATS-readability checklist, and missing qualifications.
// Persisted on the version (`saveATSCheck`) so opening this again shows the
// same result instantly -- `fingerprintFor` below detects when the resume
// has actually changed since that result was produced, so a stale check
// never gets presented as current.

function fingerprintFor(resume: ResumeData, version: ResumeVersion): string {
  return JSON.stringify({
    education: resume.education.map((e) => [e.schoolName, e.gradYear]),
    experience: resume.experience.map((e) => [e.title, e.where, e.startDate, e.current, e.bullets]),
    skills: resume.skills,
    profile: [resume.profile.firstName, resume.profile.lastName, resume.profile.email, resume.profile.phone, resume.profile.bio],
    jobDescription: version.jobDescription,
    targetPosition: version.targetPosition,
    targetCompany: version.targetCompany,
    template: version.template,
  });
}

function scoreTone(fraction: number) {
  return fraction >= 0.75 ? "var(--world-food-farming-nature, #3aa66b)" : fraction >= 0.5 ? "var(--color-amber-500, #f59e0b)" : "var(--color-feedback-error, #ff6b6b)";
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const fraction = max > 0 ? value / max : 0;
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="flex items-baseline justify-between gap-[8px]">
        <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
        <span className="flex-none text-[11.5px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{value}/{max}</span>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-full" style={{ background: "var(--glass-surface-1)" }}>
        <div className="h-full rounded-full" style={{ width: `${Math.max(4, fraction * 100)}%`, background: scoreTone(fraction) }} />
      </div>
    </div>
  );
}

function ListBlock({ label, items, tone }: { label: string; items: string[]; tone: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <ul className="flex flex-col gap-[6px]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-[8px] text-[13px]" style={{ color: "var(--foreground)" }}>
            <span className="mt-[3px] size-[6px] flex-none rounded-full" style={{ background: tone }} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ATSCheckPanel({ resume, version, onClose }: { resume: ResumeData; version: ResumeVersion; onClose: () => void }) {
  const fingerprint = fingerprintFor(resume, version);
  const [result, setResult] = useState<ATSCheckResult | null>(version.atsCheck);
  const [stale, setStale] = useState(!!version.atsCheck && version.atsCheck.analyzedFor !== fingerprint);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);

  async function run() {
    setRunning(true);
    setError(false);
    try {
      const res = await fetch("/api/resume-ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: version.jobDescription,
          targetPosition: version.targetPosition,
          targetCompany: version.targetCompany,
          template: version.template,
          profileName: `${resume.profile.firstName} ${resume.profile.lastName}`.trim(),
          profileEmail: resume.profile.email,
          profilePhone: resume.profile.phone,
          bio: resume.profile.bio,
          education: resume.education.map((e) => ({ schoolName: e.schoolName, gradYear: e.gradYear })),
          experience: resume.experience.map((e) => ({ id: e.id, title: e.title, where: e.where, startDate: e.startDate, current: e.current, bullets: e.bullets })),
          skills: resume.skills,
        }),
      });
      const data = (await res.json()) as { ok: boolean } & Partial<Omit<ATSCheckResult, "generatedAt" | "analyzedFor">>;
      if (data.ok && typeof data.qualityScore === "number") {
        const next: ATSCheckResult = {
          qualityScore: data.qualityScore,
          qualityGrade: data.qualityGrade ?? "",
          qualityBreakdown: data.qualityBreakdown ?? { experienceQuality: 0, bulletQuality: 0, atsFormatting: 0, completeness: 0, skills: 0, education: 0, focusConciseness: 0 },
          qualityStrengths: data.qualityStrengths ?? [],
          qualityImprovements: data.qualityImprovements ?? [],
          jobMatchScore: data.jobMatchScore ?? null,
          jobMatchLabel: data.jobMatchLabel ?? "",
          verifiedMatches: data.verifiedMatches ?? [],
          possibleMatches: data.possibleMatches ?? [],
          jobGaps: data.jobGaps ?? [],
          keywordMatches: data.keywordMatches ?? [],
          readability: data.readability ?? [],
          missingQualifications: data.missingQualifications ?? [],
          aiAssisted: !!data.aiAssisted,
          generatedAt: Date.now(),
          analyzedFor: fingerprint,
        };
        setResult(next);
        setStale(false);
        saveATSCheck(version.id, next);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setRunning(false);
    }
  }

  return (
    <ResumeModal title="ATS Check" onClose={onClose}>
      {!result ? (
        <div className={CARD_CLASS} style={INSET}>
          <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
            Checks your resume&apos;s quality, and how well it fits a job if you added one.
          </span>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="dm-tap flex min-h-[44px] cursor-pointer items-center justify-center gap-[8px] self-start rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: "var(--primary)" }}
          >
            <Sparkles className="h-4 w-4" aria-hidden /> {running ? "Checking…" : "Run ATS Check"}
          </button>
          {error && <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>Couldn&apos;t run the check right now. Try again in a moment.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--space-4)]">
          {stale && (
            <div className="flex flex-wrap items-center justify-between gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px]" style={{ borderColor: "var(--color-amber-500, #f59e0b)", background: "color-mix(in srgb, var(--color-amber-500, #f59e0b) 10%, transparent)" }}>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>Your resume has changed since this check ran.</span>
              <button type="button" onClick={run} disabled={running} className="dm-tap cursor-pointer text-[12.5px] font-bold disabled:cursor-not-allowed" style={{ color: "var(--primary)" }}>
                {running ? "Checking…" : "Re-run"}
              </button>
            </div>
          )}

          <div className={CARD_CLASS} style={INSET}>
            <div className="flex items-center justify-between gap-[12px]">
              <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Resume Rating</span>
              <span className="flex items-baseline gap-[8px]">
                <span className="text-[24px] leading-none font-extrabold tabular-nums" style={{ color: scoreTone(result.qualityScore / 100), fontFamily: "var(--font-display)" }}>{result.qualityScore}</span>
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>/100</span>
                <span className="rounded-full border px-[8px] py-[2px] text-[11px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{result.qualityGrade}</span>
              </span>
            </div>
            <div className="grid gap-[10px] sm:grid-cols-2">
              <ScoreBar label="Experience & Activities" value={result.qualityBreakdown.experienceQuality} max={25} />
              <ScoreBar label="Resume Bullets" value={result.qualityBreakdown.bulletQuality} max={15} />
              <ScoreBar label="ATS & Formatting" value={result.qualityBreakdown.atsFormatting} max={15} />
              <ScoreBar label="Completeness" value={result.qualityBreakdown.completeness} max={15} />
              <ScoreBar label="Skills" value={result.qualityBreakdown.skills} max={10} />
              <ScoreBar label="Education" value={result.qualityBreakdown.education} max={10} />
              <ScoreBar label="Focus & Conciseness" value={result.qualityBreakdown.focusConciseness} max={10} />
            </div>
            <ListBlock label="What's Working" items={result.qualityStrengths} tone="var(--world-food-farming-nature, #3aa66b)" />
            <ListBlock label="What to Improve" items={result.qualityImprovements} tone="var(--color-amber-500, #f59e0b)" />
            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>This score doesn&apos;t guarantee an interview.</p>
          </div>

          {result.jobMatchScore !== null && (
            <div className={CARD_CLASS} style={INSET}>
              <div className="flex items-center justify-between gap-[12px]">
                <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Job Match</span>
                <span className="flex items-baseline gap-[6px]">
                  <span className="text-[24px] leading-none font-extrabold tabular-nums" style={{ color: scoreTone(result.jobMatchScore / 100), fontFamily: "var(--font-display)" }}>{result.jobMatchScore}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>/100 · {result.jobMatchLabel}</span>
                </span>
              </div>
              <ListBlock label="You Already Have" items={result.verifiedMatches} tone="var(--world-food-farming-nature, #3aa66b)" />
              <ListBlock label="You May Have" items={result.possibleMatches} tone="var(--color-amber-500, #f59e0b)" />
              <ListBlock label="This Job Also Wants" items={result.jobGaps} tone="var(--muted-foreground)" />
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Doesn&apos;t predict whether you&apos;ll get an interview.</p>
            </div>
          )}

          <div className={CARD_CLASS} style={INSET}>
            <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>ATS Readability Check</span>
            <ul className="flex flex-col gap-[8px]">
              {result.readability.map((item) => (
                <li key={item.id} className="flex items-start gap-[8px]">
                  {item.status === "pass" ? (
                    <CheckCircle2 className="mt-[1px] h-4 w-4 flex-none" style={{ color: "var(--world-food-farming-nature, #3aa66b)" }} aria-hidden />
                  ) : (
                    <AlertTriangle className="mt-[1px] h-4 w-4 flex-none" style={{ color: "var(--color-amber-500, #f59e0b)" }} aria-hidden />
                  )}
                  <span className="flex flex-col gap-[1px]">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.label}</span>
                    {item.note && <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{item.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Not a guarantee every system will read it the same way.</p>
          </div>

          {result.missingQualifications.length > 0 && (
            <div className={CARD_CLASS} style={INSET}>
              <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Qualifications You May Still Need</span>
              <ul className="flex flex-col gap-[6px]">
                {result.missingQualifications.map((q) => (
                  <li key={q} className="flex items-start gap-[8px] text-[13px]" style={{ color: "var(--foreground)" }}>
                    <Check className="mt-[2px] h-3.5 w-3.5 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </ResumeModal>
  );
}
