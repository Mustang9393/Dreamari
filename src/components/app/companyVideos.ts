// "Videos Inside Leading Companies" (CEO, 4 Sept 2026): real clips shot
// inside partner companies, the rail on Explore > Browse directly above
// Typical Pay (moved 11 Sept 2026). `company` must match a COMPANY_MARKS key for the logo to
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
//
// Posters for JPMorgan Chase, EY, AT&T and Kellogg's are the designed IG-reel
// covers supplied 5 Sept 2026 ("Thumbnails/Updated IG Reel Covers"), each
// carrying its own title card; each clip's own `title` below is kept in sync
// with the words baked into its cover. Mars's cover is a real title-card
// frame from its own clip, swapped for an updated version 9 Sept 2026
// ("Thumbnails/Mars.png"); WildBrain's is composited from a clean frame of
// its own office wall logo plus matching "Office Tour" type, since no cover
// was supplied for either. EY, AT&T and WildBrain were replaced 19 Oct 2026
// with updated designed covers (Chandu, "Updated IG Reel Covers (1).zip":
// "use these for the video thumbnails across the app"); WildBrain's is now
// a real designed cover too, not the composite. EY's was swapped again
// 20 Oct for a newer version ("EY.zip"). Same file paths, so every
// surface that reads `poster` / videoPoster() picks them up.
export const COMPANY_VIDEOS: CompanyVideo[] = [
  // Kellanova was acquired by Mars, so the clip carries the Mars mark.
  { company: "Mars", title: "Meet a Talent Director", video: "/videos/app/reel-kellanova-talent-director.mp4", poster: "/images/videos/reel-kellanova-talent-director-v3.png" },
  { company: "JPMorgan Chase", title: "London Office Tour", video: "/videos/app/reel-jpmc-london-office-tour-odein.mp4", poster: "/images/videos/reel-jpmc-london-office-tour-cover.jpg" },
  { company: "EY", title: "Inside Cybersecurity Consulting", video: "/videos/app/reel-ey-cyber-consultant-1.mp4", poster: "/images/videos/reel-ey-cyber-consultant-1-cover.jpg" },
  { company: "AT&T", title: "Headquarters Office Tour", video: "/videos/app/reel-att-office-tour.mp4", poster: "/images/videos/reel-att-office-tour-cover.jpg" },
  { company: "WildBrain", title: "Office Tour", video: "/videos/app/reel-wildbrain-office-tour.mp4", poster: "/images/videos/reel-wildbrain-office-tour-cover.jpg" },
  // Kellogg's office (WK Kellogg Co), not Kellanova: the Kellogg's mark stays.
  { company: "Kellogg's", title: "Office Tour", video: "/videos/app/reel-kelloggs-office-tour.mp4", poster: "/images/videos/reel-kelloggs-office-tour-cover.jpg" },
];

/** The thumbnail Explore shows for a clip, by its video path: the company
 *  rail's designed cover when there is one, else a saved frame of the clip
 *  in /images/videos. Undefined for a clip with neither (the aviation
 *  clips), so callers fall back to the clip's own first frame. Used by the
 *  counselor dashboard's video cards (13 Oct 2026, Chandu: "the videos in
 *  v5/v6 of the counselor dashboard need to use the thumbnail we've used
 *  in the explore"). */
const SAVED_FRAMES: Record<string, string> = {
  "/videos/app/reel-povywa-jpmc-ohio.mp4": "/images/videos/reel-povywa-jpmc-ohio.jpg",
};
export function videoPoster(video: string): string | undefined {
  return COMPANY_VIDEOS.find((v) => v.video === video)?.poster ?? SAVED_FRAMES[video];
}
