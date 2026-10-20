// The night sky's moments, callable from anywhere: stores, components,
// handlers (20 Oct 2026). Chandu: "lets add the reactive stars to the student
// app as well... Saves, add to top 3 etc stuff like that and main ctas can
// have those reactions". A moment is a window event; NightSky (dark Black &
// Blue only) turns it into a wave of light through the stars from where it
// happened, and `big` adds a shooting star. A page without the sky, light
// mode and reduced motion simply ignore it.

export const SKY_EVENT = "dreamari:sky";

// The budget, so it stays special (Chandu: "fire in a lot of places just not
// so much that it gets boring and overused"): a small wave at most every 5s,
// a shooting star at most every 2s. A big moment always beats a small one
// (a press that saves and also fills the Top 3 shows the star).
//
// Where moments fire (keep this list current):
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
const SMALL_GAP = 5000;
const BIG_GAP = 2000;
let lastSmall = 0;
let lastBig = 0;

/** `from` defaults to the element that has focus (the button just pressed). */
export function skyMoment(opts: { x?: number; from?: Element | null; big?: boolean } = {}): void {
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
  window.dispatchEvent(new CustomEvent(SKY_EVENT, { detail: { x, big: !!opts.big } }));
}
