// College lookup data. PROTOTYPE: figures transcribed on 2026-09-03 from the
// live Dreamari build (dreamonna.com/colleges), which reads IPEDS 2024-25 and
// the federal College Scorecard. Production reads the same fields from the
// College Scorecard API. Imagery: Wikimedia Commons (credits.json) and
// Wikipedia lead images for marks; both prototype only.

export type Level = "Certificates" | "Associate degrees" | "Bachelor's degrees";
export type Control = "Public" | "Private" | "For profit";
export type Setting = "City" | "Suburb" | "Town" | "Countryside";
export type Size = "Small" | "Medium" | "Large";
export type Admission = "open" | "grades" | "more" | "portfolio";

export type Programme = { name: string; grads: number; share: number; pay: string };

export type College = {
  slug: string;
  name: string;
  city: string;
  state: string; // two letters
  stateName: string;
  level: Level;
  control: Control;
  setting: Setting;
  size: Size;
  undergrads: number;
  /** average net price a year after grants, all students; null when unpublished */
  netPrice: number | null;
  /** finish within 6 years, everyone who started */
  finish: number | null;
  /** come back for year 2 */
  retention: number | null;
  /** paying back their loans */
  repay: number | null;
  gradsPerYear: number;
  accreditor: string;
  admission: Admission;
  admitRate: number | null; // null = open admission
  applied?: number;
  flags?: ("tribal" | "forProfit" | "fewFinish" | "hbcu" | "online" | "religious")[];
  religion?: string;
  photo?: boolean;
  mark?: boolean;
  website?: string;
  detail?: CollegeDetail;
};

export type CollegeDetail = {
  address: string;
  partOf?: string;
  tuitionInState: number | null;
  tuitionOutState: number | null;
  fees: number | null;
  housing: boolean;
  housingCost?: number;
  foodCost?: number;
  /** what families actually pay by income band, a year */
  bands: { label: string; pay: number }[];
  scholarshipShare?: number;
  scholarshipAvg?: number;
  pell?: number;
  require: string[];
  consider: string[];
  scores?: { sat: string; act?: string; sentSat: number; sentAct?: number };
  finish4?: number | null;
  ratio: string;
  programmeCount: number;
  levels: { label: string; n: number }[];
  programmes: Programme[];
  gradStudents?: number;
  fullTime: number;
  partTime: number;
  women: number;
  men: number;
  makeup: { label: string; n: number; pct: number }[];
  ways: string[];
  helps: string[];
  notOffered?: string[];
  sport?: { league: string; students: number; teams: string[] };
  pay6: number | null;
  debt: number | null;
  monthly?: number;
  worth?: string;
};

const nj = { state: "NJ", stateName: "New Jersey", accreditor: "Middle States Commission on Higher Education" } as const;
const sd = { state: "SD", stateName: "South Dakota", accreditor: "Higher Learning Commission" } as const;

