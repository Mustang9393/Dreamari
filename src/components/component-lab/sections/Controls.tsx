"use client";

// DEMO-ONLY: Component Lab section, "Controls". Every shared control the
// app builds screens from -- buttons, pickers, tabs, chips, toggles, form
// fields -- with the states real students and counselors actually hit.
// Interactive ones (Listbox, DatePicker, Segmented, SubTabs, ScrollChips,
// SelectBox, Toggle, ChipRow, InterestPicker, Disclosure) keep their own
// local state here so clicking them in the lab actually works.

import { useState } from "react";
import { Download, Pencil } from "lucide-react";
import { Section, Specimen, StateGrid, StateCell, NotRendered, Reveal, ProposedLoading, ProposedError, EDGE, noop } from "../kit";

import { Button } from "@/components/ui/Button";
import { MarketingButton } from "@/components/marketing/Button";
import { Listbox, type ListboxOption } from "@/components/app/Listbox";
import { DatePicker } from "@/components/app/DatePicker";
import { ForYouBrowseToggle } from "@/components/app/ExploreExperience";
import { ExploreSectionTabs, BackButton } from "@/components/app/chrome";
import { AudienceToggle } from "@/components/marketing/AudienceToggle";
import { Disclosure as MarketingDisclosure } from "@/components/marketing/Disclosure";
import { Disclosure as CounselorDisclosure, ShowAll } from "@/components/counselor/v2/Disclosure";
import { Segmented } from "@/components/connect/viz";
import { SubTabs } from "@/components/counselor/v2/SubTabs";
import { ScrollChips, SelectBox } from "@/components/counselor/chips";
import { Toggle } from "@/components/counselor/v2/Settings";
import { ChipRow, InterestPicker, Field as FlowField, PrimaryButton, QuietButton } from "@/components/flow-lab/shared";
import { PrimaryCta, QuietCta } from "@/components/connect/primitives";
import { FollowButton } from "@/components/connect/ProProfile";
import { SaveButton } from "@/components/colleges/shared";
import { OptionButton } from "@/components/play/interactions";
import { Field as ResumeField, TextInput, SelectInput, ToolbarButton } from "@/components/resume/ui";
import { SearchTrigger } from "@/components/app/GlobalSearch";

const LISTBOX_OPTIONS: ListboxOption[] = [
  { value: "cs", label: "Computer Science" },
  { value: "biz", label: "Business" },
  { value: "nursing", label: "Nursing", disabled: true },
  { value: "welding", label: "Welding" },
];

function ListboxDemo({ placeholderOnly }: { placeholderOnly?: boolean }) {
  const [value, setValue] = useState(placeholderOnly ? "" : "cs");
  return <Listbox value={value} onChange={setValue} options={LISTBOX_OPTIONS} ariaLabel="Interest" placeholder="Select an interest…" />;
}

