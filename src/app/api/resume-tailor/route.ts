import { NextResponse } from "next/server";
import { matchLabelFor, mentionedSkills, type ExperienceInput, type SkillCategory, type SkillsInput } from "@/lib/resumeSkillMatch";

// Resume Builder's "Match to a Job" step (14-15 Sept 2026, direct feedback:
// "where do we introduce tailoring... make that work, and make that part
// of the flow" -- the job-description field existed in TailorScreen but
// was never actually read anywhere). Same AI-with-graceful-fallback shape
// as resume-bullets/route.ts: calls Claude when ANTHROPIC_API_KEY is set,
// otherwise a keyword-overlap fallback against our own SKILL_CATEGORIES
// list, so the feature works end-to-end with zero setup.
//
// Every suggested skill is opt-in on the client (never auto-added) and
// every suggestion/gap is grounded in the student's OWN experience bullets
// or existing skills -- never a skill invented because the job posting
// mentioned it. Matches the same "absence is real, never fabricated" rule
// this whole app already holds data to.

type Payload = {
  jobDescription?: string;
  experience?: ExperienceInput[];
  skills?: SkillsInput;
};

export type SkillSuggestion = { category: SkillCategory; skill: string; reason: string };
export type TailorAnalysis = { matchScore: number; matchLabel: string; qualityScore: number; suggestions: SkillSuggestion[]; gaps: string[]; improvements: string[]; targetPosition: string; targetCompany: string; aiAssisted: boolean };

