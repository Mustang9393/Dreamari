// Career Detail profiles for the 4 Oct 2026 poster drop, batch 5 (BROWSE Images).
// Sourced: bls.gov Occupational Outlook Handbook pages (2025 pay, 2025-35
// outlook) for wording on degrees, licenses and top-paying employers; BLS
// Employment Projections table 1.2 (2025-35) for people doing it, openings
// each year, change by 2035 and the typical entry degree; OEWS May 2025 for
// national 10th / 50th / 75th / 90th percentile pay (ladder rungs use the
// 10th, median and 75th) and state annual means (yourStates is South Dakota,
// like every other profile; best is the top 3 states, District of Columbia
// counted); BLS table 5.3 for the education mix; tasks, knowledge, skills and
// software from O*NET OnLine; study fields from the NCES CIP 2020 to SOC 2018
// crosswalk. SOC per career: Chemist 19-2031, Economist 19-3011,
// Epidemiologist 19-1041, Forensic Science Technician 19-4092, Geneticist
// 19-1029, Geological Technician 19-4043, Geoscientist 19-2042, Historian
// 19-3093, Medical Scientist 19-1042, Meteorologist 19-2021, Microbiologist
// 19-1022, Molecular Biologist 19-1029, Physicist 19-2012, Psychologist
// 19-3033, Quality Control Analyst 19-4099, School Psychologist 19-3034,
// Academic Advisor 21-1012, Adapted PE Teacher 25-2059, Admissions Officer
// 11-9033, Adult and English Language Teacher 25-3011.
// Mapped to a broader occupation, because BLS has none of its own: Geneticist
// and Molecular Biologist use 19-1029 (O*NET files them there as 19-1029.03
// and 19-1029.02), Quality Control Analyst uses 19-4099 (O*NET 19-4099.01),
// Adapted PE Teacher uses 25-2059 (O*NET 25-2059.01), Academic Advisor uses
// 21-1012 and Admissions Officer uses 11-9033 (BLS counts each inside that
// group). Psychologist uses Clinical and Counseling Psychologists 19-3033, the
// largest psychologist line item, since School Psychologist has its own entry.
// Where OEWS released no South Dakota wage there is no yourStates row.
import type { CareerProfile } from "./profiles";

