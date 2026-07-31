type IconProps = {
  className?: string;
};

const base = "size-full";

export function BookIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

export function GraduationCapIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 8 10-5 10 5-10 5-10-5Z" />
      <path d="M6 10.5v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" />
      <path d="M22 8v6" />
    </svg>
  );
}

export function BriefcaseIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = base }: IconProps) {
  // Bolder stroke than the other icons here on purpose — this one stands alone as a back
  // affordance (no label next to it), so it needs to read clearly at a glance.
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronDownIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PiggyBankIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 6a8 8 0 0 0-8 7c0 1.8.8 3.1 1.8 4.1L4 20h3.5l.7-1.4c.9.2 1.8.4 2.8.4 4.4 0 8-2.7 8-6 0-.6-.1-1.1-.3-1.6" />
      <path d="M18 10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1h-1" />
      <path d="M15 6V4" />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ScaleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v18" />
      <path d="M5 8h14" />
      <path d="m5 8-3 6a3 3 0 0 0 6 0Z" />
      <path d="m19 8-3 6a3 3 0 0 0 6 0Z" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function HandIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v5.5" />
      <path d="M12 10.5V4a1.5 1.5 0 0 1 3 0v6.5" />
      <path d="M15 11V6a1.5 1.5 0 0 1 3 0v9" />
      <path d="M6 12.5V9a1.5 1.5 0 0 1 3-.3" />
      <path d="M6 12.5C5 12.5 5 14 5 15c0 3.5 3 6 7 6s6.5-2.5 6.5-5.5v-2" />
    </svg>
  );
}

export function HomeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function MapIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  );
}

export function CompassIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m14.5 9.5-2 5-5 2 2-5Z" />
    </svg>
  );
}

export function GlobeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  );
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function HeartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function XIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function LightbulbIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.6.5 1 1.3 1 2.1V16h6v-.4c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function StarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="m12 2 3.1 6.4 7 1-5 5 1.2 7-6.3-3.3L5.7 21.4l1.2-7-5-5 7-1L12 2Z" />
    </svg>
  );
}

export function ArrowLeftRightIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3-5 5 5 5" />
      <path d="M3 8h18" />
      <path d="m16 21 5-5-5-5" />
      <path d="M21 16H3" />
    </svg>
  );
}

export function SunIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
    </svg>
  );
}
