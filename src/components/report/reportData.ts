export const REPORT_NAV = [
  ["overview", "Overview"],
  ["profile", "Your profile"],
  ["career-path", "Career path"],
  ["plan", "Your plan"],
  ["education", "Education"],
] as const;

export const DIRECTION_SUMMARY = [
  ["Career Focus", "Exploring careers"],
  ["Selected Pathway", "Community College"],
  ["Current Plan Progress", "0 of 21 tasks complete"],
  ["Next Recommended Step", "Find transfer agreement colleges"],
] as const;

export const PROFILE = [
  ["Academic Standing", "3.5 - 3.7 GPA"],
  ["Career Interest", "Computer Science"],
  ["Current Level", "11th Grade"],
  ["Preference", "West Coast"],
] as const;

export const CLASSES = [
  "Advanced mathematics and statistics",
  "Computer science and programming",
  "Communication and writing skills",
  "Ethics and critical thinking",
  "Research methods and analysis",
] as const;

export const CAREER_STAGES = [
  {
    label: "Starting",
    years: "Years 1–3",
    roles: [
      ["Security Analyst", "Monitor security systems and respond to threats", "$65,000–$80,000"],
      ["Software Developer", "Build applications and secure coding practices", "$70,000–$85,000"],
    ],
  },
  {
    label: "Mid-Level",
    years: "Years 4–7",
    roles: [
      ["Security Engineer", "Design and implement security systems", "$90,000–$120,000"],
      ["System Administrator", "Manage IT infrastructure and security protocols", "$75,000–$95,000"],
    ],
  },
  {
    label: "Senior",
    years: "Years 8+",
    roles: [
      ["Security Architect", "Lead security strategy for organizations", "$130,000–$180,000"],
      ["Chief Technology Officer", "Executive technology and security leadership", "$180,000–$300,000"],
    ],
  },
] as const;

export const SCHOOLS = [
  {
    name: "Stanford University",
    detail: [
      ["Program", "Computer Science with Security Track"],
      ["Requirements", "3.8+ GPA, high SAT scores"],
      ["Why it's great", "Research labs, Silicon Valley connections"],
    ],
  },
  {
    name: "UC Berkeley",
    detail: [
      ["Program", "Computer Science with Cybersecurity Focus"],
      ["Requirements", "3.7+ GPA, strong math background"],
      ["Why it's great", "Top CS school, excellent job placement"],
    ],
  },
] as const;

export const CERTIFICATIONS = [
  {
    label: "While in College",
    items: [
      ["CompTIA Security+", "Core security knowledge — industry standard"],
      ["CompTIA Network+", "How networks work and how to secure them"],
      ["Certified Ethical Hacker (CEH)", "Learn to test and assess security systems"],
    ],
  },
  {
    label: "After Gaining Experience",
    items: [
      ["CISSP", "Advanced security management and strategy"],
      ["CISM", "Security leadership and governance skills"],
      ["GSEC", "Advanced practical security concepts"],
    ],
  },
] as const;

export const CONCLUSION =
  "Your 3.5 - 3.7 GPA and strong creativity & innovation and hands-on problem solving and analytical thinking and leadership skills skills make you an excellent candidate for Computer Science. you have multiple strong pathways to explore. The field is growing rapidly with excellent salary potential and aligns perfectly with your personality strengths. You're on the right path to a successful and fulfilling career.";
