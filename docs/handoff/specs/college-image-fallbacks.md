# College image fallbacks — handoff to Usman

Updated 23 September 2026. User approved repository publication and Vercel deployment of this implementation. This is a production fallback, not a demo toggle.

## Intended behavior

Keep existing school photography whenever it is available and loads successfully. Show the Dreamari campus placeholder only when the photo is absent, explicitly unverified/rejected, or fails to load. It is expected that nothing changes visibly in the current demo when all school photos work. Do not turn off existing photos just to expose the new art.

The artwork is a symbolic school, not a depiction of any listed campus. Final direction: full-width campus, cropped wings, windows, trees/path, small actual Dreamari logo and subtle orbital lines; restrained neutral tones. Earlier colorful or tiny framed-icon versions in the session log were rejected and superseded.

## Integration

- `src/components/colleges/CollegePlaceholder.tsx`: inline SVG; unique gradient/mask IDs; stable variant selected from school slug. Optional explicit variant and accent. No external request needed for the inline fallback.
- `src/components/colleges/shared.tsx`: CollegePicture (including detail hero), CollegeCard, SchoolCard all use the placeholder. Existing photo onError handling is preserved. MarkBadge retains its independent logo error-to-initial fallback.
- `src/components/colleges/data.ts`: optional `photoStatus` = `approved | unverified | rejected`. collegeImage returns null for the latter two. Approved still requires a photo inventory entry. Undefined preserves prototype behavior; it DOES NOT certify existing imagery. No school records were reclassified in this change.
- For a real CMS integration, supply explicit approval status and treat unknown images as unverified. Do not infer approval from a filename or local file existence.

## Assets and downloads

`public/images/colleges/placeholders/` contains neutral.svg (recommended), contour.svg, weave.svg, corresponding 800 × 1050 PNGs, an image-only preview.html, README.md and dreamari-college-placeholders.zip. Variants differ only in subtle background texture; they do not encode school category or ranking.

Production base URL: `https://dreamari.vercel.app/images/colleges/placeholders/`.
The ZIP is the shareable/downloadable bundle. SVG is preferred in the app; PNG is provided for presentation and design tools.

800 × 1050 matches 320 × 420 Explore cards. Preserve aspect ratio; use object-fit: cover and object-position: center top for img elements. Keep the existing card scrim/text/mark layers. Dark media colors intentionally remain dark in either page theme.

Regenerate SVG/PNG/preview with `npx tsx scripts/export-college-placeholders.tsx` (uses sharp available with Next). After any asset or README change, refresh the ZIP from the three SVG/PNG pairs plus README; exclude the ZIP itself. The exact Dreamari logo path comes from `public/images/app/logo-mark.svg`.

## Verification

TypeScript, targeted ESLint, token checks and production build are release checks. Visually reviewed the assets in the actual college Browse All card layout during design. Existing school data and images remain unchanged. No changes to approvals, authentication, school ranking or card interactions are implied.
