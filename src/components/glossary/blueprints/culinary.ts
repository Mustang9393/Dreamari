// DEMO-ONLY content: the Culinary Arts glossary, under the Food & Cooking
// world (16 Oct 2026). Written to the "Dreamari Glossary Game Master Scaling
// Plan" SOP, world #47: a practice world. Fast kitchen situations, no plot
// to maintain; Dreamy and the world carry the game. Because it is a practice
// world, the examples do not have to name the anchor (Harbor Kitchen), and
// most do not. Six playable levels (5 and 6 added 17 Oct 2026). Eighth-grade
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
        paragraph: "{5} the tomato into flat rounds. {2} the garlic into a paste. {3} the carrot into thin sticks. {1} the onion into small cubes. Last, {4} the parsley rough.",
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
          feedbackWrong: "A crust needs high heat. A slow sauce needs low heat.",
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
        feedbackCorrect: "Liquid in the pot is wet heat. An open oven is dry heat.",
        feedbackWrong: "Is the food in liquid, or in open oven air?",
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
          feedbackWrong: "Roasting is dry and open. Tough meat needs a lid, low and slow.",
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
        feedbackWrong: "Peanuts, shellfish and eggs can make guests sick. Plain rice cannot.",
      },
      cases: [
        {
          terms: ["Cross Contamination", "Sanitize"],
          scene: "Raw chicken was just cut on the main board.",
          steps: [
            { prompt: "What happens if lettuce goes on that board now?", options: ["Germs move to the lettuce", "Nothing, lettuce is safe"], correctIndex: 0 },
            { prompt: "What must happen to the board first?", options: ["Wipe it with a dry towel", "Clean it, then kill the germs"], correctIndex: 1 },
          ],
          feedbackCorrect: "Germs move from raw meat to the board. Clean it, then kill the germs.",
          feedbackWrong: "A dry wipe just moves germs around. Clean it, then spray it.",
        },
      ],
      powerPlay: {
        intro: "Pass the inspection.",
        paragraph: "The walk-in runs {5}: oldest in front, new in back. A ticket flags a nut {4}, so the cook keeps nuts off the plate. Soup left warm on the counter sits in the {2}. Raw chicken juice on the salad board is {1}. After every raw protein, {3} the board.",
      },
      facts: ["Washing hands for twenty seconds is the single best way to keep food safe."],
    },
    // Levels 5 and 6 made playable on 17 Oct 2026 (Chandu: "please dont
    // leave anything as not done yet fix everything"), so the model
    // blueprint carries the full six levels like the other three.
    {
      number: 5,
      title: "The Pass",
      tier: "Advanced",
      goal: "Run the pass on a full night.",
      milestone: "Run the pass",
      nextMilestone: "Build flavor",
      companyValue: 500000,
      nextCompanyValue: 1000000,
      intro: { headline: "Friday Rush", line: "Every table is full and orders keep printing.", hook: "Learn the calls that run the pass." },
      terms: [
        {
          term: "Expediter", definition: "The person at the pass who calls orders and checks every plate.", example: "The expediter checks each plate before a server takes it.", cue: "Runs the pass, checks every plate", confusion: "Fire", icon: "megaphone",
          moments: ["One person at the pass calls orders and wipes each rim.", "She sends a cold plate back before any guest sees it.", "He stands between the cooks and the servers, timing every table."],
        },
        {
          term: "Ticket", definition: "The printed order that tells the kitchen what a table wants.", example: "A new ticket prints with two steaks and a salad.", cue: "The printed order from a table", confusion: "All Day", icon: "receipt",
          moments: ["A paper slip prints: two steaks, one salad, table nine.", "The slip says no onions, so the cook reads it twice.", "Slips line up on the rail in the order they came in."],
        },
        {
          term: "Fire", definition: "The call that tells cooks to start cooking a dish right now.", example: "Fire table six, the guests just finished their soup.", cue: "Start cooking this dish now", confusion: "Expediter", icon: "flame",
          moments: ["The guests finished their soup. Time to start their steaks now.", "The call goes out and the cook drops fish in the pan.", "Table four is ready for mains, so the grill starts their order."],
        },
        {
          term: "All Day", definition: "The total count of one dish across every open order.", example: "Six burgers all day means six across every open order.", cue: "The total count on every order", confusion: "Ticket", icon: "sigma",
          moments: ["Two steaks here, three there. Five steaks to cook in total.", "The cook asks how many fries are needed across every order.", "Four orders each want two soups. Eight bowls in total."],
        },
        {
          term: "Eighty Six", definition: "The call that a dish is sold out and cannot be ordered tonight.", example: "We are out of salmon, so eighty six the salmon.", cue: "That dish is sold out", confusion: "Fire", icon: "circle-slash",
          moments: ["The last piece of salmon just went out. No more tonight.", "Servers are told to stop selling the soup. The pot is empty.", "The chef crosses the lamb off the board for the night."],
        },
      ],
      sort: {
        label: "Which call",
        prompt: "Which call does each moment need?",
        buckets: ["Start it now", "Stop selling it", "Count it up"],
        items: [
          { text: "Guests just finished the soup", bucket: "Start it now", term: "Fire" },
          { text: "The last steak just went out", bucket: "Stop selling it", term: "Eighty Six" },
          { text: "How many fries across the board?", bucket: "Count it up", term: "All Day" },
          { text: "Table two is ready for mains", bucket: "Start it now", term: "Fire" },
          { text: "The soup pot is empty", bucket: "Stop selling it", term: "Eighty Six" },
          { text: "Three tables each want a burger", bucket: "Count it up", term: "All Day" },
        ],
        feedbackCorrect: "Ready tables get cooked, empty pots stop selling, totals get counted.",
        feedbackWrong: "Is the dish ready to cook, sold out, or a count?",
      },
      cases: [
        {
          terms: ["Expediter", "Fire"],
          scene: "Table five just finished their salads. The mains are next.",
          steps: [
            { prompt: "Who tells the line to start the mains?", options: ["The person at the pass", "The guest at table five"], correctIndex: 0 },
            { prompt: "What does that person call out?", options: ["Fire table five", "Table five all day"], correctIndex: 0 },
          ],
          feedbackCorrect: "The expediter calls fire, and the line starts the mains.",
          feedbackWrong: "Fire means start cooking now. The expediter makes that call.",
        },
        {
          terms: ["All Day", "Eighty Six"],
          scene: "Only three salmon are left in the walk-in.",
          steps: [
            { prompt: "Two orders want two salmon, one wants one. How many in total?", options: ["Three", "Five"], correctIndex: 1 },
            { prompt: "There are not enough. What should the pass call?", options: ["Eighty six salmon after three", "Fire every salmon now"], correctIndex: 0 },
          ],
          feedbackCorrect: "Five needed, three left. Sell three, then call it sold out.",
          feedbackWrong: "Count every order first. Then stop selling what you cannot make.",
        },
      ],
      powerPlay: {
        intro: "Run the pass on Friday night.",
        paragraph: "Friday night at Harbor Kitchen is packed. A new {2} prints for table nine. The {1} reads it and counts four steaks {4}. Table six just finished their soup, so she calls {3} on their mains. The last salmon goes out, so she calls {5} on it.",
      },
      facts: ["A busy restaurant kitchen can send out hundreds of plates in one night."],
    },
    {
      number: 6,
      title: "Flavor",
      tier: "Advanced",
      goal: "Build flavor on purpose.",
      milestone: "Build flavor",
      nextMilestone: "Keep cooking",
      companyValue: 1000000,
      nextCompanyValue: 1000000,
      intro: { headline: "Chef's Tasting", line: "The chef tastes every dish before it goes out.", hook: "Learn the words that build flavor." },
      terms: [
        {
          term: "Season", definition: "Adding salt and other flavors so a dish tastes its best.", example: "Season the soup, then taste it again.", cue: "Add salt to bring out flavor", confusion: "Garnish", icon: "salad",
          moments: ["A pinch of salt goes in, then the cook tastes again.", "The sauce tastes flat until a little salt is stirred in.", "Salt and pepper go on the steak before it hits the pan."],
        },
        {
          term: "Acid", definition: "A sour taste, like lemon or vinegar, that makes a dish taste bright.", example: "A squeeze of lemon adds acid to the rich fish.", cue: "A sour taste that brightens food", confusion: "Season", icon: "citrus",
          moments: ["Lime juice wakes up the heavy cream sauce.", "A splash of vinegar cuts through the rich pork.", "The salad dressing needs something sour to taste bright."],
        },
        {
          term: "Umami", definition: "A deep, savory taste found in foods like mushrooms, cheese and broth.", example: "Parmesan adds umami to the pasta sauce.", cue: "A deep, savory, meaty taste", confusion: "Acid", icon: "soup",
          moments: ["Roasted mushrooms make the soup taste deep and meaty.", "A spoon of soy sauce makes the broth taste richer.", "Aged cheese gives the pasta a rich, savory bite."],
        },
        {
          term: "Emulsify", definition: "Mixing oil and vinegar, which do not blend, into one smooth sauce.", example: "Whisk fast to emulsify the oil into the dressing.", cue: "Make oil and water mix smoothly", confusion: "Acid", icon: "blend",
          moments: ["Oil is whisked into egg yolk until it turns thick and creamy.", "The dressing is shaken hard so the oil stops floating on top.", "Cold butter is swirled into the sauce until it turns glossy."],
        },
        {
          term: "Garnish", definition: "A small finishing touch on top of a plate that adds color or flavor.", example: "A sprig of herbs is the garnish on the soup.", cue: "The finishing touch on top", confusion: "Season", icon: "leaf",
          moments: ["Chopped herbs are sprinkled on top right before the plate goes out.", "A thin lemon slice sits on the edge of the fish plate.", "A few drops of bright green oil finish the soup bowl."],
        },
      ],
      cases: [
        {
          terms: ["Acid", "Season"],
          scene: "The cream soup tastes heavy and a little flat.",
          steps: [
            { prompt: "It needs brightness. What should go in?", options: ["A squeeze of lemon", "More cream"], correctIndex: 0 },
            { prompt: "It still tastes flat after that. What is next?", options: ["A pinch of salt", "A sprig of herbs"], correctIndex: 0 },
          ],
          feedbackCorrect: "Sour lifts a heavy dish. Salt brings out the flavor.",
          feedbackWrong: "Lemon adds brightness and salt fixes flat. Herbs only add color.",
        },
        {
          terms: ["Emulsify", "Garnish"],
          scene: "The oil keeps floating on top of the salad dressing.",
          steps: [
            { prompt: "How do you make it one smooth sauce?", options: ["Whisk it hard while pouring", "Let it sit still"], correctIndex: 0 },
            { prompt: "The salad is plated. What goes on last?", options: ["A few fresh herbs on top", "More oil in the bowl"], correctIndex: 0 },
          ],
          feedbackCorrect: "Whisking makes the oil blend in. Herbs on top finish the plate.",
          feedbackWrong: "Oil only blends in when you whisk it. The last touch goes on top.",
        },
      ],
      powerPlay: {
        intro: "Finish the chef's pasta.",
        paragraph: "The chef at Harbor Kitchen tastes the pasta sauce. Aged cheese gives it more {3}. She whisks in cold butter to {4} it into a glossy sauce. It still tastes flat, so she stirs in salt to {1} it. A squeeze of lemon adds {2} to cut the richness. Fresh herbs on top are the {5}.",
      },
      facts: ["Umami is one of five basic tastes, with sweet, sour, salty and bitter."],
    },
  ],
};
