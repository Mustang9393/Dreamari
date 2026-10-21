import { FOOD_SCIENTIST_LEVEL_1 } from "./food-scientist-level-1";
import { UX_LEVEL_1 } from "./ux-level-1";
import { IB_LEVEL_1 } from "./ib-level-1";
import { IB_LEVEL_1_V2 } from "./ib-level-1-v2";
import { IB_LEVEL_2 } from "./ib-level-2";
import { IB_LEVEL_3 } from "./ib-level-3";
import { RN_LEVEL_1_REBUILD } from "./rn-level-1-rebuild";
import { AMT_LEVEL_1 } from "./amt-level-1";
import type { Level, Simulation } from "./types";

// Level 1 of both careers IS the v2 build since 5 Oct 2026 (Chandu: "lets
// fold these in to v1... we can fold v2 into v1s and remove the separate v2
// links"): the revised scripts, How to Play, the mini lessons and the
// cinematic presentation. The ids stay the v1 ones (so Express keeps its
// "-express" id and save slot); the save slots stay the v2 ones (201/202),
// so a v2 run carries over and an old v1 save -- whose screen index means
// nothing in the new sequence -- is never resumed into it.
//
// EXPRESS KEEPS ITS CURATED SEQUENCE, unchanged: "the express mode is a
// shortened version that was intentionally curated... the sequence it has
// now should not change." Express never derives from these beats -- it
// plays `expressSource`, a fixed level object: IB's own frozen legacy
// level (as before), and for nursing the v1 level itself, whose beats and
// expressCut list are exactly what Express played until today. The route
// layers the new look onto Express as presentation flags only.
const IB_L1: Level = { ...IB_LEVEL_1_V2, id: IB_LEVEL_1.id, expressCut: IB_LEVEL_1.expressCut, expressSource: IB_LEVEL_1.expressSource };
const RN_L1: Level = RN_LEVEL_1_REBUILD;

// The games catalogue. `careerId` is the shared catalogue id, so a game lines
// up with the same career's report, pathway and plan -- the hub can put the
// student's own Top 3 first without a second mapping table.

export const INVESTMENT_BANKING: Simulation = {
  id: "investment-banking",
  careerId: "investment-banking",
  title: "Investment Banker",
  world: "Business & Finance",
  firm: "Cobalt Capital",
  cover: "/images/play/ib/l1-04.webp",
  // Tiles (19 Oct 2026, Chandu: "update the thumbnails to the career
  // simulations for which we have new graphics", "make sure there are
  // characters and the compositions work in both 4:5 and 16:9"). Each thumb
  // is a v2 scene with the lead character in it; the focus was checked at
  // 5:7, 4:5, 1:1, 16:9 and 2.6:1 crops.
  thumb: "/images/play/ib/v2/christina-thumbsup-glassdoor-sunset.webp",
  thumbFocus: "30% 18%",
  // The trailer (Trailer tab): plays once before Level 1, skippable, ~20
  // seconds, no choices, no score. REUSE ONLY -- six of seven cards use art
  // that already exists; only the finale's ladder is new. The seven-beat
  // shape (scale, odds, cost, room, consequence, the person at the top,
  // the ladder) travels to every career.
  trailer: [
    { id: "TR-01", seconds: 4, text: "Every summer, thousands of students want this job." },
    { id: "TR-02", seconds: 4.5, text: "Cobalt Capital takes seven interns. Two get to stay.", art: "/images/play/ib/locations/reception.webp" },
    { id: "TR-03", seconds: 4, text: "The nights are long.", art: "/images/play/ib/locations/trading-floor-night.webp" },
    { id: "TR-04", seconds: 4, text: "The rooms are serious.", art: "/images/play/ib/l3-17.webp" },
    { id: "TR-05", seconds: 4, text: "One wrong number reaches the client.", art: "/images/play/ib/l2-23.webp", drain: true },
    // Lamisa is SEEN before she is met (Trailer tab) -- her sprite rises
    // into frame dark-graded, a silhouette until Level 3 introduces her.
    { id: "TR-06", seconds: 4.5, text: "And one person at the top decides who rises.", art: "/images/play/ib/locations/elevator-hallway-sunset.webp", sprite: "/images/play/ib/expressions/lamisa-composed.webp" },
    { id: "TR-07", seconds: 4, text: "Six levels. Intern to Managing Director. How far will you get?", finale: true },
  ],
  levels: [IB_L1, IB_LEVEL_2, IB_LEVEL_3],
  // The ladder from the handoff: six levels. The sheet documents three, and all
  // three are built. The top three are not documented anywhere.
  upcoming: ["Vice President", "Executive Director", "Managing Director"],
};

