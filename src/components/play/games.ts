import { IB_LEVEL_1 } from "./ib-level-1";
import { IB_LEVEL_2 } from "./ib-level-2";
import { IB_LEVEL_3 } from "./ib-level-3";
import { RN_LEVEL_1 } from "./rn-level-1";
import type { Simulation } from "./types";

// The games catalogue. `careerId` is the shared catalogue id, so a game lines
// up with the same career's report, pathway and plan -- the hub can put the
// student's own Top 3 first without a second mapping table.

export const INVESTMENT_BANKING: Simulation = {
  id: "investment-banking",
  careerId: "investment-banking",
  title: "Investment Banker",
  world: "Business & Money",
  firm: "Cobalt Capital",
  cover: "/images/play/ib/l1-04.webp",
  // The trailer (Trailer tab): plays once before Level 1, skippable, ~20
  // seconds, no choices, no score. REUSE ONLY -- six of seven cards use art
  // that already exists; only the finale's ladder is new. The seven-beat
  // shape (scale, odds, cost, room, consequence, the person at the top,
  // the ladder) travels to every career.
  trailer: [
    { id: "TR-01", seconds: 4, text: "Every summer, thousands of students want this job." },
    { id: "TR-02", seconds: 4.5, text: "Cobalt Capital takes six interns. Two get to stay.", art: "/images/play/ib/locations/reception.webp" },
    { id: "TR-03", seconds: 4, text: "The nights are long.", art: "/images/play/ib/locations/trading-floor-night.webp" },
    { id: "TR-04", seconds: 4, text: "The rooms are serious.", art: "/images/play/ib/l3-17.webp" },
    { id: "TR-05", seconds: 4, text: "One wrong number reaches the client.", art: "/images/play/ib/l2-23.webp" },
    // Lamisa is SEEN before she is met (Trailer tab) -- her sprite rises
    // into frame dark-graded, a silhouette until Level 3 introduces her.
    { id: "TR-06", seconds: 4.5, text: "And one person at the top decides who rises.", art: "/images/play/ib/locations/elevator-hallway-sunset.webp", sprite: "/images/play/ib/expressions/lamisa-composed.webp" },
    { id: "TR-07", seconds: 4, text: "Six levels. Intern to Managing Director. How far will you get?", finale: true },
  ],
  levels: [IB_LEVEL_1, IB_LEVEL_2, IB_LEVEL_3],
  // The ladder from the handoff: six levels. The sheet documents three, and all
  // three are built. The top three are not documented anywhere.
  upcoming: ["Vice President", "Executive Director", "Managing Director"],
};

export const REGISTERED_NURSE: Simulation = {
  id: "registered-nurse",
  careerId: "registered-nurse",
  title: "Registered Nurse",
  world: "Health & Medicine",
  firm: "Riverbend Medical Center",
  cover: "/images/play/rn/locations/station-hero.webp",
  // The trailer (Trailer tab): same seven-beat shape as every career --
  // the scale, the odds, the cost, the room, the consequence, the person
  // at the top, the ladder. Reuse only. The two statistic cards ship
  // WITHOUT their numbers, per the sheet's own rule: no numbers we cannot
  // source (D04).
  trailer: [
    { id: "RN-TR-01", seconds: 4, text: "More people work as nurses than any other job in health care.", art: "/images/play/rn/locations/lobby.jpg" },
    { id: "RN-TR-02", seconds: 4.5, text: "Nursing schools turn away tens of thousands of people who qualify. Every year." },
    { id: "RN-TR-03", seconds: 4, text: "Nights. Weekends. Holidays. Twelve hours on your feet.", art: "/images/play/rn/locations/staff-room.jpg" },
    { id: "RN-TR-04", seconds: 4, text: "Thirty beds. One of them needs you first.", art: "/images/play/rn/locations/corridor.jpg" },
    { id: "RN-TR-05", seconds: 4.5, text: "The thing you notice, or do not notice, decides what happens next.", art: "/images/play/rn/locations/ward-night.jpg" },
    // Yvonne is SEEN here and introduced properly at Level 3.
    { id: "RN-TR-06", seconds: 4.5, text: "Somewhere above you is the nurse who answers for every floor in this hospital.", art: "/images/play/rn/locations/lobby.jpg", sprite: "/images/play/rn/expressions/yvonne-composed.webp" },
    { id: "RN-TR-07", seconds: 4, text: "Six levels. New nurse to the top of the hospital. How far will you get?", finale: true },
  ],
  levels: [RN_LEVEL_1],
  // The real six-rung ladder (Career Ladder tab): nursing genuinely has six.
  upcoming: ["Staff Nurse", "Charge Nurse", "Nurse Manager", "Director of Nursing", "Chief Nursing Officer"],
};

