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

// student-13.png is byte-for-byte the same file as avatar-jordan.png (confirmed
// via md5, 8 Sept 2026: direct feedback -- "Jordan and Marcus have the same
// picture," Marcus's handle happens to hash to this index). Jordan's photo is
// meant to be the one face nobody else wears, so this index is excluded from
// the pool below rather than left to collide with whoever else hashes onto it.
const JORDAN_DUPLICATE_INDEX = 12; // student-13.png, 0-based

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The illustrated portrait for this seed -- stable for the life of the
 *  set (adding more files shifts everyone's assignment, same as any
 *  hash-based picker; fine for a prototype, worth pinning explicitly
 *  per-student before this becomes real production data).
 *
 *  Jordan (the signed-in demo student) is the one exception: a
 *  deliberately chosen portrait, not the hash every other, anonymized
 *  student gets (direct feedback, 8 Sept 2026). Pinned HERE, the one
 *  function every caller funnels through (nav, Profile's own header,
 *  Connect's Avatar), so it can't drift out of sync between call sites
 *  the way it did the first time this was patched only in Connect's own
 *  Avatar component. Still the same illustrated style, no real photo. */
export function studentAvatarSrc(seed: string): string {
  if (seed === "Jordan" || seed === "Jordan Rivera") return "/images/avatar-jordan.png";
  let index = hash(seed) % ILLUSTRATED_COUNT;
  if (index === JORDAN_DUPLICATE_INDEX) index = (index + 1) % ILLUSTRATED_COUNT;
  return `/images/avatars/students/student-${String(index + 1).padStart(2, "0")}.png`;
}
