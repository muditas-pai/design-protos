// Painter tokens: the six colours a palette stores per slide background (light, dark, colour 1).
// Every form step (highlight, light, halftone, shadow) is then mixed from these in CSS: see painter-recipe.css.
//
// SPIKE CODE. Recovered from the painter test page's build script (written 22 Oct 2026, not in any repo).
// It reuses the 20-token generator for the three local colours and adds two mixing targets.
//
//   ILLUS_TOKENS_SRC=../IllusTokenUtil.js node painter-stored.mjs
//
import { illusTokens, rgbToOklch, oklchToRgb } from './illus-tokens/illus-tokens.mjs';

const P = (v) => v.split(',').map((x) => parseInt(x, 10));
const S = (a) => a.join(', ');

/**
 * @param brand  brand colours, [[r,g,b], …], in palette order
 * @param bg     slide background [r,g,b]
 * @param text   slide text colour [r,g,b]
 * @param block  'light' | 'dark' | 'color1'
 */
export function painterTokens(brand, bg, text, block) {
  const kind = block === 'color1' ? 'colour' : block;
  const old = illusTokens(brand, bg, text, kind);          // the 20 --th-illus-* tokens
  const g = rgbToOklch(bg), dom = rgbToOklch(P(old['--th-illus-primary']));

  // shadow target: deep and cool. Hue from the ground when the ground has colour;
  // otherwise the dominant hue pulled up to 35° toward blue (265°).
  const towardBlue = (h) => { const d = ((265 - h + 540) % 360) - 180; return (h + Math.sign(d) * Math.min(Math.abs(d), 35) + 360) % 360; };
  const sh = g[1] >= 0.03 ? g[2] : towardBlue(dom[2]);
  const shL = block === 'dark' ? Math.max(0.08, Math.min(0.16, g[0] - 0.06)) : block === 'color1' ? Math.min(0.26, g[0] * 0.45) : 0.24;
  const shadowTo = oklchToRgb(shL, Math.max(0.06, Math.min(0.14, Math.max(dom[1], g[1]) * 0.7)), sh);

  // light target: a barely warm white. On a colour slide the light takes the slide's own hue.
  const lightTo = block === 'color1' && g[1] >= 0.03 ? oklchToRgb(0.975, Math.min(0.07, g[1] * 0.5), g[2]) : oklchToRgb(0.988, 0.008, 85);

  return {
    '--th-paint-dominant': old['--th-illus-primary'],
    '--th-paint-accent': old['--th-illus-accent'],
    '--th-paint-neutral': old['--th-illus-surface'],
    '--th-paint-line': old['--th-illus-line'],
    '--th-paint-light-to': S(lightTo),
    '--th-paint-shadow-to': S(shadowTo),
  };
}

// Example: run this file directly to print one palette's painter tokens.
if (import.meta.url === `file://${process.argv[1]}`) {
  const brand = [[213, 72, 92], [140, 108, 230], [246, 164, 76]];
  for (const [block, bg, text] of [['light', [255, 255, 255], [33, 26, 26]], ['dark', [14, 15, 22], [240, 236, 236]], ['color1', [213, 72, 92], [255, 255, 255]]]) {
    console.log(`.th-${block} {`, Object.entries(painterTokens(brand, bg, text, block)).map(([k, v]) => `${k}: ${v};`).join(' '), '}');
  }
}
