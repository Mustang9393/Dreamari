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
  }
];
