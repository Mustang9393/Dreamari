// Career Detail profiles for the 4 Oct 2026 poster drop, batch 6 (BROWSE Images).
// Sourced: people, openings, 2025-35 change and the typical entry education,
// experience and training come from BLS Employment Projections table 1.2
// (2025-35); starting / typical / top pay are the OEWS May 2025 national 10th
// percentile / median / 90th percentile, and the state rows are OEWS May 2025
// state annual means (yourStates is South Dakota, like every other profile;
// best is the top 3 states, District of Columbia included); the degree mix is
// BLS table 5.3; tasks, knowledge, skills and software are from O*NET OnLine;
// study fields are from the NCES CIP 2020 to SOC 2018 crosswalk. Ladder rung
// pay is the OEWS May 2025 national median of the matching occupation, or the
// 10th percentile for a first rung and the 75th percentile for a senior rung
// inside the same occupation, and "" where no occupation matches. SOC codes:
// College Dean, Dean of Students, Provost and Department Chair 11-9033;
// Superintendent 11-9032; Elementary School Teacher 25-2021; Instructional
// Designer 25-9031; Librarian 25-4022; Library Assistant 43-4121; Museum
// Curator 25-4012; Nursing Professor 25-1072; Preschool or Kindergarten
// Teacher 25-2011; Self-Enrichment Teacher 25-3021; Shop or Tech Teacher
// 25-2032; Special Education Teacher 25-2050 (state rows 25-2052); Subject
// Teacher or Professor 25-2031; Teaching Assistant 25-9045 (OEWS and
// projections code; O*NET 25-9042); Tutor 25-3041; AI and Machine Learning
// Engineer 15-2051; Aerospace Engineer 17-2011. Mapped to a broader or nearby
// occupation, because BLS has no occupation of its own for the title: Dean of
// Students and Provost (both O*NET sample titles of 11-9033), Department
// Chair (O*NET's search for the title lists 11-9033, whose tasks cover
// running a department; OEWS has no state wages for postsecondary teachers
// as a group, the other option), Superintendent (an O*NET sample title of 11-9032,
// whose largest group is principals), Instructional Designer (O*NET's top
// match is Instructional Coordinators), Preschool or Kindergarten Teacher
// (two BLS occupations; the larger, preschool teachers, is used and the
// kindergarten figure appears in the pay note and ladder), Shop or Tech
// Teacher (career and technical education teachers, secondary school),
// Subject Teacher or Professor (high school teachers; professors appear as
// the top ladder rung with the postsecondary teachers median) and AI and
// Machine Learning Engineer (O*NET's top match for "machine learning
// engineer" is Data Scientists, whose tasks and software cover machine
// learning models; the same occupation Data Analyst uses).
import type { CareerProfile } from "./profiles";

const STANDARD_SOURCE = "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.";

// BLS table 5.3 rows, in the order the degree sheet shows them.
const dist = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [
  { label: "Did not finish high school", pct: a },
  { label: "Finished high school", pct: b },
  { label: "Some college, no degree", pct: c },
  { label: "Associate's degree", pct: d },
  { label: "Bachelor's degree", pct: e },
  { label: "Master's degree", pct: f },
  { label: "Doctorate or professional degree", pct: g },
];

const OPENINGS = "Counts every job that needs filling, mostly people moving on rather than brand-new roles.";
const MEDIAN_NOTE = "Half of the people in this job earn more than the typical figure and half earn less.";

// 11-9033 (Education Administrators, Postsecondary) is shared by four posters.
const POSTSEC_ADMIN_FACTS = [
  { label: "Typical degree", value: "Master's degree" },
  { label: "Typical pay", value: "$104,590/year" },
  { label: "People doing it", value: "231,800" },
  { label: "Jobs open each year", value: "14,500" },
];
const POSTSEC_ADMIN_STATES = {
  title: "Pay by state",
  yourStates: [{ state: "South Dakota", pay: "$139K" }],
  best: [{ state: "New York", pay: "$163K" }, { state: "Delaware", pay: "$154K" }, { state: "New Jersey", pay: "$148K" }],
};
const POSTSEC_ADMIN_DETAILS = (note: string) => ({
  degree: {
    doorAsksFor: "Master's degree",
    experienceFirst: "Yes. Usually under 5 years in a related job",
    trainingAfterHiring: "None. Your years in a related job are the training",
    note,
    noBachelorPct: "18%",
    distribution: dist(1.0, 5.2, 7.2, 4.2, 24.3, 44.2, 14.0),
  },
  pay: { starting: "$64,560", typical: "$104,590", top: "$215,620", note: MEDIAN_NOTE },
  openings: { note: `${OPENINGS} The job itself changes by about +4,100 by 2035. It is growing, but more slowly than most jobs.` },
});
const POSTSEC_ADMIN_STUDIES = [
  { name: "Higher Education/Higher Education Administration" },
  { name: "Educational Leadership and Administration, General" },
  { name: "Community College Administration" },
];

