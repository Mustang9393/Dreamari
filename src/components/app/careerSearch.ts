// Career search for Explore > Browse, Netflix-shaped: type anything, get a
// ranked grid, plus "related" chips built from what the results have in
// common. Fuzzy on purpose: a student types "finanace", "coding", "planes"
// or "hospital" and still lands somewhere sensible. No new dependencies; a
// small scorer over title words, world words and a hand-written keyword
// index (the Figma catalog carries titles and worlds only).

import { ALL_CATALOG_CAREERS, type CatalogCareer } from "./catalog";

/** Plain words a student might type for each world. */
const WORLD_KEYWORDS: Record<string, string[]> = {
  "Business & Finance": ["business", "finance", "money", "banking", "bank", "investing", "investment", "stocks", "wall street", "corporate", "office", "management", "analyst", "deals", "economics"],
  "Tech & Engineering": ["tech", "technology", "engineering", "computers", "coding", "code", "programming", "software", "developer", "apps", "ai", "data", "internet", "startup"],
  "Health & Medicine": ["health", "medicine", "medical", "doctor", "hospital", "patients", "nurse", "healthcare", "surgery", "clinic", "biology", "science"],
  "Farming, Animals & Nature": ["farming", "farm", "animals", "nature", "outdoors", "food", "agriculture", "plants", "environment", "science"],
  "Building & Construction": ["building", "construction", "trades", "hands-on", "tools", "site", "houses", "electrical", "skilled trade"],
  "Driving, Flying & Shipping": ["driving", "flying", "shipping", "planes", "airport", "aviation", "transport", "travel", "logistics", "trucks", "drones"],
  "Arts, Media & Sport": ["arts", "art", "media", "sport", "sports", "creative", "design", "music", "film", "animation", "entertainment", "studio", "games"],
  "Counseling & Social Work": ["counseling", "counselling", "social work", "helping people", "mental health", "students", "school", "therapy", "psychology"],
  "Law, Safety & Justice": ["law", "legal", "justice", "court", "safety", "police", "rights", "argue", "debate"],
  "Personal Care & Community Services": ["personal care", "beauty", "community", "salon", "people", "service"],
  "Factories & Making Things": ["factory", "making", "maker", "manufacturing", "craft", "design", "materials"],
};

