// Career Detail profiles for the 4 Oct 2026 poster drop, batch 7 (BROWSE Images).
// Sourced: pay is OEWS May 2025 (national 10th, 25th, median, 75th and 90th
// percentiles; state annual means for South Dakota and the top 3 states, with
// states that have no published wage left out of the ranking); people doing it,
// openings and change are BLS Employment Projections 2025-35 (Occupation.xlsx
// table 1.2), which also gives the typical entry degree, experience and
// training; the degree mix is BLS table 5.3 (educational attainment, 2025
// matrix); growth wording follows the bls.gov OOH page for each occupation and
// the OOH growth scale; tasks, knowledge, skills and software are from O*NET
// OnLine. SOC codes: Architect 17-1011, Biomedical Engineer 17-2031,
// Biostatistician 15-2041 (O*NET 15-2041.01), Civil Engineer 17-2051, Cloud
// Systems Engineer 15-1241, Computer Programmer 15-1251, Data Center Technician
// 15-1231, Electrical Engineer 17-2071, Ethical Hacker 15-1212 (O*NET
// 15-1299.04), Game QA Tester 15-1253, IT Project Manager 13-1082 (O*NET
// 15-1299.09), Mathematician 15-2021, Mechanical Engineer 17-2141, Statistician
// 15-2041, Systems Analyst 15-1211, Textile and Materials Engineer 17-2131, Web
// Developer 15-1254. Seven titles have no BLS occupation of their own and use
// the closest one, noted above each entry and in its sources line:
// Biostatistician (Statisticians, where the OOH A-Z index sends it), Cloud
// Systems Engineer (Computer Network Architects; the OOH names cloud computing
// as the main driver of their growth, and CIP Cloud Computing maps to 15-1241),
// Data Center Technician (Computer Network Support Specialists, who set up,
// test and fix the network gear data centers run on), Ethical Hacker
// (Information Security Analysts; O*NET's Penetration Testers sit in the
// catch-all 15-1299, which has no OOH page), Game QA Tester (Software Quality
// Assurance Analysts and Testers, all software, not only games), IT Project
// Manager (Project Management Specialists; the OOH says IT projects drive
// their growth, and O*NET's IT Project Managers sit in 15-1299) and Textile and
// Materials Engineer (Materials Engineers; the CIP-SOC crosswalk maps Textile
// Sciences and Engineering to 17-2131).
import type { CareerProfile } from "./profiles";

const BLS_SOURCES =
  "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.";

