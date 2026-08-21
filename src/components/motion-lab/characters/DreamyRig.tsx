"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Vector Dreamy — traced 1:1 from the character art with potrace
// (public/images/dreamy/v2/dreamy-happy.png -> exact bezier outlines for the
// body silhouette, the night-sky eyes with their catchlight holes, the open
// smile, and the tongue). Flat 2D fills, a white halo outline, and a rig on
// top: breath from the base, a gaze cycle, blinks, a gentle tilt.
// mood="joy" swaps the eyes to happy arcs and opens the smile wide.
//
// Artwork space is the PNG's own 640x640; potrace paths live under TF.
// Regenerate with scratchpad/trace_dreamy.py if the source art changes.

export type DreamyMood = "cheer" | "joy";

const TF = "translate(0,640) scale(0.1,-0.1)";

const BODY_D =
  "M2920 5405 c-494 -81 -894 -410 -1055 -867 -37 -104 -35 -103 -205 -116 -502 -36 -875 -396 -925 -892 -9 -94 -8 -92 -95 -149 -360 -238 -501 -726 -325 -1126 71 -161 245 -364 395 -463 245 -161 516 -212 830 -157 145 26 147 25 242 -58 379 -330 808 -530 1248 -582 525 -62 1061 127 1500 530 93 85 85 83 205 51 348 -94 684 -36 970 169 618 442 630 1254 23 1641 -40 26 -74 48 -76 49 -2 2 -7 47 -13 101 -24 242 -116 434 -297 618 -191 195 -409 278 -782 299 l-45 2 -23 75 c-136 439 -532 775 -1021 866 -119 23 -439 28 -551 9z";

const EYES_D: string[] = [
  "M2016 3695 c-249 -68 -408 -291 -409 -570 -1 -101 25 -250 45 -270 8 -7 9 -4 3 10 -17 45 -17 258 -1 330 35 147 126 284 242 360 70 47 176 85 229 83 23 0 30 -3 18 -5 -13 -2 -23 -9 -23 -14 0 -6 -4 -7 -10 -4 -5 3 -10 2 -10 -3 0 -6 -20 -22 -44 -36 -59 -35 -148 -136 -191 -218 -147 -279 -74 -664 155 -816 l62 -42 183 0 183 0 43 33 c244 186 281 631 77 938 -119 180 -358 277 -552 224z m225 -244 c77 -78 -5 -262 -127 -287 -75 -15 -142 51 -130 128 24 148 175 241 257 159z m49 -388 c0 -33 44 -78 92 -93 l43 -13 -30 -11 c-73 -27 -87 -47 -101 -141 l-7 -50 -16 65 c-26 101 -29 105 -116 135 -16 6 -11 10 26 21 52 15 74 41 85 99 7 39 24 31 24 -12z m189 -350 c6 -10 11 -12 11 -5 0 25 18 11 22 -18 3 -16 1 -30 -4 -30 -5 0 -7 -4 -4 -8 3 -5 -3 -15 -12 -24 -24 -22 -52 -57 -52 -66 0 -9 -43 -28 -90 -39 -37 -9 -103 -9 -160 1 -19 4 -44 8 -55 10 -11 2 -23 4 -27 5 -21 4 -85 84 -81 102 3 10 10 19 15 19 5 0 6 5 3 10 -5 8 -11 7 -21 -1 -16 -13 -18 -2 -5 20 8 12 12 12 26 -3 13 -12 21 -14 30 -6 10 8 15 8 21 -1 4 -8 3 -9 -4 -5 -7 4 -12 2 -12 -3 0 -11 6 -13 50 -15 16 -1 24 -6 22 -15 -2 -11 0 -12 11 -2 8 6 28 11 43 11 50 0 74 4 74 12 0 11 23 6 32 -7 5 -6 8 -5 8 2 0 8 10 11 28 7 22 -5 36 1 67 30 46 41 50 42 64 19z",
  "M4151 3695 c-444 -125 -589 -926 -212 -1167 45 -28 46 -28 213 -28 l169 0 52 33 c153 99 243 266 254 472 13 252 -80 451 -269 576 -24 16 -36 29 -26 29 9 0 18 5 20 12 6 16 85 -16 157 -62 215 -140 321 -446 242 -700 -22 -70 -18 -78 8 -16 166 386 -80 849 -458 863 -65 2 -114 -2 -150 -12z m-14 -259 c87 -102 -7 -295 -131 -272 -113 21 -117 209 -6 284 45 31 105 25 137 -12z m137 -445 c18 -12 43 -21 55 -21 34 0 24 -16 -18 -29 -50 -14 -78 -50 -87 -107 -8 -54 -20 -57 -27 -5 -8 63 -28 94 -77 118 l-45 21 30 8 c51 12 84 42 96 87 l12 42 13 -47 c11 -34 23 -52 48 -67z m162 -256 c-3 -8 3 -19 12 -25 14 -9 11 -10 -15 -7 -31 3 -32 3 -16 -15 15 -17 15 -20 -3 -40 -78 -93 -122 -114 -249 -117 -62 -2 -155 28 -155 50 0 6 6 7 13 3 7 -5 6 0 -3 11 -14 16 -13 17 7 11 12 -4 26 -1 34 6 8 7 32 14 54 15 22 1 46 2 54 2 9 1 11 8 8 22 -5 20 -5 20 14 3 18 -16 19 -16 19 1 0 11 5 15 15 11 8 -3 15 -1 15 5 0 6 9 8 20 4 16 -5 19 -3 13 12 -7 17 -6 17 11 1 19 -20 21 -20 53 -12 13 4 20 11 16 20 -3 10 0 12 10 8 8 -3 18 0 22 6 4 6 16 8 27 4 14 -4 18 -2 14 5 -4 6 -4 16 -1 21 9 15 18 12 11 -5z",
];

