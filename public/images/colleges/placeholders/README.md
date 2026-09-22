# Dreamari college missing-photo assets

neutral.svg (recommended), contour.svg, weave.svg are subdued SVG covers for missing or unverified school photography. Edge-to-edge generic campus scene with cropped building wings, arched windows, landscape planting, path, sun and the exact Dreamari mark on the pediment. Faint orbital lines echo the app backdrop. Neutral tones and a downward fade keep it a placeholder rather than a photograph. No nested image-icon frame or actual campus likeness. preview.html shows only the assets.

800 × 1050 matches Explore's 320 × 420 cards. The mark is centred in the upper image band; the lower area stays quiet for existing name/stats/actions. SVG preserves proportions with xMidYMin slice. For an external img use object-fit:cover; object-position:center top. Covers remain dark in both themes, matching the existing full-bleed photo cards and their white text/scrims.

CollegePlaceholder provides the inline equivalent, stable school-slug variation and optional accent / --college-art-accent override. SVG definition IDs are unique per instance. Page CSS variables cannot recolor an externally loaded SVG image; inline it or edit its gradient stop.

Shared CollegePicture, CollegeCard and SchoolCard use this when collegeImage returns null or the photo fails to load. Explicit photoStatus unverified/rejected suppresses a photo; approved still requires a file. Undefined preserves the prototype inventory, not a verification claim. Production should populate status and treat unknown as unverified.

Regenerate: npx tsx scripts/export-college-placeholders.tsx.
Logo source: public/images/app/logo-mark.svg.

## Download / handoff

Use neutral.svg by default. Each variant also has an 800 × 1050 PNG for tools that cannot consume SVG. dreamari-college-placeholders.zip contains all three SVG/PNG pairs and this guide. Production URLs live under https://dreamari.vercel.app/images/colleges/placeholders/ (check the deployment's current public alias).

Implementation: src/components/colleges/CollegePlaceholder.tsx. All three shared school image/card components in shared.tsx call it automatically when collegeImage returns null or the photo fails to load. No existing school photo is replaced by installing these assets. The photoStatus field can explicitly suppress an unverified/rejected image. Current records without that field continue using the existing photo inventory.

Full implementation handoff: docs/handoff/specs/college-image-fallbacks.md (linked from docs/HANDOFF_INDEX.md).