export const COLLEGES: College[] = [
  {
    slug: "rutgers-university-new-brunswick", name: "Rutgers University-New Brunswick", city: "New Brunswick", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "City", size: "Large", undergrads: 37985,
    netPrice: 24406, finish: 84, retention: 93, repay: 74, gradsPerYear: 12100, admission: "more", admitRate: 58, applied: 68614, photo: true, mark: true, website: "https://www.rutgers.edu",
    detail: {
      address: "83 Somerset St, New Brunswick, New Jersey", tuitionInState: 14222, tuitionOutState: 33734, fees: 3707, housing: true, housingCost: 9366, foodCost: 6348,
      bands: [{ label: "Under $30,000", pay: 16343 }, { label: "$30,000 to $48,000", pay: 16210 }, { label: "$48,000 to $75,000", pay: 18282 }, { label: "$75,000 to $110,000", pay: 25106 }, { label: "Over $110,000", pay: 35016 }],
      scholarshipShare: 42, scholarshipAvg: 10488, pell: 27,
      require: ["High school grades", "Your school record", "Specific school subjects", "An English test", "A personal essay"], consider: ["Class rank", "SAT or ACT scores", "Work experience"],
      scores: { sat: "1310 to 1500", act: "28 to 33", sentSat: 50, sentAct: 5 }, finish4: 69, ratio: "16 to 1", programmeCount: 399,
      levels: [{ label: "Certificates", n: 10 }, { label: "Associate", n: 4 }, { label: "Bachelor's", n: 121 }, { label: "Master's", n: 139 }, { label: "Doctorates", n: 103 }],
      programmes: [{ name: "Computer and Information Sciences", grads: 746, share: 6, pay: "$69,934" }, { name: "Psychology", grads: 570, share: 4, pay: "$29,963" }, { name: "Finance", grads: 490, share: 4, pay: "$60,547" }, { name: "Biology", grads: 421, share: 3, pay: "$26,120" }, { name: "Information Science", grads: 385, share: 3, pay: "$50,779" }, { name: "Management Science", grads: 307, share: 2, pay: "$72,418" }, { name: "Registered Nursing", grads: 297, share: 2, pay: "$72,734" }, { name: "Electrical Engineering", grads: 253, share: 2, pay: "$70,205" }],
      gradStudents: 14284, fullTime: 45551, partTime: 6718, women: 50, men: 50,
      makeup: [{ label: "Asian", n: 12726, pct: 34 }, { label: "White", n: 11386, pct: 30 }, { label: "Hispanic or Latino", n: 6023, pct: 16 }, { label: "Black or African American", n: 2665, pct: 7 }, { label: "International", n: 2780, pct: 7 }, { label: "Two or more races", n: 1379, pct: 4 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Army, Navy, Air Force)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division I-FBS", students: 959, teams: ["Football", "Soccer", "Basketball", "Track and Field", "Lacrosse", "Baseball", "Wrestling", "Rowing", "Softball", "Gymnastics"] },
      pay6: 61263, debt: 21500, monthly: 228,
    },
  },
  {
    slug: "the-college-of-new-jersey", name: "The College of New Jersey", city: "Ewing", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 7435,
    netPrice: 27646, finish: 85, retention: 91, repay: 87, gradsPerYear: 1950, admission: "more", admitRate: 62, applied: 12766, photo: true, mark: true, website: "https://www.tcnj.edu",
    detail: {
      address: "2000 Pennington Road, Ewing, New Jersey", tuitionInState: 15294, tuitionOutState: 21414, fees: 4338, housing: true, housingCost: 10351, foodCost: 4625,
      bands: [{ label: "Under $30,000", pay: 7908 }, { label: "$30,000 to $48,000", pay: 14028 }, { label: "$48,000 to $75,000", pay: 22642 }, { label: "$75,000 to $110,000", pay: 30942 }, { label: "Over $110,000", pay: 35222 }],
      scholarshipShare: 53, scholarshipAvg: 9175, pell: 21,
      require: ["Your school record", "An English test", "A personal essay"], consider: ["High school grades", "Class rank", "Specific school subjects", "Recommendations", "SAT or ACT scores", "Work experience"],
      scores: { sat: "1140 to 1340", act: "26 to 31", sentSat: 39, sentAct: 3 }, finish4: 76, ratio: "14 to 1", programmeCount: 111,
      levels: [{ label: "Bachelor's", n: 50 }, { label: "Master's", n: 24 }],
      programmes: [{ name: "Business Administration", grads: 256, share: 13, pay: "$50,470" }, { name: "Psychology", grads: 122, share: 6, pay: "$31,706" }, { name: "Biology", grads: 114, share: 6, pay: "$18,233" }, { name: "Elementary Education", grads: 85, share: 4, pay: "$49,849" }, { name: "English", grads: 69, share: 3, pay: "$34,126" }, { name: "Registered Nursing", grads: 66, share: 3, pay: "$72,953" }, { name: "Mathematics", grads: 54, share: 3, pay: "$57,988" }],
      gradStudents: 706, fullTime: 7556, partTime: 585, women: 55, men: 45,
      makeup: [{ label: "White", n: 4302, pct: 58 }, { label: "Hispanic or Latino", n: 1316, pct: 18 }, { label: "Asian", n: 802, pct: 11 }, { label: "Black or African American", n: 437, pct: 6 }, { label: "Two or more races", n: 231, pct: 3 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Army, Air Force)", "Teacher training", "Programme for students with an intellectual disability"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish"], notOffered: ["Childcare on campus"],
      sport: { league: "NCAA Division III", students: 741, teams: ["Football", "Soccer", "Basketball", "Track and Field", "Baseball", "Wrestling", "Swimming", "Tennis", "Field Hockey", "Lacrosse", "Softball"] },
      pay6: 62649, debt: 23250, monthly: 246,
    },
  },
  {
    slug: "ramapo-college-of-new-jersey", name: "Ramapo College of New Jersey", city: "Mahwah", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 5444,
    netPrice: 18173, finish: 70, retention: 84, repay: 76, gradsPerYear: 1350, admission: "more", admitRate: 71, applied: 8976, photo: true, mark: true, website: "https://www.ramapo.edu",
    detail: {
      address: "505 Ramapo Valley Rd, Mahwah, New Jersey", partOf: "State of New Jersey", tuitionInState: 16777, tuitionOutState: 27708, fees: 0, housing: true, housingCost: 11236, foodCost: 5450,
      bands: [{ label: "Under $30,000", pay: 9008 }, { label: "$30,000 to $48,000", pay: 10708 }, { label: "$48,000 to $75,000", pay: 18074 }, { label: "$75,000 to $110,000", pay: 22949 }, { label: "Over $110,000", pay: 26008 }],
      scholarshipShare: 64, scholarshipAvg: 6546, pell: 33,
      require: ["High school grades", "Your school record", "Specific school subjects", "Recommendations", "An English test"], consider: ["Class rank", "SAT or ACT scores", "A personal essay"],
      scores: { sat: "1130 to 1300", act: "22 to 30", sentSat: 25, sentAct: 2 }, finish4: 57, ratio: "17 to 1", programmeCount: 68,
      levels: [{ label: "Bachelor's", n: 50 }, { label: "Master's", n: 15 }],
      programmes: [{ name: "Nursing Science", grads: 123, share: 9, pay: "$74,265" }, { name: "Business", grads: 83, share: 6, pay: "not published" }, { name: "Psychology", grads: 83, share: 6, pay: "$28,354" }, { name: "Biology", grads: 78, share: 6, pay: "$31,898" }, { name: "Communication and Media", grads: 76, share: 5, pay: "$34,335" }, { name: "Accounting", grads: 59, share: 4, pay: "$54,158" }],
      gradStudents: 537, fullTime: 4778, partTime: 1203, women: 58, men: 42,
      makeup: [{ label: "White", n: 2860, pct: 53 }, { label: "Hispanic or Latino", n: 1392, pct: 26 }, { label: "Asian", n: 546, pct: 10 }, { label: "Black or African American", n: 320, pct: 6 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Army, Air Force)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish"], notOffered: ["Childcare on campus"],
      sport: { league: "NCAA Division III", students: 390, teams: ["Soccer", "Baseball", "Volleyball", "Basketball", "Swimming", "Cross Country", "Field Hockey", "Lacrosse", "Softball", "Track and Field"] },
      pay6: 53872, debt: 21000, monthly: 223,
    },
  },
  {
    slug: "bergen-community-college", name: "Bergen Community College", city: "Paramus", ...nj,
    level: "Associate degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 11720,
    netPrice: 10345, finish: 39, retention: 64, repay: 53, gradsPerYear: 1760, admission: "open", admitRate: null, photo: false, mark: true, website: "https://bergen.edu",
    detail: {
      address: "400 Paramus Rd, Paramus, New Jersey", tuitionInState: 7760, tuitionOutState: 8160, fees: 1134, housing: false,
      bands: [{ label: "Under $30,000", pay: 8532 }, { label: "$30,000 to $48,000", pay: 8768 }, { label: "$48,000 to $75,000", pay: 10964 }, { label: "$75,000 to $110,000", pay: 13927 }, { label: "Over $110,000", pay: 16919 }],
      scholarshipShare: 0, pell: 51, require: [], consider: [], ratio: "18 to 1", programmeCount: 81,
      levels: [{ label: "Certificates", n: 39 }, { label: "Associate", n: 42 }],
      programmes: [{ name: "Liberal Arts and Sciences", grads: 1322, share: 75, pay: "$23,408" }, { name: "Registered Nursing", grads: 102, share: 6, pay: "$64,699" }, { name: "Veterinary Technology", grads: 47, share: 3, pay: "not published" }, { name: "Dental Hygiene", grads: 38, share: 2, pay: "$57,621" }, { name: "Radiation Therapy", grads: 24, share: 1, pay: "$60,672" }, { name: "Respiratory Care", grads: 15, share: 1, pay: "$60,672" }],
      fullTime: 5873, partTime: 5847, women: 54, men: 46,
      makeup: [{ label: "Hispanic or Latino", n: 5104, pct: 44 }, { label: "White", n: 2973, pct: 25 }, { label: "Asian", n: 1043, pct: 9 }, { label: "Black or African American", n: 822, pct: 7 }, { label: "International", n: 652, pct: 6 }],
      ways: ["Evening or weekend classes", "Study abroad"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NJCAA Division III", students: 180, teams: ["Baseball", "Soccer", "Track and Field", "Wrestling", "Basketball", "Cross Country", "Softball", "Volleyball"] },
      pay6: 36599, debt: 12000, monthly: 127,
    },
  },
  {
    slug: "middlesex-college", name: "Middlesex College", city: "Edison", ...nj,
    level: "Associate degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 12044,
    netPrice: 2288, finish: 29, retention: 72, repay: 54, gradsPerYear: 1450, admission: "open", admitRate: null, photo: false, mark: true, website: "https://www.middlesexcollege.edu",
    detail: {
      address: "2600 Woodbridge Avenue, Edison, New Jersey", tuitionInState: 5568, tuitionOutState: 5568, fees: 1788, housing: false,
      bands: [{ label: "Under $30,000", pay: 1306 }, { label: "$30,000 to $48,000", pay: 1435 }, { label: "$48,000 to $75,000", pay: 3653 }, { label: "$75,000 to $110,000", pay: 4050 }, { label: "Over $110,000", pay: 4504 }],
      scholarshipShare: 5, scholarshipAvg: 1565, pell: 56, require: [], consider: [], ratio: "21 to 1", programmeCount: 74,
      levels: [{ label: "Certificates", n: 23 }, { label: "Associate", n: 51 }],
      programmes: [{ name: "Liberal Arts and Sciences", grads: 419, share: 29, pay: "$23,465" }, { name: "Business Administration", grads: 275, share: 19, pay: "$34,260" }, { name: "Physical Sciences", grads: 169, share: 12, pay: "$28,720" }, { name: "Registered Nursing", grads: 60, share: 4, pay: "$53,555" }, { name: "Criminal Justice", grads: 41, share: 3, pay: "$31,985" }, { name: "Dental Hygiene", grads: 27, share: 2, pay: "$65,365" }],
      fullTime: 4378, partTime: 7666, women: 55, men: 45,
      makeup: [{ label: "Hispanic or Latino", n: 4238, pct: 35 }, { label: "Asian", n: 2447, pct: 20 }, { label: "White", n: 2379, pct: 20 }, { label: "Black or African American", n: 1163, pct: 10 }],
      ways: ["Evening or weekend classes"], helps: ["Careers advice", "Help finding work while you study", "Childcare on campus"], notOffered: ["Help finding a job when you finish"],
      sport: { league: "NJCAA Division III", students: 129, teams: ["Baseball", "Soccer", "Basketball", "Volleyball", "Wrestling", "Softball"] },
      pay6: 37254, debt: 9750, monthly: 103,
    },
  },
  {
    slug: "montclair-state-university", name: "Montclair State University", city: "Montclair", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 18712,
    netPrice: 15566, finish: 68, retention: 78, repay: 72, gradsPerYear: 5400, admission: "more", admitRate: 88, applied: 26257, photo: true, mark: true, website: "https://www.montclair.edu",
    detail: {
      address: "1 Normal Avenue, Montclair, New Jersey", tuitionInState: 14790, tuitionOutState: 24900, fees: 1122, housing: true, housingCost: 10732, foodCost: 5998,
      bands: [{ label: "Under $30,000", pay: 10880 }, { label: "$30,000 to $48,000", pay: 11532 }, { label: "$48,000 to $75,000", pay: 16388 }, { label: "$75,000 to $110,000", pay: 22058 }, { label: "Over $110,000", pay: 25573 }],
      scholarshipShare: 59, scholarshipAvg: 3896, pell: 56,
      require: ["High school grades", "Your school record", "Specific school subjects", "Recommendations", "An English test", "A personal essay"], consider: ["Class rank", "SAT or ACT scores", "Work experience"],
      scores: { sat: "910 to 1210", sentSat: 9 }, finish4: 46, ratio: "18 to 1", programmeCount: 173,
      levels: [{ label: "Certificates", n: 7 }, { label: "Bachelor's", n: 72 }, { label: "Master's", n: 48 }, { label: "Doctorates", n: 10 }],
      programmes: [{ name: "Business Administration", grads: 650, share: 12, pay: "$40,033" }, { name: "Psychology", grads: 471, share: 8, pay: "$27,009" }, { name: "Biology", grads: 145, share: 3, pay: "$31,870" }, { name: "Exercise Science", grads: 143, share: 3, pay: "$26,264" }, { name: "Film and Video Production", grads: 139, share: 2, pay: "$16,935" }, { name: "Accounting", grads: 103, share: 2, pay: "$53,871" }],
      gradStudents: 4663, fullTime: 19449, partTime: 3926, women: 59, men: 41,
      makeup: [{ label: "Hispanic or Latino", n: 7566, pct: 40 }, { label: "White", n: 5922, pct: 32 }, { label: "Black or African American", n: 2468, pct: 13 }, { label: "Asian", n: 1131, pct: 6 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Army, Air Force)", "Teacher training", "Programme for students with an intellectual disability"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division III", students: 643, teams: ["Football", "Lacrosse", "Track and Field", "Soccer", "Baseball", "Swimming", "Basketball", "Field Hockey", "Softball", "Volleyball"] },
      pay6: 47944, debt: 22000, monthly: 233,
    },
  },
  {
    slug: "new-jersey-institute-of-technology", name: "New Jersey Institute of Technology", city: "Newark", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "City", size: "Medium", undergrads: 10200,
    netPrice: 16504, finish: 73, retention: 90, repay: 73, gradsPerYear: 3200, admission: "more", admitRate: 65, applied: 15607, photo: true, mark: true, website: "https://www.njit.edu",
    detail: {
      address: "University Heights, Newark, New Jersey", tuitionInState: 16334, tuitionOutState: 34024, fees: 3640, housing: true, housingCost: 9950, foodCost: 5906,
      bands: [{ label: "Under $30,000", pay: 10138 }, { label: "$30,000 to $48,000", pay: 11165 }, { label: "$48,000 to $75,000", pay: 15958 }, { label: "$75,000 to $110,000", pay: 23152 }, { label: "Over $110,000", pay: 27244 }],
      scholarshipShare: 73, scholarshipAvg: 12252, pell: 44,
      require: ["High school grades", "Your school record", "Specific school subjects", "Recommendations", "A demonstration of skills", "An English test"], consider: ["Class rank", "SAT or ACT scores"],
      scores: { sat: "1210 to 1460", act: "27 to 34", sentSat: 45, sentAct: 4 }, finish4: 49, ratio: "17 to 1", programmeCount: 142,
      levels: [{ label: "Bachelor's", n: 45 }, { label: "Master's", n: 46 }, { label: "Doctorates", n: 19 }],
      programmes: [{ name: "Computer and Information Sciences", grads: 264, share: 8, pay: "$62,732" }, { name: "Information Technology", grads: 200, share: 6, pay: "$62,732" }, { name: "Mechanical Engineering", grads: 179, share: 5, pay: "$63,541" }, { name: "Civil Engineering", grads: 164, share: 5, pay: "$61,687" }, { name: "Business Administration", grads: 101, share: 3, pay: "$37,273" }, { name: "Biomedical Engineering", grads: 73, share: 2, pay: "$60,280" }],
      gradStudents: 3047, fullTime: 10621, partTime: 2626, women: 31, men: 69,
      makeup: [{ label: "White", n: 2898, pct: 28 }, { label: "Hispanic or Latino", n: 2779, pct: 27 }, { label: "Asian", n: 1984, pct: 19 }, { label: "Black or African American", n: 1165, pct: 11 }, { label: "International", n: 603, pct: 6 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Air Force)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish"], notOffered: ["Childcare on campus"],
      sport: { league: "NCAA Division I", students: 397, teams: ["Soccer", "Basketball", "Lacrosse", "Baseball", "Swimming and Diving", "Volleyball", "Fencing", "Tennis", "Track and Field"] },
      pay6: 69591, debt: 21000, monthly: 223,
    },
  },
  {
    slug: "princeton-university", name: "Princeton University", city: "Princeton", ...nj,
    level: "Bachelor's degrees", control: "Private", setting: "City", size: "Medium", undergrads: 5813,
    netPrice: 6128, finish: 98, retention: 98, repay: 85, gradsPerYear: 2400, admission: "more", admitRate: 5, applied: 40468, photo: true, mark: true, website: "https://www.princeton.edu",
    detail: {
      address: "1 Nassau Hall, Princeton, New Jersey", tuitionInState: 62400, tuitionOutState: 62400, fees: 288, housing: true, housingCost: 11910, foodCost: 8340,
      bands: [{ label: "Under $30,000", pay: 41 }, { label: "$30,000 to $48,000", pay: 352 }, { label: "$48,000 to $75,000", pay: 1217 }, { label: "$75,000 to $110,000", pay: 4478 }, { label: "Over $110,000", pay: 36094 }],
      scholarshipShare: 66, scholarshipAvg: 66054, pell: 22,
      require: ["Your school record", "Recommendations", "An English test", "A personal essay"], consider: ["High school grades", "Class rank", "Specific school subjects", "A demonstration of skills", "SAT or ACT scores", "Work experience", "Whether a relative went there"],
      scores: { sat: "1510 to 1580", act: "34 to 35", sentSat: 56, sentAct: 21 }, finish4: 75, ratio: "5 to 1", programmeCount: 129,
      levels: [{ label: "Bachelor's", n: 39 }, { label: "Master's", n: 44 }, { label: "Doctorates", n: 45 }],
      programmes: [{ name: "Computer Science", grads: 213, share: 9, pay: "not published" }, { name: "Public Policy", grads: 130, share: 5, pay: "$50,510" }, { name: "Economics", grads: 124, share: 5, pay: "$81,961" }, { name: "Operations Research", grads: 72, share: 3, pay: "not published" }, { name: "Politics", grads: 58, share: 2, pay: "$37,831" }, { name: "History", grads: 56, share: 2, pay: "$50,775" }],
      gradStudents: 3324, fullTime: 9047, partTime: 90, women: 50, men: 50,
      makeup: [{ label: "White", n: 1925, pct: 33 }, { label: "Asian", n: 1343, pct: 23 }, { label: "International", n: 751, pct: 13 }, { label: "Hispanic or Latino", n: 577, pct: 10 }, { label: "Black or African American", n: 499, pct: 9 }, { label: "Two or more races", n: 413, pct: 7 }],
      ways: ["Study abroad", "Undergraduate research", "ROTC (Army, Navy, Air Force)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division I-FCS", students: 1189, teams: ["Football", "Rowing", "Lacrosse", "Swimming and Diving", "Soccer", "Ice Hockey", "Fencing", "Basketball", "Squash", "Tennis", "Field Hockey"] },
      pay6: 87815, debt: 10320, monthly: 109, worth: "Almost free for most families. Families earning under $75,000 paid about $1,200 a year or less after aid. Getting in is the hard part: 5 of every 100 who apply are admitted.",
    },
  },
  {
    slug: "rowan-university", name: "Rowan University", city: "Glassboro", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 16100,
    netPrice: 22408, finish: 71, retention: 82, repay: 71, gradsPerYear: 5900, admission: "grades", admitRate: 78, applied: 19593, photo: true, mark: true, website: "https://www.rowan.edu",
    detail: {
      address: "201 Mullica Hill Road, Glassboro, New Jersey", tuitionInState: 11812, tuitionOutState: 22170, fees: 4762, housing: true, housingCost: 9592, foodCost: 5258,
      bands: [{ label: "Under $30,000", pay: 15305 }, { label: "$30,000 to $48,000", pay: 15264 }, { label: "$48,000 to $75,000", pay: 19245 }, { label: "$75,000 to $110,000", pay: 27580 }, { label: "Over $110,000", pay: 30378 }],
      scholarshipShare: 88, scholarshipAvg: 7399, pell: 37,
      require: ["High school grades", "Your school record", "A demonstration of skills", "An English test"], consider: ["Specific school subjects", "Recommendations", "SAT or ACT scores"],
      scores: { sat: "1110 to 1310", act: "23 to 29", sentSat: 27, sentAct: 2 }, finish4: 50, ratio: "17 to 1", programmeCount: 297,
      levels: [{ label: "Certificates", n: 81 }, { label: "Bachelor's", n: 92 }, { label: "Master's", n: 58 }, { label: "Doctorates", n: 16 }],
      programmes: [{ name: "Psychology", grads: 533, share: 9, pay: "$28,429" }, { name: "Business Administration", grads: 307, share: 5, pay: "$42,282" }, { name: "Biology", grads: 245, share: 4, pay: "$29,579" }, { name: "Criminal Justice", grads: 230, share: 4, pay: "$32,026" }, { name: "Computer and Information Sciences", grads: 135, share: 2, pay: "$54,859" }, { name: "Mechanical Engineering", grads: 109, share: 2, pay: "$60,540" }],
      gradStudents: 4926, fullTime: 17305, partTime: 3721, women: 50, men: 50,
      makeup: [{ label: "White", n: 9389, pct: 58 }, { label: "Hispanic or Latino", n: 2592, pct: 16 }, { label: "Black or African American", n: 1885, pct: 12 }, { label: "Asian", n: 999, pct: 6 }, { label: "Two or more races", n: 627, pct: 4 }],
      ways: ["Study abroad", "Undergraduate research", "ROTC (Army)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division III", students: 649, teams: ["Football", "Baseball", "Soccer", "Swimming", "Basketball", "Field Hockey", "Lacrosse", "Softball", "Volleyball", "Track and Field"] },
      pay6: 50705, debt: 20500, monthly: 217,
    },
  },
  {
    slug: "kean-university", name: "Kean University", city: "Union", ...nj,
    level: "Bachelor's degrees", control: "Public", setting: "Suburb", size: "Medium", undergrads: 11758,
    netPrice: 12447, finish: 58, retention: 76, repay: 58, gradsPerYear: 3150, admission: "more", admitRate: 76, applied: 13936, photo: true, mark: true, website: "https://www.kean.edu",
    detail: {
      address: "1000 Morris Avenue, Union, New Jersey", tuitionInState: 11859, tuitionOutState: 20006, fees: 2440, housing: true, housingCost: 18264,
      bands: [{ label: "Under $30,000", pay: 7374 }, { label: "$30,000 to $48,000", pay: 7859 }, { label: "$48,000 to $75,000", pay: 12136 }, { label: "$75,000 to $110,000", pay: 20146 }, { label: "Over $110,000", pay: 20110 }],
      scholarshipShare: 64, scholarshipAvg: 7048, pell: 63,
      require: ["High school grades", "Your school record", "Specific school subjects", "An English test", "A personal essay"], consider: ["Class rank", "Recommendations", "A demonstration of skills", "SAT or ACT scores", "Work experience"],
      scores: { sat: "930 to 1150", sentSat: 1 }, finish4: 25, ratio: "17 to 1", programmeCount: 115,
      levels: [{ label: "Bachelor's", n: 58 }, { label: "Master's", n: 39 }, { label: "Doctorates", n: 7 }],
      programmes: [{ name: "Psychology", grads: 378, share: 12, pay: "$30,347" }, { name: "Business Administration", grads: 272, share: 9, pay: "$38,680" }, { name: "Criminal Justice", grads: 191, share: 6, pay: "$33,573" }, { name: "Biology", grads: 183, share: 6, pay: "$34,115" }, { name: "Accounting", grads: 119, share: 4, pay: "$49,189" }, { name: "Computer and Information Sciences", grads: 89, share: 3, pay: "$61,311" }],
      gradStudents: 2147, fullTime: 11147, partTime: 2758, women: 61, men: 39,
      makeup: [{ label: "Hispanic or Latino", n: 4551, pct: 39 }, { label: "White", n: 2809, pct: 24 }, { label: "Black or African American", n: 2487, pct: 21 }, { label: "International", n: 709, pct: 6 }, { label: "Asian", n: 524, pct: 4 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Army, Navy, Air Force)", "Teacher training", "Programme for students with an intellectual disability"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division III", students: 535, teams: ["Football", "Lacrosse", "Baseball", "Soccer", "Volleyball", "Basketball", "Golf", "Field Hockey", "Softball", "Swimming", "Tennis", "Track and Field"] },
      pay6: 46603, debt: 23250, monthly: 246,
    },
  },

  // ---- South Dakota (the reference account's home state) ----
  {
    slug: "south-dakota-state-university", name: "South Dakota State University", city: "Brookings", ...sd,
    level: "Bachelor's degrees", control: "Public", setting: "Town", size: "Medium", undergrads: 10719,
    netPrice: 19841, finish: 57, retention: 84, repay: 80, gradsPerYear: 2594, admission: "grades", admitRate: 98, applied: 7287, photo: true, mark: true, website: "https://www.sdstate.edu",
    detail: {
      address: "1004 Campanile Ave, Brookings, South Dakota", partOf: "South Dakota Board of Regents", tuitionInState: 7773, tuitionOutState: 11283, fees: 1526, housing: true, housingCost: 5581, foodCost: 4474,
      bands: [{ label: "Under $30,000", pay: 14266 }, { label: "$30,000 to $48,000", pay: 15248 }, { label: "$48,000 to $75,000", pay: 18073 }, { label: "$75,000 to $110,000", pay: 20706 }, { label: "Over $110,000", pay: 21886 }],
      scholarshipShare: 92, scholarshipAvg: 3021, pell: 21,
      require: ["High school grades", "Class rank", "Your school record", "Specific school subjects", "An English test"], consider: ["Recommendations", "SAT or ACT scores", "A personal essay"],
      scores: { sat: "1060 to 1240", act: "19 to 25", sentSat: 2, sentAct: 75 }, finish4: 46, ratio: "17 to 1", programmeCount: 223,
      levels: [{ label: "Certificates", n: 28 }, { label: "Associate", n: 8 }, { label: "Bachelor's", n: 85 }, { label: "Master's", n: 48 }, { label: "Doctorates", n: 27 }],
      programmes: [{ name: "Registered Nursing", grads: 315, share: 12, pay: "$58,372" }, { name: "Business and Managerial Economics", grads: 153, share: 6, pay: "not published" }, { name: "Animal Sciences", grads: 76, share: 3, pay: "$40,797" }, { name: "Biomedical Sciences", grads: 76, share: 3, pay: "$27,268" }, { name: "Psychology", grads: 76, share: 3, pay: "$28,661" }, { name: "Mechanical Engineering", grads: 71, share: 3, pay: "$60,229" }, { name: "Early Childhood Education", grads: 58, share: 2, pay: "$35,069" }, { name: "Civil Engineering", grads: 52, share: 2, pay: "$58,268" }],
      gradStudents: 1337, fullTime: 8653, partTime: 3403, women: 56, men: 44,
      makeup: [{ label: "White", n: 8966, pct: 84 }, { label: "International", n: 400, pct: 4 }, { label: "Hispanic or Latino", n: 317, pct: 3 }, { label: "Two or more races", n: 245, pct: 2 }, { label: "Black or African American", n: 145, pct: 1 }, { label: "American Indian or Alaska Native", n: 117, pct: 1 }],
      ways: ["Study abroad", "Undergraduate research", "ROTC (Army, Air Force)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish"], notOffered: ["Childcare on campus"],
      sport: { league: "NCAA Division I-FCS", students: 714, teams: ["Football", "Basketball", "Track and Field", "Baseball", "Wrestling", "Swimming and Diving", "Golf", "Equestrian", "Soccer", "Softball", "Volleyball"] },
      pay6: 49564, debt: 23250, monthly: 246,
    },
  },
  {
    slug: "university-of-south-dakota", name: "University of South Dakota", city: "Vermillion", ...sd,
    level: "Bachelor's degrees", control: "Public", setting: "Town", size: "Medium", undergrads: 7619,
    netPrice: 19858, finish: 52, retention: 79, repay: 74, gradsPerYear: 2106, admission: "grades", admitRate: 99, applied: 5965, photo: true, mark: true, website: "https://www.usd.edu",
    detail: {
      address: "414 E Clark St, Vermillion, South Dakota", partOf: "South Dakota Board of Regents", tuitionInState: 7773, tuitionOutState: 11283, fees: 1659, housing: true, housingCost: 4890, foodCost: 4618,
      bands: [{ label: "Under $30,000", pay: 14921 }, { label: "$30,000 to $48,000", pay: 15942 }, { label: "$48,000 to $75,000", pay: 18540 }, { label: "$75,000 to $110,000", pay: 21202 }, { label: "Over $110,000", pay: 22193 }],
      scholarshipShare: 74, scholarshipAvg: 3836, pell: 25,
      require: ["Your school record", "Specific school subjects", "An English test"], consider: ["High school grades", "Class rank", "Recommendations", "SAT or ACT scores"],
      scores: { sat: "1125 to 1315", act: "19 to 25", sentSat: 4, sentAct: 62 }, finish4: 47, ratio: "16 to 1", programmeCount: 140,
      levels: [{ label: "Certificates", n: 15 }, { label: "Associate", n: 3 }, { label: "Bachelor's", n: 53 }, { label: "Master's", n: 36 }, { label: "Doctorates", n: 20 }],
      programmes: [{ name: "Registered Nursing", grads: 126, share: 6, pay: "$57,262" }, { name: "Business Administration", grads: 80, share: 4, pay: "$37,003" }, { name: "Health Sciences", grads: 73, share: 3, pay: "$36,775" }, { name: "Psychology", grads: 71, share: 3, pay: "$29,202" }, { name: "Accounting", grads: 56, share: 3, pay: "$43,992" }, { name: "Criminal Justice", grads: 42, share: 2, pay: "$35,109" }, { name: "Elementary Education", grads: 41, share: 2, pay: "$38,144" }],
      gradStudents: 3000, fullTime: 6509, partTime: 4110, women: 65, men: 35,
      makeup: [{ label: "White", n: 5900, pct: 77 }, { label: "Hispanic or Latino", n: 408, pct: 5 }, { label: "International", n: 408, pct: 5 }, { label: "Black or African American", n: 259, pct: 3 }, { label: "Two or more races", n: 223, pct: 3 }, { label: "American Indian or Alaska Native", n: 144, pct: 2 }],
      ways: ["Evening or weekend classes", "Study abroad", "Undergraduate research", "ROTC (Army)", "Teacher training"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division I-FCS", students: 607, teams: ["Football", "Basketball", "Track and Field", "Swimming and Diving", "Golf", "Soccer", "Softball", "Tennis", "Volleyball"] },
      pay6: 46290, debt: 23592, monthly: 250,
    },
  },
  {
    slug: "southeast-technical-college", name: "Southeast Technical College", city: "Sioux Falls", ...sd,
    level: "Associate degrees", control: "Public", setting: "City", size: "Small", undergrads: 2659,
    netPrice: 17400, finish: 60, retention: 70, repay: 66, gradsPerYear: 1006, admission: "open", admitRate: null, photo: false, mark: true, website: "https://www.southeasttech.edu",
    detail: {
      address: "2320 N Career Ave, Sioux Falls, South Dakota", partOf: "South Dakota Board of Technical Education", tuitionInState: 3720, tuitionOutState: 3720, fees: 3930, housing: false,
      bands: [{ label: "Under $30,000", pay: 14418 }, { label: "$30,000 to $48,000", pay: 15221 }, { label: "$48,000 to $75,000", pay: 17079 }, { label: "$75,000 to $110,000", pay: 19425 }, { label: "Over $110,000", pay: 20254 }],
      scholarshipShare: 40, scholarshipAvg: 2125, pell: 41, require: [], consider: [], ratio: "13 to 1", programmeCount: 71,
      levels: [{ label: "Certificates", n: 28 }, { label: "Associate", n: 43 }],
      programmes: [{ name: "Business", grads: 88, share: 9, pay: "$32,984" }, { name: "Registered Nursing", grads: 39, share: 4, pay: "$52,979" }, { name: "Cybersecurity", grads: 34, share: 3, pay: "$42,491" }, { name: "Surgical Technology", grads: 28, share: 3, pay: "$55,861" }, { name: "Electrician", grads: 27, share: 3, pay: "$39,136" }, { name: "Cardiovascular Technology", grads: 26, share: 3, pay: "$55,861" }, { name: "Automotive Technology", grads: 24, share: 2, pay: "$41,144" }],
      fullTime: 1322, partTime: 1337, women: 58, men: 42,
      makeup: [{ label: "White", n: 2144, pct: 81 }, { label: "Black or African American", n: 198, pct: 7 }, { label: "Two or more races", n: 119, pct: 4 }, { label: "Hispanic or Latino", n: 85, pct: 3 }],
      ways: ["Evening or weekend classes"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      pay6: 43427, debt: 12000, monthly: 127,
    },
  },
  {
    slug: "augustana-university", name: "Augustana University", city: "Sioux Falls", ...sd,
    level: "Bachelor's degrees", control: "Private", setting: "City", size: "Small", undergrads: 2003,
    netPrice: 23894, finish: 74, retention: 86, repay: 86, gradsPerYear: 504, admission: "grades", admitRate: 68, applied: 3017, flags: ["religious"], religion: "Lutheran", photo: true, mark: true, website: "https://www.augie.edu",
    detail: {
      address: "2001 S Summit Ave, Sioux Falls, South Dakota", tuitionInState: 39100, tuitionOutState: 39100, fees: 1060, housing: true, housingCost: 4296, foodCost: 5424,
      bands: [{ label: "Under $30,000", pay: 18746 }, { label: "$30,000 to $48,000", pay: 18895 }, { label: "$48,000 to $75,000", pay: 17937 }, { label: "$75,000 to $110,000", pay: 24787 }, { label: "Over $110,000", pay: 27327 }],
      scholarshipShare: 100, scholarshipAvg: 28439, pell: 22,
      require: ["High school grades", "Your school record", "An English test"], consider: ["Class rank", "Specific school subjects", "Recommendations", "SAT or ACT scores", "Work experience", "A personal essay"],
      scores: { sat: "1150 to 1370", act: "21 to 27", sentSat: 4, sentAct: 51 }, finish4: 56, ratio: "12 to 1", programmeCount: 71,
      levels: [{ label: "Bachelor's", n: 61 }, { label: "Master's", n: 8 }],
      programmes: [{ name: "Biology", grads: 47, share: 9, pay: "$25,995" }, { name: "Registered Nursing", grads: 42, share: 8, pay: "$60,050" }, { name: "Exercise Science", grads: 30, share: 6, pay: "not published" }, { name: "Business Administration", grads: 28, share: 6, pay: "$43,860" }, { name: "Psychology", grads: 25, share: 5, pay: "not published" }, { name: "Elementary Education", grads: 21, share: 4, pay: "$38,193" }],
      gradStudents: 387, fullTime: 2201, partTime: 189, women: 61, men: 39,
      makeup: [{ label: "White", n: 1457, pct: 73 }, { label: "International", n: 225, pct: 11 }, { label: "Black or African American", n: 101, pct: 5 }, { label: "Hispanic or Latino", n: 94, pct: 5 }],
      ways: ["Study abroad", "ROTC (Army, Air Force)", "Teacher training", "Programme for students with an intellectual disability"], helps: ["Careers advice", "Help finding work while you study", "Help finding a job when you finish", "Childcare on campus"],
      sport: { league: "NCAA Division II", students: 700, teams: ["Football", "Track and Field", "Baseball", "Wrestling", "Ice Hockey", "Swimming and Diving", "Basketball", "Golf", "Tennis", "Soccer", "Softball", "Volleyball"] },
      pay6: 49826, debt: 25000, monthly: 265, worth: "Every first-year student got a scholarship from the college, about $28,000 on average. The sticker price is high; hardly anyone pays it.",
    },
  },
  {
    slug: "oglala-lakota-college", name: "Oglala Lakota College", city: "Kyle", ...sd,
    level: "Bachelor's degrees", control: "Public", setting: "Countryside", size: "Small", undergrads: 1139,
    netPrice: 1895, finish: 16, retention: 62, repay: null, gradsPerYear: 212, admission: "open", admitRate: null, flags: ["tribal", "fewFinish"], photo: false, mark: true, website: "https://www.olc.edu",
    detail: {
      address: "490 Piya Wiconi Road, Kyle, South Dakota", tuitionInState: 2016, tuitionOutState: 2016, fees: 668, housing: true, housingCost: 1740,
      bands: [{ label: "Under $30,000", pay: 1422 }, { label: "$30,000 to $48,000", pay: 219 }, { label: "$48,000 to $75,000", pay: 5542 }, { label: "$75,000 to $110,000", pay: 6535 }],
      scholarshipShare: 84, scholarshipAvg: 2052, pell: 79, require: [], consider: [], finish4: 0, ratio: "10 to 1", programmeCount: 30,
      levels: [{ label: "Certificates", n: 1 }, { label: "Associate", n: 15 }, { label: "Bachelor's", n: 12 }, { label: "Master's", n: 2 }],
      programmes: [{ name: "Business Administration", grads: 29, share: 14, pay: "not published" }, { name: "Native American Studies", grads: 24, share: 11, pay: "not published" }, { name: "Tribal Law", grads: 19, share: 9, pay: "not published" }, { name: "Registered Nursing", grads: 17, share: 8, pay: "$51,074" }, { name: "Graphic Design", grads: 5, share: 2, pay: "not published" }],
      gradStudents: 49, fullTime: 436, partTime: 752, women: 70, men: 30,
      makeup: [{ label: "American Indian or Alaska Native", n: 1093, pct: 96 }, { label: "White", n: 23, pct: 2 }],
      ways: ["Undergraduate research", "Teacher training"], helps: ["Careers advice", "Help finding a job when you finish"], notOffered: ["Help finding work while you study", "Childcare on campus"],
      pay6: 20536, debt: null, worth: "Few students finish. Fewer than a quarter finish within six years. It is also one of the cheapest colleges anywhere: families earning under $48,000 paid about $1,400 a year or less.",
    },
  },
  {
    slug: "stewart-school", name: "Stewart School", city: "Sioux Falls", ...sd,
    level: "Certificates", control: "For profit", setting: "City", size: "Small", undergrads: 133,
    netPrice: 14221, finish: 88, retention: 88, repay: 64, gradsPerYear: 108, admission: "open", admitRate: null, flags: ["forProfit"], accreditor: "Accrediting Commission of Career Schools and Colleges", photo: false, mark: false, website: "https://www.stewartschool.edu",
    detail: {
      address: "604 N. West Ave., Sioux Falls, South Dakota", tuitionInState: null, tuitionOutState: null, fees: null, housing: false,
      bands: [{ label: "Under $30,000", pay: 11333 }, { label: "$30,000 to $48,000", pay: 11369 }, { label: "$48,000 to $75,000", pay: 15287 }, { label: "$75,000 to $110,000", pay: 18323 }, { label: "Over $110,000", pay: 18387 }],
      scholarshipShare: 16, scholarshipAvg: 129, pell: 41, require: [], consider: [], ratio: "13 to 1", programmeCount: 4,
      levels: [{ label: "Certificates", n: 4 }],
      programmes: [{ name: "Cosmetology", grads: 63, share: 58, pay: "$21,923" }, { name: "Esthetician and Skin Care", grads: 19, share: 18, pay: "$21,923" }, { name: "Nail Technician", grads: 17, share: 16, pay: "$21,923" }, { name: "Massage Therapy", grads: 9, share: 8, pay: "not published" }],
      fullTime: 133, partTime: 0, women: 99, men: 1,
      makeup: [{ label: "White", n: 114, pct: 86 }, { label: "Black or African American", n: 7, pct: 5 }, { label: "Two or more races", n: 5, pct: 4 }],
      ways: [], helps: ["Careers advice", "Help finding a job when you finish"], notOffered: ["Help finding work while you study", "Childcare on campus"],
      pay6: 28339, debt: 6864, monthly: 73, worth: "Run for profit. This college is a business with owners to pay, not a public or non-profit school. Most students finish, and most finish in under two years.",
    },
  },

  // ---- South Dakota, card level only (from the reference list page) ----
  { slug: "lake-area-technical-college", name: "Lake Area Technical College", city: "Watertown", ...sd, level: "Associate degrees", control: "Public", setting: "Town", size: "Small", undergrads: 2400, netPrice: 15979, finish: 73, retention: 81, repay: 76, gradsPerYear: 832, admission: "open", admitRate: null, photo: true, mark: true },
  { slug: "dakota-state-university", name: "Dakota State University", city: "Madison", ...sd, level: "Bachelor's degrees", control: "Public", setting: "Town", size: "Small", undergrads: 3300, netPrice: 21057, finish: 45, retention: 75, repay: 73, gradsPerYear: 661, admission: "grades", admitRate: 95, photo: false, mark: true },
  { slug: "mitchell-technical-college", name: "Mitchell Technical College", city: "Mitchell", ...sd, level: "Associate degrees", control: "Public", setting: "Town", size: "Small", undergrads: 1300, netPrice: 13460, finish: 73, retention: 85, repay: 70, gradsPerYear: 522, admission: "open", admitRate: null, photo: false, mark: false },
  { slug: "south-dakota-school-of-mines-and-technology", name: "South Dakota School of Mines and Technology", city: "Rapid City", ...sd, level: "Bachelor's degrees", control: "Public", setting: "City", size: "Small", undergrads: 2400, netPrice: 20183, finish: 58, retention: 84, repay: 82, gradsPerYear: 502, admission: "grades", admitRate: 90, photo: true, mark: true },
  { slug: "black-hills-state-university", name: "Black Hills State University", city: "Spearfish", ...sd, level: "Bachelor's degrees", control: "Public", setting: "Town", size: "Small", undergrads: 3200, netPrice: 15911, finish: 42, retention: 72, repay: 69, gradsPerYear: 459, admission: "grades", admitRate: 96, photo: true, mark: true },
  { slug: "university-of-sioux-falls", name: "University of Sioux Falls", city: "Sioux Falls", ...sd, level: "Bachelor's degrees", control: "Private", setting: "City", size: "Small", undergrads: 1400, netPrice: 21383, finish: 62, retention: 74, repay: 78, gradsPerYear: 423, admission: "grades", admitRate: 92, flags: ["religious"], religion: "Christian", photo: true, mark: true },
  { slug: "northern-state-university", name: "Northern State University", city: "Aberdeen", ...sd, level: "Bachelor's degrees", control: "Public", setting: "Town", size: "Small", undergrads: 3100, netPrice: 15812, finish: 50, retention: 77, repay: 71, gradsPerYear: 368, admission: "grades", admitRate: 90, photo: false, mark: true },
  { slug: "western-dakota-technical-college", name: "Western Dakota Technical College", city: "Rapid City", ...sd, level: "Associate degrees", control: "Public", setting: "City", size: "Small", undergrads: 1200, netPrice: 12670, finish: 46, retention: 67, repay: 54, gradsPerYear: 327, admission: "open", admitRate: null, photo: false, mark: true },
  { slug: "mount-marty-university", name: "Mount Marty University", city: "Yankton", ...sd, level: "Bachelor's degrees", control: "Private", setting: "Town", size: "Small", undergrads: 1200, netPrice: 22227, finish: 53, retention: 68, repay: 71, gradsPerYear: 235, admission: "grades", admitRate: 80, flags: ["religious"], religion: "Catholic", photo: false, mark: false },
  { slug: "kairos-university", name: "Kairos University", city: "Sioux Falls", ...sd, level: "Bachelor's degrees", control: "Private", setting: "City", size: "Small", undergrads: 500, netPrice: null, finish: null, retention: null, repay: null, gradsPerYear: 231, admission: "grades", admitRate: null, flags: ["religious"], religion: "Christian", accreditor: "Association of Theological Schools", photo: true, mark: true },
  { slug: "dakota-wesleyan-university", name: "Dakota Wesleyan University", city: "Mitchell", ...sd, level: "Bachelor's degrees", control: "Private", setting: "Town", size: "Small", undergrads: 900, netPrice: 19735, finish: 59, retention: 75, repay: 72, gradsPerYear: 225, admission: "grades", admitRate: 75, flags: ["religious"], religion: "Methodist", photo: true, mark: true },
  { slug: "sinte-gleska-university", name: "Sinte Gleska University", city: "Mission", ...sd, level: "Bachelor's degrees", control: "Public", setting: "Countryside", size: "Small", undergrads: 500, netPrice: 12768, finish: 7, retention: 100, repay: null, gradsPerYear: 81, admission: "open", admitRate: null, flags: ["tribal", "fewFinish"], photo: false, mark: true },
  { slug: "paul-mitchell-the-school-rapid-city", name: "Paul Mitchell the School Rapid City", city: "Rapid City", ...sd, level: "Certificates", control: "For profit", setting: "City", size: "Small", undergrads: 120, netPrice: 19694, finish: 88, retention: 80, repay: 58, gradsPerYear: 54, admission: "open", admitRate: null, flags: ["forProfit"], accreditor: "National Accrediting Commission of Career Arts and Sciences", photo: false, mark: false },
  { slug: "sisseton-wahpeton-college", name: "Sisseton Wahpeton College", city: "Sisseton", ...sd, level: "Bachelor's degrees", control: "Public", setting: "Countryside", size: "Small", undergrads: 200, netPrice: 2977, finish: 17, retention: null, repay: null, gradsPerYear: 52, admission: "open", admitRate: null, flags: ["tribal", "fewFinish"], photo: false, mark: true },
];

export function collegeBySlug(slug: string): College | undefined {
  return COLLEGES.find((c) => c.slug === slug);
}

export function collegeImage(c: College): string | null {
  return c.photo ? `/images/colleges/${c.slug}.webp` : null;
}
export function collegeMark(c: College): string | null {
  return c.mark ? `/images/colleges/${c.slug}-mark.webp` : null;
}

/** Plain words for the card tags. */
export const LEVEL_WORD: Record<Level, string> = { "Certificates": "Trade school", "Associate degrees": "2-year", "Bachelor's degrees": "4-year" };
export const CONTROL_WORD: Record<Control, string> = { Public: "Public", Private: "Private", "For profit": "For profit" };
export const ADMISSION_WORD: Record<Admission, string> = { open: "Everyone gets in", grades: "Grades and transcript", more: "Essay or letters too", portfolio: "Portfolio or audition" };

export const STATES = [...new Set(COLLEGES.map((c) => c.state))].map((s) => ({ code: s, name: COLLEGES.find((c) => c.state === s)!.stateName, n: COLLEGES.filter((c) => c.state === s).length }));

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n));
