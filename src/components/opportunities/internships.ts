// Real internships and work-based learning for US high-school students,
// read from each provider's OFFICIAL page on 1 Oct 2026 (Chandu: "where
// are the internships tabs? populate with real data"). Same rules as
// programs.ts: a fact the page did not state is null (paid "unknown"), a
// past-cycle date is kept with a deadlineNote. New Jersey and New York
// area first (MSK, the Met, Hackensack Meridian, Atlantic Health, Princeton
// and Newark SYEP), then nationwide (AEOP). Dropped: Meta Summer Academy
// (four California neighbourhoods only). LLRISE and the NYAS Junior
// Academy are filed as programs, not jobs. Re-verify before any release.

import type { Program } from "./types";

export const INTERNSHIPS: Program[] = [
  {
    "id": "nyc-ladders-for-leaders",
    "name": "NYC Ladders for Leaders",
    "org": "NYC Department of Youth and Community Development",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid, at least $16.50 an hour; some employers pay more",
    "fields": [
      "Business & Finance",
      "Tech & Engineering",
      "Arts & Media",
      "Public Service & Law",
      "Any"
    ],
    "grades": [
      11
    ],
    "states": [
      "NY"
    ],
    "location": "New York City",
    "when": "6 weeks in summer, 25 to 40 hours a week, after pre-employment workshops",
    "eligibility": "You must be 16 to 24, live in one of New York City's five boroughs, be a rising senior or college student, have some paid or volunteer work experience, and be legally able to work in the US.",
    "requires": [
      "NYC residency",
      "Prior paid or volunteer work experience",
      "Legal authorization to work in the US",
      "Pre-employment workshops and employer interviews"
    ],
    "opens": null,
    "deadline": "2026-01-16",
    "deadlineNote": "The 2026 deadline was January 16, 2026; 2027 dates not yet posted.",
    "url": "https://www.nyc.gov/site/dycd/services/jobs-internships/about-nyc-ladders-for-leaders.page",
    "verifiedOn": "2026-10-01",
    "notes": "Application is at application.nycsyep.com."
  },
  {
    "id": "nist-ship",
    "name": "Summer High School Intern Program (SHIP)",
    "org": "National Institute of Standards and Technology (NIST)",
    "kind": "internship",
    "paid": "free",
    "costNote": "Unpaid; families provide housing and transportation",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "MD",
      "CO"
    ],
    "location": "NIST Gaithersburg, MD or NIST Boulder, CO",
    "when": "7 weeks, mid June to early August",
    "eligibility": "You must be a US citizen in 11th or 12th grade with at least a 3.0 unweighted GPA who lives within 50 miles of the Gaithersburg or Boulder campus and can attend all seven weeks.",
    "requires": [
      "US citizenship",
      "Unweighted GPA of 3.0 or higher",
      "Two recommendation letters, one from a STEM teacher",
      "One-page personal statement",
      "Transcript",
      "Resume"
    ],
    "opens": "2026-10",
    "deadline": "2026-01-26",
    "deadlineNote": "The 2026 cycle closed January 26, 2026. The 2027 application opens mid October 2026 and closes at the end of January 2027; exact date not yet posted.",
    "url": "https://www.nist.gov/ship",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "msk-summer-student-program",
    "name": "Summer Student Program",
    "org": "Memorial Sloan Kettering Cancer Center",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "$1,200 stipend for the summer; housing not provided",
    "fields": [
      "Health & Medicine",
      "Science & Research"
    ],
    "grades": [
      11
    ],
    "states": [
      "NY",
      "NJ",
      "CT"
    ],
    "location": "MSK Main Campus, Manhattan, NY",
    "when": "8 weeks, late June to late August, 40 hours a week",
    "eligibility": "You must be a high school junior who is at least 14 by June, has a 3.5 GPA in science classes, lives in New York, New Jersey or Connecticut within 25 miles of MSK's main campus, and can legally work in the US.",
    "requires": [
      "Two recommendation letters from STEM teachers, counselors or mentors",
      "Unofficial transcript",
      "One-page resume",
      "Short essays",
      "Legal authorization to work in the US"
    ],
    "opens": "2025-12-01",
    "deadline": "2026-02-06",
    "deadlineNote": "The 2026 cycle opened December 1, 2025 and closed February 6, 2026. 2027 dates not yet posted.",
    "url": "https://www.mskcc.org/education-training/high-school-college/hopp-summer-student",
    "verifiedOn": "2026-10-01",
    "notes": "About 20 students accepted a year."
  },
  {
    "id": "amnh-srmp",
    "name": "Science Research Mentoring Program (SRMP)",
    "org": "American Museum of Natural History",
    "kind": "internship",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Science & Research"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "NY"
    ],
    "location": "American Museum of Natural History, New York City",
    "when": "The full school year, Tuesdays and Thursdays after school plus one or two Fridays a month",
    "eligibility": "You must live and go to school in New York City, be in 10th or 11th grade, have passed your classes for the last three semesters, and have taken an AMNH teen course or attend an SRMP partner school.",
    "requires": [
      "Live and attend school in NYC",
      "Passing grades for three or more semesters",
      "An AMNH teen course or a partner school",
      "Five short essays",
      "Interview"
    ],
    "opens": null,
    "deadline": "2026-03-01",
    "deadlineNote": "The 2026-27 cycle closed March 1, 2026; 2027-28 dates not yet posted.",
    "url": "https://www.amnh.org/learn-teach/teens/science-research-mentoring-program",
    "verifiedOn": "2026-10-01",
    "notes": "Facts from the official SRMP 2026-2027 Application Guide; the guide does not say whether a stipend is paid."
  },
  {
    "id": "nyc-syep",
    "name": "Summer Youth Employment Program (SYEP)",
    "org": "NYC Department of Youth and Community Development",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid; the rate is not stated on the official page",
    "fields": [
      "Any"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "NY"
    ],
    "location": "New York City",
    "when": "6 weeks in July and August",
    "eligibility": "You must be 14 to 24 years old, live permanently in New York City, and be legally allowed to work.",
    "requires": [
      "NYC residency",
      "Legal authorization to work",
      "Proof of identity, age and address",
      "Lottery selection"
    ],
    "opens": null,
    "deadline": "2026-03-13",
    "deadlineNote": "The 2026 application closed March 13, 2026; the 2027 opening is not yet announced.",
    "url": "https://www.nyc.gov/site/dycd/services/jobs-internships/summer-youth-employment-program-syep.page",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "met-high-school-internship",
    "name": "High School Internship Program",
    "org": "The Metropolitan Museum of Art",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "$1,100 stipend on completion",
    "fields": [
      "Arts & Media"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "NY",
      "NJ",
      "CT"
    ],
    "location": "The Met, New York City",
    "when": "A bootcamp day in early July, then 10 to 20 hours a week through early August",
    "eligibility": "You must be in 10th or 11th grade (or working on a high school equivalency) and live in and attend school in New York, New Jersey or Connecticut.",
    "requires": [
      "Grade 10 or 11",
      "Live and attend school in NY, NJ or CT",
      "Online application"
    ],
    "opens": null,
    "deadline": "2026-03-13",
    "deadlineNote": "The 2026 summer cycle closed March 13, 2026. A separate spring-semester internship also exists.",
    "url": "https://www.metmuseum.org/opportunities/internships/summer-internships-for-high-school-students",
    "verifiedOn": "2026-10-01",
    "notes": "The Met's site refused automated reads; facts come from the official page's indexed text and should be rechecked before release."
  },
  {
    "id": "princeton-nj-syep",
    "name": "Princeton Summer Youth Employment Program",
    "org": "Municipality of Princeton, NJ",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid; the rate is not stated on the page",
    "fields": [
      "Any"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "NJ"
    ],
    "location": "Princeton, NJ",
    "when": "8 weeks, late June to late August",
    "eligibility": "You must be a student in a Princeton district school who can get working papers, can attend all 8 weeks and all meetings, and whose household income is under 400 percent of the federal poverty level.",
    "requires": [
      "Enrolled in a Princeton district school",
      "Eligible for NJ working papers",
      "Household income at or below 400 percent of the federal poverty level",
      "Apply in person at Human Services"
    ],
    "opens": null,
    "deadline": "2026-04-24",
    "deadlineNote": "The 2026 cycle closed April 24, 2026; 2027 dates not yet posted.",
    "url": "https://www.princetonnj.gov/755/Summer-Youth-Employment-Program",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "newark-syep",
    "name": "Newark Summer Youth Employment Program",
    "org": "Newark Youth One Stop Career Center",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid every two weeks; the hourly rate is not stated",
    "fields": [
      "Any"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "NJ"
    ],
    "location": "Newark, NJ",
    "when": "6 weeks in summer, 16 hours a week",
    "eligibility": "You must be a Newark resident between 14 and 24; students with an IEP, who are still learning English, or who are undocumented are also welcome.",
    "requires": [
      "Proof of Newark residency",
      "Proof of identity and age",
      "Income verification",
      "Online application"
    ],
    "opens": null,
    "deadline": "2026-04-27",
    "deadlineNote": "The 2026 cycle closed April 27, 2026; 2027 dates not yet posted.",
    "url": "https://www.newarkyouthonestop.org/",
    "verifiedOn": "2026-10-01",
    "notes": "Free to apply and take part."
  },
  {
    "id": "hmsom-minds",
    "name": "M.I.N.D.S. Medical Internship",
    "org": "Hackensack Meridian School of Medicine",
    "kind": "internship",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Health & Medicine",
      "Science & Research"
    ],
    "grades": [
      10
    ],
    "states": [
      "NJ"
    ],
    "location": "Nutley, NJ (hybrid), with shadowing at Hackensack Meridian Health hospitals",
    "when": "Summer, Monday to Thursday 9 am to 2:30 pm, then mentoring in later years",
    "eligibility": "You must be a New Jersey high school student entering 11th grade in the fall who is interested in a career in medicine.",
    "requires": [
      "Transcripts",
      "Essays",
      "Recommendations"
    ],
    "opens": null,
    "deadline": "2026-05-15",
    "deadlineNote": "The 2026 cycle closed May 15, 2026; 2027 dates not yet posted.",
    "url": "https://www.hmsom.edu/en/office-of-opportunity-and-belonging/high-school-pre-med-students",
    "verifiedOn": "2026-10-01",
    "notes": "Includes CPR certification, SAT prep, medical simulation and a research showcase. The page does not state a stipend."
  },
  {
    "id": "nsa-high-school-work-study",
    "name": "High School Work Study Program",
    "org": "National Security Agency (NSA)",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid part-time work during senior year; the rate is not stated",
    "fields": [
      "Tech & Engineering",
      "Business & Finance",
      "Public Service & Law"
    ],
    "grades": [
      11
    ],
    "states": [
      "MD",
      "CO",
      "GA",
      "TX",
      "HI",
      "UT",
      "AK",
      "WV"
    ],
    "location": "NSA headquarters, Fort Meade, MD, and field sites",
    "when": "Part time during senior year through your school's work experience program",
    "eligibility": "You must be a US citizen high school junior who turns 16 by December 31, can get a security clearance, has your own transportation, and ideally has a 2.5 GPA or higher.",
    "requires": [
      "US citizenship",
      "Age 16 by December 31",
      "Eligible for a security clearance",
      "Reliable transportation",
      "Student evaluation form, transcript and resume"
    ],
    "opens": null,
    "deadline": "2026-09-30",
    "deadlineNote": "Applications are due September 30 each year for the following senior year; the 2026 deadline has just passed.",
    "url": "https://www.nsa.gov/Careers/Student-Programs/",
    "verifiedOn": "2026-10-01",
    "notes": "nsa.gov blocks automated reads; facts come from official NSA postings as indexed. Recheck before release."
  },
  {
    "id": "lockheed-martin-space-hs-internship",
    "name": "High School Internship Program",
    "org": "Lockheed Martin Space",
    "kind": "internship",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Tech & Engineering",
      "Science & Research"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "CO",
      "CA",
      "FL",
      "PA",
      "AL",
      "VA"
    ],
    "location": "Denver CO, Sunnyvale CA, Cape Canaveral FL, King of Prussia PA, Huntsville AL, Herndon VA",
    "when": "9 or more weeks, June to August",
    "eligibility": "You must be 16 when the internship starts, go to a high school within commuting distance of a participating Lockheed Martin site, like STEM, and not be graduating that spring.",
    "requires": [
      "Age 16 at start",
      "A nearby high school",
      "Your own way to the site"
    ],
    "opens": "2026-11-02",
    "deadline": "2027-01-03",
    "deadlineNote": "Summer 2027 applications open November 2, 2026 and close January 3, 2027.",
    "url": "https://www.lockheedmartin.com/en-us/careers/candidates/students-early-careers/high-school.html",
    "verifiedOn": "2026-10-01",
    "notes": "The official page does not say whether it is paid."
  },
  {
    "id": "jhu-apl-aspire",
    "name": "ASPIRE High School Internship",
    "org": "Johns Hopkins Applied Physics Laboratory",
    "kind": "internship",
    "paid": "free",
    "costNote": "Unpaid",
    "fields": [
      "Tech & Engineering",
      "Science & Research"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "MD",
      "VA",
      "DC"
    ],
    "location": "Laurel, MD",
    "when": "Summer, 30 to 40 hours a week for about nine weeks; or during the school year, up to 10 hours a week",
    "eligibility": "You must be a US citizen rising junior or senior, at least 15 by June 1, with a 2.8 GPA or higher, living in a listed Maryland county, Northern Virginia or Washington DC, with your own ride to APL.",
    "requires": [
      "US citizenship",
      "Minimum 2.8 GPA",
      "Age 15 by June 1",
      "Live in a listed MD county, Northern Virginia or DC",
      "Reliable transportation"
    ],
    "opens": "2027-01-01",
    "deadline": "2027-02-15",
    "deadlineNote": "The timeline lists January 1 to February 15 each year; decisions by May 15.",
    "url": "https://www.jhuapl.edu/education/stem-outreach/aspire",
    "verifiedOn": "2026-10-01",
    "notes": "Acceptance rate under 10 percent per the page."
  },
  {
    "id": "atlantic-health-morristown-summer-junior-volunteer",
    "name": "Summer Junior Volunteer Program",
    "org": "Atlantic Health System, Morristown Medical Center",
    "kind": "internship",
    "paid": "free",
    "costNote": "Unpaid volunteer position",
    "fields": [
      "Health & Medicine"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "NJ"
    ],
    "location": "Morristown, NJ",
    "when": "Late June to mid August; two 4-hour shifts a week",
    "eligibility": "You must be 15 to 17 years old, able to work two four-hour shifts a week all summer, and provide two reference letters and your vaccination records.",
    "requires": [
      "Age 15 to 17",
      "Two letters of reference",
      "Vaccination records",
      "Lottery selection"
    ],
    "opens": "2027-03-01",
    "deadline": "2027-03-07",
    "deadlineNote": "The application window is March 1 to March 7, 2027; selection is by lottery.",
    "url": "https://www.atlantichealth.org/locations/morristown-medical-center/volunteer-services",
    "verifiedOn": "2026-10-01",
    "notes": "Other Atlantic Health hospitals (Newton, Chilton, Overlook) run similar junior volunteer programs with different windows."
  },
  {
    "id": "hmh-high-school-career-explorer",
    "name": "High School Career Explorer Program",
    "org": "Hackensack Meridian Health",
    "kind": "internship",
    "paid": "free",
    "costNote": "Unpaid",
    "fields": [
      "Health & Medicine"
    ],
    "grades": [
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "Hackensack Meridian Health hospitals across New Jersey",
    "when": "Virtual onboarding in May, then coaching sessions through senior year, at least 32 hours in all",
    "eligibility": "You must be a high school junior who will be a senior in the fall and can attend the required virtual information session in May.",
    "requires": [
      "The May virtual information session",
      "Student application",
      "Parent permission form",
      "Health questionnaire",
      "Counselor attestation"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Registration is not yet open; the deadline comes in the letter after the May information session.",
    "url": "https://jobs.hackensackmeridianhealth.org/hs-explorer-program",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "aeop-high-school-internships",
    "name": "AEOP High School Internships",
    "org": "Army Educational Outreach Program",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "Educational stipend; the amount depends on the location and length and is given in the award letter",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Army research labs and partner university labs nationwide",
    "when": "Mostly full-time summer positions; some part-time school-year options",
    "eligibility": "You must be a US citizen or permanent resident in high school, at least 14, who already lives near the lab you apply to.",
    "requires": [
      "US citizen or permanent resident",
      "Age 14 or older",
      "AEOP account with a resume or transcript",
      "Parent approval if under 18",
      "Your own housing and transportation"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Deadlines vary by position; check each posting.",
    "url": "https://aeopinternships-fellowships.org/internships/",
    "verifiedOn": "2026-10-01",
    "notes": "Research areas include cybersecurity, energetics, biology and materials science."
  },
  {
    "id": "northrop-grumman-hip",
    "name": "High School Involvement Partnership (HIP)",
    "org": "Northrop Grumman",
    "kind": "apprenticeship",
    "paid": "free",
    "costNote": "Free mentoring program; the follow-on senior-year internships are paid hourly jobs",
    "fields": [
      "Tech & Engineering"
    ],
    "grades": [
      11
    ],
    "states": [
      "AL",
      "CA",
      "CO",
      "FL",
      "IL",
      "MD",
      "ND",
      "OK",
      "UT"
    ],
    "location": "Partner public high schools near Northrop Grumman sites; virtual sessions plus site visits",
    "when": "Two school years: November to May in junior year, November to April in senior year",
    "eligibility": "You must be a US citizen junior at a partner public high school in a Northrop Grumman community with a 3.0 or higher unweighted GPA and an interest in engineering, math, cyber, computer science or manufacturing.",
    "requires": [
      "US citizenship",
      "3.0 or higher unweighted GPA",
      "A partner public high school"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No public deadline; apply through your partner school.",
    "url": "https://www.northropgrumman.com/corporate-responsibility/corporate-citizenship/hip-high-school-involvement-partnership",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "mit-llrise",
    "name": "Lincoln Laboratory Radar Introduction for Student Engineers (LLRISE)",
    "org": "MIT Lincoln Laboratory",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free, including housing in MIT dorms; students pay only travel to MIT",
    "fields": [
      "Tech & Engineering",
      "Science & Research"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "MIT, Cambridge, MA and Lincoln Laboratory, Lexington, MA (residential)",
    "when": "2 weeks in July",
    "eligibility": "You must be a US citizen finishing your junior year of high school who loves science, math and engineering.",
    "requires": [
      "US citizenship",
      "Recommendations"
    ],
    "opens": null,
    "deadline": "2026-03-11",
    "deadlineNote": "The 2026 cycle closed March 11, 2026; 2027 dates not yet posted.",
    "url": "https://www.ll.mit.edu/outreach/llrise",
    "verifiedOn": "2026-10-01",
    "notes": "Students build small radar systems."
  },
  {
    "id": "nyas-junior-academy",
    "name": "The Junior Academy",
    "org": "The New York Academy of Sciences",
    "kind": "fellowship",
    "paid": "free",
    "costNote": "Free; no travel",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "Remote"
    ],
    "location": "Online, with students from over 100 countries",
    "when": "10-week virtual challenges in fall and spring, 3 to 4 hours a week",
    "eligibility": "You must be 13 to 17 for the whole program, comfortable reading and writing in English, and have a parent sign a consent form.",
    "requires": [
      "Age 13 to 17",
      "Parent consent form",
      "Application in English"
    ],
    "opens": "2026-04-01",
    "deadline": "2026-07-09",
    "deadlineNote": "Fall 2026 recruitment closed July 9, 2026; the next cycle is expected in spring 2027.",
    "url": "https://www.nyas.org/learning/high-school-research-programs/the-junior-academy/",
    "verifiedOn": "2026-10-01",
    "notes": "Completers get a certificate and a Young Membership."
  }
];
