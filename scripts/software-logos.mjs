// Fetches one mark per named software product on the career pages and
// writes src/components/career/softwareLogos.generated.ts, the name → file
// manifest Software & Skills renders from (23 Oct 2026, Chandu: "can we
// reliably show the logos of every logo needed on the softwares tab ...
// with no stupid initials fallback stuff").
//
// Run:  node scripts/software-logos.mjs            (fetches what is missing)
//       node scripts/software-logos.mjs --refetch  (everything again)
//
// Sources, in the order each entry lists them:
//   si:<slug>    Simple Icons, in the brand's own colour (cdn.simpleicons.org,
//                then the pinned jsdelivr copy for icons the CDN has dropped)
//   wm:<File>    Wikimedia Commons, by file name (Microsoft, Adobe and other
//                marks Simple Icons no longer carries)
//   fav:<domain> the vendor's own site icon, largest of icon.horse, unavatar,
//                Google's favicon service and DuckDuckGo's
// A product with no entry here is a category ("Scheduling software"), not a
// brand: SoftwareTag gives it a category icon from the name's words. Nothing
// ever falls back to initials.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const OUT_DIR = path.resolve("public/images/logos/software");
const MANIFEST = path.resolve("src/components/career/softwareLogos.generated.ts");
const REFETCH = process.argv.includes("--refetch");
const UA = "DreamariPrototype/1.0 (software logo fetch; ux@dreamopportunity.org)";

const MS = {
  excel: "wm:Microsoft Office Excel (2019–present).svg",
  word: "wm:Microsoft Office Word (2019–present).svg",
  powerpoint: "wm:Microsoft Office PowerPoint (2019–present).svg",
  outlook: "wm:Microsoft Office Outlook (2018–present).svg",
  access: "wm:Microsoft Office Access (2019-present).svg",
  sharepoint: "wm:Microsoft Office SharePoint (2019–present).svg",
  teams: "wm:Microsoft Office Teams (2018–present).svg",
  project: "wm:Microsoft Project (2019–present).svg",
  visio: "fav:microsoft.com",
  publisher: "fav:microsoft.com",
  office: "fav:office.com",
  powerbi: "wm:New Power BI Logo.svg",
  windows: "wm:Windows logo - 2021.svg",
  microsoft: "wm:Microsoft logo.svg",
  sqlserver: "wm:Microsoft SQL Server Logo.svg",
  powershell: "wm:PowerShell 5.0 icon.png",
};
const ADOBE = {
  photoshop: "wm:Adobe Photoshop CC icon.svg",
  illustrator: "wm:Adobe Illustrator CC icon.svg",
  indesign: "wm:Adobe InDesign CC icon.svg",
  premiere: "wm:Adobe Premiere Pro CC icon.svg",
  aftereffects: "wm:Adobe After Effects CC icon.svg",
  lightroom: "wm:Adobe Photoshop Lightroom CC logo.svg",
  audition: "wm:Adobe Audition CC icon (2020).svg",
  acrobat: "wm:Adobe Acrobat DC logo 2020.svg",
  cc: "wm:Adobe Creative Cloud rainbow icon.svg",
};
const AUTODESK = "fav:autodesk.com";
const ESRI = ["si:arcgis", "fav:esri.com"];
const SAP = ["si:sap", "fav:sap.com"];
const ORACLE = ["si:oracle", "fav:oracle.com"];
const MATHWORKS = ["wm:Matlab Logo.png", "fav:mathworks.com"];