const MOUTH_D =
  "M2834 2331 c-96 -42 -80 -198 30 -299 26 -24 50 -41 54 -38 3 4 -2 12 -12 19 -60 44 53 134 196 157 201 32 468 -38 442 -116 -4 -12 7 -5 30 18 76 79 82 205 13 249 -29 19 -41 20 -137 13 -132 -10 -364 -10 -495 -1 -57 4 -109 3 -121 -2z";

const TONGUE_D: string[] = [
  "M3073 2166 c-94 -22 -154 -59 -174 -109 -11 -25 -10 -31 4 -42 9 -7 17 -17 17 -22 0 -21 112 -61 201 -72 172 -22 371 35 414 120 22 42 7 58 -94 100 -91 39 -257 50 -368 25z m127 -153 c0 -5 16 -9 36 -10 37 -2 63 -17 51 -29 -12 -12 -137 -9 -145 3 -7 11 -12 13 -32 13 -17 0 -11 18 8 23 29 8 82 7 82 0z",
];

export function DreamyRig({
  size = 180,
  mood = "cheer",
  lookX = 12,
  shadow = true,
  halo = true,
  irid = false,
}: {
  size?: number;
  mood?: DreamyMood;
  /** horizontal gaze bias in artwork px: positive looks right */
  lookX?: number;
  /** ground shadow — turn off when Dreamy is airborne */
  shadow?: boolean;
  /** white outline halo (Super-style); turn off on light backgrounds */
  halo?: boolean;
  /** iridescent trail-light wash from behind (Super flying scenes) */
  irid?: boolean;
}) {
  const reduced = useReducedMotion();
  const joy = mood === "joy";
  // unique per instance: duplicate SVG ids across mounted copies make
  // url(#...) resolve into display:none subtrees and kill clips/gradients
  const uid = useId();
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 640 640" fill="none" overflow="visible" aria-hidden>
      <defs>
        <linearGradient id={id("dreamyBody")} gradientUnits="userSpaceOnUse" x1="320" y1="90" x2="320" y2="590">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FBFDFF" />
          <stop offset="100%" stopColor="#DCEBFD" />
        </linearGradient>
        <radialGradient id={id("dreamyEyeL")} gradientUnits="userSpaceOnUse" cx="206" cy="316" r="70">
          <stop offset="0%" stopColor="#5B86FF" />
          <stop offset="45%" stopColor="#2B50C8" />
          <stop offset="100%" stopColor="#0B1B4D" />
        </radialGradient>
        <radialGradient id={id("dreamyEyeR")} gradientUnits="userSpaceOnUse" cx="411" cy="316" r="70">
          <stop offset="0%" stopColor="#5B86FF" />
          <stop offset="45%" stopColor="#2B50C8" />
          <stop offset="100%" stopColor="#0B1B4D" />
        </radialGradient>
        <linearGradient id={id("dreamyIrid")} gradientUnits="userSpaceOnUse" x1="0" y1="340" x2="620" y2="280">
          <stop offset="0%" stopColor="#6EE7FF" stopOpacity="0.95" />
          <stop offset="32%" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="68%" stopColor="#FF7ACF" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#FF7ACF" stopOpacity="0" />
        </linearGradient>
        <filter id={id("dreamySoft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <clipPath id={id("dreamyClip")}>
          <g transform={TF}>
            <path d={BODY_D} />
          </g>
        </clipPath>
      </defs>

      {/* ground shadow, breathing against the body */}
      {shadow && (
        <motion.ellipse
          cx="320"
          cy="596"
          rx="190"
          ry="24"
          fill="#0b1020"
          opacity={0.35}
          animate={reduced ? undefined : { scaleX: [1, 0.92, 1], opacity: [0.35, 0.26, 0.35] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        />
      )}

      {/* whole character: gentle tilt */}
      <motion.g
        animate={reduced ? undefined : { rotate: [-1.6, 1.6] }}
        transition={{ duration: 3.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 88%" }}
      >
        {/* body: breathes from the base */}
        <motion.g
          animate={reduced ? undefined : { scaleY: [1, 1.04, 1], scaleX: [1, 0.98, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        >
          <g transform={TF}>
            {/* halo outline, then the exact traced silhouette */}
            {halo && (
              <path d={BODY_D} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={240} strokeLinejoin="round" opacity={0.96} />
            )}
            <path d={BODY_D} fill={`url(#${id("dreamyBody")})`} />
          </g>
          {/* crisp cel shade: paint the shade tone, then re-draw the body
             shifted up — a clean crescent of color hugs the lower contour */}
          <g clipPath={`url(#${id("dreamyClip")})`}>
            <rect x="0" y="0" width="640" height="640" fill="#9EC3FA" />
            <g transform="translate(0,-48)">
              <g transform={TF}>
                <path d={BODY_D} fill={`url(#${id("dreamyBody")})`} />
              </g>
            </g>
            <ellipse cx="300" cy="130" rx="170" ry="60" fill="#FFFFFF" opacity={0.85} filter={`url(#${id("dreamySoft")})`} />
          </g>

          {/* trail light washing over the body from behind */}
          {irid && (
            <g clipPath={`url(#${id("dreamyClip")})`}>
              <rect x="0" y="0" width="640" height="640" fill={`url(#${id("dreamyIrid")})`} opacity={0.5} />
            </g>
          )}

          {/* face: gaze cycle — look, hold, wander back */}
          <motion.g
            animate={reduced ? undefined : { x: [0, lookX, lookX, 0, -lookX * 0.5, 0], y: [0, 3, 3, 0, 5, 0] }}
            transition={{ duration: 7, times: [0, 0.14, 0.42, 0.56, 0.74, 1], repeat: Infinity, ease: "easeInOut" }}
          >
            {joy ? (
              <g stroke="#132D66" strokeWidth="24" strokeLinecap="round" fill="none">
                <path d="M176,342 Q218,298 260,342" />
                <path d="M381,342 Q423,298 465,342" />
              </g>
            ) : (
              /* the traced eyes; catchlights + sparkles are holes in the
                 paths, revealing the body beneath */
              <motion.g
                animate={reduced ? undefined : { scaleY: [1, 1, 0.07, 1, 1, 1, 0.07, 1] }}
                transition={{ duration: 6.2, times: [0, 0.3, 0.33, 0.36, 0.68, 0.82, 0.85, 0.88], repeat: Infinity }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              >
                <g transform={TF}>
                  {EYES_D.map((p, index) => (
                    <path key={index} d={p} fill={index === 0 ? `url(#${id("dreamyEyeL")})` : `url(#${id("dreamyEyeR")})`} />
                  ))}
                </g>
              </motion.g>
            )}

            {/* mouth: traced open smile + tongue; joy widens it */}
            {joy ? (
              <g>
                <path d="M240,398 Q322,452 404,398 Q408,486 322,494 Q236,486 240,398 Z" fill="#0E2354" />
                <ellipse cx="322" cy="470" rx="50" ry="20" fill="#2E7CFF" />
              </g>
            ) : (
              <motion.g
                animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 25%" }}
              >
                <g transform={TF}>
                  <path d={MOUTH_D} fill="#0E2354" />
                  {TONGUE_D.map((p, index) => (
                    <path key={index} d={p} fill="#2E7CFF" />
                  ))}
                </g>
              </motion.g>
            )}
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  );
}
