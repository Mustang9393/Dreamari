// Match ring: percentage in the middle, "match" language around it. The score
// reflects what the student actually does in Dreamari (doc 14). Shared between
// the profile screens and the landing page's conceptual mocks, so the marketing
// graphic IS the product element, not a redrawing of it.

export function matchTier(score: number): string {
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Solid match";
  if (score >= 25) return "Early match";
  return "Low signal";
}

export function MatchRing({ score, size = 44 }: { score: number; size?: number }) {
  const stroke = size >= 40 ? 4 : 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span title={`${matchTier(score)}: from your activity in Dreamari`} className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--glass-surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent-subtle)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
      </svg>
      <span className="font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: size >= 44 ? 12 : size >= 36 ? 10.5 : 8.5 }}>{score}%</span>
    </span>
  );
}
