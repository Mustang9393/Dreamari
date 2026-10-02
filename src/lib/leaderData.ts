/**
 * Leader data: School Leader and District Leader dashboards.
 *
 * DEMO-ONLY seeded data, transcribed on 2 Oct 2026 from the Replit reference
 * (docs/reference/school-district-leader-replit-2026-10/NOTES.md). Every number,
 * label and piece of copy a School Leader or District Leader screen needs lives
 * here so screen builders never have to invent data. The production app replaces
 * this module with real aggregates (SIS enrollment, counselor assignments,
 * Dreamari activity events, documented follow-up activity).
 *
 * Provenance rules used throughout:
 * - "Observed" values are copied from the notes.
 * - Where the notes say a value is a shared placeholder for every school, it is
 *   shared here too (see `schoolDetail`).
 * - Where the notes give a rule (grade offsets, Impact Over Time easing, support
 *   status percentages, baseline = current minus delta) the rule is implemented
 *   and flagged in a comment; values a rule had to fill in for a school the notes
 *   never opened are flagged `estimated` / "INFERRED".
 * - Developer identifiers that leaked into the reference tooltips are replaced
 *   with plain copy.
 * - No em dashes in any string. En dashes in "2026–27" match the reference.
 */

// ---------------------------------------------------------------------------
// Small formatting helpers (internal)
// ---------------------------------------------------------------------------

const round1 = (n: number): number => Math.round(n * 10) / 10;
/** 18 -> "18", 18.5 -> "18.5" */
const trim = (n: number): string => String(round1(n));
/** 18 -> "18.0" */
const fixed1 = (n: number): string => n.toFixed(1);
/** 1015 -> "1,015" */
const int = (n: number): string => n.toLocaleString("en-US");
/** Placeholder shown in report cells that have no baseline or change. */
const NO_VALUE = "-";
const ACADEMIC_YEAR = "2026–27";

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

/** Demo View role descriptions (notes 1.1), shown in the (i) next to the role eyebrow. */
export const LEADER_ROLE_DESCRIPTIONS = {
  school:
    "Schoolwide view for principals, assistant principals, CCR/CTE leaders, counseling leaders, and other school administrators.",
  district:
    "Multi-school view for superintendents, assistant superintendents, district CCR/CTE leaders, counseling leaders, and other district administrators.",
} as const;

/** Sidebar items for the School Leader role (notes 1.3). */
export const SCHOOL_LEADER_NAV = [
  { id: "overview", label: "Overview", route: "/" },
  { id: "student-progress", label: "Student Progress", route: "/student-progress" },
  { id: "career-postsecondary", label: "Career + Postsecondary", route: "/career-postsecondary" },
  { id: "counseling-team", label: "Counseling Team", route: "/counseling-team" },
  { id: "reports", label: "Reports", route: "/reports" },
] as const;

/** Sidebar items for the District Leader role (notes 1.3). */
export const DISTRICT_LEADER_NAV = [
  { id: "overview", label: "Overview", route: "/" },
  { id: "school-performance", label: "School Performance", route: "/school-performance" },
  { id: "student-outcomes", label: "Student Outcomes", route: "/student-outcomes" },
  { id: "district-capacity", label: "Counseling Capacity", route: "/district-capacity" },
  { id: "district-reports", label: "Reports", route: "/district-reports" },
] as const;

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** District school status. Inferred rule: tracks planning milestone completion (see notes open question 4). */
export type SchoolStatus = "above" | "meeting" | "support";

/** Display strings and pill tone per school status. */
export const SCHOOL_STATUS_LABELS: Record<
  SchoolStatus,
  { pill: string; filter: string; shortCaption: string; tone: "purple" | "blue" | "orange" }
> = {
  above: { pill: "Above Target", filter: "Above target", shortCaption: "Above target", tone: "purple" },
  meeting: { pill: "Meeting Target", filter: "Meeting target", shortCaption: "Meeting target", tone: "blue" },
  support: { pill: "Support Needed", filter: "Support needed", shortCaption: "Support needed", tone: "orange" },
};

/** A current percentage plus its change in percentage points since the launch baseline. */
export interface SchoolMetric {
  /** Current value, percent of enrolled students. */
  value: number;
  /** Percentage-point change since launch. Launch baseline = value - delta. */
  delta: number;
}

/** How a counselor-efficiency figure was obtained. */
export type EfficiencyProvenance = "observed" | "hours-estimated" | "estimated";

/** One district school row: everything the District screens (and the drilled-in School view) need. */
export interface LeaderSchool {
  /** Stable kebab id. */
  id: string;
  name: string;
  /** Borough or city, all in NY (header reads "<city>, NY"). */
  city: string;
  /** Enrolled students (all grades). */
  enrollment: number;
  counselors: number;
  status: SchoolStatus;
  career: SchoolMetric;
  postsecondary: SchoolMetric;
  experiential: SchoolMetric;
  planning: SchoolMetric;
  /**
   * Professional exposure. Current values for all 11 schools are observed on District Student
   * Outcomes. The delta is observed for 4 schools; for the other 7 it is INFERRED by the rule
   * delta = round1(value x 0.3467), which reproduces all 4 observed pairs exactly.
   */
  professional: SchoolMetric & { deltaEstimated: boolean };
  /** Students requiring follow-up (District Counseling Capacity "Follow-up need"). */
  followUps: number;
  /** Follow-up coverage, percent of flagged students with a recorded action. */
  coverage: number;
  /**
   * Counselor efficiency, relative % gain vs prior workflow, plus admin hours returned per
   * counselor per week. Observed for Northbridge (+21, 6.4), Metro Arts (+20, 6.3), Harborview
   * (+18, 6.1) and Kingsbridge (+17, hours not seen). For the rest, pct falls back to the
   * district +19 and hours follow the observed line hours = 4.3 + 0.1 x pct.
   */
  counselorEfficiency: { pct: number; hoursPerWeek: number; provenance: EfficiencyProvenance };
  /** Student id prefix for the sample table. Only "N" and "MA" are observed; the rest are INFERRED initials. */
  idPrefix: string;
}

type SchoolRow = [
  id: string,
  name: string,
  city: string,
  enrollment: number,
  counselors: number,
  status: SchoolStatus,
  career: [number, number],
  postsecondary: [number, number],
  experiential: [number, number],
  planning: [number, number],
  professional: [number, number | null],
  followUps: number,
  coverage: number,
  efficiency: [number, number | null] | null,
  idPrefix: string,
];

const DISTRICT_EFFICIENCY_FALLBACK = 19;
const PROFESSIONAL_DELTA_FACTOR = 0.3467;

// Rows are in School Performance default order (planning milestones, high to low).
const SCHOOL_ROWS: SchoolRow[] = [
  ["northbridge-academy", "Northbridge Academy", "Brooklyn", 964, 4, "above", [78, 18.5], [69, 18.0], [67, 20.6], [88, 28.9], [54, 18.7], 38, 90, [21, 6.4], "N"],
  ["metro-arts-sciences-academy", "Metro Arts & Sciences Academy", "Queens", 528, 1, "above", [85, 20.1], [80, 20.9], [74, 22.8], [70, 23.0], [60, 20.8], 8, 88, [20, 6.3], "MA"],
  ["east-river-preparatory-academy", "East River Preparatory Academy", "Manhattan", 684, 2, "above", [83, 19.7], [76, 19.8], [73, 22.5], [69, 22.6], [60, null], 12, 87, null, "ER"],
  ["crescent-academy", "Crescent Academy", "Queens", 812, 2, "meeting", [81, 19.2], [74, 19.3], [70, 21.5], [65, 21.3], [57, null], 16, 89, null, "CR"],
  ["riverside-innovation-high-school", "Riverside Innovation High School", "Bronx", 1015, 3, "meeting", [78, 18.5], [71, 18.5], [68, 20.9], [63, 20.7], [55, null], 21, 88, null, "RI"],
  ["central-point-high-school", "Central Point High School", "Manhattan", 1128, 3, "meeting", [77, 18.2], [70, 18.3], [67, 20.6], [62, 20.3], [54, null], 25, 87, null, "CP"],
  ["liberty-grove-academy", "Liberty Grove Academy", "Staten Island", 1244, 4, "meeting", [76, 18.0], [70, 18.3], [66, 20.3], [61, 20.0], [53, null], 27, 88, null, "LG"],
  ["summit-heights-high-school", "Summit Heights High School", "Brooklyn", 1390, 4, "meeting", [76, 18.0], [69, 18.0], [66, 20.3], [60, 19.7], [53, null], 31, 88, null, "SH"],
  ["kingsbridge-preparatory", "Kingsbridge Preparatory", "Bronx", 1535, 4, "support", [73, 17.3], [68, 17.7], [63, 19.4], [57, 18.7], [50, 17.3], 35, 86, [17, null], "KP"],
  ["harborview-high-school", "Harborview High School", "Brooklyn", 1748, 6, "support", [71, 16.8], [66, 17.2], [60, 18.5], [53, 17.4], [47, 16.3], 42, 87, [18, 6.1], "HV"],
  ["gateway-technical-high-school", "Gateway Technical High School", "Queens", 2010, 6, "support", [73, 17.4], [63, 16.4], [59, 18.1], [50, 16.6], [46, null], 29, 90, null, "GT"],
];

function buildSchool(r: SchoolRow): LeaderSchool {
  const [id, name, city, enrollment, counselors, status, c, p, e, pl, pro, followUps, coverage, eff, idPrefix] = r;
  const efficiency: LeaderSchool["counselorEfficiency"] = !eff
    ? {
        pct: DISTRICT_EFFICIENCY_FALLBACK,
        hoursPerWeek: round1(4.3 + 0.1 * DISTRICT_EFFICIENCY_FALLBACK),
        provenance: "estimated",
      }
    : eff[1] === null
      ? { pct: eff[0], hoursPerWeek: round1(4.3 + 0.1 * eff[0]), provenance: "hours-estimated" }
      : { pct: eff[0], hoursPerWeek: eff[1], provenance: "observed" };
  return {
    id,
    name,
    city,
    enrollment,
    counselors,
    status,
    career: { value: c[0], delta: c[1] },
    postsecondary: { value: p[0], delta: p[1] },
    experiential: { value: e[0], delta: e[1] },
    planning: { value: pl[0], delta: pl[1] },
    professional: {
      value: pro[0],
      delta: pro[1] ?? round1(pro[0] * PROFESSIONAL_DELTA_FACTOR),
      deltaEstimated: pro[1] === null,
    },
    followUps,
    coverage,
    counselorEfficiency: efficiency,
    idPrefix,
  };
}

/** The 11 district schools, in School Performance default order (planning milestones, high to low). */
export const SCHOOLS: LeaderSchool[] = SCHOOL_ROWS.map(buildSchool);

/** Northbridge is the seed school the first time a School Leader view opens. */
export const DEFAULT_SCHOOL_ID = "northbridge-academy";

/** Look a school up by its stable id. */
export function schoolById(id: string): LeaderSchool | undefined {
  return SCHOOLS.find((s) => s.id === id);
}

function requireSchool(id: string): LeaderSchool {
  return schoolById(id) ?? (schoolById(DEFAULT_SCHOOL_ID) as LeaderSchool);
}

/** Launch baseline for a metric: current minus delta, one decimal (matches every baseline quoted in the notes). */
export function metricBaseline(m: SchoolMetric): number {
  return round1(m.value - m.delta);
}

/** "City, NY" caption used under school names. */
export function schoolLocation(school: LeaderSchool): string {
  return `${school.city}, NY`;
}

/** Students per counselor, rounded to a whole number (e.g. 1748 / 6 = 291). */
export function studentsPerCounselor(school: LeaderSchool): number {
  return Math.round(school.enrollment / school.counselors);
}

// ---------------------------------------------------------------------------
// Outcome metric definitions shared by both roles
// ---------------------------------------------------------------------------

/** The five outcome metrics, with the exact copy used in the School Overview tooltips and the Data definitions modal. */
type OutcomeKey = "career" | "postsecondary" | "experiential" | "professional" | "planning";

interface OutcomeDef {
  key: OutcomeKey;
  /** School-view and Data definitions label. */
  label: string;
  /** District-view label (wording differs only). */
  districtLabel: string;
  /** School Overview (i) lead sentence (includes "during the selected academic year."). Planning has none on the KPI row. */
  tooltipLead: string;
  /** Data definitions numerator line. */
  numerator: string;
  /** District (i) "Action" phrase. */
  districtAction: string;
  /** District "meaning" sentence (Student Outcomes definition, readiness pulse meaning). */
  districtMeaning: string;
}

const ALL_ENROLLED_DENOMINATOR = "All enrolled students in the selected scope.";

const OUTCOME_DEFS: OutcomeDef[] = [
  {
    key: "career",
    label: "Career Exploration",
    districtLabel: "Career exploration",
    tooltipLead:
      "Share of enrolled students with a recorded career exploration action, such as saving a pathway, completing a simulation, or reviewing a career profile, during the selected academic year.",
    numerator:
      "Unique enrolled students with at least one meaningful career exploration action, such as saving a pathway or completing a career simulation.",
    districtAction: "students who have completed meaningful career exploration",
    districtMeaning: "Students who have completed meaningful career exploration.",
  },
  {
    key: "postsecondary",
    label: "Postsecondary Exploration",
    districtLabel: "Postsecondary exploration",
    tooltipLead:
      "Share of enrolled students with a recorded postsecondary exploration action, such as saving an institution or reviewing a program, during the selected academic year.",
    numerator:
      "Unique enrolled students with a recorded postsecondary exploration action, such as saving an institution or reviewing a program.",
    districtAction: "students who have explored postsecondary pathways",
    districtMeaning: "Students who have explored postsecondary pathways.",
  },
  {
    key: "experiential",
    label: "Experiential Career Learning",
    districtLabel: "Experiential learning",
    tooltipLead:
      "Share of enrolled students who completed at least one career-connected simulation or experiential learning activity during the selected academic year.",
    numerator:
      "Unique enrolled students who completed at least one career-connected simulation or experiential learning activity.",
    districtAction: "students with a verified career-connected experience",
    districtMeaning: "Students with a verified career-connected experience.",
  },
  {
    key: "professional",
    label: "Professional Exposure",
    districtLabel: "Professional exposure",
    tooltipLead:
      "Share of enrolled students who engaged with at least one industry professional during the selected academic year.",
    numerator: "Unique enrolled students who engaged with at least one industry professional.",
    districtAction: "students with structured exposure to professionals",
    districtMeaning: "Students with structured exposure to professionals.",
  },
  {
    key: "planning",
    label: "Planning Milestone Completion",
    districtLabel: "Planning milestones",
    tooltipLead:
      "Share of enrolled students who completed the required career and postsecondary planning milestones during the selected academic year.",
    numerator:
      "Unique enrolled students who completed the required career and postsecondary planning milestones.",
    districtAction: "students who have completed the planning milestone",
    districtMeaning: "Students who have completed the planning milestone.",
  },
];

