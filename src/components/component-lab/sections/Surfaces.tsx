"use client";

// DEMO-ONLY: Component Lab section, "Surfaces and cards". Every card-shaped
// component in the app, states forced through props, mock data pulled from
// each feature's own data file. See docs/handoff/COMPONENT_INVENTORY.md
// lines 198-218 for the source table this section renders.

import { useState } from "react";
import { Users } from "lucide-react";
import { Section, SubHead, Specimen, StateGrid, StateCell, ProposedLoading, ProposedEmpty, ProposedError, LiveRoute, EDGE, noop } from "../kit";

import { PosterCard, RankedPosterCard, OpenCue } from "@/components/app/PosterCard";
import { HOME_PICKS } from "@/components/app/catalog";
import { LabCard } from "@/components/flow-lab/shared";
import { labCatalog } from "@/components/flow-lab/lab";
import { NextStepBanner } from "@/components/app/NextStepBanner";
import { HoverBeam } from "@/components/app/HoverBeam";
import { CardProgressiveBlur } from "@/components/app/cardChrome";

import { COLLEGES } from "@/components/colleges/data";
import { CollegeCard, SchoolCard, CollegePicture, MarkBadge, type CardBadge } from "@/components/colleges/shared";
import { CollegePlaceholder, COLLEGE_ART_VARIANTS } from "@/components/colleges/CollegePlaceholder";

import { COMMUNITIES, PROS } from "@/components/connect/data";
import { CommunityCard } from "@/components/connect/CommunityCard";
import { PersonCard } from "@/components/connect/PeopleTab";
import {
  ConnectNav,
  Avatar as ConnectAvatar,
  ProAvatar,
  VerifiedBadge,
  CompanyChip,
  CompanyMark,
  LetterMark,
  Card as ConnectCard,
  SectionHead,
  SectionSurface,
  InlineAsk,
  LocalQuestionCard,
  Composer,
} from "@/components/connect/primitives";
import { ProfileCard, Panel as ConnectPanel, PanelRow, SignalRow, PeopleToFollow, NewFromFollowing } from "@/components/connect/ProProfile";

import { OverviewCard } from "@/components/counselor/v2/overviewShared";
import { DonutCard } from "@/components/counselor/v2/Overview";
import { MetricTile } from "@/components/connect/viz";
import { DrillTile } from "@/components/counselor/v2/Drill";

import { GlassCard, ChipGrid, QuestionHeading, StepFooter, InkText, DreamySprite } from "@/components/build/ui";
import { MatchCard } from "@/components/flow/match/MatchCard";
import type { MatchCardContent } from "@/components/flow/match/types";

import { CTABlock } from "@/components/marketing/FinalCTAs";
import { Grad, Panel as IllustrationPanel } from "@/components/marketing/SchoolsIllustrations";
import { DOMark } from "@/components/marketing/DreamOpportunity";
import { PartnerLogoGrid } from "@/components/marketing/PartnerTicker";

import { Avatar as CounselorAvatar, StudentLink } from "@/components/counselor/chips";

