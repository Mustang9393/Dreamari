"use client";

import { motion, useReducedMotion } from "framer-motion";

// Hand-drawn shooting-star character (no Figma asset). A plump four-point
// sparkle with a face that lives: the whole body sways, the eyes blink on a
// cycle, glints twinkle at the tips, the glow breathes. All motion is
// transform/opacity only (WebKit-safe: blurs are small-area SVG filters).

export function StarRig({ size = 120 }: { size?: number }) {
  const reduced = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" overflow="visible" aria-hidden>
      <defs>
        <radialGradient id="starCore" cx="42%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="55%" stopColor="#FFD873" />
          <stop offset="100%" stopColor="#FFAE3D" />
        </radialGradient>
        <filter id="starGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* breathing glow */}
      <motion.path
        d="M100,18 C115,60 140,85 182,100 C140,115 115,140 100,182 C85,140 60,115 18,100 C60,85 85,60 100,18 Z"
        fill="#FFC95C"
        opacity={0.55}
        filter="url(#starGlow)"
        animate={reduced ? undefined : { scale: [1, 1.14, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      />

      {/* body sway (the face counter-tilts a touch so it reads as balance) */}
      <motion.g
        animate={reduced ? undefined : { rotate: [-5, 5] }}
        transition={{ duration: 3.2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        <path
          d="M100,18 C115,60 140,85 182,100 C140,115 115,140 100,182 C85,140 60,115 18,100 C60,85 85,60 100,18 Z"
          fill="url(#starCore)"
        />
        {/* rim light */}
        <path
          d="M100,26 C92,62 72,84 36,96 C74,86 94,64 100,26 Z"
          fill="#FFFBEA"
          opacity={0.9}
        />

        <motion.g
          animate={reduced ? undefined : { rotate: [2.5, -2.5] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          {/* eyes: blink by squeezing the group */}
          <motion.g
            animate={reduced ? undefined : { scaleY: [1, 1, 0.06, 1, 1, 1, 0.06, 1] }}
            transition={{ duration: 5.6, times: [0, 0.32, 0.35, 0.38, 0.72, 0.86, 0.89, 0.92], repeat: Infinity }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          >
            <circle cx="85" cy="95" r="7" fill="#2A1E3F" />
            <circle cx="115" cy="95" r="7" fill="#2A1E3F" />
            <circle cx="82.5" cy="92" r="2.6" fill="white" />
            <circle cx="112.5" cy="92" r="2.6" fill="white" />
          </motion.g>
          {/* cheeks + smile */}
          <ellipse cx="76" cy="108" rx="5.5" ry="3.6" fill="#FF8E5E" opacity={0.85} />
          <ellipse cx="124" cy="108" rx="5.5" ry="3.6" fill="#FF8E5E" opacity={0.85} />
          <path d="M91,108 Q100,117 109,108" stroke="#2A1E3F" strokeWidth="4" strokeLinecap="round" fill="none" />
        </motion.g>
      </motion.g>

      {/* tip glints, twinkling out of phase */}
      {[
        { x: 152, y: 52, s: 1, d: 0 },
        { x: 44, y: 148, s: 0.7, d: 0.9 },
        { x: 168, y: 128, s: 0.55, d: 1.7 },
      ].map((g, index) => (
        <g key={index} transform={`translate(${g.x} ${g.y}) scale(${g.s})`}>
          <motion.path
            d="M0,-9 C1,-2 2,-1 9,0 C2,1 1,2 0,9 C-1,2 -2,1 -9,0 C-2,-1 -1,-2 0,-9 Z"
            fill="#FFFBEA"
            animate={reduced ? { opacity: 0.6 } : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90] }}
            transition={{ duration: 1.9, delay: g.d, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          />
        </g>
      ))}
    </svg>
  );
}
