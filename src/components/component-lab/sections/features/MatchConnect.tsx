"use client";

// DEMO-ONLY: Component Lab, feature modules part -- Match and Connect.
// Everything here is a real app piece rendered in isolation; components
// that write a real store or navigate on their own are NotRendered instead
// (see each specimen's note). LabCard, CommunityCard, PersonCard,
// PeopleWelcome, the connect/primitives pieces and the ProProfile pieces
// are already shown in the Surfaces section; DetailModal, TopThreeScreen,
// RankSlots, PicksTray and BottomBar are already shown in Overlays -- none
// of those are repeated below.

import { useState } from "react";
import { SubHead, Specimen, StateGrid, StateCell, ProposedLoading, ProposedError, ProposedEmpty, NotRendered, LiveRoute, Reveal, noop, EDGE } from "../../kit";
import { SurfaceStateView } from "@/components/app/SurfaceState";

// Match: shared.tsx pieces not already covered in Surfaces/Overlays.
import { LabScreen, PrimaryButton, QuietButton, ChipRow, InterestPicker, Field, ProfileTabs, RevealGrid } from "@/components/flow-lab/shared";
import { labCatalog } from "@/components/flow-lab/lab";

// Connect.
import { ConnectNav } from "@/components/connect/primitives";
import { THREADS, INSIGHTS, COMMUNITIES, EVENTS, PROS } from "@/components/connect/data";
import {
  ConnectNotFound,
  HelpfulPill,
  StatusChip,
  QuestionCard,
  InsightCard,
  CompactQuestionCard,
  CompactInsightCard,
  AlignedQuestionRow,
  AlignedInsightRow,
  RailQuestionRow,
  RailInsightRow,
  YourQuestions,
  AskSheet,
  ReportSheet,
  ReactionRow,
  CommentRow,
  ReplyComposer,
  JoinSheet,
  EventCodeSheet,
} from "@/components/connect/ConnectExperience";
import { OpportunityCard, ModuleCard, DeadlineChip } from "@/components/connect/att/AttCommunityView";
import { HOME_OPPORTUNITIES, LEARN_MODULES } from "@/components/connect/att/attData";
import { ProgramTile, MeetingCard } from "@/components/connect/mentorship/MentorshipTab";
import { PROGRAM_TILES } from "@/components/connect/mentorship/mentorshipData";
import { ProDashboardView } from "@/components/connect/ProDashboard";
import { AdminDashboardView } from "@/components/connect/AdminDashboard";

// A mock ConnectNav: every in-page navigation call is a no-op, so a pro's
// name, a thread link or Follow deep inside these pieces never tries to
// change the lab's own screen.
const MOCK_NAV = {
  openPro: noop,
  openThread: noop,
  openInsight: noop,
  openBoard: noop,
  openSaved: noop,
  openFollowingFeed: noop,
  noteAsked: noop,
  report: noop,
  isFollowing: () => false,
  toggleFollow: noop,
  share: noop,
  askFollowUp: noop,
};

const THREAD = THREADS[0];
const LONG_THREAD = { ...THREADS[0], title: EDGE.longTitle };
const INSIGHT = INSIGHTS[0];
const LONG_INSIGHT = { ...INSIGHTS[0], body: EDGE.longBody };
const COMMUNITY = COMMUNITIES[0];
const EVENT = EVENTS[0];
const OPPORTUNITY = HOME_OPPORTUNITIES.items[0];
const MODULE = LEARN_MODULES[0];
const PRO_NAME = PROS[0].name;

