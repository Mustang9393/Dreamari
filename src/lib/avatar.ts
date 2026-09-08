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
// Coverage note (8 Sept 2026): the illustrated set currently on disk --
// student-01.png through student-32.png -- was supplied as-is and is not
// balanced: every portrait in it reads as Black or East Asian, and none
// reads as White. There is no image-generation tool available to fill that
// gap from here; the set below only reflects what exists in
// public/images/avatars/students/. Add more files there (any style-matched
// portrait works) and bump ILLUSTRATED_COUNT to bring them into rotation.
const ILLUSTRATED_COUNT = 32;

// Every named student who actually recurs across the community boards is
// pinned explicitly, not left to the hash (direct feedback, 8 Sept 2026,
// after repeated rounds of the hash putting two of them on the same or a
// near-identical-looking face -- with only 32 portraits and 18 recurring
// names, the birthday paradox makes at least one collision likely, and a
// hash can't know that "Devon" and "Maya" both show up in the same feed).
// Each of the 18 gets its own distinct index below, so none of them can ever
// collide with each other; every index used here is excluded from the
// random pool a ONE-OFF, non-recurring seed might still fall back to.
const PINNED_INDEX: Record<string, number> = {
  // 0-based indices -- student-NN.png is PINNED_INDEX[name] + 1
  Jordan: 3, // avatar-jordan.png's own content (student-04.png)
  Marcus: 1, // the exact dreadlocks/white-polo portrait supplied directly, 8 Sept 2026
  Amir: 0,
  Ava: 2,
  Devon: 4,
  Diego: 5,
  Ethan: 6,
  Jo: 7,
  Lena: 8,
  Maya: 9,
  Noah: 10,
  Priya: 11,
  Riley: 12,
  Ruby: 13,
  Sam: 14,
  Sana: 15,
  Theo: 16,
  Zoe: 17,
};
const EXCLUDED_INDICES = new Set(Object.values(PINNED_INDEX));

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
 *  falls back to a deterministic hash, stable for the life of the set but
 *  not guaranteed collision-free against every other one-off seed the same
 *  way the pinned cast is. Pinned HERE, the one function every caller
 *  funnels through (nav, Profile's own header, Connect's Avatar), so it
 *  can't drift out of sync between call sites the way it did the first time
 *  this was patched only in Connect's own Avatar component. Still the same
 *  illustrated style, no real photo. */
export function studentAvatarSrc(seed: string): string {
  if (seed === "Jordan Rivera") seed = "Jordan"; // full name on the student's own profile, same person as the "Jordan" handle
  if (seed === "Jordan") return "/images/avatar-jordan.png";
  if (seed in PINNED_INDEX) return `/images/avatars/students/student-${String(PINNED_INDEX[seed] + 1).padStart(2, "0")}.png`;
  let index = hash(seed) % ILLUSTRATED_COUNT;
  while (EXCLUDED_INDICES.has(index)) index = (index + 1) % ILLUSTRATED_COUNT;
  return `/images/avatars/students/student-${String(index + 1).padStart(2, "0")}.png`;
}
