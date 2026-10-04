// Career Detail profiles for the 4 Oct 2026 poster drop, batch 2 (BROWSE Images).
// Sourced: bls.gov Occupational Outlook Handbook pages (2025-35 edition),
// Employment Projections table 1.2 (employment 2025, openings and change
// 2025-35, typical education, experience and training), OEWS May 2025
// national percentiles (10th, median, 90th) and state annual means (OEWS
// Profiles, data.bls.gov), and table 5.3 education mix (ACS 2023-24); tasks,
// knowledge, skills and software from O*NET OnLine. SOC codes: Forester
// 19-1032, Landscaper 37-3011, Soil and Plant Scientist 19-1013, Veterinary
// Assistant 31-9096, Wildlife Biologist 19-1023, Appliance Repair Technician
// 49-9031, Bicycle Mechanic 49-3091, Instrument Repairer 49-9063 (musical
// instruments, matching the poster photo), Maintenance Supervisor 49-1011,
// Baker 51-3011, Butcher 51-3021, Executive Chef 35-1011, Food Prep Worker
// 35-2021, Kitchen Supervisor 35-1012, Line Cook 35-2014, Restaurant Manager
// 11-9051. Four titles have no BLS occupation of their own and use the
// closest one, noted above each entry and in its sources line: Flavor
// Chemist uses Chemists 19-2031 (the OOH A-Z index sends Food Chemist there),
// Sensory Scientist uses Food Scientists and Technologists 19-1012 (O*NET
// 19-1012.00 tasks cover taste and texture testing), Park Ranger or
// Naturalist uses Conservation Scientists 19-1031 (O*NET files Park
// Naturalists, 19-1031.03, there, with Park Ranger and Naturalist as sample
// titles), and Sommelier uses Waiters and Waitresses 35-3031 (the OOH A-Z index
// sends Wine Steward there). Three more use a broader BLS group: Kitchen
// Supervisor's also counts dining room supervisors, Executive Chef's also
// counts sous chefs and head cooks, and Maintenance Supervisor's counts all
// repair crew supervisors. Ladder pay: a matching occupation's OEWS median
// where one exists; an entry rung inside the same occupation uses its 10th
// percentile and a senior rung its 75th percentile; "" where no OEWS
// occupation matches. yourStates is South Dakota, like every other profile.
import type { CareerProfile } from "./profiles";