/** name → source list. Compound names ("Git / GitHub") take their first brand. */
export const SOURCES = {
  "Microsoft Excel": [MS.excel, "fav:microsoft.com"],
  "Excel": [MS.excel],
  "Excel/PowerPoint (heavily)": [MS.excel],
  "Excel and statistical software (SPSS, R)": [MS.excel],
  "Excel and data analysis tools": [MS.excel],
  "Spreadsheets and reporting dashboards": [MS.excel],
  "Microsoft Word": [MS.word],
  "Microsoft PowerPoint": [MS.powerpoint],
  "PowerPoint": [MS.powerpoint],
  "Microsoft Office": [MS.office],
  "Microsoft Office software": [MS.office],
  "Microsoft Office / Google Workspace": [MS.office],
  "Microsoft Outlook": [MS.outlook],
  "Microsoft Access": [MS.access],
  "Microsoft SharePoint": [MS.sharepoint],
  "Microsoft Teams": [MS.teams],
  "Microsoft Project": [MS.project],
  "Scheduling tools (MS Project)": [MS.project],
  "Microsoft Visio": [MS.visio],
  "Microsoft Publisher": [MS.publisher],
  "Microsoft Power BI": [MS.powerbi],
  "Microsoft Windows": [MS.windows],
  "Microsoft Windows Server": [MS.windows],
  "Microsoft Active Directory": [MS.windows],
  "Microsoft SQL Server": [MS.sqlserver, MS.microsoft],
  "Microsoft PowerShell": [MS.powershell],
  "Microsoft Sentinel": [MS.microsoft],
  "Python": ["si:python"],
  "R": ["si:r"],
  "SQL": ["si:mysql"],
  "Structured query language SQL": ["si:mysql"],
  "Zoom": ["si:zoom", "fav:zoom.us"],
  "Zoom and remote interpreting platforms": ["si:zoom", "fav:zoom.us"],
  "Autodesk AutoCAD": ["si:autocad", AUTODESK],
  "AutoCAD": ["si:autocad", AUTODESK],
  "AutoCAD Civil 3D": ["si:autocad", AUTODESK],
  "Autodesk AutoCAD Civil 3D": ["si:autocad", AUTODESK],
  "AutoCAD Electrical": ["si:autocad", AUTODESK],
  "Autodesk Revit": ["si:autodeskrevit", AUTODESK],
  "Revit": ["si:autodeskrevit", AUTODESK],
  "Autodesk Maya": ["si:autodeskmaya", AUTODESK],
  "Autodesk Fabrication CAMduct": ["si:autodesk", AUTODESK],
  "MEDITECH": ["fav:meditech.com"],
  "SAP": SAP,
  "SAP software": SAP,
  "SAP Ariba": SAP,
  "SAP Extended Warehouse Management": SAP,
  "SAP Concur": ["fav:concur.com", ...SAP],
  "ERP systems (SAP, NetSuite)": SAP,
  "Forecasting/ERP software (SAP, Oracle)": SAP,
  "ERP/supply chain software (SAP, Oracle)": SAP,
  "Adobe Photoshop": [ADOBE.photoshop, "si:adobephotoshop"],
  "Adobe Illustrator": [ADOBE.illustrator, "si:adobeillustrator"],
  "Adobe InDesign": [ADOBE.indesign, "si:adobeindesign"],
  "Adobe Premiere Pro": [ADOBE.premiere, "si:adobepremierepro"],
  "Adobe After Effects": [ADOBE.aftereffects, "si:adobeaftereffects"],
  "Adobe Lightroom": [ADOBE.lightroom, "si:adobelightroom"],
  "Adobe Audition": [ADOBE.audition, "si:adobeaudition"],
  "Adobe Acrobat": [ADOBE.acrobat, "si:adobeacrobatreader"],
  "Adobe Creative Cloud": [ADOBE.cc, "si:adobecreativecloud"],
  "eClinicalWorks": ["fav:eclinicalworks.com"],
  "Minitab": ["fav:minitab.com"],
  "Esri ArcGIS": ESRI,
  "ESRI ArcGIS": ESRI,
  "ArcGIS": ESRI,
  "ArcGIS Pro": ESRI,
  "ESRI ArcView": ESRI,
  "GIS (ArcGIS/QGIS)": ESRI,
  "Epic Systems": ["fav:epic.com"],
  "Epic (EHR)": ["fav:epic.com"],
  "SAS": ["si:sas", "fav:sas.com"],
  "SAS JMP": ["fav:jmp.com", "fav:sas.com"],
  "Google Classroom": ["si:googleclassroom", "fav:classroom.google.com"],
  "Tableau": ["si:tableau", "fav:tableau.com"],
  "Intuit QuickBooks": ["si:quickbooks", "fav:quickbooks.intuit.com"],
  "QuickBooks": ["si:quickbooks", "fav:quickbooks.intuit.com"],
  "Intuit QuickBooks Point of Sale": ["si:quickbooks", "fav:quickbooks.intuit.com"],
  "Accounting software (QuickBooks)": ["si:quickbooks", "fav:quickbooks.intuit.com"],
  "Intuit ProConnect": ["si:intuit", "fav:intuit.com"],
  "Google Workspace": ["si:google", "fav:workspace.google.com"],
  "Google Docs": ["si:googledocs", "fav:docs.google.com"],
  "Google Calendar": ["si:googlecalendar", "fav:calendar.google.com"],
  "Google Meet": ["si:googlemeet", "fav:meet.google.com"],
  "Google Maps": ["si:googlemaps", "fav:maps.google.com"],
  "Google Analytics": ["si:googleanalytics", "fav:analytics.google.com"],
  "Slack": ["si:slack", "fav:slack.com"],
  "SolidWorks": ["si:dassaultsystemes", "fav:solidworks.com"],
  "Dassault Systemes SolidWorks": ["si:dassaultsystemes", "fav:solidworks.com"],
  "Dassault Systemes CATIA": ["si:dassaultsystemes", "fav:3ds.com"],
  "CATIA": ["si:dassaultsystemes", "fav:3ds.com"],
  "MATLAB": MATHWORKS,
  "The MathWorks MATLAB": MATHWORKS,
  "Simulink": MATHWORKS,
  "IBM SPSS Statistics": ["wm:SPSS logo.svg", "si:ibm"],
  "Linux": ["si:linux"],
  "Red Hat Enterprise Linux": ["si:redhat", "fav:redhat.com"],
  "Git": ["si:git"],
  "Git / GitHub": ["si:github"],
  "GitHub": ["si:github"],
  "Figma": ["si:figma"],
  "Bloomberg Terminal": ["fav:bloomberg.com"],
  "Market data terminals (Bloomberg)": ["fav:bloomberg.com"],
  "Jira": ["si:jira", "fav:atlassian.com"],
  "Atlassian JIRA": ["si:jira", "fav:atlassian.com"],
  "Project management tools (Jira, Asana, MS Project)": ["si:jira", "fav:atlassian.com"],
  "Confluence": ["si:confluence", "fav:atlassian.com"],
  "Atlassian Confluence": ["si:confluence", "fav:atlassian.com"],
  "LexisNexis": ["fav:lexisnexis.com"],
  "Instagram": ["si:instagram"],
  "Instagram and TikTok": ["si:instagram"],
  "Facebook": ["si:facebook"],
  "YouTube": ["si:youtube"],
  "X and social platforms": ["si:x"],
  "Bentley MicroStation": ["fav:bentley.com"],
  "Web browser software": ["si:googlechrome"],
  "Culinary Software Services ChefTec": ["fav:cheftec.com"],
  "Seesaw": ["fav:seesaw.com"],
  "Oracle PeopleSoft": ORACLE,
  "Oracle": ORACLE,
  "Oracle NetSuite": ["fav:netsuite.com", ...ORACLE],
  "Oracle Warehouse Management": ORACLE,
  "Oracle Primavera": ORACLE,
  "Oracle Taleo": ORACLE,
  "Instructure Canvas": ["si:instructure", "fav:instructure.com"],
  "Kahoot!": ["si:kahoot", "fav:kahoot.com"],
  "Dragon Medical": ["fav:nuance.com"],
  "Dragon NaturallySpeaking": ["fav:nuance.com"],
  "C++": ["si:cplusplus"],
  "C": ["si:c"],
  "C#": ["wm:C Sharp Logo 2023.svg", "wm:Logo C sharp.svg"],
  "Canva": ["si:canva", "fav:canva.com"],
  "SketchUp": ["si:sketchup", "fav:sketchup.com"],
  "Trimble SketchUp Pro": ["si:sketchup", "fav:sketchup.com"],
  "ClassDojo": ["fav:classdojo.com"],
  "ServiceNow": ["fav:servicenow.com"],
  "FactSet": ["fav:factset.com"],
  "Capital IQ": ["fav:spglobal.com"],
  "IHS Petra": ["fav:spglobal.com"],
  "PitchBook": ["fav:pitchbook.com"],
  "Morningstar Direct": ["fav:morningstar.com"],
  "Jupyter": ["si:jupyter"],
  "Notion": ["si:notion"],
  "Miro": ["si:miro"],
  "Unity": ["si:unity"],
  "Unreal Engine or Unity": ["si:unrealengine"],
  "Unreal Engine": ["si:unrealengine"],
  "Procore": ["fav:procore.com"],
  "Project management software (Procore)": ["fav:procore.com"],
  "Cerner": ["fav:cerner.com", ...ORACLE],
  "Pyxis": ["fav:bd.com"],
  "Pyxis MedStation": ["fav:bd.com"],
  "BD CellQuest": ["fav:bd.com"],
  "LinkedIn Recruiter": ["fav:linkedin.com"],
  "UpToDate": ["fav:uptodate.com"],
  "Westlaw": ["fav:thomsonreuters.com"],
  "Thomson Reuters Westlaw": ["fav:thomsonreuters.com"],
  "PostgreSQL": ["si:postgresql"],
  "Amazon Web Services": ["si:amazonwebservices", "fav:aws.amazon.com"],
  "Amazon Web Services AWS software": ["si:amazonwebservices", "fav:aws.amazon.com"],
  "Amazon SageMaker": ["si:amazonwebservices", "fav:aws.amazon.com"],
  "Pro Tools": ["fav:avid.com"],
  "Avid Media Composer": ["fav:avid.com"],
  "Avid iNEWS": ["fav:avid.com"],
  "Ableton Live": ["si:abletonlive", "fav:ableton.com"],
  "Logic Pro": ["wm:Logic Pro icon.png", "fav:apple.com"],
  "Keynote": ["wm:Keynote icon.png", "fav:apple.com"],
  "Dante Controller": ["fav:audinate.com"],
  "Cision": ["fav:cision.com"],
  "Muck Rack": ["fav:muckrack.com"],
  "Sprout Social": ["fav:sproutsocial.com"],
  "Meltwater": ["fav:meltwater.com"],
  "QLab": ["fav:qlab.app"],
  "Event management platforms (Cvent)": ["fav:cvent.com"],
  "Backstage": ["fav:backstage.com"],
  "Casting Networks": ["fav:castingnetworks.com"],
  "Actors Access": ["fav:actorsaccess.com"],
  "Final Draft": ["fav:finaldraft.com"],
  "Spotify or Apple Music": ["si:spotify"],
  "Spotify for Artists": ["si:spotify"],
  "DistroKid": ["fav:distrokid.com"],
  "Hudl": ["fav:hudl.com"],
  "Frame.io": ["fav:frame.io"],
  "National Instruments LabVIEW": ["fav:ni.com"],
  "Agilent ChemStation": ["fav:agilent.com"],
  "STATISTICA": ["fav:statistica.io", "fav:tibco.com"],
  "Quizlet": ["si:quizlet", "fav:quizlet.com"],
  "ADP Workforce Now": ["fav:adp.com"],
  "ADP Enterprise eTIME": ["fav:adp.com"],
  "ADP eTIME": ["fav:adp.com"],
  "Salesforce": ["si:salesforce", "fav:salesforce.com"],
  "CRM software (Salesforce)": ["si:salesforce", "fav:salesforce.com"],
  "CRM/ticketing systems (Zendesk, Salesforce)": ["si:zendesk", "fav:zendesk.com"],
  "Donor/volunteer databases (Salesforce Nonprofit)": ["si:salesforce", "fav:salesforce.com"],
  "Email/marketing platforms (Mailchimp, HubSpot)": ["si:mailchimp", "si:hubspot"],
  "Survey platforms (Qualtrics)": ["fav:qualtrics.com"],
  "Splunk Enterprise": ["si:splunk", "fav:splunk.com"],
  "Splunk": ["si:splunk", "fav:splunk.com"],
  "GroupMe": ["fav:groupme.com"],
  "Tadpoles": ["fav:tadpoles.com"],
  "Moodle": ["si:moodle"],
  "IEP Direct": ["fav:iepdirect.com"],
  "Ellucian Degree Works": ["fav:ellucian.com"],
  "Banner student records": ["fav:ellucian.com"],
  "WorldCat": ["fav:worldcat.org", "fav:oclc.org"],
  "OCLC databases": ["fav:oclc.org"],
  "Desmos": ["fav:desmos.com"],
  "VS Code": ["wm:Visual Studio Code 1.35 icon.svg"],
  "Docker": ["si:docker"],
  "Wireshark": ["si:wireshark"],
  "Genesis R&D": ["fav:trustwell.com", "fav:esha.com"],
  "John Deere Operations Center": ["si:johndeere", "fav:deere.com"],
  "Climate FieldView": ["fav:climate.com"],
  "Granular": ["fav:granular.ag"],
  "Bluebeam": ["fav:bluebeam.com"],
  "Bluebeam Revu": ["fav:bluebeam.com"],
  "EagleView": ["fav:eagleview.com"],
  "AccuLynx": ["fav:acculynx.com"],
  "JobNimbus": ["fav:jobnimbus.com"],
  "Samsara": ["fav:samsara.com"],
  "Trimble": ["fav:trimble.com"],
  "Trimble GPS software": ["fav:trimble.com"],
  "Trimble CENGEA": ["fav:trimble.com"],
  "Tekla software": ["fav:tekla.com", "fav:trimble.com"],
  "Naviance": ["fav:naviance.com", "fav:powerschool.com"],
  "PowerSchool": ["fav:powerschool.com"],
  "PowerSchool SIS": ["fav:powerschool.com"],
  "Student information systems (PowerSchool/Infinite Campus)": ["fav:powerschool.com"],
  "Blender": ["si:blender"],
  "Toon Boom Harmony": ["fav:toonboom.com"],
  "ZBrush": ["fav:maxon.net"],
  "Workday": ["fav:workday.com"],
  "Greenhouse": ["fav:greenhouse.com"],
  "Applicant tracking systems (Greenhouse, Lever)": ["fav:greenhouse.com"],
  "kdb+/q": ["fav:kx.com"],
  "Smartsheet": ["fav:smartsheet.com"],
  "Clio": ["fav:clio.com"],
  "ForeFlight": ["fav:foreflight.com"],
  "Jeppesen FliteDeck": ["fav:jeppesen.com"],
  "Garmin Pilot": ["si:garmin", "fav:garmin.com"],
  "WHOOP or Garmin": ["fav:whoop.com"],
  "SimplePractice": ["fav:simplepractice.com"],
  "TherapyNotes": ["fav:therapynotes.com"],
  "Thriveworks TherapyBuddy": ["fav:thriveworks.com"],
  "Snowflake": ["si:snowflake"],
  "DJI Pilot": ["si:dji", "fav:dji.com"],
  "Pix4D": ["fav:pix4d.com"],
  "DroneDeploy": ["fav:dronedeploy.com"],
  "Litchi": ["fav:flylitchi.com"],
  "Rhino 3D": ["si:rhinoceros", "fav:rhino3d.com"],
  "Rhino": ["si:rhinoceros", "fav:rhino3d.com"],
  "MatrixGold": ["fav:gemvision.com"],
  "Shopify": ["si:shopify"],
  "Shopify / e-commerce platforms": ["si:shopify"],
  "Coupa": ["fav:coupa.com"],
  "ezyVet": ["fav:ezyvet.com"],
  "IDEXX Cornerstone": ["fav:idexx.com"],
  "IDEXX Laboratories IDEXX Cornerstone": ["fav:idexx.com"],
  "AVImark": ["fav:covetrus.com"],
  "McAllister Software Systems AVImark": ["fav:covetrus.com"],
  "Vagaro": ["fav:vagaro.com"],
  "Square Appointments": ["si:square", "fav:squareup.com"],
  "Square": ["si:square", "fav:squareup.com"],
  "Booksy": ["fav:booksy.com"],
  "Avenza Maps": ["fav:avenza.com"],
  "Manhattan WMS": ["fav:manh.com"],
  "ETC Eos": ["fav:etcconnect.com"],
  "grandMA3": ["fav:malighting.com"],
  "Vectorworks Spotlight": ["fav:vectorworks.net"],
  "Vectorworks": ["fav:vectorworks.net"],
  "Lightwright": ["fav:lightwright.com"],
  "PACER": ["fav:pacer.gov"],
  "EPA reporting databases": ["fav:epa.gov"],
  "Estimating software (CCC ONE)": ["fav:cccis.com"],
  "Estimating software (Xactimate)": ["fav:verisk.com"],
  "Mastercam": ["fav:mastercam.com"],
  "OBS Studio": ["si:obsstudio"],
  "Barco Event Master": ["fav:barco.com"],
  "Yamaha CL/QL editors": ["fav:yamaha.com"],
  "Ross Xpression": ["fav:rossvideo.com"],
  "Grass Valley switchers": ["fav:grassvalley.com"],
  "Dalet": ["fav:dalet.com"],
  "vMix": ["fav:vmix.com"],
  "TeamSnap": ["fav:teamsnap.com"],
  "Catapult": ["fav:catapult.com"],
  "Synergy Sports": ["fav:synergysports.com"],
  "Case CATalyst": ["fav:stenograph.com"],
  "Eclipse": ["fav:eclipsecat.com"],
  "StenoCAT": ["fav:stenocat.com"],
  "CLO 3D": ["fav:clo3d.com"],
  "Gerber AccuMark": ["fav:lectra.com"],
  "Procreate": ["fav:procreate.com"],
  "DaVinci Resolve": ["si:davinciresolve", "fav:blackmagicdesign.com"],
  "Curate": ["fav:curate.co"],
  "Details Flowers": ["fav:detailsflowers.com"],
  "Perforce": ["si:perforce", "fav:perforce.com"],
  "Enscape": ["fav:enscape3d.com"],
  "SDL Trados": ["fav:trados.com", "fav:rws.com"],
  "memoQ": ["fav:memoq.com"],
  "Capture One": ["fav:captureone.com"],
  "Pixieset": ["fav:pixieset.com"],
  "TeamBuildr": ["fav:teambuildr.com"],
  "Grammarly": ["si:grammarly", "fav:grammarly.com"],
  "Milanote": ["fav:milanote.com"],
  "Movie Magic Scheduling": ["fav:ep.com"],
  "StudioBinder": ["fav:studiobinder.com"],
  "Shot Designer": ["fav:hollywoodcamerawork.com"],
  "Otter.ai": ["fav:otter.ai"],
  "Sage 100 ERP": ["si:sage", "fav:sage.com"],
  "DuPont ColorNet": ["fav:axalta.com"],
  "Xerox FreeFlow Print Server": ["si:xerox", "fav:xerox.com"],
  "EFI Pace": ["fav:efi.com"],
  "DaySmart Software 123Pet": ["fav:daysmart.com"],
  "Waters Empower Chromatography Data Software": ["fav:waters.com"],
  "Waters Empower": ["fav:waters.com"],
  "ServiceMax": ["fav:servicemax.com"],
  "RazorSync": ["fav:razorsync.com"],
  "LightSpeed Cloud": ["fav:lightspeedhq.com"],
  "Axxya Systems Nutritionist Pro": ["fav:nutritionistpro.com"],
  "Nutritionist Pro": ["fav:nutritionistpro.com"],
  "CBORD NetRecipe": ["fav:cbord.com"],
  "CBORD Foodservice Suite": ["fav:cbord.com"],
  "Hospitality Control Solutions Aloha Point-of-Sale": ["fav:ncr.com"],
  "NCR Advanced Checkout Solution": ["fav:ncr.com"],
  "EZClaim medical billing": ["fav:ezclaim.com"],
  "Henry Schein Dentrix": ["fav:dentrix.com"],
  "Boardmaker": ["fav:goboardmaker.com"],
  "Clinicient Insight": ["fav:clinicient.com"],
  "GE Healthcare Centricity": ["fav:gehealthcare.com"],
  "Guardian RFID": ["fav:guardianrfid.com"],
  "3M Electronic Monitoring": ["si:3m", "fav:3m.com"],
  "WebEOC": ["fav:juvare.com"],
  "Hyland OnBase": ["fav:hyland.com"],
  "Amadeus CRS": ["fav:amadeus.com"],
  "Sabre": ["fav:sabre.com"],
  "Rezdy booking software": ["fav:rezdy.com"],
  "StataCorp Stata": ["fav:stata.com"],
  "EnCase": ["fav:opentext.com"],
  "Golden Software Surfer": ["fav:goldensoftware.com"],
  "Geosoft Oasis montaj": ["fav:seequent.com"],
  "RockWare RockWorks": ["fav:rockware.com"],
  "ITT ENVI": ["fav:nv5geospatialsoftware.com"],
  "WHONET": ["fav:whonet.org"],
  "Orchard Harvest LIS": ["fav:orchardsoft.com"],
  "Wolfram Mathematica": ["si:wolframmathematica", "fav:wolfram.com"],
  "COMSOL Multiphysics": ["fav:comsol.com"],
  "LabWare LIMS": ["fav:labware.com"],
  "Sparta Systems TrackWise": ["fav:spartasystems.com", "fav:honeywell.com"],
  "Focus 2 (career planning)": ["fav:focus2career.com"],
  "ACT WorkKeys": ["fav:act.org"],
  "Edpuzzle": ["fav:edpuzzle.com"],
  "FileMaker Pro": ["fav:claris.com"],
  "Blackboard": ["fav:blackboard.com"],
  "Turnitin": ["fav:turnitin.com"],
  "Schoology": ["fav:schoology.com"],
  "ParentSquare": ["fav:parentsquare.com"],
  "PyTorch": ["si:pytorch"],
  "TensorFlow": ["si:tensorflow"],
  "IBM Terraform": ["si:terraform"],
  "Ansible software": ["si:ansible"],
  "Kubernetes": ["si:kubernetes"],
  "Bash": ["si:gnubash"],
  "JavaScript": ["si:javascript"],
  "TypeScript": ["si:typescript"],
  "React": ["si:react"],
  "Selenium": ["si:selenium"],
  "Jenkins CI": ["si:jenkins"],
  "WordPress": ["si:wordpress"],
};