function outcomeDef(key: OutcomeKey): OutcomeDef {
  return OUTCOME_DEFS.find((d) => d.key === key) as OutcomeDef;
}

// ---------------------------------------------------------------------------
// Data definitions modals
// ---------------------------------------------------------------------------

/** One outcome card in the Data definitions modal. */
export interface DataDefinitionOutcome {
  id: string;
  title: string;
  numerator: string;
  denominator: string;
  current: number;
  baseline: number;
  /** Percentage-point change since launch. */
  delta: number;
  /** Display string for the right-hand side, e.g. "Current 78% · Launch baseline 59.5% · +18.5% points". */
  summary: string;
  /** Display string for the green delta, e.g. "+18.5% points". */
  deltaLabel: string;
}

/** Contents of the "Data definitions" modal (School or District scope). */
export interface DataDefinitionsModal {
  title: string;
  subtitle: string;
  outcomesHeading: string;
  outcomes: DataDefinitionOutcome[];
  /** The four prose blocks: Counselor capacity, Selected period and scope, Prototype data notice, Potential production data sources. */
  blocks: { title: string; body: string }[];
  closeLabel: string;
}

function definitionOutcome(key: OutcomeKey, current: number, delta: number): DataDefinitionOutcome {
  const def = outcomeDef(key);
  const baseline = round1(current - delta);
  const deltaLabel = `+${trim(delta)}% points`;
  return {
    id: key,
    title: def.label,
    numerator: def.numerator,
    denominator: ALL_ENROLLED_DENOMINATOR,
    current,
    baseline,
    delta,
    summary: `Current ${current}% · Launch baseline ${trim(baseline)}% · ${deltaLabel}`,
    deltaLabel,
  };
}

function definitionBlocks(schoolEfficiencyPct: number): DataDefinitionsModal["blocks"] {
  return [
    {
      title: "Counselor capacity",
      body: `The school’s +${schoolEfficiencyPct}% and district’s +${DISTRICT_EFFICIENCY_FALLBACK}% values estimate relative capacity returned for direct student support compared with the prior workflow. They are relative changes, not student outcome percentages or percentage-point gains. The comparison period is the prior workflow.`,
    },
    {
      title: "Selected period and scope",
      body: "The current snapshot covers the 2026–27 academic year. School percentages use that school’s enrolled students; district percentages use enrollment-weighted school rollups. Follow-up coverage uses only students identified as requiring follow-up.",
    },
    {
      title: "Prototype data notice",
      body: "All figures and student profiles in this workspace are synthetic. No live student information system, school roster, or district data source is connected.",
    },
    {
      title: "Potential production data sources",
      body: "With appropriate authorization, a production setup could use Dreamari activity and report events, verified program participation, student enrollment and counselor assignments from an SIS, and documented follow-up activity. These are possible sources only; none are connected here.",
    },
  ];
}

/** Data definitions modal for one school; picks up that school's own numbers (notes 2.0.1, 3.6). */
export function schoolDataDefinitions(schoolId: string): DataDefinitionsModal {
  const s = requireSchool(schoolId);
  return {
    title: "Data definitions",
    subtitle: `${s.name} · ${int(s.enrollment)} enrolled students · ${ACADEMIC_YEAR} academic year · compared with the launch baseline`,
    outcomesHeading: "Student outcome percentages",
    outcomes: [
      definitionOutcome("career", s.career.value, s.career.delta),
      definitionOutcome("postsecondary", s.postsecondary.value, s.postsecondary.delta),
      definitionOutcome("experiential", s.experiential.value, s.experiential.delta),
      definitionOutcome("professional", s.professional.value, s.professional.delta),
      definitionOutcome("planning", s.planning.value, s.planning.delta),
    ],
    blocks: definitionBlocks(s.counselorEfficiency.pct),
    closeLabel: "Close",
  };
}

/**
 * District Data definitions modal. The counselor-capacity block quotes the school value of
 * whichever school was last drilled into (+21% for Northbridge, +20% for Metro Arts).
 */
export function districtDataDefinitions(lastDrilledSchoolId: string = DEFAULT_SCHOOL_ID): DataDefinitionsModal {
  const school = requireSchool(lastDrilledSchoolId);
  return {
    title: "Data definitions",
    subtitle: `Metro Heights Public Schools · ${int(DISTRICT_TOTALS.enrollment)} enrolled students · ${DISTRICT_TOTALS.schools} schools · ${ACADEMIC_YEAR} academic year · compared with the launch baseline`,
    outcomesHeading: "Student outcome percentages",
    outcomes: DISTRICT_OUTCOMES.map((o) => definitionOutcome(o.key, o.value, o.delta)),
    blocks: definitionBlocks(school.counselorEfficiency.pct),
    closeLabel: "Close",
  };
}

// ---------------------------------------------------------------------------
// District: identity, totals, KPIs
// ---------------------------------------------------------------------------

/** District-level totals. Enrollment, counselors and follow-ups reconcile to the sums over `SCHOOLS`. */
export const DISTRICT_TOTALS = {
  schools: 11,
  enrollment: 13058,
  counselors: 39,
  /** Students requiring follow-up, district wide. */
  followUps: 284,
  /** District weighted follow-up coverage, percent. */
  coverage: 88,
  /** Students per counselor, district average (13,058 / 39 = 334.8). */
  studentsPerCounselor: 335,
  /** Counselor capacity improvement, relative % vs prior workflow (not percentage points). */
  counselorCapacityPct: DISTRICT_EFFICIENCY_FALLBACK,
} as const;

/** District identity block shown in the header on every District screen. */
export const DISTRICT = {
  id: "metro-heights-public-schools",
  name: "Metro Heights Public Schools",
  eyebrow: "DISTRICT LEADER · SYNTHETIC DATA",
  /** Quiet line above the H1 on every District screen. */
  pageEyebrow: "NEW YORK DISTRICT WORKSPACE · PLANNING VIEW · SYNTHETIC DATA",
  metaLine: "11 schools · 13,058 students · 39 counselors · 2026–27",
  tagline: "A shared view of student outcomes and counseling capacity across the district.",
  roleDescription: LEADER_ROLE_DESCRIPTIONS.district,
  /** Sidebar footer chip. The reference truncates the name; the full name is `name`. */
  sidebar: { initials: "MH", name: "Metro Heights Public Schools", role: "District Leader" },
} as const;

/** District outcome rollups (enrollment-weighted school rollups). Baselines are current minus delta. */
const DISTRICT_OUTCOMES: { key: OutcomeKey; value: number; delta: number }[] = [
  { key: "career", value: 76, delta: 18 },
  { key: "postsecondary", value: 69, delta: 18 },
  { key: "experiential", value: 65, delta: 20 },
  { key: "professional", value: 52, delta: 18 },
  { key: "planning", value: 61, delta: 20 },
];

/** Definition fields behind a KPI's (i) tooltip. */
export interface KpiDefinition {
  numerator: string;
  denominator: string;
  population: string;
  baseline: string;
}

/** A KPI card (School Overview or District Overview). */
export interface SchoolKpi {
  id: string;
  label: string;
  /** Current value. For counselor efficiency this is the relative % gain. */
  value: number;
  unit: "%";
  /** Display string for the big number, e.g. "78%" or "+21%". */
  displayValue: string;
  /** Change since baseline. Percentage points for outcomes; relative % for counselor efficiency / capacity. */
  delta: number;
  deltaUnit: "pts" | "%";
  /** Delta caption, e.g. "since launch" or "vs prior workflow". */
  deltaCaption: string;
  /** Baseline value (launch baseline; 0 relative for counselor efficiency / capacity). */
  baseline: number;
  definition: KpiDefinition;
  /** Full (i) tooltip text; also the accessible name. */
  tooltip: string;
}

/** A District Overview KPI card: a `SchoolKpi` plus icon and the exact delta line. */
export interface DistrictKpi extends SchoolKpi {
  icon: "line-chart" | "target" | "users";
  /** Delta line as displayed, e.g. "↑ +18.0 pts" or "19% relative". */
  deltaDisplay: string;
  /** Grey caption under the delta. */
  caption: string;
}

const DISTRICT_POPULATION = `${int(DISTRICT_TOTALS.enrollment)} students represented in the district population`;

function districtOutcomeTooltip(key: OutcomeKey, value: number, delta: number): string {
  const def = outcomeDef(key);
  const baseline = round1(value - delta);
  return `Definition: Action: ${def.districtAction}. Numerator: students recorded as meeting this measure. Denominator: ${int(DISTRICT_TOTALS.enrollment)} students represented in the district population. 2026–27 shows ${value}%. Launch baseline: ${trim(baseline)}%; change: +${fixed1(delta)} percentage points.`;
}

const DISTRICT_CAPACITY_TOOLTIP =
  "Definition: Action: compare counselor-capacity improvement. Numerator: district counselor-capacity index change. Denominator: prior workflow launch baseline. 2026–27 shows 19% relative capacity improvement, not percentage points. Launch baseline: 0% relative improvement.";

/** The six District Overview KPI cards, in display order. */
export const DISTRICT_KPIS: DistrictKpi[] = [
  ...DISTRICT_OUTCOMES.map((o): DistrictKpi => {
    const def = outcomeDef(o.key);
    const baseline = round1(o.value - o.delta);
    return {
      id: o.key,
      label: def.districtLabel,
      value: o.value,
      unit: "%",
      displayValue: `${o.value}%`,
      delta: o.delta,
      deltaUnit: "pts",
      deltaCaption: "vs. launch baseline",
      baseline,
      definition: {
        numerator: "Students recorded as meeting this measure",
        denominator: DISTRICT_POPULATION,
        population: DISTRICT_POPULATION,
        baseline: `${trim(baseline)}% launch baseline`,
      },
      tooltip: districtOutcomeTooltip(o.key, o.value, o.delta),
      icon: o.key === "planning" ? "target" : "line-chart",
      deltaDisplay: `↑ +${fixed1(o.delta)} pts`,
      caption: "vs. launch baseline",
    };
  }),
  {
    id: "capacity",
    label: "Counselor capacity",
    value: DISTRICT_TOTALS.counselorCapacityPct,
    unit: "%",
    displayValue: "19%",
    delta: DISTRICT_TOTALS.counselorCapacityPct,
    deltaUnit: "%",
    deltaCaption: "vs. launch baseline",
    baseline: 0,
    definition: {
      numerator: "District counselor-capacity index change",
      denominator: "Prior workflow launch baseline",
      population: "39 counselors across 11 schools",
      baseline: "0% relative improvement",
    },
    tooltip: DISTRICT_CAPACITY_TOOLTIP,
    icon: "users",
    deltaDisplay: "19% relative",
    caption: "vs. launch baseline",
  },
];

/** District Overview "Schools by status" card. */
export const DISTRICT_STATUS_CARD = {
  eyebrow: "SCHOOL STATUS",
  title: "Schools by status",
  /** Counts are derived from `SCHOOLS`; 3 / 5 / 3. */
  pills: [
    { status: "above" as const, label: "Above target", tone: "purple" as const },
    { status: "meeting" as const, label: "Meeting target", tone: "blue" as const },
    { status: "support" as const, label: "Support needed", tone: "orange" as const },
  ],
} as const;

/** Count schools per status (optionally within a subset). */
export function statusCounts(schools: LeaderSchool[] = SCHOOLS): Record<SchoolStatus, number> {
  const out: Record<SchoolStatus, number> = { above: 0, meeting: 0, support: 0 };
  for (const s of schools) out[s.status] += 1;
  return out;
}

/** District Overview "Outcome measures" ranked-bar card (fixed order 01 to 05, not sorted by value). */
export const DISTRICT_OUTCOME_MEASURES = {
  eyebrow: "STUDENT OUTCOMES",
  title: "Outcome measures",
  rows: DISTRICT_OUTCOMES.map((o, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    id: o.key,
    label: outcomeDef(o.key).districtLabel,
    value: o.value,
    tooltip: districtOutcomeTooltip(o.key, o.value, o.delta),
    /** Bar tone: professional exposure (the lowest) is orange, planning is blue, the rest purple. */
    tone: (o.key === "professional" ? "orange" : o.key === "planning" ? "blue" : "purple") as
      | "purple"
      | "orange"
      | "blue",
  })),
  note: {
    title: "How to read this",
    body: "Percentages are weighted by district student enrollment, not averaged school scores.",
  },
} as const;

/** Per-cell (i) tooltip for a school metric on the District tables (Overview top five, School Performance, Student Outcomes). */
export function schoolMetricTooltip(
  school: LeaderSchool,
  key: "career" | "postsecondary" | "experiential" | "professional" | "planning",
  gradeLabel: string = "all grades",
  currentOverride?: number,
): string {
  const nouns: Record<typeof key, string> = {
    career: "career exploration",
    postsecondary: "postsecondary exploration",
    experiential: "experiential learning",
    professional: "professional exposure",
    planning: "planning milestone completion",
  };
  const m = school[key];
  const current = currentOverride ?? m.value;
  const numerator = key === "planning" ? "students recorded as complete" : "students recorded as meeting the measure";
  const baseline = Math.round(m.value - m.delta);
  const base = `Definition: Action: review ${school.name} ${nouns[key]} for ${gradeLabel}. Numerator: ${numerator}. Denominator/population: ${int(school.enrollment)} students at this school in 2026–27. Current rate: ${current}%. Launch baseline comparison: ${baseline}% and +${fixed1(m.delta)} percentage points for the school measure.`;
  // The reference leaks a developer identifier in the last sentence; replaced with plain copy.
  return gradeLabel === "all grades"
    ? base
    : `${base} Grade view applies the district all-grades offset for the selected grade.`;
}

