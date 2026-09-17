// The one place an ATS check is run from -- the finished document runs it
// automatically for every new or changed resume (direct feedback, 17 Sept
// 2026: "every resume that is generated should automatically be ATS
// checked and scored, right now it's manual"), and the ATS Check panel
// re-runs it on demand. Same request, same persistence, one fingerprint.

import { saveATSCheck, type ATSCheckResult, type ResumeData, type ResumeVersion } from "./resume";

/** What the last check was computed from; if this changes, the stored result is stale. */
export function fingerprintFor(resume: ResumeData, version: ResumeVersion): string {
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

export function atsIsStale(resume: ResumeData, version: ResumeVersion): boolean {
  return !version.atsCheck || version.atsCheck.analyzedFor !== fingerprintFor(resume, version);
}

/** Runs the check and stores the result on the version. Resolves null on any failure. */
export async function runAtsCheck(resume: ResumeData, version: ResumeVersion): Promise<ATSCheckResult | null> {
  const fingerprint = fingerprintFor(resume, version);
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
    if (!data.ok || typeof data.qualityScore !== "number") return null;
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
    saveATSCheck(version.id, next);
    return next;
  } catch {
    return null;
  }
}
