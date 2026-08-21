import type { Transition, Variants } from "framer-motion";

// Duolingo-style motion primitives. This file is the single source for the
// lab's movement language; pages that adopt an animation import from here so
// the physics stay identical everywhere.
//
// RULE: springs support only TWO keyframes — never pair a spring transition
// with a keyframe array like scale:[0,1.1,1] (runtime throws). The spring's
// own overshoot already provides the mid-frame; animate to the end value and
// let the physics do the bounce. Multi-frame arrays (e.g. SQUISH) must use a
// duration/ease tween.

// Snappy, elastic movement — entrances, taps, rewards landing.
export const SPRING_BOUNCY: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 15,
  mass: 0.8,
};

// Floating/bobbing ambient loops — mascots, idle badges, hint arrows.
export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 12,
};

// Pop-in entrance: scale from nothing on the bouncy spring.
export const popIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  shown: { scale: 1, opacity: 1, transition: SPRING_BOUNCY },
};

// Ambient bob: mirror a soft spring between two offsets forever.
// Gate behind useReducedMotion() at the call site.
export const bobAnimate = { y: [-6, 6] };
export const bobTransition: Transition = {
  ...SPRING_SOFT,
  repeat: Infinity,
  repeatType: "mirror",
};

// Impact squish: compress Y, expand X, overshoot, settle. Runs AFTER a
// landing (transform-origin bottom so the element squashes into the floor).
export const SQUISH_KEYFRAMES = {
  scaleY: [1, 0.85, 1.06, 1],
  scaleX: [1, 1.15, 0.96, 1],
};
export const SQUISH_TRANSITION: Transition = {
  duration: 0.45,
  times: [0, 0.3, 0.65, 1],
  ease: "easeOut",
};
export const squish: Variants = {
  rest: { scaleX: 1, scaleY: 1 },
  impact: {
    ...SQUISH_KEYFRAMES,
    transition: SQUISH_TRANSITION,
  },
};

// Tactile 3D-flat press: the thick bottom border IS the depth; pressing
// removes it and drops the face by the same 4px so the element reads as
// physically pushed in. active:mb-[4px] refunds the lost border height so
// siblings don't shift. Pair with a border color darker than the face.
export const TACTILE_PRESS =
  "border-b-4 active:border-b-0 active:translate-y-[4px] active:mb-[4px] transition-[transform,border-width,margin] duration-100 select-none";