/** One row of the District Overview "Top five by career exploration" table. */
export interface TopFiveRow {
  school: LeaderSchool;
  location: string;
  statusLabel: string;
  career: { value: number; baselineRounded: number; delta: number; tooltip: string };
  planning: { value: number; baselineRounded: number; delta: number; tooltip: string };
  /** Trend = planning milestone change since launch (not career), in pts, e.g. "+23.0 pts". */
  trendLabel: string;
  /** Aria label for the decorative sparkline. */
  trendAriaLabel: string;
  /** aria-label / title of the end-of-row arrow button. */
  openLabel: string;
}

/** District Overview "Top five by career exploration" table (sorted by career exploration, high to low). */
export const DISTRICT_TOP_FIVE = {
  eyebrow: "SCHOOL PERFORMANCE",
  title: "Top five by career exploration",
  columns: ["SCHOOL", "STATUS", "CAREER EXPLORATION", "PLANNING MILESTONES", "TREND"],
  rows: [...SCHOOLS]
    .sort((a, b) => b.career.value - a.career.value)
    .slice(0, 5)
    .map(
      (s): TopFiveRow => ({
        school: s,
        location: `${schoolLocation(s)} · ${int(s.enrollment)} students`,
        statusLabel: SCHOOL_STATUS_LABELS[s.status].pill,
        career: {
          value: s.career.value,
          baselineRounded: Math.round(s.career.value - s.career.delta),
          delta: s.career.delta,
          tooltip: schoolMetricTooltip(s, "career"),
        },
        planning: {
          value: s.planning.value,
          baselineRounded: Math.round(s.planning.value - s.planning.delta),
          delta: s.planning.delta,
          tooltip: schoolMetricTooltip(s, "planning"),
        },
        trendLabel: `+${fixed1(s.planning.delta)} pts`,
        trendAriaLabel: `+${fixed1(s.planning.delta)} percentage point trend vs launch baseline`,
        openLabel: `Open ${s.name}`,
      }),
    ),
} as const;

/** Page copy for District Overview. */
export const DISTRICT_OVERVIEW_COPY = { heading: "District overview" } as const;

// ---------------------------------------------------------------------------
// District School Performance
// ---------------------------------------------------------------------------

/** Grade filter value: all grades or one of 9 to 12. */
export type GradeFilter = "all" | 9 | 10 | 11 | 12;

/** Fixed per-grade offsets (percentage points) applied equally to every school's current percentages (notes 3.2). */
export const GRADE_OFFSETS: Record<
  9 | 10 | 11 | 12,
  { career: number; postsecondary: number; experiential: number; planning: number }
> = {
  9: { career: -5, postsecondary: -7, experiential: -8, planning: -14 },
  10: { career: -2, postsecondary: -3, experiential: -3, planning: -6 },
  11: { career: 3, postsecondary: 3, experiential: 3, planning: 5 },
  12: { career: 4, postsecondary: 7, experiential: 8, planning: 15 },
};

/** School Performance grade options. */
export const GRADE_OPTIONS: { value: GradeFilter; label: string }[] = [
  { value: "all", label: "All grades" },
  { value: 9, label: "Grade 9" },
  { value: 10, label: "Grade 10" },
  { value: 11, label: "Grade 11" },
  { value: 12, label: "Grade 12" },
];

/** Display label for a grade filter value. */
export function gradeLabel(grade: GradeFilter): string {
  return grade === "all" ? "all grades" : `Grade ${grade}`;
}

/** A school's headline metrics under a grade filter. Deltas and statuses never change with grade. */
export interface SchoolGradeMetrics {
  enrollment: number;
  career: number;
  postsecondary: number;
  experiential: number;
  planning: number;
}

const clampPct = (n: number): number => Math.max(0, Math.min(100, n));

/**
 * Enrollment of one grade at a school: the all-grades count split into four, with any
 * remainder going to the earliest grades (Gateway 2,010 -> 503 / 503 / 502 / 502).
 */
export function gradeEnrollment(enrollment: number, grade: 9 | 10 | 11 | 12): number {
  const base = Math.floor(enrollment / 4);
  const remainder = enrollment % 4;
  return base + (grade - 9 < remainder ? 1 : 0);
}

/**
 * School Performance grade rule (notes 3.2): grade "all" returns the school unchanged; grades 9 to 12
 * split enrollment (about one quarter) and shift every current percentage by the fixed `GRADE_OFFSETS`,
 * capped to 0..100 (Northbridge planning 88 + 15 shows 100). Example: Grade 9 Northbridge = 241 students,
 * 73 / 62 / 59 / 74.
 */
export function schoolMetricsForGrade(school: LeaderSchool, grade: GradeFilter): SchoolGradeMetrics {
  if (grade === "all") {
    return {
      enrollment: school.enrollment,
      career: school.career.value,
      postsecondary: school.postsecondary.value,
      experiential: school.experiential.value,
      planning: school.planning.value,
    };
  }
  const o = GRADE_OFFSETS[grade];
  return {
    enrollment: gradeEnrollment(school.enrollment, grade),
    career: clampPct(school.career.value + o.career),
    postsecondary: clampPct(school.postsecondary.value + o.postsecondary),
    experiential: clampPct(school.experiential.value + o.experiential),
    planning: clampPct(school.planning.value + o.planning),
  };
}

/** School Performance column keys that can be sorted. TREND is not sortable. */
export type SchoolSortKey = "school" | "status" | "career" | "postsecondary" | "experiential" | "planning";

/** School Performance filter bar and strip copy. */
export const SCHOOL_PERFORMANCE_COPY = {
  heading: "School performance",
  filterLabel: "FILTER VIEW",
  academicYearOptions: [ACADEMIC_YEAR],
  statusOptions: [
    { value: "all" as const, label: "All schools" },
    { value: "above" as const, label: "Above target" },
    { value: "meeting" as const, label: "Meeting target" },
    { value: "support" as const, label: "Support needed" },
  ],
  searchPlaceholder: "Search by school name",
  dataPeriodLine: "Data period: 2026–27.",
  statusGroupsEyebrow: "STATUS GROUPS",
  columns: [
    { key: "school" as const, label: "SCHOOL" },
    { key: "status" as const, label: "STATUS" },
    { key: "career" as const, label: "CAREER EXPLORATION" },
    { key: "postsecondary" as const, label: "POSTSECONDARY" },
    { key: "experiential" as const, label: "EXPERIENTIAL" },
    { key: "planning" as const, label: "PLANNING" },
    { key: null, label: "TREND" },
  ],
  /** Default sort is planning milestones, high to low. */
  defaultSort: "planning" as SchoolSortKey,
  deltaCaption: (delta: number): string => `+${fixed1(delta)} pts vs launch baseline`,
  inViewLabel: (shown: number, total: number = SCHOOLS.length): string => `${shown} of ${total} schools in view`,
  empty: {
    title: "No schools match this view.",
    body: "Try clearing the search or changing a filter.",
    clearLabel: "Clear filters",
  },
} as const;

/** Filter schools by status and a case-insensitive substring of the school NAME only (a city never matches). */
export function filterSchools(
  schools: LeaderSchool[],
  filters: { status?: SchoolStatus | "all"; query?: string },
): LeaderSchool[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  return schools.filter(
    (s) =>
      (!filters.status || filters.status === "all" || s.status === filters.status) &&
      (q === "" || s.name.toLowerCase().includes(q)),
  );
}

const STATUS_SORT_ORDER: Record<SchoolStatus, number> = { support: 0, meeting: 1, above: 2 };

/**
 * Single-direction sort observed in the reference: metrics high to low (by current value under the
 * given grade), school name Z to A, status most-in-need first. Repeated clicks did not flip direction.
 */
export function sortSchools(
  schools: LeaderSchool[],
  key: SchoolSortKey,
  grade: GradeFilter = "all",
): LeaderSchool[] {
  const copy = [...schools];
  if (key === "school") return copy.sort((a, b) => b.name.localeCompare(a.name));
  if (key === "status") return copy.sort((a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]);
  return copy.sort((a, b) => schoolMetricsForGrade(b, grade)[key] - schoolMetricsForGrade(a, grade)[key]);
}

// ---------------------------------------------------------------------------
// District Student Outcomes
// ---------------------------------------------------------------------------

/** Student Outcomes metric ids (the Metric select). */
export type OutcomeMetricId = "career" | "postsecondary" | "experiential" | "professional" | "planning";

/** One metric option of the By school / By grade comparison. */
export interface OutcomeMetricOption {
  id: OutcomeMetricId;
  /** Select option label. */
  label: string;
  /** Definition sentence used in the footer line. */
  definition: string;
  rollup: { value: number; delta: number; baseline: number };
  /** Ranked bars, in the order shown (high to low). Values equal the school's current metric. */
  bySchool: { schoolId: string; value: number }[];
  /** Grade 9, 10, 11, 12 values. The rollup on top stays fixed for every grade. */
  byGrade: [number, number, number, number];
}

const bySchoolRows = (rows: [string, number][]): { schoolId: string; value: number }[] =>
  rows.map(([schoolId, value]) => ({ schoolId, value }));

/** The five Student Outcomes metrics, in Metric select order (Career exploration is the default). */
export const OUTCOME_METRICS: OutcomeMetricOption[] = [
  {
    id: "career",
    label: "Career exploration",
    definition: outcomeDef("career").districtMeaning,
    rollup: { value: 76, delta: 18, baseline: 58 },
    bySchool: bySchoolRows([
      ["metro-arts-sciences-academy", 85],
      ["east-river-preparatory-academy", 83],
      ["crescent-academy", 81],
      ["northbridge-academy", 78],
      ["riverside-innovation-high-school", 78],
      ["central-point-high-school", 77],
      ["liberty-grove-academy", 76],
      ["summit-heights-high-school", 76],
      ["gateway-technical-high-school", 73],
      ["kingsbridge-preparatory", 73],
      ["harborview-high-school", 71],
    ]),
    byGrade: [71, 74, 79, 80],
  },
  {
    id: "postsecondary",
    label: "Postsecondary exploration",
    definition: outcomeDef("postsecondary").districtMeaning,
    rollup: { value: 69, delta: 18, baseline: 51 },
    bySchool: bySchoolRows([
      ["metro-arts-sciences-academy", 80],
      ["east-river-preparatory-academy", 76],
      ["crescent-academy", 74],
      ["riverside-innovation-high-school", 71],
      ["central-point-high-school", 70],
      ["liberty-grove-academy", 70],
      ["northbridge-academy", 69],
      ["summit-heights-high-school", 69],
      ["kingsbridge-preparatory", 68],
      ["harborview-high-school", 66],
      ["gateway-technical-high-school", 63],
    ]),
    byGrade: [62, 66, 72, 76],
  },
  {
    id: "experiential",
    label: "Experiential learning",
    definition: outcomeDef("experiential").districtMeaning,
    rollup: { value: 65, delta: 20, baseline: 45 },
    bySchool: bySchoolRows([
      ["metro-arts-sciences-academy", 74],
      ["east-river-preparatory-academy", 73],
      ["crescent-academy", 70],
      ["riverside-innovation-high-school", 68],
      ["northbridge-academy", 67],
      ["central-point-high-school", 67],
      ["liberty-grove-academy", 66],
      ["summit-heights-high-school", 66],
      ["kingsbridge-preparatory", 63],
      ["harborview-high-school", 60],
      ["gateway-technical-high-school", 59],
    ]),
    byGrade: [57, 62, 68, 73],
  },
  {
    id: "professional",
    label: "Professional exposure",
    definition: outcomeDef("professional").districtMeaning,
    rollup: { value: 52, delta: 18, baseline: 34 },
    bySchool: bySchoolRows([
      ["metro-arts-sciences-academy", 60],
      ["east-river-preparatory-academy", 60],
      ["crescent-academy", 57],
      ["riverside-innovation-high-school", 55],
      ["northbridge-academy", 54],
      ["central-point-high-school", 54],
      ["liberty-grove-academy", 53],
      ["summit-heights-high-school", 53],
      ["kingsbridge-preparatory", 50],
      ["harborview-high-school", 47],
      ["gateway-technical-high-school", 46],
    ]),
    byGrade: [43, 49, 55, 61],
  },
  {
    id: "planning",
    label: "Planning milestones",
    definition: outcomeDef("planning").districtMeaning,
    rollup: { value: 61, delta: 20, baseline: 41 },
    bySchool: bySchoolRows([
      ["northbridge-academy", 88],
      ["metro-arts-sciences-academy", 70],
      ["east-river-preparatory-academy", 69],
      ["crescent-academy", 65],
      ["riverside-innovation-high-school", 63],
      ["central-point-high-school", 62],
      ["liberty-grove-academy", 61],
      ["summit-heights-high-school", 60],
      ["kingsbridge-preparatory", 57],
      ["harborview-high-school", 53],
      ["gateway-technical-high-school", 50],
    ]),
    byGrade: [47, 55, 66, 76],
  },
];

/** District student counts per grade on the By grade view (3,266 / 3,266 / 3,264 / 3,262; literal, not a sum of school splits). */
export const DISTRICT_GRADE_STUDENTS: Record<9 | 10 | 11 | 12, number> = {
  9: 3266,
  10: 3266,
  11: 3264,
  12: 3262,
};

/** Footer line under the comparison bars for a metric. */
export function outcomeComparisonFooter(metric: OutcomeMetricOption): string {
  return `Definition ${metric.definition} Values are synthetic planning measures, not live student records. Launch baseline is ${metric.rollup.baseline}% for this district rollup.`;
}

/** A labelled share (distribution row) with its (i) tooltip. */
export interface ShareRow {
  label: string;
  value: number;
  tooltip: string;
}

function distributionTooltip(label: string, value: number): string {
  // The reference leaks a file name in the last sentence; replaced with plain copy.
  return `Definition: Action: review ${label.toLowerCase()}. Numerator: students in the ${label.toLowerCase()} category, shown as ${value}% of responses. Denominator/population: ${int(DISTRICT_TOTALS.enrollment)} students represented in the 2026–27 synthetic planning view. This is a distribution share, not a completion rate. Launch baseline value: not supplied for this category, so no change is inferred.`;
}

