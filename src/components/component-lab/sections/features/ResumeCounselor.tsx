"use client";

// DEMO-ONLY: Component Lab, feature modules part -- Resume and Counselor.
// See docs/handoff/COMPONENT_INVENTORY.md section 4 (Resume, Counselor) and
// section 5 (unsafe to render in isolation). Already covered elsewhere in
// the lab, not repeated here: Controls covers resume/ui.tsx's Field,
// TextInput, SelectInput, ToolbarButton and counselor's chips/SubTabs/
// Disclosure/Toggle; Feedback covers counselor/v4/states.tsx and
// StatusChip/Verdict; Surfaces covers OverviewCard/DonutCard/MetricTile/
// DrillTile; Charts covers every counselor chart (RankBar, RankedBars,
// DrillBar, PlanMap's Ring); Overlays covers the resume modals (ResumeModal,
// ZoomResumeModal, ExportChecklistModal -- its own built loading is
// "Preparing..." at src/components/resume/ExportChecklistModal.tsx:68, no
// built error yet), SidePanel, DetailPane and DocumentDesk.

import { SubHead, Specimen, StateGrid, StateCell, LiveRoute, ProposedLoading, ProposedError, ClippedStage, EDGE, noop, MONO, Inert } from "../../kit";

import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { TemplateGallery } from "@/components/resume/TemplateGallery";
import { VersionCard, ScoreBadge } from "@/components/resume/ResumeExperience";
import { ATSCheckPanel } from "@/components/resume/ATSCheckPanel";
import { EmptyStateAdd } from "@/components/resume/wizardSteps";
import { SAMPLE_RESUME_DATA } from "@/components/resume/data";
import { EMPTY_RESUME, type ResumeData, type ResumeVersion, type ATSCheckResult } from "@/lib/resume";
import { fingerprintFor } from "@/lib/resumeAts";
import { SurfaceStateView } from "@/components/app/SurfaceState";
import { EmptyView } from "@/components/app/states";

import { MetricRow, InitialsBadge } from "@/components/counselor/v4/overviewShared";
import { DeltaChip } from "@/components/component-lab/sections/counselorLegacyParts";
import { HeaderCell } from "@/components/counselor/v4/StudentsRoster";
import { TopTen } from "@/components/counselor/v4/CareerCollegeInsights";
import { MetChip } from "@/components/counselor/v4/CounselorImpact";

// ---------------------------------------------------------------------------
// Resume mock data. SAMPLE_RESUME_DATA and EMPTY_RESUME are read-only
// constants from the app's own data files -- never a store getter/setter.

const LONG_NAME_RESUME: ResumeData = {
  ...SAMPLE_RESUME_DATA,
  profile: { ...SAMPLE_RESUME_DATA.profile, firstName: "Maximiliana", lastName: "Alexandra Oyelaran-Whitfield" },
};

const SPARSE_RESUME: ResumeData = {
  ...EMPTY_RESUME,
  profile: { ...EMPTY_RESUME.profile, firstName: "Jordan", lastName: "Lee", city: "Austin", state: "TX" },
};

function mkVersion(overrides: Partial<ResumeVersion>): ResumeVersion {
  return {
    id: "lab-version",
    name: "First Draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    educationIds: [],
    experienceIds: [],
    jobDescription: "",
    targetPosition: "",
    targetCompany: "",
    template: "classic",
    atsCheck: null,
    ...overrides,
  };
}

const ATS_DEMO_VERSION = mkVersion({ id: "ats-demo" });
const ATS_CURRENT_FINGERPRINT = fingerprintFor(SAMPLE_RESUME_DATA, ATS_DEMO_VERSION);

