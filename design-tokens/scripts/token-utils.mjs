import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const TOKEN_DIR = path.join(ROOT, "design-tokens");
export const FILES = {
  primitivesLight: "primitives.light.tokens.json",
  primitivesDark: "primitives.dark.tokens.json",
  semanticLight: "semantic.light.tokens.json",
  semanticDark: "semantic.dark.tokens.json",
  components: "components.tokens.json",
};

export function readTokenFile(name) {
  return JSON.parse(fs.readFileSync(path.join(TOKEN_DIR, name), "utf8"));
}

export function isToken(value) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.hasOwn(value, "$value");
}

export function collectTokens(document) {
  const tokens = new Map();
  function visit(node, parts = [], inheritedType) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    const type = node.$type ?? inheritedType;
    if (isToken(node)) {
      tokens.set(parts.join("."), { ...node, $resolvedType: type });
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith("$")) visit(value, [...parts, key], type);
    }
  }
  visit(document);
  return tokens;
}

export function mergeTokenMaps(...maps) {
  const merged = new Map();
  for (const map of maps) for (const [tokenPath, token] of map) merged.set(tokenPath, token);
  return merged;
}

export function aliasPath(value) {
  const match = typeof value === "string" ? value.match(/^\{([^}]+)\}$/) : null;
  return match?.[1];
}

export function resolveToken(tokenPath, tokens, stack = []) {
  if (stack.includes(tokenPath)) throw new Error(`Circular alias: ${[...stack, tokenPath].join(" -> ")}`);
  const token = tokens.get(tokenPath);
  if (!token) throw new Error(`Unknown token alias: {${tokenPath}}`);
  const target = aliasPath(token.$value);
  return target ? resolveToken(target, tokens, [...stack, tokenPath]) : token.$value;
}

export function resolveComposite(value, tokens) {
  const target = aliasPath(value);
  if (target) return resolveToken(target, tokens);
  if (Array.isArray(value)) return value.map((item) => resolveComposite(item, tokens));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveComposite(item, tokens)]));
  }
  return value;
}

export function colorToCss(value) {
  const [red, green, blue] = value.components.map((component) => Math.round(component * 255));
  if (value.alpha !== undefined && value.alpha !== 1) return `rgb(${red} ${green} ${blue} / ${value.alpha})`;
  return value.hex ?? `rgb(${red} ${green} ${blue})`;
}

export function writeIfChanged(filePath, content, checkOnly = false) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (existing === content) return false;
  if (checkOnly) throw new Error(`${path.relative(ROOT, filePath)} is stale. Run npm run tokens:build.`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}
