// Only when the maths change ON PURPOSE: rewrite expected-tokens.json from the one generator (IllusTokenUtil.js).
// Then copy the file to pitchdeckdoclist's __tests__ so both tests check the same values.
import { readFileSync, writeFileSync } from 'node:fs';
import { illusTokens } from '../illus-tokens.mjs';
const file = new URL('./expected-tokens.json', import.meta.url);
const fx = JSON.parse(readFileSync(file));
const p = (v) => v.split(',').map((x) => parseInt(x, 10));
for (const pal of Object.values(fx))
  for (const bg of Object.keys(pal.expected)) {
    const kind = bg === 'light' ? 'light' : bg === 'dark' ? 'dark' : 'colour';
    pal.expected[bg] = illusTokens(pal.inputs.brand.map(p), p(pal.inputs.backgrounds[bg]), p(pal.inputs.text_colours[bg]), kind);
  }
writeFileSync(file, JSON.stringify(fx, null, 1));
console.log('expected-tokens.json regenerated');
