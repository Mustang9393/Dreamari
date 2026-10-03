// Real programs, internships, fellowships and competitions that US high-school
// students can apply to, read from each provider's OFFICIAL page on 1 Oct
// 2026 (Chandu: "use real data to populate these tabs"). A fact the page did
// not state is null; a date the page still shows from last cycle is kept as
// that date with a deadlineNote, and the UI says "Usually closes". Checked
// and dropped for not being high-school programs any more: Bank of America
// Student Leaders (now needs a diploma and college credits), NASA OSTEM
// (college students), Telluride TASS (paused for 2027), JPMorgan's Fellowship
// Initiative (no live page), Goldman Sachs Possibilities (college first-years),
// Girls Who Code Summer Immersion (page removed). New Jersey programs first
// where the pilot runs. Re-verify before any public release.

import type { Program } from "./types";

export const PROGRAMS: Program[] = [
  {
    "id": "nj-gset-rutgers",
    "name": "New Jersey Governor's School of Engineering and Technology",
    "org": "Rutgers School of Engineering",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free. Tuition, room and board are covered by donors; a refundable $65 key deposit is collected at check-in.",
    "fields": [
      "Tech & Engineering",
      "Science & Research"
    ],
    "grades": [
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "Rutgers University, Piscataway, NJ (residential)",
    "when": "About 4 weeks in July, plus about 40 hours of pre-reading",
    "eligibility": "You must live in New Jersey, be a high school junior this year, and be nominated by your high school.",
    "requires": [
      "Nomination by your school",
      "Two essays and three short responses",
      "Transcript with junior fall grades",
      "Standardized test scores",
      "Letters of recommendation (uploaded by your nominator)"
    ],
    "opens": "2025-11",
    "deadline": "2026-01-08",
    "deadlineNote": "Past cycle: the 2026 application closed January 8, 2026. The 2027 application was not posted as of Oct 1, 2026; expect a similar early-January deadline.",
    "url": "https://soe.rutgers.edu/academics/pre-college-engineering-programs/new-jersey-governors-school-engineering-and-technology",
    "verifiedOn": "2026-10-01",
    "notes": "Schools may nominate 1 student per 325 juniors. Decisions emailed in early April."
  },
  {
    "id": "simons-summer-research-stony-brook",
    "name": "Simons Summer Research Program",
    "org": "Stony Brook University",
    "kind": "summer",
    "paid": "free",
    "costNote": "No program fee stated on the official page; stipend and housing details are not listed there.",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Stony Brook University, Stony Brook, NY",
    "when": "About 6 weeks, late June to early August",
    "eligibility": "You must be a high school junior, a US citizen or permanent resident, at least 16 by the start of the program, and nominated by your school.",
    "requires": [
      "Nomination by your school (max 2 per school)",
      "Online application",
      "Transcript",
      "Two teacher recommendations (math or science preferred)"
    ],
    "opens": "2026-11",
    "deadline": "2026-02-05",
    "deadlineNote": "Past cycle: 2026 applications closed February 5, 2026. The 2027 application will be posted in late November 2026.",
    "url": "https://www.stonybrook.edu/commcms/simons/applying_to/how-to-apply.php",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "summer-science-program-ssp",
    "name": "Summer Science Program (SSP)",
    "org": "SSP International",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "Program fee $11,800 (2026), scaled to what families can afford. Free for most families earning under about $100,000, plus travel aid. Applying is free.",
    "fields": [
      "Science & Research"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Several US college campuses (residential)",
    "when": "About 5 weeks, mid June to late July",
    "eligibility": "You must be a current high school junior, at least 15 and not yet 19 during the program, with the required science and math courses done by summer.",
    "requires": [
      "Online application",
      "Transcript",
      "Teacher recommendations",
      "No test scores"
    ],
    "opens": "2026-12",
    "deadline": "2026-02-19",
    "deadlineNote": "Past cycle: 2026 domestic deadline was February 19, 2026; applications opened December 31, 2025. 2027 dates not yet posted.",
    "url": "https://ssp.org/application/",
    "verifiedOn": "2026-10-01",
    "notes": "Research tracks: astrophysics, biochemistry, bacterial genomics, cell biology."
  },
  {
    "id": "princeton-laboratory-learning-program",
    "name": "Laboratory Learning Program",
    "org": "Princeton University Science Outreach",
    "kind": "internship",
    "paid": "free",
    "costNote": "Free, unpaid. No housing or transportation is provided.",
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
      "NJ"
    ],
    "location": "Princeton University, Princeton, NJ (commute daily)",
    "when": "5 to 6 weeks in summer, weekday office hours; dates vary by lab",
    "eligibility": "You must be 16 or older by June 15, a US citizen, and attend a New Jersey high school near Princeton, with your own ride to campus each day.",
    "requires": [
      "Online application",
      "Proof of local housing and transportation",
      "Teacher nomination form and transcript only if selected"
    ],
    "opens": "2026-02-15",
    "deadline": "2026-03-15",
    "deadlineNote": "Past cycle: the 2026 application was open February 15 to March 15, 2026. 2027 dates not yet posted.",
    "url": "https://scienceoutreach.princeton.edu/laboratory-learning-program",
    "verifiedOn": "2026-10-01",
    "notes": "Over 3,000 applicants per year. Grades are inferred from the age-16 rule; the page lists ages, not grades."
  },
  {
    "id": "wharton-leadership-in-the-business-world",
    "name": "Leadership in the Business World (LBW)",
    "org": "Wharton Global Youth Program, University of Pennsylvania",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "$11,899 program fee (2026) plus a $100 application fee. Need-based full and partial scholarships available.",
    "fields": [
      "Business & Finance"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "University of Pennsylvania, Philadelphia, PA (residential)",
    "when": "3 weeks in summer",
    "eligibility": "You must be a high school student currently in 11th grade.",
    "requires": [
      "Online application",
      "$100 application fee (waivers for some)",
      "Essays",
      "Transcript",
      "Recommendation"
    ],
    "opens": "2026-11",
    "deadline": "2026-03-18",
    "deadlineNote": "Past cycle: 2026 priority deadline January 28 and final deadline March 18, 2026. Applications for 2027 open in November 2026.",
    "url": "https://globalyouth.wharton.upenn.edu/programs-courses/leadership-in-the-business-world/",
    "verifiedOn": "2026-10-01",
    "notes": "Wharton also runs Essentials of Finance and Essentials of Entrepreneurship ($8,299) and online programs ($2,099 to $4,799)."
  },
  {
    "id": "smithsonian-nmnh-high-school-internship",
    "name": "NMNH Summer High School Internship",
    "org": "Smithsonian National Museum of Natural History",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "$5,600 stipend ($700 per week); lunch and transit cards provided.",
    "fields": [
      "Science & Research",
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
    "location": "Washington, DC (in person, no housing provided)",
    "when": "8 weeks, late June to mid August, Tuesday to Friday 10 am to 4 pm",
    "eligibility": "You must be a current high school student age 15 to 18 who can be in Washington, DC for the full 8 weeks.",
    "requires": [
      "Application through SOLAA",
      "Essay",
      "Resume",
      "Transcript",
      "Recommendation"
    ],
    "opens": "2026-02-16",
    "deadline": "2026-03-20",
    "deadlineNote": "Past cycle: 2026 application opened February 16 and closed March 20, 2026. 2027 dates not yet posted.",
    "url": "https://internships.si.edu/opportunity/nmnh-summer-high-school-internship",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "njit-stemx-high-school",
    "name": "Summer STEMx High School Programs",
    "org": "NJIT Center for Pre-College Programs",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "$725 per one-week session (includes lunch) plus a $70 application fee.",
    "fields": [
      "Tech & Engineering",
      "Science & Research",
      "Business & Finance"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "NJIT campus, Newark, NJ (commuter, 9 am to 3:30 pm)",
    "when": "One-week sessions in July; take one or more weeks",
    "eligibility": "You must be a current 10th or 11th grader with a B average or better and be able to commute to Newark each day.",
    "requires": [
      "Online application",
      "Personal statement",
      "B or higher grade average",
      "$70 application fee"
    ],
    "opens": null,
    "deadline": "2026-04-10",
    "deadlineNote": "Past cycle: 2026 early decision March 1 and regular deadline April 10, 2026. 2027 dates not yet posted.",
    "url": "https://www.njit.edu/precollege/summer-stemx-high-school-programs",
    "verifiedOn": "2026-10-01",
    "notes": "Topics include AI, STEM entrepreneurship, materials engineering, sustainable engineering, cybersecurity."
  },
  {
    "id": "nj-governors-stem-scholars",
    "name": "Governor's STEM Scholars",
    "org": "Research & Development Council of New Jersey",
    "kind": "fellowship",
    "paid": "stipend",
    "costNote": "$1,000 stipend for Scholars who complete all program requirements (confirm on the apply page when it opens).",
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
      "NJ"
    ],
    "location": "New Jersey; conferences and site visits across the state",
    "when": "School year, fall through spring",
    "eligibility": "You must be a New Jersey student in 10th to 12th grade (or in college) with a 3.5 GPA or higher and a love of STEM.",
    "requires": [
      "Online application",
      "Transcript or GPA",
      "Essay"
    ],
    "opens": "2027-03-01",
    "deadline": "2026-06-11",
    "deadlineNote": "Past cycle: applications for the 2026-2027 class closed June 11, 2026. The official apply page says 2027-2028 applications open March 1, 2027.",
    "url": "https://www.govstemscholars.com/apply",
    "verifiedOn": "2026-10-01",
    "notes": "Eligibility, GPA and stipend details come from the official site's summary; the apply page only confirms the March 1, 2027 opening."
  },
  {
    "id": "youngarts-national-arts-competition",
    "name": "YoungArts National Arts Competition",
    "org": "National YoungArts Foundation",
    "kind": "competition",
    "paid": "paid",
    "costNote": "Cash awards from $250 to $10,000 for all winners. Application fee not confirmed on the page.",
    "fields": [
      "Arts & Media"
    ],
    "grades": [
      10,
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Online application; National YoungArts Week in Miami, FL for top winners",
    "when": "Apply by early October; winners announced later in the year",
    "eligibility": "You must be in grades 10 to 12 or age 15 to 18 as of December 1, 2026, and a US citizen, permanent resident, or able to receive taxable income in the US.",
    "requires": [
      "Online application",
      "Portfolio, audition or writing samples for your discipline"
    ],
    "opens": "2026-07-21",
    "deadline": "2026-10-06",
    "deadlineNote": "2027 application closes Tuesday, October 6, 2026 at 8 pm ET.",
    "url": "https://youngarts.org/apply/",
    "verifiedOn": "2026-10-01",
    "notes": "Ten disciplines: classical music, dance, design, film, jazz, photography, theater, visual arts, voice, writing."
  },
  {
    "id": "congressional-app-challenge",
    "name": "Congressional App Challenge",
    "org": "U.S. House of Representatives",
    "kind": "competition",
    "paid": "free",
    "costNote": "Free to enter.",
    "fields": [
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
    "location": "Your congressional district (online submission)",
    "when": "Challenge launches in May; submit by late October",
    "eligibility": "You must be a middle or high school student living in the US, entering alone or in a team of up to four in the district where you live or go to school.",
    "requires": [
      "Registration",
      "A working app in any language",
      "Submission through the online portal"
    ],
    "opens": "2026-01-01",
    "deadline": "2026-10-26",
    "deadlineNote": "2026 deadline to register and submit your app online is October 26, 2026.",
    "url": "https://www.congressionalappchallenge.us/students/rules/",
    "verifiedOn": "2026-10-01",
    "notes": "No citizenship requirement."
  },
  {
    "id": "conrad-challenge",
    "name": "Conrad Challenge",
    "org": "Conrad Foundation / Space Center Houston",
    "kind": "competition",
    "paid": "tuition",
    "costNote": "Activation and Lean Canvas stages are free. Innovation Stage fee $499 per team; financial aid available.",
    "fields": [
      "Tech & Engineering",
      "Science & Research",
      "Business & Finance"
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
    "location": "Online, with the Innovation Summit in person in April",
    "when": "August to April; Activation Stage ends late October, Innovation Stage ends early January",
    "eligibility": "You need a team of 2 to 5 students age 13 to 18 and an adult coach; teams from anywhere can enter.",
    "requires": [
      "Team of 2 to 5 students",
      "Adult coach",
      "Activation Stage submission",
      "Innovation Stage business plan and video (fee)"
    ],
    "opens": "2026-08-27",
    "deadline": "2026-10-29",
    "deadlineNote": "End of the Activation Stage, October 29, 2026. Innovation Stage closes January 7, 2027.",
    "url": "https://conrad.spacecenter.org/the-challenge/",
    "verifiedOn": "2026-10-01",
    "notes": "Categories: water, health and nutrition, energy and environment, cyber technology and security, aerospace and aviation."
  },
  {
    "id": "research-science-institute-rsi",
    "name": "Research Science Institute (RSI)",
    "org": "Center for Excellence in Education with MIT",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free. RSI describes itself as cost-free to students.",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "MIT, Cambridge, MA (residential)",
    "when": "About 6 weeks, late June to early August",
    "eligibility": "You must be a high school junior; seniors cannot apply.",
    "requires": [
      "Online application",
      "Essays",
      "Transcript",
      "Test scores",
      "Teacher recommendations"
    ],
    "opens": "2026-10-01",
    "deadline": "2026-12-11",
    "deadlineNote": "RSI 2027 applications open October 1, 2026 and close December 11, 2026.",
    "url": "https://www.cee.org/programs/research-science-institute",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "bezos-scholars-program",
    "name": "Bezos Scholars Program",
    "org": "Bezos Family Foundation",
    "kind": "leadership",
    "paid": "free",
    "costNote": "Cost not stated on the official page; historically fully funded, so confirm when applying.",
    "fields": [
      "Public Service & Law",
      "Any"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Year-long program with your school; summer leadership experience location varies",
    "when": "School year, with a summer leadership experience",
    "eligibility": "You must be a high school junior at a US public high school where at least 30 percent of students get free or reduced lunch, or that is a Title I school.",
    "requires": [
      "Online application",
      "Nominate an educator partner from your school",
      "Essays"
    ],
    "opens": "2026-11-19",
    "deadline": "2027-01-12",
    "deadlineNote": "Applications open November 19, 2026 and close January 12, 2027.",
    "url": "https://www.bezosscholars.org/",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "nih-summer-internship-program-hs-seniors",
    "name": "NIH Summer Internship Program (high school seniors)",
    "org": "National Institutes of Health",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "Paid stipend set by education level; no housing provided.",
    "fields": [
      "Health & Medicine",
      "Science & Research"
    ],
    "grades": [
      12
    ],
    "states": [
      "Any"
    ],
    "location": "NIH campuses, mainly Bethesda, MD",
    "when": "Full time in summer, between May and August",
    "eligibility": "You must be a US citizen or permanent resident, a high school senior now who graduates before the internship, and 18 by September 30, 2027 (17-year-olds must live within 40 miles of an NIH campus).",
    "requires": [
      "NIH Application Center profile",
      "Coursework list",
      "Resume",
      "Personal statement",
      "Two references"
    ],
    "opens": "2026-10-13",
    "deadline": "2027-01-26",
    "deadlineNote": "SIP 2027 application opens October 13, 2026 and closes January 26, 2027 at noon ET; reference letters due February 2, 2027.",
    "url": "https://www.training.nih.gov/research-training/pb/sip/",
    "verifiedOn": "2026-10-01",
    "notes": "Selection is by individual investigators."
  },
  {
    "id": "princeton-prize-in-race-relations",
    "name": "Princeton Prize in Race Relations",
    "org": "Princeton University Alumni Association",
    "kind": "competition",
    "paid": "paid",
    "costNote": "$2,500 award plus a paid trip to the Symposium on Race at Princeton for winners.",
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
    "location": "Online application; symposium at Princeton, NJ",
    "when": "Apply in fall and winter; winners announced in spring",
    "eligibility": "You must be in grades 9 to 12 in the US and have led an activity that advanced racial equity or understanding.",
    "requires": [
      "Two-part online application",
      "Short written responses",
      "Sponsor section by an unrelated adult",
      "Supporting materials"
    ],
    "opens": null,
    "deadline": "2027-01-31",
    "deadlineNote": "Annual deadline is January 31 per the official FAQ. Applications were closed for the season on October 1, 2026; it typically reopens in the fall.",
    "url": "https://pprize.princeton.edu/apply",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "mit-mites-summer",
    "name": "MITES Summer",
    "org": "MIT Office of Engineering Outreach Programs",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free. Room, board and program costs covered; students pay only travel to and from MIT.",
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
    "location": "MIT, Cambridge, MA (residential)",
    "when": "6 weeks, late June to end of July",
    "eligibility": "You must be in 11th grade now and be a US citizen or permanent resident.",
    "requires": [
      "Online application",
      "Six short answers (300 words each)",
      "Three recommendations via portal",
      "Transcript uploaded by counselor",
      "Test scores optional"
    ],
    "opens": "2026-11",
    "deadline": "2027-02-01",
    "deadlineNote": "Application opens in November and closes February 1 at 11:59 pm PST; recommenders have until February 15.",
    "url": "https://mites.mit.edu/discover-mites/apply-to-mites/prepare-your-application-mites-summer-and-mites-semester",
    "verifiedOn": "2026-10-01",
    "notes": "Same application as MITES Semester; you can apply to both. Decisions mid to late April."
  },
  {
    "id": "mit-mites-semester",
    "name": "MITES Semester",
    "org": "MIT Office of Engineering Outreach Programs",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free online program.",
    "fields": [
      "Tech & Engineering",
      "Science & Research"
    ],
    "grades": [
      11
    ],
    "states": [
      "Remote"
    ],
    "location": "Online (must be in the US while participating)",
    "when": "6 months, June to December; 25 to 30 hours a week in summer, 3 to 5 hours a week in fall",
    "eligibility": "You must be in 11th grade now, be a US citizen or permanent resident, and stay in the US during the program.",
    "requires": [
      "Online application",
      "Six short answers (300 words each)",
      "Three recommendations via portal",
      "Transcript uploaded by counselor",
      "Test scores optional"
    ],
    "opens": "2026-11",
    "deadline": "2027-02-01",
    "deadlineNote": "Application opens in November and closes February 1 at 11:59 pm PST; recommenders have until February 15.",
    "url": "https://mites.mit.edu/discover-mites/mites-semester/",
    "verifiedOn": "2026-10-01",
    "notes": "Formerly MOSTEC. Evening sessions, no classes Fridays or Saturdays."
  },
  {
    "id": "carnegie-mellon-sams",
    "name": "Summer Academy for Math and Science (SAMS)",
    "org": "Carnegie Mellon University",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free. No cost beyond travel to and from Pittsburgh.",
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
    "location": "Carnegie Mellon University, Pittsburgh, PA (residential)",
    "when": "6 weeks, late June to early August",
    "eligibility": "You must be 16 by late June 2027, be between 11th and 12th grade in summer 2027, and be a US citizen or permanent resident.",
    "requires": [
      "Online application",
      "Unofficial transcript",
      "Standardized test scores",
      "Two recommendations (one from your math teacher)",
      "Two essays",
      "Financial documentation or fee waiver"
    ],
    "opens": null,
    "deadline": "2027-02-01",
    "deadlineNote": "Deadline February 1, 2027; decisions April 1, 2027.",
    "url": "https://www.cmu.edu/pre-college/academic-programs/sams.html",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "launchx-entrepreneurship",
    "name": "LaunchX Entrepreneurship Programs",
    "org": "LaunchX",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "Online BootCamp $2,495; Online Entrepreneurship $7,495; in-person Entrepreneurship (San Diego) $13,495 with housing and food. Application fee $50 to $100. Financial awards available.",
    "fields": [
      "Business & Finance"
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
    "location": "Online, or in person in San Diego, CA",
    "when": "Summer; online 5 weeks mid July to mid August, in person about 4 weeks",
    "eligibility": "You must be a high school student age 14 to 18.",
    "requires": [
      "Online application",
      "Application fee",
      "Essays or video"
    ],
    "opens": "2026-10-01",
    "deadline": "2027-03-31",
    "deadlineNote": "Summer 2027 final deadline March 31, 2027. Priority November 11, 2026; early January 21, 2027; financial award deadline March 4, 2027.",
    "url": "https://www.launchx.com/admissions/cost",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "nj-scholars-program",
    "name": "New Jersey Scholars Program",
    "org": "New Jersey Scholars Program",
    "kind": "summer",
    "paid": "free",
    "costNote": "Tuition-free. Room, board and academics covered by donations; students pay only personal expenses.",
    "fields": [
      "Any",
      "Arts & Media",
      "Public Service & Law"
    ],
    "grades": [
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "Residential, New Jersey",
    "when": "5 weeks, late June to late July",
    "eligibility": "You must be a New Jersey resident finishing junior year who is picked by your school as one of up to two nominees.",
    "requires": [
      "Nomination by your school (max 2)",
      "Essays",
      "A paper written for a class",
      "Two letters of recommendation",
      "Group interview if a finalist"
    ],
    "opens": "2026-10",
    "deadline": null,
    "deadlineNote": "Applications are not online; your counselor submits them. Past cycles closed in early January. The 2027 date was not posted as of Oct 1, 2026.",
    "url": "https://www.newjerseyscholarsprogram.org/",
    "verifiedOn": "2026-10-01",
    "notes": "39 Scholars chosen each year."
  },
  {
    "id": "nj-governors-school-sciences-drew",
    "name": "New Jersey Governor's School in the Sciences",
    "org": "Drew University",
    "kind": "summer",
    "paid": "free",
    "costNote": "Tuition-free residential program funded by donors and the State of NJ.",
    "fields": [
      "Science & Research"
    ],
    "grades": [
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "Drew University, Madison, NJ (residential)",
    "when": "3 weeks, mid July to early August",
    "eligibility": "You must live in New Jersey, be a high school junior this fall, and be nominated by your school.",
    "requires": [
      "Nomination by your school",
      "Online student information form",
      "Two essays",
      "Two hand-signed recommendations (one science teacher, one math teacher)",
      "Transcript",
      "PSAT and SAT scores"
    ],
    "opens": "2026-11",
    "deadline": null,
    "deadlineNote": "Nominee applications are submitted mid-November to mid-January; the exact 2027 date is in the application packet.",
    "url": "https://drew.edu/academic/continuing-education-non-degree-programs/summer-programs/governors-school/apply/",
    "verifiedOn": "2026-10-01",
    "notes": "Decisions emailed in early April. Nomination slots: 1 per school up to 325 juniors, 2 up to 650, 3 above 650."
  },
  {
    "id": "princeton-summer-journalism-program",
    "name": "Princeton Summer Journalism Program (PSJP)",
    "org": "Princeton University",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free. Travel, housing, meals and equipment for the residential part are covered.",
    "fields": [
      "Arts & Media",
      "Public Service & Law"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Online in June and July, then 10 days at Princeton, NJ",
    "when": "Summer intensive June to early August, then college counseling through senior year",
    "eligibility": "You must be a full-time high school junior in the US with at least a 3.5 unweighted GPA, interest in journalism, and family income under about $65,000 or free or reduced lunch or a test fee waiver.",
    "requires": [
      "Online application",
      "Essays",
      "Transcript",
      "Recommendation"
    ],
    "opens": "2026-11",
    "deadline": null,
    "deadlineNote": "Round 1 of the 2027 application runs November 2026 to January 2027; the exact close date was not posted.",
    "url": "https://psjp.princeton.edu/apply/eligibility",
    "verifiedOn": "2026-10-01",
    "notes": "First-generation students get priority."
  },
  {
    "id": "lsc-partners-in-science",
    "name": "Partners in Science",
    "org": "Liberty Science Center",
    "kind": "internship",
    "paid": "stipend",
    "costNote": "Stipend paid on successful completion; amount not stated.",
    "fields": [
      "Science & Research",
      "Health & Medicine",
      "Tech & Engineering"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "Research labs in the New Jersey and New York area, coordinated from Jersey City, NJ",
    "when": "8 weeks in summer",
    "eligibility": "You must be a rising junior or senior (a 10th or 11th grader now) with strong ability or potential in STEM.",
    "requires": [
      "Online application",
      "Essays",
      "Transcript",
      "Teacher recommendation"
    ],
    "opens": "2026-11",
    "deadline": null,
    "deadlineNote": "The 2027 application opens later in fall 2026; the deadline is not yet posted.",
    "url": "https://lsc.org/education/educators/partners-in-science",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "hoby-state-leadership-seminar",
    "name": "HOBY State Leadership Seminar",
    "org": "Hugh O'Brian Youth Leadership",
    "kind": "leadership",
    "paid": "tuition",
    "costNote": "Registration fee $225 to $450 depending on location; most fees are paid by the nominating school.",
    "fields": [
      "Public Service & Law",
      "Any"
    ],
    "grades": [
      10
    ],
    "states": [
      "Any"
    ],
    "location": "College campuses in each state, including New Jersey",
    "when": "3 to 4 days in spring or summer",
    "eligibility": "You must be a high school sophomore nominated by your school or a community nominator.",
    "requires": [
      "Nomination by your school or a community member",
      "Student and parent registration form"
    ],
    "opens": "2026-09",
    "deadline": null,
    "deadlineNote": "School nominations are open now for the 2027 seminars; each seminar sets its own date.",
    "url": "https://hoby.org/faq/",
    "verifiedOn": "2026-10-01",
    "notes": "Most seminars take at least 2 nominees per school."
  },
  {
    "id": "first-robotics-competition",
    "name": "FIRST Robotics Competition",
    "org": "FIRST",
    "kind": "competition",
    "paid": "free",
    "costNote": "Students join an existing team, often free to them. Team registration is $6,500 per season, with grants available.",
    "fields": [
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
    "location": "Local teams; district and regional events, then the FIRST Championship",
    "when": "Kickoff January 9, 2027; build and competition season January to April",
    "eligibility": "You must be in grades 9 to 12 (ages 14 to 18) and join or start a team.",
    "requires": [
      "Join a team through the Teams and Events search"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No student deadline; teams register each fall and the 2027 game releases January 9, 2027.",
    "url": "https://www.firstinspires.org/robotics/frc",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "skillsusa-championships",
    "name": "SkillsUSA Championships",
    "org": "SkillsUSA",
    "kind": "competition",
    "paid": "free",
    "costNote": "Qualification is through your school chapter; travel costs vary. Medalists may win scholarships, tools and job offers.",
    "fields": [
      "Skilled Trades",
      "Tech & Engineering",
      "Health & Medicine"
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
    "location": "State contests in each state; nationals in Atlanta, GA",
    "when": "Local and state contests in winter and spring; nationals in June",
    "eligibility": "You must be a SkillsUSA member in a career and technical program and win your state gold medal to compete nationally.",
    "requires": [
      "SkillsUSA chapter membership at your school",
      "Win district or regional and state competitions"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No direct application; state competition dates vary.",
    "url": "https://www.skillsusa.org/competitions/skillsusa-championships/",
    "verifiedOn": "2026-10-01",
    "notes": "113 skilled and leadership competitions."
  },
  {
    "id": "girls-who-code-pathways",
    "name": "Girls Who Code Pathways",
    "org": "Girls Who Code",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free.",
    "fields": [
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
    "location": "Online, with in-person Industry Immersion Days in select cities",
    "when": "Year-round, self-paced; 6 to 7 weeks to finish course projects",
    "eligibility": "You must be a girl or non-binary student in grades 9 to 12, including rising 9th graders and graduating seniors.",
    "requires": [
      "Online application"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Apply Now is live; no deadline shown.",
    "url": "https://girlswhocode.com/programs/pathways",
    "verifiedOn": "2026-10-01",
    "notes": "The Summer Immersion Program page no longer exists; the site lists Clubs and Pathways."
  },
  {
    "id": "kode-with-klossy-camp",
    "name": "Kode With Klossy Camp",
    "org": "Kode With Klossy",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free.",
    "fields": [
      "Tech & Engineering"
    ],
    "grades": [
      9,
      10,
      11,
      12
    ],
    "states": [
      "Any",
      "Remote"
    ],
    "location": "Virtual, or in person in New York, Chicago, Dallas, Oakland, San Francisco, Seattle, St. Louis and Washington DC",
    "when": "2 weeks in June, July or August",
    "eligibility": "You must be a young woman or gender-expansive person age 13 to 18; no coding experience needed.",
    "requires": [
      "Online application"
    ],
    "opens": "2027-02",
    "deadline": null,
    "deadlineNote": "Camp applications for Summer 2027 open in February 2027; deadline not yet posted.",
    "url": "https://www.kodewithklossy.com/programs",
    "verifiedOn": "2026-10-01",
    "notes": "Two-day Code-a-Bration workshops run year-round and sign-ups are open."
  },
  {
    "id": "apprenticeship-gov-youth-finder",
    "name": "Apprenticeship Job Finder (youth apprenticeships)",
    "org": "U.S. Department of Labor, Apprenticeship.gov",
    "kind": "apprenticeship",
    "paid": "paid",
    "costNote": "Paid from day one with scheduled raises; no tuition.",
    "fields": [
      "Skilled Trades",
      "Tech & Engineering",
      "Health & Medicine",
      "Any"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Nationwide; search by location",
    "when": "Rolling; openings posted year-round",
    "eligibility": "Registered Apprenticeship is open to young people age 16 to 24; many programs link to high school CTE or pre-apprenticeship.",
    "requires": [
      "Search the Apprenticeship Job Finder",
      "Apply directly to the employer or sponsor"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "A finder, not a single program; each posting has its own dates.",
    "url": "https://www.apprenticeship.gov/educators/apprenticeship-for-young-people",
    "verifiedOn": "2026-10-01",
    "notes": "Grades are inferred from the age-16 minimum."
  },
  {
    "id": "microsoft-discovery-program",
    "name": "Microsoft Discovery Program",
    "org": "Microsoft",
    "kind": "internship",
    "paid": "paid",
    "costNote": "Paid internship; hourly rate not stated on the official careers page.",
    "fields": [
      "Tech & Engineering"
    ],
    "grades": [
      12
    ],
    "states": [
      "WA",
      "GA"
    ],
    "location": "Redmond, WA or Atlanta, GA",
    "when": "4 weeks in July",
    "eligibility": "You must be a graduating high school senior who lives near Redmond, WA or Atlanta, GA and is about to start college.",
    "requires": [
      "Online application when the posting opens",
      "Resume"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No 2027 posting yet; 2026 postings appeared in February with a March deadline.",
    "url": "https://careers.microsoft.com/v2/global/en/students",
    "verifiedOn": "2026-10-01",
    "notes": null
  },
  {
    "id": "stevens-pre-college-summer",
    "name": "Stevens Pre-College Summer Programs",
    "org": "Stevens Institute of Technology",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "Tuition charged; amounts not posted yet for 2027. No application fee. Alumni may earn a $5,000 to $10,000 renewable Stevens scholarship if later admitted.",
    "fields": [
      "Tech & Engineering",
      "Business & Finance",
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
    "location": "Stevens Institute of Technology, Hoboken, NJ (residential, commuter and virtual options)",
    "when": "1 to 2 week sessions in summer",
    "eligibility": "You must be a high school student; exact grade rules are set per program.",
    "requires": [
      "Online application (no fee)"
    ],
    "opens": "2026-12",
    "deadline": null,
    "deadlineNote": "Applications for Summer 2027 open in December 2026.",
    "url": "https://www.stevens.edu/admission-aid/pre-college-programs",
    "verifiedOn": "2026-10-01",
    "notes": "Also lists ACES and the Art Harper Saturday Academy for students with financial hardship."
  },
  {
    "id": "rutgers-summer-scholars",
    "name": "Rutgers Summer Scholars",
    "org": "Rutgers University New Brunswick",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "Tuition for Rutgers credit courses; amount not shown on the program page.",
    "fields": [
      "Any",
      "Science & Research",
      "Arts & Media",
      "Business & Finance"
    ],
    "grades": [
      10,
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Rutgers New Brunswick, NJ; online, hybrid and in-person courses",
    "when": "Summer; take up to two 3-credit courses",
    "eligibility": "You must be a high school student who is 16 or older by the course start date and not graduating this spring.",
    "requires": [
      "Online application",
      "Transcript"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "2027 dates not posted.",
    "url": "https://precollegesummer.rutgers.edu/scholars",
    "verifiedOn": "2026-10-01",
    "notes": "Grades are inferred from the age-16 rule. Rutgers also runs one-week residential Summer Academies."
  },
  // Finance and business, read from each official page on 2 Oct 2026 (Chandu: "populate especially the one with investment banking... REAL ones relevant to careers"). careers lists the career pages that show them first.
  {
    "id": "wharton-global-high-school-investment-competition",
    "name": "Wharton Global High School Investment Competition",
    "org": "Wharton Global Youth Program, The Wharton School, University of Pennsylvania",
    "kind": "competition",
    "paid": "free",
    "costNote": "The page describes the competition as free.",
    "fields": [
      "Business & Finance"
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
    "location": "Online (Wharton Investment Simulator); Global Finale in person at Wharton in Philadelphia",
    "when": "2026-2027 season: trading began September 28, 2026; final report due December 4, 2026; Learning Day and Global Finale April 29 and 30 in Philadelphia",
    "eligibility": "You must be in grades 9 to 12. You must compete on a team of four to six students, with a teacher from your school as your advisor.",
    "requires": [
      "Team of 4 to 6 students",
      "Teacher advisor from your school",
      "Official team roster",
      "Trading Notes Analysis",
      "Investment Policy Statement",
      "Final report"
    ],
    "opens": "2026-08-10",
    "deadline": "2026-09-11",
    "deadlineNote": "Registration for the 2026-2027 competition is closed. It closed September 11, 2026 at 5:00 p.m. ET. Dates for the next season are not yet posted.",
    "url": "https://globalyouth.wharton.upenn.edu/investment-competition/",
    "verifiedOn": "2026-10-02",
    "notes": "The page says the competition is for high school students in 9th to 12th grade. Most of it runs online, and the finals are in person in Philadelphia.",
    "careers": [
      "investment-banking",
      "private-equity",
      "stockbroker",
      "financial-advisor"
    ]
  },
  {
    "id": "wharton-essentials-of-finance",
    "name": "Essentials of Finance",
    "org": "Wharton Global Youth Program, The Wharton School, University of Pennsylvania",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "2026 tuition was $8,299 (residential). Non-refundable $100 application fee; fee waivers for School District of Philadelphia public and charter students and partner nominees. Need-based scholarships available but limited.",
    "fields": [
      "Business & Finance"
    ],
    "grades": [
      9,
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Philadelphia, PA (on campus, residential)",
    "when": "Two-week residential sessions. 2026 sessions ran June 7 to August 8, 2026 (four sessions).",
    "eligibility": "You must be in grades 9 to 11 now. You must have at least a 3.3 unweighted GPA.",
    "requires": [
      "Application form",
      "High school transcript or grade reports",
      "Recommendation from a counselor, teacher, or advisor",
      "Short essays",
      "English test scores if needed",
      "$100 application fee (waivers available)"
    ],
    "opens": "2026-11",
    "deadline": null,
    "deadlineNote": "The 2026 deadlines were January 28, 2026 (priority) and March 18, 2026 (final). 2027 dates are not yet posted. The page says applications open in November.",
    "url": "https://globalyouth.wharton.upenn.edu/programs-courses/essentials-of-finance/",
    "verifiedOn": "2026-10-02",
    "notes": "Tuition and aid details come from https://globalyouth.wharton.upenn.edu/on-campus-programs/costs-and-aid/. The GPA rule, fee and required documents come from https://globalyouth.wharton.upenn.edu/application-information/.",
    "careers": [
      "investment-banking",
      "private-equity",
      "management-analyst",
      "financial-advisor",
      "accountant"
    ]
  },
  {
    "id": "ny-fed-high-school-fed-challenge",
    "name": "High School Fed Challenge",
    "org": "Federal Reserve Bank of New York",
    "kind": "competition",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Business & Finance"
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
    "location": "National; online submission to the Federal Reserve Bank of New York",
    "when": "2026-2027 competition. Theme: Economics of Housing. Scripts due March 15, 2027.",
    "eligibility": "You must be in grades 9 to 12. Each school can enter one team, and a faculty advisor must register it.",
    "requires": [
      "Faculty advisor registers the team online",
      "Academically researched podcast script on the theme"
    ],
    "opens": null,
    "deadline": "2027-02-15",
    "deadlineNote": "Team registration is due February 15, 2027. The podcast script is due March 15, 2027.",
    "url": "https://www.newyorkfed.org/outreach-and-education/high-school/high-school-fed-challenge",
    "verifiedOn": "2026-10-02",
    "notes": "Registration is open now. Selected papers are published in the Journal of Future Economists, and all teams that submit get participation certificates. The page states no cost.",
    "careers": [
      "investment-banking",
      "private-equity",
      "management-analyst"
    ]
  },
  {
    "id": "cee-national-economics-challenge",
    "name": "National Economics Challenge",
    "org": "Council for Economic Education",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "No entry fee is stated. Teams that reach the National Finals get an all-expense-paid trip to Atlanta, excluding travel.",
    "fields": [
      "Business & Finance"
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
    "location": "State rounds and online semi-finals; National Finals in Atlanta, GA",
    "when": "2026 cycle: online semi-finals April 20 to 24, 2026; National Finals May 27 to 29, 2026 in Atlanta.",
    "eligibility": "You must be a high school student. You compete on a team of up to five students, and no economics class is required.",
    "requires": [
      "Team of up to 5 students",
      "Register through your state on the NEC site",
      "Online exams in micro, macro, and international economics"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The 2026 competition is over (finals were May 27 to 29, 2026). 2027 dates are not yet posted. The CEE page offers a sign-up form for updates when registration opens.",
    "url": "https://econedlink.org/national-economics-challenge/",
    "verifiedOn": "2026-10-02",
    "notes": "Two divisions: Adam Smith (AP, IB, honors and returning competitors) and David Ricardo (first-timers with at most one economics course). Prizes run from $1,000 for 1st place to $200 for 4th. Grades 9 to 12 is inferred from the statement that all high school students are eligible.",
    "careers": [
      "management-analyst"
    ]
  },
  {
    "id": "deca-finance-competitive-events",
    "name": "DECA High School Competitive Events (Finance cluster)",
    "org": "DECA Inc.",
    "kind": "competition",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Business & Finance"
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
    "location": "Local and chartered association (state) competitions; 2027 International Career Development Conference in Anaheim, CA",
    "when": "International Career Development Conference: April 17 to 20, 2027, Anaheim Convention Center",
    "eligibility": "You must be a DECA member at your high school. You must place as a finalist in your state or chartered association to go to the international conference.",
    "requires": [
      "DECA membership on a chapter roster",
      "Qualify through your chartered association",
      "Event exam and role-plays or prepared project, depending on the event"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": null,
    "url": "https://www.deca.org/compete",
    "verifiedOn": "2026-10-02",
    "notes": "Finance events: Accounting Applications Series, Business Finance Series, Finance Operations Research, Financial Consulting, Financial Services Team Decision Making, Principles of Finance, Stock Market Game, Virtual Business Challenge Accounting, and Virtual Business Challenge Personal Finance. Grades 9 to 12 is inferred from the page labeling these as high school events. Deadlines are set by each state.",
    "careers": [
      "financial-advisor",
      "accountant",
      "stockbroker"
    ]
  },
  {
    "id": "diamond-challenge",
    "name": "Diamond Challenge",
    "org": "Horn Entrepreneurship, University of Delaware",
    "kind": "competition",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Business & Finance"
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
    "location": "Online submission; pitch events live or virtual; Summit April 29 and 30, 2027",
    "when": "2026-27 season: registration opened September 16, 2026; submissions due January 14, 2027; finalists announced March 9; Summit April 29 and 30, 2027",
    "eligibility": "You must be a high school student aged 14 to 18 on the submission deadline. You must compete on a team of 2 to 4 students with one adult advisor aged 21 or older.",
    "requires": [
      "Team of 2 to 4 students",
      "Adult advisor aged 21+",
      "Written concept narrative (3 to 5 pages, PDF)",
      "Introductory video (60 seconds max)"
    ],
    "opens": "2026-09-16",
    "deadline": "2027-01-14",
    "deadlineNote": "Submissions are due January 14 at 5:00 p.m. EST. The timeline page does not print the year; 2027 comes from the page title and the homepage notice that 2026-27 applications are open.",
    "url": "https://diamondchallenge.org/competition/",
    "verifiedOn": "2026-10-02",
    "notes": "Two tracks, business innovation and social innovation. The top three teams in each track win $12,000, $8,000, and $4,500. A concept must not have earned more than $100,000 before the deadline. Entry fee is not stated.",
    "careers": [
      "entrepreneur"
    ]
  },
  {
    "id": "sifma-investwrite",
    "name": "InvestWrite",
    "org": "SIFMA Foundation",
    "kind": "competition",
    "paid": "unknown",
    "costNote": null,
    "fields": [
      "Business & Finance"
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
    "location": "Online; national essay competition",
    "when": "Fall 2026 essays due December 9; Spring 2027 essays due March 19",
    "eligibility": "You must be playing The Stock Market Game in an eligible session with a teacher advisor. You write your essay alone, in the grade 9 to 12 division.",
    "requires": [
      "Take part in The Stock Market Game through your teacher",
      "Individual essay of 500 to 1,000 words (grades 9 to 12)",
      "Teacher advisor submits the best essays online"
    ],
    "opens": null,
    "deadline": "2026-12-09",
    "deadlineNote": "This is the Fall 2026 deadline. The Spring 2027 deadline is March 19, 2027.",
    "url": "https://sifmafoundation.org/investwrite/competition",
    "verifiedOn": "2026-10-02",
    "notes": "The top 10 students in each grade division are recognized nationally. Your teacher submits your essay, so you cannot enter on your own. The cost of The Stock Market Game is not stated on this page.",
    "careers": [
      "investment-banking",
      "stockbroker",
      "financial-advisor"
    ]
  },
  // Added 3 Oct 2026 from a second verified research pass (official pages only).
  {
    "id": "nyu-tandon-arise",
    "name": "Applied Research Innovations in Science and Engineering (ARISE)",
    "org": "NYU Tandon School of Engineering",
    "kind": "summer",
    "paid": "stipend",
    "costNote": "Free, plus a stipend for students who finish the program",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "NY"
    ],
    "location": "NYU Tandon School of Engineering, Brooklyn, NY (remote first, then in a lab)",
    "when": "10 weeks in summer: about 4 weeks of remote workshops, then 6 weeks in a lab (2026: June 1 to August 14)",
    "eligibility": "You must be a rising junior or senior who lives in New York City full time and goes to a New York City school.",
    "requires": [
      "Online application",
      "Optional recommendation letter",
      "Group interview",
      "One-on-one interview"
    ],
    "opens": "2026-01",
    "deadline": "2026-02-27",
    "deadlineNote": "Past cycle: 2026 applications ran January 15 to February 27, 2026. 2027 dates not yet posted.",
    "url": "https://k12stem.engineering.nyu.edu/programs/arise",
    "verifiedOn": "2026-10-03",
    "notes": "About 150 hours of lab work across 80+ labs. Students present at a colloquium and a poster symposium at the American Museum of Natural History.",
    "whatYouDo": [
      "Do research in an NYU lab with faculty and mentors",
      "Take remote workshops and training first",
      "Present your research at a colloquium and a poster symposium"
    ],
    "schedule": "Summer, 10 weeks",
    "setting": "Hybrid",
    "pay": "Stipend of $2,000"
  },
  {
    "id": "whitney-youth-insights-artists",
    "name": "Youth Insights (YI) Artists",
    "org": "Whitney Museum of American Art",
    "kind": "fellowship",
    "paid": "free",
    "costNote": "Free",
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
    "location": "Whitney Museum of American Art, New York, NY",
    "when": "Semester-long, after school",
    "eligibility": "You must be a New York City high school student in grades 9 to 12.",
    "requires": [
      "Application on the Whitney website"
    ],
    "opens": null,
    "deadline": "2026-09-09",
    "deadlineNote": "The fall 2026 deadline was September 9, 2026; the next date is not posted.",
    "url": "https://whitney.org/education/teens/youth-insights",
    "verifiedOn": "2026-10-03",
    "notes": "Finishing YI Artists or YI Arts Careers makes you eligible for YI Leaders, a paid internship (3 to 10 hours a week) for grades 11 and 12.",
    "whatYouDo": [
      "Make art with contemporary artists",
      "Talk about art and current issues",
      "Create an original work for a final exhibition"
    ],
    "schedule": "Part-time, after school",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "studio-museum-expanding-the-walls",
    "name": "Expanding the Walls",
    "org": "The Studio Museum in Harlem",
    "kind": "fellowship",
    "paid": "stipend",
    "costNote": "Free, with a $1,000 stipend and a Canon DSLR camera when you finish",
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
    "location": "Studio Museum in Harlem, 144 W 125th St, New York, NY, plus field trips",
    "when": "January 9 to August 5, 2027: Tuesdays 4 to 6:30 pm and Saturdays 11 am to 3 pm; three weekdays a week in July",
    "eligibility": "You must be high school age. No photography experience needed. To get the stipend you must be a US citizen, permanent resident, or allowed to work without a visa.",
    "requires": [
      "Online application"
    ],
    "opens": null,
    "deadline": "2026-11-06",
    "deadlineNote": "Open now. Applications for 2027 are due November 6, 2026 at 11:59 pm.",
    "url": "https://www.studiomuseum.org/expanding-the-walls",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Learn photography and study photographers like James Van Der Zee",
      "Visit museums and meet arts professionals",
      "Make your own photo project and help curate an exhibition"
    ],
    "schedule": "Part-time, 8 months",
    "setting": "In person",
    "pay": "Stipend of $1,000"
  },
  {
    "id": "cooper-union-saturday-program",
    "name": "The Saturday Program",
    "org": "The Cooper Union",
    "kind": "fellowship",
    "paid": "free",
    "costNote": "Free",
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
    "location": "The Cooper Union, New York, NY",
    "when": "Saturdays 10 am to 5 pm. Fall 2026: October 3 to December 12. Spring 2027: January 30 to April 10.",
    "eligibility": "For New York City public or charter high school students. Selection weighs a mix of factors, such as low or moderate family income, a school without a full visual arts program, or public assistance.",
    "requires": [
      "Online application"
    ],
    "opens": null,
    "deadline": "2026-09-13",
    "deadlineNote": "Fall 2026 applications closed September 13, 2026; the spring 2027 date is not posted.",
    "url": "https://cooper.edu/academics/outreach-and-pre-college/saturday-program",
    "verifiedOn": "2026-10-03",
    "notes": "Portfolio classes are for 11th and 12th graders. Past students can return.",
    "whatYouDo": [
      "Take art and architecture classes taught by Cooper Union students",
      "Go on field trips and studio visits with working artists",
      "Build a portfolio and get help with college applications"
    ],
    "schedule": "Saturdays, school year",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "columbia-science-honors-program",
    "name": "Science Honors Program (SHP)",
    "org": "Columbia University",
    "kind": "fellowship",
    "paid": "tuition",
    "costNote": "Program fee of $900 a year for new students from fall 2026, plus a $50 application fee. Fee waivers may be available for documented financial hardship.",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      9,
      10,
      11
    ],
    "states": [
      "NY",
      "NJ",
      "CT"
    ],
    "location": "Columbia University Morningside campus, New York, NY (in person only)",
    "when": "Saturdays 10 am to 12:30 pm, September to May",
    "eligibility": "Apply in 9th, 10th or 11th grade to join the next school year. You must live within 75 miles of campus.",
    "requires": [
      "Online application with grades and an essay",
      "Transcript",
      "One recommendation from a math or science teacher, counselor or principal",
      "$50 application fee or waiver",
      "2-hour online entrance exam"
    ],
    "opens": "2026-02",
    "deadline": "2026-04-15",
    "deadlineNote": "Past cycle: applications closed April 15, 2026; transcripts and letters were due April 30. The application opens in early February.",
    "url": "https://outreach.engineering.columbia.edu/SHP",
    "verifiedOn": "2026-10-03",
    "notes": "Bring your own laptop.",
    "whatYouDo": [
      "Take Saturday courses in physical, biological, behavioral and computing sciences",
      "Learn from Columbia scientists who do research"
    ],
    "schedule": "Saturdays, school year",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "rockefeller-ssrp",
    "name": "Summer Science Research Program (SSRP)",
    "org": "The Rockefeller University (RockEDU)",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free, with no application fee. OMNY card for transit. Need-based stipends may be awarded but are not guaranteed.",
    "fields": [
      "Science & Research",
      "Health & Medicine"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "RockEDU Science Outreach Laboratory, The Rockefeller University, New York, NY",
    "when": "7 weeks, about 35 hours a week, 9 am to 5 pm (2026 began June 22)",
    "eligibility": "You must be a high school junior or senior and at least 16 by the start. Sophomores cannot apply. Students from outside the tri-state area may apply but must arrange their own housing and travel.",
    "requires": [
      "Online application",
      "Transcript",
      "Letters of recommendation"
    ],
    "opens": "2025-10",
    "deadline": "2026-01-02",
    "deadlineNote": "Past cycle: 2026 applications opened October 13, 2025 and closed January 2, 2026. 2027 dates not yet posted.",
    "url": "https://www.rockefeller.edu/outreach/ssrp/faqs/",
    "verifiedOn": "2026-10-03",
    "notes": "Research done here cannot be used for science competitions.",
    "whatYouDo": [
      "Do lab research with a team",
      "Learn research skills in the RockEDU lab",
      "Attend required training sessions"
    ],
    "schedule": "Full-time, 7 weeks",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "all-star-code-summer-intensive",
    "name": "All Star Code Summer Intensive",
    "org": "All Star Code",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free to every family",
    "fields": [
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
    "location": "Live online, with in-person programming where available (based in New York, NY)",
    "when": "Six weeks in summer; a free Weekend Intensive in February 2027",
    "eligibility": "The Summer Intensive is for male-identifying high school students anywhere in the US. Workshops and Weekend Intensives are open to any high school student. No coding experience needed.",
    "requires": [
      "Online application",
      "A computer and internet connection (say so if this is a problem)"
    ],
    "opens": "2027-01",
    "deadline": null,
    "deadlineNote": "2027 Summer Intensive applications open January 31, 2027; no deadline is posted yet.",
    "url": "https://allstarcode.org/students/",
    "verifiedOn": "2026-10-03",
    "notes": "Finishing makes you a Scholar; Scholars can apply to the Tech Entrepreneurship Incubator.",
    "whatYouDo": [
      "Learn JavaScript, game design and web development",
      "Build a project that solves a real problem",
      "Present it at Demo Week"
    ],
    "schedule": "Summer, 6 weeks",
    "setting": "Online",
    "pay": null
  },
  {
    "id": "summer-search",
    "name": "Summer Search",
    "org": "Summer Search",
    "kind": "fellowship",
    "paid": "free",
    "costNote": "Free (fully funded)",
    "fields": [
      "Any"
    ],
    "grades": [
      10
    ],
    "states": [
      "NY",
      "CA",
      "MA",
      "PA",
      "WA"
    ],
    "location": "New York City (Manhattan, Brooklyn, Queens, Bronx), San Francisco Bay Area, Boston, Philadelphia, Seattle",
    "when": "Year-round from sophomore year, with summer experiences",
    "eligibility": "You must be a high school sophomore at a partner school and come from a low-income background.",
    "requires": [
      "Online application with short essays",
      "Parent or guardian income and education information",
      "Welcome conversation (some offices)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No dates are posted; check with your school or the local Summer Search office.",
    "url": "https://summersearch.org/apply/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Meet regularly with a staff mentor and peer group",
      "Go on summer learning experiences",
      "Get college and career support after high school"
    ],
    "schedule": "Year-round",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "american-legion-jersey-boys-state",
    "name": "American Legion Jersey Boys State",
    "org": "American Legion Jersey Boys State",
    "kind": "leadership",
    "paid": "tuition",
    "costNote": "$50 fee if a Legion post sponsors you (the post covers the rest). Self-sponsored delegates pay $50 plus $325 tuition.",
    "fields": [
      "Public Service & Law"
    ],
    "grades": [
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "Rider University, Lawrenceville, NJ (residential)",
    "when": "One week in June, starting on Father's Day",
    "eligibility": "You must be a New Jersey high school junior with at least one semester left.",
    "requires": [
      "Recommendation by your school faculty or guidance office",
      "Interview with a local American Legion post (or a self-sponsored application)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The page does not list a deadline; local posts pick delegates.",
    "url": "https://aljbs.org/session-info/faqs/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Run mock city, county and state governments and hold elections",
      "Hear guest speakers and join career seminars",
      "Attend a college fair, sports and music"
    ],
    "schedule": "Full-time, 1 week",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "ala-jersey-girls-state",
    "name": "American Legion Auxiliary Jersey Girls State",
    "org": "American Legion Auxiliary Jersey Girls State",
    "kind": "leadership",
    "paid": "unknown",
    "costNote": "Cost is not listed; delegates are sponsored by an American Legion Auxiliary unit",
    "fields": [
      "Public Service & Law"
    ],
    "grades": [
      11
    ],
    "states": [
      "NJ"
    ],
    "location": "New Jersey (residential)",
    "when": "One week in June (2026: June 21 to 25)",
    "eligibility": "You must be a high school junior who lives in or attends school in New Jersey.",
    "requires": [
      "Sponsorship by an American Legion Auxiliary unit or approved group",
      "Ask your guidance counselor to connect you with your county chair"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "For 2026 all sponsorships were filled; 2027 dates not posted.",
    "url": "https://www.alajgs.org/about-us",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Get placed in a mock city and county",
      "Run in party primaries and general elections",
      "Write and pass bills in a mock legislature"
    ],
    "schedule": "Full-time, 1 week",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "njit-upward-bound",
    "name": "Upward Bound",
    "org": "NJIT Center for Pre-College Programs",
    "kind": "fellowship",
    "paid": "stipend",
    "costNote": "Free classes with weekly lunch and a monthly stipend (amount not listed)",
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
      "NJ"
    ],
    "location": "NJIT campus, Newark, NJ",
    "when": "School year: Saturdays 9 am to 2 pm, September to May. Summer: Monday to Friday in July and August.",
    "eligibility": "You must be in grades 9 to 12 (ages 13 to 19), attend a Newark public school, be the first in your family to go to college, and meet federal low-income rules.",
    "requires": [
      "Upward Bound application",
      "First-generation college student",
      "Meet low-income guidelines"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "No deadline is posted.",
    "url": "https://www.njit.edu/precollege/upward-bound",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Take classes in English, math, physics, chemistry and computer science",
      "Get tutoring, counseling and career seminars",
      "Go on field trips"
    ],
    "schedule": "Saturdays plus summer",
    "setting": "In person",
    "pay": "Monthly stipend"
  },
  {
    "id": "cmsru-medacademy",
    "name": "MEDacademy",
    "org": "Cooper Medical School of Rowan University",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "Tuition $3,000 with a $500 nonrefundable deposit; $25 application fee",
    "fields": [
      "Health & Medicine"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "location": "CMSRU Medical Education Building, Camden, NJ (day program)",
    "when": "4 weeks, June 28 to July 23, 2027, 9:30 am to 3:30 pm",
    "eligibility": "You must be a rising junior or senior in summer 2027 with a GPA of 3.3 or higher, finished math and science courses, and a shown interest in medicine.",
    "requires": [
      "Online application",
      "Two recommendations",
      "Official transcript with fall 2026 grades",
      "$25 application fee"
    ],
    "opens": "2026-12",
    "deadline": "2027-03-29",
    "deadlineNote": "Rolling admission; the preferred deadline is March 29, 2027. The application opens in December 2026.",
    "url": "https://cmsru.rowan.edu/education/academic-credit-programs/medacademy.html",
    "verifiedOn": "2026-10-03",
    "notes": "Earn 3 Rowan University credits. About 50 students. Open house January 11, 2027.",
    "whatYouDo": [
      "Rotate through pathology, cardiopulmonary, GI and neurology",
      "Do hands-on demos and clinical simulations",
      "Tour Cooper University Hospital and present a group research poster"
    ],
    "schedule": "Full-time days, 4 weeks",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "njms-smart-summer",
    "name": "Science, Medicine and Related Topics (SMART) Summer Program",
    "org": "Rutgers New Jersey Medical School",
    "kind": "summer",
    "paid": "tuition",
    "costNote": "$25 application fee and $350 program fee",
    "fields": [
      "Health & Medicine",
      "Science & Research"
    ],
    "grades": [
      9,
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Rutgers New Jersey Medical School, Newark, NJ (hybrid)",
    "when": "4 weeks (2026: July 6 to 31): 4 virtual mornings a week (9 am to 12:30 pm) and 1 in-person day (9 am to 3 pm)",
    "eligibility": "Summer SMART takes rising 7th to 12th graders. It aims to serve economically and educationally disadvantaged students.",
    "requires": [
      "Online application with an essay",
      "Recommendation from a guidance counselor or science teacher",
      "GPA (grades 9 to 11)",
      "Parent or guardian information"
    ],
    "opens": null,
    "deadline": "2026-05-29",
    "deadlineNote": "Past cycle: the 2026 application closed May 29, 2026; recommendations were due June 5. 2027 dates not yet posted.",
    "url": "https://njms.rutgers.edu/education/odace/smart/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Learn about health science and research",
      "Explore careers in medicine, dentistry and biomedical research"
    ],
    "schedule": "Part-time, 4 weeks",
    "setting": "Hybrid",
    "pay": null
  },
  {
    "id": "nj-hosa-state-leadership-conference",
    "name": "NJ HOSA Competitive Events",
    "org": "NJ HOSA - Future Health Professionals",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "Cost is not listed on the page",
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
    "location": "Regional conferences, then the State Leadership Conference (2026: Union County Vocational-Technical Schools, Scotch Plains, NJ)",
    "when": "Regional conferences first, then the state conference in spring (2026: April 11 and 12)",
    "eligibility": "For members of a NJ HOSA chapter (middle school, high school and college divisions).",
    "requires": [
      "Membership in a HOSA chapter",
      "Registration through your chapter"
    ],
    "opens": null,
    "deadline": "2026-02-28",
    "deadlineNote": "Past cycle: registration for the 2026 State Leadership Conference closed February 28, 2026.",
    "url": "https://njhosa.org/events/slc/",
    "verifiedOn": "2026-10-03",
    "notes": "Top 5 in each event are recognized; the top 3 qualify for the International Leadership Conference in June.",
    "whatYouDo": [
      "Take health science tests like Medical Terminology and Pharmacology",
      "Compete in skill, speaking and teamwork events",
      "Qualify for the international conference"
    ],
    "schedule": "Weekend events",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "nj-history-day",
    "name": "New Jersey History Day",
    "org": "New Jersey History Day (William Paterson University)",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "Cost is not listed",
    "fields": [
      "Public Service & Law",
      "Arts & Media"
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
    "location": "Regional contests at Rutgers-Camden, Monmouth University and St. Elizabeth University; state contest at William Paterson University",
    "when": "February to May 2027 (regionals include February 27 South and March 21 North)",
    "eligibility": "Open to students in grades 6 to 12 from any school, including homeschool. You need an adult mentor to sponsor you.",
    "requires": [
      "Register between December 1 and February 1",
      "An adult sponsor, such as a teacher or parent",
      "A research project: performance, exhibit, documentary, website or paper"
    ],
    "opens": "2026-12",
    "deadline": "2027-02-01",
    "deadlineNote": "Registration opens December 1 and closes February 1; details are posted by November 1.",
    "url": "https://www.wpunj.edu/coe/departments/professional-development-school-community-partnership/njhistory/",
    "verifiedOn": "2026-10-03",
    "notes": "High schoolers compete in the senior division. Top students advance to the National History Day contest in June at the University of Maryland.",
    "whatYouDo": [
      "Pick a history topic and research it",
      "Make an exhibit, documentary, website, paper or performance",
      "Present it at regional and state contests"
    ],
    "schedule": "Project over the school year",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "princeton-ten-minute-play-contest",
    "name": "Ten-Minute Play Contest",
    "org": "Lewis Center for the Arts, Princeton University",
    "kind": "competition",
    "paid": "free",
    "costNote": "No entry fee",
    "fields": [
      "Arts & Media"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Online submission",
    "when": "Submissions January to March 2027",
    "eligibility": "You must be in 11th grade in the US (or the international equivalent).",
    "requires": [
      "One original play, up to 10 pages",
      "Submit through the online form"
    ],
    "opens": "2027-01",
    "deadline": "2027-03-31",
    "deadlineNote": "Closes March 31, 2027 at 12 pm, or earlier if 250 entries arrive first.",
    "url": "https://arts.princeton.edu/about/opportunities/high-school-contests/ten-minute-play-contest/",
    "verifiedOn": "2026-10-03",
    "notes": "Prizes: $500 first, $250 second, $100 third. A guest playwright judges.",
    "whatYouDo": [
      "Write a play that runs 10 minutes or less",
      "Submit it online to be judged by a professional playwright"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "us-senate-youth-program",
    "name": "United States Senate Youth Program (USSYP)",
    "org": "U.S. Senate and The Hearst Foundations",
    "kind": "leadership",
    "paid": "free",
    "costNote": "Fully funded by The Hearst Foundations; each delegate gets a $12,500 college scholarship",
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
    "location": "Washington, DC",
    "when": "One week, usually the first or second week of March",
    "eligibility": "You must be a high school junior or senior serving in an elected or appointed student leadership role. Two delegates are picked from each state.",
    "requires": [
      "Nomination by a teacher or principal",
      "Elected or appointed leadership position",
      "State selection process (many states give a test)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Nominations start in early fall through your school; each state sets its own deadline, and delegates are picked by December 1.",
    "url": "https://ussenateyouth.org/about_overview/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Meet senators, cabinet members and a Supreme Court justice",
      "Attend policy briefings in Washington",
      "Work with military officer mentors"
    ],
    "schedule": "Full-time, 1 week",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "ncwit-aic-high-school-award",
    "name": "NCWIT Award for Aspirations in Computing (High School)",
    "org": "NCWIT Aspirations in Computing",
    "kind": "competition",
    "paid": "free",
    "costNote": "Free",
    "fields": [
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
    "location": "Online",
    "when": "Applications September 1 to October 27, 2026",
    "eligibility": "For students in grades 9 to 12 involved in technology who attend school in the US, Puerto Rico, Guam, the US Virgin Islands, or a US overseas military base. You must be 13 or older. National awards need US citizenship or permanent residency.",
    "requires": [
      "Join the free AiC Community",
      "Online application",
      "Educator endorsement (due November 5)",
      "Parent or guardian approval if under 18"
    ],
    "opens": "2026-09",
    "deadline": "2026-10-27",
    "deadlineNote": "Open now. Student applications close October 27, 2026 at 10 pm ET; educator endorsements are due November 5, 2026.",
    "url": "https://www.aspirations.org/award-programs/aic-high-school-award",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Apply with your tech activities and goals",
      "Compete for national and regional recognition",
      "Join a community of students in computing"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "technovation-girls",
    "name": "Technovation Girls",
    "org": "Technovation",
    "kind": "competition",
    "paid": "free",
    "costNote": "Free",
    "fields": [
      "Tech & Engineering",
      "Business & Finance"
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
    "location": "Online, worldwide (local chapters and clubs optional)",
    "when": "Season runs August to May; registration is open August to March",
    "eligibility": "For girls ages 8 to 18, including nonbinary, gender-fluid and transgender students who want a female-identified space.",
    "requires": [
      "Register online",
      "Form a team"
    ],
    "opens": "2026-08",
    "deadline": null,
    "deadlineNote": "Registration is open August to March. Last season's projects were due April 20, 2026; the 2027 date is not posted.",
    "url": "https://technovationchallenge.org/get-started/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Team up to solve a problem in your community",
      "Learn to code an app or AI solution",
      "Make a business plan and pitch it"
    ],
    "schedule": "Season, about August to May",
    "setting": "Online",
    "pay": null
  },
  {
    "id": "usaco",
    "name": "USA Computing Olympiad (USACO)",
    "org": "USA Computing Olympiad",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "Free online training; no contest fee is listed",
    "fields": [
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
    "location": "Online",
    "when": "Four online contests a year (the 2025-26 season ran January to March), plus a summer camp for top students",
    "eligibility": "Open to high school computing students at all levels.",
    "requires": [
      "Take the online contests"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The 2026-27 contest schedule is not posted yet; last season's contests ran January 9 to the US Open on March 28, 2026.",
    "url": "https://usaco.org/",
    "verifiedOn": "2026-10-03",
    "notes": "Divisions: bronze, silver, gold, platinum. The top 4 students represent the US at the International Olympiad in Informatics.",
    "whatYouDo": [
      "Solve programming problems in timed online contests",
      "Move up from bronze to platinum",
      "Train with free problems and solutions"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "nsli-y",
    "name": "National Security Language Initiative for Youth (NSLI-Y)",
    "org": "U.S. Department of State (administered by American Councils)",
    "kind": "summer",
    "paid": "free",
    "costNote": "Program cost is covered by the NSLI-Y scholarship",
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
    "location": "Abroad (summer or academic year); a virtual beginner program also exists",
    "when": "Summer: 6 to 7 weeks. Academic year: 8 to 10 months.",
    "eligibility": "You must be a US citizen, 15 to 18 at the start of the program, in grades 9 to 12, with at least a 2.5 GPA. No language study needed.",
    "requires": [
      "Online application",
      "GPA of 2.5 or higher"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The 2027-28 application is coming soon; the deadline is expected in November 2026.",
    "url": "https://www.nsliforyouth.org/programs/summer-abroad/",
    "verifiedOn": "2026-10-03",
    "notes": "Languages: Arabic, Chinese (Mandarin), Korean and Russian.",
    "whatYouDo": [
      "Take at least 120 hours of language classes",
      "Live with a host family",
      "Join cultural activities and meet local peers"
    ],
    "schedule": "Full-time, 6 to 7 weeks (summer)",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "cbyx-high-school",
    "name": "Congress-Bundestag Youth Exchange (CBYX)",
    "org": "U.S. Department of State and German Bundestag",
    "kind": "fellowship",
    "paid": "free",
    "costNote": "Scholarship funds the year in Germany (210 high school scholarships)",
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
    "location": "Germany (host family and German high school)",
    "when": "One school year, leaving July to September 2027 and returning June to July 2028",
    "eligibility": "You must be a US citizen, 15 to 18 and a half on August 1 of the departure year, a current high school student with at least a 2.5 GPA. No German needed.",
    "requires": [
      "Online application",
      "GPA of 2.5 or higher",
      "Have not lived abroad 6+ months in the past 5 years"
    ],
    "opens": null,
    "deadline": "2026-11-03",
    "deadlineNote": "Open now. Extended deadline is November 3, 2026 at 11:59 pm Pacific.",
    "url": "https://usagermanyscholarship.org/2027-28-cbyx-high-school-application-now-open/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Live with a German host family",
      "Go to a German high school and learn German",
      "Visit the Bundestag and meet officials"
    ],
    "schedule": "Full-time, 1 school year",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "leda-scholars",
    "name": "LEDA Scholars Program",
    "org": "Leadership Enterprise for a Diverse America (LEDA)",
    "kind": "summer",
    "paid": "free",
    "costNote": "Completely free",
    "fields": [
      "Any"
    ],
    "grades": [
      11
    ],
    "states": [
      "Any"
    ],
    "location": "Princeton University and Yale University (residential)",
    "when": "5-week residential summer institute, plus college admissions support",
    "eligibility": "You must be a junior at a US public high school graduating in 2028, a US citizen or permanent resident, with an unweighted GPA of 3.5 or higher and household income of $90,000 or less.",
    "requires": [
      "Part I application",
      "Unweighted GPA of 3.5 or higher",
      "Household income of $90,000 or below"
    ],
    "opens": "2026-09",
    "deadline": "2026-12-09",
    "deadlineNote": "Open now. Part I is due December 9, 2026.",
    "url": "https://ledascholars.org/our-program/leda-scholars-program/recruitment-admissions/apply/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Live and study at Princeton or Yale for five weeks",
      "Get college admissions and guidance support",
      "Join a lasting career and alumni network"
    ],
    "schedule": "Full-time, 5 weeks",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "modeling-the-future-challenge",
    "name": "Modeling the Future Challenge",
    "org": "The Actuarial Foundation",
    "kind": "competition",
    "paid": "free",
    "costNote": "Free registration; $55,000 in scholarship prizes",
    "fields": [
      "Business & Finance",
      "Science & Research"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Online, with a national symposium",
    "when": "Registration August 24 to November 8, 2026; reports due March 1, 2027; national symposium April 26 to 30, 2027",
    "eligibility": "For US high school students taking junior or senior level math classes, alone or in teams of up to five.",
    "requires": [
      "Register by November 8, 2026",
      "Scenario Quest and project proposal by December 7, 2026",
      "Project report by March 1, 2027"
    ],
    "opens": "2026-08",
    "deadline": "2026-11-08",
    "deadlineNote": "Open now. Registration closes November 8, 2026.",
    "url": "https://actuarialfoundation.org/modeling-the-future-challenge/",
    "verifiedOn": "2026-10-03",
    "notes": "Qualified teams are matched with an actuary as a mentor.",
    "whatYouDo": [
      "Model real-world data to study a risk",
      "Make recommendations like an actuary",
      "Work with an actuarial mentor"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "mathworks-m3-challenge",
    "name": "MathWorks Math Modeling Challenge (M3 Challenge)",
    "org": "SIAM (Society for Industrial and Applied Mathematics)",
    "kind": "competition",
    "paid": "free",
    "costNote": "No registration or participation fees",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Online",
    "when": "One Challenge weekend a year; the 2026 topic was online sports betting",
    "eligibility": "For high school juniors and seniors in the US (and sixth form students in England and Wales).",
    "requires": [
      "Team registration"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Registration for 2026 is closed; 2027 dates are not posted on the official page.",
    "url": "https://m3challenge.siam.org/",
    "verifiedOn": "2026-10-03",
    "notes": "Winning teams share over $100,000 in scholarships.",
    "whatYouDo": [
      "Work as a team on a real-world problem revealed on Challenge weekend",
      "Use math and data to solve it"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "clark-scholars-ttu",
    "name": "Anson L. Clark Scholars Program",
    "org": "Texas Tech University",
    "kind": "summer",
    "paid": "stipend",
    "costNote": "Free meals, housing and activities; $25 application fee; you pay your own travel. $750 stipend after a successful research report.",
    "fields": [
      "Science & Research",
      "Tech & Engineering"
    ],
    "grades": [
      11,
      12
    ],
    "states": [
      "Any"
    ],
    "location": "Texas Tech University, Lubbock, TX (residential)",
    "when": "7 weeks in summer (2026: June 21 to August 6)",
    "eligibility": "You must be at least 17 by the start and a US citizen or permanent resident. The 2026 cycle took students graduating in 2026 or 2027.",
    "requires": [
      "Online application with short essays",
      "Transcript",
      "SAT, ACT, PSAT or PACT scores",
      "Three recommendations (two from teachers)",
      "List of your top 5 activities"
    ],
    "opens": null,
    "deadline": "2026-02-16",
    "deadlineNote": "Past cycle: the 2026 application closed February 16, 2026. 2027 dates not yet posted.",
    "url": "https://www.depts.ttu.edu/clarkscholars/ProgramDetails.php",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Do a research project with a Texas Tech faculty mentor",
      "Attend weekly seminars and weekend activities",
      "Write a final research report"
    ],
    "schedule": "Full-time, 7 weeks",
    "setting": "In person",
    "pay": "Stipend of $750"
  },
  {
    "id": "mit-think-scholars",
    "name": "MIT THINK Scholars Program",
    "org": "MIT TechX",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "No fee is listed. Finalists get an all-expenses-paid trip to MIT and up to $1,000 to build their project.",
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
    "location": "Online application; finalists visit MIT, Cambridge, MA",
    "when": "Apply November to January 1; finalists build their projects from February to June",
    "eligibility": "For full-time high school students with permanent US residency during the school year.",
    "requires": [
      "Written research proposal for a new science, technology or engineering idea",
      "Video interview (semifinalists)"
    ],
    "opens": "2025-11",
    "deadline": "2026-01-01",
    "deadlineNote": "Past cycle: the 2025-26 application opened November 1, 2025 and closed January 1, 2026. 2026-27 dates not yet posted.",
    "url": "https://think.mit.edu/",
    "verifiedOn": "2026-10-03",
    "notes": "Up to six finalists become MIT THINK Scholars when they finish their projects by June.",
    "whatYouDo": [
      "Write a proposal for a new STEM project",
      "Finalists get funding and mentorship to build it",
      "Finalists visit MIT"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "mit-beaver-works-summer-institute",
    "name": "Beaver Works Summer Institute (BWSI)",
    "org": "MIT Beaver Works",
    "kind": "summer",
    "paid": "free",
    "costNote": "Free tuition if family income and assets are under $200,000; $3,000 otherwise. Housing is not included for in-person courses.",
    "fields": [
      "Tech & Engineering"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "location": "MIT, Cambridge, MA, with some courses online over Zoom",
    "when": "Free online prerequisite course from February 1; 4-week summer program in July",
    "eligibility": "You must live in and attend high school in the US and be in 10th or 11th grade (no seniors). Accepted students are usually rising seniors.",
    "requires": [
      "Self-register for the online prerequisite course",
      "Finish the online course",
      "Summer application with three short essays (sent in March)",
      "Teacher or mentor recommendation (due April 2)"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Registration for the 2027 online prerequisites is open now. The summer application goes out in March 2027; recommendations are due April 2.",
    "url": "https://bwsi.mit.edu/apply-now/",
    "verifiedOn": "2026-10-03",
    "notes": null,
    "whatYouDo": [
      "Take a free online prerequisite course",
      "Do project-based work in topics like AI, autonomy, radar and satellites",
      "Build and compete in team challenges"
    ],
    "schedule": "Full-time, 4 weeks in July",
    "setting": "Hybrid",
    "pay": null
  },
  {
    "id": "cdc-disease-detective-camp",
    "name": "CDC Museum Disease Detective Camp",
    "org": "CDC Museum (Centers for Disease Control and Prevention)",
    "kind": "summer",
    "paid": "free",
    "costNote": "No cost; campers arrange their own housing and travel",
    "fields": [
      "Health & Medicine",
      "Science & Research"
    ],
    "grades": [
      10,
      11
    ],
    "states": [
      "Any"
    ],
    "location": "CDC headquarters, 1600 Clifton Rd NE, Atlanta, GA (day camp)",
    "when": "One week, 8:45 am to 4 pm daily (2026 sessions: June 22 to 26 and July 20 to 24)",
    "eligibility": "You must be a current sophomore or junior and at least 16 on the first day of camp. Non-US residents may apply.",
    "requires": [
      "Application (linked from the FAQ)",
      "Government-issued photo ID"
    ],
    "opens": "2027-01",
    "deadline": null,
    "deadlineNote": "2026 applications are closed. Check back in January 2027 for summer 2027.",
    "url": "https://www.cdc.gov/museum/camp/detective/index.htm",
    "verifiedOn": "2026-10-03",
    "notes": "27 spots per week-long session.",
    "whatYouDo": [
      "Learn how public health workers track outbreaks",
      "Study epidemiology, global health and public health law",
      "Work in a team as disease detectives"
    ],
    "schedule": "Full-time days, 1 week",
    "setting": "In person",
    "pay": null
  },
  {
    "id": "congressional-award",
    "name": "The Congressional Award",
    "org": "The Congressional Award",
    "kind": "leadership",
    "paid": "tuition",
    "costNote": "One-time $35 registration fee",
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
    "location": "Anywhere in the US, at your own pace",
    "when": "No deadlines; work at your own pace",
    "eligibility": "For ages 14 to 24. You can register at 13 and a half.",
    "requires": [
      "Register and pay the $35 fee",
      "Set goals with an adult advisor",
      "Have validators confirm your hours",
      "Submit a record book"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "There are no deadlines.",
    "url": "https://www.congressionalaward.org/the-program/",
    "verifiedOn": "2026-10-03",
    "notes": "Levels: Bronze, Silver and Gold Certificates and Medals.",
    "whatYouDo": [
      "Set goals in public service, personal growth, fitness and exploration",
      "Track your progress with an advisor",
      "Earn certificates and medals from Congress"
    ],
    "schedule": "At your own pace",
    "setting": null,
    "pay": null
  },
  {
    "id": "doe-national-science-bowl",
    "name": "National Science Bowl",
    "org": "U.S. Department of Energy",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "Cost is not listed",
    "fields": [
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
    "location": "Regional tournaments across the US; national finals",
    "when": "Regional tournaments start in January; national finals April 29 to May 3, 2027",
    "eligibility": "Teams of four students plus one alternate, with a teacher as advisor and coach.",
    "requires": [
      "A team of 4 students and 1 alternate",
      "A teacher advisor and coach"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "Each region sets its own date; 2027 national finals are April 29 to May 3.",
    "url": "https://science.osti.gov/wdts/nsb",
    "verifiedOn": "2026-10-03",
    "notes": "About 65 high school regional tournaments each year.",
    "whatYouDo": [
      "Answer fast questions in biology, chemistry, Earth science, physics, energy and math",
      "Win your regional and go to nationals"
    ],
    "schedule": null,
    "setting": "In person",
    "pay": null
  },
  {
    "id": "cspan-studentcam",
    "name": "StudentCam Documentary Competition",
    "org": "C-SPAN",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "No entry fee is listed. Prize money is split evenly among teammates.",
    "fields": [
      "Arts & Media",
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
    "location": "Online submission",
    "when": "Due January 20, 2027",
    "eligibility": "Open to students in grades 6 to 12 in the US and its territories (grades 9 to 12 compete as high school). Public, private or homeschool. Work alone or in a team of 2 or 3.",
    "requires": [
      "A 5 to 6 minute documentary on the 2027 theme",
      "Clips of C-SPAN video",
      "Cited sources",
      "Online entry form"
    ],
    "opens": null,
    "deadline": "2027-01-20",
    "deadlineNote": "Open now. Upload by 11:59 pm Pacific on January 20, 2027.",
    "url": "https://www.studentcam.org/",
    "verifiedOn": "2026-10-03",
    "notes": "2027 theme: \"Mr. Speaker, I Rise To...\"",
    "whatYouDo": [
      "Pick an issue you would raise as a new member of Congress",
      "Make a 5 to 6 minute documentary with several viewpoints",
      "Use C-SPAN clips and cite your sources"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "afsa-high-school-essay-contest",
    "name": "National High School Essay Contest",
    "org": "American Foreign Service Association (AFSA)",
    "kind": "competition",
    "paid": "unknown",
    "costNote": "No entry fee is listed. The winner gets $2,500, a paid trip to Washington, DC, and a Semester at Sea voyage.",
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
    "location": "Online submission",
    "when": null,
    "eligibility": "For students in grades 9 to 12 in the US, DC or US territories, or US citizens in high school overseas, whose parents are not in the Foreign Service. Public, private, parochial or homeschool.",
    "requires": [
      "Essay of 1,000 to 1,500 words on the year's prompt"
    ],
    "opens": null,
    "deadline": null,
    "deadlineNote": "The 2025-26 window is closed; 2026-27 dates are not posted.",
    "url": "https://afsa.org/essay-contest",
    "verifiedOn": "2026-10-03",
    "notes": "Last year's topic was US diplomacy and soft power.",
    "whatYouDo": [
      "Learn about US diplomacy and the Foreign Service",
      "Write an essay taking a side on the yearly prompt"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  },
  {
    "id": "american-rocketry-challenge",
    "name": "American Rocketry Challenge",
    "org": "Aerospace Industries Association",
    "kind": "competition",
    "paid": "tuition",
    "costNote": "$195 registration fee per team",
    "fields": [
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
    "location": "Local qualifying flights; national finals at Great Meadow, The Plains, VA",
    "when": "Qualifying flights July 15, 2026 to April 4, 2027; national finals May 15, 2027",
    "eligibility": "Teams of 3 to 10 students in grades 6 to 12.",
    "requires": [
      "Team application and $195 fee",
      "Adult team advisor"
    ],
    "opens": null,
    "deadline": "2026-12-06",
    "deadlineNote": "Open now. Registration closes December 6, 2026 at 11:59 pm ET.",
    "url": "https://www.rocketrychallenge.org/",
    "verifiedOn": "2026-10-03",
    "notes": "The top 100 teams go to national finals to compete for $100,000 in awards; the winner represents the US at the International Rocketry Challenge.",
    "whatYouDo": [
      "Design and build a model rocket that carries two raw eggs",
      "Aim for 800 feet and a 37 to 40 second flight",
      "Fly qualifying launches and compete at nationals"
    ],
    "schedule": null,
    "setting": "In person",
    "pay": null
  },
  {
    "id": "nfte-world-series-of-innovation",
    "name": "World Series of Innovation",
    "org": "Network for Teaching Entrepreneurship (NFTE)",
    "kind": "competition",
    "paid": "free",
    "costNote": "Free; cash prizes from $300 to $1,500",
    "fields": [
      "Business & Finance"
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
    "location": "Online, worldwide",
    "when": "Submissions due December 13, 2026; winners announced spring 2027",
    "eligibility": "Open to youth worldwide. High school students compete in the Impact League (ages 13 to 24), alone or in teams.",
    "requires": [
      "Pick a challenge",
      "Submit your idea online at innovation.nfte.com"
    ],
    "opens": "2026-09",
    "deadline": "2026-12-13",
    "deadlineNote": "Open now. Submissions are due December 13, 2026.",
    "url": "https://nfte.com/big-ideas-start-here-nfte-launches-2026-2027-world-series-of-innovation-for-young-changemakers-ages-5-24/",
    "verifiedOn": "2026-10-03",
    "notes": "Impact League challenges include the EY Responsible AI Challenge and the Intuit Food Truck Innovation Challenge.",
    "whatYouDo": [
      "Pick a real-world challenge tied to a UN goal",
      "Come up with a business-style solution",
      "Submit it for judging"
    ],
    "schedule": null,
    "setting": "Online",
    "pay": null
  }
];
