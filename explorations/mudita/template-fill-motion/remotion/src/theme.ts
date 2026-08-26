import {Easing} from 'remotion';

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION = 210; // 7s per treatment

// Brand values lifted straight from the Figma slide.
export const GREEN = '#bbfb67';
export const GREEN_DIM = '#96cd52';
export const MINT = '#6dfac2';
export const FONT = "'Familjen Grotesk', 'Helvetica Neue', Arial, sans-serif";

// Emil's stronger curves — the built-in CSS easings are too weak to read on video.
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

export const L = {
  textX: 120,
  titleTopTemplate: 99, // two-line placeholder title, vertically centred on 275
  titleTopFinal: 120, // one-line real title, vertically centred on 236
  titleSize: 112,
  titleLine: 120,
  tracking: -2,
  gap: 32,
  dividerW: 170,
  dividerH: 10,
  subSize: 36,
  subLine: 38,
  footX: 120,
  footY: 884,
  footSize: 28,
  footLine: 38,
  blockW: 901,
  img: {x: 1200, y: 120, w: 640, h: 840, border: 5, radius: '80px 80px 80px 0px'},
  // the photo is 1680x2400; Figma sits it at 100% width, 108.84% height, -4.42% top
  photo: {w: 640, h: 914.3, top: -37.1},
};

// the picture placeholder is a 16 x 23 mosaic — matches the grid drawn in the Figma template
export const MOSAIC_COLS = 16;
export const MOSAIC_ROWS = 23;

export type Seg = {t: string; c: string};

export const TEMPLATE = {
  titleLines: [
    [{t: '[Your company]', c: '#fff'}],
    [
      {t: '× [', c: '#fff'},
      {t: 'Their company]', c: GREEN},
    ],
  ] as Seg[][],
  subtitle: 'Partnership proposal',
  footLines: [
    [{t: 'Prepared for [Team]', c: '#fff'}],
    [
      {t: '[', c: '#fff'},
      {t: 'Month, Year', c: GREEN},
      {t: ']', c: '#fff'},
    ],
  ] as Seg[][],
  titleOpacity: 0.5,
  bodyOpacity: 0.4,
};

export const FINAL = {
  titleLines: [
    [
      {t: 'Ledgerline ', c: '#fff'},
      {t: '×', c: GREEN},
      {t: ' Corva', c: '#fff'},
    ],
  ] as Seg[][],
  subtitle: 'Partnership proposal',
  footLines: [
    [
      {t: 'Prepared for ', c: '#fff'},
      {t: 'Corva partnerships team', c: GREEN},
    ],
    [
      {t: 'March, ', c: '#fff'},
      {t: '2026', c: GREEN_DIM},
    ],
  ] as Seg[][],
  titleOpacity: 1,
  bodyOpacity: 0.8,
};

export const segLen = (segs: Seg[]) => segs.reduce((n, s) => n + s.t.length, 0);

/** Trim a run of coloured segments to the first `n` characters. */
export const sliceSegs = (segs: Seg[], n: number): Seg[] => {
  let used = 0;
  return segs.map((s) => {
    const take = Math.max(0, Math.min(s.t.length, n - used));
    used += s.t.length;
    return {...s, t: s.t.slice(0, take)};
  });
};

/** Deterministic 0..1 noise — Math.random would break Remotion's frame determinism. */
export const hash01 = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
