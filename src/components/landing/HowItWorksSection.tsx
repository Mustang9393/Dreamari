"use client";

import { useEffect, useRef, useState } from "react";
import { DECOS } from "./ClayDecorations";
import { IconAssessment, IconCompass, IconGamepad, IconNetwork, IconTarget } from "./icons";

const THRESHOLDS = [0.02, 0.26, 0.5, 0.74, 0.97];

// Scroll progress (0–1) at which each phase of the heading transition happens.
// HOLD: the heading stays fully visible and un-faded until this point — a
// deliberate pause before it starts disappearing, so it doesn't feel like it
// vanishes the instant scrolling begins. FADE_END: fully faded out by here,
// handing the screen over to the winding road/step content, centered and
// filling the whole viewport.
const HEADING_HOLD = 0.05;
const HEADING_FADE_END = 0.19;

const STEPS = [
  {
    num: "01",
    key: "build",
    label: "BUILD",
    side: "left" as const,
    desc: "Know yourself first.",
    gradFrom: "#4a82ff",
    gradTo: "#a0c4ff",
    borderColor: "#4a82ff",
    glowActive: "rgba(74,130,255,0.7)",
    glowDim: "rgba(74,130,255,0.18)",
    bgActive: "radial-gradient(circle at 40% 35%, rgba(42,79,176,1) 0%, rgba(12,26,68,1) 100%)",
    bgDim: "radial-gradient(circle at 40% 35%, rgba(22,44,110,0.9) 0%, rgba(8,14,44,0.95) 100%)",
    Icon: IconAssessment,
    iconColor: "#CFE0FF",
  },
  {
    num: "02",
    key: "match",
    label: "MATCH",
    side: "right" as const,
    desc: "Find your perfect fit.",
    gradFrom: "#FF6058",
    gradTo: "#ffb8b8",
    borderColor: "rgba(232,85,107,0.7)",
    glowActive: "rgba(232,85,107,0.65)",
    glowDim: "rgba(232,85,107,0.14)",
    bgActive: "radial-gradient(circle at 40% 35%, rgba(90,22,52,1) 0%, rgba(38,12,30,1) 100%)",
    bgDim: "radial-gradient(circle at 40% 35%, rgba(30,12,24,0.95) 0%, rgba(10,8,18,0.95) 100%)",
    Icon: IconTarget,
    iconColor: "#FF8098",
  },
  {
    num: "03",
    key: "play",
    label: "PLAY",
    side: "left" as const,
    desc: "Live the role.",
    gradFrom: "#B79CFF",
    gradTo: "#ddd0ff",
    borderColor: "rgba(150,110,255,0.7)",
    glowActive: "rgba(150,110,255,0.65)",
    glowDim: "rgba(150,110,255,0.14)",
    bgActive: "radial-gradient(circle at 40% 35%, rgba(52,26,90,1) 0%, rgba(18,10,42,1) 100%)",
    bgDim: "radial-gradient(circle at 40% 35%, rgba(24,14,46,0.95) 0%, rgba(8,6,20,0.95) 100%)",
    Icon: IconGamepad,
    iconColor: "#B79CFF",
  },
  {
    num: "04",
    key: "explore",
    label: "EXPLORE",
    side: "right" as const,
    desc: "Go deeper, everywhere.",
    gradFrom: "#00C0E8",
    gradTo: "#80e4f4",
    borderColor: "rgba(45,200,210,0.7)",
    glowActive: "rgba(45,200,210,0.6)",
    glowDim: "rgba(45,200,210,0.12)",
    bgActive: "radial-gradient(circle at 40% 35%, rgba(10,60,68,1) 0%, rgba(6,20,40,1) 100%)",
    bgDim: "radial-gradient(circle at 40% 35%, rgba(8,22,34,0.95) 0%, rgba(4,8,18,0.95) 100%)",
    Icon: IconCompass,
    iconColor: "#4FD9E3",
  },
  {
    num: "05",
    key: "connect",
    label: "CONNECT",
    side: "left" as const,
    desc: "Meet the pros.",
    gradFrom: "#FFCC00",
    gradTo: "#ffe780",
    borderColor: "rgba(247,176,30,0.7)",
    glowActive: "rgba(247,176,30,0.65)",
    glowDim: "rgba(247,176,30,0.14)",
    bgActive: "radial-gradient(circle at 40% 35%, rgba(70,52,8,1) 0%, rgba(28,20,4,1) 100%)",
    bgDim: "radial-gradient(circle at 40% 35%, rgba(24,18,6,0.95) 0%, rgba(8,6,4,0.95) 100%)",
    Icon: IconNetwork,
    iconColor: "#F5C24B",
  },
];

