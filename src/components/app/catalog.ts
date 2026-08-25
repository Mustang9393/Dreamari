// Career catalog for the app screens — titles, worlds, photos and (where the
// design shows them) salaries, transcribed straight from the Figma frames:
// Home — v2.1 (2099:3423) and Explore-Browse (3185:17011). Photos are the
// frames' own image fills, pulled from the Figma asset server into
// /public/images/app with descriptive names. No invented careers or copy.

export type CatalogCareer = {
  title: string;
  world: string;
  photo: string;
  salary?: string;
};

const C = (title: string, world: string, photo: string, salary?: string): CatalogCareer => ({ title, world, photo, salary });

// "Careers Picked for You" (Home) — 14 posters in the design's order.
export const HOME_PICKS: CatalogCareer[] = [
  C("Asset Manager", "Business & Money", "/images/app/poster-asset-manager.png"),
  C("Accountant", "Business & Money", "/images/app/poster-accountant.png"),
  C("Private Equity", "Business & Money", "/images/app/poster-private-equity.png"),
  C("Investment Banking", "Business & Money", "/images/app/poster-investment-banking-v2.png"),
  C("Data Scientist", "Tech & Engineering", "/images/app/poster-data-scientist.png"),
  C("Software Engineer", "Tech & Engineering", "/images/app/poster-software-engineer.png"),
  C("UI/UX Designer", "Tech & Engineering", "/images/app/poster-uiux-designer.png"),
  C("Video Game Designer", "Tech & Engineering", "/images/app/poster-video-game-designer.png"),
  C("Cyber Security", "Tech & Engineering", "/images/app/poster-cyber-security.png"),
  C("Food Scientist", "Farming, Animals & Nature", "/images/app/poster-food-scientist.png"),
  C("Farm & Ranch Manager", "Farming, Animals & Nature", "/images/app/poster-farm-ranch-manager.png"),
  C("Agricultural Technician", "Farming, Animals & Nature", "/images/app/poster-agricultural-technician.png"),
  C("Electrician", "Building & Construction", "/images/app/poster-electrician.png"),
  C("Roofer", "Building & Construction", "/images/app/poster-roofer.png"),
  C("Truck Driver", "Driving, Flying & Shipping", "/images/app/poster-truck-driver.png"),
  C("Registered Nurse", "Health & Medicine", "/images/app/poster-registered-nurse.png"),
  C("School Counselor", "Counseling & Social Work", "/images/app/poster-school-counselor.png"),
  C("Air Traffic Controller", "Driving, Flying & Shipping", "/images/app/poster-air-traffic-controller.png"),
  C("Sports Medicine Doctor", "Health & Medicine", "/images/app/poster-sports-medicine-doctor.png"),
  C("Animator", "Arts, Media & Sport", "/images/app/poster-animator.png"),
  C("HR Manager", "Business & Money", "/images/app/poster-hr-manager.png"),
  C("Game Designer", "Tech & Engineering", "/images/app/poster-game-designer.png"),
];

// Explore-Browse rails — content, titles, and order per Joshua (2026-08-21).
// Rail 1 (merged Recommended + Because-You-Liked; content + order per
// Joshua 2026-08-21): "Recommended Because You Liked Business & Money".
export const BROWSE_BECAUSE_LIKED: CatalogCareer[] = [
  C("Asset Manager", "Business & Money", "/images/app/poster-asset-manager.png"),
  C("Private Equity", "Business & Money", "/images/app/poster-private-equity-v2.png"),
  C("Quant", "Business & Money", "/images/app/poster-quant.png"),
  C("Accountant", "Business & Money", "/images/app/poster-accountant.png"),
  C("Management Analyst", "Business & Money", "/images/app/poster-management-analyst.png"),
  C("Administrative Assistant", "Business & Money", "/images/app/poster-administrative-assistant.png"),
];

// "Top 5 Trending Careers Among Gen Z" (runs to 6). Congruence fix: the
// frame bound Doctor to the food-scientist photo and Nurse to a gardening
// photo — replaced with Mika's Emergency Medicine Doctor / Nurse
// Anesthetist so every image shows its own career.
export const BROWSE_TRENDING: CatalogCareer[] = [
  C("Software Engineer", "Tech & Engineering", "/images/app/poster-software-engineer.png"),
  C("Emergency Medicine Doctor", "Health & Medicine", "/images/app/poster-emergency-medicine-doctor.png"),
  C("Nurse Anesthetist", "Health & Medicine", "/images/app/poster-nurse-anesthetist.png"),
  C("Lawyer", "Law, Safety & Justice", "/images/app/poster-lawyer.png"),
  C("Airline Pilot", "Driving, Flying & Shipping", "/images/app/poster-airline-pilot.png"),
  C("Therapist", "Counseling & Social Work", "/images/app/poster-therapist.png"),
];

