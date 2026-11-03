#!/usr/bin/env node
// Adds --th-illus-* tokens to every palette stylesheet in theme-fonts/themes/. Re-running replaces them; never duplicates.
// Usage: node scripts/illus-tokens/generate-illus-tokens.mjs [--check] [folder]
//   folder defaults to theme-fonts/themes; pass e.g. ../resources/themes/css for the company palettes kept in deck-in/resources.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { processStylesheet } from './illus-tokens.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const dir = arg ? arg : join(root, 'theme-fonts', 'themes');
const check = process.argv.includes('--check');
let changed = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith('.css')).sort()) {
  const p = join(dir, f), css = readFileSync(p, 'utf8');
  let out;
  try { out = processStylesheet(css); } catch (e) { console.warn(`skipped ${f}: ${e.message}`); continue; }
  if (out !== css) { changed++; if (!check) writeFileSync(p, out); }
}
console.log(check ? `${changed} stylesheet(s) out of date` : `updated ${changed} stylesheet(s)`);
if (check && changed) process.exit(1);
