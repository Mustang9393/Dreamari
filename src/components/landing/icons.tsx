type IconProps = { c: string; size?: number };

export function IconAssessment({ c, size = 34 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <rect x="5" y="2" width="14" height="20" rx="2.5" stroke={c} strokeWidth="2" />
      <path d="M9 2.5V1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke={c} strokeWidth="1.8" />
      <path d="M8 9l2 2 4-4.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14.5h8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17.5h5" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTarget({ c, size = 34 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke={c} strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill={c} />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function IconGamepad({ c, size = 34 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <rect x="2" y="7" width="20" height="13" rx="5" stroke={c} strokeWidth="2" />
      <path d="M8 11v4M6 13h4" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="15.5" cy="11.5" r="1.5" fill={c} />
      <circle cx="17.5" cy="14.5" r="1.5" fill={c} />
    </svg>
  );
}

export function IconCompass({ c, size = 34 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill={c} />
      <path d="M15.5 8.5L13 13l-5 1.5 2.5-4.5z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" fill={c} fillOpacity="0.25" />
      <path d="M8.5 15.5l2.5-4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function IconNetwork({ c, size = 34 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <circle cx="12" cy="4" r="2.5" fill={c} />
      <circle cx="4" cy="19" r="2.5" fill={c} />
      <circle cx="20" cy="19" r="2.5" fill={c} />
      <path d="M12 6.5L4.8 16.5M12 6.5L19.2 16.5M6.5 19h11" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
