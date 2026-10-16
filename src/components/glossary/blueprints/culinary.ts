// DEMO-ONLY content: the Culinary Arts glossary, under the Food & Cooking
// world (16 Oct 2026). Written to the "Dreamari Glossary Game Master Scaling
// Plan" SOP, world #47: a practice world. Fast kitchen situations, no plot
// to maintain; Dreamy and the world carry the game. Because it is a practice
// world, the examples do not have to name the anchor (Harbor Kitchen), and
// most do not. Two playable levels (recognize, apply) and four on the
// roadmap. Eighth-grade copy, no dashes, no numbers. No catalog career owns
// this one yet, so the hub card is keyed to the industry slug itself.

import type { GlossaryBlueprint } from "../generate";

export const CULINARY_GLOSSARY: GlossaryBlueprint = {
  industry: { slug: "culinary", title: "Kitchen Terms", subject: "kitchen", world: "Food & Cooking" },
  mode: "practice_world",
  studentRole: "cook",
  company: "Harbor Kitchen",
  idPrefix: "CUL",
  chapters: [
    { number: 1, name: "Prep", tier: "Beginner" },
    { number: 2, name: "Service", tier: "Intermediate" },
    { number: 3, name: "The Pass", tier: "Advanced" },
  ],
  levels: [
    {
      number: 1,
      title: "Knife Skills",
      tier: "Beginner",
      goal: "Learn the five basic cuts.",
      unlocks: "$10K",
      milestone: "Five basic cuts",
      nextMilestone: "Work the line",
      companyValue: 10000,
      nextCompanyValue: 50000,
      terms: [
        { term: "Dice", definition: "Cutting food into small even cubes.", example: "Dice the onion into even cubes for the soup.", cue: "Small even cubes", icon: "grid" },
        { term: "Mince", definition: "Cutting food into the tiniest pieces possible.", example: "Mince the garlic so it melts into the sauce.", cue: "The tiniest pieces", icon: "sparkles" },
        { term: "Julienne", definition: "Cutting food into thin sticks the size of matchsticks.", example: "Julienne the carrots for the salad.", cue: "Thin matchstick strips", icon: "align-justify" },
        { term: "Chop", definition: "Cutting food into rough pieces that do not have to match.", example: "Chop the herbs and toss them in at the end.", cue: "Rough uneven pieces", icon: "scissors" },
        { term: "Slice", definition: "Cutting food into thin flat pieces.", example: "Slice the tomato for the sandwiches.", cue: "Thin flat pieces", icon: "minus" },
      ],
      facts: [
        "A sharp knife is safer than a dull one. A dull blade slips.",
        "Cooks curl their fingertips under when they cut, so the knuckles guide the blade.",
      ],
    },
    {
      number: 2,
      title: "On the Line",
      tier: "Beginner",
      goal: "Work a busy dinner service.",
      unlocks: "$50K",
      milestone: "Work the line",
      nextMilestone: "Control the heat",
      companyValue: 50000,
      nextCompanyValue: 120000,
      intro: { headline: "Dinner Service", line: "Tickets are coming in. Every cook has a job.", hook: "Learn the words you will hear shouted across a kitchen." },
      terms: [
        { term: "Mise en Place", definition: "Getting every ingredient and tool ready before cooking starts.", example: "Good cooks finish their mise en place before the first order.", cue: "Everything ready before cooking", situation: "Onions diced, pans out, spices lined up. Nothing is cooking yet.", icon: "layout-grid" },
        { term: "Station", definition: "The one spot in the kitchen where a cook works all shift.", example: "Each cook keeps their station clean between orders.", cue: "Your spot in the kitchen", situation: "Lee works the grill all night and never leaves that spot.", icon: "map-pin" },
        { term: "Sear", definition: "Cooking the outside of food fast on high heat to brown it.", example: "Sear the steak hard, then finish it in the oven.", cue: "Brown it fast on high heat", situation: "The pan is screaming hot and the steak hisses as it browns.", icon: "flame" },
        { term: "Simmer", definition: "Cooking in liquid that is hot but only barely bubbling.", example: "Let the sauce simmer so the flavors come together.", cue: "Barely bubbling liquid", situation: "The soup shows small slow bubbles, never a rolling boil.", icon: "droplets" },
        { term: "Plate", definition: "Arranging finished food on a dish so it looks good.", example: "Plate the fish with the sauce on the side.", cue: "Arranging food on the dish", situation: "The food is done. Now make it look good on the dish.", icon: "circle" },
      ],
      facts: ["Mise en place is French. It means everything in its place."],
    },
    { number: 3, title: "Heat and Time", tier: "Intermediate", goal: "Control the heat.", unlocks: "$120K", milestone: "Control the heat", nextMilestone: "Keep food safe", companyValue: 120000, nextCompanyValue: 250000, words: ["Blanch", "Braise", "Roast", "Poach", "Reduce"] },
    { number: 4, title: "Food Safety", tier: "Intermediate", goal: "Keep every plate safe to eat.", unlocks: "$250K", milestone: "Keep food safe", nextMilestone: "Run the pass", companyValue: 250000, nextCompanyValue: 500000, words: ["Cross Contamination", "Danger Zone", "Sanitize", "Allergen", "FIFO"] },
    { number: 5, title: "The Pass", tier: "Advanced", goal: "Run the pass on a full night.", unlocks: "$500K", milestone: "Run the pass", nextMilestone: "Build flavor", companyValue: 500000, nextCompanyValue: 1000000, words: ["Expediter", "Ticket", "Fire", "All Day", "Eighty Six"] },
    { number: 6, title: "Flavor", tier: "Advanced", goal: "Build flavor on purpose.", unlocks: "$1M", milestone: "Build flavor", nextMilestone: "Keep cooking", companyValue: 1000000, nextCompanyValue: 1000000, words: ["Season", "Acid", "Umami", "Emulsify", "Garnish"] },
  ],
};
