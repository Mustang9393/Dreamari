// Real scholarships, read from each provider's OFFICIAL page on 1 Oct 2026
// (Chandu: "use real data to populate these tabs"). A fact the page did not
// state is null; a date the page still shows from last cycle is kept with a
// deadlineNote and the UI says "Usually closes". Held back on purpose: the
// AES Engineering essay contest (routes applicants to a third-party database,
// no privacy policy), Elks MVS (elks.org refused every connection, so nothing
// could be confirmed), and YoungArts (listed under Programs as a competition).
// New Jersey state aid (TAG, NJ STARS, Governor's Urban, NJ-GIVS) is included
// for the pilot. Re-verify before any public release.

import type { Scholarship } from "./types";

export const SCHOLARSHIPS: Scholarship[] = [
  {
    "id": "doodle-for-google",
    "name": "Doodle for Google",
    "provider": "Google",
    "amount": "$10,000 college scholarship for 5 finalists; the national winner gets $55,000 in total plus $50,000 for their school",
    "amountMax": 55000,
    "renewable": false,
    "kind": "arts",
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
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Any K-12 student in a US school or home school who is a US citizen or permanent resident, with a parent's permission, can enter a drawing of the Google logo.",
    "requires": [
      "Original doodle on the official entry form",
      "50-word description",
      "Parent or guardian signature"
    ],
    "opens": "2025-10-15",
    "deadline": "2025-12-17",
    "deadlineNote": "2025-26 contest dates (Oct 15 to Dec 17, 2025) from the official rules page; the 2026-27 contest had not been posted as of Oct 1, 2026.",
    "url": "https://doodleforgoogle.doodles.google/rules/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "ge-reagan-foundation-scholarship",
    "name": "GE-Reagan Foundation Scholarship",
    "provider": "Ronald Reagan Presidential Foundation and Institute",
    "amount": "$10,000 a year, renewable for up to four years ($40,000 total)",
    "amountMax": 40000,
    "renewable": true,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": 3.0,
    "eligibility": "US citizen high school seniors with at least a 3.0 GPA who show leadership, drive, integrity and citizenship and plan to attend a four-year US college full time.",
    "requires": [
      "Online application",
      "Leadership essay",
      "Goals statement",
      "Financial information",
      "Transcript (semifinalists)",
      "One recommendation (semifinalists)"
    ],
    "opens": "2025-10-13",
    "deadline": "2026-01-05",
    "deadlineNote": "2026 cycle closed Jan 5, 2026; the page offers a Notify Me for 2027 sign-up. 2027 dates not yet posted.",
    "url": "https://www.reaganfoundation.org/education/ge-reagan-foundation-scholarship",
    "verifiedOn": "2026-10-01",
    "notes": "Financial need is considered but not stated as a requirement."
  },
  {
    "id": "hsf-scholar-program",
    "name": "HSF Scholar Program",
    "provider": "Hispanic Scholarship Fund",
    "amount": "$500 to $5,000, based on need",
    "amountMax": 5000,
    "renewable": null,
    "kind": "identity",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 3.0,
    "eligibility": "Students of Hispanic heritage with at least a 3.0 GPA in high school who plan to enroll full time at an accredited US college and file the FAFSA.",
    "requires": [
      "Online application",
      "FAFSA",
      "Transcript"
    ],
    "opens": "2026-01-05",
    "deadline": "2026-02-15",
    "deadlineNote": "2026 cycle opened Jan 5 and closed Feb 15, 2026. The 2027 cycle usually opens in January.",
    "url": "https://www.hsf.net/scholarship",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "davidson-fellows",
    "name": "Davidson Fellows Scholarship",
    "provider": "Davidson Institute",
    "amount": "$100,000, $50,000 and $25,000 scholarships",
    "amountMax": 100000,
    "renewable": false,
    "kind": "merit",
    "fields": [
      "Science & Research",
      "Tech & Engineering",
      "Arts & Media",
      "Any"
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
    "needBased": false,
    "minGpa": null,
    "eligibility": "US citizens or permanent residents age 18 or younger who have completed a significant project in science, technology, engineering, math, music, literature, philosophy or an outside-the-box area.",
    "requires": [
      "Project submission in a category",
      "Two nominator forms",
      "Parent approval form"
    ],
    "opens": "2026-fall",
    "deadline": "2026-02-18",
    "deadlineNote": "2026 cycle deadline was Feb 18, 2026. The page says the 2027 application opens in fall 2026; no 2027 deadline was posted as of Oct 1, 2026.",
    "url": "https://www.davidsongifted.org/gifted-programs/fellows-scholarship/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "gates-scholarship",
    "name": "The Gates Scholarship",
    "provider": "The Gates Scholarship",
    "amount": "Full cost of attendance not covered by other aid",
    "amountMax": null,
    "renewable": null,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 3.3,
    "eligibility": "Pell-eligible high school seniors who are US citizens or permanent residents, have at least a 3.3 weighted GPA, and plan to enroll full time in a four-year degree program.",
    "requires": [
      "Phase I online application",
      "FAFSA",
      "Transcript (submitted by counselor)",
      "CSS Profile (finalists)",
      "Resume"
    ],
    "opens": "2026-07-15",
    "deadline": "2026-09-15",
    "deadlineNote": "2026-27 Phase I closed Sept 15, 2026. The next cycle is expected to open July 15, 2027.",
    "url": "https://www.thegatesscholarship.org/scholarship/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "coca-cola-scholars",
    "name": "Coca-Cola Scholars Program",
    "provider": "Coca-Cola Scholars Foundation",
    "amount": "$20,000",
    "amountMax": 20000,
    "renewable": false,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": 3.0,
    "eligibility": "US high school or home-school seniors with at least a B (3.0) GPA who are US citizens, nationals, permanent residents, refugees or asylees.",
    "requires": [
      "Phase 1 online application (no essay, transcript or recommendation)",
      "Phase 2 essays, transcript and recommendation (semifinalists only)"
    ],
    "opens": "2026-08-03",
    "deadline": "2026-09-30",
    "deadlineNote": "2027 cycle closed Sept 30, 2026. The program runs August 3 to September 30 each year.",
    "url": "https://www.coca-colascholarsfoundation.org/apply/",
    "verifiedOn": "2026-10-01",
    "notes": "150 scholars selected each year."
  },
  {
    "id": "questbridge-national-college-match",
    "name": "QuestBridge National College Match",
    "provider": "QuestBridge",
    "amount": "Full four-year scholarships valued at over $360,000",
    "amountMax": 360000,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "High school seniors from low-income families (typically under $65,000 a year for a family of four) who earn mostly A's in challenging classes and attend high school in the US.",
    "requires": [
      "Online application",
      "Essays",
      "Two teacher recommendations",
      "Counselor School Report",
      "Transcript",
      "Financial documents",
      "Test scores optional"
    ],
    "opens": "2026-08",
    "deadline": "2026-10-01",
    "deadlineNote": "2026 Match deadline is Thursday, Oct 1, 2026 at 11:59 pm Pacific.",
    "url": "https://www.questbridge.org/high-school-students/national-college-match",
    "verifiedOn": "2026-10-01",
    "notes": "Actual value depends on the college."
  },
  {
    "id": "daniels-scholarship",
    "name": "Daniels Scholarship Program",
    "provider": "Daniels Fund",
    "amount": "Up to the full cost of attendance",
    "amountMax": null,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "CO",
      "NM",
      "UT",
      "WY"
    ],
    "needBased": true,
    "minGpa": 3.0,
    "eligibility": "High school seniors in Colorado, New Mexico, Utah or Wyoming with a 3.0 unweighted GPA, ACT 18 or SAT 490 in each section, and family income of $100,000 or less.",
    "requires": [
      "Online application",
      "ACT or SAT scores",
      "Federal tax return",
      "Proof of state residency",
      "FAFSA Submission Summary"
    ],
    "opens": "2026-09-01",
    "deadline": "2026-10-15",
    "deadlineNote": "2026 application closes Oct 15 at 4 pm MT.",
    "url": "https://www.danielsfund.org/scholarships/daniels-scholarship-program/overview",
    "verifiedOn": "2026-10-01",
    "notes": "Four states only."
  },
  {
    "id": "mikeroweworks-work-ethic-scholarship",
    "name": "Work Ethic Scholarship Program",
    "provider": "mikeroweWORKS Foundation",
    "amount": "$500 to $34,000, average $9,100",
    "amountMax": 34000,
    "renewable": false,
    "kind": "trade",
    "fields": [
      "Skilled Trades"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "US citizens who are high school seniors or graduates and will enroll in an approved trade or technical program of two years or less.",
    "requires": [
      "Online application",
      "Signed S.W.E.A.T. Pledge",
      "Short video",
      "Tuition bill or cost statement",
      "Transcripts",
      "Two references"
    ],
    "opens": null,
    "deadline": "2026-10-31",
    "deadlineNote": "Apply any time until October 31; decisions go out in rounds (June, August, October, December).",
    "url": "https://www.mikeroweworks.org/scholarship/",
    "verifiedOn": "2026-10-01",
    "notes": "The range is the historical range of awards made to date."
  },
  {
    "id": "vfw-voice-of-democracy",
    "name": "Voice of Democracy",
    "provider": "Veterans of Foreign Wars (VFW)",
    "amount": "$35,000 national first prize; smaller state and local awards",
    "amountMax": 35000,
    "renewable": false,
    "kind": "merit",
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
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Students in grades 9 to 12 who record a 3 to 5 minute audio essay on the year's patriotic theme and turn it in to a local VFW Post.",
    "requires": [
      "Recorded audio essay on the theme 'What a Veteran Taught Me About America'",
      "2026-27 entry form",
      "Submission to a local VFW Post"
    ],
    "opens": null,
    "deadline": "2026-10-31",
    "deadlineNote": "Entries due to the local VFW Post by midnight, Oct 31, 2026.",
    "url": "https://www.vfw.org/community/youth-and-education/youth-scholarships",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "regeneron-science-talent-search",
    "name": "Regeneron Science Talent Search",
    "provider": "Society for Science",
    "amount": "$2,000 for 300 scholars; at least $25,000 for 40 finalists; top award $250,000",
    "amountMax": 250000,
    "renewable": false,
    "kind": "field",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Students in their last year of high school in the US (any citizenship) who completed an original, independent research project.",
    "requires": [
      "Research report",
      "Short essays",
      "Educator recommendation",
      "Project recommendation",
      "Transcript",
      "Test scores optional"
    ],
    "opens": "2026-06-01",
    "deadline": "2026-11-05",
    "deadlineNote": "Regeneron STS 2027 application closes Nov 5, 2026 at 8 pm ET.",
    "url": "https://www.societyforscience.org/regeneron-sts/",
    "verifiedOn": "2026-10-01",
    "notes": "Research done in any year of high school is eligible, but only seniors may apply."
  },
  {
    "id": "jack-kent-cooke-college-scholarship",
    "name": "Jack Kent Cooke College Scholarship",
    "provider": "Jack Kent Cooke Foundation",
    "amount": "Up to $55,000 per year",
    "amountMax": 220000,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 3.75,
    "eligibility": "High school seniors with a 3.75 unweighted GPA or higher and family income up to $95,000 who want to attend a four-year college.",
    "requires": [
      "Online application",
      "Essays",
      "Two teacher recommendations",
      "Counselor recommendation",
      "Unofficial transcript",
      "SAT, ACT, AP or IB score"
    ],
    "opens": "2026-08",
    "deadline": "2026-11-11",
    "deadlineNote": "2027 cycle closes Nov 11, 2026; semifinalists announced Jan 2027, recipients March 2027.",
    "url": "https://www.jkcf.org/our-scholarships/college-scholarship-program/",
    "verifiedOn": "2026-10-01",
    "notes": "Total assumes four years at the stated $55,000 per year."
  },
  {
    "id": "point-flagship-scholarship",
    "name": "Point Flagship Scholarship",
    "provider": "Point Foundation",
    "amount": "Up to $15,000",
    "amountMax": 15000,
    "renewable": true,
    "kind": "identity",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": 3.3,
    "eligibility": "LGBTQ+ students and allies who are at least high school seniors, have a 3.3 GPA or higher, and will enroll full time at an accredited not-for-profit US college.",
    "requires": [
      "Online application",
      "Essays",
      "Recommendations",
      "Transcript"
    ],
    "opens": "2026-09-09",
    "deadline": "2026-11-19",
    "deadlineNote": "2027 cycle opened Sept 9 and closes Nov 19, 2026 at 5 pm PST.",
    "url": "https://pointfoundation.org/scholarships/flagship",
    "verifiedOn": "2026-10-01",
    "notes": "The page does not say whether $15,000 is per year or total."
  },
  {
    "id": "nhs-scholarship",
    "name": "NHS Scholarship",
    "provider": "National Honor Society (NASSP)",
    "amount": "$2 million in scholarships to 600 students; tiers not posted",
    "amountMax": null,
    "renewable": null,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "High school seniors who are active members of a National Honor Society chapter, verified by their adviser, and plan to attend a US college, military institute or trade school.",
    "requires": [
      "Online application",
      "NHS account verified by chapter adviser",
      "Essays",
      "Adviser endorsement"
    ],
    "opens": "2026-09-03",
    "deadline": "2026-11-20",
    "deadlineNote": "2026-27 cycle closes Nov 20, 2026 at 5 pm ET.",
    "url": "https://www.nationalhonorsociety.org/students/the-nhs-scholarship/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "coolidge-scholarship",
    "name": "Coolidge Scholarship",
    "provider": "Calvin Coolidge Presidential Foundation",
    "amount": "Full ride: tuition, room, board and expenses for four years",
    "amountMax": null,
    "renewable": true,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Current high school juniors who are US citizens or permanent residents and will start college full time in fall 2028; usable at any accredited US college.",
    "requires": [
      "Online application",
      "Essays",
      "Letters of recommendation",
      "Transcript"
    ],
    "opens": "2026-fall",
    "deadline": "2026-12-01",
    "deadlineNote": "2026-27 cycle deadline Dec 1, 2026 at 5 pm Pacific; finalists notified late January 2027.",
    "url": "https://coolidgescholars.org/",
    "verifiedOn": "2026-10-01",
    "notes": "One of the few full-ride awards juniors can apply for."
  },
  {
    "id": "hagan-scholarship",
    "name": "Hagan Scholarship",
    "provider": "Hagan Scholarship Foundation",
    "amount": "Up to $7,500 a semester for up to 8 semesters, plus $1,000 for college essentials",
    "amountMax": 60000,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 3.5,
    "eligibility": "High school seniors with a 3.5 GPA and household income of $100,000 or less who will attend a four-year not-for-profit college and have worked 240 hours in the year before college.",
    "requires": [
      "Online application",
      "Transcript",
      "Proof of 240 work hours",
      "Household income documents"
    ],
    "opens": "2026-09-01",
    "deadline": "2026-12-01",
    "deadlineNote": "Fall window closes Dec 1, 2026. A second window opens Jan 15, 2027 and closes March 15, 2027.",
    "url": "https://haganscholarships.org/",
    "verifiedOn": "2026-10-01",
    "notes": "The home page reads $125,000 income while the eligibility page reads $100,000; the lower figure is used."
  },
  {
    "id": "ron-brown-scholar-program",
    "name": "Ron Brown Scholar Program",
    "provider": "Ron Brown Scholar Fund",
    "amount": "$40,000 ($10,000 a year for four years)",
    "amountMax": 40000,
    "renewable": true,
    "kind": "identity",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "Black or African American high school seniors who are US citizens or permanent residents and show academic excellence, leadership, community service and financial need.",
    "requires": [
      "Online application",
      "Three essays",
      "Two recommendation letters",
      "Transcript",
      "Parents' tax returns"
    ],
    "opens": "2026-09-01",
    "deadline": "2026-12-01",
    "deadlineNote": "2027 cycle deadline Dec 1; supporting documents due Dec 15, 2026. Winners notified April 1, 2027.",
    "url": "https://ronbrown.org/apply/",
    "verifiedOn": "2026-10-01",
    "notes": "20 scholarships awarded each year."
  },
  {
    "id": "nj-governors-industry-vocations-scholarship",
    "name": "Governor's Industry Vocations Scholarship (NJ-GIVS)",
    "provider": "New Jersey HESAA",
    "amount": "Up to $2,000 a year for up to two years, after other aid",
    "amountMax": 4000,
    "renewable": true,
    "kind": "local",
    "fields": [
      "Skilled Trades"
    ],
    "grades": [
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "Women and students of color with a diploma or GED who have lived in New Jersey for 12 months, have household income under $60,000, and enroll in a construction-related program at a New Jersey county college, vocational school or approved trade school.",
    "requires": [
      "FAFSA or NJ Alternative Financial Aid Application",
      "NJ-GIVS application in NJFAMS"
    ],
    "opens": null,
    "deadline": "2026-12-01",
    "deadlineNote": "Due December 1 for the fall semester or June 1 for the spring semester. First come, first served.",
    "url": "https://www.hesaa.org/Pages/NJ-GIVS.aspx",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "scholastic-art-and-writing-awards",
    "name": "Scholastic Art & Writing Awards",
    "provider": "Alliance for Young Artists & Writers",
    "amount": "Portfolio scholarships up to $12,500; other awards $500 to $2,500",
    "amountMax": 12500,
    "renewable": false,
    "kind": "arts",
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
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Teens in grades 7 to 12, age 13 or older, who attend school in the US can enter art or writing; seniors can also submit a six-work portfolio for scholarships.",
    "requires": [
      "Online entry",
      "Artwork or writing submission",
      "$15 per entry or $40 per portfolio (fee waivers available)"
    ],
    "opens": "2026-10-01",
    "deadline": "2026-12-01",
    "deadlineNote": "2027 Awards opened Oct 1, 2026. Deadlines vary by region, from Dec 1, 2026 to Jan 4, 2027; use the Region Locator for New Jersey's date.",
    "url": "https://www.artandwriting.org/awards/how-to-enter/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "skillsusa-red-wing-build-the-future",
    "name": "Red Wing Build the Future Scholarship",
    "provider": "SkillsUSA",
    "amount": "$2,500",
    "amountMax": 2500,
    "renewable": false,
    "kind": "trade",
    "fields": [
      "Skilled Trades"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "SkillsUSA members who will continue into a trade school, community or technical college, apprenticeship or certificate program in construction, manufacturing, transportation or logistics.",
    "requires": [
      "Application on the MyKaleidoscope platform",
      "SkillsUSA membership"
    ],
    "opens": null,
    "deadline": "2026-12-11",
    "deadlineNote": "Posted deadline Dec 11, 2026.",
    "url": "https://www.skillsusa.org/membership-resources/scholarships-financial-aid/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "burger-king-scholars",
    "name": "Burger King Scholars Program",
    "provider": "Burger King Foundation",
    "amount": "$1,000 to $60,000",
    "amountMax": 60000,
    "renewable": null,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "High school seniors who want help paying for college or a vocational or technical school; judged on GPA, work experience, activities, financial need and community service.",
    "requires": [
      "Online application at burgerking.scholarsapply.org",
      "Transcript or GPA verification"
    ],
    "opens": "2026-10-15",
    "deadline": "2026-12-15",
    "deadlineNote": "2027-28 cycle opens Oct 15, 2026 and closes when 30,000 applications are in or on Dec 15, 2026, whichever comes first. Apply early.",
    "url": "https://www.burgerkingfoundation.org/programs/burger-king-sm-scholars",
    "verifiedOn": "2026-10-01",
    "notes": "Most awards are $1,000; three $60,000 top awards."
  },
  {
    "id": "dell-scholars",
    "name": "Dell Scholars Program",
    "provider": "Michael & Susan Dell Foundation",
    "amount": "$20,000 plus a laptop, book credits and emergency funds",
    "amountMax": 20000,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "TX"
    ],
    "needBased": true,
    "minGpa": 2.4,
    "eligibility": "Pell-eligible seniors graduating from a Texas high school with at least a 2.4 GPA who took part in an approved college readiness program and will attend a four-year public college in Texas.",
    "requires": [
      "Online application",
      "Transcript (finalists)",
      "FAFSA Submission Summary (finalists)"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-01-12",
    "deadlineNote": "2027 cycle opens Oct 1, 2026 and closes Jan 12, 2027.",
    "url": "https://www.dellscholars.org/scholarship/",
    "verifiedOn": "2026-10-01",
    "notes": "Texas only."
  },
  {
    "id": "jackie-robinson-foundation-scholarship",
    "name": "Jackie Robinson Foundation Scholarship",
    "provider": "Jackie Robinson Foundation",
    "amount": "Up to $35,000 over four years",
    "amountMax": 35000,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "US citizen high school seniors with strong grades, leadership, community service and financial need who will attend a four-year US college and have an SAT or ACT score.",
    "requires": [
      "Online application",
      "Three brief essays",
      "One recommendation",
      "Transcript",
      "SAT or ACT scores",
      "CSS Profile"
    ],
    "opens": "2026-09-01",
    "deadline": "2027-01-14",
    "deadlineNote": "2027 application closes Jan 14, 2027 at 5 pm EST.",
    "url": "https://www.jackierobinson.org/apply/",
    "verifiedOn": "2026-10-01",
    "notes": "About 60 awards a year, with mentoring and a leadership conference."
  },
  {
    "id": "nj-tuition-aid-grant",
    "name": "Tuition Aid Grant (TAG)",
    "provider": "New Jersey HESAA",
    "amount": "Up to $14,404 a year, depending on the college and your family's need",
    "amountMax": 14404,
    "renewable": true,
    "kind": "local",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "New Jersey residents of at least 12 months with financial need who enroll full time at an approved New Jersey college; it covers part of tuition and renews while you make progress.",
    "requires": [
      "FAFSA or NJ Alternative Financial Aid Application",
      "Complete State Record in NJFAMS"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-02-15",
    "deadlineNote": "For seniors entering college in fall 2027 the 2027-28 deadline is not posted yet; HESAA's recent pattern is Sept 15 after graduation. The 2027-28 FAFSA opens Oct 1, 2026.",
    "url": "https://www.hesaa.org/Pages/TAG.aspx",
    "verifiedOn": "2026-10-01",
    "notes": "2026-27 table: county colleges about $1,280 to $3,098; state colleges up to $9,496; Rutgers up to $10,964; independent colleges up to $14,404."
  },
  {
    "id": "nj-stars",
    "name": "NJ STARS",
    "provider": "New Jersey HESAA",
    "amount": "Tuition at your county college for up to five semesters, after other grants",
    "amountMax": null,
    "renewable": true,
    "kind": "local",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "New Jersey residents who rank in the top 15 percent of their class at the end of junior or senior year and enroll full time at their home county college within five semesters of graduation.",
    "requires": [
      "Admission to your home county college",
      "FAFSA or NJ Alternative Financial Aid Application",
      "Class rank verification from your high school"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-02-15",
    "deadlineNote": "Uses the state financial aid deadlines; 2027 graduates follow the 2027-28 dates, not yet posted.",
    "url": "https://www.hesaa.org/Pages/NJScholarships.aspx",
    "verifiedOn": "2026-10-01",
    "notes": "Keep a 3.0 GPA by the third semester to renew. NJ STARS II then gives $2,500 a year to transfer to a four-year NJ college."
  },
  {
    "id": "nj-governors-urban-scholarship",
    "name": "Governor's Urban Scholarship",
    "provider": "New Jersey HESAA",
    "amount": "Set each year by the State budget (historically $1,000 a year)",
    "amountMax": null,
    "renewable": true,
    "kind": "local",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": true,
    "minGpa": 3.0,
    "eligibility": "Students in the top 5 percent of their class with a 3.0 GPA at the end of junior year who live in one of the designated New Jersey cities and enroll full time at an approved New Jersey college.",
    "requires": [
      "FAFSA or NJ Alternative Financial Aid Application by the State deadline",
      "Class rank and GPA verification"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-02-15",
    "deadlineNote": "Follows the state financial aid deadlines; 2027-28 dates not yet posted.",
    "url": "https://www.hesaa.org/Pages/GUS.aspx",
    "verifiedOn": "2026-10-01",
    "notes": "Designated cities include Newark, Jersey City, Paterson, Camden, Trenton, Plainfield and others; confirm the list on the page."
  },
  {
    "id": "horatio-alger-national-scholarship",
    "name": "Horatio Alger National Scholarship",
    "provider": "Horatio Alger Association",
    "amount": "$25,000 (105 scholarships)",
    "amountMax": 25000,
    "renewable": null,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 2.0,
    "eligibility": "US citizen high school juniors with family income of $100,000 or less and at least a 2.0 GPA who have overcome adversity, serve their community, and plan to earn a bachelor's degree right after high school.",
    "requires": [
      "Online application",
      "Essay responses",
      "Support Form (a non-relative adult)",
      "Counselor Certification Form",
      "Parent income documents"
    ],
    "opens": null,
    "deadline": "2027-03-01",
    "deadlineNote": "Open now through March 1 for high school juniors (12 pm ET).",
    "url": "https://horatioalger.org/scholarships-and-services/undergraduate-scholarships/",
    "verifiedOn": "2026-10-01",
    "notes": "One application covers every Horatio Alger program you qualify for, including state scholarships."
  },
  {
    "id": "nths-byf-construction-craft-scholarship",
    "name": "NCCER / Build Your Future Construction Craft Scholarship",
    "provider": "National Technical Honor Society with NCCER",
    "amount": "$2,000 (five a year)",
    "amountMax": 2000,
    "renewable": false,
    "kind": "trade",
    "fields": [
      "Skilled Trades"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "Current National Technical Honor Society members who are high school seniors or postsecondary students studying a construction-related trade.",
    "requires": [
      "NTHS membership",
      "Online application at nths.org/scholarships"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-04-01",
    "deadlineNote": "Available October 1 to April 1 each year.",
    "url": "https://nths.org/scholarships",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "cameron-impact-scholarship",
    "name": "Cameron Impact Scholarship",
    "provider": "Bryan Cameron Education Foundation",
    "amount": "Full tuition, fees and books for four years at any accredited US college",
    "amountMax": null,
    "renewable": true,
    "kind": "merit",
    "fields": [
      "Any",
      "Public Service & Law"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": 3.7,
    "eligibility": "US citizens who are current juniors (class of 2028) with a 3.7 unweighted GPA who lead, serve their community and plan to attend a four-year US college full time.",
    "requires": [
      "Online application",
      "Two letters of recommendation (one from your school)",
      "Transcript"
    ],
    "opens": "2027-02-01",
    "deadline": "2027-05-01",
    "deadlineNote": "Class of 2028 application opens Feb 1, 2027 and closes at 3,000 applications or May 1, 2027, whichever comes first.",
    "url": "https://www.bryancameroneducationfoundation.org/scholarship",
    "verifiedOn": "2026-10-01",
    "notes": "15 scholars a year; about a quarter reserved for students heading into public service."
  },
  {
    "id": "amazon-future-engineer-scholarship",
    "name": "Amazon Future Engineer Scholarship",
    "provider": "Amazon",
    "amount": "Up to $10,000 a year for four years, plus a paid Amazon internship",
    "amountMax": 40000,
    "renewable": true,
    "kind": "field",
    "fields": [
      "Tech & Engineering"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 2.3,
    "eligibility": "High school seniors with financial need and at least a 2.3 GPA who are taking or have taken a computer science course and plan to study computer science or engineering.",
    "requires": [
      "Online application",
      "Transcript",
      "Financial information",
      "Essays"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "2025-26 applications are closed; 2026-27 dates not posted as of Oct 1, 2026. Past cycles opened in late October and closed in mid December.",
    "url": "https://www.amazonfutureengineer.com/scholarships",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "equitable-excellence-scholarship",
    "name": "Equitable Excellence Scholarship",
    "provider": "Equitable Foundation",
    "amount": "$5,000 a year for up to four years ($20,000 total)",
    "amountMax": 20000,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": 2.5,
    "eligibility": "High school seniors in the US with at least a 2.5 GPA and financial need who plan to enroll full time at a two- or four-year US college and want to be a force for good in their community.",
    "requires": [
      "Online application via Scholarship America",
      "Transcript",
      "First two pages of the most recent IRS Form 1040",
      "Essay"
    ],
    "opens": "2026-10",
    "deadline": null,
    "deadlineNote": "Applications normally open in October; the 2027 dates were not posted as of Oct 1, 2026.",
    "url": "https://equitable.com/foundation/equitable-excellence-scholarship",
    "verifiedOn": "2026-10-01",
    "notes": "Up to 100 awards. Each winner also names a teacher who receives a $500 gift card."
  },
  {
    "id": "taco-bell-live-mas-scholarship",
    "name": "Live Más Scholarship",
    "provider": "Taco Bell Foundation",
    "amount": "$25,000 shown for featured 2026 scholars; range not stated",
    "amountMax": 25000,
    "renewable": true,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      10,
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "Legal US residents ages 16 to 26 who are on track for a diploma or GED or already in a two-year, four-year, trade or vocational program; no GPA or test scores needed.",
    "requires": [
      "Online application",
      "Video (30 seconds to 2 minutes) or essay (250 to 500 words)"
    ],
    "opens": "2026-fall",
    "deadline": null,
    "deadlineNote": "Applications for 2027 open this fall; no deadline posted yet.",
    "url": "https://tacobellfoundation.org/live-mas-scholarship/eligibilityfaq/",
    "verifiedOn": "2026-10-01",
    "notes": "Grades reflect the age-16 minimum."
  },
  {
    "id": "horatio-alger-career-technical-scholarship",
    "name": "Horatio Alger Career & Technical Scholarship",
    "provider": "Horatio Alger Association",
    "amount": "$2,500 (300 scholarships)",
    "amountMax": 2500,
    "renewable": false,
    "kind": "trade",
    "fields": [
      "Skilled Trades"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "Students who have faced adversity and financial need and plan to enroll in a career or technical program of two years or less at an accredited US school.",
    "requires": [
      "Online application",
      "Essay responses",
      "Income documents",
      "Support Form"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The CTE application is closed; the page says to come back for 2027 information. Prior cycles ran March 15 to June 15.",
    "url": "https://horatioalger.org/career-technical-education-scholarships/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "nsa-stokes-educational-scholarship",
    "name": "Stokes Educational Scholarship Program",
    "provider": "National Security Agency (NSA)",
    "amount": "Up to $30,000 a year for tuition and fees, plus a year-round salary in college",
    "amountMax": null,
    "renewable": true,
    "kind": "field",
    "fields": [
      "Tech & Engineering",
      "Science & Research"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": 3.0,
    "eligibility": "US citizen high school seniors with a 3.0 GPA and SAT 1200 or ACT 25 who can get a security clearance and will major in computer science, engineering, cybersecurity, data science, math or Chinese; you then work at NSA after college.",
    "requires": [
      "Application on the NSA job board",
      "Resume",
      "Transcript",
      "Two letters of recommendation",
      "SAT or ACT scores",
      "Essay"
    ],
    "opens": "2026-09-01",
    "deadline": null,
    "deadlineNote": "Applications are accepted from September 1 for the summer 2027 program; the close date is on the job board, not the page, and this cycle may have just closed.",
    "url": "https://www.nsa.gov/careers/student-programs/stokes-educational-scholarship-program/",
    "verifiedOn": "2026-10-01",
    "notes": "Comes with a work commitment after graduation."
  },
  {
    "id": "national-merit-scholarship-program",
    "name": "National Merit Scholarship Program",
    "provider": "National Merit Scholarship Corporation",
    "amount": "$2,500 National Merit Scholarships; college and corporate awards vary",
    "amountMax": 2500,
    "renewable": null,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Juniors enter by taking the PSAT/NMSQT in October; top scorers are named semifinalists the next fall and then apply.",
    "requires": [
      "PSAT/NMSQT in October of junior year",
      "Semifinalist application (essay, record, activities)",
      "School recommendation",
      "SAT or ACT confirming score"
    ],
    "opens": "2026-10",
    "deadline": null,
    "deadlineNote": "No application deadline; your school sets the October PSAT date. Semifinalists are named in September 2027.",
    "url": "https://www.nationalmerit.org/s/1758/interior.aspx?sid=1758&gid=2&pgid=424",
    "verifiedOn": "2026-10-01",
    "notes": "Figures from official NMSC documents; the site itself blocks automated reads. College-sponsored awards can be worth much more."
  }
];
