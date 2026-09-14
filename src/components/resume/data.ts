import { Briefcase, Building2, FlaskConical, HeartHandshake, Sparkles, Target, type LucideIcon } from "lucide-react";
import type { ExperienceType, ResumeData } from "@/lib/resume";

/** Dreamy, one line + sprite per wizard step -- same pattern as Build's own
 *  STAGE_DREAMY (src/components/build/types.ts), reusing the exact sprite
 *  set rather than inventing new art. Brought in deliberately prominent
 *  (direct feedback, 14 Sept 2026: "not as small as its used in the
 *  replit... not like an afterthought... imagine it like we did for
 *  build"), not the reference's small inline coaching-tip treatment. */
export const RESUME_WIZARD_DREAMY: { line: string; sprite: string }[] = [
  { line: "Let's start with the basics about you. ✨", sprite: "/images/dreamy/v2/dreamy-happy.png" },
  { line: "Where do you go to school? ✨", sprite: "/images/dreamy/v2/dreamy-glasses.png" },
  { line: "Jobs, clubs, volunteering. It all counts! ✨", sprite: "/images/dreamy/v2/dreamy-controller.png" },
  { line: "What are you good at? ✨", sprite: "/images/dreamy/v2/dreamy-idea.png" },
  { line: "Any certifications? Skip this if not. ✨", sprite: "/images/dreamy/v2/dreamy-curious.png" },
  { line: "Almost there. Let's look everything over. ✨", sprite: "/images/dreamy/v2/dreamy-party.png" },
];
export const RESUME_TEMPLATE_GALLERY_DREAMY = { line: "Pick the look that feels most like you. ✨", sprite: "/images/dreamy/v2/dreamy-heart.png" };

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

/** Resume document presets -- four real, structurally distinct layouts
 *  (direct feedback, 14 Sept 2026: "templates should have different
 *  layouts, fonts, colors etc"), matched to archetypes actually common
 *  across US resume builders (Canva, Novoresume, Zety) and career-center
 *  guidance:
 *  - "single-column": traditional reverse-chronological, centered header.
 *    The safest, most ATS-friendly shape and the one "Classic" (the literal
 *    reference default) uses -- system sans, pure black ink.
 *  - "sidebar": a tinted aside carrying contact/skills/certifications next
 *    to a main column carrying the story (bio/experience/education) --
 *    the most common "modern" template shape.
 *  - "minimal": left-aligned header, thin accent-colored section labels
 *    instead of full-width rules, more whitespace -- the understated shape
 *    common on tech/design-role resumes.
 *  - "banner": a full-width colored band carries the name, body stays
 *    single column below it -- the boldest, most visually distinct option.
 *  Fonts are system-safe stacks only (no new network font loads, and it
 *  keeps Print/Save PDF and any future export reliable). */
type ResumeLayout = "single-column" | "sidebar" | "minimal" | "banner";
export type ResumeTemplateId = "classic" | "sidebar-navy" | "minimal-forest" | "banner-gold";
export const RESUME_TEMPLATES: { id: ResumeTemplateId; label: string; description: string; layout: ResumeLayout; accent: string; nameFont: string; bodyFont?: string }[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Traditional single column, centered header. The safest choice for any US employer or ATS.",
    layout: "single-column",
    accent: "#000000",
    nameFont: "'Helvetica Neue', Arial, sans-serif",
  },
  {
    id: "sidebar-navy",
    label: "Modern Sidebar",
    description: "A navy sidebar holds your contact info, skills and certifications, so your story leads the main column.",
    layout: "sidebar",
    accent: "#1f3a5f",
    nameFont: "'Helvetica Neue', Arial, sans-serif",
  },
  {
    id: "minimal-forest",
    label: "Minimalist",
    description: "Left-aligned, understated, lots of whitespace. Popular for tech and design roles.",
    layout: "minimal",
    accent: "#1f4d3d",
    nameFont: "'Avenir Next', 'Century Gothic', sans-serif",
  },
  {
    id: "banner-gold",
    label: "Banner",
    description: "A bold color band across the top makes your name the first thing anyone sees.",
    layout: "banner",
    accent: "#a8710a",
    nameFont: "Georgia, 'Times New Roman', serif",
  },
];
export const DEFAULT_RESUME_TEMPLATE: ResumeTemplateId = "classic";

/** A fully populated example, used only by the template gallery so a
 *  student can see real content in each layout before picking one --
 *  never shown as if it were the student's own data. */
export const SAMPLE_RESUME_DATA: ResumeData = {
  profile: {
    firstName: "Morgan",
    lastName: "Casey",
    email: "morgan.casey@email.com",
    phone: "(555) 010-2024",
    country: "United States",
    state: "California",
    city: "San Jose",
    bio: "Motivated high school junior with strong customer service experience, seeking a part-time retail role to grow leadership and communication skills.",
  },
  education: [
    { id: "sample-edu-1", schoolName: "Westfield High School", cityState: "San Jose, CA", gradYear: "June 2027", program: "AP", gpa: "3.8", honors: ["Honor Roll"] },
  ],
  experience: [
    {
      id: "sample-exp-1",
      type: "job" as const,
      where: "Bright Leaf Cafe",
      title: "Barista",
      location: "San Jose, CA",
      startDate: "June 2025",
      endDate: "",
      current: true,
      bullets: [
        "Prepared and served drinks for 100+ customers daily during morning rush",
        "Trained two new hires on register and drink procedures",
        "Maintained a 4.8-star average in customer feedback surveys",
      ],
      aiAssisted: false,
    },
  ],
  skills: { people: ["Customer Service", "Teamwork"], tech: ["Google Workspace"], languages: ["Spanish"] },
  certifications: [{ id: "sample-cert-1", name: "Food Handler Certification", issuer: "ServSafe", issueDate: "March 2025", expirationDate: "March 2028", credentialId: "", credentialUrl: "" }],
  versions: [],
};
