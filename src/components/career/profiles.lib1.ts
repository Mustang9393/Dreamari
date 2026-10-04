// Career Detail profiles for the 4 Oct 2026 poster drop, batch 1 (BROWSE Images).
// Sourced: people, openings, change and typical entry education from BLS
// Employment Projections table 1.2 (2025-35); starting / typical / top pay
// (10th, 50th, 90th percentile), ladder pay (10th, 50th, 75th percentile or
// the median of the named rung's own occupation) and state annual means
// from OEWS May 2025 (yourStates is South Dakota, like every other entry;
// best is the top 3 by annual mean, DC counted, territories left out);
// degree mix from BLS table 5.3 (2023-24); growth words follow the OOH
// glossary for 2025-35; study fields from the NCES CIP 2020 to SOC 2018
// crosswalk; tasks, knowledge, skills and software from O*NET OnLine. SOC
// codes: Electronics Assembler 51-2028 (O*NET 51-2022.00), Furniture
// Finisher 51-7021, Metal Fabricator 51-2041, Press Machine Operator
// 51-4031, Printing Press Operator 51-5112, Production Helper 51-9198,
// Production Supervisor 51-1011, Quality Inspector 51-9061, Quality Manager
// 11-3051 (O*NET 11-3051.01), Sewing Machine Operator 51-6031, Tailor
// 51-6052, Upholsterer 51-6093, Agricultural Engineer 17-2021, Agricultural
// Inspector 45-2011, Animal Breeder 45-2021, Animal Caretaker 39-2021,
// Animal Scientist 19-1011, Conservation Scientist 19-1031, Environmental
// Technician 19-4042, Farm Worker 45-2092. Mapped to a broader occupation:
// Electronics Assembler (BLS folds 51-2022 into 51-2028), Quality Manager
// (no BLS occupation of its own; O*NET files it under Industrial Production
// Managers) and Farm Worker (the crop, nursery and greenhouse group, the
// largest farm worker group); see the note above each. Production Helper,
// Production Supervisor, Printing Press Operator, Sewing Machine Operator,
// Tailor, Upholsterer and Agricultural Inspector have no OOH profile of
// their own, so their figures come from the projections and OEWS tables
// alone. Where the crosswalk lists no study field, "studies" says so.
// Table 5.3 gives Animal Breeders the same degree mix as farm workers.
import type { CareerProfile } from "./profiles";

