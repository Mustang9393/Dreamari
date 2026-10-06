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
   *  names and genders and races"). The collection has 80 portraits; the
   *  students past the 80th draw an initials disc instead of a repeat. */
  avatar?: number;
};

/** The four semester leagues, by relative rank (Joshua, 6 Oct 2026: "about
 *  120 participating students, so roughly 30 students per league ... 1-30 =
 *  Diamond, 31-60 = Gold, 61-90 = Silver, 91-120 = Bronze. Standings
 *  update daily"). */
export const LEAGUES = ["Diamond", "Gold", "Silver", "Bronze"] as const;
export type League = (typeof LEAGUES)[number];
export const LEAGUE_SIZE = 30;
export function leagueFor(rank: number): League {
  return LEAGUES[Math.min(LEAGUES.length - 1, Math.floor((rank - 1) / LEAGUE_SIZE))];
}

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
  // Ranks 26 to 120 (seeded for the league mockup, 6 Oct 2026): the Replit
  // had a Top 25; the league system needs the whole cohort of ~120.
  { name: "Aiden Cole", grade: 12, school: "Central", state: "New Jersey", points: 1110, avatar: 21 },
  { name: "Mateo Ahmed", grade: 10, school: "ASE", state: "New York", points: 1095, avatar: 10 },
  { name: "Julian Nolan", grade: 12, school: "Central", state: "New Jersey", points: 1085, avatar: 26 },
  { name: "Gabriel Jenkins", grade: 10, school: "Central", state: "New Jersey", points: 1075, avatar: 53 },
  { name: "Lucy Stewart", grade: 9, school: "Central", state: "New Jersey", points: 1060, avatar: 4 },
  { name: "Julian Park", grade: 12, school: "Central", state: "New Jersey", points: 1045, avatar: 5 },
  { name: "Mateo Ibrahim", grade: 12, school: "Central", state: "New Jersey", points: 1035, avatar: 39 },
  { name: "Ella Osei", grade: 11, school: "Central", state: "New Jersey", points: 1025, avatar: 7 },
  { name: "Andre Varga", grade: 11, school: "Central", state: "New Jersey", points: 1010, avatar: 24 },
  { name: "Isaac Okafor", grade: 11, school: "ASE", state: "New York", points: 1000, avatar: 44 },
  { name: "Delilah Edwards", grade: 9, school: "Central", state: "New Jersey", points: 985, avatar: 75 },
  { name: "Jackson Freeman", grade: 12, school: "ASE", state: "New York", points: 975, avatar: 37 },
  { name: "Ariana Harris", grade: 10, school: "Central", state: "New Jersey", points: 970, avatar: 14 },
  { name: "Hazel Washington", grade: 10, school: "Central", state: "New Jersey", points: 960, avatar: 3 },
  { name: "Sebastian Long", grade: 9, school: "Central", state: "New Jersey", points: 950, avatar: 6 },
  { name: "Theodore Cole", grade: 11, school: "Central", state: "New Jersey", points: 940, avatar: 28 },
  { name: "Tariq Young", grade: 12, school: "ASE", state: "New York", points: 935, avatar: 27 },
  { name: "William Edwards", grade: 12, school: "ASE", state: "New York", points: 920, avatar: 74 },
  { name: "Ella Yilmaz", grade: 12, school: "ASE", state: "New York", points: 915, avatar: 16 },
  { name: "Brooklyn Tran", grade: 9, school: "ASE", state: "New York", points: 900, avatar: 51 },
  { name: "Lucy Cole", grade: 9, school: "Central", state: "New Jersey", points: 890, avatar: 47 },
  { name: "Naomi Ortega", grade: 11, school: "Central", state: "New Jersey", points: 880, avatar: 58 },
  { name: "Gabriel Ahmed", grade: 12, school: "ASE", state: "New York", points: 865, avatar: 8 },
  { name: "Owen Ross", grade: 9, school: "ASE", state: "New York", points: 855, avatar: 15 },
  { name: "Maria Ross", grade: 9, school: "ASE", state: "New York", points: 840, avatar: 79 },
  { name: "David Ahmed", grade: 9, school: "Central", state: "New Jersey", points: 835, avatar: 31 },
  { name: "Isabel Lopez", grade: 11, school: "Central", state: "New Jersey", points: 820, avatar: 19 },
  { name: "Liam Dunn", grade: 10, school: "Central", state: "New Jersey", points: 815, avatar: 2 },
  { name: "Paisley Fischer", grade: 10, school: "ASE", state: "New York", points: 810, avatar: 29 },
  { name: "Aiden Wright", grade: 11, school: "ASE", state: "New York", points: 805, avatar: 45 },
  { name: "Maria Yilmaz", grade: 12, school: "Central", state: "New Jersey", points: 795, avatar: 13 },
  { name: "Noah Khan", grade: 12, school: "ASE", state: "New York", points: 785, avatar: 73 },
  { name: "Keisha Bennett", grade: 9, school: "Central", state: "New Jersey", points: 770, avatar: 56 },
  { name: "Ezra Varga", grade: 9, school: "ASE", state: "New York", points: 765, avatar: 66 },
  { name: "Elena Ross", grade: 11, school: "Central", state: "New Jersey", points: 755, avatar: 18 },
  { name: "William Owens", grade: 10, school: "ASE", state: "New York", points: 745, avatar: 60 },
  { name: "Stella Diaz", grade: 10, school: "Central", state: "New Jersey", points: 735, avatar: 78 },
  { name: "Jayden Powell", grade: 10, school: "Central", state: "New Jersey", points: 720, avatar: 55 },
  { name: "Luke Quinn", grade: 9, school: "Central", state: "New Jersey", points: 710, avatar: 20 },
  { name: "Hannah Kelly", grade: 10, school: "ASE", state: "New York", points: 695, avatar: 38 },
  { name: "Jasmine Castillo", grade: 11, school: "ASE", state: "New York", points: 685, avatar: 77 },
  { name: "Matthew Harris", grade: 11, school: "ASE", state: "New York", points: 675, avatar: 17 },
  { name: "Thomas Kaur", grade: 10, school: "Central", state: "New Jersey", points: 665, avatar: 9 },
  { name: "Lucy Bell", grade: 10, school: "Central", state: "New Jersey", points: 660, avatar: 11 },
  { name: "Olivia Torres", grade: 9, school: "Central", state: "New Jersey", points: 655, avatar: 76 },
  { name: "Ella Reyes", grade: 9, school: "Central", state: "New Jersey", points: 645, avatar: 22 },
  { name: "Ella Grant", grade: 9, school: "ASE", state: "New York", points: 635, avatar: 43 },
  { name: "Jackson Gray", grade: 12, school: "ASE", state: "New York", points: 625, avatar: 40 },
  { name: "Isaac Wells", grade: 11, school: "ASE", state: "New York", points: 610, avatar: 1 },
  { name: "Joseph Cole", grade: 11, school: "ASE", state: "New York", points: 605, avatar: 30 },
  { name: "Elena Murphy", grade: 12, school: "ASE", state: "New York", points: 595, avatar: 69 },
  { name: "Amina Jenkins", grade: 9, school: "Central", state: "New Jersey", points: 585, avatar: 23 },
  { name: "Andre Nolan", grade: 11, school: "ASE", state: "New York", points: 575, avatar: 12 },
  { name: "Jasmine Ramirez", grade: 9, school: "ASE", state: "New York", points: 560, avatar: 25 },
  { name: "Sebastian Underwood", grade: 10, school: "ASE", state: "New York", points: 550, avatar: 32 },
  { name: "Joseph Freeman", grade: 11, school: "ASE", state: "New York", points: 545 },
  { name: "Violet Ahmed", grade: 12, school: "Central", state: "New Jersey", points: 540 },
  { name: "Charlotte Delgado", grade: 11, school: "Central", state: "New Jersey", points: 525 },
  { name: "Chloe Okafor", grade: 9, school: "ASE", state: "New York", points: 520 },
  { name: "Maria Jordan", grade: 11, school: "ASE", state: "New York", points: 510 },
  { name: "Jack Ivanova", grade: 12, school: "Central", state: "New Jersey", points: 505 },
  { name: "Violet Kowalski", grade: 10, school: "Central", state: "New Jersey", points: 495 },
  { name: "Nora Jordan", grade: 11, school: "ASE", state: "New York", points: 485 },
  { name: "Gabriel Dunn", grade: 12, school: "ASE", state: "New York", points: 480 },
  { name: "Keisha Ford", grade: 10, school: "Central", state: "New Jersey", points: 475 },
  { name: "David Fischer", grade: 11, school: "ASE", state: "New York", points: 470 },
  { name: "Lily Zimmerman", grade: 10, school: "Central", state: "New Jersey", points: 460 },
  { name: "Jackson Wells", grade: 11, school: "Central", state: "New Jersey", points: 450 },
  { name: "Jasmine Evans", grade: 10, school: "Central", state: "New Jersey", points: 445 },
  { name: "Michael Grant", grade: 12, school: "ASE", state: "New York", points: 435 },
  { name: "Matthew Edwards", grade: 10, school: "Central", state: "New Jersey", points: 425 },
  { name: "Keisha Zimmerman", grade: 12, school: "ASE", state: "New York", points: 415 },
  { name: "Luna Quinn", grade: 11, school: "Central", state: "New Jersey", points: 405 },
  { name: "Eliana Hughes", grade: 11, school: "Central", state: "New Jersey", points: 400 },
  { name: "Delilah Mendoza", grade: 10, school: "ASE", state: "New York", points: 385 },
  { name: "Jackson Adams", grade: 11, school: "Central", state: "New Jersey", points: 375 },
  { name: "Mia Osei", grade: 9, school: "ASE", state: "New York", points: 365 },
  { name: "Elijah Khan", grade: 10, school: "Central", state: "New Jersey", points: 355 },
  { name: "Samuel Adams", grade: 10, school: "ASE", state: "New York", points: 350 },
  { name: "Leo Flores", grade: 11, school: "Central", state: "New Jersey", points: 340 },
  { name: "Hazel Kaur", grade: 12, school: "ASE", state: "New York", points: 330 },
  { name: "Aiden Torres", grade: 10, school: "Central", state: "New Jersey", points: 325 },
  { name: "Joseph Jimenez", grade: 9, school: "ASE", state: "New York", points: 315 },
  { name: "Diego Ellis", grade: 10, school: "ASE", state: "New York", points: 310 },
  { name: "Savannah Chavez", grade: 9, school: "ASE", state: "New York", points: 300 },
  { name: "Diego Grant", grade: 12, school: "ASE", state: "New York", points: 290 },
  { name: "Samuel Cole", grade: 9, school: "Central", state: "New Jersey", points: 285 },
  { name: "Jasmine Jenkins", grade: 10, school: "ASE", state: "New York", points: 280 },
  { name: "Ezra Novak", grade: 9, school: "Central", state: "New Jersey", points: 275 },
  { name: "Diego Lee", grade: 9, school: "ASE", state: "New York", points: 265 },
  { name: "Addison Santos", grade: 11, school: "Central", state: "New Jersey", points: 255 },
  { name: "Carter Ramirez", grade: 12, school: "ASE", state: "New York", points: 245 },
  { name: "Malik Morales", grade: 11, school: "Central", state: "New Jersey", points: 230 },
  { name: "Sadie Owens", grade: 10, school: "ASE", state: "New York", points: 220 },
  { name: "Hazel Powell", grade: 9, school: "Central", state: "New Jersey", points: 210 },
];