// A mock, no-op ConnectNav so People/profile pieces that read the context
// (a name that opens a profile, "report", "share"...) render without a real
// Connect tree around them.
const MOCK_CONNECT_NAV = {
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

const career = HOME_PICKS[0];
const longCareer = { ...career, title: EDGE.longTitle };
const brokenCareer = { ...career, photo: EDGE.brokenImage };

const labCareer = labCatalog()[0];
const labCareerBroken = { ...labCareer, photo: EDGE.brokenImage };

// Two colleges from the real catalog; a third clone stands in for a broken
// photo and mark (photoStatus: "rejected" makes collegeImage/collegeMark
// return null the same way a failed review would in production, without
// inventing fake data).
const college = COLLEGES[0];
const college2 = COLLEGES[1];
const collegeNoPhoto = { ...college, name: EDGE.longName, photoStatus: "rejected" as const };
const badges: CardBadge[] = [{ label: "Target", tone: "target" }];

const community = COMMUNITIES[0];
const communityLongName = { ...community, name: EDGE.longTitle };
const communityBroken = { ...community, photo: EDGE.brokenImage };
const communityNoCompanies = { ...community, centers: undefined, professionalsFrom: [] };

const pro = PROS[0];
const pro2 = PROS[1];
const proLongName = { ...pro, name: EDGE.longName };

// A minimal, self-contained Composer so this Specimen doesn't need a parent
// form's state.
function ComposerDemo() {
  const [value, setValue] = useState("");
  return <Composer id="lab-composer-demo" value={value} onChange={setValue} onSubmit={noop} submitLabel="Post" placeholder="Write a reply…" />;
}

const matchCard: MatchCardContent = {
  key: "classes",
  label: "AP Computer Science",
  emoji: "\u{1F4BB}",
  gradient: ["#0b0d1a", "#2f6bf2"] as const,
  body: "You lit up talking about building things that other people actually use.",
};

export function SurfacesSection() {
  return (
    <Section
      id="surfaces"
      title="Surfaces and cards"
      intro="Every card-shaped component in the app: career posters, college and community cards, Connect's people and profile pieces, counselor overview tiles, and the marketing-only blocks. Mock data comes from each feature's own catalog or data file, not invented here."
    >
      <Specimen name="PosterCard, RankedPosterCard, OpenCue" file="src/components/app/PosterCard.tsx" purpose="The career poster: the app's one tile for a career, everywhere one shows (Explore, Home rails, world grids, search)." when="Any grid or rail of careers.">
        <StateGrid>
          <StateCell label="Default"><PosterCard career={career} onClick={noop} /></StateCell>
          <StateCell label="Hover / focus" note="Hover or Tab to it: OpenCue's centered chevron and dim.">
            <PosterCard career={career} onClick={noop} />
          </StateCell>
          <StateCell label="Pressed" note="Click and hold (mousedown): the shared .dm-tap:active rule (globals.css) drops the hover lift back to translateY(0) with no shadow.">
            <PosterCard career={career} onClick={noop} />
          </StateCell>
          <StateCell label="Salary chip"><PosterCard career={{ ...career, salary: "$96K" }} onClick={noop} /></StateCell>
          <StateCell label="Long title" note="Two fixed sizes only: 24px, or 19px when the longest word or a third line would overflow."><PosterCard career={longCareer} onClick={noop} /></StateCell>
          <StateCell label="Image failure" note="Built-in fallback: a world-tinted gradient with a muted ImageOff icon."><PosterCard career={brokenCareer} onClick={noop} /></StateCell>
          <StateCell label="Ranked (Trending rail)"><RankedPosterCard career={career} rank={1} onClick={noop} /></StateCell>
          <StateCell label="OpenCue, alone" note="Hover or Tab to it: the dim-and-chevron overlay PosterCard shows on hover, isolated here." pad={false} minH={140}>
            <div tabIndex={0} className="poster-card relative h-[140px] w-full overflow-hidden rounded-[var(--radius-lg)] outline-none" style={{ background: "linear-gradient(135deg, #2f6bf2 0%, #0e0c20 100%)" }}>
              <OpenCue />
            </div>
          </StateCell>
          <StateCell label="Loading" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL."><ProposedLoading shape="cards" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="LabCard" file="src/components/flow-lab/shared.tsx" purpose="Match Lab's career card: a poster with a save, pick, or rank control layered on top." when="Match Lab's swipe/save/rank screens only.">
        <StateGrid>
          <StateCell label="Save, unselected"><LabCard career={labCareer} control="save" selected={false} onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Save, saved"><LabCard career={labCareer} control="save" selected onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Save, nudge pulse" note="A soft one-shot ripple on the Save pill until the student's first save."><LabCard career={labCareer} control="save" selected={false} nudge onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Pick, selected"><LabCard career={labCareer} control="pick" selected rank={1} onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Rank #2"><LabCard career={labCareer} control="rank" selected rank={2} onOpen={noop} /></StateCell>
          <StateCell label="With reason chip"><LabCard career={labCareer} control="save" selected={false} reason="Matches your Top 3" onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Long title"><LabCard career={{ ...labCareer, title: EDGE.longTitle }} control="save" selected={false} onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Image failure"><LabCard career={labCareerBroken} control="save" selected={false} onToggle={noop} onOpen={noop} /></StateCell>
          <StateCell label="Focus" kind="built" note="Tab to it: the app-wide :focus-visible ring in globals.css now covers any [tabindex] element, this card included -- no per-component style needed.">
            <LabCard career={labCareer} control="save" selected={false} onToggle={noop} onOpen={noop} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="NextStepBanner" file="src/components/app/NextStepBanner.tsx" purpose="The compact 'what now' bridge between features: one sentence, one button, a slow glow." when="Any hand-off from one feature to the next (Top Three to Play, Play to Explore).">
        <StateGrid min={280}>
          <StateCell label="Quiet" note="Rendered without storageKey: the dismiss X won't write to localStorage here."><NextStepBanner text="Ready to see your Top 3 careers?" ctaLabel="Go to Play" href="#" /></StateCell>
          <StateCell label="Priority"><NextStepBanner eyebrow="Do this next" text="Finish your Top 3 to unlock Match." ctaLabel="Continue" href="#" emphasis="priority" /></StateCell>
          <StateCell label="Calm" note="No wash or sheen, ring only."><NextStepBanner text="Your Dream Score updated." ctaLabel="View" href="#" calm /></StateCell>
          <StateCell label="Long text"><NextStepBanner text={EDGE.longBody} ctaLabel="Continue" href="#" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="HoverBeam" file="src/components/app/HoverBeam.tsx" purpose="The site-wide card hover ring (BorderBeam), the default hover treatment for card surfaces." when="Wrap any card that should light up on hover or keyboard focus.">
        <StateGrid>
          <StateCell label="Hover / focus" note="Hover or Tab to it to see the ring.">
            <HoverBeam><div className="flex h-[100px] items-center justify-center rounded-[var(--radius-md)] border text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>Card content</div></HoverBeam>
          </StateCell>
          <StateCell label="Forced active" note="`active` overrides hover/focus, for a card that tracks its own open state.">
            <HoverBeam active><div className="flex h-[100px] items-center justify-center rounded-[var(--radius-md)] border text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>Card content</div></HoverBeam>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CardProgressiveBlur, scrims" file="src/components/app/cardChrome.tsx" purpose="The shared photo-card chrome: a progressive backdrop-blur ramp plus scrim gradients, so every full-bleed photo card fades its image the same way." when="Any card whose text sits over a full-bleed photo.">
        <StateGrid>
          <StateCell label="Up (bottom-anchored text)" pad={false} minH={160}>
            <div className="relative h-[160px] w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #2f6bf2 0%, #7c5cff 60%, #0e0c20 100%)" }}>
              <CardProgressiveBlur direction="up" size="60%" />
            </div>
          </StateCell>
          <StateCell label="Left (photo/text split)" pad={false} minH={160}>
            <div className="relative h-[160px] w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #2f6bf2 0%, #7c5cff 60%, #0e0c20 100%)" }}>
              <CardProgressiveBlur direction="left" size="60%" />
            </div>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CollegeCard, SchoolCard" file="src/components/colleges/shared.tsx" purpose="College Explore's two card sizes: a poster-style grid card, and the fuller school card with a programme, fit chips, and a Why this school? disclosure." when="CollegeCard for compact grids; SchoolCard for shelves that carry a programme match.">
        <StateGrid>
          <StateCell label="CollegeCard, default"><CollegeCard c={college} saved={false} onSave={noop} compared={false} /></StateCell>
          <StateCell label="CollegeCard, hover / focus" note="Hover or Tab to it: shares PosterCard's poster-card hover/focus-visible rules (globals.css) plus dm-tap's outline.">
            <CollegeCard c={college} saved={false} onSave={noop} compared={false} />
          </StateCell>
          <StateCell label="CollegeCard, pressed" note="Click and hold: dm-tap:active drops the lift, no shadow.">
            <CollegeCard c={college} saved={false} onSave={noop} compared={false} />
          </StateCell>
          <StateCell label="CollegeCard, saved + compared"><CollegeCard c={college} saved onSave={noop} compared onCompare={noop} /></StateCell>
          <StateCell label="CollegeCard, badges + stats"><CollegeCard c={college2} saved={false} onSave={noop} compared={false} badges={badges} stats subline="Computer Science" /></StateCell>
          <StateCell label="CollegeCard, image fallback" note="Hard-coded dark colours; breaks in light mode (known)."><CollegeCard c={collegeNoPhoto} saved={false} onSave={noop} compared={false} /></StateCell>
          <StateCell label="SchoolCard, default"><SchoolCard c={college} saved={false} onSave={noop} compared={false} program="Computer Science" fit={{ label: "Target", tone: "target" }} why="Strong finish rate and a direct path into the major you picked." /></StateCell>
          <StateCell label="SchoolCard, saved + compared" note="Hard-coded dark colours; breaks in light mode (known)."><SchoolCard c={college2} saved onSave={noop} compared onCompare={noop} /></StateCell>
          <StateCell label="Loading" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL."><ProposedLoading shape="cards" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CollegePicture, MarkBadge, CollegePlaceholder" file="src/components/colleges/shared.tsx, src/components/colleges/CollegePlaceholder.tsx" purpose="The college photo and seal/monogram badge, and the placeholder art both fall back to when there's no photo." when="Any college-facing surface that needs a cover photo or a mark.">
        <StateGrid>
          <StateCell label="CollegePicture" pad={false} minH={160}><div className="relative h-[160px] w-full"><CollegePicture c={college} sizes="320px" /></div></StateCell>
          <StateCell label="CollegePicture, fallback" pad={false} minH={160} note="Hard-coded dark colours; breaks in light mode (known)."><div className="relative h-[160px] w-full"><CollegePicture c={collegeNoPhoto} sizes="320px" /></div></StateCell>
          <StateCell label="MarkBadge"><MarkBadge c={college} /></StateCell>
          <StateCell label="MarkBadge, fallback" note="Falls back to an initial monogram."><MarkBadge c={collegeNoPhoto} /></StateCell>
          {COLLEGE_ART_VARIANTS.map((variant) => (
            <StateCell key={variant} label={`Placeholder: ${variant}`} pad={false} minH={160}>
              <div className="relative h-[160px] w-full"><CollegePlaceholder seed={college.slug} variant={variant} /></div>
            </StateCell>
          ))}
        </StateGrid>
      </Specimen>

      <Specimen name="CommunityCard" file="src/components/connect/CommunityCard.tsx" purpose="A Connect community: banner art, three stat tiles, the companies its pros come from, one action." when="Connect's community shelves and grids.">
        <StateGrid>
          <StateCell label="Not joined" note="Hard-coded dark colours; breaks in light mode (known)."><CommunityCard community={community} joined={false} onOpen={noop} onJoin={noop} /></StateCell>
          <StateCell label="Hover / focus" note="Hover or Tab to it: dm-tap's lift plus the whole-card tap target scaling in on hover.">
            <CommunityCard community={community} joined={false} onOpen={noop} onJoin={noop} />
          </StateCell>
          <StateCell label="Joined"><CommunityCard community={community} joined onOpen={noop} onJoin={noop} /></StateCell>
          <StateCell label="Featured"><CommunityCard community={community} joined={false} onOpen={noop} onJoin={noop} featured /></StateCell>
          <StateCell label="Compact row"><CommunityCard community={community} joined onOpen={noop} onJoin={noop} compact /></StateCell>
          <StateCell label="Long name"><CommunityCard community={communityLongName} joined={false} onOpen={noop} onJoin={noop} /></StateCell>
          <StateCell label="Sparse data (0 companies)" note="professionalsFrom: [] and no centers: the third stat tile falls back to a bare 0 Companies, and the marks row renders nothing (no built empty treatment for the row itself).">
            <CommunityCard community={communityNoCompanies} joined={false} onOpen={noop} onJoin={noop} />
          </StateCell>
          <StateCell label="Image failure" note="No fallback art built for a failed cover; the scrim and stats still show, but the banner goes flat black (known gap)."><CommunityCard community={communityBroken} joined={false} onOpen={noop} onJoin={noop} /></StateCell>
          <StateCell label="Loading" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL."><ProposedLoading shape="cards" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PersonCard, PeopleWelcome" file="src/components/connect/PeopleTab.tsx" purpose="A professional's card on the People tab, and the tab's one-time welcome banner." when="Connect's People to Follow / People tab.">
        <ConnectNav.Provider value={MOCK_CONNECT_NAV}>
          <StateGrid>
            <StateCell label="Not following"><PersonCard pro={pro} following={false} onFollow={noop} /></StateCell>
            <StateCell label="Hover / focus" note="Hover or Tab to it: HoverBeam's ring plus dm-tap's own lift on the inner card.">
              <PersonCard pro={pro} following={false} onFollow={noop} />
            </StateCell>
            <StateCell label="Following"><PersonCard pro={pro} following onFollow={noop} /></StateCell>
            <StateCell label="With badge + quote"><PersonCard pro={pro2} following={false} onFollow={noop} badge="New this week" quote="Ask me about internships." /></StateCell>
            <StateCell label="Long name" note="Name truncates (line-clamp on the name span); role/org lines truncate too."><PersonCard pro={proLongName} following={false} onFollow={noop} /></StateCell>
            <StateCell label="PeopleWelcome, first use" kind="built" note="Live via LiveRoute's inert iframe instead of mounting inline: `inert` blocks every click, so the dismiss action that writes the sessionStorage seen-flag can never actually fire here -- it's just seen, never triggered."><LiveRoute href="/connect?tab=people" device="mobile" height={480} /></StateCell>
          </StateGrid>
        </ConnectNav.Provider>
      </Specimen>

      <Specimen name="Card, SectionHead, SectionSurface, InlineAsk, LocalQuestionCard, Composer" file="src/components/connect/primitives.tsx" purpose="Connect's shared frame: the frosted panel, section headings, a grounded surface, the ask-a-question composer, and a just-posted question's optimistic card." when="Any Connect feed, board, or profile panel.">
        <StateGrid>
          <StateCell label="Card"><ConnectCard><SectionHead>A section</SectionHead><p className="mt-2 text-[13px]">Frosted glass panel content.</p></ConnectCard></StateCell>
          <StateCell label="SectionSurface"><SectionSurface><SectionHead>A grounded surface</SectionHead></SectionSurface></StateCell>
          <StateCell label="InlineAsk, collapsed"><InlineAsk joined onPost={noop} /></StateCell>
          <StateCell label="InlineAsk, open" note="Type a phone number or email to see the contact-info warning."><InlineAsk joined onPost={noop} defaultOpen /></StateCell>
          <StateCell label="LocalQuestionCard"><LocalQuestionCard title="How do I know if computer science is right for me?" /></StateCell>
          <StateCell label="Composer"><ComposerDemo /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Avatar, ProAvatar, VerifiedBadge, CompanyChip, CompanyMark, LetterMark" file="src/components/connect/primitives.tsx" purpose="Connect's identity pieces: a student or pro's face, the verified checkmark, and a company's logo in three treatments." when="Anywhere a person or company is named in Connect.">
        <ConnectNav.Provider value={MOCK_CONNECT_NAV}>
          <StateGrid>
            <StateCell label="Avatar"><ConnectAvatar name="Jordan Rivera" size={48} /></StateCell>
            <StateCell label="ProAvatar (opens profile)"><ProAvatar proId={pro.id} name={pro.name} size={48} /></StateCell>
            <StateCell label="VerifiedBadge"><VerifiedBadge size={24} /></StateCell>
            <StateCell label="CompanyChip, photo tone"><CompanyChip name="Amazon" tone="photo" /></StateCell>
            <StateCell label="CompanyChip, surface tone"><CompanyChip name="Google" tone="surface" /></StateCell>
            <StateCell label="CompanyChip, frost tone"><CompanyChip name="Microsoft" tone="frost" /></StateCell>
            <StateCell label="CompanyMark"><CompanyMark name="JPMorgan Chase" ink="var(--foreground)" /></StateCell>
            <StateCell label="LetterMark"><span className="flex h-[40px] items-center rounded-[6px] px-2" style={{ background: "#0e0c20" }}><LetterMark name="AT&T" letterHeight={20} /></span></StateCell>
          </StateGrid>
        </ConnectNav.Provider>
      </Specimen>

      <Specimen name="ProfileCard, Panel, PanelRow, SignalRow, PeopleToFollow, NewFromFollowing" file="src/components/connect/ProProfile.tsx" purpose="A professional's profile: card sections, a titled panel, a clickable row, the views/likes/saves signal line, and the two 'who to follow next' shelves." when="A pro's profile page and the People tab's discovery shelves.">
        <ConnectNav.Provider value={MOCK_CONNECT_NAV}>
          <StateGrid>
            <StateCell label="ProfileCard"><ProfileCard id="about" title="About" first><p className="text-[13px]">{pro.story}</p></ProfileCard></StateCell>
            <StateCell label="Panel"><ConnectPanel id="ask" title="Ask Me Anything"><p className="text-[13px]">Panel content.</p></ConnectPanel></StateCell>
            <StateCell label="PanelRow" note="Hover or Tab to it: dm-quiet's built hover/focus-visible."><ul><PanelRow onClick={noop} label="Open thread"><p className="text-[13px] font-semibold">How did you break into tech?</p></PanelRow></ul></StateCell>
            <StateCell label="SignalRow"><SignalRow views={12400} likes={860} saves={210} comments={34} accent="var(--primary)" /></StateCell>
            <StateCell label="SignalRow, all zero"><SignalRow views={0} likes={0} saves={0} comments={0} accent="var(--primary)" /></StateCell>
            <StateCell label="SignalRow, singular" note="formatCount doesn't inflect the label: 1 Views / 1 Likes read the same as many (known copy gap, not fixed here).">
              <SignalRow views={1} likes={1} saves={1} comments={1} accent="var(--primary)" />
            </StateCell>
            <StateCell label="PeopleToFollow"><PeopleToFollow follows={{}} onFollow={noop} limit={3} /></StateCell>
            <StateCell label="NewFromFollowing, empty" note="Renders null with nothing followed; this cell is intentionally empty."><NewFromFollowing follows={{}} /></StateCell>
            <StateCell label="NewFromFollowing"><NewFromFollowing follows={{ [pro.id]: true, [pro2.id]: true }} /></StateCell>
          </StateGrid>
        </ConnectNav.Provider>
      </Specimen>

      <Specimen name="OverviewCard, DonutCard, MetricTile, DrillTile" file="src/components/counselor/v2/overviewShared.tsx, src/components/counselor/v2/Overview.tsx, src/components/connect/viz.tsx, src/components/counselor/v2/Drill.tsx" purpose="Counselor Overview's card shells: a plain metric card, a donut breakdown, one metric tile, and a drillable tile with a hover arrow." when="Counselor Dashboard v2's role Overview screens.">
        <StateGrid>
          <StateCell label="OverviewCard, hero" note="Hero glow.">
            <OverviewCard title="On-track students" hero tint="var(--primary)"><p className="text-[28px] font-extrabold">86%</p></OverviewCard>
          </StateCell>
          <StateCell label="OverviewCard, hover / focus" note="Hover or Tab to it: HoverBeam's ring wraps every card, not just hero ones.">
            <OverviewCard title="On-track students"><p className="text-[28px] font-extrabold">86%</p></OverviewCard>
          </StateCell>
          <StateCell label="DonutCard">
            <DonutCard title="Postsecondary plans" centerPct={62} centerLabel="4-year" rows={[{ label: "4-year", value: 62, color: "var(--primary)" }, { label: "2-year", value: 24, color: "#7dd3fc" }, { label: "Workforce", value: 14, color: "#f5c04e" }]} />
          </StateCell>
          <StateCell label="MetricTile"><MetricTile icon={Users} value="1,286" label="Students reached" delta={12} accent="var(--primary)" /></StateCell>
          <StateCell label="DrillTile" note="Hover drill arrow.">
            <DrillTile onOpen={noop} label="At-risk students">
              <p className="text-[13px] font-semibold">14 students need attention</p>
            </DrillTile>
          </StateCell>
          <StateCell label="Loading" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL.">
            <ProposedLoading shape="chip" label="Loading" />
          </StateCell>
          <StateCell label="Error" note="Built: the shared state view (src/components/app/states.tsx) this component\'s screen renders through SurfaceState. See the States gallery for its live URL.">
            <ProposedError verb="load this metric" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Casefile cards: PlanSignoffCard, TodosCard, CheckinsCard" file="src/components/counselor/v2/Casefile.tsx" purpose="The Student Profile's three casefile cards: plan sign-off, counselor to-dos, and folded check-ins." when="Counselor Dashboard v2's Student Profile.">
        <StateGrid>
          <StateCell label="Not rendered">
            <LiveRoute href="/counselor?view=students" device="desktop" height={380} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="GlassCard, ChipGrid, QuestionHeading, StepFooter, InkText, DreamySprite" file="src/components/build/ui.tsx" purpose="Build flow's shared step primitives: the step's frame, a multi-select chip grid, the ink-bleed heading with Dreamy's sprite, and the sticky footer." when="Any Build flow step.">
        <StateGrid>
          <StateCell label="QuestionHeading"><QuestionHeading title="What subjects pull you in?" subtitle="Pick as many as fit." /></StateCell>
          <StateCell label="InkText"><InkText text="Words bleed in like ink." /></StateCell>
          <StateCell label="ChipGrid"><ChipGrid options={["Math", "Art", "Biology", "History"]} selected={["Art"]} max={3} onChange={noop} /></StateCell>
          <StateCell label="GlassCard"><GlassCard><p className="text-[13px]">Step content.</p></GlassCard></StateCell>
          <StateCell label="StepFooter"><StepFooter onBack={noop} onNext={noop} /></StateCell>
          <StateCell label="DreamySprite, image failure" note="Falls back to a sparkle glyph on a tinted disc."><div className="relative h-[52px] w-[52px]"><DreamySprite src={EDGE.brokenImage} alt="" sizes="52px" /></div></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MatchCard" file="src/components/flow/match/MatchCard.tsx" purpose="Match's one card shape: an emoji and label over a graphic area, a translucent body box below." when="Match's swipe deck only.">
        <StateGrid>
          <StateCell label="Default" pad={false} minH={280}><div style={{ width: 260 }}><MatchCard card={matchCard} /></div></StateCell>
          <StateCell label="Long body" pad={false} minH={280}><div style={{ width: 260 }}><MatchCard card={{ ...matchCard, body: EDGE.longBody }} /></div></StateCell>
        </StateGrid>
      </Specimen>

      <SubHead>Marketing only</SubHead>
      <Specimen name="CTABlock, Panel, Grad, DOMark, PartnerLogoGrid" file="src/components/marketing/FinalCTAs.tsx, src/components/marketing/SchoolsIllustrations.tsx, src/components/marketing/DreamOpportunity.tsx, src/components/marketing/PartnerTicker.tsx" purpose="The landing page's own building blocks: a closing CTA band, the illustration stage, the gradient headline type, the wordmark tile, and the partner logo row." when="Marketing/landing pages only, never inside the product.">
        <StateGrid>
          <StateCell label="Grad"><p className="text-[22px] font-extrabold"><Grad>Find your path.</Grad></p></StateCell>
          <StateCell label="DOMark"><div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px]" style={{ background: "#0e0c20" }}><DOMark /></div></StateCell>
          <StateCell label="Illustration Panel" pad={false} minH={140}><IllustrationPanel className="h-[140px]" label={false}><div className="flex h-full items-center justify-center text-[13px]">Illustration stage</div></IllustrationPanel></StateCell>
          <StateCell label="PartnerLogoGrid"><PartnerLogoGrid tone="dark" /></StateCell>
          <StateCell label="CTABlock" pad={false} minH={200}><CTABlock eyebrow="Ready?" heading="Start exploring today" body="Free for students and families." primary={{ label: "Get started", href: "#" }} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Counselor Avatar, StudentLink" file="src/components/counselor/chips.tsx" purpose="A student's roster avatar (with an initials fallback), and the link that opens their profile." when="Counselor Dashboard rosters and student lists.">
        <StateGrid>
          <StateCell label="Avatar, with portrait"><CounselorAvatar name="Maria Gonzalez" index={2} /></StateCell>
          <StateCell label="Avatar, initials fallback" note="No roster index: falls back to initials."><CounselorAvatar name={EDGE.longName} /></StateCell>
          <StateCell label="StudentLink" note="Navigates on click (opens the student's profile); safe to render, just don't click it in the lab. Hover or Tab to it: dm-quiet's built hover/focus-visible.">
            <StudentLink id="student-1" name="Maria Gonzalez" index={2}><span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>Grade 11 · On track</span></StudentLink>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Empty state, generic" file="docs/COMPONENT_STATES_PLAYBOOK.md" purpose="The playbook's tier-3 default for a dense panel with nothing to show yet, for any card list above that has no built empty state of its own." when="A shelf, panel, or grid whose data set can legitimately be empty.">
        <StateGrid>
          <StateCell label="Empty (tier 3)" kind="built" note="The real shared EmptyView (states.tsx), not an invented look -- this cell just demonstrates the playbook's tier-3 default in the abstract, for any card list above with no empty state of its own yet."><ProposedEmpty tier={3} line="No colleges saved yet." /></StateCell>
        </StateGrid>
      </Specimen>
    </Section>
  );
}
