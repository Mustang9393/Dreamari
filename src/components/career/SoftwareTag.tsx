"use client";

// Software & Skills > Software: one tag per tool, each with a mark on the
// left. A named product gets its real logo, committed under
// public/images/logos/software by scripts/software-logos.mjs; a category
// ("Scheduling software", "GPS navigation apps") gets an icon chosen from
// its words. Nothing falls back to initials.
//
// Why (23 Oct 2026, Chandu): "can we reliably show the logos of every logo
// needed on the softwares tabs ... with no stupid initials fallback stuff?"
// The Sept 2026 version drew ~20 logos and a plain dot for the rest, and
// was dropped for being inconsistent; this one gives every tag a mark of
// the same size and shape, so the row reads as one set.
//
// The data names a category as often as a product (577 distinct names
// across the profiles; about 40% are categories like "Point of sale (POS)
// systems" or "None specific -- hands-on trade tools"). A category has no
// logo to fetch, so it takes a category icon in the world accent on a tinted
// tile; a logo sits straight on the tag, transparent, as published.

import { createElement, useState, type ComponentType } from "react";
import {
  Accessibility, Activity, AppWindow, Apple, Archive, Banknote, Bike, BookOpen, Boxes, Building2, Bus, Cable, Calculator, CalendarDays, Camera, Car, ChartNoAxesCombined,
  ClipboardCheck, ClipboardList, Code, Cpu, CreditCard, Database, Dumbbell, Eye, FingerprintPattern, FlaskConical, Flame, Gauge, Globe, GraduationCap, Hammer, HardHat, HeartPulse,
  KeyRound, Landmark, Library, ListChecks, Lock, Mail, Map, Megaphone, MessageSquare, Mic, Music, Navigation, Package, Paintbrush, PawPrint, PencilRuler, Phone, Pill, Plane,
  Radar, Radio, Route, Ruler, Scale, ScanBarcode, Scissors, Shield, Ship, Shirt, Siren, SprayCan, Stethoscope, Sun, Ticket, Tractor, TrainFront, Truck, Users,
  UtensilsCrossed, Volume2, Wallet, Wind, Wrench, Zap, type LucideProps,
} from "lucide-react";
import { SOFTWARE_LOGOS } from "./softwareLogos.generated";

type Icon = ComponentType<LucideProps>;

// First match wins, so the specific rule sits above the broad one.
const CATEGORY: [RegExp, Icon][] = [
  [/fingerprint|\bdna\b|codis|iafis/i, FingerprintPattern],
  [/body camera|camera|imaging|pacs|image processing|virtual surgery|scan tools/i, Camera],
  [/barcode|rf scanner|scanning device/i, ScanBarcode],
  [/point of sale|\bpos\b|checkout|teller|transaction|payment/i, CreditCard],
  [/warehouse|inventory|cargo|logistics|merchandis|planogram|parts database|booth/i, Boxes],
  [/delivery|fleet|truck|logging devices/i, Truck],
  [/ride-|rideshare|\bcar\b/i, Car],
  [/rail|train/i, TrainFront],
  [/transit|\bbus\b/i, Bus],
  [/vessel|\bship|manifest/i, Ship],
  [/flight|aircraft|avionics|in-flight|crew/i, Plane],
  [/radar|air traffic|eram|\bstars\b|flight strips/i, Radar],
  [/dispatch|radio/i, Radio],
  [/schedul|calendar|appointment|booking|staffing/i, CalendarDays],
  [/\bgps\b|navigation|route/i, Navigation],
  [/mapping|\bmap\b|\bgis\b|grid/i, Map],
  [/weld|torch/i, Flame],
  [/paint/i, Paintbrush],
  [/measuring|layout|leveling|alignment|ruler/i, Ruler],
  [/trade tools|hand tools|rigging/i, Hammer],
  [/protective equipment|hard hat|safety gear/i, HardHat],
  [/cleaning/i, SprayCan],
  [/equipment operation|heavy equipment|tractor/i, Tractor],
  [/key-cutting|\bkey\b/i, KeyRound],
  [/access control|jail|lock/i, Lock],
  [/cable|wiring|network|otdr|signal tester/i, Cable],
  [/solar/i, Sun],
  [/turbine|wind/i, Wind],
  [/outage|electric|power grid/i, Zap],
  [/plc|scada|cnc|controller|machine/i, Cpu],
  [/gauge|monitoring|meter|test equipment|testing equipment/i, Gauge],
  [/diagnos|repair|obd|maintenance|cmms|service database|technical manual|manufacturer/i, Wrench],
  [/manual|reference|handbook/i, BookOpen],
  [/\blims\b|lab information|laborator|chem|chromatograph/i, FlaskConical],
  [/catalog|library|worldcat/i, Library],
  [/filing|records system|archive/i, Archive],
  [/database|data ?base|public records/i, Database],
  [/anesthesia|surgery|surgical|\becg\b|echo and|heart|cardio|patient monitor/i, HeartPulse],
  [/\behr\b|health record|medical|clinic|hospital|chiro|dent|practice management|visit|telehealth|treatment/i, Stethoscope],
  [/\beye|optom|vision/i, Eye],
  [/drug|pharm|medication/i, Pill],
  [/nutrition|diet|food ?works/i, Apple],
  [/menu|recipe|food|bake|restaurant|culinary|kitchen/i, UtensilsCrossed],
  [/garment|tailor|apparel|fashion/i, Shirt],
  [/scissors|salon|barber|hair/i, Scissors],
  [/\bpet\b|breed|animal|veterinar|vet\b/i, PawPrint],
  [/bicycle|bike/i, Bike],
  [/fitness|trainer|workout|gym/i, Dumbbell],
  [/music|tuner|rehearsal|strobe|verituner|onlypure|prolevel|countz|audio/i, Music],
  [/microphone|\bmic\b|podcast|voice/i, Mic],
  [/text-to-speech|speech|screen reader|read aloud/i, Volume2],
  [/accessib|assistive/i, Accessibility],
  [/learning management|educational|student|classroom|\biep\b|test scoring|training software|tutoring|grade/i, GraduationCap],
  [/email|e-mail|\bmail\b/i, Mail],
  [/chat|messag|communication/i, MessageSquare],
  [/phone|call center|telephone/i, Phone],
  [/social media|social platforms|ad manager|marketing|website tools|press/i, Megaphone],
  [/analytics|dashboard|statistic|data analysis|survey|forecast|trend/i, ChartNoAxesCombined],
  [/report writing|report/i, ClipboardList],
  [/budget|financial|accounting|payroll|cost|invoice|billing|bookkeeping/i, Calculator],
  [/trading|portfolio|investment|wealth|fund/i, Wallet],
  [/bank|insurance|claims|estimating|quoting|loan|mortgage/i, Banknote],
  [/\bmls\b|listing|real estate|property/i, Building2],
  [/\bcrm\b|client|donor|volunteer|applicant|recruit|\bhr\b|human resources/i, Users],
  [/ticket/i, Ticket],
  [/project management|project tracking|task/i, ListChecks],
  [/inspection|permit|compliance|checklist|tracking/i, ClipboardCheck],
  [/court|case management|legal|law\b/i, Scale],
  [/emergency|femis|hurrtrak|weather|siren|webeoc|alert/i, Siren],
  [/security|tecs|customs|enforcement|surveillance|guard/i, Shield],
  [/\bcad\b|drafting|design software|3d|modeling|blueprint/i, PencilRuler],
  [/browser|\bweb\b|internet|online/i, Globe],
  [/\bxml\b|code|language|script|programming|software development/i, Code],
  [/finance|treasury|government/i, Landmark],
  [/logging|sensor|data logger/i, Activity],
  [/field|outdoor|forest|crop|farm|agri/i, Route],
  [/package|shipping|parcel/i, Package],
];

