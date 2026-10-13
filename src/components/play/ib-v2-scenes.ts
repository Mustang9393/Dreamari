import type { Tier } from "./types";

// DEMO-ONLY: v1/v2 comparison (12 Oct 2026). A student said the simulation
// graphics "look AI"; Joshua's read is that the separate character sprites
// standing over empty rooms cause it, so he painted full scenes with the
// characters in the room (public/images/play/ib/v2/, 1672x941). v2 plays the
// same run with NO sprites: a beat with a natural match shows Joshua's scene,
// every other beat keeps its v1 room, empty. The beat -> image reasoning, and
// the beats left without one, are in docs/reference/ib-v2-image-map.md.
//
// Chandu: "for now let's do a v2 for the IB game and please use these images
// where logical. Lose the sprites for this version." Flag for Usman: whichever
// way the team decides, fold the winner in and delete this file and both
// toggles (see docs/HANDOFF_INDEX.md).

export type ArtVersion = 1 | 2;

type Point = { x: number; y: number };

/** One of Joshua's full scenes. `focal` / `mobileFocal` are CSS
 *  object-position fractions (0 keeps the left/top edge, 1 the right/bottom),
 *  the same convention as a location's focal in art/<career>.json. Desktop
 *  is about 16:9 like the art, so it barely crops; a 390px phone shows about
 *  a quarter of the width, so `mobileFocal.x` is chosen to keep the face in. */
export type V2Image = { src: string; alt: string; focal: Point; mobileFocal: Point };

const DIR = "/images/play/ib/v2";

// DEMO-ONLY: generated nursing artwork test; existing scripts remain untouched.
const RN_IMAGES = {
  "rn_rosa_station_dawn": {
    "src": "/images/play/rn/v2/rosa-station-dawn-anime.png",
    "alt": "rosa station dawn",
    "focal": {
      "x": 0.53,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.39,
      "y": 0.3
    }
  },
  "rn_rosa_explains_station_morning": {
    "src": "/images/play/rn/v2/rosa-explains-station-morning-anime.png",
    "alt": "rosa explains station morning",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.47,
      "y": 0.3
    }
  },
  "rn_pov_call_lights_corridor_morning": {
    "src": "/images/play/rn/v2/pov-call-lights-corridor-morning-anime.png",
    "alt": "pov call lights corridor morning",
    "focal": {
      "x": 0.6,
      "y": 0.34
    },
    "mobileFocal": {
      "x": 0.93,
      "y": 0.34
    }
  },
  "rn_denise_reads_notes_station_afternoon": {
    "src": "/images/play/rn/v2/denise-reads-notes-station-afternoon-anime.png",
    "alt": "denise reads notes station afternoon",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_tyler_huddle_morning": {
    "src": "/images/play/rn/v2/tyler-huddle-morning-anime.png",
    "alt": "tyler huddle morning",
    "focal": {
      "x": 0.52,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.47,
      "y": 0.3
    }
  },
  "rn_room12_distress_midday": {
    "src": "/images/play/rn/v2/room12-distress-midday-anime.png",
    "alt": "room12 distress midday",
    "focal": {
      "x": 0.65,
      "y": 0.33
    },
    "mobileFocal": {
      "x": 0.65,
      "y": 0.33
    }
  },
  "rn_pov_med_cart_rosa_afternoon": {
    "src": "/images/play/rn/v2/pov-med-cart-rosa-afternoon-anime.png",
    "alt": "pov med cart rosa afternoon",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.64,
      "y": 0.3
    }
  },
  "rn_night_report_station_night": {
    "src": "/images/play/rn/v2/night-report-station-night-anime.png",
    "alt": "night report station night",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_rosa_proud_station_late_day": {
    "src": "/images/play/rn/v2/rosa-proud-station-late-day-anime.png",
    "alt": "rosa proud station late day",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.47,
      "y": 0.3
    }
  },
  "rn_room12_anxious_morning": {
    "src": "/images/play/rn/v2/room12-anxious-morning-anime.png",
    "alt": "room12 anxious morning",
    "focal": {
      "x": 0.65,
      "y": 0.33
    },
    "mobileFocal": {
      "x": 0.65,
      "y": 0.33
    }
  },
  "rn_rosa_concerned_station_morning": {
    "src": "/images/play/rn/v2/rosa-concerned-station-morning-anime.png",
    "alt": "rosa concerned station morning",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.47,
      "y": 0.3
    }
  },
  "rn_riverbend_lobby_morning": {
    "src": "/images/play/rn/v2/riverbend-lobby-morning.png",
    "alt": "riverbend lobby morning",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_four_west_station_morning": {
    "src": "/images/play/rn/v2/four-west-station-morning.png",
    "alt": "four west station morning",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_four_west_corridor_morning": {
    "src": "/images/play/rn/v2/four-west-corridor-morning.png",
    "alt": "four west corridor morning",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_four_west_staff_room_day": {
    "src": "/images/play/rn/v2/four-west-staff-room-day.png",
    "alt": "four west staff room day",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_yvonne_lobby_trailer": {
    "src": "/images/play/rn/v2/yvonne-lobby-trailer.png",
    "alt": "yvonne lobby trailer",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_four_west_ward_night": {
    "src": "/images/play/rn/v2/four-west-ward-night.png",
    "alt": "four west ward night",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  },
  "rn_denise_concerned_station_afternoon": {
    "src": "/images/play/rn/v2/denise-concerned-station-afternoon-anime.png",
    "alt": "denise concerned station afternoon",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    }
  }
} satisfies Record<string, V2Image>;

