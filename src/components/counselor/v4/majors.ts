// Saved majors (College & Career, 9 Oct 2026: Maisha's image adds a "Top
// Saved Majors" row of major cards in the career-poster style, "12 saved",
// NURSING, HEALTH & MEDICINE).
//
// DEMO-ONLY: the student app has no "save a major" action yet and the demo
// roster stores no majors, so each student's saved majors are seeded from
// the worlds of the careers they saved (counselorV5.ts) and their own
// interest world: one or two majors from those worlds, picked by a steady
// hash so the same student always shows the same majors. The catalog of
// majors per world is a small hand list; production reads the student's
// real saves (and the school catalog's programme names) instead.

import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { careerById, toV5 } from "@/lib/counselorV5";
import { seedHash } from "@/lib/localRecord";

export const MAJORS_BY_WORLD: Record<string, string[]> = {
  "Health & Medicine": ["Nursing", "Biology", "Public Health", "Kinesiology"],
  "Tech & Engineering": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Information Technology"],
  "Business & Finance": ["Business Administration", "Finance", "Accounting", "Marketing"],
  "Arts, Media & Sport": ["Communications", "Graphic Design", "Film & Media", "Sports Management"],
  "Science & Research": ["Chemistry", "Environmental Science", "Physics", "Data Science"],
  "Teaching & Education": ["Elementary Education", "Secondary Education", "Special Education"],
  "Building & Construction": ["Construction Management", "Civil Engineering", "Architecture"],
  "Law, Safety & Justice": ["Criminal Justice", "Political Science", "Pre-Law"],
  "Food & Cooking": ["Culinary Arts", "Hospitality Management", "Nutrition"],
  "Farming, Animals & Nature": ["Animal Science", "Agriculture", "Environmental Science"],
  "Counseling & Social Work": ["Psychology", "Social Work", "Sociology"],
  "Driving, Flying & Shipping": ["Aviation", "Logistics & Supply Chain"],
  "Factories & Making Things": ["Industrial Engineering", "Manufacturing Technology"],
  "Fixing Machines & Engines": ["Automotive Technology", "Mechanical Engineering"],
  "Personal Care & Community Services": ["Cosmetology", "Human Services"],
};

/** The world a major belongs to (the first world that lists it). */
const WORLD_OF_MAJOR = new Map<string, string>();
for (const [world, list] of Object.entries(MAJORS_BY_WORLD)) for (const m of list) if (!WORLD_OF_MAJOR.has(m)) WORLD_OF_MAJOR.set(m, world);

/** The student app's own poster photo for a world: its first catalog career. */
const WORLD_PHOTO = new Map<string, string>();
for (const c of ALL_CATALOG_CAREERS) if (!WORLD_PHOTO.has(c.world)) WORLD_PHOTO.set(c.world, c.photo);

/** The majors this student has saved, best first (one or two). */
export function savedMajorsFor(s: CounselorStudent): string[] {
  const worlds = [s.careerTrack, ...toV5(s).dreamari.saved.map((id) => careerById(id)?.world ?? "")].filter((w, i, a) => w && MAJORS_BY_WORLD[w] && a.indexOf(w) === i);
  const h = seedHash(`${s.id}:majors`);
  // about one student in three saves a second major; nobody saves none
  const take = 1 + (h % 3 === 0 ? 1 : 0);
  return worlds.slice(0, take).map((w, i) => {
    const list = MAJORS_BY_WORLD[w];
    return list[((h >>> (i * 3)) & 1023) % list.length];
  });
}

/** A major as a poster: the career card's shape, the world's photo, the
 *  count in the chip. */
export function majorPoster(major: string, chip: string, world = WORLD_OF_MAJOR.get(major) ?? "Business & Finance"): CatalogCareer {
  return { title: major, world, photo: WORLD_PHOTO.get(world) ?? ALL_CATALOG_CAREERS[0].photo, salary: chip };
}

/** A college programme name as a short major name, with the world it sits
 *  in (for the Majors view of Top Schools). Scorecard names are long
 *  ("Registered Nursing/Registered Nurse"); the first clause, trimmed of
 *  "General", is what a counselor would say. */
export function programmeMajor(name: string): { major: string; world: string } {
  const major = name.split(/[\/(]/)[0].replace(/,\s*General\b/i, "").replace(/,\s*Other\b/i, "").trim() || name;
  const n = name.toLowerCase();
  const world =
    /nurs|health|medic|kinesi|pharm|dental|therap|biolog/.test(n) ? "Health & Medicine"
    : /comput|engineer|information|software|electr|mechanic/.test(n) ? "Tech & Engineering"
    : /business|financ|account|market|manage|econom/.test(n) ? "Business & Finance"
    : /communicat|design|film|media|music|art|journal|sport/.test(n) ? "Arts, Media & Sport"
    : /chem|physic|environment|math|data|research/.test(n) ? "Science & Research"
    : /educat|teach/.test(n) ? "Teaching & Education"
    : /crimin|law|legal|politic|justice/.test(n) ? "Law, Safety & Justice"
    : /psych|social|sociol|human serv/.test(n) ? "Counseling & Social Work"
    : /construct|architect|civil/.test(n) ? "Building & Construction"
    : /culinar|hospital|nutrition|food/.test(n) ? "Food & Cooking"
    : /agri|animal|veterin/.test(n) ? "Farming, Animals & Nature"
    : "Business & Finance";
  return { major, world };
}
