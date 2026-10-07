// What each roster portrait shows (public/images/avatars/students/student-NN
// .png, 33 to 80), read off the portraits themselves on 7 Oct 2026. The demo
// roster already maps every name to a portrait hand-matched for gender and
// background (lib/counselorRosterPortraits.ts), so the procedural avatar
// takes its gender presentation, skin tone, hair and hair colour from the
// same portrait and stays true to the name (Chandu: "make sure the avatars go
// with the names and genders and ethnicities for the demo").
//
// g: f feminine, m masculine, n gender-neutral
// t: skin tone 1 (light) to 5 (deep)
// h: hairstyle (GenAvatar's HAIR keys)
// c: hair colour (dark by default)

export type Hair =
  | "short" | "swept" | "wavy" | "curlyTop" | "fade" | "buzz" | "locs" | "cornrows"
  | "longStraight" | "longWavy" | "longCurly" | "boxBraids" | "twoBraids" | "sideBraid"
  | "ponytail" | "bun" | "puffs" | "afro" | "bob" | "pixie" | "hijab" | "curlyUpdo" | "shaggy";
export type Traits = { g: "f" | "m" | "n"; t: 1 | 2 | 3 | 4 | 5; h: Hair; c?: "dark" | "brown" | "light" };

export const PORTRAIT_TRAITS: Record<number, Traits> = {
  33: { g: "m", t: 1, h: "wavy", c: "brown" },
  34: { g: "f", t: 5, h: "boxBraids" },
  35: { g: "m", t: 2, h: "short" },
  36: { g: "f", t: 4, h: "sideBraid" },
  37: { g: "n", t: 3, h: "short" },
  38: { g: "f", t: 3, h: "longCurly" },
  39: { g: "m", t: 4, h: "curlyTop" },
  40: { g: "n", t: 3, h: "shaggy" },
  41: { g: "f", t: 1, h: "bob", c: "brown" },
  42: { g: "m", t: 5, h: "locs" },
  43: { g: "f", t: 2, h: "longStraight" },
  44: { g: "m", t: 3, h: "swept" },
  45: { g: "m", t: 5, h: "buzz" },
  46: { g: "m", t: 3, h: "curlyTop" },
  47: { g: "f", t: 3, h: "hijab" },
  48: { g: "f", t: 5, h: "afro" },
  49: { g: "m", t: 1, h: "swept", c: "brown" },
  50: { g: "m", t: 5, h: "curlyTop" },
  51: { g: "f", t: 2, h: "ponytail" },
  52: { g: "f", t: 5, h: "longCurly" },
  53: { g: "f", t: 3, h: "longWavy" },
  54: { g: "m", t: 5, h: "fade" },
  55: { g: "m", t: 3, h: "curlyTop" },
  56: { g: "m", t: 5, h: "cornrows" },
  57: { g: "f", t: 1, h: "longWavy", c: "light" },
  58: { g: "m", t: 5, h: "buzz" },
  59: { g: "m", t: 2, h: "shaggy" },
  60: { g: "m", t: 5, h: "curlyTop" },
  61: { g: "f", t: 5, h: "bun" },
  62: { g: "m", t: 1, h: "wavy", c: "brown" },
  63: { g: "f", t: 3, h: "longCurly" },
  64: { g: "f", t: 5, h: "puffs" },
  65: { g: "n", t: 1, h: "pixie", c: "brown" },
  66: { g: "f", t: 5, h: "bun" },
  67: { g: "m", t: 3, h: "fade" },
  68: { g: "f", t: 3, h: "longStraight" },
  69: { g: "m", t: 3, h: "wavy" },
  70: { g: "f", t: 5, h: "curlyUpdo" },
  71: { g: "n", t: 2, h: "bob" },
  72: { g: "m", t: 5, h: "curlyTop" },
  73: { g: "f", t: 1, h: "twoBraids", c: "light" },
  74: { g: "m", t: 5, h: "fade" },
  75: { g: "f", t: 2, h: "shaggy" },
  76: { g: "m", t: 4, h: "curlyTop" },
  77: { g: "f", t: 4, h: "ponytail" },
  78: { g: "m", t: 3, h: "curlyTop" },
  79: { g: "m", t: 3, h: "fade" },
  80: { g: "f", t: 5, h: "boxBraids" },
};

/** The live demo student (Jordan Rivera) wears the Black masculine portrait. */
export const LIVE_TRAITS: Traits = { g: "m", t: 5, h: "curlyTop" };
