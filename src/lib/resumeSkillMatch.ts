// Shared by the two job-matching AI routes' fallback paths
// (resume-tailor/route.ts, resume-ats-check/route.ts) -- both classify
// which of the same skill-pool entries a job description mentions, and
// whether the student's real profile backs each one up. Was copy-pasted
// identically into both files; extracted here so the pool and the
// verified/possible/missing rule can't drift apart between the two.

export type SkillCategory = "people" | "tech" | "languages";
export type ExperienceInput = { id: string; title: string; where: string; bullets: string[] };
export type SkillsInput = { people: string[]; tech: string[]; languages: string[] };
export type MentionedSkillStatus = "verified" | "possible" | "missing";
export type MentionedSkill = { category: SkillCategory; skill: string; status: MentionedSkillStatus; supportingLabel: string | null };

export const SKILL_POOL: { category: SkillCategory; skills: string[] }[] = [
  { category: "people", skills: ["Communication", "Teamwork", "Leadership", "Customer Service", "Adaptability", "Professionalism", "Problem Solving", "Time Management"] },
  { category: "tech", skills: ["Microsoft Excel", "Google Workspace", "Canva", "Photoshop", "Python", "Cash Register", "Social Media"] },
  { category: "languages", skills: ["English", "Spanish", "Mandarin", "French", "Hindi", "Arabic"] },
];

export function matchLabelFor(score: number): string {
  if (score >= 75) return "Strong Match";
  if (score >= 45) return "Possible Match";
  return "Early Fit";
}

/** Every SKILL_POOL entry the job description mentions, each classified
 *  against the student's real skills/experience -- "verified" (already a
 *  named skill), "possible" (shows up in an experience bullet but isn't
 *  named), or "missing" (neither). Never invents a skill the pool doesn't
 *  already list. */
export function mentionedSkills(jobDescription: string, skills: SkillsInput, experience: ExperienceInput[]): MentionedSkill[] {
  const jdLower = jobDescription.toLowerCase();
  const have = new Set([...skills.people, ...skills.tech, ...skills.languages].map((s) => s.toLowerCase()));
  return SKILL_POOL.flatMap((c) => c.skills.map((skill) => ({ category: c.category, skill })))
    .filter(({ skill }) => jdLower.includes(skill.toLowerCase()))
    .map(({ category, skill }) => {
      const skillLower = skill.toLowerCase();
      if (have.has(skillLower)) return { category, skill, status: "verified" as const, supportingLabel: null };
      const supporting = experience.find((e) => [e.title, e.where, ...e.bullets].join(" ").toLowerCase().includes(skillLower));
      if (supporting) return { category, skill, status: "possible" as const, supportingLabel: supporting.title || supporting.where };
      return { category, skill, status: "missing" as const, supportingLabel: null };
    });
}