// ---------------------------------------------------------------------------

const fileName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function get(url, accept) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept ?? "*/*" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, type, url: res.url };
}

const ext = (type, url) => {
  if (/svg/.test(type) || /\.svg(\?|$)/i.test(url)) return "svg";
  if (/png/.test(type)) return "png";
  if (/jpe?g/.test(type)) return "jpg";
  if (/webp/.test(type)) return "webp";
  if (/x-icon|vnd\.microsoft\.icon/.test(type) || /\.ico(\?|$)/i.test(url)) return "ico";
  return null;
};

const svgOk = (buf) => /<svg[\s>]/i.test(buf.toString("utf8", 0, 600));

async function fromSimpleIcons(slug) {
  for (const url of [`https://cdn.simpleicons.org/${slug}`, `https://cdn.jsdelivr.net/npm/simple-icons@16/icons/${slug}.svg`]) {
    const r = await get(url, "image/svg+xml");
    if (r && svgOk(r.buf)) {
      // the jsdelivr copy has no fill: give it the default brand black so it
      // never inherits a white page colour
      let svg = r.buf.toString("utf8");
      if (!/fill=/.test(svg.slice(0, 200))) svg = svg.replace("<svg", '<svg fill="#111"');
      return { buf: Buffer.from(svg), ext: "svg", from: url };
    }
  }
  return null;
}

