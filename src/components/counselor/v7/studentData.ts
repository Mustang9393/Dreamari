"use client";

// What a student told Dreamari about themselves (the Replit's About Me and
// "Student-stated preferences"), and the courses that connect to their
// interest. The live student reads their real Build answers; the seeded
// roster gets preferences derived from their career world.
//
// DEMO-ONLY: seeded preferences (subjects, location, budget, work style) are
// derived from the student's world and a stable hash so they read
// plausibly. Production reads each student's own Build record.

import { readStudentProfile } from "@/lib/studentProfile";
import { seedHash } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";

const WORLD_SUBJECTS: Record<string, string[]> = {
  "Tech & Engineering": ["Math", "Computer Science"],
  "Business & Finance": ["Math", "Economics"],
  "Health & Medicine": ["Biology", "Chemistry"],
  "Science & Research": ["Biology", "Earth Science"],
  "Arts, Media & Sport": ["Art", "English"],
  "Law, Safety & Justice": ["History", "English"],
  "Education & Social Impact": ["English", "Psychology"],
  "Building & Construction": ["Math", "Shop"],
  "Fixing Machines & Engines": ["Physics", "Shop"],
  "Factories & Making Things": ["Math", "Shop"],
  "Driving, Flying & Shipping": ["Physics", "Geography"],
};

const WORLD_COURSES: Record<string, string[]> = {
  "Tech & Engineering": ["AP Computer Science", "Statistics", "Robotics"],
  "Business & Finance": ["Accounting", "AP Economics", "Business Law"],
  "Health & Medicine": ["Anatomy & Physiology", "AP Biology", "Health Careers"],
  "Science & Research": ["AP Environmental Science", "Chemistry II", "Research Seminar"],
  "Arts, Media & Sport": ["Digital Media", "AP Art & Design", "Film Studies"],
  "Law, Safety & Justice": ["AP Government", "Criminal Justice", "Debate"],
  "Education & Social Impact": ["Child Development", "AP Psychology", "Public Speaking"],
  "Building & Construction": ["Construction Tech", "Drafting", "Applied Math"],
  "Fixing Machines & Engines": ["Automotive Tech", "Physics", "Welding"],
  "Factories & Making Things": ["Manufacturing Tech", "Engineering Design", "Applied Math"],
  "Driving, Flying & Shipping": ["Aviation Science", "Physics", "Logistics"],
};

const LOCATIONS = ["New Jersey", "New Jersey · New York", "New Jersey · Pennsylvania", "Massachusetts · New York", "Anywhere on the East Coast"];
const STYLES = ["Collaborative · Hands-on", "Independent · Creative", "Hands-on · Outdoors", "Collaborative · Helping people", "Independent · Analytical"];
const EDUCATION: Record<string, string> = {
  "4-Year College": "Bachelor's degree",
  "2-Year College": "Associate degree",
  "Trade/Technical School": "Certificate or apprenticeship",
  Workforce: "Straight to work",
  Military: "Military training",
  Undecided: "Still deciding",
};

export type Prefs = { subjects: string; industries: string; location: string; education: string; budget: string; style: string };

export function prefsFor(s: CounselorStudent): Prefs {
  if (s.isReal) {
    const p = readStudentProfile();
    return {
      subjects: p.subjects.length ? p.subjects.slice(0, 3).join(" · ") : "Not shared yet",
      industries: s.careerTrack,
      location: p.states?.length ? p.states.slice(0, 2).join(" · ") : "Not shared yet",
      education: EDUCATION[s.postsecondaryIntent] ?? "Still deciding",
      budget: "Not shared yet",
      style: "Not shared yet",
    };
  }
  const h = Math.abs(seedHash(s.id));
  return {
    subjects: (WORLD_SUBJECTS[s.careerTrack] ?? ["English", "Math"]).join(" · "),
    industries: s.careerTrack,
    location: LOCATIONS[h % LOCATIONS.length],
    education: EDUCATION[s.postsecondaryIntent] ?? "Still deciding",
    budget: `$${[15, 20, 25, 30, 40][h % 5]},000 a year`,
    style: STYLES[(h >>> 3) % STYLES.length],
  };
}

export function coursesToConsider(s: CounselorStudent): string[] {
  return WORLD_COURSES[s.careerTrack] ?? ["Statistics", "Public Speaking", "A career-connected elective"];
}
