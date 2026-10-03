// Real scholarships, read from each provider's OFFICIAL page on 1 Oct 2026
// and re-read on 3 Oct 2026 for the detail page's sections; 47 more added the
// same day (New Jersey and New York first), each from the official page.
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": null,
    "eligibilityBullets": [
      "U.S. citizen or permanent resident",
      "In grades K to 12",
      "Goes to a U.S. school or home school",
      "Parent or guardian says yes in writing",
      "One entry per student"
    ],
    "awardCount": "5 finalists, 1 national winner",
    "payout": "One-time scholarship paid to the college for the student's account.",
    "selectedOn": [
      "Art skill",
      "Creativity and originality",
      "How well the doodle shows the theme",
      "Following the rules",
      "Public vote (national winner)"
    ],
    "notification": "Finalists hear by phone or email by May 31.",
    "obligations": "Return signed prize forms within days and mail in the original artwork if asked."
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
    "verifiedOn": "2026-10-03",
    "notes": "Financial need is considered but not stated as a requirement.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "U.S. citizen",
      "High school senior",
      "Minimum 3.0 GPA",
      "Shows leadership, drive, integrity and citizenship",
      "Plans to attend a 4-year U.S. college full time"
    ],
    "awardCount": null,
    "payout": "$10,000 a year, renewable for up to three more years.",
    "selectedOn": [
      "Leadership",
      "Drive",
      "Integrity",
      "Citizenship",
      "Activities and service",
      "Work",
      "Essay and goals statement"
    ],
    "notification": "Winners hear by email by April 30.",
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "Hispanic heritage",
      "U.S. citizen, permanent resident, or DACA",
      "Minimum 3.0 GPA in high school",
      "Files the FAFSA",
      "Plans to attend a 4-year college full time"
    ],
    "awardCount": "10,000 HSF Scholars a year",
    "payout": "Paid directly to students, $500 to $5,000 based on need, if funds allow.",
    "selectedOn": [
      "Merit",
      "Financial need (sets the amount)"
    ],
    "notification": "Scholars are selected in June.",
    "obligations": "Send required documents between June and November."
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": null,
    "eligibilityBullets": [
      "Age 18 or younger",
      "U.S. citizen or permanent resident living in the U.S.",
      "Finished a major project in an approved area",
      "Teams of two allowed",
      "Work must be your own"
    ],
    "awardCount": null,
    "payout": "Paid to an accredited school for tuition costs; must be used within 10 years.",
    "selectedOn": [
      "Scope and quality of the work",
      "How important the work is",
      "Your depth of knowledge"
    ],
    "notification": "All applicants hear by July 15.",
    "obligations": "Attend the awards events in Washington, D.C. in September with a parent."
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "U.S. citizen or permanent resident",
      "Pell Grant eligible",
      "Minimum 3.3 weighted GPA",
      "Plans to attend a 4-year college full time"
    ],
    "awardCount": null,
    "payout": "Covers the full cost of college that other aid does not cover.",
    "selectedOn": [
      "Grades (top 10% of class is ideal)",
      "Leadership",
      "Personal skills like motivation and grit"
    ],
    "notification": "Scholars are selected in April.",
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": "150 scholars selected each year.",
    "levels": null,
    "eligibilityBullets": [
      "High school or home school senior",
      "U.S. citizen, national, permanent resident, refugee or asylee",
      "Minimum 3.0 GPA",
      "School is in the U.S. or a DoD school",
      "Not a Coca-Cola employee's child or grandchild"
    ],
    "awardCount": "150 scholars a year",
    "payout": "One-time $20,000; up to 10 years to use it, with deferral allowed.",
    "selectedOn": [
      "Leadership",
      "Grades",
      "Service"
    ],
    "notification": "Scholars are named in April.",
    "obligations": "Attend Coke Scholars Weekend in Atlanta."
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
    "verifiedOn": "2026-10-03",
    "notes": "Actual value depends on the college.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Goes to high school in the U.S.",
      "U.S. citizen or permanent resident (if abroad)",
      "Family income usually under $65,000 (family of four)",
      "Mostly A's in hard classes"
    ],
    "awardCount": null,
    "payout": "Full four-year scholarship paid by the partner college; no loans.",
    "selectedOn": [
      "Grades in hard classes",
      "Writing",
      "Curiosity",
      "Low-income background",
      "Grit and drive"
    ],
    "notification": "Match results come out on Match Day, December 1.",
    "obligations": "If you match, you are expected to attend that college."
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
    "verifiedOn": "2026-10-03",
    "notes": "Four states only.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Senior in CO, NM, UT or WY",
      "U.S. citizen or permanent resident",
      "Minimum 3.0 unweighted GPA",
      "ACT 18 or SAT 490 in each part",
      "Family income $100,000 or less"
    ],
    "awardCount": null,
    "payout": "Renewable each year for four years; amount depends on the college.",
    "selectedOn": [
      "Character",
      "Leadership",
      "Service",
      "Academic promise"
    ],
    "notification": "Scholars are announced in late March.",
    "obligations": "Attend the orientation conference in June."
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
    "verifiedOn": "2026-10-03",
    "notes": "The range is the historical range of awards made to date.",
    "levels": [
      "trade",
      "2-year"
    ],
    "eligibilityBullets": [
      "U.S. citizen",
      "High school senior or graduate",
      "Program is two years or less",
      "School is accredited",
      "Signs the S.W.E.A.T. Pledge"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": [
      "Work ethic",
      "Video",
      "References",
      "Pledge answers"
    ],
    "notification": "Decisions go out two months after each deadline (June, August, October, December).",
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year",
      "trade"
    ],
    "eligibilityBullets": [
      "In grades 9 to 12",
      "Goes to high school or home study in the U.S.",
      "U.S. citizen or permanent resident (or applied)",
      "Under age 20",
      "Your own essay, your own voice"
    ],
    "awardCount": null,
    "payout": "National awards are paid directly to the winner's college or vocational/technical school.",
    "selectedOn": [
      "Originality (35 points)",
      "Delivery (35 points)",
      "Content (30 points)"
    ],
    "notification": "Ask the VFW Post where you entered about advancing; national winners are told their placement.",
    "obligations": "State winners agree to attend a leadership trip to Valley Forge."
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
    "verifiedOn": "2026-10-03",
    "notes": "Research done in any year of high school is eligible, but only seniors may apply.",
    "levels": null,
    "eligibilityBullets": [
      "In last year of high school",
      "Lives and goes to school in the U.S.",
      "Any citizenship",
      "Original research project",
      "Solo projects only, no teams"
    ],
    "awardCount": "300 scholars, 40 finalists",
    "payout": "Scholars get $2,000 and their school gets $2,000; finalists get at least $25,000.",
    "selectedOn": [
      "Research project",
      "STEM knowledge",
      "Creativity and problem solving"
    ],
    "notification": "Top 300 named Jan 7, 2027; top 40 named Jan 21, 2027.",
    "obligations": "Finalists go to Finals Week in Washington, D.C. (March 11 to 17, 2027)."
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
    "verifiedOn": "2026-10-03",
    "notes": "Total assumes four years at the stated $55,000 per year.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Lives in the U.S. or a U.S. territory",
      "Minimum 3.75 unweighted GPA",
      "Family income up to $95,000",
      "Has an SAT, ACT, AP or IB score"
    ],
    "awardCount": "60 new College Scholars in 2026",
    "payout": "Up to $55,000 a year, sent to the school, renewed each year.",
    "selectedOn": [
      "Grades and ability",
      "Financial need",
      "Persistence",
      "Leadership"
    ],
    "notification": null,
    "obligations": "Keep a 3.0 GPA, work with an adviser, and attend Scholars Weekend."
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
    "verifiedOn": "2026-10-03",
    "notes": "The page does not say whether $15,000 is per year or total.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "LGBTQ+ student or ally",
      "At least a high school senior",
      "Minimum 3.3 GPA",
      "Full time at a not-for-profit U.S. college",
      "Not a fully online program"
    ],
    "awardCount": null,
    "payout": "Up to $15,000 for tuition and fees, for up to four years; no summer study.",
    "selectedOn": null,
    "notification": null,
    "obligations": "Attend an in-person summer conference and one virtual program each term."
  },
  {
    "id": "nhs-scholarship",
    "name": "NHS Scholarship",
    "provider": "National Honor Society (NASSP)",
    "amount": "$3,200 to $25,000 (575 semifinalists get $3,200, 24 finalists $5,625, 1 top finalist $25,000)",
    "amountMax": 25000,
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year",
      "trade"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Active NHS chapter member",
      "NHS account verified by adviser",
      "Plans to attend a U.S. college, military institute or trade school"
    ],
    "awardCount": "600 students",
    "payout": "One-time check made out to the college, mailed in late July or early August.",
    "selectedOn": [
      "Scholarship",
      "Service",
      "Leadership",
      "Character"
    ],
    "notification": "Winners and advisers hear in mid-January.",
    "obligations": "Fill out a Scholarship Acceptance Form."
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
    "deadlineNote": "2026-27 cycle deadline Dec 1, 2026 at 5 pm Pacific. Semifinalists hear in late January 2027; finalists are called in spring 2027.",
    "url": "https://coolidgescholars.org/",
    "verifiedOn": "2026-10-03",
    "notes": "One of the few full-ride awards juniors can apply for.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "High school junior",
      "U.S. citizen or permanent resident",
      "Starts college full time in fall 2028",
      "First-time undergraduate",
      "Not family of a staff member or big donor"
    ],
    "awardCount": null,
    "payout": "Full tuition, room, board and fees for four years, paid to the college, plus a yearly book stipend.",
    "selectedOn": [
      "Strong grades in the hardest classes",
      "Interest in public policy",
      "Humility",
      "Service"
    ],
    "notification": "All applicants hear by June 1, 2027.",
    "obligations": "Attend an orientation week in Vermont in summer 2027."
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
    "verifiedOn": "2026-10-03",
    "notes": "The home page reads $125,000 income while the eligibility page reads $100,000; the lower figure is used.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "In the high school graduating class",
      "Minimum 3.50 GPA",
      "Household income $100,000 or less",
      "Works 240 hours before college starts",
      "Enrolls at a 4-year not-for-profit college"
    ],
    "awardCount": "Up to 1,500 for 2027-28",
    "payout": "Up to $7,500 each semester for up to 8 semesters, plus $1,000 for essentials.",
    "selectedOn": [
      "Grades",
      "Financial need"
    ],
    "notification": "All applicants hear their status after review; no dates given.",
    "obligations": "Meet GPA and credit rules, work 240 hours, and attend required workshops."
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
    "url": "https://ronbrown.org/ron-brown-scholarship/",
    "verifiedOn": "2026-10-03",
    "notes": "20 scholarships awarded each year.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "Black or African American",
      "High school senior",
      "U.S. citizen or permanent resident",
      "Strong grades and leadership",
      "Does community service",
      "Has financial need"
    ],
    "awardCount": "20 scholarships a year",
    "payout": "$10,000 a year for four years.",
    "selectedOn": [
      "Grades",
      "Leadership",
      "Writing",
      "Community service",
      "Financial need"
    ],
    "notification": "Winners hear on April 1.",
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Woman or student of color",
      "Lived in New Jersey 12 months",
      "Has a diploma or GED",
      "Household income under $60,000",
      "Construction-related program in New Jersey"
    ],
    "awardCount": null,
    "payout": "Up to $2,000 a year for up to two years, after other aid.",
    "selectedOn": [
      "First come, first served"
    ],
    "notification": null,
    "obligations": "Keep making satisfactory academic progress."
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": null,
    "eligibilityBullets": [
      "In grades 7 to 12",
      "Age 13 or older",
      "Lives in the U.S., a territory, or Canada (not Quebec)",
      "Portfolios are for seniors only"
    ],
    "awardCount": "8 art and 8 writing Gold Medal Portfolios",
    "payout": null,
    "selectedOn": [
      "Originality",
      "Skill",
      "A personal voice or vision"
    ],
    "notification": "Regions post winners at different times; check your online account.",
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "SkillsUSA member",
      "Going on to more training after high school",
      "Field is construction, manufacturing, transportation or logistics"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": null,
    "notification": null,
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": "Most awards are $1,000; three $60,000 top awards.",
    "levels": [
      "4-year",
      "trade"
    ],
    "eligibilityBullets": [
      "High school senior (or BK employee or family)",
      "Going to college or vocational/technical school"
    ],
    "awardCount": "Nearly 4,500 students in 2025",
    "payout": "One check made out to the student's school, sent by late August.",
    "selectedOn": [
      "GPA",
      "Work experience",
      "Activities",
      "Financial need",
      "Community service"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "dell-scholars",
    "name": "Dell Scholars Program",
    "provider": "Michael & Susan Dell Foundation",
    "amount": "$20,000 plus a laptop, book credits and emergency funds",
    "amountMax": 20000,
    "renewable": null,
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
    "url": "https://www.dellscholars.org/students/",
    "verifiedOn": "2026-10-03",
    "notes": "Texas only.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "Senior at a Texas high school",
      "Pell Grant eligible",
      "Minimum 2.4 GPA",
      "In an approved college readiness program in grades 11 and 12",
      "Plans to attend a 4-year public Texas college"
    ],
    "awardCount": "500 scholars a year",
    "payout": "$20,000 flexible scholarship plus a laptop, book credits and emergency funds.",
    "selectedOn": [
      "Sense of purpose",
      "Career focus",
      "Perseverance",
      "Self-motivation"
    ],
    "notification": "Finalists named Jan 21, 2027; scholars announced May 20, 2027.",
    "obligations": "Regular check-ins with advisors."
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
    "verifiedOn": "2026-10-03",
    "notes": "About 60 awards a year, with mentoring and a leadership conference.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "U.S. citizen",
      "Has financial need",
      "Strong grades",
      "Leadership and community service",
      "Plans to attend an approved 4-year U.S. college"
    ],
    "awardCount": "About 60 a year",
    "payout": "Up to $35,000, paid out over four years.",
    "selectedOn": [
      "Grades",
      "Leadership",
      "Community service",
      "Financial need"
    ],
    "notification": "Applicants hear their status by the end of June.",
    "obligations": "Do community service through college and attend the yearly Mentoring and Leadership Conference in New York City."
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
    "verifiedOn": "2026-10-03",
    "notes": "2026-27 table: county colleges about $1,280 to $3,098; state colleges up to $9,496; Rutgers up to $10,964; independent colleges up to $14,404.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Lived in New Jersey 12 months (or NJ Dreamer rules)",
      "Has financial need",
      "Full time at an approved NJ college",
      "Files the FAFSA or NJ Alternative Application"
    ],
    "awardCount": null,
    "payout": "Yearly grant toward tuition; up to 5 payments for an associate's, up to 9 for a bachelor's.",
    "selectedOn": [
      "Financial need",
      "Type of college"
    ],
    "notification": null,
    "obligations": "File the FAFSA or NJ Alternative Application again each year by the state deadline."
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
    "verifiedOn": "2026-10-03",
    "notes": "Keep a 3.0 GPA by the third semester to renew. NJ STARS II can then help you transfer to a four-year NJ college.",
    "levels": [
      "2-year"
    ],
    "eligibilityBullets": [
      "New Jersey resident 12 months",
      "Top 15% of class (junior or senior year)",
      "Full time at your home county college",
      "Starts within five semesters of graduation",
      "Files the FAFSA or NJ Alternative Application"
    ],
    "awardCount": null,
    "payout": "Tuition only, after other grants, for up to five semesters; no summer.",
    "selectedOn": [
      "Class rank"
    ],
    "notification": "Your county college tells you if you qualify.",
    "obligations": "Keep a 3.0 GPA by the third semester and stay full time."
  },
  {
    "id": "nj-governors-urban-scholarship",
    "name": "Governor's Urban Scholarship",
    "provider": "New Jersey HESAA",
    "amount": "Set each year by the State budget",
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
    "verifiedOn": "2026-10-03",
    "notes": "Designated cities include Newark, Jersey City, Paterson, Camden, Trenton, Plainfield and others; confirm the list on the page.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Top 5% of class",
      "Minimum 3.0 GPA at end of junior year",
      "Lives in a listed NJ city",
      "Has financial need",
      "Lived in NJ 12 months",
      "Full time at an approved NJ college"
    ],
    "awardCount": null,
    "payout": "Half the yearly amount goes to the college each semester; amount set by the state budget.",
    "selectedOn": [
      "Class rank",
      "GPA",
      "Financial need"
    ],
    "notification": "No application; HESAA sends a notice to eligible students, who accept or decline.",
    "obligations": "Get a payment every semester, stay full time, and file aid forms each year."
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
    "verifiedOn": "2026-10-03",
    "notes": "One application covers every Horatio Alger program you qualify for, including state scholarships.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "U.S. citizen (green card not accepted)",
      "Full-time high school junior",
      "Minimum 2.0 GPA",
      "Family income $100,000 or less",
      "Has overcome hardship",
      "Does community service"
    ],
    "awardCount": "105 scholarships",
    "payout": "Request funds online each year; money goes straight to your college.",
    "selectedOn": [
      "Overcoming hardship",
      "Financial need",
      "Service and activities",
      "Integrity and perseverance"
    ],
    "notification": "Only winners are told, by email and mail in April or May.",
    "obligations": "Keep a 2.0 GPA and request your funds online each year."
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": null,
    "eligibilityBullets": [
      "Current NTHS member",
      "High school senior or college student",
      "Studies a construction-related field"
    ],
    "awardCount": "5 a year",
    "payout": null,
    "selectedOn": null,
    "notification": null,
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": "15 scholars a year; about a quarter reserved for students heading into public service.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "U.S. citizen",
      "In the class of 2028",
      "Minimum 3.7 unweighted GPA",
      "Leader with community service",
      "Plans to attend a 4-year U.S. college full time"
    ],
    "awardCount": "15 a year",
    "payout": "Full tuition, fees and books for four years; no room and board.",
    "selectedOn": [
      "Leadership",
      "Community service",
      "Activities",
      "Grades"
    ],
    "notification": "All applicants hear their status by September 15; winners are named in December 2027.",
    "obligations": "Attend a yearly awards ceremony for as long as you have the scholarship."
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Can work in the U.S.",
      "Minimum 2.3 GPA",
      "Has financial need",
      "Took a computer science class",
      "Plans a CS or engineering bachelor's"
    ],
    "awardCount": null,
    "payout": "Up to $10,000 a year of unmet need, renewable for up to three more years.",
    "selectedOn": null,
    "notification": null,
    "obligations": "Stay full time and in good standing to renew."
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
    "verifiedOn": "2026-10-03",
    "notes": "Each winner also names a teacher who receives a $500 gift card.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Lives in the U.S., D.C. or Puerto Rico",
      "Minimum 2.5 GPA",
      "Full time at a 2- or 4-year U.S. college",
      "Wants to help others go to college"
    ],
    "awardCount": null,
    "payout": "$5,000 a year, renewable for up to four years ($20,000 total).",
    "selectedOn": null,
    "notification": null,
    "obligations": "Agree to let Equitable share your name, photo and plans."
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
    "verifiedOn": "2026-10-03",
    "notes": "Grades reflect the age-16 minimum.",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Age 16 to 26",
      "Legal U.S. resident",
      "On track for a diploma or GED, or in school",
      "No GPA or test scores needed"
    ],
    "awardCount": null,
    "payout": "Paid to your school; renew by reapplying, up to four awards total.",
    "selectedOn": [
      "Passion and steps toward it",
      "Impact you want to make",
      "Live Mas spirit",
      "Financial need"
    ],
    "notification": "Winners hear in spring 2027.",
    "obligations": null
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
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "U.S. citizen",
      "Finished high school or GED by July 1",
      "Under age 35",
      "Household income $100,000 or less",
      "Associate's, certificate or diploma program"
    ],
    "awardCount": "300 scholarships",
    "payout": "Paid to the school each term after you request it online.",
    "selectedOn": [
      "Financial need",
      "Overcoming hardship"
    ],
    "notification": "Only winners are told, by email and mail in July or August.",
    "obligations": "Request funds online each term and stay in the program you were awarded for."
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
    "minGpa": null,
    "eligibility": "US citizen high school seniors (a 3.0 GPA is preferred) with SAT 1200 or ACT 25 who can get a security clearance and will major in AI, computer science, engineering, cybersecurity, data science, math or Chinese; you then work at NSA after college.",
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
    "verifiedOn": "2026-10-03",
    "notes": "Comes with a work commitment after graduation.",
    "levels": null,
    "eligibilityBullets": [
      "U.S. citizen",
      "High school senior",
      "Can get a security clearance",
      "SAT 1200 or ACT 25",
      "3.0 GPA or higher preferred",
      "Plans an approved major"
    ],
    "awardCount": null,
    "payout": "Up to $30,000 a year for tuition and fees, plus a year-round salary.",
    "selectedOn": null,
    "notification": null,
    "obligations": "Work for NSA after college for 1.5 times your years of study."
  },
  {
    "id": "national-merit-scholarship-program",
    "name": "National Merit Scholarship Program",
    "provider": "National Merit Scholarship Corporation",
    "amount": "$2,500 National Merit Scholarships; college and corporate awards vary",
    "amountMax": 2500,
    "renewable": false,
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
    "url": "https://www.nationalmerit.org/s/1758/interior.aspx?sid=1758&gid=2&pgid=1882",
    "verifiedOn": "2026-10-03",
    "notes": "Figures from official NMSC documents; the site itself blocks automated reads. College-sponsored awards can be worth much more.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school student in the U.S.",
      "Takes the PSAT/NMSQT by junior year",
      "Plans to start college by fall 2028",
      "Plans a full-time bachelor's degree"
    ],
    "awardCount": "About 6,700 Merit Scholarships, 2,500 of them $2,500 awards",
    "payout": "$2,500 award is one payment; college awards renew for four years.",
    "selectedOn": [
      "Academic record",
      "Essay",
      "Leadership and activities",
      "School recommendation"
    ],
    "notification": "Semifinalists hear in early September 2027; winners from March 2028.",
    "obligations": "Tell NMSC you will enroll full time at an accredited U.S. college."
  },
  {
    "id": "louis-bay-2nd-future-municipal-leaders-scholarship",
    "name": "Louis Bay 2nd Future Municipal Leaders Scholarship",
    "provider": "New Jersey State League of Municipalities",
    "amount": "$1,000 each for 3 winners",
    "amountMax": 1000,
    "renewable": false,
    "kind": "local",
    "fields": [
      "Any",
      "Public Service & Law"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "New Jersey high school juniors and seniors who plan to keep studying after high school. You write an essay about your hometown and turn it in to your own mayor's office.",
    "requires": [
      "Application form",
      "Essay of about 500 words on the year's theme",
      "Turn it in to your hometown mayor, not your school"
    ],
    "opens": "2026-01",
    "deadline": "2026-03-09",
    "deadlineNote": "2026 contest dates (essays to the mayor by March 9, 2026). The 2027 contest letter had not been posted as of Oct 3, 2026.",
    "url": "https://www.njlm.org/DocumentCenter/View/12238/Louis-Bay-2nd--Essay-Contest-2026-Application",
    "verifiedOn": "2026-10-03",
    "notes": "2026 theme: \"What I Like About My Hometown.\" Each town picks one semifinalist; the League picks 15 finalists and 3 winners.",
    "levels": null,
    "eligibilityBullets": [
      "New Jersey resident",
      "High school junior or senior",
      "Plans to continue school after high school",
      "Applies through the hometown mayor"
    ],
    "awardCount": "3 winners and 15 statewide finalists",
    "payout": "The League sends a $1,000 check to the mayor, who gives it to the winner at a hometown ceremony.",
    "selectedOn": [
      "Fit with the theme",
      "How well you explain it",
      "Originality",
      "Spelling and grammar"
    ],
    "notification": "Winners, finalists and semifinalists are announced around May 1.",
    "obligations": "Winning essays are printed in New Jersey Municipalities magazine."
  },
  {
    "id": "nj-hall-of-fame-arete-scholarship",
    "name": "New Jersey Hall of Fame Areté Scholarship",
    "provider": "New Jersey Hall of Fame",
    "amount": "Amount not stated for 2027 (past winners received $5,000 each)",
    "amountMax": null,
    "renewable": null,
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
    "needBased": null,
    "minGpa": null,
    "eligibility": "New Jersey high school seniors graduating in 2027 who are headed to college or trade school. You do not have to be at the top of your class, but you need a clear plan and a record of helping your community.",
    "requires": [
      "Online application",
      "Five short essay prompts",
      "Academic transcript",
      "Two letters of recommendation (one teacher, one coach, advisor or community leader)"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-02-28",
    "deadlineNote": null,
    "url": "https://njhalloffame.org/arete/",
    "verifiedOn": "2026-10-03",
    "notes": "Funded by a grant from ADP. The 2022 winners page lists $5,000 per winner; the 2027 page gives no dollar amount.",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Graduating from a New Jersey high school in 2027",
      "Going to college or trade school",
      "Shows effort in school, good character and community service",
      "Top class rank not required"
    ],
    "awardCount": "4 scholarships in 2027",
    "payout": null,
    "selectedOn": [
      "Academic engagement",
      "Moral character",
      "Commitment to community"
    ],
    "notification": "Winners are announced in May 2027.",
    "obligations": "Winners are honored at the Hall of Fame's yearly induction ceremony."
  },
  {
    "id": "nfb-new-jersey-scholarship",
    "name": "National Federation of the Blind of New Jersey Scholarship",
    "provider": "National Federation of the Blind of New Jersey",
    "amount": "$1,500 each, up to $6,000 in all",
    "amountMax": 1500,
    "renewable": false,
    "kind": "identity",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "Legally blind graduating seniors who will go to college full time in the fall, plus legally blind full-time college students. One application also enters you in the national NFB contest.",
    "requires": [
      "NFB scholarship application (one form covers the state and national programs)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The page says the deadline is March 31 each year but gives no year.",
    "url": "https://nfbnj.org/scholarship-program",
    "verifiedOn": "2026-10-03",
    "notes": "The page does not spell out a New Jersey residency rule; it is run by the NJ affiliate.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Legally blind",
      "Graduating senior going to college full time in the fall",
      "Or a full-time college student"
    ],
    "awardCount": "Up to 4 winners",
    "payout": null,
    "selectedOn": null,
    "notification": null,
    "obligations": "Finalists must attend the whole NFB of New Jersey state convention in October."
  },
  {
    "id": "njsiaa-scholar-athlete-award",
    "name": "NJSIAA Scholar-Athlete Award",
    "provider": "New Jersey State Interscholastic Athletic Association (NJSIAA)",
    "amount": "Over $192,500 shared by 385 honorees in 2026",
    "amountMax": null,
    "renewable": false,
    "kind": "athletic",
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
    "minGpa": 3.0,
    "eligibility": "Graduating seniors at NJSIAA member schools who play a varsity sport, have at least a 3.0 GPA and show strong citizenship. Each school picks one honoree.",
    "requires": [
      "Nomination by your school (one per school)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Nomination deadline is not posted. The 2026 luncheon was Sunday, May 17, 2026.",
    "url": "https://www.njsiaa.org/inside-njsiaa/njsiaa-awards",
    "verifiedOn": "2026-10-03",
    "notes": "Total and honoree count are from NJSIAA's 2026 congratulations post; the awards page says over $185,000 is given each year.",
    "levels": null,
    "eligibilityBullets": [
      "Graduating senior",
      "Cumulative GPA of 3.0 or higher",
      "Played an NJSIAA varsity sport",
      "Strong school and community citizenship"
    ],
    "awardCount": "1 honoree per member school (385 in 2026)",
    "payout": null,
    "selectedOn": [
      "Grades",
      "Varsity sport",
      "School and community citizenship"
    ],
    "notification": null,
    "obligations": "Honorees are recognized at the NJSIAA scholar-athlete luncheon in May."
  },
  {
    "id": "nj-community-college-opportunity-grant",
    "name": "Community College Opportunity Grant (CCOG)",
    "provider": "New Jersey HESAA",
    "amount": "Remaining tuition (up to 18 credits a term) and approved fees",
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
    "minGpa": null,
    "eligibility": "New Jersey residents with family income (AGI) of $65,000 or less who go to a New Jersey community college. It pays the tuition left after other grants, so community college can be free.",
    "requires": [
      "FAFSA or NJ Alternative Financial Aid Application",
      "Enroll in at least 6 credits a term"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The page lists Sept 15 for new fall students and April 15 for returning TAG students, with no year given.",
    "url": "https://www.hesaa.org/pages/ccog.aspx",
    "verifiedOn": "2026-10-03",
    "notes": "There is no separate application. Filing the FAFSA or NJ Alternative Application puts you in the running.",
    "levels": [
      "2-year"
    ],
    "eligibilityBullets": [
      "New Jersey resident",
      "Family AGI of $0 to $65,000",
      "At least 6 credits a term at a NJ community college",
      "No college degree yet"
    ],
    "awardCount": null,
    "payout": "Paid to your community college after other grants and scholarships are applied.",
    "selectedOn": [
      "Family income"
    ],
    "notification": null,
    "obligations": "Keep making satisfactory academic progress and file aid forms each year."
  },
  {
    "id": "nj-garden-state-guarantee",
    "name": "Garden State Guarantee (GSG)",
    "provider": "New Jersey HESAA",
    "amount": "$0 net tuition and fees in your third and fourth years",
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
    "minGpa": null,
    "eligibility": "New Jersey residents with family income (AGI) of $65,000 or less who attend a New Jersey public four-year college full time. It covers tuition and fees left after other aid in junior and senior year of college.",
    "requires": [
      "FAFSA or NJ Alternative Financial Aid Application"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Follows state aid filing deadlines; no date is printed on the GSG page.",
    "url": "https://www.hesaa.org/Pages/gsg.aspx",
    "verifiedOn": "2026-10-03",
    "notes": "Seniors do not apply separately; filing the FAFSA puts you in the running once you reach year three of college.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "New Jersey resident",
      "Family AGI of $0 to $65,000",
      "Full time (12+ credits) at a NJ public four-year college",
      "Working on a first bachelor's degree"
    ],
    "awardCount": null,
    "payout": "Covers tuition and fees not already paid by federal and state aid or scholarships.",
    "selectedOn": [
      "Family income"
    ],
    "notification": null,
    "obligations": "Stay full time and file aid forms each year."
  },
  {
    "id": "nj-educational-opportunity-fund",
    "name": "Educational Opportunity Fund (EOF)",
    "provider": "New Jersey Office of the Secretary of Higher Education",
    "amount": "$200 to $3,050 a year, plus tutoring and counseling",
    "amountMax": 3050,
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
    "eligibility": "New Jersey residents from low-income families who also faced educational hurdles. You apply through the EOF office at one of about 40 participating New Jersey colleges.",
    "requires": [
      "FAFSA or NJ Alternative Financial Aid Application",
      "Apply to the EOF program at your chosen college"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Each college sets its own EOF deadline.",
    "url": "https://www.nj.gov/highereducation/EOF/EOF_Eligibility.shtml",
    "verifiedOn": "2026-10-03",
    "notes": "2026-27 income cap for a household of 4: $64,300 gross income, $12,860 in assets. Each extra person adds $11,000 to the income limit.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "New Jersey resident for 12 months",
      "Low family income (2026-27 table)",
      "Educationally disadvantaged background",
      "Full time at a participating NJ college"
    ],
    "awardCount": null,
    "payout": "Yearly grant through your college, renewable while you stay eligible.",
    "selectedOn": [
      "Family income",
      "Educational background",
      "College's own EOF review"
    ],
    "notification": null,
    "obligations": "Take part in the college's EOF support program."
  },
  {
    "id": "pwc-nj-scholarship",
    "name": "Professional Women in Construction NJ Scholarship",
    "provider": "Professional Women in Construction, New Jersey Chapter",
    "amount": "At least 2 scholarships of $2,500",
    "amountMax": 2500,
    "renewable": null,
    "kind": "field",
    "fields": [
      "Skilled Trades",
      "Tech & Engineering"
    ],
    "grades": [
      12
    ],
    "states": [
      "NJ"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "High school seniors (and college or trade school students) studying architecture, engineering or a construction field. You must live in New Jersey or be related to an active PWC NJ member.",
    "requires": [
      "Online application"
    ],
    "opens": "2026-01-30",
    "deadline": "2026-03-20",
    "deadlineNote": "2026 cycle dates. The 2027 cycle had not been posted as of Oct 3, 2026.",
    "url": "https://www.pwc-nj.org/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "Graduate students cannot apply.",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "New Jersey resident, or relative of a PWC NJ member",
      "High school senior, college student or full-time trade school student",
      "Studying architecture, engineering or construction"
    ],
    "awardCount": "At least 2",
    "payout": "Paid directly to the school.",
    "selectedOn": null,
    "notification": "Winners hear in the spring; 2026 awards were given May 20, 2026 at the Women of Achievement Luncheon in Jersey City.",
    "obligations": null
  },
  {
    "id": "inspirasian-scholarship",
    "name": "InspirASIAN Scholarship",
    "provider": "InspirASIAN (formerly APCA)",
    "amount": "$2,000 national awards; $1,000 state awards in some states",
    "amountMax": 2000,
    "renewable": false,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "CA",
      "GA",
      "IL",
      "MO",
      "NV",
      "NJ",
      "TX",
      "WA"
    ],
    "needBased": null,
    "minGpa": 3.4,
    "eligibility": "Graduating high school seniors with at least a 3.4 unweighted GPA who live in a state with an InspirASIAN chapter, including New Jersey. You do not need to be Asian American or tied to AT&T.",
    "requires": [
      "Essay on the theme \"Making a Difference in My Community\"",
      "Accomplishment spreadsheet",
      "GPA entry (finalists send transcripts)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The FAQ lists a January 31 deadline, but the year shown on the page is out of date. Check the site for the 2027 date.",
    "url": "https://www.inspirasian.us/scholarship-faqs/",
    "verifiedOn": "2026-10-03",
    "notes": "Illinois covers East St. Louis only. Students from other states qualify if an InspirASIAN member sponsors them.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Graduating high school senior",
      "Unweighted GPA of 3.40 or higher",
      "US citizen or permanent resident",
      "Lives in CA, GA, MO, East St. Louis IL, NV, NJ, TX or WA",
      "Going to a 2-year or 4-year college in the fall"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": [
      "Essay",
      "Accomplishments",
      "Grades"
    ],
    "notification": "Winners are called and sent a letter before the end of May.",
    "obligations": null
  },
  {
    "id": "uncf-fidelity-scholars-program",
    "name": "Fidelity Scholars Program",
    "provider": "UNCF",
    "amount": "Amount not stated on the page",
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
      "CO",
      "DC",
      "FL",
      "KY",
      "MA",
      "NJ",
      "NM",
      "NC",
      "OH",
      "RI",
      "NH",
      "UT",
      "TX"
    ],
    "needBased": true,
    "minGpa": 2.5,
    "eligibility": "Seniors with a 2.5 to 3.59 unweighted GPA who have financial need and will attend a four-year college in their home state. Open to residents of 12 states and DC, including New Jersey.",
    "requires": [
      "UNCF online profile",
      "Application"
    ],
    "opens": "2026-10-01",
    "deadline": null,
    "deadlineNote": "Application opens Oct 1, 2026 for the 2027-28 program; the closing date was not posted.",
    "url": "https://uncf.org/pages/fidelity-scholars-program-register-now",
    "verifiedOn": "2026-10-03",
    "notes": "Open to students of any background; the GPA band (2.5 to 3.59) is a firm rule.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school senior by Oct 1, 2026",
      "Unweighted GPA of 2.5 to 3.59 (or GED)",
      "Pell eligible or shows financial need",
      "Lives in one of the listed states or DC",
      "Will attend a four-year college in your home state"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": [
      "Financial need",
      "GPA range"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "nys-scholarships-for-academic-excellence",
    "name": "NYS Scholarships for Academic Excellence",
    "provider": "New York State HESC",
    "amount": "$500 or $1,500 a year",
    "amountMax": 1500,
    "renewable": true,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NY"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "Top graduating seniors at New York high schools, picked by their school based on Regents exam grades. You must go to a New York college full time in the fall after graduation.",
    "requires": [
      "Nomination by your high school",
      "FAFSA and TAP application (or NYS DREAM Act application) each year"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "There is no separate application. Ask your high school for its nomination dates.",
    "url": "https://hesc.ny.gov/SAE",
    "verifiedOn": "2026-10-03",
    "notes": "No income limit.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Graduating from a registered New York high school",
      "Strong Regents exam grades",
      "NY resident for 12 months",
      "Full time at an approved New York college the fall after graduation"
    ],
    "awardCount": null,
    "payout": "Paid each year for up to 4 years (2 for an associate's, 5 for approved five-year programs).",
    "selectedOn": [
      "Regents exam grades",
      "School nomination"
    ],
    "notification": null,
    "obligations": "Stay full time in good standing and file the FAFSA and TAP each year."
  },
  {
    "id": "nys-stem-incentive-program",
    "name": "NYS STEM Incentive Program",
    "provider": "New York State HESC",
    "amount": "Full SUNY or CUNY tuition (up to the average SUNY in-state tuition)",
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
      "NY"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "New York seniors in the top 10 percent of their class who go to SUNY or CUNY full time for a STEM degree. You must then live and work in a STEM job in New York for 5 years.",
    "requires": [
      "FAFSA and TAP application",
      "STEM Incentive application",
      "High school transcript",
      "High School Verification Form"
    ],
    "opens": null,
    "deadline": "2027-08-16",
    "deadlineNote": "Deadline for the 2027-28 school year.",
    "url": "https://hesc.ny.gov/find-aid/nys-grants-scholarships/nys-science-technology-engineering-and-mathematics-stem-incentive",
    "verifiedOn": "2026-10-03",
    "notes": "If you move out of New York before finishing the work rule, the award turns into a 10-year loan with interest.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Top 10 percent of your New York high school class",
      "NY resident for 12 months",
      "Full time at SUNY or CUNY in an approved STEM major",
      "Start college the fall after graduation"
    ],
    "awardCount": null,
    "payout": "Covers tuition each year for up to 4 years (5 for approved programs), minus other tuition aid.",
    "selectedOn": [
      "Class rank"
    ],
    "notification": null,
    "obligations": "Live in New York and work in an approved STEM job for 5 years after college, and keep a 2.5 GPA."
  },
  {
    "id": "nys-excelsior-scholarship",
    "name": "Excelsior Scholarship",
    "provider": "New York State HESC",
    "amount": "Remaining SUNY or CUNY tuition after other aid",
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
      "NY"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "New York residents with family income of $125,000 or less who attend SUNY or CUNY full time and finish 30 credits a year. It pays the tuition left after other aid.",
    "requires": [
      "FAFSA and TAP application",
      "Excelsior application",
      "Complete 30 credits a year"
    ],
    "opens": "2026-05-26",
    "deadline": "2026-08-31",
    "deadlineNote": "2026-27 dates (now closed). Seniors entering college in fall 2027 apply in the 2027 window, not yet posted.",
    "url": "https://hesc.ny.gov/excelsior",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "NY resident for 12 months",
      "Family income of $125,000 or less",
      "Full time at SUNY or CUNY",
      "Completes 30 credits each year"
    ],
    "awardCount": null,
    "payout": "Last-dollar award paid to your SUNY or CUNY school each term.",
    "selectedOn": [
      "Family income"
    ],
    "notification": null,
    "obligations": "Live in New York (and work there if employed) for as many years as you got the award, or part of it turns into a no-interest loan."
  },
  {
    "id": "nys-tuition-assistance-program",
    "name": "Tuition Assistance Program (TAP)",
    "provider": "New York State HESC",
    "amount": "$1,000 to $5,665 a year",
    "amountMax": 5665,
    "renewable": true,
    "kind": "need",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NY"
    ],
    "needBased": true,
    "minGpa": null,
    "eligibility": "New York residents going full time to an approved New York college whose family net taxable income is $125,000 or less. It is New York's main grant for tuition.",
    "requires": [
      "FAFSA (or NYS DREAM Act application)",
      "TAP application"
    ],
    "opens": null,
    "deadline": "2028-06-30",
    "deadlineNote": "This is the 2027-28 deadline, the year today's seniors start college. Apply as early as you can.",
    "url": "https://hesc.ny.gov/find-aid/nys-grants-scholarships/tuition-assistance-program-tap",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "NY resident for 12 months (or NYS DREAM Act eligible)",
      "Family net taxable income of $125,000 or less",
      "Full time (12+ credits) at an approved NY college",
      "Good academic standing"
    ],
    "awardCount": null,
    "payout": "Yearly grant toward tuition for up to 4 years (3 for an associate's, 5 for approved programs).",
    "selectedOn": [
      "Family income",
      "Type of college"
    ],
    "notification": null,
    "obligations": "Reapply each year and stay in good academic standing."
  },
  {
    "id": "uncf-edward-and-sandra-meyer-family-scholarship",
    "name": "The Edward and Sandra Meyer Family Scholarship",
    "provider": "UNCF",
    "amount": "Amount not stated in UNCF's listing",
    "amountMax": null,
    "renewable": null,
    "kind": "identity",
    "fields": [
      "Any"
    ],
    "grades": [
      12
    ],
    "states": [
      "NY"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "Talented New York high school seniors who will enroll at a UNCF member college or another accredited Historically Black College or University (HBCU).",
    "requires": [
      "UNCF online application"
    ],
    "opens": null,
    "deadline": "2026-05-18",
    "deadlineNote": "Closed May 18 for the class of 2026; the class of 2027 round had not been posted as of Oct 3, 2026.",
    "url": "https://uncf.org/the-latest/scholarships-for-may-at-uncf",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school senior in New York State",
      "Class of 2026 for the last round",
      "Enrolling at a UNCF member college or other HBCU"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": null,
    "notification": null,
    "obligations": null
  },
  {
    "id": "apia-scholarship",
    "name": "APIA Scholarship",
    "provider": "APIA Scholars",
    "amount": "$2,500 one-year awards up to $20,000 multi-year awards",
    "amountMax": 20000,
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
    "minGpa": null,
    "eligibility": "Asian American and Pacific Islander students starting an associate or bachelor's degree at a US college, including high school seniors. It puts students with the most financial need first, especially first-generation students.",
    "requires": [
      "Online application"
    ],
    "opens": "2026-11-15",
    "deadline": "2027-01-15",
    "deadlineNote": null,
    "url": "https://apiascholars.org/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "Applicants must be a US citizen, national or permanent resident, or a citizen of the Marshall Islands, Micronesia or Palau.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Asian American or Pacific Islander",
      "US citizen, national or permanent resident (or FAS citizen)",
      "Starting an associate or bachelor's degree at a US college",
      "Financial need is a priority"
    ],
    "awardCount": null,
    "payout": "Awards are paid out in summer 2027.",
    "selectedOn": [
      "Financial need",
      "First generation to college"
    ],
    "notification": "Applicants hear by April 15, 2027.",
    "obligations": null
  },
  {
    "id": "american-indian-college-fund-full-circle",
    "name": "American Indian College Fund Full Circle Scholarship",
    "provider": "American Indian College Fund",
    "amount": "Varies; awards average $2,000 to $3,000",
    "amountMax": null,
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
    "needBased": null,
    "minGpa": 2.0,
    "eligibility": "High school seniors in their last semester who are enrolled members of a federally or state-recognized tribe, or descendants of one, with at least a 2.0 GPA. It works at tribal colleges and other nonprofit colleges.",
    "requires": [
      "Online application",
      "Digital headshot",
      "Unofficial transcript",
      "Tribal ID or CIB (or a parent's or grandparent's ID plus birth certificates for descendants)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Opens Feb 1 each year with a May 31 priority deadline; the page gives no year.",
    "url": "https://collegefund.org/students/scholarships/hs-students/",
    "verifiedOn": "2026-10-03",
    "notes": "Also covers the Tribal College & University (TCU) scholarship from the same application.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Enrolled tribal member or descendant",
      "Cumulative GPA of 2.0 or higher",
      "High school senior in last semester",
      "Full time at an accredited nonprofit college or tribal college"
    ],
    "awardCount": null,
    "payout": "Sent to your college's financial aid office; fall money goes out in late August.",
    "selectedOn": null,
    "notification": "Priority applicants hear by July 31.",
    "obligations": "Send proof of enrollment before money is paid."
  },
  {
    "id": "afsa-national-high-school-essay-contest",
    "name": "AFSA National High School Essay Contest",
    "provider": "American Foreign Service Association",
    "amount": "$2,500 plus a paid trip to Washington, DC and a Semester at Sea voyage",
    "amountMax": 2500,
    "renewable": false,
    "kind": "arts",
    "fields": [
      "Public Service & Law"
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
    "eligibility": "Students in grades 9 to 12 in any US state, DC or territory, including home school and US citizens at schools overseas, who write a 1,000 to 1,500 word essay on US diplomacy.",
    "requires": [
      "Essay of 1,000 to 1,500 words on the year's topic",
      "Online submission"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The 2025-26 round is closed and the page shows no dates. Check back for the 2026-27 topic.",
    "url": "https://afsa.org/essay-contest",
    "verifiedOn": "2026-10-03",
    "notes": "2025-26 topic: \"The Fragile Front Line: U.S. Diplomacy and the Future of Soft Power.\" The winner's school gets 10 copies of Inside a U.S. Embassy.",
    "levels": null,
    "eligibilityBullets": [
      "Grades 9 to 12",
      "Public, private, religious or home school",
      "In the US, DC, a US territory, or a US citizen abroad",
      "Past first-place winners cannot enter again"
    ],
    "awardCount": "1 winner plus honorable mentions",
    "payout": null,
    "selectedOn": [
      "Essay"
    ],
    "notification": "Winners and honorable mentions hear in June.",
    "obligations": null
  },
  {
    "id": "optimist-international-essay-contest",
    "name": "Optimist International Essay Contest",
    "provider": "Optimist International",
    "amount": "$2,500 college scholarship at the district level",
    "amountMax": 2500,
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
    "eligibility": "Students under 19 on October 1 who have not finished high school. You enter through the Optimist Club where you live, and winners move up to the district contest.",
    "requires": [
      "Essay on the year's topic",
      "Entry through your local Optimist Club"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Your local club sets the entry date; club contests finish by early February.",
    "url": "https://www.optimist.org/member/scholarships3.cfm",
    "verifiedOn": "2026-10-03",
    "notes": "2026-27 topic: \"Finding My Voice in a World Full of Noise.\" Younger students can enter too.",
    "levels": null,
    "eligibilityBullets": [
      "Under 19 on October 1 of the contest year",
      "Has not finished high school",
      "Enters through a local Optimist Club"
    ],
    "awardCount": "1 district scholarship per Optimist district",
    "payout": "District scholarships are funded by Optimist International Foundations.",
    "selectedOn": [
      "Essay"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "ayn-rand-institute-essay-contests",
    "name": "Ayn Rand Institute Essay Contests",
    "provider": "Ayn Rand Institute",
    "amount": "Up to $25,000",
    "amountMax": 25000,
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
    "eligibility": "Middle and high school students 13 and older can write on Anthem or The Fountainhead. High school, college and graduate students can write on Atlas Shrugged. Students anywhere in the world may enter.",
    "requires": [
      "Essay on the novel's prompt"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The page says the next deadline is \"TBD, coming soon\" as of Oct 3, 2026.",
    "url": "https://aynrand.org/students/essay-contests/",
    "verifiedOn": "2026-10-03",
    "notes": "Three contests: Anthem, The Fountainhead and Atlas Shrugged.",
    "levels": null,
    "eligibilityBullets": [
      "Age 13 or older (Anthem and The Fountainhead)",
      "Enrolled in school during the contest",
      "Open worldwide"
    ],
    "awardCount": "Multiple awards",
    "payout": null,
    "selectedOn": [
      "Essay"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "gloria-barron-prize-for-young-heroes",
    "name": "Gloria Barron Prize for Young Heroes",
    "provider": "Barron Prize",
    "amount": "$10,000",
    "amountMax": 10000,
    "renewable": false,
    "kind": "service",
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
    "eligibility": "Young people ages 8 to 18 in the US or Canada who lead a service or environmental project. You apply yourself; the Barron Prize does not take nominations.",
    "requires": [
      "Step 1 pre-application",
      "Step 2 full application",
      "Three letters, including one from a Lead Reference"
    ],
    "opens": null,
    "deadline": "2026-04-15",
    "deadlineNote": "2026 cycle (Step 1 by March 15, Step 2 by April 15). The page calls April 15 the yearly deadline.",
    "url": "https://barronprize.org/faqs/",
    "verifiedOn": "2026-10-03",
    "notes": "Grades 9 to 12 inferred from the age rule (8 to 18, not yet 19 on April 15). Co-applicants split one $10,000 award.",
    "levels": null,
    "eligibilityBullets": [
      "Age 8 to 18 on April 15",
      "Permanent legal resident of the US or Canada",
      "Leads a service or environmental project",
      "Has an adult Lead Reference"
    ],
    "awardCount": "25 young leaders honored each year",
    "payout": null,
    "selectedOn": [
      "Service or environmental impact",
      "Leadership"
    ],
    "notification": "All applicants get an email in early September.",
    "obligations": null
  },
  {
    "id": "stephen-j-brady-stop-hunger-scholarship",
    "name": "Stephen J. Brady Stop Hunger Scholarship",
    "provider": "Sodexo Stop Hunger Foundation",
    "amount": "$10,000 scholarship plus a $5,000 grant to your hunger charity",
    "amountMax": 10000,
    "renewable": false,
    "kind": "service",
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
    "eligibility": "Students ages 5 to 25 who are leading creative work to fight hunger in their communities. You can apply yourself or be nominated.",
    "requires": [
      "Online application or nomination"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The page says applications run Aug 20 to Oct 20 with no year; winners attend a May 5 to 7, 2027 event, which points to an Oct 20, 2026 close.",
    "url": "https://www.us.stop-hunger.org/grants/youth-scholarships",
    "verifiedOn": "2026-10-03",
    "notes": "Grades 9 to 12 inferred from the age rule (5 to 25).",
    "levels": null,
    "eligibilityBullets": [
      "Age 5 to 25",
      "Fighting hunger in your community",
      "Shows creativity, leadership and impact"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": [
      "Creativity",
      "Leadership",
      "Impact on hunger"
    ],
    "notification": null,
    "obligations": "National Scholars attend the Sodexo Charity Classic, May 5 to 7, 2027, in Scottsdale, AZ."
  },
  {
    "id": "bow-seat-ocean-awareness-contest",
    "name": "Bow Seat Ocean Awareness Contest",
    "provider": "Bow Seat Ocean Awareness Programs",
    "amount": "Cash awards up to $1,000",
    "amountMax": 1000,
    "renewable": false,
    "kind": "arts",
    "fields": [
      "Arts & Media",
      "Science & Research"
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
    "eligibility": "Students ages 11 to 18 anywhere in the world can make art, writing, film, music or media about the year's ocean and climate theme, alone or in a group.",
    "requires": [
      "Original entry in one category (visual art, poetry and spoken word, creative writing, film, performing arts, or interactive and multimedia)"
    ],
    "opens": null,
    "deadline": "2027-06-07",
    "deadlineNote": null,
    "url": "https://bowseat.org/programs/ocean-awareness-contest/contest-overview/",
    "verifiedOn": "2026-10-03",
    "notes": "2027 theme: \"Nature of Truth: Environmentalism in an Age of Disinformation.\" Senior division is ages 15 to 18. A separate We All Rise Prize exists. Grades inferred from the age rule.",
    "levels": null,
    "eligibilityBullets": [
      "Age 11 to 18",
      "Open worldwide",
      "College students cannot enter",
      "Individual or group entries"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": [
      "Entry quality",
      "Fit with the theme"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "imagine-america-high-school-scholarship",
    "name": "Imagine America High School Scholarship",
    "provider": "Imagine America Foundation",
    "amount": "$1,000 tuition discount",
    "amountMax": 1000,
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
    "eligibility": "Graduating seniors headed to a participating career college. Each US high school can recommend up to five seniors, and your counselor reviews your application.",
    "requires": [
      "Online application (sent to your counselor for review)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Opens in September of senior year; the page says to apply by December 31 of the year you graduate.",
    "url": "https://imagine-america.org/scholarships/high-school-scholarships",
    "verifiedOn": "2026-10-03",
    "notes": "Suggested GPA is 2.5 or higher (a guideline, not a hard rule).",
    "levels": [
      "trade",
      "2-year"
    ],
    "eligibilityBullets": [
      "Graduating high school senior",
      "Suggested GPA of 2.5 or higher",
      "Financial need",
      "Volunteer service during senior year"
    ],
    "awardCount": "Up to 5 seniors per high school",
    "payout": "Used as a $1,000 tuition discount at a participating career college.",
    "selectedOn": [
      "Likely to finish school",
      "GPA",
      "Financial need",
      "Community service"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "ncld-anne-ford-scholarship",
    "name": "Anne Ford Scholarship",
    "provider": "National Center for Learning Disabilities",
    "amount": "$10,000 ($2,500 a year for four years)",
    "amountMax": 10000,
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
    "minGpa": null,
    "eligibility": "Graduating seniors with a documented learning disability who will start a full-time bachelor's degree in the fall. Students with ADHD may apply if they also have a learning disability.",
    "requires": [
      "Online application",
      "Documentation of a learning disability"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No dates were posted on the NCLD page as of Oct 3, 2026.",
    "url": "https://ncld.org/scholarships-awards/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "Graduating high school senior",
      "Documented learning disability",
      "Full-time bachelor's program in the fall"
    ],
    "awardCount": null,
    "payout": "$2,500 a year over four years.",
    "selectedOn": null,
    "notification": null,
    "obligations": null
  },
  {
    "id": "ncld-allegra-ford-thomas-scholarship",
    "name": "Allegra Ford Thomas Scholarship",
    "provider": "National Center for Learning Disabilities",
    "amount": "$5,000 ($2,500 a year for two years)",
    "amountMax": 5000,
    "renewable": true,
    "kind": "identity",
    "fields": [
      "Any",
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
    "eligibility": "Graduating seniors with a documented learning disability who will start community college, a vocational or technical program, or a program for students with disabilities in the fall.",
    "requires": [
      "Online application",
      "Documentation of a learning disability"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No dates were posted on the NCLD page as of Oct 3, 2026.",
    "url": "https://ncld.org/scholarships-awards/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Graduating high school senior",
      "Documented learning disability",
      "Starting community college, a trade program or a disability program in the fall"
    ],
    "awardCount": null,
    "payout": "$2,500 a year over two years.",
    "selectedOn": null,
    "notification": null,
    "obligations": null
  },
  {
    "id": "aws-foundation-welding-scholarships",
    "name": "AWS Foundation Welding Scholarships",
    "provider": "American Welding Society Foundation",
    "amount": "$1,000 to $10,000+ depending on the award",
    "amountMax": 10000,
    "renewable": null,
    "kind": "trade",
    "fields": [
      "Skilled Trades",
      "Tech & Engineering"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "Students who are in, or will soon start, a welding program at a trade school, community college or four-year college. One application covers national, district and section awards.",
    "requires": [
      "Online scholarship application"
    ],
    "opens": null,
    "deadline": "2026-11-30",
    "deadlineNote": null,
    "url": "https://www.aws.org/career-resources/students/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "National awards: over 130 worth $2,500 to $10,000+. District awards: $1,000 to $2,500+. Welder Training scholarships cover short certification programs. Grade 12 inferred from \"will soon enroll.\"",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Enrolled in, or about to start, a welding or related program",
      "Trade school, community college or four-year college",
      "One application covers national, district and section awards"
    ],
    "awardCount": "Over 1,600 scholarships awarded last year",
    "payout": null,
    "selectedOn": null,
    "notification": null,
    "obligations": null
  },
  {
    "id": "aopa-high-school-flight-training-scholarship",
    "name": "AOPA You Can Fly High School Flight Training Scholarship",
    "provider": "AOPA Foundation",
    "amount": "$12,000",
    "amountMax": 12000,
    "renewable": false,
    "kind": "field",
    "fields": [
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
    "needBased": null,
    "minGpa": 2.7,
    "eligibility": "High school students ages 16 to 18 with at least a 2.7 GPA who have passed the FAA Private Pilot written test. The money pays for flight training toward a private pilot certificate.",
    "requires": [
      "Free AOPA student membership",
      "Passed FAA Private Pilot knowledge exam",
      "Online application"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Two windows each year: Oct 1 to Dec 31 and Apr 1 to Jun 30 (11:59 p.m. ET).",
    "url": "https://www.aopa.org/training-and-safety/students/aopa-flight-training-scholarships",
    "verifiedOn": "2026-10-03",
    "notes": "Grades 10 to 12 inferred from the age rule (16 to 18 at time of award). Open to US, DC, Canada, Guam, Puerto Rico and USVI residents.",
    "levels": null,
    "eligibilityBullets": [
      "Age 16 to 18 when awarded",
      "High school student",
      "GPA of 2.7 or higher",
      "Passed the FAA Private Pilot written exam",
      "AOPA member (free for high schoolers)"
    ],
    "awardCount": "At least 90 scholarships",
    "payout": "Paid on a prepaid expense card; use it within 12 months.",
    "selectedOn": null,
    "notification": "Fall applicants hear by April 15; spring applicants by September 15.",
    "obligations": "Use the money for flight training within 12 months."
  },
  {
    "id": "nsbe-high-school-senior-scholarships",
    "name": "NSBE High School Senior Scholarships",
    "provider": "National Society of Black Engineers",
    "amount": "$500 to $5,000",
    "amountMax": 5000,
    "renewable": null,
    "kind": "identity",
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
    "needBased": null,
    "minGpa": 3.0,
    "eligibility": "Paid NSBE members who are high school seniors planning to study engineering, computer science, math or another STEM field. Each award has its own GPA and region rules.",
    "requires": [
      "Active, paid NSBE membership",
      "Verified GPA (transcript or registrar letter)",
      "Online application"
    ],
    "opens": null,
    "deadline": "2026-12-11",
    "deadlineNote": "Fall 2026 cycle; the application window runs through Feb 26, 2027.",
    "url": "https://nsbe.org/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "Senior awards include NSBE Jr. Golden Torch ($1,000, 3.5 GPA), Graduating Senior, Leroy Callendar and Fulfilling the Legacy ($500 each, 3.0 GPA), and Chevron ($5,000, 3.0 GPA, regions 3, 5, 6).",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Paid NSBE member",
      "Minimum GPA of 3.0 (3.5 for Golden Torch)",
      "Plans a STEM degree"
    ],
    "awardCount": "122 sponsored scholarships in the fall 2026 cycle (all levels)",
    "payout": null,
    "selectedOn": null,
    "notification": null,
    "obligations": null
  },
  {
    "id": "shpe-scholarshpe-high-school-seniors",
    "name": "ScholarSHPE for High School Seniors",
    "provider": "SHPE (Society of Hispanic Professional Engineers)",
    "amount": "Amount varies by award",
    "amountMax": null,
    "renewable": null,
    "kind": "identity",
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
    "needBased": null,
    "minGpa": 2.5,
    "eligibility": "SHPE members with at least a 2.5 GPA who plan to study a STEM field at a two-year or four-year US college. Citizenship is not required for most awards.",
    "requires": [
      "Active SHPE membership",
      "ScholarSHPE Common Application"
    ],
    "opens": "2026-02-02",
    "deadline": "2026-02-16",
    "deadlineNote": "2026-27 cycle dates (now closed). Seniors apply in February of senior year.",
    "url": "https://shpe.org/engage/programs/scholarshpe/",
    "verifiedOn": "2026-10-03",
    "notes": "Some sponsor-funded awards do require citizenship and say so.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Active SHPE member",
      "Cumulative GPA of 2.5 or higher",
      "Plans a STEM degree",
      "Enrolling at a US two-year or four-year college"
    ],
    "awardCount": null,
    "payout": "Paid electronically through bill.com.",
    "selectedOn": null,
    "notification": "Corporate-funded awards: July to September. SHPE-funded awards: December to January.",
    "obligations": null
  },
  {
    "id": "united-states-senate-youth-program",
    "name": "United States Senate Youth Program",
    "provider": "United States Senate Youth Program",
    "amount": "$12,500 college scholarship plus a week in Washington, DC",
    "amountMax": 12500,
    "renewable": false,
    "kind": "merit",
    "fields": [
      "Public Service & Law"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": null,
    "eligibility": "High school juniors and seniors who hold an elected or appointed student leadership office for the whole 2026-27 school year. Two students are chosen from each state.",
    "requires": [
      "Apply through your state's selection contact",
      "Hold a qualifying office (student government, class officer, NHS officer, and similar)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "State deadlines vary; states must send their picks by Dec 1, 2026.",
    "url": "https://ussenateyouth.org/selection_process_qualify/",
    "verifiedOn": "2026-10-03",
    "notes": "Washington Week: March 6 to 13, 2027. Students who graduate at the end of fall 2026 cannot apply.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school junior or senior",
      "US citizen or green card holder",
      "Holds a qualifying student office all year",
      "Selected by your state"
    ],
    "awardCount": "2 delegates per state, DC and DoDEA",
    "payout": "Scholarship for undergraduate study; history and political science coursework is encouraged.",
    "selectedOn": [
      "Leadership in student office",
      "Ability"
    ],
    "notification": null,
    "obligations": "Attend all of Washington Week or lose the scholarship."
  },
  {
    "id": "diller-teen-tikkun-olam-awards",
    "name": "Diller Teen Tikkun Olam Awards",
    "provider": "Helen Diller Family Foundation",
    "amount": "$36,000",
    "amountMax": 36000,
    "renewable": false,
    "kind": "service",
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
    "needBased": false,
    "minGpa": null,
    "eligibility": "Jewish teens ages 15 to 19 in the US who lead an unpaid project that is making a measurable difference. You can apply yourself or be nominated.",
    "requires": [
      "Online application describing your project and its impact"
    ],
    "opens": "2026-08",
    "deadline": null,
    "deadlineNote": "Applications close in January 2027 (nominations in December 2026); the exact day is not on the FAQ.",
    "url": "https://dillerteenawards.org/faq-applicant/",
    "verifiedOn": "2026-10-03",
    "notes": "Grades inferred from the age rule (15 to 19 by the deadline); some 15-year-old 9th graders may qualify. Continental US, Alaska and Hawaii.",
    "levels": null,
    "eligibilityBullets": [
      "Age 15 to 19 by the deadline",
      "Identifies as Jewish",
      "US resident",
      "Leads an unpaid project with measurable impact"
    ],
    "awardCount": "15 teens each year",
    "payout": "May be used for your service work or your education.",
    "selectedOn": [
      "Impact",
      "Leadership"
    ],
    "notification": "Semifinalists hear in February, finalists in March, winners in May.",
    "obligations": null
  },
  {
    "id": "peo-star-scholarship",
    "name": "P.E.O. STAR Scholarship",
    "provider": "P.E.O. International",
    "amount": "$2,500, one time",
    "amountMax": 2500,
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
    "eligibility": "Young women in their final year of high school with at least a 3.0 unweighted GPA who are recommended by a local P.E.O. chapter. You need a chapter to sponsor you.",
    "requires": [
      "Recommendation and vote of a local P.E.O. chapter",
      "Student profile and activity charts",
      "Essay of up to 700 words",
      "Two recommendations",
      "Unofficial transcript through 11th grade"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Chapters submit between Aug 15 and Oct 15 (procedures revised Aug 2026); students then get 30 days to finish their part.",
    "url": "https://www.peointernational.org/educational-support/star-scholarship/",
    "verifiedOn": "2026-10-03",
    "notes": "Each chapter can recommend one student a year.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Woman in her final year of high school",
      "Unweighted GPA of 3.0 or higher",
      "Age 20 or under at year's end",
      "US or Canadian citizen or permanent resident",
      "Recommended by a local P.E.O. chapter"
    ],
    "awardCount": "Depends on funds each year",
    "payout": "Paid to your school (split over two terms) or to you in two payments after Aug 1.",
    "selectedOn": [
      "Leadership",
      "Academics",
      "Activities",
      "Community service"
    ],
    "notification": "Winners are announced by April 30.",
    "obligations": "Enroll in the fall after graduation and send the enrollment forms."
  },
  {
    "id": "carson-scholars-fund-scholarship",
    "name": "Carson Scholars Fund Scholarship",
    "provider": "Carson Scholars Fund",
    "amount": "$1,000",
    "amountMax": 1000,
    "renewable": null,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      9,
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": 3.75,
    "eligibility": "Students in grades 4 to 11 with at least a 3.75 GPA who serve their community. A teacher or staff member at a participating school must nominate you.",
    "requires": [
      "School nomination",
      "Application with essay, report card and recommendation letter(s)"
    ],
    "opens": "2026-10-19",
    "deadline": "2027-01-13",
    "deadlineNote": "2026-27 season: school nominations close Dec 16, student applications Jan 13. The page lists days without years under the 2026-2027 season.",
    "url": "https://carsonscholars.org/programs/scholarship-program/",
    "verifiedOn": "2026-10-03",
    "notes": "Your school must take part in the program.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Grades 4 to 11 (9 to 11 in high school)",
      "GPA of 3.75 or higher",
      "Strong community service",
      "Nominated by your school"
    ],
    "awardCount": null,
    "payout": "The $1,000 is invested for you and grows until high school graduation, then is sent to your college.",
    "selectedOn": [
      "Grades",
      "Humanitarian service"
    ],
    "notification": "Winners hear in March 2027.",
    "obligations": "Winners get a medal and are invited to a regional awards banquet."
  },
  {
    "id": "thedream-us-national-scholarship",
    "name": "TheDream.US National Scholarship",
    "provider": "TheDream.US",
    "amount": "Up to $33,000 for tuition and fees for a bachelor's, plus up to $6,000 for books and transportation",
    "amountMax": 33000,
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
    "minGpa": 2.5,
    "eligibility": "Undocumented immigrant students, with or without DACA or TPS, who came to the US before age 16 and graduate from a US high school with at least a 2.5 GPA. You must have significant unmet need and attend a partner college.",
    "requires": [
      "Online application",
      "Eligible for in-state tuition at a Partner College (some exceptions)"
    ],
    "opens": "2025-11-01",
    "deadline": "2026-02-28",
    "deadlineNote": "2026 cycle dates; the 2027 cycle had not been posted on this page as of Oct 3, 2026.",
    "url": "https://www.thedream.us/scholarships/national-scholarship/",
    "verifiedOn": "2026-10-03",
    "notes": "About 80 Partner Colleges. Students who get a Pell Grant are not eligible.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Undocumented, with or without DACA or TPS",
      "Arrived in the US before age 16 and before Nov 1, 2020",
      "US high school graduate with a 2.5 GPA or higher",
      "Significant unmet financial need",
      "Full time at a Partner College"
    ],
    "awardCount": null,
    "payout": "Renewable through your degree when you renew each June and keep a 2.5 college GPA.",
    "selectedOn": [
      "Financial need",
      "Grades",
      "Community service"
    ],
    "notification": "Applicants hear in late April.",
    "obligations": "Renew each year by the June deadline."
  },
  {
    "id": "oar-autism-postsecondary-scholarships",
    "name": "OAR Postsecondary Scholarships for Autistic Students",
    "provider": "Organization for Autism Research",
    "amount": "$3,000",
    "amountMax": 3000,
    "renewable": false,
    "kind": "identity",
    "fields": [
      "Any",
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
    "eligibility": "Autistic students with a formal diagnosis who are starting or attending a college, trade school or life skills program in the US. The Schwallie, Hussman and Synchrony awards share one cycle.",
    "requires": [
      "Online application with three essays",
      "Proof of enrollment (acceptance letter or class schedule)",
      "Letter(s) of recommendation",
      "Proof of diagnosis (finalists)"
    ],
    "opens": "2026-12",
    "deadline": null,
    "deadlineNote": "The 2027-28 cycle opens in December 2026 and closes in April; the exact April date is not on the page yet.",
    "url": "https://researchautism.org/self-advocates/postsecondary-scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "Hussman covers two-year, life skills and trade programs; Synchrony is for autistic students of color. Seniors qualify once accepted. Grade 12 inferred from the enrollment rule.",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Formal autism diagnosis",
      "Enrolled or accepted at a US college, trade school or program",
      "At least 6 credits, or working toward a certificate",
      "No bachelor's degree yet; not a past OAR winner"
    ],
    "awardCount": null,
    "payout": "Paid in two parts: mid-August and January.",
    "selectedOn": [
      "Essays",
      "Recommendations"
    ],
    "notification": "Applicants hear in July; awards are announced in August.",
    "obligations": null
  },
  {
    "id": "techforce-foundation-scholarships",
    "name": "TechForce Foundation Technician Scholarships",
    "provider": "TechForce Foundation",
    "amount": "Tuition scholarships average $2,500 to $3,500",
    "amountMax": null,
    "renewable": null,
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
    "eligibility": "Students heading to or in a technician program (auto, diesel, aviation, collision, marine, welding and more) who have a FAFSA on file showing financial need. You need a high school diploma or GED by the time you use it.",
    "requires": [
      "Free TechForce Network profile",
      "General application plus scholarship questions",
      "Approved FAFSA on file at your school"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Several award cycles run each year; see the Award Cycles and Decision Days calendar.",
    "url": "https://techforce.org/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "Grade 12 inferred from the diploma or GED rule. Specific awards set their own GPA and start-date rules.",
    "levels": [
      "trade",
      "2-year"
    ],
    "eligibilityBullets": [
      "US citizen, permanent resident or approved DACA",
      "High school diploma or GED",
      "In or starting an accredited technician program",
      "Completed FAFSA showing need"
    ],
    "awardCount": null,
    "payout": "Paid to your school, not to you.",
    "selectedOn": [
      "Financial need"
    ],
    "notification": null,
    "obligations": null
  },
  {
    "id": "phcc-educational-foundation-scholarship",
    "name": "PHCC Educational Foundation Scholarship",
    "provider": "PHCC Educational Foundation",
    "amount": "Awards vary; sponsor awards include $5,000 scholarships",
    "amountMax": 5000,
    "renewable": false,
    "kind": "trade",
    "fields": [
      "Skilled Trades",
      "Tech & Engineering",
      "Business & Finance"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "US residents who are in, or plan to start, a plumbing or HVAC trade program, apprenticeship, or a related college degree such as mechanical engineering or construction management.",
    "requires": [
      "Online application with five short questions",
      "One letter of recommendation (not from a parent)"
    ],
    "opens": "2027-01",
    "deadline": "2027-05-01",
    "deadlineNote": null,
    "url": "https://www.phccfoundation.org/scholarship-program/",
    "verifiedOn": "2026-10-03",
    "notes": "80 students won in 2026, with up to $200,000 in total. Apprentices must work full time for a PHCC member contractor. Grade 12 inferred from \"plan to enroll.\"",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "US legal resident",
      "In or starting a plumbing or HVACR program, apprenticeship, or related degree",
      "Full time if in a school program"
    ],
    "awardCount": "80 winners in 2026",
    "payout": null,
    "selectedOn": null,
    "notification": "Winners are picked in late July; everyone hears by mid-August.",
    "obligations": null
  },
  {
    "id": "hispanic-heritage-youth-awards",
    "name": "Hispanic Heritage Youth Awards",
    "provider": "Hispanic Heritage Foundation",
    "amount": "Gold, Silver and Bronze grants; $100,000 in total across 31 grants",
    "amountMax": null,
    "renewable": false,
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
    "needBased": false,
    "minGpa": 3.0,
    "eligibility": "High school seniors graduating in spring 2027 with at least a 3.0 unweighted GPA who will start college in 2027-28. Awards go to Latino seniors in categories like community service, engineering, business and green work.",
    "requires": [
      "Online application in one category",
      "Attend the virtual awards ceremony if selected"
    ],
    "opens": null,
    "deadline": "2026-11-01",
    "deadlineNote": null,
    "url": "https://hhfawards.hispanicheritage.org/",
    "verifiedOn": "2026-10-03",
    "notes": "2027 categories on the page: Community Service, Engineering, Entrepreneurship and Green. Sponsored by Colgate-Palmolive.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "High school senior graduating spring 2027",
      "Unweighted GPA of 3.0 or higher",
      "Enrolling in college for 2027-28",
      "Open in all US states and territories"
    ],
    "awardCount": "31 grants",
    "payout": "One-time grant for college or for a community service project.",
    "selectedOn": [
      "Achievement in your category"
    ],
    "notification": null,
    "obligations": "Attend the virtual awards ceremony if selected."
  },
  {
    "id": "national-ffa-scholarships",
    "name": "National FFA Scholarships",
    "provider": "National FFA Organization",
    "amount": "Many awards from one application, nearly $2.5 million in total",
    "amountMax": null,
    "renewable": null,
    "kind": "merit",
    "fields": [
      "Any",
      "Science & Research",
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
    "eligibility": "High school senior FFA members (and FFA alumni in college) heading to trade school, a certificate, or a two-year or four-year degree. One application matches you to many sponsor awards.",
    "requires": [
      "Active FFA membership and FFA.org email",
      "Online application",
      "Transcript upload"
    ],
    "opens": "2025-11-01",
    "deadline": "2026-01-15",
    "deadlineNote": "2025-26 cycle dates; the next cycle usually opens Nov 1.",
    "url": "https://www.ffa.org/participate/grants-and-scholarships/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "Senior FFA member in high school",
      "Going to trade school, a certificate, or a 2- or 4-year degree",
      "Has an FFA member ID and FFA.org email"
    ],
    "awardCount": null,
    "payout": "2026 funds were sent July 16, 2026.",
    "selectedOn": null,
    "notification": "2026 winners and non-winners were told April 23, 2026; acceptance was due May 29, 2026.",
    "obligations": "Accept the award by the acceptance deadline."
  },
  {
    "id": "air-force-rotc-high-school-scholarship",
    "name": "Air Force ROTC High School Scholarship",
    "provider": "U.S. Air Force ROTC",
    "amount": "Capped or full tuition, $900 a year for books, and a $300 to $500 monthly stipend",
    "amountMax": null,
    "renewable": true,
    "kind": "merit",
    "fields": [
      "Any",
      "Public Service & Law"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": false,
    "minGpa": 3.3,
    "eligibility": "Students who have finished junior year, have at least a 3.3 unweighted GPA and a 1310 SAT, 28 ACT or 93 CLT, and plan to join Air Force ROTC in college. You must be or become a US citizen.",
    "requires": [
      "WINGS online account and application",
      "Counselor Certification Form",
      "Transcript (9th to 11th grade)",
      "Physical Fitness Assessment",
      "SAT, ACT or CLT scores"
    ],
    "opens": "2026-07-01",
    "deadline": "2026-12-11",
    "deadlineNote": null,
    "url": "https://www.afrotc.com/scholarships/high-school/application/",
    "verifiedOn": "2026-10-03",
    "notes": "Scholarship type is set at award time. Benefits can be converted to a room scholarship of up to $10,000 a year.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "Finished junior year",
      "Unweighted GPA of 3.3 or higher",
      "SAT 1310, ACT 28 or CLT 93",
      "US citizen by end of first college term",
      "Pass medical and fitness tests"
    ],
    "awardCount": null,
    "payout": "Pays tuition to your school plus a yearly book stipend and a monthly allowance.",
    "selectedOn": [
      "Grades",
      "Test scores",
      "Fitness",
      "Interview"
    ],
    "notification": "You get eligibility updates by email; call if you hear nothing in six weeks.",
    "obligations": "Accept a commission and serve at least four years on active duty in the Air Force or Space Force."
  },
  {
    "id": "fisher-house-scholarships-for-military-children",
    "name": "Scholarships for Military Children",
    "provider": "Fisher House Foundation",
    "amount": "$2,000",
    "amountMax": 2000,
    "renewable": false,
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
    "needBased": false,
    "minGpa": 3.0,
    "eligibility": "Children of active duty, reserve, guard and retired military members who are under 23, have at least a 3.0 high school GPA and will go to college full time.",
    "requires": [
      "Online application at militaryscholar.org"
    ],
    "opens": "2025-12-10",
    "deadline": "2026-02-11",
    "deadlineNote": "2026-27 cycle dates from Fisher House's program sheet; the 2027-28 dates had not been posted as of Oct 3, 2026.",
    "url": "https://www.fisherhouse.org/scholarships",
    "verifiedOn": "2026-10-03",
    "notes": "Goal of at least one award at each commissary; 500 awards a year. Grade 12 inferred from the high school GPA rule and enrollment rule.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Military dependent under age 23",
      "High school GPA of 3.0 or higher",
      "Full time at an accredited 2-year or 4-year college"
    ],
    "awardCount": "500 a year",
    "payout": "Check is made out to your college but mailed to you in late July.",
    "selectedOn": null,
    "notification": null,
    "obligations": "Make sure the check reaches your college."
  },
  {
    "id": "actuarial-foundation-stem-stars",
    "name": "STEM Stars Actuarial Scholars Program",
    "provider": "The Actuarial Foundation",
    "amount": "$20,000 ($5,000 a year for four years)",
    "amountMax": 20000,
    "renewable": true,
    "kind": "field",
    "fields": [
      "Business & Finance",
      "Science & Research"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": null,
    "eligibility": "High school students who are strong in math and interested in becoming actuaries. Winners also get mentors, networking and internship help.",
    "requires": [
      "Online application"
    ],
    "opens": null,
    "deadline": "2026-02-27",
    "deadlineNote": "2026 cycle date (now closed). The next cycle had not been posted as of Oct 3, 2026.",
    "url": "https://actuarialfoundation.org/scholarships/",
    "verifiedOn": "2026-10-03",
    "notes": "Grade 12 inferred: the award pays during four years of college. Detailed rules are behind the program's requirements link.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "High school student strong in math",
      "Interested in an actuarial career",
      "Headed to a four-year college"
    ],
    "awardCount": null,
    "payout": "$5,000 a year for up to four years.",
    "selectedOn": null,
    "notification": "Winners are announced in the summer.",
    "obligations": "Take part in mentoring and career programs."
  },
  {
    "id": "asme-high-school-scholarships",
    "name": "ASME High School Scholarships",
    "provider": "American Society of Mechanical Engineers",
    "amount": "$2,000 (ASME INSPIRE/Charles W.E. Clarke); $5,000 for STEM NOLA Fellows",
    "amountMax": 5000,
    "renewable": false,
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
    "needBased": null,
    "minGpa": null,
    "eligibility": "Graduating seniors who will enroll full time in an ABET-accredited mechanical engineering or mechanical engineering technology program the fall after high school.",
    "requires": [
      "Online application",
      "Transcript with first-semester senior grades and GPA"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Deadline is March 15 each year. The 2026-27 round is closed.",
    "url": "https://www.asme.org/asme-programs/students-and-faculty/scholarships/available-high-school-scholarships",
    "verifiedOn": "2026-10-03",
    "notes": "The $5,000 STEM Global Action award is only for STEM NOLA Fellows.",
    "levels": [
      "4-year"
    ],
    "eligibilityBullets": [
      "Graduating high school senior",
      "Enrolling full time in an ABET-accredited mechanical engineering (or ME technology) program",
      "Starts the fall after graduation"
    ],
    "awardCount": null,
    "payout": "Check mailed to your college by Sept 1 for school costs; no money goes to students.",
    "selectedOn": null,
    "notification": "All applicants hear by July 31.",
    "obligations": null
  },
  {
    "id": "jacl-national-scholarship-entering-freshman",
    "name": "JACL National Scholarship (Entering Freshman)",
    "provider": "Japanese American Citizens League",
    "amount": "Over 30 awards, over $70,000 in total each year",
    "amountMax": null,
    "renewable": false,
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
    "minGpa": null,
    "eligibility": "High school seniors who are JACL members (any background may join) and will go full time to a college, trade school or business school in the US in the fall.",
    "requires": [
      "Individual or Student/Youth JACL membership",
      "Personal statement",
      "Letter of recommendation",
      "Official transcripts",
      "Work experience",
      "Headshot",
      "JACL and community involvement"
    ],
    "opens": "2025-12",
    "deadline": "2026-03-02",
    "deadlineNote": "2026 cycle: freshman applications were due March 2, 2026. The 2027 calendar had not been posted as of Oct 3, 2026.",
    "url": "https://jacl.org/scholarships",
    "verifiedOn": "2026-10-03",
    "notes": "Chapters forward their top freshman applicants. Many JACL chapters also run local awards.",
    "levels": [
      "4-year",
      "2-year",
      "trade"
    ],
    "eligibilityBullets": [
      "High school senior",
      "Active JACL member (individual or student)",
      "Full time at a US college, trade or business school in the fall",
      "No deferred enrollment"
    ],
    "awardCount": "Over 30 awards (all categories)",
    "payout": "One-time award.",
    "selectedOn": null,
    "notification": "Winners are told in September.",
    "obligations": null
  },
  {
    "id": "american-legion-oratorical-contest",
    "name": "American Legion National Oratorical Contest",
    "provider": "The American Legion",
    "amount": "Up to $25,000 (national winner); $2,000 for each state winner in the national round",
    "amountMax": 25000,
    "renewable": false,
    "kind": "merit",
    "fields": [
      "Any",
      "Public Service & Law"
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
    "eligibility": "High school students under 20 who are US citizens or permanent residents. You give a speech on the US Constitution, starting at a local Legion post and moving up to state and national rounds.",
    "requires": [
      "8 to 10 minute prepared speech on the Constitution",
      "3 to 5 minute speech on an assigned topic",
      "Entry through a local American Legion post"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Post and state dates vary. The 2026 national finals were May 17, 2026 at Hillsdale College.",
    "url": "https://www.legion.org/get-involved/youth-programs/oratorical-contest/how-to-participate",
    "verifiedOn": "2026-10-03",
    "notes": "Second place gets $22,500 and third $20,000; state winners who pass the first national round get another $2,000. Over $203,500 in total.",
    "levels": [
      "4-year",
      "2-year"
    ],
    "eligibilityBullets": [
      "Under 20 on the day of the national contest",
      "Enrolled in high school (grades 9 to 12)",
      "US citizen or lawful permanent resident",
      "Competes in only one state"
    ],
    "awardCount": null,
    "payout": "Paid by the national organization for use at any US college.",
    "selectedOn": [
      "Speech judged by five judges"
    ],
    "notification": null,
    "obligations": "Give both speeches to receive the money; the Legion pays travel for state winners."
  },
  {
    "id": "courage-to-grow-scholarship",
    "name": "Courage to Grow Scholarship",
    "provider": "Courage to Grow",
    "amount": "$1,000",
    "amountMax": 1000,
    "renewable": false,
    "kind": "merit",
    "fields": [
      "Any"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "needBased": null,
    "minGpa": 2.5,
    "eligibility": "High school juniors and seniors (and college students) who are US citizens with at least a 2.5 GPA. You write a short essay on why you should win.",
    "requires": [
      "Essay of 250 words or less"
    ],
    "opens": null,
    "deadline": "2026-12-31",
    "deadlineNote": null,
    "url": "https://www.couragetogrowscholarship.com/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "levels": null,
    "eligibilityBullets": [
      "High school junior or senior, or college student",
      "GPA of 2.5 or higher",
      "US citizen"
    ],
    "awardCount": null,
    "payout": null,
    "selectedOn": [
      "Essay"
    ],
    "notification": null,
    "obligations": null
  }
];
