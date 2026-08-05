# Changelog

Notable changes to the Dreamari frontend reference are recorded here.

## 2026-08-05

### Student home and launchpad

- Completed the launchpad token-alignment pass. `/home` now consumes semantic action and
  category roles plus dedicated `component.home-*` contracts; it no longer references
  palette primitives directly.
- Extended the DTCG generator so component aliases are emitted into the generated CSS for
  both modes. Added documented mode-parity roles for launchpad navigation, career cards,
  cinematic text, feature panels and elevation; validation now covers 501 tokens.
- Added a complete light launchpad mode with a warm off-white shell, white career cards,
  mode-aware navigation, readable metadata, soft branded feature panels and the cinematic
  hero intentionally retained as a dark media surface. The shared theme control persists
  the student's choice.
- Added accessible View All plus chevron controls to every browsable career rail. Each
  action activates Explore, records a category deep link and scrolls to the corresponding
  collection.

- Added the responsive `/home` student launchpad based on the approved desktop and
  mobile UIKIT references, with a cinematic featured simulation, quick actions,
  continuation cards, personalised recommendations, daily challenge, popular careers,
  mystery unlocks, and sponsored Mars challenge.
- Added working desktop tabs and persistent mobile app navigation, responsive card rails,
  Resume/Explore/Play routes, streak acknowledgement, and daily challenge success and XP
  feedback.
- Added a Home icon beside the Career Report wordmark and a visible “Go to Launchpad” CTA;
  the Dreamari wordmark continues to open the original landing page.
- Mapped the implementation to the generated DTCG semantic tokens instead of copying raw
  Figma values, and reused the shared Dreamari icon components.
- Added 13 cinematic, single-subject career assets with globally diverse characters and
  card-compatible crops. Converted the final set to WebP, reducing it from 23 MB to about
  1.2 MB without changing the visual direction.
- Passed design comparison against the captured Figma desktop/mobile references and
  responsive browser verification at 390×844, 768×1024, 1280×720, and 1440×900 with no
  horizontal overflow. Tabs, quick actions, challenge feedback, report entry points,
  ESLint, TypeScript, all 438 token checks, and the production build pass.
- Rebuilt every career card against UIKIT node `793:36808`: the standard component is
  exactly 427×336 with a 180px image, separate 156px navy information panel, match badge,
  duration, plain dot-separated metadata, and full-width blue CTA. Wide and compact rail
  variants preserve the same anatomy.
- Replaced static card rows with working streaming-style carousels: partial-next-card
  affordances, touch swipe and snap, hover/focus lift and image push-in, and accessible
  desktop Next/Previous controls that advance by the number of visible cards.
- Rebuilt the featured hero after a 100% Figma comparison: it is now a borderless,
  full-bleed 520px cinematic stage with a dedicated campus panorama, source-matched
  single-line desktop hierarchy, CTA/progress anatomy, centered pagination, and compact
  72px text-only Quick Actions.
- The hero now autoplays continuously every 5.5 seconds, including while hovered, with
  700ms story crossfades, manual dots/arrows, and a reduced-motion opt-out. Career-card
  artwork now fades softly into the token-mapped navy information panel.

### Career report experience

- Added the responsive `/career-report` frontend reference and connected successful
  Match completion to its branded preparation state.
- Rebuilt the report hero hierarchy so “Computer Science” and “Career Report” occupy two
  deliberate lines, with simulation/exploration actions separated from report utilities.
- Added Download and Share actions to the hero and conclusion, including accessible
  dialogs, focus management, keyboard dismissal, loading/success/error feedback, native
  share and email fallbacks, and a print-ready Save-as-PDF flow.
- Replaced the generic wait screen with a four-stage report assembly sequence, a
  reduced-motion path, a recoverable interruption state, and a successful retry flow.
- Reorganised the approved Replit report content into an at-a-glance direction summary,
  a single recommended next move, and progressively deeper profile, career, plan,
  education, certification, version-history, and conclusion sections.
- Added sticky section navigation with responsive active-section tracking, current versus
  baseline report controls, light/dark themes, print-based download, and share feedback.
- Added four optimised Dreamy expression assets from the supplied source packs for
  preparation, exploration, insight, planning, and celebration moments.
- Kept the temporary Career Report header intentionally minimal and removed the Dreamy
  cloud mark so the next navigation/header/footer system can replace it cleanly.