const shareRows = (rows: [string, number][]): ShareRow[] =>
  rows.map(([label, value]) => ({ label, value, tooltip: distributionTooltip(label, value) }));

/** A named count with an (i) tooltip. */
export interface CountRow {
  label: string;
  value: number;
  tooltip: string;
}

/** District Student Outcomes page content below the comparison card. */
export const DISTRICT_STUDENT_OUTCOMES = {
  heading: "Student outcomes",
  comparison: {
    eyebrow: "OUTCOME COMPARISONS",
    title: "Compare by school or grade",
    toggles: [
      { id: "school" as const, label: "By school" },
      { id: "grade" as const, label: "By grade" },
    ],
    metricLabel: "METRIC",
    rollupLabel: "DISTRICT ROLLUP",
    rollupCaption: (delta: number): string => `+${fixed1(delta)} pts vs launch baseline`,
    studentsCaption: (n: number): string => `${int(n)} students`,
  },
  interests: {
    title: "Career interests",
    subtitle: "Share of student-selected career interest areas.",
    rows: shareRows([
      ["Technology", 21],
      ["Healthcare", 19],
      ["Business + Finance", 17],
      ["Engineering", 13],
      ["Creative Industries", 11],
      ["Skilled Trades", 8],
      ["Public Service", 6],
      ["Other", 5],
    ]),
  },
  intentions: {
    title: "Postsecondary intentions",
    subtitle: "Current intended next step across participating students.",
    rows: shareRows([
      ["4-Year College / University", 56],
      ["2-Year College", 18],
      ["Trade / Technical Education", 14],
      ["Undecided", 12],
    ]),
  },
  choices: {
    title: "Postsecondary choices",
    subtitle: "Share of recorded named pathways and institutions.",
    /** Sums to 100; not strictly descending (Regional trade / technical programs is last). */
    rows: shareRows([
      ["CUNY colleges", 28],
      ["SUNY institutions", 21],
      ["New York City College of Technology", 12],
      ["Stony Brook University", 10],
      ["Rutgers University", 8],
      ["New York University", 7],
      ["Regional trade / technical programs", 14],
    ]),
  },
  emerging: {
    eyebrow: "EMERGING INTERESTS",
    title: "Emerging career interests",
    chips: ["Cybersecurity", "Biotechnology", "UX Design", "Renewable Energy", "Sports Management"],
    note: "Emerging interests are qualitative signals; they are not ranked or interpreted as enrollment forecasts.",
  },
  participation: {
    eyebrow: "CAREER EXPERIENCES",
    title: "Participation totals",
    /** District totals; not the sum of the school-level counts. */
    rows: [
      { label: "Professionals Engaged", value: 634, tooltip: "Unique verified professionals participating in Dreamari or related career experiences." },
      { label: "Career Conversations", value: 792, tooltip: "Recorded structured student-professional interactions." },
      { label: "Career Events", value: 61, tooltip: "Career exposure events made available to participating students." },
      { label: "Work-Based Learning Experiences", value: 318, tooltip: "Verified career-connected experiences recorded during the selected period." },
      { label: "Career Simulations Completed", value: 3420, tooltip: "Completed Dreamari career simulation experiences." },
    ] satisfies CountRow[],
  },
  milestones: {
    eyebrow: "PLANNING MILESTONE COMPLETION",
    title: "Milestone completion",
    subtitle: "Share of students completing each named planning artifact in 2026–27.",
    /** Fixed order 01 to 05, not sorted by value. */
    rows: (
      [
        ["Top Three", 79, "the Top Three planning artifact", "Top Three"],
        ["Career + Postsecondary Report", 63, "the Career + Postsecondary Report planning artifact", "Career + Postsecondary Report"],
        ["My Plan", 66, "the My Plan planning artifact", "My Plan"],
        ["Resume", 57, "the Resume planning artifact", "Resume"],
        ["Postsecondary Shortlist", 54, "the Postsecondary Shortlist planning artifact", "Postsecondary Shortlist"],
      ] as [string, number, string, string][]
    ).map(([label, value, artifact, short], i) => ({
      rank: String(i + 1).padStart(2, "0"),
      label,
      value,
      // The reference leaks a file name in the last sentence; replaced with plain copy.
      tooltip: `Definition: Action: review completion of ${artifact}. Numerator: students recorded with ${short} complete. Denominator/population: ${int(DISTRICT_TOTALS.enrollment)} students represented in 2026–27. Current rate: ${value}%. Launch baseline value: not supplied for this milestone, so no change is inferred.`,
    })) satisfies (ShareRow & { rank: string })[],
  },
} as const;

// ---------------------------------------------------------------------------
// District Counseling Capacity
// ---------------------------------------------------------------------------

/**
 * Students per counselor above this shows the "higher load" label (348 is "within range", 376 is
 * "higher load"). INFERRED threshold, not stated in the reference.
 */
export const HIGHER_LOAD_THRESHOLD = 350;
/** Follow-up coverage below this turns the bar coral (Kingsbridge 86% is coral, 87% is teal). INFERRED. */
export const LOW_COVERAGE_THRESHOLD = 87;

/** Load label for a students-per-counselor figure. */
export function loadLabel(perCounselor: number): { id: "within-range" | "higher-load"; label: string; tone: "positive" | "negative" } {
  return perCounselor > HIGHER_LOAD_THRESHOLD
    ? { id: "higher-load", label: "higher load", tone: "negative" }
    : { id: "within-range", label: "within range", tone: "positive" };
}

/** One row of the "Staffing and follow-up by school" table. */
export interface CapacityRow {
  school: LeaderSchool;
  counselors: number;
  students: number;
  studentsPerCounselor: number;
  load: ReturnType<typeof loadLabel>;
  followUpNeed: number;
  coverage: number;
  coverageTone: "teal" | "coral";
  coverageTooltip: string;
}

/** Staffing rows, in fixed order: follow-up need, high to low. Headers are not sortable. */
export const DISTRICT_CAPACITY_ROWS: CapacityRow[] = [...SCHOOLS]
  .sort((a, b) => b.followUps - a.followUps)
  .map((s) => ({
    school: s,
    counselors: s.counselors,
    students: s.enrollment,
    studentsPerCounselor: studentsPerCounselor(s),
    load: loadLabel(studentsPerCounselor(s)),
    followUpNeed: s.followUps,
    coverage: s.coverage,
    coverageTone: s.coverage < LOW_COVERAGE_THRESHOLD ? "coral" : "teal",
    // The reference leaks a file name in the last sentence; replaced with plain copy.
    coverageTooltip: `Definition: Action: review ${s.name} follow-up coverage. Numerator: students with a recorded follow-up action. Denominator/population: ${s.followUps} students requiring follow-up at this school. 2026–27 coverage is ${s.coverage}%. Launch baseline value: not supplied for school follow-up coverage, so no change is inferred.`,
  }));

/** District Counseling Capacity screen copy and hero numbers. */
export const DISTRICT_CAPACITY = {
  heading: "Counseling capacity",
  hero: {
    eyebrow: "DISTRICT COVERAGE",
    studentsPerCounselor: DISTRICT_TOTALS.studentsPerCounselor,
    caption: "students per counselor on average",
    line: "Across 39 counselors serving 13,058 students.",
    stats: [
      {
        id: "follow-up-need",
        label: "Students requiring follow-up",
        value: "284",
        caption: "identified across schools",
        tooltip: null,
      },
      {
        id: "follow-up-coverage",
        label: "Follow-up coverage",
        value: "88%",
        caption: "district weighted coverage",
        tooltip:
          "Definition: Follow-up coverage is the share of students flagged for follow-up who have an action recorded. Current district coverage: 88% of 284 students.",
      },
      {
        id: "capacity-improvement",
        label: "Counselor capacity improvement",
        value: "+19%",
        caption: "relative change vs prior workflow",
        tooltip: DISTRICT_CAPACITY_TOOLTIP,
      },
    ],
  },
  table: {
    eyebrow: "SCHOOL COVERAGE",
    title: "Staffing and follow-up by school",
    subtitle: "Open a school to view its counseling team.",
    columns: ["SCHOOL", "COUNSELORS", "STUDENTS", "STUDENTS / COUNSELOR", "FOLLOW-UP NEED", "COVERAGE"],
    openLabel: "Open view",
    /** Drilling in lands on that school's Counseling Team screen. */
    drillRoute: "/counseling-team",
    followUpUnit: "students",
  },
  note: {
    title: "Capacity context",
    body: "Student-to-counselor ratios provide staffing context; they do not measure service quality.",
  },
} as const;

// ---------------------------------------------------------------------------
// District Reports
// ---------------------------------------------------------------------------

/** A report table column. */
export interface ReportColumn {
  label: string;
  tooltip?: string;
}

/** A District report modal. */
export interface DistrictReport {
  id: string;
  typeTag: string;
  title: string;
  description: string;
  preparedFor: string;
  openLabel: string;
  modal: {
    eyebrow: string;
    title: string;
    description: string;
    summary: { label: string; value: string; caption?: string; tooltip?: string }[];
    rowsHeading: string;
    columns: ReportColumn[];
    rows: string[][];
    exportCsvLabel: string;
    exportPdfLabel: string;
    closeLabel: string;
  };
}

const REPORT_POPULATED = "This report is populated from the 2026–27 synthetic planning view.";

const READINESS_HEADER_TOOLTIP =
  "Definition: Action: read the district readiness measure in the 2026–27 report. Numerator: students recorded as meeting the named measure. Denominator/population: 13,058 students represented. Current values are compared with the launch baseline shown in the adjacent column; counselor capacity is relative improvement, not percentage points.";

/** The three-stat strip shared by all four District report modals. */
const DISTRICT_REPORT_SUMMARY: DistrictReport["modal"]["summary"] = [
  { label: "Students represented", value: "13,058" },
  {
    label: "District rollup",
    value: "61%",
    tooltip: districtOutcomeTooltip("planning", 61, 20),
  },
  { label: "School statuses", value: "3 / 5 / 3", caption: "above · meeting · support" },
];

const bySchoolEnrollmentAsc = (): LeaderSchool[] => [...SCHOOLS].sort((a, b) => a.enrollment - b.enrollment);

function buildDistrictReport(
  base: Omit<DistrictReport, "modal" | "preparedFor" | "openLabel">,
  columns: ReportColumn[],
  rows: string[][],
): DistrictReport {
  return {
    ...base,
    preparedFor: "Prepared for 2026–27 planning",
    openLabel: "Open report",
    modal: {
      eyebrow: base.typeTag,
      title: base.title,
      description: `${base.description} ${REPORT_POPULATED}`,
      summary: DISTRICT_REPORT_SUMMARY,
      rowsHeading: "Report rows",
      columns,
      rows,
      exportCsvLabel: "Export this CSV",
      exportPdfLabel: "Download this PDF",
      closeLabel: "Close report",
    },
  };
}

const READINESS_ROWS: string[][] = [
  ...DISTRICT_OUTCOMES.map((o) => [
    outcomeDef(o.key).districtLabel,
    `${o.value}%`,
    `${round1(o.value - o.delta)}%`,
    `+${fixed1(o.delta)} pts`,
    outcomeDef(o.key).districtMeaning,
  ]),
  ["Counselor capacity", "19%", "0%", "+19% relative", "Relative capacity improvement, not percentage points"],
  ["Status groups", "3 above / 5 meeting / 3 support", NO_VALUE, NO_VALUE, "School status count"],
];

const OUTCOMES_PATHWAYS_ROWS: string[][] = [
  ...DISTRICT_STUDENT_OUTCOMES.interests.rows.map((r) => ["Career interest", r.label, `${r.value}%`, "Share of recorded student-selected interests"]),
  ...DISTRICT_STUDENT_OUTCOMES.choices.rows.map((r) => ["Postsecondary choice", r.label, `${r.value}%`, "Share of recorded named pathways and institutions explored"]),
  ...DISTRICT_STUDENT_OUTCOMES.intentions.rows.map((r) => ["Postsecondary intention", r.label, `${r.value}%`, "Share of recorded intended next steps"]),
  ...DISTRICT_STUDENT_OUTCOMES.milestones.rows.map((r) => ["Planning milestone", r.label, `${r.value}%`, "Share with the named artifact complete"]),
  // Counts print without a thousands separator in this table (3420).
  ...DISTRICT_STUDENT_OUTCOMES.participation.rows.map((r) => ["Career experience", r.label, String(r.value), r.tooltip]),
];

/** The four District report cards and their modal contents (notes 3.5). */
export const DISTRICT_REPORTS: DistrictReport[] = [
  buildDistrictReport(
    {
      id: "readiness-pulse",
      typeTag: "LEADERSHIP BRIEF",
      title: "District readiness pulse",
      description: "A concise read of the six district measures, status groups, and planning priorities.",
    },
    [
      { label: "DISTRICT READINESS PULSE", tooltip: READINESS_HEADER_TOOLTIP },
      { label: "2026–27" },
      { label: "LAUNCH BASELINE" },
      { label: "CHANGE" },
      { label: "MEANING" },
    ],
    READINESS_ROWS,
  ),
  buildDistrictReport(
    {
      id: "school-comparison",
      typeTag: "SCHOOL COMPARISON",
      title: "School performance comparison",
      description: "All 11 schools with current measures, change against baseline, and status context.",
    },
    [
      { label: "SCHOOL" },
      { label: "STATUS" },
      { label: "STUDENTS" },
      { label: "CAREER EXPLORATION" },
      { label: "PLANNING COMPLETION" },
      { label: "CHANGE VS LAUNCH" },
    ],
    // 11 rows, student count ascending (Metro Arts 528 first, Gateway 2,010 last).
    bySchoolEnrollmentAsc().map((s) => [
      s.name,
      SCHOOL_STATUS_LABELS[s.status].pill,
      int(s.enrollment),
      `${s.career.value}%`,
      `${s.planning.value}%`,
      `+${fixed1(s.planning.delta)} pts`,
    ]),
  ),
  buildDistrictReport(
    {
      id: "outcomes-pathways",
      typeTag: "OUTCOME REVIEW",
      title: "Student outcomes & pathways",
      description: "Career interests, postsecondary intentions, experiences, and milestone completion.",
    },
    [{ label: "SECTION" }, { label: "MEASURE" }, { label: "VALUE" }, { label: "DEFINITION" }],
    OUTCOMES_PATHWAYS_ROWS,
  ),
  buildDistrictReport(
    {
      id: "capacity-review",
      typeTag: "CAPACITY REVIEW",
      title: "Counseling capacity review",
      description: "School-level staffing, caseload context, follow-up need, and coverage.",
    },
    [
      { label: "SCHOOL" },
      { label: "COUNSELORS" },
      { label: "STUDENTS" },
      { label: "STUDENTS / COUNSELOR" },
      { label: "FOLLOW-UP NEED" },
      { label: "FOLLOW-UP COVERAGE" },
    ],
    bySchoolEnrollmentAsc().map((s) => [
      s.name,
      String(s.counselors),
      int(s.enrollment),
      String(studentsPerCounselor(s)),
      String(s.followUps),
      `${s.coverage}%`,
    ]),
  ),
];