function mkAts(qualityScore: number, jobMatchScore: number | null, analyzedFor = ATS_CURRENT_FINGERPRINT): ATSCheckResult {
  return {
    qualityScore,
    qualityGrade: qualityScore >= 75 ? "A" : qualityScore >= 45 ? "C" : "D",
    qualityBreakdown: { experienceQuality: 20, bulletQuality: 12, atsFormatting: 12, completeness: 12, skills: 8, education: 8, focusConciseness: 8 },
    qualityStrengths: ["Clear, action-first bullets", "Consistent date formatting"],
    qualityImprovements: ["Add more quantified results", "Trim the summary to two lines"],
    jobMatchScore,
    jobMatchLabel: jobMatchScore === null ? "" : jobMatchScore >= 75 ? "Strong Match" : "Possible Match",
    verifiedMatches: ["Customer Service", "Teamwork"],
    possibleMatches: ["Excel"],
    jobGaps: ["No listed certification"],
    keywordMatches: [],
    readability: [],
    missingQualifications: ["2+ years experience"],
    aiAssisted: true,
    generatedAt: Date.now(),
    analyzedFor,
  };
}

export function ResumeCounselorModules() {
  return (
    <>
      <SubHead>Resume</SubHead>
      <p className="max-w-[72ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        Data from <code style={MONO}>resume/data.ts</code>&apos;s <code style={MONO}>SAMPLE_RESUME_DATA</code> and <code style={MONO}>lib/resume.ts</code>&apos;s <code style={MONO}>EMPTY_RESUME</code> only, never a store setter.
      </p>

      <Specimen name="ResumeDocument" file="src/components/resume/ResumeDocument.tsx" purpose="The scored, printable resume itself: a fixed US-Letter page that scales to its container's width, with a per-section empty hint until something is added." when="The Resume Builder's live preview, the Version viewer, and print.">
        <StateGrid min={260}>
          <StateCell label="Full sample" pad={false} minH={340}>
            <ClippedStage height={340}>
              <ResumeDocument resume={SAMPLE_RESUME_DATA} />
            </ClippedStage>
          </StateCell>
          <StateCell label="Empty" note="EMPTY_RESUME; every section falls back to the built EmptyHint ('Nothing added yet')." pad={false} minH={340}>
            <ClippedStage height={340}>
              <ResumeDocument resume={EMPTY_RESUME} />
            </ClippedStage>
          </StateCell>
          <StateCell label="Long name" note="Name wraps inside the header; no truncation built." pad={false} minH={340}>
            <ClippedStage height={340}>
              <ResumeDocument resume={LONG_NAME_RESUME} />
            </ClippedStage>
          </StateCell>
          <StateCell label="Sparse record" note="Name and city only; education, experience, skills and certifications all show the empty hint." pad={false} minH={340}>
            <ClippedStage height={340}>
              <ResumeDocument resume={SPARSE_RESUME} />
            </ClippedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TemplateGallery" file="src/components/resume/TemplateGallery.tsx" purpose="The four resume templates (Classic, Sidebar Navy, Minimal Forest, Banner Gold) as pickable preview cards." when="Starting a new resume, or switching an existing version's look.">
        <StateGrid min={280}>
          <StateCell label="Default" pad={false} minH={220}>
            <TemplateGallery onSelect={noop} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="VersionCard, ScoreBadge" file="src/components/resume/ResumeExperience.tsx" purpose="One saved resume in the Resume tab's card grid: status tags, name/target, ATS Rating and Job Match scores once checked, and edit/download/duplicate/delete actions." when="The Resume tab's 'Your Resumes' grid.">
        <StateGrid min={280}>
          <StateCell label="Standard, no scores yet"><Inert><VersionCard resume={SAMPLE_RESUME_DATA} version={mkVersion({ id: "v1", name: "First Draft" })} onOpen={noop} onEdit={noop} onDuplicate={noop} onDelete={noop} /></Inert></StateCell>
          <StateCell label="Tailored + approved, high scores"><Inert><VersionCard resume={SAMPLE_RESUME_DATA} version={mkVersion({ id: "v2", name: "Software Eng Internship", jobDescription: "We are looking for a summer intern...", targetPosition: "Software Engineering Intern", targetCompany: "Acme Co", approved: true, atsCheck: mkAts(92, 88) })} onOpen={noop} onEdit={noop} onDuplicate={noop} onDelete={noop} /></Inert></StateCell>
          <StateCell label="Low scores"><Inert><VersionCard resume={SAMPLE_RESUME_DATA} version={mkVersion({ id: "v3", name: "Needs Work Draft", atsCheck: mkAts(38, null) })} onOpen={noop} onEdit={noop} onDuplicate={noop} onDelete={noop} /></Inert></StateCell>
          <StateCell label="Long version name" note="Truncates with an ellipsis at one line."><Inert><VersionCard resume={SAMPLE_RESUME_DATA} version={mkVersion({ id: "v4", name: EDGE.longTitle })} onOpen={noop} onEdit={noop} onDuplicate={noop} onDelete={noop} /></Inert></StateCell>
          <StateCell label="Tag color nudge (sparkle)" note="Real prop tagNudge: the sparkle nudge on the color dot, one of the app's own micro-interaction cues."><Inert><VersionCard resume={SAMPLE_RESUME_DATA} version={mkVersion({ id: "v5", name: "First Draft" })} onOpen={noop} onEdit={noop} onDuplicate={noop} onDelete={noop} tagNudge /></Inert></StateCell>
          <StateCell label="ScoreBadge values" note="Color follows the score band (green/blue/muted)."><div className="flex flex-wrap gap-[8px]"><ScoreBadge category="Resume Rating" label="Strong" value={92} /><ScoreBadge category="Resume Rating" label="Needs Work" value={38} /><ScoreBadge category="Job Match" label="Possible Match" value={64} /></div></StateCell>
        </StateGrid>
        <p className="text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
          Two of VersionCard&apos;s built actions are real, not no-ops, even with onOpen/onEdit/onDuplicate/onDelete passed as noop: the colored tag dot opens a color picker that calls the real <code style={MONO}>upsertVersion</code> (writes the actual resume store) and Download calls the real <code style={MONO}>downloadDocx</code> (generates and downloads a real .docx client-side). Neither can be no-op&apos;d without editing VersionCard itself, which the lab&apos;s rules don&apos;t allow, so the cards above are shown inert (no clicks or focus).
        </p>
      </Specimen>

      <Specimen name="JobMatchPanel, TailorScreen, ExperienceModal" file="src/components/resume/JobMatchPanel.tsx, src/components/resume/TailorScreen.tsx, src/components/resume/ExperienceModal.tsx" purpose="AI-assisted resume steps: match skills to a pasted job description, tailor a whole version to it, and generate bullet lines for an experience entry." when="Choose & Tailor and any experience entry's 'Generate Lines'.">
        <StateGrid min={260}>
          <StateCell label="JobMatchPanel live" note="Loads on click, inert (no clicks reach the real POST). Open a saved version, then Job Match."><LiveRoute href="/resume-builder?view=list" /></StateCell>
          <StateCell label="JobMatchPanel loading" kind="built" note="Built, see src/components/resume/JobMatchPanel.tsx:132."><ProposedLoading shape="button" label="Finding matches" /></StateCell>
          <StateCell label="JobMatchPanel error" kind="built" note="Now the shared inline error view, exact copy kept. See src/components/resume/JobMatchPanel.tsx:134."><ProposedError variant="inline" message="Couldn't match this job. Try again in a moment." /></StateCell>
          <StateCell label="TailorScreen live" note="Loads on click, inert. Choose & Tailor."><LiveRoute href="/resume-builder?view=tailor" /></StateCell>
          <StateCell label="TailorScreen loading" kind="built" note="Built, see src/components/resume/TailorScreen.tsx:218."><ProposedLoading shape="button" label="Matching" /></StateCell>
          <StateCell label="TailorScreen error" kind="built" note="Now the shared inline error view, exact copy kept. See src/components/resume/TailorScreen.tsx:222."><ProposedError variant="inline" message="Couldn't read that job description. Try again in a moment." /></StateCell>
          <StateCell label="ExperienceModal live" note="Loads on click, inert. Wizard step 3, Add/Edit an experience entry."><LiveRoute href="/resume-builder?view=wizard" /></StateCell>
          <StateCell label="ExperienceModal loading" kind="built" note="Built, see src/components/resume/ExperienceModal.tsx:260."><ProposedLoading shape="button" label="Generating" /></StateCell>
          <StateCell label="ExperienceModal error" kind="built" note="Now the shared inline error view, exact copy kept. See src/components/resume/ExperienceModal.tsx:248."><ProposedError variant="inline" message="Couldn't generate bullets. Try again, or write your own." /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ATSCheckPanel" file="src/components/resume/ATSCheckPanel.tsx" purpose="The full resume-quality audit: score + grade + a 7-category breakdown, strengths/improvements, and (with a job description on the version) a match breakdown." when="A saved version's 'ATS Check'.">
        <StateGrid min={280}>
          <StateCell label="Idle (built)" note="No network call on mount, safe to render. Its 'Run ATS Check' button calls the real POST /api/resume-ats-check, don't click it in the lab."><ATSCheckPanel resume={SAMPLE_RESUME_DATA} version={mkVersion({ atsCheck: null })} onClose={noop} /></StateCell>
          <StateCell label="Result (built)" note="version.atsCheck populated ahead of time; no network involved."><ATSCheckPanel resume={SAMPLE_RESUME_DATA} version={mkVersion({ atsCheck: mkAts(78, 70) })} onClose={noop} /></StateCell>
          <StateCell label="Stale result (built)" note="analyzedFor no longer matches the resume's fingerprint; shows the 'has changed since' banner."><ATSCheckPanel resume={SAMPLE_RESUME_DATA} version={mkVersion({ atsCheck: mkAts(60, null, "stale-fingerprint") })} onClose={noop} /></StateCell>
          <StateCell label="Checking (built loading)" kind="built" note="The Run button's own label swap; can't force live without a real network call. See src/components/resume/ATSCheckPanel.tsx:89."><ProposedLoading shape="button" label="Checking" /></StateCell>
          <StateCell label="Error (built)" kind="built" note="Now the shared inline error view, exact copy kept. See src/components/resume/ATSCheckPanel.tsx:91."><ProposedError variant="inline" message="Couldn't run the check right now. Try again in a moment." /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="EmptyStateAdd" file="src/components/resume/wizardSteps.tsx" purpose="The dashed add-row a wizard step shows in place of an empty list (education, experience, certifications)." when="Any resume wizard step before its first entry is added.">
        <StateGrid>
          <StateCell label="Add Education"><EmptyStateAdd label="Add Education" onAdd={noop} /></StateCell>
          <StateCell label="Add Experience"><EmptyStateAdd label="Add Experience" onAdd={noop} /></StateCell>
        </StateGrid>
        <p className="text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
          The wizard steps themselves (PersonalInfoStep, EducationStep, ExperienceStep, SkillsStep, CertificationsStep, ReviewStep) call <code style={MONO}>writeResume</code> directly on save, so only this file-local, pure sub-component is rendered above. See it live below.
        </p>
        <LiveRoute href="/resume-builder?view=wizard" />
      </Specimen>

      <Specimen name="Resume versions list" file="src/components/resume/ResumeExperience.tsx" purpose="The Resume tab's 'Your Resumes' grid of VersionCards." when="The Resume tab, once at least one resume exists.">
        <StateGrid>
          <StateCell label="Loading" kind="built" note="SurfaceStateView, the exact same safe/pure state renderer ResumeExperience now uses -- no store read or write. See it forced live: /resume-builder?view=list&state=loading&surface=32."><SurfaceStateView id={32} state="loading" what="resume" /></StateCell>
          <StateCell label="Error" kind="built" note="See it forced live: /resume-builder?view=list&state=error&surface=32."><SurfaceStateView id={32} state="error" what="resume" /></StateCell>
          <StateCell label="Empty" kind="built" note="The real zero-resumes screen keeps its own bespoke design (ResumeExperience.tsx:326, sparkle + 'Create My Resume', a first-run screen worth its own polish) rather than this generic tier; this is what ?state=empty&surface=32 forces for review of the shared contract."><SurfaceStateView id={32} state="empty" what="resume" onEmptyAction={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <SubHead>Counselor</SubHead>
      <p className="max-w-[72ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        CounselorShell and every full dashboard screen (Overview, CareerCollegeInsights, StudentsRoster, CounselorImpact) read the App Router&apos;s URL and counselor filters context, so they render below only as their small, safe, presentational pieces, one export keyword added to each, no behavior changed.
      </p>

      <Specimen name="CounselorShell" file="src/components/counselor/shell.tsx" purpose="The counselor dashboard's nav rail, top bar and page frame." when="Every counselor v2 screen.">
        <StateGrid>
          <StateCell label="Default" note="Loads on click, inert. Reads the App Router's pathname/searchParams and useCounselorFilters context, so it needs the real router, not a mock."><LiveRoute href="/counselor?view=overview" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MetricRow, InitialsBadge" file="src/components/counselor/v4/overviewShared.tsx" purpose="A labelled value-vs-target row with its own bar (MetricRow), and a name's initials in a colored circle (InitialsBadge)." when="Any counselor v2 card's own metric rows, and any student reference without a photo.">
        <StateGrid>
          <StateCell label="MetricRow, on target"><MetricRow label="Seniors with a plan" value={82} target={80} /></StateCell>
          <StateCell label="MetricRow, no data" note="value=null prints 'n/a' and the bar reads as 0."><MetricRow label="Seniors with a plan" value={null} target={80} /></StateCell>
          <StateCell label="InitialsBadge"><InitialsBadge name="Jordan Lee" /></StateCell>
          <StateCell label="InitialsBadge, long name"><InitialsBadge name={EDGE.longName} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DeltaChip" file="src/components/component-lab/sections/counselorLegacyParts.tsx" purpose="A small trend chip: up/down arrow, signed point change, 'vs last month'." when="A DonutCard's trend line on the v2 Overview.">
        <StateGrid>
          <StateCell label="Up"><DeltaChip pts={6} /></StateCell>
          <StateCell label="Down"><DeltaChip pts={-4} /></StateCell>
          <StateCell label="No change"><DeltaChip pts={0} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="HeaderCell" file="src/components/counselor/v4/StudentsRoster.tsx" purpose="One sortable (or plain) column header for the roster table." when="The Students Roster table header row.">
        <StateGrid>
          <StateCell label="Sortable, active" pad={false}>
            <table className="w-full"><thead><tr><HeaderCell label="Name" keyName="name" sortKey="name" sortDir="asc" onSort={noop} /></tr></thead></table>
          </StateCell>
          <StateCell label="Sortable, inactive" pad={false}>
            <table className="w-full"><thead><tr><HeaderCell label="Last Active" keyName="lastActive" sortKey="name" sortDir="asc" onSort={noop} /></tr></thead></table>
          </StateCell>
          <StateCell label="Plain (not sortable)" pad={false}>
            <table className="w-full"><thead><tr><HeaderCell label="Pathway" sortKey="name" sortDir="asc" onSort={noop} /></tr></thead></table>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TopTen" file="src/components/counselor/v4/CareerCollegeInsights.tsx" purpose="A titled card wrapping RankedBars: top 5 shown, 'Show all' reveals the rest." when="Career & College Insights' saved-careers and saved-colleges cards.">
        <StateGrid min={280}>
          <StateCell label="Default"><TopTen title="Top Saved Careers" items={[{ name: "Software Engineer", count: 42 }, { name: "Registered Nurse", count: 31 }, { name: "Business Analyst", count: 19 }, { name: "Graphic Designer", count: 14 }, { name: "Electrician", count: 11 }, { name: "Physical Therapist", count: 8 }]} /></StateCell>
          <StateCell label="Empty" note="No built empty state; renders an empty list with a hard-coded 'students who saved it' caption above nothing."><TopTen title="Top Saved Colleges" items={[]} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MetChip" file="src/components/counselor/v4/CounselorImpact.tsx" purpose="A small met / in-progress pill for a compliance stat." when="My Impact and the Principal Report's district compliance rows.">
        <StateGrid>
          <StateCell label="Met"><MetChip met /></StateCell>
          <StateCell label="In progress"><MetChip met={false} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DrillPanel, roster filter, My Impact / Principal Report" file="src/components/counselor/v4/Drill.tsx, src/components/counselor/v4/StudentsRoster.tsx, src/components/counselor/v4/CounselorImpact.tsx" purpose="Three counselor states, now wired through SurfaceState (27 Sept 2026: COMPONENT_INVENTORY rows 59, 61, 62)." when="A drill-down with nothing authored, a roster filter with no matches, or My Impact/the district report for a school with no data yet.">
        <StateGrid min={240}>
          <StateCell label="DrillPanel live" note="Loads on click, inert. Open any stat tile on My Impact to drill in."><LiveRoute href="/counselor?view=impact" /></StateCell>
          <StateCell label="DrillPanel loading" kind="built" note="SurfaceState id=59 inside DrillPanel; force live with &state=loading&surface=59."><SurfaceStateView id={59} state="loading" /></StateCell>
          <StateCell label="DrillPanel error" kind="built" note="Force live with &state=error&surface=59."><SurfaceStateView id={59} state="error" /></StateCell>
          <StateCell label="DrillPanel empty" kind="built" note="Real condition: a drill with no lead/stats/rows/items/students/action authored. Force live with &state=empty&surface=59."><SurfaceStateView id={59} state="empty" /></StateCell>
          <StateCell label="Roster filter, no match" kind="built" note="Real EmptyView tier 5, names the actual active filters and offers Clear filters -- see src/components/counselor/v4/StudentsRoster.tsx."><EmptyView tier={5} query="Grade 12, At Risk" line="Try a different grade, status, or clear everything below." cta="Clear filters" onAction={noop} /></StateCell>
          <StateCell label="My Impact loading" kind="built" note="SurfaceState id=62 wraps the whole screen; force live with /counselor?view=impact&state=loading&surface=62."><SurfaceStateView id={62} state="loading" /></StateCell>
          <StateCell label="My Impact error" kind="built" note="Force live with /counselor?view=impact&state=error&surface=62."><SurfaceStateView id={62} state="error" /></StateCell>
          <StateCell label="My Impact / district report, no data" kind="built" note="Real condition: caseload 0. Force live with /counselor?view=impact&state=empty&surface=62."><SurfaceStateView id={62} state="empty" onEmptyAction={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Write-on-interaction and navigation, live only" file="src/components/counselor/v4/Casefile.tsx, ReviewQueue.tsx, Batch.tsx, Settings.tsx" purpose="Every other counselor v2 piece named in the brief that writes real storage or navigates -- loads on click, inert, so nothing here ever fires those writes.">
        <StateGrid min={240}>
          <StateCell label="Casefile cards" note="PlanSignoffCard, TodosCard and CheckinsCard call the real writeSignoff/addTodo/toggleTodo/removeTodo casefile storage on click. Open any student's profile."><LiveRoute href="/counselor?view=students" /></StateCell>
          <StateCell label="ReviewQueue" note="Approves/requests changes on real reviewed-roster storage."><LiveRoute href="/counselor?view=review-queue" /></StateCell>
          <StateCell label="BatchComposer" note="Sends a batch action against the selected students' real records. Pick students, then message all."><LiveRoute href="/counselor?view=connect" /></StateCell>
          <StateCell label="Settings" note="Saves the counselor account via writeCounselorAccount. Also where Toggle's new disabled/pending props and SelectBox's new disabled prop live."><LiveRoute href="/counselor?view=settings" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
