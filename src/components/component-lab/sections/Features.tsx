"use client";

// DEMO-ONLY: Component Lab section, "Feature modules". The feature
// components are mostly file-local inside big screen files; each part
// below renders the pieces that are safe in isolation and says why the
// rest are not rendered live.

import { Section } from "../kit";
import { ProfileCareerCollegesModules } from "./features/ProfileCareerColleges";
import { MatchConnectModules } from "./features/MatchConnect";
import { ResumeCounselorModules } from "./features/ResumeCounselor";

export function FeaturesSection() {
  return (
    <Section id="features" title="Feature modules" intro="The pieces each feature is built from: Profile, Career, Colleges, Match, Connect, Resume and Counselor. Mock data comes from each feature's own data file.">
      <ProfileCareerCollegesModules />
      <MatchConnectModules />
      <ResumeCounselorModules />
    </Section>
  );
}