/** District Reports page copy and the two header-level export buttons (scoped to the school comparison table). */
export const DISTRICT_REPORTS_COPY = {
  heading: "Reports",
  sectionTitle: "Available reports",
  sectionSubtitle: "Open a report for details or export the school comparison.",
  headerExports: [
    { id: "csv" as const, label: "Export school comparison CSV" },
    { id: "pdf" as const, label: "Export school comparison PDF" },
  ],
} as const;

// ---------------------------------------------------------------------------
// School Leader: filters and the 20-student sample
// ---------------------------------------------------------------------------

/** The four mutually exclusive support statuses. */
export type SupportStatus =
  | "On Track"
  | "Needs Exploration"
  | "Incomplete Career + Postsecondary Report"
  | "No Recent Activity";

/** The eight primary interest areas (same list as the Career Interests card and the table's Interest Area filter). */
export type InterestArea =
  | "Healthcare"
  | "Technology"
  | "Business + Finance"
  | "Creative Industries"
  | "Engineering"
  | "Skilled Trades"
  | "Public Service"
  | "Other";

/** Support status list in display order. */
export const SUPPORT_STATUSES: SupportStatus[] = [
  "On Track",
  "Needs Exploration",
  "Incomplete Career + Postsecondary Report",
  "No Recent Activity",
];

/** Interest areas in display order. */
export const INTEREST_AREAS: InterestArea[] = [
  "Healthcare",
  "Technology",
  "Business + Finance",
  "Creative Industries",
  "Engineering",
  "Skilled Trades",
  "Public Service",
  "Other",
];

/** One synthetic student profile in the Student Sample table. */
export interface SampleStudent {
  /** e.g. "N-001" (prefix per school). */
  id: string;
  name: string;
  grade: 9 | 10 | 11 | 12;
  counselor: string;
  interest: InterestArea;
  status: SupportStatus;
  /** Days since last activity. */
  lastActivityDays: number;
  /** Display text, e.g. "2 days ago". */
  lastActivity: string;
}

/** Northbridge counselors (the only named counselors). Each owns the 5 sample students of one grade. */
export const NORTHBRIDGE_COUNSELOR_NAMES = ["Danielle Brooks", "Marcus Chen", "Sofia Martinez", "Aisha Thompson"] as const;

const STUDENT_ROWS: [string, 9 | 10 | 11 | 12, InterestArea, SupportStatus, number][] = [
  ["Amara Lewis", 9, "Healthcare", "On Track", 2],
  ["Mateo Rivera", 10, "Technology", "On Track", 5],
  ["Jada Williams", 11, "Business + Finance", "On Track", 8],
  ["Eli Park", 12, "Creative Industries", "On Track", 11],
  ["Nia Okafor", 9, "Engineering", "On Track", 14],
  ["Jonah Patel", 10, "Skilled Trades", "On Track", 17],
  ["Lena Torres", 11, "Public Service", "On Track", 20],
  ["Samira Yusuf", 12, "Other", "On Track", 3],
  ["Theo Morgan", 9, "Healthcare", "On Track", 6],
  ["Zoe Bennett", 10, "Technology", "On Track", 9],
  ["Iris Coleman", 11, "Business + Finance", "On Track", 12],
  ["Noah Grant", 12, "Creative Industries", "On Track", 15],
  ["Maya Foster", 9, "Engineering", "On Track", 18],
  ["Owen Ellis", 10, "Skilled Trades", "On Track", 21],
  ["Ava Reed", 11, "Public Service", "On Track", 4],
  ["Caleb Brooks", 12, "Other", "On Track", 7],
  ["Leila Harris", 9, "Healthcare", "Needs Exploration", 10],
  ["Miles Carter", 10, "Technology", "Needs Exploration", 13],
  ["Rina Shah", 11, "Business + Finance", "Incomplete Career + Postsecondary Report", 16],
  ["Darius King", 12, "Creative Industries", "No Recent Activity", 46],
];

function buildStudents(prefix: string, counselorNames: string[]): SampleStudent[] {
  return STUDENT_ROWS.map(([name, grade, interest, status, days], i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
    name,
    grade,
    // Observed: each counselor owns one grade (9 -> first counselor, ...). For schools with fewer
    // counselors the index wraps (Metro Arts has one, so every row reads "Counselor A").
    counselor: counselorNames[(grade - 9) % counselorNames.length],
    interest,
    status,
    lastActivityDays: days,
    lastActivity: `${days} days ago`,
  }));
}

/** The 20 Northbridge sample students (the same 20 names appear at every school, with a per-school id prefix and counselor). */
export const SAMPLE_STUDENTS: SampleStudent[] = buildStudents("N", [...NORTHBRIDGE_COUNSELOR_NAMES]);

/** Counselor names for a school: Northbridge's four named counselors, otherwise "Counselor A, B, C..." per the capacity table. */
export function counselorNames(school: LeaderSchool): string[] {
  if (school.id === DEFAULT_SCHOOL_ID) return [...NORTHBRIDGE_COUNSELOR_NAMES];
  return Array.from({ length: school.counselors }, (_, i) => `Counselor ${String.fromCharCode(65 + i)}`);
}

/** The 20 sample students for any school. */
export function sampleStudentsFor(school: LeaderSchool): SampleStudent[] {
  return school.id === DEFAULT_SCHOOL_ID ? SAMPLE_STUDENTS : buildStudents(school.idPrefix, counselorNames(school));
}

/** Student Group filter value. */
export type StudentGroupFilter = "all" | "needs-support" | "recent-activity";

/** School Leader filter row (Academic Year, Grade, Counselor, Student Group) with the explanatory (i). */
export const SCHOOL_FILTERS = {
  label: "FILTERS",
  academicYear: { label: "Academic Year", options: [{ value: ACADEMIC_YEAR, label: ACADEMIC_YEAR }] },
  grade: {
    label: "Grade",
    options: [
      { value: "all" as const, label: "All grades" },
      { value: 9 as const, label: "Grade 9" },
      { value: 10 as const, label: "Grade 10" },
      { value: 11 as const, label: "Grade 11" },
      { value: 12 as const, label: "Grade 12" },
    ],
  },
  counselor: {
    label: "Counselor",
    allLabel: "All counselors",
  },
  studentGroup: {
    label: "Student Group",
    options: [
      { value: "all" as const, label: "All students" },
      { value: "needs-support" as const, label: "Needs support" },
      { value: "recent-activity" as const, label: "Recent activity" },
    ],
  },
} as const;

/** Counselor select options for a school ("All counselors" first, then each counselor). */
export function counselorFilterOptions(school: LeaderSchool): { value: string; label: string }[] {
  return [
    { value: "all", label: SCHOOL_FILTERS.counselor.allLabel },
    ...counselorNames(school).map((n) => ({ value: n, label: n })),
  ];
}

/** The (i) next to the filter row. Filters only scope the 20-row sample; every KPI and chart stays schoolwide. */
export function schoolFilterTooltip(school: LeaderSchool): string {
  return `Schoolwide aggregates use ${int(school.enrollment)} enrolled students and do not change with these filters. Grade, counselor, and student-group selections scope only the 20 synthetic student profiles.`;
}

/**
 * Filter the sample students. Filters combine with AND. "Needs support" = status is not On Track
 * (4 of 20); "Recent activity" = excludes the No Recent Activity student (46 days; 19 of 20).
 * `status` and `interest` are the table-local selects; `counselor` is "all" or a counselor name.
 */
export function filterSampleStudents(
  students: SampleStudent[],
  filters: {
    grade?: GradeFilter;
    counselor?: string;
    group?: StudentGroupFilter;
    status?: SupportStatus | "all";
    interest?: InterestArea | "all";
  },
): SampleStudent[] {
  const { grade = "all", counselor = "all", group = "all", status = "all", interest = "all" } = filters;
  return students.filter((s) => {
    if (grade !== "all" && s.grade !== grade) return false;
    if (counselor !== "all" && s.counselor !== counselor) return false;
    if (group === "needs-support" && s.status === "On Track") return false;
    if (group === "recent-activity" && s.status === "No Recent Activity") return false;
    if (status !== "all" && s.status !== status) return false;
    if (interest !== "all" && s.interest !== interest) return false;
    return true;
  });
}

/** Student Sample table copy, including the empty state and the profile modal. */
export const STUDENT_SAMPLE_COPY = {
  title: "Student Sample",
  subtitle: "Synthetic profiles for focused review; schoolwide category counts appear on the overview.",
  counter: (shown: number, total: number = 20): string => `Showing ${shown} of ${total} synthetic records`,
  statusFilter: { label: "Support Status", allLabel: "All statuses" },
  interestFilter: { label: "Interest Area", allLabel: "All interest areas" },
  columns: ["STUDENT", "GRADE", "COUNSELOR", "PRIMARY INTEREST", "SUPPORT STATUS", "LAST ACTIVITY"],
  empty: "No synthetic student profiles match these filters.",
  /** Only On Track is green; every other status is amber. */
  statusTone: (status: SupportStatus): "green" | "amber" => (status === "On Track" ? "green" : "amber"),
} as const;

/** Student profile modal contents for a sample student (notes 2.2). */
export function studentProfile(student: SampleStudent): {
  title: string;
  subline: string;
  stats: { label: string; value: string }[];
  footer: string;
  closeLabel: string;
} {
  return {
    title: student.name,
    subline: `${student.id} · Grade ${student.grade} · ${student.counselor}`,
    stats: [
      { label: "Primary Interest", value: student.interest },
      { label: "Support Status", value: student.status },
      { label: "Last Activity", value: student.lastActivity },
    ],
    footer: "This is a synthetic profile in a representative sample; it is not a live student record.",
    closeLabel: "Close",
  };
}

// ---------------------------------------------------------------------------
// School Leader: shared placeholder content (identical for every school per the notes)
// ---------------------------------------------------------------------------

/** School Leader header copy. */
export const SCHOOL_LEADER_HEADER = {
  eyebrow: "SCHOOL LEADER · SYNTHETIC DATA",
  tagline: "Helping school leaders track student pathways, counseling reach, and planning progress.",
  roleDescription: LEADER_ROLE_DESCRIPTIONS.school,
  role: "School Leader",
} as const;

/** Career Experiences and Access counts. SHARED PLACEHOLDER: identical for every school (not tied to school size). */
export const CAREER_EXPERIENCE_COUNTS = {
  title: "Career Experiences and Access",
  subtitle: "Counts of experiences available to students during the selected academic year.",
  tooltip: (enrollment: number): string =>
    `Counts are schoolwide totals for the 2026–27 academic year. The five labels each describe the event or verified participation being counted; counts are not percentages. School population: ${int(enrollment)} enrolled students.`,
  tiles: [
    { id: "professionals", value: 72, label: "Professionals Engaged", helper: "Unique professionals participating in student career experiences." },
    { id: "conversations", value: 89, label: "Career Conversations", helper: "Recorded structured student-professional interactions." },
    { id: "events", value: 7, label: "Career Events", helper: "Career exposure events made available to students." },
    { id: "work-based", value: 36, label: "Work-Based Learning Experiences", helper: "Verified career-connected experiences during the selected period." },
    { id: "simulations", value: 340, label: "Career Simulations Completed", helper: "Completed Dreamari career simulation experiences." },
  ],
} as const;

/** Student Progress milestone KPI definitions. SHARED PLACEHOLDER: 62 / 61 / 71 / 54 at every school. */
const MILESTONE_KPI_DEFS = [
  { id: "report", label: "Career + Postsecondary Report Completion", value: 62, delta: 11, baseline: 51, numerator: "students who completed a Career + Postsecondary Report" },
  { id: "shortlist", label: "Postsecondary Shortlist Planning Milestone Completion", value: 61, delta: 7, baseline: 54, numerator: "students who saved at least one postsecondary option" },
  { id: "top-three", label: "Top Three Completion", value: 71, delta: 7, baseline: 64, numerator: "students who selected three career pathways" },
  { id: "resume", label: "Resume Completion", value: 54, delta: 8, baseline: 46, numerator: "students who completed a resume" },
] as const;

/** Launch baseline for follow-up coverage (shared). Delta for a school is its coverage minus this. */
const FOLLOW_UP_BASELINE = 85;

