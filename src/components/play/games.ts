import { IB_LEVEL_1 } from "./ib-level-1";
import { IB_LEVEL_2 } from "./ib-level-2";
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
  levels: [IB_LEVEL_1, IB_LEVEL_2],
  // The ladder from the handoff: six levels. Three are documented in the sheet;
  // the top three are not built anywhere.
  upcoming: ["Vice President", "Executive Director", "Managing Director"],
};

export const SIMULATIONS: Simulation[] = [INVESTMENT_BANKING];

/** Careers whose simulation is not built yet. Poster art only, no promises
 *  about when. */
export const SOON: { careerId: string; title: string; world: string; cover: string }[] = [
  { careerId: "airline-pilot", title: "Airline Pilot", world: "Driving, Flying & Shipping", cover: "/images/app/poster-airline-pilot-alt.png" },
  { careerId: "registered-nurse", title: "Registered Nurse", world: "Health & Medicine", cover: "/images/app/poster-registered-nurse.png" },
  { careerId: "software-engineer", title: "Software Engineer", world: "Tech & Engineering", cover: "/images/app/poster-software-engineer.png" },
  { careerId: "private-equity", title: "Private Equity", world: "Business & Money", cover: "/images/app/poster-private-equity.png" },
  { careerId: "food-scientist", title: "Food Scientist", world: "Farming, Animals & Nature", cover: "/images/app/poster-food-scientist.png" },
];

export function simulationFor(id: string): Simulation | undefined {
  return SIMULATIONS.find((simulation) => simulation.id === id || simulation.careerId === id);
}
