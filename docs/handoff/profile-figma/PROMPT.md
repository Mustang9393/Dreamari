# Kick-off prompt for the Figma agent (Codex)

Paste the block below to Codex as-is. It assumes the agent already ran its
Phase 0 audit; the rulings it asked for are answered in README.md.

---

We are rebuilding the Dreamari My Profile experience in the "Dreamari Design
System v2.0" file. Your single source of truth is docs/handoff/profile-figma/
in the repo: README.md (v2) plus the 11 numbered HTML captures. The design
changed significantly since your Phase 0 audit: discard every earlier capture,
anatomy note, and scope estimate, and re-read README.md fully before touching
the file. Your Phase 0 questions are answered in its "Phase 0 rulings"
section; apply those rulings first, exactly as written.

Work in phases, and stop for my approval between each:

Phase 1: Variables and styles. Apply the six rulings (card value,
Semantic.Light additions, gradient numeral style, drag-lift elevation,
componentize Logo Identity and Quick Links). Report what changed.

Phase 2: Components. Build the "Create" list in README order, each from
existing variables and text styles only, dark and light verified. Where the
README names a size, tracking, or mix percentage, use it verbatim; where
something is ambiguous, ask before improvising. Show me each family as you
finish it.

Phase 3: Frames. 11 states x 2 breakpoints (desktop 1200 content width,
mobile 375), reproducing the captures faithfully: copy transcribed exactly
(match tiers per ruling 2, no em dashes), photos from the existing poster
components, numerals in the gradient style.

Phase 4: Prototype wiring per the README's "Prototype wiring" section.

Hard constraints throughout: never create a variable or style the README does
not call for, never paste hex where a variable exists, never redraw artwork
that exists as a component. If you believe a deviation is necessary, propose
it and wait; do not proceed on your own ruling.