// Generates a grid-aligned SVG path with rounded 90° corners: each segment
// goes vertical → horizontal → vertical, like a road turning at junctions.
function orthogonalPath(nodes: { x: number; y: number }[], r: number): string {
  let d = `M${nodes[0].x.toFixed(1)},${nodes[0].y.toFixed(1)}`;
  for (let i = 1; i < nodes.length; i++) {
    const p = nodes[i - 1];
    const c = nodes[i];
    const midY = (p.y + c.y) / 2;
    if (c.x > p.x) {
      d += ` L${p.x.toFixed(1)},${(midY - r).toFixed(1)}`;
      d += ` A${r},${r} 0 0,1 ${(p.x + r).toFixed(1)},${midY.toFixed(1)}`;
      d += ` L${(c.x - r).toFixed(1)},${midY.toFixed(1)}`;
      d += ` A${r},${r} 0 0,1 ${c.x.toFixed(1)},${(midY + r).toFixed(1)}`;
    } else {
      d += ` L${p.x.toFixed(1)},${(midY - r).toFixed(1)}`;
      d += ` A${r},${r} 0 0,0 ${(p.x - r).toFixed(1)},${midY.toFixed(1)}`;
      d += ` L${(c.x + r).toFixed(1)},${midY.toFixed(1)}`;
      d += ` A${r},${r} 0 0,0 ${c.x.toFixed(1)},${(midY + r).toFixed(1)}`;
    }
  }
  return d;
}

type HowItWorksSectionProps = { scrollProgress: number };