async function fromWikimedia(file) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=256`;
  const r = await get(url);
  if (!r) return null;
  const e = ext(r.type, r.url);
  if (!e) return null;
  if (e === "svg" && !svgOk(r.buf)) return null;
  return { buf: r.buf, ext: e, from: url };
}

// Google's service answers a domain it does not know with a 404 and a
// default globe (726B); the others 404 outright or hand back a generic.
async function fromFavicon(domain) {
  const tries = [
    `https://icon.horse/icon/${domain}`,
    `https://unavatar.io/${domain}?fallback=false`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
  const got = [];
  for (const url of tries) {
    try {
      const r = await get(url, "image/*");
      if (!r || r.buf.length < 300) continue;
      const e = ext(r.type, r.url);
      if (!e) continue;
      if (e === "svg" && !svgOk(r.buf)) continue;
      got.push({ buf: r.buf, ext: e, from: url });
    } catch {}
  }
  if (!got.length) return null;
  // svg first, then the biggest raster; a jpg (no transparency) only when
  // nothing else answered
  const rank = (r) => (r.ext === "svg" ? 2 : r.ext === "jpg" ? 0 : 1);
  got.sort((a, b) => rank(b) - rank(a) || b.buf.length - a.buf.length);
  return got[0];
}

async function fetchMark(sources) {
  for (const s of sources) {
    const [kind, ...rest] = s.split(":");
    const arg = rest.join(":");
    try {
      const r = kind === "si" ? await fromSimpleIcons(arg) : kind === "wm" ? await fromWikimedia(arg) : await fromFavicon(arg);
      if (r) return r;
    } catch {}
  }
  return null;
}