export const REGISTERED_NURSE: Simulation = {
 id: "registered-nurse", careerId: "registered-nurse", title: "Registered Nurse",
 world: "Health & Medicine", firm: "Riverbend Medical Center",
 cover: RN_L1.cover!, thumb: RN_L1.cover!, thumbFocus: "50% 30%",
 trailer: [
  {id:"RN-TR-01",seconds:4,text:"Your first shift. A team counting on you.",art:RN_L1.cover!},
  {id:"RN-TR-02",seconds:4,text:"Listen. Check. Speak up.",art:"/images/play/rn/rebuild-2026-10-21/RN1-07.png"},
  {id:"RN-TR-03",seconds:4,text:"Make the next decision.",art:"/images/play/rn/rebuild-2026-10-21/RN1-21.png",finale:true}
 ], levels:[RN_L1], upcoming:["Staff Nurse","Charge Nurse","Nurse Manager","Director of Nursing","Chief Nursing Officer"]
};

export const AVIATION_MAINTENANCE: Simulation = {
  id: "aviation-maintenance-technician",
  careerId: "aviation-maintenance-technician",
  title: "Aviation Maintenance Technician",
  world: "Fixing Machines & Engines",
  firm: "Kestrel Aero Maintenance",
  cover: "/images/play/amt/locations/kestrel-hangar-floor.webp",
  thumb: "/images/play/amt/amt-fluid-leak.webp",
  thumbFocus: "29% 12%",
  levels: [AMT_LEVEL_1],
  upcoming: ["Technician", "Lead Technician", "Inspector", "Maintenance Manager"],
};

// AI-authored local draft used to test the scaling SOP.
export const UX_DESIGNER: Simulation = {
  "id": "ui-ux-designer",
  "careerId": "ui-ux-designer",
  "title": "UX Designer",
  "world": "Tech & Engineering",
  "firm": "Northline Studio",
  "cover": UX_LEVEL_1.cover!,
  // Tile (20 Oct 2026, Chandu: "add the ux designer game to the play tab
  // under career simulations, use a good art from the game as the
  // thumbnail"). Arjun sketching wireframe flows says "UX" at a glance, and
  // its sunset studio light sits with the IB tile beside it.
  "thumb": "/images/play/ux/v7/work.png",
  "thumbFocus": "48% 20%",
  "levels": [UX_LEVEL_1],
  "upcoming": [
    "UX Designer",
    "Senior UX Designer",
    "Lead UX Designer",
    "Design Manager",
    "Design Director"
  ],
  "trailer": [
    {
      "id": "UX-TR-1",
      "seconds": 4,
      "text": "A useful design starts with someone trying to do something.",
      "art": "/images/play/ux/v7/arrival.png"
    },
    {
      "id": "UX-TR-2",
      "seconds": 4,
      "text": "An attractive page can still get in their way.",
      "art": "/images/play/ux/v7/test.png"
    },
    {
      "id": "UX-TR-3",
      "seconds": 4,
      "text": "Listen before you choose a solution.",
      "art": "/images/play/ux/v7/test.png"
    },
    {
      "id": "UX-TR-4",
      "seconds": 4,
      "text": "Turn the evidence into something people can try.",
      "art": "/images/play/ux/v7/arrival.png"
    },
    {
      "id": "UX-TR-5",
      "seconds": 4,
      "text": "One missed detail can stop the whole task.",
      "art": "/images/play/ux/v7/review.png"
    },
    {
      "id": "UX-TR-6",
      "seconds": 4,
      "text": "Your team needs to know what you found.",
      "art": "/images/play/ux/v7/review.png"
    },
    {
      "id": "UX-TR-7",
      "seconds": 4,
      "text": "A client deadline. A team counting on you. Your first design role.",
      "finale": true
    }
  ]
};

export const FOOD_SCIENTIST: Simulation = {
  id: "food-scientist", careerId: "food-scientist", title: "Food Scientist",
  world: "Farming, Animals & Nature", firm: "Sprout Lab",
  cover: FOOD_SCIENTIST_LEVEL_1.cover!, thumb: FOOD_SCIENTIST_LEVEL_1.cover!, thumbFocus: "48% 25%",
  levels: [FOOD_SCIENTIST_LEVEL_1],
  upcoming: ["Planned: repeatability study", "Planned: process scale-up", "Planned: product review"],
};

