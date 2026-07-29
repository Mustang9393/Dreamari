type ClayBuildingProps = { front: string; side: string; roof: string; s?: number };

export function ClayBuilding({ front, side, roof, s = 1 }: ClayBuildingProps) {
  return (
    <svg viewBox="0 0 46 52" width={46 * s} height={52 * s} style={{ display: "block" }}>
      <ellipse cx="22" cy="49" rx="17" ry="2.5" fill="rgba(0,0,0,0.22)" />
      <path d="M3,21 L3,46 Q3,48 5,48 L27,48 Q29,48 29,46 L29,21 Z" fill={front} />
      <path d="M29,21 L43,13 L43,38 L29,46 Z" fill={side} />
      <path d="M3,21 L29,21 L43,13 L17,13 Z" fill={roof} />
      <path d="M3,21 L29,21 L43,13 L17,13 Z" fill="rgba(255,255,255,0.09)" />
      <rect x="6" y="25" width="8" height="6" rx="1.5" fill="rgba(180,225,255,0.52)" />
      <rect x="17" y="25" width="8" height="6" rx="1.5" fill="rgba(180,225,255,0.52)" />
      <rect x="6" y="34" width="8" height="6" rx="1.5" fill="rgba(180,225,255,0.52)" />
      <rect x="17" y="35" width="8" height="12" rx="2" fill="rgba(110,160,255,0.38)" />
      <rect x="34" y="8" width="4" height="7" rx="1" fill={side} />
      <rect x="33" y="7" width="6" height="2.5" rx="1" fill={roof} />
    </svg>
  );
}

export function ClayTree({ leaf, s = 1 }: { leaf: string; s?: number }) {
  return (
    <svg viewBox="0 0 34 44" width={34 * s} height={44 * s} style={{ display: "block" }}>
      <ellipse cx="17" cy="41" rx="11" ry="2.2" fill="rgba(0,0,0,0.18)" />
      <rect x="13" y="28" width="8" height="14" rx="2.5" fill="#8b5a2b" />
      <rect x="14" y="28" width="4" height="14" rx="1.5" fill="#a0692f" />
      <ellipse cx="17" cy="19" rx="14" ry="15" fill={leaf} />
      <ellipse cx="17" cy="16" rx="13" ry="14" fill={leaf} />
      <ellipse cx="9" cy="21" rx="7" ry="8" fill={leaf} />
      <ellipse cx="25" cy="21" rx="7" ry="8" fill={leaf} />
      <ellipse cx="12" cy="10" rx="5" ry="4.5" fill="rgba(255,255,255,0.20)" />
    </svg>
  );
}

export function ClayPine({ s = 1 }: { s?: number }) {
  return (
    <svg viewBox="0 0 30 44" width={30 * s} height={44 * s} style={{ display: "block" }}>
      <ellipse cx="15" cy="42" rx="10" ry="2" fill="rgba(0,0,0,0.18)" />
      <rect x="12" y="32" width="6" height="11" rx="1.5" fill="#8b5a2b" />
      <polygon points="15,2 28,34 2,34" fill="#14532d" />
      <polygon points="15,7 26,32 4,32" fill="#166534" />
      <polygon points="15,13 24,30 6,30" fill="#15803d" />
      <polygon points="15,18 22,28 8,28" fill="#22c55e" />
      <polygon points="15,2 21,22 15,20" fill="rgba(255,255,255,0.13)" />
    </svg>
  );
}

export type Deco = {
  xf: number;
  yf: number;
  el: () => React.ReactNode;
  delay: number;
};

// Positions as fractions of [w, contentH] — placed in the road-margin zones
// between the step labels, alternating left/right of the winding road.
export const DECOS: Deco[] = [
  { xf: 0.615, yf: 0.17, el: () => <ClayBuilding front="#1e3a8a" side="#172866" roof="#2563eb" s={0.82} />, delay: 0 },
  { xf: 0.355, yf: 0.375, el: () => <ClayPine s={0.7} />, delay: 1.1 },
  { xf: 0.592, yf: 0.435, el: () => <ClayBuilding front="#4c1d95" side="#3b166e" roof="#6d28d9" s={0.78} />, delay: 0.3 },
  { xf: 0.585, yf: 0.555, el: () => <ClayTree leaf="#059669" s={0.8} />, delay: 0.8 },
  { xf: 0.368, yf: 0.615, el: () => <ClayBuilding front="#0e5a72" side="#0a4258" roof="#0891b2" s={0.72} />, delay: 1.4 },
  { xf: 0.378, yf: 0.73, el: () => <ClayTree leaf="#166534" s={0.76} />, delay: 0.2 },
  { xf: 0.568, yf: 0.79, el: () => <ClayPine s={0.65} />, delay: 0.9 },
];