function DatePickerDemo({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return <DatePicker value={value} onChange={setValue} ariaLabel="Birthday" placeholder="Select a date" />;
}

function ForYouBrowseToggleDemo({ nudge = false }: { nudge?: boolean }) {
  const [tab, setTab] = useState<"foryou" | "browse">("foryou");
  return <ForYouBrowseToggle tab={tab} onTab={setTab} nudge={nudge} />;
}

function AudienceToggleDemo() {
  const [view, setView] = useState<"student" | "schools">("student");
  return <AudienceToggle view={view} onChange={setView} />;
}

function MarketingDisclosureDemo({ startOpen }: { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <MarketingDisclosure id="lab-marketing-disclosure" title="What students do" open={open} onToggle={() => setOpen((o) => !o)} size="sm">
      <p className="text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>Explore careers, save a Top 3, and build a resume around them.</p>
    </MarketingDisclosure>
  );
}

function CounselorDisclosureDemo({ startOpen }: { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <CounselorDisclosure id="lab-counselor-disclosure" title="Fall semester" summary="6 milestones, 2 overdue" open={open} onToggle={() => setOpen((o) => !o)}>
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Milestone rows render here.</p>
    </CounselorDisclosure>
  );
}

function ShowAllDemo({ startOpen }: { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return <ShowAll total={11} shown={5} open={open} onToggle={() => setOpen((o) => !o)} />;
}

function SegmentedDemo() {
  const [value, setValue] = useState<"active" | "saved" | "archived">("active");
  return (
    <Segmented
      ariaLabel="Roster filter"
      value={value}
      onChange={setValue}
      options={[
        { key: "active", label: "Active", badge: 12 },
        { key: "saved", label: "Saved", badge: 3 },
        { key: "archived", label: "Archived" },
      ]}
    />
  );
}

function SubTabsDemo() {
  const [value, setValue] = useState<"questions" | "announcements">("questions");
  return (
    <SubTabs
      ariaLabel="Connect filter"
      value={value}
      onChange={setValue}
      options={[
        { key: "questions", label: "Questions", count: 4 },
        { key: "announcements", label: "Announcements" },
      ]}
    />
  );
}

function ScrollChipsDemo() {
  const [value, setValue] = useState<"all" | "on-track" | "at-risk">("all");
  return (
    <ScrollChips
      ariaLabel="Status filter"
      value={value}
      onChange={setValue}
      options={[
        { key: "all", label: "All" },
        { key: "on-track", label: "On Track" },
        { key: "at-risk", label: "At Risk" },
      ]}
    />
  );
}

function SelectBoxDemo({ startChecked }: { startChecked: boolean }) {
  const [checked, setChecked] = useState(startChecked);
  return <SelectBox checked={checked} label="Include archived students" onChange={setChecked} />;
}

function ToggleDemo({ startOn }: { startOn: boolean }) {
  const [on, setOn] = useState(startOn);
  return <Toggle on={on} onChange={setOn} />;
}

function ChipRowDemo({ atMax }: { atMax?: boolean }) {
  const options = [
    { key: "tech", label: "Tech & Engineering" },
    { key: "health", label: "Health & Medicine" },
    { key: "business", label: "Business" },
    { key: "arts", label: "Arts & Media" },
  ];
  const [value, setValue] = useState<string[]>(atMax ? ["tech", "health", "business"] : ["tech"]);
  return <ChipRow ariaLabel="Worlds" options={options} value={value} max={3} onChange={setValue} />;
}

function InterestPickerDemo() {
  const [value, setValue] = useState<string[]>(["Business"]);
  return <InterestPicker value={value} max={3} onChange={setValue} />;
}

function FollowButtonDemo({ startFollowing, compact, dense }: { startFollowing: boolean; compact?: boolean; dense?: boolean }) {
  const [following, setFollowing] = useState(startFollowing);
  return <FollowButton following={following} onToggle={() => setFollowing((f) => !f)} compact={compact} dense={dense} />;
}

function SaveButtonDemo({ startOn }: { startOn: boolean }) {
  const [on, setOn] = useState(startOn);
  return <SaveButton on={on} onToggle={() => setOn((v) => !v)} />;
}

function OptionButtonDemo({ tier, picked, revealed, disabled, label = "Registered nurse" }: { tier?: "best" | "wrong"; picked?: boolean; revealed?: boolean; disabled?: boolean; label?: string }) {
  const [clicked, setClicked] = useState(Boolean(picked));
  return (
    <OptionButton
      label={label}
      index={0}
      onClick={() => setClicked((c) => !c)}
      picked={picked !== undefined ? clicked : undefined}
      tier={tier}
      revealed={revealed}
      disabled={disabled}
    />
  );
}

function QuietCtaDoneDemo() {
  const [done, setDone] = useState(false);
  return <QuietCta onClick={() => setDone((d) => !d)} done={done}>{done ? "Following" : "Follow"}</QuietCta>;
}

const RESUME_STATE_OPTIONS: ListboxOption[] = [
  { value: "hs", label: "High school diploma" },
  { value: "aa", label: "Associate degree" },
  { value: "ba", label: "Bachelor's degree" },
];

function ResumeFieldDemo({ invalid }: { invalid?: boolean }) {
  const [value, setValue] = useState(invalid ? "" : "Software Engineering Intern");
  return (
    <ResumeField label="Job title" htmlFor="lab-resume-title" required>
      <TextInput id="lab-resume-title" value={value} onChange={setValue} placeholder="e.g. Barista" invalid={invalid} />
    </ResumeField>
  );
}

function ResumeSelectDemo() {
  const [value, setValue] = useState("aa");
  return (
    <ResumeField label="Education level" htmlFor="lab-resume-edu">
      <SelectInput id="lab-resume-edu" value={value} onChange={setValue} options={RESUME_STATE_OPTIONS} />
    </ResumeField>
  );
}

function GlobalSearchDemo() {
  return <SearchTrigger />;
}

export function ControlsSection() {
  return (
    <Section id="controls" title="Controls" intro="Buttons, pickers, tabs, chips and form fields. Interactive states are live: click them.">
      <Specimen name="Button" file="src/components/ui/Button.tsx" purpose="The app's base button: one shape, one hover treatment, two sizes." when="Any in-app action that isn't a marketing CTA.">
        <StateGrid>
          <StateCell label="Primary"><Button onClick={noop}>Save</Button></StateCell>
          <StateCell label="Secondary"><Button variant="secondary" onClick={noop}>Cancel</Button></StateCell>
          <StateCell label="Quiet"><Button variant="quiet" onClick={noop}>Skip</Button></StateCell>
          <StateCell label="Disabled"><Button disabled onClick={noop}>Save</Button></StateCell>
          <StateCell label="Long label" note="Wraps to the button's width; no truncation built."><Button onClick={noop}>{EDGE.longTitle}</Button></StateCell>
          <StateCell label="Loading" kind="proposed"><ProposedLoading shape="button" label="Saving" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MarketingButton" file="src/components/marketing/Button.tsx" purpose="The marketing site's CTA button: gradient primary, ghost, and the flat Schools-page solid/outline pair." when="Landing pages and the Schools page only, never inside the app.">
        <StateGrid>
          <StateCell label="Primary"><MarketingButton variant="primary" onClick={noop}>Start Journey</MarketingButton></StateCell>
          <StateCell label="Ghost"><MarketingButton variant="ghost" onClick={noop}>Learn more</MarketingButton></StateCell>
          <StateCell label="Solid"><MarketingButton variant="solid" onClick={noop}>Get started</MarketingButton></StateCell>
          <StateCell label="Outline"><MarketingButton variant="outline" onClick={noop}>See plans</MarketingButton></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Listbox" file="src/components/app/Listbox.tsx" purpose="Bespoke single-choice dropdown; a drop-in for <select> that looks the same on every OS." when="Anywhere a native <select> would otherwise render (see CROSS_BROWSER_GUARDRAILS.md).">
        <StateGrid>
          <StateCell label="Placeholder"><ListboxDemo placeholderOnly /></StateCell>
          <StateCell label="Selected"><ListboxDemo /></StateCell>
          <StateCell label="Disabled trigger"><Listbox value="cs" onChange={noop} options={LISTBOX_OPTIONS} ariaLabel="Interest" disabled /></StateCell>
          <StateCell label="Open / disabled option" note="Click to open. Nursing is disabled in this list."><ListboxDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DatePicker" file="src/components/app/DatePicker.tsx" purpose="Bespoke calendar picker; a drop-in for <input type=&quot;date&quot;> with no OS chrome." when="Anywhere a native date input would otherwise render.">
        <StateGrid>
          <StateCell label="Empty"><DatePickerDemo initial="" /></StateCell>
          <StateCell label="Selected"><DatePickerDemo initial="2010-05-14" /></StateCell>
          <StateCell label="Today" note="Click to open and see today ringed in the grid."><DatePickerDemo initial={new Date().toISOString().slice(0, 10)} /></StateCell>
          <StateCell label="Disabled"><DatePicker value="2010-05-14" onChange={noop} disabled /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ForYouBrowseToggle" file="src/components/app/ExploreExperience.tsx" purpose="The Explore reel/grid switch." when="Top of Explore, above the For You reel or Browse All grid.">
        <StateGrid>
          <StateCell label="For you selected"><ForYouBrowseToggleDemo /></StateCell>
          <StateCell label="Nudge sweep" note="A one-time text sweep draws the eye to For You until it's first opened."><ForYouBrowseToggleDemo nudge /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ExploreSectionTabs" file="src/components/app/chrome.tsx" purpose="Careers / Colleges section switch, with an animated underline." when="The Explore header, above ForYouBrowseToggle.">
        <StateGrid>
          <StateCell label="Careers active" note="Clicking Colleges calls router.push and navigates away from this lab page (Next client-side navigation), rendered live because clicking it is a deliberate, user-initiated action, not something the lab does on its own."><ExploreSectionTabs active="careers" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="AudienceToggle" file="src/components/marketing/AudienceToggle.tsx" purpose="Student / Schools switch on the marketing landing page." when="The marketing hero only.">
        <StateGrid>
          <StateCell label="Student selected"><AudienceToggleDemo /></StateCell>
          <StateCell label="Schools (always disabled)" note="Enterprise is mid-redesign; the Schools segment stays disabled until it ships (ENTERPRISE_ENABLED = false)."><AudienceToggle view="student" onChange={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Disclosure (marketing)" file="src/components/marketing/Disclosure.tsx" purpose="Collapsible FAQ row or sub-section; the heading is the control." when="Marketing FAQs and Schools-page sub-sections.">
        <StateGrid>
          <StateCell label="Closed"><MarketingDisclosureDemo startOpen={false} /></StateCell>
          <StateCell label="Open"><MarketingDisclosureDemo startOpen /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Disclosure / ShowAll (counselor v2)" file="src/components/counselor/v2/Disclosure.tsx" purpose="Progressive-disclosure accordion for the counselor dashboard, and the &quot;Show all N&quot; row underneath a truncated list." when="Any counselor v2 card that would otherwise show everything at once.">
        <StateGrid>
          <StateCell label="Section closed"><CounselorDisclosureDemo startOpen={false} /></StateCell>
          <StateCell label="Section open"><CounselorDisclosureDemo startOpen /></StateCell>
          <StateCell label="Show all (collapsed)"><ShowAllDemo startOpen={false} /></StateCell>
          <StateCell label="Show all (expanded)"><ShowAllDemo startOpen /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Segmented" file="src/components/connect/viz.tsx" purpose="Segmented tab control with optional unread-count badges." when="A top-level filter inside a Connect panel.">
        <StateGrid>
          <StateCell label="Selected, with badges"><SegmentedDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SubTabs" file="src/components/counselor/v2/SubTabs.tsx" purpose="Plain-text second-level tabs, no container, for a filter nested inside a Segmented tab." when="Never stacked directly on top of another tab row of the same weight.">
        <StateGrid>
          <StateCell label="Selected, with count"><SubTabsDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ScrollChips" file="src/components/counselor/chips.tsx" purpose="A horizontally scrolling row of filter chips." when="A filter row with more options than comfortably fit on one line.">
        <StateGrid>
          <StateCell label="Selected"><ScrollChipsDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SelectBox" file="src/components/counselor/chips.tsx" purpose="A labelled checkbox row." when="A single yes/no filter option, e.g. &quot;Include archived students&quot;.">
        <StateGrid>
          <StateCell label="Unchecked"><SelectBoxDemo startChecked={false} /></StateCell>
          <StateCell label="Checked"><SelectBoxDemo startChecked /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Toggle" file="src/components/counselor/v2/Settings.tsx" purpose="On/off switch for a counselor setting." when="Counselor Settings only." >
        <StateGrid>
          <StateCell label="Off"><ToggleDemo startOn={false} /></StateCell>
          <StateCell label="On"><ToggleDemo startOn /></StateCell>
        </StateGrid>
        <p className="text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>File-local in counselor/v2/Settings.tsx; only the <code>export</code> keyword was added so it could render here.</p>
      </Specimen>

      <Specimen name="ChipRow, InterestPicker, Field" file="src/components/flow-lab/shared.tsx" purpose="Multi-select chip group (ChipRow), the Match Lab's worlds picker built on it (InterestPicker), and the labelled section wrapper (Field) they sit inside." when="Match Lab and Build's own multi-pick questions.">
        <StateGrid>
          <StateCell label="Selected (1 of 3)"><ChipRowDemo /></StateCell>
          <StateCell label="At max (3 of 3), rest disabled"><ChipRowDemo atMax /></StateCell>
          <StateCell label="InterestPicker"><InterestPickerDemo /></StateCell>
          <StateCell label="Field wrapper"><FlowField label="Worlds"><InterestPickerDemo /></FlowField></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PrimaryButton, QuietButton" file="src/components/flow-lab/shared.tsx" purpose="Flow Lab's own button pair (independent of ui/Button.tsx, scoped to the lab flows)." when="Inside /flow-lab only.">
        <StateGrid>
          <StateCell label="Primary"><PrimaryButton onClick={noop}>Continue</PrimaryButton></StateCell>
          <StateCell label="Primary disabled"><PrimaryButton onClick={noop} disabled>Continue</PrimaryButton></StateCell>
          <StateCell label="Quiet"><QuietButton onClick={noop}>Back</QuietButton></StateCell>
          <StateCell label="Quiet disabled"><QuietButton onClick={noop} disabled>Back</QuietButton></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PrimaryCta, QuietCta" file="src/components/connect/primitives.tsx" purpose="Connect's own CTA pair, including QuietCta's &quot;done&quot; state for a completed action." when="Connect screens (profiles, communities, threads).">
        <StateGrid>
          <StateCell label="PrimaryCta"><PrimaryCta onClick={noop}>Ask a question</PrimaryCta></StateCell>
          <StateCell label="QuietCta"><QuietCta onClick={noop}>Follow</QuietCta></StateCell>
          <StateCell label="QuietCta done" note="Click to toggle."><QuietCtaDoneDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FollowButton" file="src/components/connect/ProProfile.tsx" purpose="Follow/following toggle for a Connect pro profile." when="Pro profile headers and People to Follow rows.">
        <StateGrid>
          <StateCell label="Not following"><FollowButtonDemo startFollowing={false} /></StateCell>
          <StateCell label="Following"><FollowButtonDemo startFollowing /></StateCell>
          <StateCell label="Compact"><FollowButtonDemo startFollowing={false} compact /></StateCell>
          <StateCell label="Dense (sharing a line)"><FollowButtonDemo startFollowing={false} dense /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SaveButton" file="src/components/colleges/shared.tsx" purpose="Bookmark toggle for a college card." when="Every college card and the college detail header.">
        <StateGrid>
          <StateCell label="Unsaved" surface="game"><SaveButtonDemo startOn={false} /></StateCell>
          <StateCell label="Saved" surface="game"><SaveButtonDemo startOn /></StateCell>
        </StateGrid>
        <p className="text-[12px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Shown on a dark tile on purpose: this button is hard-coded for the photo-card surface it always sits on (docs/handoff/COMPONENT_INVENTORY.md flags its dark colors as by-design here, not a light-mode bug).</p>
      </Specimen>

      <Specimen name="OptionButton" file="src/components/play/interactions.tsx" purpose="Simulation/Glossary answer choice, with locked, correct and wrong marking." when="Play beats: Choice, Bucket, Cards and similar.">
        <StateGrid>
          <StateCell label="Default"><OptionButtonDemo /></StateCell>
          <StateCell label="Locked (disabled)"><OptionButtonDemo disabled /></StateCell>
          <StateCell label="Correct" note="Click to toggle picked."><OptionButtonDemo tier="best" picked /></StateCell>
          <StateCell label="Wrong" note="Click to toggle picked."><OptionButtonDemo tier="wrong" picked /></StateCell>
          <StateCell label="Revealed (right answer shown after a wrong pick)"><OptionButtonDemo revealed label={EDGE.longTitle} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Resume Field, TextInput, SelectInput, ToolbarButton" file="src/components/resume/ui.tsx" purpose="The Resume Builder's own form field wrapper, text input, select (a Listbox, not a native &lt;select&gt;), and document-toolbar icon button." when="Resume Builder wizard steps and the document toolbar.">
        <StateGrid>
          <StateCell label="Default"><ResumeFieldDemo /></StateCell>
          <StateCell label="Invalid" kind="built" note="TextInput's own invalid prop reddens the border."><ResumeFieldDemo invalid /></StateCell>
          <StateCell label="Inline field error" kind="proposed" note="No built error message under the field yet; this is the playbook's inline-error voice."><ResumeFieldDemo invalid /><div className="mt-[6px]"><ProposedError variant="inline" verb="save this field" /></div></StateCell>
          <StateCell label="SelectInput" note="Built on Listbox, not a native &lt;select&gt;, confirmed not the cross-browser-flagged control."><ResumeSelectDemo /></StateCell>
          <StateCell label="ToolbarButton"><ToolbarButton label="Export" onClick={noop}><Download className="h-4 w-4" aria-hidden /></ToolbarButton></StateCell>
          <StateCell label="ToolbarButton icon-only"><ToolbarButton label="Edit sections" onClick={noop} iconOnly><Pencil className="h-4 w-4" aria-hidden /></ToolbarButton></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BackButton" file="src/components/app/chrome.tsx" purpose="The one back arrow used on every screen with its own history stack." when="Any full-screen route reached by pushing forward from somewhere else.">
        <StateGrid>
          <StateCell label="Default" note="Rendered live because clicking it is user-initiated; it calls router.back() (or pushes /home with no history) and will navigate away from this lab page."><BackButton /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SearchTrigger / GlobalSearch" file="src/components/app/GlobalSearch.tsx" purpose="The Cmd+K search trigger and the full-screen results overlay it opens." when="Every app header.">
        <StateGrid min={320}>
          <StateCell label="Trigger and overlay" note="SearchTrigger's Cmd+K listener and GlobalSearch's scroll lock only run while this Reveal is open, so they never fire for the rest of the lab. Click the icon to open the overlay; Escape or the backdrop closes it (and the scroll lock with it)." minH={180}>
            <Reveal label="Open search demo" clip={false}>
              <GlobalSearchDemo />
            </Reveal>
          </StateCell>
        </StateGrid>
        <NotRendered reason="Rendering SearchTrigger unconditionally at the lab's top level would install a page-wide Cmd+K listener for the whole lab; it is scoped inside the Reveal above instead." />
      </Specimen>
    </Section>
  );
}