export const LIB2_PROFILES: Record<string, CareerProfile> = {
  // BLS has no separate flavor chemist occupation. The OOH A-Z index sends
  // Food Chemist to Chemists and Materials Scientists, so every BLS figure
  // here is for Chemists (19-2031); tasks, skills and software follow O*NET
  // 19-2031.00. The first ladder rung, Flavor Technician, is the OOH A-Z
  // title for Food Science Technicians (19-4013).
  "flavor-chemist": {
    "slug": "flavor-chemist",
    "title": "Flavor Chemist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/flavor-chemist.webp",
    "summary": "Creates the flavors that make foods and drinks taste the way they do.",
    "scenario": "Imagine a snack company wants a strawberry flavor that tastes like real fruit. You mix and test tiny amounts in the lab until the taste is just right.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$91,240/year" },
      { "label": "People doing it", "value": "84,900" },
      { "label": "Jobs open each year", "value": "5,900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$73K" }], "best": [{ "state": "District of Columbia", "pay": "$149K" }, { "state": "Maryland", "pay": "$139K" }, { "state": "Massachusetts", "pay": "$129K" }] },
    "knowAbout": ["Chemistry", "How food gets made and processed", "Math", "Running lab tests", "Computers"],
    "goodAt": ["Science", "Solving tricky problems", "Reading technical papers", "Explaining your results", "Writing clear reports"],
    "software": ["Agilent ChemStation", "Waters Empower Chromatography Data Software", "CambridgeSoft ChemOffice Ultra", "Minitab", "SAP software"],
    "ladder": [
      { "number": "1", "jobTitle": "Flavor Technician", "pay": "$52K", "description": "You weigh, mix and test flavor samples while a senior chemist guides you.", "whatYouDo": ["Weigh ingredients", "Mix test batches", "Run lab tests", "Record results"], "toGetHere": ["Associate's or bachelor's degree in science"] },
      { "number": "2", "jobTitle": "Flavor Chemist", "pay": "$91K", "description": "You build new flavors from scratch and test them until they hit the target.", "whatYouDo": ["Design new flavors", "Analyze compounds", "Test products", "Write reports"], "toGetHere": ["Bachelor's degree in chemistry or food science", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Flavor Chemist", "pay": "$126K", "description": "You lead flavor projects, train newer chemists and work with clients.", "whatYouDo": ["Lead flavor projects", "Train new chemists", "Meet with clients", "Check others' work"], "toGetHere": ["Years as a flavor chemist", "A master's or Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "Chemistry, General" }, { "name": "Organic Chemistry" }, { "name": "Analytical Chemistry" }, { "name": "Food Science" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no flavor chemist occupation of its own, so the BLS figures are for all chemists (SOC 19-2031); the OOH A-Z index sends Food Chemist there.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's degree in chemistry is the usual way in. Research jobs may ask for a master's or Ph.D.", "noBachelorPct": "8%", "distribution": [{ "label": "Did not finish high school", "pct": 1.0 }, { "label": "Finished high school", "pct": 2.3 }, { "label": "Some college, no degree", "pct": 2.8 }, { "label": "Associate's degree", "pct": 1.9 }, { "label": "Bachelor's degree", "pct": 50.2 }, { "label": "Master's degree", "pct": 21.1 }, { "label": "Doctorate or professional degree", "pct": 20.7 }] },
      "pay": { "starting": "$58,460", "typical": "$91,240", "top": "$160,830", "note": "BLS counts flavor chemists with all chemists, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +5,500 by 2035. It is growing faster than most jobs." }
    }
  },
  "forester": {
    "slug": "forester",
    "title": "Forester",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/forester.webp",
    "summary": "Takes care of forests so they stay healthy and useful for years to come.",
    "scenario": "Imagine walking 500 acres of forest with a map and a measuring tape. You decide which trees to cut, which to save and where to plant next.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$76,400/year" },
      { "label": "People doing it", "value": "13,200" },
      { "label": "Jobs open each year", "value": "900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$66K" }], "best": [{ "state": "California", "pay": "$111K" }, { "state": "Illinois", "pay": "$87K" }, { "state": "Connecticut", "pay": "$86K" }] },
    "knowAbout": ["Biology", "Maps and land", "Math", "Running a team or a business", "Working with landowners"],
    "goodAt": ["Careful thinking", "Keeping watch on how things change", "Reading plans and rules", "Talking with people", "Writing clear reports"],
    "software": ["Esri ArcGIS", "Forest vegetation simulators", "Trimble CENGEA", "Microsoft Access", "Microsoft Outlook"],
    "ladder": [
      { "number": "1", "jobTitle": "Forestry Technician", "pay": "$55K", "description": "You measure trees, mark timber and collect field data for a forester.", "whatYouDo": ["Measure trees", "Mark timber", "Map land", "Collect field data"], "toGetHere": ["Certificate or associate's degree in forestry"] },
      { "number": "2", "jobTitle": "Forester", "pay": "$76K", "description": "You plan how a forest is managed, from planting to harvest.", "whatYouDo": ["Plan forest care", "Run timber sales", "Inspect forests", "Follow state rules"], "toGetHere": ["Bachelor's degree in forestry"] },
      { "number": "3", "jobTitle": "Senior Forester", "pay": "$92K", "description": "You lead big forest projects and guide a team of foresters and techs.", "whatYouDo": ["Lead forest projects", "Write contracts", "Guide a team", "Advise landowners"], "toGetHere": ["Years as a forester", "A state license in some states"] }
    ],
    "education": { "studies": [{ "name": "Forestry, General" }, { "name": "Forest Management/Forest Resources Management" }, { "name": "Natural Resources/Conservation, General" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Most foresters have a bachelor's degree in forestry, natural resources or a close field.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 71.6 }, { "label": "Master's degree", "pct": 25.2 }, { "label": "Doctorate or professional degree", "pct": 3.2 }] },
      "pay": { "starting": "$50,790", "typical": "$76,400", "top": "$109,700", "note": "About 6 in 10 foresters work for state, local or federal government." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +300 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  "landscaper": {
    "slug": "landscaper",
    "title": "Landscaper",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/landscaper.webp",
    "summary": "Plants, trims and cares for lawns, gardens and outdoor spaces.",
    "scenario": "Imagine a bare dirt yard on Monday. By Friday, you and your crew have laid sod, planted shrubs and built a garden the owners love.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$39,150/year" },
      { "label": "People doing it", "value": "1,188,600" },
      { "label": "Jobs open each year", "value": "149,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$37K" }], "best": [{ "state": "District of Columbia", "pay": "$51K" }, { "state": "Massachusetts", "pay": "$51K" }, { "state": "Washington", "pay": "$49K" }] },
    "knowAbout": ["Serving customers", "Machines and tools", "Fertilizers and plant care", "Building and construction", "Safety on the job"],
    "goodAt": ["Running mowers and power tools", "Following a design plan", "Spotting problems early", "Listening to customers", "Working outside all day"],
    "software": ["Microsoft Excel", "Microsoft Word", "Microsoft Office software", "Microsoft Windows", "Facebook"],
    "ladder": [
      { "number": "1", "jobTitle": "Landscaping Crew Member", "pay": "$31K", "description": "You learn the basics on a crew, from mowing to planting.", "whatYouDo": ["Mow lawns", "Rake and weed", "Carry materials", "Load equipment"], "toGetHere": ["No degree needed", "Training on the job"] },
      { "number": "2", "jobTitle": "Landscaper", "pay": "$39K", "description": "You plant, trim and shape outdoor spaces with power tools and hand tools.", "whatYouDo": ["Trim trees and shrubs", "Lay sod", "Plant flowers", "Run power equipment"], "toGetHere": ["A season or two on a crew"] },
      { "number": "3", "jobTitle": "Landscaping Crew Supervisor", "pay": "$58K", "description": "You lead a crew, plan each day's jobs and make sure clients are happy.", "whatYouDo": ["Lead a crew", "Plan the day's jobs", "Talk with clients", "Check the work"], "toGetHere": ["Years of landscaping work"] }
    ],
    "education": { "studies": [{ "name": "Landscaping and Groundskeeping" }, { "name": "Turf and Turfgrass Management" }, { "name": "Applied Horticulture/Horticulture Operations, General" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training", "note": "Most landscapers learn on the job in a few weeks. Classes in plants and soil can help you move up.", "noBachelorPct": "90%", "distribution": [{ "label": "Did not finish high school", "pct": 35.4 }, { "label": "Finished high school", "pct": 35.4 }, { "label": "Some college, no degree", "pct": 14.6 }, { "label": "Associate's degree", "pct": 5.0 }, { "label": "Bachelor's degree", "pct": 7.9 }, { "label": "Master's degree", "pct": 1.3 }, { "label": "Doctorate or professional degree", "pct": 0.4 }] },
      "pay": { "starting": "$31,150", "typical": "$39,150", "top": "$56,730", "note": "About 20% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +55,600 by 2035. It is growing faster than most jobs." }
    }
  },
  // BLS has no separate park ranger or naturalist occupation. O*NET files
  // Park Naturalists (19-1031.03, sample titles include Park Ranger and
  // Naturalist) under Conservation Scientists (19-1031), so every BLS figure
  // here is for all conservation scientists; tasks, skills and software
  // follow O*NET 19-1031.03. No OEWS occupation matches a seasonal guide, so
  // the first rung has no pay.
  "park-ranger-or-naturalist": {
    "slug": "park-ranger-or-naturalist",
    "title": "Park Ranger or Naturalist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/park-ranger-or-naturalist.webp",
    "summary": "Teaches visitors about parks and nature and helps keep public lands healthy.",
    "scenario": "Imagine leading 30 kids along a forest trail. You stop at a beaver dam and show them how one animal can change a whole stream.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$73,010/year" },
      { "label": "People doing it", "value": "27,700" },
      { "label": "Jobs open each year", "value": "2,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$76K" }], "best": [{ "state": "District of Columbia", "pay": "$99K" }, { "state": "Virginia", "pay": "$93K" }, { "state": "Rhode Island", "pay": "$92K" }] },
    "knowAbout": ["Biology", "Helping visitors", "Teaching and training", "Maps and land", "Public safety"],
    "goodAt": ["Speaking to groups", "Listening to visitors", "Writing clearly", "Careful thinking", "Planning events"],
    "software": ["Microsoft Office software", "Mapping software", "Adobe Acrobat", "Microsoft PowerPoint", "Microsoft Outlook"],
    "ladder": [
      { "number": "1", "jobTitle": "Seasonal Park Guide", "pay": "", "description": "You spend a season leading walks and helping visitors while you learn the park.", "whatYouDo": ["Lead walks", "Answer questions", "Staff the visitor center", "Help with events"], "toGetHere": ["Study toward a natural resources degree", "A summer park job"] },
      { "number": "2", "jobTitle": "Park Ranger or Naturalist", "pay": "$73K", "description": "You teach visitors about the park and help keep it safe and healthy.", "whatYouDo": ["Give nature talks", "Plan park events", "Explain park rules", "Train volunteers"], "toGetHere": ["Bachelor's degree in natural resources or biology"] },
      { "number": "3", "jobTitle": "Lead Park Ranger", "pay": "$92K", "description": "You run the park's programs and lead the seasonal staff.", "whatYouDo": ["Lead park programs", "Manage seasonal staff", "Plan big events", "Work with park managers"], "toGetHere": ["Years as a ranger", "Leadership experience"] }
    ],
    "education": { "studies": [{ "name": "Natural Resources/Conservation, General" }, { "name": "Parks, Recreation and Leisure Facilities Management, General" }, { "name": "Wildlife, Fish and Wildlands Science and Management" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no park ranger or naturalist occupation of its own, so the BLS figures are for all conservation scientists (SOC 19-1031), where O*NET files Park Naturalists (19-1031.03).",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Most rangers and naturalists have a bachelor's degree in natural resources, biology or a close field.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 71.6 }, { "label": "Master's degree", "pct": 25.2 }, { "label": "Doctorate or professional degree", "pct": 3.2 }] },
      "pay": { "starting": "$47,550", "typical": "$73,010", "top": "$110,410", "note": "BLS counts park rangers and naturalists with all conservation scientists, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,500 by 2035. It is growing faster than most jobs." }
    }
  },
  // BLS has no separate sensory scientist occupation. Taste, smell and
  // texture testing is part of Food Scientists and Technologists (19-1012)
  // in O*NET 19-1012.00, so every BLS figure here is for that whole group.
  // The first rung uses Food Science Technicians (19-4013).
  "sensory-scientist": {
    "slug": "sensory-scientist",
    "title": "Sensory Scientist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/sensory-scientist.webp",
    "summary": "Uses taste tests and science to learn how people experience food and drinks.",
    "scenario": "Imagine 50 people tasting three new yogurts from little cups. You design the test, crunch the scores and tell the company which one wins.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$88,720/year" },
      { "label": "People doing it", "value": "14,100" },
      { "label": "Jobs open each year", "value": "1,000" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$88K" }], "best": [{ "state": "Massachusetts", "pay": "$117K" }, { "state": "New Jersey", "pay": "$112K" }, { "state": "South Carolina", "pay": "$112K" }] },
    "knowAbout": ["How food gets made and processed", "Food and ingredients", "Chemistry", "Math and statistics", "Biology"],
    "goodAt": ["Learning new things fast", "Careful thinking", "Reading research", "Listening closely", "Explaining your results"],
    "software": ["STATISTICA", "R", "Tableau", "Microsoft Excel", "SAP software"],
    "ladder": [
      { "number": "1", "jobTitle": "Sensory Technician", "pay": "$52K", "description": "You set up taste tests, prepare samples and collect the scores.", "whatYouDo": ["Set up taste tests", "Prepare samples", "Collect scores", "Keep lab records"], "toGetHere": ["Associate's or bachelor's degree in food science"] },
      { "number": "2", "jobTitle": "Sensory Scientist", "pay": "$89K", "description": "You design taste tests and turn the results into advice for product teams.", "whatYouDo": ["Design taste tests", "Analyze results", "Work with product teams", "Write reports"], "toGetHere": ["Bachelor's degree in food science", "Lab experience"] },
      { "number": "3", "jobTitle": "Senior Sensory Scientist", "pay": "$117K", "description": "You lead research projects and help decide which products launch.", "whatYouDo": ["Lead research projects", "Train panel leaders", "Advise product teams", "Present findings"], "toGetHere": ["Years as a sensory scientist", "A master's or Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "Food Science" }, { "name": "Food Technology and Processing" }, { "name": "Food Science and Technology, Other" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no sensory scientist occupation of its own, so the BLS figures are for all food scientists and technologists (SOC 19-1012).",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "Most start with a bachelor's degree in food science or a close field. Some employers prefer a master's or Ph.D.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 63.5 }, { "label": "Master's degree", "pct": 23.8 }, { "label": "Doctorate or professional degree", "pct": 12.7 }] },
      "pay": { "starting": "$52,920", "typical": "$88,720", "top": "$145,280", "note": "BLS counts sensory scientists with all food scientists and technologists, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +900 by 2035. It is growing faster than most jobs." }
    }
  },
  "soil-and-plant-scientist": {
    "slug": "soil-and-plant-scientist",
    "title": "Soil and Plant Scientist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/soil-and-plant-scientist.webp",
    "summary": "Studies soil and crops to help farms grow more food and protect the land.",
    "scenario": "Imagine a farmer's corn turning yellow in July. You test the soil, find what it is missing and help save next year's crop.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$78,850/year" },
      { "label": "People doing it", "value": "19,900" },
      { "label": "Jobs open each year", "value": "1,400" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$79K" }], "best": [{ "state": "District of Columbia", "pay": "$111K" }, { "state": "Colorado", "pay": "$107K" }, { "state": "Iowa", "pay": "$104K" }] },
    "knowAbout": ["Biology", "Chemistry", "Computers", "Math", "Maps and land"],
    "goodAt": ["Science", "Careful thinking", "Learning new things fast", "Reading research", "Explaining results to farmers"],
    "software": ["Esri ArcGIS", "R", "STATISTICA", "Autodesk AutoCAD", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Agricultural Technician", "pay": "$50K", "description": "You collect samples and care for test plots while a scientist guides you.", "whatYouDo": ["Collect soil samples", "Run lab tests", "Care for test plots", "Record data"], "toGetHere": ["Associate's degree in agriculture or science"] },
      { "number": "2", "jobTitle": "Soil and Plant Scientist", "pay": "$79K", "description": "You run experiments on soil and crops and share what works with farmers.", "whatYouDo": ["Run field experiments", "Test soil", "Advise farmers", "Write reports"], "toGetHere": ["Bachelor's degree in agronomy, soil or plant science"] },
      { "number": "3", "jobTitle": "Senior Soil or Plant Scientist", "pay": "$104K", "description": "You lead research and help develop new crop types.", "whatYouDo": ["Lead research", "Develop new crop types", "Guide a team", "Share findings"], "toGetHere": ["Years of research", "A master's or Ph.D. helps"] }
    ],
    "education": { "studies": [{ "name": "Soil Science and Agronomy, General" }, { "name": "Agronomy and Crop Science" }, { "name": "Plant Sciences, General" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "You need at least a bachelor's degree in plant science, soil science or a close field. Some employers prefer a master's or Ph.D.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 63.5 }, { "label": "Master's degree", "pct": 23.8 }, { "label": "Doctorate or professional degree", "pct": 12.7 }] },
      "pay": { "starting": "$48,680", "typical": "$78,850", "top": "$138,120", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,300 by 2035. It is growing much faster than most jobs." }
    }
  },
  "veterinary-assistant": {
    "slug": "veterinary-assistant",
    "title": "Veterinary Assistant",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/veterinary-assistant.webp",
    "summary": "Helps vets care for animals by feeding, cleaning and calming them during exams.",
    "scenario": "Imagine a scared puppy shaking on the exam table. You hold it gently and keep it calm while the vet gives its first shots.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$38,150/year" },
      { "label": "People doing it", "value": "132,100" },
      { "label": "Jobs open each year", "value": "23,200" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$33K" }], "best": [{ "state": "District of Columbia", "pay": "$56K" }, { "state": "Massachusetts", "pay": "$48K" }, { "state": "California", "pay": "$47K" }] },
    "knowAbout": ["Caring for customers", "Biology", "Office work", "Animal health basics", "Computers"],
    "goodAt": ["Listening to vets and pet owners", "Watching animals for changes", "Staying calm", "Keeping things clean", "Writing clear notes"],
    "software": ["IDEXX Laboratories IDEXX Cornerstone", "McAllister Software Systems AVImark", "Practice management software", "Microsoft Excel", "Microsoft Outlook"],
    "ladder": [
      { "number": "1", "jobTitle": "Kennel Attendant", "pay": "$35K", "description": "You feed, walk and clean up after the animals in a clinic or kennel.", "whatYouDo": ["Feed animals", "Clean kennels", "Walk dogs", "Watch for illness"], "toGetHere": ["No degree needed", "A love of animals"] },
      { "number": "2", "jobTitle": "Veterinary Assistant", "pay": "$38K", "description": "You help the vet during exams and care for animals before and after treatment.", "whatYouDo": ["Hold animals during exams", "Clean exam rooms", "Help with lab tests", "Watch animals after surgery"], "toGetHere": ["High school diploma", "Training on the job"] },
      { "number": "3", "jobTitle": "Veterinary Technician", "pay": "$47K", "description": "You take on more medical work, like x-rays, lab tests and helping in surgery.", "whatYouDo": ["Take x-rays", "Give medicine", "Run lab tests", "Help in surgery"], "toGetHere": ["Associate's degree in veterinary technology", "State credential"] }
    ],
    "education": { "studies": [{ "name": "Veterinary/Animal Health Technology/Technician and Veterinary Assistant" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training", "note": "Most vet assistants learn on the job. Some take a short vet assistant program first.", "noBachelorPct": "61%", "distribution": [{ "label": "Did not finish high school", "pct": 3.3 }, { "label": "Finished high school", "pct": 15.8 }, { "label": "Some college, no degree", "pct": 28.3 }, { "label": "Associate's degree", "pct": 13.5 }, { "label": "Bachelor's degree", "pct": 35.6 }, { "label": "Master's degree", "pct": 2.2 }, { "label": "Doctorate or professional degree", "pct": 1.3 }] },
      "pay": { "starting": "$30,120", "typical": "$38,150", "top": "$49,150", "note": "BLS groups vet assistants with lab animal caretakers, so these figures cover both." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +12,000 by 2035. It is growing much faster than most jobs." }
    }
  },
  "wildlife-biologist": {
    "slug": "wildlife-biologist",
    "title": "Wildlife Biologist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/wildlife-biologist.webp",
    "summary": "Studies wild animals and their habitats to help them thrive.",
    "scenario": "Imagine tracking a radio-collared bear through the mountains at dawn. Your data helps decide how to protect its forest.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$76,780/year" },
      { "label": "People doing it", "value": "19,500" },
      { "label": "Jobs open each year", "value": "1,400" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$69K" }], "best": [{ "state": "District of Columbia", "pay": "$118K" }, { "state": "California", "pay": "$112K" }, { "state": "Maryland", "pay": "$104K" }] },
    "knowAbout": ["Biology", "Maps and land", "Math and statistics", "Laws that protect wildlife", "Computers"],
    "goodAt": ["Listening closely", "Reading research", "Science", "Speaking to groups", "Writing reports"],
    "software": ["Esri ArcGIS", "R", "SAS", "Python", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Wildlife Technician", "pay": "$58K", "description": "You count animals and collect field data for a research team.", "whatYouDo": ["Count animals", "Set traps and cameras", "Collect samples", "Enter field data"], "toGetHere": ["Bachelor's degree in wildlife or biology"] },
      { "number": "2", "jobTitle": "Wildlife Biologist", "pay": "$77K", "description": "You study animal groups and plan how to protect their habitat.", "whatYouDo": ["Study animal groups", "Plan habitat care", "Write reports", "Talk with the public"], "toGetHere": ["Bachelor's degree", "Field experience"] },
      { "number": "3", "jobTitle": "Senior Wildlife Biologist", "pay": "$96K", "description": "You lead research projects and write the plans that guide wildlife care.", "whatYouDo": ["Lead research", "Write management plans", "Guide a team", "Publish findings"], "toGetHere": ["A master's degree", "Years of field work"] }
    ],
    "education": { "studies": [{ "name": "Wildlife, Fish and Wildlands Science and Management" }, { "name": "Wildlife Biology" }, { "name": "Zoology/Animal Biology" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's degree gets you started. Higher level jobs may need a master's, and leading research usually takes a Ph.D.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 46.2 }, { "label": "Master's degree", "pct": 31.9 }, { "label": "Doctorate or professional degree", "pct": 21.9 }] },
      "pay": { "starting": "$49,100", "typical": "$76,780", "top": "$126,440", "note": "BLS counts wildlife biologists together with zoologists, so these figures cover both." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +700 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "appliance-repair-technician": {
    "slug": "appliance-repair-technician",
    "title": "Appliance Repair Technician",
    "world": "Fixing Machines & Engines",
    "photo": "/images/app/browse/appliance-repair-technician.webp",
    "summary": "Fixes washers, dryers, fridges and other home appliances when they break.",
    "scenario": "Imagine a family's fridge dies the day before a big party. You trace the problem to one bad part, swap it and save the food.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$50,990/year" },
      { "label": "People doing it", "value": "40,500" },
      { "label": "Jobs open each year", "value": "2,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$48K" }], "best": [{ "state": "Massachusetts", "pay": "$74K" }, { "state": "Connecticut", "pay": "$72K" }, { "state": "Virginia", "pay": "$67K" }] },
    "knowAbout": ["Serving customers", "Machines and moving parts", "Running a small business", "Computers and electronics", "Sales"],
    "goodAt": ["Troubleshooting", "Talking with customers", "Reading repair manuals", "Learning new models", "Giving fair price quotes"],
    "software": ["ServiceMax", "RazorSync", "Parts database software", "Route mapping software", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Appliance Repair Trainee", "pay": "$36K", "description": "You ride along on service calls and learn repairs from an experienced tech.", "whatYouDo": ["Ride along on calls", "Carry tools and parts", "Test parts", "Do simple repairs"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Appliance Repair Technician", "pay": "$51K", "description": "You visit homes, find what is broken and fix it on the spot.", "whatYouDo": ["Diagnose problems", "Test circuits", "Replace parts", "Give repair quotes"], "toGetHere": ["Training on the job", "EPA certification to work on fridges"] },
      { "number": "3", "jobTitle": "Senior Appliance Technician", "pay": "$63K", "description": "You take the toughest repairs and help train newer techs.", "whatYouDo": ["Handle tough repairs", "Train new techs", "Work on high-end models", "Run your own route"], "toGetHere": ["Years of repair work", "Manufacturer training helps"] }
    ],
    "education": { "studies": [{ "name": "Appliance Installation and Repair Technology/Technician" }], "where": [{ "count": "", "credential": "Trade school certificate" }, { "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training (1 to 12 months)", "note": "Most techs learn on the job next to an experienced tech. Trade school classes in electronics can help.", "noBachelorPct": "86%", "distribution": [{ "label": "Did not finish high school", "pct": 9.3 }, { "label": "Finished high school", "pct": 44.4 }, { "label": "Some college, no degree", "pct": 26.6 }, { "label": "Associate's degree", "pct": 5.8 }, { "label": "Bachelor's degree", "pct": 9.6 }, { "label": "Master's degree", "pct": 4.2 }, { "label": "Doctorate or professional degree", "pct": 0.1 }] },
      "pay": { "starting": "$36,190", "typical": "$50,990", "top": "$80,660", "note": "About 20% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +800 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  "bicycle-mechanic": {
    "slug": "bicycle-mechanic",
    "title": "Bicycle Mechanic",
    "world": "Fixing Machines & Engines",
    "photo": "/images/app/browse/bicycle-mechanic.webp",
    "summary": "Fixes, tunes and builds bicycles so riders stay safe and rolling.",
    "scenario": "Imagine a rider wheels in a bike with a snapped chain the day before a big race. You fix it, tune the gears and send them off ready to ride.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$42,780/year" },
      { "label": "People doing it", "value": "12,200" },
      { "label": "Jobs open each year", "value": "1,200" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$32K" }], "best": [{ "state": "Wyoming", "pay": "$52K" }, { "state": "New Jersey", "pay": "$52K" }, { "state": "Washington", "pay": "$49K" }] },
    "knowAbout": ["Machines and moving parts", "Helping customers", "Sales", "Safety", "How things are built"],
    "goodAt": ["Listening to riders", "Careful thinking", "Reading repair guides", "Explaining repairs", "Using hand tools"],
    "software": ["LightSpeed Cloud", "Pedal Powered Software Bicycle Repair Man", "RepairTRAX", "Microsoft Excel", "Microsoft Word"],
    "ladder": [
      { "number": "1", "jobTitle": "Bike Shop Trainee", "pay": "$31K", "description": "You build new bikes and learn basic repairs in a shop.", "whatYouDo": ["Build new bikes", "Fix flat tires", "Clean parts", "Help customers"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Bicycle Mechanic", "pay": "$43K", "description": "You repair and tune bikes and fit them to their riders.", "whatYouDo": ["Adjust gears and brakes", "Fit bikes to riders", "Write service tickets", "Replace parts"], "toGetHere": ["Training on the job", "A mechanic course helps"] },
      { "number": "3", "jobTitle": "Lead Mechanic", "pay": "$48K", "description": "You run the repair area, take the hardest jobs and train new mechanics.", "whatYouDo": ["Run the repair area", "Handle hard repairs", "Train new mechanics", "Order parts"], "toGetHere": ["Years as a mechanic"] }
    ],
    "education": { "studies": [{ "name": "Bicycle Mechanics and Repair Technology/Technician" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training (1 to 12 months)", "note": "Most mechanics learn in a bike shop. A short mechanic school can speed things up.", "noBachelorPct": "90%", "distribution": [{ "label": "Did not finish high school", "pct": 21.8 }, { "label": "Finished high school", "pct": 43.4 }, { "label": "Some college, no degree", "pct": 18.9 }, { "label": "Associate's degree", "pct": 6.1 }, { "label": "Bachelor's degree", "pct": 8.2 }, { "label": "Master's degree", "pct": 1.3 }, { "label": "Doctorate or professional degree", "pct": 0.3 }] },
      "pay": { "starting": "$31,220", "typical": "$42,780", "top": "$55,000", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -700 by 2035. It is shrinking a little, but bike shops still fill about 1,200 of these jobs each year." }
    }
  },
  // The poster shows a guitar repair bench, so this is Musical Instrument
  // Repairers and Tuners (49-9063). OEWS publishes no South Dakota wage
  // for 49-9063, so there is no yourStates row (same as the entries that
  // have no home-state figure).
  "instrument-repairer": {
    "slug": "instrument-repairer",
    "title": "Instrument Repairer",
    "world": "Fixing Machines & Engines",
    "photo": "/images/app/browse/instrument-repairer.webp",
    "summary": "Fixes and tunes guitars, pianos, horns and other musical instruments.",
    "scenario": "Imagine a guitarist hands you a guitar that buzzes on every note. You level the frets, adjust the neck and hand it back sounding perfect.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$46,420/year" },
      { "label": "People doing it", "value": "6,000" },
      { "label": "Jobs open each year", "value": "600" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Tennessee", "pay": "$59K" }, { "state": "Maine", "pay": "$58K" }, { "state": "New Jersey", "pay": "$58K" }] },
    "knowAbout": ["Helping customers", "Machines and moving parts", "Music and the arts", "Running a small business", "Sales"],
    "goodAt": ["Careful thinking", "Listening closely to sound", "Reading repair guides", "Talking with musicians", "Patient, steady hands"],
    "software": ["Katsura Shareware KS Strobe Tuner", "Veritune Verituner", "Tunic OnlyPure", "Katsura Shareware ProLevel"],
    "ladder": [
      { "number": "1", "jobTitle": "Apprentice Repair Technician", "pay": "$31K", "description": "You learn the craft in a repair shop, starting with simple jobs.", "whatYouDo": ["Clean instruments", "Restring guitars", "Replace pads and felts", "Learn from a master"], "toGetHere": ["High school diploma", "Accepted as an apprentice"] },
      { "number": "2", "jobTitle": "Instrument Repair Technician", "pay": "$46K", "description": "You tune and repair instruments, then play them to check your work.", "whatYouDo": ["Tune instruments", "Fix broken parts", "Play-test repairs", "Rebuild worn parts"], "toGetHere": ["Apprenticeship", "Repair school helps"] },
      { "number": "3", "jobTitle": "Master Repair Technician", "pay": "$58K", "description": "You restore rare instruments and train the next apprentices.", "whatYouDo": ["Restore rare instruments", "Train apprentices", "Run a repair shop", "Price repairs"], "toGetHere": ["Many years of repair work"] }
    ],
    "education": { "studies": [{ "name": "Musical Instrument Fabrication and Repair" }], "where": [{ "count": "", "credential": "Apprenticeship certificate" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Apprenticeship", "note": "Most repairers learn as apprentices in a repair shop. Some first take a repair program at a trade school.", "noBachelorPct": "72%", "distribution": [{ "label": "Did not finish high school", "pct": 4.2 }, { "label": "Finished high school", "pct": 23.3 }, { "label": "Some college, no degree", "pct": 25.0 }, { "label": "Associate's degree", "pct": 19.6 }, { "label": "Bachelor's degree", "pct": 21.6 }, { "label": "Master's degree", "pct": 4.5 }, { "label": "Doctorate or professional degree", "pct": 1.8 }] },
      "pay": { "starting": "$31,220", "typical": "$46,420", "top": "$71,600", "note": "About 8% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +100 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  // Maintenance Supervisor uses First-Line Supervisors of Mechanics,
  // Installers, and Repairers (49-1011), the BLS group for people who lead
  // repair and maintenance crews. The top rung uses Facilities Managers
  // (11-3013) and the first rung General Maintenance and Repair Workers
  // (49-9071).
  "maintenance-supervisor": {
    "slug": "maintenance-supervisor",
    "title": "Maintenance Supervisor",
    "world": "Fixing Machines & Engines",
    "photo": "/images/app/browse/maintenance-supervisor.webp",
    "summary": "Leads the team that keeps a building's or a plant's machines and systems running.",
    "scenario": "Imagine the heat goes out in a school on the coldest day of the year. You send the right tech, find the part and have classrooms warm by lunch.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$79,860/year" },
      { "label": "People doing it", "value": "629,000" },
      { "label": "Jobs open each year", "value": "48,900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$83K" }], "best": [{ "state": "Alaska", "pay": "$99K" }, { "state": "Washington", "pay": "$99K" }, { "state": "California", "pay": "$98K" }] },
    "knowAbout": ["Running a team or a business", "Machines and moving parts", "Serving customers", "Office work and records", "Hiring and training people"],
    "goodAt": ["Checking work quality", "Careful thinking", "Giving clear directions", "Listening to your crew", "Teaching new workers"],
    "software": ["Computerized maintenance management system CMMS", "SAP software", "Autodesk AutoCAD", "Microsoft Project", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Maintenance Technician", "pay": "$50K", "description": "You fix equipment and keep a building's systems in good shape.", "whatYouDo": ["Fix equipment", "Do routine checks", "Repair plumbing and wiring", "Log work orders"], "toGetHere": ["High school diploma", "Trade training"] },
      { "number": "2", "jobTitle": "Maintenance Supervisor", "pay": "$80K", "description": "You assign repair jobs, check the work and keep your crew safe.", "whatYouDo": ["Assign repair jobs", "Check finished work", "Run safety training", "Track parts and costs"], "toGetHere": ["A few years as a technician"] },
      { "number": "3", "jobTitle": "Facilities Manager", "pay": "$107K", "description": "You plan upkeep for whole buildings and manage the budget and teams.", "whatYouDo": ["Plan building upkeep", "Set budgets", "Manage contractors", "Lead several teams"], "toGetHere": ["Years as a supervisor", "A bachelor's degree helps"] }
    ],
    "education": { "studies": [{ "name": "Mechanics and Repairers, General" }, { "name": "Industrial Mechanics and Maintenance Technology/Technician" }, { "name": "Building/Property Maintenance" }], "where": [{ "count": "", "credential": "Trade school certificate" }, { "count": "", "credential": "Associate's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. Figures are for first-line supervisors of mechanics, installers and repairers (SOC 49-1011), the BLS group that includes maintenance supervisors.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "Yes. Usually up to 5 years in a repair job first", "trainingAfterHiring": "None required", "note": "This is a job you grow into. Most supervisors start as mechanics or technicians and move up.", "noBachelorPct": "85%", "distribution": [{ "label": "Did not finish high school", "pct": 6.7 }, { "label": "Finished high school", "pct": 36.5 }, { "label": "Some college, no degree", "pct": 27.3 }, { "label": "Associate's degree", "pct": 14.3 }, { "label": "Bachelor's degree", "pct": 11.8 }, { "label": "Master's degree", "pct": 2.7 }, { "label": "Doctorate or professional degree", "pct": 0.6 }] },
      "pay": { "starting": "$49,600", "typical": "$79,860", "top": "$126,790", "note": "BLS counts all repair supervisors together, from building upkeep to car shops, so these figures cover that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +25,500 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "baker": {
    "slug": "baker",
    "title": "Baker",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/baker.webp",
    "summary": "Mixes, shapes and bakes breads, pastries and other baked goods.",
    "scenario": "Imagine starting your shift at 4 a.m. By the time the shop opens, 200 loaves and trays of croissants are cooling on the racks.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$37,160/year" },
      { "label": "People doing it", "value": "262,400" },
      { "label": "Jobs open each year", "value": "36,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$39K" }], "best": [{ "state": "Hawaii", "pay": "$48K" }, { "state": "Washington", "pay": "$47K" }, { "state": "District of Columbia", "pay": "$45K" }] },
    "knowAbout": ["How food gets made", "Food and ingredients", "Running a business", "Serving customers", "Food safety"],
    "goodAt": ["Measuring exactly", "Watching what is in the oven", "Listening to orders", "Keeping the kitchen clean and safe", "Doing kitchen math"],
    "software": ["Culinary Software Services ChefTec", "Afcom Datasafe Computer Services FlexiBake", "Axxya Systems Nutritionist Pro", "Microsoft Excel", "ADP Enterprise eTIME"],
    "ladder": [
      { "number": "1", "jobTitle": "Baker's Helper", "pay": "$28K", "description": "You weigh ingredients and help the bakers get every batch ready.", "whatYouDo": ["Weigh ingredients", "Grease pans", "Clean equipment", "Pack baked goods"], "toGetHere": ["No degree needed"] },
      { "number": "2", "jobTitle": "Baker", "pay": "$37K", "description": "You mix, shape and bake breads and pastries and check each batch.", "whatYouDo": ["Mix doughs", "Set oven temps", "Shape and bake", "Check quality"], "toGetHere": ["Training on the job", "Baking school helps"] },
      { "number": "3", "jobTitle": "Head Baker", "pay": "$44K", "description": "You plan the day's baking, create recipes and train the team.", "whatYouDo": ["Plan daily baking", "Create recipes", "Train bakers", "Order supplies"], "toGetHere": ["Years as a baker"] }
    ],
    "education": { "studies": [{ "name": "Baking and Pastry Arts/Baker/Pastry Chef" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training (1 to 12 months)", "note": "Most bakers learn on the job. Baking school or a culinary program can help you start further along.", "noBachelorPct": "83%", "distribution": [{ "label": "Did not finish high school", "pct": 16.8 }, { "label": "Finished high school", "pct": 34.5 }, { "label": "Some college, no degree", "pct": 21.8 }, { "label": "Associate's degree", "pct": 10.1 }, { "label": "Bachelor's degree", "pct": 12.9 }, { "label": "Master's degree", "pct": 3.2 }, { "label": "Doctorate or professional degree", "pct": 0.8 }] },
      "pay": { "starting": "$28,120", "typical": "$37,160", "top": "$49,020", "note": "About 10% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +14,500 by 2035. It is growing faster than most jobs." }
    }
  },
  "butcher": {
    "slug": "butcher",
    "title": "Butcher",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/butcher.webp",
    "summary": "Cuts, trims and prepares meat for stores and restaurants.",
    "scenario": "Imagine a customer asks for a special roast for a holiday dinner. You trim, tie and shape it so it is the star of the table.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$40,140/year" },
      { "label": "People doing it", "value": "138,400" },
      { "label": "Jobs open each year", "value": "15,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$41K" }], "best": [{ "state": "Washington", "pay": "$53K" }, { "state": "Alaska", "pay": "$52K" }, { "state": "Hawaii", "pay": "$51K" }] },
    "knowAbout": ["Serving customers", "How meat is handled", "How food gets processed", "Sales", "Math"],
    "goodAt": ["Careful knife work", "Listening to customers", "Checking meat quality", "Doing quick math", "Keeping things clean and safe"],
    "software": ["Financial accounting software", "Microsoft Excel", "Microsoft Office software", "Microsoft Outlook", "Microsoft Word"],
    "ladder": [
      { "number": "1", "jobTitle": "Meat Cutter Trainee", "pay": "$29K", "description": "You wrap, label and stock meat while you learn the basic cuts.", "whatYouDo": ["Wrap and label meat", "Clean the cutting room", "Stock the case", "Learn basic cuts"], "toGetHere": ["No degree needed"] },
      { "number": "2", "jobTitle": "Butcher", "pay": "$40K", "description": "You cut and trim meat and make special cuts for customers.", "whatYouDo": ["Cut and trim meat", "Make special cuts", "Grind meat", "Help customers"], "toGetHere": ["Training on the job"] },
      { "number": "3", "jobTitle": "Lead Butcher", "pay": "$48K", "description": "You run the meat counter, order stock and train new cutters.", "whatYouDo": ["Run the meat counter", "Order meat", "Train new cutters", "Check quality"], "toGetHere": ["Years as a butcher"] }
    ],
    "education": { "studies": [{ "name": "Meat Cutting/Meat Cutter" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training (1 to 12 months)", "note": "Most butchers learn on the job from an experienced cutter. Some take a short meat cutting program.", "noBachelorPct": "95%", "distribution": [{ "label": "Did not finish high school", "pct": 29.9 }, { "label": "Finished high school", "pct": 44.3 }, { "label": "Some college, no degree", "pct": 15.5 }, { "label": "Associate's degree", "pct": 5.3 }, { "label": "Bachelor's degree", "pct": 4.5 }, { "label": "Master's degree", "pct": 0.4 }, { "label": "Doctorate or professional degree", "pct": 0.2 }] },
      "pay": { "starting": "$29,460", "typical": "$40,140", "top": "$58,110", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +3,300 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  // BLS counts executive chefs, sous chefs and head cooks together as
  // Chefs and Head Cooks (35-1011); the OOH A-Z index sends both Executive
  // Chef and Sous Chef there. So the Sous Chef rung uses the group median
  // and the Executive Chef rung its 75th percentile.
  "executive-chef": {
    "slug": "executive-chef",
    "title": "Executive Chef",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/executive-chef.webp",
    "summary": "Runs a restaurant kitchen, from creating the menu to leading the cooks.",
    "scenario": "Imagine 200 dinner orders on a Saturday night. You call out tickets, taste every sauce and make sure each plate leaves looking perfect.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$62,470/year" },
      { "label": "People doing it", "value": "220,300" },
      { "label": "Jobs open each year", "value": "25,200" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$48K" }], "best": [{ "state": "Rhode Island", "pay": "$85K" }, { "state": "Hawaii", "pay": "$81K" }, { "state": "District of Columbia", "pay": "$80K" }] },
    "knowAbout": ["Food and cooking", "How food gets prepared", "Serving guests", "Hiring and training staff", "Running a business"],
    "goodAt": ["Watching quality closely", "Giving clear directions", "Careful thinking", "Teaching cooks", "Staying calm under pressure"],
    "software": ["Culinary Software Services ChefTec", "CostGuard", "SoftCafe MenuPro", "Microsoft Excel", "ADP eTIME"],
    "ladder": [
      { "number": "1", "jobTitle": "Line Cook", "pay": "$37K", "description": "You cook at one station and learn how a busy kitchen runs.", "whatYouDo": ["Cook on the line", "Prep ingredients", "Plate dishes", "Keep your station clean"], "toGetHere": ["No degree needed", "Kitchen experience"] },
      { "number": "2", "jobTitle": "Sous Chef", "pay": "$62K", "description": "You are the chef's second in command and run the kitchen on busy nights.", "whatYouDo": ["Run the kitchen on busy nights", "Train cooks", "Check every plate", "Order supplies"], "toGetHere": ["Years as a line cook", "Culinary school helps"] },
      { "number": "3", "jobTitle": "Executive Chef", "pay": "$79K", "description": "You create the menu, lead the whole kitchen and keep food costs on track.", "whatYouDo": ["Create menus", "Lead the kitchen team", "Set food costs", "Keep the kitchen safe and clean"], "toGetHere": ["5 or more years in kitchens", "Sous chef experience"] }
    ],
    "education": { "studies": [{ "name": "Culinary Arts/Chef Training" }, { "name": "Restaurant, Culinary, and Catering Management/Manager" }, { "name": "Cooking and Related Culinary Arts, General" }], "where": [{ "count": "", "credential": "Trade school certificate" }, { "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS counts executive chefs with sous chefs and head cooks (SOC 35-1011), so the figures are for that whole group.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "Yes. Usually 5 years or more in a kitchen", "trainingAfterHiring": "None required", "note": "This is a job you grow into. Most executive chefs worked their way up from line cook. Culinary school can help.", "noBachelorPct": "85%", "distribution": [{ "label": "Did not finish high school", "pct": 17.7 }, { "label": "Finished high school", "pct": 31.6 }, { "label": "Some college, no degree", "pct": 20.3 }, { "label": "Associate's degree", "pct": 15.7 }, { "label": "Bachelor's degree", "pct": 12.2 }, { "label": "Master's degree", "pct": 1.9 }, { "label": "Doctorate or professional degree", "pct": 0.7 }] },
      "pay": { "starting": "$37,900", "typical": "$62,470", "top": "$98,560", "note": "BLS counts executive chefs with sous chefs and head cooks, so these figures cover all of them." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +14,400 by 2035. It is growing much faster than most jobs." }
    }
  },
  "food-prep-worker": {
    "slug": "food-prep-worker",
    "title": "Food Prep Worker",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/food-prep-worker.webp",
    "summary": "Gets ingredients ready so cooks can make meals fast.",
    "scenario": "Imagine 40 pounds of onions, 20 heads of lettuce and a lunch rush in two hours. You chop, portion and stock every station so the cooks never wait.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$35,320/year" },
      { "label": "People doing it", "value": "908,500" },
      { "label": "Jobs open each year", "value": "135,700" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$32K" }], "best": [{ "state": "Washington", "pay": "$43K" }, { "state": "Hawaii", "pay": "$42K" }, { "state": "California", "pay": "$41K" }] },
    "knowAbout": ["Serving customers", "Food and cooking", "How food gets prepared", "Food safety", "Teamwork in a kitchen"],
    "goodAt": ["Listening to cooks", "Working fast and safely", "Keeping things clean", "Following recipes", "Learning new tasks"],
    "software": ["Culinary Software Services ChefTec", "CBORD NetRecipe", "Microsoft Excel", "Microsoft Office software", "Quizlet"],
    "ladder": [
      { "number": "1", "jobTitle": "Food Prep Worker", "pay": "$35K", "description": "You wash, chop and store food so every station is ready.", "whatYouDo": ["Wash and chop food", "Store food safely", "Check fridge temps", "Clean work areas"], "toGetHere": ["No degree needed"] },
      { "number": "2", "jobTitle": "Line Cook", "pay": "$37K", "description": "You cook dishes to order at one station of the kitchen.", "whatYouDo": ["Cook to order", "Season food", "Plate dishes", "Keep food at safe temps"], "toGetHere": ["Some kitchen experience"] },
      { "number": "3", "jobTitle": "Kitchen Supervisor", "pay": "$44K", "description": "You lead the kitchen crew during a shift and train new workers.", "whatYouDo": ["Assign stations", "Train workers", "Check portions", "Solve problems fast"], "toGetHere": ["Years in the kitchen"] }
    ],
    "education": { "studies": [{ "name": "Food Preparation/Professional Cooking/Kitchen Assistant" }, { "name": "Cooking and Related Culinary Arts, General" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training", "note": "You learn on the job, often in a few weeks. It is a common first step toward cooking.", "noBachelorPct": "90%", "distribution": [{ "label": "Did not finish high school", "pct": 24.4 }, { "label": "Finished high school", "pct": 40.8 }, { "label": "Some college, no degree", "pct": 17.6 }, { "label": "Associate's degree", "pct": 6.7 }, { "label": "Bachelor's degree", "pct": 8.6 }, { "label": "Master's degree", "pct": 1.5 }, { "label": "Doctorate or professional degree", "pct": 0.5 }] },
      "pay": { "starting": "$25,810", "typical": "$35,320", "top": "$45,340", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -27,200 by 2035. It is shrinking a little, but kitchens still fill about 135,700 of these jobs each year." }
    }
  },
  // Kitchen Supervisor uses First-Line Supervisors of Food Preparation and
  // Serving Workers (35-1012), a BLS group that also counts dining room
  // supervisors, so every BLS figure here covers both.
  "kitchen-supervisor": {
    "slug": "kitchen-supervisor",
    "title": "Kitchen Supervisor",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/kitchen-supervisor.webp",
    "summary": "Leads the kitchen crew during a shift and keeps the food coming out right.",
    "scenario": "Imagine two cooks call out sick before the dinner rush. You shuffle the stations, jump on the grill and still get every order out on time.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$44,080/year" },
      { "label": "People doing it", "value": "1,236,400" },
      { "label": "Jobs open each year", "value": "171,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$43K" }], "best": [{ "state": "Washington", "pay": "$62K" }, { "state": "District of Columbia", "pay": "$58K" }, { "state": "Connecticut", "pay": "$56K" }] },
    "knowAbout": ["Serving customers", "Running a team", "Food and cooking", "How food gets prepared", "Training people"],
    "goodAt": ["Keeping an eye on the whole shift", "Giving clear directions", "Listening to your team", "Teaching new workers", "Solving problems fast"],
    "software": ["CBORD Foodservice Suite", "ADP Workforce Now", "Staff scheduling software", "Intuit QuickBooks Point of Sale", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Line Cook", "pay": "$37K", "description": "You cook at one station and learn how the whole kitchen fits together.", "whatYouDo": ["Cook to order", "Prep ingredients", "Plate dishes", "Keep your station clean"], "toGetHere": ["No degree needed", "Kitchen experience"] },
      { "number": "2", "jobTitle": "Kitchen Supervisor", "pay": "$44K", "description": "You run the kitchen crew during a shift and make sure every plate is right.", "whatYouDo": ["Assign stations", "Train workers", "Check portions", "Handle complaints"], "toGetHere": ["Kitchen experience", "A food safety class helps"] },
      { "number": "3", "jobTitle": "Restaurant Manager", "pay": "$69K", "description": "You run the whole restaurant, from staff to budget.", "whatYouDo": ["Run the restaurant", "Hire staff", "Track budgets", "Keep guests happy"], "toGetHere": ["Years as a supervisor"] }
    ],
    "education": { "studies": [{ "name": "Culinary Arts/Chef Training" }, { "name": "Restaurant, Culinary, and Catering Management/Manager" }, { "name": "Foodservice Systems Administration/Management" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }, { "count": "", "credential": "Associate's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. Figures are for first-line supervisors of food preparation and serving workers (SOC 35-1012), a group that also counts dining room supervisors.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "Yes. Usually up to 5 years in a kitchen first", "trainingAfterHiring": "None required", "note": "Most supervisors move up from cook or server jobs. A food safety class helps.", "noBachelorPct": "83%", "distribution": [{ "label": "Did not finish high school", "pct": 10.4 }, { "label": "Finished high school", "pct": 36.3 }, { "label": "Some college, no degree", "pct": 26.3 }, { "label": "Associate's degree", "pct": 10.1 }, { "label": "Bachelor's degree", "pct": 14.0 }, { "label": "Master's degree", "pct": 2.4 }, { "label": "Doctorate or professional degree", "pct": 0.4 }] },
      "pay": { "starting": "$29,940", "typical": "$44,080", "top": "$65,570", "note": "BLS counts kitchen supervisors with dining room supervisors, so these figures cover both." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +67,100 by 2035. It is growing faster than most jobs." }
    }
  },
  "line-cook": {
    "slug": "line-cook",
    "title": "Line Cook",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/line-cook.webp",
    "summary": "Cooks dishes to order at one station of a busy restaurant kitchen.",
    "scenario": "Imagine the grill station on a Friday night with 15 tickets hanging. You fire steaks, flip burgers and time each one to land with the rest of the table.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$37,390/year" },
      { "label": "People doing it", "value": "1,417,500" },
      { "label": "Jobs open each year", "value": "218,600" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$37K" }], "best": [{ "state": "Washington", "pay": "$47K" }, { "state": "Hawaii", "pay": "$47K" }, { "state": "District of Columbia", "pay": "$46K" }] },
    "knowAbout": ["Food and cooking", "Talking with your team", "Serving customers", "How food gets prepared", "Kitchen math"],
    "goodAt": ["Working fast under pressure", "Watching every dish", "Following recipes", "Listening to the chef", "Keeping your station clean"],
    "software": ["Point of sale POS restaurant software", "Menu planning software", "Recipe cost control software", "Food safety labeling systems", "Microsoft Excel"],
    "ladder": [
      { "number": "1", "jobTitle": "Prep Cook", "pay": "$35K", "description": "You chop, portion and stock food so the line is ready to cook.", "whatYouDo": ["Chop and portion food", "Make sauces", "Stock stations", "Clean up"], "toGetHere": ["No degree needed"] },
      { "number": "2", "jobTitle": "Line Cook", "pay": "$37K", "description": "You cook dishes to order at your station and plate them fast.", "whatYouDo": ["Cook to order", "Season food", "Plate dishes", "Keep food at safe temps"], "toGetHere": ["Some kitchen experience"] },
      { "number": "3", "jobTitle": "Head Cook or Chef", "pay": "$62K", "description": "You lead the cooks, plan menus and check every plate.", "whatYouDo": ["Lead the cooks", "Plan menus", "Order food", "Check quality"], "toGetHere": ["Years on the line", "Culinary school helps"] }
    ],
    "education": { "studies": [{ "name": "Culinary Arts/Chef Training" }, { "name": "Cooking and Related Culinary Arts, General" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "Yes. Usually some time in a kitchen first", "trainingAfterHiring": "On-the-job training (1 to 12 months)", "note": "Most cooks start as prep cooks and learn on the job. Culinary school is one way in, but you can start without it.", "noBachelorPct": "93%", "distribution": [{ "label": "Did not finish high school", "pct": 26.7 }, { "label": "Finished high school", "pct": 42.6 }, { "label": "Some college, no degree", "pct": 17.4 }, { "label": "Associate's degree", "pct": 6.0 }, { "label": "Bachelor's degree", "pct": 5.9 }, { "label": "Master's degree", "pct": 1.0 }, { "label": "Doctorate or professional degree", "pct": 0.4 }] },
      "pay": { "starting": "$28,700", "typical": "$37,390", "top": "$47,900", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +171,400 by 2035. It is growing much faster than most jobs." }
    }
  },
  "restaurant-manager": {
    "slug": "restaurant-manager",
    "title": "Restaurant Manager",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/restaurant-manager.webp",
    "summary": "Runs a restaurant day to day, from the staff and food to the budget.",
    "scenario": "Imagine a full dining room, a broken dishwasher and a big party at the door. You fix the plan in minutes and every guest leaves happy.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$69,390/year" },
      { "label": "People doing it", "value": "344,300" },
      { "label": "Jobs open each year", "value": "38,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$64K" }], "best": [{ "state": "Washington", "pay": "$102K" }, { "state": "District of Columbia", "pay": "$95K" }, { "state": "New York", "pay": "$94K" }] },
    "knowAbout": ["Serving customers", "Running a business", "Food and cooking", "Hiring and training staff", "Sales and marketing"],
    "goodAt": ["Listening to guests and staff", "Keeping an eye on everything", "Talking clearly", "Solving problems fast", "Teaching new workers"],
    "software": ["Intuit QuickBooks", "Culinary Software Services ChefTec", "Restaurant Manager", "Microsoft Excel", "Oracle Taleo"],
    "ladder": [
      { "number": "1", "jobTitle": "Shift Supervisor", "pay": "$44K", "description": "You run a shift, train new staff and handle guest questions.", "whatYouDo": ["Run a shift", "Train servers and cooks", "Count the cash", "Handle complaints"], "toGetHere": ["Restaurant experience"] },
      { "number": "2", "jobTitle": "Restaurant Manager", "pay": "$69K", "description": "You hire and schedule staff, order food and keep the budget on track.", "whatYouDo": ["Hire and schedule staff", "Order food", "Track budgets", "Keep things safe and clean"], "toGetHere": ["Years as a supervisor", "A hospitality degree helps"] },
      { "number": "3", "jobTitle": "General Manager", "pay": "$87K", "description": "You set the goals for the whole restaurant and lead its managers.", "whatYouDo": ["Set goals", "Lead managers", "Grow sales", "Own the budget"], "toGetHere": ["Years as a manager"] }
    ],
    "education": { "studies": [{ "name": "Restaurant/Food Services Management" }, { "name": "Hospitality Administration/Management, General" }, { "name": "Restaurant, Culinary, and Catering Management/Manager" }], "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "Yes. Usually up to 5 years in a restaurant first", "trainingAfterHiring": "Short on-the-job training", "note": "Most managers move up from server, cook or shift lead. A hospitality degree can help you move up faster.", "noBachelorPct": "75%", "distribution": [{ "label": "Did not finish high school", "pct": 9.2 }, { "label": "Finished high school", "pct": 29.9 }, { "label": "Some college, no degree", "pct": 25.5 }, { "label": "Associate's degree", "pct": 10.2 }, { "label": "Bachelor's degree", "pct": 20.5 }, { "label": "Master's degree", "pct": 3.7 }, { "label": "Doctorate or professional degree", "pct": 0.9 }] },
      "pay": { "starting": "$45,960", "typical": "$69,390", "top": "$107,640", "note": "About 31% run their own place, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +19,900 by 2035. It is growing faster than most jobs." }
    }
  },
  // BLS has no separate sommelier occupation. The OOH A-Z index sends Wine
  // Steward to Waiters and Waitresses (35-3031), so every BLS figure here is
  // for that whole group; tasks, skills and software follow O*NET 35-3031.00,
  // which lists the Court of Master Sommeliers. No OEWS occupation matches
  // the sommelier rung, so it has no pay. The top rung uses Food Service
  // Managers (11-9051), where the CIP-SOC crosswalk places the Wine
  // Steward/Sommelier program.
  "sommelier": {
    "slug": "sommelier",
    "title": "Sommelier",
    "world": "Food & Cooking",
    "photo": "/images/app/browse/sommelier.webp",
    "summary": "Helps guests pick the right wine and runs a restaurant's wine list.",
    "scenario": "Imagine a couple celebrating with a steak and a fish dish. You suggest one wine that goes with both and make their night.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$35,230/year" },
      { "label": "People doing it", "value": "2,284,400" },
      { "label": "Jobs open each year", "value": "423,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$31K" }], "best": [{ "state": "Hawaii", "pay": "$68K" }, { "state": "Washington", "pay": "$61K" }, { "state": "District of Columbia", "pay": "$60K" }] },
    "knowAbout": ["Serving guests", "Sales", "Food and wine", "Math", "Reading people"],
    "goodAt": ["Listening to guests", "Describing taste clearly", "Watching the room", "Careful thinking", "Remembering details"],
    "software": ["Hospitality Control Solutions Aloha Point-of-Sale", "Intuit QuickBooks Point of Sale", "NCR Advanced Checkout Solution", "Compris Advanced Manager's Workstation"],
    "ladder": [
      { "number": "1", "jobTitle": "Server", "pay": "$35K", "description": "You serve guests and start learning the wine list.", "whatYouDo": ["Take orders", "Pour wine", "Learn the wine list", "Check on guests"], "toGetHere": ["No degree needed"] },
      { "number": "2", "jobTitle": "Sommelier", "pay": "", "description": "You help guests choose wine and pair it with their food.", "whatYouDo": ["Suggest wines", "Pair wine with food", "Taste and order wines", "Teach servers about wine"], "toGetHere": ["Wine classes", "Sommelier certification helps"] },
      { "number": "3", "jobTitle": "Beverage Director", "pay": "$69K", "description": "You build the wine list, buy from suppliers and train the staff.", "whatYouDo": ["Build the wine list", "Buy from suppliers", "Track costs", "Train the staff"], "toGetHere": ["Years as a sommelier"] }
    ],
    "education": { "studies": [{ "name": "Wine Steward/Sommelier" }, { "name": "Food Service, Waiter/Waitress, and Dining Room Management/Manager" }], "where": [{ "count": "", "credential": "On-the-job training" }, { "count": "", "credential": "Certificate, under a year" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS has no sommelier occupation of its own, so the BLS figures are for all waiters and waitresses (SOC 35-3031); the OOH A-Z index sends Wine Steward there.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training", "note": "Most sommeliers start as servers and learn about wine on the job. Many take wine classes and earn a certificate.", "noBachelorPct": "82%", "distribution": [{ "label": "Did not finish high school", "pct": 12.5 }, { "label": "Finished high school", "pct": 34.3 }, { "label": "Some college, no degree", "pct": 26.1 }, { "label": "Associate's degree", "pct": 9.5 }, { "label": "Bachelor's degree", "pct": 14.6 }, { "label": "Master's degree", "pct": 2.5 }, { "label": "Doctorate or professional degree", "pct": 0.6 }] },
      "pay": { "starting": "$18,100", "typical": "$35,230", "top": "$64,720", "note": "BLS counts sommeliers (wine stewards) with all waiters and waitresses, so these figures cover that whole group. They include tips." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +46,500 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
};
