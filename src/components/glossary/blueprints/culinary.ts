// DEMO-ONLY content: the Culinary Arts glossary, under the Food & Cooking
// world (16 Oct 2026). Written to the "Dreamari Glossary Game Master Scaling
// Plan" SOP, world #47: a practice world. Fast kitchen situations, no plot
// to maintain; Dreamy and the world carry the game. Because it is a practice
// world, the examples do not have to name the anchor (Harbor Kitchen), and
// most do not. Four playable levels and two on the roadmap. Eighth-grade
// copy, no dashes, no numbers. No catalog career owns this one yet, so the
// hub card is keyed to the industry slug itself.
//
// Rewritten 17 Oct 2026 to the Finance style (Chandu: "the games are
// repeating the same questions again and again"): every word carries three
// moments, each shown on one screen only; Level 3 sorts concrete kitchen
// moves into wet heat and dry heat; Levels 2 to 4 carry a short case; every
// Power Play is a written paragraph whose blanks do not run in teaching
// order. This file is the model for the other blueprints.

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
      milestone: "Five basic cuts",
      nextMilestone: "Work the line",
      companyValue: 10000,
      nextCompanyValue: 50000,
      terms: [
        {
          term: "Dice", definition: "Cutting food into small even cubes.", example: "Dice the onion into even cubes for the soup.", cue: "Small even cubes", icon: "grid",
          moments: ["Onion cut into small cubes that all look the same.", "The chef wants even little squares for the soup.", "Tiny cubes of carrot, every one the same size."],
        },
        {
          term: "Mince", definition: "Cutting food into the tiniest pieces possible.", example: "Mince the garlic so it melts into the sauce.", cue: "The tiniest pieces", icon: "sparkles",
          moments: ["Garlic cut so fine it almost turns to paste.", "The ginger is cut into the smallest bits a knife can make.", "Herbs cut so small they melt into the butter."],
        },
        {
          term: "Julienne", definition: "Cutting food into thin sticks the size of matchsticks.", example: "Julienne the carrots for the salad.", cue: "Thin matchstick strips", icon: "align-justify",
          moments: ["Carrots cut into thin sticks like matchsticks.", "Long skinny strips of pepper for the stir fry.", "The cucumber becomes a pile of thin even sticks."],
        },
        {
          term: "Chop", definition: "Cutting food into rough pieces that do not have to match.", example: "Chop the herbs and toss them in at the end.", cue: "Rough uneven pieces", icon: "scissors",
          moments: ["Parsley cut into rough pieces, no two alike.", "Walnuts broken down fast into uneven bits.", "The cook hacks the celery into rough chunks for stock."],
        },
        {
          term: "Slice", definition: "Cutting food into thin flat pieces.", example: "Slice the tomato for the sandwiches.", cue: "Thin flat pieces", icon: "minus",
          moments: ["The tomato falls into thin flat rounds.", "Bread cut into even flat pieces for toast.", "Thin flat pieces of lemon float in the water."],
        },
      ],
      powerPlay: {
        intro: "Prep the whole order.",
        paragraph: "{5} the tomato into thin flat rounds. {2} the garlic until it is almost paste. For the salad, {3} the carrot into matchsticks. {1} the onion into even cubes for the soup. Last, {4} the parsley rough and toss it in.",
      },
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
      milestone: "Work the line",
      nextMilestone: "Control the heat",
      companyValue: 50000,
      nextCompanyValue: 120000,
      intro: { headline: "Dinner Service", line: "Tickets are coming in. Every cook has a job.", hook: "Learn the words you will hear shouted across a kitchen." },
      terms: [
        {
          term: "Mise en Place", definition: "Getting every ingredient and tool ready before cooking starts.", example: "Good cooks finish their mise en place before the first order.", cue: "Everything ready before cooking", icon: "layout-grid",
          moments: ["Onions diced, pans out, spices lined up. Nothing is cooking yet.", "Every bowl is filled and in reach before the first ticket.", "The cook sets out each tool and ingredient before service."],
        },
        {
          term: "Station", definition: "The one spot in the kitchen where a cook works all shift.", example: "Each cook keeps their station clean between orders.", cue: "Your spot in the kitchen", icon: "map-pin",
          moments: ["Lee works the grill all night and never leaves that spot.", "Each cook has one spot and keeps it clean all shift.", "Sam runs fry. Lee runs grill. Nobody swaps."],
        },
        {
          term: "Sear", definition: "Cooking the outside of food fast on high heat to brown it.", example: "Sear the steak hard, then finish it in the oven.", cue: "Brown it fast on high heat", icon: "flame",
          moments: ["The pan is screaming hot and the steak hisses as it browns.", "A dark brown crust forms on the meat in seconds.", "Oil smokes, the scallop goes in, and the edge turns golden fast."],
        },
        {
          term: "Simmer", definition: "Cooking in liquid that is hot but only barely bubbling.", example: "Let the sauce simmer so the flavors come together.", cue: "Barely bubbling liquid", icon: "droplets",
          moments: ["The soup shows small slow bubbles, never a rolling boil.", "The sauce barely bubbles on the lowest flame.", "A pot ticks away gently for an hour, bubbles few and small."],
        },
        {
          term: "Plate", definition: "Arranging finished food on a dish so it looks good.", example: "Plate the fish with the sauce on the side.", cue: "Arranging food on the dish", icon: "circle",
          moments: ["The food is done. Now make it look good on the dish.", "Sauce swooshed, fish set at an angle, herbs on top.", "The pass checks each dish looks right before it goes out."],
        },
      ],
      cases: [
        {
          terms: ["Sear", "Simmer"],
          scene: "A steak and a sauce are cooking at the same time.",
          steps: [
            { prompt: "The steak needs a dark crust fast. Which heat?", options: ["High heat", "Low heat"], correctIndex: 0 },
            { prompt: "The sauce must cook gently for an hour. Which heat?", options: ["High heat", "Low heat"], correctIndex: 1 },
          ],
          feedbackCorrect: "High heat browns fast. Low heat cooks gently.",
          feedbackWrong: "A crust needs high heat. A long gentle cook needs low heat.",
        },
      ],
      powerPlay: {
        intro: "Run one dinner service.",
        paragraph: "Lee has one {2} and never leaves it. Before the first ticket, the {1} is done: every tool and bowl in reach. The steak gets a hard {3} in a hot pan. The sauce stays on a low {4}. Last, {5} the food so it looks as good as it tastes.",
      },
      facts: ["Mise en place is French. It means everything in its place."],
    },
    {
      number: 3,
      title: "Heat and Time",
      tier: "Intermediate",
      goal: "Control the heat.",
      milestone: "Control the heat",
      nextMilestone: "Keep food safe",
      companyValue: 120000,
      nextCompanyValue: 250000,
      intro: { headline: "Five Ways to Cook", line: "Same stove. Five different results.", hook: "Learn which method the dish is asking for." },
      terms: [
        {
          term: "Blanch", definition: "Boiling food for a moment, then plunging it into ice water.", example: "Blanch the green beans so they stay bright and crisp.", cue: "A quick boil, then ice water", confusion: "Poach", icon: "droplets",
          moments: ["Beans go into boiling water, then straight into ice.", "A quick dip in boiling water keeps the peas bright green.", "Hot water a moment, then ice, and the tomato skins slip off."],
        },
        {
          term: "Braise", definition: "Browning food, then cooking it slowly in a little liquid with a lid on.", example: "Braise the short ribs for three hours until they fall apart.", cue: "Brown it, then cook low and slow", confusion: "Roast", icon: "flame",
          moments: ["The pot sits covered in the oven all afternoon.", "Brown the meat, add a little stock, lid on, low and slow.", "Tough beef turns soft after hours in a covered pot."],
        },
        {
          term: "Roast", definition: "Cooking food uncovered in the dry heat of an oven.", example: "Roast the chicken until the skin is golden.", cue: "Dry oven heat, no lid", confusion: "Braise", icon: "sun",
          moments: ["A whole chicken browns on a rack with nothing covering it.", "Potatoes crisp in the dry heat of a hot oven.", "The oven door opens and the skin is golden and crackling."],
        },
        {
          term: "Poach", definition: "Cooking food gently in liquid that is hot but not boiling.", example: "Poach the eggs in barely moving water.", cue: "Gentle heat in still water", confusion: "Blanch", icon: "egg",
          moments: ["An egg slips into water that trembles but never bubbles.", "Fish cooks gently in warm broth that never boils.", "Pears sit in barely moving syrup until they are tender."],
        },
        {
          term: "Reduce", definition: "Boiling a liquid down so there is less of it and more flavor.", example: "Reduce the sauce by half before you add the butter.", cue: "Boil a sauce down", confusion: "Braise", icon: "minus",
          moments: ["The pan of sauce bubbles until only a thick glaze is left.", "Half the liquid is gone and the flavor is twice as strong.", "The stock boils down to a syrup that coats a spoon."],
        },
      ],
      sort: {
        label: "Wet or dry",
        prompt: "Is each one wet heat or dry heat?",
        buckets: ["Wet heat", "Dry heat"],
        items: [
          { text: "Lid on, a little stock", bucket: "Wet heat", term: "Braise" },
          { text: "Egg in trembling water", bucket: "Wet heat", term: "Poach" },
          { text: "Chicken on a rack, no lid", bucket: "Dry heat", term: "Roast" },
          { text: "Beans into boiling water", bucket: "Wet heat", term: "Blanch" },
          { text: "Potatoes crisping in the oven", bucket: "Dry heat", term: "Roast" },
          { text: "Sauce boiling down to glaze", bucket: "Wet heat", term: "Reduce" },
        ],
        feedbackCorrect: "Liquid in the pot means wet heat. An open oven means dry heat.",
        feedbackWrong: "Ask of each one: is the food sitting in liquid, or in open oven air?",
      },
      cases: [
        {
          terms: ["Braise", "Roast"],
          scene: "A tough cut of beef needs to be soft by dinner.",
          steps: [
            { prompt: "Which method turns a tough cut soft?", options: ["Roast", "Braise"], correctIndex: 1 },
            { prompt: "Which heat does that take?", options: ["High and fast", "Low and slow"], correctIndex: 1 },
            { prompt: "Does the pot need a lid?", options: ["Yes, covered", "No, open"], correctIndex: 0 },
          ],
          feedbackCorrect: "Tough meat needs time, liquid and a lid. That is a braise.",
          feedbackWrong: "Roasting is dry and open. Tough meat wants a covered pot, low and slow.",
        },
      ],
      powerPlay: {
        intro: "Cook five dishes at once.",
        paragraph: "{3} the chicken uncovered until the skin is golden. {1} the beans for a moment, then shock them in ice. {5} the sauce until it coats a spoon. {4} the eggs in water that never boils. {2} the short ribs for hours under a lid.",
      },
      facts: ["Browning food first builds flavor that no sauce can add later."],
    },
    {
      number: 4,
      title: "Food Safety",
      tier: "Intermediate",
      goal: "Keep every plate safe to eat.",
      milestone: "Keep food safe",
      nextMilestone: "Run the pass",
      companyValue: 250000,
      nextCompanyValue: 500000,
      intro: { headline: "Health Inspection", line: "The inspector arrives at the start of service.", hook: "Learn the words that keep every plate safe." },
      terms: [
        {
          term: "Cross Contamination", definition: "When germs move from one food or surface to another.", example: "Using one board for raw chicken and salad causes cross contamination.", cue: "Germs jumping between foods", confusion: "Allergen", icon: "triangle-alert",
          moments: ["The same knife cuts raw chicken, then the lettuce.", "Raw meat drips onto the vegetables on the shelf below.", "One board for raw fish, then the bread, with no wash between."],
        },
        {
          term: "Danger Zone", definition: "The warm range of temperatures where germs in food grow fastest.", example: "Food left out on the counter all afternoon sits in the danger zone.", cue: "The warm range germs love", confusion: "Cross Contamination", icon: "thermometer",
          moments: ["The soup has sat lukewarm on the counter since lunch.", "The milk was left out all afternoon in a warm kitchen.", "Cooked rice sits warm in the pan for hours before service."],
        },
        {
          term: "Sanitize", definition: "Killing the germs on a surface after it has been cleaned.", example: "Sanitize the cutting board after every raw protein.", cue: "Kill the germs after cleaning", confusion: "Cross Contamination", icon: "sparkles",
          moments: ["The board is wiped clean, then sprayed and left to dry.", "After the raw chicken, the counter gets a spray that kills germs.", "Clean first, then a spray so no germs survive on the surface."],
        },
        {
          term: "Allergen", definition: "A food that can make some people very sick, like peanuts or shellfish.", example: "A ticket flags every allergen so the cook can keep it off the plate.", cue: "A food that makes some people sick", confusion: "Cross Contamination", icon: "ban",
          moments: ["The ticket says no nuts. One diner could end up in hospital.", "A guest asks if the sauce has shellfish before ordering.", "Peanut oil in the fryer could make one guest very sick."],
        },
        {
          term: "FIFO", definition: "Using the oldest stock first so nothing sits long enough to spoil.", example: "The walk-in is organized FIFO, with the oldest milk in front.", cue: "Oldest stock gets used first", confusion: "Danger Zone", icon: "layers",
          moments: ["New cartons go behind the old ones on the shelf.", "The oldest milk sits in front so it gets used first.", "Fresh deliveries go to the back of the walk-in."],
        },
      ],
      selectAll: {
        term: "Allergen",
        prompt: "Select every item that could make an allergic guest sick.",
        options: ["Peanut sauce", "Shrimp in the broth", "Plain boiled rice", "Eggs in the dressing"],
        correct: [0, 1, 3],
        feedbackCorrect: "Peanuts, shellfish and eggs are common ones. Plain rice is safe.",
        feedbackWrong: "Peanuts, shellfish and eggs can make some guests very sick. Plain rice cannot.",
      },
      cases: [
        {
          terms: ["Cross Contamination", "Sanitize"],
          scene: "Raw chicken was just cut on the main board.",
          steps: [
            { prompt: "What happens if lettuce goes on that board now?", options: ["Germs move to the lettuce", "Nothing, lettuce is safe"], correctIndex: 0 },
            { prompt: "What must happen to the board first?", options: ["Wipe it with a dry towel", "Clean it, then kill the germs"], correctIndex: 1 },
          ],
          feedbackCorrect: "Germs travel from raw meat to anything that touches the board. Clean it, then kill what is left.",
          feedbackWrong: "Raw chicken leaves germs behind. A dry wipe moves them around. Clean, then spray.",
        },
      ],
      powerPlay: {
        intro: "Pass the inspection.",
        paragraph: "The walk-in runs {5}: oldest in front, new in back. A ticket flags a nut {4}, so the cook keeps nuts off the plate. Soup left warm on the counter sits in the {2}. Raw chicken juice on the salad board is {1}. After every raw protein, {3} the board.",
      },
      facts: ["Washing hands for twenty seconds is the single best way to keep food safe."],
    },
    { number: 5, title: "The Pass", tier: "Advanced", goal: "Run the pass on a full night.", milestone: "Run the pass", nextMilestone: "Build flavor", companyValue: 500000, nextCompanyValue: 1000000, words: ["Expediter", "Ticket", "Fire", "All Day", "Eighty Six"] },
    { number: 6, title: "Flavor", tier: "Advanced", goal: "Build flavor on purpose.", milestone: "Build flavor", nextMilestone: "Keep cooking", companyValue: 1000000, nextCompanyValue: 1000000, words: ["Season", "Acid", "Umami", "Emulsify", "Garnish"] },
  ],
};
