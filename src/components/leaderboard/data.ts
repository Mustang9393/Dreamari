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
  /** The student's portrait, public/images/avatars/students/student-NN.png:
   *  one per name, none repeated, matched by hand to the name's likely
   *  gender and background (Chandu, 6 Oct 2026: "use the student black and
   *  white avatars without repeating from our collection, making sense for
   *  names and genders and races"). */
  avatar: number;
};

export const YOU = "Noah Williams";

export const STANDINGS: Standing[] = [
  { name: "Evelyn Brooks", grade: 11, school: "ASE", state: "New York", points: 4320, avatar: 57 },
  { name: "Mateo Rivera", grade: 12, school: "Central", state: "New Jersey", points: 4180, avatar: 54 },
  { name: "Sofia Patel", grade: 10, school: "Central", state: "New Jersey", points: 3940, avatar: 36 },
  { name: "Jordan Chen", grade: 11, school: "ASE", state: "New York", points: 3760, avatar: 35 },
  { name: "Amara Johnson", grade: 12, school: "Central", state: "New Jersey", points: 3590, avatar: 34 },
  { name: "Liam O'Connor", grade: 10, school: "Central", state: "New Jersey", points: 3410, avatar: 33 },
  { name: "Priya Shah", grade: 12, school: "ASE", state: "New York", points: 3280, avatar: 68 },
  { name: "Noah Williams", grade: 11, school: "Central", state: "New Jersey", points: 3160, avatar: 49 },
  { name: "Maya Thompson", grade: 9, school: "Central", state: "New Jersey", points: 3020, avatar: 61 },
  { name: "Elijah Davis", grade: 10, school: "ASE", state: "New York", points: 2880, avatar: 50 },
  { name: "Zoe Martinez", grade: 11, school: "Central", state: "New Jersey", points: 2740, avatar: 63 },
  { name: "Aaliyah Robinson", grade: 12, school: "ASE", state: "New York", points: 2610, avatar: 48 },
  { name: "Caleb Nguyen", grade: 10, school: "Central", state: "New Jersey", points: 2480, avatar: 67 },
  { name: "Naomi Walker", grade: 11, school: "Central", state: "New Jersey", points: 2360, avatar: 80 },
  { name: "Marcus Hill", grade: 11, school: "ASE", state: "New York", points: 2250, avatar: 42 },
  { name: "Lucas Kim", grade: 9, school: "Central", state: "New Jersey", points: 2140, avatar: 59 },
  { name: "Layla Garcia", grade: 12, school: "Central", state: "New Jersey", points: 2020, avatar: 52 },
  { name: "Ethan Price", grade: 10, school: "ASE", state: "New York", points: 1910, avatar: 62 },
  { name: "Ava Foster", grade: 11, school: "Central", state: "New Jersey", points: 1810, avatar: 41 },
  { name: "Zara Collins", grade: 9, school: "ASE", state: "New York", points: 1700, avatar: 64 },
  { name: "Isaac Reed", grade: 12, school: "Central", state: "New Jersey", points: 1590, avatar: 72 },
  { name: "Camille Young", grade: 11, school: "ASE", state: "New York", points: 1480, avatar: 71 },
  { name: "Gabriel Ortiz", grade: 10, school: "Central", state: "New Jersey", points: 1370, avatar: 46 },
  { name: "Destiny Cooper", grade: 12, school: "Central", state: "New Jersey", points: 1260, avatar: 70 },
  { name: "Finn Brooks", grade: 9, school: "ASE", state: "New York", points: 1150, avatar: 65 },
];
