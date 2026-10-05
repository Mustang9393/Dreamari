// The picture on each opportunity poster (6 Oct 2026). Chandu turned down
// the providers' own share images ("I'm not happy with the selection of
// images and now the fallbacks too are bad"), so every poster uses the
// app's own career photography, the same portraits Explore's posters use:
// one look across the app, every card a person, no logos or banners.
//
// Each opportunity is matched by hand to the career it is most about (a
// welding scholarship shows a welder, a radar program an electronics
// technician, a museum internship a curator). Scholarships open to any
// field are about getting to college, so they take a college-life portrait
// (a student studying, an advisor, a campus) instead of a job, rotated so
// one shelf never shows the same picture twice. Nothing here claims the
// person pictured is in the program; it is the career the opportunity
// leads toward.

import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import type { Item } from "./types";

const ABOUT: Record<string, string> = {
  // scholarships tied to a field or a trade
  "doodle-for-google": "Graphic Designer",
  "davidson-fellows": "Physicist",
  "mikeroweworks-work-ethic-scholarship": "Iron Worker",
  "vfw-voice-of-democracy": "Broadcast Technician",
  "regeneron-science-talent-search": "Molecular Biologist",
  "nj-governors-industry-vocations-scholarship": "Electrician",
  "scholastic-art-and-writing-awards": "Art Director",
  "skillsusa-red-wing-build-the-future": "Carpenter",
  "nths-byf-construction-craft-scholarship": "Construction Foreman",
  "cameron-impact-scholarship": "Community Health Worker",
  "amazon-future-engineer-scholarship": "Cloud Systems Engineer",
  "taco-bell-live-mas-scholarship": "Film and Video Editor",
  "horatio-alger-career-technical-scholarship": "Auto Mechanic",
  "nsa-stokes-educational-scholarship": "Cyber Security",
  "louis-bay-2nd-future-municipal-leaders-scholarship": "Urban Planner",
  "njsiaa-scholar-athlete-award": "Professional Athlete",
  "pwc-nj-scholarship": "Construction Manager",
  "nys-stem-incentive-program": "Civil Engineer",
  "afsa-national-high-school-essay-contest": "Intelligence Analyst",
  "optimist-international-essay-contest": "Writer or Copywriter",
  "ayn-rand-institute-essay-contests": "Librarian",
  "gloria-barron-prize-for-young-heroes": "Conservation Scientist",
  "stephen-j-brady-stop-hunger-scholarship": "Human Services Assistant",
  "bow-seat-ocean-awareness-contest": "Wildlife Biologist",
  "imagine-america-high-school-scholarship": "HVAC Technician",
  "aws-foundation-welding-scholarships": "Welder",
  "aopa-high-school-flight-training-scholarship": "Commercial Pilot",
  "nsbe-high-school-senior-scholarships": "Electrical Engineer",
  "shpe-scholarshpe-high-school-seniors": "Industrial Engineering Technician",
  "united-states-senate-youth-program": "Judicial Law Clerk",
  "diller-teen-tikkun-olam-awards": "Social Worker",
  "techforce-foundation-scholarships": "Diesel Mechanic",
  "phcc-educational-foundation-scholarship": "Plumber",
  "national-ffa-scholarships": "Farmer or Rancher",
  "air-force-rotc-high-school-scholarship": "Airline Pilot",
  "actuarial-foundation-stem-stars": "Statistician",
  "asme-high-school-scholarships": "Mechanical Engineer",
  "american-legion-oratorical-contest": "Hearing Officer",
  // programs
  "nj-gset-rutgers": "Architectural & Engineering Manager",
  "simons-summer-research-stony-brook": "Microbiologist",
  "summer-science-program-ssp": "Astronomer",
  "wharton-leadership-in-the-business-world": "Management Consultant",
  "njit-stemx-high-school": "Electronics Engineering Technician",
  "nj-governors-stem-scholars": "Medical Scientist",
  "youngarts-national-arts-competition": "Dancer",
  "congressional-app-challenge": "Game Programmer",
  "conrad-challenge": "Aerospace Engineer",
  "research-science-institute-rsi": "Molecular Biologist",
  "bezos-scholars-program": "Event Director",
  "princeton-prize-in-race-relations": "Community Program Manager",
  "mit-mites-summer": "AI and Machine Learning Engineer",
  "mit-mites-semester": "Data Scientist",
  "carnegie-mellon-sams": "Mathematician",
  "launchx-entrepreneurship": "Entrepreneur",
  "nj-scholars-program": "Subject Teacher or Professor",
  "nj-governors-school-sciences-drew": "Environmental Scientist",
  "princeton-summer-journalism-program": "Journalist",
  "hoby-state-leadership-seminar": "Dean of Students",
  "first-robotics-competition": "Robotics Technician",
  "skillsusa-championships": "Machinist",
  "girls-who-code-pathways": "Software Engineer",
  "kode-with-klossy-camp": "Web Developer",
  "stevens-pre-college-summer": "Biomedical Engineer",
  "wharton-global-high-school-investment-competition": "Asset Manager",
  "wharton-essentials-of-finance": "Investment Banking",
  "ny-fed-high-school-fed-challenge": "Economist",
  "cee-national-economics-challenge": "Market Research Analyst",
  "deca-finance-competitive-events": "Financial Advisor",
  "diamond-challenge": "Marketing Manager",
  "sifma-investwrite": "Stockbroker",
  "nyu-tandon-arise": "Biomedical Engineer",
  "whitney-youth-insights-artists": "Museum Curator",
  "studio-museum-expanding-the-walls": "Photographer",
  "cooper-union-saturday-program": "Architect",
  "columbia-science-honors-program": "Chemist",
  "rockefeller-ssrp": "Geneticist",
  "all-star-code-summer-intensive": "Computer Programmer",
  "american-legion-jersey-boys-state": "Lawyer",
  "ala-jersey-girls-state": "Judge",
  "cmsru-medacademy": "Family Doctor",
  "njms-smart-summer": "Medical Scientist",
  "nj-hosa-state-leadership-conference": "EMT",
  "nj-history-day": "Historian",
  "princeton-ten-minute-play-contest": "Actor",
  "us-senate-youth-program": "Judicial Law Clerk",
  "ncwit-aic-high-school-award": "Software Engineer",
  "technovation-girls": "UI/UX Designer",
  "usaco": "Computer Programmer",
  "nsli-y": "Interpreter or Translator",
  "cbyx-high-school": "Tour Guide",
  "modeling-the-future-challenge": "Quant",
  "mathworks-m3-challenge": "Data Analyst",
  "clark-scholars-ttu": "Bioinformatics Scientist",
  "mit-think-scholars": "AI and Machine Learning Engineer",
  "mit-beaver-works-summer-institute": "Drone Pilot",
  "cdc-disease-detective-camp": "Epidemiologist",
  "congressional-award": "Park Ranger or Naturalist",
  "doe-national-science-bowl": "Geoscientist",
  "cspan-studentcam": "Film Director",
  "afsa-high-school-essay-contest": "Intelligence Analyst",
  "american-rocketry-challenge": "Aerospace Engineer",
  "nfte-world-series-of-innovation": "Entrepreneur",
  "mit-llrise": "Electronics Engineering Technician",
  "nyas-junior-academy": "Biologist",
  // internships and apprenticeships
  "princeton-laboratory-learning-program": "Chemist",
  "smithsonian-nmnh-high-school-internship": "Anthropologist or Archaeologist",
  "nih-summer-internship-program-hs-seniors": "Geneticist",
  "lsc-partners-in-science": "Biologist",
  "apprenticeship-gov-youth-finder": "Electrician",
  "microsoft-discovery-program": "Software Engineer",
  "nyc-ladders-for-leaders": "Project Manager",
  "nist-ship": "Physicist",
  "msk-summer-student-program": "Medical Scientist",
  "amnh-srmp": "Anthropologist or Archaeologist",
  "nyc-syep": "Retail Sales Associate",
  "met-high-school-internship": "Museum Curator",
  "princeton-nj-syep": "Office Clerk",
  "newark-syep": "Customer Service Representative",
  "hmsom-minds": "Surgeon",
  "nsa-high-school-work-study": "Ethical Hacker",
  "lockheed-martin-space-hs-internship": "Aerospace Engineer",
  "jhu-apl-aspire": "Systems Analyst",
  "atlantic-health-morristown-summer-junior-volunteer": "Registered Nurse",
  "hmh-high-school-career-explorer": "Physician Assistant",
  "aeop-high-school-internships": "Biomedical Engineer",
  "northrop-grumman-hip": "Aircraft Assembler",
  "futures-and-options-internship-program": "Marketing Manager",
  "bnl-high-school-research-program": "Physicist",
  "cshl-partners-for-the-future": "Geneticist",
  "bbg-garden-apprentice-program": "Soil and Plant Scientist",
  "wcs-project-true": "Wildlife Biologist",
  "brooklyn-museum-apprentice-program": "Museum Curator",
  "mount-sinai-ceye-summer": "Nurse Practitioner",
  "manhattan-da-high-school-internship": "Detective",
  "construction-skills-youth-program": "Construction Laborer",
  "careerwise-new-york": "IT Project Manager",
  "genesys-works": "Data Center Technician",
  "newark-museum-explorers": "Astronomer",
  "us-senate-page-program": "Paralegal",
  "navy-seap": "Mechanical Engineer",
  "post-o-jpm-abp": "Private Equity",
  "post-o-google-tx": "Software Engineer",
  "post-o-gs-possibilities": "Investment Banking",
  "post-o-ms-early-insights": "Stockbroker",
  "post-o-amazon-fe": "Cloud Systems Engineer",
  "post-o-ey-discover": "Accountant",
};

