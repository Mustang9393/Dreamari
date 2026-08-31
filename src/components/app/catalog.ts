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
  C("Investment Banking", "Business & Money", "/images/app/poster-investment-banking-v3.png"),
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

// Recast 2026-08-31: the reel now runs on careers that have real browse-card
// photography ("BROWSE Images-2", imported as /images/app/browse-*.png;
// Registered Nurse keeps its existing Figma browse-card poster). The old
// Figma Env Card lineup (Aerospace Engineer, Marine Biologist, Neurosurgeon,
// ...) had no browse art and no sourced copy, so those careers left the reel
// rather than shipping mismatched photos. Every description, salary range,
// major and skill below is lifted from that career's own Career Report data
// (report-data.ts, BLS-sourced) -- nothing here is invented.
export const FOR_YOU_REEL: ReelCareer[] = [
  {
    title: "Investment Banking",
    world: "Business & Money",
    matchLabel: "STRONG MATCH",
    description: "Investment bankers help companies raise money and buy or sell businesses.",
    salary: "$85K - $250K+",
    // The BROWSE Images-2 IB files are 198x297 thumbnails -- too small for a
    // full-screen reel card. This poster IS the unified IB browse-card art
    // (the hi-res founder image), so the reel uses it instead.
    photo: "/images/app/poster-investment-banking-v3.png",
    major: "Finance, Economics, or Accounting",
    mainSkills: "Working with Numbers · Attention to Detail · Clear Writing · Calm Under Deadline",
  },
  {
    title: "Registered Nurse",
    world: "Health & Medicine",
    matchLabel: "STRONG MATCH",
    description: "Registered nurses keep patients safe and are the person actually at the bedside all shift.",
    salary: "$65K - $130K+",
    photo: "/images/app/poster-registered-nurse.png",
    major: "Nursing, Biology, or Public Health",
    mainSkills: "Calm Under Pressure · Noticing Small Changes · Explaining Simply · Stamina",
  },
  {
    title: "Software Engineer",
    world: "Tech & Engineering",
    matchLabel: "STRONG MATCH",
    description: "Software engineers build and improve the apps and systems people use every day.",
    salary: "$75K - $200K+",
    photo: "/images/app/browse-software-engineer.png",
    major: "Computer Science or Software Engineering",
    mainSkills: "Problem Solving · Logical Thinking · Reading Code · Explaining Simply",
  },
  {
    title: "Airline Pilot",
    world: "Driving, Flying & Shipping",
    matchLabel: "STRONG MATCH",
    description: "Airline pilots fly passengers and cargo safely from one airport to another.",
    salary: "$60K - $250K+",
    photo: "/images/app/browse-airline-pilot.png",
    major: "Aeronautical Science or Aviation Management",
    mainSkills: "Calm Under Pressure · Following Procedure · Quick Decisions · Clear Communication",
  },
  {
    title: "Private Equity",
    world: "Business & Money",
    matchLabel: "STRONG MATCH",
    description: "Private equity firms buy companies, try to make them better, and sell them later for more.",
    salary: "$100K - $300K+",
    photo: "/images/app/browse-private-equity.png",
    major: "Finance, Economics, or Business Administration",
    mainSkills: "Business Judgment · Modeling & Analysis · Asking Good Questions · Patience",
  },
  {
    title: "Food Scientist",
    world: "Farming, Animals & Nature",
    matchLabel: "STRONG MATCH",
    description: "Food scientists develop and test food products in a lab and a pilot kitchen.",
    salary: "$55K - $125K+",
    photo: "/images/app/browse-food-scientist.png",
    major: "Food Science, Chemistry, or Nutrition",
    mainSkills: "Careful Measurement · Chemistry · Patience · Writing Up Findings",
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
// has 6 cards -- three "every-other" laps -- for 5 videos, so later laps
// cycle back through the cards rather than ending on two videos in a row
// with nothing between them.
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
