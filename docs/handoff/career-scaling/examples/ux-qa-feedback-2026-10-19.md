# UX Designer QA discussion — 19 October 2026

Chandu: "The game is good, but we dont have enough variety of images like we had for the registered nurse one"; "isnt there a mid-game success screen"; "more designed screens of screens/prototypes".

The current Level 1 is published as a **QA draft** through the hamburger Quick Links so the team can discuss it before revising the SOP and art batch. This release adds the entry point; it does not claim these issues are fixed.

## Findings

- **Scene coverage:** three opaque full scenes currently serve 35 story/decision beats. Compare RN's 18 routed scene compositions. A room's identity should be fixed without forcing its camera, activity, cast arrangement and expression to remain static throughout a chapter.
- **Mid-game review:** UX has no `card` with `variant: "act"`. RN2-28 and AMT already use the shared `review` milestone (intro, score count, conditional pass/fail, continue/finish later). Reuse it at the UX narrative midpoint; celebrate only the passing state. Select the threshold based on decisions completed, and verify both branches. Current demo starts fresh on reload, so do not promise Finish Later resumes until that shared decision is addressed.
- **Work artifacts:** the UX project currently describes research, forms and iteration mostly in text. Show a clear fictional volunteer sign-up flow, research evidence, wireframes and before/after prototypes when the question needs them. Use the existing card/document and question components with selectable text and accessible labels; images can show the workspace, but critical UI labels and answer evidence must remain legible and must not depend on generated text. Audit existing generic components before proposing a new reusable artifact renderer.

## Next revision acceptance

1. Make a beat-by-beat scene/shot and artifact coverage plan before generating art. Specify where an intentional exact repeat is useful and where the work or story changes.
2. Keep canonical face/hair/outfit, room geometry and window view references. Deliver full composed scenes; no waist-cutoff runtime sprites. Admit candidates after human continuity review. No fresh-generation pixel identity promise.
3. Add and exercise the shared mid-game review's pass/fail and continue/exit paths without changing the ten-decision score contract accidentally.
4. Put the actual prototype beside relevant task evidence, with readable keyboard/screen-reader access. Verify phone and desktop layouts and retain the existing interaction engine.
5. Update SOP/prompt gates from the reviewed implementation, then repeat QA. Record which checks were exercised; avoid claiming bulletproof generation from one chapter.
