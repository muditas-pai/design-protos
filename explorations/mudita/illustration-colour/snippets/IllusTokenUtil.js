/*
 * Tonal illustration tokens (--th-illus-*): 20 colour variables per background block, generated from the
 * palette's own brand colours, background and text colour. Illustrated drawings point at these instead of
 * hard-coded colours. Colour by value, not by hue: each part has a midtone base with lighter and darker
 * tones around it, and the background decides where those tones sit.
 *
 * Nothing is tuned to particular palettes, so brand kits and uploaded palettes go through the same rules as
 * the shipped ones. Same maths as design_assets scripts/illus-tokens/illus-tokens.mjs (which generates the
 * shipped palette stylesheets); values must equal __tests__/expected-tokens.json, including the edge-* user
 * palette cases — run: npm run test:illustokens
 *
 * Values are plain precomputed channels ("r, g, b"), never color-mix() or opacity: PPTX export reads final
 * colours, and real opacity would make overlapping shapes show through each other.
 */

// Python's round(): exact halves go to the nearest even number. Needed so values match the reference exactly.
const roundEven = (x) => {
    const f = Math.floor(x);
    if (x - f === 0.5) return f % 2 === 0 ? f : f + 1;
    return Math.round(x);
};

// ---- OKLCH <-> sRGB, with gamut mapping by reducing chroma ----
const toLinear = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const toGamma = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055) * 255;