// DEMO-ONLY: keep the RN start and lesson art in sync with the live toggle.
// Return stable objects so switching art never rebuilds the game data.
const RN_PRE_GAME_ART = {
  cover: RN_IMAGES.rn_four_west_station_morning,
  lesson: RN_IMAGES.rn_room12_anxious_morning,
};

export function v2PreGameArtFor(simulationId: string): { cover: V2Image; lesson?: V2Image } | undefined {
  return simulationId === "registered-nurse" ? RN_PRE_GAME_ART : undefined;
}

const IMAGES = {
  ...RN_IMAGES,
  christinaPresentsOfficeDay: {
    src: `${DIR}/christina-presents-office-day.webp`,
    alt: "Christina in the bright Cobalt Capital office, an open hand out as if introducing you.",
    focal: { x: 0.46, y: 0.3 },
    mobileFocal: { x: 0.46, y: 0.3 },
  },
  christinaThumbsUpOfficeDay: {
    src: `${DIR}/christina-thumbsup-office-day.webp`,
    alt: "Christina smiling with a thumbs up in the bright Cobalt Capital office.",
    focal: { x: 0.5, y: 0.32 },
    mobileFocal: { x: 0.52, y: 0.32 },
  },
  christinaJordanReceptionDay: {
    src: `${DIR}/christina-jordan-reception-day.webp`,
    alt: "Christina at reception, gesturing to Jordan, a new intern with a shoulder bag.",
    focal: { x: 0.47, y: 0.3 },
    // A phone cannot hold both faces; it keeps Christina (who meets you)
    // and her open hand, with Jordan at the edge.
    mobileFocal: { x: 0.32, y: 0.3 },
  },
  christinaPresentsMeetingSunset: {
    src: `${DIR}/christina-presents-meeting-sunset.webp`,
    alt: "Christina at sunset, gesturing toward a meeting in progress behind a glass wall.",
    focal: { x: 0.45, y: 0.25 },
    mobileFocal: { x: 0.4, y: 0.25 },
  },
  christinaThumbsUpGlassDoorSunset: {
    src: `${DIR}/christina-thumbsup-glassdoor-sunset.webp`,
    alt: "Christina smiling with a thumbs up by a glass meeting-room door at sunset.",
    focal: { x: 0.42, y: 0.25 },
    mobileFocal: { x: 0.41, y: 0.25 },
  },
  marcusBoardroomSunset: {
    src: `${DIR}/man-boardroom-sunset.webp`,
    alt: "Marcus, the Vice President, adjusting his cuff in the boardroom at sunset.",
    focal: { x: 0.49, y: 0.2 },
    mobileFocal: { x: 0.48, y: 0.2 },
  },
  christinaMarcusBoardroomSunset: {
    src: `${DIR}/christina-man-boardroom-sunset.webp`,
    alt: "Christina presenting Marcus in the boardroom at sunset.",
    focal: { x: 0.47, y: 0.25 },
    // A phone cannot hold both faces; it keeps Marcus, who speaks here,
    // with Christina's presenting hand beside him.
    mobileFocal: { x: 0.56, y: 0.25 },
  },
  jordanTradingFloorSunset: {
    src: `${DIR}/jordan-trading-floor-sunset.webp`,
    alt: "Jordan on the trading floor at sunset, bag on his shoulder, smiling.",
    focal: { x: 0.48, y: 0.2 },
    mobileFocal: { x: 0.47, y: 0.2 },
  },
  povCoffeeJordanPitchSunset: {
    src: `${DIR}/pov-coffee-jordan-pitch-sunset.webp`,
    alt: "Your coffee in hand, you watch Jordan show a spreadsheet to a seated manager at sunset.",
    focal: { x: 0.5, y: 0.3 },
    mobileFocal: { x: 0.44, y: 0.3 },
  },
  povDeskColleagueLeavesDay: {
    src: `${DIR}/pov-desk-colleague-leaves-day.webp`,
    alt: "Your hand on the laptop at a messy desk while an intern walks out carrying a box of his things.",
    focal: { x: 0.6, y: 0.3 },
    mobileFocal: { x: 0.86, y: 0.3 },
  },
} satisfies Record<string, V2Image>;

