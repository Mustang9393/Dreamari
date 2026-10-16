import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function resolve(specifier, context, next) {
  let spec = specifier;
  if (spec.startsWith('@/')) spec = pathToFileURL(path.join(root, 'src', spec.slice(2))).href;
  const relative = spec.startsWith('./') || spec.startsWith('../');
  if ((relative || spec.startsWith('file:')) && !/\.[a-z]+$/i.test(spec)) {
    const base = spec.startsWith('file:') ? fileURLToPath(spec) : path.resolve(path.dirname(fileURLToPath(context.parentURL)), spec);
    for (const ext of ['.ts', '.tsx', '/index.ts']) if (existsSync(base + ext)) return next(pathToFileURL(base + ext).href, context);
  }
  return next(spec, context);
}
