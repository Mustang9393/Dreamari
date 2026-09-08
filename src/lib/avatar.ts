// Every student's avatar, app-wide (direct feedback, 8 Sept 2026: "the
// avatar stuff should trickle down into everything... wherever a student's
// avatar is used"). Replaces the earlier DiceBear-generated set (direct
// feedback, 8 Sept 2026: "remove the avatar style toggles, we will be using
// custom generated ones") with a fixed set of real illustrated portraits --
// same black/white line-art style throughout, no student photo ever stored.
// A seed (a handle, a first name) picks the SAME portrait every time via a
// deterministic hash, so one person always draws the same face without any
// per-student assignment to maintain by hand.
//
// 9 Sept 2026 pass ("use [the new portraits] in combination with the older
// ones to show a significantly diverse student population... dont put two
// of the similar kinds of pictures or races or genders together"): the
// original 32 (student-01.png-student-32.png) skewed heavily -- 25 read as
// Black, the other 7 (student-26.png-student-32.png) all read as East Asian
// masculine and, worse, are near-identical to EACH OTHER (same haircut
// family, same pose, same face shape) -- so they're excluded below rather
// than fixed; there's no image-generation tool available here to redraw
// them. A new, actually-diverse 48-portrait set was supplied
// (student-33.png-student-80.png, ethnicity/gender documented file by file
// in avatars/student-portraits-48/PROMPTS.md) and is now the set every
// PINNED recurring name draws from -- see PINNED_INDEX below. This mattered
// more than it looks: every multi-avatar surface in the app (Connect's
// threads, comment stacks, insights, the pro dashboards) draws ONLY from
// the 18 pinned names, so the old cast being all-Black meant literally
// every screen with more than one student showed one race. The old 32 are
// not thrown away -- freed from pinning, they're back in the generic hash
// fallback below, right alongside the new ones, for any one-off name that
// isn't part of the fixed cast.
const ILLUSTRATED_COUNT = 80;

// Every named student who actually recurs across the community boards is
// pinned explicitly, not left to the hash (direct feedback, 8 Sept 2026,
// after repeated rounds of the hash putting two of them on the same or a
// near-identical-looking face -- with only 32 portraits and 18 recurring
// names, the birthday paradox makes at least one collision likely, and a
// hash can't know that "Devon" and "Maya" both show up in the same feed).
// Each of the 18 gets its own distinct index below, so none of them can ever
// collide with each other.
//
// 9 Sept 2026: reassigned 16 of the 18 to the new diverse set so the cast
// itself reads as a real cross-section, not "18 portraits of the same
// race." Jordan and Marcus are untouched -- Jordan is the student whose
// face anchors the marketing screenshots and the profile header everywhere
// (its own dedicated file, avatar-jordan.png, below), and Marcus's exact
// portrait was a direct pick from a supplied photo (8 Sept 2026) -- neither
// should move for a diversity pass that has nothing to do with either of
// them specifically. Both are Black, which sets the floor for that
// category before any of the other 16 are even assigned.
//
// Second pass, same day, direct feedback ("there are places where the name
// is Ruby and it's a guy" -- true of the OLD all-Black/East-Asian set,
// where Ruby's pinned portrait read masculine under a name that reads
// feminine; fixed below by pinning Ruby to a Black feminine portrait --
// and "we have a disproportionate amount of colored students... use more
// white kids in visible areas, and asians, and other races"): White and
// East Asian are deliberately the two LARGEST groups among the 16
// (three each) precisely because Jordan and Marcus -- the two most
// visible, most frequent faces in the whole app -- are both already Black,
// so an even 2-per-category split still read as Black-heavy overall.
// Mixed heritage absorbs the resulting shortfall (one pin instead of
// three) since it's the one category here that isn't a specific
// real-world ethnicity a viewer would notice being "under-represented."
const PINNED_INDEX: Record<string, number> = {
  // 0-based indices -- student-NN.png is PINNED_INDEX[name] + 1.
  Jordan: 3, // dead path in practice (see studentAvatarSrc's early return to avatar-jordan.png) but kept excluded defensively
  Marcus: 1, // the exact dreadlocks/black-polo portrait supplied directly, 8 Sept 2026 -- untouched
  // White (3)
  Ethan: 32, // student-33: White masculine
  Ava: 40, // student-41: White feminine
  Noah: 64, // student-65: White gender-neutral
  // East Asian (3)
  Theo: 34, // student-35: East Asian masculine
  Riley: 42, // student-43: East Asian feminine
  Sam: 58, // student-59: East Asian gender-neutral
  // South Asian (2)
  Priya: 43, // student-44: South Asian masculine
  Lena: 35, // student-36: South Asian feminine
  // Southeast Asian (2)
  Jo: 36, // student-37: Southeast Asian gender-neutral
  Zoe: 52, // student-53: Southeast Asian feminine
  // Latino (2)
  Diego: 53, // student-54: Latino masculine
  Maya: 37, // student-38: Latino feminine
  // Middle Eastern (2)
  Amir: 38, // student-39: Middle Eastern masculine
  Sana: 46, // student-47: Middle Eastern feminine
  // Mixed heritage (1 -- see note above)
  Devon: 55, // student-56: Mixed heritage masculine
  // Black (3 total with Jordan/Marcus above -- Ruby is the only feminine-presenting one of the three)
  Ruby: 33, // student-34: Black feminine
};
const EXCLUDED_INDICES = new Set([
  ...Object.values(PINNED_INDEX),
  // The entire old 32 are excluded from the random fallback, not just the
  // pinned/duplicate ones -- direct feedback, 9 Sept 2026, on the same
  // "disproportionate" note. The old set is 25 Black + 7 near-identical
  // East Asian masculine portraits (see the header note), so any one-off
  // seed hashing into it would skew the SAME direction the pinned cast
  // just got fixed for. The new 48 (student-33.png onward) are evenly
  // split across 8 ethnicities already, so the fallback below draws from
  // that half alone -- the old 32 stay on disk and in play only via
  // Marcus's and Jordan's direct pins above, which is what "in combination
  // with the older ones" means here now: present, not over-weighted.
  ...Array.from({ length: 32 }, (_, i) => i),
]);

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The illustrated portrait for this seed. Every named student who actually
 *  recurs in the app is pinned explicitly (PINNED_INDEX above), guaranteed
 *  collision-free; a seed outside that list (a one-off, non-recurring name)
 *  falls back to a deterministic hash over the full 80-portrait set (minus
 *  the pinned cast and the old duplicate cluster), stable for the life of
 *  the set but not guaranteed collision-free against every other one-off
 *  seed the same way the pinned cast is. Pinned HERE, the one function every
 *  caller funnels through (nav, Profile's own header, Connect's Avatar), so
 *  it can't drift out of sync between call sites the way it did the first
 *  time this was patched only in Connect's own Avatar component. Still the
 *  same illustrated style, no real photo. */
export function studentAvatarSrc(seed: string): string {
  if (seed === "Jordan Rivera") seed = "Jordan"; // full name on the student's own profile, same person as the "Jordan" handle
  if (seed === "Jordan") return "/images/avatar-jordan.png";
  if (seed in PINNED_INDEX) return `/images/avatars/students/student-${String(PINNED_INDEX[seed] + 1).padStart(2, "0")}.png`;
  let index = hash(seed) % ILLUSTRATED_COUNT;
  while (EXCLUDED_INDICES.has(index)) index = (index + 1) % ILLUSTRATED_COUNT;
  return `/images/avatars/students/student-${String(index + 1).padStart(2, "0")}.png`;
}
