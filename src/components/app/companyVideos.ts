// "Videos Inside Leading Companies" (CEO, 4 Sept 2026): real clips shot
// inside partner companies, the last rail on Explore > Browse, under
// Typical Pay. `company` must match a COMPANY_MARKS key for the logo to
// render; otherwise the chip sets the name in type until a brand-compliant
// mark is registered (see docs/BRAND_MARKS.md).
export type CompanyVideo = {
  company: string;
  title: string;
  video: string;
  poster: string;
};

// Order per Joshua Pierce, Slack, 5 Sept 2026: Mars, JPMorgan Chase, EY, AT&T,
// WildBrain, Kellogg's. EY's second clip (Part 2) used to sit right after
// Part 1 here, which read as the same video twice in a row; it's dropped
// from this rail so EY appears once, and Part 1's title drops its now
// meaningless "Part 1" suffix. Neither video file was deleted.
export const COMPANY_VIDEOS: CompanyVideo[] = [
  // Kellanova was acquired by Mars, so the clip carries the Mars mark.
  { company: "Mars", title: "Meet a Talent Director", video: "/videos/app/reel-kellanova-talent-director.mp4", poster: "/images/videos/reel-kellanova-talent-director-v2.jpg" },
  { company: "JPMorgan Chase", title: "Office Tour", video: "/videos/app/reel-jpmc-london-office-tour-odein.mp4", poster: "/images/videos/reel-jpmc-london-office-tour-odein.jpg" },
  { company: "EY", title: "Senior Cyber Consultant", video: "/videos/app/reel-ey-cyber-consultant-1.mp4", poster: "/images/videos/reel-ey-cyber-consultant-1.jpg" },
  { company: "AT&T", title: "Office Tour", video: "/videos/app/reel-att-office-tour.mp4", poster: "/images/videos/reel-att-office-tour.jpg" },
  { company: "WildBrain", title: "Office Tour", video: "/videos/app/reel-wildbrain-office-tour.mp4", poster: "/images/videos/reel-wildbrain-office-tour.jpg" },
  // Kellogg's office (WK Kellogg Co), not Kellanova: the Kellogg's mark stays.
  { company: "Kellogg's", title: "Office Tour", video: "/videos/app/reel-kelloggs-office-tour.mp4", poster: "/images/videos/reel-kelloggs-office-tour.jpg" },
];
