"use client";
// animate-ui's Stars Background (https://animate-ui.com/docs/components/backgrounds/stars),
// pulled in via `npx shadcn@latest view @animate-ui/components-backgrounds-stars`
// (a read-only registry call -- `add` was avoided this time since it
// silently ran a full, uninitialized shadcn `init` on an earlier pull and
// polluted globals.css/layout.tsx/package.json; see docs/AI_HANDOFF.md).
// Adapted to this codebase's own conventions: no `cn` (a template literal,
// same as every other component in this repo), and `motion` imported from
// the already-installed `framer-motion` instead of the separate `motion`
// package the registry item pulls in (they're the same library's React
// API). The star-layer/parallax mechanics are otherwise unchanged from the
// original -- three layered `box-shadow` star fields at different sizes and
// speeds, each looping a seamless vertical drift by animating from y:0 to
// y:-2000px across a doubled 4000px-tall strip, plus a spring-eased
// pointer-parallax offset on the whole stack.
import * as React from "react";
import { type HTMLMotionProps, motion, useMotionValue, useSpring, type SpringOptions, type Transition } from "framer-motion";

type StarLayerProps = HTMLMotionProps<"div"> & {
  count: number;
  size: number;
  transition: Transition;
  starColor: string;
};

// Deterministic, not `Math.random()` -- the original generates fresh
// random positions in a `useEffect` + `setState` purely to dodge the
// server/client mismatch a real `Math.random()` call during render would
// cause. A seeded PRNG sidesteps that need entirely: the same star field
// renders identically on server and client, computed directly in render
// via `useMemo` below instead of a post-mount effect (which this repo's
// lint config flags as `react-hooks/set-state-in-effect`).
function generateStars(count: number, starColor: string, seed: number) {
  let s = seed;
  function next() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(next() * 4000) - 2000;
    const y = Math.floor(next() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(", ");
}

function StarLayer({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: "linear" },
  starColor = "#fff",
  className,
  ...props
}: StarLayerProps) {
  // Seeded by count+size so each of the three layers gets its own field
  // rather than three identical ones.
  const boxShadow = React.useMemo(() => generateStars(count, starColor, count * 1000 + size), [count, size, starColor]);

  return (
    <motion.div
      data-slot="star-layer"
      animate={{ y: [0, -2000] }}
      transition={transition}
      className={`absolute top-0 left-0 h-[2000px] w-full ${className ?? ""}`}
      {...props}
    >
      <div className="absolute rounded-full bg-transparent" style={{ width: `${size}px`, height: `${size}px`, boxShadow }} />
      <div className="absolute top-[2000px] rounded-full bg-transparent" style={{ width: `${size}px`, height: `${size}px`, boxShadow }} />
    </motion.div>
  );
}

type StarsBackgroundProps = React.ComponentProps<"div"> & {
  factor?: number;
  speed?: number;
  transition?: SpringOptions;
  starColor?: string;
  pointerEvents?: boolean;
  /** Background under the stars -- defaults to the reference's own
   *  ellipse-at-bottom grayscale; pass a different value to recolor it. */
  background?: string;
};

function StarsBackground({
  children,
  className,
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = "#fff",
  pointerEvents = true,
  background = "radial-gradient(ellipse at bottom, #262626 0%, #000 100%)",
  ...props
}: StarsBackgroundProps) {
  const offsetX = useMotionValue(1);
  const offsetY = useMotionValue(1);

  const springX = useSpring(offsetX, transition);
  const springY = useSpring(offsetY, transition);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newOffsetX = -(e.clientX - centerX) * factor;
      const newOffsetY = -(e.clientY - centerY) * factor;
      offsetX.set(newOffsetX);
      offsetY.set(newOffsetY);
    },
    [offsetX, offsetY, factor],
  );

  return (
    <div
      data-slot="stars-background"
      className={`relative size-full overflow-hidden ${className ?? ""}`}
      style={{ background }}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div style={{ x: springX, y: springY }} className={pointerEvents ? undefined : "pointer-events-none"}>
        <StarLayer count={1000} size={1} transition={{ repeat: Infinity, duration: speed, ease: "linear" }} starColor={starColor} />
        <StarLayer count={400} size={2} transition={{ repeat: Infinity, duration: speed * 2, ease: "linear" }} starColor={starColor} />
        <StarLayer count={200} size={3} transition={{ repeat: Infinity, duration: speed * 3, ease: "linear" }} starColor={starColor} />
      </motion.div>
      {children}
    </div>
  );
}

export { StarLayer, StarsBackground, type StarLayerProps, type StarsBackgroundProps };
