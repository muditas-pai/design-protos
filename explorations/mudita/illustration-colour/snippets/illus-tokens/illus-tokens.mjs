// Tonal illustration tokens (--th-illus-*) for palette stylesheets. Spec: SPEC.md.
//
// ONE generator: the colour maths live only in pitchdeckdoclist's IllusTokenUtil.js (the app needs it for brand-kit
// palettes, and the app can't depend on this repo). This file loads that module and applies it to whole stylesheets.
// design_assets' tooling already expects pitchdeckdoclist beside it (gulp writes into ../pitchdeckdoclist); set
// ILLUS_TOKENS_SRC to point elsewhere.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
export const GENERATOR_PATH = process.env.ILLUS_TOKENS_SRC
  || join(here, '..', '..', '..', 'pitchdeckdoclist', 'src', 'listing', 'core', 'screens', 'workspace', 'styles', 'IllusTokenUtil.js');
if (!existsSync(GENERATOR_PATH)) {
  throw new Error(`Illustration token generator not found at ${GENERATOR_PATH}. Check out pitchdeckdoclist beside design_assets, or set ILLUS_TOKENS_SRC.`);
}
// The app file is an ES module with no imports; evaluate it in a sandbox and collect its exports.
function loadGenerator(file) {
  let src = readFileSync(file, 'utf8');
  const names = [];
  src = src.replace(/export\s+(?:async\s+)?function\s+(\w+)/g, (m, n) => { names.push(n); return m.replace(/^export\s+/, ''); });
  src = src.replace(/export\s+const\s+(\w+)/g, (_, n) => { names.push(n); return 'const ' + n; });
  src += '\n' + names.map((n) => `exports[${JSON.stringify(n)}] = ${n};`).join('\n');
  const sandbox = { exports: {}, Math, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: file });
  return sandbox.exports;
}
const gen = loadGenerator(GENERATOR_PATH);
export const illusTokens = gen.buildIllusTokens;
export const { rgbToOklch, oklchToRgb, contrastRatio } = gen;
const parse = (v) => v.split(',').map((x) => parseInt(x.trim(), 10));

// ---- stylesheet rewriting (idempotent) ----
const BLOCK = /(^|\n)(\.th-(light|dark|color\d+|surface\d+))\s*\{([^}]*)\}/g;
export function processStylesheet(css) {
  const blocks = [...css.matchAll(BLOCK)].map((m) => ({ cls: m[3], body: m[4] }));
  const get = (body, name) => { const m = body.match(new RegExp(`${name}\\s*:\\s*([^;]+);`)); return m ? parse(m[1]) : null; };
  const nBrand = blocks.filter((b) => /^color\d+$/.test(b.cls)).length;
  const se = css.match(/(^|\n)\.th-slide-element\s*\{([^}]*)\}/);
  if (!se || !nBrand) throw new Error('palette stylesheet without .th-slide-element or colour backgrounds');
  const brand = Array.from({ length: nBrand }, (_, i) => get(se[2], `--th-slide-color${i + 1}`));
  return css.replace(BLOCK, (all, lead, sel, cls, body) => {
    const bg = get(body, '--th-slide-primary'), contrast = get(body, '--th-slide-contrast');
    if (!bg || !contrast) return all;
    const kind = cls === 'light' ? 'light' : cls === 'dark' ? 'dark' : 'colour';
    const kept = body.replace(/\n[ \t]*--th-illus-[\w-]+\s*:[^;]*;/g, '').replace(/\s*$/, '');
    const lines = Object.entries(illusTokens(brand, bg, contrast, kind)).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `${lead}${sel} {${kept}\n${lines}\n}`;
  });
}