/** College life, for scholarships open to any field: students studying, an
 *  advisor, a dean on a campus lawn. Chosen by eye from the catalog. */
const COLLEGE_LIFE = ["College Dean", "Tutor", "Instructional Designer", "Admissions Officer", "Library Assistant", "Academic Advisor", "Teaching Assistant", "Librarian", "Subject Teacher or Professor"];

const PHOTO = new Map(ALL_CATALOG_CAREERS.map((c) => [c.title, c.photo]));
const photoOf = (title: string) => PHOTO.get(title) ?? null;
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** The career a poster shows, by the opportunity's field when it was not
 *  matched by hand (a partner post added later, say). */
const FIELD_FALLBACK: Record<string, string> = {
  "Tech & Engineering": "Software Engineer", "Business & Finance": "Financial Advisor", "Health & Medicine": "Registered Nurse",
  "Science & Research": "Biologist", "Arts & Media": "Graphic Designer", "Public Service & Law": "Lawyer", "Skilled Trades": "Electrician",
};

/** The pictures for one row of posters: matched ones as matched, the
 *  any-field ones rotated through college life so the row never repeats a
 *  picture it can avoid. */
export function postersArt(items: Item[]): Map<string, string> {
  const out = new Map<string, string>();
  const used = new Set<string>();
  const pending: Item[] = [];
  for (const item of items) {
    const field = item.fields.find((f) => f !== "Any");
    const title = ABOUT[item.id] ?? (field ? FIELD_FALLBACK[field] : undefined);
    const src = title ? photoOf(title) : null;
    if (src) { out.set(item.id, src); used.add(src); } else pending.push(item);
  }
  for (const item of pending) {
    const start = hash(item.id) % COLLEGE_LIFE.length;
    let src: string | null = null;
    for (let k = 0; k < COLLEGE_LIFE.length && !src; k++) {
      const cand = photoOf(COLLEGE_LIFE[(start + k) % COLLEGE_LIFE.length]);
      if (cand && !used.has(cand)) src = cand;
    }
    src ??= photoOf(COLLEGE_LIFE[start]);
    if (src) { out.set(item.id, src); used.add(src); }
  }
  return out;
}
