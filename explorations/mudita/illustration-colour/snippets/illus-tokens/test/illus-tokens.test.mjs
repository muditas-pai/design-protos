// node scripts/illus-tokens/test/illus-tokens.test.mjs — generator output must equal the reference values exactly.
import { readFileSync } from 'node:fs';
import { illusTokens } from '../illus-tokens.mjs';
const fx = JSON.parse(readFileSync(new URL('./expected-tokens.json', import.meta.url)));
const p = (v) => v.split(',').map((x) => parseInt(x, 10));
let fails = 0, checked = 0;
for (const [key, pal] of Object.entries(fx)) {
  const brand = pal.inputs.brand.map(p);
  for (const [bg, expected] of Object.entries(pal.expected)) {
    const kind = bg === 'light' ? 'light' : bg === 'dark' ? 'dark' : 'colour';
    const got = illusTokens(brand, p(pal.inputs.backgrounds[bg]), p(pal.inputs.text_colours[bg]), kind);
    for (const [k, v] of Object.entries(expected)) {
      checked++;
      if (got[k] !== v) { fails++; if (fails <= 20) console.log(`✗ ${pal.name} ${bg} ${k}: got ${got[k]}, expected ${v}`); }
    }
  }
}
console.log(`${checked - fails}/${checked} values match`);
process.exit(fails ? 1 : 0);
