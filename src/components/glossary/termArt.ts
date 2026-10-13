/** Career-scoped term artwork, separate from authored learning content.
 * Extend the registry only after the two style-anchored sets pass the art
 * pipeline. Unknown careers/themes/terms deliberately have no picture. */
const FINANCE_TERM_SLUGS: Record<string, string> = {
  "Investor": "investor",
  "Capital": "capital",
  "Risk": "risk",
  "Return": "return",
  "Ownership": "ownership",
  "Revenue": "revenue",
  "Cost": "cost",
  "Cash Flow": "cash-flow",
  "Margin": "margin",
  "Loss": "loss",
  "Stock": "stock",
  "Bond": "bond",
  "Shareholder": "shareholder",
  "Lender": "lender",
  "Interest": "interest",
};

const CAREER_TERM_ART: Record<string, { version: string; terms: Record<string, string> }> = {
  "investment-banking": { version: "finance-oct13", terms: FINANCE_TERM_SLUGS },
};

export function glossaryTermAssets(careerSlug: string, atmosphere: string, size: "large" | "small" = "large"): Record<string, string> {
  const entry = CAREER_TERM_ART[careerSlug];
  if (!entry || !["v1", "v2"].includes(atmosphere)) return {};
  const theme = atmosphere === "v2" ? "signal" : "drift";
  const suffix = size === "large" ? "" : theme === "signal" ? "-320" : "-256";
  return Object.fromEntries(Object.entries(entry.terms).map(([id, slug]) => [id, `/images/glossary/${entry.version}/${theme}/${slug}${suffix}.webp`]));
}