/** Career + Postsecondary screen. SHARED PLACEHOLDER: identical for every school, whatever its borough. */
export const CAREER_POSTSECONDARY = {
  eyebrow: "CAREER + POSTSECONDARY",
  heading: "Student interests, options, and intentions",
  subtitle: "Explore interests alongside students’ next-step planning.",
  interests: {
    title: "Career Interests",
    subtitle: "Primary interest area among enrolled students",
    tooltip: (enrollment: number): string =>
      `Each percentage is the share of ${int(enrollment)} enrolled students who selected this as their primary career-interest area during the 2026–27 academic year. Categories are mutually exclusive and total 100%; no launch comparison is supplied for this breakdown.`,
    /** Healthcare 22 ... Other 5 (sums to 100). Bar tones in the reference's order. */
    rows: [
      { label: "Healthcare", value: 22, tone: "purple" },
      { label: "Technology", value: 19, tone: "blue" },
      { label: "Business + Finance", value: 16, tone: "green" },
      { label: "Creative Industries", value: 12, tone: "amber" },
      { label: "Engineering", value: 11, tone: "pink" },
      { label: "Skilled Trades", value: 8, tone: "violet" },
      { label: "Public Service", value: 7, tone: "teal" },
      { label: "Other", value: 5, tone: "grey" },
    ],
  },
  emerging: {
    title: "Emerging Career Interests",
    subtitle: "Signals gaining attention this term",
    tooltip:
      "Emerging interests are exploratory signals observed during the selected term. They are not schoolwide percentage metrics and are not compared with a launch baseline.",
    chips: ["Cybersecurity", "Biotechnology", "UX Design", "Renewable Energy", "Sports Management"],
    cue: {
      eyebrow: "PROGRAMMING CUE",
      text: "Technology interest is outpacing access to related professional exposure.",
      linkLabel: "Review student progress →",
      /** Goes to Student Progress, unfiltered. */
      linkRoute: "/student-progress",
    },
  },
  intentions: {
    title: "Postsecondary Intentions",
    subtitle: "Current student intent, separate from future outcomes.",
    tooltip: (enrollment: number): string =>
      `Share of ${int(enrollment)} enrolled students who recorded each current postsecondary intention for the 2026–27 academic year. The categories are current stated intentions, not enrollment outcomes; the displayed share is not compared with a launch baseline.`,
    rows: [
      { label: "4-Year College / University", value: 58 },
      { label: "2-Year College", value: 17 },
      { label: "Trade / Technical Education", value: 13 },
      { label: "Undecided", value: 12 },
    ],
  },
  choices: {
    title: "Postsecondary Choices",
    subtitle: "Institutions and programs students have saved or explored.",
    tooltip: (enrollment: number): string =>
      `Share of ${int(enrollment)} enrolled students who saved or explored each listed postsecondary choice during the 2026–27 academic year. A student can explore multiple institutions, so these percentages do not need to total 100%. This describes exploration, not admission or enrollment.`,
    /** Multi-select, does not sum to 100. Reading order is column-by-column interleaved as listed. */
    rows: [
      { label: "CUNY Brooklyn College", value: 14 },
      { label: "Baruch College", value: 12 },
      { label: "Hunter College", value: 10 },
      { label: "New York City College of Technology", value: 9 },
      { label: "Stony Brook University", value: 8 },
      { label: "Rutgers University–New Brunswick", value: 7 },
      { label: "New York University", value: 6 },
    ],
  },
  pathwayDiscovery: {
    eyebrow: "PATHWAY DISCOVERY",
    value: 292,
    label: "NEW CAREERS DISCOVERED",
    sub: "New career pathways explored by students this term.",
    tooltip:
      "A new career discovery is a career pathway a student explored for the first time in the selected term, based on a meaningful exploration action. This is a count, not a percentage.",
  },
} as const;

// ---------------------------------------------------------------------------
// School Leader: Impact Over Time
// ---------------------------------------------------------------------------

/** Impact Over Time metric tab ids. Note "simulations" is the Experiential Career Learning series. */
export type ImpactMetricId = "career" | "postsecondary" | "simulations" | "professional" | "efficiency";
/** Impact period ids. */
export type ImpactPeriodId = "since-launch" | "this-semester" | "this-school-year";

/** One chart point. */
export interface ImpactPoint {
  month: string;
  value: number;
}

const IMPACT_MONTHS = ["Launch", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"] as const;
/** Easing shared by every school except Northbridge (whose series is stored literally). Value = launch + delta x factor. */
const IMPACT_EASING = [0, 0, 0.07, 0.19, 0.36, 0.57, 0.77, 0.92, 1.0] as const;

/** Impact period options with the months each shows. */
export const IMPACT_PERIODS: { id: ImpactPeriodId; label: string; months: string[] }[] = [
  { id: "since-launch", label: "Since Launch", months: [...IMPACT_MONTHS] },
  { id: "this-semester", label: "This Semester", months: ["Jan", "Feb", "Mar", "Apr"] },
  { id: "this-school-year", label: "This School Year", months: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"] },
];

/** Northbridge's recorded series, exactly as read from the chart props (Launch, Sep ... Apr). */
const NORTHBRIDGE_SERIES: Record<ImpactMetricId, number[]> = {
  career: [59.5, 59.5, 60.8, 63, 66.2, 70.1, 73.8, 76.5, 78],
  postsecondary: [51, 51, 52.3, 54.4, 57.5, 61.3, 64.9, 67.6, 69],
  simulations: [46.4, 46.4, 47.8, 50.3, 53.8, 58.1, 62.3, 65.4, 67],
  professional: [35.3, 35.3, 36.6, 38.9, 42, 46, 49.7, 52.5, 54],
  efficiency: [0, 0, 1.5, 4, 7.6, 12, 16.2, 19.3, 21],
};

/** Impact Over Time tabs in display order (Career Exploration is the default). */
export const IMPACT_METRICS: { id: ImpactMetricId; label: string; valueSuffix: string }[] = [
  { id: "career", label: "Career Exploration", valueSuffix: "%" },
  { id: "postsecondary", label: "Postsecondary Exploration", valueSuffix: "%" },
  { id: "simulations", label: "Career Simulations", valueSuffix: "%" },
  { id: "professional", label: "Professional Exposure", valueSuffix: "%" },
  // Tooltip reads "Counselor Efficiency : 4% vs prior workflow".
  { id: "efficiency", label: "Counselor Efficiency", valueSuffix: "% vs prior workflow" },
];

function fullSeries(school: LeaderSchool, id: ImpactMetricId): number[] {
  if (school.id === DEFAULT_SCHOOL_ID) return NORTHBRIDGE_SERIES[id];
  const m =
    id === "career"
      ? school.career
      : id === "postsecondary"
        ? school.postsecondary
        : id === "simulations"
          ? school.experiential
          : id === "professional"
            ? school.professional
            : { value: school.counselorEfficiency.pct, delta: school.counselorEfficiency.pct };
  const launch = id === "efficiency" ? 0 : round1(m.value - m.delta);
  return IMPACT_EASING.map((f) => round1(launch + m.delta * f));
}

/** Series for every metric and period for a school. Chart ignores the Grade / Counselor / Student Group filters. */
export function impactSeriesFor(school: LeaderSchool): Record<ImpactMetricId, Record<ImpactPeriodId, ImpactPoint[]>> {
  const result = {} as Record<ImpactMetricId, Record<ImpactPeriodId, ImpactPoint[]>>;
  for (const metric of IMPACT_METRICS) {
    const values = fullSeries(school, metric.id);
    const all: ImpactPoint[] = IMPACT_MONTHS.map((month, i) => ({ month, value: values[i] }));
    result[metric.id] = {
      "since-launch": all,
      "this-semester": all.filter((p) => ["Jan", "Feb", "Mar", "Apr"].includes(p.month)),
      "this-school-year": all.filter((p) => p.month !== "Launch"),
    };
  }
  return result;
}

// ---------------------------------------------------------------------------
// School Leader: per-school builders
// ---------------------------------------------------------------------------

function schoolKpiTooltip(def: OutcomeDef, enrollment: number, m: SchoolMetric): string {
  return `${def.tooltipLead} A student counts when they meet the action in this definition. Population: ${int(enrollment)} enrolled students. ${m.value}% currently, compared with ${trim(metricBaseline(m))}% at launch, during the 2026–27 academic year.`;
}

function outcomeKpi(key: Exclude<OutcomeKey, "planning">, school: LeaderSchool): SchoolKpi {
  const def = outcomeDef(key);
  const m = school[key];
  const baseline = metricBaseline(m);
  return {
    id: key,
    label: def.label,
    value: m.value,
    unit: "%",
    displayValue: `${m.value}%`,
    delta: m.delta,
    deltaUnit: "pts",
    deltaCaption: "since launch",
    baseline,
    definition: {
      numerator: def.numerator,
      denominator: ALL_ENROLLED_DENOMINATOR,
      population: `${int(school.enrollment)} enrolled students`,
      baseline: `${trim(baseline)}% at launch`,
    },
    tooltip: schoolKpiTooltip(def, school.enrollment, m),
  };
}

function efficiencyKpi(school: LeaderSchool): SchoolKpi {
  const pct = school.counselorEfficiency.pct;
  return {
    id: "efficiency",
    label: "Counselor Efficiency",
    value: pct,
    unit: "%",
    displayValue: `+${pct}%`,
    delta: pct,
    deltaUnit: "%",
    deltaCaption: "vs prior workflow",
    baseline: 0,
    definition: {
      numerator: "Time returned to counselors for direct student support",
      denominator: "Prior workflow",
      population: `${school.counselors} counselor${school.counselors === 1 ? "" : "s"}`,
      baseline: "0% relative improvement (prior workflow)",
    },
    tooltip: `Estimated relative increase in counselor capacity based on time returned for direct student support. Current value: +${pct}% across ${school.counselors} counselor${school.counselors === 1 ? "" : "s"}, compared with the prior workflow. This is not a percentage-point change in student outcomes.`,
  };
}

const FOLLOW_UP_COVERAGE_TOOLTIP_OVERVIEW = (coverage: number): string =>
  `Share of students flagged as needing follow-up who have a follow-up action recorded. Numerator: students with documented follow-up. Denominator: students requiring follow-up. ${coverage}% currently; 2026–27 academic year.`;

const SUPPORT_STATUS_BAR_TONES: Record<SupportStatus, "green" | "amber" | "purple" | "red"> = {
  "On Track": "green",
  "Needs Exploration": "amber",
  "Incomplete Career + Postsecondary Report": "purple",
  "No Recent Activity": "red",
};

/**
 * Support status counts (mutually exclusive, sum to enrollment). Observed for Northbridge (784 / 77 / 78 / 25),
 * Metro Arts (429 / 42 / 43 / 14) and Harborview (1419 / 140 / 142 / 47). Other schools are INFERRED from the
 * same split (about 8% / 8.1% / 2.6%, On Track is the remainder).
 */
export function supportStatusCounts(school: LeaderSchool): Record<SupportStatus, number> {
  const observed: Record<string, [number, number, number, number]> = {
    "northbridge-academy": [784, 77, 78, 25],
    "metro-arts-sciences-academy": [429, 42, 43, 14],
    "harborview-high-school": [1419, 140, 142, 47],
  };
  const o = observed[school.id];
  if (o) {
    return {
      "On Track": o[0],
      "Needs Exploration": o[1],
      "Incomplete Career + Postsecondary Report": o[2],
      "No Recent Activity": o[3],
    };
  }
  const needs = Math.round(school.enrollment * 0.08);
  const incomplete = Math.round(school.enrollment * 0.081);
  const none = Math.round(school.enrollment * 0.026);
  return {
    "On Track": school.enrollment - needs - incomplete - none,
    "Needs Exploration": needs,
    "Incomplete Career + Postsecondary Report": incomplete,
    "No Recent Activity": none,
  };
}

/** One counselor card on Counseling Team. */
export interface CounselorRow {
  name: string;
  initials: string;
  students: number;
  /** Planning milestone completion, percent. */
  planningMilestone: number;
  followUps: number;
  /** Documented follow-up coverage shown when the card is expanded, percent. */
  followUpCoverage: number;
  /** (i) on the milestone stat. */
  milestoneTooltip: string;
  /** (i) on the expanded follow-up coverage box. */
  followUpTooltip: string;
}

/** Northbridge's four counselor rows (observed). Totals: students 964, follow-ups 38. */
const NORTHBRIDGE_COUNSELOR_ROWS: [string, string, number, number, number, number][] = [
  ["Danielle Brooks", "DB", 241, 91, 8, 94],
  ["Marcus Chen", "MC", 238, 87, 11, 89],
  ["Sofia Martinez", "SM", 247, 86, 12, 87],
  ["Aisha Thompson", "AT", 238, 90, 7, 95],
];

function counselorRows(school: LeaderSchool): CounselorRow[] {
  const planningBaseline = trim(metricBaseline(school.planning));
  const make = (name: string, initials: string, students: number, milestone: number, followUps: number, coverage: number): CounselorRow => ({
    name,
    initials,
    students,
    planningMilestone: milestone,
    followUps,
    followUpCoverage: coverage,
    milestoneTooltip: `Share of this counselor's assigned students completing the required career and postsecondary planning milestones during 2026–27. Current ${milestone}%; school launch baseline ${planningBaseline}%.`,
    followUpTooltip: `Share of ${followUps} assigned students requiring follow-up who have a documented counselor follow-up during 2026–27. This is counselor-specific operational coverage, not a student-outcome comparison.`,
  });
  if (school.id === DEFAULT_SCHOOL_ID) {
    return NORTHBRIDGE_COUNSELOR_ROWS.map((r) => make(...r));
  }
  // Other schools: generic "Counselor A..." cards. Students and follow-ups split evenly with the remainder
  // going to the first cards (Harborview: 292 / 292 / 291 / 291 / 291 / 291 and 7 follow-ups each, observed).
  // Milestone cycles school -2, school, school +2 (Harborview 51 / 53 / 55 / 51 / 53 / 55, observed; a lone
  // counselor shows the school value). Expanded coverage is INFERRED as the school coverage.
  const n = school.counselors;
  const offsets = [-2, 0, 2];
  return counselorNames(school).map((name, i) =>
    make(
      name,
      `C${String.fromCharCode(65 + i)}`,
      Math.floor(school.enrollment / n) + (i < school.enrollment % n ? 1 : 0),
      n === 1 ? school.planning.value : school.planning.value + offsets[i % 3],
      Math.floor(school.followUps / n) + (i < school.followUps % n ? 1 : 0),
      school.coverage,
    ),
  );
}

// ---------------------------------------------------------------------------
// School Leader: reports
// ---------------------------------------------------------------------------

/** One metric row in a School report modal. */
export interface SchoolReportRow {
  metric: string;
  /** Grey definition sentence under the metric name. */
  definition: string;
  current: string;
  baseline: string;
  change: string;
}

/** A School Reports card with its populated modal. */
export interface SchoolReport {
  id: string;
  title: string;
  description: string;
  /** Caption, e.g. "Updated today". */
  updated: string;
  openLabel: string;
  exportPdfLabel: string;
  exportCsvLabel: string;
  modal: {
    title: string;
    subline: string;
    description: string;
    columns: ["Metric", "Current", "Baseline", "Change"];
    rows: SchoolReportRow[];
    exportPdfLabel: string;
    exportCsvLabel: string;
    closeLabel: string;
  };
}

const SCHOOL_REPORT_SYNTHETIC_NOTE = "All figures are synthetic and no live school data is connected.";

function outcomeReportRow(def: OutcomeDef, m: SchoolMetric, label: string = def.label, definition: string = def.numerator): SchoolReportRow {
  return {
    metric: label,
    definition,
    current: `${m.value}%`,
    baseline: `${trim(metricBaseline(m))}%`,
    change: `+${trim(m.delta)} pts`,
  };
}

function countReportRow(label: string, value: number, definition: string): SchoolReportRow {
  return { metric: label, definition, current: String(value), baseline: NO_VALUE, change: NO_VALUE };
}

/** Build the four School report cards and modals for a school (notes 2.5). */
export function buildSchoolReports(school: LeaderSchool): SchoolReport[] {
  const subline = `${school.name} · ${int(school.enrollment)} enrolled students · ${ACADEMIC_YEAR} academic year`;
  const support = supportStatusCounts(school);
  const make = (
    id: string,
    title: string,
    description: string,
    updated: string,
    rows: SchoolReportRow[],
  ): SchoolReport => ({
    id,
    title,
    description,
    updated,
    openLabel: "Open Report →",
    exportPdfLabel: "Export PDF",
    exportCsvLabel: "Export CSV",
    modal: {
      title,
      subline,
      description: `${description} ${SCHOOL_REPORT_SYNTHETIC_NOTE}`,
      columns: ["Metric", "Current", "Baseline", "Change"],
      rows,
      exportPdfLabel: "Export PDF",
      exportCsvLabel: "Export CSV",
      closeLabel: "Close",
    },
  });
  const tile = (id: string) => CAREER_EXPERIENCE_COUNTS.tiles.find((t) => t.id === id)!;
  const intentionDefinition = "Share of enrolled students recording this current intention during the academic year.";
  return [
    make(
      "career-exploration",
      "Career Exploration Report",
      "Career exploration and saved pathways across the selected year.",
      "Updated today",
      [
        outcomeReportRow(outcomeDef("career"), school.career),
        outcomeReportRow(outcomeDef("experiential"), school.experiential),
        outcomeReportRow(outcomeDef("professional"), school.professional),
        countReportRow(
          "New Careers Discovered",
          CAREER_POSTSECONDARY.pathwayDiscovery.value,
          "New career pathways explored for the first time during the selected term.",
        ),
      ],
    ),
    make(
      "postsecondary-planning",
      "Postsecondary Planning Report",
      "Student intentions, saved options, and planning milestones.",
      "Updated today",
      [
        outcomeReportRow(outcomeDef("postsecondary"), school.postsecondary),
        outcomeReportRow(outcomeDef("planning"), school.planning),
        ...CAREER_POSTSECONDARY.intentions.rows.map(
          (r): SchoolReportRow => ({
            metric: r.label,
            definition: intentionDefinition,
            current: `${r.value}%`,
            baseline: NO_VALUE,
            change: NO_VALUE,
          }),
        ),
      ],
    ),
    make(
      "career-experiences",
      "Career Experiences Report",
      "Simulation, professional, event, and work-based learning activity.",
      "Updated yesterday",
      [
        countReportRow(tile("professionals").label, tile("professionals").value, tile("professionals").helper),
        countReportRow(tile("conversations").label, tile("conversations").value, tile("conversations").helper),
        countReportRow(tile("events").label, tile("events").value, tile("events").helper),
        countReportRow(tile("work-based").label, tile("work-based").value, tile("work-based").helper),
        countReportRow(tile("simulations").label, tile("simulations").value, tile("simulations").helper),
        outcomeReportRow(
          outcomeDef("experiential"),
          school.experiential,
          "Career Simulation Participation",
          "Share of enrolled students who completed at least one Dreamari career simulation during the selected academic year.",
        ),
      ],
    ),
    make(
      "student-support",
      "Student Support Report",
      "Current student support groups and counselor follow-up coverage.",
      "Updated today",
      [
        ...SUPPORT_STATUSES.map((s) =>
          countReportRow(s, support[s], "Count of enrolled students assigned to this mutually exclusive support status."),
        ),
        countReportRow(
          "Students Requiring Follow-Up",
          school.followUps,
          "Students identified as requiring a documented counselor follow-up.",
        ),
        {
          metric: "Follow-Up Coverage",
          definition: "Share of students requiring follow-up with a documented counselor follow-up in 2026–27.",
          current: `${school.coverage}%`,
          baseline: NO_VALUE,
          change: NO_VALUE,
        },
      ],
    ),
  ];
}

/** The Northbridge School reports (cards plus modals). Use `schoolDetail(id).reports` for other schools. */
export const SCHOOL_REPORTS: SchoolReport[] = buildSchoolReports(requireSchool(DEFAULT_SCHOOL_ID));

// ---------------------------------------------------------------------------
// School Leader: detail bundle
// ---------------------------------------------------------------------------

/** One row of the Impact Since Launch bars (baseline to current). */
export interface ImpactSinceLaunchRow {
  label: string;
  baseline: number;
  current: number;
  /** Display, e.g. "59.5% → 78%". */
  display: string;
}

/** Everything the School Leader screens need for one school. */
export interface SchoolDetail {
  school: LeaderSchool;
  header: {
    eyebrow: string;
    name: string;
    /** e.g. "Brooklyn, NY · 964 students · 2026–27". */
    metaLine: string;
    tagline: string;
    roleDescription: string;
    sidebar: { initials: string; name: string; role: string };
  };
  filters: {
    counselorOptions: { value: string; label: string }[];
    tooltip: string;
  };
  overview: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    /** Five KPI cards: Career Exploration, Postsecondary Exploration, Experiential Career Learning, Professional Exposure, Counselor Efficiency. */
    kpis: SchoolKpi[];
    impact: {
      title: string;
      /** Subtitle under the title is the selected metric label; (i) is that metric's tooltip. */
      tabs: { id: ImpactMetricId; label: string; valueSuffix: string; tooltip: string }[];
      defaultMetric: ImpactMetricId;
      periodLabel: string;
      periods: typeof IMPACT_PERIODS;
      defaultPeriod: ImpactPeriodId;
      yAxisTicks: number[];
      series: Record<ImpactMetricId, Record<ImpactPeriodId, ImpactPoint[]>>;
    };
    support: {
      eyebrow: string;
      title: string;
      tooltip: string;
      total: number;
      totalCaption: string;
      rows: { status: SupportStatus; count: number; tone: "green" | "amber" | "purple" | "red"; widthPct: number; route: string }[];
      linkLabel: string;
      linkRoute: string;
    };
    coverage: {
      eyebrow: string;
      title: string;
      stats: { id: string; label: string; value: string; tooltip?: string }[];
      followUpCoverage: { label: string; value: number; tooltip: string };
      linkLabel: string;
      linkRoute: string;
    };
  };
  studentProgress: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    /** Five KPI cards. Milestone values are shared placeholders; only Follow-Up Coverage varies per school. */
    kpis: {
      id: string;
      label: string;
      value: number;
      delta: number;
      baseline: number;
      /** Grey line under the number, e.g. "+11 pts since launch". */
      deltaLine: string;
      /** Extra helper text (Follow-Up Coverage only). */
      helper?: string;
      tooltip: string;
    }[];
    experiences: typeof CAREER_EXPERIENCE_COUNTS & { tooltipText: string };
    sample: { students: SampleStudent[] };
  };
  careerPostsecondary: typeof CAREER_POSTSECONDARY & { tooltips: { interests: string; intentions: string; choices: string } };
  counselingTeam: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    summary: {
      stats: { id: string; label: string; value: string; tooltip?: string }[];
      adminTime: string;
      followUpCoverage: { label: string; value: number; tooltip: string };
    };
    cardCaption: string;
    expandedCaption: string;
    counselors: CounselorRow[];
  };
  reportsPage: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    impactSinceLaunch: {
      title: string;
      subtitle: string;
      tooltip: string;
      rows: ImpactSinceLaunchRow[];
      legend: { baseline: string; current: string };
    };
  };
  reports: SchoolReport[];
  dataDefinitions: DataDefinitionsModal;
}

