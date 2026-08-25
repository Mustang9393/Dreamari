// One slug scheme for the Career Detail route, shared by every entry point
// (Explore Browse posters, the For You reel's "More Info", Similar Careers).
// A plain slugify of the title already matches the ids report-data.ts and
// profile/data.ts use for every career that has real report content
// (e.g. "Investment Banking" -> "investment-banking") -- the only two
// exceptions are called out explicitly below rather than left to collide.
const SLUG_OVERRIDES: Record<string, string> = {
  "Asset Manager": "asset-management", // catalog title vs. profile/report id
  "Private Equity Analyst": "private-equity", // For You reel's name for the same career as the "Private Equity" poster
};

export function careerSlug(title: string): string {
  if (SLUG_OVERRIDES[title]) return SLUG_OVERRIDES[title];
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
