"use client";

// DEMO-ONLY: Component Lab section, "Navigation and chrome". Every piece
// here reads the student avatar and Dream Score stores read-only (a normal
// live render of the real nav does that everywhere in the app); nothing in
// this section writes to them. FlowChrome and CounselorShell are described
// rather than rendered live -- see their own notes below for why.

import { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import {
  DesktopNavigation,
  MobileHeaderShell,
  MobileNav,
  PAGE_TITLE_CLASS,
  PAGE_TITLE_STYLE,
  QuickLinksMenu,
  QuickLinksPanel,
  Wordmark,
} from "@/components/app/chrome";
import { HeaderActions, NavIconButton, NotificationsButton } from "@/components/app/Inbox";
import { SkipLink } from "@/components/app/SkipLink";
import { Section, Specimen, StateGrid, StateCell, NotRendered, LiveRoute, ClippedStage, noop } from "../kit";

// SkipLink is sr-only until :focus (a real CSS pseudo-class, not
// :focus-visible), so calling .focus() programmatically on mount shows the
// exact same visible state a real Tab press would, without needing a
// keyboard event in the lab (added 27 Sept 2026: the cell looked empty
// before anyone tabbed to it).
function SkipLinkDemo() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, []);
  return (
    <div ref={ref}>
      <SkipLink />
    </div>
  );
}