/** Words a student might type for a specific career. */
const TITLE_KEYWORDS: Record<string, string[]> = {
  "Investment Banking": ["ib", "banker", "mergers", "ipo", "deals", "wall street", "goldman", "jpmorgan", "high pay", "excel"],
  "Private Equity": ["pe", "buyouts", "funds", "investing", "deals", "high pay"],
  "Asset Manager": ["portfolio", "funds", "investing", "wealth", "stocks"],
  "Quant": ["math", "statistics", "trading", "algorithms", "models", "hedge fund", "coding"],
  "Accountant": ["accounting", "taxes", "cpa", "numbers", "audit", "spreadsheets"],
  "Management Analyst": ["consulting", "consultant", "strategy", "mckinsey", "problem solving"],
  "HR Manager": ["human resources", "hiring", "recruiting", "people", "workplace"],
  "Public Relations Manager": ["pr", "communications", "media", "brand", "writing", "marketing"],
  "Purchasing Manager": ["procurement", "buying", "supply chain", "negotiation"],
  "Administrative Assistant": ["admin", "office", "organizing", "scheduling"],
  "Software Engineer": ["swe", "coding", "programmer", "developer", "apps", "google", "python", "javascript"],
  "Data Scientist": ["data", "statistics", "machine learning", "ai", "python", "analytics", "math"],
  "Cyber Security": ["cybersecurity", "hacking", "hacker", "security", "privacy", "networks", "ethical hacking"],
  "UI/UX Designer": ["ux", "ui", "design", "figma", "product design", "apps", "user experience"],
  "Video Game Designer": ["games", "gaming", "video games", "level design", "unity", "unreal"],
  "Game Designer": ["games", "gaming", "video games", "level design", "play"],
  "Database Architect": ["databases", "sql", "data", "systems", "backend"],
  "Registered Nurse": ["rn", "nursing", "hospital", "patients", "care", "scrubs"],
  "Nurse Anesthetist": ["crna", "anesthesia", "nursing", "surgery", "high pay"],
  "Emergency Medicine Doctor": ["er", "emergency room", "trauma", "physician", "md"],
  "Sports Medicine Doctor": ["athletes", "sports", "injuries", "physician", "team doctor"],
  "Pediatric Surgeon": ["kids", "children", "surgery", "surgeon", "physician"],
  "Cardiologist": ["heart", "cardiology", "physician", "md"],
  "Therapist": ["mental health", "counseling", "psychology", "talk", "helping people"],
  "School Counselor": ["guidance", "students", "college applications", "school", "helping"],
  "Airline Pilot": ["planes", "pilot", "flying", "aviation", "cockpit", "travel", "captain"],
  "Drone Pilot": ["drones", "uav", "flying", "cameras", "remote"],
  "Air Traffic Controller": ["atc", "airport", "planes", "radar", "aviation"],
  "Truck Driver": ["trucks", "trucking", "cdl", "driving", "roads", "freight", "logistics"],
  "Forklift Operator": ["warehouse", "logistics", "driving", "shipping"],
  "Electrician": ["wiring", "electrical", "trades", "apprenticeship", "hands-on"],
  "Roofer": ["roofing", "construction", "trades", "outdoors", "hands-on"],
  "Sheet Metal Worker": ["metal", "fabrication", "trades", "hvac", "hands-on"],
  "Food Scientist": ["food", "nutrition", "lab", "chemistry", "recipes", "science"],
  "Farm & Ranch Manager": ["farming", "ranch", "cattle", "land", "agriculture", "outdoors"],
  "Agricultural Technician": ["agriculture", "farming", "crops", "soil", "lab"],
  "Forestry Technician": ["forest", "trees", "outdoors", "parks", "nature", "wildlife"],
  "Veterinarian": ["vet", "animals", "pets", "dogs", "cats", "animal doctor"],
  "Animator": ["animation", "cartoons", "pixar", "drawing", "3d", "film", "art", "disney"],
  "Art Director": ["art", "design", "creative", "advertising", "campaigns", "visual", "agency", "branding", "nike"],
  "Film Director": ["film", "movies", "directing", "cinema", "hollywood", "storytelling", "camera", "tv", "netflix"],
  "Journalist": ["journalism", "news", "writing", "reporter", "media", "stories", "interviews", "tv", "newspaper"],
  "Lighting Technician": ["stage", "concerts", "theater", "lights", "film", "live events"],
  "Photographer": ["photos", "camera", "photography", "portraits", "instagram", "shoots"],
  "Plumber": ["pipes", "water", "bathrooms", "trade", "plumbing"],
  "Welder": ["welding", "metal", "torch", "fabrication", "trade"],
  "Carpenter": ["wood", "framing", "building", "furniture", "trade"],
  "Auto Mechanic": ["cars", "engines", "garage", "repair", "trucks"],
  "X-Ray Technologist": ["xray", "xrays", "scans", "imaging", "hospital", "radiology"],
  "EMT": ["ambulance", "emergency", "911", "paramedic", "rescue", "first responder"],
  "Dental Hygienist": ["teeth", "dentist", "cleaning", "smile"],
  "Barber": ["hair", "haircuts", "fades", "shop", "grooming"],
  "Esthetician": ["skincare", "facials", "beauty", "salon", "spa"],
  "Makeup Artist": ["makeup", "beauty", "glam", "film", "weddings"],
  "Nail Technician": ["nails", "manicure", "beauty", "salon"],
  "Real Estate Agent": ["houses", "homes", "property", "selling", "listings"],
  "Police Officer": ["law enforcement", "police", "safety", "patrol", "community"],
  "Firefighter": ["fire", "rescue", "emergency", "trucks", "hero"],
  "Paralegal": ["law", "legal", "lawyer", "court", "research"],
  "HVAC Technician": ["heating", "cooling", "air conditioning", "ac", "trade"],
  "Graphic Designer": ["design", "logos", "posters", "figma", "illustrator", "branding", "visual"],
  "Musician or Singer": ["music", "singing", "band", "songs", "concerts", "spotify", "performing"],
  "Dancer": ["dancing", "dance", "performing", "stage", "choreography"],
  "Choreographer": ["dance", "dancing", "routines", "stage", "music videos"],
  "Actor": ["acting", "theater", "film", "tv", "stage", "auditions", "hollywood"],
  "Fashion Designer": ["fashion", "clothes", "style", "sketching", "runway", "sewing"],
  "Film and Video Editor": ["editing", "video", "youtube", "premiere", "film", "cuts"],
  "Game Producer": ["games", "gaming", "video games", "studio", "shipping games"],
  "Interior Designer": ["design", "spaces", "rooms", "architecture", "decor"],
  "Set Designer": ["theater", "film", "stage", "sets", "building"],
  "Writer or Copywriter": ["writing", "words", "stories", "ads", "blog", "author"],
  "Professional Athlete": ["sports", "athlete", "team", "training", "competition", "nba", "nfl"],
  "Coach or Scout": ["sports", "team", "training", "recruiting", "athletes"],
  "Broadcast Technician": ["tv", "radio", "live", "studio", "equipment"],
  "Audio and Video Technician": ["av", "events", "sound", "video", "live"],
  "Public Relations Specialist": ["pr", "communications", "media", "press", "writing"],
  "Visual Merchandiser": ["retail", "displays", "fashion", "stores", "design"],
  "Floral Designer": ["flowers", "design", "weddings", "events"],
  "Interpreter or Translator": ["languages", "spanish", "translation", "bilingual"],
  "Sound Engineering Technician": ["audio", "music", "studio", "recording", "concerts", "mixing"],
  "Lawyer": ["law", "attorney", "court", "law school", "justice", "argue"],
  "Hairstylist": ["hair", "salon", "beauty", "barber", "styling"],
  "Jewelry Designer": ["jewelry", "jewellery", "design", "craft", "fashion", "metal"],
};

