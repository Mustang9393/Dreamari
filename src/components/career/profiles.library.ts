// Career Detail profiles for the 4 Oct 2026 poster drop (the team's BROWSE
// Images folder): 136 careers the catalog did not have, each sourced from
// BLS (OEWS May 2025, projections 2025-35, table 5.3) and O*NET, written in
// seven parallel batches (profiles.lib1.ts to profiles.lib7.ts; each file's
// header lists its SOC codes and the careers mapped to a broader occupation).
// Merged here so careerProfile() has one place to look.

import type { CareerProfile } from "./profiles";
import { LIB1_PROFILES } from "./profiles.lib1";
import { LIB2_PROFILES } from "./profiles.lib2";
import { LIB3_PROFILES } from "./profiles.lib3";
import { LIB4_PROFILES } from "./profiles.lib4";
import { LIB5_PROFILES } from "./profiles.lib5";
import { LIB6_PROFILES } from "./profiles.lib6";
import { LIB7_PROFILES } from "./profiles.lib7";

export const LIBRARY_PROFILES: Record<string, CareerProfile> = {
  ...LIB1_PROFILES,
  ...LIB2_PROFILES,
  ...LIB3_PROFILES,
  ...LIB4_PROFILES,
  ...LIB5_PROFILES,
  ...LIB6_PROFILES,
  ...LIB7_PROFILES,
};