export const LIB1_PROFILES: Record<string, CareerProfile> = {
  // BLS publishes no separate electronics assembler figures. O*NET's
  // Electrical and Electronic Equipment Assemblers (51-2022.00) sits inside
  // SOC 51-2028, so every BLS figure here is for that whole group; tasks,
  // skills and software follow O*NET 51-2022.00.
  "electronics-assembler": {
    "slug": "electronics-assembler",
    "title": "Electronics Assembler",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/electronics-assembler.webp",
    "summary": "Builds the circuit boards, wiring and parts inside electronic devices.",
    "scenario": "Imagine a tray of tiny parts and a bare circuit board in front of you. By lunch it is a working piece of a machine that a hospital will use.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$45,850/year" },
      { "label": "People doing it", "value": "246,300" },
      { "label": "Jobs open each year", "value": "25,900" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$44K" }], "best": [{ "state": "Washington", "pay": "$61K" }, { "state": "California", "pay": "$53K" }, { "state": "Maryland", "pay": "$52K" }] },
    "knowAbout": ["How factories make things", "Reading wiring diagrams", "Small hand tools and soldering", "Testing circuits", "Running a team or a business"],
    "goodAt": ["Reading work orders and diagrams", "Thinking problems through", "Steady, careful hands", "Checking your own work", "Explaining steps to coworkers"],
    "software": ["Microsoft Excel", "Microsoft Office", "SAP", "Sage 100 ERP", "National Instruments LabVIEW"],
    "ladder": [
      { "number": "1", "jobTitle": "Assembly Trainee", "pay": "$35K", "description": "You learn each step of the build while a lead checks your work.", "whatYouDo": ["Sort and clean parts", "Follow build sheets", "Solder simple joints", "Pack finished units"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Electronics Assembler", "pay": "$46K", "description": "You build and test full assemblies from diagrams.", "whatYouDo": ["Read schematics", "Install parts and wiring", "Test circuits", "Record results"], "toGetHere": ["Months of on-the-job training"] },
      { "number": "3", "jobTitle": "Assembly Supervisor", "pay": "$74K", "description": "You run an assembly line and the team on it.", "whatYouDo": ["Plan the day's builds", "Train new assemblers", "Solve line problems", "Check quality"], "toGetHere": ["Years as an assembler", "Strong record on the line"] }
    ],
    "education": { "studies": [{ "name": "No set field. Most people learn on the job" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS counts electronics assemblers in the larger group of electrical, electronic and electromechanical assemblers (SOC 51-2028), so pay and job figures are for that whole group.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "Most assemblers learn on the job in a few months. Some take electronics classes at a technical school first.", "noBachelorPct": "92%", "distribution": [{ "label": "Did not finish high school", "pct": 16.5 }, { "label": "Finished high school", "pct": 45.3 }, { "label": "Some college, no degree", "pct": 21.2 }, { "label": "Associate's degree", "pct": 9.0 }, { "label": "Bachelor's degree", "pct": 6.4 }, { "label": "Master's degree", "pct": 1.3 }, { "label": "Doctorate or professional degree", "pct": 0.3 }] },
      "pay": { "starting": "$35,350", "typical": "$45,850", "top": "$62,950", "note": "These figures cover all electrical, electronic and electromechanical assemblers." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +12,400 by 2035. It is growing faster than most jobs." }
    }
  },
  "furniture-finisher": {
    "slug": "furniture-finisher",
    "title": "Furniture Finisher",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/furniture-finisher.webp",
    "summary": "Sands, stains and seals wood furniture so it looks smooth and new.",
    "scenario": "Imagine an old oak table, scratched and dull. You strip it, fix the dents and stain it until the grain glows again.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$44,540/year" },
      { "label": "People doing it", "value": "15,900" },
      { "label": "Jobs open each year", "value": "1,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$42K" }], "best": [{ "state": "Massachusetts", "pay": "$57K" }, { "state": "Connecticut", "pay": "$56K" }, { "state": "New Hampshire", "pay": "$53K" }] },
    "knowAbout": ["How factories make things", "Machines and tools", "Wood and how it takes a finish", "Stains, paints and sealers", "Mixing colors"],
    "goodAt": ["Keeping an eye on every detail", "Thinking problems through", "Steady, patient hands", "Listening closely to what a customer wants", "Explaining your work clearly"],
    "software": ["Intuit QuickBooks", "Microsoft Office", "DuPont ColorNet", "Web browser software"],
    "ladder": [
      { "number": "1", "jobTitle": "Sander", "pay": "$32K", "description": "You prep wood so the finish goes on smooth.", "whatYouDo": ["Sand surfaces", "Mask off areas", "Fill small cracks", "Clean the shop"], "toGetHere": ["High school diploma", "Short on-the-job training"] },
      { "number": "2", "jobTitle": "Furniture Finisher", "pay": "$45K", "description": "You choose and apply the finish that makes a piece look its best.", "whatYouDo": ["Strip old finishes", "Mix stains to match", "Spray or brush on finish", "Repair dents and marks"], "toGetHere": ["Time as a sander or helper"] },
      { "number": "3", "jobTitle": "Senior Furniture Finisher", "pay": "$50K", "description": "You take on fine pieces and custom color work.", "whatYouDo": ["Restore antiques", "Match rare colors", "Train new finishers", "Check final quality"], "toGetHere": ["Years of finishing work"] }
    ],
    "education": { "studies": [{ "name": "Furniture Design and Manufacturing" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training, a month or less", "note": "Most finishers learn on the job. A woodworking or furniture class gives you a head start.", "noBachelorPct": "81%", "distribution": [{ "label": "Did not finish high school", "pct": 19.0 }, { "label": "Finished high school", "pct": 34.9 }, { "label": "Some college, no degree", "pct": 21.3 }, { "label": "Associate's degree", "pct": 5.3 }, { "label": "Bachelor's degree", "pct": 15.7 }, { "label": "Master's degree", "pct": 2.1 }, { "label": "Doctorate or professional degree", "pct": 1.6 }] },
      "pay": { "starting": "$32,160", "typical": "$44,540", "top": "$61,020", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -600 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  "metal-fabricator": {
    "slug": "metal-fabricator",
    "title": "Metal Fabricator",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/metal-fabricator.webp",
    "summary": "Cuts, bends and welds metal parts to build frames and large structures.",
    "scenario": "Imagine a steel beam the length of a bus lying on the shop floor. You mark it, cut it and weld it so it fits a bridge to the inch.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$51,330/year" },
      { "label": "People doing it", "value": "52,300" },
      { "label": "Jobs open each year", "value": "4,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$51K" }], "best": [{ "state": "Washington", "pay": "$67K" }, { "state": "Massachusetts", "pay": "$65K" }, { "state": "Oregon", "pay": "$64K" }] },
    "knowAbout": ["Math", "Machines and tools", "How factories make things", "Reading blueprints", "Welding and cutting"],
    "goodAt": ["Measuring exactly", "Reading blueprints", "Thinking problems through", "Listening closely to directions", "Explaining your work to the crew"],
    "software": ["Tekla software", "Dassault Systemes CATIA", "CAD software", "Microsoft Excel", "Microsoft Office"],
    "ladder": [
      { "number": "1", "jobTitle": "Fabrication Trainee", "pay": "$38K", "description": "You help skilled fabricators and learn the shop's machines.", "whatYouDo": ["Move and stack parts", "Mark cut lines", "Grind edges", "Tack-weld parts"], "toGetHere": ["High school diploma", "Months of on-the-job training"] },
      { "number": "2", "jobTitle": "Metal Fabricator", "pay": "$51K", "description": "You lay out, cut and fit metal parts from blueprints.", "whatYouDo": ["Read blueprints", "Run brakes and shears", "Fit and weld parts", "Check sizes"], "toGetHere": ["On-the-job training", "Welding skills"] },
      { "number": "3", "jobTitle": "Fabrication Shop Supervisor", "pay": "$74K", "description": "You lead the shop floor and the fabricators on it.", "whatYouDo": ["Plan jobs", "Assign the crew", "Check finished work", "Keep the shop safe"], "toGetHere": ["Years as a fabricator", "Strong blueprint skills"] }
    ],
    "education": { "studies": [{ "name": "Metal Fabricator" }, { "name": "Machine Shop Technology/Assistant" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "Most fabricators learn on the job over several months. A welding or metal shop class helps you get hired.", "noBachelorPct": "91%", "distribution": [{ "label": "Did not finish high school", "pct": 11.7 }, { "label": "Finished high school", "pct": 47.8 }, { "label": "Some college, no degree", "pct": 20.2 }, { "label": "Associate's degree", "pct": 10.8 }, { "label": "Bachelor's degree", "pct": 8.4 }, { "label": "Master's degree", "pct": 1.2 }, { "label": "Doctorate or professional degree", "pct": 0.0 }] },
      "pay": { "starting": "$37,960", "typical": "$51,330", "top": "$72,280", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -3,200 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  // Press Machine Operator maps to Cutting, Punching, and Press Machine
  // Setters, Operators, and Tenders, Metal and Plastic (51-4031); O*NET lists
  // Press Operator and Punch Press Operator as titles in it.
  "press-machine-operator": {
    "slug": "press-machine-operator",
    "title": "Press Machine Operator",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/press-machine-operator.webp",
    "summary": "Sets up and runs machines that cut, punch and bend metal or plastic into parts.",
    "scenario": "Imagine a press that stamps out a car door part every few seconds. You set it up, watch every part and stop it the moment one is off.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$46,330/year" },
      { "label": "People doing it", "value": "171,000" },
      { "label": "Jobs open each year", "value": "13,200" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$48K" }], "best": [{ "state": "Oregon", "pay": "$55K" }, { "state": "Washington", "pay": "$55K" }, { "state": "Colorado", "pay": "$55K" }] },
    "knowAbout": ["How factories make things", "Machines and tools", "Measuring parts", "Reading work orders", "Machine safety"],
    "goodAt": ["Keeping an eye on the machine", "Listening closely to directions", "Thinking problems through", "Measuring exactly", "Explaining problems clearly"],
    "software": ["CNC software", "Autodesk AutoCAD", "SAP", "Microsoft Excel", "Microsoft Office"],
    "ladder": [
      { "number": "1", "jobTitle": "Press Helper", "pay": "$39K", "description": "You load parts and keep the press area clear while you learn.", "whatYouDo": ["Load material", "Remove finished parts", "Count and tag parts", "Clean the area"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Press Machine Operator", "pay": "$46K", "description": "You run the press and check that every part matches the spec.", "whatYouDo": ["Start and watch machines", "Measure parts", "Adjust speeds", "Sort out bad parts"], "toGetHere": ["Months of on-the-job training"] },
      { "number": "3", "jobTitle": "Die Setter", "pay": "$55K", "description": "You set up the dies and tooling so the press makes the right part.", "whatYouDo": ["Change dies", "Set up new jobs", "Fix tooling problems", "Train operators"], "toGetHere": ["Years as an operator", "Setup skills"] }
    ],
    "education": { "studies": [{ "name": "Machine Tool Technology/Machinist" }, { "name": "Sheet Metal Technology/Sheetworking" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "Most operators learn on the job over several months. Shop and math classes help.", "noBachelorPct": "97%", "distribution": [{ "label": "Did not finish high school", "pct": 17.6 }, { "label": "Finished high school", "pct": 56.6 }, { "label": "Some college, no degree", "pct": 16.7 }, { "label": "Associate's degree", "pct": 5.6 }, { "label": "Bachelor's degree", "pct": 2.7 }, { "label": "Master's degree", "pct": 0.8 }, { "label": "Doctorate or professional degree", "pct": 0.1 }] },
      "pay": { "starting": "$35,760", "typical": "$46,330", "top": "$65,510", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -17,900 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  "printing-press-operator": {
    "slug": "printing-press-operator",
    "title": "Printing Press Operator",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/printing-press-operator.webp",
    "summary": "Sets up and runs the presses that print books, packages, labels and signs.",
    "scenario": "Imagine 50,000 cereal boxes on the press tonight. You check the first sheets, tune the ink and keep every color sharp to the last box.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$45,780/year" },
      { "label": "People doing it", "value": "144,000" },
      { "label": "Jobs open each year", "value": "12,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$46K" }], "best": [{ "state": "District of Columbia", "pay": "$105K" }, { "state": "New Jersey", "pay": "$56K" }, { "state": "Massachusetts", "pay": "$55K" }] },
    "knowAbout": ["Machines and tools", "How factories make things", "Ink, paper and color", "Reading job orders", "Press safety"],
    "goodAt": ["Keeping an eye on the run", "Listening closely to directions", "Thinking problems through", "Reading job tickets", "Spotting small color changes"],
    "software": ["Adobe Acrobat", "Adobe InDesign", "Adobe Photoshop", "Xerox FreeFlow Print Server", "EFI Pace"],
    "ladder": [
      { "number": "1", "jobTitle": "Press Assistant", "pay": "$33K", "description": "You feed paper, load ink and learn how the press runs.", "whatYouDo": ["Load paper", "Fill ink", "Stack finished work", "Clean rollers"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Printing Press Operator", "pay": "$46K", "description": "You set up and run the press and keep the print quality high.", "whatYouDo": ["Mount plates", "Check proofs", "Adjust ink flow", "Fix jams"], "toGetHere": ["Months of on-the-job training"] },
      { "number": "3", "jobTitle": "Pressroom Supervisor", "pay": "$74K", "description": "You run the pressroom schedule and the team.", "whatYouDo": ["Schedule jobs", "Train operators", "Check quality", "Keep presses running"], "toGetHere": ["Years as an operator"] }
    ],
    "education": { "studies": [{ "name": "Printing Press Operator" }, { "name": "Graphic and Printing Equipment Operator, General Production" }, { "name": "Printing Management" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "Most operators learn on the job over several months. Printing classes at a trade school help.", "noBachelorPct": "86%", "distribution": [{ "label": "Did not finish high school", "pct": 10.4 }, { "label": "Finished high school", "pct": 42.7 }, { "label": "Some college, no degree", "pct": 23.2 }, { "label": "Associate's degree", "pct": 9.2 }, { "label": "Bachelor's degree", "pct": 12.5 }, { "label": "Master's degree", "pct": 1.7 }, { "label": "Doctorate or professional degree", "pct": 0.3 }] },
      "pay": { "starting": "$33,330", "typical": "$45,780", "top": "$63,520", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -12,600 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  // OEWS publishes no South Dakota wage for 51-9198, so there is no yourStates row.
  "production-helper": {
    "slug": "production-helper",
    "title": "Production Helper",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/production-helper.webp",
    "summary": "Helps factory workers by moving materials, loading machines and keeping the line running.",
    "scenario": "Imagine a busy factory line where every station needs parts at the right time. You are the one who keeps them coming.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$39,070/year" },
      { "label": "People doing it", "value": "167,400" },
      { "label": "Jobs open each year", "value": "20,900" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Washington", "pay": "$48K" }, { "state": "Hawaii", "pay": "$47K" }, { "state": "Alaska", "pay": "$47K" }] },
    "knowAbout": ["How factories make things", "Clear reading and writing", "Machine safety", "Counting and sorting parts", "Lifting the right way"],
    "goodAt": ["Working at a steady pace", "Spotting problems early", "Following directions", "Lifting and moving safely", "Working as a team"],
    "software": ["Microsoft Excel", "Microsoft Office", "SAP", "Autodesk AutoCAD", "Adobe Acrobat"],
    "ladder": [
      { "number": "1", "jobTitle": "Production Helper", "pay": "$39K", "description": "You support the operators and learn how each machine works.", "whatYouDo": ["Load and unload machines", "Move materials", "Tag and count parts", "Clean work areas"], "toGetHere": ["High school diploma", "A few weeks of training"] },
      { "number": "2", "jobTitle": "Quality Inspector", "pay": "$49K", "description": "You check parts and products to make sure they meet the spec.", "whatYouDo": ["Measure parts", "Run tests", "Mark good and bad parts", "Write reports"], "toGetHere": ["Time on the line", "On-the-job training"] },
      { "number": "3", "jobTitle": "Production Supervisor", "pay": "$74K", "description": "You lead a shift and the workers on it.", "whatYouDo": ["Plan the shift", "Train new workers", "Solve line problems", "Keep the line safe"], "toGetHere": ["Years on the floor"] }
    ],
    "education": { "studies": [{ "name": "No set field. Most people learn on the job" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training, a month or less", "note": "You learn this job on the floor in a few weeks. It is a common first step into factory work.", "noBachelorPct": "88%", "distribution": [{ "label": "Did not finish high school", "pct": 25.3 }, { "label": "Finished high school", "pct": 40.5 }, { "label": "Some college, no degree", "pct": 16.8 }, { "label": "Associate's degree", "pct": 5.8 }, { "label": "Bachelor's degree", "pct": 8.8 }, { "label": "Master's degree", "pct": 1.9 }, { "label": "Doctorate or professional degree", "pct": 0.9 }] },
      "pay": { "starting": "$31,140", "typical": "$39,070", "top": "$53,410", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -13,800 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  "production-supervisor": {
    "slug": "production-supervisor",
    "title": "Production Supervisor",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/production-supervisor.webp",
    "summary": "Leads a team of factory workers and makes sure each shift hits its goals safely.",
    "scenario": "Imagine walking the floor at 6 a.m. with 40 people and 10 machines to run. By the end of the shift, the big order ships on time.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$74,450/year" },
      { "label": "People doing it", "value": "679,900" },
      { "label": "Jobs open each year", "value": "61,000" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$74K" }], "best": [{ "state": "Wyoming", "pay": "$95K" }, { "state": "District of Columbia", "pay": "$88K" }, { "state": "Louisiana", "pay": "$87K" }] },
    "knowAbout": ["How factories make things", "Running a team or a business", "Hiring and managing people", "Clear reading and writing", "Office records and paperwork"],
    "goodAt": ["Listening closely to your team", "Explaining things clearly", "Thinking problems through", "Keeping an eye on how things are going", "Teaching others new skills"],
    "software": ["SAP", "Microsoft Excel", "Minitab", "Autodesk AutoCAD", "Microsoft SharePoint"],
    "ladder": [
      { "number": "1", "jobTitle": "New Production Supervisor", "pay": "$47K", "description": "You lead a small crew while a senior manager backs you up.", "whatYouDo": ["Run a shift", "Track output", "Keep attendance", "Enforce safety rules"], "toGetHere": ["High school diploma", "A few years on the production floor"] },
      { "number": "2", "jobTitle": "Production Supervisor", "pay": "$74K", "description": "You plan the work, lead the team and fix problems on the line.", "whatYouDo": ["Plan schedules", "Assign work", "Check quality", "Train workers"], "toGetHere": ["Proven time leading a crew"] },
      { "number": "3", "jobTitle": "Industrial Production Manager", "pay": "$126K", "description": "You run a whole plant area and the supervisors in it.", "whatYouDo": ["Set production goals", "Manage budgets", "Lead supervisors", "Improve processes"], "toGetHere": ["Years as a supervisor", "A bachelor's degree often helps"] }
    ],
    "education": { "studies": [{ "name": "Operations Management and Supervision" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "On-the-job promotion" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "Yes. Usually a few years of production work first", "trainingAfterHiring": "None required", "note": "Most supervisors move up from the production floor. A few years of hands-on work is the usual way in.", "noBachelorPct": "83%", "distribution": [{ "label": "Did not finish high school", "pct": 8.9 }, { "label": "Finished high school", "pct": 39.8 }, { "label": "Some college, no degree", "pct": 24.3 }, { "label": "Associate's degree", "pct": 10.1 }, { "label": "Bachelor's degree", "pct": 13.3 }, { "label": "Master's degree", "pct": 3.1 }, { "label": "Doctorate or professional degree", "pct": 0.6 }] },
      "pay": { "starting": "$47,130", "typical": "$74,450", "top": "$108,750", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +12,400 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  "quality-inspector": {
    "slug": "quality-inspector",
    "title": "Quality Inspector",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/quality-inspector.webp",
    "summary": "Checks products and parts to make sure they are made right before they ship.",
    "scenario": "Imagine a box of airplane bolts that must be perfect. You measure each one to a fraction of a hair before it leaves the plant.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$48,570/year" },
      { "label": "People doing it", "value": "602,000" },
      { "label": "Jobs open each year", "value": "66,700" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$50K" }], "best": [{ "state": "Alaska", "pay": "$91K" }, { "state": "Washington", "pay": "$75K" }, { "state": "Maryland", "pay": "$66K" }] },
    "knowAbout": ["How factories make things", "Clear reading and writing", "Machines and tools", "Math", "Helping customers"],
    "goodAt": ["Thinking problems through", "Writing clear reports", "Listening closely", "Reading specs carefully", "Measuring exactly"],
    "software": ["Minitab", "Autodesk AutoCAD", "SolidWorks", "Microsoft Excel", "SAP"],
    "ladder": [
      { "number": "1", "jobTitle": "Inspector Trainee", "pay": "$36K", "description": "You learn the specs and tools while a senior inspector guides you.", "whatYouDo": ["Measure parts", "Sort good from bad", "Tag items", "Log results"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Quality Inspector", "pay": "$49K", "description": "You test and measure products and report what needs fixing.", "whatYouDo": ["Run tests", "Use gauges and calipers", "Write reports", "Suggest fixes"], "toGetHere": ["Months of on-the-job training"] },
      { "number": "3", "jobTitle": "Quality Supervisor", "pay": "$74K", "description": "You lead a team of inspectors and keep quality on track.", "whatYouDo": ["Lead inspectors", "Review reports", "Work with production", "Train new staff"], "toGetHere": ["Years as an inspector"] }
    ],
    "education": { "studies": [{ "name": "Quality Control Technology/Technician" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "Most inspectors learn on the job over several months. Math and shop classes help.", "noBachelorPct": "82%", "distribution": [{ "label": "Did not finish high school", "pct": 8.7 }, { "label": "Finished high school", "pct": 35.6 }, { "label": "Some college, no degree", "pct": 26.0 }, { "label": "Associate's degree", "pct": 11.4 }, { "label": "Bachelor's degree", "pct": 14.6 }, { "label": "Master's degree", "pct": 3.2 }, { "label": "Doctorate or professional degree", "pct": 0.6 }] },
      "pay": { "starting": "$35,510", "typical": "$48,570", "top": "$77,860", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +15,200 by 2035. It is growing about as fast as most jobs." }
    }
  },
  // BLS has no separate quality manager occupation. O*NET files Quality
  // Control Systems Managers (11-3051.01) under Industrial Production Managers
  // (11-3051), so every BLS figure here is for that whole group; tasks, skills
  // and software follow O*NET 11-3051.01.
  "quality-manager": {
    "slug": "quality-manager",
    "title": "Quality Manager",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/quality-manager.webp",
    "summary": "Leads the team and the systems that make sure a company's products are made right.",
    "scenario": "Imagine a safety inspector is coming next week. You make sure every test, record and process in the plant is ready to pass.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$126,060/year" },
      { "label": "People doing it", "value": "252,100" },
      { "label": "Jobs open each year", "value": "17,000" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$117K" }], "best": [{ "state": "Massachusetts", "pay": "$162K" }, { "state": "Washington", "pay": "$159K" }, { "state": "Delaware", "pay": "$157K" }] },
    "knowAbout": ["How factories make things", "Teaching and training others", "Clear reading and writing", "Chemistry", "Running a team or a business"],
    "goodAt": ["Reading reports closely", "Listening closely", "Keeping an eye on how things are going", "Writing clear reports", "Thinking problems through"],
    "software": ["Minitab", "SAP", "Microsoft Access", "Adobe Acrobat", "Atlassian JIRA"],
    "ladder": [
      { "number": "1", "jobTitle": "Quality Inspector", "pay": "$49K", "description": "You test products and learn what good quality looks like.", "whatYouDo": ["Measure parts", "Run tests", "Write reports", "Flag problems"], "toGetHere": ["High school diploma or more"] },
      { "number": "2", "jobTitle": "Quality Supervisor", "pay": "$74K", "description": "You lead inspectors and fix quality problems with production.", "whatYouDo": ["Lead inspectors", "Review test results", "Update procedures", "Train staff"], "toGetHere": ["Years in quality work"] },
      { "number": "3", "jobTitle": "Quality Manager", "pay": "$126K", "description": "You set the quality rules for the plant and the team that checks them.", "whatYouDo": ["Set quality policies", "Review test results", "Prepare for audits", "Stop bad product"], "toGetHere": ["Bachelor's degree", "5 or more years of related work"] }
    ],
    "education": { "studies": [{ "name": "Industrial Engineering" }, { "name": "Operations Management and Supervision" }, { "name": "Business Administration and Management, General" }, { "name": "Engineering/Industrial Management" }], "where": [{ "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. BLS counts quality managers with industrial production managers (SOC 11-3051), so pay and job figures are for that whole group.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "Yes. Usually 5 or more years of related work first", "trainingAfterHiring": "None required", "note": "Most quality managers have a bachelor's degree and 5 or more years of work in production or quality.", "noBachelorPct": "50%", "distribution": [{ "label": "Did not finish high school", "pct": 3.4 }, { "label": "Finished high school", "pct": 19.5 }, { "label": "Some college, no degree", "pct": 18.9 }, { "label": "Associate's degree", "pct": 8.4 }, { "label": "Bachelor's degree", "pct": 34.4 }, { "label": "Master's degree", "pct": 13.5 }, { "label": "Doctorate or professional degree", "pct": 1.8 }] },
      "pay": { "starting": "$78,000", "typical": "$126,060", "top": "$205,520", "note": "BLS counts quality managers inside the larger group of industrial production managers, so these figures are for that whole group." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +6,500 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "sewing-machine-operator": {
    "slug": "sewing-machine-operator",
    "title": "Sewing Machine Operator",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/sewing-machine-operator.webp",
    "summary": "Runs sewing machines to make clothes, bags, furniture covers and other goods.",
    "scenario": "Imagine a stack of cut fabric pieces for 200 jackets. You stitch each seam straight and fast so every jacket fits the same.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$36,670/year" },
      { "label": "People doing it", "value": "117,200" },
      { "label": "Jobs open each year", "value": "9,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$39K" }], "best": [{ "state": "Alaska", "pay": "$46K" }, { "state": "Nevada", "pay": "$45K" }, { "state": "Washington", "pay": "$44K" }] },
    "knowAbout": ["Sewing machines", "Fabrics and thread", "Matching patterns", "How factories make things", "Machine care"],
    "goodAt": ["Keeping an eye on every stitch", "Steady, quick hands", "Working at a steady pace", "Spotting thread breaks fast", "Following patterns exactly"],
    "software": ["Microsoft Excel", "Microsoft Office", "Microsoft Word", "Microsoft Outlook", "Web browser software"],
    "ladder": [
      { "number": "1", "jobTitle": "Sewing Trainee", "pay": "$28K", "description": "You learn the machines on simple seams while a lead checks your work.", "whatYouDo": ["Thread machines", "Sew straight seams", "Trim threads", "Match pieces"], "toGetHere": ["No degree needed", "A few weeks of training"] },
      { "number": "2", "jobTitle": "Sewing Machine Operator", "pay": "$37K", "description": "You sew parts together quickly and keep quality high.", "whatYouDo": ["Sew garment parts", "Watch for bad stitches", "Fix thread breaks", "Change needles"], "toGetHere": ["On-the-job practice"] },
      { "number": "3", "jobTitle": "Sample Maker", "pay": "$43K", "description": "You sew the first version of new designs before full production.", "whatYouDo": ["Sew samples", "Follow new patterns", "Spot fit problems", "Train other sewers"], "toGetHere": ["Years of sewing skill"] }
    ],
    "education": { "studies": [{ "name": "No set field. Most people learn on the job" }], "where": [{ "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training, a month or less", "note": "No degree is needed. You learn on the job in a short time.", "noBachelorPct": "90%", "distribution": [{ "label": "Did not finish high school", "pct": 34.9 }, { "label": "Finished high school", "pct": 34.9 }, { "label": "Some college, no degree", "pct": 13.6 }, { "label": "Associate's degree", "pct": 6.2 }, { "label": "Bachelor's degree", "pct": 8.2 }, { "label": "Master's degree", "pct": 1.8 }, { "label": "Doctorate or professional degree", "pct": 0.3 }] },
      "pay": { "starting": "$27,860", "typical": "$36,670", "top": "$47,840", "note": "11% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -17,700 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  // OEWS publishes no South Dakota wage for 51-6052, so there is no yourStates row.
  "tailor": {
    "slug": "tailor",
    "title": "Tailor",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/tailor.webp",
    "summary": "Makes, fixes and fits clothes so they look right on each person.",
    "scenario": "Imagine a groom whose suit is too long a week before the wedding. You measure, pin and stitch until it fits like it was made for him.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$41,640/year" },
      { "label": "People doing it", "value": "33,200" },
      { "label": "Jobs open each year", "value": "3,700" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "District of Columbia", "pay": "$66K" }, { "state": "New York", "pay": "$64K" }, { "state": "Washington", "pay": "$56K" }] },
    "knowAbout": ["Helping customers", "Clear reading and writing", "How clothes are made", "Running a team or a business", "Money and bookkeeping"],
    "goodAt": ["Listening closely to customers", "Measuring exactly", "Thinking problems through", "Explaining choices clearly", "Fine hand sewing"],
    "software": ["Microsoft Excel", "Microsoft Word", "Google Docs", "Tailor Master", "Garment design software"],
    "ladder": [
      { "number": "1", "jobTitle": "Alterations Sewer", "pay": "$30K", "description": "You hem, take in and repair clothes while a tailor shows you how.", "whatYouDo": ["Hem pants", "Take in seams", "Remove stitches", "Press garments"], "toGetHere": ["No degree needed", "Sewing practice"] },
      { "number": "2", "jobTitle": "Tailor", "pay": "$42K", "description": "You measure customers and change clothes so they fit just right.", "whatYouDo": ["Measure customers", "Fit garments", "Alter suits and dresses", "Sew by hand and machine"], "toGetHere": ["Months of on-the-job training"] },
      { "number": "3", "jobTitle": "Master Tailor", "pay": "$50K", "description": "You make custom clothes from scratch and handle the hardest fits.", "whatYouDo": ["Make custom pieces", "Draft patterns", "Fit special clients", "Train new tailors"], "toGetHere": ["Years of tailoring"] }
    ],
    "education": { "studies": [{ "name": "No set field. Most people learn on the job" }], "where": [{ "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "No degree is needed. Most tailors learn by working with an experienced tailor.", "noBachelorPct": "76%", "distribution": [{ "label": "Did not finish high school", "pct": 21.5 }, { "label": "Finished high school", "pct": 26.6 }, { "label": "Some college, no degree", "pct": 17.2 }, { "label": "Associate's degree", "pct": 11.0 }, { "label": "Bachelor's degree", "pct": 19.0 }, { "label": "Master's degree", "pct": 4.0 }, { "label": "Doctorate or professional degree", "pct": 0.8 }] },
      "pay": { "starting": "$29,920", "typical": "$41,640", "top": "$63,670", "note": "58% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -2,900 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  // OEWS publishes no South Dakota wage for 51-6093, so there is no yourStates row.
  "upholsterer": {
    "slug": "upholsterer",
    "title": "Upholsterer",
    "world": "Factories & Making Things",
    "photo": "/images/app/browse/upholsterer.webp",
    "summary": "Puts new fabric, padding and springs on chairs, sofas and car seats.",
    "scenario": "Imagine a worn-out sofa from someone's grandma. You strip it to the frame and rebuild it so it looks new for another 30 years.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$46,340/year" },
      { "label": "People doing it", "value": "22,700" },
      { "label": "Jobs open each year", "value": "1,700" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Rhode Island", "pay": "$62K" }, { "state": "Washington", "pay": "$61K" }, { "state": "Delaware", "pay": "$56K" }] },
    "knowAbout": ["How factories make things", "Design and drawings", "Fabrics and padding", "Hand and power tools", "Measuring and cutting"],
    "goodAt": ["Thinking problems through", "Reading work orders", "Picking up new methods", "Listening closely to customers", "Steady, careful hands"],
    "software": ["Intuit QuickBooks", "Autodesk AutoCAD", "Microsoft Excel", "Microsoft Office", "Microsoft Word"],
    "ladder": [
      { "number": "1", "jobTitle": "Upholstery Cutter", "pay": "$32K", "description": "You measure and cut fabric while an upholsterer teaches you the trade.", "whatYouDo": ["Measure fabric", "Cut covers", "Remove old fabric", "Staple webbing"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Upholsterer", "pay": "$46K", "description": "You rebuild and cover furniture from frame to finish.", "whatYouDo": ["Replace springs", "Add padding", "Fit and staple fabric", "Sew tears"], "toGetHere": ["Months of on-the-job training"] },
      { "number": "3", "jobTitle": "Custom Upholsterer", "pay": "$55K", "description": "You take on custom and antique pieces that need expert work.", "whatYouDo": ["Build custom pieces", "Restore antiques", "Advise customers", "Train helpers"], "toGetHere": ["Years of upholstery work"] }
    ],
    "education": { "studies": [{ "name": "Upholstery/Upholsterer" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "Most upholsterers learn on the job over several months. A trade school course gives you a head start.", "noBachelorPct": "91%", "distribution": [{ "label": "Did not finish high school", "pct": 26.5 }, { "label": "Finished high school", "pct": 41.5 }, { "label": "Some college, no degree", "pct": 18.9 }, { "label": "Associate's degree", "pct": 4.1 }, { "label": "Bachelor's degree", "pct": 7.6 }, { "label": "Master's degree", "pct": 1.1 }, { "label": "Doctorate or professional degree", "pct": 0.2 }] },
      "pay": { "starting": "$31,690", "typical": "$46,340", "top": "$63,770", "note": "12% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -500 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  },
  // OEWS publishes no South Dakota wage for 17-2021, so there is no yourStates row.
  "agricultural-engineer": {
    "slug": "agricultural-engineer",
    "title": "Agricultural Engineer",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/agricultural-engineer.webp",
    "summary": "Designs farm machines, buildings and water systems that help grow food better.",
    "scenario": "Imagine a farm that loses half its water to leaks and runoff. You design a new watering system that saves water and grows more crops.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$98,590/year" },
      { "label": "People doing it", "value": "1,500" },
      { "label": "Jobs open each year", "value": "100" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Ohio", "pay": "$112K" }, { "state": "Minnesota", "pay": "$112K" }, { "state": "Iowa", "pay": "$109K" }] },
    "knowAbout": ["How things get engineered and built", "Computers and electronics", "Design and drawings", "Math", "Biology"],
    "goodAt": ["Listening closely to farmers", "Reading technical reports", "Explaining plans clearly", "Writing clear reports", "Using science to solve problems"],
    "software": ["Autodesk AutoCAD", "SolidWorks", "ESRI ArcView", "SAS", "Microsoft SharePoint"],
    "ladder": [
      { "number": "1", "jobTitle": "Engineer in Training", "pay": "$68K", "description": "You work on design projects while a licensed engineer checks your work.", "whatYouDo": ["Draw designs in CAD", "Test equipment", "Visit farm sites", "Write reports"], "toGetHere": ["Bachelor's in agricultural engineering"] },
      { "number": "2", "jobTitle": "Agricultural Engineer", "pay": "$99K", "description": "You design machines, structures and water systems for farms.", "whatYouDo": ["Design systems", "Meet with clients", "Test machines", "Plan budgets"], "toGetHere": ["Bachelor's degree", "Engineering experience"] },
      { "number": "3", "jobTitle": "Senior Agricultural Engineer", "pay": "$125K", "description": "You lead big projects and sign off on designs.", "whatYouDo": ["Lead projects", "Approve designs", "Guide newer engineers", "Advise on water and soil"], "toGetHere": ["Years of experience", "A PE license helps"] }
    ],
    "education": { "studies": [{ "name": "Agricultural Engineering" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's degree in agricultural or biological engineering is the usual way in.", "noBachelorPct": "22%", "distribution": [{ "label": "Did not finish high school", "pct": 0.3 }, { "label": "Finished high school", "pct": 4.5 }, { "label": "Some college, no degree", "pct": 6.9 }, { "label": "Associate's degree", "pct": 10.5 }, { "label": "Bachelor's degree", "pct": 47.3 }, { "label": "Master's degree", "pct": 21.0 }, { "label": "Doctorate or professional degree", "pct": 9.4 }] },
      "pay": { "starting": "$68,060", "typical": "$98,590", "top": "$166,460", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +100 by 2035. It is growing much faster than most jobs." }
    }
  },
  // OEWS publishes no South Dakota wage for 45-2011, so there is no yourStates row.
  "agricultural-inspector": {
    "slug": "agricultural-inspector",
    "title": "Agricultural Inspector",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/agricultural-inspector.webp",
    "summary": "Checks farms, food plants and crops to make sure they follow health and safety laws.",
    "scenario": "Imagine a truck of fresh berries about to cross the border. You check them for pests and sign off so they can reach the stores safely.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$49,940/year" },
      { "label": "People doing it", "value": "17,800" },
      { "label": "Jobs open each year", "value": "2,500" }
    ],
    "payByState": { "title": "Pay by state", "best": [{ "state": "Minnesota", "pay": "$75K" }, { "state": "New York", "pay": "$73K" }, { "state": "Michigan", "pay": "$71K" }] },
    "knowAbout": ["Helping customers", "Laws and rules", "Running a team or a business", "Safety rules", "Math"],
    "goodAt": ["Listening closely", "Keeping an eye on every detail", "Reading rules carefully", "Thinking problems through", "Explaining rules clearly"],
    "software": ["Microsoft Excel", "Microsoft Access", "Microsoft Word", "Microsoft PowerPoint", "Microsoft Outlook"],
    "ladder": [
      { "number": "1", "jobTitle": "Inspector Trainee", "pay": "$37K", "description": "You learn the rules and inspect alongside a senior inspector.", "whatYouDo": ["Shadow inspections", "Collect samples", "Weigh and grade goods", "Write notes"], "toGetHere": ["Bachelor's degree", "Months of on-the-job training"] },
      { "number": "2", "jobTitle": "Agricultural Inspector", "pay": "$50K", "description": "You inspect farms, plants and goods and enforce the rules.", "whatYouDo": ["Inspect sites", "Take samples for testing", "Grade products", "Write reports"], "toGetHere": ["Training completed"] },
      { "number": "3", "jobTitle": "Senior Agricultural Inspector", "pay": "$65K", "description": "You lead hard cases and help train new inspectors.", "whatYouDo": ["Handle complex cases", "Advise businesses", "Review reports", "Train inspectors"], "toGetHere": ["Years as an inspector"] }
    ],
    "education": { "studies": [{ "name": "Agricultural and Food Products Processing" }], "where": [{ "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "On-the-job training, 1 to 12 months", "note": "A bachelor's degree is the typical way in, followed by months of training on the job.", "noBachelorPct": "59%", "distribution": [{ "label": "Did not finish high school", "pct": 3.3 }, { "label": "Finished high school", "pct": 28.9 }, { "label": "Some college, no degree", "pct": 18.8 }, { "label": "Associate's degree", "pct": 8.1 }, { "label": "Bachelor's degree", "pct": 30.9 }, { "label": "Master's degree", "pct": 8.5 }, { "label": "Doctorate or professional degree", "pct": 1.4 }] },
      "pay": { "starting": "$37,020", "typical": "$49,940", "top": "$79,580", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +400 by 2035. It is growing, but more slowly than most jobs." }
    }
  },
  "animal-breeder": {
    "slug": "animal-breeder",
    "title": "Animal Breeder",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/animal-breeder.webp",
    "summary": "Picks and pairs animals to raise healthy young with the right traits.",
    "scenario": "Imagine a dairy herd where you choose which cows to breed. Years later, your picks give healthier calves and more milk.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$51,130/year" },
      { "label": "People doing it", "value": "6,900" },
      { "label": "Jobs open each year", "value": "1,000" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$44K" }], "best": [{ "state": "Ohio", "pay": "$83K" }, { "state": "California", "pay": "$67K" }, { "state": "New York", "pay": "$52K" }] },
    "knowAbout": ["Helping customers", "Selling", "Running a team or a business", "Biology", "Math"],
    "goodAt": ["Thinking problems through", "Picking up new methods", "Listening closely", "Keeping an eye on animal health", "Using science to solve problems"],
    "software": ["Microsoft Access", "Microsoft Excel", "Microsoft Office", "Breedtrak", "Adobe Acrobat"],
    "ladder": [
      { "number": "1", "jobTitle": "Farm Animal Worker", "pay": "$37K", "description": "You feed and care for animals and learn how breeding works.", "whatYouDo": ["Feed and water animals", "Clean pens", "Watch for illness", "Keep records"], "toGetHere": ["No degree needed"] },
      { "number": "2", "jobTitle": "Animal Breeder", "pay": "$51K", "description": "You choose which animals to breed and track the results.", "whatYouDo": ["Pick breeding pairs", "Watch for heat cycles", "Record traits", "Treat minor injuries"], "toGetHere": ["Short on-the-job training", "Hands-on animal work"] },
      { "number": "3", "jobTitle": "Large Herd Specialist", "pay": "$62K", "description": "You manage breeding for big herds and help plan the program.", "whatYouDo": ["Plan breeding programs", "Use AI methods", "Track bloodlines", "Train workers"], "toGetHere": ["Years of breeding work"] }
    ],
    "education": { "studies": [{ "name": "Animal/Livestock Husbandry and Production" }, { "name": "Horse Husbandry/Equine Science and Management" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training, a month or less", "note": "A high school diploma is typical. Most breeders learn on the job by working with animals.", "noBachelorPct": "91%", "distribution": [{ "label": "Did not finish high school", "pct": 46.5 }, { "label": "Finished high school", "pct": 28.6 }, { "label": "Some college, no degree", "pct": 10.9 }, { "label": "Associate's degree", "pct": 4.7 }, { "label": "Bachelor's degree", "pct": 7.5 }, { "label": "Master's degree", "pct": 1.3 }, { "label": "Doctorate or professional degree", "pct": 0.5 }] },
      "pay": { "starting": "$38,480", "typical": "$51,130", "top": "$90,550", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +200 by 2035. It is growing about as fast as most jobs." }
    }
  },
  "animal-caretaker": {
    "slug": "animal-caretaker",
    "title": "Animal Caretaker",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/animal-caretaker.webp",
    "summary": "Feeds, cleans, grooms and exercises animals in shelters, kennels and zoos.",
    "scenario": "Imagine a shelter full of dogs waiting for homes. You feed them, walk them and notice the one who needs a vet today.",
    "facts": [
      { "label": "Typical degree", "value": "High school diploma or equivalent" },
      { "label": "Typical pay", "value": "$35,360/year" },
      { "label": "People doing it", "value": "365,300" },
      { "label": "Jobs open each year", "value": "62,800" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$34K" }], "best": [{ "state": "District of Columbia", "pay": "$47K" }, { "state": "Washington", "pay": "$46K" }, { "state": "Massachusetts", "pay": "$45K" }] },
    "knowAbout": ["Helping customers", "Office records and paperwork", "Clear reading and writing", "Animal health basics", "Feeding and grooming"],
    "goodAt": ["Keeping an eye on how animals act", "Listening closely", "Reading care notes", "Staying calm with nervous animals", "Patience"],
    "software": ["Microsoft Excel", "Microsoft Word", "Microsoft Access", "Microsoft Outlook", "DaySmart Software 123Pet"],
    "ladder": [
      { "number": "1", "jobTitle": "Kennel Attendant", "pay": "$27K", "description": "You feed animals and keep their spaces clean.", "whatYouDo": ["Feed and water animals", "Clean kennels", "Walk dogs", "Log care"], "toGetHere": ["High school diploma"] },
      { "number": "2", "jobTitle": "Animal Caretaker", "pay": "$35K", "description": "You care for animals' daily needs and spot health problems early.", "whatYouDo": ["Groom and bathe", "Give medicine", "Watch for illness", "Talk with owners"], "toGetHere": ["Short on-the-job training"] },
      { "number": "3", "jobTitle": "Senior Animal Caretaker", "pay": "$40K", "description": "You lead daily care and train new staff.", "whatYouDo": ["Plan care routines", "Train new staff", "Work with vets", "Handle tough cases"], "toGetHere": ["Years of animal care"] }
    ],
    "education": { "studies": [{ "name": "Dog/Pet/Animal Grooming" }, { "name": "Anthrozoology" }], "where": [{ "count": "", "credential": "High school diploma" }, { "count": "", "credential": "Trade school certificate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "High school diploma or equivalent", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training, a month or less", "note": "A high school diploma is typical. You learn the job in a short time on site.", "noBachelorPct": "73%", "distribution": [{ "label": "Did not finish high school", "pct": 7.3 }, { "label": "Finished high school", "pct": 30.9 }, { "label": "Some college, no degree", "pct": 25.2 }, { "label": "Associate's degree", "pct": 9.9 }, { "label": "Bachelor's degree", "pct": 21.4 }, { "label": "Master's degree", "pct": 4.2 }, { "label": "Doctorate or professional degree", "pct": 1.1 }] },
      "pay": { "starting": "$27,250", "typical": "$35,360", "top": "$50,060", "note": "25% work for themselves, so this describes the ones with a boss." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +44,100 by 2035. It is growing much faster than most jobs." }
    }
  },
  "animal-scientist": {
    "slug": "animal-scientist",
    "title": "Animal Scientist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/animal-scientist.webp",
    "summary": "Studies farm animals to find better ways to feed, breed and care for them.",
    "scenario": "Imagine testing a new feed on a herd of cattle. Your data shows it keeps them healthier, and farms across the state switch.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$68,940/year" },
      { "label": "People doing it", "value": "3,400" },
      { "label": "Jobs open each year", "value": "200" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$80K" }], "best": [{ "state": "Texas", "pay": "$130K" }, { "state": "Minnesota", "pay": "$114K" }, { "state": "Iowa", "pay": "$101K" }] },
    "knowAbout": ["Biology", "Math", "Clear reading and writing", "Chemistry", "How food is grown and raised"],
    "goodAt": ["Reading research closely", "Thinking problems through", "Using science to solve problems", "Writing clear reports", "Picking up new methods"],
    "software": ["SAS", "Tableau", "ESRI ArcGIS", "Microsoft Access", "Microsoft Office"],
    "ladder": [
      { "number": "1", "jobTitle": "Agricultural Technician", "pay": "$50K", "description": "You help scientists run tests and collect data on animals.", "whatYouDo": ["Collect samples", "Record data", "Care for test animals", "Run lab tests"], "toGetHere": ["Associate's or bachelor's degree"] },
      { "number": "2", "jobTitle": "Animal Scientist", "pay": "$69K", "description": "You run studies on animal feed, breeding and health.", "whatYouDo": ["Design studies", "Study feed and nutrition", "Analyze results", "Advise farmers"], "toGetHere": ["Bachelor's degree in animal science"] },
      { "number": "3", "jobTitle": "Senior Animal Scientist", "pay": "$103K", "description": "You lead research and share findings with farms and other scientists.", "whatYouDo": ["Lead research", "Write papers", "Guide new scientists", "Present findings"], "toGetHere": ["Master's or doctorate", "Years of research"] }
    ],
    "education": { "studies": [{ "name": "Animal Sciences, General" }, { "name": "Animal Nutrition" }, { "name": "Agricultural Animal Breeding" }, { "name": "Dairy Science" }, { "name": "Poultry Science" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }, { "count": "", "credential": "Doctorate" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's degree opens the door. Many research jobs ask for a master's or a doctorate.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 63.5 }, { "label": "Master's degree", "pct": 23.8 }, { "label": "Doctorate or professional degree", "pct": 12.7 }] },
      "pay": { "starting": "$44,350", "typical": "$68,940", "top": "$166,000", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +200 by 2035. It is growing faster than most jobs." }
    }
  },
  "conservation-scientist": {
    "slug": "conservation-scientist",
    "title": "Conservation Scientist",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/conservation-scientist.webp",
    "summary": "Helps protect land, soil and water so people can use them without harming nature.",
    "scenario": "Imagine a farm losing its topsoil every time it rains. You walk the land, map the problem and plan the fix that keeps the soil in place.",
    "facts": [
      { "label": "Typical degree", "value": "Bachelor's degree" },
      { "label": "Typical pay", "value": "$73,010/year" },
      { "label": "People doing it", "value": "27,700" },
      { "label": "Jobs open each year", "value": "2,100" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$76K" }], "best": [{ "state": "District of Columbia", "pay": "$99K" }, { "state": "Virginia", "pay": "$93K" }, { "state": "Rhode Island", "pay": "$92K" }] },
    "knowAbout": ["Clear reading and writing", "Biology", "Maps and land", "Math", "Helping customers"],
    "goodAt": ["Listening closely to landowners", "Reading reports closely", "Explaining plans clearly", "Thinking problems through", "Using science to solve problems"],
    "software": ["ESRI ArcGIS", "Autodesk AutoCAD", "Microsoft Access", "Adobe Acrobat", "Microsoft Outlook"],
    "ladder": [
      { "number": "1", "jobTitle": "Conservation Technician", "pay": "$55K", "description": "You collect field data and help carry out conservation plans.", "whatYouDo": ["Survey land", "Collect soil samples", "Map sites", "Record data"], "toGetHere": ["Associate's or bachelor's degree"] },
      { "number": "2", "jobTitle": "Conservation Scientist", "pay": "$73K", "description": "You plan ways to protect soil, water and habitat and advise landowners.", "whatYouDo": ["Plan conservation work", "Advise farmers and ranchers", "Use GIS maps", "Check projects"], "toGetHere": ["Bachelor's degree"] },
      { "number": "3", "jobTitle": "Senior Conservation Scientist", "pay": "$92K", "description": "You lead larger programs and guide newer staff.", "whatYouDo": ["Lead programs", "Set budgets", "Work with agencies", "Mentor staff"], "toGetHere": ["Years of experience", "A master's degree helps"] }
    ],
    "education": { "studies": [{ "name": "Natural Resources/Conservation, General" }, { "name": "Range Science and Management" }, { "name": "Forestry, General" }, { "name": "Wildlife, Fish and Wildlands Science and Management" }, { "name": "Environmental/Natural Resources Management and Policy, General" }], "where": [{ "count": "", "credential": "Bachelor's degree" }, { "count": "", "credential": "Master's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Bachelor's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "A bachelor's degree in forestry, range science or a related field is the usual way in.", "noBachelorPct": "0%", "distribution": [{ "label": "Did not finish high school", "pct": 0.0 }, { "label": "Finished high school", "pct": 0.0 }, { "label": "Some college, no degree", "pct": 0.0 }, { "label": "Associate's degree", "pct": 0.0 }, { "label": "Bachelor's degree", "pct": 71.6 }, { "label": "Master's degree", "pct": 25.2 }, { "label": "Doctorate or professional degree", "pct": 3.2 }] },
      "pay": { "starting": "$47,550", "typical": "$73,010", "top": "$110,410", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +1,500 by 2035. It is growing faster than most jobs." }
    }
  },
  "environmental-technician": {
    "slug": "environmental-technician",
    "title": "Environmental Technician",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/environmental-technician.webp",
    "summary": "Tests air, water and soil to find pollution and help keep people safe.",
    "scenario": "Imagine a town worried about its drinking water. You collect samples, test them in the lab and find where the problem starts.",
    "facts": [
      { "label": "Typical degree", "value": "Associate's degree" },
      { "label": "Typical pay", "value": "$55,090/year" },
      { "label": "People doing it", "value": "36,400" },
      { "label": "Jobs open each year", "value": "5,300" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$43K" }], "best": [{ "state": "Washington", "pay": "$78K" }, { "state": "Connecticut", "pay": "$74K" }, { "state": "Minnesota", "pay": "$72K" }] },
    "knowAbout": ["Helping customers", "Chemistry", "Clear reading and writing", "Biology", "Laws and rules"],
    "goodAt": ["Reading test steps closely", "Listening closely", "Explaining results clearly", "Writing clear reports", "Thinking problems through"],
    "software": ["ESRI ArcGIS", "Autodesk AutoCAD", "Microsoft Access", "Microsoft Excel", "SAP"],
    "ladder": [
      { "number": "1", "jobTitle": "Environmental Technician Trainee", "pay": "$38K", "description": "You collect samples and learn lab tests while a senior tech guides you.", "whatYouDo": ["Collect samples", "Label and log", "Clean equipment", "Run simple tests"], "toGetHere": ["Associate's degree in environmental science"] },
      { "number": "2", "jobTitle": "Environmental Technician", "pay": "$55K", "description": "You test samples, find sources of pollution and report results.", "whatYouDo": ["Test samples", "Inspect sites", "Calibrate instruments", "Write reports"], "toGetHere": ["Associate's degree", "Field and lab experience"] },
      { "number": "3", "jobTitle": "Environmental Scientist", "pay": "$82K", "description": "You plan studies and decide how to clean up or prevent pollution.", "whatYouDo": ["Plan studies", "Analyze data", "Advise on cleanup", "Lead field teams"], "toGetHere": ["Bachelor's degree", "Years as a technician"] }
    ],
    "education": { "studies": [{ "name": "Environmental Science" }, { "name": "Environmental/Environmental Engineering Technology/Technician" }, { "name": "Water Quality and Wastewater Treatment Management and Recycling Technology/Technician" }, { "name": "Hazardous Materials Management and Waste Technology/Technician" }], "where": [{ "count": "", "credential": "Associate's degree" }, { "count": "", "credential": "Bachelor's degree" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
    "factDetails": {
      "degree": { "doorAsksFor": "Associate's degree", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "None required", "note": "An associate's degree in environmental science or a related field is the usual way in.", "noBachelorPct": "59%", "distribution": [{ "label": "Did not finish high school", "pct": 5.7 }, { "label": "Finished high school", "pct": 18.5 }, { "label": "Some college, no degree", "pct": 21.8 }, { "label": "Associate's degree", "pct": 12.6 }, { "label": "Bachelor's degree", "pct": 32.5 }, { "label": "Master's degree", "pct": 6.3 }, { "label": "Doctorate or professional degree", "pct": 2.5 }] },
      "pay": { "starting": "$38,170", "typical": "$55,090", "top": "$94,160", "note": "Half of the people in this job earn more than the typical figure and half earn less." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +2,500 by 2035. It is growing much faster than most jobs." }
    }
  },
  // Farm Worker maps to Farmworkers and Laborers, Crop, Nursery, and
  // Greenhouse (45-2092), the largest group of farm workers. Workers who care
  // for farm animals (45-2093) are a separate group.
  "farm-worker": {
    "slug": "farm-worker",
    "title": "Farm Worker",
    "world": "Farming, Animals & Nature",
    "photo": "/images/app/browse/farm-worker.webp",
    "summary": "Plants, tends and harvests the fruits, vegetables and plants that feed people.",
    "scenario": "Imagine rows of ripe strawberries at sunrise. You and your crew pick them fast and careful so they reach stores while they are fresh.",
    "facts": [
      { "label": "Typical degree", "value": "No formal educational credential" },
      { "label": "Typical pay", "value": "$35,660/year" },
      { "label": "People doing it", "value": "546,800" },
      { "label": "Jobs open each year", "value": "72,500" }
    ],
    "payByState": { "title": "Pay by state", "yourStates": [{ "state": "South Dakota", "pay": "$41K" }], "best": [{ "state": "Wyoming", "pay": "$51K" }, { "state": "Alaska", "pay": "$45K" }, { "state": "Maine", "pay": "$44K" }] },
    "knowAbout": ["How crops grow", "Plants, pests and weeds", "Farm tools and machines", "Watering systems", "Crop records"],
    "goodAt": ["Working at a steady pace outdoors", "Speaking up when something is wrong", "Spotting pests and sick plants", "Working as a team", "Physical stamina"],
    "software": ["Microsoft Excel", "Microsoft Office", "GPS software", "Microsoft Outlook", "Web browser software"],
    "ladder": [
      { "number": "1", "jobTitle": "Farm Worker", "pay": "$36K", "description": "You plant, weed and harvest crops by hand and with tools.", "whatYouDo": ["Plant and weed", "Harvest by hand", "Run watering systems", "Sort crops"], "toGetHere": ["No degree needed", "Short on-the-job training"] },
      { "number": "2", "jobTitle": "Farm Crew Supervisor", "pay": "$59K", "description": "You lead a crew and make sure the day's work gets done.", "whatYouDo": ["Lead the crew", "Plan the day", "Train new workers", "Report to the farm manager"], "toGetHere": ["Years of farm work"] },
      { "number": "3", "jobTitle": "Farm Manager", "pay": "$90K", "description": "You run the farm's crops, crews and budget.", "whatYouDo": ["Plan the season", "Manage budgets", "Hire workers", "Sell crops"], "toGetHere": ["Years of experience", "A farm or business degree helps"] }
    ],
    "education": { "studies": [{ "name": "No set field. Most people learn on the job" }], "where": [{ "count": "", "credential": "On-the-job training" }] },
    "sources": "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics. Farm Worker uses Farmworkers and Laborers, Crop, Nursery, and Greenhouse (SOC 45-2092), the largest farm worker group.",
    "factDetails": {
      "degree": { "doorAsksFor": "No formal educational credential", "experienceFirst": "No. You can start without it", "trainingAfterHiring": "Short on-the-job training, a month or less", "note": "No degree is needed. You learn the work on the farm in a short time.", "noBachelorPct": "91%", "distribution": [{ "label": "Did not finish high school", "pct": 46.5 }, { "label": "Finished high school", "pct": 28.6 }, { "label": "Some college, no degree", "pct": 10.9 }, { "label": "Associate's degree", "pct": 4.7 }, { "label": "Bachelor's degree", "pct": 7.5 }, { "label": "Master's degree", "pct": 1.3 }, { "label": "Doctorate or professional degree", "pct": 0.5 }] },
      "pay": { "starting": "$32,900", "typical": "$35,660", "top": "$45,690", "note": "These figures are for crop, nursery and greenhouse workers, the largest group of farm workers." },
      "openings": { "note": "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about -13,200 by 2035. Fewer of these jobs are expected, but most openings come from people moving on, so hiring keeps going." }
    }
  }
};