const text = (v: unknown, max = 6000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// No separate "Target Position"/"Target Company" fields on the client
// anymore -- the replit reference only ever asks for the job description
// itself and shows the extracted target on the saved card, so this reads
// the title/company straight out of the pasted text instead (direct
// instruction, 16 Sept 2026: "match it exactly"). Best-effort only: a
// handful of common postings shapes ("Job Title: X", "Company: X", or a
// short title-cased first line), same "good enough with zero setup" bar
// as every other fallback in this feature -- the AI path below does much
// better when a key is configured.
function extractTarget(jobDescription: string): { targetPosition: string; targetCompany: string } {
  const lines = jobDescription.split("\n").map((l) => l.trim()).filter(Boolean);
  const findField = (labels: string[]) => {
    for (const line of lines.slice(0, 8)) {
      const match = line.match(new RegExp(`^(${labels.join("|")})\\s*[:\\-]\\s*(.+)$`, "i"));
      if (match) return match[2].trim().slice(0, 120);
    }
    return "";
  };
  let targetPosition = findField(["job title", "position", "title", "role"]);
  const targetCompany = findField(["company", "employer", "organization"]);
  if (!targetPosition) {
    const first = lines[0] ?? "";
    // A plausible title line: short, no sentence-ending period, not ALL lowercase.
    if (first.length > 0 && first.length <= 70 && !/[.!?]$/.test(first) && first !== first.toLowerCase()) {
      targetPosition = first;
    }
  }
  return { targetPosition, targetCompany };
}

function templateAnalysis(jobDescription: string, experience: ExperienceInput[], skills: SkillsInput): TailorAnalysis {
  const have = new Set([...skills.people, ...skills.tech, ...skills.languages].map((s) => s.toLowerCase()));
  const mentioned = mentionedSkills(jobDescription, skills, experience);

  const suggestions: SkillSuggestion[] = [];
  const gaps: string[] = [];
  let verified = 0;
  for (const { category, skill, status, supportingLabel } of mentioned) {
    if (status === "verified") {
      verified++;
    } else if (status === "possible" && supportingLabel) {
      verified++;
      suggestions.push({ category, skill, reason: `Shows up in your ${supportingLabel} experience -- worth listing as a named skill.` });
    } else {
      gaps.push(skill);
    }
  }
  const matchScore = mentioned.length > 0 ? Math.round((verified / mentioned.length) * 100) : 50;

  // A rough, honestly-heuristic completeness score for the fallback path --
  // real AI analysis (below) reasons about actual writing quality; this
  // just checks the resume has the pieces a reader would expect.
  const improvements: string[] = [];
  let qualityScore = 40;
  const totalBullets = experience.reduce((n, e) => n + e.bullets.filter((b) => b.trim()).length, 0);
  if (experience.length > 0) qualityScore += 15;
  else improvements.push("Add at least one job, club, or activity under Experience.");
  if (totalBullets >= 2) qualityScore += 15;
  else improvements.push("Add a couple more bullet points describing what you actually did.");
  if (have.size >= 3) qualityScore += 15;
  else improvements.push("List a few more specific skills beyond the basics.");
  if (experience.every((e) => e.where.trim())) qualityScore += 15;
  else improvements.push("Fill in where each experience took place.");
  qualityScore = Math.min(95, qualityScore);
  const { targetPosition, targetCompany } = extractTarget(jobDescription);

  return { matchScore, matchLabel: matchLabelFor(matchScore), qualityScore, suggestions: suggestions.slice(0, 6), gaps: gaps.slice(0, 4), improvements: improvements.slice(0, 3), targetPosition, targetCompany, aiAssisted: false };
}

function parseAiJson(raw: string, fallbackTarget: { targetPosition: string; targetCompany: string }): TailorAnalysis | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as Partial<TailorAnalysis>;
    if (typeof parsed.matchScore !== "number" || !Array.isArray(parsed.suggestions)) return null;
    const suggestions = parsed.suggestions
      .filter((s): s is SkillSuggestion => !!s && typeof s.skill === "string" && typeof s.reason === "string" && ["people", "tech", "languages"].includes(s.category))
      .slice(0, 6);
    const gaps = Array.isArray(parsed.gaps) ? parsed.gaps.filter((g): g is string => typeof g === "string").slice(0, 4) : [];
    const improvements = Array.isArray(parsed.improvements) ? parsed.improvements.filter((g): g is string => typeof g === "string").slice(0, 3) : [];
    const matchScore = Math.max(0, Math.min(100, Math.round(parsed.matchScore)));
    const qualityScore = Math.max(0, Math.min(100, Math.round(typeof parsed.qualityScore === "number" ? parsed.qualityScore : 60)));
    const targetPosition = text(parsed.targetPosition, 120) || fallbackTarget.targetPosition;
    const targetCompany = text(parsed.targetCompany, 120) || fallbackTarget.targetCompany;
    return { matchScore, matchLabel: matchLabelFor(matchScore), qualityScore, suggestions, gaps, improvements, targetPosition, targetCompany, aiAssisted: true };
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
  if (!jobDescription) return NextResponse.json({ ok: false, error: "Missing job description" }, { status: 400 });
  const experience: ExperienceInput[] = Array.isArray(body.experience)
    ? body.experience.map((e) => ({ id: text(e.id, 40), title: text(e.title, 120), where: text(e.where, 120), bullets: Array.isArray(e.bullets) ? e.bullets.map((b) => text(b, 300)) : [] }))
    : [];
  const skills: SkillsInput = {
    people: Array.isArray(body.skills?.people) ? body.skills.people.map((s) => text(s, 60)) : [],
    tech: Array.isArray(body.skills?.tech) ? body.skills.tech.map((s) => text(s, 60)) : [],
    languages: Array.isArray(body.skills?.languages) ? body.skills.languages.map((s) => text(s, 60)) : [],
  };

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const prompt = `A high school student is tailoring their resume to a job posting.

Job description:
${jobDescription}

Student's current experience:
${experience.map((e) => `- ${e.title} at ${e.where}: ${e.bullets.join("; ")}`).join("\n") || "(none listed)"}

Student's current skills:
People: ${skills.people.join(", ") || "none"}. Tech: ${skills.tech.join(", ") || "none"}. Languages: ${skills.languages.join(", ") || "none"}.

Return ONLY a JSON object, no other text, with this exact shape:
{"targetPosition": "<the job title this posting is for, read from the text above -- empty string if genuinely not stated>", "targetCompany": "<the company/organization name, read from the text above -- empty string if genuinely not stated>", "matchScore": <0-100 integer, how well the student's ACTUAL experience matches this job>, "qualityScore": <0-100 integer, how strong this resume is in general -- clarity, specificity, completeness, regardless of this one job>, "suggestions": [{"category": "people"|"tech"|"languages", "skill": "<short skill name>", "reason": "<one short sentence, grounded in a SPECIFIC thing from the student's experience above, never invented>"}], "gaps": ["<short phrase for a real job requirement the student's profile does not yet support>"], "improvements": ["<one short, encouraging, specific tip to strengthen the resume itself>"]}

Rules: targetPosition/targetCompany must come from the posting text itself, never guessed or invented. Suggestions must be skills the student's OWN experience actually supports (cite the specific experience in the reason) -- never suggest a skill just because the job posting wants it. At most 5 suggestions, at most 4 gaps, at most 3 improvements. Only suggest skills not already in their current skills list. Keep every string short and plain -- this is read by a high school student.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
      });
      if (res.ok) {
        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        const raw = data.content?.find((c) => c.type === "text")?.text ?? "";
        const parsed = parseAiJson(raw, extractTarget(jobDescription));
        if (parsed) return NextResponse.json({ ok: true, ...parsed });
      } else {
        console.error("[resume-tailor] anthropic failed", res.status);
      }
    } catch (err) {
      console.error("[resume-tailor] anthropic error", err);
    }
  }
  return NextResponse.json({ ok: true, ...templateAnalysis(jobDescription, experience, skills) });
}
