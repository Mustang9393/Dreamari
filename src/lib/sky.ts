// The night sky's moments, callable from anywhere: stores, components,
// handlers (20 Oct 2026). Chandu: "lets add the reactive stars to the student
// app as well... Saves, add to top 3 etc stuff like that and main ctas can
// have those reactions". A moment is a window event; NightSky (dark Black &
// Blue only) turns it into a wave of light through the stars from where it
// happened, and `big` adds a shooting star. A page without the sky, light
// mode and reduced motion simply ignore it.

export const SKY_EVENT = "dreamari:sky";

// The budget, so it stays special (Chandu: "fire in a lot of places just not
// so much that it gets boring and overused"): a shooting star at most every
// 2s; small waves only come from the student's own taps (see SMALL_GAP). A
// big moment always beats a small one (a press that saves and also fills the
// Top 3 shows the star).
//
// Where moments fire (keep this list current):
//   Build: a small wave on each Next, big at halfway and at the finish
//   Match: a small wave per save or rank, big on the third of either
//   Edit My Build: a wave on Save changes, big when it fills the last section
//   big   Top 3 gains a career (picks.ts) · Build finished (buildAnswers.ts)
//         · the College Goal first chosen (About Me picker) · a new Career Report version (reportHistory.ts) · a simulation's
//         ten beats done (play/progress.ts) · a Glossary lesson finished the
//         first time (glossary/progress.ts) · applied to or won an
//         opportunity (opportunities.ts) · booked a counselor meeting
//         (BookCounselorSheet) · counselor: a review approved, something
//         shared with students, a meeting confirmed
//   small saving a career, school or opportunity · a main call to action
//         (LightPulse, data-lit) · following a professional · counselor: a
//         note, a meeting added, office hours, any other review decision
//   once  the first page of a visit: the sky wakes up (NightSky)
// 21 Oct 2026 (Chandu: "the stars pulsing on save button doesnt work all
// the time, i think its mostly when the toast with the undo is present"):
// the small gap was 5s, about as long as a save's Undo toast stays up, so
// a second save in that window was silently dropped. Every moment here
// answers something the student did, so a tap always gets its wave; the
// gap only swallows a double fire from one press (say a save that is
// also a main call to action).
const SMALL_GAP = 600;
const BIG_GAP = 2000;
let lastSmall = 0;
let lastBig = 0;

/** `from` defaults to the element that has focus (the button just pressed). */
export function skyMoment(opts: { x?: number; y?: number; from?: Element | null; big?: boolean } = {}): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (opts.big) {
    if (now - lastBig < BIG_GAP) return;
    lastBig = now;
    lastSmall = now;
  } else {
    if (now - lastSmall < SMALL_GAP || now - lastBig < BIG_GAP) return;
    lastSmall = now;
  }
  const el = opts.from === undefined ? document.activeElement : opts.from;
  const rect = el && el !== document.body ? el.getBoundingClientRect() : null;
  const x = opts.x ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
  // y: where it happened down the screen. The night sky ignores it; the day
  // sky (SkySun.tsx) starts its surge and lens flare there (22 Oct 2026).
  const y = opts.y ?? (rect ? rect.top + rect.height / 2 : undefined);
  window.dispatchEvent(new CustomEvent(SKY_EVENT, { detail: { x, y, big: !!opts.big } }));
}

// ---- The wake-up on every page (22 Oct 2026). Chandu: "make sure the stars
// have a different reaction each time ANY page loads all across the app",
// then, after two showier passes were turned down ("christmas style like
// flashing", "the stars look weird now revert"): "lets keep the varying
// animations somehow without it being too mechanical on page loads". So the
// wave the sky always woke with plays on every page, never quite the same
// twice (NightSky.tsx wake()). NightSky plays it on mount; shells whose
// views change without remounting the sky (counselor v7 and v4) call
// skyArrival() on view change. Moments stay for actions.
export const SKY_ARRIVAL_EVENT = "dreamari:sky-arrival";
export function skyArrival(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SKY_ARRIVAL_EVENT));
}

// ---- A missed streak (23 Oct 2026): the day sky, in its storm mode, answers
// with sheet lightning in the clouds (SkySun.tsx). Nothing fires this yet:
// the streak is still the hardcoded 12 (surfaceStates.ts), so call
// skyStorm() from wherever a streak break is detected once that exists.
// `from` places the strike above the element; the night sky ignores it.
export const SKY_STORM_EVENT = "dreamari:sky-storm";
export function skyStorm(opts: { from?: Element | null } = {}): void {
  if (typeof window === "undefined") return;
  const el = opts.from === undefined ? document.activeElement : opts.from;
  const rect = el && el !== document.body ? el.getBoundingClientRect() : null;
  window.dispatchEvent(new CustomEvent(SKY_STORM_EVENT, { detail: { x: rect ? rect.left + rect.width / 2 : undefined } }));
}