type ImageKey = keyof typeof IMAGES;

/** `image` shows while the beat plays. `best`, when set, replaces it while a
 *  Best verdict is up: v1's room clears for the reactor's proud face at that
 *  moment, and the nearest v2 equivalent is Christina's thumbs up. Any other
 *  verdict keeps `image` (there is no concerned Christina scene yet). */
type BeatArt = { image: ImageKey; best?: ImageKey; wrong?: ImageKey };

// Investment Banking, Level 1 (ib-level-1-v2.ts), plus the two Level 2 beats
// that match a scene exactly. Any beat not listed keeps its v1 room.
const IB_BEATS: Record<string, BeatArt> = {
  // Screen 3: "Time to meet your team." Christina's introduction, an open hand.
  "L1-07": { image: "christinaPresentsOfficeDay" },
  // Screen 4: her feedback reaches the people who decide your offer.
  "L1-08": { image: "christinaThumbsUpOfficeDay" },
  // Screen 5: "Christina meets you at reception. Jordan ... is starting today too."
  "L1-10": { image: "christinaJordanReceptionDay" },
  // Screens 6-7: still at reception on day one; a Best answer earns the thumbs up.
  "L1-11": { image: "christinaJordanReceptionDay", best: "christinaThumbsUpOfficeDay" },
  // Screens 8-14: "Before client work, you need to learn the language" -- she
  // points at the client meeting behind the glass.
  "L1-14": { image: "christinaPresentsMeetingSunset" },
  "L1-16": { image: "christinaPresentsMeetingSunset" },
  // Screens 15-20: "You're about to work with big brands and executives."
  "L1-18": { image: "christinaPresentsMeetingSunset", best: "christinaThumbsUpGlassDoorSunset" },
  // Screen 21: client information stays private (the closed meeting room).
  "L1-19": { image: "christinaPresentsMeetingSunset" },
  "L1-20": { image: "christinaPresentsMeetingSunset", best: "christinaThumbsUpGlassDoorSunset" },
  // Screens 24-26: Marcus, alone, in his boardroom.
  "L1-21": { image: "marcusBoardroomSunset" },
  "L1-21b": { image: "marcusBoardroomSunset" },
  "L1-22": { image: "marcusBoardroomSunset" },
  // Screens 27-29: Christina and Marcus together for the challenge.
  "L1-24": { image: "christinaMarcusBoardroomSunset" },
  // Screen 30: "Marcus and Christina are reviewing your progress so far."
  "L1-CHECK": { image: "christinaMarcusBoardroomSunset" },
  // Screen 31: Jordan, competitive, on the trading floor.
  "L1-26": { image: "jordanTradingFloorSunset" },
  // Screens 32-34: you hear Jordan tell a manager he built your spreadsheet.
  "L1-27": { image: "povCoffeeJordanPitchSunset" },
  "L1-28": { image: "povCoffeeJordanPitchSunset" },
  // Screens 35-37: 3:00 P.M., an intern on your project quits; you message Christina.
  "L1-29": { image: "povDeskColleagueLeavesDay" },
  "L1-30": { image: "povDeskColleagueLeavesDay" },
  // Screen 44: "Your internship is complete." Christina's praise, back in the office.
  "L1-35": { image: "christinaThumbsUpOfficeDay" },
  // Level 2: Jordan's red flags on the trading floor at sunset; Marcus's
  // rapid-fire round in the internal boardroom at sunset.
  "L2-17": { image: "jordanTradingFloorSunset" },
  "L2-21": { image: "marcusBoardroomSunset" },
};

