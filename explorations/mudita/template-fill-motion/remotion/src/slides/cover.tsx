import {FONT, GREEN, GREEN_DIM} from '../theme';
import {SlideSpec} from '../types';

// Everything here is read off Figma nodes 813:36648 (template) and 813:36528 (filled).
// Tops are absolute because the template's two-line title collapses to one, which moves the
// rule and subtitle up 99px — modelling that as two absolute positions is simpler than a
// flex column that has to be measured.

const titleStyle = {fontFamily: FONT, fontSize: 112, lineHeight: '120px', letterSpacing: -2, color: '#fff'};
const subStyle = {fontFamily: FONT, fontSize: 36, lineHeight: '38px', color: '#fff'};
const footStyle = {fontFamily: FONT, fontSize: 28, lineHeight: '38px', color: '#fff'};

const title = {
  id: 'title',
  x: 120,
  width: 901,
  style: titleStyle,
  caretH: 78,
  from: {
    top: 99,
    opacity: 0.5,
    lines: [
      [{t: '[Your company]', c: '#fff'}],
      [
        {t: '× [', c: '#fff'},
        {t: 'Their company]', c: GREEN},
      ],
    ],
  },
  to: {
    top: 120,
    opacity: 1,
    lines: [
      [
        {t: 'Ledgerline ', c: '#fff'},
        {t: '×', c: GREEN},
        {t: ' Corva', c: '#fff'},
      ],
    ],
  },
};

const rule = {
  id: 'rule',
  x: 120,
  width: 170,
  height: 10,
  from: {top: 371, opacity: 1},
  to: {top: 272, opacity: 1},
  moveWith: 'title',
};

const subtitle = {
  id: 'subtitle',
  x: 120,
  width: 901,
  style: subStyle,
  caretH: 26,
  from: {top: 413, opacity: 0.4, lines: [[{t: 'Partnership proposal', c: '#fff'}]]},
  to: {top: 314, opacity: 0.8, lines: [[{t: 'Partnership proposal', c: '#fff'}]]},
  moveWith: 'title',
};

const footer = {
  id: 'footer',
  x: 120,
  width: 920,
  style: footStyle,
  caretH: 22,
  from: {
    top: 884,
    opacity: 0.4,
    lines: [
      [{t: 'Prepared for [Team]', c: '#fff'}],
      [
        {t: '[', c: '#fff'},
        {t: 'Month, Year', c: GREEN},
        {t: ']', c: '#fff'},
      ],
    ],
  },
  to: {
    top: 884,
    opacity: 0.8,
    lines: [
      [
        {t: 'Prepared for ', c: '#fff'},
        {t: 'Corva partnerships team', c: GREEN},
      ],
      [
        {t: 'March, ', c: '#fff'},
        {t: '2026', c: GREEN_DIM},
      ],
    ],
  },
};

export const COVER: SlideSpec = {
  id: 'cover',
  label: 'Cover',
  backdrop: {left: 0, top: -375, width: 2438, height: 1625},
  order: [title, rule, subtitle, footer],
  picture: {
    x: 1200,
    y: 120,
    w: 640,
    h: 840,
    border: 5,
    radius: '80px 80px 80px 0px',
    photo: {w: 640, h: 914.3, top: -37.1},
    src: 'photo.jpg',
    mosaicSrc: 'photo-mosaic.png',
    cols: 16,
    rows: 23,
  },
};
