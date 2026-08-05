# Match experience hierarchy audit

## Scope

The decision screen from the first career path, reviewed at 1280×800, 390×844, and
320×700. The user goal is to understand one career-fit dimension at a time, decide Pass
or Like, and understand how close the path is to being saved.

## Evidence

1. **Path context — healthy.** `Computer Science` now establishes the path directly;
   the redundant `MATCHES` eyebrow has been removed. It uses a smaller semibold,
   secondary-color treatment so it no longer competes with the active card title.
   Evidence: [current desktop](01-current-desktop.jpg), [current mobile](02-current-mobile.jpg).
2. **Progress/status — needed structural clarification.** The former panel showed
   `0 OF 5 LIKED` beside `20%`, even though no cards had been liked. That mixed decision
   progress with completion progress and made the secondary panel harder to interpret.
3. **Career-fit card — healthy and dominant.** Category, illustration, and approved
   Replit description form a clear primary reading sequence. The increased 13–16px body
   type remains readable, and the card uses the recovered eyebrow space to become taller.
4. **Decision and feedback — healthy with improved assistive feedback.** Like remains the
   clear primary action, Pass remains visually secondary, both have large targets, and
   the reversible result toast is now announced as a polite status update. On compact
   screens it is anchored above the action row rather than covering the controls. Its
   final chip treatment is 32px high with 12px type and compact 8×14px padding.
5. **Path saved — healthy.** The completion state removes the decision UI, confirms the
   saved path, summarizes Like/Pass outcomes, and offers one clear continuation action.

## Implemented hierarchy

- Restored the completion percentage beside the progress bar while keeping the liked
  count and save target on a separate line, so the two measures remain distinct.
- Increased the progress label sizes and reduced redundant visual weight so the card is
  still the main object on the page.
- Added a compact-phone width guard and a separately derived height so the card measures
  272×294 at 320px without horizontal or vertical overflow.
- Added progress semantics and live feedback semantics for assistive technology.
- Established a deliberate title hierarchy: persistent path context uses 6.8% of the
  card-width scale at weight 700, while the active decision title keeps 7.8%, weight 800,
  and full-white contrast.

## Accepted result

- [Revised mobile](04-revised-mobile.jpg)
- [Revised desktop](05-revised-desktop.jpg)
- [Revised compact mobile](06-revised-compact-mobile.jpg)
- [Revised feedback placement](07-revised-feedback-mobile.jpg)
- [Path saved](08-path-saved-mobile.jpg)
- [No-eyebrow elongated mobile](09-no-eyebrow-elongated-mobile.jpg)
- [No-eyebrow elongated desktop](10-no-eyebrow-elongated-desktop.jpg)
- [No-eyebrow elongated compact mobile](11-no-eyebrow-elongated-compact.jpg)
- [Percentage restored compact mobile](12-percentage-restored-compact.jpg)
- [Percentage restored desktop](13-percentage-restored-desktop.jpg)
- [Title hierarchy before](14-title-hierarchy-before.jpg)
- [Title hierarchy after](15-title-hierarchy-after.jpg)
- [Saved progress single line](16-saved-progress-single-line.jpg)
- [Toast before](16-toast-before.jpg)
- [Compact toast after](17-toast-after.jpg)

## Evidence limits

Screenshots support the visual hierarchy and responsive findings. Keyboard behavior,
screen-reader wording, zoom reflow, and full WCAG conformance require dedicated manual
assistive-technology testing and are not claimed here.
