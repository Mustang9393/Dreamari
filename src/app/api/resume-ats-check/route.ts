import { NextResponse } from "next/server";
import { matchLabelFor, mentionedSkills } from "@/lib/resumeSkillMatch";

// The full "ATS Check" audit (15 Sept 2026, direct feedback: "make sure all
// of the functionality from the replit is there" -- the reference's ATS
// Check tab combines four things: a resume-quality rating with a 7-category
// breakdown, a job-match breakdown, a deterministic ATS-readability
// checklist, and a list of job requirements the profile doesn't support).
//
// Split by what actually needs judgment vs what's just checkable: the
// readability checklist and four of the seven quality categories
// (completeness, skills, education, ATS formatting) are computed directly
// from the resume data below -- no AI, no fabrication risk, always
// available. Only the genuinely subjective pieces (how GOOD the experience
// descriptions and bullets are, job-match reasoning, keyword-by-keyword
// verification) go through Claude when a key is present, with a heuristic
// fallback otherwise -- same "still function gracefully" shape as
// resume-bullets/route.ts and resume-tailor/route.ts.

type ExperienceInput = { id: string; title: string; where: string; startDate: string; current: boolean; bullets: string[] };
type SkillsInput = { people: string[]; tech: string[]; languages: string[] };
type EducationInput = { schoolName: string; gradYear: string };

type Payload = {
  jobDescription?: string;
  targetPosition?: string;
  targetCompany?: string;
  template?: string;
  profileName?: string;
  profileEmail?: string;
  profilePhone?: string;
  bio?: string;
  education?: EducationInput[];
  experience?: ExperienceInput[];
  skills?: SkillsInput;
};

type KeywordStatus = "verified" | "possible" | "missing";
type KeywordMatch = { keyword: string; status: KeywordStatus; context: string };
type ReadabilityItem = { id: string; label: string; status: "pass" | "warn"; note: string };
type QualityBreakdown = { experienceQuality: number; bulletQuality: number; atsFormatting: number; completeness: number; skills: number; education: number; focusConciseness: number };

