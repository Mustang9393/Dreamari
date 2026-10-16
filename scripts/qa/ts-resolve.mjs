// Lets Node's built-in TypeScript type stripping run app modules that use
// the "@/..." alias and extensionless imports (tsconfig paths). Usage:
//   node --import ./scripts/qa/ts-resolve.mjs scripts/qa/<test>.mjs
import { register } from 'node:module';
register('./ts-resolve-hooks.mjs', import.meta.url);
