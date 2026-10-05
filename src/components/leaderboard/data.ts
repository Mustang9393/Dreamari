// DEMO-ONLY: the Daily Leaderboard's seeded standings, copied from Joshua's
// Replit vision (https://dceeai.replit.app/leaderboard/regional, 6 Oct 2026),
// names, grades, schools, states and points exactly as there. A real build
// reads these from the points service; nothing here is computed from play.

export type School = "ASE" | "Central";
export type State = "New York" | "New Jersey";

export type Standing = {
  name: string;
  grade: number;
  school: School;
  state: State;
  points: number;
};

export const YOU = "Noah Williams";

export const STANDINGS: Standing[] = [
  { name: "Evelyn Brooks", grade: 11, school: "ASE", state: "New York", points: 4320 },
  { name: "Mateo Rivera", grade: 12, school: "Central", state: "New Jersey", points: 4180 },
  { name: "Sofia Patel", grade: 10, school: "Central", state: "New Jersey", points: 3940 },
  { name: "Jordan Chen", grade: 11, school: "ASE", state: "New York", points: 3760 },
  { name: "Amara Johnson", grade: 12, school: "Central", state: "New Jersey", points: 3590 },
  { name: "Liam O'Connor", grade: 10, school: "Central", state: "New Jersey", points: 3410 },
  { name: "Priya Shah", grade: 12, school: "ASE", state: "New York", points: 3280 },
  { name: "Noah Williams", grade: 11, school: "Central", state: "New Jersey", points: 3160 },
  { name: "Maya Thompson", grade: 9, school: "Central", state: "New Jersey", points: 3020 },
  { name: "Elijah Davis", grade: 10, school: "ASE", state: "New York", points: 2880 },
  { name: "Zoe Martinez", grade: 11, school: "Central", state: "New Jersey", points: 2740 },
  { name: "Aaliyah Robinson", grade: 12, school: "ASE", state: "New York", points: 2610 },
  { name: "Caleb Nguyen", grade: 10, school: "Central", state: "New Jersey", points: 2480 },
  { name: "Naomi Walker", grade: 11, school: "Central", state: "New Jersey", points: 2360 },
  { name: "Marcus Hill", grade: 11, school: "ASE", state: "New York", points: 2250 },
  { name: "Lucas Kim", grade: 9, school: "Central", state: "New Jersey", points: 2140 },
  { name: "Layla Garcia", grade: 12, school: "Central", state: "New Jersey", points: 2020 },
  { name: "Ethan Price", grade: 10, school: "ASE", state: "New York", points: 1910 },
  { name: "Ava Foster", grade: 11, school: "Central", state: "New Jersey", points: 1810 },
  { name: "Zara Collins", grade: 9, school: "ASE", state: "New York", points: 1700 },
  { name: "Isaac Reed", grade: 12, school: "Central", state: "New Jersey", points: 1590 },
  { name: "Camille Young", grade: 11, school: "ASE", state: "New York", points: 1480 },
  { name: "Gabriel Ortiz", grade: 10, school: "Central", state: "New Jersey", points: 1370 },
  { name: "Destiny Cooper", grade: 12, school: "Central", state: "New Jersey", points: 1260 },
  { name: "Finn Brooks", grade: 9, school: "ASE", state: "New York", points: 1150 },
];