// arts-leaning for the arts-focused demo (18 Sept 2026)
export const TOP_SEARCHES = ["Animator", "Film Director", "Journalist", "Art Director", "Game Designer", "Investment Banking", "Software Engineer", "Registered Nurse"];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9& ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (s: string) => norm(s).split(" ").filter((w) => w && w !== "&");

/** Levenshtein distance, capped: we only care about 0, 1, 2. */
function distance(a: string, b: string, cap = 2): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    let rowMin = prev[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
      rowMin = Math.min(rowMin, prev[j]);
    }
    if (rowMin > cap) return cap + 1;
  }
  return prev[b.length];
}

type Indexed = { career: CatalogCareer; titleWords: string[]; worldWords: string[]; ownKeywords: string[]; worldKeywords: string[]; keywords: string[]; /** a word's position in the career's own keyword list, earlier is more central */ rank: Map<string, number> };
const INDEX: Indexed[] = ALL_CATALOG_CAREERS.map((career) => {
  const titleWords = words(career.title);
  const worldWords = words(career.world);
  const raw = TITLE_KEYWORDS[career.title] ?? [];
  const ownKeywords = raw.flatMap(words);
  const worldKeywords = (WORLD_KEYWORDS[career.world] ?? []).flatMap(words);
  const rank = new Map<string, number>();
  raw.forEach((k, i) => { for (const w of words(k)) if (!rank.has(w)) rank.set(w, i); });
  return { career, titleWords, worldWords, ownKeywords, worldKeywords, keywords: [...new Set([...ownKeywords, ...worldKeywords])], rank };
});