/** .ico to .png with macOS sips, so the page serves one raster type. */
async function toPng(icoPath, pngPath) {
  try {
    await run("sips", ["-s", "format", "png", icoPath, "--out", pngPath]);
    return true;
  } catch {
    return false;
  }
}

const exists = (p) => access(p).then(() => true, () => false);

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = {};
  const missing = [];
  // one fetch per distinct source list, shared by every name that uses it
  const bySources = new Map();
  for (const [name, sources] of Object.entries(SOURCES)) {
    const key = JSON.stringify(sources);
    if (!bySources.has(key)) bySources.set(key, { sources, names: [] });
    bySources.get(key).names.push(name);
  }
  let n = 0;
  for (const { sources, names } of bySources.values()) {
    const base = fileName(names[0]);
    let file = null;
    for (const e of ["svg", "png", "jpg", "webp"]) if (await exists(path.join(OUT_DIR, `${base}.${e}`))) file = `${base}.${e}`;
    if (!file || REFETCH) {
      const r = await fetchMark(sources);
      if (r) {
        let e = r.ext;
        let out = path.join(OUT_DIR, `${base}.${e}`);
        await writeFile(out, r.buf);
        if (e === "ico") {
          const png = path.join(OUT_DIR, `${base}.png`);
          if (await toPng(out, png)) { e = "png"; out = png; await run("rm", [path.join(OUT_DIR, `${base}.ico`)]); }
        }
        file = `${base}.${e}`;
        process.stdout.write(`✓ ${names[0]}  ←  ${r.from}\n`);
      } else {
        missing.push(names[0]);
        process.stdout.write(`✗ ${names[0]}  (no source answered: ${sources.join(", ")})\n`);
      }
    }
    if (file) for (const name of names) manifest[name] = `/images/logos/software/${file}`;
    n++;
  }
  const lines = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  await writeFile(
    MANIFEST,
    `// GENERATED by scripts/software-logos.mjs. Do not edit: add the product to\n// SOURCES there and run the script. Software name → committed mark.\nexport const SOFTWARE_LOGOS: Record<string, string> = {\n${lines.join("\n")}\n};\n`,
  );
  console.log(`\n${Object.keys(manifest).length} names → ${n} marks; ${missing.length} without a mark${missing.length ? ":\n  " + missing.join("\n  ") : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