export const LIB7_PROFILES: Record<string, CareerProfile> = {
  "architect": {
    "slug": "architect",
    "title": "Architect",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/architect.webp",
    "summary": "Designs homes, schools, offices and other buildings, and makes sure they get built right.",
    "scenario": "Imagine a town asks you to design its new library. You sketch the first idea, and two years later kids are reading in the rooms you drew.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$99,280/year" },
      { "label": "People doing it", "value": "124,600" },
      { "label": "Jobs open each year", "value": "6,900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$105K" }], "best": [{ "state": "California", "pay": "$122K" }, { "state": "Maryland", "pay": "$120K" }, { "state": "Massachusetts", "pay": "$119K" }] },
    "knowAbout": ["Design and technical drawing", "Building materials and methods", "How things get engineered and built", "Building codes and safety", "Working with clients"],
    "goodAt": ["Solving tricky problems", "Making good calls", "Planning how a whole project fits together", "Explaining your ideas", "Checking work against the plans"],
    "software": ["Autodesk Revit", "Autodesk AutoCAD Civil 3D", "Trimble SketchUp Pro", "Bentley MicroStation", "Adobe Photoshop"],
    "ladder": [
      { "number": "1", "jobTitle": "Architectural Intern", "pay": "$62K", "description": "You draw plans and build models while a licensed architect checks your work.", "whatYouDo": ["Draw plans in CAD", "Build 3D models", "Research building codes", "Join client meetings"], "toGetHere": ["Bachelor's or master's in architecture"] },
      { "number": "2", "jobTitle": "Architect", "pay": "$99K", "description": "You design whole buildings, meet with clients and watch over the build.", "whatYouDo": ["Design buildings", "Meet with clients", "Prepare plans for builders", "Visit job sites"], "toGetHere": ["Paid internship, about 3 years", "Pass the ARE exam", "State license"] },
      { "number": "3", "jobTitle": "Senior or Project Architect", "pay": "$127K", "description": "You lead big projects and guide a team of designers.", "whatYouDo": ["Lead design teams", "Manage budgets", "Win new clients", "Review others' drawings"], "toGetHere": ["Years as a licensed architect"] }
    ],
    "education": {
      "studies": [{ "name": "Architecture" }, { "name": "Architectural Design" }, { "name": "Environmental Design/Architecture" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "A paid internship, often about 3 years",
        "note": "Most architects earn a degree in architecture, train on the job in a paid internship, and then pass a licensing exam.",
        "noBachelorPct": "9%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.4 },
          { "label": "Finished high school", "pct": 1.8 },
          { "label": "Some college, no degree", "pct": 4.1 },
          { "label": "Associate's degree", "pct": 2.5 },
          { "label": "Bachelor's degree", "pct": 45.6 },
          { "label": "Master's degree", "pct": 36.9 },
          { "label": "Doctorate or professional degree", "pct": 8.6 }
        ]
      },
      "pay": { "starting": "$62,300", "typical": "$99,280", "top": "$161,420", "note": "About 1 in 7 architects work for themselves." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +5,300 by 2035. It is growing about as fast as most jobs." }
    }
  },

  // OEWS publishes no South Dakota wage for 17-2031, so there is no
  // yourStates row (same as the entries that have no home-state figure).
  "biomedical-engineer": {
    "slug": "biomedical-engineer",
    "title": "Biomedical Engineer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/biomedical-engineer.webp",
    "summary": "Uses engineering to build medical devices, from artificial joints to heart monitors.",
    "scenario": "Imagine a new artificial knee that you helped design. You run test after test so a patient can walk again without pain.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$109,370/year" },
      { "label": "People doing it", "value": "23,800" },
      { "label": "Jobs open each year", "value": "1,200" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Arizona", "pay": "$138K" }, { "state": "California", "pay": "$132K" }, { "state": "Minnesota", "pay": "$130K" }] },
    "knowAbout": ["How things get engineered and built", "Computers and electronics", "Math", "Biology", "Medicine"],
    "goodAt": ["Solving tricky problems", "Making good calls", "Testing how well a device works", "Designing new tools", "Writing clear reports"],
    "software": ["Python", "R", "The MathWorks MATLAB", "Dassault Systemes SolidWorks", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Biomedical Engineer", "pay": "$72K", "description": "You test devices and collect lab data while senior engineers guide you.", "whatYouDo": ["Test devices", "Collect lab data", "Write test reports", "Help with designs"], "toGetHere": ["Bachelor's in biomedical engineering"] },
      { "number": "2", "jobTitle": "Biomedical Engineer", "pay": "$109K", "description": "You design and improve medical devices and make sure they are safe.", "whatYouDo": ["Design medical devices", "Check safety", "Work with doctors and scientists", "Prepare papers for approval"], "toGetHere": ["Bachelor's degree", "Lab or internship experience"] },
      { "number": "3", "jobTitle": "Senior Biomedical Engineer", "pay": "$137K", "description": "You lead research projects and a team of engineers.", "whatYouDo": ["Lead research", "Manage a team", "Plan budgets", "Guide new engineers"], "toGetHere": ["Years as an engineer", "A master's or PhD helps"] }
    ],
    "education": {
      "studies": [{ "name": "Bioengineering and Biomedical Engineering" }, { "name": "Biological/Biosystems Engineering" }, { "name": "Chemical and Biomolecular Engineering" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "A bachelor's in biomedical engineering is the usual start. Research jobs often ask for a master's or PhD.",
        "noBachelorPct": "22%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.3 },
          { "label": "Finished high school", "pct": 4.5 },
          { "label": "Some college, no degree", "pct": 6.9 },
          { "label": "Associate's degree", "pct": 10.5 },
          { "label": "Bachelor's degree", "pct": 47.3 },
          { "label": "Master's degree", "pct": 21.0 },
          { "label": "Doctorate or professional degree", "pct": 9.4 }
        ]
      },
      "pay": { "starting": "$71,850", "typical": "$109,370", "top": "$168,180", "note": "Research labs are the biggest employer, with about 1 in 5 of these engineers." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,800 by 2035. It is growing much faster than most jobs." }
    }
  },

  // BLS has no separate biostatistician occupation. The OOH A-Z index sends
  // Biostatistician to Mathematicians and Statisticians, and O*NET files
  // Biostatisticians (15-2041.01) under Statisticians (15-2041). So every BLS
  // figure here is for all statisticians; tasks, skills and software follow
  // O*NET 15-2041.01. Table 5.3 reports one combined degree mix for
  // mathematicians and statisticians. OEWS publishes no South Dakota wage
  // for 15-2041, so there is no yourStates row.
  "biostatistician": {
    "slug": "biostatistician",
    "title": "Biostatistician",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/biostatistician.webp",
    "summary": "Uses math and data to find out if new medicines and treatments really work.",
    "scenario": "Imagine a drug trial with 5,000 patients just ended. Doctors are waiting for you to tell them if the new medicine worked.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$105,650/year" },
      { "label": "People doing it", "value": "31,300" },
      { "label": "Jobs open each year", "value": "1,900" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "New York", "pay": "$146K" }, { "state": "California", "pay": "$141K" }, { "state": "District of Columbia", "pay": "$138K" }] },
    "knowAbout": ["Math and statistics", "Computers", "Medicine and health", "Clear writing in English", "How research studies work"],
    "goodAt": ["Solving tricky problems", "Writing code to study data", "Making good calls", "Learning new methods", "Explaining results"],
    "software": ["SAS", "R", "IBM SPSS Statistics", "Structured query language SQL", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Biostatistician", "pay": "$64K", "description": "You clean study data and run the analysis a senior statistician plans.", "whatYouDo": ["Clean study data", "Write analysis code", "Make tables and charts", "Check results"], "toGetHere": ["Bachelor's in statistics or math", "A master's helps"] },
      { "number": "2", "jobTitle": "Biostatistician", "pay": "$106K", "description": "You help design studies with doctors and scientists and say what the data shows.", "whatYouDo": ["Plan study size", "Design studies", "Analyze clinical data", "Write up findings"], "toGetHere": ["Master's in biostatistics or statistics"] },
      { "number": "3", "jobTitle": "Senior Biostatistician", "pay": "$141K", "description": "You lead the stats work on big trials and guide other statisticians.", "whatYouDo": ["Lead study analysis", "Advise research teams", "Review others' work", "Coach new statisticians"], "toGetHere": ["Years of study work", "A PhD helps"] }
    ],
    "education": {
      "studies": [{ "name": "Biostatistics" }, { "name": "Epidemiology and Biostatistics" }, { "name": "Statistics, General" }, { "name": "Biometry/Biometrics" }],
      "where": [{ "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate biostatistician occupation, so pay and job figures are for all statisticians (SOC 15-2041). Tasks and skills are from O*NET Biostatisticians (15-2041.01).",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Master's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Most biostatisticians hold a master's in biostatistics or statistics. Classes in biology or health science help too.",
        "noBachelorPct": "14%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.5 },
          { "label": "Finished high school", "pct": 2.8 },
          { "label": "Some college, no degree", "pct": 6.4 },
          { "label": "Associate's degree", "pct": 4.0 },
          { "label": "Bachelor's degree", "pct": 38.9 },
          { "label": "Master's degree", "pct": 35.5 },
          { "label": "Doctorate or professional degree", "pct": 11.8 }
        ]
      },
      "pay": { "starting": "$64,000", "typical": "$105,650", "top": "$174,050", "note": "BLS counts biostatisticians inside the larger group of statisticians, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +3,400 by 2035. It is growing much faster than most jobs." }
    }
  },

  "civil-engineer": {
    "slug": "civil-engineer",
    "title": "Civil Engineer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/civil-engineer.webp",
    "summary": "Designs and builds roads, bridges, tunnels and water systems that whole towns depend on.",
    "scenario": "Imagine a new bridge across a wide river. You worked out how much weight it must hold before the first truck ever drives over it.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$100,840/year" },
      { "label": "People doing it", "value": "380,600" },
      { "label": "Jobs open each year", "value": "22,700" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$100K" }], "best": [{ "state": "California", "pay": "$125K" }, { "state": "Alaska", "pay": "$119K" }, { "state": "New York", "pay": "$118K" }] },
    "knowAbout": ["Design and technical drawing", "How things get engineered and built", "Building materials and methods", "Math", "Physics"],
    "goodAt": ["Solving tricky problems", "Seeing how a whole system fits together", "Managing your time", "Making good calls", "Leading a team on site"],
    "software": ["Autodesk AutoCAD Civil 3D", "Autodesk Revit", "Bentley MicroStation", "Microsoft Excel", "Microsoft PowerPoint"],
    "ladder": [
      { "number": "1", "jobTitle": "Engineer in Training (EIT)", "pay": "$68K", "description": "You run numbers and draw plans while a licensed engineer checks your work.", "whatYouDo": ["Run design math", "Draw plans in CAD", "Visit job sites", "Estimate materials"], "toGetHere": ["Bachelor's in civil engineering", "Pass the FE exam"] },
      { "number": "2", "jobTitle": "Civil Engineer (PE)", "pay": "$101K", "description": "You design roads, pipes and structures and sign off on the plans.", "whatYouDo": ["Design projects", "Check safety rules", "Inspect sites", "Advise builders"], "toGetHere": ["About 4 years of work", "Pass the PE exam", "State license"] },
      { "number": "3", "jobTitle": "Senior or Project Engineer", "pay": "$130K", "description": "You run whole projects and lead a team of engineers and techs.", "whatYouDo": ["Lead projects", "Manage budgets", "Lead a team", "Meet with city leaders"], "toGetHere": ["Years as a PE", "A master's helps"] }
    ],
    "education": {
      "studies": [{ "name": "Civil Engineering, General" }, { "name": "Structural Engineering" }, { "name": "Transportation and Highway Engineering" }, { "name": "Water Resources Engineering" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "A bachelor's in civil engineering gets you in. A PE license lets you sign off on public projects, and a master's helps you move up.",
        "noBachelorPct": "12%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.8 },
          { "label": "Finished high school", "pct": 3.3 },
          { "label": "Some college, no degree", "pct": 4.1 },
          { "label": "Associate's degree", "pct": 3.5 },
          { "label": "Bachelor's degree", "pct": 58.1 },
          { "label": "Master's degree", "pct": 26.2 },
          { "label": "Doctorate or professional degree", "pct": 4.0 }
        ]
      },
      "pay": { "starting": "$68,240", "typical": "$100,840", "top": "$163,220", "note": "About half work for engineering firms, and about 1 in 5 work for state or local government." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +24,500 by 2035. It is growing faster than most jobs." }
    }
  },

  // BLS has no separate cloud engineer occupation. The closest is Computer
  // Network Architects (15-1241): the OOH says the spread of cloud computing
  // drives their growth, the CIP-SOC crosswalk maps Cloud Computing programs
  // to 15-1241, and O*NET lists Systems Engineer and Solutions Architect as
  // its job titles. So every BLS figure here is for network architects;
  // tasks, skills and software follow O*NET 15-1241.00. Rung 1 pay is the
  // OEWS median for Network and Computer Systems Administrators (15-1244).
  "cloud-systems-engineer": {
    "slug": "cloud-systems-engineer",
    "title": "Cloud Systems Engineer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/cloud-systems-engineer.webp",
    "summary": "Designs and runs the online systems that keep apps and websites working for millions of people.",
    "scenario": "Imagine a game launches and a million players log on at once. You built the cloud setup that keeps it running smooth.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$134,050/year" },
      { "label": "People doing it", "value": "181,800" },
      { "label": "Jobs open each year", "value": "9,600" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$152K" }], "best": [{ "state": "Washington", "pay": "$165K" }, { "state": "California", "pay": "$161K" }, { "state": "New Jersey", "pay": "$159K" }] },
    "knowAbout": ["Computers and electronics", "How things get engineered and built", "Networks and telecom", "Design", "Math"],
    "goodAt": ["Solving tricky problems", "Writing code", "Testing how well a system works", "Making good calls", "Planning how systems fit together"],
    "software": ["Amazon Web Services AWS software", "IBM Terraform", "Ansible software", "Microsoft PowerShell", "Kubernetes"],
    "ladder": [
      { "number": "1", "jobTitle": "Systems Administrator", "pay": "$99K", "description": "You keep a company's servers and networks running and fix what breaks.", "whatYouDo": ["Set up servers", "Watch system health", "Fix outages", "Back up data"], "toGetHere": ["Bachelor's in computer science or IT", "IT certifications help"] },
      { "number": "2", "jobTitle": "Cloud Systems Engineer", "pay": "$134K", "description": "You design and build cloud systems that stay fast, safe and online.", "whatYouDo": ["Design cloud systems", "Automate setups with code", "Plan for disasters", "Set up security"], "toGetHere": ["About 5 years in IT", "Cloud certifications"] },
      { "number": "3", "jobTitle": "Senior Cloud Architect", "pay": "$168K", "description": "You plan the whole cloud setup for a company and lead the engineers who build it.", "whatYouDo": ["Plan cloud strategy", "Lead engineers", "Plan for growth", "Advise leaders"], "toGetHere": ["Years as a cloud engineer", "Advanced certifications"] }
    ],
    "education": {
      "studies": [{ "name": "Cloud Computing" }, { "name": "Computer Systems Networking and Telecommunications" }, { "name": "Network and System Administration/Administrator" }, { "name": "Computer Engineering, General" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate cloud engineer occupation, so pay and job figures are for computer network architects (SOC 15-1241), the group whose growth the BLS ties to cloud computing.",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "Yes. Usually 5 years or more in IT, often as a systems administrator",
        "trainingAfterHiring": "None. Your years in IT are the training",
        "note": "This is a job you grow into. Most people start as systems or network administrators and add cloud certifications along the way.",
        "noBachelorPct": "43%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.8 },
          { "label": "Finished high school", "pct": 6.6 },
          { "label": "Some college, no degree", "pct": 20.9 },
          { "label": "Associate's degree", "pct": 14.5 },
          { "label": "Bachelor's degree", "pct": 42.4 },
          { "label": "Master's degree", "pct": 13.8 },
          { "label": "Doctorate or professional degree", "pct": 1.0 }
        ]
      },
      "pay": { "starting": "$79,900", "typical": "$134,050", "top": "$202,680", "note": "BLS counts cloud engineers with computer network architects, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +14,100 by 2035. It is growing much faster than most jobs." }
    }
  },

  "computer-programmer": {
    "slug": "computer-programmer",
    "title": "Computer Programmer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/computer-programmer.webp",
    "summary": "Writes and tests the code that tells computers and apps what to do.",
    "scenario": "Imagine a store's checkout app adds every price twice. You dig through the code line by line until you find the bug and fix it.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$100,390/year" },
      { "label": "People doing it", "value": "110,800" },
      { "label": "Jobs open each year", "value": "4,400" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$68K" }], "best": [{ "state": "Massachusetts", "pay": "$128K" }, { "state": "Washington", "pay": "$127K" }, { "state": "Virginia", "pay": "$122K" }] },
    "knowAbout": ["Computers and electronics", "Math", "How things get engineered and built", "Clear writing in English", "Helping customers"],
    "goodAt": ["Writing code", "Solving tricky problems", "Checking quality", "Thinking through how a system works", "Listening to what users need"],
    "software": ["Git", "SAS", "Extensible markup language XML", "Python", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Programmer", "pay": "$58K", "description": "You fix bugs and write small pieces of code while senior programmers review it.", "whatYouDo": ["Fix bugs", "Write small features", "Test code", "Add notes to code"], "toGetHere": ["Bachelor's in computer science", "Know one or two coding languages"] },
      { "number": "2", "jobTitle": "Computer Programmer", "pay": "$100K", "description": "You turn a software design into working code and keep it running well.", "whatYouDo": ["Write and rewrite code", "Run test versions", "Fix errors", "Update old programs"], "toGetHere": ["Bachelor's degree", "Coding experience"] },
      { "number": "3", "jobTitle": "Senior Programmer", "pay": "$131K", "description": "You take on the hardest code and guide newer programmers.", "whatYouDo": ["Solve hard bugs", "Review others' code", "Plan big changes", "Coach new programmers"], "toGetHere": ["Years of coding", "Certifications help"] }
    ],
    "education": {
      "studies": [{ "name": "Computer Programming/Programmer, General" }, { "name": "Computer Science" }, { "name": "Computer Software Technology/Technician" }],
      "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Most programmers have a bachelor's in computer science. Many learn several coding languages and add certifications over time.",
        "noBachelorPct": "30%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 1.2 },
          { "label": "Finished high school", "pct": 6.0 },
          { "label": "Some college, no degree", "pct": 13.1 },
          { "label": "Associate's degree", "pct": 9.2 },
          { "label": "Bachelor's degree", "pct": 48.0 },
          { "label": "Master's degree", "pct": 19.7 },
          { "label": "Doctorate or professional degree", "pct": 2.8 }
        ]
      },
      "pay": { "starting": "$57,710", "typical": "$100,390", "top": "$160,460", "note": "About 1 in 7 programmers work for themselves." },
      "openings": { "note": "Counts every job that needs filling. Here they come from people moving on or retiring, since BLS expects about 8,100 fewer programmer jobs by 2035." }
    }
  },

  // BLS has no separate data center technician occupation. The closest is
  // Computer Network Support Specialists (15-1231), who set up, test and fix
  // the network gear and connections data centers run on. So every BLS
  // figure here is for that group; tasks, skills and software follow O*NET
  // 15-1231.00.
  "data-center-technician": {
    "slug": "data-center-technician",
    "title": "Data Center Technician",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/data-center-technician.webp",
    "summary": "Sets up, checks and fixes the servers and network gear that keep the internet running.",
    "scenario": "Imagine walking rows of humming servers at 2 a.m. One light turns red, and you swap the part before anyone's video call drops.",
    "facts": [
      { "label": "Typical degree", "value": "Associate's degree" },
      { "label": "Typical pay", "value": "$76,220/year" },
      { "label": "People doing it", "value": "152,500" },
      { "label": "Jobs open each year", "value": "9,000" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$56K" }], "best": [{ "state": "Washington", "pay": "$112K" }, { "state": "Maryland", "pay": "$107K" }, { "state": "District of Columbia", "pay": "$101K" }] },
    "knowAbout": ["Computers and electronics", "Networks and telecom", "Helping customers", "How things get engineered and built", "Clear writing in English"],
    "goodAt": ["Troubleshooting", "Watching systems closely", "Solving tricky problems", "Making good calls", "Managing your time"],
    "software": ["Microsoft Windows Server", "Microsoft Active Directory", "ServiceNow", "Red Hat Enterprise Linux", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Data Center Technician Trainee", "pay": "$47K", "description": "You rack servers, run cables and log every fix while a senior tech shows you how.", "whatYouDo": ["Install servers", "Run and label cables", "Swap failed parts", "Log repairs"], "toGetHere": ["High school diploma plus IT certifications", "Or an associate's degree"] },
      { "number": "2", "jobTitle": "Data Center Technician", "pay": "$76K", "description": "You keep the network up, find what is broken and fix it fast.", "whatYouDo": ["Set up routers", "Find network problems", "Back up data", "Set security settings"], "toGetHere": ["Associate's degree", "On-the-job training"] },
      { "number": "3", "jobTitle": "Senior Data Center Technician", "pay": "$99K", "description": "You handle the hardest outages, plan upgrades and train newer techs.", "whatYouDo": ["Fix major outages", "Plan upgrades", "Check network speed", "Train new techs"], "toGetHere": ["Years as a tech", "Advanced certifications"] }
    ],
    "education": {
      "studies": [{ "name": "Computer Systems Networking and Telecommunications" }, { "name": "Network and System Administration/Administrator" }, { "name": "Computer Support Specialist" }],
      "where": [{ "count": "", "credential": "Trade school certificate" }, { "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate data center technician occupation, so pay and job figures are for computer network support specialists (SOC 15-1231).",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Associate's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "A few months to a year of on-the-job training",
        "note": "An associate's degree is the usual way in. Some people start with a high school diploma plus IT certifications.",
        "noBachelorPct": "50%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 1.2 },
          { "label": "Finished high school", "pct": 10.7 },
          { "label": "Some college, no degree", "pct": 23.4 },
          { "label": "Associate's degree", "pct": 14.8 },
          { "label": "Bachelor's degree", "pct": 36.4 },
          { "label": "Master's degree", "pct": 11.9 },
          { "label": "Doctorate or professional degree", "pct": 1.5 }
        ]
      },
      "pay": { "starting": "$47,120", "typical": "$76,220", "top": "$127,780", "note": "BLS counts data center techs with computer network support specialists, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,900 by 2035. It is growing, but more slowly than most jobs." }
    }
  },

  "electrical-engineer": {
    "slug": "electrical-engineer",
    "title": "Electrical Engineer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/electrical-engineer.webp",
    "summary": "Designs the electrical systems inside everything from power plants to electric cars.",
    "scenario": "Imagine a new electric bus that needs to run all day on one charge. You design the power system that gets it there.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$120,630/year" },
      { "label": "People doing it", "value": "199,700" },
      { "label": "Jobs open each year", "value": "11,400" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$103K" }], "best": [{ "state": "New Mexico", "pay": "$155K" }, { "state": "California", "pay": "$151K" }, { "state": "District of Columbia", "pay": "$143K" }] },
    "knowAbout": ["How things get engineered and built", "Computers and electronics", "Design and technical drawing", "Math", "Physics"],
    "goodAt": ["Solving tricky problems", "Running a project", "Making good calls", "Testing how well a system works", "Writing clear reports"],
    "software": ["The MathWorks MATLAB", "Autodesk Revit", "Python", "C++", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Engineer in Training (EIT)", "pay": "$77K", "description": "You run calculations and test parts while a senior engineer checks your work.", "whatYouDo": ["Run calculations", "Test parts", "Draw circuit plans", "Write test notes"], "toGetHere": ["Bachelor's in electrical engineering", "Pass the FE exam"] },
      { "number": "2", "jobTitle": "Electrical Engineer", "pay": "$121K", "description": "You design and improve electrical systems and make sure they meet the rules.", "whatYouDo": ["Design systems", "Use design software", "Inspect installs", "Meet with clients"], "toGetHere": ["Bachelor's degree", "Work experience"] },
      { "number": "3", "jobTitle": "Senior Electrical Engineer", "pay": "$153K", "description": "You lead big projects and keep them on time and on budget.", "whatYouDo": ["Lead projects", "Manage budgets", "Lead a team", "Sign off on designs"], "toGetHere": ["Years as an engineer", "PE license helps"] }
    ],
    "education": {
      "studies": [{ "name": "Electrical and Electronics Engineering" }, { "name": "Electrical and Computer Engineering" }, { "name": "Electromechanical Engineering" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "A bachelor's in electrical engineering gets you in. A license is not needed to start, but a PE license helps you move up.",
        "noBachelorPct": "16%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.6 },
          { "label": "Finished high school", "pct": 3.7 },
          { "label": "Some college, no degree", "pct": 4.9 },
          { "label": "Associate's degree", "pct": 6.5 },
          { "label": "Bachelor's degree", "pct": 51.2 },
          { "label": "Master's degree", "pct": 27.2 },
          { "label": "Doctorate or professional degree", "pct": 6.0 }
        ]
      },
      "pay": { "starting": "$76,550", "typical": "$120,630", "top": "$184,300", "note": "Engineering firms hire the most, about 1 in 5 electrical engineers." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +19,800 by 2035. It is growing much faster than most jobs." }
    }
  },

  // BLS has no separate ethical hacker occupation. O*NET's Penetration
  // Testers (15-1299.04) sit in the catch-all Computer Occupations, All Other
  // (15-1299), which has no OOH page, so every BLS figure here is for
  // Information Security Analysts (15-1212), the security group whose work
  // includes testing defenses. Tasks, skills and software follow O*NET
  // 15-1299.04 Penetration Testers.
  "ethical-hacker": {
    "slug": "ethical-hacker",
    "title": "Ethical Hacker",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/ethical-hacker.webp",
    "summary": "Gets paid to break into computer systems, with permission, so the weak spots get fixed first.",
    "scenario": "Imagine a bank hires you to break into its own systems. You find a way in on day two and show them how to lock it shut.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$129,180/year" },
      { "label": "People doing it", "value": "192,900" },
      { "label": "Jobs open each year", "value": "14,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$121K" }], "best": [{ "state": "Washington", "pay": "$156K" }, { "state": "Massachusetts", "pay": "$151K" }, { "state": "Maryland", "pay": "$150K" }] },
    "knowAbout": ["Computers and electronics", "Networks and telecom", "How things get engineered and built", "Laws and rules", "Clear writing in English"],
    "goodAt": ["Solving tricky problems", "Writing code", "Testing how well a system works", "Spotting weak spots", "Writing clear reports"],
    "software": ["Bash", "Microsoft PowerShell", "Splunk Enterprise", "Amazon Web Services AWS software", "JavaScript"],
    "ladder": [
      { "number": "1", "jobTitle": "Security Analyst", "pay": "$75K", "description": "You watch for attacks and help fix security gaps while senior staff guide you.", "whatYouDo": ["Watch for attacks", "Check security alerts", "Run security scans", "Write up what you find"], "toGetHere": ["Bachelor's in computer science or cybersecurity", "IT or network experience"] },
      { "number": "2", "jobTitle": "Ethical Hacker", "pay": "$129K", "description": "You run planned attacks on systems to find weak spots before real hackers do.", "whatYouDo": ["Run break-in tests", "Find weak spots", "Write audit reports", "Suggest fixes"], "toGetHere": ["Under 5 years in security", "Security certifications"] },
      { "number": "3", "jobTitle": "Senior Penetration Tester", "pay": "$164K", "description": "You lead big test projects and set how your team tests.", "whatYouDo": ["Lead test teams", "Plan test methods", "Track new threats", "Coach newer testers"], "toGetHere": ["Years of testing", "Advanced certifications"] }
    ],
    "education": {
      "studies": [{ "name": "Computer and Information Systems Security/Auditing/Information Assurance" }, { "name": "Cyber/Computer Forensics and Counterterrorism" }, { "name": "Computer Science" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate ethical hacker occupation, so pay and job figures are for information security analysts (SOC 15-1212). Tasks and skills are from O*NET Penetration Testers (15-1299.04).",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "Yes. Usually a few years in IT, often as a network administrator",
        "trainingAfterHiring": "None required",
        "note": "Most start with a computer science degree and some years in IT. Employers often look for security certifications too.",
        "noBachelorPct": "28%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.9 },
          { "label": "Finished high school", "pct": 4.7 },
          { "label": "Some college, no degree", "pct": 14.0 },
          { "label": "Associate's degree", "pct": 8.4 },
          { "label": "Bachelor's degree", "pct": 43.9 },
          { "label": "Master's degree", "pct": 25.0 },
          { "label": "Doctorate or professional degree", "pct": 3.1 }
        ]
      },
      "pay": { "starting": "$75,090", "typical": "$129,180", "top": "$199,850", "note": "BLS counts ethical hackers with information security analysts, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +40,600 by 2035. It is growing much faster than most jobs." }
    }
  },

  // BLS has no separate game tester occupation. Game testers are software
  // quality assurance testers, so every BLS figure here is for Software
  // Quality Assurance Analysts and Testers (15-1253) across all kinds of
  // software; tasks, skills and software follow O*NET 15-1253.00.
  "game-qa-tester": {
    "slug": "game-qa-tester",
    "title": "Game QA Tester",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/game-qa-tester.webp",
    "summary": "Plays and tests games before launch to find the bugs and report them.",
    "scenario": "Imagine a big game launches in two weeks. You find the glitch that lets players walk through walls, and the team fixes it before launch day.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$104,300/year" },
      { "label": "People doing it", "value": "187,600" },
      { "label": "Jobs open each year", "value": "10,700" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$73K" }], "best": [{ "state": "California", "pay": "$131K" }, { "state": "Washington", "pay": "$131K" }, { "state": "Maryland", "pay": "$123K" }] },
    "knowAbout": ["Computers and electronics", "Clear writing in English", "How things get engineered and built", "Math", "Design"],
    "goodAt": ["Checking quality", "Solving tricky problems", "Writing code", "Testing how well a system works", "Explaining what you found"],
    "software": ["Atlassian JIRA", "Selenium", "Jenkins CI", "Git", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Game Tester", "pay": "$61K", "description": "You play builds of a game again and again and log every bug you find.", "whatYouDo": ["Play test builds", "Log bugs", "Retest fixes", "Follow test plans"], "toGetHere": ["Love of games", "Some coding classes help"] },
      { "number": "2", "jobTitle": "QA Analyst", "pay": "$104K", "description": "You write the test plans and build tools that test the game for you.", "whatYouDo": ["Write test plans", "Build automated tests", "Track bugs", "Give feedback to developers"], "toGetHere": ["Bachelor's in computer science or IT", "Testing experience"] },
      { "number": "3", "jobTitle": "QA Lead", "pay": "$133K", "description": "You run the test team and decide when a game is ready to ship.", "whatYouDo": ["Lead testers", "Set test goals", "Report to producers", "Sign off on releases"], "toGetHere": ["Years in QA", "Leading a small team"] }
    ],
    "education": {
      "studies": [{ "name": "Computer Game Programming" }, { "name": "Computer Software Engineering" }, { "name": "Computer Science" }, { "name": "Information Technology" }],
      "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate game tester occupation, so pay and job figures are for all software quality assurance analysts and testers (SOC 15-1253), not only those who test games.",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Most testers have a degree in computer science or IT. Coding skills matter, since many tests run on code.",
        "noBachelorPct": "28%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 1.1 },
          { "label": "Finished high school", "pct": 5.9 },
          { "label": "Some college, no degree", "pct": 13.1 },
          { "label": "Associate's degree", "pct": 8.2 },
          { "label": "Bachelor's degree", "pct": 50.3 },
          { "label": "Master's degree", "pct": 19.2 },
          { "label": "Doctorate or professional degree", "pct": 2.1 }
        ]
      },
      "pay": { "starting": "$61,440", "typical": "$104,300", "top": "$167,010", "note": "BLS counts game testers with all software testers, so these figures cover testers of every kind of software." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +10,600 by 2035. It is growing faster than most jobs." }
    }
  },

  // BLS has no separate IT project manager occupation. O*NET's Information
  // Technology Project Managers (15-1299.09) sit in the catch-all Computer
  // Occupations, All Other (15-1299), which has no OOH page. The closest
  // BLS occupation is Project Management Specialists (13-1082), and its OOH
  // page says IT projects drive its growth. So every BLS figure here is for
  // all project management specialists; tasks, skills and software follow
  // O*NET 15-1299.09.
  "it-project-manager": {
    "slug": "it-project-manager",
    "title": "IT Project Manager",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/it-project-manager.webp",
    "summary": "Leads tech projects, like a new app or system, so they finish on time and on budget.",
    "scenario": "Imagine a hospital is moving every patient record to a new system. You keep 40 people on track so it goes live on the right day.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$102,320/year" },
      { "label": "People doing it", "value": "1,094,300" },
      { "label": "Jobs open each year", "value": "76,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$88K" }], "best": [{ "state": "New Jersey", "pay": "$128K" }, { "state": "Washington", "pay": "$128K" }, { "state": "New York", "pay": "$126K" }] },
    "knowAbout": ["Running projects and teams", "Computers and electronics", "Helping customers", "Budgets and money", "Clear writing in English"],
    "goodAt": ["Keeping people working together", "Managing your time", "Leading a team", "Making good calls", "Working out deals"],
    "software": ["Atlassian JIRA", "Atlassian Confluence", "ServiceNow", "Microsoft Excel", "Microsoft PowerPoint"],
    "ladder": [
      { "number": "1", "jobTitle": "Project Coordinator", "pay": "$62K", "description": "You track tasks, set up meetings and keep the project plan up to date.", "whatYouDo": ["Track tasks", "Set up meetings", "Update the plan", "Take notes"], "toGetHere": ["Bachelor's degree", "Strong organizing skills"] },
      { "number": "2", "jobTitle": "IT Project Manager", "pay": "$102K", "description": "You run tech projects from start to finish and keep them on budget.", "whatYouDo": ["Plan the schedule", "Manage the budget", "Solve team problems", "Update leaders"], "toGetHere": ["Time on tech projects", "PMP certification helps"] },
      { "number": "3", "jobTitle": "Senior IT Project Manager", "pay": "$133K", "description": "You lead the biggest projects and guide other project managers.", "whatYouDo": ["Lead big projects", "Weigh costs and payoffs", "Coach project managers", "Advise leaders"], "toGetHere": ["Years of leading projects", "PMP certification"] }
    ],
    "education": {
      "studies": [{ "name": "Information Technology Project Management" }, { "name": "Project Management" }, { "name": "Information Technology" }, { "name": "Business Administration and Management, General" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate IT project manager occupation, so pay and job figures are for all project management specialists (SOC 13-1082). Tasks and skills are from O*NET Information Technology Project Managers (15-1299.09).",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Most have a bachelor's in business, IT or project management. A certification like the PMP is not required, but it shows employers you know the work.",
        "noBachelorPct": "28%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 1.1 },
          { "label": "Finished high school", "pct": 7.3 },
          { "label": "Some college, no degree", "pct": 12.6 },
          { "label": "Associate's degree", "pct": 6.6 },
          { "label": "Bachelor's degree", "pct": 46.4 },
          { "label": "Master's degree", "pct": 23.1 },
          { "label": "Doctorate or professional degree", "pct": 2.9 }
        ]
      },
      "pay": { "starting": "$61,580", "typical": "$102,320", "top": "$167,970", "note": "BLS counts IT project managers with all project management specialists, so these figures cover projects of every kind." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +73,200 by 2035. It is growing much faster than most jobs." }
    }
  },

  // Table 5.3 reports one combined degree mix for mathematicians and
  // statisticians. OEWS publishes state wages for mathematicians in only 12
  // states, none of them South Dakota, so there is no yourStates row and
  // the top 3 come from those 12. Projections round the 2025-35 change to
  // zero (+0.6%).
  "mathematician": {
    "slug": "mathematician",
    "title": "Mathematician",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/mathematician.webp",
    "summary": "Finds new math ideas and uses them to solve real problems in science, tech and government.",
    "scenario": "Imagine a code no one has cracked. You spend weeks testing ideas on paper until the pattern finally clicks.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$126,710/year" },
      { "label": "People doing it", "value": "2,200" },
      { "label": "Jobs open each year", "value": "100" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Washington", "pay": "$160K" }, { "state": "New York", "pay": "$148K" }, { "state": "Virginia", "pay": "$146K" }] },
    "knowAbout": ["Math", "Teaching and training", "Computers", "Clear writing in English", "Physics"],
    "goodAt": ["Solving tricky problems", "Using math", "Thinking things through", "Learning new ideas fast", "Teaching others"],
    "software": ["The MathWorks MATLAB", "R", "C", "C#", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Math Graduate Student", "pay": "", "description": "You study advanced math and start your own research.", "whatYouDo": ["Take advanced classes", "Do research", "Teach college classes", "Write papers"], "toGetHere": ["Bachelor's in math", "Accepted to a graduate program"] },
      { "number": "2", "jobTitle": "Mathematician", "pay": "$127K", "description": "You build math models and test new ideas to solve real problems.", "whatYouDo": ["Build math models", "Run computations", "Test new ideas", "Share your results"], "toGetHere": ["Master's or doctorate in math"] },
      { "number": "3", "jobTitle": "Senior Mathematician", "pay": "$157K", "description": "You lead research projects and coach other mathematicians.", "whatYouDo": ["Lead research", "Coach others", "Publish papers", "Present at conferences"], "toGetHere": ["Doctorate", "Years of research"] }
    ],
    "education": {
      "studies": [{ "name": "Mathematics, General" }, { "name": "Applied Mathematics, General" }, { "name": "Computational and Applied Mathematics" }],
      "where": [{ "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Master's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Most mathematicians hold a master's or doctorate in math. Some federal jobs hire people with a bachelor's.",
        "noBachelorPct": "14%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.5 },
          { "label": "Finished high school", "pct": 2.8 },
          { "label": "Some college, no degree", "pct": 6.4 },
          { "label": "Associate's degree", "pct": 4.0 },
          { "label": "Bachelor's degree", "pct": 38.9 },
          { "label": "Master's degree", "pct": 35.5 },
          { "label": "Doctorate or professional degree", "pct": 11.8 }
        ]
      },
      "pay": { "starting": "$69,240", "typical": "$126,710", "top": "$195,190", "note": "More than half of mathematicians work for the federal government." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. It is a small field, and BLS expects its size to hold about steady through 2035." }
    }
  },

  "mechanical-engineer": {
    "slug": "mechanical-engineer",
    "title": "Mechanical Engineer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/mechanical-engineer.webp",
    "summary": "Designs and tests machines, engines and tools, from tiny sensors to giant turbines.",
    "scenario": "Imagine a new engine part keeps cracking in tests. You study the failure, change the design and run the test again until it holds.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$104,110/year" },
      { "label": "People doing it", "value": "298,500" },
      { "label": "Jobs open each year", "value": "17,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$95K" }], "best": [{ "state": "New Mexico", "pay": "$152K" }, { "state": "District of Columbia", "pay": "$138K" }, { "state": "California", "pay": "$137K" }] },
    "knowAbout": ["Design and technical drawing", "How things get engineered and built", "How factories make things", "Machines and tools", "Math"],
    "goodAt": ["Solving tricky problems", "Making good calls", "Testing how well a design works", "Finding why machines fail", "Designing new parts"],
    "software": ["Dassault Systemes SolidWorks", "Autodesk AutoCAD", "The MathWorks MATLAB", "Python", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Engineer in Training (EIT)", "pay": "$74K", "description": "You build models and run tests while a senior engineer checks your work.", "whatYouDo": ["Build CAD models", "Run tests", "Read blueprints", "Write test reports"], "toGetHere": ["Bachelor's in mechanical engineering", "Pass the FE exam"] },
      { "number": "2", "jobTitle": "Mechanical Engineer", "pay": "$104K", "description": "You design machines and parts and fix what is not working.", "whatYouDo": ["Design parts", "Find why machines fail", "Suggest design fixes", "Oversee installs"], "toGetHere": ["Bachelor's degree", "Work experience"] },
      { "number": "3", "jobTitle": "Senior Mechanical Engineer", "pay": "$133K", "description": "You lead design projects and sign off on the final plans.", "whatYouDo": ["Lead projects", "Review designs", "Lead a team", "Sign off on plans"], "toGetHere": ["About 4 years of work", "PE license"] }
    ],
    "education": {
      "studies": [{ "name": "Mechanical Engineering" }, { "name": "Engineering Mechanics" }, { "name": "Electromechanical Engineering" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "A bachelor's in mechanical engineering gets you in. A PE license, after about 4 years of work, lets you sign off on projects.",
        "noBachelorPct": "17%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.6 },
          { "label": "Finished high school", "pct": 4.3 },
          { "label": "Some college, no degree", "pct": 5.6 },
          { "label": "Associate's degree", "pct": 6.2 },
          { "label": "Bachelor's degree", "pct": 57.3 },
          { "label": "Master's degree", "pct": 22.3 },
          { "label": "Doctorate or professional degree", "pct": 3.7 }
        ]
      },
      "pay": { "starting": "$73,990", "typical": "$104,110", "top": "$164,340", "note": "Engineering firms hire the most, about 1 in 5 mechanical engineers." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +33,500 by 2035. It is growing much faster than most jobs." }
    }
  },

  // Table 5.3 reports one combined degree mix for mathematicians and
  // statisticians. OEWS publishes no South Dakota wage for 15-2041, so there
  // is no yourStates row.
  "statistician": {
    "slug": "statistician",
    "title": "Statistician",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/statistician.webp",
    "summary": "Collects and studies data to answer real questions in health, sports, business and government.",
    "scenario": "Imagine a city wants to know if its new bus routes really cut travel time. You design the study and let the numbers give the answer.",
    "facts": [
      { "label": "Typical degree", "value": "Master's degree" },
      { "label": "Typical pay", "value": "$105,650/year" },
      { "label": "People doing it", "value": "31,300" },
      { "label": "Jobs open each year", "value": "1,900" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "New York", "pay": "$146K" }, { "state": "California", "pay": "$141K" }, { "state": "District of Columbia", "pay": "$138K" }] },
    "knowAbout": ["Math and statistics", "Computers", "Clear writing in English", "How research studies work", "Charts and graphs"],
    "goodAt": ["Solving tricky problems", "Writing code to study data", "Making good calls", "Managing your time", "Explaining results"],
    "software": ["R", "Python", "SAS", "Tableau", "IBM SPSS Statistics"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Statistician", "pay": "$64K", "description": "You clean data and run analyses while a senior statistician checks your work.", "whatYouDo": ["Clean data", "Run analyses", "Make charts", "Check for errors"], "toGetHere": ["Bachelor's in statistics or math"] },
      { "number": "2", "jobTitle": "Statistician", "pay": "$106K", "description": "You design studies and surveys and explain what the data shows.", "whatYouDo": ["Design surveys", "Pick the right methods", "Find trends", "Present results"], "toGetHere": ["Master's in statistics"] },
      { "number": "3", "jobTitle": "Senior Statistician", "pay": "$141K", "description": "You lead research projects and set the methods your team uses.", "whatYouDo": ["Lead projects", "Set methods", "Review others' work", "Advise leaders"], "toGetHere": ["Years as a statistician", "A PhD helps"] }
    ],
    "education": {
      "studies": [{ "name": "Statistics, General" }, { "name": "Mathematical Statistics and Probability" }, { "name": "Applied Mathematics, General" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Master's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "A master's is the usual start. Some entry jobs hire people with a bachelor's in statistics or math.",
        "noBachelorPct": "14%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.5 },
          { "label": "Finished high school", "pct": 2.8 },
          { "label": "Some college, no degree", "pct": 6.4 },
          { "label": "Associate's degree", "pct": 4.0 },
          { "label": "Bachelor's degree", "pct": 38.9 },
          { "label": "Master's degree", "pct": 35.5 },
          { "label": "Doctorate or professional degree", "pct": 11.8 }
        ]
      },
      "pay": { "starting": "$64,000", "typical": "$105,650", "top": "$174,050", "note": "The federal government is the biggest single employer of statisticians." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +3,400 by 2035. It is growing much faster than most jobs." }
    }
  },

  "systems-analyst": {
    "slug": "systems-analyst",
    "title": "Systems Analyst",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/systems-analyst.webp",
    "summary": "Studies how a company uses its computer systems and designs better ways to get the work done.",
    "scenario": "Imagine a shipping company where orders keep getting lost between two systems. You map how data moves and design the link that fixes it.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$105,850/year" },
      { "label": "People doing it", "value": "544,400" },
      { "label": "Jobs open each year", "value": "32,900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$106K" }], "best": [{ "state": "Colorado", "pay": "$133K" }, { "state": "Washington", "pay": "$131K" }, { "state": "California", "pay": "$130K" }] },
    "knowAbout": ["Computers and electronics", "Helping customers", "Math", "Running projects and teams", "Clear writing in English"],
    "goodAt": ["Seeing how a whole system fits together", "Testing how well a system works", "Making good calls", "Solving tricky problems", "Writing code"],
    "software": ["Microsoft Power BI", "ServiceNow", "Atlassian JIRA", "Microsoft SharePoint", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Systems Analyst", "pay": "$67K", "description": "You test systems and help users with problems while a senior analyst guides you.", "whatYouDo": ["Test systems", "Help users", "Fix small problems", "Document how systems work"], "toGetHere": ["Bachelor's in computer science or information systems"] },
      { "number": "2", "jobTitle": "Systems Analyst", "pay": "$106K", "description": "You study what a business needs and design computer systems to match.", "whatYouDo": ["Study business needs", "Design systems", "Link systems together", "Meet with managers"], "toGetHere": ["Bachelor's degree", "Time in IT"] },
      { "number": "3", "jobTitle": "Senior Systems Analyst", "pay": "$134K", "description": "You lead big system projects and guide other analysts.", "whatYouDo": ["Lead projects", "Plan new systems", "Coach analysts", "Advise leaders"], "toGetHere": ["Years as an analyst", "An MBA or master's helps"] }
    ],
    "education": {
      "studies": [{ "name": "Computer Systems Analysis/Analyst" }, { "name": "Computer and Information Sciences, General" }, { "name": "Information Technology" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Most analysts have a degree in a computer field. Some come from business with strong tech skills, and an MBA can help you move up.",
        "noBachelorPct": "28%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 0.7 },
          { "label": "Finished high school", "pct": 5.1 },
          { "label": "Some college, no degree", "pct": 13.7 },
          { "label": "Associate's degree", "pct": 8.4 },
          { "label": "Bachelor's degree", "pct": 47.1 },
          { "label": "Master's degree", "pct": 22.4 },
          { "label": "Doctorate or professional degree", "pct": 2.5 }
        ]
      },
      "pay": { "starting": "$67,340", "typical": "$105,850", "top": "$167,710", "note": "Computer systems design firms hire the most, almost 1 in 4 analysts." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +42,900 by 2035. It is growing much faster than most jobs." }
    }
  },

  // BLS has no separate textile engineer occupation. The CIP-SOC crosswalk
  // maps Textile Sciences and Engineering to Materials Engineers (17-2131),
  // so every BLS figure here is for all materials engineers; tasks, skills
  // and software follow O*NET 17-2131.00. OEWS publishes no South Dakota
  // wage for 17-2131, so there is no yourStates row.
  "textile-and-materials-engineer": {
    "slug": "textile-and-materials-engineer",
    "title": "Textile and Materials Engineer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/textile-and-materials-engineer.webp",
    "summary": "Creates and tests new fabrics, plastics and metals for things like sports gear, cars and planes.",
    "scenario": "Imagine a running shoe that has to be light and still last 500 miles. You test fabric after fabric until one does both.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$112,860/year" },
      { "label": "People doing it", "value": "23,800" },
      { "label": "Jobs open each year", "value": "1,300" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "New Mexico", "pay": "$173K" }, { "state": "Washington", "pay": "$149K" }, { "state": "Maryland", "pay": "$141K" }] },
    "knowAbout": ["How things get engineered and built", "Math", "How factories make things", "Physics", "Chemistry"],
    "goodAt": ["Solving tricky problems", "Checking quality", "Making good calls", "Finding why a material fails", "Testing how well a material works"],
    "software": ["Dassault Systemes SolidWorks", "Autodesk AutoCAD", "The MathWorks MATLAB", "Python", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Materials Engineer", "pay": "$72K", "description": "You run lab tests on fabrics and materials while senior engineers guide you.", "whatYouDo": ["Run lab tests", "Record results", "Check product quality", "Help pick materials"], "toGetHere": ["Bachelor's in materials or textile engineering", "Internships help"] },
      { "number": "2", "jobTitle": "Textile or Materials Engineer", "pay": "$113K", "description": "You choose and improve the materials a product is made from.", "whatYouDo": ["Pick materials", "Find why parts fail", "Plan how to make materials", "Test new products"], "toGetHere": ["Bachelor's degree", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Materials Engineer", "pay": "$143K", "description": "You lead lab work and guide the team that builds new materials.", "whatYouDo": ["Lead lab work", "Guide the team", "Set test methods", "Work with designers"], "toGetHere": ["Years as an engineer", "PE license or master's helps"] }
    ],
    "education": {
      "studies": [{ "name": "Textile Sciences and Engineering" }, { "name": "Materials Engineering" }, { "name": "Polymer/Plastics Engineering" }, { "name": "Metallurgical Engineering" }],
      "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }]
    },
    "sources": BLS_SOURCES + " BLS has no separate textile engineer occupation, so pay and job figures are for all materials engineers (SOC 17-2131).",
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "A bachelor's in materials science, textile engineering or a close field is the usual start. Internships give you a head start.",
        "noBachelorPct": "21%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 1.2 },
          { "label": "Finished high school", "pct": 5.1 },
          { "label": "Some college, no degree", "pct": 5.7 },
          { "label": "Associate's degree", "pct": 8.7 },
          { "label": "Bachelor's degree", "pct": 50.3 },
          { "label": "Master's degree", "pct": 19.0 },
          { "label": "Doctorate or professional degree", "pct": 10.0 }
        ]
      },
      "pay": { "starting": "$72,300", "typical": "$112,860", "top": "$175,720", "note": "BLS counts textile engineers with all materials engineers, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,800 by 2035. It is growing much faster than most jobs." }
    }
  },

  "web-developer": {
    "slug": "web-developer",
    "title": "Web Developer",
    "world": "Tech & Engineering",
    "photo": "/images/app/browse/web-developer.webp",
    "summary": "Builds the websites and web apps people use every day.",
    "scenario": "Imagine a small bakery wants to take orders online by Friday. You build the site, test it on every phone and watch the first order come in.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$92,650/year" },
      { "label": "People doing it", "value": "87,400" },
      { "label": "Jobs open each year", "value": "5,300" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$54K" }], "best": [{ "state": "Virginia", "pay": "$130K" }, { "state": "Washington", "pay": "$124K" }, { "state": "California", "pay": "$123K" }] },
    "knowAbout": ["Computers and electronics", "Clear writing in English", "Math", "Media and design", "How websites work"],
    "goodAt": ["Writing code", "Solving tricky problems", "Making good calls", "Managing your time", "Testing your own work"],
    "software": ["React", "TypeScript", "Git", "WordPress", "PostgreSQL"],
    "ladder": [
      { "number": "1", "jobTitle": "Junior Web Developer", "pay": "$48K", "description": "You build pages and fix bugs while a senior developer reviews your code.", "whatYouDo": ["Build web pages", "Fix bugs", "Test on phones and browsers", "Update site content"], "toGetHere": ["Coding skills and a portfolio", "A degree helps"] },
      { "number": "2", "jobTitle": "Web Developer", "pay": "$93K", "description": "You build full websites and web apps and keep them fast and working.", "whatYouDo": ["Write site code", "Build databases", "Pick the right tools", "Test every update"], "toGetHere": ["Bachelor's in computer science or related", "Real projects to show"] },
      { "number": "3", "jobTitle": "Senior Web Developer", "pay": "$126K", "description": "You plan how big sites are built and guide other developers.", "whatYouDo": ["Plan site structure", "Review others' code", "Choose new tools", "Coach developers"], "toGetHere": ["Years of building sites"] }
    ],
    "education": {
      "studies": [{ "name": "Web Page, Digital/Multimedia and Information Resources Design" }, { "name": "Web/Multimedia Management and Webmaster" }, { "name": "Computer Science" }],
      "where": [{ "count": "", "credential": "Trade school certificate" }, { "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }]
    },
    "sources": BLS_SOURCES,
    "factDetails": {
      "degree": {
        "doorAsksFor": "Bachelor's degree",
        "experienceFirst": "No. You can start without it",
        "trainingAfterHiring": "None required",
        "note": "Paths vary. Some jobs ask for a bachelor's in computer science, and others hire people who show strong projects and coding skills.",
        "noBachelorPct": "30%",
        "distribution": [
          { "label": "Did not finish high school", "pct": 1.0 },
          { "label": "Finished high school", "pct": 5.9 },
          { "label": "Some college, no degree", "pct": 14.1 },
          { "label": "Associate's degree", "pct": 8.5 },
          { "label": "Bachelor's degree", "pct": 53.9 },
          { "label": "Master's degree", "pct": 15.2 },
          { "label": "Doctorate or professional degree", "pct": 1.4 }
        ]
      },
      "pay": { "starting": "$48,100", "typical": "$92,650", "top": "$162,290", "note": "Almost 1 in 5 web developers work for themselves." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +3,300 by 2035. It is growing about as fast as most jobs." }
    }
  },
};
