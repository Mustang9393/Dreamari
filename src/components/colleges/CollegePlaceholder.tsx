import React, { useId, type CSSProperties } from "react";
import { DREAMARI_MARK_PATH } from "./college-brand-mark";

export const COLLEGE_ART_VARIANTS = ["neutral", "contour", "weave"] as const;
type Variant = typeof COLLEGE_ART_VARIANTS[number];
function hash(value: string) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

/** Quiet missing-photo media, not promotional artwork. Matches the dark
 * photo/scrim layer used by Explore cards in both light and dark themes.
 * Detail stays above card copy; SVG always preserves its proportions. */
export function CollegePlaceholder({ seed = "dreamari", variant, accent, className = "", style }: {
  seed?: string; variant?: Variant; accent?: string; className?: string; style?: CSSProperties;
}) {
  const id = `college-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const url = (name: string) => `url(#${id}-${name})`;
  const scene = variant ?? COLLEGE_ART_VARIANTS[hash(seed) % COLLEGE_ART_VARIANTS.length];
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false" data-college-art={scene} className={className} style={{ width: "100%", height: "100%", display: "block", ...style }}>
    <defs>
      {/* Existing dark card and scrim surfaces, independent of page theme. */}
      <linearGradient id={`${id}-surface`} x2=".25" y2="1"><stop stopColor="#202431" /><stop offset=".55" stopColor="#151829" /><stop offset="1" stopColor="#0c1023" /></linearGradient>
      <radialGradient id={`${id}-light`}><stop stopColor="#f4f7ff" stopOpacity=".035" /><stop offset="1" stopColor="#f4f7ff" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-accent`}><stop stopColor={accent ?? "var(--college-art-accent, var(--primary, #2f6bf2))"} stopOpacity=".045" /><stop offset="1" stopColor="#2f6bf2" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-pattern-fade`} x2="0" y2="1"><stop stopColor="white" /><stop offset=".5" stopColor="white" /><stop offset=".7" stopColor="black" /></linearGradient>
      <mask id={`${id}-mask`}><path d="M0 0H800V1050H0Z" fill={url("pattern-fade")} /></mask>
      <pattern id={`${id}-dots`} width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="1" fill="#f4f7ff" opacity=".06" /></pattern>
    </defs>
    <path d="M0 0H800V1050H0Z" fill={url("surface")} />
    <ellipse cx="400" cy="210" rx="410" ry="350" fill={url("light")} />
    <ellipse cx="660" cy="70" rx="470" ry="360" fill={url("accent")} />
    <g mask={url("mask")}>
      {scene === "neutral" && <path d="M0 0H800V700H0Z" fill={url("dots")} />}
      {scene === "contour" && <g fill="none" stroke="#f4f7ff" strokeWidth="1" opacity=".035">
        {[0,1,2,3,4].map(i => <path key={i} d={`M${-220+i*55} -70C${-30+i*55} 180 ${30+i*55} 360 ${-100+i*55} 600`} />)}
        {[0,1,2].map(i => <path key={i} d={`M${610+i*65} -30Q${480+i*65} 280 ${800+i*65} 520`} />)}
      </g>}
      {scene === "weave" && <g fill="none" stroke="#f4f7ff" strokeWidth="1" opacity=".025">
        {Array.from({length:16},(_,i) => <path key={i} d={`M${-650+i*110} 0l800 700M${-650+i*110} 700l800-700`} />)}
      </g>}
    </g>
    {/* Edge-to-edge symbolic campus: fills the photo area instead of nesting
       a tiny image icon inside it. Neutral tonal layers retain placeholder status. */}
    <defs>
      <linearGradient id={`${id}-campus-fade`} x2="0" y2="1"><stop offset=".26" stopColor="white" /><stop offset=".76" stopColor="black" /></linearGradient>
      <mask id={`${id}-campus-mask`}><path d="M0 0H800V1050H0Z" fill={url("campus-fade")} /></mask>
      <linearGradient id={`${id}-stone`} x2=".6" y2="1"><stop stopColor="#647087" stopOpacity=".28" /><stop offset="1" stopColor="#647087" stopOpacity=".06" /></linearGradient>
    </defs>
    <g mask={url("campus-mask")} strokeLinejoin="round" strokeLinecap="round">
      <circle cx="620" cy="128" r="57" fill="#b0b6c2" opacity=".07" />
      <circle cx="620" cy="128" r="73" fill="none" stroke="#b0b6c2" strokeOpacity=".07" />
      <path d="M-90 276Q245-28 814 90M-120 302Q285 0 835 117" fill="none" stroke="#99c2ff" strokeOpacity=".07" strokeWidth="2" />
      <g fill="#b0b6c2" opacity=".24"><circle cx="112" cy="160" r="3" /><circle cx="248" cy="99" r="3" /><circle cx="426" cy="78" r="3" /></g>
      <path d="m95 159 17-1m0-9v18M455 141h20m-10-10v20" stroke="#b0b6c2" strokeOpacity=".18" strokeWidth="2" />
      {/* Background wings, cropped naturally at the edges. */}
      <path d="M-30 496V292l243-52v256m374 0V240l243 52v204" fill={url("stone")} stroke="#b0b6c2" strokeOpacity=".19" strokeWidth="2" />
      <path d="m-30 281 243-52v18L-30 303m617-74 243 52v22l-243-56" fill="#b0b6c2" fillOpacity=".1" stroke="#b0b6c2" strokeOpacity=".2" strokeWidth="2" />
      {[22,80,138,640,698,756].map(x => <g key={x} fill="#b0b6c2" fillOpacity=".12">
        <rect x={x} y="320" width="23" height="38" rx="3" /><rect x={x} y="385" width="23" height="38" rx="3" />
      </g>)}
      <path d="M195 492V253h410v239Z" fill="#252b3c" stroke="#b0b6c2" strokeOpacity=".28" strokeWidth="2" />
      <path d="m166 258 234-132 234 132-20 17-214-120-214 120Z" fill="#647087" fillOpacity=".27" stroke="#b0b6c2" strokeOpacity=".35" strokeWidth="2" />
      <path d="m202 259 198-111 198 111Z" fill={url("stone")} />
      <path d="M195 278h410M195 295h410" stroke="#b0b6c2" strokeOpacity=".21" strokeWidth="2" />
      <g transform="translate(358 204) scale(3.92523)"><path d={DREAMARI_MARK_PATH} fill="#c3cad7" opacity=".56" /></g>
      {[222,298,374,450,526].map(x => <g key={x}>
        <path d={`M${x} 477V350a26 26 0 0 1 52 0v127Z`} fill="#141a2b" stroke="#b0b6c2" strokeOpacity=".22" strokeWidth="2" />
        <path d={`M${x+26} 334v143M${x+2} 382h48`} fill="none" stroke="#b0b6c2" strokeOpacity=".14" strokeWidth="2" />
        <path d={`M${x-8} 312v167`} stroke="#b0b6c2" strokeOpacity=".14" strokeWidth="5" />
      </g>)}
      <path d="M183 489h434l18 18H165Zm-18 23h470l18 19H147Zm-18 24h506l20 20H127Z" fill="#b0b6c2" fillOpacity=".12" stroke="#b0b6c2" strokeOpacity=".18" strokeWidth="2" />
      {/* Foreground planting gives scale and a layered, illustrative finish. */}
      {[{x:77,y:413,s:1},{x:710,y:392,s:1.15}].map(({x,y,s}) => <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0 112V-50" stroke="#b0b6c2" strokeOpacity=".24" strokeWidth="5" />
        <path d="M0-121C-44-100-80-43-58-11-95 29-39 69 0 47 39 69 95 29 58-11 80-43 44-100 0-121Z" fill="#303b4c" stroke="#b0b6c2" strokeOpacity=".15" strokeWidth="2" />
        <path d="M0 52V-88M0-25l-31-30M0 6l34-35" fill="none" stroke="#b0b6c2" strokeOpacity=".17" strokeWidth="2" />
      </g>)}
      <path d="M-50 560Q125 477 309 570L170 756H-50Zm900 0Q675 477 491 570l139 186h220Z" fill="#526176" opacity=".12" />
      <path d="M319 557 178 744m303-187 141 187M292 595h216M260 635h280" fill="none" stroke="#b0b6c2" strokeOpacity=".18" strokeWidth="2" />
    </g>
  </svg>;
}
