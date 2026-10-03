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
  },
  // A paid finance internship for NYC juniors and seniors, read from the official page on 2 Oct 2026 (same request).
  {
    "id": "futures-and-options-internship-program",
    "name": "The Internship Program",
    "org": "Futures and Options",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid internships. The program page says 100% of students earn at least $17.00/hr at their internship.",
    "fields": [
      "Business & Finance"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "NY"
    ],
    "location": "New York City; placements at partner employers (the page names BlackRock, Carlyle, JP Morgan Chase, Infor, UpSlide)",
    "when": "School-year internships run September to June, 5 to 10 hours a week. Summer internships run 6 weeks in July and August, 20 to 30 hours a week.",
    "eligibility": "You must be a junior or senior at a New York City high school. You must have a valid working card and be allowed to work in the US.",
    "requires": [
      "Online application with short answers",
      "Resume",
      "Most recent transcript or report card",
      "One reference from a teacher or supervisor",
      "Working card (under 18, before interviews)",
      "Interview"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The Internship Program application is closed right now. No reopening date is posted. Students can fill out an interest form to hear when it opens.",
    "url": "https://futuresandoptions.org/our-programs/the-internship-program/",
    "verifiedOn": "2026-10-02",
    "notes": "Placements are not only in finance. They include small businesses, nonprofits, government, and large companies. Accepted students go into a pool and get offers as internships open. Application details come from https://futuresandoptions.org/internship-program-application/.",
    "careers": [
      "investment-banking",
      "private-equity",
      "financial-advisor",
      "accountant"
    ]
  },
  // Added 3 Oct 2026 from a second verified research pass (official pages only).
  {
    "id": "bnl-high-school-research-program",
    "name": "High School Research Program (HSRP)",
    "org": "Brookhaven National Laboratory",
    "kind": "internship",
    "paid": "unknown",
    "costNote": "Pay is not listed. Commuter program; housing and transportation are not provided.",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      11
    ],
    "states": [
      "NY"
    ],
    "location": "Brookhaven National Laboratory, Upton, NY (commuter only)",
    "when": "6 weeks, Monday to Friday, 8:30 am to 5 pm, no vacation days (2026: July 6 to August 14)",
    "eligibility": "Recommended for students who have finished 11th grade. You must be at least 16 by the start and a US citizen or permanent resident.",
    "requires": [
      "Online application",
      "Two recommendation letters from a teacher or mentor (STEM preferred)",
      "Superintendent and parent or guardian contact information"
    ],
    "opens": "2026-01",
    "deadline": "2026-03-20",
    "deadlineNote": "Past cycle: 2026 applications ran January 12 to March 20, 2026. 2027 dates not yet posted.",
    "url": "https://www.bnl.gov/education/programs/program.php?q=219",
    "verifiedOn": "2026-10-03",
    "notes": "Students under 18 may not be allowed to do some lab tasks.",
    "whatYouDo": [
      "Work on a hands-on project with lab scientists and engineers",
      "Join research teams on site",
      "Share your work in a poster session or talk"
    ],
    "schedule": "Full-time, 6 weeks",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "cshl-partners-for-the-future",
    "name": "Partners for the Future",
    "org": "Cold Spring Harbor Laboratory",
    "kind": "internship",
    "paid": "unknown",
    "costNote": "Pay is not listed on the official page",
    "fields": [
      "Science & Research",
      "Health & Medicine"
    ],
    "grades": [
      11
    ],
    "states": [
      "NY"
    ],
    "location": "Cold Spring Harbor Laboratory, Cold Spring Harbor, NY",
    "when": "September to March of senior year, at least 10 hours a week",
    "eligibility": "Your school's science chair nominates you in junior year (up to two students per school). The research happens in senior year.",
    "requires": [
      "Nomination by your school science chair",
      "Essay",
      "Interview with lab scientists (semifinalists)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Applications are closed; the page lists no dates for the next cycle.",
    "url": "https://www.cshl.edu/education/partners-for-the-future/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Do original biomedical research with a scientist mentor",
      "Learn molecular biology lab techniques",
      "Give a talk on your project at the end"
    ],
    "schedule": "Part-time, at least 10 hours a week",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "bbg-garden-apprentice-program",
    "name": "Garden Apprentice Program (GAP)",
    "org": "Brooklyn Botanic Garden",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "Paid: $600 (Tier 1), $700 (Tier 2), $800 (Tier 3) or $17 an hour (Tier 4), plus $75 for perfect attendance",
    "fields": [
      "Science & Research"
    ],
    "grades": [
      9,
      10,
      11
    ],
    "states": [
      "NY"
    ],
    "location": "Brooklyn Botanic Garden, Brooklyn, NY",
    "when": "March to November 2027, about 190 to 220 hours: 1 to 2 days a week in spring and fall, 4 days a week in summer",
    "eligibility": "You must be in grades 9 to 11. Current seniors can only return as Tier 4 apprentices. No gardening experience needed.",
    "requires": [
      "Online application",
      "Commit to March through November",
      "Reapply each year"
    ],
    "opens": null,
    "deadline": "2026-12-04",
    "deadlineNote": "Open now. Applications for the 2027 program are due December 4, 2026.",
    "url": "https://www.bbg.org/learn/gap",
    "verifiedOn": "2026-10-03",
    "notes": "One-day orientation in February. Tier 4 apprentices are part-time garden staff.",
    "whatYouDo": [
      "Grow and harvest food in the garden",
      "Teach children about plants and gardening",
      "Design exhibits and mentor younger apprentices as you move up tiers"
    ],
    "schedule": "Part-time, March to November",
    "setting": "In person",
    "pay": "Stipend of $600 to $800, or $17 an hour at Tier 4"
  },
  {
    "id": "wcs-project-true",
    "name": "Project TRUE (Teens Researching Urban Ecology)",
    "org": "Wildlife Conservation Society, Bronx Zoo",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "Summer: $750 stipend, or NYC minimum wage through SYEP if eligible. Fall: about $350.",
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
    "location": "Bronx Zoo, Bronx, NY",
    "when": "Summer: 3 days a week in July and August. Fall: 14 Saturdays, September to December.",
    "eligibility": "You must be a high school sophomore or junior in good standing who lives in the Bronx and can work in the US.",
    "requires": [
      "Application (open January to February)",
      "Attend every session",
      "Eligible to work in the US"
    ],
    "opens": "2026-01",
    "deadline": null,
    "deadlineNote": "Applications open January to February and close in late February. The 2026 cycle is closed; no 2027 date is posted.",
    "url": "https://bronxzoo.com/teens/project-true/internship",
    "verifiedOn": "2026-10-03",
    "notes": "Run with Fordham University. Includes yearly follow-up surveys.",
    "whatYouDo": [
      "Design and run an urban ecology research project",
      "Collect field data on NYC wildlife with scientists",
      "Present your findings"
    ],
    "schedule": "Part-time, summer and fall",
    "setting": "In person",
    "pay": "$750 summer stipend; about $350 in fall"
  },
  {
    "id": "brooklyn-museum-apprentice-program",
    "name": "Museum Apprentice Program",
    "org": "Brooklyn Museum",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid $17 an hour ($18 for second-year apprentices), up to 180 hours a year",
    "fields": [
      "Arts & Media"
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
    "location": "Brooklyn Museum, Brooklyn, NY",
    "when": "November to June: Thursdays 4:30 to 6:30 pm plus some weekend events. July and August: Wednesday to Friday, 10 am to 4 pm.",
    "eligibility": "Open to all New York City high school students.",
    "requires": [
      "Application",
      "Commit to the full work schedule"
    ],
    "opens": "2027-06",
    "deadline": null,
    "deadlineNote": "The 2026-27 deadline has passed. The page says to check back in June 2027 for the fall 2027 program.",
    "url": "https://www.brooklynmuseum.org/careers/internships-fellowships/museum-apprentice-program",
    "verifiedOn": "2026-10-03",
    "notes": "OMNY cards provided for weekend and summer work.",
    "whatYouDo": [
      "Learn to teach with art from museum educators and curators",
      "Help with family programs and lead summer camp tours",
      "Build public speaking and lesson planning skills"
    ],
    "schedule": "Part-time, school year and summer",
    "setting": "In person",
    "pay": "$17 an hour"
  },
  {
    "id": "mount-sinai-ceye-summer",
    "name": "CEYE Summer Programs (Internship Placement and MSEP)",
    "org": "Center for Excellence in Youth Education, Icahn School of Medicine at Mount Sinai",
    "kind": "internship",
    "paid": "unknown",
    "costNote": "Pay is not listed on the official page",
    "fields": [
      "Health & Medicine",
      "Science & Research"
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
    "location": "Mount Sinai, New York, NY",
    "when": "Summer",
    "eligibility": "Open to all New York City high school students. The Internship Placement Program is for juniors and seniors; the Medical and Scientific Exploration Program (MSEP) is hybrid.",
    "requires": [
      "Online application"
    ],
    "opens": "2026-12",
    "deadline": null,
    "deadlineNote": "Summer 2026 applications are closed. Summer 2027 information will be released in December 2026.",
    "url": "https://icahn.mssm.edu/about/departments-offices/oped/academic-community-culture/ceye",
    "verifiedOn": "2026-10-03",
    "notes": "Internship tracks: Hospital Placement, Veterinary Sciences, NeuroSurgery Scholars, and Cultivating Neurological Success.",
    "whatYouDo": [
      "Intern in a Mount Sinai department with a mentor (Internship Placement)",
      "Meet lab and clinical teams in weekly sessions (MSEP)"
    ],
    "schedule": "Summer",
    "setting": null,
    "pay": null
  },
  {
    "id": "manhattan-da-high-school-internship",
    "name": "High School Internship Program (HSIP)",
    "org": "Manhattan District Attorney's Office",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid minimum wage",
    "fields": [
      "Public Service & Law"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "NY"
    ],
    "location": "Manhattan District Attorney's Office, New York, NY",
    "when": "5 weeks, Monday to Friday, 9:30 am to 4:30 pm (2026: June 29 to July 31)",
    "eligibility": "You must live in Manhattan, be a current junior or senior, and attend all five weeks.",
    "requires": [
      "One-page resume",
      "300-word essay on your interest in criminal justice"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The page does not list an application deadline; 2026 dates were June 29 to July 31.",
    "url": "https://manhattanda.org/careers/internship-opportunities/high-school-internship/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Join workshops and discussions about the criminal justice system",
      "Take part in a mock trial program",
      "Build professional skills in an office"
    ],
    "schedule": "Full-time, 5 weeks",
    "setting": "In person",
    "pay": "Minimum wage"
  },
  {
    "id": "construction-skills-youth-program",
    "name": "Construction Skills Youth Program",
    "org": "Construction Skills",
    "kind": "apprenticeship",
    "paid": "free",
    "costNote": "Free pre-apprenticeship training",
    "fields": [
      "Skilled Trades"
    ],
    "grades": [
      12
    ],
    "states": [
      "NY"
    ],
    "location": "New York City",
    "when": "Spring of senior year: one afternoon a week for 10 weeks (1:30 to 5 pm). Then 3 weeks full-time (7 am to 2 pm) after graduation.",
    "eligibility": "You must be a New York City public high school senior with at least a 70% GPA and 90% attendance, interested in union construction, able to do physical work, and committed to a clean and sober environment.",
    "requires": [
      "A school counselor, teacher or administrator submits an inquiry for you",
      "70% cumulative GPA",
      "90% attendance record"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Applications for the 2026 Youth Program are closed; 2027 dates not posted.",
    "url": "https://www.constructionskills.org/programs/youth",
    "verifiedOn": "2026-10-03",
    "notes": "Works with about 20 NYC career and technical high schools; leads to direct entry into union apprenticeships with the Building and Construction Trades Council of Greater New York.",
    "whatYouDo": [
      "Train with a national building trades curriculum",
      "Do 3 weeks of hands-on training after graduation",
      "Get a direct path into union apprenticeships"
    ],
    "schedule": "Part-time in spring, then 3 weeks full-time",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "careerwise-new-york",
    "name": "CareerWise New York Youth Apprenticeship",
    "org": "CareerWise New York",
    "kind": "apprenticeship",
    "paid": "paid",
    "costNote": "Apprentices earn wages; the rate is not listed",
    "fields": [
      "Business & Finance",
      "Tech & Engineering",
      "Health & Medicine",
      "Skilled Trades"
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
    "location": "New York City (about 70 partner schools and 21 companies)",
    "when": "2+ years, alongside high school",
    "eligibility": "For New York City public high school students at CareerWise partner schools. Ask your school if it takes part.",
    "requires": [
      "Attend a partner school",
      "Apply through your school"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "How and when to apply is not posted; it runs through partner schools.",
    "url": "https://www.careerwiseusa.org/locations/new-york/",
    "verifiedOn": "2026-10-03",
    "notes": "Industries include IT, healthcare, financial services, business operations, hospitality, real estate management, advanced manufacturing and maintenance technology.",
    "whatYouDo": [
      "Work for a real NYC employer while in high school",
      "Earn industry-recognized credentials",
      "Try roles like data analyst, nursing assistant, junior coder or property manager"
    ],
    "schedule": "Part-time, 2+ years",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "genesys-works",
    "name": "Genesys Works",
    "org": "Genesys Works",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Students earn $10,000 to $13,000 over the internship year; hourly rates vary by site",
    "fields": [
      "Tech & Engineering",
      "Business & Finance"
    ],
    "grades": [
      11
    ],
    "states": [
      "NY",
      "CA",
      "IL",
      "TX",
      "FL",
      "TN",
      "DC",
      "MD",
      "VA",
      "OK",
      "MN"
    ],
    "location": "New York City, Bay Area, Chicago, Houston, Jacksonville, Nashville, National Capital Region, Tulsa, Twin Cities",
    "when": "8 weeks of summer training (160 hours), then a paid internship about 20 hours a week during senior year",
    "eligibility": "You must be a junior at a partner school in one of these regions, on track to graduate, able to work in the US, and able to adjust your senior-year schedule. You need your own transportation.",
    "requires": [
      "Apply in fall or winter of junior year",
      "Junior at a partner school",
      "Legal authorization to work in the US"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Applications run in the fall or winter of junior year and finish in spring; exact dates vary by region.",
    "url": "https://genesysworks.org/for-students-and-families/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Train for 8 weeks in technical and professional skills",
      "Work an entry-level job at a company about 4 hours each afternoon",
      "Get college and career coaching"
    ],
    "schedule": "Part-time, 20 hours a week in senior year",
    "setting": "In person",
    "pay": "$10,000 to $13,000 for the year"
  },
  {
    "id": "newark-museum-explorers",
    "name": "Explorers Teen Program",
    "org": "The Newark Museum of Art",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid museum internship; the rate is not listed",
    "fields": [
      "Arts & Media",
      "Science & Research"
    ],
    "grades": [
      9,
      10
    ],
    "states": [
      "NJ"
    ],
    "location": "The Newark Museum of Art, Newark, NJ",
    "when": "3 to 4 years: 6 hours a week after school, 25 hours a week in summer, plus 60 hours of community service a year",
    "eligibility": "You must be a rising freshman, sophomore or junior who lives in Newark or attends a Newark school, with a GPA of at least 2.7.",
    "requires": [
      "Teacher recommendation letter",
      "Current grades",
      "Brag sheet or resume",
      "Short response and essay",
      "Interview"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "2026 applications are closed (interviews in July 2026). In the 2025 cycle, applications opened March 1 and closed June 1.",
    "url": "https://newarkmuseumart.org/program/explorers/",
    "verifiedOn": "2026-10-03",
    "notes": "Serves 50 students in grades 9 to 12 each year.",
    "whatYouDo": [
      "Intern in museum departments and lead your own projects",
      "Join workshops on leadership, public speaking and STEM",
      "Take field trips and college tours"
    ],
    "schedule": "Part-time, year-round",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "us-senate-page-program",
    "name": "U.S. Senate Page Program",
    "org": "United States Senate",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Pages are employed by the Senate Sergeant at Arms; the salary is not listed on the program pages",
    "fields": [
      "Public Service & Law"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "location": "U.S. Capitol, Washington, DC (residential, with the Senate Page School)",
    "when": "Fall 2026: September 7 to January 22. Spring 2027: January 24 to June 4. Two summer sessions in June and July 2027.",
    "eligibility": "You must be 16 or 17 when appointed, a US citizen or permanent resident with a Social Security number, and have at least a 3.0 GPA. Semester pages are juniors; summer pages are rising juniors or seniors.",
    "requires": [
      "Apply through your own senator's office",
      "Letter of interest",
      "Official transcript",
      "Letters of recommendation",
      "Health assessment and immunization record"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Each senator's office sets its own deadline, and not all senators sponsor pages.",
    "url": "https://pageprogram.senate.gov/apply/",
    "verifiedOn": "2026-10-03",
    "notes": "Semester pages attend the Senate Page School, with honors-level courses.",
    "whatYouDo": [
      "Help with the daily work of the Senate",
      "Live with pages from across the country",
      "Take classes at the Senate Page School during the semester"
    ],
    "schedule": "Full-time, a semester or summer session",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "navy-seap",
    "name": "Science and Engineering Apprenticeship Program (SEAP)",
    "org": "Office of Naval Research",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "Stipend of $4,000 for new interns, $4,500 for returning interns",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      10,
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "About 38 Navy laboratories across the US",
    "when": "8 weeks in summer (possible 2-week extension)",
    "eligibility": "You must have finished at least 9th grade, be enrolled in high school (graduating seniors can apply), be 16 or older by the start, and be a US citizen. Some labs make exceptions.",
    "requires": [
      "Online application",
      "Choose your preferred labs",
      "Grades and science and math courses",
      "Recommendations",
      "Personal statement"
    ],
    "opens": "2026-09",
    "deadline": "2026-11-30",
    "deadlineNote": "Open now. Applications run September 15 to November 30, 2026; decisions January to March.",
    "url": "https://www.navalsteminterns.us/internships/seap/",
    "verifiedOn": "2026-10-03",
    "notes": "About 300 placements. Some labs require a security clearance.",
    "whatYouDo": [
      "Do real Navy research in a lab",
      "Learn from scientists and engineers who mentor you"
    ],
    "schedule": "Full-time, 8 weeks",
    "setting": "In person",
    "pay": "Stipend of $4,000"
  }
];
