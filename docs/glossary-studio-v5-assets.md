# Glossary Lab studio assets

The Lab uses one composed welcome illustration and five term illustrations. These are local, compressed WebP files, not runtime-generated backgrounds. Existing lesson text, question order, answer values, and scoring logic are unchanged.

| Asset | Source image | Use |
| --- | --- | --- |
| `public/images/dreamy/studio-v3/dreamy-happy.webp` | `exec-07a0727d-55d4-4cab-b7ed-206f9c6c8fd8.png` | Happy Dreamy pose |
| `public/images/glossary/studio-v4/hero-scene.webp` | `exec-2b188493-8a76-4ced-9409-d9661ed1f863.png` | Welcome scene |
| `public/images/glossary/studio-v5/company.webp` | `exec-0fc311a9-a775-43d8-88f1-506a46c2ac77.png` | Company |
| `public/images/glossary/studio-v5/product.webp` | `exec-ef19b871-40fd-4f1b-a10a-cb01d8d4241f.png` | Product |
| `public/images/glossary/studio-v5/service.webp` | `exec-e8c5c0bd-a070-4c3a-9e7f-93330fe49558.png` | Service |
| `public/images/glossary/studio-v5/customer.webp` | `exec-bbba187e-a7fb-4b25-b3c1-00f6d8655d78.png` | Customer |
| `public/images/glossary/studio-v5/profit.webp` | `exec-38ccd647-eb78-4efc-93eb-6629fc18b1b1.png` | Profit |

Source PNGs are in `/Users/chandump/.codex/generated_images/01a0eca6-1b47-78b0-81e8-15443dc20743/`. The composed scene was generated using the existing Dreamy identity as reference. The term illustrations were generated using that scene as a material and palette reference. All outputs were visually inspected and compressed with proportional resizing (`cwebp -resize 640 0`, hero `960 0`), avoiding the earlier square-canvas distortion. Dreamy appears only as a floating cloud, without limbs. No supplied CEO reference images were reused.

The term assets are keyed by the glossary's semantic IDs in `GlossaryLabGameExperience.tsx`. For another industry or level, the authored lesson data can retain its structure while swapping this image mapping and the welcome art.