/**
 * Everything the School Leader screens need for one school. Per the notes, headline numbers, Impact Over
 * Time, Support Status, Counseling Coverage, Counseling Team and Impact Since Launch are school-specific
 * (derived from that school's district row); Student Progress milestone KPIs, Career Experiences counts and the
 * whole Career + Postsecondary screen are shared placeholders identical for every school. An unknown id falls
 * back to the default school (Northbridge), matching the app's first-load behaviour.
 */
export function schoolDetail(id: string): SchoolDetail {
  const school = requireSchool(id);
  const n = school.enrollment;
  const planningBaseline = metricBaseline(school.planning);
  const eff = school.counselorEfficiency;
  const series = impactSeriesFor(school);
  const kpis: SchoolKpi[] = [
    outcomeKpi("career", school),
    outcomeKpi("postsecondary", school),
    outcomeKpi("experiential", school),
    outcomeKpi("professional", school),
    efficiencyKpi(school),
  ];
  const tabTooltip = (metric: ImpactMetricId): string => {
    const kpiId = metric === "simulations" ? "experiential" : metric;
    return (kpis.find((k) => k.id === kpiId) as SchoolKpi).tooltip;
  };
  const support = supportStatusCounts(school);
  const avgCaseload = Math.round(n / school.counselors);
  const plural = school.counselors === 1 ? "" : "s";
  const planningTooltipOverview = outcomeDef("planning").tooltipLead;
  const planningTooltipTeam = `${outcomeDef("planning").tooltipLead} Numerator: students completing required milestones. Denominator: ${int(n)} enrolled students. Current ${school.planning.value}%; launch baseline ${trim(planningBaseline)}%; 2026–27 academic year.`;
  const followUpCoverageTooltipTeam = `Share of students flagged as needing follow-up who have a follow-up action recorded. Numerator: students requiring follow-up with a documented counselor follow-up. Denominator: ${school.followUps} students requiring follow-up. Current ${school.coverage}%; 2026–27 academic year.`;
  const progressPrefix = `Completion percentages are the share of ${int(n)} enrolled students meeting the named milestone in 2026–27. Follow-up coverage is the share of students flagged for follow-up who have an action recorded. `;
  const followDelta = school.coverage - FOLLOW_UP_BASELINE;
  const impactRows: ImpactSinceLaunchRow[] = (
    [
      ["Career Exploration", school.career],
      ["Postsecondary Exploration", school.postsecondary],
      ["Experiential Career Learning", school.experiential],
      ["Professional Exposure", school.professional],
      ["Planning Milestone Completion", school.planning],
    ] as [string, SchoolMetric][]
  ).map(([label, m]) => {
    const baseline = metricBaseline(m);
    return { label, baseline, current: m.value, display: `${trim(baseline)}% → ${m.value}%` };
  });

  return {
    school,
    header: {
      eyebrow: SCHOOL_LEADER_HEADER.eyebrow,
      name: school.name,
      metaLine: `${schoolLocation(school)} · ${int(n)} students · ${ACADEMIC_YEAR}`,
      tagline: SCHOOL_LEADER_HEADER.tagline,
      roleDescription: SCHOOL_LEADER_HEADER.roleDescription,
      sidebar: {
        initials: school.name
          .split(/\s+/)
          .filter((w) => /^[A-Za-z]/.test(w) && w !== "&")
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join(""),
        name: school.name,
        role: SCHOOL_LEADER_HEADER.role,
      },
    },
    filters: {
      counselorOptions: counselorFilterOptions(school),
      tooltip: schoolFilterTooltip(school),
    },
    overview: {
      eyebrow: "SCHOOL SNAPSHOT",
      heading: "Student pathways and counseling reach",
      subtitle: "A current view of exploration, planning progress, and student support across the school.",
      kpis,
      impact: {
        title: "Impact Over Time",
        tabs: IMPACT_METRICS.map((m) => ({ ...m, tooltip: tabTooltip(m.id) })),
        defaultMetric: "career",
        periodLabel: "Impact period",
        periods: IMPACT_PERIODS,
        defaultPeriod: "since-launch",
        yAxisTicks: [0, 25, 50, 75, 100],
        series,
      },
      support: {
        eyebrow: "STUDENT SUPPORT",
        title: "Support Status",
        tooltip: `Counts are mutually exclusive support categories across ${int(n)} enrolled students for the 2026–27 academic year. Select a category to inspect its synthetic student sample.`,
        total: n,
        totalCaption: "students in scope",
        // Bar widths are proportional to count out of the enrollment total.
        rows: SUPPORT_STATUSES.map((status) => ({
          status,
          count: support[status],
          tone: SUPPORT_STATUS_BAR_TONES[status],
          widthPct: round1((support[status] / n) * 100),
          route: `/student-progress?status=${encodeURIComponent(status)}`,
        })),
        linkLabel: "View student progress →",
        linkRoute: "/student-progress",
      },
      coverage: {
        eyebrow: "SCHOOLWIDE SNAPSHOT",
        title: "Counseling Coverage",
        stats: [
          { id: "counselors", label: "Counselors", value: String(school.counselors) },
          { id: "students", label: "Students", value: int(n) },
          { id: "caseload", label: "Average Caseload", value: int(avgCaseload) },
          { id: "planning", label: "Planning Milestone Completion", value: `${school.planning.value}%`, tooltip: planningTooltipOverview },
          { id: "follow-ups", label: "Students Requiring Follow-Up", value: String(school.followUps) },
        ],
        followUpCoverage: {
          label: "Follow-up coverage",
          value: school.coverage,
          tooltip: FOLLOW_UP_COVERAGE_TOOLTIP_OVERVIEW(school.coverage),
        },
        linkLabel: "View team →",
        linkRoute: "/counseling-team",
      },
    },
    studentProgress: {
      eyebrow: "STUDENT PROGRESS",
      heading: "Student progress and support",
      subtitle: "Review current planning milestones, activity, and a representative student sample.",
      kpis: [
        ...MILESTONE_KPI_DEFS.map((k) => ({
          id: k.id,
          label: k.label,
          value: k.value,
          delta: k.delta,
          baseline: k.baseline,
          deltaLine: `+${k.delta} pts since launch`,
          tooltip: `${progressPrefix}${k.label}: numerator is ${k.numerator}; denominator is all enrolled students. Current ${k.value}%; launch baseline ${k.baseline}%.`,
        })),
        {
          id: "follow-up",
          label: "Follow-Up Coverage",
          value: school.coverage,
          delta: followDelta,
          baseline: FOLLOW_UP_BASELINE,
          deltaLine: `+${followDelta} pts since launch`,
          helper: `Share of flagged students with a follow-up action recorded. +${followDelta} pts since launch`,
          tooltip: `Follow-Up Coverage: Share of students flagged as needing follow-up who have a follow-up action recorded. Numerator: students with a recorded follow-up action. Denominator: students flagged for follow-up. Current ${school.coverage}%; launch baseline ${FOLLOW_UP_BASELINE}%.`,
        },
      ],
      experiences: { ...CAREER_EXPERIENCE_COUNTS, tooltipText: CAREER_EXPERIENCE_COUNTS.tooltip(n) },
      sample: { students: sampleStudentsFor(school) },
    },
    careerPostsecondary: {
      ...CAREER_POSTSECONDARY,
      tooltips: {
        interests: CAREER_POSTSECONDARY.interests.tooltip(n),
        intentions: CAREER_POSTSECONDARY.intentions.tooltip(n),
        choices: CAREER_POSTSECONDARY.choices.tooltip(n),
      },
    },
    counselingTeam: {
      eyebrow: "COUNSELING TEAM",
      heading: "Counseling Coverage + Capacity",
      subtitle: "Review student reach, planning completion, and follow-up coverage.",
      summary: {
        stats: [
          { id: "counselors", label: "Counselors", value: String(school.counselors) },
          { id: "students", label: "Students", value: int(n) },
          { id: "caseload", label: "Average Caseload", value: int(avgCaseload) },
          { id: "planning", label: "Planning Milestone Completion", value: `${school.planning.value}%`, tooltip: planningTooltipTeam },
          { id: "follow-ups", label: "Students Requiring Follow-Up", value: String(school.followUps) },
          {
            id: "efficiency",
            label: "Counselor Efficiency",
            value: `+${eff.pct}%`,
            tooltip: `Estimated relative increase in counselor capacity compared with the prior workflow. This is not a student outcome percentage-point change. Current estimate across ${school.counselors} counselor${plural}: +${eff.pct}%.`,
          },
        ],
        adminTime: `Estimated administrative time returned per counselor: ${eff.hoursPerWeek} hrs/week.`,
        followUpCoverage: { label: "Follow-up coverage", value: school.coverage, tooltip: followUpCoverageTooltipTeam },
      },
      cardCaption: "Operational coverage view",
      expandedCaption: "Operational signals support planning; they are not staff rankings.",
      counselors: counselorRows(school),
    },
    reportsPage: {
      eyebrow: "REPORTS",
      heading: "School reports",
      subtitle: "Open a populated report or download a copy of the current synthetic data.",
      impactSinceLaunch: {
        title: "Impact Since Launch",
        subtitle: "A compact before-and-after view of student outcome metrics.",
        tooltip: `Each row compares the current share of ${int(n)} enrolled students meeting the metric definition with its launch baseline. The current period is the 2026–27 academic year.`,
        rows: impactRows,
        legend: { baseline: "Launch baseline", current: "Current" },
      },
    },
    reports: buildSchoolReports(school),
    dataDefinitions: schoolDataDefinitions(school.id),
  };
}