export function NavigationSection() {
  return (
    <Section
      id="navigation"
      title="Navigation and chrome"
      intro="The app's shared chrome: the two top-level navs, the shared hamburger menu, notifications, and the skip link. Everything below reads the student avatar and Dream Score stores read-only."
    >
      <Specimen name="Wordmark" file="src/components/app/chrome.tsx" purpose="The Dreamari mark plus name, linked to the app root." when="Anywhere a header needs the brand anchor.">
        <StateGrid min={160}>
          <StateCell label="Default"><Wordmark /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="DesktopNavigation"
        file="src/components/app/chrome.tsx"
        purpose="The floating pill nav: wordmark, four destination tabs, Dream Score, notifications, avatar, quick links."
        when="Every top-level student page (Home, Explore, Play, Connect, Profile), lg and up."
      >
        <StateGrid min={440}>
          <StateCell label="Home active" minH={110} note="Desktop only (lg and up); hidden below that width by the component's own className. Hover or Tab to a tab, the avatar, or the bell: each is dm-quiet's built hover/focus-visible.">
            <ClippedStage height={110}><DesktopNavigation active="Home" /></ClippedStage>
          </StateCell>
          <StateCell label="Connect active, forceBlur" minH={110} note="forceBlur keeps the frosted pill on even when the page's own content owns scrolling (e.g. Explore's reel never moves window.scrollY). The nav avatar is a procedurally generated image (useStudentAvatarSrc) with no name text and no onError fallback, so no long-name or broken-avatar state applies here.">
            <ClippedStage height={110}><DesktopNavigation active="Connect" forceBlur /></ClippedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="MobileHeaderShell + MobileNav"
        file="src/components/app/chrome.tsx"
        purpose="The phone/tablet chrome: a sticky top header slot (wordmark + actions) plus a fixed bottom tab bar."
        when="Every top-level student page, below lg. Hidden above that width by each component's own className, so resize the window narrower than 1024px to see either one render for real."
      >
        <StateGrid min={320}>
          <StateCell label="MobileHeaderShell" minH={90}>
            <ClippedStage height={90}>
              <MobileHeaderShell>
                <Wordmark />
                <HeaderActions><QuickLinksMenu /></HeaderActions>
              </MobileHeaderShell>
            </ClippedStage>
          </StateCell>
          <StateCell label="MobileNav, Home active" minH={140} note="Fixed bottom bar; contained here by ClippedStage's transform. Hover or Tab to a tab: dm-quiet's built hover/focus-visible.">
            <ClippedStage height={140}><MobileNav active="Home" /></ClippedStage>
          </StateCell>
          <StateCell label="MobileNav, Play active" minH={140}>
            <ClippedStage height={140}><MobileNav active="Play" /></ClippedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="QuickLinksPanel"
        file="src/components/app/chrome.tsx"
        purpose="The site map inside the shared hamburger menu: every page, the Counselor demo, the Flow Lab, the Connect view-as roles, and the theme toggle."
        when="Rendered inside QuickLinksMenu's popover on every screen; shown here open and in place instead of behind its own trigger."
      >
        <StateGrid min={260}>
          <StateCell label="hideDemoLinks=false" note="The bottom row is the app's real theme toggle (useGlobalTheme). Clicking it flips the whole app's stored theme, so it isn't click-tested here.">
            <QuickLinksPanel hideDemoLinks={false} />
          </StateCell>
          <StateCell label="QuickLinksMenu, real trigger" note="The actual hamburger button and its own open/close popover, not just the panel in place. Click to open; click outside, scroll, or Escape all close it for real.">
            <QuickLinksMenu />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="NotificationsButton / HeaderActions"
        file="src/components/app/Inbox.tsx"
        purpose="The bell in both navs, and the phone header's whole right-hand cluster (Dream Score chip, Messages when in a mentorship program, notifications)."
        when="Every top-level page's header, desktop and mobile alike."
      >
        <StateGrid min={220}>
          <StateCell label="NotificationsButton" note="Opening the panel is safe; a row's own click marks it read and navigates, so rows aren't clicked here.">
            <NotificationsButton />
          </StateCell>
          <StateCell label="HeaderActions">
            <HeaderActions />
          </StateCell>
          <StateCell label="Badge, 1" note="NotificationsButton has no prop to force a count (it reads useVisibleNotifications' live store); NavIconButton, the file-local piece that draws the badge, is rendered directly here instead (export added, no behaviour changed).">
            <NavIconButton label="Notifications" onClick={noop} badge={1}><Bell className="h-5 w-5" aria-hidden /></NavIconButton>
          </StateCell>
          <StateCell label="Badge, 9+" note="Anything over 9 prints as 9+, the same treatment a 99+ count would get.">
            <NavIconButton label="Notifications" onClick={noop} badge={23}><Bell className="h-5 w-5" aria-hidden /></NavIconButton>
          </StateCell>
          <StateCell label="Dot, no count"><NavIconButton label="Notifications" onClick={noop} dot><Bell className="h-5 w-5" aria-hidden /></NavIconButton></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="FlowChrome"
        file="src/components/app/FlowChrome.tsx"
        purpose="The stripped header for focus flows (Build, Match, the games): wordmark and hamburger only, plus a Dream Score chip that shows a one-time intro tooltip."
        when="Any full-screen focus flow, in place of the normal top nav."
      >
        <StateGrid min={260}>
          <StateCell label="In the app">
            <NotRendered
              reason="Its mount effect writes a real localStorage flag (dreamari:dream-score:intro-seen) whenever the live Dream Score is already above zero when it first mounts, which this lab can't rule out."
              see="src/components/app/FlowChrome.tsx"
            />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SkipLink" file="src/components/app/SkipLink.tsx" purpose="A keyboard-only shortcut straight to <main>, skipping the header and nav." when="Once, near the top of every page's markup.">
        <StateGrid min={220}>
          <StateCell label="Unfocused (sr-only)" note="Tab to it: the pill only shows on :focus. Empty here on purpose -- this is the real, correct hidden state.">
            <SkipLink />
          </StateCell>
          <StateCell label="Focused" kind="built" pad={false} minH={90} note="Programmatically focused on mount (a real .focus() call, the same `:focus` state a Tab press produces), so the pill shows without needing a keyboard event in this lab. ClippedStage contains its focus:fixed positioning to this cell instead of the real page corner.">
            <ClippedStage height={90}><SkipLinkDemo /></ClippedStage>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="CounselorShell / useCounselorFilters"
        file="src/components/counselor/shell.tsx"
        purpose="The Counselor Dashboard's own isolated shell: sidebar, mobile drawer, topbar, and the CounselorFiltersContext (grade, search, status, plan, counselor and milestone-step filters) every screen inside it reads via useCounselorFilters()."
        when="Wraps every /counselor screen; not part of the student app's own chrome by design."
      >
        <StateGrid min={260}>
          <StateCell label="Live at /counselor" kind="built" note="A full second product shell (sticky h-dvh sidebar, mobile drawer, its own topbar) needs a real viewport, not a lab cell -- LiveRoute renders the real page at true desktop width in a scaled, inert iframe instead of describing it. useCounselorFilters() itself is just a context read: gradeFilter/setGradeFilter, search/setSearch, statusFilter/setStatusFilter, planFilter/setPlanFilter, counselorFilter/setCounselorFilter, and stepFilter/setStepFilter, all no-op-defaulted outside a CounselorShell.">
            <LiveRoute href="/counselor" device="desktop" height={480} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PAGE_TITLE_CLASS" file="src/components/app/chrome.tsx" purpose="The one page-title treatment shared by every top-level tab (Home, Explore, Play, Connect, Profile, Colleges)." when="A top-level page's own <h1>, never a sub-screen.">
        <StateGrid min={220}>
          <StateCell label="Default">
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Explore</h1>
          </StateCell>
        </StateGrid>
      </Specimen>
    </Section>
  );
}