export function categoryIcon(name: string): Icon {
  for (const [re, icon] of CATEGORY) if (re.test(name)) return icon;
  return AppWindow;
}

/** The tag's words: a category written as "None specific -- X" reads as
 *  "X" (the mark already says it is a tool, and the double hyphen is a
 *  stand-in for a dash the house style never uses). */
export function softwareLabel(name: string) {
  const m = name.match(/^none specific\s*(?:--|-|—|:)\s*(.+)$/i);
  if (!m) return name;
  const rest = m[1].trim();
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

// Marks published as black on transparent vanish on the dark glass. Nearly
// every brand guide allows the reversed (white) one-colour version on a dark
// ground, so these, and only these, are shown reversed; a coloured mark is
// never touched.
const REVERSED = new Set([
  "bloomberg-terminal", "cerner", "pixieset", "matrixgold", "zoom", "splunk-enterprise", "sql", "garmin-pilot", "intuit-proconnect",
  "statacorp-stata", "catapult", "dante-controller", "x-and-social-platforms", "obs-studio", "notion", "unity", "keynote", "logic-pro",
  "autodesk-fabrication-camduct", "foreflight", "clio", "vectorworks-spotlight", "capture-one",
]);
const reversed = (src: string) => REVERSED.has(src.replace(/^.*\//, "").replace(/\.[a-z]+$/, ""));

function Mark({ name, accent }: { name: string; accent: string }) {
  const logo = SOFTWARE_LOGOS[name];
  // a committed file that still fails to load (a bad cache, a renamed asset)
  // drops to the category icon, never to letters
  const [broken, setBroken] = useState(false);
  if (logo && !broken) {
    // the official mark as published, full colour on a transparent ground,
    // never recoloured or boxed (Chandu, 23 Oct 2026: "make sure they are
    // transparent backgrounds"; a monochrome set was weighed and dropped:
    // recolouring a mark is against nearly every brand guideline)
    return (
      <span aria-hidden className="flex size-[26px] flex-none items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={20} height={20} loading="lazy" decoding="async" className={`size-[20px] object-contain ${reversed(logo) ? "[filter:invert(1)]" : ""}`} onError={() => setBroken(true)} />
      </span>
    );
  }
  return (
    <span aria-hidden className="flex size-[26px] flex-none items-center justify-center rounded-[7px]" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
      {createElement(categoryIcon(name), { className: "size-[15px]", strokeWidth: 2.25 })}
    </span>
  );
}

export function SoftwareTags({ items, accent }: { items: string[]; accent: string }) {
  const clean = items.map((s) => s.trim()).filter(Boolean);
  return (
    <ul className="flex flex-wrap gap-[8px]">
      {clean.map((name) => (
        <li
          key={name}
          className="flex min-h-[38px] items-center gap-[9px] rounded-[10px] border py-[5px] pr-[12px] pl-[6px] text-[14px] leading-[20px]"
          style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
        >
          <Mark name={name} accent={accent} />
          <span className="min-w-0">{softwareLabel(name)}</span>
        </li>
      ))}
    </ul>
  );
}