export const SIMULATIONS: Simulation[] = [FOOD_SCIENTIST, INVESTMENT_BANKING, REGISTERED_NURSE, AVIATION_MAINTENANCE, UX_DESIGNER];

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
  { careerId: "private-equity", title: "Private Equity", world: "Business & Finance", cover: "/images/app/soon-private-equity.png" },
  { careerId: "food-scientist", title: "Food Scientist", world: "Farming, Animals & Nature", cover: "/images/app/soon-food-scientist.png" },
  // These three ride in the new Netflix-style featured row (see
  // FEATURED_ROW_SOON_IDS in PlayHub.tsx) alongside the real Investment
  // Banking simulation, rather than only appearing in the "In the works"
  // grid -- PlayHub filters them out of that grid so they don't show twice.
  { careerId: "accountant", title: "Accountant", world: "Business & Finance", cover: "/images/app/soon-accountant.png" },
  { careerId: "emergency-medicine-doctor", title: "Emergency Medicine Doctor", world: "Health & Medicine", cover: "/images/app/soon-emergency-medicine-doctor.png" },
];

/** The three "coming soon" careers that appear in the top featured row
 *  (PlayHub's FeaturedRow) rather than only in the generic "In the works"
 *  grid below. */
// AMT is a real simulation since 5 Oct 2026, so it left this list.
export const FEATURED_ROW_SOON_IDS = ["accountant", "emergency-medicine-doctor"];

/** A simulation's tile art and where to anchor it (see Simulation.thumb). */
export function simThumb(sim: Simulation): { src: string; focus: string } {
  return { src: sim.thumb ?? sim.cover, focus: sim.thumbFocus ?? "50% 50%" };
}

export function simulationFor(id: string): Simulation | undefined {
  return SIMULATIONS.find((simulation) => simulation.id === id || simulation.careerId === id);
}

/** A career's world by slug, checked across every catalogue that carries
 *  one (SIMULATIONS, then SOON) -- so any card keyed to a career slug (e.g.
 *  a Glossary Games tile) can pick up that career's own poster font/accent
 *  instead of a generic default, without a second hand-maintained map. */
export function worldForCareer(slug: string): string | undefined {
  return SIMULATIONS.find((sim) => sim.careerId === slug)?.world ?? SOON.find((soon) => soon.careerId === slug)?.world;
}

/** The two other game types the hub promises alongside career simulations.
 *  Glossary Games now has one real page (/play/glossary/[career]) -- Finance
 *  Essentials is playable, per `hasGlossary` in glossary/data.ts; any other
 *  entry added here without content yet still gets the "Soon" tile
 *  treatment (see PlayHub.tsx). Kept as its own array rather than folded
 *  into SOON: it isn't a career simulation, so it doesn't belong in the
 *  "these careers don't have a simulation yet" list, and the hub gives it
 *  its own labeled section. */
// Every title follows the same "{Subject} Terms" pattern (direct feedback,
// 9 Sept 2026: "Finance Glossary Game and everything Terms is not good, make
// it consistent" -- the real card's title stood out against the dummy
// cards' own naming instead of reading as one row of the same thing).
export const GLOSSARY_GAMES: { careerSlug: string; title: string; sub: string; cover?: string }[] = [
  // Covers are Chandu's 19 Oct 2026 thumbnails (landscape, 1400 by 788 WebP):
  // one isometric object of the subject (cash stack, green cross, jet,
  // laptop) centred on the navy night gradient, no Dreamy and no text. They
  // replace the 17 Oct three-glossy-objects set (Chandu: "Please use these
  // images for the glossary game thumbnails"). The shelf card is portrait
  // at rest and 16:9 when it expands, so the landscape frame shows whole
  // when the card is active and crops to Dreamy and the centre cards at rest.
  { careerSlug: "investment-banking", title: "Finance Terms", sub: "Learn key finance terms", cover: "/images/app/glossary-finance-thumb-oct19.webp" },
  // Medical, Flight and Tech were "Coming soon" dummy cards until their
  // glossaries were built and released (17 Oct 2026); they now open their
  // games like Finance. PlayHub locks any card whose glossary is not in
  // GLOSSARY_HUB_RELEASED.
  { careerSlug: "registered-nurse", title: "Medical Terms", sub: "Learn key nursing terms", cover: "/images/app/glossary-medical-thumb-oct19.webp" },
  { careerSlug: "airline-pilot", title: "Flight Terms", sub: "Learn key aviation terms", cover: "/images/app/glossary-flight-thumb-oct19.webp" },
  { careerSlug: "software-engineer", title: "Tech Terms", sub: "Learn key engineering terms", cover: "/images/app/glossary-tech-thumb-oct19.webp" },
  // Only glossaries with real thumbnail art sit in this row (Chandu, 17 Oct
  // 2026: "For everything without a thumbnail for the cards, send them to
  // hamburger access only link. Only use games with thumbnail art in the
  // play tab"). Kitchen Terms (industry slug "culinary"), the test world,
  // has no cover and plays from the hamburger's Glossary QA link. A new world
  // joins this row through SOP Prompt E (7c), Part 6.
  // Private Equity removed from this row (direct feedback, 9 Sept 2026) --
  // still gets the plain career-simulation "Soon" placeholder elsewhere.
];
