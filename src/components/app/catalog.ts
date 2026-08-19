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
  C("Asset Management", "Business & Money", "/images/app/poster-asset-management.png"),
  C("Accountant", "Business & Money", "/images/app/poster-accountant.png"),
  C("Private Equity", "Business & Money", "/images/app/poster-private-equity.png"),
  C("Investment Banking", "Business & Money", "/images/app/poster-investment-banking.png"),
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
];

// Explore-Browse rails, in the design's section order.
export const BROWSE_RECOMMENDED: CatalogCareer[] = [
  C("Asset Management", "Business & Money", "/images/app/poster-asset-management.png"),
  C("Accountant", "Business & Money", "/images/app/poster-accountant.png"),
  C("Private Equity", "Business & Money", "/images/app/poster-private-equity.png"),
  C("Investment Banking", "Business & Money", "/images/app/poster-investment-banking-v2.png"),
  C("Data Scientist", "Tech & Engineering", "/images/app/poster-data-scientist.png"),
  C("Software Engineer", "Tech & Engineering", "/images/app/poster-software-engineer.png"),
];

export const BROWSE_BECAUSE_LIKED: CatalogCareer[] = [
  C("UI/UX Designer", "Tech & Engineering", "/images/app/poster-uiux-designer.png"),
  C("Video Game Designer", "Tech & Engineering", "/images/app/poster-video-game-designer.png"),
  C("Cyber Security", "Tech & Engineering", "/images/app/poster-cyber-security.png"),
  C("Robotics Engineer", "Tech & Engineering", "/images/app/poster-robotics-engineer.png"),
  C("Film Director", "Arts, Media & Sport", "/images/app/poster-film-director.png"),
  C("Journalist", "Arts, Media & Sport", "/images/app/poster-journalist.png"),
];

// "Top 5 Trending Careers Among Gen Z" — the design's ranked rail runs to 7.
// Image bindings are the frame's own (rank 3 NURSE carries the ranch photo in
// the design; ported as-is).
export const BROWSE_TRENDING: CatalogCareer[] = [
  C("Doctor", "Health & Medicine", "/images/app/poster-food-scientist.png"),
  C("Software Engineer", "Tech & Engineering", "/images/app/poster-software-engineer.png"),
  C("Nurse", "Health & Medicine", "/images/app/poster-nurse.png"),
  C("Lawyer", "Law, Safety & Justice", "/images/app/poster-lawyer.png"),
  C("Airline Pilot", "Driving, Flying & Shipping", "/images/app/poster-airline-pilot.png"),
  C("Entrepreneur", "Business & Money", "/images/app/poster-entrepreneur.png"),
  C("Therapist", "Counseling & Social Work", "/images/app/poster-therapist.png"),
];

// Rail headed "Tech & Engineering" in the design (its cards are the farming +
// building set — the header text is the frame's own; ported verbatim).
export const BROWSE_WORLD_RAIL: CatalogCareer[] = [
  C("Food Scientist", "Farming, Animals & Nature", "/images/app/poster-food-scientist.png"),
  C("Farm & Ranch Manager", "Farming, Animals & Nature", "/images/app/poster-farm-ranch-manager.png"),
  C("Agricultural Technician", "Farming, Animals & Nature", "/images/app/poster-agricultural-technician.png"),
  C("Electrician", "Building & Construction", "/images/app/poster-electrician.png"),
  C("Roofer", "Building & Construction", "/images/app/poster-roofer.png"),
  C("Carpenter", "Building & Construction", "/images/app/poster-carpenter.png"),
];

export const BROWSE_MIGHT_NOT_KNOW: CatalogCareer[] = [
  C("Elementary Teacher", "Teaching & Education", "/images/app/poster-elementary-teacher.png"),
  C("Lawyer", "Law, Safety & Justice", "/images/app/poster-lawyer.png"),
  C("Therapist", "Counseling & Social Work", "/images/app/poster-therapist.png"),
  C("Airline Pilot", "Driving, Flying & Shipping", "/images/app/poster-airline-pilot-alt.png"),
  C("Farmer", "Farming, Animals & Nature", "/images/app/poster-farmer.png"),
  C("Marine Biologist", "Science & Research", "/images/app/poster-marine-biologist.png"),
];

export const BROWSE_TYPICAL_PAY: CatalogCareer[] = [
  C("Elementary Teacher", "Teaching & Education", "/images/app/poster-elementary-teacher.png", "$102K"),
  C("Lawyer", "Law, Safety & Justice", "/images/app/poster-lawyer.png", "$145K"),
  C("Therapist", "Counseling & Social Work", "/images/app/poster-therapist.png", "$115K"),
  C("Airline Pilot", "Driving, Flying & Shipping", "/images/app/poster-airline-pilot-alt.png", "$178K"),
  C("Farmer", "Farming, Animals & Nature", "/images/app/poster-farmer.png", "$108K"),
  C("Marine Biologist", "Science & Research", "/images/app/poster-marine-biologist.png", "$112K"),
];

// Explore — For You reel (Env Card family). The design's reel holds 8 careers;
// cards enter here as their env photos + copy are pulled from Figma. Private
// Equity Analyst is complete (from Explore — v2.1B, 2288:16179).
export type ReelCareer = {
  title: string;
  world: string;
  matchLabel: string;
  description: string;
  salary: string;
  photo: string;
};

export const FOR_YOU_REEL: ReelCareer[] = [
  {
    title: "Private Equity Analyst",
    world: "Business & Money",
    matchLabel: "STRONG MATCH",
    description: "Helps investors buy, improve, and sell companies for long-term returns.",
    salary: "$95K - $250K+",
    photo: "/images/app/env-private-equity.png",
  },
];