export const LIB5_PROFILES: Record<string, CareerProfile> = {
  // The OOH page also covers materials scientists, so every Chemist figure is
  // for 19-2031 alone: table 1.2 for people and openings, OEWS May 2025 for pay.
  "chemist": {
    "slug": "chemist",
    "title": "Chemist",
    "world": "Science & Research",
    "photo": "/images/app/browse/chemist.webp",
    "summary": "Studies what things are made of and uses that to make new products and check that they are safe.",
    "scenario": "Imagine a drug company hands you a new pill to test. You break it down in the lab and prove it holds exactly what the label says.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$91,240/year" },
      { "label": "People doing it", "value": "84,900" },
      { "label": "Jobs open each year", "value": "5,900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$73K" }], "best": [{ "state": "District of Columbia", "pay": "$149K" }, { "state": "Maryland", "pay": "$139K" }, { "state": "Massachusetts", "pay": "$129K" }] },
    "knowAbout": ["Chemistry", "Math", "Clear writing", "How products get made", "Computers"],
    "goodAt": ["Using science to solve problems", "Thinking through hard problems", "Reading lab methods closely", "Checking quality", "Explaining your results"],
    "software": ["Agilent ChemStation", "Waters Empower", "Minitab", "SAP", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Chemist", "pay": "$58K", "description": "You run set tests in the lab while a senior chemist checks your work.", "whatYouDo": ["Prepare samples", "Run lab tests", "Record results", "Clean and set up tools"], "toGetHere": ["Bachelor's in chemistry"] },
      { "number": "2", "jobTitle": "Chemist", "pay": "$91K", "description": "You test materials, improve products and write up what you find.", "whatYouDo": ["Analyze compounds", "Run quality tests", "Improve formulas", "Write reports"], "toGetHere": ["Bachelor's degree", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Chemist", "pay": "$126K", "description": "You lead projects, design new tests and guide newer chemists.", "whatYouDo": ["Lead research projects", "Design new methods", "Guide lab staff", "Work with engineers"], "toGetHere": ["Years as a chemist", "A master's or Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "Chemistry, General" }, { "name": "Analytical Chemistry" }, { "name": "Organic Chemistry" }, { "name": "Forensic Chemistry" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's in chemistry is the usual way in. Research jobs often ask for a master's or Ph.D., and lab internships help.", "noBachelorPct": "8%", "distribution": [{ "label": "Did not finish high school", "pct": 1.0 }, { "label": "Finished high school", "pct": 2.3 }, { "label": "Some college, no degree", "pct": 2.8 }, { "label": "Associate's degree", "pct": 1.9 }, { "label": "Bachelor's degree", "pct": 50.2 }, { "label": "Master's degree", "pct": 21.1 }, { "label": "Doctorate or professional degree", "pct": 20.7 }] },
      "pay": { "starting": "$58,460", "typical": "$91,240", "top": "$160,830", "note": "Of the biggest employers, the federal government pays chemists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +5,500 by 2035. It is growing faster than most jobs." }
    }
  },
  // OEWS released no 19-3011 wage for South Dakota, so there is no yourStates
  // row.
  "economist": {
    "slug": "economist",
    "title": "Economist",
    "world": "Science & Research",
    "photo": "/images/app/browse/economist.webp",
    "summary": "Studies how people, businesses and governments use money and resources, and predicts what comes next.",
    "scenario": "Imagine a city asks what a new tax will do to local shops. You crunch the numbers and give leaders a clear answer before they vote.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$124,720/year" },
      { "label": "People doing it", "value": "18,600" },
      { "label": "Jobs open each year", "value": "1,100" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "District of Columbia", "pay": "$175K" }, { "state": "New York", "pay": "$169K" }, { "state": "New Jersey", "pay": "$162K" }] },
    "knowAbout": ["Math and statistics", "Economics and accounting", "Clear writing", "Computers", "Teaching and explaining"],
    "goodAt": ["Thinking through hard problems", "Working with numbers", "Reading reports closely", "Making good calls", "Explaining what data means"],
    "software": ["IBM SPSS Statistics", "SAS", "MATLAB", "Python", "Microsoft Power BI"],
    "ladder": [
      { "number": "1", "jobTitle": "Research Assistant", "pay": "$67K", "description": "You gather data and build charts for senior economists.", "whatYouDo": ["Collect data", "Clean data sets", "Build charts", "Check facts"], "toGetHere": ["Bachelor's in economics or math"] },
      { "number": "2", "jobTitle": "Economist", "pay": "$125K", "description": "You study data, forecast trends and explain what a policy will do.", "whatYouDo": ["Analyze data", "Forecast trends", "Study policies", "Write reports"], "toGetHere": ["Master's degree", "Strong math skills"] },
      { "number": "3", "jobTitle": "Senior Economist", "pay": "$175K", "description": "You lead big studies and advise leaders on major choices.", "whatYouDo": ["Lead research", "Advise leaders", "Review others' work", "Present findings"], "toGetHere": ["Years as an economist", "A Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "Economics, General" }, { "name": "Applied Economics" }, { "name": "Econometrics and Quantitative Economics" }, { "name": "Agricultural Economics" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Master's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Most economists have a master's or Ph.D. Some government jobs start with a bachelor's, and strong math helps everywhere.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 28.2 }, { "label": "Master's degree", "pct": 35.0 }, { "label": "Doctorate or professional degree", "pct": 36.8 }] },
      "pay": { "starting": "$67,360", "typical": "$124,720", "top": "$238,060", "note": "Of the biggest employers, the federal government pays economists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +900 by 2035. It is growing faster than most jobs." }
    }
  },
  // OEWS released no 19-1041 wage for South Dakota, so there is no yourStates
  // row.
  "epidemiologist": {
    "slug": "epidemiologist",
    "title": "Epidemiologist",
    "world": "Science & Research",
    "photo": "/images/app/browse/epidemiologist.webp",
    "summary": "Tracks how diseases spread and finds ways to stop them.",
    "scenario": "Imagine dozens of people in one town get sick in the same week. You track every case until you find the source and stop the spread.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$87,220/year" },
      { "label": "People doing it", "value": "12,800" },
      { "label": "Jobs open each year", "value": "800" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Massachusetts", "pay": "$132K" }, { "state": "District of Columbia", "pay": "$123K" }, { "state": "Wisconsin", "pay": "$120K" }] },
    "knowAbout": ["Math and statistics", "Biology", "Clear writing", "Medicine and disease", "Computers"],
    "goodAt": ["Thinking through hard problems", "Reading studies closely", "Spotting patterns in data", "Explaining risks in plain words", "Making good calls"],
    "software": ["StataCorp Stata", "Tableau", "SQL", "Esri ArcGIS", "Python"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Epidemiologist", "pay": "$61K", "description": "You collect case data and help run studies while a senior epidemiologist guides you.", "whatYouDo": ["Collect case data", "Clean data sets", "Run basic stats", "Update reports"], "toGetHere": ["Master's in public health"] },
      { "number": "2", "jobTitle": "Epidemiologist", "pay": "$87K", "description": "You investigate outbreaks, run studies and share what you find.", "whatYouDo": ["Investigate outbreaks", "Design studies", "Analyze data", "Brief health leaders"], "toGetHere": ["Master's degree", "Field experience"] },
      { "number": "3", "jobTitle": "Senior Epidemiologist", "pay": "$113K", "description": "You lead health programs and guide a team of researchers.", "whatYouDo": ["Lead programs", "Plan big studies", "Guide the team", "Advise policy makers"], "toGetHere": ["Years of experience", "A Ph.D. or medical degree helps"] }
    ],
    "education": { "studies": [{ "name": "Epidemiology" }, { "name": "Epidemiology and Biostatistics" }, { "name": "Infectious Disease and Global Health" }, { "name": "Environmental Health" }], "where": [{ "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Master's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A master's in public health with a focus on epidemiology is the usual way in. People who lead research often have a Ph.D. or medical degree.", "noBachelorPct": "3%", "distribution": [{ "label": "Did not finish high school", "pct": 1.0 }, { "label": "Finished high school", "pct": 0.9 }, { "label": "Some college, no degree", "pct": 0.6 }, { "label": "Associate's degree", "pct": 0.6 }, { "label": "Bachelor's degree", "pct": 30.1 }, { "label": "Master's degree", "pct": 25.1 }, { "label": "Doctorate or professional degree", "pct": 41.7 }] },
      "pay": { "starting": "$61,270", "typical": "$87,220", "top": "$138,800", "note": "Of the biggest employers, research and development companies pay epidemiologists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +2,400 by 2035. It is growing much faster than most jobs." }
    }
  },
  "forensic-science-technician": {
    "slug": "forensic-science-technician",
    "title": "Forensic Science Technician",
    "world": "Science & Research",
    "photo": "/images/app/browse/forensic-science-technician.webp",
    "summary": "Collects and tests evidence from crime scenes to help solve crimes.",
    "scenario": "Imagine walking into a crime scene where one tiny fingerprint could crack the case. You find it, save it and match it in the lab.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$72,060/year" },
      { "label": "People doing it", "value": "20,100" },
      { "label": "Jobs open each year", "value": "2,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$55K" }], "best": [{ "state": "Illinois", "pay": "$109K" }, { "state": "California", "pay": "$105K" }, { "state": "Colorado", "pay": "$89K" }] },
    "knowAbout": ["Law and courts", "Public safety", "Biology and chemistry", "Clear writing", "Computers"],
    "goodAt": ["Paying close attention", "Thinking through hard problems", "Listening closely", "Writing clear reports", "Explaining findings in court"],
    "software": ["EnCase", "CODIS DNA database", "IAFIS fingerprint database", "Adobe Photoshop", "Lab information systems (LIMS)"],
    "ladder": [
      { "number": "1", "jobTitle": "Forensic Science Trainee", "pay": "$48K", "description": "You learn to collect and test evidence while senior techs guide you.", "whatYouDo": ["Photograph scenes", "Bag evidence", "Log every item", "Run basic lab tests"], "toGetHere": ["Bachelor's in a science"] },
      { "number": "2", "jobTitle": "Forensic Science Technician", "pay": "$72K", "description": "You collect evidence at scenes and test it in the lab.", "whatYouDo": ["Collect evidence", "Match fingerprints", "Test samples", "Write reports"], "toGetHere": ["Bachelor's degree", "On-the-job training"] },
      { "number": "3", "jobTitle": "Senior Forensic Scientist", "pay": "$95K", "description": "You take the hardest cases, train new techs and testify in court.", "whatYouDo": ["Lead tough cases", "Train new techs", "Review reports", "Testify in court"], "toGetHere": ["Years on the job", "Certification helps"] }
    ],
    "education": { "studies": [{ "name": "Forensic Science and Technology" }, { "name": "Criminalistics and Criminal Science" }, { "name": "Forensic Chemistry" }, { "name": "Biology/Biological Sciences, General" }], "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training", "note": "Most techs have a bachelor's in a science like biology, chemistry or forensic science. New hires then train on the job.", "noBachelorPct": "48%", "distribution": [{ "label": "Did not finish high school", "pct": 3.3 }, { "label": "Finished high school", "pct": 14.4 }, { "label": "Some college, no degree", "pct": 17.6 }, { "label": "Associate's degree", "pct": 13.1 }, { "label": "Bachelor's degree", "pct": 30.8 }, { "label": "Master's degree", "pct": 12.9 }, { "label": "Doctorate or professional degree", "pct": 7.8 }] },
      "pay": { "starting": "$48,250", "typical": "$72,060", "top": "$117,250", "note": "Of the biggest employers, state government pays these techs the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +2,700 by 2035. It is growing much faster than most jobs." }
    }
  },
  // BLS has no separate geneticist occupation. O*NET files Geneticists
  // (19-1029.03) under Biological Scientists, All Other (19-1029), so every BLS
  // figure here is for that whole group; tasks, skills and software follow O*NET
  // 19-1029.03. Table 5.3 pools 19-1029 with other biological scientists.
  "geneticist": {
    "slug": "geneticist",
    "title": "Geneticist",
    "world": "Science & Research",
    "photo": "/images/app/browse/geneticist.webp",
    "summary": "Studies genes and DNA to learn how traits and diseases pass from parents to children.",
    "scenario": "Imagine a family wants to know why a rare illness runs in their family. You read their DNA and find the one gene behind it.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$98,920/year" },
      { "label": "People doing it", "value": "59,600" },
      { "label": "Jobs open each year", "value": "4,300" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$76K" }], "best": [{ "state": "Maryland", "pay": "$126K" }, { "state": "California", "pay": "$124K" }, { "state": "Massachusetts", "pay": "$123K" }] },
    "knowAbout": ["Biology", "Clear writing", "Teaching and explaining", "Math", "Chemistry"],
    "goodAt": ["Reading research closely", "Using science to solve problems", "Learning new methods fast", "Thinking through hard problems", "Explaining your results"],
    "software": ["SAS JMP", "SQL", "R", "Git", "Linux"],
    "ladder": [
      { "number": "1", "jobTitle": "Research Associate", "pay": "$60K", "description": "You run DNA tests and keep lab records while a senior scientist leads the work.", "whatYouDo": ["Run DNA tests", "Prepare samples", "Keep lab notebooks", "Read research"], "toGetHere": ["Bachelor's in biology or genetics"] },
      { "number": "2", "jobTitle": "Geneticist", "pay": "$99K", "description": "You plan gene studies, read results and share what you find.", "whatYouDo": ["Plan experiments", "Study gene data", "Review lab results", "Write papers"], "toGetHere": ["Graduate degree", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Geneticist", "pay": "$128K", "description": "You lead a research team and win grants for new studies.", "whatYouDo": ["Lead a research team", "Write grants", "Guide other scientists", "Present at conferences"], "toGetHere": ["Ph.D.", "Years of research"] }
    ],
    "education": { "studies": [{ "name": "Genetics, General" }, { "name": "Molecular Genetics" }, { "name": "Genome Sciences/Genomics" }, { "name": "Biochemistry and Molecular Biology" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no separate geneticist occupation, so pay and job figures are for biological scientists, all other (SOC 19-1029), the group O*NET files geneticists under.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "BLS lists a bachelor's for this group, and more than half of its workers have a master's or doctorate. In O*NET's survey, most geneticists say new hires need a Ph.D. and postdoctoral training.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 46.2 }, { "label": "Master's degree", "pct": 31.9 }, { "label": "Doctorate or professional degree", "pct": 21.9 }] },
      "pay": { "starting": "$60,430", "typical": "$98,920", "top": "$168,010", "note": "BLS counts geneticists inside the larger group of biological scientists, all other, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +2,800 by 2035. It is growing faster than most jobs." }
    }
  },
  // OEWS released no 19-4043 wage for South Dakota, so there is no yourStates
  // row. The OOH page also covers hydrologic technicians, so every figure here
  // is for 19-4043 alone: table 1.2 for people and openings, OEWS May 2025 for
  // pay.
  "geological-technician": {
    "slug": "geological-technician",
    "title": "Geological Technician",
    "world": "Science & Research",
    "photo": "/images/app/browse/geological-technician.webp",
    "summary": "Helps geoscientists collect and test rock, soil and water samples.",
    "scenario": "Imagine a drill crew pulls up a long tube of rock from deep underground. You log every layer and test it so the team knows what lies below.",
    "facts": [
      { "label": "Typical degree", "value": "Associate's degree" },
      { "label": "Typical pay", "value": "$53,350/year" },
      { "label": "People doing it", "value": "7,300" },
      { "label": "Jobs open each year", "value": "1,000" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Alaska", "pay": "$116K" }, { "state": "Maryland", "pay": "$105K" }, { "state": "California", "pay": "$83K" }] },
    "knowAbout": ["Computers", "How things get engineered and built", "Math", "Clear writing", "Chemistry"],
    "goodAt": ["Reading reports closely", "Checking your own work", "Keeping an eye on equipment", "Managing your time", "Solving tricky problems"],
    "software": ["Esri ArcGIS", "Autodesk AutoCAD", "Golden Software Surfer", "IHS Petra", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Field Technician Trainee", "pay": "$36K", "description": "You collect samples in the field while a senior tech shows you how.", "whatYouDo": ["Collect samples", "Label and log samples", "Carry and set up gear", "Take field notes"], "toGetHere": ["Associate's degree in science technology"] },
      { "number": "2", "jobTitle": "Geological Technician", "pay": "$53K", "description": "You test samples, record data and draw maps for geoscientists.", "whatYouDo": ["Test samples", "Record data", "Draw maps", "Fix lab equipment"], "toGetHere": ["Associate's degree", "On-the-job training"] },
      { "number": "3", "jobTitle": "Senior Geological Technician", "pay": "$72K", "description": "You run field crews, check others' data and help plan surveys.", "whatYouDo": ["Lead field crews", "Check data", "Plan surveys", "Train new techs"], "toGetHere": ["Years as a technician", "A bachelor's helps"] }
    ],
    "education": { "studies": [{ "name": "Geology/Earth Science, General" }, { "name": "Petroleum Technology/Technician" }, { "name": "Mining Technology/Technician" }, { "name": "Science Technologies/Technicians, General" }], "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Associate's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training", "note": "An associate's degree in applied science or a science technology is the usual way in. Some employers prefer a bachelor's, and new hires train on the job.", "noBachelorPct": "59%", "distribution": [{ "label": "Did not finish high school", "pct": 5.7 }, { "label": "Finished high school", "pct": 18.5 }, { "label": "Some college, no degree", "pct": 21.8 }, { "label": "Associate's degree", "pct": 12.6 }, { "label": "Bachelor's degree", "pct": 32.5 }, { "label": "Master's degree", "pct": 6.3 }, { "label": "Doctorate or professional degree", "pct": 2.5 }] },
      "pay": { "starting": "$35,770", "typical": "$53,350", "top": "$99,560", "note": "Of the biggest employers, manufacturing pays these techs the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +300 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "geoscientist": {
    "slug": "geoscientist",
    "title": "Geoscientist",
    "world": "Science & Research",
    "photo": "/images/app/browse/geoscientist.webp",
    "summary": "Studies the earth's rocks, soil and water to find resources and keep people safe.",
    "scenario": "Imagine standing on a hillside after a storm, checking whether the ground will hold. Your map tells a town where it is safe to build.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$101,920/year" },
      { "label": "People doing it", "value": "25,400" },
      { "label": "Jobs open each year", "value": "1,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$72K" }], "best": [{ "state": "Texas", "pay": "$160K" }, { "state": "Massachusetts", "pay": "$134K" }, { "state": "Colorado", "pay": "$132K" }] },
    "knowAbout": ["Geography and the earth", "Math", "Chemistry", "Clear writing", "Physics"],
    "goodAt": ["Reading reports closely", "Using science to solve problems", "Thinking through hard problems", "Explaining what you found", "Making good calls"],
    "software": ["Esri ArcGIS", "MATLAB", "Geosoft Oasis montaj", "RockWare RockWorks", "Python"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Geologist", "pay": "$59K", "description": "You do field work and lab tests while a senior geoscientist leads the project.", "whatYouDo": ["Collect samples", "Log field data", "Run lab tests", "Draw basic maps"], "toGetHere": ["Bachelor's in geoscience"] },
      { "number": "2", "jobTitle": "Geoscientist", "pay": "$102K", "description": "You plan field studies, read the data and map what lies underground.", "whatYouDo": ["Plan field studies", "Analyze data", "Make geologic maps", "Write reports"], "toGetHere": ["Bachelor's degree", "State license"] },
      { "number": "3", "jobTitle": "Senior Geoscientist", "pay": "$139K", "description": "You lead big projects and advise on where to drill, dig or build.", "whatYouDo": ["Lead projects", "Advise clients", "Review others' work", "Manage budgets"], "toGetHere": ["Years of experience", "A master's helps"] }
    ],
    "education": { "studies": [{ "name": "Geology/Earth Science, General" }, { "name": "Geophysics and Seismology" }, { "name": "Geochemistry" }, { "name": "Environmental Geosciences" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's in geoscience is the usual way in. Some employers prefer a master's, and most geoscientists need a state license.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 44.9 }, { "label": "Master's degree", "pct": 40.6 }, { "label": "Doctorate or professional degree", "pct": 14.5 }] },
      "pay": { "starting": "$59,330", "typical": "$101,920", "top": "$200,230", "note": "Of the biggest employers, mining and oil and gas companies pay geoscientists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,300 by 2035. It is growing faster than most jobs." }
    }
  },
  // OEWS released no 19-3093 wage for South Dakota, so there is no yourStates
  // row.
  "historian": {
    "slug": "historian",
    "title": "Historian",
    "world": "Science & Research",
    "photo": "/images/app/browse/historian.webp",
    "summary": "Researches the past using letters, records and objects, and shares what it means today.",
    "scenario": "Imagine finding a box of old letters in a city archive. You piece together a story no one has told in 100 years.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$76,750/year" },
      { "label": "People doing it", "value": "3,800" },
      { "label": "Jobs open each year", "value": "300" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Maryland", "pay": "$116K" }, { "state": "District of Columbia", "pay": "$113K" }, { "state": "Massachusetts", "pay": "$112K" }] },
    "knowAbout": ["History", "Clear writing", "Cultures and people", "Geography", "Teaching and explaining"],
    "goodAt": ["Reading closely", "Thinking through hard questions", "Writing clearly", "Learning new things fast", "Checking facts"],
    "software": ["Esri ArcGIS", "Adobe InDesign", "Adobe Photoshop", "IBM SPSS Statistics", "Microsoft Access"],
    "ladder": [
      { "number": "1", "jobTitle": "Research Assistant", "pay": "$43K", "description": "You dig through archives and check facts for senior historians.", "whatYouDo": ["Search archives", "Scan records", "Check facts", "Take notes"], "toGetHere": ["Bachelor's in history"] },
      { "number": "2", "jobTitle": "Historian", "pay": "$77K", "description": "You research the past and turn it into reports, books or exhibits.", "whatYouDo": ["Study old records", "Judge if sources are real", "Write reports", "Build exhibits"], "toGetHere": ["Master's degree", "Research skills"] },
      { "number": "3", "jobTitle": "Senior Historian", "pay": "$100K", "description": "You lead big research projects and guide a team.", "whatYouDo": ["Lead projects", "Review others' work", "Advise museums and agencies", "Present findings"], "toGetHere": ["Years of research", "A Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "History, General" }, { "name": "Public/Applied History" }, { "name": "Historic Preservation and Conservation, General" }, { "name": "American History (United States)" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Master's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Most historians have a master's or Ph.D. A bachelor's in history can open some entry jobs, and internships help.", "noBachelorPct": "10%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 3.8 }, { "label": "Some college, no degree", "pct": 3.9 }, { "label": "Associate's degree", "pct": 2.1 }, { "label": "Bachelor's degree", "pct": 33.4 }, { "label": "Master's degree", "pct": 37.6 }, { "label": "Doctorate or professional degree", "pct": 19.2 }] },
      "pay": { "starting": "$42,730", "typical": "$76,750", "top": "$131,810", "note": "Of the biggest employers, the federal government pays historians the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +100 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "medical-scientist": {
    "slug": "medical-scientist",
    "title": "Medical Scientist",
    "world": "Science & Research",
    "photo": "/images/app/browse/medical-scientist.webp",
    "summary": "Runs research to understand diseases and find new ways to treat them.",
    "scenario": "Imagine testing a new treatment on cells in your lab. If it works, it could help millions of patients one day.",
    "facts": [
      { "label": "Typical degree", "value": "Doctoral or professional degree" },
      { "label": "Typical pay", "value": "$103,410/year" },
      { "label": "People doing it", "value": "181,000" },
      { "label": "Jobs open each year", "value": "10,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$84K" }], "best": [{ "state": "California", "pay": "$140K" }, { "state": "New Jersey", "pay": "$138K" }, { "state": "Massachusetts", "pay": "$134K" }] },
    "knowAbout": ["Biology", "Clear writing", "Medicine and disease", "Chemistry", "Math"],
    "goodAt": ["Writing clearly", "Learning new methods fast", "Using science to solve problems", "Explaining your results", "Thinking through hard problems"],
    "software": ["SAS", "IBM SPSS Statistics", "Python", "R", "National Instruments LabVIEW"],
    "ladder": [
      { "number": "1", "jobTitle": "Postdoctoral Researcher", "pay": "$65K", "description": "You run studies in a senior scientist's lab and publish your first papers.", "whatYouDo": ["Run experiments", "Test cell samples", "Analyze data", "Write papers"], "toGetHere": ["Ph.D. or medical degree"] },
      { "number": "2", "jobTitle": "Medical Scientist", "pay": "$103K", "description": "You plan and run studies on diseases and treatments.", "whatYouDo": ["Design studies", "Test treatments", "Analyze results", "Write grants"], "toGetHere": ["Ph.D. or medical degree", "Research experience"] },
      { "number": "3", "jobTitle": "Principal Investigator", "pay": "$139K", "description": "You lead your own lab, win funding and guide a research team.", "whatYouDo": ["Lead a lab", "Win grants", "Guide researchers", "Publish findings"], "toGetHere": ["Years of research", "A strong record of papers"] }
    ],
    "education": { "studies": [{ "name": "Biomedical Sciences, General" }, { "name": "Molecular Biology" }, { "name": "Immunology" }, { "name": "Human/Medical Genetics" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Doctoral or professional degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Most medical scientists have a Ph.D., usually in biology or a related science. Some earn a medical degree instead of, or along with, a Ph.D.", "noBachelorPct": "3%", "distribution": [{ "label": "Did not finish high school", "pct": 1.0 }, { "label": "Finished high school", "pct": 0.9 }, { "label": "Some college, no degree", "pct": 0.6 }, { "label": "Associate's degree", "pct": 0.6 }, { "label": "Bachelor's degree", "pct": 30.1 }, { "label": "Master's degree", "pct": 25.1 }, { "label": "Doctorate or professional degree", "pct": 41.7 }] },
      "pay": { "starting": "$64,800", "typical": "$103,410", "top": "$177,780", "note": "Of the biggest employers, research and development companies pay medical scientists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +22,700 by 2035. It is growing much faster than most jobs." }
    }
  },
  // BLS counts meteorologists as Atmospheric and Space Scientists (19-2021), the
  // group its OOH page calls Atmospheric Scientists, Including Meteorologists.
  "meteorologist": {
    "slug": "meteorologist",
    "title": "Meteorologist",
    "world": "Science & Research",
    "photo": "/images/app/browse/meteorologist.webp",
    "summary": "Studies the air and weather to make forecasts and warn people about storms.",
    "scenario": "Imagine a storm forming over the ocean with millions of people in its path. Your forecast tells them when to get ready.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$99,070/year" },
      { "label": "People doing it", "value": "10,700" },
      { "label": "Jobs open each year", "value": "800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$89K" }], "best": [{ "state": "New York", "pay": "$155K" }, { "state": "Illinois", "pay": "$148K" }, { "state": "District of Columbia", "pay": "$143K" }] },
    "knowAbout": ["Math", "Physics", "Geography and the earth", "Computers", "Clear writing"],
    "goodAt": ["Reading data closely", "Learning new tools fast", "Thinking through hard problems", "Making quick, clear calls", "Explaining weather in plain words"],
    "software": ["Python", "HURRTRAK", "ITT ENVI", "Linux", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Meteorologist Trainee", "pay": "$53K", "description": "You read weather data and help build forecasts while a senior forecaster guides you.", "whatYouDo": ["Gather weather data", "Read radar and satellite images", "Draft forecasts", "Log conditions"], "toGetHere": ["Bachelor's in meteorology"] },
      { "number": "2", "jobTitle": "Meteorologist", "pay": "$99K", "description": "You make forecasts and warn the public about storms.", "whatYouDo": ["Build forecasts", "Run weather models", "Issue warnings", "Brief clients or viewers"], "toGetHere": ["Bachelor's degree", "Internship experience helps"] },
      { "number": "3", "jobTitle": "Lead Forecaster", "pay": "$130K", "description": "You lead a forecast team and make the final call on warnings.", "whatYouDo": ["Lead a forecast team", "Make the final call", "Train new forecasters", "Improve forecast tools"], "toGetHere": ["Years of forecasting", "A master's helps"] }
    ],
    "education": { "studies": [{ "name": "Meteorology" }, { "name": "Atmospheric Sciences and Meteorology, General" }, { "name": "Climate Science" }, { "name": "Atmospheric Physics and Dynamics" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS counts meteorologists as atmospheric and space scientists (SOC 19-2021), so pay and job figures are for that occupation.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's in meteorology or a related science is the usual way in. Research jobs ask for a master's or Ph.D., and internships help.", "noBachelorPct": "7%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 2.9 }, { "label": "Some college, no degree", "pct": 1.3 }, { "label": "Associate's degree", "pct": 2.6 }, { "label": "Bachelor's degree", "pct": 44.7 }, { "label": "Master's degree", "pct": 37.0 }, { "label": "Doctorate or professional degree", "pct": 11.4 }] },
      "pay": { "starting": "$53,060", "typical": "$99,070", "top": "$161,890", "note": "Of the biggest employers, research and development companies pay atmospheric scientists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +300 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "microbiologist": {
    "slug": "microbiologist",
    "title": "Microbiologist",
    "world": "Science & Research",
    "photo": "/images/app/browse/microbiologist.webp",
    "summary": "Studies bacteria, viruses and other tiny living things that you can only see with a microscope.",
    "scenario": "Imagine a batch of food may carry a germ that makes people sick. You grow the sample in your lab and find out before it reaches a single store.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$87,990/year" },
      { "label": "People doing it", "value": "20,100" },
      { "label": "Jobs open each year", "value": "1,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$76K" }], "best": [{ "state": "Massachusetts", "pay": "$120K" }, { "state": "Maryland", "pay": "$115K" }, { "state": "California", "pay": "$115K" }] },
    "knowAbout": ["Biology", "Chemistry", "Clear writing", "Computers", "Math"],
    "goodAt": ["Using science to solve problems", "Reading lab methods closely", "Thinking through hard problems", "Writing clear reports", "Learning new methods fast"],
    "software": ["BD CellQuest", "WHONET", "Orchard Harvest LIS", "SAP", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Microbiologist", "pay": "$55K", "description": "You grow cultures and run set tests while a senior scientist checks your work.", "whatYouDo": ["Grow cultures", "Run lab tests", "Use microscopes", "Record results"], "toGetHere": ["Bachelor's in microbiology or biology"] },
      { "number": "2", "jobTitle": "Microbiologist", "pay": "$88K", "description": "You study germs, test samples and report what you find.", "whatYouDo": ["Identify microbes", "Test food and water", "Run studies", "Write reports"], "toGetHere": ["Bachelor's degree", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Microbiologist", "pay": "$122K", "description": "You lead research projects and guide lab techs and scientists.", "whatYouDo": ["Lead projects", "Guide lab staff", "Plan studies", "Advise health teams"], "toGetHere": ["Years of lab work", "A master's or Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "Microbiology, General" }, { "name": "Microbiology and Immunology" }, { "name": "Virology" }, { "name": "Immunology" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's in microbiology or a related field like biology is the usual way in. Some employers prefer a master's or Ph.D.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 46.2 }, { "label": "Master's degree", "pct": 31.9 }, { "label": "Doctorate or professional degree", "pct": 21.9 }] },
      "pay": { "starting": "$54,670", "typical": "$87,990", "top": "$150,000", "note": "Of the biggest employers, government pays microbiologists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,300 by 2035. It is growing faster than most jobs." }
    }
  },
  // BLS has no separate molecular biologist occupation. O*NET files Molecular
  // and Cellular Biologists (19-1029.02) under Biological Scientists, All Other
  // (19-1029), so every BLS figure here is for that whole group; tasks, skills
  // and software follow O*NET 19-1029.02. Table 5.3 pools 19-1029 with other
  // biological scientists. Same BLS figures as Geneticist for that reason.
  "molecular-biologist": {
    "slug": "molecular-biologist",
    "title": "Molecular Biologist",
    "world": "Science & Research",
    "photo": "/images/app/browse/molecular-biologist.webp",
    "summary": "Studies the tiny parts inside cells, like DNA and proteins, to learn how life works.",
    "scenario": "Imagine looking at how one protein turns a cell on and off. What you find could point the way to a new medicine.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$98,920/year" },
      { "label": "People doing it", "value": "59,600" },
      { "label": "Jobs open each year", "value": "4,300" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$76K" }], "best": [{ "state": "Maryland", "pay": "$126K" }, { "state": "California", "pay": "$124K" }, { "state": "Massachusetts", "pay": "$123K" }] },
    "knowAbout": ["Biology", "Clear writing", "Chemistry", "Math", "Teaching and explaining"],
    "goodAt": ["Using science to solve problems", "Reading research closely", "Writing clearly", "Thinking through hard problems", "Explaining your results"],
    "software": ["Python", "R", "Git", "Adobe Illustrator", "Minitab"],
    "ladder": [
      { "number": "1", "jobTitle": "Research Associate", "pay": "$60K", "description": "You run lab procedures and keep records while a senior scientist leads the work.", "whatYouDo": ["Run DNA tests", "Clone genes", "Keep lab records", "Prepare samples"], "toGetHere": ["Bachelor's in biology"] },
      { "number": "2", "jobTitle": "Molecular Biologist", "pay": "$99K", "description": "You design experiments on cells and genes and read the results.", "whatYouDo": ["Design experiments", "Study cell data", "Write papers", "Present findings"], "toGetHere": ["Graduate degree", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Scientist", "pay": "$128K", "description": "You lead a lab team, win grants and guide younger scientists.", "whatYouDo": ["Lead a lab team", "Write grants", "Teach students", "Plan research"], "toGetHere": ["Ph.D.", "Years of research"] }
    ],
    "education": { "studies": [{ "name": "Molecular Biology" }, { "name": "Cell/Cellular and Molecular Biology" }, { "name": "Biochemistry and Molecular Biology" }, { "name": "Molecular Genetics" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no separate molecular biologist occupation, so pay and job figures are for biological scientists, all other (SOC 19-1029), the group O*NET files molecular and cellular biologists under.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "BLS and O*NET both list a bachelor's as the usual way in. More than half of the workers in this group have a master's or doctorate.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 46.2 }, { "label": "Master's degree", "pct": 31.9 }, { "label": "Doctorate or professional degree", "pct": 21.9 }] },
      "pay": { "starting": "$60,430", "typical": "$98,920", "top": "$168,010", "note": "BLS counts molecular biologists inside the larger group of biological scientists, all other, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +2,800 by 2035. It is growing faster than most jobs." }
    }
  },
  // The OOH page also covers astronomers, so every Physicist figure is for
  // 19-2012 alone: table 1.2 for people and openings, OEWS May 2025 for pay.
  "physicist": {
    "slug": "physicist",
    "title": "Physicist",
    "world": "Science & Research",
    "photo": "/images/app/browse/physicist.webp",
    "summary": "Studies how matter and energy work, from tiny atoms to the whole universe.",
    "scenario": "Imagine aiming a laser at a single atom to see how it moves. Your math explains something no one could measure before.",
    "facts": [
      { "label": "Typical degree", "value": "Doctoral or professional degree" },
      { "label": "Typical pay", "value": "$172,250/year" },
      { "label": "People doing it", "value": "23,200" },
      { "label": "Jobs open each year", "value": "1,300" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$108K" }], "best": [{ "state": "Florida", "pay": "$220K" }, { "state": "New Hampshire", "pay": "$209K" }, { "state": "Oregon", "pay": "$207K" }] },
    "knowAbout": ["Physics", "Math", "Computers", "How things get engineered and built", "Clear writing"],
    "goodAt": ["Using science to solve problems", "Advanced math", "Thinking through hard problems", "Writing code", "Learning new methods fast"],
    "software": ["MATLAB", "Wolfram Mathematica", "COMSOL Multiphysics", "Python", "Linux"],
    "ladder": [
      { "number": "1", "jobTitle": "Postdoctoral Researcher", "pay": "$82K", "description": "You run experiments in a senior physicist's lab and publish your first papers.", "whatYouDo": ["Run experiments", "Write simulations", "Analyze data", "Write papers"], "toGetHere": ["Ph.D. in physics"] },
      { "number": "2", "jobTitle": "Physicist", "pay": "$172K", "description": "You design experiments and use math and code to explain what you see.", "whatYouDo": ["Design experiments", "Build computer models", "Analyze data", "Write research proposals"], "toGetHere": ["Ph.D.", "Research experience"] },
      { "number": "3", "jobTitle": "Senior Physicist", "pay": "$223K", "description": "You lead research teams and big projects in labs, companies or government.", "whatYouDo": ["Lead research", "Win funding", "Guide younger scientists", "Present findings"], "toGetHere": ["Years of research", "A strong record of papers"] }
    ],
    "education": { "studies": [{ "name": "Physics, General" }, { "name": "Engineering Physics/Applied Physics" }, { "name": "Astrophysics" }, { "name": "Optics/Optical Sciences" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Doctoral or professional degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Research and college jobs usually need a Ph.D. in physics. Many federal government physicist jobs start with a bachelor's.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 23.4 }, { "label": "Master's degree", "pct": 24.8 }, { "label": "Doctorate or professional degree", "pct": 51.8 }] },
      "pay": { "starting": "$82,110", "typical": "$172,250", "top": "$274,110", "note": "Of the biggest employers, healthcare services pay physicists the most." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,700 by 2035. It is growing much faster than most jobs." }
    }
  },
  // BLS groups psychologists (19-3030) into clinical and counseling, school, and
  // all other. School Psychologist has its own entry, so every BLS figure here
  // is for Clinical and Counseling Psychologists (19-3033) alone, the largest
  // line item: table 1.2, OEWS, table 5.3; tasks, skills and software follow
  // O*NET 19-3033.00.
  "psychologist": {
    "slug": "psychologist",
    "title": "Psychologist",
    "world": "Science & Research",
    "photo": "/images/app/browse/psychologist.webp",
    "summary": "Helps people understand their thoughts, feelings and actions, and treats mental health problems.",
    "scenario": "Imagine a teen who has felt anxious for months walks into your office. Week by week, you help them build the tools to feel like themselves again.",
    "facts": [
      { "label": "Typical degree", "value": "Doctoral or professional degree" },
      { "label": "Typical pay", "value": "$100,580/year" },
      { "label": "People doing it", "value": "81,300" },
      { "label": "Jobs open each year", "value": "4,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$89K" }], "best": [{ "state": "Washington", "pay": "$138K" }, { "state": "New Jersey", "pay": "$132K" }, { "state": "Oregon", "pay": "$130K" }] },
    "knowAbout": ["Psychology", "Therapy and counseling", "Clear writing", "Teaching and explaining", "Caring for people"],
    "goodAt": ["Listening closely", "Reading how people feel", "Thinking through hard choices", "Writing clear notes", "Explaining things kindly"],
    "software": ["eClinicalWorks", "Thriveworks TherapyBuddy", "Zoom", "Microsoft Teams", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "New Psychologist", "pay": "$55K", "description": "You see clients under a licensed psychologist while you finish your license hours.", "whatYouDo": ["Assess clients", "Lead sessions", "Write session notes", "Meet with your supervisor"], "toGetHere": ["Ph.D. or Psy.D.", "Internship"] },
      { "number": "2", "jobTitle": "Licensed Psychologist", "pay": "$101K", "description": "You diagnose and treat clients on your own.", "whatYouDo": ["Diagnose disorders", "Lead therapy", "Make treatment plans", "Track progress"], "toGetHere": ["State license", "Supervised hours"] },
      { "number": "3", "jobTitle": "Senior Psychologist", "pay": "$135K", "description": "You take harder cases, focus on a specialty and train new psychologists.", "whatYouDo": ["Treat complex cases", "Focus on a specialty", "Supervise trainees", "Run a practice or program"], "toGetHere": ["Years of practice", "Training in a specialty"] }
    ],
    "education": { "studies": [{ "name": "Clinical Psychology" }, { "name": "Counseling Psychology" }, { "name": "Psychology, General" }, { "name": "Clinical Child Psychology" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. Figures are for clinical and counseling psychologists (SOC 19-3033), the largest group in the BLS psychologists occupation.",
    "factDetails": {
      "degree": { "doorAsksFor": "Doctoral or professional degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Internship or residency", "note": "Clinical and counseling psychologists usually need a Ph.D. or Psy.D. in psychology, an internship and a state license.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 5.9 }, { "label": "Master's degree", "pct": 12.8 }, { "label": "Doctorate or professional degree", "pct": 81.3 }] },
      "pay": { "starting": "$55,170", "typical": "$100,580", "top": "$180,960", "note": "These figures are for clinical and counseling psychologists, the biggest group of psychologists." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +9,500 by 2035. It is growing much faster than most jobs." }
    }
  },
  // BLS has no separate quality control analyst occupation. O*NET files Quality
  // Control Analysts (19-4099.01) under Life, Physical, and Social Science
  // Technicians, All Other (19-4099), so every BLS figure here is for that whole
  // group; tasks, skills and software follow O*NET 19-4099.01. Table 5.3 pools
  // 19-4099 with other science technicians.
  "quality-control-analyst": {
    "slug": "quality-control-analyst",
    "title": "Quality Control Analyst",
    "world": "Science & Research",
    "photo": "/images/app/browse/quality-control-analyst.webp",
    "summary": "Tests materials and products in a lab to make sure they meet quality and safety rules.",
    "scenario": "Imagine a batch of medicine is ready to ship. You run the last tests and give the green light that it is safe.",
    "facts": [
      { "label": "Typical degree", "value": "Associate's degree" },
      { "label": "Typical pay", "value": "$62,280/year" },
      { "label": "People doing it", "value": "89,500" },
      { "label": "Jobs open each year", "value": "11,200" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$58K" }], "best": [{ "state": "Oklahoma", "pay": "$91K" }, { "state": "Georgia", "pay": "$84K" }, { "state": "District of Columbia", "pay": "$80K" }] },
    "knowAbout": ["Math", "How products get made", "Chemistry", "Clear writing", "Computers"],
    "goodAt": ["Checking quality", "Keeping an eye on results", "Reading methods closely", "Spotting what does not add up", "Solving tricky problems"],
    "software": ["LabWare LIMS", "Sparta Systems TrackWise", "Minitab", "SAP", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "QC Lab Technician", "pay": "$39K", "description": "You run routine tests and log results while a senior analyst checks your work.", "whatYouDo": ["Run routine tests", "Log results", "Clean lab tools", "Inspect products"], "toGetHere": ["Associate's degree or lab training"] },
      { "number": "2", "jobTitle": "Quality Control Analyst", "pay": "$62K", "description": "You test materials, compare results to the specs and flag anything off.", "whatYouDo": ["Test samples", "Compare results to specs", "Calibrate equipment", "Write reports"], "toGetHere": ["Associate's degree", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior QC Analyst", "pay": "$80K", "description": "You lead tests on new products and train newer analysts.", "whatYouDo": ["Lead complex tests", "Check others' data", "Train new analysts", "Improve test methods"], "toGetHere": ["Years in a QC lab", "A bachelor's helps"] }
    ],
    "education": { "studies": [{ "name": "Science Technologies/Technicians, General" }, { "name": "Chemical Process Technology" }, { "name": "Materials Science" }], "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no separate quality control analyst occupation, so pay and job figures are for life, physical, and social science technicians, all other (SOC 19-4099), the group O*NET files quality control analysts under.",
    "factDetails": {
      "degree": { "doorAsksFor": "Associate's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "BLS lists an associate's degree for this group. About half of its workers have a bachelor's or higher.", "noBachelorPct": "48%", "distribution": [{ "label": "Did not finish high school", "pct": 3.3 }, { "label": "Finished high school", "pct": 14.4 }, { "label": "Some college, no degree", "pct": 17.6 }, { "label": "Associate's degree", "pct": 13.1 }, { "label": "Bachelor's degree", "pct": 30.8 }, { "label": "Master's degree", "pct": 12.9 }, { "label": "Doctorate or professional degree", "pct": 7.8 }] },
      "pay": { "starting": "$39,000", "typical": "$62,280", "top": "$102,690", "note": "BLS counts quality control analysts inside the larger group of life, physical and social science technicians, all other, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +3,900 by 2035. It is growing about as fast as most jobs." }
    }
  },
  // The OOH page covers all psychologists, so every BLS figure here is for
  // School Psychologists (19-3034) alone: table 1.2, OEWS, table 5.3.
  "school-psychologist": {
    "slug": "school-psychologist",
    "title": "School Psychologist",
    "world": "Science & Research",
    "photo": "/images/app/browse/school-psychologist.webp",
    "summary": "Helps students do well in school by working on learning, behavior and mental health.",
    "scenario": "Imagine a third grader who struggles to read no matter how hard she tries. You test her, find out why and build a plan with her teachers.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$95,990/year" },
      { "label": "People doing it", "value": "64,000" },
      { "label": "Jobs open each year", "value": "3,400" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$83K" }], "best": [{ "state": "California", "pay": "$128K" }, { "state": "Colorado", "pay": "$124K" }, { "state": "New Mexico", "pay": "$116K" }] },
    "knowAbout": ["Psychology", "Therapy and counseling", "Teaching and learning", "Clear writing", "School laws and rules"],
    "goodAt": ["Listening closely", "Reading how kids feel", "Thinking through hard choices", "Explaining test results to parents", "Writing clear reports"],
    "software": ["PowerSchool SIS", "IEP Direct", "Test scoring software", "Zoom", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "New School Psychologist", "pay": "$63K", "description": "You test students and join planning meetings while a senior psychologist guides you.", "whatYouDo": ["Give tests", "Score results", "Observe classes", "Write reports"], "toGetHere": ["Graduate degree in school psychology", "Internship"] },
      { "number": "2", "jobTitle": "School Psychologist", "pay": "$96K", "description": "You assess students, plan support with teachers and counsel kids and families.", "whatYouDo": ["Assess students", "Plan support", "Counsel students", "Meet with parents"], "toGetHere": ["State license or certificate", "Supervised hours"] },
      { "number": "3", "jobTitle": "Lead School Psychologist", "pay": "$120K", "description": "You guide a team across schools and help shape district programs.", "whatYouDo": ["Lead a team", "Shape programs", "Train new staff", "Review hard cases"], "toGetHere": ["Years in schools", "A doctorate helps"] }
    ],
    "education": { "studies": [{ "name": "School Psychology" }, { "name": "Educational Psychology" }], "where": [{ "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Master's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Internship or residency", "note": "School psychologists earn a graduate degree in school psychology, finish an internship and get a state license or certificate.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 8.9 }, { "label": "Master's degree", "pct": 56.4 }, { "label": "Doctorate or professional degree", "pct": 34.7 }] },
      "pay": { "starting": "$63,070", "typical": "$95,990", "top": "$142,330", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +500 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  // BLS counts academic advisors in Educational, Guidance, and Career Counselors
  // and Advisors (21-1012), the OOH's School and Career Counselors and Advisors,
  // which also covers school counselors; O*NET 21-1012.00 lists Academic Advisor
  // as a reported title. Every BLS figure here is for that whole group.
  "academic-advisor": {
    "slug": "academic-advisor",
    "title": "Academic Advisor",
    "world": "Teaching & Education",
    "photo": "/images/app/browse/academic-advisor.webp",
    "summary": "Helps college students pick classes, stay on track and plan for what comes after graduation.",
    "scenario": "Imagine a first-year student who is not sure what to major in. You look at their interests, map out their classes and help them find a path.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$64,330/year" },
      { "label": "People doing it", "value": "389,500" },
      { "label": "Jobs open each year", "value": "27,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$54K" }], "best": [{ "state": "California", "pay": "$94K" }, { "state": "Washington", "pay": "$88K" }, { "state": "Massachusetts", "pay": "$86K" }] },
    "knowAbout": ["Helping people", "Clear writing", "Counseling", "Teaching and learning", "Psychology"],
    "goodAt": ["Listening closely", "Reading how people feel", "Explaining options clearly", "Helping people", "Solving tricky problems"],
    "software": ["Focus 2 (career planning)", "ACT WorkKeys", "Oracle PeopleSoft", "Moodle", "Google Classroom"],
    "ladder": [
      { "number": "1", "jobTitle": "Advising Assistant", "pay": "$45K", "description": "You help students with schedules and forms while senior advisors guide you.", "whatYouDo": ["Answer student questions", "Check class schedules", "Update records", "Set up meetings"], "toGetHere": ["Bachelor's degree"] },
      { "number": "2", "jobTitle": "Academic Advisor", "pay": "$64K", "description": "You meet with students, plan their classes and track their progress.", "whatYouDo": ["Plan class schedules", "Check graduation needs", "Refer students to help", "Track progress"], "toGetHere": ["Bachelor's degree", "A master's for many jobs"] },
      { "number": "3", "jobTitle": "Senior Academic Advisor", "pay": "$83K", "description": "You take the hardest cases, train new advisors and help run the office.", "whatYouDo": ["Handle tough cases", "Train new advisors", "Plan programs", "Work with faculty"], "toGetHere": ["Years of advising", "Master's degree"] }
    ],
    "education": { "studies": [{ "name": "College Student Counseling and Personnel Services" }, { "name": "Counselor Education/School Counseling and Guidance Services" }, { "name": "Student Counseling and Personnel Services, Other" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS counts academic advisors with school and career counselors (SOC 21-1012), so pay and job figures are for that whole group.",
    "factDetails": {
      "degree": { "doorAsksFor": "Master's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "BLS lists a master's for this group, which includes school counselors. O*NET says some advising jobs ask for a bachelor's.", "noBachelorPct": "12%", "distribution": [{ "label": "Did not finish high school", "pct": 0.9 }, { "label": "Finished high school", "pct": 4.5 }, { "label": "Some college, no degree", "pct": 4.2 }, { "label": "Associate's degree", "pct": 2.7 }, { "label": "Bachelor's degree", "pct": 22.8 }, { "label": "Master's degree", "pct": 60.3 }, { "label": "Doctorate or professional degree", "pct": 4.6 }] },
      "pay": { "starting": "$45,020", "typical": "$64,330", "top": "$104,770", "note": "BLS counts academic advisors with school and career counselors, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +11,400 by 2035. It is growing about as fast as most jobs." }
    }
  },
  // BLS has no separate adapted PE teacher occupation. O*NET files Adapted
  // Physical Education Specialists (25-2059.01) under Special Education
  // Teachers, All Other (25-2059), so every BLS figure here is for that whole
  // group (table 1.2, not the OOH page, which covers all special education
  // teachers); tasks, skills and software follow O*NET 25-2059.01. OEWS released
  // no 25-2059 wage for South Dakota, so there is no yourStates row.
  "adapted-pe-teacher": {
    "slug": "adapted-pe-teacher",
    "title": "Adapted PE Teacher",
    "world": "Teaching & Education",
    "photo": "/images/app/browse/adapted-pe-teacher.webp",
    "summary": "Teaches physical education to students with disabilities, changing games and drills so every kid can play.",
    "scenario": "Imagine a student in a wheelchair who has never played basketball. You change the game so they score their first basket with the whole class cheering.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$76,580/year" },
      { "label": "People doing it", "value": "34,800" },
      { "label": "Jobs open each year", "value": "2,300" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "California", "pay": "$101K" }, { "state": "New Mexico", "pay": "$94K" }, { "state": "Oregon", "pay": "$86K" }] },
    "knowAbout": ["Teaching and training", "Psychology", "Clear writing", "School laws and rules", "Safety"],
    "goodAt": ["Listening closely", "Teaching in new ways", "Reading how students feel", "Keeping kids safe", "Working with a team"],
    "software": ["IEP software", "Student record software", "Microsoft Excel", "Microsoft PowerPoint", "Microsoft Outlook"],
    "ladder": [
      { "number": "1", "jobTitle": "New Adapted PE Teacher", "pay": "$48K", "description": "You teach your own classes while a mentor teacher helps you plan.", "whatYouDo": ["Teach PE classes", "Adapt games", "Track progress", "Join IEP meetings"], "toGetHere": ["Bachelor's degree", "State teaching license"] },
      { "number": "2", "jobTitle": "Adapted PE Teacher", "pay": "$77K", "description": "You test each student's motor skills and build a plan that fits them.", "whatYouDo": ["Test motor skills", "Plan lessons", "Adapt equipment", "Write progress reports"], "toGetHere": ["Teaching license", "Classroom experience"] },
      { "number": "3", "jobTitle": "Adapted PE Consultant", "pay": "$100K", "description": "You support teachers across a district and lead adapted PE programs.", "whatYouDo": ["Coach other teachers", "Lead programs", "Plan inclusive events", "Review student plans"], "toGetHere": ["Years of teaching", "A master's or APE certification helps"] }
    ],
    "education": { "studies": [{ "name": "Special Education and Teaching, General" }, { "name": "Education/Teaching of Individuals with Orthopedic and Other Physical Health Impairments" }, { "name": "Education/Teaching of Individuals with Multiple Disabilities" }, { "name": "Education/Teaching of Individuals with Autism" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no separate adapted PE teacher occupation, so pay and job figures are for special education teachers, all other (SOC 25-2059), the group O*NET files adapted physical education specialists under.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Public school teachers need a bachelor's degree and a state teaching license. About half of the workers in this group have a master's.", "noBachelorPct": "10%", "distribution": [{ "label": "Did not finish high school", "pct": 0.9 }, { "label": "Finished high school", "pct": 3.2 }, { "label": "Some college, no degree", "pct": 3.2 }, { "label": "Associate's degree", "pct": 2.5 }, { "label": "Bachelor's degree", "pct": 34.6 }, { "label": "Master's degree", "pct": 51.0 }, { "label": "Doctorate or professional degree", "pct": 4.5 }] },
      "pay": { "starting": "$48,440", "typical": "$76,580", "top": "$120,080", "note": "BLS counts adapted PE teachers inside the larger group of special education teachers, all other, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +700 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  // BLS covers admissions staff in Postsecondary Education Administrators
  // (11-9033); its OOH page has an admissions section and O*NET 11-9033.00 lists
  // Admissions Director as a reported title. Every BLS figure here is for that
  // whole group, which also includes deans, provosts and registrars.
  "admissions-officer": {
    "slug": "admissions-officer",
    "title": "Admissions Officer",
    "world": "Teaching & Education",
    "photo": "/images/app/browse/admissions-officer.webp",
    "summary": "Reviews college applications and helps decide which students get in.",
    "scenario": "Imagine a stack of 500 applications on your desk, each with a story. You read every one and help build next year's class.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$104,590/year" },
      { "label": "People doing it", "value": "231,800" },
      { "label": "Jobs open each year", "value": "14,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$139K" }], "best": [{ "state": "New York", "pay": "$163K" }, { "state": "Delaware", "pay": "$154K" }, { "state": "New Jersey", "pay": "$148K" }] },
    "knowAbout": ["Clear writing", "Running an office", "Teaching and learning", "Helping people", "Hiring and managing people"],
    "goodAt": ["Thinking through hard choices", "Reading closely", "Listening closely", "Managing your time", "Making fair calls"],
    "software": ["Ellucian Degree Works", "Banner student records", "Oracle PeopleSoft", "Instructure Canvas", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Admissions Counselor", "pay": "$65K", "description": "You visit high schools, answer questions and read your first applications.", "whatYouDo": ["Visit high schools", "Lead campus tours", "Answer questions", "Read applications"], "toGetHere": ["Bachelor's degree"] },
      { "number": "2", "jobTitle": "Admissions Officer", "pay": "$105K", "description": "You review applications, help pick the class and plan recruiting.", "whatYouDo": ["Review applications", "Help pick the class", "Plan recruiting", "Track the numbers"], "toGetHere": ["Years in an admissions office", "A master's helps"] },
      { "number": "3", "jobTitle": "Director of Admissions", "pay": "$144K", "description": "You lead the admissions team and set the plan for each year's class.", "whatYouDo": ["Lead the team", "Set enrollment goals", "Manage the budget", "Report to college leaders"], "toGetHere": ["Years of experience", "Master's degree"] }
    ],
    "education": { "studies": [{ "name": "Higher Education/Higher Education Administration" }, { "name": "Educational Leadership and Administration, General" }, { "name": "Community College Administration" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS counts admissions officers with all postsecondary education administrators (SOC 11-9033), so pay and job figures are for that whole group.",
    "factDetails": {
      "degree": { "doorAsksFor": "Master's degree", "experienceFirst": "Yes. Usually less than 5 years in a college office", "trainingAfterHiring": "None required", "note": "BLS lists a master's for college administrators. Small colleges may hire with a bachelor's, and work in an admissions office helps.", "noBachelorPct": "18%", "distribution": [{ "label": "Did not finish high school", "pct": 1.0 }, { "label": "Finished high school", "pct": 5.2 }, { "label": "Some college, no degree", "pct": 7.2 }, { "label": "Associate's degree", "pct": 4.2 }, { "label": "Bachelor's degree", "pct": 24.3 }, { "label": "Master's degree", "pct": 44.2 }, { "label": "Doctorate or professional degree", "pct": 14.0 }] },
      "pay": { "starting": "$64,560", "typical": "$104,590", "top": "$215,620", "note": "BLS counts admissions officers with all college administrators, like deans and registrars, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +4,100 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  "adult-and-english-language-teacher": {
    "slug": "adult-and-english-language-teacher",
    "title": "Adult and English Language Teacher",
    "world": "Teaching & Education",
    "photo": "/images/app/browse/adult-and-english-language-teacher.webp",
    "summary": "Teaches adults to read, write and speak English, or to finish high school.",
    "scenario": "Imagine a student who moved here last year and could not order lunch in English. By spring, they ace a job interview you helped them practice.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$61,540/year" },
      { "label": "People doing it", "value": "41,100" },
      { "label": "Jobs open each year", "value": "3,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$45K" }], "best": [{ "state": "California", "pay": "$98K" }, { "state": "New York", "pay": "$87K" }, { "state": "Oregon", "pay": "$80K" }] },
    "knowAbout": ["English language", "Teaching and training", "Helping people", "Running a classroom"],
    "goodAt": ["Listening closely", "Teaching in new ways", "Reading how students feel", "Explaining things simply", "Being patient"],
    "software": ["Kahoot!", "Quizlet", "Edpuzzle", "Google Classroom", "Zoom"],
    "ladder": [
      { "number": "1", "jobTitle": "New ESL Instructor", "pay": "$42K", "description": "You teach small classes or tutor while a lead teacher helps you plan.", "whatYouDo": ["Tutor students", "Teach small classes", "Grade work", "Track progress"], "toGetHere": ["Bachelor's degree"] },
      { "number": "2", "jobTitle": "Adult Education and ESL Teacher", "pay": "$62K", "description": "You plan lessons and teach adults reading, writing, English or high school subjects.", "whatYouDo": ["Plan lessons", "Teach classes", "Test progress", "Help students set goals"], "toGetHere": ["Bachelor's degree", "A teaching license for public schools"] },
      { "number": "3", "jobTitle": "Lead Teacher or Program Coordinator", "pay": "$78K", "description": "You guide other teachers and help run the program.", "whatYouDo": ["Coach teachers", "Plan the program", "Place new students", "Work with community groups"], "toGetHere": ["Years of teaching", "A master's in adult education or ESL helps"] }
    ],
    "education": { "studies": [{ "name": "Teaching English as a Second or Foreign Language/ESL Language Instructor" }, { "name": "Adult and Continuing Education and Teaching" }, { "name": "Bilingual and Multilingual Education" }, { "name": "Adult Literacy Tutor/Instructor" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Public school programs usually need a bachelor's and a teaching license. Some community colleges prefer a master's in adult education or ESL.", "noBachelorPct": "39%", "distribution": [{ "label": "Did not finish high school", "pct": 2.4 }, { "label": "Finished high school", "pct": 11.3 }, { "label": "Some college, no degree", "pct": 16.7 }, { "label": "Associate's degree", "pct": 8.3 }, { "label": "Bachelor's degree", "pct": 34.8 }, { "label": "Master's degree", "pct": 21.4 }, { "label": "Doctorate or professional degree", "pct": 5.2 }] },
      "pay": { "starting": "$41,810", "typical": "$61,540", "top": "$98,030", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -5,700 by 2035, so most openings come from teachers who retire or move on." }
    }
  },
};