const text = (v: unknown, max = 6000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const MULTI_COLUMN_TEMPLATES = new Set(["sidebar-navy", "sidebar", "banner-gold", "banner"]);

function gradeFor(score: number): string {
  if (score >= 85) return "EX — Excellent";
  if (score >= 70) return "ST — Strong";
  if (score >= 50) return "NW — Needs Work";
  return "GS — Getting Started";
}

function computeReadability(input: {
  template: string;
  email: string;
  education: EducationInput[];
  experience: ExperienceInput[];
  skillsCount: number;
  jobDescription: string;
  keywordMatches: KeywordMatch[];
}): ReadabilityItem[] {
  const items: ReadabilityItem[] = [
    { id: "headings", label: "Standard section headings", status: "pass", note: "" },
    MULTI_COLUMN_TEMPLATES.has(input.template)
      ? { id: "layout", label: "Single-column layout", status: "warn", note: "This template has multiple columns. Some systems can't read it well. Try Classic or Minimal." }
      : { id: "layout", label: "Single-column layout", status: "pass", note: "" },
    input.email
      ? { id: "contact", label: "Contact information", status: "pass", note: "" }
      : { id: "contact", label: "Contact information", status: "warn", note: "Add an email address so employers can reach you." },
    input.education.length > 0
      ? { id: "education", label: "Education information", status: "pass", note: "" }
      : { id: "education", label: "Education information", status: "warn", note: "Add at least one school under Education." },
    input.experience.length > 0 && input.experience.some((e) => e.bullets.some((b) => b.trim()))
      ? { id: "experience", label: "Experience details", status: "pass", note: "" }
      : { id: "experience", label: "Experience details", status: "warn", note: "Add at least one experience with real bullet points." },
    input.skillsCount >= 3
      ? { id: "skills", label: "Skills (3–5 confirmed)", status: "pass", note: "" }
      : { id: "skills", label: "Skills (3–5 confirmed)", status: "warn", note: `You picked ${input.skillsCount}. Add more in Skills.` },
    input.experience.length === 0 || input.experience.every((e) => e.startDate.trim() || e.current)
      ? { id: "dates", label: "Date formatting", status: "pass", note: "" }
      : { id: "dates", label: "Date formatting", status: "warn", note: "Add start dates to your experience entries." },
    { id: "graphics", label: "No graphics, tables, or icons", status: "pass", note: "" },
    !input.jobDescription
      ? { id: "keywords", label: "Job description keyword alignment", status: "pass", note: "Add a job description under Match to a Job to check this." }
      : (() => {
          const missing = input.keywordMatches.filter((k) => k.status === "missing").length;
          return missing <= 1
            ? { id: "keywords", label: "Job description keyword alignment", status: "pass" as const, note: "" }
            : { id: "keywords", label: "Job description keyword alignment", status: "warn" as const, note: `${missing} keyword(s) from the job aren't backed by your profile. See below.` };
        })(),
  ];
  return items;
}

function deterministicScores(input: { email: string; phone: string; name: string; bio: string; education: EducationInput[]; experience: ExperienceInput[]; skillsCount: number; readability: ReadabilityItem[] }) {
  const filled = [!!input.name, !!input.email, input.education.length > 0, input.experience.some((e) => e.bullets.some((b) => b.trim())), input.skillsCount > 0, !!input.phone];
  const completeness = Math.round(15 * (filled.filter(Boolean).length / filled.length));
  const skills = input.skillsCount === 0 ? 2 : input.skillsCount <= 2 ? 5 : input.skillsCount <= 4 ? 8 : 10;
  const education = input.education.length === 0 ? 0 : input.education.every((e) => e.schoolName.trim() && e.gradYear.trim()) ? 10 : 6;
  const atsFormatting = Math.round(15 * (input.readability.filter((r) => r.status === "pass").length / input.readability.length));
  return { completeness, skills, education, atsFormatting };
}

function fallbackExperienceScores(experience: ExperienceInput[]): { experienceQuality: number; bulletQuality: number; focusConciseness: number } {
  const bullets = experience.flatMap((e) => e.bullets.filter((b) => b.trim()));
  const hasQuantifier = bullets.some((b) => /\d/.test(b));
  const experienceQuality = Math.min(25, 8 + bullets.length * 3 + (hasQuantifier ? 5 : 0));
  const avgLen = bullets.length ? bullets.reduce((n, b) => n + b.length, 0) / bullets.length : 0;
  const bulletQuality = Math.min(15, 5 + (avgLen >= 40 && avgLen <= 160 ? 8 : 3) + (bullets.length >= 2 ? 2 : 0));
  const focusConciseness = Math.min(10, bullets.every((b) => b.length <= 180) ? 8 : 5);
  return { experienceQuality, bulletQuality, focusConciseness };
}

function fallbackJobMatch(jobDescription: string, experience: ExperienceInput[], skills: SkillsInput) {
  if (!jobDescription) return { jobMatchScore: null, jobMatchLabel: "", verifiedMatches: [] as string[], possibleMatches: [] as string[], jobGaps: [] as string[], keywordMatches: [] as KeywordMatch[], missingQualifications: [] as string[] };
  const mentioned = mentionedSkills(jobDescription, skills, experience);
  const keywordMatches: KeywordMatch[] = mentioned.map(({ skill, status, supportingLabel }) => ({
    keyword: skill,
    status,
    context: status === "verified" ? "Listed in your confirmed skills." : status === "possible" ? `Reflected in your ${supportingLabel} experience, not listed as a named skill.` : "No verified experience or skill.",
  }));
  const verifiedMatches = keywordMatches.filter((k) => k.status === "verified").map((k) => k.keyword);
  const possibleMatches = keywordMatches.filter((k) => k.status === "possible").map((k) => k.keyword);
  const jobGaps = keywordMatches.filter((k) => k.status === "missing").map((k) => k.keyword);
  const jobMatchScore = mentioned.length > 0 ? Math.round(((verifiedMatches.length + possibleMatches.length * 0.5) / mentioned.length) * 100) : 50;
  const jobMatchLabel = matchLabelFor(jobMatchScore);
  const missingQualifications = jobGaps.map((g) => `${g} — no verified experience`);
  return { jobMatchScore, jobMatchLabel, verifiedMatches, possibleMatches, jobGaps, keywordMatches, missingQualifications };
}

function parseAiJson(raw: string): {
  experienceQuality: number; bulletQuality: number; focusConciseness: number;
  qualityStrengths: string[]; qualityImprovements: string[];
  jobMatchScore: number | null; jobMatchLabel: string; verifiedMatches: string[]; possibleMatches: string[]; jobGaps: string[];
  keywordMatches: KeywordMatch[]; missingQualifications: string[];
} | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const p = JSON.parse(match[0]) as Record<string, unknown>;
    const clamp = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(typeof v === "number" ? v : 0)));
    const strList = (v: unknown, max: number) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, max) : []);
    const keywordMatches = Array.isArray(p.keywordMatches)
      ? p.keywordMatches
          .filter((k): k is Record<string, unknown> => !!k && typeof k === "object")
          .map((k) => ({ keyword: typeof k.keyword === "string" ? k.keyword : "", status: (["verified", "possible", "missing"].includes(k.status as string) ? k.status : "missing") as KeywordStatus, context: typeof k.context === "string" ? k.context : "" }))
          .filter((k) => k.keyword)
          .slice(0, 12)
      : [];
    const jobMatchScore = typeof p.jobMatchScore === "number" ? Math.max(0, Math.min(100, Math.round(p.jobMatchScore))) : null;
    return {
      experienceQuality: clamp(p.experienceQuality, 25),
      bulletQuality: clamp(p.bulletQuality, 15),
      focusConciseness: clamp(p.focusConciseness, 10),
      qualityStrengths: strList(p.qualityStrengths, 4),
      qualityImprovements: strList(p.qualityImprovements, 4),
      jobMatchScore,
      jobMatchLabel: jobMatchScore === null ? "" : jobMatchScore >= 75 ? "Strong Match" : jobMatchScore >= 45 ? "Possible Match" : "Early Fit",
      verifiedMatches: strList(p.verifiedMatches, 6),
      possibleMatches: strList(p.possibleMatches, 6),
      jobGaps: strList(p.jobGaps, 6),
      keywordMatches,
      missingQualifications: strList(p.missingQualifications, 6),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const jobDescription = text(body.jobDescription);
  const targetPosition = text(body.targetPosition, 120);
  const targetCompany = text(body.targetCompany, 120);
  const template = text(body.template, 60) || "classic";
  const name = text(body.profileName, 120);
  const email = text(body.profileEmail, 120);
  const phone = text(body.profilePhone, 60);
  const bio = text(body.bio, 400);
  const education: EducationInput[] = Array.isArray(body.education) ? body.education.map((e) => ({ schoolName: text(e.schoolName, 120), gradYear: text(e.gradYear, 20) })) : [];
  const experience: ExperienceInput[] = Array.isArray(body.experience)
    ? body.experience.map((e) => ({ id: text(e.id, 40), title: text(e.title, 120), where: text(e.where, 120), startDate: text(e.startDate, 20), current: !!e.current, bullets: Array.isArray(e.bullets) ? e.bullets.map((b) => text(b, 300)) : [] }))
    : [];
  const skills: SkillsInput = {
    people: Array.isArray(body.skills?.people) ? body.skills.people.map((s) => text(s, 60)) : [],
    tech: Array.isArray(body.skills?.tech) ? body.skills.tech.map((s) => text(s, 60)) : [],
    languages: Array.isArray(body.skills?.languages) ? body.skills.languages.map((s) => text(s, 60)) : [],
  };
  const skillsCount = skills.people.length + skills.tech.length + skills.languages.length;

  let aiAssisted = false;
  let jobResult = fallbackJobMatch(jobDescription, experience, skills);
  let expScores = fallbackExperienceScores(experience);
  let qualityStrengths: string[] = [];
  let qualityImprovements: string[] = [];

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const prompt = `You are auditing a high school student's resume for quality and (if given) fit against a job posting. Never invent experience, skills, or qualifications the student doesn't actually have -- every claim must trace back to what's listed below.

Student's experience:
${experience.map((e) => `- ${e.title} at ${e.where}: ${e.bullets.join("; ") || "(no bullets yet)"}`).join("\n") || "(none listed)"}

Student's skills: People: ${skills.people.join(", ") || "none"}. Tech: ${skills.tech.join(", ") || "none"}. Languages: ${skills.languages.join(", ") || "none"}.
Bio: ${bio || "(none)"}

${jobDescription ? `Job posting${targetPosition ? ` for "${targetPosition}"` : ""}${targetCompany ? ` at "${targetCompany}"` : ""}:\n${jobDescription}` : "No job description provided -- skip all job-match fields (return null/empty for them)."}

Return ONLY a JSON object with this exact shape:
{"experienceQuality": <0-25 integer, how substantial and relevant the experience entries are>, "bulletQuality": <0-15 integer, how well-written the bullets are: action verbs, specificity, concision>, "focusConciseness": <0-10 integer, is the resume focused and free of filler>, "qualityStrengths": ["<up to 3 short, specific things this resume does well, each citing a real detail>"], "qualityImprovements": ["<up to 3 short, specific, actionable tips>"], "jobMatchScore": <0-100 integer or null if no job description>, "verifiedMatches": ["<short phrase for something the student's real background confirms>"], "possibleMatches": ["<short phrase for something plausibly true but not fully confirmed>"], "jobGaps": ["<short phrase for a real job requirement not supported by the profile>"], "keywordMatches": [{"keyword": "<short keyword or phrase from the job description>", "status": "verified"|"possible"|"missing", "context": "<one short sentence grounding the status in a specific real detail>"}], "missingQualifications": ["<one short sentence per job requirement the profile does NOT support, each ending in a reason like '-- no verified experience'>"]}

Write at an 8th-grade reading level: short sentences, plain words, no jargon. At most 6 items in any array.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 1100, messages: [{ role: "user", content: prompt }] }),
      });
      if (res.ok) {
        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        const raw = data.content?.find((c) => c.type === "text")?.text ?? "";
        const parsed = parseAiJson(raw);
        if (parsed) {
          aiAssisted = true;
          expScores = { experienceQuality: parsed.experienceQuality, bulletQuality: parsed.bulletQuality, focusConciseness: parsed.focusConciseness };
          qualityStrengths = parsed.qualityStrengths;
          qualityImprovements = parsed.qualityImprovements;
          jobResult = {
            jobMatchScore: parsed.jobMatchScore,
            jobMatchLabel: parsed.jobMatchLabel,
            verifiedMatches: parsed.verifiedMatches,
            possibleMatches: parsed.possibleMatches,
            jobGaps: parsed.jobGaps,
            keywordMatches: parsed.keywordMatches,
            missingQualifications: parsed.missingQualifications,
          };
        }
      } else {
        console.error("[resume-ats-check] anthropic failed", res.status);
      }
    } catch (err) {
      console.error("[resume-ats-check] anthropic error", err);
    }
  }

  const readability = computeReadability({ template, email, education, experience, skillsCount, jobDescription, keywordMatches: jobResult.keywordMatches });
  const det = deterministicScores({ email, phone, name, bio, education, experience, skillsCount, readability });

  if (!aiAssisted) {
    if (!phone) qualityImprovements.push("Add a phone number.");
    if (skillsCount < 3) qualityImprovements.push("Add a few more specific skills.");
    for (const item of readability) if (item.status === "warn" && item.note && qualityImprovements.length < 4) qualityImprovements.push(item.note);
    if (expScores.experienceQuality >= 15) qualityStrengths.push("Your experience details are specific, not vague.");
    if (/\d/.test(experience.flatMap((e) => e.bullets).join(" "))) qualityStrengths.push("Your bullets use real numbers. That reads well.");
    if (qualityStrengths.length === 0) qualityStrengths.push("Your resume has all the sections employers expect.");
  }

  const qualityBreakdown: QualityBreakdown = { ...expScores, atsFormatting: det.atsFormatting, completeness: det.completeness, skills: det.skills, education: det.education };
  const qualityScore = Math.max(0, Math.min(100, Object.values(qualityBreakdown).reduce((n, v) => n + v, 0)));

  return NextResponse.json({
    ok: true,
    qualityScore,
    qualityGrade: gradeFor(qualityScore),
    qualityBreakdown,
    qualityStrengths: qualityStrengths.slice(0, 4),
    qualityImprovements: qualityImprovements.slice(0, 4),
    jobMatchScore: jobResult.jobMatchScore,
    jobMatchLabel: jobResult.jobMatchLabel,
    verifiedMatches: jobResult.verifiedMatches,
    possibleMatches: jobResult.possibleMatches,
    jobGaps: jobResult.jobGaps,
    keywordMatches: jobResult.keywordMatches,
    readability,
    missingQualifications: jobResult.missingQualifications,
    aiAssisted,
  });
}
