import type { V2Image } from "./ib-v2-scenes";

// One immutable plate per camera, shared by all people and time states.
export const RN_IMAGES = {
  "rn_rosa_station_dawn": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Rosa welcomes the new shift",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "rosa-station-dawn",
      "location": "station",
      "timeClass": "dawn",
      "scale": 0.82,
      "top": 0.02,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/rosa-station-dawn.png"
    }
  },
  "rn_rosa_explains_station_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Rosa explains the shift",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "rosa-explains-station-morning",
      "location": "station",
      "timeClass": "day",
      "scale": 0.82,
      "top": 0.02,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/rosa-explains-station-morning.png"
    }
  },
  "rn_pov_call_lights_corridor_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/corridor.png",
    "alt": "Call lights on Four West",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "pov-call-lights-corridor-morning",
      "location": "corridor",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": true,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/pov-call-lights-corridor-morning.png"
    }
  },
  "rn_denise_reads_notes_station_afternoon": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Denise reviews the notes",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "denise-reads-notes-station-afternoon",
      "location": "station",
      "timeClass": "day",
      "scale": 0.82,
      "top": 0.02,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/denise-reads-notes-station-afternoon.png"
    }
  },
  "rn_tyler_huddle_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Tyler leads the huddle",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "tyler-huddle-morning",
      "location": "station",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/tyler-huddle-morning.png"
    }
  },
  "rn_room12_distress_midday": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/room12.png",
    "alt": "Room 12: distress",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "room12-distress-midday",
      "location": "room12",
      "timeClass": "midday",
      "scale": 1,
      "top": 0,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/room12-distress-midday.png"
    }
  },
  "rn_pov_med_cart_rosa_afternoon": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/corridor.png",
    "alt": "Rosa at the medication cart",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "pov-med-cart-rosa-afternoon",
      "location": "corridor",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/pov-med-cart-rosa-afternoon.png"
    }
  },
  "rn_night_report_station_night": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "The night nurse takes report",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "night-report-station-night",
      "location": "station",
      "timeClass": "night",
      "scale": 1,
      "top": 0,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/night-report-station-night.png"
    }
  },
  "rn_rosa_proud_station_late_day": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Rosa\u2019s proud reaction",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "rosa-proud-station-late-day",
      "location": "station",
      "timeClass": "late",
      "scale": 0.82,
      "top": 0.02,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/rosa-proud-station-late-day.png"
    }
  },
  "rn_room12_anxious_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/room12.png",
    "alt": "Room 12: anxious questioning",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "room12-anxious-morning",
      "location": "room12",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/room12-anxious-morning.png"
    }
  },
  "rn_rosa_concerned_station_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Rosa\u2019s concerned reaction",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "rosa-concerned-station-morning",
      "location": "station",
      "timeClass": "day",
      "scale": 0.82,
      "top": 0.02,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/rosa-concerned-station-morning.png"
    }
  },
  "rn_riverbend_lobby_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/lobby.png",
    "alt": "Riverbend reception",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "riverbend-lobby-morning",
      "location": "lobby",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false
    }
  },
  "rn_four_west_station_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Four West station",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "four-west-station-morning",
      "location": "station",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false
    }
  },
  "rn_four_west_corridor_morning": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/corridor.png",
    "alt": "Four West corridor",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "four-west-corridor-morning",
      "location": "corridor",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false
    }
  },
  "rn_four_west_staff_room_day": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/staff.png",
    "alt": "Staff break room",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "four-west-staff-room-day",
      "location": "staff",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false
    }
  },
  "rn_yvonne_lobby_trailer": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/lobby.png",
    "alt": "Yvonne in the lobby",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "yvonne-lobby-trailer",
      "location": "lobby",
      "timeClass": "day",
      "scale": 1,
      "top": 0,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/yvonne-lobby-trailer.png"
    }
  },
  "rn_four_west_ward_night": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/room12.png",
    "alt": "Room 12 after dark",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "four-west-ward-night",
      "location": "room12",
      "timeClass": "night",
      "scale": 1,
      "top": 0,
      "doorPatch": false
    }
  },
  "rn_denise_concerned_station_afternoon": {
    "src": "/images/play/rn/v2/locked-2026-10-19/backgrounds/station.png",
    "alt": "Denise\u2019s concerned reaction",
    "focal": {
      "x": 0.5,
      "y": 0.3
    },
    "mobileFocal": {
      "x": 0.5,
      "y": 0.3
    },
    "composition": {
      "id": "denise-concerned-station-afternoon",
      "location": "station",
      "timeClass": "day",
      "scale": 0.82,
      "top": 0.02,
      "doorPatch": false,
      "foreground": "/images/play/rn/v2/locked-2026-10-19/foregrounds/denise-concerned-station-afternoon.png"
    }
  }
} satisfies Record<string, V2Image>;