function scoreToken(token: string, item: Indexed): number {
  let best = 0;
  const consider = (candidates: string[], exact: number, starts: number, contains: number) => {
    for (const w of candidates) {
      if (w === token) best = Math.max(best, exact);
      else if (w.startsWith(token)) best = Math.max(best, starts);
      // five letters before a word counts by containing the token, so
      // "real" never lights up "unreal"
      else if (token.length >= 5 && w.includes(token)) best = Math.max(best, contains);
    }
  };
  // the career's own words beat its world's, so "planes" ranks pilots
  // above truck drivers even though both live in Driving, Flying & Shipping
  consider(item.titleWords, 100, 85, 60);
  consider(item.ownKeywords, 80, 65, 50);
  // a career's first keywords are what it is about: "coding" is Software
  // Engineer before Quant, "planes" is Airline Pilot before Air Traffic Controller
  if (best === 80) best += Math.max(0, 4 - (item.rank.get(token) ?? 4));
  consider(item.worldKeywords, 55, 45, 35);
  consider(item.worldWords, 50, 40, 30);
  if (best >= 60) return best;
  // word forms: "plumbing" finds Plumber, "welding" finds Welder. Five
  // shared leading letters on words of at least six, so "drawing" and
  // "driving" (three shared) stay apart
  if (token.length >= 6) {
    const stem = token.slice(0, 5);
    for (const w of item.titleWords) if (w.length >= 6 && w.startsWith(stem)) best = Math.max(best, 78);
    for (const w of item.ownKeywords) if (w.length >= 6 && w.startsWith(stem)) best = Math.max(best, 58);
  }
  if (best >= 58) return best;
  // typo tolerance, kept tight so "drawing" never becomes "driving": one
  // edit from five letters, two from eight; only against title words and
  // keywords, never the world name
  if (token.length >= 5) {
    const cap = token.length >= 8 ? 2 : 1;
    for (const w of [...item.titleWords, ...item.keywords]) {
      if (w.length < 5) continue;
      const d = distance(token, w, cap);
      if (d > cap) continue;
      const inTitle = item.titleWords.includes(w);
      best = Math.max(best, d === 1 ? (inTitle ? 75 : 45) : (inTitle ? 55 : 30));
    }
  }
  return best;
}

export type SearchHit = { career: CatalogCareer; score: number };

/** Ranked hits for a query; empty query returns nothing. */
export function searchCareers(query: string, world = "All"): SearchHit[] {
  const tokens = words(query);
  if (tokens.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const item of INDEX) {
    if (world !== "All" && item.career.world !== world) continue;
    let total = 0;
    let matched = 0;
    for (const t of tokens) {
      const s = scoreToken(t, item);
      if (s > 0) { total += s; matched += 1; }
    }
    if (matched === 0) continue;
    // whole-phrase bonus: "investment banking" typed in full
    if (norm(item.career.title).includes(norm(query))) total += 60;
    // every word matched beats a partial match
    total += matched === tokens.length ? 20 : 0;
    hits.push({ career: item.career, score: total });
  }
  return hits.sort((a, b) => b.score - a.score || a.career.title.localeCompare(b.career.title));
}

/** Netflix's "Explore titles related to": the words the top results share,
 *  minus what was typed. Worlds first, then keywords. */
export function relatedTerms(query: string, hits: SearchHit[], limit = 5): string[] {
  const typed = new Set(words(query));
  const top = hits.slice(0, 8);
  const count = new Map<string, number>();
  for (const h of top) {
    count.set(h.career.world, (count.get(h.career.world) ?? 0) + 3);
    for (const k of TITLE_KEYWORDS[h.career.title] ?? []) {
      if (words(k).some((w) => typed.has(w))) continue;
      if (k.length < 3) continue;
      count.set(k, (count.get(k) ?? 0) + 1);
    }
  }
  return [...count.entries()]
    .filter(([term]) => !typed.has(norm(term)) && norm(term) !== norm(query))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term]) => term.replace(/\b\w/g, (c) => c.toUpperCase()));
}