export function MatchConnectModules() {
  const [qSaved, setQSaved] = useState(false);
  const [qHelpful, setQHelpful] = useState(false);
  const [iSaved, setISaved] = useState(false);
  const [iHelpful, setIHelpful] = useState(false);
  const [oppSaved, setOppSaved] = useState(false);
  const mockCareers = labCatalog().slice(0, 9);

  return (
    <>
      <SubHead>Match</SubHead>

      <Specimen name="MiniExploreMatch" file="src/components/match-lab/MiniExploreMatch.tsx" purpose="The live Match screen: Build hands off to world tabs of careers, the student saves up to three, then ranks and lands on Profile's Top Three." when="The Match tab today.">
        <StateGrid>
          <StateCell label="Default" pad={false} minH={440}>
            <LiveRoute href="/match-grid" height={440} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MatchGrid" file="src/components/match-lab/MatchGrid.tsx" purpose="The dormant six-card grid Match used before Mini Explore replaced it: every career visible at once, a corner select control, a detail modal." when="Not linked anywhere live; kept for comparison.">
        <StateGrid>
          <StateCell label="Default">
            <NotRendered reason="No route mounts this component anymore (unlike MatchLab, which still has /match-lab) -- there is no live page to load, so this stays a stand-in rather than a LiveRoute." see="src/components/match-lab/MatchGrid.tsx" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MatchLab" file="src/components/match-lab/MatchLab.tsx" purpose="The original swipe-deck Match prototype (v3): like/pass gestures, a manage sheet for reordering saves." when="Not linked anywhere live; kept for comparison.">
        <StateGrid>
          <StateCell label="Default" pad={false} minH={440}>
            <LiveRoute href="/match-lab" height={440} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="V2Flow" file="src/components/flow-lab/V2Flow.tsx" purpose="The Flow Lab's own BUILD -> MINI EXPLORE -> SAVED -> RANK -> MY PROFILE walkthrough, replayable and isolated from the real demo." when="Prototyping the Match flow end to end, isolated from the live app.">
        <StateGrid>
          <StateCell label="Default" pad={false} minH={440}>
            <LiveRoute href="/flow-lab" height={440} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LabScreen" file="src/components/flow-lab/shared.tsx" purpose="Match's shared page frame: a title row with a status chip, an optional control row, then whatever fills the rest." when="Every Flow Lab screen (Mini Explore, Saved, Rank, Top 3).">
        <StateGrid min={340}>
          <StateCell label="Default" pad={false} minH={220}>
            <LabScreen title="Mini Explore" status="3 saved" scrollable>
              <p className="px-1 text-[13px]" style={{ color: "var(--muted-foreground)" }}>Screen content goes here.</p>
            </LabScreen>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PrimaryButton / QuietButton" file="src/components/flow-lab/shared.tsx" purpose="The Flow Lab's own solid and quiet button shapes, used for every screen-level action." when="Any Flow Lab screen action.">
        <StateGrid>
          <StateCell label="Primary"><PrimaryButton onClick={noop}>Continue</PrimaryButton></StateCell>
          <StateCell label="Primary disabled"><PrimaryButton onClick={noop} disabled>Continue</PrimaryButton></StateCell>
          <StateCell label="Quiet"><QuietButton onClick={noop}>Cancel</QuietButton></StateCell>
          <StateCell label="Hover / focus" note="Hover or Tab to it to see the state."><PrimaryButton onClick={noop}>Continue</PrimaryButton></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ChipRow / InterestPicker" file="src/components/flow-lab/shared.tsx" purpose="A multi-select chip group with a max; InterestPicker is the same control fixed to the app's worlds." when="Any world/interest picker in the Flow Lab.">
        <StateGrid>
          <StateCell label="ChipRow"><ChipRowDemo /></StateCell>
          <StateCell label="InterestPicker (max 2)"><InterestPickerDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Field / ProfileTabs" file="src/components/flow-lab/shared.tsx" purpose="Field labels a group of controls with a small uppercase heading; ProfileTabs is the static My Profile section switcher used in the lab's own mocks." when="Grouping Flow Lab controls; previewing My Profile's tab row.">
        <StateGrid>
          <StateCell label="Field">
            <Field label="Worlds">
              <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Grouped content</p>
            </Field>
          </StateCell>
          <StateCell label="ProfileTabs"><ProfileTabs /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RevealGrid" file="src/components/flow-lab/shared.tsx" purpose="A wrapping grid that reveals another batch of items as a sentinel row scrolls into view, with the Working chip while it loads." when="Mini Explore's continuous-scroll card grid.">
        <StateGrid min={320}>
          <StateCell label="Default" pad={false} minH={220}>
            <RevealGrid items={mockCareers} resetKey="lab-demo" renderItem={(c) => (
              <div className="truncate rounded-[var(--radius-md)] border p-[8px] text-[12px] font-semibold" style={{ borderColor: "var(--border)", background: "var(--card)" }}>{c.title}</div>
            )} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Match grid states" file="src/components/flow-lab/V2Flow.tsx" purpose="Surface 17: a world with no careers used to render a blank grid. Mini Explore now wraps it in SurfaceState, which also makes loading/error forceable for review even though the prototype has no real fetch." when="A student picks a world with nothing in the catalog yet (real empty); loading/error are the review-only ?state= switch.">
        <StateGrid>
          <StateCell label="Empty world" note="Live: /match-grid?state=empty&surface=17"><ProposedEmpty tier={1} heading="Nothing to match yet" line="This world doesn't have careers loaded yet." cta="Choose another world" /></StateCell>
          <StateCell label="Loading" note="Live: /match-grid?state=loading&surface=17"><ProposedLoading shape="cards" /></StateCell>
          <StateCell label="Error" note="Live: /match-grid?state=error&surface=17"><ProposedError verb="load this world" /></StateCell>
        </StateGrid>
      </Specimen>

      <SubHead>Connect</SubHead>
      <p className="-mt-[var(--space-4)] max-w-[72ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        Every piece below needs the <code>ConnectNav</code> context; a mock with every function a no-op wraps this whole subsection so a pro name, Follow or a thread link never tries to navigate the lab itself. LabCard/CommunityCard/PersonCard/PeopleWelcome and the connect/primitives pieces (Avatar, VerifiedBadge, CompanyChip, Composer, InlineAsk...) are already in Surfaces; use the primitives versions of those, not <code>ConnectExperience.tsx</code>&apos;s own shadow copies of the same pieces.
      </p>

      <ConnectNav.Provider value={MOCK_NAV}>
        <Specimen name="Question card, four layouts" file="src/components/connect/ConnectExperience.tsx" purpose="The same question, in the card (Reddit-style feed row), compact (dense single line), aligned (stat column) and rail (accent type scale) layouts the mockup review compared." when="Card and Compact still exist elsewhere; Aligned and Rail were the two options from the 8 Sept review, Rail is what shipped.">
          <StateGrid min={300}>
            <StateCell label="Card"><QuestionCard thread={THREAD} onOpen={noop} saved={qSaved} onSave={() => setQSaved((s) => !s)} helpful={qHelpful} onHelpful={() => setQHelpful((h) => !h)} /></StateCell>
            <StateCell label="Compact"><CompactQuestionCard thread={THREAD} onOpen={noop} /></StateCell>
            <StateCell label="Aligned"><AlignedQuestionRow thread={THREAD} onOpen={noop} saved={qSaved} onSave={() => setQSaved((s) => !s)} helpful={qHelpful} onHelpful={() => setQHelpful((h) => !h)} /></StateCell>
            <StateCell label="Rail"><RailQuestionRow thread={THREAD} onOpen={noop} saved={qSaved} onSave={() => setQSaved((s) => !s)} helpful={qHelpful} onHelpful={() => setQHelpful((h) => !h)} /></StateCell>
            <StateCell label="Long title" note="Wraps; no truncation on the card/rail title."><QuestionCard thread={LONG_THREAD} onOpen={noop} saved={false} onSave={noop} helpful={false} onHelpful={noop} /></StateCell>
            <StateCell label="Hover / focus" note="Hover or Tab to it to see the row's hover tint and chevron."><RailQuestionRow thread={THREAD} onOpen={noop} saved={false} onSave={noop} helpful={false} onHelpful={noop} /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="Post card, four layouts" file="src/components/connect/ConnectExperience.tsx" purpose="A professional's post in the same four layouts as the question card, so the two feed item types stay visually consistent." when="Same as the question card variants above.">
          <StateGrid min={300}>
            <StateCell label="Card"><InsightCard insight={INSIGHT} onOpen={noop} saved={iSaved} onSave={() => setISaved((s) => !s)} helpful={iHelpful} onHelpful={() => setIHelpful((h) => !h)} /></StateCell>
            <StateCell label="Compact"><CompactInsightCard insight={INSIGHT} onOpen={noop} /></StateCell>
            <StateCell label="Aligned"><AlignedInsightRow insight={INSIGHT} onOpen={noop} saved={iSaved} onSave={() => setISaved((s) => !s)} helpful={iHelpful} onHelpful={() => setIHelpful((h) => !h)} /></StateCell>
            <StateCell label="Rail"><RailInsightRow insight={INSIGHT} onOpen={noop} saved={iSaved} onSave={() => setISaved((s) => !s)} helpful={iHelpful} onHelpful={() => setIHelpful((h) => !h)} /></StateCell>
            <StateCell label="Long body" note="Clamps to two lines on the card layout."><InsightCard insight={LONG_INSIGHT} onOpen={noop} saved={false} onSave={noop} helpful={false} onHelpful={noop} /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="HelpfulPill / StatusChip" file="src/components/connect/ConnectExperience.tsx" purpose="HelpfulPill is the thumbs-up count toggle every card/row uses; StatusChip shows a question's awaiting/routed/answered/resolved state." when="Any question or post row.">
          <StateGrid>
            <StateCell label="Helpful, 0"><HelpfulPill onClick={noop} pressed={false} count={0} /></StateCell>
            <StateCell label="Helpful, off"><HelpfulPill onClick={noop} pressed={false} count={12} /></StateCell>
            <StateCell label="Helpful, on"><HelpfulPill onClick={noop} pressed count={13} /></StateCell>
            <StateCell label="Helpful, large count" note="Fixed 27 Sept 2026: compacts to 1.2K now (formatCount), with the exact 1,240 in the accessible label."><HelpfulPill onClick={noop} pressed={false} count={1240} /></StateCell>
            <StateCell label="Status: awaiting"><StatusChip state="awaiting" /></StateCell>
            <StateCell label="Status: routed"><StatusChip state="routed" /></StateCell>
            <StateCell label="Status: answered"><StatusChip state="answered" /></StateCell>
            <StateCell label="Status: resolved"><StatusChip state="resolved" /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="ReplyComposer / CommentRow / ReactionRow" file="src/components/connect/ConnectExperience.tsx" purpose="The foot-of-thread reply box, one comment (pro or student), and the like + emoji reaction row under a comment." when="Any question or post thread.">
          <StateGrid min={280}>
            <StateCell label="Composer, empty"><ReplyComposer onPost={noop} /></StateCell>
            <StateCell label="Comment, pro"><CommentRow id="c-pro" name={PRO_NAME} chip="Professional" chipTone="pro" body="Start with one question you can answer in a sentence; it's easier for someone to jump in." postedAgo="2h" likes={9} liked={false} onLike={noop} /></StateCell>
            <StateCell label="Comment, student"><CommentRow id="c-student" name="Jordan" chip="Junior" chipTone="student" body="This is exactly what I needed, thank you!" postedAgo="40m" likes={3} liked onLike={noop} /></StateCell>
            <StateCell label="Comment, collapsed"><CommentRow id="c-collapsed" name="Jordan" chip="Junior" chipTone="student" body="Collapsed body, hidden." postedAgo="1d" likes={0} liked={false} onLike={noop} collapsed onToggleCollapse={noop} /></StateCell>
            <StateCell label="Reaction row"><ReactionRow id="r-1" likes={5} liked={false} onLike={noop} /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="YourQuestions" file="src/components/connect/ConnectExperience.tsx" purpose="The Locker panel's list of questions the student asked, each showing waiting/answered, plus the way into Saved." when="Profile > Locker > Your questions.">
          <StateGrid min={300}>
            <StateCell label="No locally-asked questions" note="ALL_THREADS seeds a couple of Jordan's own threads regardless of `asked`, so this never renders fully empty; that's the real component's own data, not a lab simplification.">
              <YourQuestions asked={[]} onOpenThread={noop} savedCount={2} onDeleteAsked={noop} />
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="ConnectNotFound" file="src/components/connect/ConnectExperience.tsx" purpose="The one built 404: a deep link to a thread, post or pro that no longer resolves." when="A saved/shared Connect link whose target was removed.">
          <StateGrid>
            <StateCell label="Default"><ConnectNotFound onBack={noop} /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="AskSheet / ReportSheet / JoinSheet / EventCodeSheet" file="src/components/connect/ConnectExperience.tsx" purpose="Connect's four bottom/center sheets: ask a question, report content, join a community's ground rules, and redeem an event code." when="Ask (every board), Report (any post/comment overflow), Join (a community's first visit), Event code (a private event board).">
          <StateGrid min={260}>
            <StateCell label="Ask a question" pad={false} minH={140} note="Real, typed-in states not forceable by props: under 12 characters shows a hint, a phone number or email blocks posting with a warning, and a title matching an existing answered thread surfaces a 'maybe this already has an answer' suggestion. Type into the field to see them."><Reveal label="Open AskSheet" height={520}><AskSheet onClose={noop} onPost={noop} onOpenThread={noop} /></Reveal></StateCell>
            <StateCell label="Report" pad={false} minH={140}><Reveal label="Open ReportSheet" height={420}><ReportSheet onClose={noop} onSubmit={noop} /></Reveal></StateCell>
            <StateCell label="Join community" pad={false} minH={140}><Reveal label="Open JoinSheet" height={480}><JoinSheet community={COMMUNITY} onClose={noop} onJoin={noop} /></Reveal></StateCell>
            <StateCell label="Event code" pad={false} minH={140}><Reveal label="Open EventCodeSheet" height={420}><EventCodeSheet event={EVENT} onClose={noop} onRedeemed={noop} /></Reveal></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="Connect feed states" file="src/components/connect/ConnectExperience.tsx" purpose="Surfaces 40/41: a board's Questions and Posts tabs, wrapped in SurfaceState 27 Sept 2026 -- loading/slow/error/offline are now real, reviewable states (the fixed-data pattern: status stays ready in the prototype, ?state= forces the rest for review) rather than merely possible." when="A board's feed while data is loading, after a failed load, or before its first question/post.">
          <StateGrid>
            <StateCell label="Questions: loading" note="Force live: /connect?board=tech-engineering&state=loading&surface=40"><SurfaceStateView id={40} state="loading" /></StateCell>
            <StateCell label="Questions: error" note="Force live: /connect?board=tech-engineering&state=error&surface=40"><SurfaceStateView id={40} state="error" onRetry={noop} /></StateCell>
            <StateCell label="Questions: empty" note="Real code: BoardView's threads.length === 0 branch. Every seeded community already has questions, so today's data can't reach it on its own -- force live: /connect?board=tech-engineering&state=empty&surface=40"><SurfaceStateView id={40} state="empty" onEmptyAction={noop} /></StateCell>
            <StateCell label="Posts: loading" note="Force live: /connect?board=tech-engineering&filter=insights&state=loading&surface=41"><SurfaceStateView id={41} state="loading" /></StateCell>
            <StateCell label="Posts: error" note="Force live: /connect?board=tech-engineering&filter=insights&state=error&surface=41"><SurfaceStateView id={41} state="error" onRetry={noop} /></StateCell>
            <StateCell label="Posts: empty" note="Force live: /connect?board=tech-engineering&filter=insights&state=empty&surface=41"><SurfaceStateView id={41} state="empty" /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="Thread & events" file="src/components/connect/ConnectExperience.tsx" purpose="A thread with no answers yet, and an events search with no matches." when="A freshly-asked question before anyone answers; an events search that matches nothing.">
          <StateGrid>
            <StateCell label="No answers yet" note="Real code: ThreadView's thread.responses.length === 0 branch. Every seeded thread already has an answer, so today's data can't force it live."><ProposedEmpty tier={3} line="No answer yet. Sent to verified pros; usually answered within a couple of days." /></StateCell>
            <StateCell label="No events match search" note="Live: /connect?tab=events, then search for something with no matches (fixed 27 Sept 2026 -- this used to render a blank tab)."><ProposedEmpty tier={5} query="robotics club" line="Try a shorter word, or clear the search." cta="Clear search" /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="AttCommunityView" file="src/components/connect/att/AttCommunityView.tsx" purpose="The AT&T Connected Learning Centers community: student/volunteer/enterprise views over opportunities, learn modules, a poll and a pulse." when="A community with its own dedicated experience layered over the generic Connect board.">
          <StateGrid>
            <StateCell label="Default" pad={false} minH={440}>
              <LiveRoute href="/connect?board=att-connected-learning-centers" height={440} />
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="OpportunityCard / ModuleCard / DeadlineChip" file="src/components/connect/att/AttCommunityView.tsx" purpose="An opportunity (internship/program/event) card, a Learn module card with progress, and the short 'Closes ...' date chip both use." when="AttCommunityView's Home and Learn tabs.">
          <StateGrid>
            <StateCell label="Opportunity, default"><OpportunityCard item={OPPORTUNITY} saved={oppSaved} onSave={() => setOppSaved((s) => !s)} onOpen={noop} /></StateCell>
            <StateCell label="Opportunity, saved"><OpportunityCard item={OPPORTUNITY} saved onSave={noop} onOpen={noop} /></StateCell>
            <StateCell label="Module, in progress"><ModuleCard m={MODULE} pct={35} onOpen={noop} /></StateCell>
            <StateCell label="Module, done"><ModuleCard m={MODULE} pct={100} onOpen={noop} /></StateCell>
            <StateCell label="Deadline chip"><DeadlineChip month="Jan" day={31} /></StateCell>
            <StateCell label="Deadline chip, opens soon"><DeadlineChip month="Mar" day={1} soon /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="PollCard" file="src/components/connect/att/AttCommunityView.tsx" purpose="A biweekly poll on the AT&T Home tab: vote, see results, and a next-module suggestion." when="AttCommunityView's Home tab pulse.">
          <StateGrid>
            <StateCell label="Default" pad={false} minH={440} note="Same live page as AttCommunityView above (Home tab, scroll to the pulse); LiveRoute's iframe is inert, so voting here never fires the real flyXp() Dream Score award.">
              <LiveRoute href="/connect?board=att-connected-learning-centers" height={440} />
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="MentorshipTab" file="src/components/connect/mentorship/MentorshipTab.tsx" purpose="1:1 and group mentorship: program tiles, a chat dock, meeting requests, a year plan, and separate mentor/enterprise views." when="Connect's Mentorship tab.">
          <StateGrid>
            <StateCell label="Default" pad={false} minH={440}>
              <LiveRoute href="/connect?tab=mentorship" height={440} />
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="ProgramTile / MeetingCard" file="src/components/connect/mentorship/MentorshipTab.tsx" purpose="A mentorship program's cover tile (yours/enrolling/coming soon), and a meeting request card with accept/decline." when="Mentorship's program picker; the chat dock's scheduling card.">
          <StateGrid min={260}>
            {PROGRAM_TILES.map((t) => (
              <StateCell key={t.id} label={`Tile: ${t.state}`}><ProgramTile tile={t} onOpen={noop} /></StateCell>
            ))}
            <StateCell label="Meeting, pending"><MeetingCard m={{ title: "Explore Careers check-in", agenda: "How I got into merchandising, and two resume bullets.", when: "Tue, Oct 28 · 4:00 PM", where: "Microsoft Teams", status: "pending" }} mine={false} onDecide={noop} onToast={noop} /></StateCell>
            <StateCell label="Meeting, accepted"><MeetingCard m={{ title: "Explore Careers check-in", agenda: "How I got into merchandising, and two resume bullets.", when: "Tue, Oct 28 · 4:00 PM", where: "Microsoft Teams", status: "accepted" }} mine onDecide={noop} onToast={noop} /></StateCell>
            <StateCell label="Meeting, declined"><MeetingCard m={{ title: "Explore Careers check-in", agenda: "How I got into merchandising, and two resume bullets.", when: "Tue, Oct 28 · 4:00 PM", where: "Microsoft Teams", status: "declined" }} mine={false} onDecide={noop} onToast={noop} /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="ChatDock" file="src/components/connect/mentorship/MentorshipTab.tsx" purpose="The mentor/mentee message dock: minimised chip, open panel, full screen." when="Any mentorship program, once matched.">
          <StateGrid>
            <StateCell label="Default" pad={false} minH={440} note="Same live page as MentorshipTab above; the dock opens automatically once matched.">
              <LiveRoute href="/connect?tab=mentorship" height={440} />
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="ProDashboardView" file="src/components/connect/ProDashboard.tsx" purpose="A professional's own Connect dashboard: profile, Ask Me & Posts, and an activity chart." when="A verified professional viewing their own Connect presence.">
          <StateGrid min={480}>
            <StateCell label="Default" minH={480}><ProDashboardView onBack={noop} /></StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="AdminDashboardView" file="src/components/connect/AdminDashboard.tsx" purpose="Dreamari staff's sitewide Connect view: overview, moderation queue, people and features." when="Internal moderation and oversight, not student- or pro-facing.">
          <StateGrid min={480}>
            <StateCell label="Default" minH={480}><AdminDashboardView onBack={noop} /></StateCell>
          </StateGrid>
        </Specimen>
      </ConnectNav.Provider>
    </>
  );
}

function ChipRowDemo() {
  const [value, setValue] = useState<string[]>(["Save"]);
  return <ChipRow ariaLabel="Demo options" options={[{ key: "Save", label: "Save" }, { key: "Rank", label: "Rank" }, { key: "Share", label: "Share" }]} value={value} max={2} onChange={setValue} />;
}

function InterestPickerDemo() {
  const [value, setValue] = useState<string[]>([]);
  return <InterestPicker value={value} max={2} onChange={setValue} />;
}