export function rgbToOklch([r, g, b]) {
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

const oklchToLinear = (L, C, H) => {
    const a = C * Math.cos((H * Math.PI) / 180);
    const b = C * Math.sin((H * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
};
const isOutOfGamut = (rgb) => rgb.some((x) => x < -1e-4 || x > 1 + 1e-4);

// Out of gamut: binary-search the largest chroma that fits, keeping L and H.
export function oklchToRgb(L, C, H) {
    let rgb = oklchToLinear(L, C, H);
    if (isOutOfGamut(rgb)) {
        let lo = 0;
        let hi = C;
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            if (isOutOfGamut(oklchToLinear(L, mid, H))) hi = mid;
            else lo = mid;
        }
        rgb = oklchToLinear(L, lo, H);
    }
    return rgb.map((x) => Math.max(0, Math.min(255, roundEven(toGamma(Math.max(0, Math.min(1, x)))))));
}

// WCAG contrast ratio between two [r, g, b] colours.
const relativeLuminance = ([r, g, b]) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
export function contrastRatio(a, b) {
    const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// ---- helpers ----
const hueDistance = (a, b) => {
    const d = Math.abs(a - b) % 360;
    return Math.min(d, 360 - d);
};
const format = (rgb) => rgb.join(", ");
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
// Blend in plain 8-bit sRGB: what `top` at `alpha` over `rgb` looks like, stored opaque.
const blend = (rgb, top, alpha) => rgb.map((v, i) => roundEven(v * (1 - alpha) + top[i] * alpha));

// soft and dim sit just either side of the base, so drawings with many close shades keep their detail.
const STEPS = { highlight: 0.22, light: 0.11, soft: 0.055, "": 0, dim: -0.055, shade: -0.11, deep: -0.21 };
const ALL_TIERS = ["highlight", "light", "soft", "", "dim", "shade", "deep"];
const ACCENT_TIERS = ["light", "", "shade"];
const tokenName = (family, tier) => `--th-illus-${family}${tier ? "-" + tier : ""}`;

// Clamp L, and ease chroma off toward the ends so very light and very dark tones don't go garish.
const tone = (H, C, L) => {
    L = Math.max(0.08, Math.min(0.975, L));
    return oklchToRgb(L, Math.max(0, C * (1 - 0.7 * ((L - 0.6) / 0.42) ** 2)), H);
};

const addFamily = (tokens, family, H, C, base, lo, hi, tiers = ALL_TIERS) => {
    tiers.forEach((tier) => {
        tokens[tokenName(family, tier)] = format(tone(H, C, Math.max(lo, Math.min(hi, base + STEPS[tier]))));
    });
};

// Prefer colours far in hue from the reference, discounted when they're nearly grey.
const accentScore = (lch, refHue) => Math.min(hueDistance(lch[2], refHue), 150) * Math.min(1, lch[1] / 0.08);

// Stand-off: move a family's base away from the background (darker on light, lighter on dark) until its base
// tone reaches 1.5 contrast with it. The steps around the base move with it. Surfaces stay quiet on purpose.
const standOff = (H, C, base, bg, lo, hi, minimum = 1.5) => {
    const step = rgbToOklch(bg)[0] >= 0.6 ? -0.02 : 0.02;
    while (contrastRatio(tone(H, C, Math.max(lo, Math.min(hi, base))), bg) < minimum && base > 0.1 && base < 0.97) base += step;
    return base;
};

// Colour backgrounds: white or black laid over the background. On light ones (OKLab L >= 0.80) white has
// nowhere lighter to go, so the ladder flips to black over the background.
const COLOUR_LADDERS = {
    mid: {
        primary: [["highlight", WHITE, 0.9], ["light", WHITE, 0.78], ["soft", WHITE, 0.71], ["", WHITE, 0.64], ["dim", WHITE, 0.56], ["shade", WHITE, 0.48], ["deep", WHITE, 0.32]],
        surface: [["highlight", WHITE, 0.55], ["light", WHITE, 0.42], ["soft", WHITE, 0.36], ["", WHITE, 0.3], ["dim", WHITE, 0.24], ["shade", WHITE, 0.18], ["deep", BLACK, 0.12]],
        line: 0.45,
    },
    light: {
        primary: [["highlight", BLACK, 0.12], ["light", BLACK, 0.22], ["soft", BLACK, 0.28], ["", BLACK, 0.34], ["dim", BLACK, 0.4], ["shade", BLACK, 0.46], ["deep", BLACK, 0.58]],
        surface: [["highlight", WHITE, 0.5], ["light", WHITE, 0.25], ["soft", WHITE, 0.08], ["", BLACK, 0.08], ["dim", BLACK, 0.12], ["shade", BLACK, 0.16], ["deep", BLACK, 0.26]],
        line: 0.7,
    },
};

/**
 * The 20 tokens for one background block.
 * @param {number[][]} brand  the palette's brand colours (originals only, not generated accents) as [r, g, b], in order
 * @param {number[]} bg       this block's --th-slide-primary as [r, g, b]
 * @param {number[]} contrast this block's --th-slide-contrast as [r, g, b]
 * @param {"light"|"dark"|"colour"} kind  .th-light, .th-dark, or a colour background (.th-colorN / .th-surfaceN)
 * @returns {Object<string, string>} token name → "r, g, b"
 */
export function buildIllusTokens(brand, bg, contrast, kind) {
    const brandLch = brand.map(rgbToOklch);
    const P = brandLch[0];
    // Stable sort, so ties keep brand order.
    const ranked = brandLch.slice(1).sort((x, y) => accentScore(y, P[2]) - accentScore(x, P[2]));
    const A = ranked.length ? ranked[0] : P;
    const primaryHue = P[2];
    const primaryChroma = Math.min(P[1], 0.13);
    let accentHue = A[2];
    let accentChroma = Math.min(A[1], 0.14);
    // No brand colour clearly apart in hue: stay single-hue, and the accent becomes a lighter, brighter primary.
    const isSingleHue = hueDistance(A[2], P[2]) < 80;
    if (isSingleHue) {
        accentHue = primaryHue;
        accentChroma = Math.min(P[1] * 1.15, 0.16);
    }
    const neutralHue = primaryHue;
    const neutralChroma = 0.02;
    const [bgL, bgChroma, bgHue] = rgbToOklch(bg);
    // A .th-light or .th-dark block is ruled by how bright its background really is: some "dark" ones are white.
    if (kind !== "colour") kind = bgL >= 0.6 ? "light" : "dark";

    const tokens = {};
    if (kind === "light") {
        addFamily(tokens, "primary", primaryHue, primaryChroma, standOff(primaryHue, primaryChroma, 0.66, bg, 0.3, 0.95), 0.3, 0.95);
        addFamily(tokens, "surface", neutralHue, neutralChroma, 0.86, 0.45, 0.975);
        addFamily(tokens, "accent", accentHue, accentChroma, standOff(accentHue, accentChroma, isSingleHue ? 0.8 : 0.72, bg, 0.3, 0.94), 0.3, 0.94, ACCENT_TIERS);
        tokens["--th-illus-line"] = format(tone(neutralHue, neutralChroma * 1.5, 0.32));
    } else if (kind === "dark") {
        // Floor keeps every tone clear of the background, so nothing sinks into it.
        const floor = bgL + 0.12;
        addFamily(tokens, "primary", primaryHue, primaryChroma, standOff(primaryHue, primaryChroma, 0.68, bg, floor, 0.94), floor, 0.94);
        addFamily(tokens, "surface", neutralHue, neutralChroma, 0.6, floor, 0.9);
        addFamily(tokens, "accent", accentHue, accentChroma, standOff(accentHue, accentChroma, isSingleHue ? 0.86 : 0.76, bg, floor, 0.95), floor, 0.95, ACCENT_TIERS);
        tokens["--th-illus-line"] = format(tone(neutralHue, neutralChroma, Math.max(bgL + 0.1, 0.3)));
    } else {
        const isLightBg = bgL >= 0.8;
        const ladder = COLOUR_LADDERS[isLightBg ? "light" : "mid"];
        ladder.primary.forEach(([tier, top, alpha]) => {
            tokens[tokenName("primary", tier)] = format(blend(bg, top, alpha));
        });
        ladder.surface.forEach(([tier, top, alpha]) => {
            tokens[tokenName("surface", tier)] = format(blend(bg, top, alpha));
        });
        tokens["--th-illus-line"] = format(blend(bg, BLACK, ladder.line));

        // Accent: a brand colour that differs from this background in hue AND stands out from it, at full
        // strength. If none does, it stands out by brightness instead. Never the background colour itself.
        const candidates = brand.map((rgb, i) => [rgb, brandLch[i]]).filter(([rgb, lch]) => hueDistance(lch[2], bgHue) > 25 && lch[1] > 0.05 && contrastRatio(rgb, bg) >= 1.5);
        let accent;
        if (candidates.length) accent = candidates.reduce((best, cand) => (accentScore(cand[1], bgHue) > accentScore(best[1], bgHue) ? cand : best))[0];
        else accent = isLightBg ? oklchToRgb(0.3, Math.min(bgChroma, 0.12), bgHue) : blend(bg, WHITE, 0.92);
        tokens["--th-illus-accent"] = format(accent);
        tokens["--th-illus-accent-light"] = format(blend(accent, WHITE, 0.35));
        tokens["--th-illus-accent-shade"] = format(blend(accent, BLACK, 0.22));
    }
    // Specular highlight: light on every background.
    tokens["--th-illus-gloss"] = format(tone(neutralHue, 0.01, 0.97));
    // A text-bearing block inside a drawing keeps contrast with the text that sits on it.
    tokens["--th-illus-panel"] = kind === "colour" ? format(blend(bg, WHITE, 0.9)) : format(contrast);
    return tokens;
}