export const LIB6_PROFILES: Record<string, CareerProfile> = {
  "college-dean": {
    slug: "college-dean",
    title: "College Dean",
    world: "Teaching & Education",
    photo: "/images/app/browse/college-dean.webp",
    summary: "Leads a whole college inside a university, from its teachers to its budget.",
    scenario: "Imagine your college wants to start a new nursing program. You find the money, hire the teachers and get the plan approved.",
    facts: POSTSEC_ADMIN_FACTS,
    payByState: POSTSEC_ADMIN_STATES,
    knowAbout: ["Clear writing and speaking", "Running a team or a business", "Teaching and how people learn", "Helping students and families", "Hiring and managing people"],
    goodAt: ["Thinking through hard choices", "Listening closely", "Tracking how things are going", "Managing people", "Making the final call"],
    software: ["Microsoft Excel", "Oracle PeopleSoft", "Instructure Canvas", "Microsoft SharePoint", "IBM SPSS Statistics"],
    ladder: [
      { number: "1", jobTitle: "Professor", pay: "$82K", description: "You teach college classes, do research and serve on faculty groups.", whatYouDo: ["Teach classes", "Do research", "Advise students", "Join faculty groups"], toGetHere: ["Doctorate in your subject"] },
      { number: "2", jobTitle: "Associate Dean", pay: "", description: "You help the dean run one part of the college, like classes or student success.", whatYouDo: ["Plan class schedules", "Work with department chairs", "Review programs", "Help with budgets"], toGetHere: ["Years as a professor", "Time leading a department"] },
      { number: "3", jobTitle: "College Dean", pay: "$105K", description: "You lead a whole college, set its goals and manage its people and money.", whatYouDo: ["Set goals for the college", "Hire and review faculty", "Manage the budget", "Raise money"], toGetHere: ["Years in college leadership", "A strong record of teaching or research"] },
    ],
    education: { studies: POSTSEC_ADMIN_STUDIES, where: [{ count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: STANDARD_SOURCE,
    factDetails: POSTSEC_ADMIN_DETAILS("Most deans start as professors with a doctorate. They move up by leading a department first."),
  },
  "dean-of-students": {
    slug: "dean-of-students",
    title: "Dean of Students",
    world: "Teaching & Education",
    photo: "/images/app/browse/dean-of-students.webp",
    summary: "Leads the people and programs that help college students live, learn and do well on campus.",
    scenario: "Imagine a student comes to you after a rough first month away from home. You connect them with the help they need to stay and do well.",
    facts: POSTSEC_ADMIN_FACTS,
    payByState: POSTSEC_ADMIN_STATES,
    knowAbout: ["Clear writing and speaking", "Helping students and families", "Running a team or a business", "How people think and feel", "Hiring and managing people"],
    goodAt: ["Listening closely", "Reading how people feel", "Staying calm with hard cases", "Bringing people together", "Making good calls"],
    software: ["Microsoft Excel", "Microsoft Outlook", "Instructure Canvas", "Google Docs", "GroupMe"],
    ladder: [
      { number: "1", jobTitle: "Academic Advisor or Residence Hall Director", pay: "$64K", description: "You guide students one on one, with their classes or their life in the dorms.", whatYouDo: ["Meet with students", "Plan campus events", "Help with class choices", "Connect students to support"], toGetHere: ["Bachelor's degree", "A master's in student affairs helps"] },
      { number: "2", jobTitle: "Assistant Dean of Students", pay: "", description: "You run one area of student life, like housing, conduct or campus clubs.", whatYouDo: ["Lead a student life team", "Handle student conduct cases", "Run orientation", "Track student success"], toGetHere: ["Master's degree", "Years working with students"] },
      { number: "3", jobTitle: "Dean of Students", pay: "$105K", description: "You lead every team that supports students outside the classroom.", whatYouDo: ["Lead student services", "Handle hard cases", "Set campus rules", "Work with parents and faculty"], toGetHere: ["Years in student affairs leadership", "A doctorate helps"] },
    ],
    education: { studies: [{ name: "Higher Education/Higher Education Administration" }, { name: "Educational Leadership and Administration, General" }], where: [{ count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: `${STANDARD_SOURCE} BLS has no separate dean of students occupation, so the figures are for all postsecondary education administrators (SOC 11-9033), where O*NET lists Students Dean as a job title.`,
    factDetails: POSTSEC_ADMIN_DETAILS("Most deans of students hold a master's in student affairs or higher education, and many add a doctorate."),
  },
  "department-chair": {
    slug: "department-chair",
    title: "Department Chair",
    world: "Teaching & Education",
    photo: "/images/app/browse/department-chair.webp",
    summary: "A professor who leads one college department, like English or biology.",
    scenario: "Imagine 30 professors need next year's class schedule. You decide who teaches what, so every student can get the classes they need.",
    facts: POSTSEC_ADMIN_FACTS,
    payByState: POSTSEC_ADMIN_STATES,
    knowAbout: ["Clear writing and speaking", "Teaching and how people learn", "Running a team or a business", "Hiring and managing people", "Your own subject in depth"],
    goodAt: ["Teaching others", "Managing time and deadlines", "Bringing people to agree", "Thinking through hard choices", "Managing people"],
    software: ["Microsoft Excel", "Instructure Canvas", "Ellucian Degree Works", "Microsoft Word", "Google Docs"],
    ladder: [
      { number: "1", jobTitle: "Assistant Professor", pay: "", description: "You start teaching and doing research while you work toward tenure.", whatYouDo: ["Teach classes", "Do research", "Publish papers", "Advise students"], toGetHere: ["Doctorate in your subject"] },
      { number: "2", jobTitle: "Professor", pay: "$82K", description: "You teach, lead research and guide newer faculty in your department.", whatYouDo: ["Teach classes", "Lead research", "Mentor faculty", "Serve on committees"], toGetHere: ["Years of teaching and research", "Tenure"] },
      { number: "3", jobTitle: "Department Chair", pay: "$105K", description: "You run your department's classes, budget and hiring, and often still teach.", whatYouDo: ["Build class schedules", "Hire and review faculty", "Manage the budget", "Update the courses"], toGetHere: ["Tenure as a professor", "Chosen by faculty or the dean"] },
    ],
    education: { studies: POSTSEC_ADMIN_STUDIES, where: [{ count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: `${STANDARD_SOURCE} BLS has no separate department chair occupation, so the figures are for all postsecondary education administrators (SOC 11-9033), which covers academic leaders who run a department.`,
    factDetails: POSTSEC_ADMIN_DETAILS("Chairs are almost always tenured professors first, so a doctorate in their subject is the usual path."),
  },
  "elementary-school-teacher": {
    slug: "elementary-school-teacher",
    title: "Elementary School Teacher",
    world: "Teaching & Education",
    photo: "/images/app/browse/elementary-school-teacher.webp",
    summary: "Teaches young kids reading, math, science and how to get along.",
    scenario: "Imagine 24 second graders and one child who just cannot get subtraction. You try a new way, and you see the moment it clicks.",
    facts: [
      { label: "Typical degree", value: "Bachelor's degree" },
      { label: "Typical pay", value: "$63,970/year" },
      { label: "People doing it", value: "1,419,300" },
      { label: "Jobs open each year", value: "87,500" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$53K" }], best: [{ state: "Washington", pay: "$98K" }, { state: "California", pay: "$96K" }, { state: "District of Columbia", pay: "$94K" }] },
    knowAbout: ["Teaching and how people learn", "Clear reading and writing", "Math", "How kids think and feel", "Helping students and families"],
    goodAt: ["Explaining things many ways", "Speaking clearly", "Listening closely", "Watching how each kid is doing", "Reading how people feel"],
    software: ["Google Classroom", "Microsoft PowerPoint", "Seesaw", "ClassDojo", "Kahoot!"],
    ladder: [
      { number: "1", jobTitle: "New Elementary Teacher", pay: "$48K", description: "You run your own class for the first time, with a mentor teacher to guide you.", whatYouDo: ["Plan lessons", "Teach reading and math", "Set class rules", "Meet with parents"], toGetHere: ["Bachelor's degree", "Student teaching", "State teaching license"] },
      { number: "2", jobTitle: "Elementary School Teacher", pay: "$64K", description: "You teach every subject to one class and help each kid grow all year.", whatYouDo: ["Teach every subject", "Change lessons for each kid", "Grade work", "Talk with parents"], toGetHere: ["State license", "A few years in the classroom"] },
      { number: "3", jobTitle: "Lead or Mentor Teacher", pay: "$81K", description: "You lead your grade level and coach newer teachers.", whatYouDo: ["Lead a grade team", "Coach new teachers", "Shape the lessons", "Share student data"], toGetHere: ["Years of teaching", "A master's degree helps"] },
    ],
    education: { studies: [{ name: "Elementary Education and Teaching" }, { name: "Early Childhood Education and Teaching" }, { name: "Teacher Education, Multiple Levels" }, { name: "Teaching English as a Second or Foreign Language/ESL Language Instructor" }], where: [{ count: "", credential: "Bachelor's degree" }, { count: "", credential: "Master's degree" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Bachelor's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None. Student teaching in college is the training", note: "Public school teachers need a bachelor's degree and a state license. Student teaching is part of the degree.", noBachelorPct: "5%", distribution: dist(0.0, 0.0, 3.0, 2.4, 42.9, 47.0, 4.7) },
      pay: { starting: "$47,960", typical: "$63,970", top: "$104,340", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about -5,800 by 2035. It is holding about steady.` },
    },
  },
  "instructional-designer": {
    slug: "instructional-designer",
    title: "Instructional Designer",
    world: "Teaching & Education",
    photo: "/images/app/browse/instructional-designer.webp",
    summary: "Designs lessons, courses and training so people learn faster and better.",
    scenario: "Imagine a school wants an online science course by fall. You plan every lesson, video and quiz, then check that students really learn.",
    facts: [
      { label: "Typical degree", value: "Master's degree" },
      { label: "Typical pay", value: "$77,440/year" },
      { label: "People doing it", value: "248,700" },
      { label: "Jobs open each year", value: "23,100" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$62K" }], best: [{ state: "District of Columbia", pay: "$113K" }, { state: "California", pay: "$98K" }, { state: "Maryland", pay: "$97K" }] },
    knowAbout: ["Teaching and how people learn", "Clear reading and writing", "Running a team or a business", "Computers and software", "Math"],
    goodAt: ["Choosing the best way to teach", "Writing clearly", "Speaking clearly", "Tracking what is working", "Solving tricky problems"],
    software: ["Adobe Creative Cloud", "Moodle", "Microsoft PowerPoint", "Adobe Acrobat", "Microsoft Project"],
    ladder: [
      { number: "1", jobTitle: "Teacher", pay: "$63K", description: "You teach in a classroom and learn what makes a lesson work.", whatYouDo: ["Plan lessons", "Teach classes", "Grade work", "Try new tools"], toGetHere: ["Bachelor's degree", "Teaching license"] },
      { number: "2", jobTitle: "Instructional Designer", pay: "$77K", description: "You build courses and training, and help teachers use them well.", whatYouDo: ["Design courses", "Pick learning materials", "Train teachers", "Check what students learn"], toGetHere: ["Master's in curriculum or instructional technology", "Years of teaching"] },
      { number: "3", jobTitle: "Senior Instructional Designer", pay: "$99K", description: "You lead big course projects and set how a school or company teaches.", whatYouDo: ["Lead design projects", "Guide other designers", "Choose learning tools", "Report results to leaders"], toGetHere: ["Years as a designer", "A portfolio of courses"] },
    ],
    education: { studies: [{ name: "Curriculum and Instruction" }, { name: "Educational/Instructional Technology" }], where: [{ count: "", credential: "Bachelor's degree" }, { count: "", credential: "Master's degree" }] },
    sources: `${STANDARD_SOURCE} BLS has no separate instructional designer occupation, so the figures are for instructional coordinators (SOC 25-9031), O*NET's closest match.`,
    factDetails: {
      degree: { doorAsksFor: "Master's degree", experienceFirst: "Yes. Usually 5 years or more, often as a teacher", trainingAfterHiring: "None. Your years of teaching are the training", note: "Most people teach first, then earn a master's in curriculum or instructional technology.", noBachelorPct: "14%", distribution: dist(0.5, 4.3, 6.2, 3.4, 28.8, 46.6, 10.1) },
      pay: { starting: "$47,980", typical: "$77,440", top: "$121,670", note: "BLS counts instructional designers inside the larger group of instructional coordinators, so these figures are for that whole group." },
      openings: { note: `${OPENINGS} The job itself changes by about +4,100 by 2035. It is growing, but more slowly than most jobs.` },
    },
  },
  librarian: {
    slug: "librarian",
    title: "Librarian",
    world: "Teaching & Education",
    photo: "/images/app/browse/librarian.webp",
    summary: "Helps people find books, facts and online sources, and runs the library.",
    scenario: "Imagine a student needs five solid sources for a big paper due tomorrow. You show them where to look, and they leave with all five.",
    facts: [
      { label: "Typical degree", value: "Master's degree" },
      { label: "Typical pay", value: "$68,270/year" },
      { label: "People doing it", value: "142,300" },
      { label: "Jobs open each year", value: "12,600" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$54K" }], best: [{ state: "Washington", pay: "$99K" }, { state: "District of Columbia", pay: "$97K" }, { state: "California", pay: "$92K" }] },
    knowAbout: ["Clear reading and writing", "Helping people", "Teaching and how people learn", "Computers and software", "Running a team or a business"],
    goodAt: ["Reading closely", "Listening closely", "Speaking clearly", "Thinking things through", "Helping people"],
    software: ["WorldCat", "OCLC databases", "Microsoft Excel", "Google Workspace", "Zoom"],
    ladder: [
      { number: "1", jobTitle: "Library Assistant", pay: "$37K", description: "You check books in and out and help people at the front desk.", whatYouDo: ["Check out books", "Shelve materials", "Answer simple questions", "Sign up new members"], toGetHere: ["High school diploma"] },
      { number: "2", jobTitle: "Librarian", pay: "$68K", description: "You help people research, choose what the library buys and teach classes.", whatYouDo: ["Answer research questions", "Choose new books", "Teach research skills", "Catalog materials"], toGetHere: ["Master's in library science", "A teaching license for school libraries"] },
      { number: "3", jobTitle: "Head Librarian or Library Director", pay: "$84K", description: "You run the library, its staff and its budget.", whatYouDo: ["Lead the staff", "Manage the budget", "Plan programs", "Work with the community"], toGetHere: ["Years as a librarian", "Time leading a team"] },
    ],
    education: { studies: [{ name: "Library and Information Science" }, { name: "School Librarian/School Library Media Specialist" }, { name: "Children and Youth Library Services" }], where: [{ count: "", credential: "Master's degree" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Master's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "Most librarians earn a master's in library science. School librarians often need a teaching license too.", noBachelorPct: "14%", distribution: dist(0.9, 1.7, 7.1, 4.3, 24.1, 56.6, 5.2) },
      pay: { starting: "$43,660", typical: "$68,270", top: "$103,990", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about +3,600 by 2035. It is growing about as fast as most jobs.` },
    },
  },
  // OEWS released no South Dakota wage for 43-4121, so there is no
  // yourStates row (same as the entries that have no home-state figure).
  // The CIP crosswalk has no field for 43-4121; the study field is the one it
  // gives library technicians (25-4031), the next rung up.
  "library-assistant": {
    slug: "library-assistant",
    title: "Library Assistant",
    world: "Teaching & Education",
    photo: "/images/app/browse/library-assistant.webp",
    summary: "Keeps a library running by checking out books, shelving them and helping visitors.",
    scenario: "Imagine a cart of 200 returned books and a line at the desk. You help each visitor, then get every book back in its exact spot.",
    facts: [
      { label: "Typical degree", value: "High school diploma or equivalent" },
      { label: "Typical pay", value: "$36,910/year" },
      { label: "People doing it", value: "89,500" },
      { label: "Jobs open each year", value: "12,300" },
    ],
    payByState: { title: "Pay by state", best: [{ state: "District of Columbia", pay: "$59K" }, { state: "California", pay: "$52K" }, { state: "Washington", pay: "$48K" }] },
    knowAbout: ["Helping people", "Office work and records", "Clear reading and writing", "Teaching and how people learn", "How people think and feel"],
    goodAt: ["Listening closely", "Reading closely", "Helping people", "Speaking clearly", "Working well with a team"],
    software: ["WorldCat", "Cataloging software", "Microsoft Excel", "Microsoft Word", "Microsoft Outlook"],
    ladder: [
      { number: "1", jobTitle: "Library Page", pay: "", description: "You shelve books and keep the stacks in order, often as a first job.", whatYouDo: ["Shelve books", "Keep shelves in order", "Sort returns", "Help set up events"], toGetHere: ["Still in high school or a diploma"] },
      { number: "2", jobTitle: "Library Assistant", pay: "$37K", description: "You run the front desk, sign up members and help people find what they need.", whatYouDo: ["Check books in and out", "Sign up new members", "Find materials", "Answer questions"], toGetHere: ["High school diploma", "Short on-the-job training"] },
      { number: "3", jobTitle: "Library Technician", pay: "$45K", description: "You catalog new materials, run library systems and help librarians with research.", whatYouDo: ["Catalog new items", "Run library software", "Help with research", "Train assistants"], toGetHere: ["Library technology certificate", "Experience as an assistant"] },
    ],
    education: { studies: [{ name: "Library and Archives Assisting" }], where: [{ count: "", credential: "High school diploma" }, { count: "", credential: "On-the-job training" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "High school diploma or equivalent", experienceFirst: "No. You can start without it", trainingAfterHiring: "Short on-the-job training", note: "You can start with a high school diploma. The library teaches you its system on the job.", noBachelorPct: "51%", distribution: dist(1.7, 14.1, 21.8, 13.0, 36.6, 11.8, 1.1) },
      pay: { starting: "$27,730", typical: "$36,910", top: "$55,310", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about -5,700 by 2035. It is getting smaller, but people moving on still open about 12,300 jobs each year.` },
    },
  },
  "museum-curator": {
    slug: "museum-curator",
    title: "Museum Curator",
    world: "Teaching & Education",
    photo: "/images/app/browse/museum-curator.webp",
    summary: "Chooses, studies and shows the objects in a museum's collection.",
    scenario: "Imagine a 300-year-old painting arrives for your new show. You check that it is real, plan where it hangs and write the story beside it.",
    facts: [
      { label: "Typical degree", value: "Master's degree" },
      { label: "Typical pay", value: "$63,420/year" },
      { label: "People doing it", value: "14,200" },
      { label: "Jobs open each year", value: "1,600" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$75K" }], best: [{ state: "District of Columbia", pay: "$100K" }, { state: "New York", pay: "$91K" }, { state: "California", pay: "$86K" }] },
    knowAbout: ["History", "Art", "Clear reading and writing", "Running a team or a business", "Cultures and people"],
    goodAt: ["Reading closely", "Speaking clearly", "Writing clearly", "Thinking things through", "Learning new things fast"],
    software: ["Adobe Photoshop", "Adobe InDesign", "FileMaker Pro", "Microsoft Excel", "Microsoft Access"],
    ladder: [
      { number: "1", jobTitle: "Museum Technician", pay: "$51K", description: "You care for objects, prepare them for shows and keep the records.", whatYouDo: ["Handle and pack objects", "Set up exhibits", "Keep collection records", "Answer visitor questions"], toGetHere: ["Bachelor's degree in history or art history", "Internship at a museum"] },
      { number: "2", jobTitle: "Curator", pay: "$63K", description: "You research the collection, plan shows and decide what the museum adds.", whatYouDo: ["Plan exhibits", "Research objects", "Buy or borrow pieces", "Write labels and catalogs"], toGetHere: ["Master's degree", "Years of museum work"] },
      { number: "3", jobTitle: "Chief Curator", pay: "$83K", description: "You lead the curators and set the museum's plan for its collection.", whatYouDo: ["Lead the curator team", "Set the exhibit plan", "Raise money", "Work with the board"], toGetHere: ["Years as a curator", "A doctorate helps"] },
    ],
    education: { studies: [{ name: "Museology/Museum Studies" }, { name: "Art History, Criticism and Conservation" }, { name: "Public/Applied History" }, { name: "Digital Humanities" }], where: [{ count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Master's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "Curators usually hold a master's in museum studies, history or art history. Museum internships help a lot.", noBachelorPct: "19%", distribution: dist(1.6, 5.2, 9.2, 3.2, 36.7, 37.1, 6.9) },
      pay: { starting: "$40,470", typical: "$63,420", top: "$107,140", note: "About 9% work for themselves, so this describes the ones with a boss." },
      openings: { note: `${OPENINGS} The job itself changes by about +700 by 2035. It is growing faster than most jobs.` },
    },
  },
  "nursing-professor": {
    slug: "nursing-professor",
    title: "Nursing Professor",
    world: "Teaching & Education",
    photo: "/images/app/browse/nursing-professor.webp",
    summary: "Teaches nursing students in class and at the hospital bedside.",
    scenario: "Imagine your student gives her first shot to a real patient. You stand right beside her, and she does it perfectly.",
    facts: [
      { label: "Typical degree", value: "Doctoral or professional degree" },
      { label: "Typical pay", value: "$80,250/year" },
      { label: "People doing it", value: "96,100" },
      { label: "Jobs open each year", value: "8,500" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$74K" }], best: [{ state: "Hawaii", pay: "$126K" }, { state: "District of Columbia", pay: "$110K" }, { state: "Delaware", pay: "$100K" }] },
    knowAbout: ["Medicine and treatments", "Teaching and how people learn", "How people think and feel", "Clear reading and writing", "Biology and the human body"],
    goodAt: ["Explaining things many ways", "Speaking clearly", "Listening closely", "Reading closely", "Watching how students are doing"],
    software: ["Learning management systems", "Blackboard", "MEDITECH", "Microsoft PowerPoint", "Turnitin"],
    ladder: [
      { number: "1", jobTitle: "Registered Nurse", pay: "$98K", description: "You care for patients and build the hands-on skill you will one day teach.", whatYouDo: ["Care for patients", "Give medicine", "Track patient health", "Teach patients and families"], toGetHere: ["Nursing degree", "RN license"] },
      { number: "2", jobTitle: "Nursing Instructor", pay: "$80K", description: "You teach classes and lead students through their hospital training.", whatYouDo: ["Teach nursing classes", "Lead hospital training", "Grade work and exams", "Advise students"], toGetHere: ["Master's in nursing", "Years as an RN"] },
      { number: "3", jobTitle: "Nursing Professor", pay: "$101K", description: "You lead courses, do research and help shape the nursing program.", whatYouDo: ["Design courses", "Do research", "Guide new instructors", "Update the program"], toGetHere: ["Doctorate in nursing", "Years of teaching"] },
    ],
    education: { studies: [{ name: "Nursing Education" }, { name: "Registered Nursing/Registered Nurse" }, { name: "Nursing Science" }, { name: "Nursing Practice" }], where: [{ count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Doctoral or professional degree", experienceFirst: "Yes. Usually under 5 years as a nurse", trainingAfterHiring: "None. Your nursing years are the training", note: "Every nursing professor is a registered nurse first. Then a master's or doctorate in nursing opens the door.", noBachelorPct: "6%", extra: "This degree mix is shared by all college teachers in the BLS table.", distribution: dist(0.7, 1.8, 2.0, 1.7, 14.1, 29.8, 49.9) },
      pay: { starting: "$48,800", typical: "$80,250", top: "$129,500", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about +16,500 by 2035. It is growing much faster than most jobs.` },
    },
  },
  // Preschool and kindergarten teachers are two BLS occupations (25-2011 and
  // 25-2012). Every figure is for preschool teachers, the larger group
  // (583,200 of 694,400 jobs); the kindergarten median is in the pay note and
  // the top ladder rung.
  "preschool-or-kindergarten-teacher": {
    slug: "preschool-or-kindergarten-teacher",
    title: "Preschool or Kindergarten Teacher",
    world: "Teaching & Education",
    photo: "/images/app/browse/preschool-or-kindergarten-teacher.webp",
    summary: "Teaches young children letters, numbers and how to share and play together.",
    scenario: "Imagine a room of four-year-olds at circle time. You turn a picture book into a game, and every kid wants to count along.",
    facts: [
      { label: "Typical degree", value: "Associate's degree" },
      { label: "Typical pay", value: "$38,140/year" },
      { label: "People doing it", value: "583,200" },
      { label: "Jobs open each year", value: "66,700" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$42K" }], best: [{ state: "District of Columbia", pay: "$68K" }, { state: "New Jersey", pay: "$57K" }, { state: "Colorado", pay: "$53K" }] },
    knowAbout: ["Teaching and how people learn", "Clear reading and speaking", "Keeping kids safe", "Helping families", "How kids think and feel"],
    goodAt: ["Speaking clearly", "Listening closely", "Explaining things many ways", "Watching how each kid is doing", "Patience and care"],
    software: ["ClassDojo", "Seesaw", "Google Classroom", "Tadpoles", "Microsoft Word"],
    ladder: [
      { number: "1", jobTitle: "Teacher Assistant", pay: "$37K", description: "You help the lead teacher run activities and care for the kids.", whatYouDo: ["Lead small groups", "Help at meals and naps", "Set up activities", "Watch kids at play"], toGetHere: ["High school diploma", "Child care training helps"] },
      { number: "2", jobTitle: "Preschool Teacher", pay: "$38K", description: "You run your own class and plan play that teaches early skills.", whatYouDo: ["Plan lessons and play", "Teach letters and numbers", "Track each kid's growth", "Meet with parents"], toGetHere: ["Associate's in early childhood education", "CDA credential in some states"] },
      { number: "3", jobTitle: "Kindergarten Teacher", pay: "$63K", description: "You teach five-year-olds in a public school and get them ready for first grade.", whatYouDo: ["Teach reading and math basics", "Build class routines", "Check each kid's progress", "Work with parents"], toGetHere: ["Bachelor's degree", "State teaching license"] },
    ],
    education: { studies: [{ name: "Early Childhood Education and Teaching" }, { name: "Kindergarten/Preschool Education and Teaching" }, { name: "Child Development" }, { name: "Montessori Teacher Education" }], where: [{ count: "", credential: "Associate's degree" }, { count: "", credential: "Bachelor's degree" }] },
    sources: `${STANDARD_SOURCE} BLS counts preschool and kindergarten teachers separately, so the figures are for preschool teachers (SOC 25-2011), the larger group. Kindergarten teacher pay is from SOC 25-2012.`,
    factDetails: {
      degree: { doorAsksFor: "Associate's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "Preschool teachers often start with an associate's degree. Kindergarten teachers in public schools need a bachelor's and a state license.", noBachelorPct: "46%", extra: "This degree mix is shared by preschool and kindergarten teachers in the BLS table.", distribution: dist(2.2, 14.4, 17.2, 12.4, 33.9, 18.3, 1.6) },
      pay: { starting: "$28,990", typical: "$38,140", top: "$61,390", note: "These figures are for preschool teachers. Kindergarten teachers need a bachelor's degree, and their typical pay is $62,680." },
      openings: { note: `${OPENINGS} The job itself changes by about +26,200 by 2035. It is growing about as fast as most jobs.` },
    },
  },
  provost: {
    slug: "provost",
    title: "Provost",
    world: "Teaching & Education",
    photo: "/images/app/browse/provost.webp",
    summary: "The top academic leader of a university, in charge of every college, class and professor.",
    scenario: "Imagine every dean on campus wants more money next year. You weigh each plan and decide where the university invests.",
    facts: POSTSEC_ADMIN_FACTS,
    payByState: POSTSEC_ADMIN_STATES,
    knowAbout: ["Running a team or a business", "Clear writing and speaking", "Teaching and how people learn", "Hiring and managing people", "Budgets and money"],
    goodAt: ["Making the final call", "Thinking through hard choices", "Managing people", "Managing money", "Seeing how a whole system fits together"],
    software: ["Microsoft Excel", "Oracle PeopleSoft", "Microsoft SharePoint", "Microsoft PowerPoint", "SAS"],
    ladder: [
      { number: "1", jobTitle: "College Dean", pay: "$105K", description: "You lead one college, its faculty and its budget.", whatYouDo: ["Set goals for the college", "Hire faculty", "Manage the budget", "Raise money"], toGetHere: ["Doctorate", "Years as a professor and chair"] },
      { number: "2", jobTitle: "Vice Provost", pay: "", description: "You lead one area for the whole university, like teaching quality or research.", whatYouDo: ["Lead a campus-wide area", "Work with every dean", "Review programs", "Guide big projects"], toGetHere: ["Years as a dean"] },
      { number: "3", jobTitle: "Provost", pay: "$144K", description: "You are second only to the president and lead all teaching and research.", whatYouDo: ["Set academic priorities", "Approve the academic budget", "Lead all the deans", "Approve new programs"], toGetHere: ["Years in senior college leadership", "A strong research or teaching record"] },
    ],
    education: { studies: POSTSEC_ADMIN_STUDIES, where: [{ count: "", credential: "Doctorate" }] },
    sources: `${STANDARD_SOURCE} BLS has no separate provost occupation, so the figures are for all postsecondary education administrators (SOC 11-9033), where O*NET lists Provost as a job title.`,
    factDetails: POSTSEC_ADMIN_DETAILS("Nearly every provost has a doctorate and long years as a professor, chair and dean."),
  },
  "self-enrichment-teacher": {
    slug: "self-enrichment-teacher",
    title: "Self-Enrichment Teacher",
    world: "Teaching & Education",
    photo: "/images/app/browse/self-enrichment-teacher.webp",
    summary: "Teaches fun or useful classes people take by choice, like art, music, dance or cooking.",
    scenario: "Imagine a Saturday pottery class full of first-timers. By noon, every person leaves with a bowl they made with their own hands.",
    facts: [
      { label: "Typical degree", value: "High school diploma or equivalent" },
      { label: "Typical pay", value: "$46,800/year" },
      { label: "People doing it", value: "419,100" },
      { label: "Jobs open each year", value: "50,000" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$53K" }], best: [{ state: "District of Columbia", pay: "$71K" }, { state: "New York", pay: "$70K" }, { state: "Vermont", pay: "$66K" }] },
    knowAbout: ["Teaching and how people learn", "Helping people", "Clear reading and speaking", "Your own skill, like art or music", "How people think and feel"],
    goodAt: ["Speaking clearly", "Listening closely", "Explaining things many ways", "Reading how people feel", "Learning new things fast"],
    software: ["Google Classroom", "Microsoft PowerPoint", "YouTube", "Adobe Photoshop", "Microsoft Excel"],
    ladder: [
      { number: "1", jobTitle: "Assistant Instructor", pay: "", description: "You help a lead teacher run classes while you build your skill.", whatYouDo: ["Set up class", "Help students one on one", "Show simple steps", "Clean up after class"], toGetHere: ["Skill in the subject", "High school diploma"] },
      { number: "2", jobTitle: "Self-Enrichment Teacher", pay: "$47K", description: "You plan and teach your own classes in your subject.", whatYouDo: ["Plan lessons", "Teach and show skills", "Give feedback", "Track student progress"], toGetHere: ["Under 5 years using the skill", "A certificate helps"] },
      { number: "3", jobTitle: "Lead Instructor or Studio Owner", pay: "$63K", description: "You run a program or your own studio and train other teachers.", whatYouDo: ["Run the program", "Train teachers", "Grow the class list", "Handle the money"], toGetHere: ["Years of teaching", "Business skills help"] },
    ],
    education: { studies: [{ name: "Adult and Continuing Education and Teaching" }, { name: "Online Educator/Online Teaching" }], where: [{ count: "", credential: "High school diploma" }, { count: "", credential: "Postsecondary certificate" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "High school diploma or equivalent", experienceFirst: "Yes. Usually under 5 years using the skill you teach", trainingAfterHiring: "None required", note: "What matters most is skill in your subject. Many teachers also earn a certificate or a degree in it.", noBachelorPct: "39%", distribution: dist(2.4, 11.3, 16.7, 8.3, 34.8, 21.4, 5.2) },
      pay: { starting: "$30,050", typical: "$46,800", top: "$92,840", note: "About 15% work for themselves, so this describes the ones with a boss." },
      openings: { note: `${OPENINGS} The job itself changes by about +14,600 by 2035. It is growing about as fast as most jobs.` },
    },
  },
  "shop-or-tech-teacher": {
    slug: "shop-or-tech-teacher",
    title: "Shop or Tech Teacher",
    world: "Teaching & Education",
    photo: "/images/app/browse/shop-or-tech-teacher.webp",
    summary: "Teaches high school students hands-on job skills, like woodworking, auto repair or computers.",
    scenario: "Imagine a student builds their first workbench in your shop. You teach them to measure twice, cut once and stay safe on every machine.",
    facts: [
      { label: "Typical degree", value: "Bachelor's degree" },
      { label: "Typical pay", value: "$66,270/year" },
      { label: "People doing it", value: "110,500" },
      { label: "Jobs open each year", value: "6,400" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$55K" }], best: [{ state: "Washington", pay: "$98K" }, { state: "Connecticut", pay: "$97K" }, { state: "Massachusetts", pay: "$93K" }] },
    knowAbout: ["Teaching and how people learn", "Your trade or tech field", "Computers and software", "Keeping people safe", "Math"],
    goodAt: ["Explaining things many ways", "Listening closely", "Showing skills step by step", "Watching how students are doing", "Keeping a shop safe"],
    software: ["AutoCAD", "Microsoft Excel", "Google Docs", "Kahoot!", "Learning management systems"],
    ladder: [
      { number: "1", jobTitle: "Skilled Worker in a Trade or Tech Field", pay: "", description: "You do the work you will one day teach, like building, fixing cars or coding.", whatYouDo: ["Do hands-on work", "Learn the tools", "Earn industry certifications", "Train new workers"], toGetHere: ["Training or a degree in the field"] },
      { number: "2", jobTitle: "Career and Technical Education Teacher", pay: "$66K", description: "You teach a trade or tech subject in a high school shop or lab.", whatYouDo: ["Teach hands-on skills", "Run shop safety", "Grade projects", "Prepare students for jobs"], toGetHere: ["Bachelor's degree", "Work time in the field", "State teaching license"] },
      { number: "3", jobTitle: "CTE Program Lead", pay: "$80K", description: "You lead a school's career program and link students with local employers.", whatYouDo: ["Lead the program", "Build classes", "Work with employers", "Mentor new teachers"], toGetHere: ["Years of teaching", "A master's helps"] },
    ],
    education: { studies: [{ name: "Technology Teacher Education/Industrial Arts Teacher Education" }, { name: "Trade and Industrial Teacher Education" }, { name: "Technical Teacher Education" }, { name: "Agricultural Teacher Education" }], where: [{ count: "", credential: "Trade school certificate" }, { count: "", credential: "Bachelor's degree" }] },
    sources: `${STANDARD_SOURCE} The figures are for career and technical education teachers in high schools (SOC 25-2032), the BLS occupation for shop and tech teachers.`,
    factDetails: {
      degree: { doorAsksFor: "Bachelor's degree", experienceFirst: "Yes. Usually under 5 years working in the field", trainingAfterHiring: "None required", note: "Most need a bachelor's and a state license, plus time working in the trade or tech field they teach.", noBachelorPct: "4%", extra: "This degree mix is shared by all high school teachers in the BLS table.", distribution: dist(0.0, 0.0, 2.2, 1.5, 38.4, 52.0, 6.0) },
      pay: { starting: "$50,040", typical: "$66,270", top: "$101,340", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about -400 by 2035. It is holding about steady.` },
    },
  },
  // OEWS publishes no state wages for special education teachers as a group
  // (25-2050), so the state rows are for kindergarten and elementary special
  // education teachers (25-2052), the largest group (259,100 of 584,100).
  // Tasks and software follow O*NET 25-2056.00 (elementary).
  "special-education-teacher": {
    slug: "special-education-teacher",
    title: "Special Education Teacher",
    world: "Teaching & Education",
    photo: "/images/app/browse/special-education-teacher.webp",
    summary: "Teaches students with disabilities in the way that works best for each one.",
    scenario: "Imagine a student who learns best by moving. You build a reading lesson around games, and today they read a full page on their own.",
    facts: [
      { label: "Typical degree", value: "Bachelor's degree" },
      { label: "Typical pay", value: "$67,170/year" },
      { label: "People doing it", value: "584,100" },
      { label: "Jobs open each year", value: "37,100" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$54K" }], best: [{ state: "District of Columbia", pay: "$95K" }, { state: "Washington", pay: "$94K" }, { state: "California", pay: "$94K" }] },
    knowAbout: ["Teaching and how people learn", "Clear reading and writing", "Helping students and families", "Computers and learning tools", "How people think and feel"],
    goodAt: ["Listening closely", "Speaking clearly", "Explaining things many ways", "Watching how each student is doing", "Reading how people feel"],
    software: ["IEP software", "Screen reader software", "Dragon NaturallySpeaking", "Microsoft Excel", "Microsoft Outlook"],
    ladder: [
      { number: "1", jobTitle: "Special Education Teacher Assistant", pay: "$37K", description: "You help students one on one while a lead teacher guides you.", whatYouDo: ["Work with one student", "Help in class", "Support daily routines", "Track progress"], toGetHere: ["High school diploma", "Some college helps"] },
      { number: "2", jobTitle: "Special Education Teacher", pay: "$67K", description: "You plan lessons that fit each student's needs and write their learning plans.", whatYouDo: ["Write learning plans (IEPs)", "Adapt lessons", "Teach small groups", "Meet with parents"], toGetHere: ["Bachelor's degree", "State special education license"] },
      { number: "3", jobTitle: "Lead Special Education Teacher", pay: "$84K", description: "You guide your school's special education team and coach newer teachers.", whatYouDo: ["Lead the team", "Coach new teachers", "Review learning plans", "Work with families"], toGetHere: ["Years of teaching", "A master's degree helps"] },
    ],
    education: { studies: [{ name: "Special Education and Teaching, General" }, { name: "Education/Teaching of Individuals with Autism" }, { name: "Education/Teaching of Individuals with Specific Learning Disabilities" }, { name: "Education/Teaching of Individuals in Elementary Special Education Programs" }], where: [{ count: "", credential: "Bachelor's degree" }, { count: "", credential: "Master's degree" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Bachelor's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None. Student teaching in college is the training", note: "Public schools need a bachelor's and a state special education license. Many teachers add a master's later.", noBachelorPct: "10%", distribution: dist(0.9, 3.2, 3.2, 2.5, 34.6, 51.0, 4.5) },
      pay: { starting: "$49,230", typical: "$67,170", top: "$105,020", note: "Figures cover special education teachers at every grade. State rows are for kindergarten and elementary teachers, the biggest group." },
      openings: { note: `${OPENINGS} The job itself changes by about -300 by 2035. It is holding about steady.` },
    },
  },
  "subject-teacher-or-professor": {
    slug: "subject-teacher-or-professor",
    title: "Subject Teacher or Professor",
    world: "Teaching & Education",
    photo: "/images/app/browse/subject-teacher-or-professor.webp",
    summary: "Teaches one subject they love, like English, math or history, in high school or college.",
    scenario: "Imagine a class that groans when you say the word history. By the end of your lesson, they are arguing about it on the way out.",
    facts: [
      { label: "Typical degree", value: "Bachelor's degree" },
      { label: "Typical pay", value: "$72,040/year" },
      { label: "People doing it", value: "1,087,500" },
      { label: "Jobs open each year", value: "63,500" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$54K" }], best: [{ state: "California", pay: "$106K" }, { state: "Washington", pay: "$99K" }, { state: "New York", pay: "$97K" }] },
    knowAbout: ["Teaching and how people learn", "Your subject in depth", "Clear reading and writing", "How teens think and feel", "Computers and learning tools"],
    goodAt: ["Listening closely", "Explaining things many ways", "Speaking clearly", "Watching how students are doing", "Reading how people feel"],
    software: ["Google Classroom", "Microsoft PowerPoint", "Microsoft Excel", "Schoology", "Desmos"],
    ladder: [
      { number: "1", jobTitle: "New High School Teacher", pay: "$49K", description: "You teach your subject to your own classes, with a mentor to guide you.", whatYouDo: ["Plan lessons", "Teach classes", "Grade tests", "Meet with parents"], toGetHere: ["Bachelor's degree in your subject", "State teaching license"] },
      { number: "2", jobTitle: "High School Teacher", pay: "$72K", description: "You teach your subject, guide students and help plan the courses.", whatYouDo: ["Teach your subject", "Write tests", "Advise students", "Help plan courses"], toGetHere: ["Years of teaching", "A master's helps"] },
      { number: "3", jobTitle: "Professor", pay: "$82K", description: "You teach your subject in college and do research in it.", whatYouDo: ["Teach college classes", "Do research", "Publish papers", "Advise students"], toGetHere: ["Doctorate in your subject"] },
    ],
    education: { studies: [{ name: "Secondary Education and Teaching" }, { name: "English/Language Arts Teacher Education" }, { name: "Mathematics Teacher Education" }, { name: "Science Teacher Education/General Science Teacher Education" }, { name: "Social Studies Teacher Education" }], where: [{ count: "", credential: "Bachelor's degree" }, { count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: `${STANDARD_SOURCE} BLS counts high school teachers and college professors separately, so the figures are for high school teachers (SOC 25-2031). Professor pay is the median for all postsecondary teachers (SOC 25-1000).`,
    factDetails: {
      degree: { doorAsksFor: "Bachelor's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None. Student teaching in college is the training", note: "High school teachers need a bachelor's and a state license. College professors usually need a doctorate in their subject.", noBachelorPct: "4%", distribution: dist(0.0, 0.0, 2.2, 1.5, 38.4, 52.0, 6.0) },
      pay: { starting: "$48,780", typical: "$72,040", top: "$107,600", note: "These figures are for high school teachers. College professors earn a typical $82,250." },
      openings: { note: `${OPENINGS} The job itself changes by about -2,500 by 2035. It is holding about steady.` },
    },
  },
  superintendent: {
    slug: "superintendent",
    title: "Superintendent",
    world: "Teaching & Education",
    photo: "/images/app/browse/superintendent.webp",
    summary: "Leads a whole school district, every school, principal and teacher in it.",
    scenario: "Imagine a snowstorm at 5 a.m. and 20 schools waiting on you. You decide if buses roll, and thousands of families hear it from you.",
    facts: [
      { label: "Typical degree", value: "Master's degree" },
      { label: "Typical pay", value: "$105,870/year" },
      { label: "People doing it", value: "343,800" },
      { label: "Jobs open each year", value: "20,600" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$92K" }], best: [{ state: "Washington", pay: "$161K" }, { state: "California", pay: "$152K" }, { state: "Connecticut", pay: "$148K" }] },
    knowAbout: ["Teaching and how people learn", "Running a team or a business", "Clear writing and speaking", "Helping students and families", "How people think and feel"],
    goodAt: ["Listening closely", "Making the final call", "Managing people", "Managing money", "Bringing people to agree"],
    software: ["Student information systems", "Microsoft Excel", "Google Classroom", "ParentSquare", "Microsoft SharePoint"],
    ladder: [
      { number: "1", jobTitle: "Teacher", pay: "$63K", description: "You teach in a classroom and learn how schools really work.", whatYouDo: ["Teach classes", "Plan lessons", "Work with parents", "Lead school projects"], toGetHere: ["Bachelor's degree", "State teaching license"] },
      { number: "2", jobTitle: "Principal", pay: "$106K", description: "You run one school, its teachers and its budget.", whatYouDo: ["Lead teachers", "Set school goals", "Handle discipline", "Manage the budget"], toGetHere: ["Master's in education leadership", "Years of teaching", "Principal license"] },
      { number: "3", jobTitle: "Superintendent", pay: "$135K", description: "You lead every school in the district and answer to the school board.", whatYouDo: ["Lead all principals", "Set district goals", "Build the budget", "Work with the school board"], toGetHere: ["Years as a principal", "Superintendent license", "A doctorate helps"] },
    ],
    education: { studies: [{ name: "Superintendency and Educational System Administration" }, { name: "Educational Leadership and Administration, General" }, { name: "Educational, Instructional, and Curriculum Supervision" }], where: [{ count: "", credential: "Master's degree" }, { count: "", credential: "Doctorate" }] },
    sources: `${STANDARD_SOURCE} BLS has no separate superintendent occupation, so the figures are for all K-12 education administrators (SOC 11-9032), mostly principals, where O*NET lists Superintendent as a job title.`,
    factDetails: {
      degree: { doorAsksFor: "Master's degree", experienceFirst: "Yes. Usually 5 years or more as a teacher", trainingAfterHiring: "None. Your years in schools are the training", note: "Superintendents usually teach, then lead a school as principal. A master's is the floor, and many hold a doctorate.", noBachelorPct: "18%", extra: "This degree mix is shared by all education administrators in the BLS table.", distribution: dist(1.0, 5.2, 7.2, 4.2, 24.3, 44.2, 14.0) },
      pay: { starting: "$76,280", typical: "$105,870", top: "$167,770", note: "These figures cover all K-12 school leaders, most of them principals." },
      openings: { note: `${OPENINGS} The job itself changes by about -1,200 by 2035. It is holding about steady.` },
    },
  },
  // OEWS and the projections code this group 25-9045; O*NET's closest
  // profile is 25-9042.00 (preschool through high school, except special
  // education), which the tasks and software follow.
  "teaching-assistant": {
    slug: "teaching-assistant",
    title: "Teaching Assistant",
    world: "Teaching & Education",
    photo: "/images/app/browse/teaching-assistant.webp",
    summary: "Helps a teacher run the classroom and gives students extra help.",
    scenario: "Imagine one student is stuck while the teacher works with 25 others. You sit down beside them and walk through the problem together.",
    facts: [
      { label: "Typical degree", value: "Some college, no degree" },
      { label: "Typical pay", value: "$36,780/year" },
      { label: "People doing it", value: "1,463,000" },
      { label: "Jobs open each year", value: "176,200" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$30K" }], best: [{ state: "Washington", pay: "$51K" }, { state: "District of Columbia", pay: "$48K" }, { state: "California", pay: "$47K" }] },
    knowAbout: ["Helping people", "Clear reading and writing", "How kids think and feel", "Math", "Teaching and how people learn"],
    goodAt: ["Listening closely", "Reading closely", "Speaking clearly", "Patience and care", "Working well with the teacher"],
    software: ["Google Classroom", "Seesaw", "ClassDojo", "Kahoot!", "Microsoft Word"],
    ladder: [
      { number: "1", jobTitle: "New Teaching Assistant", pay: "$27K", description: "You help in one classroom and learn the routines from the lead teacher.", whatYouDo: ["Watch over students", "Help small groups", "Set up materials", "Supervise lunch and recess"], toGetHere: ["High school diploma", "Some college or a state test"] },
      { number: "2", jobTitle: "Teaching Assistant", pay: "$37K", description: "You teach small groups, support students who need extra help and track their progress.", whatYouDo: ["Tutor students", "Reinforce lessons", "Record progress", "Help with class rules"], toGetHere: ["Some college or an associate's degree", "Classroom experience"] },
      { number: "3", jobTitle: "Teacher", pay: "$63K", description: "You run your own class after earning a degree and a teaching license.", whatYouDo: ["Plan lessons", "Teach a full class", "Grade work", "Meet with parents"], toGetHere: ["Bachelor's degree", "State teaching license"] },
    ],
    education: { studies: [{ name: "Teacher Assistant/Aide" }, { name: "Early Childhood Education and Teaching" }, { name: "Child Development" }, { name: "Education, General" }], where: [{ count: "", credential: "High school diploma" }, { count: "", credential: "Associate's degree" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Some college, no degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "Many schools ask for two years of college, an associate's degree or a passing score on a state test.", noBachelorPct: "66%", distribution: dist(4.6, 25.8, 20.9, 14.2, 23.2, 9.3, 1.8) },
      pay: { starting: "$27,150", typical: "$36,780", top: "$50,040", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about -4,900 by 2035. It is holding about steady.` },
    },
  },
  // The CIP crosswalk has no study field for tutors (25-3041), so the
  // studies list names the subject itself rather than a CIP title.
  tutor: {
    slug: "tutor",
    title: "Tutor",
    world: "Teaching & Education",
    photo: "/images/app/browse/tutor.webp",
    summary: "Helps students one on one or in small groups to understand schoolwork and pass tests.",
    scenario: "Imagine a student who failed the last math test. Week by week you work through it together, and the next test comes back a B.",
    facts: [
      { label: "Typical degree", value: "Some college, no degree" },
      { label: "Typical pay", value: "$43,350/year" },
      { label: "People doing it", value: "208,400" },
      { label: "Jobs open each year", value: "34,200" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$42K" }], best: [{ state: "Wyoming", pay: "$77K" }, { state: "Rhode Island", pay: "$76K" }, { state: "Massachusetts", pay: "$65K" }] },
    knowAbout: ["Helping people", "Clear reading and writing", "Teaching and how people learn", "Math", "Computers and learning tools"],
    goodAt: ["Reading closely", "Listening closely", "Explaining things many ways", "Speaking clearly", "Cheering students on"],
    software: ["Zoom", "Google Meet", "Google Classroom", "Desmos", "Microsoft Excel"],
    ladder: [
      { number: "1", jobTitle: "Peer or Volunteer Tutor", pay: "", description: "You help classmates or younger kids with a subject you know well.", whatYouDo: ["Review homework", "Explain tough ideas", "Quiz students", "Share study tips"], toGetHere: ["Strong grades in the subject"] },
      { number: "2", jobTitle: "Tutor", pay: "$43K", description: "You plan sessions, teach study skills and track each student's progress.", whatYouDo: ["Plan sessions", "Teach study skills", "Prepare students for tests", "Report progress to parents"], toGetHere: ["Some college", "Strong skill in your subject"] },
      { number: "3", jobTitle: "Senior Tutor or Tutoring Business Owner", pay: "$55K", description: "You lead a tutoring center or run your own tutoring business.", whatYouDo: ["Train other tutors", "Find new students", "Set prices and schedules", "Handle the money"], toGetHere: ["Years of tutoring", "A bachelor's degree helps"] },
    ],
    education: { studies: [{ name: "The subject you tutor, like math, English or science" }], where: [{ count: "", credential: "Associate's degree" }, { count: "", credential: "Bachelor's degree" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Some college, no degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "Most tutors have some college, and many have a bachelor's in the subject they teach.", noBachelorPct: "22%", distribution: dist(0.8, 4.9, 10.0, 6.4, 44.2, 29.1, 4.4) },
      pay: { starting: "$29,430", typical: "$43,350", top: "$75,990", note: "About 12% work for themselves, so this describes the ones with a boss." },
      openings: { note: `${OPENINGS} The job itself changes by about -500 by 2035. It is holding about steady.` },
    },
  },
  // BLS has no separate AI or machine learning engineer occupation. O*NET's
  // top match for "machine learning engineer" is Data Scientists (15-2051),
  // whose tasks cover building and testing prediction models and whose
  // software list includes Python, PyTorch and TensorFlow. So every BLS figure
  // here is for all data scientists, the same occupation the Data Analyst
  // profile uses. OEWS released no 15-2051 wage for Delaware, so it could not
  // rank.
  "ai-and-machine-learning-engineer": {
    slug: "ai-and-machine-learning-engineer",
    title: "AI and Machine Learning Engineer",
    world: "Tech & Engineering",
    photo: "/images/app/browse/ai-and-machine-learning-engineer.webp",
    summary: "Builds computer models that learn from data to make predictions and decisions.",
    scenario: "Imagine teaching a computer to spot a sick plant from a phone photo. You feed it thousands of pictures until it gets the answer right almost every time.",
    facts: [
      { label: "Typical degree", value: "Bachelor's degree" },
      { label: "Typical pay", value: "$120,230/year" },
      { label: "People doing it", value: "275,600" },
      { label: "Jobs open each year", value: "24,800" },
    ],
    payByState: { title: "Pay by state", yourStates: [{ state: "South Dakota", pay: "$102K" }], best: [{ state: "Washington", pay: "$158K" }, { state: "California", pay: "$156K" }, { state: "Maryland", pay: "$144K" }] },
    knowAbout: ["Math and statistics", "Computers and programming", "Clear writing", "How businesses use data", "Testing and checking models"],
    goodAt: ["Math", "Writing code", "Solving hard problems", "Learning new tools fast", "Explaining results clearly"],
    software: ["Python", "PyTorch", "TensorFlow", "Amazon SageMaker", "GitHub"],
    ladder: [
      { number: "1", jobTitle: "Junior Machine Learning Engineer", pay: "$67K", description: "You clean data and help train models while a senior engineer checks your work.", whatYouDo: ["Clean data", "Write Python code", "Train simple models", "Test results"], toGetHere: ["Bachelor's in computer science or math", "Python skills"] },
      { number: "2", jobTitle: "Machine Learning Engineer", pay: "$120K", description: "You build, test and launch models that power real products.", whatYouDo: ["Build models", "Compare and tune models", "Put models into apps", "Share results"], toGetHere: ["Time building models", "A master's helps"] },
      { number: "3", jobTitle: "Senior AI Engineer", pay: "$159K", description: "You lead big AI projects, choose the tools and coach other engineers.", whatYouDo: ["Lead AI projects", "Design model systems", "Coach engineers", "Advise leaders"], toGetHere: ["Years building models", "A record of shipped work"] },
    ],
    education: { studies: [{ name: "Artificial Intelligence" }, { name: "Computer Science" }, { name: "Data Science, General" }, { name: "Applied Mathematics, General" }, { name: "Statistics, General" }], where: [{ count: "", credential: "Bachelor's degree" }, { count: "", credential: "Master's degree" }] },
    sources: `${STANDARD_SOURCE} BLS has no separate AI or machine learning engineer occupation, so the figures are for data scientists (SOC 15-2051), O*NET's closest match.`,
    factDetails: {
      degree: { doorAsksFor: "Bachelor's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "A bachelor's in computer science, math or statistics is the usual way in. Many AI jobs ask for a master's.", noBachelorPct: "14%", distribution: dist(0.5, 2.8, 6.4, 4.0, 38.9, 35.5, 11.8) },
      pay: { starting: "$67,240", typical: "$120,230", top: "$199,130", note: "BLS counts AI and machine learning engineers inside the larger group of data scientists, so these figures are for that whole group." },
      openings: { note: `${OPENINGS} The job itself changes by about +95,400 by 2035. It is growing much faster than most jobs.` },
    },
  },
  // OEWS released no South Dakota wage for 17-2011, so there is no
  // yourStates row (same as the entries that have no home-state figure).
  "aerospace-engineer": {
    slug: "aerospace-engineer",
    title: "Aerospace Engineer",
    world: "Tech & Engineering",
    photo: "/images/app/browse/aerospace-engineer.webp",
    summary: "Designs and tests airplanes, rockets, satellites and drones.",
    scenario: "Imagine a new rocket engine on the test stand. You read the data from every sensor to prove it is ready to fly.",
    facts: [
      { label: "Typical degree", value: "Bachelor's degree" },
      { label: "Typical pay", value: "$134,960/year" },
      { label: "People doing it", value: "68,700" },
      { label: "Jobs open each year", value: "3,800" },
    ],
    payByState: { title: "Pay by state", best: [{ state: "California", pay: "$160K" }, { state: "Maryland", pay: "$160K" }, { state: "Hawaii", pay: "$159K" }] },
    knowAbout: ["How things get engineered and built", "Design and technical plans", "Machines and moving parts", "Math", "Physics"],
    goodAt: ["Thinking things through", "Math", "Science", "Testing how well a system works", "Solving hard, messy problems"],
    software: ["MATLAB", "Simulink", "CATIA", "SolidWorks", "AutoCAD"],
    ladder: [
      { number: "1", jobTitle: "Junior Aerospace Engineer", pay: "$87K", description: "You run tests and check designs while senior engineers guide you.", whatYouDo: ["Run tests", "Check designs", "Build computer models", "Write test reports"], toGetHere: ["Bachelor's in aerospace or mechanical engineering"] },
      { number: "2", jobTitle: "Aerospace Engineer", pay: "$135K", description: "You design parts and systems for aircraft or spacecraft and prove they are safe.", whatYouDo: ["Design systems", "Plan stress tests", "Fix performance problems", "Work with suppliers"], toGetHere: ["Years of engineering work", "A security clearance for some jobs"] },
      { number: "3", jobTitle: "Senior Aerospace Engineer", pay: "$170K", description: "You lead design teams and big test programs.", whatYouDo: ["Lead design teams", "Approve designs", "Direct test programs", "Guide newer engineers"], toGetHere: ["Years as an engineer", "A master's or PE license helps"] },
    ],
    education: { studies: [{ name: "Aerospace, Aeronautical, and Astronautical/Space Engineering, General" }, { name: "Astronautical Engineering" }, { name: "Mechanical Engineering" }, { name: "Electrical and Electronics Engineering" }], where: [{ count: "", credential: "Bachelor's degree" }, { count: "", credential: "Master's degree" }] },
    sources: STANDARD_SOURCE,
    factDetails: {
      degree: { doorAsksFor: "Bachelor's degree", experienceFirst: "No. You can start without it", trainingAfterHiring: "None required", note: "A bachelor's in aerospace engineering or a related field is the usual way in. Some jobs need a security clearance.", noBachelorPct: "10%", distribution: dist(0.6, 1.9, 3.7, 3.7, 50.4, 34.4, 5.3) },
      pay: { starting: "$86,700", typical: "$134,960", top: "$205,890", note: MEDIAN_NOTE },
      openings: { note: `${OPENINGS} The job itself changes by about +5,700 by 2035. It is growing much faster than most jobs.` },
    },
  },
};