// Rail headed "Tech & Engineering" — tech/engineering careers only (the
// frame's farming+building fill was a design-file quirk, corrected per user).
export const BROWSE_WORLD_RAIL: CatalogCareer[] = [
  C("Cyber Security", "Tech & Engineering", "/images/app/poster-cyber-security.png"),
  C("Game Designer", "Tech & Engineering", "/images/app/poster-game-designer.png"),
  C("UI/UX Designer", "Tech & Engineering", "/images/app/poster-uiux-designer.png"),
  C("Database Architect", "Tech & Engineering", "/images/app/poster-database-architect.png"),
  C("Software Engineer", "Tech & Engineering", "/images/app/poster-software-engineer.png"),
  C("Data Scientist", "Tech & Engineering", "/images/app/poster-data-scientist.png"),
];

// Careers You Might Not Know — content + order per Joshua 2026-08-21.
// (His earlier 8-career list still lacks images for Flavor Chemist, Beauty
// Product Developer, Ethical Hacker, Animal Nutrition Scientist, Game QA
// Tester, Shopper Insights Analyst, Genetic Counselor.)
export const BROWSE_MIGHT_NOT_KNOW: CatalogCareer[] = [
  C("Food Scientist", "Farming, Animals & Nature", "/images/app/poster-food-scientist.png"),
  C("Sound Engineering Technician", "Arts, Media & Sport", "/images/app/poster-sound-engineering-technician.png"),
  C("Sports Medicine Doctor", "Health & Medicine", "/images/app/poster-sports-medicine-doctor.png"),
  C("Agricultural Technician", "Farming, Animals & Nature", "/images/app/poster-agricultural-technician.png"),
  C("Drone Pilot", "Driving, Flying & Shipping", "/images/app/poster-drone-pilot.png"),
  C("Jewelry Designer", "Factories & Making Things", "/images/app/poster-jewelry-designer.png"),
];

export const BROWSE_TYPICAL_PAY: CatalogCareer[] = [
  C("Pediatric Surgeon", "Health & Medicine", "/images/app/poster-pediatric-surgeon.png", "$559K"),
  C("Airline Pilot", "Driving, Flying & Shipping", "/images/app/poster-airline-pilot-alt.png", "$232K"),
  C("Purchasing Manager", "Business & Money", "/images/app/poster-purchasing-manager.png", "$148K"),
  C("Cardiologist", "Health & Medicine", "/images/app/poster-cardiologist.png", "$496K"),
  C("Public Relations Manager", "Business & Money", "/images/app/poster-public-relations-manager.png", "$146K"),
  C("Veterinarian", "Farming, Animals & Nature", "/images/app/poster-veterinarian.png", "$130K"),
];

// Every catalogued career, deduped by title, for lookups that need to search
// across rails instead of rendering one specific rail (Career Detail's
// "Similar careers" and its own title/world/photo resolution).
export const ALL_CATALOG_CAREERS: CatalogCareer[] = (() => {
  const seen = new Map<string, CatalogCareer>();
  for (const career of [...HOME_PICKS, ...BROWSE_BECAUSE_LIKED, ...BROWSE_TRENDING, ...BROWSE_WORLD_RAIL, ...BROWSE_MIGHT_NOT_KNOW, ...BROWSE_TYPICAL_PAY]) {
    if (!seen.has(career.title)) seen.set(career.title, career);
  }
  return [...seen.values()];
})();

// Explore — For You reel: all 8 Env Card variants (section 2530:46431,
// "Explore: Mobile Reel"), copy and photos verbatim from each variant.
// (The card UI doesn't render the world; it's kept for data completeness.)
export type ReelCareer = {
  title: string;
  world: string;
  matchLabel: string;
  description: string;
  salary: string;
  photo: string;
  // Details face of the Career Details Panel (2486:43002). Private Equity
  // carries the component's own default values; the other majors/skills are
  // prototype copy until real content lands.
  major: string;
  mainSkills: string;
};