const RN_BEATS: Record<string, BeatArt> = {
  "RN2-04": {
    "image": "rn_rosa_station_dawn",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-05": {
    "image": "rn_rosa_station_dawn",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-06": {
    "image": "rn_rosa_station_dawn"
  },
  "RN2-07": {
    "image": "rn_rosa_station_dawn",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-08": {
    "image": "rn_rosa_proud_station_late_day",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-10": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-11": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN2-15": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-17": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-18": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-30": {
    "image": "rn_rosa_proud_station_late_day",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-32": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN2-33": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN2-26": {
    "image": "rn_pov_call_lights_corridor_morning"
  },
  "RN2-29": {
    "image": "rn_pov_call_lights_corridor_morning"
  },
  "RN2-35": {
    "image": "rn_denise_reads_notes_station_afternoon",
    "wrong": "rn_denise_concerned_station_afternoon"
  },
  "RN2-36": {
    "image": "rn_denise_reads_notes_station_afternoon",
    "wrong": "rn_denise_concerned_station_afternoon"
  },
  "RN2-37": {
    "image": "rn_denise_reads_notes_station_afternoon"
  },
  "RN2-38": {
    "image": "rn_denise_reads_notes_station_afternoon",
    "wrong": "rn_denise_concerned_station_afternoon"
  },
  "RN2-40": {
    "image": "rn_tyler_huddle_morning"
  },
  "RN2-41": {
    "image": "rn_tyler_huddle_morning"
  },
  "RN2-43": {
    "image": "rn_room12_distress_midday"
  },
  "RN2-44": {
    "image": "rn_room12_distress_midday"
  },
  "RN2-45": {
    "image": "rn_room12_distress_midday"
  },
  "RN2-47": {
    "image": "rn_pov_med_cart_rosa_afternoon"
  },
  "RN2-48": {
    "image": "rn_pov_med_cart_rosa_afternoon"
  },
  "RN2-50": {
    "image": "rn_night_report_station_night"
  },
  "RN2-51": {
    "image": "rn_night_report_station_night"
  },
  "RN2-54": {
    "image": "rn_night_report_station_night"
  },
  "RN2-53": {
    "image": "rn_rosa_proud_station_late_day",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN2-23": {
    "image": "rn_room12_anxious_morning"
  },
  "RN2-24": {
    "image": "rn_room12_anxious_morning"
  },
  "RN2-01": {
    "image": "rn_riverbend_lobby_morning"
  },
  "RN2-02": {
    "image": "rn_four_west_station_morning"
  },
  "RN2-03": {
    "image": "rn_four_west_corridor_morning"
  },
  "RN2-28": {
    "image": "rn_four_west_staff_room_day"
  },
  "RN1-01": {
    "image": "rn_riverbend_lobby_morning"
  },
  "RN1-02": {
    "image": "rn_four_west_station_morning"
  },
  "RN1-03": {
    "image": "rn_four_west_corridor_morning"
  },
  "RN1-04": {
    "image": "rn_rosa_station_dawn"
  },
  "RN1-04b": {
    "image": "rn_rosa_station_dawn"
  },
  "RN1-05": {
    "image": "rn_rosa_station_dawn"
  },
  "RN1-06": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-07": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN1-08": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN1-09": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-10": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN1-11": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN1-12": {
    "image": "rn_four_west_staff_room_day",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-13": {
    "image": "rn_four_west_staff_room_day",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-14": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-15": {
    "image": "rn_pov_call_lights_corridor_morning"
  },
  "RN1-16": {
    "image": "rn_rosa_explains_station_morning"
  },
  "RN1-17": {
    "image": "rn_rosa_explains_station_morning",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-18": {
    "image": "rn_denise_reads_notes_station_afternoon",
    "wrong": "rn_denise_concerned_station_afternoon"
  },
  "RN1-19": {
    "image": "rn_denise_reads_notes_station_afternoon",
    "wrong": "rn_denise_concerned_station_afternoon"
  },
  "RN1-20": {
    "image": "rn_denise_reads_notes_station_afternoon",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-21": {
    "image": "rn_tyler_huddle_morning"
  },
  "RN1-22": {
    "image": "rn_tyler_huddle_morning"
  },
  "RN1-23": {
    "image": "rn_room12_distress_midday"
  },
  "RN1-24": {
    "image": "rn_night_report_station_night"
  },
  "RN1-25": {
    "image": "rn_rosa_proud_station_late_day",
    "wrong": "rn_rosa_concerned_station_morning"
  },
  "RN1-26": {
    "image": "rn_night_report_station_night"
  }
};

const V2_ART: Record<string, Record<string, BeatArt>> = {
  "registered-nurse": RN_BEATS,
  "investment-banking": IB_BEATS,
};

/** True when this simulation has a v2 art set (and so shows the toggles). */
export function hasV2Art(simulationId: string): boolean {
  return simulationId in V2_ART;
}

/** The v2 scene for a beat, or undefined when the beat keeps its v1 room. */
export function v2SceneFor(simulationId: string, beatId: string, verdict?: Tier): V2Image | undefined {
  const art = V2_ART[simulationId]?.[beatId];
  if (!art) return undefined;
  const selected = verdict === "best" && art.best ? art.best : (verdict === "wrong" || verdict === "risky") && art.wrong ? art.wrong : art.image;
  return IMAGES[selected];
}

/** Every v2 image a beat can show, for warming the next beats' pictures. */
export function v2SourcesFor(simulationId: string, beatId: string): string[] {
  const art = V2_ART[simulationId]?.[beatId];
  if (!art) return [];
  return [art.image, art.best, art.wrong].filter((key): key is ImageKey => Boolean(key)).map(key => IMAGES[key].src);
}