- Mapped Career Report surfaces, text, borders, feedback states, shadows, and accents to
  the shared generated semantic tokens instead of maintaining a page-local color palette.
- Reworked the university fit guidance into substantial Reach, Good fit, and Safe choices
  cards; removed the stretched empty panel and the orphaned Strong Options grid item.
- Replaced the duplicated “Report actions” label and text-heavy Download/Share buttons
  with compact, accessible icon controls separated from the Play and Explore CTAs.
- Increased small report metadata and supporting copy to a more legible type scale,
  balanced section headings, and tightened responsive spacing throughout the report.
- Moved Academic Strengths, My Plan, and conclusion Dreamy illustrations into reserved
  layout columns so mascot art never competes with or obscures report text.
- Verified the report at 320×700, 390×844, 768×1024, 1024×768, and 1280×800 with no
  horizontal overflow or browser console errors; ESLint, TypeScript, token validation,
  and production build pass.

### Design system

- Replaced the flattened prototype token export with five W3C DTCG 2025.10 collections:
  light/dark primitives, light/dark semantics, and component tokens.
- Preserved semantic aliases, composite typography and shadow values, explicit units,
  stable paths, and token descriptions.
- Added dependency-free token generation and validation scripts plus generated CSS and
  TypeScript artifacts consumed by the Tailwind frontend.
- Extracted Build-step accents, Match category colors, How It Works chapter colors, and
  reusable component dimensions from page-level literals.
- Added automated checks covering 438 tokens, light/dark parity, alias resolution,
  descriptions, composites, generated-artifact freshness, and required text contrast.

### How It Works experience

- Fixed the upward exit from the snapped sequence: scrolling above BUILD now temporarily
  releases mandatory document snapping so students can reliably return to the hero on
  desktop, tablet, and mobile.
- Added one-gesture stage snapping across desktop, tablet, and mobile while preserving
  the blurred incoming-stage transition.
- Separated CONNECT's exit from the finale so `YOU'RE READY` appears only after CONNECT
  has completely disappeared.
- Added tablet-specific title and description bounds so content clears the progress rail
  and screen edges at compact and standard tablet widths.
- Scoped document snapping to the active section so a fresh homepage visit still opens
  on the hero.

### Collaboration and documentation

- Added `docs/AI_HANDOFF.md` and repository instructions for safe Codex/Claude handoffs.
- Documented the portable-token boundary and the remaining production comparison against
  the app repository's canonical `packages/ui/tokens` collection.

### Validation

- Increased Match-card description copy to a fluid, bounded 13–16px range. Verified the
  longest card copy at 390×844 and 1280×800 with no text or horizontal overflow.
- Clarified Match information hierarchy by keeping completion percentage beside its bar,
  separating liked progress and the save threshold onto the supporting row, and removing
  the intermediate `Card N of 5` label. Added progress and live-status semantics.
- Added a compact-phone width constraint so Match cards stay within the 320px viewport
  instead of letting their scale driver exceed the available horizontal space.
- Anchored reversible Match feedback above the action row so the toast never obscures
  Pass or Like on compact phones; the message is also exposed as a polite live status.
- Removed the `MATCHES` eyebrow from every Match decision screen, moved the path title
  and progress panel into the recovered space, and added that height to the card without
  changing the established progress-to-stack or stack-to-actions gaps.
- Separated stable path context from the active decision title: `Computer Science` now
  uses a smaller semantic-secondary 700 treatment, while Classes, Workstyle, Skills and
  the remaining card titles retain the larger full-contrast 800 treatment.
- Shortened every Match save-status message and made the supporting row non-wrapping:
  `N more likes to save` progresses to `Path saved!`, keeping states such as `4 liked`
  and `Path saved!` together on one line at compact widths.
- Reduced Match toast feedback from 44px/14px to a compact 32px/12px chip with tighter
  padding and spacing. Undo remains visible and keyboard-focused, while even the longest
  message stays within a 320px viewport and never overlaps Pass or Like.
- Passed token validation, ESLint, TypeScript, and the Next.js production build.
- Browser-tested the full BUILD → MATCH → PLAY → EXPLORE → CONNECT → finale sequence at
  390×844, 687×787, 768×1024, and 1280×800 without console errors.
