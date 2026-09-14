import { Briefcase, Building2, FlaskConical, HeartHandshake, Sparkles, Target, type LucideIcon } from "lucide-react";
import type { ExperienceType } from "@/lib/resume";

export const EXPERIENCE_TYPES: { type: ExperienceType; label: string; hint: string; Icon: LucideIcon }[] = [
  { type: "job", label: "Job", hint: "Part-time, summer, seasonal work", Icon: Briefcase },
  { type: "internship", label: "Internship", hint: "Shadowing, formal or informal", Icon: Building2 },
  { type: "research", label: "Research", hint: "Research assistant, science project, lab", Icon: FlaskConical },
  { type: "volunteer", label: "Volunteer", hint: "Community service, cause work", Icon: HeartHandshake },
  { type: "club", label: "Club / Activity", hint: "Sports, arts, music, any club", Icon: Target },
  { type: "other", label: "Other", hint: "Anything else worth mentioning!", Icon: Sparkles },
];

export const SKILL_CATEGORIES = [
  { key: "people" as const, label: "People Skills", hint: "How you work and communicate with others.", suggestions: ["Communication", "Teamwork", "Leadership", "Customer Service", "Adaptability", "Professionalism", "Problem Solving", "Time Management"] },
  { key: "tech" as const, label: "Tech Skills", hint: "Tools and technology you know how to use.", suggestions: ["Microsoft Excel", "Google Workspace", "Canva", "Photoshop", "Python", "Cash Register", "Social Media"] },
  { key: "languages" as const, label: "Languages", hint: "Languages you can speak or use.", suggestions: ["English", "Spanish", "Mandarin", "French", "Hindi", "Arabic"] },
];

export const EDUCATION_PROGRAMS = ["AP", "IB", "None"] as const;

export const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India", "Germany", "France", "Mexico", "Brazil", "China",
  "Japan", "South Korea", "Nigeria", "South Africa", "Philippines", "Pakistan", "Bangladesh", "Indonesia", "Vietnam", "Thailand",
  "Malaysia", "Singapore", "New Zealand", "Ireland", "Netherlands", "Spain", "Italy", "Portugal", "Sweden", "Norway",
  "Denmark", "Finland", "Poland", "Ukraine", "Turkey", "Egypt", "Kenya", "Ghana", "Argentina", "Colombia",
  "Chile", "Peru", "Saudi Arabia", "UAE", "Israel", "Other",
];

/** Plain-English questions for the Experience "Questions" step, by type --
 *  reference kept these generic across all six types; we do the same. */
export const EXPERIENCE_QUESTIONS = [
  { key: "dayToDay" as const, label: "What did you do day-to-day?", placeholder: "e.g. Helped customers" },
  { key: "tools" as const, label: "What tools or skills did you use?", placeholder: "e.g. Cash register" },
  { key: "team" as const, label: "Did you work with a team or customers?", placeholder: "e.g. Team of 5" },
  { key: "proud" as const, label: "What are you most proud of?", placeholder: "e.g. Employee of the month" },
];

/** Resume document presets -- same single-column format throughout (direct
 *  feedback, 14 Sept 2026: keep the reference's actual layout, just offer
 *  color/style variety on top of it), so a template only changes the accent
 *  color and the name's font pairing, never the structure. "Classic" is the
 *  literal default: pure black ink, matching the reference exactly. */
export type ResumeTemplateId = "classic" | "navy" | "forest" | "charcoal";
export const RESUME_TEMPLATES: { id: ResumeTemplateId; label: string; accent: string; nameFont: "sans" | "serif" }[] = [
  { id: "classic", label: "Classic", accent: "#000000", nameFont: "sans" },
  { id: "navy", label: "Navy", accent: "#1f3a5f", nameFont: "sans" },
  { id: "forest", label: "Forest", accent: "#1f4d3d", nameFont: "serif" },
  { id: "charcoal", label: "Charcoal & Gold", accent: "#a8710a", nameFont: "sans" },
];
export const DEFAULT_RESUME_TEMPLATE: ResumeTemplateId = "classic";
