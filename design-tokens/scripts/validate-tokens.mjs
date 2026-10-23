import {
  FILES,
  aliasPath,
  collectTokens,
  mergeTokenMaps,
  readTokenFile,
  resolveComposite,
  resolveToken,
} from "./token-utils.mjs";

const documents = Object.fromEntries(Object.entries(FILES).map(([key, file]) => [key, readTokenFile(file)]));
const maps = Object.fromEntries(Object.entries(documents).map(([key, document]) => [key, collectTokens(document)]));
const errors = [];
const validTypes = new Set(["color", "dimension", "fontFamily", "fontWeight", "number", "duration", "typography", "shadow"]);

function fail(message) {
  errors.push(message);
}

function validateValue(tokenPath, token) {
  const type = token.$resolvedType;
  const value = token.$value;
  if (!type) return fail(`${tokenPath}: missing $type and no inherited group type.`);
  if (!validTypes.has(type)) return fail(`${tokenPath}: unsupported $type ${type}.`);
  if (!token.$description?.trim()) fail(`${tokenPath}: missing $description.`);
  if (aliasPath(value)) return;

  if (type === "color") {
    if (!value || typeof value !== "object" || value.colorSpace !== "srgb" || !Array.isArray(value.components) || value.components.length !== 3) {
      fail(`${tokenPath}: color must use the DTCG color object with srgb and three components.`);
    }
    if (value?.hex && !/^#[0-9a-f]{6}$/i.test(value.hex)) fail(`${tokenPath}: color hex fallback must contain exactly six hex digits.`);
  } else if (type === "dimension" || type === "duration") {
    const units = type === "dimension" ? new Set(["px", "rem"]) : new Set(["ms", "s"]);
    if (!value || typeof value.value !== "number" || !units.has(value.unit)) fail(`${tokenPath}: invalid ${type} object or unit.`);
  } else if (type === "fontFamily") {
    if (!(typeof value === "string" || (Array.isArray(value) && value.every((item) => typeof item === "string")))) fail(`${tokenPath}: invalid fontFamily value.`);
  } else if (type === "fontWeight" || type === "number") {
    if (typeof value !== "number") fail(`${tokenPath}: ${type} must be numeric.`);
  } else if (type === "typography") {
    const required = ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight"];
    if (!value || typeof value !== "object" || required.some((key) => !Object.hasOwn(value, key))) fail(`${tokenPath}: typography composite is incomplete.`);
  } else if (type === "shadow") {
    const shadows = Array.isArray(value) ? value : [value];
    const required = ["color", "offsetX", "offsetY", "blur", "spread"];
    if (shadows.some((shadow) => !shadow || required.some((key) => !Object.hasOwn(shadow, key)))) fail(`${tokenPath}: shadow composite is incomplete.`);
  }
}

for (const [name, document] of Object.entries(documents)) {
  if (document.$schema !== "https://www.designtokens.org/schemas/2025.10/format.json") fail(`${FILES[name]}: missing the pinned DTCG 2025.10 schema.`);
  for (const [tokenPath, token] of maps[name]) validateValue(`${FILES[name]}:${tokenPath}`, token);
}

function validateMode(mode, primitiveMap, semanticMap) {
  const tokens = mergeTokenMaps(primitiveMap, semanticMap, maps.components);
  for (const [tokenPath, token] of tokens) {
    try {
      resolveToken(tokenPath, tokens);
      resolveComposite(token.$value, tokens);
    } catch (error) {
      fail(`${mode}:${tokenPath}: ${error.message}`);
    }
  }
}

validateMode("light", maps.primitivesLight, maps.semanticLight);
validateMode("dark", maps.primitivesDark, maps.semanticDark);

function tokenSignature(map) {
  return new Map([...map].map(([tokenPath, token]) => [tokenPath, token.$resolvedType]));
}

function validateModeParity(label, left, right) {
  const leftSignature = tokenSignature(left);
  const rightSignature = tokenSignature(right);
  const allPaths = new Set([...leftSignature.keys(), ...rightSignature.keys()]);
  for (const tokenPath of allPaths) {
    if (!leftSignature.has(tokenPath)) fail(`${label}:${tokenPath}: missing from light mode.`);
    else if (!rightSignature.has(tokenPath)) fail(`${label}:${tokenPath}: missing from dark mode.`);
    else if (leftSignature.get(tokenPath) !== rightSignature.get(tokenPath)) fail(`${label}:${tokenPath}: type differs between modes.`);
  }
}

validateModeParity("primitives", maps.primitivesLight, maps.primitivesDark);
validateModeParity("semantic", maps.semanticLight, maps.semanticDark);

for (const key of ["semanticLight", "semanticDark", "components"]) {
  for (const [tokenPath, token] of maps[key]) {
    const value = token.$value;
    const allAliased = aliasPath(value) || (value && typeof value === "object" && Object.values(value).every((item) => aliasPath(item)));
    if (!allAliased) fail(`${FILES[key]}:${tokenPath}: semantic/component values must preserve aliases; raw resolved values are not allowed.`);
  }
}

function luminance(color) {
  const channels = color.components.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

// A translucent colour is measured as it renders: composited over what sits
// under it (the background), not as if it were opaque.
function over(top, bottom) {
  const alpha = top.alpha ?? 1;
  return { components: top.components.map((value, index) => value * alpha + bottom.components[index] * (1 - alpha)) };
}

function contrast(foregroundPath, backgroundPath, tokens, pagePath) {
  let background = resolveToken(backgroundPath, tokens);
  if ((background.alpha ?? 1) < 1 && pagePath) background = over(background, resolveToken(pagePath, tokens));
  const foreground = over(resolveToken(foregroundPath, tokens), background);
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// [text, surface, minimum]. Body and secondary text need 4.5:1 on every
// surface they sit on; the link blue the same on the page and on cards.
const CONTRAST_PAIRS = [
  ...["color.text.primary", "color.text.secondary", "color.text.muted"].map((text) => [text, "color.surface.card", 4.5]),
  ...["color.ui.foreground", "color.ui.muted-foreground", "color.ui.accent-subtle"].flatMap((text) =>
    ["color.ui.background", "color.ui.card", "color.ui.glass-surface-2"].map((surface) => [text, surface, 4.5]),
  ),
  ["color.ui.primary-foreground", "color.ui.primary", 4.5],
  ["color.ui.primary-foreground", "color.ui.primary-hover", 4.5],
  ["color.ui.secondary-foreground", "color.ui.secondary", 4.5],
  ["color.ui.scrim-ink", "color.ui.scrim-base", 4.5],
];

for (const [mode, primitiveMap, semanticMap] of [
  ["light", maps.primitivesLight, maps.semanticLight],
  ["dark", maps.primitivesDark, maps.semanticDark],
]) {
  const tokens = mergeTokenMaps(primitiveMap, semanticMap);
  for (const [textPath, surfacePath, minimum] of CONTRAST_PAIRS) {
    const ratio = contrast(textPath, surfacePath, tokens, "color.ui.background");
    if (ratio < minimum) fail(`${mode}:${textPath} contrast is ${ratio.toFixed(2)}:1 against ${surfacePath}; expected at least ${minimum}:1.`);
  }
}

if (errors.length) {
  console.error(`Token validation failed with ${errors.length} error(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const total = Object.values(maps).reduce((sum, map) => sum + map.size, 0);
console.log(`Validated ${total} DTCG tokens across five files, both modes, aliases, composites, descriptions, path parity, and required text contrast.`);