export const SIMULATIONS: Simulation[] = [INVESTMENT_BANKING, REGISTERED_NURSE];

/** Careers whose simulation is not built yet. Poster art only, no promises
 *  about when. Cover art here is its OWN `soon-*.png` file per career, not
 *  the shared `poster-*.png` used by Explore's Browse cards / Profile /
 *  Match Lab / the marketing chapters -- those illustrated covers are for
 *  this Play tab placeholder ONLY, per direct correction after an earlier
 *  pass overwrote the shared files and put them on Explore's Browse cards
 *  too. */
export const SOON: { careerId: string; title: string; world: string; cover: string }[] = [
  { careerId: "airline-pilot", title: "Airline Pilot", world: "Driving, Flying & Shipping", cover: "/images/app/soon-airline-pilot.png" },
  { careerId: "software-engineer", title: "Software Engineer", world: "Tech & Engineering", cover: "/images/app/soon-software-engineer.png" },
  { careerId: "private-equity", title: "Private Equity", world: "Business & Money", cover: "/images/app/soon-private-equity.png" },
  { careerId: "food-scientist", title: "Food Scientist", world: "Farming, Animals & Nature", cover: "/images/app/soon-food-scientist.png" },
  // These three ride in the new Netflix-style featured row (see
  // FEATURED_ROW_SOON_IDS in PlayHub.tsx) alongside the real Investment
  // Banking simulation, rather than only appearing in the "In the works"
  // grid -- PlayHub filters them out of that grid so they don't show twice.
  { careerId: "accountant", title: "Accountant", world: "Business & Money", cover: "/images/app/soon-accountant.png" },
  { careerId: "aviation-maintenance-technician", title: "Aviation Maintenance Technician", world: "Fixing Machines & Engines", cover: "/images/app/soon-aviation-maintenance-technician.png" },
  { careerId: "emergency-medicine-doctor", title: "Emergency Medicine Doctor", world: "Health & Medicine", cover: "/images/app/soon-emergency-medicine-doctor.png" },
];

/** The three "coming soon" careers that appear in the top featured row
 *  (PlayHub's FeaturedRow) rather than only in the generic "In the works"
 *  grid below. */
export const FEATURED_ROW_SOON_IDS = ["accountant", "aviation-maintenance-technician", "emergency-medicine-doctor"];

export function simulationFor(id: string): Simulation | undefined {
  return SIMULATIONS.find((simulation) => simulation.id === id || simulation.careerId === id);
}

/** The two other game types the hub promises alongside career simulations.
 *  Glossary Games now has one real page (/play/glossary/[career]) -- Finance
 *  Essentials is playable, per `hasGlossary` in glossary/data.ts; any other
 *  entry added here without content yet still gets the "Soon" tile
 *  treatment (see PlayHub.tsx). Kept as its own array rather than folded
 *  into SOON: it isn't a career simulation, so it doesn't belong in the
 *  "these careers don't have a simulation yet" list, and the hub gives it
 *  its own labeled section. */
export const GLOSSARY_GAMES: { careerSlug: string; title: string; sub: string; cover?: string }[] = [
  { careerSlug: "investment-banking", title: "Finance Essentials", sub: "Learn key finance terms", cover: "/images/app/glossary-finance-thumb.png" },
  // No content authored yet (hasGlossary() gates these into the locked "Soon"
  // row) -- listed anyway so that row isn't just one lonely card next to
  // empty space. Reuses each career's own existing Play-tab "Soon" cover art
  // rather than a new asset per glossary game.
  { careerSlug: "registered-nurse", title: "Medical Terms", sub: "Learn key nursing terms", cover: "/images/app/soon-registered-nurse.png" },
  { careerSlug: "private-equity", title: "PE Essentials", sub: "Learn key deal terms", cover: "/images/app/soon-private-equity.png" },
  { careerSlug: "software-engineer", title: "Tech Terms", sub: "Learn key engineering terms", cover: "/images/app/soon-software-engineer.png" },
];