export function HowItWorksSection({ scrollProgress }: HowItWorksSectionProps) {
  // Starts at 0,0 (not window.innerWidth/innerHeight) because this component's initial
  // render also happens on the server during prerendering, where `window` doesn't exist —
  // reading it directly in a useState initializer crashes the production build. The real
  // size is synced in on mount below; the section is below the fold anyway, so the brief
  // instant before that effect runs isn't visible.
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(3000);

  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [vp]);

  const { w, h } = vp;
  const isMobile = w < 640;

  if (w === 0 || h === 0) return null;

  const safeProgress = isNaN(scrollProgress) ? 0 : scrollProgress;
  const dashOffset = Math.max(0, pathLength * (1 - Math.min(1, safeProgress)));
  const active = THRESHOLDS.map((t) => scrollProgress >= t);

  const headingFade =
    safeProgress <= HEADING_HOLD
      ? 1
      : Math.max(0, 1 - (safeProgress - HEADING_HOLD) / (HEADING_FADE_END - HEADING_HOLD));

  const headingH = Math.max(80, Math.min(h * 0.15, 120));
  const effectiveHeadingH = headingH * headingFade;
  const contentH = h - headingH;

  if (!isMobile) {
    const spread = 0.17;
    const nodeXFracs = [0.5, 0.5 + spread, 0.5 - spread, 0.5 + spread, 0.5];
    const nodeYFracs = [0.1, 0.29, 0.5, 0.71, 0.9];

    const nodes = nodeYFracs.map((yf, i) => ({
      x: w * nodeXFracs[i],
      y: effectiveHeadingH + (h - effectiveHeadingH) * yf,
    }));

    const cornerR = Math.min(Math.max(w * 0.03, 28), 48);
    const roadPath = orthogonalPath(nodes, cornerR);

    const nodeSize = Math.min(90, Math.max(64, w * 0.055));
    const nr = nodeSize / 2;
    const iconSize = Math.round(nodeSize * 0.44);
    const maxLabelW = Math.min((0.5 - spread) * w - nr - 20 - 12, 360);
    const labelGap = nr + 22;

    const nameFontSize = Math.min(52, Math.max(30, w * 0.031)) + 4;
    const descFontSize = Math.round(nameFontSize * 0.4);
    const numFontSize = 11;
    const roadW = Math.min(42, Math.max(18, w * 0.024));

    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(4,9,28,0.55)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 30% at 50% 100%, rgba(90,50,170,0.18) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: headingH,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: headingFade,
            transform: `translateY(${-(1 - headingFade) * 28}px) scale(${0.88 + 0.12 * headingFade})`,
            transformOrigin: "top center",
            pointerEvents: headingFade < 0.05 ? "none" : "auto",
          }}
        >
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: numFontSize + 1,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(127,168,255,0.65)",
              margin: 0,
            }}
          >
            Your path. Your pace. Your future.
          </p>
          <p
            style={{
              fontFamily: "'FavoritExtraBoldC','Montserrat',sans-serif",
              fontWeight: 800,
              fontSize: Math.min(56, w * 0.037),
              letterSpacing: -1.5,
              color: "white",
              textTransform: "uppercase",
              lineHeight: 1,
              margin: 0,
            }}
          >
            How It Works
          </p>
        </div>

        {DECOS.map((d, i) => {
          const decoW = 46;
          const decoH = 52;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: d.xf * w - decoW * 0.5,
                top: effectiveHeadingH + d.yf * contentH - decoH * 0.5,
                zIndex: 1,
                opacity: 0.72,
                animation: `deco-float ${2.8 + i * 0.35}s ease-in-out infinite`,
                animationDelay: `${d.delay}s`,
                pointerEvents: "none",
              }}
            >
              <d.el />
            </div>
          );
        })}

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, overflow: "visible" }} viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <linearGradient id="rg" gradientUnits="userSpaceOnUse" x1={nodes[0].x} y1={nodes[0].y} x2={nodes[4].x} y2={nodes[4].y}>
              <stop offset="0%" stopColor="#1F5FF0" />
              <stop offset="25%" stopColor="#FF6058" />
              <stop offset="50%" stopColor="#CB30E0" />
              <stop offset="75%" stopColor="#00C0E8" />
              <stop offset="100%" stopColor="#FFCC00" />
            </linearGradient>
            <filter id="haloBlur" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <filter id="roadGlow">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={roadPath} stroke="rgba(60,100,255,0.09)" strokeWidth={roadW * 3.0} strokeLinecap="butt" strokeLinejoin="round" fill="none" filter="url(#haloBlur)" />
          <path d={roadPath} stroke="rgba(255,255,255,0.13)" strokeWidth={roadW + 4} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
          <path d={roadPath} stroke="#03091a" strokeWidth={roadW} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
          <path d={roadPath} stroke="#080f24" strokeWidth={roadW * 0.74} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
          <path
            ref={pathRef}
            d={roadPath}
            stroke="url(#rg)"
            strokeWidth={roadW * 0.44}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            filter="url(#roadGlow)"
          />
          <path
            d={roadPath}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="round"
            strokeDasharray={`${Math.round(w * 0.018)} ${Math.round(w * 0.022)}`}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {STEPS.map((step, i) => {
          const node = nodes[i];
          const isActive = active[i];
          const isLeft = step.side === "left";
          const labelLeft = isLeft ? node.x - nr - labelGap - maxLabelW : node.x + nr + labelGap;

          return (
            <div key={step.key}>
              <div
                style={{
                  position: "absolute",
                  left: node.x - nr,
                  top: node.y - nr,
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${isActive ? step.borderColor : "rgba(100,120,160,0.22)"}`,
                  background: isActive ? step.bgActive : step.bgDim,
                  filter: isActive
                    ? `drop-shadow(0 0 ${Math.round(nodeSize * 0.26)}px ${step.glowActive}) drop-shadow(0 0 ${Math.round(nodeSize * 0.12)}px ${step.glowActive})`
                    : `drop-shadow(0 0 6px ${step.glowDim})`,
                  transform: isActive ? "scale(1.13)" : "scale(1)",
                  transition: "all 0.55s cubic-bezier(0.34,1.56,0.64,1)",
                  zIndex: 4,
                }}
              >
                <div style={{ opacity: isActive ? 1 : 0.35, transition: "opacity 0.5s ease" }}>
                  <step.Icon c={step.iconColor} size={iconSize} />
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  left: labelLeft,
                  top: node.y,
                  width: maxLabelW,
                  textAlign: isLeft ? "right" : "left",
                  transform: isActive ? "translateY(-50%) translateX(0px)" : `translateY(-50%) translateX(${isLeft ? "12px" : "-12px"}) scale(0.94)`,
                  opacity: isActive ? 1 : 0.38,
                  transition: "all 0.65s cubic-bezier(0.34,1.2,0.64,1)",
                  zIndex: 5,
                  pointerEvents: "none",
                }}
              >
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: numFontSize,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    color: isActive ? step.gradFrom : "rgba(127,168,255,0.4)",
                    margin: "0 0 6px 0",
                    transition: "color 0.5s ease",
                  }}
                >
                  {step.num}
                </p>

                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 800,
                    fontSize: nameFontSize,
                    lineHeight: 1.0,
                    letterSpacing: Math.min(-1.5, -nameFontSize * 0.034),
                    textTransform: "uppercase",
                    margin: "0 0 12px 0",
                    ...(isActive
                      ? {
                          backgroundImage: `linear-gradient(135deg, ${step.gradFrom}, ${step.gradTo})`,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                          filter: `drop-shadow(0 0 18px ${step.gradFrom}55)`,
                        }
                      : { color: "rgba(190,210,255,0.28)" }),
                    transition: "all 0.55s ease",
                  }}
                >
                  {step.label}
                </p>

                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: descFontSize,
                    lineHeight: 1.55,
                    color: isActive ? "#e8f2ff" : "rgba(157,176,208,0.35)",
                    margin: 0,
                    transition: "color 0.5s ease",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Mobile: centered vertical timeline ──
  const nodeR = 22;
  const nodeCx = w / 2;
  const sideGap = nodeR + 14;
  const labelHalfW = Math.floor(nodeCx - sideGap - 10);

  const mobileYFracs = [0.11, 0.29, 0.5, 0.71, 0.89];
  const mobileNodes = mobileYFracs.map((yf) => ({ x: nodeCx, y: headingH + contentH * yf }));
  const mobilePathD = mobileNodes.map((n, i) => (i === 0 ? `M${n.x},${n.y}` : `L${n.x},${n.y}`)).join(" ");

  const mobileNameSize = Math.min(24, Math.max(17, w * 0.06));
  const mobileDescSize = Math.round(mobileNameSize * 0.42);
  const mobileNumSize = 9;
  const mobileIconSize = Math.round(nodeR * 0.86);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,9,28,0.55)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 30% at 50% 100%, rgba(90,50,170,0.18) 0%, transparent 70%)" }} />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headingH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          opacity: headingFade,
          transform: `translateY(${-(1 - headingFade) * 28}px) scale(${0.88 + 0.12 * headingFade})`,
          transformOrigin: "top center",
          pointerEvents: headingFade < 0.05 ? "none" : "auto",
        }}
      >
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(127,168,255,0.65)", margin: 0 }}>
          Your path. Your pace. Your future.
        </p>
        <p
          style={{
            fontFamily: "'FavoritExtraBoldC','Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: Math.min(30, w * 0.082),
            letterSpacing: -1,
            color: "white",
            textTransform: "uppercase",
            lineHeight: 1,
            margin: 0,
          }}
        >
          How It Works
        </p>
      </div>

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="rgm" gradientUnits="userSpaceOnUse" x1={mobileNodes[0].x} y1={mobileNodes[0].y} x2={mobileNodes[4].x} y2={mobileNodes[4].y}>
            <stop offset="0%" stopColor="#1F5FF0" />
            <stop offset="25%" stopColor="#FF6058" />
            <stop offset="50%" stopColor="#CB30E0" />
            <stop offset="75%" stopColor="#00C0E8" />
            <stop offset="100%" stopColor="#FFCC00" />
          </linearGradient>
          <filter id="mglow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={mobilePathD} stroke="#03091a" strokeWidth={12} strokeLinecap="round" fill="none" />
        <path d={mobilePathD} stroke="#070f26" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path ref={pathRef} d={mobilePathD} stroke="url(#rgm)" strokeWidth={5} strokeLinecap="round" fill="none" strokeDasharray={pathLength} strokeDashoffset={dashOffset} filter="url(#mglow)" />
      </svg>

      {STEPS.map((step, i) => {
        const node = mobileNodes[i];
        const isActive = active[i];
        const nodeDiam = nodeR * 2;
        const isLeft = step.side === "left";
        const labelLeft = isLeft ? nodeCx - sideGap - labelHalfW : nodeCx + sideGap;

        return (
          <div key={step.key}>
            <div
              style={{
                position: "absolute",
                left: node.x - nodeR,
                top: node.y - nodeR,
                width: nodeDiam,
                height: nodeDiam,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1.5px solid ${isActive ? step.borderColor : "rgba(100,120,160,0.22)"}`,
                background: isActive ? step.bgActive : step.bgDim,
                filter: isActive ? `drop-shadow(0 0 10px ${step.glowActive})` : `drop-shadow(0 0 4px ${step.glowDim})`,
                transform: isActive ? "scale(1.12)" : "scale(1)",
                transition: "all 0.55s cubic-bezier(0.34,1.56,0.64,1)",
                zIndex: 3,
              }}
            >
              <div style={{ opacity: isActive ? 1 : 0.35, transition: "opacity 0.5s ease" }}>
                <step.Icon c={step.iconColor} size={mobileIconSize} />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left: labelLeft,
                top: node.y,
                width: labelHalfW,
                textAlign: isLeft ? "right" : "left",
                transform: isActive ? "translateY(-50%)" : `translateY(-50%) translateX(${isLeft ? "6px" : "-6px"})`,
                opacity: isActive ? 1 : 0.38,
                transition: "all 0.55s cubic-bezier(0.34,1.2,0.64,1)",
                zIndex: 4,
                pointerEvents: "none",
              }}
            >
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: mobileNumSize, letterSpacing: 3, textTransform: "uppercase", color: isActive ? step.gradFrom : "rgba(127,168,255,0.4)", margin: "0 0 3px 0", transition: "color 0.5s ease" }}>
                {step.num}
              </p>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: mobileNameSize,
                  lineHeight: 1.0,
                  letterSpacing: -0.8,
                  textTransform: "uppercase",
                  margin: "0 0 5px 0",
                  ...(isActive
                    ? {
                        backgroundImage: `linear-gradient(135deg, ${step.gradFrom}, ${step.gradTo})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        filter: `drop-shadow(0 0 12px ${step.gradFrom}55)`,
                      }
                    : { color: "rgba(190,210,255,0.28)" }),
                  transition: "all 0.55s ease",
                }}
              >
                {step.label}
              </p>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: mobileDescSize, lineHeight: 1.5, color: isActive ? "#e8f2ff" : "rgba(157,176,208,0.35)", margin: 0, transition: "color 0.5s ease" }}>
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