export const FOR_YOU_REEL: ReelCareer[] = [
  {
    title: "Private Equity Analyst",
    world: "Business & Money",
    matchLabel: "STRONG MATCH",
    description: "Helps investors buy, improve, and sell companies for long-term returns.",
    salary: "$95K - $250K+",
    photo: "/images/app/env-private-equity.png",
    major: "Finance or Economics",
    mainSkills: "Analysis · Valuation · Modeling · Research · Communication",
  },
  {
    title: "Aerospace Engineer",
    world: "Tech & Engineering",
    matchLabel: "STRONG MATCH",
    description: "Designs aircraft and spacecraft that fly safely through demanding conditions.",
    salary: "$85K - $190K+",
    photo: "/images/app/env-aerospace-engineer.png",
    major: "Aerospace or Mechanical Engineering",
    mainSkills: "Aerodynamics · CAD · Simulation · Systems Thinking · Math",
  },
  {
    title: "Product Designer",
    world: "Tech & Engineering",
    matchLabel: "STRONG MATCH",
    description: "Shapes useful digital products around people's needs.",
    salary: "$75K - $180K+",
    photo: "/images/app/env-product-designer.png",
    major: "Design, HCI, or Psychology",
    mainSkills: "UX Research · Prototyping · Visual Design · Figma · Storytelling",
  },
  {
    title: "Biomedical Researcher",
    world: "Science & Research",
    matchLabel: "STRONG MATCH",
    description: "Studies disease to develop better tests and treatments.",
    salary: "$70K - $160K+",
    photo: "/images/app/env-biomedical-researcher.png",
    major: "Biology or Biomedical Sciences",
    mainSkills: "Lab Methods · Data Analysis · Scientific Writing · Rigor",
  },
  {
    title: "Marine Biologist",
    world: "Science & Research",
    matchLabel: "STRONG MATCH",
    description: "Studies ocean life and protects marine ecosystems.",
    salary: "$55K - $120K+",
    photo: "/images/app/env-marine-biologist.png",
    major: "Marine Biology or Ecology",
    mainSkills: "Field Research · Diving · Data Collection · Conservation",
  },
  {
    title: "Neurosurgeon",
    world: "Health & Medicine",
    matchLabel: "STRONG MATCH",
    description: "Diagnoses and operates on the brain and nervous system.",
    salary: "$350K - $800K+",
    photo: "/images/app/env-neurosurgeon.png",
    major: "Pre-Med, then Medical School",
    mainSkills: "Anatomy · Precision · Decision-Making · Stamina · Focus",
  },
  {
    title: "Constitutional Attorney",
    world: "Law, Safety & Justice",
    matchLabel: "STRONG MATCH",
    description: "Handles cases about rights, laws, and government power.",
    salary: "$90K - $250K+",
    photo: "/images/app/env-constitutional-attorney.png",
    major: "Political Science, then Law School",
    mainSkills: "Legal Writing · Argumentation · Research · Public Speaking",
  },
  {
    title: "Creative Director",
    world: "Arts, Media & Sport",
    matchLabel: "STRONG MATCH",
    description: "Leads the visual direction of brands and campaigns.",
    salary: "$95K - $220K+",
    photo: "/images/app/env-creative-director.png",
    major: "Design, Advertising, or Fine Arts",
    mainSkills: "Art Direction · Branding · Leadership · Concepting · Taste",
  },
];

// Real office-tour/day-in-the-life clips, seeded into the reel at every
// third card (Pic, Pic, Video) so real footage breaks up the illustrated
// Env Cards rather than being buried in its own separate tab. Discriminated
// from ReelCareer by the presence of `video` -- these clips have no salary,
// major, or "Play Game" affordance, so they get their own, much simpler
// card (see VideoCard in ExploreExperience.tsx) instead of reusing EnvCard.
export type VideoReel = {
  title: string;
  video: string;
};

export type ReelItem = ReelCareer | VideoReel;

export function isVideoReel(item: ReelItem): item is VideoReel {
  return "video" in item;
}

const FOR_YOU_VIDEOS: VideoReel[] = [
  { title: "Kellanova · Talent Director", video: "/videos/app/reel-kellanova-talent-director.mp4" },
  { title: "JPMorgan Chase, London — Office Tour", video: "/videos/app/reel-jpmc-london-office-tour-odein.mp4" },
  { title: "Kellogg's — Office Tour", video: "/videos/app/reel-kelloggs-office-tour.mp4" },
  { title: "A Day at JPMorgan Chase, Ohio", video: "/videos/app/reel-povywa-jpmc-ohio.mp4" },
  { title: "AT&T — Office Tour", video: "/videos/app/reel-att-office-tour.mp4" },
];

// Pic, Pic, Video, repeating, until the videos run out. FOR_YOU_REEL only
// has 8 cards -- four "every-other" slots -- for 5 videos, so the last lap
// cycles back to the first two cards rather than ending on two videos in a
// row with nothing between them.
export const FOR_YOU_FEED: ReelItem[] = (() => {
  const items: ReelItem[] = [];
  let videoIndex = 0;
  let cycle = 0;
  while (videoIndex < FOR_YOU_VIDEOS.length) {
    items.push(FOR_YOU_REEL[(cycle * 2) % FOR_YOU_REEL.length]);
    items.push(FOR_YOU_REEL[(cycle * 2 + 1) % FOR_YOU_REEL.length]);
    items.push(FOR_YOU_VIDEOS[videoIndex]);
    videoIndex += 1;
    cycle += 1;
  }
  // Any remaining cards that never got a turn keep the reel from ending
  // abruptly right after the last video.
  for (let i = cycle * 2; i < FOR_YOU_REEL.length; i += 1) {
    items.push(FOR_YOU_REEL[i]);
  }
  return items;
})();