// ---------------------------------------------------------------------------
// Constant modals (Northbridge scope) and consistency check
// ---------------------------------------------------------------------------

/** School "Data definitions" modal for the default school (Northbridge). Use `schoolDataDefinitions(id)` for others. */
export const SCHOOL_DATA_DEFINITIONS: DataDefinitionsModal = schoolDataDefinitions(DEFAULT_SCHOOL_ID);

/** District "Data definitions" modal (counselor-capacity block quotes Northbridge's +21% as the last drilled school). */
export const DISTRICT_DATA_DEFINITIONS: DataDefinitionsModal = districtDataDefinitions(DEFAULT_SCHOOL_ID);

/**
 * DEV-ONLY self-check: throws if the seeded data does not reconcile. Verifies that district enrollment,
 * counselors and follow-ups equal the sums over `SCHOOLS`, that district percentages are the
 * enrollment-weighted means of the school values (within 0.5; follow-up coverage is weighted by follow-up
 * need), plus per-school and per-screen invariants. Never called at module load.
 */
export function assertLeaderDataConsistent(): void {
  const problems: string[] = [];
  const check = (ok: boolean, msg: string): void => {
    if (!ok) problems.push(msg);
  };
  const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
  const near = (a: number, b: number, tol = 0.5): boolean => Math.abs(a - b) <= tol;

  const enrollment = sum(SCHOOLS.map((s) => s.enrollment));
  const counselors = sum(SCHOOLS.map((s) => s.counselors));
  const followUps = sum(SCHOOLS.map((s) => s.followUps));
  check(SCHOOLS.length === DISTRICT_TOTALS.schools, `school count ${SCHOOLS.length}`);
  check(enrollment === DISTRICT_TOTALS.enrollment, `enrollment sum ${enrollment} != ${DISTRICT_TOTALS.enrollment}`);
  check(counselors === DISTRICT_TOTALS.counselors, `counselor sum ${counselors} != ${DISTRICT_TOTALS.counselors}`);
  check(followUps === DISTRICT_TOTALS.followUps, `follow-up sum ${followUps} != ${DISTRICT_TOTALS.followUps}`);
  check(new Set(SCHOOLS.map((s) => s.id)).size === SCHOOLS.length, "duplicate school ids");

  const weighted = (pick: (s: LeaderSchool) => number): number =>
    sum(SCHOOLS.map((s) => pick(s) * s.enrollment)) / enrollment;
  const rollups: [string, number, number][] = [
    ["career", DISTRICT_OUTCOMES[0].value, weighted((s) => s.career.value)],
    ["postsecondary", DISTRICT_OUTCOMES[1].value, weighted((s) => s.postsecondary.value)],
    ["experiential", DISTRICT_OUTCOMES[2].value, weighted((s) => s.experiential.value)],
    ["professional", DISTRICT_OUTCOMES[3].value, weighted((s) => s.professional.value)],
    ["planning", DISTRICT_OUTCOMES[4].value, weighted((s) => s.planning.value)],
  ];
  for (const [name, shown, computed] of rollups) {
    check(near(shown, computed), `district ${name} ${shown} vs enrollment-weighted ${computed.toFixed(2)}`);
  }
  const weightedCoverage = sum(SCHOOLS.map((s) => s.coverage * s.followUps)) / followUps;
  check(near(DISTRICT_TOTALS.coverage, weightedCoverage), `district coverage ${DISTRICT_TOTALS.coverage} vs follow-up-weighted ${weightedCoverage.toFixed(2)}`);
  check(
    Math.round(DISTRICT_TOTALS.enrollment / DISTRICT_TOTALS.counselors) === DISTRICT_TOTALS.studentsPerCounselor,
    "district students per counselor",
  );

  const counts = statusCounts();
  check(counts.above === 3 && counts.meeting === 5 && counts.support === 3, `status counts ${JSON.stringify(counts)}`);

  // Student Outcomes rows match the school table and are ranked high to low.
  for (const metric of OUTCOME_METRICS) {
    const key = metric.id === "professional" ? "professional" : metric.id;
    check(metric.bySchool.length === SCHOOLS.length, `${metric.id}: bySchool length`);
    metric.bySchool.forEach((row, i) => {
      const s = schoolById(row.schoolId);
      check(!!s, `${metric.id}: unknown school ${row.schoolId}`);
      if (s) check(s[key].value === row.value, `${metric.id}: ${s.name} ${row.value} vs ${s[key].value}`);
      if (i > 0) check(metric.bySchool[i - 1].value >= row.value, `${metric.id}: not sorted at ${row.schoolId}`);
    });
    check(metric.rollup.baseline === metric.rollup.value - metric.rollup.delta, `${metric.id}: rollup baseline`);
  }
  check(sum(Object.values(DISTRICT_GRADE_STUDENTS)) === DISTRICT_TOTALS.enrollment, "district grade students");
  for (const [name, rows] of [
    ["interests", DISTRICT_STUDENT_OUTCOMES.interests.rows],
    ["intentions", DISTRICT_STUDENT_OUTCOMES.intentions.rows],
    ["choices", DISTRICT_STUDENT_OUTCOMES.choices.rows],
  ] as const) {
    check(sum(rows.map((r) => r.value)) === 100, `district ${name} do not sum to 100`);
  }
  check(sum(CAREER_POSTSECONDARY.interests.rows.map((r) => r.value)) === 100, "school interests do not sum to 100");
  check(sum(CAREER_POSTSECONDARY.intentions.rows.map((r) => r.value)) === 100, "school intentions do not sum to 100");

  // Grade rule example from the notes: Grade 9 Northbridge = 241 / 73 / 62 / 59 / 74; grade 12 planning caps at 100.
  const nb = requireSchool(DEFAULT_SCHOOL_ID);
  const g9 = schoolMetricsForGrade(nb, 9);
  check(
    g9.enrollment === 241 && g9.career === 73 && g9.postsecondary === 62 && g9.experiential === 59 && g9.planning === 74,
    `grade 9 Northbridge ${JSON.stringify(g9)}`,
  );
  check(schoolMetricsForGrade(nb, 12).planning === 100, "grade 12 planning cap");
  const gw = SCHOOLS.find((s) => s.id === "gateway-technical-high-school") as LeaderSchool;
  check(
    [9, 10, 11, 12].map((g) => gradeEnrollment(gw.enrollment, g as 9)).join("/") === "503/503/502/502",
    "Gateway grade enrollment split",
  );

  // Capacity table order and labels.
  check(DISTRICT_CAPACITY_ROWS.map((r) => r.followUpNeed).join() === "42,38,35,31,29,27,25,21,16,12,8", "capacity row order");
  check(
    DISTRICT_CAPACITY_ROWS.filter((r) => r.load.id === "higher-load").map((r) => r.school.id).sort().join() ===
      ["crescent-academy", "central-point-high-school", "kingsbridge-preparatory", "metro-arts-sciences-academy"].sort().join(),
    "higher-load schools",
  );
  check(DISTRICT_CAPACITY_ROWS.filter((r) => r.coverageTone === "coral").length === 1, "coral coverage count");

  // Student sample filter results from the notes.
  const sample = SAMPLE_STUDENTS;
  check(sample.length === 20, "sample size");
  check(filterSampleStudents(sample, { grade: 9 }).length === 5, "grade 9 filter");
  check(filterSampleStudents(sample, { counselor: "Marcus Chen" }).length === 5, "Marcus filter");
  check(filterSampleStudents(sample, { group: "needs-support" }).length === 4, "needs support filter");
  check(filterSampleStudents(sample, { group: "recent-activity" }).length === 19, "recent activity filter");
  check(filterSampleStudents(sample, { status: "On Track" }).length === 16, "On Track filter");
  check(filterSampleStudents(sample, { grade: 9, counselor: "Marcus Chen" }).length === 0, "empty filter");

  // Every school's drill-in view is consistent with its district row.
  for (const s of SCHOOLS) {
    const d = schoolDetail(s.id);
    const support = sum(d.overview.support.rows.map((r) => r.count));
    check(support === s.enrollment, `${s.id}: support status sums to ${support}`);
    check(d.overview.kpis.length === 5, `${s.id}: KPI count`);
    check(d.overview.kpis[0].value === s.career.value && d.overview.kpis[0].delta === s.career.delta, `${s.id}: career KPI`);
    check(d.counselingTeam.counselors.length === s.counselors, `${s.id}: counselor card count`);
    check(sum(d.counselingTeam.counselors.map((c) => c.students)) === s.enrollment, `${s.id}: counselor students sum`);
    check(sum(d.counselingTeam.counselors.map((c) => c.followUps)) === s.followUps, `${s.id}: counselor follow-ups sum`);
    for (const metric of IMPACT_METRICS) {
      const apr = d.overview.impact.series[metric.id]["since-launch"][8].value;
      const expected =
        metric.id === "career" ? s.career.value
        : metric.id === "postsecondary" ? s.postsecondary.value
        : metric.id === "simulations" ? s.experiential.value
        : metric.id === "professional" ? s.professional.value
        : s.counselorEfficiency.pct;
      check(near(apr, expected, 0.05), `${s.id}: ${metric.id} series ends at ${apr}, expected ${expected}`);
      check(d.overview.impact.series[metric.id]["since-launch"].length === 9, `${s.id}: ${metric.id} launch length`);
      check(d.overview.impact.series[metric.id]["this-semester"].length === 4, `${s.id}: ${metric.id} semester length`);
      check(d.overview.impact.series[metric.id]["this-school-year"].length === 8, `${s.id}: ${metric.id} year length`);
    }
  }
  const nbd = schoolDetail(DEFAULT_SCHOOL_ID);
  check(sum(nbd.counselingTeam.counselors.map((c) => c.students)) === 964, "Northbridge counselor students");
  check(sum(nbd.counselingTeam.counselors.map((c) => c.followUps)) === 38, "Northbridge counselor follow-ups");
  const hv = schoolDetail("harborview-high-school");
  check(
    hv.counselingTeam.counselors.map((c) => c.students).join("/") === "292/292/291/291/291/291" &&
      hv.counselingTeam.counselors.map((c) => c.planningMilestone).join("/") === "51/53/55/51/53/55",
    "Harborview counselor cards",
  );
  const hvCareer = hv.overview.impact.series.career["since-launch"].map((p) => p.value).join(",");
  check(hvCareer === "54.2,54.2,55.4,57.4,60.2,63.8,67.1,69.7,71", `Harborview career series ${hvCareer}`);

  if (problems.length > 0) {
    throw new Error(`leaderData is inconsistent:\n- ${problems.join("\n- ")}`);
  }
}
